// Společná cesta pro zprávy, které přijdou mimo aplikaci (přeposlaný e-mail, WhatsApp):
// přečíst přes AI, uložit zdroj, jisté položky uložit rovnou, zbytek nechat ke kontrole.
import { extractItems, isCertain, type Found, type ImageInput, type Kid, type PdfInput } from "@/lib/extract";
import { adminClient } from "@/lib/supabase-server";
import { S, normLang } from "@/lib/i18n-server";

type Db = ReturnType<typeof adminClient>;
export type SourceFile = { data: Buffer; type: string; name: string };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Profile = Record<string, any> & { id: string };

export type IngestResult = { items: Found[]; direct: Found[]; review: Found[]; kids: Kid[] };

export async function ingest(db: Db, profile: Profile, input: {
  text?: string; note?: string; images?: ImageInput[]; pdfs?: PdfInput[];
  label: string; kind: string; files?: SourceFile[];
}): Promise<IngestResult> {
  const lang = normLang(profile.lang);
  const L = S[lang];
  const { data: kidRows } = await db.from("children").select("id,name,cls,school,nicks").eq("user_id", profile.id);
  const kids: Kid[] = kidRows || [];
  const today = new Date().toISOString().slice(0, 10);
  const { data: evRows } = await db.from("items").select("id,title,due_date,child_id").eq("user_id", profile.id)
    .eq("type", "udalost").gte("due_date", today).order("due_date").limit(60);
  const events = (evRows || []).map((e) => ({ id: e.id, title: e.title, date: e.due_date, childId: e.child_id || "" }));

  const items = await extractItems({ kids, text: input.text, note: input.note, images: input.images, pdfs: input.pdfs, events, lang });
  if (!items.length) return { items, direct: [], review: [], kids };

  const sourceId = await saveSource(db, profile.id, input.kind, input.label, input.text || "", input.note || "", input.files || []);
  // Co má rodič v nastavení povolené ukládat rovnou, uloží se hned. Zbytek čeká na kontrolu.
  const auto: string[] = Array.isArray(profile.auto_types) ? profile.auto_types : [];
  const now = Date.now();
  let direct = items.filter((i) => auto.includes(i.type) && isCertain(i));
  let review = items.filter((i) => !direct.includes(i));
  if (direct.length) {
    const r = await db.from("items").insert(direct.map((i) => toRow(i, profile.id, input.label, sourceId, now, L.untitled)));
    if (r.error) { console.error("ingest auto save failed", r.error.message); review = [...direct, ...review]; direct = []; }
  }
  if (review.length) {
    const r = await db.from("inbox").insert({ user_id: profile.id, source: input.label, items: review, ...(sourceId ? { source_id: sourceId } : {}) });
    if (r.error) throw new Error("inbox insert failed: " + r.error.message);
  }
  return { items, direct, review, kids };
}

function toRow(i: Found, userId: string, label: string, sourceId: string | null, now: number, untitled: string) {
  return {
    id: i.id, user_id: userId, child_id: i.childId || null, type: i.type, title: i.title || untitled,
    due_date: i.date, due_time: i.time, place: i.place, note: i.note, done: false, source: label,
    repeat_rule: i.repeat, repeat_until: i.until, skip_dates: [], created_ms: now, parent_id: i.parentId, source_id: sourceId,
  };
}

/** Uloží původní zprávu a přílohy, aby se rodič mohl ke zdroji vrátit. Když to nejde, vrátí null a pokračuje se bez něj. */
async function saveSource(db: Db, userId: string, kind: string, label: string, body: string, note: string, files: SourceFile[]) {
  try {
    const { data, error } = await db.from("sources")
      .insert({ user_id: userId, kind, label, note: note.slice(0, 4000), body: body.slice(0, 60000) }).select("id").single();
    if (error || !data) { console.error("ingest source failed", error?.message); return null; }
    const stored: { path: string; type: string; name: string }[] = [];
    for (const [k, f] of files.entries()) {
      const ext = f.type === "application/pdf" ? "pdf" : f.type.split("/")[1] || "bin";
      const path = `${userId}/${data.id}/${k + 1}.${ext}`;
      const up = await db.storage.from("sources").upload(path, f.data, { contentType: f.type });
      if (!up.error) stored.push({ path, type: f.type, name: (f.name || "").slice(0, 120) });
    }
    if (stored.length) await db.from("sources").update({ files: stored }).eq("id", data.id);
    return data.id as string;
  } catch (e) {
    console.error("ingest source failed", e instanceof Error ? e.message : e);
    return null;
  }
}
