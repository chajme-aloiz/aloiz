// WhatsApp Business Cloud API (Meta). Běží jen na serveru.
// Proměnné: WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, WHATSAPP_APP_SECRET, WHATSAPP_VERIFY_TOKEN.
import { createHmac, timingSafeEqual } from "node:crypto";

const GRAPH = "https://graph.facebook.com/" + (process.env.WHATSAPP_API_VERSION || "v23.0");
const auth = () => ({ Authorization: "Bearer " + (process.env.WHATSAPP_TOKEN || "") });

/** Ověří podpis X-Hub-Signature-256, kterým Meta podepisuje každou zprávu tajným klíčem aplikace. */
export function validSignature(raw: string, header: string | null) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !header?.startsWith("sha256=")) return false;
  const want = Buffer.from(createHmac("sha256", secret).update(raw).digest("hex"));
  const got = Buffer.from(header.slice(7));
  return want.length === got.length && timingSafeEqual(want, got);
}

export async function sendText(to: string, body: string, replyTo?: string) {
  const r = await fetch(`${GRAPH}/${process.env.WHATSAPP_PHONE_ID}/messages`, {
    method: "POST",
    headers: { ...auth(), "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp", to, type: "text",
      text: { body: body.slice(0, 4000), preview_url: false },
      ...(replyTo ? { context: { message_id: replyTo } } : {}),
    }),
  });
  if (!r.ok) console.error("whatsapp send failed", r.status, (await r.text()).slice(0, 300));
}

/** Označí zprávu jako přečtenou a ukáže „píše…“, než Aloiz odpoví. */
export async function markRead(messageId: string) {
  try {
    await fetch(`${GRAPH}/${process.env.WHATSAPP_PHONE_ID}/messages`, {
      method: "POST",
      headers: { ...auth(), "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", status: "read", message_id: messageId, typing_indicator: { type: "text" } }),
    });
  } catch { /* nevadí */ }
}

/** Stáhne fotku nebo dokument ze zprávy. */
export async function downloadMedia(mediaId: string, maxBytes: number): Promise<{ data: Buffer; type: string } | "too_big" | null> {
  const meta = await fetch(`${GRAPH}/${mediaId}`, { headers: auth() });
  if (!meta.ok) { console.error("whatsapp media meta failed", meta.status); return null; }
  const m = (await meta.json()) as { url?: string; mime_type?: string; file_size?: number };
  if (!m.url) return null;
  if (m.file_size && m.file_size > maxBytes) return "too_big";
  const file = await fetch(m.url, { headers: auth() });
  if (!file.ok) { console.error("whatsapp media download failed", file.status); return null; }
  const data = Buffer.from(await file.arrayBuffer());
  if (data.length > maxBytes) return "too_big";
  return { data, type: (m.mime_type || file.headers.get("content-type") || "").split(";")[0].trim() };
}
