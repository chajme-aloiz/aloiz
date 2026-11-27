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
const LOGO = '<svg class="logo" role="img" aria-label="aloiz" width="72" height="30" viewBox="108 246 616 258" fill="none"><circle cx="200" cy="410" r="86.25" stroke="#E6215C" stroke-width="1.8"/><line x1="286.25" y1="320" x2="286.25" y2="500" stroke="#E6215C" stroke-width="1.8"/><line x1="321.75" y1="250" x2="321.75" y2="500" stroke="var(--logo-dark)" stroke-width="1.2"/><circle cx="437.5" cy="410" r="87.5" stroke="var(--logo-dark)" stroke-width="1.2"/><line x1="554.25" y1="320" x2="554.25" y2="500" stroke="#E6215C" stroke-width="1.8"/><path d="M585.5 322.5 H711.5 L588.5 497.5 H718" stroke="var(--logo-dark)" stroke-width="1.2"/><circle cx="554.25" cy="290" r="13" fill="#E6215C"/></svg>';

export function mount({ supabase, inboundAddress, appEl, fabEl, toastEl }) {
  let state = {children:[], items:[]};
  let synced = {children:new Map(), items:new Map()}; // co je uložené na serveru (JSON podle id)
  let session = null, profile = null, inbox = [];
  let loading = true;
  let view = {name:"today"};
  let prevView = {name:"today"};
  let filter = "all";
  let pending = [], pendingSource = "", pendingInboxId = null;
  let busy = false, busyText = "";
  let loginSent = "";
  let rec = null, recording = false, draftText = "";

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
  function toast(msg){ toastEl.textContent = msg; toastEl.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(()=> toastEl.hidden = true, 2800); }

  // ---------- data (Supabase) ----------
  const childToRow = c => ({id:c.id, name:c.name, cls:c.cls||"", school:c.school||"", color:c.color});
  const itemToRow = i => ({id:i.id, child_id:i.childId||null, type:i.type, title:i.title, due_date:i.date||"", due_time:i.time||"",
    place:i.place||"", note:i.note||"", done:!!i.done, source:i.source||"", repeat_rule:i.repeat||"", repeat_until:i.until||"",
    skip_dates:i.skip||[], created_ms:i.createdAt||Date.now()});
  const rowToChild = r => ({id:r.id, name:r.name, cls:r.cls, school:r.school, color:r.color});
  const rowToItem = r => ({id:r.id, childId:r.child_id||"", type:r.type, title:r.title, date:r.due_date, time:r.due_time, place:r.place,
    note:r.note, done:r.done, source:r.source, repeat:r.repeat_rule, until:r.repeat_until, skip:r.skip_dates||[], createdAt:Number(r.created_ms)});

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

  async function extract({text, files, source}){
    busy = true; busyText = files?.length ? (files.some(f => isPdf(f)) ? "Čtu PDF…" : "Čtu fotku…") : "Čtu zprávu…"; render();
    try{
      const images = [], pdfs = [];
      for (const f of files || []){
        if (isPdf(f)){
          if (f.size > MAX_PDF_BYTES) throw Object.assign(new Error("pdf"), {code:"pdf_big"});
          pdfs.push({data: await blobToBase64(f)});
        } else images.push(await shrinkImage(f));
      }
      const res = await fetch("/api/extract", {method:"POST",
        headers:{"Content-Type":"application/json", Authorization:"Bearer " + session.access_token},
        body: JSON.stringify({text: text||"", images, pdfs, kids: kidsForAi()})});
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw Object.assign(new Error("api"), {code: out.error || (res.status === 413 ? "too_big" : "failed")});
      busy = false;
      startReview(out.items || [], source, null);
    }catch(e){
      busy = false;
      const msg = {rate_limited:"Moc požadavků najednou, zkuste to za chvíli.", image_rejected:"Tenhle obrázek se nepodařilo přečíst. Zkuste jinou fotku.",
        refused:"Tuhle zprávu se nepodařilo zpracovat.", pdf_big:"PDF je moc velké. Zkuste screenshot stránky.", too_big:"Soubory jsou moc velké. Zkuste méně fotek.",
        not_allowed:"Čtení přes AI je zatím jen pro pozvané účty.", login:"Přihlášení vypršelo, přihlaste se znovu."}[e?.code];
      toast(msg || "Čtení se nepovedlo, zkuste to znovu."); render();
    }
  }
  function startReview(list, source, inboxId){
    pending = list.map(x => ({...x, id: x.id || uid(), childId: child(x.childId) ? x.childId : (state.children.length === 1 ? state.children[0].id : "")}));
    pendingSource = source; pendingInboxId = inboxId;
    if (!pending.length){ toast("V té zprávě jsem nic k zapsání nenašel."); render(); return; }
    go({name:"review"});
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
    const pdfs = usable.filter(isPdf).slice(0, 2);
    const imgs = usable.filter(f => !isPdf(f)).slice(0, MAX_IMAGES);
    if (usable.filter(f => !isPdf(f)).length > imgs.length) toast("Najednou přečtu nejvýš " + MAX_IMAGES + " fotky, beru první.");
    const all = [...pdfs, ...imgs];
    const src = pdfs.length && !imgs.length ? "Z PDF · " + pdfs[0].name : all.length > 1 ? "Z " + all.length + " souborů" : "Z fotky";
    extract({files: all, source: src});
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
      h("h1",{}, "Školní život dětí", h("br"), "na jednom místě."),
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
        h("button",{class:"btn primary small",style:"margin-top:14px",onclick:send},"Poslat odkaz")));
    em.addEventListener("keydown", e => { if (e.key === "Enter") send(); });
    return root;
  }

  // ---------- ruční zadání / úprava ----------
  function newItem(){ return {id:uid(), childId: filter!=="all" ? filter : (state.children.length===1 ? state.children[0].id : ""), type:"udalost", title:"", date:"", time:"", place:"", note:"", repeat:"", until:"", done:false, _new:true}; }
  const field = (lab, el, full) => h("div",{class: full?"full":""}, h("label",{class:"f",for:el.id}, lab), el);
  function viewEdit(v){
    const src = v.item || state.items.find(i => i.id === v.id);
    if (!src) return viewToday();
    if (!v.draft) v.draft = {...src};
    const it = v.draft;
    const fields = h("div",{class:"fields"},
      field("Co", h("input",{type:"text",id:"e-title",value:it.title,placeholder:"např. Divadlo, flétna, souhlas s výletem",oninput:e=>it.title=e.target.value}), true),
      field("Typ", h("select",{id:"e-type",onchange:e=>{it.type=e.target.value; render();}}, Object.entries(TYPES).map(([k,l])=>h("option",{value:k,selected:k===it.type},l)))),
      field("Dítě", h("select",{id:"e-kid",onchange:e=>it.childId=e.target.value}, h("option",{value:""},"Vyberte dítě"), state.children.map(c=>h("option",{value:c.id,selected:c.id===it.childId},c.name)))),
      field(it.type==="udalost"?"Datum":"Do kdy", h("input",{type:"date",id:"e-date",value:it.date,onchange:e=>it.date=e.target.value})),
      field("Čas", h("input",{type:"time",id:"e-time",value:it.time,onchange:e=>it.time=e.target.value})),
      field("Místo", h("input",{type:"text",id:"e-place",value:it.place,oninput:e=>it.place=e.target.value}), true),
      field("Opakování", h("select",{id:"e-rep",onchange:e=>{it.repeat=e.target.value; render();}}, h("option",{value:""},"Neopakovat"), h("option",{value:"weekly",selected:it.repeat==="weekly"},"Každý týden"))),
      it.repeat ? field("Opakovat do", h("input",{type:"date",id:"e-until",value:it.until||"",onchange:e=>it.until=e.target.value})) : h("div"),
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
        it.source ? h("p",{class:"tag",style:"margin:12px 0 0"}, "Zdroj: " + it.source) : null),
      del);
  }
  function saveEdit(){
    const it = view.draft; if (!it) return;
    if (!it.title.trim()){ toast("Napište, co to je."); document.getElementById("e-title")?.focus(); return; }
    if (!it.childId){ toast("Vyberte dítě."); return; }
    const clean = {...it, title: it.title.trim()}; delete clean._new; delete clean._base; delete clean._occ;
    const idx = state.items.findIndex(i => i.id === clean.id);
    if (idx >= 0) state.items[idx] = {...state.items[idx], ...clean};
    else state.items.push({...clean, createdAt: Date.now(), source: "Ručně"});
    save(); toast("Uloženo.");
    go(["add","edit","review"].includes(prevView.name) ? {name:"today"} : prevView);
  }
  function back(){ go(prevView.name === "edit" ? {name:"today"} : prevView); }
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
    dayList.forEach(i => sec.append(itemRow(i,{showChild: state.children.length>1})));
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
    return h("div",{class:"chips",role:"group","aria-label":"Děti"},
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
    const mine = expand(t, addDays(t,14)).filter(i => i.childId===c.id && !i.done && (!i.date || i.date >= t)).sort(byDate);
    const text = c.name + " – co nás čeká:\n" + mine.map(i => "• " + (i.date?prettyDate(i.date)+(i.time?" "+i.time:"")+": ":"") + (i.type==="donest"?"donést ":"") + i.title + (i.place?" ("+i.place+")":"")).join("\n");
    copyText(text, "Zkopírováno, můžete to poslat.");
  }

  // ---------- navigace ----------
  function go(v){ view = v; render(); window.scrollTo(0,0); }
  const header = (left, right) => h("div",{class:"top"}, left, right);
  function backBtn(label="Zpět"){ return h("button",{class:"iconbtn bare","aria-label":label,onclick:()=>go({name:"today"})}, svg(label==="Zavřít"?ICON.close:ICON.back)); }

  // ---------- obrazovky ----------
  function itemRow(it, {showChild=true, showDate=false}={}){
    const c = child(it.childId);
    const isTask = it.type !== "udalost";
    const sub = h("div",{class:"sub"},
      c && showChild ? [h("span",{class:"dot",style:"width:6px;height:6px;background:"+c.color}), c.name] : null,
      showDate ? (c&&showChild?" · ":"") + prettyDate(it.date) : null,
      (c&&showChild)||showDate ? " · " : "", TYPES[it.type].toLowerCase(),
      it.place ? " · " + it.place : "");
    if (it.repeat === "weekly") sub.append(" · každý týden");
    const body = h("div",{style:"flex:1;min-width:0"}, h("button",{class:"ttl linkbtn","aria-label":"Upravit: "+it.title,onclick:()=>openEdit(it)}, it.title), sub);
    const row = h("div",{class:"row"+(it.done?" done":"")}, h("div",{class:"time"}, it.time || "—"), body);
    if (isTask){
      const b = h("button",{class:"check","aria-label": it.done?"Označit jako nehotové":"Hotovo","aria-pressed":String(!!it.done),
        onclick:()=>{ const b = base(it); b.done = !b.done; save(); render(); }});
      const s = h("span"); if (it.done) s.append(svg(ICON.tick)); b.append(s); row.append(b);
    }
    return row;
  }

  function inboxCards(){
    return inbox.map(b => h("section",{class:"inboxcard"},
      h("div",{class:"eyebrow",style:"display:flex;gap:8px;align-items:center"}, svg(ICON.mail), "Přeposlaný e-mail"),
      h("div",{class:"ttl",style:"margin-top:8px"}, b.source.replace(/^E-mail: /,"")),
      h("div",{class:"sub"}, "Našel jsem " + czFound((b.items||[]).length) + " Nic se nezapíše bez vás."),
      h("div",{style:"display:flex;gap:8px;margin-top:12px"},
        h("button",{class:"btn primary small",onclick:()=>startReview(b.items||[], b.source, b.id)},"Zkontrolovat"),
        h("button",{class:"btn small",style:"background:transparent",onclick:async()=>{ await dropInbox(b.id); render(); }},"Zahodit"))));
  }

  function viewToday(){
    const t = todayIso(); const d = new Date();
    const vis = expand(addDays(t,-60), addDays(t,14)).filter(i => filter==="all" || i.childId===filter);
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
      h("button",{class:"iconbtn","aria-label":"Děti a nastavení",onclick:()=>go({name:"settings"})}, svg(ICON.user)));
    const lead = !state.children.length ? "Začněte tím, že přidáte své dítě." :
      (openToday || tomorrow) ? `Dnes ${czCount(openToday)}, zítra ${czCount(tomorrow)}.` : "Dnes i zítra máte volno.";
    const root = h("div",{},
      header(svg(LOGO), right),
      h("section",{style:"margin-top:32px"},
        h("div",{class:"muted",style:"font-size:14px"}, DAYS[d.getDay()] + " · " + MONTHS[d.getMonth()]),
        h("h1",{class:"big",style:"margin-top:6px"}, d.getDate()+"."),
        h("p",{class:"lead"}, lead)));
    if (!state.children.length){
      root.append(h("div",{class:"card sec"}, h("div",{class:"eyebrow"},"První krok"),
        h("p",{style:"margin:8px 0 14px;line-height:1.45"},"Přidejte dítě, aby Aloiz věděl, komu co patří. Stačí jméno, třída pomůže."),
        h("button",{class:"btn primary small",onclick:()=>go({name:"settings"})},"Přidat dítě")));
      return root;
    }
    root.append(...inboxCards());
    const cc = childChips(); if (cc) root.append(cc);
    root.append(h("div",{class:"chips",style:"margin-top:12px"}, state.children.map(c =>
      h("button",{class:"chip",onclick:()=>go({name:"child",id:c.id})}, h("span",{class:"dot",style:"background:"+c.color}), "Přehled: "+c.name))));
    if (prep.length){ const p = h("section",{class:"prep"}, h("div",{class:"eyebrow"},"Připravit na zítra"));
      prep.forEach(i => p.append(itemRow(i,{showChild: state.children.length>1}))); root.append(p); }
    if (overdue.length) root.append(group("Po termínu", overdue, true));
    root.append(group("Dnes", today, false, "Na dnešek nic nemáte."));
    if (soon.length) groupByDate(soon).forEach(([dt, list]) => root.append(group(prettyDate(dt), list)));
    if (nodate.length) root.append(group("Bez termínu", nodate));
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
    list.forEach(i => s.append(itemRow(i,{showChild: filter==="all" && state.children.length>1, showDate})));
    return s;
  }

  function viewAdd(){
    const root = h("div",{}, header(svg(LOGO), backBtn("Zavřít")),
      h("section",{style:"margin-top:28px"}, h("h1",{class:"h"},"Co přišlo", h("br"), "ze školy?")));
    if (!state.children.length){ root.append(h("p",{class:"empty"},"Nejdřív přidejte dítě v nastavení.")); return root; }
    const onPick = e => { const files = [...(e.target.files||[])]; e.target.value = ""; handleFiles(files); };
    const t1 = h("label",{class:"tile"}, svg(ICON.cam), h("div",{}, h("b",{},"Vyfotit"), h("small",{},"lísteček, nástěnka")),
      h("input",{type:"file",accept:"image/*",capture:"environment","aria-label":"Vyfotit",onchange:onPick}));
    const t2 = h("label",{class:"tile"}, svg(ICON.file), h("div",{}, h("b",{},"Soubor"), h("small",{},"PDF, screenshoty, víc fotek")),
      h("input",{type:"file",multiple:true,accept:"application/pdf,.pdf,image/*","aria-label":"Nahrát soubor",onchange:onPick}));
    root.append(h("div",{class:"grid2",style:"margin-top:24px"}, t1, t2));

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
        h("p",{class:"muted",style:"font-size:15px;line-height:1.45;margin:10px 0 0"},"Zkontrolujte je a uložte. Nic se nezapíše bez vás.")));
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
          field("Dítě", h("select",{id:"c"+it.id,onchange:e=>{it.childId=e.target.value; render();}}, h("option",{value:""},"Vyberte dítě"), state.children.map(c=>h("option",{value:c.id,selected:c.id===it.childId},c.name)))),
          field(it.type==="udalost"?"Datum":"Do kdy", h("input",{type:"date",id:"d"+it.id,value:it.date,onchange:e=>it.date=e.target.value})),
          field("Čas", h("input",{type:"time",id:"h"+it.id,value:it.time,onchange:e=>it.time=e.target.value})),
          field("Místo", h("input",{type:"text",id:"p"+it.id,value:it.place,oninput:e=>it.place=e.target.value}), true),
          field("Opakování", h("select",{id:"r"+it.id,onchange:e=>{it.repeat=e.target.value;}}, h("option",{value:""},"Neopakovat"), h("option",{value:"weekly",selected:it.repeat==="weekly"},"Každý týden"))),
          field("Do", h("input",{type:"date",id:"u"+it.id,value:it.until||"",onchange:e=>it.until=e.target.value}))),
        it.note ? h("p",{class:"note",style:"margin:10px 0 0"}, it.note) : null,
        warn ? h("div",{class:"warntext"}, it.uncertain || (!it.childId ? "Nevím, pro které dítě to je. Vyberete?" : "Chybí datum. Doplníte?")) : null));
    });
    root.append(list);
    return root;
  }
  async function discardPending(){
    if (pendingInboxId) await dropInbox(pendingInboxId);
    pending = []; pendingInboxId = null; go(view.name === "review" && pendingSource.startsWith("E-mail") ? {name:"today"} : {name:"add"});
  }
  async function savePending(){
    if (pending.some(i => !i.childId)){ toast("U každé položky vyberte dítě."); return; }
    const now = Date.now();
    pending.forEach(i => state.items.push({id:i.id, childId:i.childId, type:i.type, title:(i.title||"").trim()||"Bez názvu", date:i.date||"", time:i.time||"",
      place:i.place||"", note:i.note||"", done:false, createdAt:now, source:pendingSource, repeat:i.repeat||"", until:i.until||"", skip:[]}));
    const n = pending.length; const kid = pending[0].childId; const same = pending.every(i => i.childId === kid);
    pending = []; await save();
    if (pendingInboxId){ await dropInbox(pendingInboxId); pendingInboxId = null; }
    toast(n===1?"Uloženo.":"Uloženo, "+n+" položky."); go(same ? {name:"child",id:kid} : {name:"today"});
  }

  function viewChild(id){
    const c = child(id); if (!c) return viewToday();
    const t = todayIso(); const d = new Date(t+"T12:00:00"); const mon = addDays(t, -((d.getDay()+6)%7));
    const mine = expand(addDays(t,-60), addDays(t,60)).filter(i => i.childId === id);
    const week = h("div",{class:"card week",role:"group","aria-label":"Tento týden"});
    for (let k=0;k<7;k++){ const ds = addDays(mon,k); const dd = new Date(ds+"T12:00:00"); const cnt = mine.filter(i=>i.date===ds).length;
      const dots = h("div",{class:"dots"}); for (let j=0;j<Math.min(cnt,3);j++) dots.append(h("i",{style:"background:"+c.color}));
      week.append(h("div",{}, h("div",{class:"d"},DAYS_S[dd.getDay()]), h("div",{class:"n"+(ds===t?" today":"")}, dd.getDate()), dots)); }
    const events = mine.filter(i => i.type==="udalost" && (!i.date || i.date >= t) && (!i.date || i.date <= addDays(t,21))).sort(byDate);
    const tasks = mine.filter(i => i.type!=="udalost").sort((a,b)=> (a.done-b.done) || (a.date||"9").localeCompare(b.date||"9"));
    const root = h("div",{}, header(backBtn(), h("span",{class:"muted",style:"font-size:14px"}, [c.cls, c.school].filter(Boolean).join(" · "))),
      h("section",{style:"margin-top:12px;display:flex;align-items:center;gap:14px"}, h("span",{class:"dot",style:"width:14px;height:14px;border-radius:7px;background:"+c.color}), h("h1",{style:"font-size:48px;line-height:1"}, c.name)),
      week);
    const ev = h("section",{class:"sec"}, h("div",{class:"eyebrow"},"Co čeká v příštích 3 týdnech"));
    if (!events.length) ev.append(h("p",{class:"empty",style:"padding:12px 0"},"Žádné akce v kalendáři."));
    events.forEach(i => ev.append(itemRow(i,{showChild:false, showDate:true})));
    const tk = h("section",{class:"sec"}, h("div",{class:"eyebrow"},"Úkoly a donést"));
    if (!tasks.length) tk.append(h("p",{class:"empty",style:"padding:12px 0"},"Nic k udělání ani donesení."));
    tasks.forEach(i => tk.append(itemRow(i,{showChild:false, showDate:true})));
    root.append(ev, tk,
      h("div",{class:"sec",style:"display:flex;gap:8px;flex-wrap:wrap"},
        h("button",{class:"btn ghost small",onclick:()=>copyList(c)},"Zkopírovat přehled pro druhého rodiče"),
        h("button",{class:"btn ghost small",onclick:()=>{ filter = id; go({name:"calendar"}); }},"Kalendář")));
    return root;
  }

  function viewSettings(){
    const root = h("div",{}, header(backBtn(), h("span")), h("h1",{class:"h",style:"margin-top:16px"},"Děti"));
    const list = h("div",{class:"stack",style:"margin-top:20px"});
    state.children.forEach(c => {
      const nm = h("input",{type:"text",id:"n"+c.id,value:c.name,onchange:e=>{c.name=e.target.value.trim()||c.name; save(); render();}});
      const cl = h("input",{type:"text",id:"k"+c.id,value:c.cls||"",placeholder:"např. 3.B",onchange:e=>{c.cls=e.target.value.trim(); save();}});
      const sc = h("input",{type:"text",id:"s"+c.id,value:c.school||"",placeholder:"např. ZŠ Vodárenská",onchange:e=>{c.school=e.target.value.trim(); save();}});
      list.append(h("div",{class:"card"},
        h("div",{class:"fields"}, h("div",{class:"full"}, h("label",{class:"f",for:nm.id},"Jméno"), nm),
          h("div",{}, h("label",{class:"f",for:cl.id},"Třída"), cl), h("div",{}, h("label",{class:"f",for:sc.id},"Škola"), sc)),
        h("div",{class:"f"},"Barva"),
        h("div",{class:"swatches",role:"group","aria-label":"Barva dítěte"}, COLORS.map(col => h("button",{class:"sw","aria-label":"Barva","aria-pressed":String(c.color===col),style:"background:"+col,onclick:()=>{c.color=col; save(); render();}}))),
        h("div",{style:"margin-top:14px"}, confirmDelete(c))));
    });
    const nn = h("input",{type:"text",id:"newname",placeholder:"Jméno dítěte"});
    list.append(h("div",{class:"card"}, h("label",{class:"eyebrow",for:"newname"},"Přidat dítě"), nn,
      h("button",{class:"btn primary small",style:"margin-top:14px",onclick:()=>{ const v = nn.value.trim(); if(!v){nn.focus();return;}
        const used = state.children.map(c=>c.color); const color = COLORS.find(x=>!used.includes(x)) || COLORS[0];
        state.children.push({id:uid(), name:v, cls:"", school:"", color}); save(); render(); toast("Přidáno: "+v); }},"Přidat")));
    root.append(list);

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
      h("button",{class:"btn ghost small",onclick:async()=>{ await supabase.auth.signOut(); }},"Odhlásit se")));
    return root;
  }
  function confirmDelete(c){
    const wrap = h("div",{});
    const ask = () => { wrap.replaceChildren(h("span",{class:"note",style:"margin-right:10px"},"Smazat "+c.name+" i jeho položky?"),
      h("button",{class:"btn ghost small",onclick:()=>{ state.children = state.children.filter(x=>x.id!==c.id); state.items = state.items.filter(i=>i.childId!==c.id); if(filter===c.id) filter="all"; save(); render(); }},"Smazat"),
      h("button",{class:"btn small",style:"background:transparent",onclick:()=>{ wrap.replaceChildren(btn()); }},"Ne")); };
    const btn = () => h("button",{class:"btn ghost small",onclick:ask},"Odebrat dítě");
    wrap.append(btn()); return wrap;
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
    if (changedUser){ loading = true; render(); await load(); loading = false; render(); }
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
