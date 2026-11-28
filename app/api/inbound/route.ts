// POST /api/inbound?key=...: Postmark sem pošle přeposlaný školní e-mail.
// Rodič se pozná podle adresy odesílatele, nalezené položky čekají v aplikaci na kontrolu.
import { extractItems, isCertain, type Found, type ImageInput, type PdfInput } from "@/lib/extract";
import { adminClient, emailAllowed } from "@/lib/supabase-server";
import { S, normLang } from "@/lib/i18n-server";

export const maxDuration = 60;

type PostmarkAttachment = { Name: string; Content: string; ContentType: string; ContentLength?: number };
type PostmarkInbound = {
  From?: string; FromFull?: { Email?: string }; Subject?: string;
  TextBody?: string; HtmlBody?: string; Attachments?: PostmarkAttachment[];
};

function htmlToText(html: string) {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(p|div|li|tr|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n\n").trim();
}

export async function POST(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  if (!process.env.INBOUND_SECRET || key !== process.env.INBOUND_SECRET) return new Response("forbidden", { status: 403 });

  let mail: PostmarkInbound;
  try { mail = await req.json(); } catch { return new Response("bad json", { status: 400 }); }

  const from = (mail.FromFull?.Email || mail.From || "").trim().toLowerCase();
  const db = adminClient();

  // 1) Najít rodiče: hlavní e-mail účtu, nebo další adresa zapsaná v nastavení
  let { data: profile } = await db.from("profiles").select("*").ilike("email", from).maybeSingle();
  if (!profile) {
    const r = await db.from("profiles").select("*").contains("sender_emails", [from]).limit(1).maybeSingle();
    profile = r.data;
  }
  // Odpovídáme 200, aby Postmark zprávu neposílal znovu. Neznámý odesílatel se jen zapíše do logu.
  if (!profile) { console.warn("inbound: unknown sender"); return Response.json({ ok: true, matched: false }); }
  if (!emailAllowed(profile.email)) return Response.json({ ok: true, matched: false });

  const { data: kids } = await db.from("children").select("id,name,cls,school,nicks").eq("user_id", profile.id);
  const today = new Date().toISOString().slice(0, 10);
  const { data: evRows } = await db.from("items").select("id,title,due_date,child_id").eq("user_id", profile.id)
    .eq("type", "udalost").gte("due_date", today).order("due_date").limit(60);
  const events = (evRows || []).map((e) => ({ id: e.id, title: e.title, date: e.due_date, childId: e.child_id || "" }));

  const lang = normLang(profile.lang);
  const L = S[lang];
  const text = [mail.Subject ? L.subject + mail.Subject : "", mail.TextBody?.trim() || htmlToText(mail.HtmlBody || "")]
    .filter(Boolean).join("\n\n");
  const images: ImageInput[] = [];
  const pdfs: PdfInput[] = [];
  const kept: PostmarkAttachment[] = [];
  for (const a of mail.Attachments || []) {
    if ((a.ContentLength || a.Content.length) > 8_000_000) continue;
    if (a.ContentType === "application/pdf" && pdfs.length < 2) { pdfs.push({ data: a.Content }); kept.push(a); }
    else if (/^image\/(jpeg|png|webp|gif)$/.test(a.ContentType) && images.length < 4) {
      images.push({ media_type: a.ContentType as ImageInput["media_type"], data: a.Content }); kept.push(a);
    }
  }

  try {
    const items = await extractItems({ kids: kids || [], text, images, pdfs, events, lang });
    if (!items.length) return Response.json({ ok: true, matched: true, found: 0 });
    const label = L.email + (mail.Subject || L.noSubject).slice(0, 120);
    const sourceId = await saveSource(db, profile.id, label, text, kept);

    // Co má rodič v nastavení povolené ukládat rovnou, uloží se hned. Zbytek čeká na kontrolu.
    const auto: string[] = Array.isArray(profile.auto_types) ? profile.auto_types : [];
    const now = Date.now();
    const direct = items.filter((i) => auto.includes(i.type) && isCertain(i));
    const review = items.filter((i) => !direct.includes(i));
    if (direct.length) {
      const r = await db.from("items").insert(direct.map((i) => toRow(i, profile.id, label, sourceId, now, L.untitled)));
      if (r.error) { console.error("inbound auto save failed", r.error.message); review.unshift(...direct); direct.length = 0; }
    }
    if (review.length) {
      await db.from("inbox").insert({ user_id: profile.id, source: label, items: review, ...(sourceId ? { source_id: sourceId } : {}) });
    }
    return Response.json({ ok: true, matched: true, found: items.length, saved: direct.length });
  } catch (e) {
    console.error("inbound extract failed", e instanceof Error ? e.message : e);
    return Response.json({ ok: false }, { status: 200 });
  }
}

function toRow(i: Found, userId: string, label: string, sourceId: string | null, now: number, untitled: string) {
  return {
    id: i.id, user_id: userId, child_id: i.childId || null, type: i.type, title: i.title || untitled,
    due_date: i.date, due_time: i.time, place: i.place, note: i.note, done: false, source: label,
    repeat_rule: i.repeat, repeat_until: i.until, skip_dates: [], created_ms: now, parent_id: i.parentId, source_id: sourceId,
  };
}

/** Uloží původní e-mail a přílohy, aby se rodič mohl ke zdroji vrátit. Když to nejde, vrátí null a pokračuje se bez něj. */
async function saveSource(db: ReturnType<typeof adminClient>, userId: string, label: string, body: string, files: PostmarkAttachment[]) {
  try {
    const { data, error } = await db.from("sources")
      .insert({ user_id: userId, kind: "email", label, body: body.slice(0, 60000) }).select("id").single();
    if (error || !data) { console.error("inbound source failed", error?.message); return null; }
    const stored: { path: string; type: string; name: string }[] = [];
    for (const [k, a] of files.entries()) {
      const ext = a.ContentType === "application/pdf" ? "pdf" : a.ContentType.split("/")[1] || "bin";
      const path = `${userId}/${data.id}/${k + 1}.${ext}`;
      const up = await db.storage.from("sources").upload(path, Buffer.from(a.Content, "base64"), { contentType: a.ContentType });
      if (!up.error) stored.push({ path, type: a.ContentType, name: (a.Name || "").slice(0, 120) });
    }
    if (stored.length) await db.from("sources").update({ files: stored }).eq("id", data.id);
    return data.id as string;
  } catch (e) {
    console.error("inbound source failed", e instanceof Error ? e.message : e);
    return null;
  }
}
