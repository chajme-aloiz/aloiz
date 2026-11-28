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

/** Odpovědi Aloizu ve WhatsAppu */
type WaPack = {
  saved: string; review: string; nothing: string; unknown: string; linked: string; badCode: string;
  voice: string; unsupported: string; tooBig: string; error: string; source: string;
};
export const WA: Record<Lang, WaPack> = {
  cs: {
    saved: "Uloženo:", review: "Čeká na kontrolu v aplikaci:", nothing: "V tom jsem nenašel nic k uložení. Pošlete fotku, screenshot, PDF nebo text ze školy.",
    unknown: "Dobrý den, tady Aloiz. Toto číslo zatím neznám. Propojte ho v aplikaci: Nastavení > WhatsApp.",
    linked: "Hotovo, WhatsApp je propojený s Aloizem. Pošlete mi fotku, screenshot, PDF nebo text a já z toho udělám události a úkoly.",
    badCode: "Tenhle kód neznám nebo už vypršel. V Aloizu klepněte v Nastavení > WhatsApp znovu na Propojit.",
    voice: "Hlasové zprávy zatím neumím poslouchat. Napište mi to prosím, klidně diktováním přes mikrofon na klávesnici.",
    unsupported: "Tohle neumím přečíst. Pošlete fotku, screenshot, PDF nebo text.",
    tooBig: "Soubor je moc velký. Pošlete prosím menší fotku nebo PDF.",
    error: "Něco se pokazilo, zkuste to prosím za chvíli znovu.", source: "WhatsApp",
  },
  sk: {
    saved: "Uložené:", review: "Čaká na kontrolu v aplikácii:", nothing: "Nenašiel som v tom nič na uloženie. Pošlite fotku, snímku obrazovky, PDF alebo text zo školy.",
    unknown: "Dobrý deň, tu Aloiz. Toto číslo zatiaľ nepoznám. Prepojte ho v aplikácii: Nastavenia > WhatsApp.",
    linked: "Hotovo, WhatsApp je prepojený s Aloizom. Pošlite mi fotku, snímku obrazovky, PDF alebo text a ja z toho urobím udalosti a úlohy.",
    badCode: "Tento kód nepoznám alebo už vypršal. V Aloizi ťuknite v Nastavenia > WhatsApp znova na Prepojiť.",
    voice: "Hlasové správy zatiaľ neviem počúvať. Napíšte mi to, pokojne diktovaním cez mikrofón na klávesnici.",
    unsupported: "Toto neviem prečítať. Pošlite fotku, snímku obrazovky, PDF alebo text.",
    tooBig: "Súbor je príliš veľký. Pošlite menšiu fotku alebo PDF.",
    error: "Niečo sa pokazilo, skúste to o chvíľu znova.", source: "WhatsApp",
  },
  en: {
    saved: "Saved:", review: "Waiting for your review in the app:", nothing: "I didn’t find anything to save. Send a photo, screenshot, PDF or text from school.",
    unknown: "Hi, this is Aloiz. I don’t know this number yet. Link it in the app: Settings > WhatsApp.",
    linked: "Done, WhatsApp is linked to Aloiz. Send me a photo, screenshot, PDF or text and I’ll turn it into events and tasks.",
    badCode: "I don’t know this code or it has expired. In Aloiz, go to Settings > WhatsApp and tap Link again.",
    voice: "I can’t listen to voice messages yet. Please type it instead, or dictate with the microphone on your keyboard.",
    unsupported: "I can’t read this. Send a photo, screenshot, PDF or text.",
    tooBig: "The file is too large. Please send a smaller photo or PDF.",
    error: "Something went wrong, please try again in a moment.", source: "WhatsApp",
  },
  pl: {
    saved: "Zapisano:", review: "Czeka na sprawdzenie w aplikacji:", nothing: "Nie znalazłem tu nic do zapisania. Wyślij zdjęcie, zrzut ekranu, PDF lub tekst ze szkoły.",
    unknown: "Dzień dobry, tu Aloiz. Nie znam jeszcze tego numeru. Połącz go w aplikacji: Ustawienia > WhatsApp.",
    linked: "Gotowe, WhatsApp jest połączony z Aloizem. Wyślij mi zdjęcie, zrzut ekranu, PDF lub tekst, a zrobię z tego wydarzenia i zadania.",
    badCode: "Nie znam tego kodu albo już wygasł. W Aloizie w Ustawienia > WhatsApp stuknij ponownie Połącz.",
    voice: "Nie umiem jeszcze słuchać wiadomości głosowych. Napisz to proszę, możesz podyktować mikrofonem na klawiaturze.",
    unsupported: "Nie umiem tego przeczytać. Wyślij zdjęcie, zrzut ekranu, PDF lub tekst.",
    tooBig: "Plik jest za duży. Wyślij proszę mniejsze zdjęcie lub PDF.",
    error: "Coś poszło nie tak, spróbuj ponownie za chwilę.", source: "WhatsApp",
  },
  de: {
    saved: "Gespeichert:", review: "Wartet in der App auf deine Prüfung:", nothing: "Ich habe nichts zum Speichern gefunden. Schick ein Foto, einen Screenshot, ein PDF oder einen Text aus der Schule.",
    unknown: "Hallo, hier ist Aloiz. Diese Nummer kenne ich noch nicht. Verknüpfe sie in der App: Einstellungen > WhatsApp.",
    linked: "Fertig, WhatsApp ist mit Aloiz verknüpft. Schick mir ein Foto, einen Screenshot, ein PDF oder einen Text, und ich mache Termine und Aufgaben daraus.",
    badCode: "Diesen Code kenne ich nicht oder er ist abgelaufen. Tippe in Aloiz unter Einstellungen > WhatsApp erneut auf Verknüpfen.",
    voice: "Sprachnachrichten kann ich noch nicht anhören. Schreib es bitte, gern per Diktat mit dem Mikrofon der Tastatur.",
    unsupported: "Das kann ich nicht lesen. Schick ein Foto, einen Screenshot, ein PDF oder einen Text.",
    tooBig: "Die Datei ist zu groß. Schick bitte ein kleineres Foto oder PDF.",
    error: "Etwas ist schiefgelaufen, bitte versuch es gleich noch einmal.", source: "WhatsApp",
  },
  es: {
    saved: "Guardado:", review: "Pendiente de revisar en la app:", nothing: "No he encontrado nada que guardar. Envía una foto, captura, PDF o texto del colegio.",
    unknown: "Hola, soy Aloiz. Todavía no conozco este número. Vincúlalo en la app: Ajustes > WhatsApp.",
    linked: "Listo, WhatsApp está vinculado con Aloiz. Envíame una foto, captura, PDF o texto y lo convertiré en eventos y tareas.",
    badCode: "No conozco este código o ha caducado. En Aloiz, ve a Ajustes > WhatsApp y toca Vincular otra vez.",
    voice: "Todavía no puedo escuchar mensajes de voz. Escríbelo, o díctalo con el micrófono del teclado.",
    unsupported: "No puedo leer esto. Envía una foto, captura, PDF o texto.",
    tooBig: "El archivo es demasiado grande. Envía una foto o PDF más pequeño.",
    error: "Algo ha fallado, inténtalo de nuevo en un momento.", source: "WhatsApp",
  },
  fr: {
    saved: "Enregistré :", review: "À vérifier dans l’app :", nothing: "Je n’ai rien trouvé à enregistrer. Envoyez une photo, une capture, un PDF ou un texte de l’école.",
    unknown: "Bonjour, ici Aloiz. Je ne connais pas encore ce numéro. Associez-le dans l’app : Réglages > WhatsApp.",
    linked: "C’est fait, WhatsApp est associé à Aloiz. Envoyez-moi une photo, une capture, un PDF ou un texte et j’en ferai des événements et des tâches.",
    badCode: "Je ne connais pas ce code ou il a expiré. Dans Aloiz, allez dans Réglages > WhatsApp et touchez à nouveau Associer.",
    voice: "Je ne sais pas encore écouter les messages vocaux. Écrivez-le, ou dictez-le avec le micro du clavier.",
    unsupported: "Je ne sais pas lire ceci. Envoyez une photo, une capture, un PDF ou un texte.",
    tooBig: "Le fichier est trop volumineux. Envoyez une photo ou un PDF plus petit.",
    error: "Un problème est survenu, réessayez dans un instant.", source: "WhatsApp",
  },
  zh: {
    saved: "已保存：", review: "等待在应用中确认：", nothing: "没有找到需要保存的内容。请发送学校的照片、截图、PDF 或文字。",
    unknown: "你好，我是 Aloiz。我还不认识这个号码。请在应用中关联：设置 > WhatsApp。",
    linked: "完成，WhatsApp 已与 Aloiz 关联。给我发照片、截图、PDF 或文字，我会把它们变成活动和任务。",
    badCode: "这个代码无效或已过期。请在 Aloiz 的 设置 > WhatsApp 中再次点击“关联”。",
    voice: "我暂时还不能听语音消息。请打字发送，也可以用键盘上的麦克风听写。",
    unsupported: "我读不了这个。请发送照片、截图、PDF 或文字。",
    tooBig: "文件太大。请发送更小的照片或 PDF。",
    error: "出了点问题，请稍后再试。", source: "WhatsApp",
  },
  hi: {
    saved: "सेव किया:", review: "ऐप में जाँच का इंतज़ार:", nothing: "मुझे सेव करने लायक कुछ नहीं मिला। स्कूल की फ़ोटो, स्क्रीनशॉट, PDF या टेक्स्ट भेजें।",
    unknown: "नमस्ते, मैं Aloiz हूँ। मैं यह नंबर अभी नहीं जानता। इसे ऐप में जोड़ें: सेटिंग्स > WhatsApp।",
    linked: "हो गया, WhatsApp Aloiz से जुड़ गया है। मुझे फ़ोटो, स्क्रीनशॉट, PDF या टेक्स्ट भेजें, मैं उससे इवेंट और काम बना दूँगा।",
    badCode: "यह कोड मुझे नहीं पता या इसकी समय-सीमा खत्म हो गई है। Aloiz में सेटिंग्स > WhatsApp में फिर से जोड़ें पर टैप करें।",
    voice: "मैं अभी वॉइस मैसेज नहीं सुन सकता। कृपया लिखकर भेजें, या कीबोर्ड के माइक से बोलकर लिखें।",
    unsupported: "मैं इसे पढ़ नहीं सकता। फ़ोटो, स्क्रीनशॉट, PDF या टेक्स्ट भेजें।",
    tooBig: "फ़ाइल बहुत बड़ी है। कृपया छोटी फ़ोटो या PDF भेजें।",
    error: "कुछ गड़बड़ हो गई, कृपया थोड़ी देर में फिर कोशिश करें।", source: "WhatsApp",
  },
};

/** Jazyk pro neznámé číslo podle předvolby, jinak angličtina */
export function langFromPhone(phone: string): Lang {
  const p: [string, Lang][] = [["420", "cs"], ["421", "sk"], ["48", "pl"], ["49", "de"], ["43", "de"], ["34", "es"], ["33", "fr"], ["86", "zh"], ["91", "hi"]];
  return p.find(([pre]) => phone.startsWith(pre))?.[1] || "en";
}
