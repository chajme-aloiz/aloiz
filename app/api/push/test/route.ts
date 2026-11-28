// POST /api/push/test: pošle přihlášenému rodiči zkušební upozornění s dnešním souhrnem.
import { adminClient, userFromRequest } from "@/lib/supabase-server";
import { pushConfigured, sendToUser } from "@/lib/push";
import { dayDigest, localNow, type Item, type Kid } from "@/lib/notify";
import { S, normLang } from "@/lib/i18n-server";

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
  const lang = normLang(profile?.lang);
  const body = dayDigest((items || []) as Item[], (kids || []) as Kid[], day, lang);
  const sent = await sendToUser(db, user.id, {
    title: S[lang].testTitle,
    body: body ? S[lang].testBody + body : S[lang].testEmpty,
    tag: "test",
  });
  return Response.json({ sent });
}
