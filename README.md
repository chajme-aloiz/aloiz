# Aloiz

Školní i rodinný život na jednom místě. Rodič vyfotí lísteček, nahraje PDF, vloží text, namluví zprávu nebo přepošle školní e-mail. Claude z toho vytáhne, co kdy a pro koho z rodiny, rodič to zkontroluje a uloží. Všechno se dá odebírat jako kalendář v telefonu.

## Z čeho se skládá

| Část | Služba | Cena v testovací fázi |
|---|---|---|
| Kód | GitHub | zdarma |
| Běh aplikace | Vercel (adresa `aloiz.vercel.app`) | zdarma |
| Přihlášení a data | Supabase | zdarma |
| Čtení zpráv | Claude API (Anthropic) | platí se za použití, řádově desetníky za zprávu |
| Přeposílání e-mailů | Postmark Inbound | zdarma do 100 e-mailů měsíčně |
| WhatsApp | WhatsApp Business Cloud API (Meta) | zdarma: odpovědi na zprávy rodičů se neplatí, testovací číslo až pro 5 telefonů |
| Upozornění a ranní souhrn | Web Push v prohlížeči + plánovač pg_cron v Supabase | zdarma |

## Nastavení krok za krokem

1. **Supabase**: nový projekt (region Frankfurt). V *SQL Editor* spusťte celý soubor `supabase/schema.sql`. V *Authentication > URL Configuration* nastavte Site URL na adresu aplikace na Vercelu. V *Authentication > Providers* zapněte Email, případně Google.
2. **Claude API**: na console.anthropic.com vytvořte API klíč a nastavte měsíční limit útraty.
3. **Vercel**: *Add New Project* z GitHub repozitáře `aloiz`, v *Environment Variables* vyplňte hodnoty podle `.env.example`.
4. **Postmark** (přeposílání e-mailů): server, záložka *Inbound*, webhook `https://<adresa-aplikace>/api/inbound?key=<INBOUND_SECRET>`. Inbound adresu zapište do `NEXT_PUBLIC_INBOUND_ADDRESS`. Až bude doména `aloiz.cz`, nasměruje se na Postmark adresa `sdilet@aloiz.cz`.

5. **Upozornění**: v Supabase spusťte `supabase/upozorneni.sql`. Otevřete `https://<adresa-aplikace>/api/push/setup`, tři hodnoty vložte do Vercelu (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, CRON_SECRET), udělejte Redeploy a příkaz ze stránky spusťte v Supabase SQL Editoru. V Aloizu pak *Nastavení > Upozornění > Zapnout*. Na iPhonu jen z ikony na ploše (Safari > Sdílet > Přidat na plochu).
6. **Jazyky**: v Supabase spusťte `supabase/jazyk.sql`. Aplikace je v 9 jazycích (cs, en, sk, pl, de, es, fr, zh, hi), výchozí podle zařízení, přepínač na přihlášení a v *Nastavení > Jazyk*. Texty jsou v `lib/i18n/`, serverové (upozornění, kalendář, e-maily) v `lib/i18n-server.ts`.
7. **WhatsApp**: v Supabase spusťte `supabase/whatsapp.sql`. Na developers.facebook.com vytvořte aplikaci typu *Business* s produktem *WhatsApp*. V *WhatsApp > API Setup* je testovací číslo, jeho *Phone number ID* a seznam až 5 ověřených telefonů, kterým smí odpovídat. V *Configuration > Webhook* zadejte `https://<adresa-aplikace>/api/whatsapp`, *Verify token* = `WHATSAPP_VERIFY_TOKEN` a odebírejte pole `messages`. Trvalý token vyrobte v Business Settings > System users (oprávnění `whatsapp_business_messaging`, `whatsapp_business_management`). Do Vercelu: `NEXT_PUBLIC_WHATSAPP_NUMBER`, `WHATSAPP_PHONE_ID`, `WHATSAPP_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`. Rodič pak v *Nastavení > WhatsApp* klepne na *Propojit* a odešle připravenou zprávu s kódem.

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
- `app/api/whatsapp`: webhook WhatsAppu. Rodiče pozná podle propojeného čísla, fotku, PDF nebo text přečte (společná cesta s e-maily v `lib/ingest.ts`), uloží a odpoví, co našel. Hlasovky zatím neumí (Claude neposlouchá zvuk), poradí psaní nebo diktování.
- `app/api/calendar/[token]`: tajný odkaz na kalendář pro Google, Apple a Outlook, s připomínkami.
- `app/api/push/cron`: každých 5 minut (volá ho pg_cron v Supabase) pošle ranní a večerní souhrn a připomínky (`lib/notify.ts`, `lib/push.ts`, `public/sw.js`).
- `supabase/schema.sql`: tabulky a pravidla, aby každý viděl jen svoje data.
- `supabase/jazyk.sql`: sloupec `lang` v profilu (jazyk upozornění, kalendáře a přeposlaných e-mailů). V novém projektu už je obsažené ve `schema.sql`.
- `supabase/zdroje-a-nastaveni.sql`: doplnění pro už běžící databázi (zdroje s fotkami, úkoly u událostí, ukládání bez kontroly). V novém projektu už je obsažené ve `schema.sql`.

Hlas: aplikace používá rozpoznávání řeči v prohlížeči (Chrome, Safari, Edge). Kde není, zobrazí tip na diktování klávesnicí.
