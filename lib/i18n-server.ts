// Texty, které vznikají na serveru: upozornění, kalendář k odběru, přeposlané e-maily, pokyn pro AI.
export const LANG_CODES = ["cs", "en", "sk", "pl", "de", "es", "fr", "zh", "hi"] as const;
export type Lang = (typeof LANG_CODES)[number];
export const normLang = (s: unknown): Lang => (LANG_CODES as readonly string[]).includes(String(s)) ? (s as Lang) : "cs";

const LOCALES: Record<Lang, string> = { cs: "cs-CZ", en: "en-GB", sk: "sk-SK", pl: "pl-PL", de: "de-DE", es: "es-ES", fr: "fr-FR", zh: "zh-CN", hi: "hi-IN" };
/** Název jazyka pro pokyn AI */
export const AI_LANG: Record<Lang, string> = {
  cs: "čeština", en: "English", sk: "slovenčina", pl: "polski", de: "Deutsch", es: "español", fr: "français",
  zh: "简体中文 (Simplified Chinese)", hi: "हिन्दी (Hindi, Devanagari script)",
};

type Unit = "day" | "week";
type Pack = {
  bring: string; todayL: string; prepTomorrow: string; tomorrowL: string; prep: string;
  morning: string; evening: string; task: string;
  now: string; inMin: (n: number) => string; inHours: (h: number, m: number) => string;
  inUnits: (n: number, u: Unit) => string; today: string; tomorrow: string;
  testTitle: string; testBody: string; testEmpty: string;
  subject: string; email: string; noSubject: string; untitled: string;
};

const csPl = (n: number, one: string, few: string, many: string) => (n === 1 ? one : n >= 2 && n <= 4 ? few : many);
const plPl = (n: number, one: string, few: string, many: string) => {
  if (n === 1) return one; const a = n % 10, b = n % 100;
  return a >= 2 && a <= 4 && !(b >= 12 && b <= 14) ? few : many;
};

export const S: Record<Lang, Pack> = {
  cs: {
    bring: "Donést: ", todayL: "Dnes: ", prepTomorrow: "Na zítra připravit: ", tomorrowL: "Zítra: ", prep: "Připravit: ",
    morning: "Dobré ráno", evening: "Na zítra", task: "Úkol: ",
    now: "Teď", inMin: (n) => "Za " + n + " min",
    inHours: (h, m) => m ? "Za " + h + " h " + m + " min" : h === 1 ? "Za hodinu" : "Za " + h + " h",
    inUnits: (n, u) => u === "week" ? (n === 1 ? "Za týden" : "Za " + n + " " + csPl(n, "týden", "týdny", "týdnů")) : (n === 1 ? "Zítra" : "Za " + n + " " + csPl(n, "den", "dny", "dní")),
    today: "Dnes", tomorrow: "Zítra",
    testTitle: "Aloiz: zkušební upozornění", testBody: "Takhle bude vypadat ranní souhrn:\n", testEmpty: "Funguje to. Na dnešek a zítřek zatím nic nemáte.",
    subject: "Předmět: ", email: "E-mail: ", noSubject: "bez předmětu", untitled: "Bez názvu",
  },
  sk: {
    bring: "Doniesť: ", todayL: "Dnes: ", prepTomorrow: "Na zajtra pripraviť: ", tomorrowL: "Zajtra: ", prep: "Pripraviť: ",
    morning: "Dobré ráno", evening: "Na zajtra", task: "Úloha: ",
    now: "Teraz", inMin: (n) => "O " + n + " min",
    inHours: (h, m) => m ? "O " + h + " h " + m + " min" : h === 1 ? "O hodinu" : "O " + h + " h",
    inUnits: (n, u) => u === "week" ? (n === 1 ? "O týždeň" : "O " + n + " " + csPl(n, "týždeň", "týždne", "týždňov")) : (n === 1 ? "Zajtra" : "O " + n + " " + csPl(n, "deň", "dni", "dní")),
    today: "Dnes", tomorrow: "Zajtra",
    testTitle: "Aloiz: skúšobné upozornenie", testBody: "Takto bude vyzerať ranný súhrn:\n", testEmpty: "Funguje to. Na dnes a zajtra zatiaľ nič nemáte.",
    subject: "Predmet: ", email: "E-mail: ", noSubject: "bez predmetu", untitled: "Bez názvu",
  },
  en: {
    bring: "Bring: ", todayL: "Today: ", prepTomorrow: "Get ready for tomorrow: ", tomorrowL: "Tomorrow: ", prep: "Get ready: ",
    morning: "Good morning", evening: "For tomorrow", task: "To do: ",
    now: "Now", inMin: (n) => "In " + n + " min",
    inHours: (h, m) => m ? "In " + h + " h " + m + " min" : h === 1 ? "In an hour" : "In " + h + " h",
    inUnits: (n, u) => u === "week" ? (n === 1 ? "In a week" : "In " + n + " weeks") : (n === 1 ? "Tomorrow" : "In " + n + " days"),
    today: "Today", tomorrow: "Tomorrow",
    testTitle: "Aloiz: test notification", testBody: "This is what your morning summary will look like:\n", testEmpty: "It works. Nothing planned for today or tomorrow yet.",
    subject: "Subject: ", email: "Email: ", noSubject: "no subject", untitled: "Untitled",
  },
  pl: {
    bring: "Przynieść: ", todayL: "Dziś: ", prepTomorrow: "Przygotować na jutro: ", tomorrowL: "Jutro: ", prep: "Przygotować: ",
    morning: "Dzień dobry", evening: "Na jutro", task: "Zadanie: ",
    now: "Teraz", inMin: (n) => "Za " + n + " min",
    inHours: (h, m) => m ? "Za " + h + " godz. " + m + " min" : h === 1 ? "Za godzinę" : "Za " + h + " godz.",
    inUnits: (n, u) => u === "week" ? (n === 1 ? "Za tydzień" : "Za " + n + " " + plPl(n, "tydzień", "tygodnie", "tygodni")) : (n === 1 ? "Jutro" : "Za " + n + " dni"),
    today: "Dziś", tomorrow: "Jutro",
    testTitle: "Aloiz: powiadomienie testowe", testBody: "Tak będzie wyglądać poranne podsumowanie:\n", testEmpty: "Działa. Na dziś i jutro nic jeszcze nie masz.",
    subject: "Temat: ", email: "E-mail: ", noSubject: "bez tematu", untitled: "Bez nazwy",
  },
  de: {
    bring: "Mitbringen: ", todayL: "Heute: ", prepTomorrow: "Für morgen vorbereiten: ", tomorrowL: "Morgen: ", prep: "Vorbereiten: ",
    morning: "Guten Morgen", evening: "Für morgen", task: "Aufgabe: ",
    now: "Jetzt", inMin: (n) => "In " + n + " Min.",
    inHours: (h, m) => m ? "In " + h + " Std. " + m + " Min." : h === 1 ? "In einer Stunde" : "In " + h + " Std.",
    inUnits: (n, u) => u === "week" ? (n === 1 ? "In einer Woche" : "In " + n + " Wochen") : (n === 1 ? "Morgen" : "In " + n + " Tagen"),
    today: "Heute", tomorrow: "Morgen",
    testTitle: "Aloiz: Testbenachrichtigung", testBody: "So sieht die Morgenübersicht aus:\n", testEmpty: "Es funktioniert. Für heute und morgen ist noch nichts geplant.",
    subject: "Betreff: ", email: "E-Mail: ", noSubject: "ohne Betreff", untitled: "Ohne Titel",
  },
  es: {
    bring: "Llevar: ", todayL: "Hoy: ", prepTomorrow: "Preparar para mañana: ", tomorrowL: "Mañana: ", prep: "Preparar: ",
    morning: "Buenos días", evening: "Para mañana", task: "Tarea: ",
    now: "Ahora", inMin: (n) => "En " + n + " min",
    inHours: (h, m) => m ? "En " + h + " h " + m + " min" : h === 1 ? "En una hora" : "En " + h + " h",
    inUnits: (n, u) => u === "week" ? (n === 1 ? "En una semana" : "En " + n + " semanas") : (n === 1 ? "Mañana" : "En " + n + " días"),
    today: "Hoy", tomorrow: "Mañana",
    testTitle: "Aloiz: aviso de prueba", testBody: "Así se verá el resumen de la mañana:\n", testEmpty: "Funciona. Todavía no tienes nada para hoy ni mañana.",
    subject: "Asunto: ", email: "Correo: ", noSubject: "sin asunto", untitled: "Sin título",
  },
  fr: {
    bring: "À apporter : ", todayL: "Aujourd’hui : ", prepTomorrow: "À préparer pour demain : ", tomorrowL: "Demain : ", prep: "À préparer : ",
    morning: "Bonjour", evening: "Pour demain", task: "À faire : ",
    now: "Maintenant", inMin: (n) => "Dans " + n + " min",
    inHours: (h, m) => m ? "Dans " + h + " h " + m + " min" : h === 1 ? "Dans une heure" : "Dans " + h + " h",
    inUnits: (n, u) => u === "week" ? (n === 1 ? "Dans une semaine" : "Dans " + n + " semaines") : (n === 1 ? "Demain" : "Dans " + n + " jours"),
    today: "Aujourd’hui", tomorrow: "Demain",
    testTitle: "Aloiz : notification de test", testBody: "Voici à quoi ressemblera le résumé du matin :\n", testEmpty: "Ça marche. Rien de prévu pour aujourd’hui ni demain pour l’instant.",
    subject: "Objet : ", email: "E-mail : ", noSubject: "sans objet", untitled: "Sans titre",
  },
  zh: {
    bring: "要带：", todayL: "今天：", prepTomorrow: "为明天准备：", tomorrowL: "明天：", prep: "要准备：",
    morning: "早上好", evening: "明天", task: "任务：",
    now: "现在", inMin: (n) => n + " 分钟后",
    inHours: (h, m) => m ? h + " 小时 " + m + " 分钟后" : h + " 小时后",
    inUnits: (n, u) => u === "week" ? n + " 周后" : (n === 1 ? "明天" : n + " 天后"),
    today: "今天", tomorrow: "明天",
    testTitle: "Aloiz：测试通知", testBody: "早间摘要会是这样：\n", testEmpty: "一切正常。今天和明天还没有安排。",
    subject: "主题：", email: "邮件：", noSubject: "无主题", untitled: "未命名",
  },
  hi: {
    bring: "लाना है: ", todayL: "आज: ", prepTomorrow: "कल के लिए तैयारी: ", tomorrowL: "कल: ", prep: "तैयारी: ",
    morning: "सुप्रभात", evening: "कल के लिए", task: "काम: ",
    now: "अभी", inMin: (n) => n + " मिनट में",
    inHours: (h, m) => m ? h + " घंटे " + m + " मिनट में" : h === 1 ? "एक घंटे में" : h + " घंटे में",
    inUnits: (n, u) => u === "week" ? (n === 1 ? "एक हफ़्ते में" : n + " हफ़्तों में") : (n === 1 ? "कल" : n + " दिनों में"),
    today: "आज", tomorrow: "कल",
    testTitle: "Aloiz: परीक्षण सूचना", testBody: "सुबह का सारांश ऐसा दिखेगा:\n", testEmpty: "यह काम कर रहा है। आज और कल के लिए अभी कुछ नहीं है।",
    subject: "विषय: ", email: "ईमेल: ", noSubject: "बिना विषय", untitled: "बिना नाम",
  },
};

/** „Pondělí 3. 12.“, „Monday 3 Dec“ … pro datum YYYY-MM-DD */
export function dayLabel(date: string, lang: Lang) {
  const d = new Date(date + "T12:00:00Z");
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(LOCALES[lang], { timeZone: "UTC", ...o }).format(d);
  const cap = (s: string) => s.charAt(0).toLocaleUpperCase(LOCALES[lang]) + s.slice(1);
  if (lang === "cs" || lang === "sk") return cap(f({ weekday: "long" })) + " " + d.getUTCDate() + ". " + (d.getUTCMonth() + 1) + ".";
  return cap(f({ weekday: "long", day: "numeric", month: lang === "hi" ? "long" : "short" }));
}

/** Předpona v kalendáři a upozorněních podle typu položky */
export function typePrefix(type: string, lang: Lang) {
  return type === "ukol" || type === "donest" ? S[lang].task : ""; // dřívější „donest“ je teď úkol
}
