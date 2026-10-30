/* Servidor de prueba (node pruebas/servidor.js): la página y el panel, con GitHub simulado.
   «Publicar» en el panel no guarda nada: la carta publicada queda en /__publicado para revisarla. */
const http = require("http");
const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const PUERTO = +process.env.PUERTO || 8790;
const BASE = `http://localhost:${PUERTO}`;
Object.assign(process.env, { GITHUB_TOKEN: "ghp_prueba", ADMIN_PASSWORD: "clave", GITHUB_REPO: "prueba/rincondelsushi", GITHUB_BRANCH: "main" });

/* ---- GitHub simulado: lee carta.js del disco y recibe lo que se publica ---- */
let publicado = null;
const fetchReal = global.fetch;
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
global.fetch = async (url, o = {}) => {
  url = String(url);
  if (!url.startsWith("https://api.github.com/")) return fetchReal(url, o);
  const metodo = (o.method || "GET").toUpperCase();
  const cuerpo = o.body ? JSON.parse(o.body) : null;
  if (url.includes("/contents/carta.js")) return json({ sha: "carta", content: fs.readFileSync(path.join(RAIZ, "carta.js")).toString("base64") });
  if (url.includes("/git/ref")) return json({ object: { sha: "cabeza" } });
  if (url.includes("/git/commits/cabeza")) return json({ sha: "cabeza", tree: { sha: "arbol" } });
  if (url.includes("/git/trees/arbol")) return json({ tree: [] });
  if (url.includes("/git/blobs") && metodo === "POST") {
    if (cuerpo.encoding === "utf-8") publicado = cuerpo.content;   // la carta; las fotos llegan en base64
    return json({ sha: require("crypto").randomBytes(20).toString("hex") });
  }
  if (url.includes("/git/trees") && metodo === "POST") return json({ sha: "arbol-nuevo" });
  if (url.includes("/git/commits") && metodo === "POST") return json({ sha: "commit-nuevo" });
  if (url.includes("/git/refs/heads/") && metodo === "PATCH") return json({ ok: true });
  return json({ message: "no simulado: " + metodo + " " + url }, 404);
};

process.chdir(RAIZ);
const admin = require(RAIZ + "/api/admin.js");
const tipos = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".ico": "image/x-icon", ".json": "application/json" };

http.createServer(async (req, res) => {
  const u = new URL(req.url, BASE);
  try {
    if (u.pathname === "/api/admin") return await admin(req, res);
    if (u.pathname === "/__publicado") { res.setHeader("Content-Type", "text/javascript"); return res.end(publicado || ""); }
    let f = path.join(RAIZ, decodeURIComponent(u.pathname));
    if (u.pathname === "/") f = path.join(RAIZ, "index.html");
    if (u.pathname === "/admin") f = path.join(RAIZ, "admin.html");
    if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; return res.end("no"); }
    res.setHeader("Content-Type", tipos[path.extname(f)] || "application/octet-stream");
    fs.createReadStream(f).pipe(res);
  } catch (e) { console.error(e); res.statusCode = 500; res.end(String(e.stack)); }
}).listen(PUERTO, () => console.log("listo " + BASE));
