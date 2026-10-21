// offline support for the installed app: the pages and icons are cached on install.
// Pages come from the network when it is there, so updates still arrive; everything else (icons, Google Fonts) is served from the cache and refreshed behind the scenes.
// Bump CACHE when the list of files changes.
const CACHE="tresor-v1",SHELL=["./","./index.html","./Tresor.html","./manifest.webmanifest","./icons/apple-touch-icon.png","./icons/icon-192.png","./icons/icon-512.png"];

self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});

self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;
  // fonts from Google come back opaque; those are fine to keep too
  const keep=res=>{if(res.ok||res.type==="opaque"){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy))}return res};
  if(r.mode==="navigate"){e.respondWith(fetch(r).then(keep).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match("./Tresor.html"))));return}
  e.respondWith(caches.match(r).then(m=>{const net=fetch(r).then(keep).catch(()=>m);return m||net}));
});
