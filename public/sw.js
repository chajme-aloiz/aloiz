// Aloiz: service worker pro upozornění (ranní souhrn, připomínky).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Aloiz", {
    body: d.body || "",
    tag: d.tag || undefined,
    icon: "/icon-512.png",
    badge: "/badge.png",
    data: { url: d.url || "/" },
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "/", self.location.origin).href;
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of all) { if (c.url.startsWith(self.location.origin)) { await c.focus(); return; } }
    await self.clients.openWindow(url);
  })());
});

// Sdílení do Aloizu z jiných aplikací (Android, Aloiz přidaný na plochu).
// Soubory a text se uloží do cache a aplikace si je po otevření vyzvedne (/?share=1).
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "POST" || url.origin !== self.location.origin || url.pathname !== "/share") return;
  e.respondWith((async () => {
    try {
      const fd = await e.request.formData();
      const cache = await caches.open("aloiz-share");
      for (const k of await cache.keys()) await cache.delete(k);
      const text = [fd.get("text"), fd.get("url")].filter(Boolean).join("\n") || fd.get("title") || "";
      const meta = { text: String(text), files: [] };
      let i = 0;
      for (const f of fd.getAll("files")) {
        if (!f || typeof f === "string") continue;
        const key = "/share-file/" + i++;
        await cache.put(key, new Response(f, { headers: { "Content-Type": f.type || "application/octet-stream" } }));
        meta.files.push({ key, name: f.name || "soubor", type: f.type || "" });
      }
      await cache.put("/share-meta", new Response(JSON.stringify(meta), { headers: { "Content-Type": "application/json" } }));
    } catch (err) { /* nic, aplikace se jen otevře */ }
    return Response.redirect("/?share=1", 303);
  })());
});
