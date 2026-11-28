// Ranní souhrn, večerní „připravit na zítra“ a připomínky položek.
// Čisté funkce bez databáze, aby šly snadno vyzkoušet. Texty podle jazyka rodiče (lib/i18n-server.ts).
import { S, dayLabel, normLang, typePrefix, type Lang } from "./i18n-server";

export type Kid = { id: string; name: string };
export type Item = {
  id: string; child_id: string | null; type: string; title: string; due_date: string; due_time: string;
  place: string; done: boolean; repeat_rule: string; repeat_until: string; skip_dates: string[] | null; remind?: string | null;
};
export type Settings = {
  morning_on?: boolean; morning_time?: string; evening_on?: boolean; evening_time?: string;
  event_lead?: number; tz?: string; lang?: string | null;
};
export type Note = { key: string; title: string; body: string; tag: string };

const pad = (n: number) => String(n).padStart(2, "0");

export function addDays(d: string, n: number) {
  const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10);
}

/** Místní datum a čas v dané časové zóně. */
export function localNow(now: Date, tz: string) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

/** Místní datum a čas (v zóně tz) převede na okamžik v ms. */
export function zonedMs(date: string, time: string, tz: string) {
  const [y, m, d] = date.split("-").map(Number); const [hh, mm] = (time || "00:00").split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const offset = (ms: number) => {
    const l = localNow(new Date(ms), tz);
    const [ly, lm, ld] = l.date.split("-").map(Number); const [lh, lmi] = l.time.split(":").map(Number);
    return Date.UTC(ly, lm - 1, ld, lh, lmi) - Math.floor(ms / 60000) * 60000;
  };
  let t = guess - offset(guess);
  t = guess - offset(t);
  return t;
}
const minutesOf = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

/** Rozbalí týdně opakované položky na jednotlivé termíny v rozsahu od–do. */
export function expand(items: Item[], from: string, to: string) {
  const out: (Item & { occ: string })[] = [];
  for (const it of items) {
    if (!it.due_date) continue;
    if (it.repeat_rule === "weekly") {
      const end = it.repeat_until && it.repeat_until < to ? it.repeat_until : to;
      let d = it.due_date; let guard = 0;
      while (d < from && guard++ < 1040) d = addDays(d, 7);
      while (d <= end && guard++ < 2080) { if (!(it.skip_dates || []).includes(d)) out.push({ ...it, due_date: d, occ: d }); d = addDays(d, 7); }
    } else if (it.due_date >= from && it.due_date <= to) out.push({ ...it, occ: it.due_date });
  }
  return out;
}

const open = (it: Item) => it.type === "udalost" || !it.done;
const byTime = (a: Item, b: Item) => (a.due_time || "99").localeCompare(b.due_time || "99");

function line(it: Item, kids: Map<string, string>, multi: boolean) {
  const kid = multi && it.child_id ? kids.get(it.child_id) : "";
  return (it.due_time ? it.due_time + " " : "") + (kid ? kid + ": " : "") + it.title + (it.place ? " (" + it.place + ")" : "");
}

/** Text souhrnu pro jeden den a výhled na další. Vrací null, když není co hlásit. */
export function dayDigest(items: Item[], kidList: Kid[], day: string, lang: Lang = "cs") {
  const L = S[lang];
  const kids = new Map(kidList.map((k) => [k.id, k.name]));
  const multi = kidList.length > 1;
  const occ = expand(items, day, addDays(day, 1)).filter(open);
  const today = occ.filter((i) => i.due_date === day).sort(byTime);
  const tomorrow = occ.filter((i) => i.due_date === addDays(day, 1)).sort(byTime);
  const parts: string[] = [];
  const bring = today.filter((i) => i.type === "donest");
  const rest = today.filter((i) => i.type !== "donest");
  if (bring.length) parts.push(L.bring + bring.map((i) => line(i, kids, multi)).join(", "));
  if (rest.length) parts.push(L.todayL + rest.map((i) => line(i, kids, multi)).join(", "));
  const prep = tomorrow.filter((i) => i.type !== "udalost");
  const ev = tomorrow.filter((i) => i.type === "udalost");
  if (prep.length) parts.push(L.prepTomorrow + prep.map((i) => line(i, kids, multi)).join(", "));
  if (ev.length) parts.push(L.tomorrowL + ev.map((i) => line(i, kids, multi)).join(", "));
  return parts.length ? parts.join("\n") : null;
}

/** Večer: co připravit a co se děje zítra. */
export function eveningDigest(items: Item[], kidList: Kid[], day: string, lang: Lang = "cs") {
  const L = S[lang];
  const kids = new Map(kidList.map((k) => [k.id, k.name]));
  const multi = kidList.length > 1;
  const tm = addDays(day, 1);
  const list = expand(items, tm, tm).filter(open).sort(byTime);
  const prep = list.filter((i) => i.type !== "udalost");
  const ev = list.filter((i) => i.type === "udalost");
  const parts: string[] = [];
  if (prep.length) parts.push(L.prep + prep.map((i) => line(i, kids, multi)).join(", "));
  if (ev.length) parts.push(L.tomorrowL + ev.map((i) => line(i, kids, multi)).join(", "));
  return parts.length ? parts.join("\n") : null;
}

/** Kolik minut před začátkem připomenout položku, nebo null (nepřipomínat). */
export function leadFor(it: Item, s: Settings): number | null {
  const r = (it.remind || "").trim();
  if (r === "off") return null;
  if (r && /^-?\d+$/.test(r)) return Number(r);
  // Výchozí: jen akce s časem, podle nastavení rodiče. Celodenní pokryje ranní a večerní souhrn.
  if (!it.due_time) return null;
  const lead = s.event_lead ?? 60;
  return lead > 0 ? lead : null;
}

function leadText(lead: number, lang: Lang) {
  const L = S[lang];
  if (lead <= 0) return L.now;
  if (lead < 60) return L.inMin(lead);
  if (lead % 10080 === 0) return L.inUnits(lead / 10080, "week");
  if (lead % 1440 === 0) return L.inUnits(lead / 1440, "day");
  return L.inHours(Math.floor(lead / 60), lead % 60);
}

/** Celodenní položka: kdy to je, vzhledem k dnešku. */
function dayText(date: string, today: string, lang: Lang) {
  const L = S[lang];
  const n = Math.round((Date.parse(date + "T12:00:00Z") - Date.parse(today + "T12:00:00Z")) / 86400000);
  if (n <= 0) return L.today;
  if (n === 1) return L.tomorrow;
  if (n % 7 === 0) return L.inUnits(n / 7, "week");
  return L.inUnits(n, "day");
}

/**
 * Co se má poslat právě teď. Volá se každých pár minut; okno `windowMin` pokryje zpoždění plánovače.
 * Klíče se ukládají do notify_log, takže se nic nepošle dvakrát.
 */
export function dueNotes(now: Date, s: Settings, items: Item[], kidList: Kid[], windowMin = 20): Note[] {
  const tz = s.tz || "Europe/Prague";
  const lang = normLang(s.lang);
  const L = S[lang];
  const local = localNow(now, tz);
  const nowMin = minutesOf(local.time);
  const notes: Note[] = [];
  const kids = new Map(kidList.map((k) => [k.id, k.name]));

  const inSlot = (t: string, slack: number) => { const d = nowMin - minutesOf(t); return d >= 0 && d < slack; };

  if (s.morning_on !== false && inSlot(s.morning_time || "07:00", 90)) {
    const body = dayDigest(items, kidList, local.date, lang);
    notes.push({ key: "morning:" + local.date, title: L.morning + " · " + dayLabel(local.date, lang), body: body || "", tag: "morning" });
  }
  if (s.evening_on && inSlot(s.evening_time || "19:00", 90)) {
    const body = eveningDigest(items, kidList, local.date, lang);
    notes.push({ key: "evening:" + local.date, title: L.evening + " · " + dayLabel(addDays(local.date, 1), lang), body: body || "", tag: "evening" });
  }

  const t = now.getTime();
  // Jak daleko dopředu hledat: podle nejdelší nastavené připomínky (klidně týdny), nejvýš rok.
  let maxLead = 0;
  for (const it of items) { const l = leadFor(it, s); if (l !== null && l > maxLead) maxLead = l; }
  const ahead = Math.min(370, Math.max(3, Math.ceil(maxLead / 1440) + 2));
  for (const it of expand(items, addDays(local.date, -1), addDays(local.date, ahead))) {
    if (!open(it)) continue;
    const lead = leadFor(it, s);
    if (lead === null) continue;
    const fire = zonedMs(it.due_date, it.due_time || "00:00", tz) - lead * 60000;
    if (fire > t || t - fire >= windowMin * 60000) continue;
    const kid = it.child_id ? kids.get(it.child_id) : "";
    const when = it.due_time ? leadText(lead, lang) + " · " + it.due_time : dayText(it.due_date, local.date, lang);
    const prefix = typePrefix(it.type, lang);
    notes.push({
      key: `item:${it.id}:${it.occ}:${lead}`,
      title: (kid ? kid + ": " : "") + prefix + it.title,
      body: [when, it.place].filter(Boolean).join(" · "),
      tag: "item-" + it.id + "-" + it.occ,
    });
  }
  return notes;
}

export const _test = { pad, minutesOf };
