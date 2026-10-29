/*
  Rincón Sushi Manager en el servidor de la página: su base de datos, los productos que salen de carta.js y la
  conexión con los pedidos de la página. Lo usan api/manager.js (el Manager), api/pedidos.js, api/admin.js y
  api/pago.js. Los datos quedan en la misma base que los pedidos (Upstash Redis, ver api/_tienda.js):
    rs:m:c:<colección>   documentos JSON (hash: id → documento)
    rs:m:v:<colección>   una marca por documento que cambia con cada escritura (así el Manager baja solo lo nuevo)
    rs:m:ver             sube con cada escritura: si no cambió, no hay nada nuevo que bajar
    rs:m:disp            lo que la página tiene que saber del Manager: productos agotados u ocultos y sucursales en pausa
*/
const crypto = require("crypto");
const T = require("./_tienda");
const P = require("./_precios");

const K = T.PREFIJO + "m:";
const COLECCIONES = ["config", "dias", "actividad", "clientes", "productos", "staff", "turnos"];
const ID = /^[A-Za-z0-9_\-.~:@+]{1,120}$/;
const ZONA = "America/Santiago";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const err = (code, mensaje) => Object.assign(new Error(mensaje || code), { code, mensaje: mensaje || "" });

/* "colección/documento" → { c, id } (o null si no es una ruta válida del Manager) */
function ruta(path) {
  const s = String(path || "").split("/");
  if (s.length !== 2 || !COLECCIONES.includes(s[0]) || !ID.test(s[1]) || s[1] === "." || s[1] === "..") return null;
  return { c: s[0], id: s[1] };
}

/* ---------- documentos ---------- */
const kDocs = c => K + "c:" + c, kVers = c => K + "v:" + c, kVer = K + "ver";
function pares(arr) { const o = {}; for (let i = 0; i + 1 < (arr || []).length; i += 2) o[arr[i]] = arr[i + 1]; return o; }
function parse(v) { try { return v ? JSON.parse(v) : null; } catch (e) { return null; } }
async function leerDoc(c, id) { const [v] = await T.redis([["HGET", kDocs(c), id]]); return parse(v); }
async function leerDocs(c, ids) {
  const o = {};
  if (!ids.length) return o;
  const [vals] = await T.redis([["HMGET", kDocs(c), ...ids]]);
  ids.forEach((id, i) => { o[id] = parse(vals[i]); });
  return o;
}
async function todos(c) {
  const [arr] = await T.redis([["HGETALL", kDocs(c)]]);
  const o = pares(arr);
  for (const k of Object.keys(o)) o[k] = parse(o[k]);
  return o;
}
async function versiones(cols) {
  if (!cols.length) return {};
  const r = await T.redis(cols.map(c => ["HGETALL", kVers(c)]));
  return Object.fromEntries(cols.map((c, i) => [c, pares(r[i])]));
}
async function version() { const [v] = await T.redis([["GET", kVer]]); return +v || 0; }
async function cuantos(c) { const [n] = await T.redis([["HLEN", kDocs(c)]]); return +n || 0; }
/* Guarda (o borra, con null) varios documentos de una vez; devuelve la marca de cada uno */
async function guardarDocs(c, lista) {
  const marcas = {}, cmds = [];
  for (const [id, data] of lista) {
    const marca = Date.now().toString(36) + crypto.randomBytes(3).toString("hex");
    if (data == null) cmds.push(["HDEL", kDocs(c), id], ["HDEL", kVers(c), id]);
    else { cmds.push(["HSET", kDocs(c), id, JSON.stringify(data)], ["HSET", kVers(c), id, marca]); marcas[id] = marca; }
  }
  if (!cmds.length) return marcas;
  cmds.push(["INCR", kVer]);
  await T.redisTx(cmds);
  return marcas;
}
async function guardarDoc(c, id, data) { return (await guardarDocs(c, [[id, data]]))[id] || ""; }

/* Un solo escritor a la vez por documento (los pedidos del día los tocan la página y el Manager) */
async function conCandado(nombre, fn) {
  const k = K + "lk:" + nombre, yo = crypto.randomBytes(6).toString("hex");
  for (let i = 0; i < 50; i++) {
    const [r] = await T.redis([["SET", k, yo, "NX", "PX", 5000]]);
    if (r === "OK") {
      try { return await fn(); } finally { await T.redis([["DEL", k]]).catch(() => {}); }
    }
    await sleep(50 + Math.random() * 100);
  }
  throw err("unavailable", "Hay otro cambio guardándose. Intenta de nuevo.");
}

/* Como en la base de claude.ai: los objetos se mezclan; listas y valores sueltos se reemplazan */
function mezclar(a, b) {
  const out = { ...(a || {}) };
  for (const [k, v] of Object.entries(b || {})) {
    out[k] = v && typeof v === "object" && !Array.isArray(v) && a && a[k] && typeof a[k] === "object" && !Array.isArray(a[k]) ? mezclar(a[k], v) : v;
  }
  return out;
}

/* ---------- utilidades ---------- */
function slug(s) { return P.sinTildes(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "local"; }
function hhmm(t) {
  const p = {};
  new Intl.DateTimeFormat("en-CA", { timeZone: ZONA, hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(t)).forEach(x => { p[x.type] = x.value; });
  return `${p.hour === "24" ? "00" : p.hour}:${p.minute}`;
}
const SECCION = [[/promo/, "promos"], [/menu/, "menu"], [/tabla/, "tablas"], [/premium/, "premium"], [/hand/, "handrolls"], [/roll/, "rolls"],
  [/especial/, "especiales"], [/box/, "box"], [/aperitiv/, "aperitivos"], [/bebida/, "bebidas"], [/salsa|extra/, "salsas"]];
function seccionId(nombre) { const n = P.sinTildes(nombre); const m = SECCION.find(([re]) => re.test(n)); return m ? m[1] : slug(nombre); }

/* ---------- la carta de la página como productos del Manager ---------- */
function gruposManager(X, id) {
  const p = X.PRODUCTOS[id].p, out = [];
  if (p.opciones && p.opciones.length) {
    const po = p.preciosOpciones || {};
    out.push({ id: "opcion", nombre: "Opción", obligatorio: true, min: 1, max: 1,
      items: p.opciones.map((o, i) => ({ id: "o" + i, nombre: o, extra: Math.max(0, (po[o] != null ? po[o] : p.precio) - p.precio) })) });
  }
  const grupo = (g, antes, sufijo) => ({
    id: g.id + sufijo, nombre: antes + g.nombre, obligatorio: (g.min || 0) > 0, min: g.min || 0,
    max: g.tipo === "elegir" ? (g.max || 1) : (g.max || 10),
    items: (g.opciones || []).map(o => ({ id: o.id, nombre: o.nombre, extra: o.precio || 0, ...(o.porDefecto ? { def: true } : {}), ...(o.disponible === false ? { agotado: true } : {}) }))
  });
  X.gruposProducto(id).filter(g => g.tipo !== "texto").forEach(g => out.push(grupo(g, "", "")));
  const porRoll = X.gruposDe(id).filter(g => g.porRoll && g.tipo !== "texto");
  const rolls = X.rollsDe(id), unidad = p.unidad || "Roll";
  rolls.forEach((r, i) => porRoll.forEach(g => out.push(grupo(g, rolls.length > 1 ? `${unidad} ${i + 1} · ` : "", rolls.length > 1 ? "-" + (i + 1) : ""))));
  return out;
}
function productoBase(X, id, orden) {
  const { p, sec } = X.PRODUCTOS[id];
  const dias = (p.dias || []).map(d => P.DIAS.indexOf(d)).filter(n => n >= 0);
  return {
    nombre: P.nombreLinea(X, id), seccion: seccionId(sec.nombre), precio: p.precio || 0,
    desc: p.detalle || p.incluye || p.nota || "", foto: p.foto || "", dias, opciones: gruposManager(X, id), orden,
    origen: "pagina", agotadoCarta: p.disponible === false, ...(p.destacado ? { destacado: true } : {})
  };
}
function configInicial(C) {
  const N = C.negocio || {};
  const sucursales = {};
  (N.sucursales || []).filter(s => s && s.nombre).forEach((s, i) => {
    sucursales[slug(s.nombre)] = { nombre: s.nombre, direccion: s.direccion || "", wsp: s.whatsappVisible || s.whatsapp || "", orden: i, recibiendo: true, horario: {} };
  });
  if (!Object.keys(sucursales).length) sucursales.local = { nombre: N.nombre || "Local", direccion: N.direccion || "", wsp: N.whatsappVisible || N.whatsapp || "", orden: 0, recibiendo: true, horario: {} };
  const zona = N.zonaDelivery && N.zonaDelivery.nombre;
  return {
    sucursales,
    delivery: { tarifa: typeof N.valorDelivery === "number" ? N.valorDelivery : 0, minutos: 35, zonaTexto: zona ? "Despacho al " + zona : "" },
    cocina: { amarillo: 10, rojo: 20 }
  };
}

/* Pasa la carta de la página al Manager cuando cambia: productos, secciones y sucursales.
   Lo que se decide en el Manager (agotado, oculto) se mantiene. */
let firmaLocal = "";
async function sincronizar(forzar) {
  const C = await P.cargarCarta();
  const N = C.negocio || {};
  const firma = crypto.createHash("sha1").update(JSON.stringify([C.secciones, C.personalizacion, C.ingredientes, N.sucursales, N.valorDelivery])).digest("hex");
  if (!forzar && firma === firmaLocal) return C;
  const [guardada] = await T.redis([["GET", K + "carta"]]);
  if (!forzar && guardada === firma) { firmaLocal = firma; return C; }
  await conCandado("sincronizar", async () => {
    const X = P.indice(C);
    const antes = await todos("productos");
    const cambios = [], vistos = new Set();
    let orden = 0;
    for (const sec of C.secciones || []) for (const cat of sec.categorias || []) for (const p of cat.productos || []) {
      if (!ID.test(p.id)) continue;
      vistos.add(p.id);
      const base = productoBase(X, p.id, orden++);
      const prev = antes[p.id];
      const doc = prev && prev.origen === "pagina"
        ? { ...prev, ...base, visible: prev.visible !== false, agotado: prev.agotadoCarta !== base.agotadoCarta ? base.agotadoCarta : !!prev.agotado }
        : { ...base, visible: true, agotado: base.agotadoCarta };
      if (JSON.stringify(doc) !== JSON.stringify(prev)) cambios.push([p.id, doc]);
    }
    for (const [id, prev] of Object.entries(antes)) if (prev && prev.origen === "pagina" && !vistos.has(id)) cambios.push([id, null]);
    for (let i = 0; i < cambios.length; i += 30) await guardarDocs("productos", cambios.slice(i, i + 30));

    const carta = (await leerDoc("config", "carta")) || {};
    const usados = new Set();
    const deLaPagina = (C.secciones || []).map(s => {
      let id = seccionId(s.nombre);
      while (usados.has(id)) id += "-2";
      usados.add(id);
      return { id, nombre: s.nombre, origen: "pagina" };
    });
    const propias = (carta.secciones || []).filter(s => s && s.origen !== "pagina" && !usados.has(s.id));
    await guardarDoc("config", "carta", { ...carta, secciones: deLaPagina.concat(propias) });

    const general = await leerDoc("config", "general");
    const inicial = configInicial(C);
    if (!general) await guardarDoc("config", "general", inicial);
    else {
      const faltan = Object.keys(inicial.sucursales).filter(id => !(general.sucursales || {})[id]);
      if (faltan.length) await guardarDoc("config", "general", mezclar(general, { sucursales: Object.fromEntries(faltan.map(id => [id, inicial.sucursales[id]])) }));
    }
    await T.redis([["SET", K + "carta", firma]]);
    await recalcularDisp();
  });
  firmaLocal = firma;
  return C;
}

/* ---------- lo que la página tiene que saber: agotados, ocultos y sucursales en pausa ---------- */
const DISP_VACIA = { agotados: [], ocultos: [], pausadas: [] };
async function disponibilidad() {
  if (!T.redisConf()) return DISP_VACIA;
  return (await T.leer("m:disp")) || DISP_VACIA;
}
async function recalcularDisp() {
  const prods = await todos("productos");
  const general = await leerDoc("config", "general");
  const d = { agotados: [], ocultos: [], pausadas: [] };
  for (const [id, p] of Object.entries(prods)) {
    if (!p || p.origen !== "pagina") continue;
    if (p.agotado) d.agotados.push(id);
    if (p.visible === false) d.ocultos.push(id);
  }
  d.pausadas = Object.values((general && general.sucursales) || {}).filter(s => s && s.recibiendo === false && s.nombre).map(s => s.nombre);
  await T.guardar("m:disp", d);
  return d;
}
/* La carta con lo agotado u oculto en el Manager marcado como no disponible (para calcular el pedido) */
function aplicarDisp(C, d) {
  const fuera = new Set([...(d.agotados || []), ...(d.ocultos || [])]);
  if (!fuera.size) return C;
  const copia = JSON.parse(JSON.stringify(C));
  (copia.secciones || []).forEach(s => (s.categorias || []).forEach(c => (c.productos || []).forEach(p => { if (fuera.has(p.id)) p.disponible = false; })));
  return copia;
}

/* ---------- pedidos: de la página al Manager ---------- */
// estados de la página → del Manager, y al revés
const A_MANAGER = { recibido: "recibido", preparando: "preparacion", listo: "listo", "en-camino": "camino", entregado: "entregado", cancelado: "cancelado" };
const A_PAGINA = { recibido: "recibido", confirmado: "recibido", preparacion: "preparando", listo: "listo", camino: "en-camino", entregado: "entregado", cancelado: "cancelado" };
function metodoManager(m) {
  const n = P.sinTildes(m);
  if (n === "online") return "online";
  for (const k of ["efectivo", "transferencia", "edenred", "tarjeta"]) if (n.includes(k)) return k;
  return /debito|credito/.test(n) ? "tarjeta" : "efectivo";
}
function pagoManager(pg, prev) {
  const metodo = metodoManager(pg.metodo);
  const e = pg.estado || "";
  const estado = e === "pagado" ? "pagado" : e === "rechazado" || e === "anulado" ? "rechazado" : e === "revisar" ? "verificacion"
    : (prev && prev.metodo === metodo && prev.estado) || "pendiente";
  const out = { ...(prev || {}), metodo, estado };
  if (metodo === "online" && pg.flowOrder) out.ref = String(pg.flowOrder);
  if (estado === "pagado" && !out.en) out.en = pg.t || Date.now();
  if (pg.nota) out.nota = pg.nota;
  return out;
}
function pedidoManager(p, prev) {
  prev = prev || {};
  const delivery = p.modo === "delivery";
  const estadoPagina = A_MANAGER[p.estado] || "recibido";
  const estado = prev.estado && A_PAGINA[prev.estado] === p.estado ? prev.estado : estadoPagina;
  const t = { recibido: p.creado, ...(prev.t || {}) };
  if (estado !== prev.estado && !t[estado]) t[estado] = Date.now();
  const o = {
    ...prev,
    num: p.id, creado: p.creado, fecha: T.fecha(p.creado), hora: hhmm(p.creado), sucursal: slug(p.sucursal || "local"), canal: "web",
    tipo: delivery ? "delivery" : "retiro",
    cliente: { ...(prev.cliente || {}), nombre: p.nombre, email: p.email || "", tel: (prev.cliente && prev.cliente.tel) || "" },
    entrega: delivery ? { ...(prev.entrega || {}), direccion: p.direccion || "", ...(p.ubicacion ? { lat: p.ubicacion.lat, lng: p.ubicacion.lng } : {}), zona: p.fueraDeZona ? "fuera" : "dentro" } : null,
    retiroHora: prev.retiroHora || "",
    items: (p.items || []).map(it => {
      const det = it.detalle || [], nota = det.find(l => /^Nota: /.test(l));
      return { pid: it.id, nombre: it.nombre, cant: it.cant, precio: it.unit, opciones: det.filter(l => l !== nota), nota: nota ? nota.slice(6) : "" };
    }),
    subtotal: p.subtotal || 0, delivery: p.delivery || 0, descuento: p.descuento || 0, total: p.total || 0,
    pago: pagoManager(p.pago || {}, prev.pago),
    estado, t, alergia: prev.alergia || "", nota: prev.nota || ""
  };
  if (p.cupon) o.cupon = p.cupon;
  return o;
}
/* El cliente del pedido en la lista de clientes del Manager (por su correo) */
async function asegurarCliente(p) {
  const email = T.email(p.email);
  if (!email) return "";
  const k = K + "cliente-email";
  let [id] = await T.redis([["HGET", k, email]]);
  if (id && (await leerDoc("clientes", id))) return id;
  const encontrado = Object.entries(await todos("clientes")).find(([, c]) => c && String(c.email || "").toLowerCase() === email);
  id = encontrado ? encontrado[0] : "c" + Date.now().toString(36) + crypto.randomBytes(3).toString("hex");
  if (!encontrado) {
    await guardarDoc("clientes", id, { nombre: p.nombre || "Cliente", tel: "", email, direcciones: p.modo === "delivery" && p.direccion ? [p.direccion] : [],
      notas: "", etiquetas: [], alergias: "", creado: Date.now(), stats: { pedidos: 0, gastado: 0, ultimo: null, primero: null } });
  }
  await T.redis([["HSET", k, email, id]]);
  return id;
}
/* Copia (o actualiza) un pedido de la página en el Manager. Nunca hace fallar a quien lo llama. */
async function reflejar(p) {
  if (!p || !T.redisConf() || p.estado === "esperando-pago") return;
  try {
    const fecha = T.fecha(p.creado), suc = slug(p.sucursal || "local"), docId = fecha + "~" + suc, oid = "n" + p.id;
    const cid = await asegurarCliente(p);
    await conCandado("dias/" + docId, async () => {
      const d = (await leerDoc("dias", docId)) || { fecha, sucursal: suc, pedidos: {} };
      const prev = d.pedidos && d.pedidos[oid];
      const o = pedidoManager(p, prev);
      if (cid && !o.cliente.id) o.cliente.id = cid;
      if (prev && JSON.stringify(prev) === JSON.stringify(o)) return;
      d.pedidos = { ...(d.pedidos || {}), [oid]: o };
      await guardarDoc("dias", docId, d);
    });
  } catch (e) { console.error("manager:", e.message); }
}

/* ---------- pedidos: del Manager a la página ---------- */
/* Cuando en el Manager cambia el estado o el pago de un pedido web, el cliente lo ve en la página
   (y le llega el correo de «listo» o «en camino», como desde el panel). */
async function aPagina(o, prev) {
  if (!o || o.canal !== "web" || !(o.num > 0)) return;
  const cambioEstado = !prev || prev.estado !== o.estado;
  const cambioPago = !prev || JSON.stringify(prev.pago || {}) !== JSON.stringify(o.pago || {});
  if (!cambioEstado && !cambioPago) return;
  const p = await T.leer("pedido:" + o.num);
  if (!p || p.estado === "esperando-pago") return;
  let guardar = false;
  if (cambioPago && o.pago && p.pago && p.pago.metodo !== "Online") {
    const e = o.pago.estado === "pagado" ? "pagado" : o.pago.estado === "rechazado" ? "rechazado" : "";
    if ((p.pago.estado || "") !== e) { p.pago.estado = e; guardar = true; }
  }
  const pe = A_PAGINA[o.estado];
  if (cambioEstado && pe && pe !== p.estado) await T.cambiarEstado(p, pe);
  else if (guardar) await T.redis([["SET", T.PREFIJO + "pedido:" + p.id, JSON.stringify(p), "KEEPTTL"]]);
}

module.exports = {
  COLECCIONES, ruta, leerDoc, leerDocs, todos, versiones, version, cuantos, guardarDoc, guardarDocs, conCandado, mezclar, err,
  slug, sincronizar, disponibilidad, recalcularDisp, aplicarDisp, reflejar, aPagina, pedidoManager, asegurarCliente
};
