/*
  Pedidos y cuentas de los clientes (lo usa la página).
  GET  /api/pedidos                → qué está configurado (sin datos privados)
  POST /api/pedidos { accion: … }  → codigo, entrar, perfil, guardar-perfil, crear, estado
  La configuración está explicada en api/_tienda.js.
*/
const crypto = require("crypto");
const T = require("./_tienda");
const P = require("./_precios");
const F = require("./_flow");

function configuracion() {
  const base = !!T.redisConf(), correo = !!T.correoConf();
  return { ok: true, pedidos: base, correo: base && correo, cuentas: base && correo && !!T.secreto(), online: base && !!F.flowConf() };
}

async function perfilDe(email) {
  return (await T.leer("cliente:" + email)) || { email, nombre: "", direcciones: [] };
}
async function pedidosDe(email) {
  const [ids] = await T.redis([["LRANGE", T.PREFIJO + "cliente:" + email + ":pedidos", 0, 9]]);
  if (!ids || !ids.length) return [];
  const [vals] = await T.redis([["MGET", ...ids.map(id => T.PREFIJO + "pedido:" + id)]]);
  return vals.filter(Boolean).map(v => T.publico(JSON.parse(v)));
}
function recordarDireccion(perfil, direccion, ubicacion) {
  if (!direccion) return;
  const lista = (perfil.direcciones || []).filter(d => d.texto.toLowerCase() !== direccion.toLowerCase());
  lista.unshift(ubicacion ? { texto: direccion, ubicacion } : { texto: direccion });
  perfil.direcciones = lista.slice(0, 5);
}
function ubicacionValida(u) {
  if (!u || typeof u !== "object") return null;
  const lat = +u.lat, lng = +u.lng;
  return isFinite(lat) && isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat: +lat.toFixed(6), lng: +lng.toFixed(6) } : null;
}
function numeroValido(v, max) { const n = Math.round(+v); return isFinite(n) && n >= 0 && n <= max ? n : 0; }

/* Los datos del cliente, revisados. Los productos y los montos se calculan aquí con la carta (P.calcular). */
function limpiarPedido(d, C) {
  if (!d || typeof d !== "object") return { error: "datos" };
  const N = C.negocio || {};
  const modo = d.modo === "delivery" ? "delivery" : "retiro";
  const sucursales = (N.sucursales || []).filter(x => x && x.nombre);
  const suc = sucursales.find(x => x.nombre === d.sucursal);
  if (sucursales.length > 1 && !suc) return { error: "datos", motivo: "Elige la sucursal." };
  const pagos = modo === "delivery" ? (N.pagosDelivery || N.pagos || []) : (N.pagosRetiro || N.pagos || []);
  const pago = d.pago === "Online" ? "Online" : T.texto(d.pago, 40);
  if (pagos.length && pago !== "Online" && !pagos.includes(pago)) return { error: "datos", motivo: "Elige cómo pagas." };
  const p = {
    nombre: T.texto(d.nombre, 60),
    email: T.email(d.email),
    sucursal: suc ? suc.nombre : (sucursales[0] || {}).nombre || "",
    sucursalDireccion: suc ? T.texto(suc.direccion, 160) : "",
    sucursalWhatsapp: suc ? String(suc.whatsapp || "") : String(N.whatsapp || ""),
    local: T.texto(N.nombre, 80),
    modo,
    direccion: modo === "delivery" ? T.texto(d.direccion, 160) : "",
    ubicacion: modo === "delivery" ? ubicacionValida(d.ubicacion) : null,
    pago: { metodo: pago, estado: pago === "Online" ? "pendiente" : "" }
  };
  if (!p.nombre) return { error: "datos", motivo: "Falta tu nombre." };
  if (modo === "delivery" && !p.direccion) return { error: "datos", motivo: "Falta la dirección de entrega." };
  const r = P.calcular(C, { modo, ubicacion: p.ubicacion, cupon: T.texto(d.cupon, 30), items: d.items });
  if (r.error) return { error: "datos", motivo: r.error };
  Object.assign(p, { items: r.items, subtotal: r.subtotal, cupon: r.cupon, descuento: r.descuento, delivery: r.delivery, total: r.total, fueraDeZona: r.fueraDeZona });
  if (pago === "Online") {
    if (!p.email) return { error: "datos", motivo: "Para pagar online necesitamos tu correo." };
    if (modo === "delivery" && (!p.ubicacion || r.fueraDeZona)) return { error: "datos", motivo: "Para pagar online el delivery, elige tu dirección de la lista (dentro de la zona de despacho)." };
  }
  return { pedido: p };
}

async function codigo(body, req) {
  const email = T.email(body.email);
  if (!email) return [400, { error: "email" }];
  if (!(await T.permitido("codigo:" + email, 3, 600)) || !(await T.permitido("codigo-ip:" + T.ip(req), 10, 3600))) {
    return [429, { error: "espera" }];
  }
  const cod = String(crypto.randomInt(0, 1e6)).padStart(6, "0");
  await T.guardar("codigo:" + email, { h: T.hashCodigo(email, cod), n: 0 }, 600);
  const ok = await T.correo(email, `Tu código para entrar: ${cod}`, `Tu código es ${cod}`,
    ["Escríbelo en la página para entrar a tu cuenta. Vence en 10 minutos.", "Si no lo pediste tú, no tienes que hacer nada."],
    T.texto(body.local, 80));
  return ok ? [200, { ok: true }] : [502, { error: "correo" }];
}

async function entrar(body) {
  const email = T.email(body.email);
  const cod = String(body.codigo || "").replace(/\D/g, "");
  if (!email || cod.length !== 6) return [400, { error: "codigo" }];
  const guardado = await T.leer("codigo:" + email);
  if (!guardado) return [400, { error: "vencido" }];
  const ok = crypto.timingSafeEqual(Buffer.from(guardado.h), Buffer.from(T.hashCodigo(email, cod)));
  if (!ok) {
    guardado.n = (guardado.n || 0) + 1;
    if (guardado.n >= 5) await T.redis([["DEL", T.PREFIJO + "codigo:" + email]]);
    else await T.redis([["SET", T.PREFIJO + "codigo:" + email, JSON.stringify(guardado), "KEEPTTL"]]);
    return [400, { error: guardado.n >= 5 ? "vencido" : "codigo" }];
  }
  await T.redis([["DEL", T.PREFIJO + "codigo:" + email]]);
  const perfil = await perfilDe(email);
  if (!(await T.leer("cliente:" + email))) await T.guardar("cliente:" + email, perfil);
  return [200, { ok: true, token: T.firmar(email, 90), perfil, pedidos: await pedidosDe(email) }];
}

async function crear(body, req) {
  if (!(await T.permitido("crear-ip:" + T.ip(req), 30, 3600))) return [429, { error: "espera" }];
  const C = await P.cargarCarta();
  const l = limpiarPedido(body.pedido, C);
  if (l.error) return [400, { error: l.error, motivo: l.motivo || "" }];
  const p = l.pedido;
  // la página muestra un total; si la carta cambió desde que se abrió, se avisa en vez de cobrar otro monto
  const totalPagina = body.pedido && body.pedido.total;
  if (totalPagina != null && Math.round(+totalPagina) !== p.total) return [409, { error: "precio", total: p.total, motivo: `El total cambió a ${T.plata(p.total)}: la carta se actualizó. Revisa tu pedido.` }];
  const online = p.pago.metodo === "Online";
  if (online && !F.flowConf()) return [400, { error: "datos", motivo: "El pago online no está disponible." }];
  const cuenta = T.sesion(body.token);
  if (cuenta) { p.cuenta = cuenta; if (!p.email) p.email = cuenta; }
  const [id] = await T.redis([["INCR", T.PREFIJO + "contador"]]);
  const ahora = Date.now();
  const inicial = online ? "esperando-pago" : "recibido";
  Object.assign(p, { id, clave: crypto.randomBytes(9).toString("base64url"), creado: ahora, estado: inicial,
    historial: [{ estado: inicial, t: ahora }], avisos: [] });
  let pagoUrl = "";
  if (online) {
    try {
      const f = await F.crearPago(req, p, p.local);
      p.pago.token = f.token; p.pago.flowOrder = f.flowOrder; pagoUrl = f.url;
    } catch (e) {
      return [502, { error: "pago", motivo: "No pudimos abrir el pago online. Inténtalo de nuevo o elige otra forma de pago." }];
    }
  }
  const dia = T.PREFIJO + "dia:" + T.fecha(ahora);
  const cmds = [
    ["SET", T.PREFIJO + "pedido:" + id, JSON.stringify(p), "EX", T.DIAS_PEDIDO * 86400],
    ["RPUSH", dia, id], ["EXPIRE", dia, 5 * 86400]
  ];
  if (cuenta) {
    const lista = T.PREFIJO + "cliente:" + cuenta + ":pedidos";
    cmds.push(["LPUSH", lista, id], ["LTRIM", lista, 0, 29]);
  }
  await T.redis(cmds);
  if (cuenta) {
    const perfil = await perfilDe(cuenta);
    perfil.nombre = p.nombre;
    if (p.modo === "delivery") recordarDireccion(perfil, p.direccion, p.ubicacion);
    await T.guardar("cliente:" + cuenta, perfil);
  }
  return [200, { ok: true, id, numero: T.numero(id), clave: p.clave, total: p.total, delivery: p.delivery, pagoUrl }];
}

async function estado(body) {
  const id = numeroValido(body.id, 1e9);
  const p = id && (await T.leer("pedido:" + id));
  if (!p) return [404, { error: "no-existe" }];
  const cuenta = T.sesion(body.token);
  const clave = String(body.clave || "");
  const suyo = (cuenta && p.cuenta === cuenta) ||
    (clave.length === p.clave.length && crypto.timingSafeEqual(Buffer.from(clave), Buffer.from(p.clave)));
  return suyo ? [200, { ok: true, pedido: T.publico(p) }] : [404, { error: "no-existe" }];
}

module.exports = async (req, res) => {
  if (req.method === "GET") return T.send(res, 200, configuracion());
  if (req.method !== "POST") return T.send(res, 405, { error: "metodo" });
  let body;
  try { body = (await T.readBody(req)) || {}; } catch (e) { return T.send(res, 400, { error: "datos" }); }
  const conf = configuracion();
  if (!conf.pedidos) return T.send(res, 503, { error: "sin-base" });
  try {
    let r;
    if (body.accion === "crear") r = await crear(body, req);
    else if (body.accion === "estado") r = await estado(body);
    else if (["codigo", "entrar", "perfil", "guardar-perfil"].includes(body.accion) && !conf.cuentas) r = [503, { error: "sin-cuentas" }];
    else if (body.accion === "codigo") r = await codigo(body, req);
    else if (body.accion === "entrar") r = await entrar(body);
    else if (body.accion === "perfil" || body.accion === "guardar-perfil") {
      const email = T.sesion(body.token);
      if (!email) r = [401, { error: "sesion" }];
      else {
        const perfil = await perfilDe(email);
        if (body.accion === "guardar-perfil") {
          if (typeof body.nombre === "string") perfil.nombre = T.texto(body.nombre, 60);
          if (body.quitarDireccion) perfil.direcciones = (perfil.direcciones || []).filter(d => d.texto !== body.quitarDireccion);
          await T.guardar("cliente:" + email, perfil);
        }
        r = [200, { ok: true, perfil, pedidos: await pedidosDe(email) }];
      }
    } else r = [400, { error: "accion" }];
    return T.send(res, r[0], r[1]);
  } catch (e) {
    if (e.client) return T.send(res, 503, { error: e.client });
    console.error("pedidos:", e.message);
    return T.send(res, 502, { error: "servidor" });
  }
};
