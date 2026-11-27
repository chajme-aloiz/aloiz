// DELETE /api/account: zruší účet přihlášeného rodiče a smaže všechna jeho data.
// Tabulky se smažou samy (on delete cascade), soubory v úložišti mažeme zvlášť.
import { adminClient, userFromRequest } from "@/lib/supabase-server";

export async function DELETE(req: Request) {
  const user = await userFromRequest(req);
  if (!user) return Response.json({ error: "login" }, { status: 401 });
  const db = adminClient();

  // Fotky a PDF: cesty jsou uložené u zdrojů, navíc projdeme složku uživatele
  const paths = new Set<string>();
  const { data: sources } = await db.from("sources").select("files").eq("user_id", user.id);
  for (const s of sources || []) for (const f of (s.files || []) as { path?: string }[]) if (f.path) paths.add(f.path);
  const { data: dirs } = await db.storage.from("sources").list(user.id, { limit: 1000 });
  for (const d of dirs || []) {
    const { data: files } = await db.storage.from("sources").list(user.id + "/" + d.name, { limit: 1000 });
    for (const f of files || []) paths.add(user.id + "/" + d.name + "/" + f.name);
  }
  const list = [...paths].filter((p) => p.startsWith(user.id + "/"));
  for (let i = 0; i < list.length; i += 100) await db.storage.from("sources").remove(list.slice(i, i + 100));

  const { error } = await db.auth.admin.deleteUser(user.id);
  if (error) { console.error("account delete failed", error.message); return Response.json({ error: "failed" }, { status: 500 }); }
  return Response.json({ ok: true });
}
