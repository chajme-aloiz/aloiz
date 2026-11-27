# Aloiz

Školní život dětí na jednom místě. Rodič vyfotí lísteček, nahraje PDF, vloží text, namluví zprávu nebo přepošle školní e-mail. Claude z toho vytáhne, co kdy a pro které dítě, rodič to zkontroluje a uloží. Všechno se dá odebírat jako kalendář v telefonu.

## Z čeho se skládá

| Část | Služba | Cena v testovací fázi |
|---|---|---|
| Kód | GitHub | zdarma |
| Běh aplikace | Vercel (adresa `aloiz.vercel.app`) | zdarma |
| Přihlášení a data | Supabase | zdarma |
| Čtení zpráv | Claude API (Anthropic) | platí se za použití, řádově desetníky za zprávu |
| Přeposílání e-mailů | Postmark Inbound | zdarma do 100 e-mailů měsíčně |

## Nastavení krok za krokem

1. **Supabase**: nový projekt (region Frankfurt). V *SQL Editor* spusťte celý soubor `supabase/schema.sql`. V *Authentication > URL Configuration* nastavte Site URL na adresu aplikace na Vercelu. V *Authentication > Providers* zapněte Email, případně Google.
2. **Claude API**: na console.anthropic.com vytvořte API klíč a nastavte měsíční limit útraty.
3. **Vercel**: *Add New Project* z GitHub repozitáře `aloiz`, v *Environment Variables* vyplňte hodnoty podle `.env.example`.
4. **Postmark** (přeposílání e-mailů): server, záložka *Inbound*, webhook `https://<adresa-aplikace>/api/inbound?key=<INBOUND_SECRET>`. Inbound adresu zapište do `NEXT_PUBLIC_INBOUND_ADDRESS`. Až bude doména `aloiz.cz`, nasměruje se na Postmark adresa `sdilet@aloiz.cz`.

## Vývoj na počítači

```bash
npm install
cp .env.example .env.local   # a doplnit hodnoty
npm run dev
```

## Jak to funguje

- `lib/aloiz-app.js`: celé rozhraní (obrazovky Dnes, Přidat, Kontrola, Dítě, Kalendář, Nastavení).
- `app/api/extract`: přijme text, fotky nebo PDF a pošle je Claude (`lib/extract.ts`).
- `app/api/inbound`: přijme přeposlaný e-mail z Postmarku, rodiče pozná podle adresy odesílatele a návrhy uloží ke kontrole.
- `app/api/calendar/[token]`: tajný odkaz na kalendář pro Google, Apple a Outlook, s připomínkami.
- `supabase/schema.sql`: tabulky a pravidla, aby každý viděl jen svoje data.

Hlas: aplikace používá rozpoznávání řeči v prohlížeči (Chrome, Safari, Edge). Kde není, zobrazí tip na diktování klávesnicí.
