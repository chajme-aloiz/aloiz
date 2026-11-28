// Čtení školních zpráv přes Claude API. Běží jen na serveru (klíč ANTHROPIC_API_KEY).
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { AI_LANG, type Lang } from "./i18n-server";

export type Kid = { id: string; name: string; cls?: string; school?: string };
export type ImageInput = { media_type: "image/jpeg" | "image/png" | "image/webp" | "image/gif"; data: string };
export type PdfInput = { data: string };
/** Už uložená událost, ke které může nový úkol patřit (např. besídka). */
export type KnownEvent = { id: string; title: string; date: string; childId: string };
export type Found = {
  id: string; type: "udalost" | "ukol" | "donest"; title: string; date: string; time: string; place: string;
  childId: string; note: string; uncertain: string; repeat: "" | "weekly"; until: string; parentId: string;
};

const ItemSchema = z.object({
  key: z.string(),
  eventKey: z.string().nullable(),
  type: z.enum(["udalost", "ukol", "donest"]),
  title: z.string(),
  date: z.string().nullable(),
  time: z.string().nullable(),
  place: z.string(),
  childId: z.string().nullable(),
  note: z.string(),
  uncertain: z.string(),
  repeat: z.enum(["", "weekly"]),
  until: z.string().nullable(),
});
const ResultSchema = z.object({ items: z.array(ItemSchema) });

export class ExtractError extends Error {
  constructor(public code: "refused" | "rate_limited" | "bad_input" | "failed", message: string) { super(message); }
}

const TZ = "Europe/Prague";
export function pragueToday(): { iso: string; weekday: string } {
  const now = new Date();
  return {
    iso: new Intl.DateTimeFormat("sv-SE", { timeZone: TZ }).format(now),
    weekday: now.toLocaleDateString("cs-CZ", { weekday: "long", timeZone: TZ }),
  };
}

function systemPrompt(kids: Kid[], events: KnownEvent[], lang: Lang): string {
  const out = AI_LANG[lang];
  const t = pragueToday();
  const list = kids.map((c) => ({ id: c.id, jmeno: c.name, trida: c.cls || "", skola: c.school || "" }));
  const known = events.map((e) => ({ id: e.id, nazev: e.title, datum: e.date, clen: e.childId }));
  return `Jsi Aloiz, pomocník rodin. Ze zprávy (nejčastěji ze školy) vytáhni všechno, co mají členové rodiny udělat, donést, odevzdat nebo kam a kdy mají přijít.
Dnešní datum: ${t.iso} (${t.weekday}). Relativní výrazy jako "zítra" nebo "ve středu" převeď na konkrétní datum vzhledem k dnešku.
Členové rodiny (JSON, děti i dospělí): ${JSON.stringify(list)}
Už uložené události rodiny (JSON): ${JSON.stringify(known)}
Pravidla:
- type: "udalost" (akce s časem nebo místem), "ukol" (něco udělat nebo podepsat), "donest" (věc nebo peníze přinést).
- date ve tvaru YYYY-MM-DD nebo null, time "HH:MM" nebo null. U "donest" a "ukol" je date termín, do kdy.
- childId: id člena rodiny podle jména, třídy, učitele nebo školy. Když je v rodině jediný člen, použij jeho id. Když to nejde určit, null.
- key: krátké označení položky v rámci této odpovědi ("a", "b", "c"...).
- eventKey: když se úkol nebo věc k donesení týká konkrétní akce (např. donést kytku na besídku, kostým na karneval), dej sem key té události z této odpovědi, nebo id už uložené události. U událostí a nesouvisejících položek null.
- Když je u zprávy poznámka rodiče, ber ji jako důležitý kontext (např. pro koho to je nebo co platí).
- Jazyk výstupu: ${out}. V tomto jazyce piš title, note i uncertain, i když je zpráva v jiném jazyce. Vlastní jména, názvy míst a adresy nepřekládej.
- uncertain: krátký popis toho, co chybí nebo je nejisté (česky např. "Chybí termín"), jinak "".
- title krátký a výstižný, place nebo "", note jedna krátká věta nebo "".
- repeat: "weekly", když se akce opakuje každý týden (kroužek, "každé úterý"), jinak "". U opakované akce je date první výskyt a until poslední den (YYYY-MM-DD) nebo null, když konec není uveden.
- U přeposlaného e-mailu ignoruj podpisy, patičky a historii odpovědí, která se netýká rodiny.
- Nevymýšlej nic, co ve zprávě není. Když tam nic takového není, vrať prázdný seznam.`;
}

const isDate = (s: unknown) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const isTime = (s: unknown) => typeof s === "string" && /^\d{2}:\d{2}$/.test(s);
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

let client: Anthropic | null = null;
function anthropic() {
  if (!client) client = new Anthropic(); // čte ANTHROPIC_API_KEY z prostředí
  return client;
}

export async function extractItems(input: {
  kids: Kid[]; text?: string; note?: string; images?: ImageInput[]; pdfs?: PdfInput[]; events?: KnownEvent[]; lang?: Lang;
}): Promise<Found[]> {
  const { kids, text = "", note = "", images = [], pdfs = [], events = [], lang = "cs" } = input;
  if (!text.trim() && !images.length && !pdfs.length) throw new ExtractError("bad_input", "Prázdná zpráva");

  const content: Anthropic.ContentBlockParam[] = [];
  for (const p of pdfs) content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: p.data } });
  for (const im of images) content.push({ type: "image", source: { type: "base64", media_type: im.media_type, data: im.data } });
  content.push({
    type: "text",
    text: (text.trim() ? "Zpráva:\n" + text.slice(0, 40000) : "Zpráva je v přiložených souborech.") +
      (note.trim() ? "\n\nPoznámka rodiče ke zprávě:\n" + note.slice(0, 2000) : ""),
  });

  let res;
  try {
    res = await anthropic().messages.parse({
      model: process.env.CLAUDE_MODEL || "claude-sonnet-5-5",
      max_tokens: 16000,
      system: systemPrompt(kids, events.slice(0, 60), lang),
      messages: [{ role: "user", content }],
      output_config: { effort: "medium", format: zodOutputFormat(ResultSchema) },
    });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) throw new ExtractError("rate_limited", "Moc požadavků");
    if (e instanceof Anthropic.BadRequestError) throw new ExtractError("bad_input", e.message);
    throw new ExtractError("failed", e instanceof Error ? e.message : "Neznámá chyba");
  }
  if (res.stop_reason === "refusal") throw new ExtractError("refused", "Odmítnuto");
  const parsed = res.parsed_output;
  if (!parsed) throw new ExtractError("failed", "Odpověď nešla přečíst");

  const ids = new Set(kids.map((k) => k.id));
  const known = new Set(events.map((e) => e.id));
  const newIds = parsed.items.map(() => uid());
  const byKey = new Map<string, string>();
  parsed.items.forEach((x, k) => { if (x.type === "udalost" && x.key) byKey.set(x.key, newIds[k]); });
  return parsed.items.map((x, k) => ({
    id: newIds[k],
    parentId: x.type === "udalost" || !x.eventKey ? "" : byKey.get(x.eventKey) || (known.has(x.eventKey) ? x.eventKey : ""),
    type: x.type,
    title: x.title.slice(0, 140),
    date: isDate(x.date) ? x.date! : "",
    time: isTime(x.time) ? x.time! : "",
    place: x.place.slice(0, 140),
    childId: x.childId && ids.has(x.childId) ? x.childId : kids.length === 1 ? kids[0].id : "",
    note: x.note.slice(0, 240),
    uncertain: x.uncertain.slice(0, 120),
    repeat: x.repeat,
    until: isDate(x.until) ? x.until! : "",
  }));
}

/** Položka, u které si AI nebyla ničím nejistá: ví se, pro koho je, a událost má datum. Jen takové se smí uložit bez kontroly. */
export function isCertain(i: Found) {
  return !!i.childId && !i.uncertain && (i.type !== "udalost" || !!i.date);
}
