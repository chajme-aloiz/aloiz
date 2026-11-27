import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
export function browserClient() {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      // "implicit": odkaz z e-mailu funguje, i když ho rodič otevře v jiném prohlížeči nebo telefonu
      auth: { flowType: "implicit", persistSession: true, detectSessionInUrl: true, autoRefreshToken: true },
    });
  }
  return client;
}
