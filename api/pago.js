/*
  Respuestas de Flow al pago online (la configuración está en api/_flow.js):
  POST /api/pago?tipo=confirmar  → Flow avisa el resultado (servidor a servidor)
  POST /api/pago?tipo=volver     → el cliente vuelve de Flow; se le manda a la página con su pedido
  En los dos casos se le pregunta a Flow el estado real del pago antes de marcar el pedido como pagado.
*/
const T = require("./_tienda");
const F = require("./_flow");

async function actualizar(token) {
  const st = await F.estadoPago(token);
  const m = /^RS-(\d+)$/.exec(String(st.commerceOrder || ""));
  if (!m) return null;
  const id = +m[1];
  const p = await T.leer("pedido:" + id);
  if (!p) return null;
  const antes = p.pago && p.pago.estado;
  if (st.status === 2 && Math.round(+st.amount) === p.total) {
    p.pago = Object.assign({}, p.pago, { estado: "pagado", flowOrder: st.flowOrder, t: Date.now() });
    if (p.estado === "esperando-pago") { p.estado = "recibido"; p.historial = (p.historial || []).concat({ estado: "recibido", t: Date.now() }); }
  } else if (st.status === 3 || st.status === 4) {
    p.pago = Object.assign({}, p.pago, { estado: st.status === 3 ? "rechazado" : "anulado" });
  } else if (st.status === 2) {
    p.pago = Object.assign({}, p.pago, { estado: "revisar", nota: `Flow cobró ${T.plata(st.amount)} y el pedido es de ${T.plata(p.total)}` });
  }
  if ((p.pago && p.pago.estado) !== antes) {
    await T.redis([["SET", T.PREFIJO + "pedido:" + id, JSON.stringify(p), "KEEPTTL"]]);
    if (p.pago.estado === "pagado" && p.email) {
      await T.correo(p.email, `Recibimos tu pago del pedido N° ${T.numero(id)}`, "¡Pago recibido!", [
        `Hola ${p.nombre}: recibimos el pago de ${T.plata(p.total)} de tu pedido N° ${T.numero(id)}.`,
        p.modo === "delivery" ? "Te avisaremos por correo cuando vaya en camino." : "Te avisaremos por correo cuando esté listo para retirar."
      ], p.local).catch(() => false);
    }
  }
  return p;
}

module.exports = async (req, res) => {
  const tipo = new URL(req.url, "http://x").searchParams.get("tipo");
  if (req.method !== "POST" || !F.flowConf() || !T.redisConf()) return T.send(res, 404, { error: "no" });
  let token = "";
  try { token = String(((await T.readBody(req)) || {}).token || ""); } catch (e) {}
  let p = null;
  try { if (token) p = await actualizar(token); } catch (e) { console.error("pago:", e.message); }
  if (tipo === "confirmar") { res.statusCode = 200; return res.end("ok"); }
  // vuelta del cliente: a la página, que muestra cómo quedó su pedido
  res.statusCode = 303;
  res.setHeader("Location", F.sitio(req) + "/" + (p ? `?pedido=${p.id}&c=${encodeURIComponent(p.clave)}` : "?pago=error"));
  res.end();
};
