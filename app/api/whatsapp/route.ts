// /api/whatsapp: webhook pro WhatsApp Business Cloud API.
// GET  = jednorázové ověření adresy z Meta (hub.challenge).
// POST = nová zpráva. Rodič se pozná podle propojeného čísla, Aloiz zprávu přečte, uloží a krátce odpoví.
import { after } from "next/server";
import type { Found, ImageInput, Kid, PdfInput } from "@/lib/extract";
import { ingest, type Profile, type SourceFile } from "@/lib/ingest";
import { adminClient, emailAllowed } from "@/lib/supabase-server";
import { WA, dayLabel, langFromPhone, normLang, type Lang } from "@/lib/i18n-server";
import { downloadMedia, markRead, sendText, validSignature } from "@/lib/whatsapp";

export const maxDuration = 60;

const MAX_BYTES = 5_000_000; // limit Claude pro jeden obrázek
const CODE_RE = /ALOIZ-([A-Z0-9]{6})/i;
const CODE_TTL_MS = 60 * 60 * 1000;

type WaMedia = { id: string; mime_type?: string; caption?: string; filename?: string };
type WaMessage = {
  from: string; id: string; type: string;
  text?: { body?: string }; image?: WaMedia; document?: WaMedia; audio?: WaMedia; video?: WaMedia;
};
type WaPayload = { entry?: { changes?: { value?: { messages?: WaMessage[] } }[] }[] };

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const ok = q.get("hub.mode") === "subscribe" && !!process.env.WHATSAPP_VERIFY_TOKEN && q.get("hub.verify_token") === process.env.WHATSAPP_VERIFY_TOKEN;
  return ok ? new Response(q.get("hub.challenge") || "", { status: 200 }) : new Response("forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const raw = await req.text();
  if (!validSignature(raw, req.headers.get("x-hub-signature-256"))) return new Response("forbidden", { status: 403 });
  let body: WaPayload;
  try { body = JSON.parse(raw); } catch { return new Response("bad json", { status: 400 }); }

  const messages = (body.entry || []).flatMap((e) => (e.changes || []).flatMap((c) => c.value?.messages || []));
  const origin = new URL(req.url).origin;
  // Meta chce odpověď hned, jinak zprávu posílá znovu. Čtení přes AI proběhne až po odpovědi.
  if (messages.length) after(async () => { for (const m of messages) await handle(m, origin); });
  return Response.json({ ok: true });
}

async function handle(m: WaMessage, origin: string) {
  const db = adminClient();
  // Každou zprávu jen jednou
  const seen = await db.from("wa_seen").insert({ id: m.id });
  if (seen.error) { if (seen.error.code === "23505") return; console.error("wa_seen failed", seen.error.message); }

  const from = String(m.from || "").replace(/\D/g, "");
  const text = (m.text?.body || "").trim();

  // Propojení čísla s účtem: zpráva s kódem z aplikace
  const code = text.match(CODE_RE)?.[1]?.toUpperCase();
  if (code) return link(db, from, code, m.id);

  const { data: profile } = await db.from("profiles").select("*").eq("wa_phone", from).maybeSingle();
  if (!profile) return sendText(from, WA[langFromPhone(from)].unknown, m.id);
  const lang = normLang(profile.lang);
  const L = WA[lang];
  if (!emailAllowed(profile.email)) return sendText(from, L.unknown, m.id);

  await markRead(m.id);
  try {
    const images: ImageInput[] = [];
    const pdfs: PdfInput[] = [];
    const files: SourceFile[] = [];
    let note = "";
    let kind = "text";
    const media = m.image || m.document;
    if (m.type === "audio") return sendText(from, L.voice, m.id);
    if (m.type === "text") { if (!text) return; }
    else if (media && (m.type === "image" || m.type === "document")) {
      note = (media.caption || "").trim();
      const got = await downloadMedia(media.id, MAX_BYTES);
      if (got === "too_big") return sendText(from, L.tooBig, m.id);
      if (!got) return sendText(from, L.error, m.id);
      const type = got.type || media.mime_type || "";
      if (type === "application/pdf") { pdfs.push({ data: got.data.toString("base64") }); kind = "pdf"; }
      else if (/^image\/(jpeg|png|webp|gif)$/.test(type)) { images.push({ media_type: type as ImageInput["media_type"], data: got.data.toString("base64") }); kind = "foto"; }
      else return sendText(from, L.unsupported, m.id);
      files.push({ data: got.data, type, name: media.filename || "" });
    } else return sendText(from, L.unsupported, m.id);

    const about = (text || note).replace(/\s+/g, " ").slice(0, 80);
    const label = L.source + (about ? ": " + about : "");
    const r = await ingest(db, profile as Profile, { text, note, images, pdfs, files, label, kind });
    await sendText(from, reply(r.direct, r.review, r.kids, lang, origin), m.id);
  } catch (e) {
    console.error("whatsapp handle failed", e instanceof Error ? e.message : e);
    await sendText(from, L.error, m.id);
  }
}

async function link(db: ReturnType<typeof adminClient>, from: string, code: string, msgId: string) {
  const { data: p } = await db.from("profiles").select("id,lang,wa_code_at").eq("wa_code", code).maybeSingle();
  const fresh = p?.wa_code_at && Date.now() - new Date(p.wa_code_at).getTime() < CODE_TTL_MS;
  if (!p || !fresh) return sendText(from, WA[langFromPhone(from)].badCode, msgId);
  // Jedno číslo patří jen jednomu účtu
  await db.from("profiles").update({ wa_phone: null }).eq("wa_phone", from).neq("id", p.id);
  const r = await db.from("profiles").update({ wa_phone: from, wa_code: null, wa_code_at: null }).eq("id", p.id);
  if (r.error) { console.error("whatsapp link failed", r.error.message); return sendText(from, WA[normLang(p.lang)].error, msgId); }
  return sendText(from, WA[normLang(p.lang)].linked, msgId);
}

function reply(direct: Found[], review: Found[], kids: Kid[], lang: Lang, origin: string) {
  const L = WA[lang];
  if (!direct.length && !review.length) return L.nothing;
  const line = (i: Found) => "• " + [i.title, i.date ? dayLabel(i.date, lang) : "", i.time, kids.find((k) => k.id === i.childId)?.name || ""]
    .filter(Boolean).join(", ");
  const parts: string[] = [];
  if (direct.length) parts.push(L.saved + "\n" + direct.map(line).join("\n"));
  if (review.length) parts.push(L.review + "\n" + review.map(line).join("\n") + "\n" + origin);
  return parts.join("\n\n");
}
