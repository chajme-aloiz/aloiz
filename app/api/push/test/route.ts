// POST /api/push/test: pošle přihlášenému rodiči zkušební upozornění s dnešním souhrnem.
import { adminClient, userFromRequest } from "@/lib/supabase-server";
import { pushConfigured, sendToUser } from "@/lib/push";
import { dayDigest, localNow, type Item, type Kid } from "@/lib/notify";

export async function POST(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: "login" }, { status: 401 });
  if (!pushConfigured()) return Response.json({ error: "not_configured" }, { status: 503 });
  const db = adminClient();
  const [{ data: profile }, { data: kids }, { data: items }] = await Promise.all([
    db.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    db.from("children").select("id,name").eq("user_id", user.id),
    db.from("items").select("*").eq("user_id", user.id).neq("due_date", ""),
  ]);
  const day = localNow(new Date(), profile?.tz || "Europe/Prague").date;
  const body = dayDigest((items || []) as Item[], (kids || []) as Kid[], day);
  const sent = await sendToUser(db, user.id, {
    title: "Aloiz: zkušební upozornění",
    body: body ? "Takhle bude vypadat ranní souhrn:\n" + body : "Funguje to. Na dnešek a zítřek zatím nic nemáte.",
    tag: "test",
  });
  return Response.json({ sent });
}
