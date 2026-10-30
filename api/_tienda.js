/*
  Lo que comparten api/pedidos.js (la página) y api/admin.js (el panel): dónde se guardan los pedidos y las
  cuentas de los clientes, el envío de correos y las sesiones. Los archivos de api/ que empiezan con _ no son
  direcciones públicas.

  Se configura en Vercel → Settings → Environment Variables:
    UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN  (o KV_REST_API_URL y KV_REST_API_TOKEN)
                    base de datos donde quedan los pedidos y las cuentas. Se crea gratis en Vercel →
                    Storage → Upstash for Redis, y las variables se agregan solas.
    RESEND_API_KEY  clave de Resend (resend.com) para mandar los correos: el código para entrar y el aviso
                    de pedido listo.
    AVISOS_REMITENTE (opcional) quién manda los correos, ej: "El Rincón del Sushi <pedidos@rincondelsushi.cl>".
                    El dominio tiene que estar verificado en Resend.
    CLIENTES_SECRET (opcional) clave para firmar las sesiones de los clientes. Si no está, se usa una que sale
                    de GITHUB_TOKEN (que nunca llega al navegador).
  Sin la base de datos, la página funciona como antes: el pedido va solo por WhatsApp.
*/
const crypto = require("crypto");

const PREFIJO = "rs:";
const DIAS_PEDIDO = 60;          // cuánto se guarda cada pedido
const ZONA = "America/Santiago";

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}
async function readBody(req) {
  const formulario = /application\/x-www-form-urlencoded/i.test(req.headers["content-type"] || "");
  const leerTexto = t => (formulario ? Object.fromEntries(new URLSearchParams(t)) : JSON.parse(t || "{}"));
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return leerTexto(req.body);
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return leerTexto(Buffer.concat(chunks).toString("utf8"));
}
function ip(req) { return String(req.headers["x-forwarded-for"] || req.socket && req.socket.remoteAddress || "").split(",")[0].trim(); }

/* ---------- base de datos (Upstash Redis por REST) ---------- */
function redisConf() {
  const env = process.env;
  const url = (env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL || "").trim();
  const tok = (env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN || "").trim();
  return url && tok ? { url: url.replace(/\/$/, ""), tok } : null;
}
/* Varios comandos en un viaje: [["GET", "k"], ["SET", "k", "v"]] → [resultado, resultado] */
async function redis(comandos) {
  const c = redisConf();
  if (!c) throw Object.assign(new Error("sin base"), { client: "sin-base" });
  const res = await fetch(c.url + "/pipeline", {
    method: "POST",
    headers: { Authorization: `Bearer ${c.tok}`, "Content-Type": "application/json" },
    body: JSON.stringify(comandos.map(cmd => cmd.map(String)))
  });
  if (!res.ok) throw Object.assign(new Error(`Redis ${res.status}`), { status: res.status });
  const data = await res.json();
  return data.map(r => { if (r.error) throw new Error("Redis: " + r.error); return r.result; });
}
async function leer(clave) {
  const [v] = await redis([["GET", PREFIJO + clave]]);
  try { return v ? JSON.parse(v) : null; } catch (e) { return null; }
}
async function guardar(clave, valor, segundos) {
  const cmd = ["SET", PREFIJO + clave, JSON.stringify(valor)];
  if (segundos) cmd.push("EX", segundos);
  await redis([cmd]);
}
/* Cuenta intentos en una ventana de tiempo: devuelve false si ya pasó el máximo */
async function permitido(clave, max, segundos) {
  const k = PREFIJO + "limite:" + clave;
  const [, n] = await redis([["SET", k, 0, "EX", segundos, "NX"], ["INCR", k]]);
  return n <= max;
}

/* ---------- correo (Resend) ---------- */
function correoConf() {
  const key = (process.env.RESEND_API_KEY || "").trim();
  return key ? { key, desde: (process.env.AVISOS_REMITENTE || "El Rincón del Sushi <onboarding@resend.dev>").trim() } : null;
}
async function correo(para, asunto, titulo, parrafos, nombreLocal) {
  const c = correoConf();
  if (!c) return false;
  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#f4f1ee;font-family:Arial,Helvetica,sans-serif;color:#1d1a1f">
<div style="max-width:520px;margin:0 auto;padding:28px 20px">
<p style="margin:0 0 18px;font-weight:bold;font-size:18px;color:#d01c23">${esc(nombreLocal || "El Rincón del Sushi")}</p>
<div style="background:#fff;border-radius:6px;padding:26px 24px">
<h1 style="margin:0 0 14px;font-size:22px;line-height:1.25">${esc(titulo)}</h1>
${parrafos.map(p => `<p style="margin:0 0 12px;font-size:15px;line-height:1.5">${esc(p)}</p>`).join("")}
</div>
<p style="margin:16px 0 0;font-size:12px;color:#7a7378">Recibes este correo porque lo dejaste al hacer tu pedido en nuestra página.</p>
</div></body></html>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${c.key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: c.desde, to: [para], subject: asunto, html, text: [titulo, ...parrafos].join("\n\n") })
  });
  return res.ok;
}
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- sesiones de los clientes ---------- */
function secreto() {
  const propio = (process.env.CLIENTES_SECRET || "").trim();
  if (propio) return propio;
  const gh = (process.env.GITHUB_TOKEN || "").trim();
  return gh ? crypto.createHmac("sha256", gh).update("sesiones-clientes").digest("hex") : "";
}
function b64(s) { return Buffer.from(s).toString("base64url"); }
function firmar(email, dias) {
  const datos = b64(JSON.stringify({ e: email, x: Date.now() + dias * 864e5 }));
  return datos + "." + crypto.createHmac("sha256", secreto()).update(datos).digest("base64url");
}
function sesion(token) {
  if (typeof token !== "string" || !secreto()) return null;
  const [datos, firma] = token.split(".");
  if (!datos || !firma) return null;
  const ok = crypto.createHmac("sha256", secreto()).update(datos).digest("base64url");
  if (ok.length !== firma.length || !crypto.timingSafeEqual(Buffer.from(ok), Buffer.from(firma))) return null;
  try {
    const d = JSON.parse(Buffer.from(datos, "base64url").toString("utf8"));
    return d && typeof d.e === "string" && d.x > Date.now() ? d.e : null;
  } catch (e) { return null; }
}
function hashCodigo(email, codigo) { return crypto.createHmac("sha256", secreto()).update(email + ":" + codigo).digest("hex"); }

/* ---------- utilidades ---------- */
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/i;
function email(v) { const e = String(v || "").trim().toLowerCase(); return EMAIL.test(e) && e.length <= 200 ? e : ""; }
function texto(v, max) { return String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max); }
function fecha(t) {
  const p = {};
  new Intl.DateTimeFormat("en-CA", { timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(new Date(t || Date.now())).forEach(x => { p[x.type] = x.value; });
  return `${p.year}-${p.month}-${p.day}`;
}
function plata(n) { return "$" + String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
function numero(id) { return String(id).padStart(4, "0"); }

const ESTADOS = {
  "esperando-pago": "Esperando el pago online",
  recibido:    "Recibido",
  preparando:  "En preparación",
  listo:       "Listo para retirar",
  "en-camino": "En camino",
  entregado:   "Entregado",
  cancelado:   "Cancelado"
};

/* Lo que puede ver el cliente de su pedido */
function publico(p) {
  return {
    id: p.id, numero: numero(p.id), creado: p.creado, estado: p.estado, estadoTexto: ESTADOS[p.estado] || p.estado,
    sucursal: p.sucursal, modo: p.modo, total: p.total, items: (p.items || []).map(it => ({ cant: it.cant, nombre: it.nombre })),
    pago: p.pago ? { metodo: p.pago.metodo, estado: p.pago.estado || "" } : null
  };
}

module.exports = {
  PREFIJO, DIAS_PEDIDO, ESTADOS,
  send, readBody, ip, redis, redisConf, leer, guardar, permitido, correo, correoConf,
  secreto, firmar, sesion, hashCodigo, email, texto, fecha, plata, numero, publico
};
