import type { SupabaseClient } from "@supabase/supabase-js";
export function mount(opts: {
  supabase: SupabaseClient; inboundAddress: string;
  appEl: HTMLElement; fabEl: HTMLElement; toastEl: HTMLElement;
}): () => void;
