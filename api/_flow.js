/*
  Pago online con Flow (flow.cl: Webpay, tarjetas, OnePay, Servipag…).
  Se configura en Vercel → Settings → Environment Variables:
    FLOW_API_KEY y FLOW_SECRET_KEY  las claves del comercio (Flow → Mis datos → Integración).
    FLOW_SANDBOX    (opcional) "1" para probar con sandbox.flow.cl antes de cobrar de verdad.
    SITIO_URL       (opcional) la dirección de la página, ej: https://rincondelsushi.cl. Si no está, se usa la de Vercel.
  Sin las claves, la página no muestra «Pagar online».
*/
const crypto = require("crypto");

function flowConf() {
  const key = (process.env.FLOW_API_KEY || "").trim(), secret = (process.env.FLOW_SECRET_KEY || "").trim();
  if (!key || !secret) return null;
  const base = (process.env.FLOW_URL || "").trim() || (process.env.FLOW_SANDBOX === "1" ? "https://sandbox.flow.cl/api" : "https://www.flow.cl/api");
  return { key, secret, base: base.replace(/\/$/, "") };
}
/* Firma de Flow: los parámetros ordenados por nombre, «nombre + valor» seguidos, con HMAC-SHA256 */
function firma(params, secret) {
  const texto = Object.keys(params).sort().map(k => k + params[k]).join("");
  return crypto.createHmac("sha256", secret).update(texto).digest("hex");
}
async function llamar(c, metodo, ruta, params) {
  const p = Object.assign({ apiKey: c.key }, params);
  p.s = firma(p, c.secret);
  const qs = new URLSearchParams(p).toString();
  const res = metodo === "GET"
    ? await fetch(`${c.base}${ruta}?${qs}`)
    : await fetch(`${c.base}${ruta}`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: qs });
  let data = null;
  try { data = await res.json(); } catch (e) {}
  if (!res.ok) throw Object.assign(new Error("Flow " + res.status + (data && data.message ? ": " + data.message : "")), { status: res.status, flow: data });
  return data;
}
function sitio(req) {
  const propio = (process.env.SITIO_URL || "").trim().replace(/\/$/, "");
  if (propio) return propio;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL && process.env.VERCEL_ENV === "production") return "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0];
  return `${proto}://${req.headers["x-forwarded-host"] || req.headers.host}`;
}
/* Crea el cobro y devuelve la dirección de Flow a la que se manda al cliente */
async function crearPago(req, pedido, local) {
  const c = flowConf();
  const base = sitio(req);
  const r = await llamar(c, "POST", "/payment/create", {
    commerceOrder: "RS-" + pedido.id,
    subject: `Pedido N° ${String(pedido.id).padStart(4, "0")} · ${local || "El Rincón del Sushi"}`.slice(0, 120),
    currency: "CLP",
    amount: String(pedido.total),
    email: pedido.email,
    paymentMethod: "9",
    urlConfirmation: base + "/api/pago?tipo=confirmar",
    urlReturn: base + "/api/pago?tipo=volver",
    timeout: "1800"
  });
  return { url: r.url + "?token=" + encodeURIComponent(r.token), token: r.token, flowOrder: r.flowOrder };
}
/* status: 1 pendiente, 2 pagado, 3 rechazado, 4 anulado */
async function estadoPago(token) {
  return llamar(flowConf(), "GET", "/payment/getStatus", { token });
}

module.exports = { flowConf, firma, crearPago, estadoPago, sitio };
