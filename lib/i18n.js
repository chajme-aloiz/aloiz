// Jazyky aplikace. Výchozí jazyk podle zařízení, volba se pamatuje v prohlížeči (a v profilu na serveru).
import cs from "./i18n/cs.js";
import en from "./i18n/en.js";
import sk from "./i18n/sk.js";
import pl from "./i18n/pl.js";
import de from "./i18n/de.js";
import es from "./i18n/es.js";
import fr from "./i18n/fr.js";
import zh from "./i18n/zh.js";
import hi from "./i18n/hi.js";

const DICTS = { cs, en, sk, pl, de, es, fr, zh, hi };
export const LANGS = [
  { code: "cs", name: "Čeština" }, { code: "en", name: "English" }, { code: "sk", name: "Slovenčina" },
  { code: "pl", name: "Polski" }, { code: "de", name: "Deutsch" }, { code: "es", name: "Español" },
  { code: "fr", name: "Français" }, { code: "zh", name: "中文（简体）" }, { code: "hi", name: "हिन्दी" },
];
const LOCALES = { cs: "cs-CZ", en: "en-GB", sk: "sk-SK", pl: "pl-PL", de: "de-DE", es: "es-ES", fr: "fr-FR", zh: "zh-CN", hi: "hi-IN" };
// Písma pro znaky, které Urbanist nemá. Načtou se jen u jazyka, který je potřebuje.
const FONTS = {
  zh: "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600&display=swap",
  hi: "https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@300;400;500;600&display=swap",
};
const KEY = "aloiz-lang";

let cur = "cs";
export const isLang = c => Object.prototype.hasOwnProperty.call(DICTS, c);
export const getLang = () => cur;
export const locale = () => LOCALES[cur];
export const langName = c => (LANGS.find(l => l.code === c) || LANGS[0]).name;

/** Uložená volba, jinak jazyk zařízení, jinak angličtina. */
export function detectLang(){
  try{ const s = localStorage.getItem(KEY); if (s && isLang(s)) return s; }catch{}
  const list = (typeof navigator !== "undefined" && (navigator.languages?.length ? navigator.languages : [navigator.language])) || [];
  for (const l of list){ const c = String(l || "").toLowerCase().split(/[-_]/)[0]; if (isLang(c)) return c; }
  return "en";
}

export function setLang(code, remember){
  cur = isLang(code) ? code : "en";
  if (remember){
    try{ localStorage.setItem(KEY, cur); }catch{}
  }
  if (typeof document !== "undefined"){
    document.documentElement.lang = LOCALES[cur].split("-")[0] === "zh" ? "zh-Hans" : cur;
    // Cookie, aby i stránky ze serveru (např. Ochrana soukromí) byly ve stejném jazyce
    try{ document.cookie = KEY + "=" + cur + ";path=/;max-age=31536000;samesite=lax"; }catch{}
    const href = FONTS[cur];
    if (href && !document.querySelector('link[data-font="' + cur + '"]')){
      const l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; l.dataset.font = cur;
      document.head.appendChild(l);
    }
  }
}

/** Text podle klíče. Chybí-li v daném jazyce, použije se čeština. */
export function t(key, ...args){
  const v = DICTS[cur][key] ?? cs[key] ?? key;
  return typeof v === "function" ? v(...args) : v;
}

// ---------- data ----------
const cap = s => s ? s.charAt(0).toLocaleUpperCase(LOCALES[cur]) + s.slice(1) : s;
const fmt = (d, o) => new Intl.DateTimeFormat(LOCALES[cur], o).format(d);
/** „Pondělí 3. 12.“, „Monday 3 Dec“ … */
export function dayLabel(d){
  if (cur === "cs" || cur === "sk") return cap(fmt(d, { weekday: "long" })) + " " + d.getDate() + ". " + (d.getMonth() + 1) + ".";
  return cap(fmt(d, { weekday: "long", day: "numeric", month: cur === "hi" ? "long" : "short" }));
}
export const weekdayLong = d => fmt(d, { weekday: "long" });
export const weekdayShort = d => cap(fmt(d, { weekday: "short" })).replace(/\.$/, "");
export const monthYear = d => cap(fmt(d, { month: "long", year: "numeric" }));
export const monthShort = d => fmt(d, { month: cur === "hi" ? "long" : "short" });
export const fullDate = d => fmt(d, { day: "numeric", month: "numeric", year: "numeric" });
/** Jazyk pro rozpoznávání řeči */
export const speechLang = () => ({ en: "en-US", zh: "zh-CN", hi: "hi-IN" })[cur] || LOCALES[cur];
