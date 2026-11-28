// Čeština: výchozí texty aplikace. Ostatní jazyky mají stejné klíče.
// Hodnota je text, nebo funkce (když se do textu něco doplňuje, např. počet).
const pl = (n, one, few, many) => n === 1 ? one : n >= 2 && n <= 4 ? few : many;

export default {
  // obecné
  today: "Dnes", tomorrow: "Zítra", noDate: "Bez termínu", untitled: "Bez názvu", me: "Já", device: "Zařízení",
  back: "Zpět", close: "Zavřít", yes: "Ano", no: "Ne", cancel: "Zrušit", save: "Uložit", saveAll: "Uložit vše", saved: "Uloženo.",
  deleted: "Smazáno.", discard: "Zahodit", add: "Přidat", remove: "Odebrat", show: "Ukázat", undo: "Vrátit", done: "Hotovo",
  skip: "Přeskočit", continue: "Pokračovat", notNow: "Teď ne", loading: "Načítám…", working: "Pracuji", optional: "nepovinné",
  "overview.full": "Celý přehled", "today.next": "Další 2 týdny", "who.pick": "Čí věci ukázat",
  "fam.nicks": "Přezdívky", "fam.nicksPh": "např. Jeníček, Johny (nepovinné)",
  you: "Vy", color: "Barva", all: "Všichni", privacy: "Ochrana soukromí", or: "nebo", weekly: "každý týden",
  newEvent: "Nová událost", newSuffix: " (nová)",
  copyLink: "Zkopírovat odkaz", linkCopied: "Odkaz zkopírován.",
  editAria: t => "Upravit: " + t,
  dueBy: d => "do " + d.toLowerCase(),
  addFor: n => "Přidat pro " + n,
  overview: n => "Přehled: " + n,
  timeAria: l => l + ", čas",
  bigDate: (d, m) => [d + ".", m + "."],
  count: n => n === 0 ? "klídek" : n === 1 ? "1 věc" : n + " " + pl(n, "věc", "věci", "věcí"),
  found: n => n === 1 ? "jednu věc." : n + " " + pl(n, "věc", "věci", "věcí") + ".",
  savedN: n => n === 1 ? "Uloženo." : "Uloženo, " + n + " " + pl(n, "položka", "položky", "položek") + ".",
  savedDirect: n => (n === 1 ? "Uložena 1 položka" : n < 5 ? "Uloženy " + n + " položky" : "Uloženo " + n + " položek") + " bez kontroly.",
  savedDirectRest: n => (n === 1 ? "Uložena 1 položka" : n < 5 ? "Uloženy " + n + " položky" : "Uloženo " + n + " položek") + " rovnou, zbytek zkontrolujte.",

  "type.udalost": "Událost", "type.ukol": "Úkol", "type.donest": "Donést",
  "typeLow.udalost": "událost", "typeLow.ukol": "úkol", "typeLow.donest": "donést",
  "typePl.udalost": "události", "typePl.ukol": "úkoly", "typePl.donest": "donést",

  // chyby
  "err.load": "Data se nenačetla. Zkontrolujte připojení.",
  "err.save": "Uložení se nepovedlo, zkuste to znovu.",
  "err.saveShort": "Uložení se nepovedlo.",
  "err.saveSql": "Uložení se nepovedlo. Spustili jste nový SQL soubor?",
  "aiErr.failed": "Čtení se nepovedlo, zkuste to znovu.",
  "aiErr.rate_limited": "Moc požadavků najednou, zkuste to za chvíli.",
  "aiErr.image_rejected": "Tenhle obrázek se nepodařilo přečíst. Zkuste jinou fotku.",
  "aiErr.refused": "Tuhle zprávu se nepodařilo zpracovat.",
  "aiErr.pdf_big": "PDF je moc velké. Zkuste screenshot stránky.",
  "aiErr.too_big": "Soubory jsou moc velké. Zkuste méně fotek.",
  "aiErr.not_allowed": "Čtení přes AI je zatím jen pro pozvané účty.",
  "aiErr.login": "Přihlášení vypršelo, přihlaste se znovu.",
  nothingFound: "V té zprávě jsem nic k zapsání nenašel.",

  // čtení
  "busy.pdf": "Čtu PDF…", "busy.photo": "Čtu fotku…", "busy.msg": "Čtu zprávu…", "busy.source": "Ukládám zdroj…",
  "files.badType": "Tenhle typ souboru neumím. Zkuste fotku, screenshot nebo PDF.",
  "files.max": n => "Najednou přečtu nejvýš " + n + " fotky.",
  "src.pdf": name => "Z PDF · " + name,
  "src.files": n => "Z " + n + " souborů",
  "src.photo": "Z fotky", "src.voice": "Z hlasové zprávy", "src.text": "Z textu", "src.manual": "Ručně",
  "src.tag": s => "Zdroj: " + s, "src.show": "Zobrazit zdroj",
  "src.notFound": "Zdroj se nenašel.", "src.loading": "Načítám zdroj…", "src.loadFail": "Zdroj se nepodařilo načíst. Možná byl smazán.",
  "src.eyebrow": d => "Zdroj · " + d, "src.msg": "Zpráva", "src.yourNote": "Vaše poznámka", "src.openPdf": "Otevřít PDF",
  "src.openPhoto": "Otevřít fotku ve velkém", "src.photoAlt": "Fotka", "src.emailText": "Text e-mailu", "src.msgText": "Text zprávy",
  "src.savedFrom": "Uloženo z tohoto zdroje",
  "mic.allow": "Povolte prosím mikrofon v prohlížeči.", "mic.fail": "Mikrofon se nepodařilo spustit.",

  // přihlášení
  "login.h1a": "Školní i rodinný život", "login.h1b": "na jednom místě.",
  "login.lead": "Vyfoťte lísteček, přepošlete e-mail nebo to řekněte nahlas. Aloiz zapíše, co kdy a pro koho.",
  "login.ph": "vas@email.cz", "login.email": "E-mail", "login.needEmail": "Napište e-mail.",
  "login.rate": "Odkaz už odešel, zkuste to za minutu.", "login.fail": "Odkaz se nepodařilo poslat.",
  "login.check": "Zkontrolujte e-mail", "login.sentA": "Poslal jsem odkaz na ", "login.sentB": ". Klepněte na něj a jste přihlášení.",
  "login.other": "Jiný e-mail", "login.google": "Pokračovat přes Google", "login.linkLabel": "Odkaz na e-mail, bez hesla",
  "login.send": "Poslat odkaz",

  // jazyk
  "lang.title": "Jazyk", "lang.label": "Jazyk aplikace",
  "lang.note": "Ve zvoleném jazyce budou i nově přečtené položky a upozornění. Co už je uložené, zůstane, jak to je.",

  // úprava položky
  "f.what": "Co", "f.whatPh": "např. Divadlo, flétna, souhlas s výletem", "f.type": "Typ", "f.who": "Pro koho", "f.choose": "Vyberte",
  "f.date": "Datum", "f.due": "Do kdy", "f.time": "Čas", "f.place": "Místo", "f.repeat": "Opakování", "f.noRepeat": "Neopakovat",
  "f.weekly": "Každý týden", "f.until": "Opakovat do", "f.untilShort": "Do", "f.remind": "Upozornění", "f.note": "Poznámka",
  "f.parent": "Patří k události", "f.parentNone": "K žádné",
  "del.series": "Smazat celou opakovanou akci?", "del.confirm": "Opravdu smazat?", "del.skipped": "Tento termín vynechán.",
  "del.onlyOcc": d => "Jen " + d.toLowerCase(), "del.item": "Smazat položku",
  "edit.new": "Nová položka", "edit.title": "Upravit", "edit.needTitle": "Napište, co to je.", "edit.needWho": "Vyberte, pro koho to je.",

  // kalendář
  "cal.title": "Kalendář", "cal.month": "Měsíc", "cal.dayAria": (d, n) => d + (n ? ", " + n + " " + pl(n, "položka", "položky", "položek") : ""),
  "cal.empty": "V tento den nic.", "cal.addDay": "Přidat na tento den", "cal.toPhone": "Do telefonu",
  "cal.prev": "Předchozí měsíc", "cal.next": "Další měsíc",

  // kopírování
  "copy.head": n => n + " – co nás čeká:", "copy.bring": "donést ", "copy.done": "Zkopírováno, můžete to poslat.",
  "copy.title": "Ke zkopírování", "copy.hint": "Označte text a zkopírujte ho.",

  // řádek položky
  "row.undone": "Označit jako nehotové", "row.movedDone": "Přesunuto do Hotovo.",

  // přeposlané e-maily
  "inbox.title": "Přeposlaný e-mail", "inbox.found": n => "Našel jsem " + (n === 1 ? "jednu věc." : n + " " + pl(n, "věc", "věci", "věcí") + ".") + " Nic se nezapíše bez vás.",
  "inbox.review": "Zkontrolovat",

  // dnes
  "nav.settings": "Rodina a nastavení",
  "today.start": "Začněte tím, že přidáte členy rodiny.",
  "today.lead": (a, b) => "Dneska " + a + ", zítra " + b, "today.calm": "Dneska i zítra klídek",
  "today.first": "První krok",
  "today.firstText": "Přidejte děti, sebe i další členy rodiny, aby Aloiz věděl, komu co patří. Stačí jméno, u dětí pomůže třída.",
  "today.prep": "Zítra tě čeká", "today.overdue": "Po termínu", "today.empty": "Na dnešek nic nemáte.",
  "today.nothing": "Zatím tu nic není. Klepněte na „Přidat“ a vyfoťte lísteček, vložte text e-mailu nebo to řekněte nahlas.",
  "self.q": "Jste tu i vy?", "self.text": "Aloiz může hlídat i vaše věci. Jste už mezi členy rodiny?",
  "self.thanks": n => "Díky, " + n + " jste vy.", "self.isMe": n => "To jsem já: " + n, "self.addMe": "Přidat mě", "self.no": "Ne, díky",

  // přidat
  "add.title": "Co pro mě máš?", "add.noFam": "Nejdřív v nastavení přidejte členy rodiny.",
  "add.photo": "Vyfotit", "add.more": "přidat další", "add.photoHint": "lísteček, nástěnka", "add.file": "Soubor", "add.fileHint": "PDF, screenshoty",
  "add.upload": "Nahrát soubor", "add.removeFile": "Odebrat soubor",
  "add.notePh": "Nepovinné. Např.: Týká se jen Emy. Výlet platí pro 3.B. Peníze už jsme dali.",
  "add.ready": "Připraveno ke čtení", "add.readyN": n => "Připraveno ke čtení · " + n + " " + pl(n, "soubor", "soubory", "souborů"),
  "add.noteLabel": "Vaše poznámka pro Aloiz", "add.go": "Vložit", "add.text": "Vlastní text", "add.manual": "Zadat ručně",
  "add.paste": "Na počítači můžete screenshot rovnou vložit klávesami Ctrl+V (Cmd+V).",
  "voice.stop": "Zastavit nahrávání", "voice.start": "Namluvit hlasovou zprávu", "voice.listening": "Poslouchám… klepněte pro konec",
  "voice.tap": "Klepněte a mluvte", "voice.example": "„Kuba má ve středu v deset zubaře“",
  "voice.keyboard": "Chcete mluvit? Klepněte do pole a na klávesnici použijte mikrofon. Aloiz pak z věty vytáhne co, kdy a pro koho.",
  "mail.forward": "Přeposlat e-mail ze školy", "mail.a": "Přepošlete ho na ",
  "mail.b": ". Za chvilku se tu objeví ke kontrole. Posílejte z adresy, kterou máte v Aloiz (", "mail.c": ").",
  "mail.yourEmail": "váš e-mail", "mail.copy": "Zkopírovat adresu", "mail.copied": "Adresa zkopírována.",
  "mail.title": "Přeposílání e-mailů", "mail.addr": "Adresa pro přeposlání: ",
  "mail.senderA": "Aloiz pozná, že jde o vás, podle adresy odesílatele: ", "mail.senderB": ". Posíláte-li i z jiné schránky, napište ji sem.",
  "mail.extra": "Další moje adresy (oddělené čárkou)", "mail.extraPh": "např. pracovni@firma.cz",

  // kontrola
  "review.foundA": "Našel jsem", "review.sub": "Zkontrolujte je a uložte. Nic se nezapíše bez vás.", "review.remove": "Odebrat položku",
  "review.noWho": "Nevím, pro koho to je. Vyberete?", "review.noDate": "Chybí datum. Doplníte?",
  "review.needWho": "U každé položky vyberte, pro koho je.",

  // člen rodiny
  "child.week": "Tento týden", "child.next3": "Co čeká v příštích 3 týdnech", "child.noEvents": "Žádné akce v kalendáři.",
  "child.moreTasks": "Další úkoly a donést", "child.tasks": "Úkoly a donést", "child.restAbove": "Všechno ostatní je u akcí výše.",
  "child.noTasks": "Nic k udělání ani donesení.", "child.copy": "Zkopírovat přehled pro druhého rodiče",

  // rodina
  "fam.title": "Rodina", "fam.members": "Členové rodiny", "fam.sub": "Děti, vy i další členové rodiny. Každý má svou barvu.",
  "fam.name": "Jméno", "fam.cls": "Třída", "fam.clsPh": "u dětí, např. 3.B", "fam.school": "Škola/zaměstnání", "fam.info": "Dává AI větší kontext při přiřazování událostí; nepovinné",
  "fam.add": "Přidat člena rodiny", "fam.newPh": "Např. Pepa, manžel, miláček", "fam.added": n => "Přidáno: " + n,
  "fam.delQ": n => "Smazat " + n + " i všechny jeho položky?",

  // nastavení
  "set.title": "Nastavení", "set.youSuffix": " (vy)", "set.nobody": "Zatím nikdo, přidejte členy",
  "auto.title": "Ukládat bez kontroly", "auto.sum": l => "Rovnou: " + l, "auto.none": "Všechno nejdřív zkontrolujete",
  "auto.note": "Zaškrtnuté druhy se z fotek, textu, hlasu i přeposlaných e-mailů uloží samy. Ostatní vám Aloiz nejdřív ukáže ke kontrole.",
  "auto.ev": "Události", "auto.evHint": "akce, kroužky, schůzky", "auto.task": "Úkoly", "auto.taskHint": "podepsat, zaplatit, donést",
  "auto.bring": "Donést", "auto.bringHint": "věci a peníze s sebou",
  "auto.note2": "Když si Aloiz není jistý (chybí datum nebo neví, pro koho to je), ukáže položku ke kontrole vždy. U každé položky najdete odkaz na původní fotku, e-mail nebo text.",
  "feed.title": "Kalendář v telefonu",
  "feed.note": "Přihlaste se k odběru a všechno z Aloiz se samo objeví ve vašem kalendáři, i s připomínkou. Odkaz je tajný, nesdílejte ho veřejně.",
  "feed.google": "Google kalendář", "feed.apple": "iPhone a Mac",
  "acc.title": "Účet", "acc.logout": "Odhlásit se", "acc.delete": "Zrušit účet", "acc.q": "Opravdu chcete zrušit účet?",
  "acc.text": "Přijdete o všechno: členy rodiny, události, úkoly, nahrané fotky a e-maily i nastavení. Smazání nejde vrátit.",
  "acc.yes": "Ano, zrušit účet", "acc.no": "Ne, ponechat", "acc.deleting": "Mažu účet…",
  "acc.deleted": "Účet je zrušený. Děkujeme, že jste Aloiz zkusili.", "acc.fail": "Zrušení se nepovedlo, zkuste to znovu.",

  // upozornění
  "push.title": "Upozornění", "push.needPerm": "Bez povolení to nepůjde.", "push.notReady": "Upozornění se na serveru ještě nastavují.",
  "push.on": "Upozornění zapnuta.", "push.onFail": "Zapnutí se nepovedlo, zkuste to znovu.", "push.offHere": "Na tomto zařízení vypnuto.",
  "push.testFail": "Zkouška se nepovedla.", "push.testSent": "Odesláno. Za chvilku by mělo přijít.", "push.noDevice": "Žádné zařízení nemá upozornění zapnutá.",
  "push.onA": "Na tomto zařízení ", "push.onB": "zapnuto", "push.onC": ".",
  "push.test": "Poslat zkoušku", "push.offBtn": "Vypnout na tomto zařízení",
  "push.offText": "Aloiz vám pošle ranní souhrn a připomínky přímo do telefonu nebo počítače. Zapněte to na každém zařízení, kde je chcete dostávat.",
  "push.enable": "Zapnout upozornění",
  "push.iosA": "Na iPhonu a iPadu fungují upozornění jen z ikony na ploše. V Safari klepněte na ", "push.iosShare": "Sdílet",
  "push.iosB": " a pak ", "push.iosAdd": "Přidat na plochu", "push.iosC": ". Otevřete Aloiz z plochy a zapněte upozornění tady.",
  "push.denied": "Upozornění jsou pro Aloiz v prohlížeči zakázaná. Povolte je v nastavení webu (na počítači ikona vedle adresy, na telefonu Nastavení > Oznámení) a stránku obnovte.",
  "push.unsupported": "Tento prohlížeč upozornění neumí. Zkuste Chrome, Edge, Firefox nebo Safari.",
  "push.checking": "Zjišťuji…",
  "push.serverPending": "Upozornění se na serveru teprve nastavují. Až budou připravená, objeví se tu tlačítko pro zapnutí.",
  "push.morning": "Ranní souhrn: co dnes donést a co se děje", "push.evening": "Večer: co připravit na zítra",
  "push.lead": "Akce s časem připomenout", "push.noRemind": "Nepřipomínat",
  "push.note": "Platí pro všechna vaše zařízení. U jednotlivé položky to můžete změnit v její úpravě. Souhrn bez ničeho na dnešek ani zítřek nepřijde.",
  "push.sumOn": time => "Zapnuto" + (time ? ", ráno v " + time : ""), "push.sumOff": "Vypnuto na tomto zařízení",
  "push.hintTitle": "Ranní souhrn", "push.hintText": "Mám ti každé ráno připomenout, co tě dnes čeká?", "push.howTo": "Jak na to",

  // připomínky
  "unit.minute": n => pl(n, "minutu", "minuty", "minut"), "unit.hour": n => pl(n, "hodinu", "hodiny", "hodin"),
  "unit.day": n => pl(n, "den", "dny", "dní"), "unit.week": n => pl(n, "týden", "týdny", "týdnů"),
  "lead.min": n => n + " min", "lead.before": l => l + " předem",
  "lead.dayOf": "V ten den v 7:00", "lead.eveBefore": "Večer předem v 18:00", "lead.daysBefore": n => n + " dny předem v 18:00",
  "lead.weekBefore": "Týden předem v 18:00", "lead.howMany": "Kolik", "lead.unit": "Jednotka",
  "lead.beforeAt18": "předem, v 18:00", "lead.beforeWord": "předem", "lead.custom": "Vlastní…",
  "lead.default": x => "Podle nastavení (" + x + ")", "lead.noRemindLow": "nepřipomínat", "lead.off": "Bez upozornění",
  "lead.morningOnly": "Jen v ranním souhrnu",

  // vítejte, hotovo
  "welcome.eyebrow": "Vítejte", "welcome.h": "Tohle jste vy.",
  "welcome.text": "Vyberte si barvu. Podle ní poznáte své věci v kalendáři. Další členy rodiny přidáte v dalším kroku.",
  "welcome.name": "Jak vám říkat", "welcome.color": "Vaše barva",
  "done.sub": "Vyřízené úkoly a věci. Klepnutím na kolečko je vrátíte zpátky.", "done.empty": "Zatím nic hotového.",
  "done.clearQ": n => "Smazat všech " + n + " hotových položek?", "done.clear": "Vyčistit hotové",
};
