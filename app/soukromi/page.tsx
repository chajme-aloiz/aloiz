import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ochrana soukromí · Aloiz" };

const s = { wrap: { maxWidth: 640, margin: "0 auto", padding: "32px 0 80px", lineHeight: 1.6 }, h2: { fontSize: 20, fontWeight: 500, marginTop: 32 } } as const;

export default function Soukromi() {
  const contact = process.env.CONTACT_EMAIL;
  return (
    <main style={s.wrap}>
      <p><a href="/" style={{ color: "inherit" }}>← Zpět do Aloizu</a></p>
      <h1 style={{ fontSize: 34, marginTop: 16 }}>Ochrana soukromí</h1>
      <p className="muted">Platí od 27. listopadu 2026.</p>

      <p>Aloiz pomáhá rodičům mít přehled o školních akcích, úkolech a věcech, které mají děti donést. Tady najdete, jaká data Aloiz ukládá, k čemu je používá a kdo je může vidět.</p>

      <h2 style={s.h2}>Jaká data ukládáme</h2>
      <ul>
        <li>E-mailovou adresu, se kterou se přihlásíte (e-mailem nebo přes Google). Z účtu Google získáme jen jméno a e-mail, nic dalšího.</li>
        <li>Členy rodiny, které zadáte: jméno, případně třídu a školu.</li>
        <li>Události, úkoly a věci k donesení, včetně poznámek.</li>
        <li>Zdroje, ze kterých položky vznikly: nahrané fotky a PDF, vložený nebo namluvený text a přeposlané e-maily.</li>
        <li>Pokud zapnete upozornění, technický údaj o zařízení, na které je posíláme, a nastavení upozornění.</li>
      </ul>

      <h2 style={s.h2}>K čemu data používáme</h2>
      <p>Jen k tomu, aby Aloiz fungoval: aby zobrazil váš přehled, poslal upozornění a nabídl kalendář k odběru. Data neprodáváme, nepoužíváme k reklamě a nesdílíme s nikým kromě služeb níže, bez kterých by Aloiz nefungoval.</p>

      <h2 style={s.h2}>Kdo data zpracovává</h2>
      <ul>
        <li><b>Supabase</b>: databáze a úložiště souborů (servery v EU, Frankfurt).</li>
        <li><b>Vercel</b>: provoz webové aplikace.</li>
        <li><b>Anthropic (Claude)</b>: přečte nahranou fotku, PDF, text nebo e-mail a vytáhne z nich termíny a úkoly. Obsah se k tomu odešle jen v okamžiku čtení a Anthropic ho nepoužívá k trénování svých modelů.</li>
        <li><b>Postmark</b>: přijímá e-maily, které do Aloizu přepošlete.</li>
        <li><b>Google</b>: přihlášení přes účet Google, pokud ho zvolíte.</li>
        <li>Upozornění doručuje služba výrobce vašeho prohlížeče (např. Google nebo Apple).</li>
      </ul>

      <h2 style={s.h2}>Kdo data vidí</h2>
      <p>Svá data vidíte jen vy po přihlášení. Odkaz na kalendář k odběru je tajný: kdo ho zná, uvidí vaše události, proto ho sdílejte jen s blízkými.</p>

      <h2 style={s.h2}>Smazání dat</h2>
      <p>Položky i členy rodiny můžete kdykoli smazat přímo v aplikaci. Upozornění vypnete v Nastavení. Pokud chcete smazat celý účet se všemi daty, napište nám{contact ? <> na <a href={"mailto:" + contact}>{contact}</a></> : " na e-mail uvedený u aplikace"}, smažeme ho do 30 dnů.</p>

      <h2 style={s.h2}>Cookies</h2>
      <p>Aloiz neužívá reklamní ani analytické cookies. V prohlížeči si ukládá jen to, co je nutné pro přihlášení a pro vaše drobná nastavení.</p>

      {contact ? (<><h2 style={s.h2}>Kontakt</h2><p><a href={"mailto:" + contact}>{contact}</a></p></>) : null}
    </main>
  );
}
