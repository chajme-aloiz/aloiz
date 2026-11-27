// GET /api/calendar/<tajný-kód>: kalendář k odběru (Google, Apple, Outlook se k němu přihlásí a samy ho obnovují).
import { adminClient } from "@/lib/supabase-server";

type Row = {
  id: string; child_id: string | null; type: string; title: string; due_date: string; due_time: string;
  place: string; note: string; done: boolean; repeat_rule: string; repeat_until: string; skip_dates: string[];
};

const esc = (s: string) => String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const pad = (n: number) => String(n).padStart(2, "0");
const compact = (d: string) => d.replace(/-/g, "");
function nextDay(d: string) { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + 1); return x.toISOString().slice(0, 10); }
function plusHour(t: string) { const [h, m] = t.split(":").map(Number); return pad(Math.min(h + 1, 23)) + pad(m); }
// Řádky delší než 75 bajtů se podle normy zalamují
function fold(line: string) {
  const out: string[] = []; let cur = "";
  for (const ch of line) { if (Buffer.byteLength(cur + ch) > 73) { out.push(cur); cur = " " + ch; } else cur += ch; }
  out.push(cur); return out.join("\r\n");
}

const TZ_BLOCK = [
  "BEGIN:VTIMEZONE", "TZID:Europe/Prague",
  "BEGIN:DAYLIGHT", "TZOFFSETFROM:+0100", "TZOFFSETTO:+0200", "TZNAME:CEST", "DTSTART:19700329T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU", "END:DAYLIGHT",
  "BEGIN:STANDARD", "TZOFFSETFROM:+0200", "TZOFFSETTO:+0100", "TZNAME:CET", "DTSTART:19701025T030000", "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU", "END:STANDARD",
  "END:VTIMEZONE",
];

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const clean = token.replace(/\.ics$/, "");
  if (!/^[a-f0-9]{20,64}$/.test(clean)) return new Response("not found", { status: 404 });
  const db = adminClient();
  const { data: profile } = await db.from("profiles").select("id").eq("feed_token", clean).maybeSingle();
  if (!profile) return new Response("not found", { status: 404 });

  const [{ data: kids }, { data: items }] = await Promise.all([
    db.from("children").select("id,name").eq("user_id", profile.id),
    db.from("items").select("*").eq("user_id", profile.id).neq("due_date", ""),
  ]);
  const name = new Map((kids || []).map((k) => [k.id, k.name as string]));
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";

  const events = ((items || []) as Row[]).filter((it) => !(it.type !== "udalost" && it.done)).map((it) => {
    const kid = it.child_id ? name.get(it.child_id) : "";
    const prefix = it.type === "donest" ? "Donést: " : it.type === "ukol" ? "Úkol: " : "";
    const lines = ["BEGIN:VEVENT", "UID:" + it.id + "@aloiz", "DTSTAMP:" + stamp];
    if (it.due_time) {
      lines.push("DTSTART;TZID=Europe/Prague:" + compact(it.due_date) + "T" + it.due_time.replace(":", "") + "00");
      lines.push("DTEND;TZID=Europe/Prague:" + compact(it.due_date) + "T" + plusHour(it.due_time) + "00");
    } else {
      lines.push("DTSTART;VALUE=DATE:" + compact(it.due_date), "DTEND;VALUE=DATE:" + compact(nextDay(it.due_date)));
    }
    if (it.repeat_rule === "weekly") {
      lines.push("RRULE:FREQ=WEEKLY" + (it.repeat_until ? ";UNTIL=" + compact(it.repeat_until) + (it.due_time ? "T225959Z" : "") : ""));
      for (const s of it.skip_dates || []) {
        lines.push(it.due_time ? "EXDATE;TZID=Europe/Prague:" + compact(s) + "T" + it.due_time.replace(":", "") + "00" : "EXDATE;VALUE=DATE:" + compact(s));
      }
    }
    lines.push(fold("SUMMARY:" + esc((kid ? kid + ": " : "") + prefix + it.title)));
    if (it.place) lines.push(fold("LOCATION:" + esc(it.place)));
    if (it.note) lines.push(fold("DESCRIPTION:" + esc(it.note)));
    // Připomínka: u akce s časem hodinu předem, u celodenních večer předtím (18:00)
    lines.push("BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:" + (it.due_time ? "-PT1H" : "-PT6H"), fold("DESCRIPTION:" + esc(it.title)), "END:VALARM");
    lines.push("END:VEVENT");
    return lines.join("\r\n");
  });

  const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Aloiz//CS", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "X-WR-CALNAME:Aloiz", "X-WR-TIMEZONE:Europe/Prague", "REFRESH-INTERVAL;VALUE=DURATION:PT1H", "X-PUBLISHED-TTL:PT1H",
    ...TZ_BLOCK, ...events, "END:VCALENDAR"].join("\r\n") + "\r\n";

  return new Response(body, {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "no-store", "Content-Disposition": 'inline; filename="aloiz.ics"' },
  });
}
