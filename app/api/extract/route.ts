// POST /api/extract: aplikace pošle text, fotky nebo PDF, vrátí nalezené položky ke kontrole.
import { extractItems, ExtractError, type ImageInput, type Kid, type PdfInput } from "@/lib/extract";
import { emailAllowed, userFromRequest } from "@/lib/supabase-server";

export const maxDuration = 60;

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: "login" }, { status: 401 });
  if (!emailAllowed(user.email)) return Response.json({ error: "not_allowed" }, { status: 403 });

  let body: { text?: string; images?: ImageInput[]; pdfs?: PdfInput[]; kids?: Kid[] };
  try { body = await req.json(); } catch { return Response.json({ error: "bad_input" }, { status: 400 }); }

  const images = (body.images || []).filter((i) => IMAGE_TYPES.has(i.media_type) && typeof i.data === "string").slice(0, 6);
  const pdfs = (body.pdfs || []).filter((p) => typeof p.data === "string").slice(0, 2);
  const kids = (body.kids || []).filter((k) => k && typeof k.id === "string" && typeof k.name === "string").slice(0, 12);

  try {
    const items = await extractItems({ kids, text: String(body.text || ""), images, pdfs });
    return Response.json({ items });
  } catch (e) {
    const code = e instanceof ExtractError ? e.code : "failed";
    console.error("extract failed", code, e instanceof Error ? e.message : e);
    const status = code === "rate_limited" ? 429 : code === "bad_input" ? 400 : code === "refused" ? 422 : 500;
    return Response.json({ error: code }, { status });
  }
}
