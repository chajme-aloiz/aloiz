// POST /api/inbound?key=...: Postmark sem pošle přeposlaný školní e-mail.
// Rodič se pozná podle adresy odesílatele, nalezené položky čekají v aplikaci na kontrolu.
import type { ImageInput, PdfInput } from "@/lib/extract";
import { ingest, type SourceFile } from "@/lib/ingest";
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

  const lang = normLang(profile.lang);
  const L = S[lang];
  const text = [mail.Subject ? L.subject + mail.Subject : "", mail.TextBody?.trim() || htmlToText(mail.HtmlBody || "")]
    .filter(Boolean).join("\n\n");
  const images: ImageInput[] = [];
  const pdfs: PdfInput[] = [];
  const kept: SourceFile[] = [];
  for (const a of mail.Attachments || []) {
    if ((a.ContentLength || a.Content.length) > 8_000_000) continue;
    const file = { data: Buffer.from(a.Content, "base64"), type: a.ContentType, name: a.Name || "" };
    if (a.ContentType === "application/pdf" && pdfs.length < 2) { pdfs.push({ data: a.Content }); kept.push(file); }
    else if (/^image\/(jpeg|png|webp|gif)$/.test(a.ContentType) && images.length < 4) {
      images.push({ media_type: a.ContentType as ImageInput["media_type"], data: a.Content }); kept.push(file);
    }
  }

  try {
    const label = L.email + (mail.Subject || L.noSubject).slice(0, 120);
    const r = await ingest(db, profile, { text, images, pdfs, label, kind: "email", files: kept });
    return Response.json({ ok: true, matched: true, found: r.items.length, saved: r.direct.length });
  } catch (e) {
    console.error("inbound extract failed", e instanceof Error ? e.message : e);
    return Response.json({ ok: false }, { status: 200 });
  }
}
