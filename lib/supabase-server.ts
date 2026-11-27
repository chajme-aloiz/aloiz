// Supabase na serveru: ověření přihlášeného rodiče a přístup pro webhooky.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;

/** Vrátí přihlášeného uživatele podle hlavičky Authorization: Bearer <token>, nebo null. */
export async function userFromRequest(req: Request) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const sb = createClient(url(), process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

/** Klient se službou "service role": obchází pravidla RLS, používat jen na serveru. */
let admin: SupabaseClient | null = null;
export function adminClient() {
  if (!admin) admin = createClient(url(), process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
  return admin;
}

export function emailAllowed(email: string | undefined | null) {
  const list = (process.env.ALLOWED_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return !list.length || (!!email && list.includes(email.toLowerCase()));
}
