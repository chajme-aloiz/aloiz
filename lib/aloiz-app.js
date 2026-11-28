// Aloiz: celé uživatelské rozhraní (jedna stránka, bez frameworku).
// Vzniklo z testovací verze. Data se ukládají do Supabase, čtení zpráv běží přes /api/extract.

import { t, LANGS, getLang, setLang, detectLang, isLang, langName, dayLabel, weekdayLong, weekdayShort, monthYear, monthShort, fullDate, speechLang } from "./i18n.js";

const COLORS = ["#E39A6B","#6F9B86","#8E86C9","#6E9BC4","#C98FA8","#B8A24E"];
const TYPE_KEYS = ["udalost","ukol"]; // dřívější „donest“ se ukazuje jako úkol
const typeName = k => t("type." + k);
const MAX_IMAGES = 4;
const MAX_PDF_BYTES = 3_000_000; // server přijme kolem 4 MB, base64 přidá třetinu

const ICON = {
  cam:'<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.7l1.3-2h5l1.3 2h1.7A2.5 2.5 0 0 1 20 8.5v9A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  file:'<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/></svg>',
  back:'<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  close:'<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  user:'<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.6 4-5.2 7-5.2s5.8 1.6 7 5.2"/></svg>',
  trash:'<svg aria-hidden="true" class="ico-trash" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9.5 7V4.8h5V7M6.5 7l.9 12.2c.1.9.8 1.6 1.7 1.6h5.8c.9 0 1.6-.7 1.7-1.6L17.5 7M10 11v6M14 11v6"/></svg>',
  plus:'<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  tick:'<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  cal:'<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>',
  pen:'<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
  next:'<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  mic:'<svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
  mail:'<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M4 7l8 6 8-6"/></svg>',
  google:'<svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>',
};
const LOGO = '<svg class="logo" role="img" aria-label="aloiz" width="74" height="32" viewBox="98 236 636 278" fill="none"><circle cx="200" cy="410" r="86.25" stroke="#E6215C" stroke-width="1.8"/><line x1="286.25" y1="320" x2="286.25" y2="500" stroke="#E6215C" stroke-width="1.8"/><line x1="321.75" y1="250" x2="321.75" y2="500" stroke="var(--logo-dark)" stroke-width="1.2"/><circle cx="437.5" cy="410" r="87.5" stroke="var(--logo-dark)" stroke-width="1.2"/><line x1="554.25" y1="320" x2="554.25" y2="500" stroke="#E6215C" stroke-width="1.8"/><path d="M587 326.5 H709 L589.5 496.5 H713" stroke="var(--logo-dark)" stroke-width="1.2"/><circle cx="554.25" cy="290" r="13" fill="#E6215C"/></svg>';

export function mount({ supabase, inboundAddress, appEl, fabEl, toastEl }) {
  setLang(detectLang(), false);
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
    if (!s) return t("noDate");
    const td = todayIso();
    if (s === td) return t("today");
    if (s === addDays(td,1)) return t("tomorrow");
    return dayLabel(new Date(s+"T12:00:00"));
  }
  const child = id => state.children.find(c => c.id === id);
  function toast(msg, action){
    toastEl.replaceChildren(msg);
    if (action) toastEl.append(h("button",{class:"toastbtn",onclick:()=>{ toastEl.hidden = true; action.fn(); }}, action.label));
    toastEl.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(()=> toastEl.hidden = true, action ? 5000 : 2800);
  }
  const isTask = it => it.type !== "udalost";
  // „Já“: člen rodiny, který je sám přihlášený uživatel. Značka je v údajích účtu (nemění databázi).
  const selfId = () => session?.user?.user_metadata?.aloiz_self || "";
  const isSelf = c => !!c && c.id === selfId();
  const nm = c => isSelf(c) ? t("me") : c.name; // přihlášený uživatel se ukazuje jako „Já“
  function myName(){
    const m = session?.user?.user_metadata || {};
    const full = String(m.full_name || m.name || "").trim();
    return full ? full.split(/\s+/)[0] : t("me");
  }
  async function markSelf(id){
    const r = await supabase.auth.updateUser({data:{aloiz_self:id}});
    if (!r.error && r.data?.user) session = {...session, user: r.data.user};
  }
  // Po prvním přihlášení založí člena „já“, aby si uživatel jen vybral barvu
  async function ensureSelf(){
    if (selfId() || state.children.length) return false;
    const me = {id:uid(), name:myName(), cls:"", school:"", color:COLORS[0]};
    state.children.push(me); await save(); await markSelf(me.id);
    return true;
  }
  const doneTask = it => isTask(it) && it.done; // hotové úkoly se přesouvají do „Hotovo“

  // ---------- data (Supabase) ----------
  const childToRow = c => ({id:c.id, name:c.name, cls:c.cls||"", school:c.school||"", color:c.color});
  const itemToRow = i => ({id:i.id, child_id:i.childId||null, type:i.type, title:i.title, due_date:i.date||"", due_time:i.time||"",
    place:i.place||"", note:i.note||"", done:!!i.done, source:i.source||"", repeat_rule:i.repeat||"", repeat_until:i.until||"",
    skip_dates:i.skip||[], created_ms:i.createdAt||Date.now(), parent_id:i.parentId||"", source_id:i.sourceId||null, remind:i.remind||""});
  const rowToChild = r => ({id:r.id, name:r.name, cls:r.cls, school:r.school, color:r.color});
  const rowToItem = r => ({id:r.id, childId:r.child_id||"", type:r.type==="donest" ? "ukol" : r.type, title:r.title, date:r.due_date, time:r.due_time, place:r.place,
    note:r.note, done:r.done, source:r.source, repeat:r.repeat_rule, until:r.repeat_until, skip:r.skip_dates||[], createdAt:Number(r.created_ms),
    parentId:r.parent_id||"", sourceId:r.source_id||"", remind:r.remind||""});

  async function load(){
    const [c, i, p, b] = await Promise.all([
      supabase.from("children").select("*").order("created_at"),
      supabase.from("items").select("*").order("created_ms"),
      supabase.from("profiles").select("*").maybeSingle(),
      supabase.from("inbox").select("*").order("created_at"),
    ]);
    if (c.error || i.error){ toast(t("err.load")); return; }
    state = {children: c.data.map(rowToChild), items: i.data.map(rowToItem)};
    synced = {children: new Map(c.data.map(r => [r.id, JSON.stringify(childToRow(rowToChild(r)))])),
              items: new Map(i.data.map(r => [r.id, JSON.stringify(itemToRow(rowToItem(r)))]))};
    profile = p.data || null;
    inbox = b.data || [];
    syncLang();
  }

  // ---------- jazyk ----------
  // Volba na zařízení má přednost. Na novém zařízení bez volby se převezme jazyk z profilu.
  let langChosen = false; try{ langChosen = !!localStorage.getItem("aloiz-lang"); }catch{}
  function syncLang(){
    if (!profile || !("lang" in profile)) return; // sloupec lang v databázi zatím chybí
    if (!langChosen && profile.lang && isLang(profile.lang) && profile.lang !== getLang()){ setLang(profile.lang, true); langChosen = true; return; }
    if (profile.lang !== getLang()) storeLang();
  }
  async function storeLang(){
    if (!profile || !("lang" in profile)) return;
    const r = await supabase.from("profiles").update({lang: getLang()}).eq("id", profile.id);
    if (!r.error) profile.lang = getLang();
  }
  function changeLang(code){
    setLang(code, true); langChosen = true;
    storeLang(); render();
  }
  function langPicker(id, compact){
    return h("select",{id, class: compact ? "langsel" : null, "aria-label": t("lang.label"), onchange:e=>changeLang(e.target.value)},
      LANGS.map(l => h("option",{value:l.code,selected:l.code===getLang(),lang:l.code}, l.name)));
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
    }catch(e){ console.error(e); toast(t("err.save")); }
  }

  // ---------- upozornění (Web Push) ----------
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const pushSupported = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  function keyBytes(b64){ const s = atob((b64 + "=".repeat((4 - b64.length % 4) % 4)).replace(/-/g,"+").replace(/_/g,"/")); return Uint8Array.from(s, c => c.charCodeAt(0)); }
  function deviceName(){ const u = navigator.userAgent; return /iPhone/.test(u)?"iPhone":/iPad/.test(u)?"iPad":/Android/.test(u)?"Android":/Mac/.test(u)?"Mac":/Windows/.test(u)?"Windows":t("device"); }
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
      if (perm !== "granted"){ pushState = perm === "denied" ? "denied" : "off"; toast(t("push.needPerm")); return; }
      const { key } = await fetch("/api/push/key").then(r => r.json());
      if (!key){ toast(t("push.notReady")); return; }
      const reg = await navigator.serviceWorker.register("/sw.js"); await navigator.serviceWorker.ready;
      const old = await reg.pushManager.getSubscription(); if (old) await old.unsubscribe();
      const sub = await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:keyBytes(key)});
      await storeSub(sub); pushState = "on"; toast(t("push.on"));
      // Kdo už upozornění jednou zapnul, nepotřebuje nabídku na Dnes ani na dalších zařízeních
      supabase.auth.updateUser({data:{aloiz_push_hint:"1"}}).then(r => { if (!r.error && r.data?.user) session = {...session, user: r.data.user}; }).catch(()=>{});
    }catch(e){ console.error(e); toast(t("push.onFail")); }
    finally{ busy = false; render(); }
  }
  async function disablePush(silent){
    try{
      const sub = await currentSub();
      if (sub){ await supabase.from("push_subs").delete().eq("endpoint", sub.endpoint); await sub.unsubscribe(); }
    }catch(e){ console.error(e); }
    pushState = pushSupported() && Notification.permission !== "denied" ? "off" : pushState;
    if (!silent){ toast(t("push.offHere")); render(); }
  }
  async function testPush(){
    try{
      const r = await fetch("/api/push/test", {method:"POST", headers:{Authorization:"Bearer " + session.access_token}});
      const j = await r.json().catch(() => ({}));
      if (!r.ok){ toast(j.error === "not_configured" ? t("push.notReady") : t("push.testFail")); return; }
      toast(j.sent ? t("push.testSent") : t("push.noDevice"));
    }catch{ toast(t("push.testFail")); }
  }
  async function saveNotify(patch){
    Object.assign(profile, patch);
    const r = await supabase.from("profiles").update(patch).eq("id", profile.id);
    if (r.error){ console.error(r.error); toast(t("err.saveShort")); } else toast(t("saved"));
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

  async function extract({text, note, files, source, voice}){
    busy = true; busyText = files?.length ? (files.some(f => isPdf(f)) ? t("busy.pdf") : t("busy.photo")) : t("busy.msg"); render();
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
        body: JSON.stringify({text: text||"", note: note||"", images, pdfs, kids: kidsForAi(), events: eventsForAi(), lang: getLang()})});
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw Object.assign(new Error("api"), {code: out.error || (res.status === 413 ? "too_big" : "failed")});
      const found = out.items || [];
      let sourceId = null;
      if (found.length){
        busyText = t("busy.source"); render();
        const kind = pdfs.length ? "pdf" : images.length ? "foto" : voice ? "hlas" : "text";
        sourceId = await createSource({kind, label: source, note: note||"", body: text||"", files: keep});
      }
      busy = false; clearStaged();
      afterExtract(found, source, sourceId);
    }catch(e){
      busy = false;
      const known = ["rate_limited","image_rejected","refused","pdf_big","too_big","not_allowed","login"];
      toast(t("aiErr." + (known.includes(e?.code) ? e.code : "failed"))); render();
    }
  }
  // Jen položka, u které si AI ničím nejistá není, se smí uložit bez kontroly
  const certain = i => !!child(i.childId) && !i.uncertain && (i.type !== "udalost" || !!i.date);
  const autoTypes = () => profile?.auto_types || [];
  function toItem(i, source, sourceId, now){
    return {id:i.id || uid(), childId:i.childId, type:i.type, title:(i.title||"").trim()||t("untitled"), date:i.date||"", time:i.time||"",
      place:i.place||"", note:i.note||"", done:false, createdAt:now, source, repeat:i.repeat||"", until:i.until||"", skip:[],
      parentId:i.parentId||"", sourceId:sourceId||""};
  }
  async function afterExtract(found, source, sourceId){
    if (!found.length){ toast(t("nothingFound")); render(); return; }
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
      if (direct.length) toast(t("savedDirectRest", direct.length));
      return;
    }
    const kid = direct[0].childId;
    toast(t("savedDirect", direct.length), {label:t("show"), fn:()=>go({name:"source", id:sourceId, from:{name:"today"}})});
    go(direct.every(i => i.childId === kid) ? {name:"child", id:kid} : {name:"today"});
  }
  function startReview(list, source, inboxId, sourceId){
    pending = list.map(x => ({...x, type: x.type === "donest" ? "ukol" : x.type, id: x.id || uid(), parentId: x.parentId || "", childId: child(x.childId) ? x.childId : (state.children.length === 1 ? state.children[0].id : "")}));
    pendingSource = source; pendingInboxId = inboxId; pendingSourceId = sourceId || null;
    if (!pending.length){ toast(t("nothingFound")); render(); return; }
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
    if (!usable.length){ toast(t("files.badType")); return; }
    const pdfCount = staged.filter(x => isPdf(x.file)).length, imgCount = staged.length - pdfCount;
    const pdfs = usable.filter(isPdf).slice(0, Math.max(0, 2 - pdfCount));
    const allImgs = usable.filter(f => !isPdf(f));
    const imgs = allImgs.slice(0, Math.max(0, MAX_IMAGES - imgCount));
    if (allImgs.length > imgs.length) toast(t("files.max", MAX_IMAGES));
    [...pdfs, ...imgs].forEach(file => staged.push({file, url: isPdf(file) ? "" : URL.createObjectURL(file)}));
    if (view.name !== "add") go({name:"add"}); else render();
    setTimeout(() => document.getElementById("stagednote")?.focus({preventScroll:true}), 0);
  }
  function clearStaged(){ staged.forEach(x => x.url && URL.revokeObjectURL(x.url)); staged = []; stagedNote = ""; }
  function readStaged(){
    const files = staged.map(x => x.file); if (!files.length || busy) return;
    const pdfs = files.filter(isPdf), imgs = files.filter(f => !isPdf(f));
    const src = pdfs.length && !imgs.length && pdfs.length === 1 ? t("src.pdf", pdfs[0].name) : files.length > 1 ? t("src.files", files.length) : t("src.photo");
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
    rec = new SR(); rec.lang = speechLang(); rec.interimResults = true; rec.continuous = true;
    const startText = draftText.trim() ? draftText.trim() + " " : "";
    let finalText = "";
    rec.onresult = ev => {
      let interim = "";
      for (let k = ev.resultIndex; k < ev.results.length; k++){
        const r = ev.results[k]; if (r.isFinal) finalText += r[0].transcript + " "; else interim += r[0].transcript;
      }
      setDraft(startText + finalText + interim);
    };
    rec.onerror = ev => { if (ev.error === "not-allowed" || ev.error === "service-not-allowed") toast(t("mic.allow")); };
    rec.onend = () => {
      recording = false;
      const said = (startText + finalText).trim();
      setDraft(said);
      if (finalText.trim()){ draftText = ""; extract({text: said, source: t("src.voice"), voice: true}); }
      else render();
    };
    try{ rec.start(); recording = true; render(); }catch(e){ toast(t("mic.fail")); }
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
    const em = h("input",{type:"email",id:"login-email",autocomplete:"email",placeholder:t("login.ph"),"aria-label":t("login.email")});
    const send = async () => {
      const v = em.value.trim(); if (!/.+@.+\..+/.test(v)){ em.focus(); toast(t("login.needEmail")); return; }
      const { error } = await supabase.auth.signInWithOtp({email:v, options:{emailRedirectTo: location.origin}});
      if (error){ toast(error.status === 429 ? t("login.rate") : t("login.fail")); return; }
      loginSent = v; render();
    };
    const google = () => supabase.auth.signInWithOAuth({provider:"google", options:{redirectTo: location.origin}});
    const root = h("div",{class:"login"}, h("div",{class:"logintop"}, svg(LOGO), langPicker("login-lang", true)),
      h("h1",{}, t("login.h1a"), h("br"), t("login.h1b")),
      h("p",{class:"lead muted"}, t("login.lead")));
    if (loginSent){
      root.append(h("div",{class:"card",style:"margin-top:32px"}, h("div",{class:"eyebrow"},t("login.check")),
        h("p",{style:"margin:8px 0 0;line-height:1.45"}, t("login.sentA"), h("b",{}, loginSent), t("login.sentB")),
        h("button",{class:"btn small",style:"background:transparent;padding:0;margin-top:10px",onclick:()=>{loginSent=""; render();}},t("login.other"))));
      return root;
    }
    root.append(
      h("button",{class:"btn ghost",style:"width:100%;margin-top:36px",onclick:google}, svg(ICON.google), t("login.google")),
      h("div",{class:"or"},t("or")),
      h("div",{class:"card"}, h("label",{class:"eyebrow",for:"login-email"},t("login.linkLabel")), em,
        h("button",{class:"btn primary small",style:"margin-top:14px",onclick:send},t("login.send"))),
      h("p",{class:"note",style:"margin-top:24px;text-align:center"}, h("a",{href:"/soukromi",style:"color:inherit"},t("privacy"))));
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
    const opts = [...extra.filter(e => e.type === "udalost" && e.id !== it.id).map(e => ({id:e.id, label:(e.title||t("newEvent")) + (e.date ? " · " + prettyDate(e.date) : "") + t("newSuffix")})),
      ...saved.map(e => ({id:e.id, label:e.title + " · " + (e.repeat === "weekly" ? t("weekly") : prettyDate(e.date))}))];
    if (!opts.length && !it.parentId) return null;
    return field(t("f.parent"), h("select",{id:idp,onchange:e=>{it.parentId=e.target.value;}}, h("option",{value:""},t("f.parentNone")),
      opts.map(o => h("option",{value:o.id,selected:o.id===it.parentId}, o.label))), true);
  }
  const field = (lab, el, full) => h("div",{class: full?"full":""}, h("label",{class:"f",for:el.id}, lab), el);
  function viewEdit(v){
    const src = v.item || state.items.find(i => i.id === v.id);
    if (!src) return viewToday();
    if (!v.draft) v.draft = {...src};
    const it = v.draft;
    const fields = h("div",{class:"fields"},
      field(t("f.what"), h("input",{type:"text",id:"e-title",value:it.title,placeholder:t("f.whatPh"),oninput:e=>it.title=e.target.value}), true),
      field(t("f.type"), h("select",{id:"e-type",onchange:e=>{it.type=e.target.value; render();}}, TYPE_KEYS.map(k=>h("option",{value:k,selected:k===it.type},typeName(k))))),
      field(t("f.who"), h("select",{id:"e-kid",onchange:e=>{it.childId=e.target.value; render();}}, h("option",{value:""},t("f.choose")), state.children.map(c=>h("option",{value:c.id,selected:c.id===it.childId},nm(c))))),
      field(it.type==="udalost"?t("f.date"):t("f.due"), h("input",{type:"date",id:"e-date",value:it.date,onchange:e=>{ it.date=e.target.value; render(); }})),
      field(t("f.time"), h("input",{type:"time",id:"e-time",value:it.time,onchange:e=>{ it.time=e.target.value; if (it.remind && it.remind !== "off") it.remind = ""; render(); }})),
      field(t("f.place"), h("input",{type:"text",id:"e-place",value:it.place,oninput:e=>it.place=e.target.value}), true),
      field(t("f.repeat"), h("select",{id:"e-rep",onchange:e=>{it.repeat=e.target.value; render();}}, h("option",{value:""},t("f.noRepeat")), h("option",{value:"weekly",selected:it.repeat==="weekly"},t("f.weekly")))),
      it.repeat ? field(t("f.until"), h("input",{type:"date",id:"e-until",value:it.until||"",onchange:e=>it.until=e.target.value})) : h("div"),
      it.date ? field(t("f.remind"), remindPicker(it), true) : null,
      isTask(it) ? parentField(it, "e-parent") : null,
      field(t("f.note"), h("textarea",{id:"e-note",style:"min-height:64px",oninput:e=>it.note=e.target.value}, it.note||""), true));
    const del = h("div",{style:"margin-top:18px"});
    const askDel = () => { del.replaceChildren(
      h("span",{class:"note",style:"margin-right:10px"}, src.repeat ? t("del.series") : t("del.confirm")),
      h("button",{class:"btn ghost small danger",onclick:()=>{ state.items = state.items.filter(i=>i.id!==src.id); save(); toast(t("deleted")); back(); }},t("yes")),
      v.occ ? h("button",{class:"btn ghost small",style:"margin-left:6px",onclick:()=>{ src.skip = [...(src.skip||[]), v.occ]; save(); toast(t("del.skipped")); back(); }},t("del.onlyOcc", prettyDate(v.occ))) : "",
      h("button",{class:"btn small",style:"background:transparent",onclick:()=>del.replaceChildren(delBtn())},t("no"))); };
    const delBtn = () => h("button",{class:"btn ghost small danger",onclick:askDel}, svg(ICON.trash), t("del.item"));
    if (!src._new) del.append(delBtn());
    return h("div",{}, header(h("button",{class:"iconbtn bare","aria-label":t("back"),onclick:back}, svg(ICON.back)), h("span")),
      h("h1",{class:"h",style:"margin-top:12px"}, src._new ? t("edit.new") : t("edit.title")),
      h("div",{class:"card",style:"margin-top:20px"}, fields,
        it.source ? h("div",{class:"srcline"}, h("span",{class:"tag"}, t("src.tag", it.source)),
          it.sourceId ? h("button",{class:"btn ghost small",onclick:()=>go({name:"source", id:it.sourceId, from:view})}, svg(ICON.file), t("src.show")) : null) : null),
      del);
  }
  function saveEdit(){
    const it = view.draft; if (!it) return;
    if (!it.title.trim()){ toast(t("edit.needTitle")); document.getElementById("e-title")?.focus(); return; }
    if (!it.childId){ toast(t("edit.needWho")); return; }
    const clean = {...it, title: it.title.trim()}; if (!isTask(clean)) clean.parentId = ""; delete clean._new; delete clean._base; delete clean._occ;
    const idx = state.items.findIndex(i => i.id === clean.id);
    if (idx >= 0) state.items[idx] = {...state.items[idx], ...clean};
    else state.items.push({...clean, createdAt: Date.now(), source: t("src.manual")});
    save(); toast(t("saved"));
    go(["add","edit","review"].includes(prevView.name) ? {name:"today"} : prevView);
  }
  function back(){ go(["edit","source"].includes(prevView.name) ? {name:"today"} : prevView); }
  function openEdit(it){ prevView = view; go({name:"edit", id: base(it).id, occ: it._occ}); }

  // ---------- kalendář ----------
  function viewCalendar(v){
    const td = todayIso();
    const month = v.month || td.slice(0,7); const sel = v.sel || (td.startsWith(month) ? td : month + "-01");
    const first = month + "-01"; const fd = new Date(first+"T12:00:00");
    const start = addDays(first, -((fd.getDay()+6)%7));
    const occ = expand(start, addDays(start, 41)).filter(i => i.date && (filter==="all" || i.childId===filter));
    const grid = h("div",{class:"month",role:"grid","aria-label":t("cal.month")});
    for (let k=0;k<7;k++) grid.append(h("div",{class:"wd"}, weekdayShort(new Date(addDays(start,k)+"T12:00:00"))));
    for (let k=0;k<42;k++){
      const ds = addDays(start,k); const dd = new Date(ds+"T12:00:00");
      const here = occ.filter(i => i.date === ds);
      const dots = h("span",{class:"dots"}); [...new Set(here.map(i=>child(i.childId)?.color||"#999"))].slice(0,4).forEach(col => dots.append(h("i",{style:"background:"+col})));
      grid.append(h("button",{class:(ds.slice(0,7)!==month?"out ":"")+(ds===td?"today":""),"aria-pressed":String(ds===sel),"aria-label":t("cal.dayAria", prettyDate(ds), here.length),
        onclick:()=>go({name:"calendar", month, sel: ds})}, h("span",{}, dd.getDate()), dots));
    }
    const shift = n => { const d = new Date(first+"T12:00:00"); d.setMonth(d.getMonth()+n); const m = iso(d).slice(0,7); return {name:"calendar", month:m, sel: m===td.slice(0,7)?td:m+"-01"}; };
    const dayList = occ.filter(i => i.date === sel).sort(byTime);
    const sec = h("section",{class:"sec"}, h("div",{class:"eyebrow"}, prettyDate(sel)));
    if (!dayList.length) sec.append(h("p",{class:"empty",style:"padding:12px 0"},t("cal.empty")));
    renderList(sec, dayList, {showChild: state.children.length>1});
    sec.append(h("button",{class:"btn ghost small",style:"margin-top:12px",onclick:()=>{ prevView = view; const n = newItem(); n.date = sel; go({name:"edit", item:n}); }}, t("cal.addDay")));
    return h("div",{}, header(backBtn(), h("button",{class:"btn ghost small",onclick:()=>go({name:"settings"})}, svg(ICON.cal), t("cal.toPhone"))),
      h("div",{class:"monthnav"},
        h("button",{class:"iconbtn bare","aria-label":t("cal.prev"),onclick:()=>go(shift(-1))}, svg(ICON.back)),
        h("h1",{style:"font-size:28px"}, monthYear(fd)),
        h("button",{class:"iconbtn bare","aria-label":t("cal.next"),onclick:()=>go(shift(1))}, svg(ICON.next))),
      childChips(), grid, sec);
  }
  // Výchozí výběr: naposledy zvolený na tomto zařízení, jinak všichni.
  let filterReady = false;
  function initFilter(){
    if (filterReady || !state.children.length) return; filterReady = true;
    let saved = ""; try{ saved = localStorage.getItem("aloiz-filter") || ""; }catch{}
    if (saved === "all" || child(saved)) filter = saved;
  }
  function setFilter(v){ filter = v; try{ localStorage.setItem("aloiz-filter", v); }catch{} }
  // Jedno tlačítko s vybraným členem; po klepnutí se pod ním rozbalí ostatní.
  let whoOpen = false;
  function whoPicker(){
    const cur = filter === "all" ? null : child(filter);
    const label = cur ? [h("span",{class:"dot",style:"background:"+cur.color}), nm(cur)] : t("all");
    const row = h("div",{class:"whorow"},
      h("button",{class:"chip who","aria-expanded":String(whoOpen),"aria-label":t("who.pick")+": "+(cur ? nm(cur) : t("all")),
        onclick:()=>{ whoOpen = !whoOpen; render(); }}, label, svg(ICON.next)),
      h("button",{class:"linkbtn",onclick:()=> cur ? go({name:"child",id:cur.id}) : go({name:"calendar"})}, t("overview.full"), svg(ICON.next)));
    if (!whoOpen) return row;
    const pick = v => { setFilter(v); whoOpen = false; render(); };
    const others = [...state.children].sort((a,b) => isSelf(b) - isSelf(a));
    return h("div",{}, row, h("div",{class:"chips",role:"group","aria-label":t("who.pick"),style:"margin-top:10px"},
      h("button",{class:"chip","aria-pressed":String(filter==="all"),onclick:()=>pick("all")},t("all")),
      others.map(c => h("button",{class:"chip","aria-pressed":String(filter===c.id),onclick:()=>pick(c.id)},
        h("span",{class:"dot",style:"background:"+c.color}), nm(c)))));
  }
  function childChips(){
    if (state.children.length < 2) return null;
    return h("div",{class:"chips",role:"group","aria-label":t("fam.members")},
      h("button",{class:"chip","aria-pressed":String(filter==="all"),onclick:()=>{filter="all";render();}},t("all")),
      state.children.map(c => h("button",{class:"chip","aria-pressed":String(filter===c.id),onclick:()=>{filter=c.id;render();}},
        h("span",{class:"dot",style:"background:"+c.color}), nm(c))));
  }
  async function copyText(text, okMsg){
    try{ await navigator.clipboard.writeText(text); toast(okMsg); }
    catch(e){ prevView = view; go({name:"copy", text}); }
  }
  function copyList(c){
    const td = todayIso();
    const mine = expand(td, addDays(td,14)).filter(i => i.childId===c.id && !doneTask(i) && (!i.date || i.date >= td)).sort(byDate);
    const text = t("copy.head", c.name) + "\n" + mine.map(i => "• " + (i.date?prettyDate(i.date)+(i.time?" "+i.time:"")+": ":"") + i.title + (i.place?" ("+i.place+")":"")).join("\n");
    copyText(text, t("copy.done"));
  }

  // ---------- navigace ----------
  // Systémové tlačítko Zpět (Android, gesto, prohlížeč): mimo úvod držíme v historii jeden záznam navíc,
  // takže Zpět vrátí v aplikaci o obrazovku zpět místo zavření. Z úvodu pak Zpět aplikaci normálně zavře.
  let ignorePop = false;
  function go(v){
    view = v; render(); window.scrollTo(0,0);
    try{
      const inner = v.name !== "today";
      if (inner && !history.state?.aloiz) history.pushState({aloiz:1}, "");
      else if (!inner && history.state?.aloiz){ ignorePop = true; history.back(); }
    }catch{}
  }
  function onPop(){
    if (ignorePop){ ignorePop = false; return; }
    if (view.name === "today") return;
    if (busy){ try{ history.pushState({aloiz:1}, ""); }catch{} return; }
    if (view.from){ go(view.from); return; }
    if (view.name === "family"){ go({name:"settings"}); return; }
    const sub = ["edit","source","done","copy"].includes(view.name) && prevView && prevView.name !== view.name;
    go(sub && !["edit","source"].includes(prevView.name) ? prevView : {name:"today"});
  }
  window.addEventListener("popstate", onPop);
  const header = (left, right) => h("div",{class:"top"}, left, right);
  function backBtn(close=false){ return h("button",{class:"iconbtn bare","aria-label":close?t("close"):t("back"),onclick:()=>go({name:"today"})}, svg(close?ICON.close:ICON.back)); }

  // ---------- obrazovky ----------
  function itemRow(it, {showChild=true, showDate=false, nested=false}={}){
    const c = child(it.childId);
    const task = isTask(it);
    const sub = h("div",{class:"sub"},
      c && showChild ? [h("span",{class:"dot",style:"width:6px;height:6px;background:"+c.color}), nm(c)] : null,
      showDate ? (c&&showChild?" · ":"") + (nested && it.date ? t("dueBy", prettyDate(it.date)) : prettyDate(it.date)) : null,
      (c&&showChild)||showDate ? " · " : "", t("typeLow." + it.type),
      it.place ? " · " + it.place : "");
    if (it.repeat === "weekly") sub.append(" · " + t("weekly"));
    const body = h("div",{style:"flex:1;min-width:0"}, h("button",{class:"ttl linkbtn","aria-label":t("editAria", it.title),onclick:()=>openEdit(it)}, it.title), sub);
    const row = h("div",{class:"row"+(it.done?" done":"")+(nested?" nested":"")}, nested ? h("div",{class:"time","aria-hidden":"true"}, "↳") : h("div",{class:"time"}, it.time || "—"), body);
    if (task){
      const b = h("button",{class:"check","aria-label": it.done?t("row.undone"):t("done"),"aria-pressed":String(!!it.done),
        onclick:()=>{ const b = base(it); b.done = !b.done; save(); render();
          if (b.done && view.name !== "done") toast(t("row.movedDone"), {label:t("undo"), fn:()=>{ b.done = false; save(); render(); }}); }});
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
      t("done"), h("span",{class:"muted"}, String(n)), svg(ICON.next));
  }

  function inboxCards(){
    return inbox.map(b => h("section",{class:"inboxcard"},
      h("div",{class:"eyebrow",style:"display:flex;gap:8px;align-items:center"}, svg(ICON.mail), t("inbox.title")),
      h("div",{class:"ttl",style:"margin-top:8px"}, b.source.replace(/^[^:：]{1,12}[:：] ?/,"")),
      h("div",{class:"sub"}, t("inbox.found", (b.items||[]).length)),
      h("div",{style:"display:flex;gap:8px;margin-top:12px"},
        h("button",{class:"btn primary small",onclick:()=>startReview(b.items||[], b.source, b.id, b.source_id)},t("inbox.review")),
        h("button",{class:"btn small",style:"background:transparent",onclick:async()=>{ await dropInbox(b.id); await dropSourceIfUnused(b.source_id); render(); }},t("discard")))));
  }

  function viewToday(){
    initFilter();
    const td = todayIso(); const d = new Date();
    const vis = expand(addDays(td,-60), addDays(td,14)).filter(i => (filter==="all" || i.childId===filter) && !doneTask(i));
    const tm = addDays(td,1);
    const prep = vis.filter(i => i.date === tm && i.type !== "udalost" && !i.done);
    const today = vis.filter(i => i.date === td).sort(byTime);
    const soon = vis.filter(i => i.date > td && i.date <= addDays(td,14) && !prep.includes(i)).sort(byDate);
    const nodate = vis.filter(i => !i.date && !i.done);
    const overdue = vis.filter(i => i.date && i.date < td && i.type!=="udalost" && !i.done);
    const openToday = today.filter(i => !i.done).length;
    const tomorrow = vis.filter(i => i.date === tm).length;
    const right = h("div",{style:"display:flex;gap:8px"},
      h("button",{class:"iconbtn","aria-label":t("cal.title"),onclick:()=>go({name:"calendar"})}, svg(ICON.cal)),
      h("button",{class:"iconbtn","aria-label":t("nav.settings"),onclick:()=>go({name:"settings"})}, svg(ICON.user)));
    const lead = !state.children.length ? t("today.start") :
      (openToday || tomorrow) ? t("today.lead", t("count", openToday), t("count", tomorrow)) : t("today.calm");
    const [bigA, bigB] = t("bigDate", d.getDate(), d.getMonth()+1, monthShort(d));
    const root = h("div",{},
      header(svg(LOGO), right),
      h("section",{style:"margin-top:32px"},
        h("div",{class:"muted",style:"font-size:14px"}, weekdayLong(d)),
        h("h1",{class:"big date",style:"margin-top:6px"}, bigA, h("span",{}, bigB)),
        h("p",{class:"lead"}, lead)));
    if (!state.children.length){
      root.append(h("div",{class:"card sec"}, h("div",{class:"eyebrow"},t("today.first")),
        h("p",{style:"margin:8px 0 14px;line-height:1.45"},t("today.firstText")),
        h("button",{class:"btn primary small",onclick:()=>go({name:"family"})},t("fam.add"))));
      return root;
    }
    root.append(...inboxCards());
    if (!selfId()){
      root.append(h("section",{class:"inboxcard"}, h("div",{class:"eyebrow"},t("self.q")),
        h("p",{style:"margin:8px 0 12px;line-height:1.45"},t("self.text")),
        h("div",{class:"chips",style:"margin-top:0"},
          state.children.map(c => h("button",{class:"chip",onclick:async()=>{ await markSelf(c.id); toast(t("self.thanks", c.name)); render(); }},
            h("span",{class:"dot",style:"background:"+c.color}), t("self.isMe", c.name))),
          h("button",{class:"chip",onclick:async()=>{ const used = state.children.map(c=>c.color);
            const me = {id:uid(), name:myName(), cls:"", school:"", color: COLORS.find(x=>!used.includes(x)) || COLORS[0]};
            state.children.push(me); await save(); await markSelf(me.id); go({name:"welcome"}); }}, svg(ICON.plus), t("self.addMe")),
          h("button",{class:"chip",style:"background:transparent;border-color:transparent",onclick:async()=>{ await markSelf("none"); render(); }},t("self.no")))));
    }
    const ph = pushHint(); if (ph) root.append(ph);
    root.append(whoPicker());
    if (prep.length){ const p = h("section",{class:"prep"}, h("div",{class:"eyebrow"},t("today.prep")));
      prep.forEach(i => p.append(itemRow(i,{showChild: state.children.length>1}))); root.append(p); }
    if (overdue.length) root.append(group(t("today.overdue"), overdue, true));
    root.append(h("h2",{class:"subhead"}, t("today")), group("", today, false, t("today.empty")));
    if (soon.length){ root.append(h("h2",{class:"subhead"}, t("today.next")));
      groupByDate(soon).forEach(([dt, list]) => root.append(group(prettyDate(dt), list))); }
    if (nodate.length) root.append(group(t("noDate"), nodate));
    const dl = doneLink(filter==="all" ? "" : filter); if (dl) root.append(h("div",{class:"sec"}, dl));
    if (!state.items.length) root.append(h("p",{class:"empty"},t("today.nothing")));
    return root;
  }
  const byTime = (a,b) => (a.time||"99").localeCompare(b.time||"99");
  const byDate = (a,b) => (a.date+(a.time||"99")).localeCompare(b.date+(b.time||"99"));
  function groupByDate(list){ const m = new Map(); list.forEach(i => { if(!m.has(i.date)) m.set(i.date,[]); m.get(i.date).push(i); }); return [...m.entries()]; }
  function group(title, list, showDate=false, emptyText){
    const s = h("section",{class:"sec"}, title ? h("div",{class:"eyebrow",style:"padding-bottom:4px"}, title) : "");
    if (!list.length && emptyText) s.append(h("p",{class:"empty",style:"padding:12px 0"}, emptyText));
    renderList(s, list, {showChild: filter==="all" && state.children.length>1, showDate});
    return s;
  }

  // Aloiz přemýšlí: „ai“ z loga a kolem něj obíhají tečky. Překryje obrazovku, ať je jasné, že se pracuje.
  function aiWait(text){
    return h("div",{class:"aiwait",role:"status","aria-live":"polite","aria-label":text || t("working")},
      h("div",{class:"aiwait-box"},
        svg('<svg aria-hidden="true" width="132" height="132" viewBox="0 0 140 140" fill="none">'
          + '<g class="aiw-orbit"><circle cx="70" cy="8" r="2.6" fill="#E6215C"/><circle cx="16.3" cy="39" r="2.6" fill="#E6215C" opacity=".6"/><circle cx="16.3" cy="101" r="2.6" fill="#E6215C" opacity=".35"/></g>'
          + '<g class="aiw-mark" transform="translate(4.5 -2)"><circle cx="58" cy="78" r="21" stroke="#E6215C" stroke-width="2.6"/><line x1="79" y1="57" x2="79" y2="99" stroke="#E6215C" stroke-width="2.6"/>'
          + '<line x1="94" y1="57" x2="94" y2="99" stroke="#E6215C" stroke-width="2.6"/><circle class="aiw-dot" cx="94" cy="45" r="2.6" fill="#E6215C"/></g></svg>'),
));
  }
  function viewAdd(){
    const root = h("div",{}, header(svg(LOGO), backBtn(true)),
      h("section",{style:"margin-top:28px"}, h("h1",{class:"h"},t("add.title"))));
    if (!state.children.length){ root.append(h("p",{class:"empty"},t("add.noFam"))); return root; }
    const onPick = e => { const files = [...(e.target.files||[])]; e.target.value = ""; handleFiles(files); };
    const t1 = h("label",{class:"tile"}, svg(ICON.cam), h("div",{}, h("b",{},t("add.photo")), h("small",{}, staged.length ? t("add.more") : t("add.photoHint"))),
      h("input",{type:"file",accept:"image/*",capture:"environment","aria-label":t("add.photo"),onchange:onPick}));
    const t2 = h("label",{class:"tile"}, svg(ICON.file), h("div",{}, h("b",{},t("add.file")), h("small",{},t("add.fileHint"))),
      h("input",{type:"file",multiple:true,accept:"application/pdf,.pdf,image/*","aria-label":t("add.upload"),onchange:onPick}));
    root.append(h("div",{class:"grid2",style:"margin-top:24px"}, t1, t2));
    if (staged.length){
      const thumbs = h("div",{class:"thumbs"}, staged.map((x, k) => h("div",{class:"thumb"},
        x.url ? h("img",{src:x.url,alt:""}) : h("div",{class:"pdf"}, svg(ICON.file), h("small",{}, x.file.name || "PDF")),
        h("button",{class:"x","aria-label":t("add.removeFile"),disabled:busy,onclick:()=>{ const [y] = staged.splice(k,1); if (y.url) URL.revokeObjectURL(y.url); render(); }}, svg(ICON.close)))));
      const nt = h("textarea",{id:"stagednote",style:"min-height:64px",placeholder:t("add.notePh"),
        oninput:e=>stagedNote=e.target.value}, stagedNote);
      root.append(h("div",{class:"card staged",style:"margin-top:10px"},
        h("div",{class:"eyebrow"}, staged.length === 1 ? t("add.ready") : t("add.readyN", staged.length)),
        thumbs,
        h("label",{class:"f",for:"stagednote",style:"margin-top:16px"},t("add.noteLabel")), nt,
        h("div",{style:"display:flex;gap:8px;margin-top:14px"},
          h("button",{class:"btn primary small",disabled:busy,onclick:readStaged},t("add.go")),
          h("button",{class:"btn small",style:"background:transparent",disabled:busy,onclick:()=>{ clearStaged(); render(); }},t("cancel")))));
    }

    const ta = h("textarea",{id:"msg",placeholder:"...",oninput:e=>draftText=e.target.value}, draftText);
    const card = h("div",{class:"card",style:"margin-top:10px"},
      h("label",{for:"msg",class:"eyebrow"},t("add.text")), ta,
      h("button",{class:"btn primary small",style:"margin-top:14px",disabled:busy,onclick:()=>{ const v = ta.value.trim(); if(!v){ ta.focus(); return; } draftText = ""; extract({text:v, source:t("src.text")}); }},t("add.go")));
    root.append(card);

    if (SR){
      root.append(h("div",{class:"voice"},
        h("button",{class:"mic","aria-label":recording?t("voice.stop"):t("voice.start"),"aria-pressed":String(recording),disabled:busy&&!recording,onclick:toggleVoice}, svg(ICON.mic)),
        h("div",{style:"font-size:16px;font-weight:500"}, recording ? t("voice.listening") : t("voice.tap")),
        h("div",{class:"muted",style:"font-size:14px;max-width:260px;line-height:1.4"}, t("voice.example"))));
    } else {
      root.append(h("p",{class:"note",style:"margin:10px 0 0;display:flex;gap:8px;align-items:flex-start"}, svg(ICON.mic),
        t("voice.keyboard")));
    }
    root.append(h("button",{class:"btn ghost manual",style:"width:100%;margin-top:10px",onclick:()=>{ prevView = view; go({name:"edit", item:newItem()}); }}, svg(ICON.pen), t("add.manual")));
    if (busy) root.append(aiWait(busyText));
    if (inboundAddress){
      root.append(h("div",{class:"card",style:"margin-top:10px"},
        h("div",{class:"eyebrow"},t("mail.forward")),
        h("p",{class:"note",style:"margin:8px 0 0"},t("mail.a"), h("span",{class:"addr"}, inboundAddress),
          t("mail.b"), profile?.email || t("mail.yourEmail"), t("mail.c")),
        h("button",{class:"btn ghost small",style:"margin-top:12px",onclick:()=>copyText(inboundAddress,t("mail.copied"))},t("mail.copy"))));
    }
    root.append(h("p",{class:"note",style:"margin-top:10px"},t("add.paste")));
    return root;
  }

  function viewReview(){
    const root = h("div",{}, header(h("div",{style:"display:flex;align-items:center;gap:6px;min-width:0"}, backBtn(), h("span",{class:"muted",style:"font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"}, pendingSource)), h("span")),
      h("section",{style:"margin-top:16px"}, h("h1",{class:"h"}, t("review.foundA"), h("br"), t("found", pending.length)),
        h("p",{class:"muted",style:"font-size:15px;line-height:1.45;margin:10px 0 0"},t("review.sub")),
        pendingSourceId ? h("button",{class:"btn ghost small",style:"margin-top:12px",onclick:()=>go({name:"source", id:pendingSourceId, from:{name:"review"}})}, svg(ICON.file), t("src.show")) : null));
    const list = h("div",{class:"stack",style:"margin-top:20px"});
    pending.forEach((it, idx) => {
      const warn = it.uncertain || !it.childId || (!it.date && it.type==="udalost");
      const c = child(it.childId);
      list.append(h("article",{class:"card"+(warn?" warncard":"")},
        h("div",{style:"display:flex;justify-content:space-between;align-items:center"},
          h("span",{class:"pill"}, typeName(it.type)),
          h("div",{style:"display:flex;align-items:center;gap:8px;font-size:13px"}, c ? [h("span",{class:"dot",style:"background:"+c.color}), nm(c)] : null,
            h("button",{class:"iconbtn bare","aria-label":t("review.remove"),style:"width:36px;height:36px",onclick:()=>{pending.splice(idx,1); if(!pending.length) discardPending(); else render();}}, svg(ICON.close)))),
        h("div",{class:"fields"},
          field(t("f.what"), h("input",{type:"text",id:"t"+it.id,value:it.title,oninput:e=>it.title=e.target.value}), true),
          field(t("f.type"), h("select",{id:"y"+it.id,onchange:e=>{it.type=e.target.value; render();}}, TYPE_KEYS.map(k=>h("option",{value:k,selected:k===it.type},typeName(k))))),
          field(t("f.who"), h("select",{id:"c"+it.id,onchange:e=>{it.childId=e.target.value; render();}}, h("option",{value:""},t("f.choose")), state.children.map(c=>h("option",{value:c.id,selected:c.id===it.childId},nm(c))))),
          field(it.type==="udalost"?t("f.date"):t("f.due"), h("input",{type:"date",id:"d"+it.id,value:it.date,onchange:e=>it.date=e.target.value})),
          field(t("f.time"), h("input",{type:"time",id:"h"+it.id,value:it.time,onchange:e=>it.time=e.target.value})),
          field(t("f.place"), h("input",{type:"text",id:"p"+it.id,value:it.place,oninput:e=>it.place=e.target.value}), true),
          field(t("f.repeat"), h("select",{id:"r"+it.id,onchange:e=>{it.repeat=e.target.value;}}, h("option",{value:""},t("f.noRepeat")), h("option",{value:"weekly",selected:it.repeat==="weekly"},t("f.weekly")))),
          field(t("f.untilShort"), h("input",{type:"date",id:"u"+it.id,value:it.until||"",onchange:e=>it.until=e.target.value})),
          isTask(it) ? parentField(it, "g"+it.id, pending) : null),
        it.note ? h("p",{class:"note",style:"margin:10px 0 0"}, it.note) : null,
        warn ? h("div",{class:"warntext"}, it.uncertain || (!it.childId ? t("review.noWho") : t("review.noDate"))) : null));
    });
    root.append(list);
    return root;
  }
  async function discardPending(){
    const fromMail = !!pendingInboxId;
    if (pendingInboxId) await dropInbox(pendingInboxId);
    const sid = pendingSourceId;
    pending = []; pendingInboxId = null; pendingSourceId = null;
    dropSourceIfUnused(sid);
    go(view.name === "review" && fromMail ? {name:"today"} : {name:"add"});
  }
  async function savePending(){
    if (pending.some(i => !i.childId)){ toast(t("review.needWho")); return; }
    const now = Date.now();
    pending.forEach(i => state.items.push(toItem(i, pendingSource, pendingSourceId, now)));
    const n = pending.length; const kid = pending[0].childId; const same = pending.every(i => i.childId === kid);
    pending = []; pendingSourceId = null; await save();
    if (pendingInboxId){ await dropInbox(pendingInboxId); pendingInboxId = null; }
    toast(t("savedN", n)); go(same ? {name:"child",id:kid} : {name:"today"});
  }

  function viewChild(id){
    const c = child(id); if (!c) return viewToday();
    const td = todayIso(); const d = new Date(td+"T12:00:00"); const mon = addDays(td, -((d.getDay()+6)%7));
    const mine = expand(addDays(td,-60), addDays(td,60)).filter(i => i.childId === id);
    const week = h("div",{class:"card week",role:"group","aria-label":t("child.week")});
    for (let k=0;k<7;k++){ const ds = addDays(mon,k); const dd = new Date(ds+"T12:00:00"); const cnt = mine.filter(i=>i.date===ds && !doneTask(i)).length;
      const dots = h("div",{class:"dots"}); for (let j=0;j<Math.min(cnt,3);j++) dots.append(h("i",{style:"background:"+c.color}));
      week.append(h("div",{}, h("div",{class:"d"},weekdayShort(dd)), h("div",{class:"n"+(ds===td?" today":"")}, dd.getDate()), dots)); }
    const events = mine.filter(i => i.type==="udalost" && (!i.date || i.date >= td) && (!i.date || i.date <= addDays(td,21))).sort(byDate);
    const tasks = mine.filter(i => isTask(i) && !i.done).sort((a,b)=> (a.date||"9").localeCompare(b.date||"9"));
    const root = h("div",{}, header(backBtn(), h("span",{class:"muted",style:"font-size:14px"}, [c.cls, c.school].filter(Boolean).join(" · "))),
      h("section",{style:"margin-top:12px;display:flex;align-items:center;gap:14px"}, h("span",{class:"dot",style:"width:14px;height:14px;border-radius:7px;background:"+c.color}), h("h1",{style:"font-size:48px;line-height:1"}, nm(c))),
      week);
    const ev = h("section",{class:"sec"}, h("div",{class:"eyebrow"},t("child.next3")));
    if (!events.length) ev.append(h("p",{class:"empty",style:"padding:12px 0"},t("child.noEvents")));
    const used = renderList(ev, events, {showChild:false, showDate:true}, tasks);
    const rest = tasks.filter(i => !used.has(i));
    const tk = h("section",{class:"sec"}, h("div",{class:"eyebrow"}, used.size ? t("child.moreTasks") : t("child.tasks")));
    if (!rest.length) tk.append(h("p",{class:"empty",style:"padding:12px 0"}, used.size ? t("child.restAbove") : t("child.noTasks")));
    rest.forEach(i => tk.append(itemRow(i,{showChild:false, showDate:true})));
    const dl = doneLink(id);
    root.append(ev, tk, ...(dl ? [h("div",{class:"sec"}, dl)] : []),
      h("div",{class:"sec",style:"display:flex;gap:8px;flex-wrap:wrap"},
        h("button",{class:"btn ghost small",onclick:()=>copyList(c)},t("child.copy")),
        h("button",{class:"btn ghost small",onclick:()=>{ filter = id; go({name:"calendar"}); }},t("cal.title"))));
    return root;
  }

  // Sbalitelná sekce Nastavení; co je otevřené, si pamatujeme i přes překreslení
  const openSecs = new Set();
  function fold(key, title, summary, ...body){
    const d = h("details",{class:"fold",open:openSecs.has(key)},
      h("summary",{}, h("span",{}, h("b",{}, title), summary ? h("small",{}, summary) : null), svg(ICON.next)), h("div",{class:"foldbody"}, ...body));
    d.addEventListener("toggle", () => { d.open ? openSecs.add(key) : openSecs.delete(key); });
    return d;
  }
  function viewFamily(){
    const root = h("div",{}, header(h("button",{class:"iconbtn bare","aria-label":t("back"),onclick:()=>go({name:"settings"})}, svg(ICON.back)), h("span")), h("h1",{class:"h",style:"margin-top:16px"},t("fam.title")),
      h("p",{class:"note",style:"margin:8px 0 0"},t("fam.sub")));
    const list = h("div",{class:"stack",style:"margin-top:20px"});
    state.children.forEach(c => {
      const nm = h("input",{type:"text",id:"n"+c.id,value:c.name,onchange:e=>{c.name=e.target.value.trim()||c.name; save(); render();}});
      const cl = h("input",{type:"text",id:"k"+c.id,value:c.cls||"",placeholder:t("fam.clsPh"),onchange:e=>{c.cls=e.target.value.trim(); save();}});
      const sc = h("input",{type:"text",id:"s"+c.id,value:c.school||"",placeholder:t("optional"),onchange:e=>{c.school=e.target.value.trim(); save();}});
      list.append(h("div",{class:"card"},
        isSelf(c) ? h("div",{class:"eyebrow"},t("you")) : null,
        h("div",{class:"fields"}, h("div",{class:"full"}, h("label",{class:"f",for:nm.id},t("fam.name")), nm),
          h("div",{}, h("label",{class:"f",for:cl.id},t("fam.cls")), cl), h("div",{}, h("label",{class:"f",for:sc.id},t("fam.school")), sc)),
        h("div",{class:"f"},t("color")),
        h("div",{class:"swatches",role:"group","aria-label":t("color")}, COLORS.map(col => h("button",{class:"sw","aria-label":t("color"),"aria-pressed":String(c.color===col),style:"background:"+col,onclick:()=>{c.color=col; save(); render();}}))),
        h("div",{style:"margin-top:14px"}, confirmDelete(c))));
    });
    const nn = h("input",{type:"text",id:"newname",placeholder:t("fam.newPh")});
    list.append(h("div",{class:"card"}, h("label",{class:"eyebrow",for:"newname"},t("fam.add")), nn,
      h("button",{class:"btn primary small",style:"margin-top:14px",onclick:()=>{ const v = nn.value.trim(); if(!v){nn.focus();return;}
        const used = state.children.map(c=>c.color); const color = COLORS.find(x=>!used.includes(x)) || COLORS[0];
        state.children.push({id:uid(), name:v, cls:"", school:"", color}); save(); render(); toast(t("fam.added", v)); }},t("add"))));
    root.append(list);
    return root;
  }

  function viewSettings(){
    const root = h("div",{}, header(backBtn(), h("span")), h("h1",{class:"h",style:"margin-top:16px"},t("set.title")));
    const fam = h("button",{class:"famrow",onclick:()=>go({name:"family"})},
      h("span",{class:"famdots"}, state.children.slice(0,6).map(c => h("i",{style:"background:"+c.color}))),
      h("span",{style:"flex:1;min-width:0"}, h("b",{},t("fam.title")),
        h("small",{}, state.children.length ? state.children.map(c => c.name + (isSelf(c) ? t("set.youSuffix") : "")).join(", ") : t("set.nobody"))),
      svg(ICON.next));
    root.append(h("div",{style:"margin-top:20px"}, fam));
    const folds = h("div",{class:"folds"});
    root.append(folds);

    // Co se ukládá bez kontroly
    if (profile){
      const types = autoTypes();
      const setType = async (k, on) => {
        const next = on ? [...new Set([...types, k])] : types.filter(x => x !== k);
        const r = await supabase.from("profiles").update({auto_types: next}).eq("id", profile.id);
        if (r.error){ toast(t("err.saveSql")); render(); return; }
        profile.auto_types = next; toast(t("saved")); render();
      };
      const opt = (k, label, hint) => h("label",{class:"opt"},
        h("input",{type:"checkbox",checked:types.includes(k),onchange:e=>setType(k, e.target.checked)}),
        h("span",{}, h("b",{}, label), h("small",{}, hint)));
      folds.append(fold("auto",t("auto.title"), types.filter(x=>TYPE_KEYS.includes(x)).length ? t("auto.sum", types.filter(x=>TYPE_KEYS.includes(x)).map(x=>t("typePl."+x)).join(", ")) : t("auto.none"),
        h("div",{},
          h("p",{class:"note",style:"margin:0 0 4px"},t("auto.note")),
          opt("udalost",t("auto.ev"),t("auto.evHint")),
          opt("ukol",t("auto.task"),t("auto.taskHint")),
          h("p",{class:"note",style:"margin:10px 0 0"},t("auto.note2")))));
    }

    if (profile) folds.append(notifySection());

    // Kalendář v telefonu
    if (profile?.feed_token){
      const feed = location.origin + "/api/calendar/" + profile.feed_token + ".ics";
      const webcal = feed.replace(/^https?:/, "webcal:");
      folds.append(fold("cal",t("feed.title"),"Google, iPhone, Outlook",
        h("div",{},
          h("p",{class:"note",style:"margin:0"},t("feed.note")),
          h("div",{class:"links"},
            h("a",{href:"https://calendar.google.com/calendar/r?cid=" + encodeURIComponent(webcal),target:"_blank",rel:"noopener"},t("feed.google")),
            h("a",{href:webcal},t("feed.apple")),
            h("a",{href:"https://outlook.live.com/calendar/0/addfromweb?url=" + encodeURIComponent(feed) + "&name=Aloiz",target:"_blank",rel:"noopener"},"Outlook"),
            h("button",{onclick:()=>copyText(feed,t("linkCopied"))},t("copyLink"))))));
    }

    // Přeposílání e-mailů
    if (inboundAddress && profile){
      const extra = h("input",{type:"text",id:"senders",value:(profile.sender_emails||[]).join(", "),placeholder:t("mail.extraPh")});
      folds.append(fold("mail",t("mail.title"), inboundAddress,
        h("div",{},
          h("p",{class:"note",style:"margin:0"},t("mail.addr"), h("span",{class:"addr"}, inboundAddress)),
          h("p",{class:"note"},t("mail.senderA"), h("b",{}, profile.email || ""), t("mail.senderB")),
          h("label",{class:"f",for:"senders"},t("mail.extra")), extra,
          h("button",{class:"btn ghost small",style:"margin-top:12px",onclick:async()=>{
            const list = extra.value.split(/[,;\s]+/).map(s=>s.trim().toLowerCase()).filter(s=>/.+@.+\..+/.test(s));
            const r = await supabase.from("profiles").update({sender_emails:list}).eq("id", profile.id);
            if (r.error){ toast(t("err.saveShort")); return; }
            profile.sender_emails = list; toast(t("saved")); render(); }},t("save")))));
    }

    // Jazyk: rovnou výběr v řádku, bez rozbalování
    folds.append(h("div",{class:"fold langrow"},
      h("label",{for:"set-lang"}, h("b",{},t("lang.title"))), langPicker("set-lang", true)));

    folds.append(fold("acc",t("acc.title"), session?.user?.email || "",
      h("button",{class:"btn ghost small",onclick:async()=>{ await disablePush(true); await supabase.auth.signOut(); }},t("acc.logout")),
      h("p",{class:"note",style:"margin-top:16px"}, h("a",{href:"/soukromi",style:"color:inherit"},t("privacy"))),
      deleteAccount()));
    return root;
  }
  function deleteAccount(){
    const wrap = h("div",{style:"margin-top:28px"});
    const btn = () => h("button",{class:"btn ghost small danger",onclick:ask}, svg(ICON.trash), t("acc.delete"));
    const ask = () => wrap.replaceChildren(h("div",{class:"card warncard"},
      h("b",{},t("acc.q")),
      h("p",{class:"note",style:"margin:6px 0 14px"},t("acc.text")),
      h("div",{style:"display:flex;gap:8px;flex-wrap:wrap"},
        h("button",{class:"btn primary small",onclick:doDelete},t("acc.yes")),
        h("button",{class:"btn ghost small",onclick:()=>wrap.replaceChildren(btn())},t("acc.no")))));
    const doDelete = async () => {
      wrap.replaceChildren(h("div",{class:"status",role:"status"}, h("span",{class:"spin"}), t("acc.deleting")));
      try{
        await disablePush(true);
        const r = await fetch("/api/account", {method:"DELETE", headers:{Authorization:"Bearer " + session.access_token}});
        if (!r.ok) throw new Error("http " + r.status);
        try{ localStorage.removeItem("aloiz-push-hint"); }catch{}
        try{ await supabase.auth.signOut(); }catch{}
        toast(t("acc.deleted"));
      }catch(e){ console.error(e); toast(t("acc.fail")); wrap.replaceChildren(btn()); }
    };
    wrap.append(btn()); return wrap;
  }
  function notifySection(){
    const card = h("div",{});
    const st = {
      on: [h("p",{class:"note",style:"margin:0"},t("push.onA"), h("b",{},t("push.onB")), t("push.onC")),
        h("div",{class:"links"}, h("button",{onclick:testPush},t("push.test")), h("button",{onclick:()=>disablePush()},t("push.offBtn")))],
      off: [h("p",{class:"note",style:"margin:0"},t("push.offText")),
        h("button",{class:"btn primary small",style:"margin-top:12px",disabled:busy,onclick:enablePush},t("push.enable"))],
      "ios-install": [h("p",{class:"note",style:"margin:0"},t("push.iosA"), h("b",{},t("push.iosShare")), t("push.iosB"), h("b",{},t("push.iosAdd")), t("push.iosC"))],
      denied: [h("p",{class:"note",style:"margin:0"},t("push.denied"))],
      unsupported: [h("p",{class:"note",style:"margin:0"},t("push.unsupported"))],
      unknown: [h("div",{class:"status",style:"margin:0"}, h("span",{class:"spin"}), t("push.checking"))],
    };
    if (!pushServer && pushState !== "unknown") card.append(h("p",{class:"note",style:"margin:0"},t("push.serverPending")));
    else card.append(...st[pushState]);

    const opt = (id, label, on, time, onToggle, onTime) => h("div",{class:"nopt"},
      h("input",{type:"checkbox",class:"switch",id,checked:on,onchange:e=>onToggle(e.target.checked)}),
      h("label",{for:id}, label),
      h("input",{type:"time",id:id+"-t",value:time,"aria-label":t("timeAria", label),disabled:!on,onchange:e=>{ if (e.target.value) onTime(e.target.value); }}));
    const m = profile.morning_on !== false, ev = !!profile.evening_on;
    const lead = profile.event_lead ?? 60;
    card.append(h("div",{style:"margin-top:14px"},
      opt("n-morning",t("push.morning"), m, profile.morning_time || "07:00",
        v=>{ saveNotify({morning_on:v}); render(); }, v=>saveNotify({morning_time:v})),
      opt("n-evening",t("push.evening"), ev, profile.evening_time || "19:00",
        v=>{ saveNotify({evening_on:v}); render(); }, v=>saveNotify({evening_time:v})),
      h("div",{class:"nopt"}, h("label",{for:"n-lead"},t("push.lead")),
        leadPicker("n-lead", String(lead), [["0",t("push.noRemind")], ...TIMED_LEADS()], v=>saveNotify({event_lead:Number(v)}), false))),
      h("p",{class:"note",style:"margin:10px 0 0"},t("push.note")));
    const sum = pushState === "on" ? t("push.sumOn", profile.morning_on !== false ? (profile.morning_time || "07:00") : "") : t("push.sumOff");
    return fold("push",t("push.title"), sum, card);
  }
  // Připomenutí předem, v minutách. U celodenních položek jde o minuty před půlnocí toho dne,
  // takže 360 = večer předem v 18:00, 1800 = dva dny předem v 18:00, -420 = v ten den v 7:00.
  function leadLabel(min){
    if (min >= 10080 && min % 10080 === 0){ const n = min/10080; return n + " " + t("unit.week", n); }
    if (min >= 1440 && min % 1440 === 0){ const n = min/1440; return n + " " + t("unit.day", n); }
    if (min >= 60 && min % 60 === 0){ const n = min/60; return n + " " + t("unit.hour", n); }
    return t("lead.min", min);
  }
  const TIMED_LEADS = () => [5,15,30,60,120,1440,10080].map(m => [String(m), t("lead.before", leadLabel(m))]);
  const dayLead = days => String((days - 1) * 1440 + 360);
  const ALLDAY_LEADS = () => [["-420",t("lead.dayOf")], [dayLead(1),t("lead.eveBefore")], [dayLead(2),t("lead.daysBefore", 2)], [dayLead(7),t("lead.weekBefore")]];
  const MAX_LEAD = 365 * 1440;

  /** Výběr připomínky: rychlé volby a „Vlastní…“ s číslem a jednotkou (5 minut až klidně 5 týdnů). */
  function leadPicker(id, value, presets, onPick, allDay){
    const units = allDay ? [[1,"unit.day"],[7,"unit.week"]]
      : [[1,"unit.minute"],[60,"unit.hour"],[1440,"unit.day"],[10080,"unit.week"]];
    const parts = v => {
      let n = Number(v);
      if (allDay) n = n >= 360 && (n - 360) % 1440 === 0 ? (n - 360) / 1440 + 1 : 3;
      else if (!(n > 0)) n = 3 * 1440;
      for (const [m] of [...units].reverse()) if (n % m === 0) return [n / m, m];
      return [n, 1];
    };
    const [n0, u0] = parts(value);
    const custom = !presets.some(([v]) => v === value);
    const num = h("input",{type:"number",id:id+"-n",min:1,max:999,step:1,inputmode:"numeric",value:n0,"aria-label":t("lead.howMany")});
    const unit = h("select",{id:id+"-u","aria-label":t("lead.unit")}, units.map(([m]) => h("option",{value:m,selected:m===u0},"")));
    const relabel = () => { const n = Math.round(Number(num.value)) || 0;
      units.forEach(([, k], i) => unit.options[i].textContent = t(k, n)); };
    const commit = () => {
      const n = Math.round(Number(num.value));
      if (!(n >= 1)) return;
      const m = Number(unit.value);
      onPick(allDay ? dayLead(Math.min(n * m, 365)) : String(Math.min(n * m, MAX_LEAD)));
    };
    num.addEventListener("input", relabel); num.addEventListener("change", commit); unit.addEventListener("change", commit);
    relabel();
    const row = h("div",{class:"leadcustom",hidden:!custom}, num, unit, h("span",{}, allDay ? t("lead.beforeAt18") : t("lead.beforeWord")));
    const sel = h("select",{id,onchange:e=>{
      const v = e.target.value;
      row.hidden = v !== "custom";
      if (v === "custom"){ commit(); num.focus(); num.select(); } else onPick(v);
    }}, [...presets, ["custom",t("lead.custom")]].map(([v,l]) => h("option",{value:v,selected:custom ? v === "custom" : v === value},l)));
    return h("div",{class:"leadpick"}, sel, row);
  }
  function remindPicker(it){
    const lead = profile?.event_lead ?? 60;
    const presets = it.time
      ? [["", t("lead.default", lead ? t("lead.before", leadLabel(lead)) : t("lead.noRemindLow"))], ["off",t("lead.off")], ...TIMED_LEADS()]
      : [["", t("lead.morningOnly")], ["off",t("lead.off")], ...ALLDAY_LEADS()];
    return leadPicker("e-remind", it.remind || "", presets, v => it.remind = v, !it.time);
  }
  function pushHint(){
    // „Teď ne“ se pamatuje v účtu, takže se nabídka neukáže znovu po přihlášení ani na jiném zařízení
    let dismissed = !!session?.user?.user_metadata?.aloiz_push_hint;
    try{ dismissed = dismissed || localStorage.getItem("aloiz-push-hint") === "1"; }catch{}
    if (dismissed || !pushServer || !["off","ios-install"].includes(pushState)) return null;
    const hide = async () => {
      try{ localStorage.setItem("aloiz-push-hint","1"); }catch{}
      render();
      const r = await supabase.auth.updateUser({data:{aloiz_push_hint:"1"}});
      if (!r.error && r.data?.user) session = {...session, user: r.data.user};
    };
    return h("div",{class:"card sec"}, h("div",{class:"eyebrow"},t("push.hintTitle")),
      h("p",{style:"margin:8px 0 14px;line-height:1.45"},t("push.hintText")),
      h("div",{style:"display:flex;gap:8px;flex-wrap:wrap"},
        h("button",{class:"btn primary small",onclick:()=> pushState === "off" ? enablePush() : go({name:"settings"})}, pushState === "off" ? t("push.enable") : t("push.howTo")),
        h("button",{class:"btn small",style:"background:transparent",onclick:hide},t("notNow"))));
  }
  function confirmDelete(c){
    const wrap = h("div",{});
    const ask = () => { wrap.replaceChildren(h("span",{class:"note",style:"margin-right:10px"},t("fam.delQ", c.name)),
      h("button",{class:"btn ghost small",onclick:()=>{ state.children = state.children.filter(x=>x.id!==c.id); state.items = state.items.filter(i=>i.childId!==c.id); if(filter===c.id) filter="all"; save(); render(); }},t("yes")),
      h("button",{class:"btn small",style:"background:transparent",onclick:()=>{ wrap.replaceChildren(btn()); }},t("no"))); };
    const btn = () => h("button",{class:"btn ghost small",onclick:ask}, svg(ICON.trash), t("remove"));
    wrap.append(btn()); return wrap;
  }

  function viewWelcome(){
    const me = state.children.find(isSelf);
    if (!me) return viewToday();
    const nm = h("input",{type:"text",id:"w-name",value:me.name,oninput:e=>{ me.name = e.target.value; },
      onchange:e=>{ me.name = e.target.value.trim() || myName(); save(); }});
    return h("div",{}, header(svg(LOGO), h("span")),
      h("section",{style:"margin-top:32px"}, h("div",{class:"eyebrow"},t("welcome.eyebrow")),
        h("h1",{class:"h",style:"margin-top:8px"},t("welcome.h")),
        h("p",{class:"lead muted"},t("welcome.text"))),
      h("div",{class:"card",style:"margin-top:24px"},
        h("div",{style:"display:flex;align-items:center;gap:14px"}, h("span",{class:"dot",style:"width:14px;height:14px;border-radius:7px;background:"+me.color}),
          h("div",{style:"flex:1"}, h("label",{class:"f",for:"w-name",style:"margin-top:0"},t("welcome.name")), nm)),
        h("div",{class:"f"},t("color")),
        h("div",{class:"swatches",role:"group","aria-label":t("welcome.color")}, COLORS.map(col => h("button",{class:"sw","aria-label":t("color"),"aria-pressed":String(me.color===col),style:"background:"+col,
          onclick:()=>{ me.color = col; save(); render(); }})))));
  }

  function viewDone(v){
    const mem = v.member ? child(v.member) : null;
    const list = state.items.filter(i => doneTask(i) && (!mem || i.childId === mem.id))
      .sort((a,b) => (b.date||"0").localeCompare(a.date||"0") || (b.createdAt||0)-(a.createdAt||0));
    const root = h("div",{}, header(h("button",{class:"iconbtn bare","aria-label":t("back"),onclick:back}, svg(ICON.back)), h("span")),
      h("h1",{class:"h",style:"margin-top:12px"}, t("done") + (mem ? " · " + mem.name : "")),
      h("p",{class:"note",style:"margin:8px 0 0"},t("done.sub")));
    const sec = h("section",{class:"sec"});
    if (!list.length) sec.append(h("p",{class:"empty"},t("done.empty")));
    list.forEach(i => sec.append(itemRow(i,{showChild: !mem && state.children.length>1, showDate:true})));
    root.append(sec);
    if (list.length > 1){
      const wrap = h("div",{class:"sec"});
      const ask = () => wrap.replaceChildren(h("span",{class:"note",style:"margin-right:10px"},t("done.clearQ", list.length)),
        h("button",{class:"btn ghost small danger",onclick:()=>{ const ids = new Set(list.map(i=>i.id)); state.items = state.items.filter(i=>!ids.has(i.id)); save(); toast(t("deleted")); render(); }},t("yes")),
        h("button",{class:"btn small",style:"background:transparent",onclick:()=>wrap.replaceChildren(btn())},t("no")));
      const btn = () => h("button",{class:"btn ghost small",onclick:ask}, svg(ICON.trash), t("done.clear"));
      wrap.append(btn()); root.append(wrap);
    }
    return root;
  }

  function viewSource(v){
    const from = v.from || {name:"today"};
    const root = h("div",{}, header(h("button",{class:"iconbtn bare","aria-label":t("back"),onclick:()=>go(from)}, svg(ICON.back)), h("span")));
    if (!v.id){ root.append(h("p",{class:"empty"},t("src.notFound"))); return root; }
    const src = sourceCache.get(v.id);
    if (!src){
      root.append(h("div",{class:"status",role:"status"}, h("span",{class:"spin"}), t("src.loading")));
      if (!v.loading){ v.loading = true; loadSource(v.id).then(x => { if (view !== v) return; if (!x) v.missing = true; render(); }); }
      if (v.missing){ root.replaceChildren(root.firstChild, h("p",{class:"empty"},t("src.loadFail"))); }
      return root;
    }
    const when = new Date(src.created_at);
    root.append(h("div",{class:"eyebrow",style:"margin-top:12px"}, t("src.eyebrow", fullDate(when))),
      h("h1",{class:"h",style:"margin-top:6px;overflow-wrap:anywhere"}, src.label || t("src.msg")));
    if (src.note) root.append(h("div",{class:"card",style:"margin-top:16px"}, h("div",{class:"eyebrow"},t("src.yourNote")), h("p",{class:"srctext"}, src.note)));
    const files = src.files || [];
    if (files.length){
      const g = h("div",{class:"srcfiles"});
      files.forEach(f => { const u = src.urls[f.path]; if (!u) return;
        g.append(f.type === "application/pdf"
          ? h("a",{class:"btn ghost small",href:u,target:"_blank",rel:"noopener"}, svg(ICON.file), t("src.openPdf") + (f.name ? " · " + f.name : ""))
          : h("a",{href:u,target:"_blank",rel:"noopener","aria-label":t("src.openPhoto")}, h("img",{src:u,alt:f.name||t("src.photoAlt")}))); });
      root.append(g);
    }
    if (src.body) root.append(h("div",{class:"card",style:"margin-top:16px"}, h("div",{class:"eyebrow"}, src.kind === "email" ? t("src.emailText") : t("src.msgText")), h("p",{class:"srctext"}, src.body)));
    const items = state.items.filter(i => i.sourceId === v.id);
    if (items.length){
      const sec = h("section",{class:"sec"}, h("div",{class:"eyebrow"},t("src.savedFrom")));
      items.forEach(i => sec.append(itemRow(i,{showChild: state.children.length>1, showDate:true})));
      root.append(sec);
    }
    return root;
  }

  function fab(){
    fabEl.replaceChildren();
    if (!session || loading) return;
    if (view.name === "welcome"){
      const done = (to) => { const n = document.getElementById("w-name"); const me = state.children.find(isSelf);
        if (n && me){ me.name = n.value.trim() || myName(); save(); } go(to); };
      fabEl.append(h("button",{class:"btn ghost",onclick:()=>done({name:"today"})},t("skip")),
        h("button",{class:"btn primary",style:"flex:1;max-width:220px",onclick:()=>{ done({name:"family"}); setTimeout(()=>document.getElementById("newname")?.focus(), 50); }}, t("continue"), svg(ICON.next)));
      return;
    }
    if (view.name === "review"){
      fabEl.append(h("button",{class:"btn ghost",onclick:discardPending},t("discard")),
        h("button",{class:"btn primary",style:"flex:1;max-width:300px",onclick:savePending},t("saveAll")));
    } else if (view.name === "edit"){
      fabEl.append(h("button",{class:"btn primary",style:"flex:1;max-width:340px",onclick:saveEdit},t("save")));
    } else if ((view.name === "today" || view.name === "child") && state.children.length){
      fabEl.append(h("button",{class:"btn primary",onclick:()=>go({name:"add"})}, svg(ICON.plus),
        view.name==="child" ? t("addFor", child(view.id)?.name||"") : t("add")));
    }
  }

  function render(){
    let node;
    if (loading) node = h("div",{class:"login"}, svg(LOGO), h("div",{class:"status",role:"status"}, h("span",{class:"spin"}), t("loading")));
    else if (!session) node = viewLogin();
    else if (view.name === "add") node = viewAdd();
    else if (view.name === "review") node = viewReview();
    else if (view.name === "child") node = viewChild(view.id);
    else if (view.name === "settings") node = viewSettings();
    else if (view.name === "edit") node = viewEdit(view);
    else if (view.name === "calendar") node = viewCalendar(view);
    else if (view.name === "done") node = viewDone(view);
    else if (view.name === "welcome") node = viewWelcome();
    else if (view.name === "family") node = viewFamily();
    else if (view.name === "source") node = viewSource(view);
    else if (view.name === "copy") node = h("div",{}, header(h("button",{class:"iconbtn bare","aria-label":t("back"),onclick:back}, svg(ICON.back)), h("span")),
      h("h1",{class:"h",style:"margin-top:12px"},t("copy.title")), h("p",{class:"note"},t("copy.hint")),
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
    if (changedUser){ loading = true; render(); await load(); const fresh = await ensureSelf(); if (fresh) view = {name:"welcome"}; loading = false; render(); refreshPush().then(render); if (!fresh) takeShared(); }
  }
  // Něco nasdílené z jiné aplikace (Sdílet > Aloiz): service worker to uložil do cache.
  async function takeShared(){
    if (!/[?&]share=1/.test(location.search)) return;
    try{ history.replaceState(null, "", location.pathname); }catch{}
    if (!("caches" in window)) return;
    try{
      const cache = await caches.open("aloiz-share");
      const m = await cache.match("/share-meta"); if (!m){ go({name:"add"}); return; }
      const meta = await m.json(), files = [];
      for (const f of meta.files || []){ const r = await cache.match(f.key); if (r) files.push(new File([await r.blob()], f.name || "soubor", {type: f.type || r.headers.get("Content-Type") || ""})); }
      await caches.delete("aloiz-share");
      if (meta.text && !files.length) setDraft(meta.text);
      else if (meta.text) stagedNote = meta.text;
      if (files.length) handleFiles(files); else go({name:"add"});
    }catch(e){ console.error(e); go({name:"add"}); }
  }
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(()=>{});
  render();
  supabase.auth.getSession().then(({data}) => onSession(data.session));
  const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setTimeout(() => onSession(s), 0); });
  // Po návratu do aplikace načíst novinky (např. e-mail přeposlaný mezitím)
  const onVisible = async () => {
    if (document.visibilityState !== "visible" || !session || busy || ["edit","review"].includes(view.name)) return;
    await saving; await load(); render();
  };
  document.addEventListener("visibilitychange", onVisible);
  return () => { sub?.subscription?.unsubscribe(); document.removeEventListener("visibilitychange", onVisible); window.removeEventListener("popstate", onPop); };
}
