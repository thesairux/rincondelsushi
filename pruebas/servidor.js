/* Servidor de prueba (node pruebas/servidor.js): la página, el Manager, las funciones de api/ y, simulados, Upstash Redis, Resend, GitHub y Flow. */
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const RAIZ = path.join(__dirname, "..");
const PUERTO = +process.env.PUERTO || 8790;
const BASE = `http://localhost:${PUERTO}`;
Object.assign(process.env, {
  UPSTASH_REDIS_REST_URL: BASE + "/redis", UPSTASH_REDIS_REST_TOKEN: "t",
  RESEND_API_KEY: "re_prueba", GITHUB_TOKEN: "ghp_prueba", ADMIN_PASSWORD: "clave",
  FLOW_API_KEY: "flow-key", FLOW_SECRET_KEY: "flow-secret", FLOW_URL: BASE + "/flow", SITIO_URL: BASE
});
if (process.env.SIN_FLOW) { delete process.env.FLOW_API_KEY; delete process.env.FLOW_SECRET_KEY; }

/* ---- Redis en memoria ---- */
const db = new Map(), vence = new Map();
const vivo = k => { if (vence.has(k) && vence.get(k) < Date.now()) { db.delete(k); vence.delete(k); } return db.get(k); };
function cmd(c) {
  const [op, k, ...a] = c; const A = op.toUpperCase();
  if (A === "GET") return vivo(k) ?? null;
  if (A === "SET") { if (a.includes("NX") && vivo(k) !== undefined) return null; const keep = a.includes("KEEPTTL"); db.set(k, a[0]); if (!keep) vence.delete(k); const i = a.indexOf("EX"); if (i >= 0) vence.set(k, Date.now() + a[i + 1] * 1000); const j = a.indexOf("PX"); if (j >= 0) vence.set(k, Date.now() + +a[j + 1]); return "OK"; }
  if (A === "DEL") { const h = db.delete(k); vence.delete(k); return h ? 1 : 0; }
  if (A === "INCR") { const v = (+vivo(k) || 0) + 1; db.set(k, String(v)); return v; }
  if (A === "EXPIRE") { if (a[1] === "NX" && vence.has(k)) return 0; vence.set(k, Date.now() + a[0] * 1000); return 1; }
  if (A === "RPUSH" || A === "LPUSH") { const l = vivo(k) || []; A === "RPUSH" ? l.push(...a) : l.unshift(...a.reverse()); db.set(k, l); return l.length; }
  if (A === "LRANGE") { const l = vivo(k) || []; const fin = +a[1] < 0 ? l.length + +a[1] + 1 : +a[1] + 1; return l.slice(+a[0], fin); }
  if (A === "LTRIM") { const l = vivo(k) || []; db.set(k, l.slice(+a[0], +a[1] + 1)); return "OK"; }
  if (A === "MGET") return [k, ...a].map(x => vivo(x) ?? null);
  if (A === "HSET") { const h = vivo(k) || new Map(); let n = 0; for (let i = 0; i < a.length; i += 2) { if (!h.has(a[i])) n++; h.set(a[i], a[i + 1]); } db.set(k, h); return n; }
  if (A === "HGET") { const h = vivo(k); return h && h.has(a[0]) ? h.get(a[0]) : null; }
  if (A === "HMGET") { const h = vivo(k); return a.map(f => h && h.has(f) ? h.get(f) : null); }
  if (A === "HGETALL") { const h = vivo(k); return h ? [...h].flat() : []; }
  if (A === "HDEL") { const h = vivo(k); let n = 0; if (h) for (const f of a) if (h.delete(f)) n++; return n; }
  if (A === "HLEN") { const h = vivo(k); return h ? h.size : 0; }
  throw new Error("comando no simulado: " + A);
}

/* ---- Flow simulado ---- */
const pagos = new Map();  // token → { commerceOrder, amount, status, urlReturn, urlConfirmation }
const firmar = p => crypto.createHmac("sha256", "flow-secret").update(Object.keys(p).sort().map(k => k + p[k]).join("")).digest("hex");
function verificar(p) { const { s, ...resto } = p; return s === firmar(resto); }

/* ---- fetch interceptado: Resend y GitHub ---- */
const correos = [];
const fetchReal = global.fetch;
global.fetch = async (url, o = {}) => {
  url = String(url);
  if (url.startsWith("https://api.resend.com/")) { correos.push(JSON.parse(o.body)); return new Response(JSON.stringify({ id: "x" }), { status: 200 }); }
  if (url.startsWith("https://api.github.com/") && url.includes("/contents/carta.js")) {
    return new Response(JSON.stringify({ content: fs.readFileSync(path.join(RAIZ, "carta.js")).toString("base64") }), { status: 200 });
  }
  return fetchReal(url, o);
};

process.chdir(RAIZ);
const funciones = { "/api/pedidos": require(RAIZ + "/api/pedidos.js"), "/api/pago": require(RAIZ + "/api/pago.js"), "/api/admin": require(RAIZ + "/api/admin.js"), "/api/manager": require(RAIZ + "/api/manager.js") };
const tipos = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".ico": "image/x-icon", ".json": "application/json" };
const leerCuerpo = req => new Promise(r => { const b = []; req.on("data", c => b.push(c)); req.on("end", () => r(Buffer.concat(b).toString())); });

http.createServer(async (req, res) => {
  const u = new URL(req.url, BASE);
  try {
    if (u.pathname === "/redis/pipeline" || u.pathname === "/redis/multi-exec") {
      const cmds = JSON.parse(await leerCuerpo(req));
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify(cmds.map(c => { try { return { result: cmd(c) }; } catch (e) { return { error: e.message }; } })));
    }
    if (u.pathname === "/flow/payment/create") {
      const p = Object.fromEntries(new URLSearchParams(await leerCuerpo(req)));
      if (!verificar(p)) { res.statusCode = 401; return res.end(JSON.stringify({ message: "firma" })); }
      if (!p.email) { res.statusCode = 400; return res.end(JSON.stringify({ message: "email" })); }
      const token = crypto.randomBytes(8).toString("hex");
      pagos.set(token, { commerceOrder: p.commerceOrder, amount: +p.amount, status: 1, urlReturn: p.urlReturn, urlConfirmation: p.urlConfirmation, email: p.email, subject: p.subject });
      return res.end(JSON.stringify({ url: BASE + "/flow-pagar", token, flowOrder: 9000 + pagos.size }));
    }
    if (u.pathname === "/flow/payment/getStatus") {
      const p = Object.fromEntries(u.searchParams);
      if (!verificar(p)) { res.statusCode = 401; return res.end(JSON.stringify({ message: "firma" })); }
      const x = pagos.get(p.token);
      if (!x) { res.statusCode = 400; return res.end(JSON.stringify({ message: "token" })); }
      return res.end(JSON.stringify({ flowOrder: 9001, commerceOrder: x.commerceOrder, status: x.status, amount: x.amount }));
    }
    if (u.pathname === "/flow-pagar") {
      // página de Flow simulada: «Pagar» o «Rechazar»
      const token = u.searchParams.get("token"), x = pagos.get(token);
      const r = u.searchParams.get("r");
      if (r) {
        x.status = r === "ok" ? 2 : 3;
        await fetchReal(x.urlConfirmation, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "token=" + token });
        res.setHeader("Content-Type", "text/html");
        return res.end(`<form id="f" method="post" action="${x.urlReturn}"><input name="token" value="${token}"></form><script>document.getElementById("f").submit()</script>`);
      }
      res.setHeader("Content-Type", "text/html");
      return res.end(`<h1>Flow (prueba)</h1><p id="monto">${x.amount}</p><p>${x.subject}</p><a id="pagar" href="?token=${token}&r=ok">Pagar</a> <a id="rechazar" href="?token=${token}&r=no">Rechazar</a>`);
    }
    if (u.pathname === "/__reiniciar") { db.clear(); vence.clear(); correos.length = 0; return res.end("ok"); }
    if (u.pathname === "/__correos") { res.setHeader("Content-Type", "application/json"); return res.end(JSON.stringify(correos)); }
    if (u.pathname === "/__pagos") { res.setHeader("Content-Type", "application/json"); return res.end(JSON.stringify([...pagos.values()])); }
    if (funciones[u.pathname]) return await funciones[u.pathname](req, res);
    let f = path.join(RAIZ, decodeURIComponent(u.pathname));
    if (u.pathname === "/" ) f = path.join(RAIZ, "index.html");
    if (u.pathname === "/admin") f = path.join(RAIZ, "admin.html");
    if (u.pathname === "/manager") f = path.join(RAIZ, "manager.html");
    if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; return res.end("no"); }
    res.setHeader("Content-Type", tipos[path.extname(f)] || "application/octet-stream");
    fs.createReadStream(f).pipe(res);
  } catch (e) { console.error(e); res.statusCode = 500; res.end(String(e.stack)); }
}).listen(PUERTO, () => console.log("listo " + BASE));
