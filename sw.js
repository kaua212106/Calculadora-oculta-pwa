/* Service worker da Calculadora (PWA). Para forçar atualização nos aparelhos, mude o número da versão abaixo. */
const VERSAO = "calc-v2";
const ARQUIVOS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSAO).then(c => Promise.all(ARQUIVOS.map(a => c.add(a).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;           // só arquivos do próprio app
  if (req.mode === "navigate") {                        // página: tenta a rede (pega atualizações), cai no cache se offline
    e.respondWith(
      fetch(req).then(r => { const c = r.clone(); caches.open(VERSAO).then(ch => ch.put("./index.html", c)); return r; })
        .catch(() => caches.match("./index.html").then(r => r || caches.match("./")))
    );
    return;
  }
  e.respondWith(                                        // ícones e demais arquivos: cache primeiro
    caches.match(req).then(r => r || fetch(req).then(n => { if (n.ok) { const c = n.clone(); caches.open(VERSAO).then(ch => ch.put(req, c)); } return n; }))
  );
});
