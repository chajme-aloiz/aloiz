// GET /api/push/setup: jednorázový pomocník pro nastavení upozornění.
// Pokaždé vyrobí NOVÉ náhodné klíče (nastavené klíče nikdy neukazuje), takže je bezpečné ho otevřít.
import webpush from "web-push";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function GET(req: Request) {
  const { publicKey, privateKey } = webpush.generateVAPIDKeys();
  const cron = randomBytes(24).toString("hex").replace(/[^a-z0-9]/g, "");
  const origin = new URL(req.url).origin;
  const sql = `-- Aloiz: každých 5 minut zkontrolovat, jestli se má poslat upozornění
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
select cron.unschedule('aloiz-upozorneni') where exists (select 1 from cron.job where jobname = 'aloiz-upozorneni');
select cron.schedule('aloiz-upozorneni', '*/5 * * * *', $$
  select net.http_get(
    url := '${origin}/api/push/cron',
    headers := jsonb_build_object('Authorization', 'Bearer ${cron}'),
    timeout_milliseconds := 30000
  );
$$);`;
  const configured = !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.CRON_SECRET);
  const box = (label: string, value: string, hint: string) =>
    `<section><h2>${label}</h2><p>${hint}</p><textarea readonly rows="${value.includes("\n") ? 12 : 2}" onclick="this.select()">${esc(value)}</textarea>
     <button onclick="navigator.clipboard.writeText(this.previousElementSibling.value);this.textContent='Zkopírováno'">Zkopírovat</button></section>`;
  const html = `<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Aloiz: nastavení upozornění</title>
<style>body{font:16px/1.5 system-ui,sans-serif;max-width:720px;margin:0 auto;padding:24px 16px 80px;background:#F6F5F1;color:#17171A}
h1{font-weight:400}h2{font-size:15px;margin:0 0 4px}section{background:#fff;border-radius:16px;padding:16px 18px;margin-top:14px}
p{margin:0 0 8px;color:#55544f;font-size:14px}textarea{width:100%;box-sizing:border-box;font:13px ui-monospace,monospace;border:1px solid #E4E2DC;border-radius:8px;padding:8px}
button{margin-top:8px;border:0;border-radius:16px;padding:8px 14px;background:#D41A52;color:#fff;font:inherit;font-size:14px}
.ok{background:#E9F3EC;border-radius:12px;padding:10px 14px}</style></head><body>
<h1>Nastavení upozornění</h1>
${configured ? '<p class="ok">Upozornění už jsou nastavená. Níže jsou nové klíče jen pro případ, že byste je chtěli vyměnit (pak je potřeba vyměnit všechny tři i příkaz v Supabase).</p>' : ""}
<p>Tyto hodnoty jsou tajné a vznikly právě teď jen pro vás. Neposílejte je nikomu. Stránku nezavírejte, dokud nemáte hotové kroky 1 až 3 (po obnovení vzniknou jiné).</p>
${box("1. VAPID_PUBLIC_KEY", publicKey, "Vercel > Settings > Environment Variables > Add. Name: VAPID_PUBLIC_KEY, typ Config (není tajný).")}
${box("2. VAPID_PRIVATE_KEY", privateKey, "Name: VAPID_PRIVATE_KEY, typ Secret.")}
${box("3. CRON_SECRET", cron, "Name: CRON_SECRET, typ Secret. Potom Deployments > ⋯ > Redeploy.")}
${box("4. Příkaz pro Supabase", sql, "Supabase > SQL Editor > New query, vložit a Run. Plánovač pak každých 5 minut zavolá Aloiz.")}
</body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
