import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { LANG_CODES, normLang, type Lang } from "@/lib/i18n-server";
import { PRIVACY } from "./texts";

const s = { wrap: { maxWidth: 640, margin: "0 auto", padding: "32px 0 80px", lineHeight: 1.6 }, h2: { fontSize: 20, fontWeight: 500, marginTop: 32 } } as const;

/** Jazyk stránky: volba z aplikace (cookie), jinak jazyk prohlížeče, jinak angličtina. */
async function pageLang(): Promise<Lang> {
  const c = (await cookies()).get("aloiz-lang")?.value;
  if (c && (LANG_CODES as readonly string[]).includes(c)) return normLang(c);
  const accept = (await headers()).get("accept-language") || "";
  for (const part of accept.split(",")) {
    const code = part.trim().split(/[-_;]/)[0].toLowerCase();
    if ((LANG_CODES as readonly string[]).includes(code)) return normLang(code);
  }
  return "en";
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: PRIVACY[await pageLang()].title + " · Aloiz" };
}

export default async function Soukromi() {
  const lang = await pageLang();
  const p = PRIVACY[lang];
  const contact = process.env.CONTACT_EMAIL;
  return (
    <main style={s.wrap} lang={lang === "zh" ? "zh-Hans" : lang}>
      <p><a href="/" style={{ color: "inherit" }}>{p.back}</a></p>
      <h1 style={{ fontSize: 34, marginTop: 16 }}>{p.title}</h1>
      <p className="muted">{p.valid}</p>

      <p>{p.intro}</p>

      <h2 style={s.h2}>{p.dataH}</h2>
      <ul>{p.data.map((x) => <li key={x}>{x}</li>)}</ul>

      <h2 style={s.h2}>{p.useH}</h2>
      <p>{p.use}</p>

      <h2 style={s.h2}>{p.whoH}</h2>
      <ul>
        {p.who.map(([name, what]) => <li key={name}><b>{name}</b>{lang === "zh" ? "：" : ": "}{what}</li>)}
        <li>{p.whoNote}</li>
      </ul>

      <h2 style={s.h2}>{p.seeH}</h2>
      <p>{p.see}</p>

      <h2 style={s.h2}>{p.delH}</h2>
      <p>{p.del[0]}<b>{p.del[1]}</b>{p.del[2]}</p>

      <h2 style={s.h2}>{p.cookiesH}</h2>
      <p>{p.cookies}</p>

      {contact ? (<><h2 style={s.h2}>{p.contactH}</h2><p><a href={"mailto:" + contact}>{contact}</a></p></>) : null}
    </main>
  );
}
