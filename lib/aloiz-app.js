// Aloiz: celé uživatelské rozhraní (jedna stránka, bez frameworku).
// Vzniklo z testovací verze. Data se ukládají do Supabase, čtení zpráv běží přes /api/extract.

const COLORS = ["#E39A6B","#6F9B86","#8E86C9","#6E9BC4","#C98FA8","#B8A24E"];
const TYPES = {udalost:"Událost", ukol:"Úkol", donest:"Donést"};
const DAYS = ["Neděle","Pondělí","Úterý","Středa","Čtvrtek","Pátek","Sobota"];
const DAYS_S = ["Ne","Po","Út","St","Čt","Pá","So"];
const MONTHS = ["leden","únor","březen","duben","květen","červen","červenec","srpen","září","říjen","listopad","prosinec"];
const MAX_IMAGES = 4;
const MAX_PDF_BYTES = 3_000_000; // server přijme kolem 4 MB, base64 přidá třetinu

const ICON = {
  cam:'<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.7l1.3-2h5l1.3 2h1.7A2.5 2.5 0 0 1 20 8.5v9A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  file:'<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/></svg>',
  back:'<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  close:'<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  user:'<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.6 4-5.2 7-5.2s5.8 1.6 7 5.2"/></svg>',
  plus:'<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  tick:'<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  cal:'<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>',
  pen:'<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
  next:'<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  mic:'<svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
  mail:'<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M4 7l8 6 8-6"/></svg>',
  google:'<svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>',
};
const LOGO = '<svg class="logo" role="img" aria-label="aloiz" width="74" height="32" viewBox="98 236 636 278" fill="none"><circle cx="200" cy="410" r="86.25" stroke="#E6215C" stroke-width="1.8"/><line x1="286.25" y1="320" x2="286.25" y2="500" stroke="#E6215C" stroke-width="1.8"/><line x1="321.75" y1="250" x2="321.75" y2="500" stroke="var(--logo-dark)" stroke-width="1.2"/><circle cx="437.5" cy="410" r="87.5" stroke="var(--logo-dark)" stroke-width="1.2"/><line x1="554.25" y1="320" x2="554.25" y2="500" stroke="#E6215C" stroke-width="1.8"/><path d="M585.5 322.5 H711.5 L588.5 497.5 H718" stroke="var(--logo-dark)" stroke-width="1.2"/><circle cx="554.25" cy="290" r="13" fill="#E6215C"/></svg>';

export function mount({ supabase, inboundAddress, appEl, fabEl, toastEl }) {
  let state = {children:[], items:[]};
  let synced = {children:new Map(), items:new Map()}; // co je uložené na serveru (JSON podle id)
  let session = null, profile = null, inbox = [];
  let loading = true;
  let view = {name:"today"};
  let prevView = {name:"today"};
  let filter = "all";
  let pending = [], pendingSource = "", pendingInboxId = null, pendingSourceId = null;
  let staged = [], stagedNote = ""; // soubory připravené ke čtení + poznámka rodiče
  const sourceCache = new Map();
  let busy = false, busyText = "";
  let loginSent = "";
  let rec = null, recording = false, draftText = "";
  let pushState = "unknown", pushServer = false;

  // ---------- helpers ----------
  function h(tag, attrs, ...kids){
    const el = document.createElement(tag);
    for (const [k,v] of Object.entries(attrs||{})){
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") el.className = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "style") el.style.cssText = v;
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const c of kids.flat()){ if (c === null || c === undefined || c === false) continue;
      el.append(c instanceof Node ? c : document.createTextNode(String(c))); }
    return el;
  }
  const svg = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; };
  const uid = () => Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4);
  const pad = n => String(n).padStart(2,"0");
  const iso = d => d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
  const todayIso = () => iso(new Date());
  const addDays = (s, n) => { const d = new Date(s+"T12:00:00"); d.setDate(d.getDate()+n); return iso(d); };
  function prettyDate(s){
    if (!s) return "Bez termínu";
    const t = todayIso();
    if (s === t) return "Dnes";
    if (s === addDays(t,1)) return "Zítra";
    const d = new Date(s+"T12:00:00");
    return DAYS[d.getDay()] + " " + d.getDate() + ". " + (d.getMonth()+1) + ".";
  }
  const child = id => state.children.find(c => c.id === id);
  function toast(msg, action){
    toastEl.replaceChildren(msg);
    if (action) toastEl.append(h("button",{class:"toastbtn",onclick:()=>{ toastEl.hidden = true; action.fn(); }}, action.label));
    toastEl.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(()=> toastEl.hidden = true, action ? 5000 : 2800);
  }
  const isTask = it => it.type !== "udalost";
  const doneTask = it => isTask(it) && it.done; // hotové úkoly se přesouvají do „Hotovo“

  // ---------- data (Supabase) ----------
  const childToRow = c => ({id:c.id, name:c.name, cls:c.cls||"", school:c.school||"", color:c.color});
  const itemToRow = i => ({id:i.id, child_id:i.childId||null, type:i.type, title:i.title, due_date:i.date||"", due_time:i.time||"",
    place:i.place||"", note:i.note||"", done:!!i.done, source:i.source||"", repeat_rule:i.repeat||"", repeat_until:i.until||"",
    skip_dates:i.skip||[], created_ms:i.createdAt||Date.now(), parent_id:i.parentId||"", source_id:i.sourceId||null, remind:i.remind||""});
  const rowToChild = r => ({id:r.id, name:r.name, cls:r.cls, school:r.school, color:r.color});
  const rowToItem = r => ({id:r.id, childId:r.child_id||"", type:r.type, title:r.title, date:r.due_date, time:r.due_time, place:r.place,
    note:r.note, done:r.done, source:r.source, repeat:r.repeat_rule, until:r.repeat_until, skip:r.skip_dates||[], createdAt:Number(r.created_ms),
    parentId:r.parent_id||"", sourceId:r.source_id||"", remind:r.remind||""});

  async function load(){
    const [c, i, p, b] = await Promise.all([
      supabase.from("children").select("*").order("created_at"),
      supabase.from("items").select("*").order("created_ms"),
      supabase.from("profiles").select("*").maybeSingle(),
      supabase.from("inbox").select("*").order("created_at"),
    ]);
    if (c.error || i.error){ toast("Data se nenačetla. Zkontrolujte připojení."); return; }
    state = {children: c.data.map(rowToChild), items: i.data.map(rowToItem)};
    synced = {children: new Map(c.data.map(r => [r.id, JSON.stringify(childToRow(rowToChild(r)))])),
              items: new Map(i.data.map(r => [r.id, JSON.stringify(itemToRow(rowToItem(r)))]))};
    profile = p.data || null;
    inbox = b.data || [];
  }

  // Uloží jen to, co se od posledního uložení změnilo
  let saving = Promise.resolve();
  function save(){ saving = saving.then(saveNow, saveNow); return saving; }
  async function saveNow(){
    const diff = (list, toRow, map) => {
      const rows = list.map(toRow); const now = new Map(rows.map(r => [r.id, JSON.stringify(r)]));
      return { up: rows.filter(r => map.get(r.id) !== now.get(r.id)), del: [...map.keys()].filter(id => !now.has(id)), now };
    };
    const c = diff(state.children, childToRow, synced.children);
    const i = diff(state.items, itemToRow, synced.items);
    try{
      if (c.up.length){ const r = await supabase.from("children").upsert(c.up); if (r.error) throw r.error; }
      if (i.up.length){ const r = await supabase.from("items").upsert(i.up); if (r.error) throw r.error; }
      if (i.del.length){ const r = await supabase.from("items").delete().in("id", i.del); if (r.error) throw r.error; }
      if (c.del.length){ const r = await supabase.from("children").delete().in("id", c.del); if (r.error) throw r.error; }
      synced = {children: c.now, items: i.now};
    }catch(e){ console.error(e); toast("Uložení se nepovedlo, zkuste to znovu."); }
  }

  // ---------- upozornění (Web Push) ----------
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const pushSupported = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  function keyBytes(b64){ const s = atob((b64 + "=".repeat((4 - b64.length % 4) % 4)).replace(/-/g,"+").replace(/_/g,"/")); return Uint8Array.from(s, c => c.charCodeAt(0)); }
  function deviceName(){ const u = navigator.userAgent; return /iPhone/.test(u)?"iPhone":/iPad/.test(u)?"iPad":/Android/.test(u)?"Android":/Mac/.test(u)?"Mac":/Windows/.test(u)?"Windows":"Zařízení"; }
  async function currentSub(){ const reg = await navigator.serviceWorker.getRegistration("/"); return reg ? reg.pushManager.getSubscription() : null; }
  async function storeSub(sub){
    const j = sub.toJSON();
    const r = await supabase.from("push_subs").upsert({endpoint:j.endpoint, p256dh:j.keys.p256dh, auth:j.keys.auth, device:deviceName()}, {onConflict:"endpoint"});
    if (r.error) throw r.error;
  }
  async function refreshPush(){
    try{
      const k = await fetch("/api/push/key").then(r => r.json()); pushServer = !!k.key;
    }catch{ pushServer = false; }
    if (!pushSupported()){ pushState = isIos && !standalone() ? "ios-install" : "unsupported"; return; }
    if (Notification.permission === "denied"){ pushState = "denied"; return; }
    try{
      const sub = await currentSub();
      if (sub && Notification.permission === "granted"){ pushState = "on"; await storeSub(sub); }
      else pushState = "off";
    }catch(e){ console.error(e); pushState = "off"; }
  }
  async function enablePush(){
    if (!pushSupported()){ go({name:"settings"}); return; }
    busy = true; render();
    try{
      const perm = await Notification.requestPermission();
      if (perm !== "granted"){ pushState = perm === "denied" ? "denied" : "off"; toast("Bez povolení to nepůjde."); return; }
      const { key } = await fetch("/api/push/key").then(r => r.json());
      if (!key){ toast("Upozornění se na serveru ještě nastavují."); return; }
      const reg = await navigator.serviceWorker.register("/sw.js"); await navigator.serviceWorker.ready;
      const old = await reg.pushManager.getSubscription(); if (old) await old.unsubscribe();
      const sub = await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:keyBytes(key)});
      await storeSub(sub); pushState = "on"; toast("Upozornění zapnuta.");
    }catch(e){ console.error(e); toast("Zapnutí se nepovedlo, zkuste to znovu."); }
    finally{ busy = false; render(); }
  }
  async function disablePush(silent){
    try{
      const sub = await currentSub();
      if (sub){ await supabase.from("push_subs").delete().eq("endpoint", sub.endpoint); await sub.unsubscribe(); }
    }catch(e){ console.error(e); }
    pushState = pushSupported() && Notification.permission !== "denied" ? "off" : pushState;
    if (!silent){ toast("Na tomto zařízení vypnuto."); render(); }
  }
  async function testPush(){
    try{
      const r = await fetch("/api/push/test", {method:"POST", headers:{Authorization:"Bearer " + session.access_token}});
      const j = await r.json().catch(() => ({}));
      if (!r.ok){ toast(j.error === "not_configured" ? "Upozornění se na serveru ještě nastavují." : "Zkouška se nepovedla."); return; }
      toast(j.sent ? "Odesláno. Za chvilku by mělo přijít." : "Žádné zařízení nemá upozornění zapnutá.");
    }catch{ toast("Zkouška se nepovedla."); }
  }
  async function saveNotify(patch){
    Object.assign(profile, patch);
    const r = await supabase.from("profiles").update(patch).eq("id", profile.id);
    if (r.error){ console.error(r.error); toast("Uložení se nepovedlo."); } else toast("Uloženo.");
  }

  // ---------- AI ----------
  async function blobToBase64(blob){
    const buf = new Uint8Array(await blob.arrayBuffer()); let s = "";
    for (let k = 0; k < buf.length; k += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(k, k + 0x8000));
    return btoa(s);
  }
  // Zmenší fotku na rozumnou velikost (rychlejší a levnější čtení)
  async function shrinkImage(file){
    try{
      const bmp = await createImageBitmap(file);
      const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
      const c = document.createElement("canvas"); c.width = Math.round(bmp.width*scale); c.height = Math.round(bmp.height*scale);
      c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
      const blob = await new Promise(r => c.toBlob(r, "image/jpeg", 0.85));
      return {media_type:"image/jpeg", data: await blobToBase64(blob)};
    }catch(e){
      if (/^image\/(jpeg|png|webp|gif)$/.test(file.type) && file.size < 3_000_000) return {media_type:file.type, data: await blobToBase64(file)};
      throw Object.assign(new Error("image"), {code:"image_rejected"});
    }
  }
  function kidsForAi(){ return state.children.map(c => ({id:c.id, name:c.name, cls:c.cls||"", school:c.school||""})); }
  // Nadcházející události, ke kterým může nový úkol patřit (např. donést kytku na besídku)
  function eventsForAi(){
    const from = addDays(todayIso(), -1);
    return state.items.filter(i => i.type === "udalost" && i.date && (i.date >= from || (i.repeat === "weekly" && (!i.until || i.until >= from))))
      .sort(byDate).slice(0, 60).map(i => ({id:i.id, title:i.title, date:i.date, childId:i.childId||""}));
  }

  async function extract({text, note, files, source}){
    busy = true; busyText = files?.length ? (files.some(f => isPdf(f)) ? "Čtu PDF…" : "Čtu fotku…") : "Čtu zprávu…"; render();
    try{
      const images = [], pdfs = [], keep = [];
      for (const f of files || []){
        if (isPdf(f)){
          if (f.size > MAX_PDF_BYTES) throw Object.assign(new Error("pdf"), {code:"pdf_big"});
          pdfs.push({data: await blobToBase64(f)}); keep.push({blob:f, type:"application/pdf", name:f.name||"dokument.pdf"});
        } else { const im = await shrinkImage(f); images.push(im); keep.push({blob: base64ToBlob(im.data, im.media_type), type:im.media_type, name:f.name||"fotka"}); }
      }
      const res = await fetch("/api/extract", {method:"POST",
        headers:{"Content-Type":"application/json", Authorization:"Bearer " + session.access_token},
        body: JSON.stringify({text: text||"", note: note||"", images, pdfs, kids: kidsForAi(), events: eventsForAi()})});
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw Object.assign(new Error("api"), {code: out.error || (res.status === 413 ? "too_big" : "failed")});
      const found = out.items || [];
      let sourceId = null;
      if (found.length){
        busyText = "Ukládám zdroj…"; render();
        const kind = pdfs.length ? "pdf" : images.length ? "foto" : /hlas/i.test(source) ? "hlas" : "text";
        sourceId = await createSource({kind, label: source, note: note||"", body: text||"", files: keep});
      }
      busy = false; clearStaged();
      afterExtract(found, source, sourceId);
    }catch(e){
      busy = false;
      const msg = {rate_limited:"Moc požadavků najednou, zkuste to za chvíli.", image_rejected:"Tenhle obrázek se nepodařilo přečíst. Zkuste jinou fotku.",
        refused:"Tuhle zprávu se nepodařilo zpracovat.", pdf_big:"PDF je moc velké. Zkuste screenshot stránky.", too_big:"Soubory jsou moc velké. Zkuste méně fotek.",
        not_allowed:"Čtení přes AI je zatím jen pro pozvané účty.", login:"Přihlášení vypršelo, přihlaste se znovu."}[e?.code];
      toast(msg || "Čtení se nepovedlo, zkuste to znovu."); render();
    }
  }
  // Jen položka, u které si AI ničím nejistá není, se smí uložit bez kontroly
  const certain = i => !!child(i.childId) && !i.uncertain && (i.type !== "udalost" || !!i.date);
  const autoTypes = () => profile?.auto_types || [];
  function toItem(i, source, sourceId, now){
    return {id:i.id || uid(), childId:i.childId, type:i.type, title:(i.title||"").trim()||"Bez názvu", date:i.date||"", time:i.time||"",
      place:i.place||"", note:i.note||"", done:false, createdAt:now, source, repeat:i.repeat||"", until:i.until||"", skip:[],
      parentId:i.parentId||"", sourceId:sourceId||""};
  }
  async function afterExtract(found, source, sourceId){
    if (!found.length){ toast("V té zprávě jsem nic k zapsání nenašel."); render(); return; }
    const list = found.map(x => ({...x, id: x.id || uid(), childId: child(x.childId) ? x.childId : (state.children.length === 1 ? state.children[0].id : "")}));
    const direct = list.filter(i => autoTypes().includes(i.type) && certain(i));
    const rest = list.filter(i => !direct.includes(i));
    if (direct.length){
      const now = Date.now();
      direct.forEach(i => state.items.push(toItem(i, source, sourceId, now)));
      await save();
    }
    if (rest.length){
      startReview(rest, source, null, sourceId);
      if (direct.length) toast(czSaved(direct.length) + " rovnou, zbytek zkontrolujte.");
      return;
    }
    const kid = direct[0].childId;
    toast(czSaved(direct.length) + " bez kontroly.", {label:"Ukázat", fn:()=>go({name:"source", id:sourceId, from:{name:"today"}})});
    go(direct.every(i => i.childId === kid) ? {name:"child", id:kid} : {name:"today"});
  }
  const czSaved = n => n===1 ? "Uložena 1 položka" : n<5 ? "Uloženy " + n + " položky" : "Uloženo " + n + " položek";
  function startReview(list, source, inboxId, sourceId){
    pending = list.map(x => ({...x, id: x.id || uid(), parentId: x.parentId || "", childId: child(x.childId) ? x.childId : (state.children.length === 1 ? state.children[0].id : "")}));
    pendingSource = source; pendingInboxId = inboxId; pendingSourceId = sourceId || null;
    if (!pending.length){ toast("V té zprávě jsem nic k zapsání nenašel."); render(); return; }
    go({name:"review"});
  }

  // ---------- zdroje (původní fotky, PDF, text, e-mail) ----------
  function base64ToBlob(b64, type){
    const bin = atob(b64); const buf = new Uint8Array(bin.length);
    for (let k = 0; k < bin.length; k++) buf[k] = bin.charCodeAt(k);
    return new Blob([buf], {type});
  }
  // Uloží původní zprávu, aby se k ní šlo vrátit. Když to nejde (např. chybí tabulka), pokračuje se bez zdroje.
  async function createSource({kind, label, note, body, files}){
    try{
      const r = await supabase.from("sources").insert({kind, label, note, body: (body||"").slice(0, 60000)}).select("id").single();
      if (r.error || !r.data) { console.warn("source", r.error); return null; }
      const id = r.data.id; const stored = [];
      for (const [k, f] of files.entries()){
        const ext = f.type === "application/pdf" ? "pdf" : (f.type.split("/")[1] || "jpg");
        const path = session.user.id + "/" + id + "/" + (k+1) + "." + ext;
        const up = await supabase.storage.from("sources").upload(path, f.blob, {contentType: f.type});
        if (!up.error) stored.push({path, type:f.type, name:String(f.name).slice(0,120)});
        else console.warn("upload", up.error);
      }
      if (stored.length) await supabase.from("sources").update({files: stored}).eq("id", id);
      return id;
    }catch(e){ console.warn(e); return null; }
  }
  // Zdroj, ze kterého se nakonec nic neuložilo, smažeme i se soubory
  async function dropSourceIfUnused(id){
    if (!id || state.items.some(i => i.sourceId === id)) return;
    try{
      const r = await supabase.from("sources").select("files").eq("id", id).maybeSingle();
      const paths = (r.data?.files || []).map(f => f.path);
      if (paths.length) await supabase.storage.from("sources").remove(paths);
      await supabase.from("sources").delete().eq("id", id);
      sourceCache.delete(id);
    }catch(e){ console.warn(e); }
  }
  async function loadSource(id){
    if (sourceCache.has(id)) return sourceCache.get(id);
    const r = await supabase.from("sources").select("*").eq("id", id).maybeSingle();
    if (r.error || !r.data) return null;
    const src = {...r.data, urls: {}};
    const paths = (src.files || []).map(f => f.path);
    if (paths.length){
      const u = await supabase.storage.from("sources").createSignedUrls(paths, 3600);
      (u.data || []).forEach(x => { if (x.signedUrl) src.urls[x.path] = x.signedUrl; });
    }
    sourceCache.set(id, src);
    setTimeout(() => sourceCache.delete(id), 50 * 60 * 1000); // odkazy platí hodinu
    return src;
  }
  async function dropInbox(id){
    inbox = inbox.filter(b => b.id !== id);
    await supabase.from("inbox").delete().eq("id", id);
  }

  // ---------- soubory ----------
  const isPdf = f => f.type === "application/pdf" || /\.pdf$/i.test(f.name || "");
  function handleFiles(files){
    if (!files.length || busy) return;
    const usable = files.filter(f => isPdf(f) || /^image\//.test(f.type));
    if (!usable.length){ toast("Tenhle typ souboru neumím. Zkuste fotku, screenshot nebo PDF."); return; }
    const pdfCount = staged.filter(x => isPdf(x.file)).length, imgCount = staged.length - pdfCount;
    const pdfs = usable.filter(isPdf).slice(0, Math.max(0, 2 - pdfCount));
    const allImgs = usable.filter(f => !isPdf(f));
    const imgs = allImgs.slice(0, Math.max(0, MAX_IMAGES - imgCount));
    if (allImgs.length > imgs.length) toast("Najednou přečtu nejvýš " + MAX_IMAGES + " fotky.");
    [...pdfs, ...imgs].forEach(file => staged.push({file, url: isPdf(file) ? "" : URL.createObjectURL(file)}));
    if (view.name !== "add") go({name:"add"}); else render();
    setTimeout(() => document.getElementById("stagednote")?.focus({preventScroll:true}), 0);
  }
  function clearStaged(){ staged.forEach(x => x.url && URL.revokeObjectURL(x.url)); staged = []; stagedNote = ""; }
  function readStaged(){
    const files = staged.map(x => x.file); if (!files.length || busy) return;
    const pdfs = files.filter(isPdf), imgs = files.filter(f => !isPdf(f));
    const src = pdfs.length && !imgs.length && pdfs.length === 1 ? "Z PDF · " + pdfs[0].name : files.length > 1 ? "Z " + files.length + " souborů" : "Z fotky";
    extract({files, note: stagedNote.trim(), source: src});
  }
  document.addEventListener("paste", e => {
    if (view.name !== "add" || busy || !session) return;
    const files = [...(e.clipboardData?.files || [])].filter(f => /^image\//.test(f.type));
    if (files.length){ e.preventDefault(); handleFiles(files); }
  });

  // ---------- hlas ----------
  const SR = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  const msgEl = () => document.getElementById("msg");
  function setDraft(v){ draftText = v; const el = msgEl(); if (el) el.value = v; }
  function toggleVoice(){
    if (!SR) return;
    if (recording){ rec?.stop(); return; }
    rec = new SR(); rec.lang = "cs-CZ"; rec.interimResults = true; rec.continuous = true;
    const startText = draftText.trim() ? draftText.trim() + " " : "";
    let finalText = "";
    rec.onresult = ev => {
      let interim = "";
      for (let k = ev.resultIndex; k < ev.results.length; k++){
        const r = ev.results[k]; if (r.isFinal) finalText += r[0].transcript + " "; else interim += r[0].transcript;
      }
      setDraft(startText + finalText + interim);
    };
    rec.onerror = ev => { if (ev.error === "not-allowed" || ev.error === "service-not-allowed") toast("Povolte prosím mikrofon v prohlížeči."); };
    rec.onend = () => {
      recording = false;
      const said = (startText + finalText).trim();
      setDraft(said);
      if (finalText.trim()){ draftText = ""; extract({text: said, source: "Z hlasové zprávy"}); }
      else render();
    };
    try{ rec.start(); recording = true; render(); }catch(e){ toast("Mikrofon se nepodařilo spustit."); }
  }

  // ---------- opakování ----------
  function expand(from, to){
    const out = [];
    for (const it of state.items){
      if (it.repeat === "weekly" && it.date){
        const end = it.until && it.until < to ? it.until : to;
        let d = it.date; let guard = 0;
        while (d < from && guard++ < 520) d = addDays(d, 7);
        while (d <= end && guard++ < 1040){ if (!(it.skip||[]).includes(d)) out.push({...it, date:d, _base:it, _occ:d}); d = addDays(d, 7); }
      } else out.push(it);
    }
    return out;
  }
  const base = it => it._base || it;

  // ---------- přihlášení ----------
  function viewLogin(){
    const em = h("input",{type:"email",id:"login-email",autocomplete:"email",placeholder:"vas@email.cz","aria-label":"E-mail"});
    const send = async () => {
      const v = em.value.trim(); if (!/.+@.+\..+/.test(v)){ em.focus(); toast("Napište e-mail."); return; }
      const { error } = await supabase.auth.signInWithOtp({email:v, options:{emailRedirectTo: location.origin}});
      if (error){ toast(error.status === 429 ? "Odkaz už odešel, zkuste to za minutu." : "Odkaz se nepodařilo poslat."); return; }
      loginSent = v; render();
    };
    const google = () => supabase.auth.signInWithOAuth({provider:"google", options:{redirectTo: location.origin}});
    const root = h("div",{class:"login"}, svg(LOGO),
      h("h1",{}, "Školní i rodinný život", h("br"), "na jednom místě."),
      h("p",{class:"lead muted"}, "Vyfoťte lísteček, přepošlete e-mail nebo to řekněte nahlas. Aloiz zapíše, co kdy a pro koho."));
    if (loginSent){
      root.append(h("div",{class:"card",style:"margin-top:32px"}, h("div",{class:"eyebrow"},"Zkontrolujte e-mail"),
        h("p",{style:"margin:8px 0 0;line-height:1.45"}, "Poslal jsem odkaz na ", h("b",{}, loginSent), ". Klepněte na něj a jste přihlášení."),
        h("button",{class:"btn small",style:"background:transparent;padding:0;margin-top:10px",onclick:()=>{loginSent=""; render();}},"Jiný e-mail")));
      return root;
    }
    root.append(
      h("button",{class:"btn ghost",style:"width:100%;margin-top:36px",onclick:google}, svg(ICON.google), "Pokračovat přes Google"),
      h("div",{class:"or"},"nebo"),
      h("div",{class:"card"}, h("label",{class:"eyebrow",for:"login-email"},"Odkaz na e-mail, bez hesla"), em,
        h("button",{class:"btn primary small",style:"margin-top:14px",onclick:send},"Poslat odkaz")),
      h("p",{class:"note",style:"margin-top:24px;text-align:center"}, h("a",{href:"/soukromi",style:"color:inherit"},"Ochrana soukromí")));
    em.addEventListener("keydown", e => { if (e.key === "Enter") send(); });
    return root;
  }

  // ---------- ruční zadání / úprava ----------
  function newItem(){ return {id:uid(), childId: filter!=="all" ? filter : (state.children.length===1 ? state.children[0].id : ""), type:"udalost", title:"", date:"", time:"", place:"", note:"", repeat:"", until:"", done:false, parentId:"", sourceId:"", _new:true}; }
  // Výběr události, ke které úkol patří (např. donést kytku na besídku)
  function parentField(it, idp, extra=[]){
    const from = addDays(todayIso(), -30), to = addDays(todayIso(), 180);
    const saved = state.items.filter(e => e.type === "udalost" && e.id !== it.id && (e.id === it.parentId ||
      ((!it.childId || e.childId === it.childId) && e.date && (e.repeat === "weekly" ? (!e.until || e.until >= from) : (e.date >= from && e.date <= to))))).sort(byDate);
    const opts = [...extra.filter(e => e.type === "udalost" && e.id !== it.id).map(e => ({id:e.id, label:(e.title||"Nová událost") + (e.date ? " · " + prettyDate(e.date) : "") + " (nová)"})),
      ...saved.map(e => ({id:e.id, label:e.title + " · " + (e.repeat === "weekly" ? "každý týden" : prettyDate(e.date))}))];
    if (!opts.length && !it.parentId) return null;
    return field("Patří k události", h("select",{id:idp,onchange:e=>{it.parentId=e.target.value;}}, h("option",{value:""},"K žádné"),
      opts.map(o => h("option",{value:o.id,selected:o.id===it.parentId}, o.label))), true);
  }
  const field = (lab, el, full) => h("div",{class: full?"full":""}, h("label",{class:"f",for:el.id}, lab), el);
  function viewEdit(v){
    const src = v.item || state.items.find(i => i.id === v.id);
    if (!src) return viewToday();
    if (!v.draft) v.draft = {...src};
    const it = v.draft;
    const fields = h("div",{class:"fields"},
      field("Co", h("input",{type:"text",id:"e-title",value:it.title,placeholder:"např. Divadlo, flétna, souhlas s výletem",oninput:e=>it.title=e.target.value}), true),
      field("Typ", h("select",{id:"e-type",onchange:e=>{it.type=e.target.value; render();}}, Object.entries(TYPES).map(([k,l])=>h("option",{value:k,selected:k===it.type},l)))),
      field("Pro koho", h("select",{id:"e-kid",onchange:e=>{it.childId=e.target.value; render();}}, h("option",{value:""},"Vyberte"), state.children.map(c=>h("option",{value:c.id,selected:c.id===it.childId},c.name)))),
      field(it.type==="udalost"?"Datum":"Do kdy", h("input",{type:"date",id:"e-date",value:it.date,onchange:e=>{ it.date=e.target.value; render(); }})),
      field("Čas", h("input",{type:"time",id:"e-time",value:it.time,onchange:e=>{ it.time=e.target.value; if (it.remind && it.remind !== "off") it.remind = ""; render(); }})),
      field("Místo", h("input",{type:"text",id:"e-place",value:it.place,oninput:e=>it.place=e.target.value}), true),
      field("Opakování", h("select",{id:"e-rep",onchange:e=>{it.repeat=e.target.value; render();}}, h("option",{value:""},"Neopakovat"), h("option",{value:"weekly",selected:it.repeat==="weekly"},"Každý týden"))),
      it.repeat ? field("Opakovat do", h("input",{type:"date",id:"e-until",value:it.until||"",onchange:e=>it.until=e.target.value})) : h("div"),
      it.date ? field("Upozornění", h("select",{id:"e-remind",onchange:e=>it.remind=e.target.value}, remindOptions(it)), true) : null,
      isTask(it) ? parentField(it, "e-parent") : null,
      field("Poznámka", h("textarea",{id:"e-note",style:"min-height:64px",oninput:e=>it.note=e.target.value}, it.note||""), true));
    const del = h("div",{style:"margin-top:18px"});
    const askDel = () => { del.replaceChildren(
      h("span",{class:"note",style:"margin-right:10px"}, src.repeat ? "Smazat celou opakovanou akci?" : "Opravdu smazat?"),
      h("button",{class:"btn ghost small danger",onclick:()=>{ state.items = state.items.filter(i=>i.id!==src.id); save(); toast("Smazáno."); back(); }},"Smazat"),
      v.occ ? h("button",{class:"btn ghost small",style:"margin-left:6px",onclick:()=>{ src.skip = [...(src.skip||[]), v.occ]; save(); toast("Tento termín vynechán."); back(); }},"Jen "+prettyDate(v.occ).toLowerCase()) : null,
      h("button",{class:"btn small",style:"background:transparent",onclick:()=>del.replaceChildren(delBtn())},"Ne")); };
    const delBtn = () => h("button",{class:"btn ghost small danger",onclick:askDel},"Smazat položku");
    if (!src._new) del.append(delBtn());
    return h("div",{}, header(h("button",{class:"iconbtn bare","aria-label":"Zpět",onclick:back}, svg(ICON.back)), h("span")),
      h("h1",{class:"h",style:"margin-top:12px"}, src._new ? "Nová položka" : "Upravit"),
      h("div",{class:"card",style:"margin-top:20px"}, fields,
        it.source ? h("div",{class:"srcline"}, h("span",{class:"tag"}, "Zdroj: " + it.source),
          it.sourceId ? h("button",{class:"btn ghost small",onclick:()=>go({name:"source", id:it.sourceId, from:view})}, svg(ICON.file), "Zobrazit zdroj") : null) : null),
      del);
  }
  function saveEdit(){
    const it = view.draft; if (!it) return;
    if (!it.title.trim()){ toast("Napište, co to je."); document.getElementById("e-title")?.focus(); return; }
    if (!it.childId){ toast("Vyberte, pro koho to je."); return; }
    const clean = {...it, title: it.title.trim()}; if (!isTask(clean)) clean.parentId = ""; delete clean._new; delete clean._base; delete clean._occ;
    const idx = state.items.findIndex(i => i.id === clean.id);
    if (idx >= 0) state.items[idx] = {...state.items[idx], ...clean};
    else state.items.push({...clean, createdAt: Date.now(), source: "Ručně"});
    save(); toast("Uloženo.");
    go(["add","edit","review"].includes(prevView.name) ? {name:"today"} : prevView);
  }
  function back(){ go(["edit","source"].includes(prevView.name) ? {name:"today"} : prevView); }
  function openEdit(it){ prevView = view; go({name:"edit", id: base(it).id, occ: it._occ}); }

  // ---------- kalendář ----------
  function viewCalendar(v){
    const t = todayIso();
    const month = v.month || t.slice(0,7); const sel = v.sel || (t.startsWith(month) ? t : month + "-01");
    const first = month + "-01"; const fd = new Date(first+"T12:00:00");
    const start = addDays(first, -((fd.getDay()+6)%7));
    const occ = expand(start, addDays(start, 41)).filter(i => i.date && (filter==="all" || i.childId===filter));
    const grid = h("div",{class:"month",role:"grid","aria-label":"Měsíc"});
    ["Po","Út","St","Čt","Pá","So","Ne"].forEach(x => grid.append(h("div",{class:"wd"},x)));
    for (let k=0;k<42;k++){
      const ds = addDays(start,k); const dd = new Date(ds+"T12:00:00");
      const here = occ.filter(i => i.date === ds);
      const dots = h("span",{class:"dots"}); [...new Set(here.map(i=>child(i.childId)?.color||"#999"))].slice(0,4).forEach(col => dots.append(h("i",{style:"background:"+col})));
      grid.append(h("button",{class:(ds.slice(0,7)!==month?"out ":"")+(ds===t?"today":""),"aria-pressed":String(ds===sel),"aria-label":prettyDate(ds)+(here.length?", "+here.length+" položky":""),
        onclick:()=>go({name:"calendar", month, sel: ds})}, h("span",{}, dd.getDate()), dots));
    }
    const mIdx = Number(month.slice(5,7))-1; const year = month.slice(0,4);
    const shift = n => { const d = new Date(first+"T12:00:00"); d.setMonth(d.getMonth()+n); const m = iso(d).slice(0,7); return {name:"calendar", month:m, sel: m===t.slice(0,7)?t:m+"-01"}; };
    const dayList = occ.filter(i => i.date === sel).sort(byTime);
    const sec = h("section",{class:"sec"}, h("div",{class:"eyebrow"}, prettyDate(sel)));
    if (!dayList.length) sec.append(h("p",{class:"empty",style:"padding:12px 0"},"V tento den nic."));
    renderList(sec, dayList, {showChild: state.children.length>1});
    sec.append(h("button",{class:"btn ghost small",style:"margin-top:12px",onclick:()=>{ prevView = view; const n = newItem(); n.date = sel; go({name:"edit", item:n}); }}, "Přidat na tento den"));
    return h("div",{}, header(backBtn(), h("button",{class:"btn ghost small",onclick:()=>go({name:"settings"})}, svg(ICON.cal), "Do telefonu")),
      h("div",{class:"monthnav"},
        h("button",{class:"iconbtn bare","aria-label":"Předchozí měsíc",onclick:()=>go(shift(-1))}, svg(ICON.back)),
        h("h1",{style:"font-size:28px"}, MONTHS[mIdx][0].toUpperCase()+MONTHS[mIdx].slice(1)+" "+year),
        h("button",{class:"iconbtn bare","aria-label":"Další měsíc",onclick:()=>go(shift(1))}, svg(ICON.next))),
      childChips(), grid, sec);
  }
  function childChips(){
    if (state.children.length < 2) return null;
    return h("div",{class:"chips",role:"group","aria-label":"Členové rodiny"},
      h("button",{class:"chip","aria-pressed":String(filter==="all"),onclick:()=>{filter="all";render();}},"Všichni"),
      state.children.map(c => h("button",{class:"chip","aria-pressed":String(filter===c.id),onclick:()=>{filter=c.id;render();}},
        h("span",{class:"dot",style:"background:"+c.color}), c.name)));
  }
  async function copyText(text, okMsg){
    try{ await navigator.clipboard.writeText(text); toast(okMsg); }
    catch(e){ prevView = view; go({name:"copy", text}); }
  }
  function copyList(c){
    const t = todayIso();
    const mine = expand(t, addDays(t,14)).filter(i => i.childId===c.id && !doneTask(i) && (!i.date || i.date >= t)).sort(byDate);
    const text = c.name + " – co nás čeká:\n" + mine.map(i => "• " + (i.date?prettyDate(i.date)+(i.time?" "+i.time:"")+": ":"") + (i.type==="donest"?"donést ":"") + i.title + (i.place?" ("+i.place+")":"")).join("\n");
    copyText(text, "Zkopírováno, můžete to poslat.");
  }

  // ---------- navigace ----------
  function go(v){ view = v; render(); window.scrollTo(0,0); }
  const header = (left, right) => h("div",{class:"top"}, left, right);
  function backBtn(label="Zpět"){ return h("button",{class:"iconbtn bare","aria-label":label,onclick:()=>go({name:"today"})}, svg(label==="Zavřít"?ICON.close:ICON.back)); }

  // ---------- obrazovky ----------
  function itemRow(it, {showChild=true, showDate=false, nested=false}={}){
    const c = child(it.childId);
    const task = isTask(it);
    const sub = h("div",{class:"sub"},
      c && showChild ? [h("span",{class:"dot",style:"width:6px;height:6px;background:"+c.color}), c.name] : null,
      showDate ? (c&&showChild?" · ":"") + (nested && it.date ? "do " + prettyDate(it.date).toLowerCase() : prettyDate(it.date)) : null,
      (c&&showChild)||showDate ? " · " : "", TYPES[it.type].toLowerCase(),
      it.place ? " · " + it.place : "");
    if (it.repeat === "weekly") sub.append(" · každý týden");
    const body = h("div",{style:"flex:1;min-width:0"}, h("button",{class:"ttl linkbtn","aria-label":"Upravit: "+it.title,onclick:()=>openEdit(it)}, it.title), sub);
    const row = h("div",{class:"row"+(it.done?" done":"")+(nested?" nested":"")}, nested ? h("div",{class:"time","aria-hidden":"true"}, "↳") : h("div",{class:"time"}, it.time || "—"), body);
    if (task){
      const b = h("button",{class:"check","aria-label": it.done?"Označit jako nehotové":"Hotovo","aria-pressed":String(!!it.done),
        onclick:()=>{ const b = base(it); b.done = !b.done; save(); render();
          if (b.done && view.name !== "done") toast("Přesunuto do Hotovo.", {label:"Vrátit", fn:()=>{ b.done = false; save(); render(); }}); }});
      const s = h("span"); if (it.done) s.append(svg(ICON.tick)); b.append(s); row.append(b);
    }
    return row;
  }
  // Úkoly, které patří k události (např. donést kytku na besídku), se ukážou hned pod ní.
  // pool: odkud brát úkoly; vrací mapu událost -> úkoly a množinu už zobrazených úkolů.
  function linkTasks(events, pool){
    const map = new Map(), used = new Set();
    for (const ev of events){
      const b = base(ev); const list = [];
      for (const t of pool){
        if (used.has(t) || !t.parentId || t.parentId !== b.id || doneTask(t)) continue;
        if (b.repeat === "weekly" && t.date && t.date !== ev.date) continue;
        list.push(t); used.add(t);
      }
      if (list.length) map.set(ev, list.sort(byDate));
    }
    return {map, used};
  }
  function renderList(container, list, opts={}, pool=list){
    const events = list.filter(i => !isTask(i));
    const {map, used} = linkTasks(events, pool);
    list.forEach(i => {
      if (used.has(i)) return;
      container.append(itemRow(i, opts));
      (map.get(i) || []).forEach(t => container.append(itemRow(t, {...opts, showChild:false, showDate: !!t.date && t.date !== i.date, nested:true})));
    });
    return used;
  }
  function doneLink(memberId){
    const n = state.items.filter(i => doneTask(i) && (!memberId || i.childId === memberId)).length;
    if (!n) return null;
    return h("button",{class:"donelink",onclick:()=>{ prevView = view; go({name:"done", member: memberId || ""}); }},
      h("span",{class:"check",style:"margin:0;width:auto;height:auto","aria-hidden":"true"}, h("span",{style:"background:var(--rasp-btn);border-color:var(--rasp-btn)"}, svg(ICON.tick))),
      "Hotovo", h("span",{class:"muted"}, String(n)), svg(ICON.next));
  }

  function inboxCards(){
    return inbox.map(b => h("section",{class:"inboxcard"},
      h("div",{class:"eyebrow",style:"display:flex;gap:8px;align-items:center"}, svg(ICON.mail), "Přeposlaný e-mail"),
      h("div",{class:"ttl",style:"margin-top:8px"}, b.source.replace(/^E-mail: /,"")),
      h("div",{class:"sub"}, "Našel jsem " + czFound((b.items||[]).length) + " Nic se nezapíše bez vás."),
      h("div",{style:"display:flex;gap:8px;margin-top:12px"},
        h("button",{class:"btn primary small",onclick:()=>startReview(b.items||[], b.source, b.id, b.source_id)},"Zkontrolovat"),
        h("button",{class:"btn small",style:"background:transparent",onclick:async()=>{ await dropInbox(b.id); await dropSourceIfUnused(b.source_id); render(); }},"Zahodit"))));
  }

  function viewToday(){
    const t = todayIso(); const d = new Date();
    const vis = expand(addDays(t,-60), addDays(t,14)).filter(i => (filter==="all" || i.childId===filter) && !doneTask(i));
    const tm = addDays(t,1);
    const prep = vis.filter(i => i.date === tm && i.type !== "udalost" && !i.done);
    const today = vis.filter(i => i.date === t).sort(byTime);
    const soon = vis.filter(i => i.date > t && i.date <= addDays(t,14) && !prep.includes(i)).sort(byDate);
    const nodate = vis.filter(i => !i.date && !i.done);
    const overdue = vis.filter(i => i.date && i.date < t && i.type!=="udalost" && !i.done);
    const openToday = today.filter(i => !i.done).length;
    const tomorrow = vis.filter(i => i.date === tm).length;
    const right = h("div",{style:"display:flex;gap:8px"},
      h("button",{class:"iconbtn","aria-label":"Kalendář",onclick:()=>go({name:"calendar"})}, svg(ICON.cal)),
      h("button",{class:"iconbtn","aria-label":"Rodina a nastavení",onclick:()=>go({name:"settings"})}, svg(ICON.user)));
    const lead = !state.children.length ? "Začněte tím, že přidáte členy rodiny." :
      (openToday || tomorrow) ? `Dnes ${czCount(openToday)}, zítra ${czCount(tomorrow)}.` : "Dnes i zítra máte volno.";
    const root = h("div",{},
      header(svg(LOGO), right),
      h("section",{style:"margin-top:32px"},
        h("div",{class:"muted",style:"font-size:14px"}, DAYS[d.getDay()] + " · " + MONTHS[d.getMonth()]),
        h("h1",{class:"big",style:"margin-top:6px"}, d.getDate()+"."),
        h("p",{class:"lead"}, lead)));
    if (!state.children.length){
      root.append(h("div",{class:"card sec"}, h("div",{class:"eyebrow"},"První krok"),
        h("p",{style:"margin:8px 0 14px;line-height:1.45"},"Přidejte děti, sebe i další členy rodiny, aby Aloiz věděl, komu co patří. Stačí jméno, u dětí pomůže třída."),
        h("button",{class:"btn primary small",onclick:()=>go({name:"settings"})},"Přidat člena rodiny")));
      return root;
    }
    root.append(...inboxCards());
    const ph = pushHint(); if (ph) root.append(ph);
    const cc = childChips(); if (cc) root.append(cc);
    root.append(h("div",{class:"chips",style:"margin-top:12px"}, state.children.map(c =>
      h("button",{class:"chip",onclick:()=>go({name:"child",id:c.id})}, h("span",{class:"dot",style:"background:"+c.color}), "Přehled: "+c.name))));
    if (prep.length){ const p = h("section",{class:"prep"}, h("div",{class:"eyebrow"},"Připravit na zítra"));
      prep.forEach(i => p.append(itemRow(i,{showChild: state.children.length>1}))); root.append(p); }
    if (overdue.length) root.append(group("Po termínu", overdue, true));
    root.append(group("Dnes", today, false, "Na dnešek nic nemáte."));
    if (soon.length) groupByDate(soon).forEach(([dt, list]) => root.append(group(prettyDate(dt), list)));
    if (nodate.length) root.append(group("Bez termínu", nodate));
    const dl = doneLink(filter==="all" ? "" : filter); if (dl) root.append(h("div",{class:"sec"}, dl));
    if (!state.items.length) root.append(h("p",{class:"empty"},"Zatím tu nic není. Klepněte na „Přidat ze školy“ a vyfoťte lísteček, vložte text e-mailu nebo to řekněte nahlas."));
    return root;
  }
  const czCount = n => n===0?"nic":n===1?"jedna věc":n<5?n+" věci":n+" věcí";
  const czFound = n => n===1?"jednu věc.":n<5?n+" věci.":n+" věcí.";
  const byTime = (a,b) => (a.time||"99").localeCompare(b.time||"99");
  const byDate = (a,b) => (a.date+(a.time||"99")).localeCompare(b.date+(b.time||"99"));
  function groupByDate(list){ const m = new Map(); list.forEach(i => { if(!m.has(i.date)) m.set(i.date,[]); m.get(i.date).push(i); }); return [...m.entries()]; }
  function group(title, list, showDate=false, emptyText){
    const s = h("section",{class:"sec"}, h("div",{class:"eyebrow",style:"padding-bottom:4px"}, title));
    if (!list.length && emptyText) s.append(h("p",{class:"empty",style:"padding:12px 0"}, emptyText));
    renderList(s, list, {showChild: filter==="all" && state.children.length>1, showDate});
    return s;
  }

  function viewAdd(){
    const root = h("div",{}, header(svg(LOGO), backBtn("Zavřít")),
      h("section",{style:"margin-top:28px"}, h("h1",{class:"h"},"Co přišlo", h("br"), "ze školy?")));
    if (!state.children.length){ root.append(h("p",{class:"empty"},"Nejdřív v nastavení přidejte členy rodiny.")); return root; }
    const onPick = e => { const files = [...(e.target.files||[])]; e.target.value = ""; handleFiles(files); };
    const t1 = h("label",{class:"tile"}, svg(ICON.cam), h("div",{}, h("b",{},"Vyfotit"), h("small",{}, staged.length ? "přidat další" : "lísteček, nástěnka")),
      h("input",{type:"file",accept:"image/*",capture:"environment","aria-label":"Vyfotit",onchange:onPick}));
    const t2 = h("label",{class:"tile"}, svg(ICON.file), h("div",{}, h("b",{},"Soubor"), h("small",{},"PDF, screenshoty, víc fotek")),
      h("input",{type:"file",multiple:true,accept:"application/pdf,.pdf,image/*","aria-label":"Nahrát soubor",onchange:onPick}));
    root.append(h("div",{class:"grid2",style:"margin-top:24px"}, t1, t2));
    if (staged.length){
      const thumbs = h("div",{class:"thumbs"}, staged.map((x, k) => h("div",{class:"thumb"},
        x.url ? h("img",{src:x.url,alt:""}) : h("div",{class:"pdf"}, svg(ICON.file), h("small",{}, x.file.name || "PDF")),
        h("button",{class:"x","aria-label":"Odebrat soubor",disabled:busy,onclick:()=>{ const [y] = staged.splice(k,1); if (y.url) URL.revokeObjectURL(y.url); render(); }}, svg(ICON.close)))));
      const nt = h("textarea",{id:"stagednote",style:"min-height:64px",placeholder:"Nepovinné. Např.: Týká se jen Emy. Výlet platí pro 3.B. Peníze už jsme dali.",
        oninput:e=>stagedNote=e.target.value}, stagedNote);
      root.append(h("div",{class:"card staged",style:"margin-top:10px"},
        h("div",{class:"eyebrow"}, staged.length === 1 ? "Připraveno ke čtení" : "Připraveno ke čtení · " + staged.length + " soubory"),
        thumbs,
        h("label",{class:"f",for:"stagednote",style:"margin-top:16px"},"Vaše poznámka pro Aloiz"), nt,
        h("div",{style:"display:flex;gap:8px;margin-top:14px"},
          h("button",{class:"btn primary small",disabled:busy,onclick:readStaged},"Přečíst"),
          h("button",{class:"btn small",style:"background:transparent",disabled:busy,onclick:()=>{ clearStaged(); render(); }},"Zrušit"))));
    }

    const ta = h("textarea",{id:"msg",placeholder:"Vložte text e-mailu nebo napište: Ema zítra flétna, ve čtvrtek 150 Kč na divadlo",oninput:e=>draftText=e.target.value}, draftText);
    const card = h("div",{class:"card",style:"margin-top:10px"},
      h("label",{for:"msg",class:"eyebrow"},"Napsat nebo vložit"), ta,
      h("button",{class:"btn primary small",style:"margin-top:14px",disabled:busy,onclick:()=>{ const v = ta.value.trim(); if(!v){ ta.focus(); return; } draftText = ""; extract({text:v, source:"Z textu"}); }},"Přečíst"));
    root.append(card);

    if (SR){
      root.append(h("div",{class:"voice"},
        h("button",{class:"mic","aria-label":recording?"Zastavit nahrávání":"Namluvit hlasovou zprávu","aria-pressed":String(recording),disabled:busy&&!recording,onclick:toggleVoice}, svg(ICON.mic)),
        h("div",{style:"font-size:16px;font-weight:500"}, recording ? "Poslouchám… klepněte pro konec" : "Klepněte a mluvte"),
        h("div",{class:"muted",style:"font-size:14px;max-width:260px;line-height:1.4"}, "„Kuba má ve středu v deset zubaře“")));
    } else {
      root.append(h("p",{class:"note",style:"margin:10px 0 0;display:flex;gap:8px;align-items:flex-start"}, svg(ICON.mic),
        "Chcete mluvit? Klepněte do pole a na klávesnici použijte mikrofon. Aloiz pak z věty vytáhne co, kdy a pro koho."));
    }
    root.append(h("button",{class:"btn ghost",style:"width:100%;margin-top:10px",onclick:()=>{ prevView = view; go({name:"edit", item:newItem()}); }}, svg(ICON.pen), "Zadat ručně bez AI"));
    if (busy) root.append(h("div",{class:"status",role:"status"}, h("span",{class:"spin"}), busyText));
    if (inboundAddress){
      root.append(h("div",{class:"card",style:"margin-top:10px"},
        h("div",{class:"eyebrow"},"Přeposlat e-mail ze školy"),
        h("p",{class:"note",style:"margin:8px 0 0"},"Přepošlete ho na ", h("span",{class:"addr"}, inboundAddress),
          ". Za chvilku se tu objeví ke kontrole. Posílejte z adresy, kterou máte v Aloiz (", profile?.email || "váš e-mail", ")."),
        h("button",{class:"btn ghost small",style:"margin-top:12px",onclick:()=>copyText(inboundAddress,"Adresa zkopírována.")},"Zkopírovat adresu")));
    }
    root.append(h("p",{class:"note",style:"margin-top:10px"},"Na počítači můžete screenshot rovnou vložit klávesami Ctrl+V (Cmd+V)."));
    return root;
  }

  function viewReview(){
    const root = h("div",{}, header(h("div",{style:"display:flex;align-items:center;gap:6px;min-width:0"}, backBtn(), h("span",{class:"muted",style:"font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"}, pendingSource)), h("span")),
      h("section",{style:"margin-top:16px"}, h("h1",{class:"h"}, "Našel jsem", h("br"), czFound(pending.length)),
        h("p",{class:"muted",style:"font-size:15px;line-height:1.45;margin:10px 0 0"},"Zkontrolujte je a uložte. Nic se nezapíše bez vás."),
        pendingSourceId ? h("button",{class:"btn ghost small",style:"margin-top:12px",onclick:()=>go({name:"source", id:pendingSourceId, from:{name:"review"}})}, svg(ICON.file), "Zobrazit zdroj") : null));
    const list = h("div",{class:"stack",style:"margin-top:20px"});
    pending.forEach((it, idx) => {
      const warn = it.uncertain || !it.childId || (!it.date && it.type==="udalost");
      const c = child(it.childId);
      list.append(h("article",{class:"card"+(warn?" warncard":"")},
        h("div",{style:"display:flex;justify-content:space-between;align-items:center"},
          h("span",{class:"pill"}, TYPES[it.type]),
          h("div",{style:"display:flex;align-items:center;gap:8px;font-size:13px"}, c ? [h("span",{class:"dot",style:"background:"+c.color}), c.name] : null,
            h("button",{class:"iconbtn bare","aria-label":"Odebrat položku",style:"width:36px;height:36px",onclick:()=>{pending.splice(idx,1); if(!pending.length) discardPending(); else render();}}, svg(ICON.close)))),
        h("div",{class:"fields"},
          field("Co", h("input",{type:"text",id:"t"+it.id,value:it.title,oninput:e=>it.title=e.target.value}), true),
          field("Typ", h("select",{id:"y"+it.id,onchange:e=>{it.type=e.target.value; render();}}, Object.entries(TYPES).map(([k,v])=>h("option",{value:k,selected:k===it.type},v)))),
          field("Pro koho", h("select",{id:"c"+it.id,onchange:e=>{it.childId=e.target.value; render();}}, h("option",{value:""},"Vyberte"), state.children.map(c=>h("option",{value:c.id,selected:c.id===it.childId},c.name)))),
          field(it.type==="udalost"?"Datum":"Do kdy", h("input",{type:"date",id:"d"+it.id,value:it.date,onchange:e=>it.date=e.target.value})),
          field("Čas", h("input",{type:"time",id:"h"+it.id,value:it.time,onchange:e=>it.time=e.target.value})),
          field("Místo", h("input",{type:"text",id:"p"+it.id,value:it.place,oninput:e=>it.place=e.target.value}), true),
          field("Opakování", h("select",{id:"r"+it.id,onchange:e=>{it.repeat=e.target.value;}}, h("option",{value:""},"Neopakovat"), h("option",{value:"weekly",selected:it.repeat==="weekly"},"Každý týden"))),
          field("Do", h("input",{type:"date",id:"u"+it.id,value:it.until||"",onchange:e=>it.until=e.target.value})),
          isTask(it) ? parentField(it, "g"+it.id, pending) : null),
        it.note ? h("p",{class:"note",style:"margin:10px 0 0"}, it.note) : null,
        warn ? h("div",{class:"warntext"}, it.uncertain || (!it.childId ? "Nevím, pro koho to je. Vyberete?" : "Chybí datum. Doplníte?")) : null));
    });
    root.append(list);
    return root;
  }
  async function discardPending(){
    if (pendingInboxId) await dropInbox(pendingInboxId);
    const sid = pendingSourceId;
    pending = []; pendingInboxId = null; pendingSourceId = null;
    dropSourceIfUnused(sid);
    go(view.name === "review" && pendingSource.startsWith("E-mail") ? {name:"today"} : {name:"add"});
  }
  async function savePending(){
    if (pending.some(i => !i.childId)){ toast("U každé položky vyberte, pro koho je."); return; }
    const now = Date.now();
    pending.forEach(i => state.items.push(toItem(i, pendingSource, pendingSourceId, now)));
    const n = pending.length; const kid = pending[0].childId; const same = pending.every(i => i.childId === kid);
    pending = []; pendingSourceId = null; await save();
    if (pendingInboxId){ await dropInbox(pendingInboxId); pendingInboxId = null; }
    toast(n===1?"Uloženo.":"Uloženo, "+n+" položky."); go(same ? {name:"child",id:kid} : {name:"today"});
  }

  function viewChild(id){
    const c = child(id); if (!c) return viewToday();
    const t = todayIso(); const d = new Date(t+"T12:00:00"); const mon = addDays(t, -((d.getDay()+6)%7));
    const mine = expand(addDays(t,-60), addDays(t,60)).filter(i => i.childId === id);
    const week = h("div",{class:"card week",role:"group","aria-label":"Tento týden"});
    for (let k=0;k<7;k++){ const ds = addDays(mon,k); const dd = new Date(ds+"T12:00:00"); const cnt = mine.filter(i=>i.date===ds && !doneTask(i)).length;
      const dots = h("div",{class:"dots"}); for (let j=0;j<Math.min(cnt,3);j++) dots.append(h("i",{style:"background:"+c.color}));
      week.append(h("div",{}, h("div",{class:"d"},DAYS_S[dd.getDay()]), h("div",{class:"n"+(ds===t?" today":"")}, dd.getDate()), dots)); }
    const events = mine.filter(i => i.type==="udalost" && (!i.date || i.date >= t) && (!i.date || i.date <= addDays(t,21))).sort(byDate);
    const tasks = mine.filter(i => isTask(i) && !i.done).sort((a,b)=> (a.date||"9").localeCompare(b.date||"9"));
    const root = h("div",{}, header(backBtn(), h("span",{class:"muted",style:"font-size:14px"}, [c.cls, c.school].filter(Boolean).join(" · "))),
      h("section",{style:"margin-top:12px;display:flex;align-items:center;gap:14px"}, h("span",{class:"dot",style:"width:14px;height:14px;border-radius:7px;background:"+c.color}), h("h1",{style:"font-size:48px;line-height:1"}, c.name)),
      week);
    const ev = h("section",{class:"sec"}, h("div",{class:"eyebrow"},"Co čeká v příštích 3 týdnech"));
    if (!events.length) ev.append(h("p",{class:"empty",style:"padding:12px 0"},"Žádné akce v kalendáři."));
    const used = renderList(ev, events, {showChild:false, showDate:true}, tasks);
    const rest = tasks.filter(i => !used.has(i));
    const tk = h("section",{class:"sec"}, h("div",{class:"eyebrow"}, used.size ? "Další úkoly a donést" : "Úkoly a donést"));
    if (!rest.length) tk.append(h("p",{class:"empty",style:"padding:12px 0"}, used.size ? "Všechno ostatní je u akcí výše." : "Nic k udělání ani donesení."));
    rest.forEach(i => tk.append(itemRow(i,{showChild:false, showDate:true})));
    const dl = doneLink(id);
    root.append(ev, tk, ...(dl ? [h("div",{class:"sec"}, dl)] : []),
      h("div",{class:"sec",style:"display:flex;gap:8px;flex-wrap:wrap"},
        h("button",{class:"btn ghost small",onclick:()=>copyList(c)},"Zkopírovat přehled pro druhého rodiče"),
        h("button",{class:"btn ghost small",onclick:()=>{ filter = id; go({name:"calendar"}); }},"Kalendář")));
    return root;
  }

  function viewSettings(){
    const root = h("div",{}, header(backBtn(), h("span")), h("h1",{class:"h",style:"margin-top:16px"},"Rodina"),
      h("p",{class:"note",style:"margin:8px 0 0"},"Děti, vy i další členové rodiny. Každý má svou barvu."));
    const list = h("div",{class:"stack",style:"margin-top:20px"});
    state.children.forEach(c => {
      const nm = h("input",{type:"text",id:"n"+c.id,value:c.name,onchange:e=>{c.name=e.target.value.trim()||c.name; save(); render();}});
      const cl = h("input",{type:"text",id:"k"+c.id,value:c.cls||"",placeholder:"u dětí, např. 3.B",onchange:e=>{c.cls=e.target.value.trim(); save();}});
      const sc = h("input",{type:"text",id:"s"+c.id,value:c.school||"",placeholder:"nepovinné",onchange:e=>{c.school=e.target.value.trim(); save();}});
      list.append(h("div",{class:"card"},
        h("div",{class:"fields"}, h("div",{class:"full"}, h("label",{class:"f",for:nm.id},"Jméno"), nm),
          h("div",{}, h("label",{class:"f",for:cl.id},"Třída"), cl), h("div",{}, h("label",{class:"f",for:sc.id},"Škola nebo práce"), sc)),
        h("div",{class:"f"},"Barva"),
        h("div",{class:"swatches",role:"group","aria-label":"Barva"}, COLORS.map(col => h("button",{class:"sw","aria-label":"Barva","aria-pressed":String(c.color===col),style:"background:"+col,onclick:()=>{c.color=col; save(); render();}}))),
        h("div",{style:"margin-top:14px"}, confirmDelete(c))));
    });
    const nn = h("input",{type:"text",id:"newname",placeholder:"Jméno, třeba Ema nebo Já"});
    list.append(h("div",{class:"card"}, h("label",{class:"eyebrow",for:"newname"},"Přidat člena rodiny"), nn,
      h("button",{class:"btn primary small",style:"margin-top:14px",onclick:()=>{ const v = nn.value.trim(); if(!v){nn.focus();return;}
        const used = state.children.map(c=>c.color); const color = COLORS.find(x=>!used.includes(x)) || COLORS[0];
        state.children.push({id:uid(), name:v, cls:"", school:"", color}); save(); render(); toast("Přidáno: "+v); }},"Přidat")));
    root.append(list);

    // Co se ukládá bez kontroly
    if (profile){
      const types = autoTypes();
      const setType = async (k, on) => {
        const next = on ? [...new Set([...types, k])] : types.filter(x => x !== k);
        const r = await supabase.from("profiles").update({auto_types: next}).eq("id", profile.id);
        if (r.error){ toast("Uložení se nepovedlo. Spustili jste nový SQL soubor?"); render(); return; }
        profile.auto_types = next; toast("Uloženo."); render();
      };
      const opt = (k, label, hint) => h("label",{class:"opt"},
        h("input",{type:"checkbox",checked:types.includes(k),onchange:e=>setType(k, e.target.checked)}),
        h("span",{}, h("b",{}, label), h("small",{}, hint)));
      root.append(h("section",{class:"sec"}, h("div",{class:"eyebrow"},"Ukládat rovnou, bez kontroly"),
        h("div",{class:"card",style:"margin-top:10px"},
          h("p",{class:"note",style:"margin:0 0 4px"},"Zaškrtnuté druhy se z fotek, textu, hlasu i přeposlaných e-mailů uloží samy. Ostatní vám Aloiz nejdřív ukáže ke kontrole."),
          opt("udalost","Události","akce, kroužky, schůzky"),
          opt("ukol","Úkoly","podepsat, vyplnit, zaplatit"),
          opt("donest","Donést","věci a peníze s sebou"),
          h("p",{class:"note",style:"margin:10px 0 0"},"Když si Aloiz není jistý (chybí datum nebo neví, pro koho to je), ukáže položku ke kontrole vždy. U každé položky najdete odkaz na původní fotku, e-mail nebo text."))));
    }

    if (profile) root.append(notifySection());

    // Kalendář v telefonu
    if (profile?.feed_token){
      const feed = location.origin + "/api/calendar/" + profile.feed_token + ".ics";
      const webcal = feed.replace(/^https?:/, "webcal:");
      root.append(h("section",{class:"sec"}, h("div",{class:"eyebrow"},"Kalendář v telefonu"),
        h("div",{class:"card",style:"margin-top:10px"},
          h("p",{class:"note",style:"margin:0"},"Přihlaste se k odběru a všechno z Aloiz se samo objeví ve vašem kalendáři, i s připomínkou. Odkaz je tajný, nesdílejte ho veřejně."),
          h("div",{class:"links"},
            h("a",{href:"https://calendar.google.com/calendar/r?cid=" + encodeURIComponent(webcal),target:"_blank",rel:"noopener"},"Google kalendář"),
            h("a",{href:webcal},"iPhone a Mac"),
            h("a",{href:"https://outlook.live.com/calendar/0/addfromweb?url=" + encodeURIComponent(feed) + "&name=Aloiz",target:"_blank",rel:"noopener"},"Outlook"),
            h("button",{onclick:()=>copyText(feed,"Odkaz zkopírován.")},"Zkopírovat odkaz")))));
    }

    // Přeposílání e-mailů
    if (inboundAddress && profile){
      const extra = h("input",{type:"text",id:"senders",value:(profile.sender_emails||[]).join(", "),placeholder:"např. pracovni@firma.cz"});
      root.append(h("section",{class:"sec"}, h("div",{class:"eyebrow"},"Přeposílání e-mailů"),
        h("div",{class:"card",style:"margin-top:10px"},
          h("p",{class:"note",style:"margin:0"},"Adresa pro přeposlání: ", h("span",{class:"addr"}, inboundAddress)),
          h("p",{class:"note"},"Aloiz pozná, že jde o vás, podle adresy odesílatele: ", h("b",{}, profile.email || ""), ". Posíláte-li i z jiné schránky, napište ji sem."),
          h("label",{class:"f",for:"senders"},"Další moje adresy (oddělené čárkou)"), extra,
          h("button",{class:"btn ghost small",style:"margin-top:12px",onclick:async()=>{
            const list = extra.value.split(/[,;\s]+/).map(s=>s.trim().toLowerCase()).filter(s=>/.+@.+\..+/.test(s));
            const r = await supabase.from("profiles").update({sender_emails:list}).eq("id", profile.id);
            if (r.error){ toast("Uložení se nepovedlo."); return; }
            profile.sender_emails = list; toast("Uloženo."); render(); }},"Uložit adresy"))));
    }

    root.append(h("section",{class:"sec"}, h("div",{class:"eyebrow"},"Účet"),
      h("p",{class:"note",style:"margin-top:8px"},"Přihlášeni jako ", h("b",{}, session?.user?.email || ""), ". Data vidíte jen vy."),
      h("button",{class:"btn ghost small",onclick:async()=>{ await disablePush(true); await supabase.auth.signOut(); }},"Odhlásit se"),
      h("p",{class:"note",style:"margin-top:16px"}, h("a",{href:"/soukromi",style:"color:inherit"},"Ochrana soukromí"))));
    return root;
  }
  function notifySection(){
    const card = h("div",{class:"card",style:"margin-top:10px"});
    const st = {
      on: [h("p",{class:"note",style:"margin:0"},"Na tomto zařízení ", h("b",{},"zapnuto"), "."),
        h("div",{class:"links"}, h("button",{onclick:testPush},"Poslat zkoušku"), h("button",{onclick:()=>disablePush()},"Vypnout na tomto zařízení"))],
      off: [h("p",{class:"note",style:"margin:0"},"Aloiz vám pošle ranní souhrn a připomínky přímo do telefonu nebo počítače. Zapněte to na každém zařízení, kde je chcete dostávat."),
        h("button",{class:"btn primary small",style:"margin-top:12px",disabled:busy,onclick:enablePush},"Zapnout upozornění")],
      "ios-install": [h("p",{class:"note",style:"margin:0"},"Na iPhonu a iPadu fungují upozornění jen z ikony na ploše. V Safari klepněte na ", h("b",{},"Sdílet"), " a pak ", h("b",{},"Přidat na plochu"), ". Otevřete Aloiz z plochy a zapněte upozornění tady.")],
      denied: [h("p",{class:"note",style:"margin:0"},"Upozornění jsou pro Aloiz v prohlížeči zakázaná. Povolte je v nastavení webu (na počítači ikona vedle adresy, na telefonu Nastavení > Oznámení) a stránku obnovte.")],
      unsupported: [h("p",{class:"note",style:"margin:0"},"Tento prohlížeč upozornění neumí. Zkuste Chrome, Edge, Firefox nebo Safari.")],
      unknown: [h("div",{class:"status",style:"margin:0"}, h("span",{class:"spin"}), "Zjišťuji…")],
    };
    if (!pushServer && pushState !== "unknown") card.append(h("p",{class:"note",style:"margin:0"},"Upozornění se na serveru teprve nastavují. Až budou připravená, objeví se tu tlačítko pro zapnutí."));
    else card.append(...st[pushState]);

    const opt = (id, label, on, time, onToggle, onTime) => h("div",{class:"nopt"},
      h("input",{type:"checkbox",class:"switch",id,checked:on,onchange:e=>onToggle(e.target.checked)}),
      h("label",{for:id}, label),
      h("input",{type:"time",id:id+"-t",value:time,"aria-label":label+", čas",disabled:!on,onchange:e=>{ if (e.target.value) onTime(e.target.value); }}));
    const m = profile.morning_on !== false, ev = !!profile.evening_on;
    const lead = profile.event_lead ?? 60;
    card.append(h("div",{style:"margin-top:14px"},
      opt("n-morning","Ranní souhrn: co dnes donést a co se děje", m, profile.morning_time || "07:00",
        v=>{ saveNotify({morning_on:v}); render(); }, v=>saveNotify({morning_time:v})),
      opt("n-evening","Večer: co připravit na zítra", ev, profile.evening_time || "19:00",
        v=>{ saveNotify({evening_on:v}); render(); }, v=>saveNotify({evening_time:v})),
      h("div",{class:"nopt"}, h("label",{for:"n-lead"},"Akce s časem připomenout"),
        h("select",{id:"n-lead",style:"width:auto",onchange:e=>saveNotify({event_lead:Number(e.target.value)})},
          [[0,"Nepřipomínat"],[15,"15 min předem"],[30,"30 min předem"],[60,"1 hodinu předem"],[120,"2 hodiny předem"]]
            .map(([v,l]) => h("option",{value:v,selected:v===lead},l))))),
      h("p",{class:"note",style:"margin:10px 0 0"},"Platí pro všechna vaše zařízení. U jednotlivé položky to můžete změnit v její úpravě. Souhrn bez ničeho na dnešek ani zítřek nepřijde."));
    return h("section",{class:"sec"}, h("div",{class:"eyebrow"},"Upozornění"), card);
  }
  function remindOptions(it){
    const lead = profile?.event_lead ?? 60;
    const list = it.time
      ? [["", "Podle nastavení (" + (lead ? (lead < 60 ? lead + " min" : lead/60 + " h") + " předem" : "nepřipomínat") + ")"], ["off","Bez upozornění"],
         ["10","10 min předem"], ["30","30 min předem"], ["60","1 hodinu předem"], ["120","2 hodiny předem"], ["1440","Den předem"]]
      : [["", "Jen v ranním souhrnu"], ["-420","V ten den v 7:00"], ["360","Večer předem v 18:00"], ["1800","Dva dny předem v 18:00"]];
    if (it.remind && !list.some(([v]) => v === it.remind)) list.push([it.remind, it.remind === "off" ? "Bez upozornění" : "Vlastní"]);
    return list.map(([v,l]) => h("option",{value:v,selected:v===(it.remind||"")},l));
  }
  function pushHint(){
    let dismissed = false; try{ dismissed = localStorage.getItem("aloiz-push-hint") === "1"; }catch{}
    if (dismissed || !pushServer || !["off","ios-install"].includes(pushState)) return null;
    const hide = () => { try{ localStorage.setItem("aloiz-push-hint","1"); }catch{} render(); };
    return h("div",{class:"card sec"}, h("div",{class:"eyebrow"},"Ranní souhrn"),
      h("p",{style:"margin:8px 0 14px;line-height:1.45"},"Chcete každé ráno dostat do telefonu, co dnes donést a co se děje?"),
      h("div",{style:"display:flex;gap:8px;flex-wrap:wrap"},
        h("button",{class:"btn primary small",onclick:()=> pushState === "off" ? enablePush() : go({name:"settings"})}, pushState === "off" ? "Zapnout upozornění" : "Jak na to"),
        h("button",{class:"btn small",style:"background:transparent",onclick:hide},"Teď ne")));
  }
  function confirmDelete(c){
    const wrap = h("div",{});
    const ask = () => { wrap.replaceChildren(h("span",{class:"note",style:"margin-right:10px"},"Smazat "+c.name+" i všechny jeho položky?"),
      h("button",{class:"btn ghost small",onclick:()=>{ state.children = state.children.filter(x=>x.id!==c.id); state.items = state.items.filter(i=>i.childId!==c.id); if(filter===c.id) filter="all"; save(); render(); }},"Smazat"),
      h("button",{class:"btn small",style:"background:transparent",onclick:()=>{ wrap.replaceChildren(btn()); }},"Ne")); };
    const btn = () => h("button",{class:"btn ghost small",onclick:ask},"Odebrat");
    wrap.append(btn()); return wrap;
  }

  function viewDone(v){
    const mem = v.member ? child(v.member) : null;
    const list = state.items.filter(i => doneTask(i) && (!mem || i.childId === mem.id))
      .sort((a,b) => (b.date||"0").localeCompare(a.date||"0") || (b.createdAt||0)-(a.createdAt||0));
    const root = h("div",{}, header(h("button",{class:"iconbtn bare","aria-label":"Zpět",onclick:back}, svg(ICON.back)), h("span")),
      h("h1",{class:"h",style:"margin-top:12px"}, "Hotovo" + (mem ? " · " + mem.name : "")),
      h("p",{class:"note",style:"margin:8px 0 0"},"Vyřízené úkoly a věci. Klepnutím na kolečko je vrátíte zpátky."));
    const sec = h("section",{class:"sec"});
    if (!list.length) sec.append(h("p",{class:"empty"},"Zatím nic hotového."));
    list.forEach(i => sec.append(itemRow(i,{showChild: !mem && state.children.length>1, showDate:true})));
    root.append(sec);
    if (list.length > 1){
      const wrap = h("div",{class:"sec"});
      const ask = () => wrap.replaceChildren(h("span",{class:"note",style:"margin-right:10px"},"Smazat všech " + list.length + " hotových položek?"),
        h("button",{class:"btn ghost small danger",onclick:()=>{ const ids = new Set(list.map(i=>i.id)); state.items = state.items.filter(i=>!ids.has(i.id)); save(); toast("Smazáno."); render(); }},"Smazat"),
        h("button",{class:"btn small",style:"background:transparent",onclick:()=>wrap.replaceChildren(btn())},"Ne"));
      const btn = () => h("button",{class:"btn ghost small",onclick:ask},"Vyčistit hotové");
      wrap.append(btn()); root.append(wrap);
    }
    return root;
  }

  function viewSource(v){
    const from = v.from || {name:"today"};
    const root = h("div",{}, header(h("button",{class:"iconbtn bare","aria-label":"Zpět",onclick:()=>go(from)}, svg(ICON.back)), h("span")));
    if (!v.id){ root.append(h("p",{class:"empty"},"Zdroj se nenašel.")); return root; }
    const src = sourceCache.get(v.id);
    if (!src){
      root.append(h("div",{class:"status",role:"status"}, h("span",{class:"spin"}), "Načítám zdroj…"));
      if (!v.loading){ v.loading = true; loadSource(v.id).then(x => { if (view !== v) return; if (!x) v.missing = true; render(); }); }
      if (v.missing){ root.replaceChildren(root.firstChild, h("p",{class:"empty"},"Zdroj se nepodařilo načíst. Možná byl smazán.")); }
      return root;
    }
    const when = new Date(src.created_at);
    root.append(h("div",{class:"eyebrow",style:"margin-top:12px"}, "Zdroj · " + when.getDate() + ". " + (when.getMonth()+1) + ". " + when.getFullYear()),
      h("h1",{class:"h",style:"margin-top:6px;overflow-wrap:anywhere"}, src.label || "Zpráva"));
    if (src.note) root.append(h("div",{class:"card",style:"margin-top:16px"}, h("div",{class:"eyebrow"},"Vaše poznámka"), h("p",{class:"srctext"}, src.note)));
    const files = src.files || [];
    if (files.length){
      const g = h("div",{class:"srcfiles"});
      files.forEach(f => { const u = src.urls[f.path]; if (!u) return;
        g.append(f.type === "application/pdf"
          ? h("a",{class:"btn ghost small",href:u,target:"_blank",rel:"noopener"}, svg(ICON.file), "Otevřít PDF" + (f.name ? " · " + f.name : ""))
          : h("a",{href:u,target:"_blank",rel:"noopener","aria-label":"Otevřít fotku ve velkém"}, h("img",{src:u,alt:f.name||"Fotka"}))); });
      root.append(g);
    }
    if (src.body) root.append(h("div",{class:"card",style:"margin-top:16px"}, h("div",{class:"eyebrow"}, src.kind === "email" ? "Text e-mailu" : "Text zprávy"), h("p",{class:"srctext"}, src.body)));
    const items = state.items.filter(i => i.sourceId === v.id);
    if (items.length){
      const sec = h("section",{class:"sec"}, h("div",{class:"eyebrow"},"Uloženo z tohoto zdroje"));
      items.forEach(i => sec.append(itemRow(i,{showChild: state.children.length>1, showDate:true})));
      root.append(sec);
    }
    return root;
  }

  function fab(){
    fabEl.replaceChildren();
    if (!session || loading) return;
    if (view.name === "review"){
      fabEl.append(h("button",{class:"btn ghost",onclick:discardPending},"Zahodit"),
        h("button",{class:"btn primary",style:"flex:1;max-width:300px",onclick:savePending},"Uložit vše"));
    } else if (view.name === "edit"){
      fabEl.append(h("button",{class:"btn primary",style:"flex:1;max-width:340px",onclick:saveEdit},"Uložit"));
    } else if ((view.name === "today" || view.name === "child") && state.children.length){
      fabEl.append(h("button",{class:"btn primary",onclick:()=>go({name:"add"})}, svg(view.name==="child"?ICON.plus:ICON.cam),
        view.name==="child" ? "Přidat pro "+(child(view.id)?.name||"") : "Přidat ze školy"));
    }
  }

  function render(){
    let node;
    if (loading) node = h("div",{class:"login"}, svg(LOGO), h("div",{class:"status",role:"status"}, h("span",{class:"spin"}), "Načítám…"));
    else if (!session) node = viewLogin();
    else if (view.name === "add") node = viewAdd();
    else if (view.name === "review") node = viewReview();
    else if (view.name === "child") node = viewChild(view.id);
    else if (view.name === "settings") node = viewSettings();
    else if (view.name === "edit") node = viewEdit(view);
    else if (view.name === "calendar") node = viewCalendar(view);
    else if (view.name === "done") node = viewDone(view);
    else if (view.name === "source") node = viewSource(view);
    else if (view.name === "copy") node = h("div",{}, header(h("button",{class:"iconbtn bare","aria-label":"Zpět",onclick:back}, svg(ICON.back)), h("span")),
      h("h1",{class:"h",style:"margin-top:12px"},"Ke zkopírování"), h("p",{class:"note"},"Označte text a zkopírujte ho."),
      h("textarea",{id:"copytext",readonly:true,style:"min-height:260px"}, view.text));
    else node = viewToday();
    const active = document.activeElement && document.activeElement.id;
    appEl.replaceChildren(node); fab();
    if (active){ const el = document.getElementById(active); if (el) el.focus(); }
  }

  // ---------- start ----------
  async function onSession(s){
    const changedUser = (s?.user?.id || null) !== (session?.user?.id || null);
    session = s;
    if (!s){ loading = false; state = {children:[], items:[]}; inbox = []; profile = null; view = {name:"today"}; render(); return; }
    if (changedUser){ loading = true; render(); await load(); loading = false; render(); refreshPush().then(render); }
  }
  render();
  supabase.auth.getSession().then(({data}) => onSession(data.session));
  const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setTimeout(() => onSession(s), 0); });
  // Po návratu do aplikace načíst novinky (např. e-mail přeposlaný mezitím)
  const onVisible = async () => {
    if (document.visibilityState !== "visible" || !session || busy || ["edit","review"].includes(view.name)) return;
    await saving; await load(); render();
  };
  document.addEventListener("visibilitychange", onVisible);
  return () => { sub?.subscription?.unsubscribe(); document.removeEventListener("visibilitychange", onVisible); };
}
