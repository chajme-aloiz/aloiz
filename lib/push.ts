// Odesílání upozornění do telefonu a počítače (Web Push, zdarma, bez další služby).
import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";

let ready = false;
export function pushConfigured() {
  return !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}
function setup() {
  if (ready) return;
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const subject = process.env.VAPID_SUBJECT || (host ? "https://" + host : "mailto:aloiz@example.com");
  webpush.setVapidDetails(subject, process.env.VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  ready = true;
}

export type PushMessage = { title: string; body: string; tag?: string; url?: string };
type Sub = { endpoint: string; p256dh: string; auth: string };

/** Pošle zprávu na všechna zařízení rodiče. Neplatná zařízení smaže. Vrací počet doručených. */
export async function sendToUser(db: SupabaseClient, userId: string, msg: PushMessage, subs?: Sub[]) {
  setup();
  const list = subs ?? ((await db.from("push_subs").select("endpoint,p256dh,auth").eq("user_id", userId)).data as Sub[] | null) ?? [];
  let ok = 0;
  const payload = JSON.stringify({ title: msg.title, body: msg.body, tag: msg.tag || "", url: msg.url || "/" });
  await Promise.all(list.map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 6 * 3600, urgency: "high" });
      ok++;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 404 || code === 410) await db.from("push_subs").delete().eq("endpoint", s.endpoint);
      else console.error("push failed", code, e instanceof Error ? e.message : e);
    }
  }));
  return ok;
}
