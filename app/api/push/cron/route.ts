// GET /api/push/cron: volá ho každých 5 minut plánovač v Supabase (pg_cron).
// Pošle ranní a večerní souhrn a připomínky položek, každé jen jednou.
import { adminClient } from "@/lib/supabase-server";
import { pushConfigured, sendToUser } from "@/lib/push";
import { addDays, dueNotes, localNow, type Item, type Kid, type Settings } from "@/lib/notify";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const given = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "") || new URL(req.url).searchParams.get("key");
  if (!secret || given !== secret) return new Response("forbidden", { status: 403 });
  if (!pushConfigured()) return Response.json({ ok: false, error: "not_configured" });

  const db = adminClient();
  const { data: subs, error } = await db.from("push_subs").select("endpoint,p256dh,auth,user_id");
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  const byUser = new Map<string, { endpoint: string; p256dh: string; auth: string }[]>();
  for (const s of subs || []) { if (!byUser.has(s.user_id)) byUser.set(s.user_id, []); byUser.get(s.user_id)!.push(s); }
  const ids = [...byUser.keys()];
  if (!ids.length) return Response.json({ ok: true, users: 0, sent: 0 });

  const [{ data: profiles }, { data: kids }, { data: items }] = await Promise.all([
    db.from("profiles").select("*").in("id", ids),
    db.from("children").select("id,name,user_id").in("user_id", ids),
    db.from("items").select("*").in("user_id", ids).neq("due_date", ""),
  ]);
  const now = new Date();
  let sent = 0;
  for (const p of profiles || []) {
    const s = p as Settings & { id: string };
    const notes = dueNotes(now, s, ((items || []) as (Item & { user_id: string })[]).filter((i) => i.user_id === p.id),
      ((kids || []) as (Kid & { user_id: string })[]).filter((k) => k.user_id === p.id));
    if (!notes.length) continue;
    // Zapsat do deníku; vrátí jen ty, které tam ještě nebyly
    const { data: fresh } = await db.from("notify_log")
      .upsert(notes.map((n) => ({ user_id: p.id, key: n.key })), { onConflict: "user_id,key", ignoreDuplicates: true })
      .select("key");
    const freshKeys = new Set((fresh || []).map((r) => r.key));
    for (const n of notes) {
      if (!freshKeys.has(n.key) || !n.body) continue; // prázdný souhrn se neposílá
      sent += await sendToUser(db, p.id, { title: n.title, body: n.body, tag: n.tag }, byUser.get(p.id));
    }
  }
  // Úklid deníku staršího dvou týdnů
  const old = addDays(localNow(now, "UTC").date, -14);
  await db.from("notify_log").delete().lt("sent_at", old);
  return Response.json({ ok: true, users: ids.length, sent });
}
