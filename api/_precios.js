/*
  Precios del pedido calculados en el servidor con carta.js, igual que en js/app.js. Así el monto que se cobra
  online y el que ve el local en el panel no dependen de lo que mande el navegador.
  Si cambias cómo se calcula un precio en js/app.js, cámbialo también aquí (las pruebas comparan los dos).
*/
const fs = require("fs");
const path = require("path");

const ZONA = "America/Santiago";
const DIAS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
const DIAS_TXT = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

/* carta.js va junto a las funciones (vercel.json → includeFiles); si no está, se pide a la página publicada */
let cache = { t: 0, carta: null };
async function cargarCarta() {
  if (cache.carta && Date.now() - cache.t < 60000) return cache.carta;
  let texto = null;
  for (const f of [path.join(process.cwd(), "carta.js"), path.join(__dirname, "..", "carta.js")]) {
    try { texto = fs.readFileSync(f, "utf8"); break; } catch (e) { /* se prueba la otra */ }
  }
  if (!texto && process.env.VERCEL_URL) {
    const res = await fetch(`https://${process.env.VERCEL_URL}/carta.js`, { cache: "no-store" });
    if (res.ok) texto = await res.text();
  }
  if (!texto) throw Object.assign(new Error("sin carta"), { client: "sin-carta" });
  const ini = texto.indexOf("{", texto.indexOf("window.CARTA"));
  cache = { t: Date.now(), carta: JSON.parse(texto.slice(ini, texto.lastIndexOf("}") + 1)) };
  return cache.carta;
}

function plata(n) { return "$" + String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
function minus(s) { s = String(s || ""); return s.charAt(0).toLowerCase() + s.slice(1); }
function mayus(s) { s = String(s || ""); return s.charAt(0).toUpperCase() + s.slice(1); }
function sinTildes(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
function ahora(t) {
  const x = {};
  new Intl.DateTimeFormat("en-CA", { timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(new Date(t || Date.now())).forEach(p => { x[p.type] = p.value; });
  return { fecha: `${x.year}-${x.month}-${x.day}`, dia: new Date(Date.UTC(+x.year, +x.month - 1, +x.day)).getUTCDay() };
}
function diasTexto(dias) {
  const t = dias.map(d => { const s = DIAS_TXT[DIAS.indexOf(d)]; return s && (/o$/.test(s) ? s + "s" : s); }).filter(Boolean);
  return t.length > 1 ? t.slice(0, -1).join(", ") + " y " + t[t.length - 1] : t.join("");
}
/* punto dentro del polígono [[lat, lng], …] */
function dentro(u, poligono) {
  let si = false;
  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const [ai, bi] = poligono[i], [aj, bj] = poligono[j];
    if ((bi > u.lng) !== (bj > u.lng) && u.lat < (aj - ai) * (u.lng - bi) / (bj - bi) + ai) si = !si;
  }
  return si;
}

function indice(C) {
  const PRODUCTOS = {}, GRUPOS = {};
  (C.secciones || []).forEach(sec => (sec.categorias || []).forEach(cat => (cat.productos || []).forEach(p => { PRODUCTOS[p.id] = { p, cat, sec }; })));
  (C.personalizacion || []).forEach(g => { GRUPOS[g.id] = g; });
  const opcionDe = (gid, oid) => { const g = GRUPOS[gid]; return g && (g.opciones || []).find(o => o.id === oid); };
  const gruposDe = id => { const x = PRODUCTOS[id]; return (x.p.personalizar || x.cat.personalizar || []).map(g => GRUPOS[g]).filter(Boolean); };
  const gruposProducto = id => gruposDe(id).filter(g => !g.porRoll);
  const gruposArmado = id => gruposDe(id).filter(g => g.porRoll && g.tipo === "elegir");
  const gruposCambio = id => gruposDe(id).filter(g => g.porRoll && g.tipo !== "elegir");
  const rollsDe = id => {
    const p = PRODUCTOS[id].p;
    if (typeof p.rolls === "number" && p.rolls > 0) return Array.from({ length: Math.min(Math.floor(p.rolls), 30) }, () => ({}));
    if (p.rolls && p.rolls.length) return p.rolls;
    return gruposDe(id).some(g => g.porRoll) ? [{}] : [];
  };
  const limites = (g, conf) => {
    let mas = 0;
    const el = (conf && conf.elecciones) || {};
    Object.keys(el).forEach(gid => (el[gid] || []).forEach(oid => { const o = opcionDe(gid, oid); if (o && o.suma && o.suma[g.id] > 0) mas += o.suma[g.id]; }));
    return { min: (g.min || 0) + mas, max: (g.max || 1) + mas };
  };
  return { C, PRODUCTOS, GRUPOS, opcionDe, gruposDe, gruposProducto, gruposArmado, gruposCambio, rollsDe, limites };
}

/* Lo elegido, revisado: solo grupos y opciones que existen y están disponibles. Devuelve null si falta algo obligatorio. */
function revisarConf(X, id, conf) {
  const p = X.PRODUCTOS[id].p;
  conf = conf && typeof conf === "object" ? conf : {};
  const limpia = { cambios: [], elecciones: {}, textos: {} };
  if (p.opciones && p.opciones.length) {
    if (!p.opciones.includes(conf.opcion)) return { error: `Elige una opción de «${p.nombre}».` };
    limpia.opcion = conf.opcion;
  }
  const nRolls = X.rollsDe(id).length;
  const grupos = X.gruposDe(id).map(g => g.id);
  (Array.isArray(conf.cambios) ? conf.cambios : []).slice(0, 60).forEach(c => {
    const o = c && grupos.includes(c.grupo) && X.opcionDe(c.grupo, c.opcion);
    if (o && o.disponible !== false && Number.isInteger(c.roll) && c.roll >= 0 && c.roll < nRolls) {
      limpia.cambios.push(c.en ? { roll: c.roll, grupo: c.grupo, opcion: c.opcion, en: String(c.en).slice(0, 40) } : { roll: c.roll, grupo: c.grupo, opcion: c.opcion });
    }
  });
  const el = conf.elecciones && typeof conf.elecciones === "object" ? conf.elecciones : {};
  Object.keys(el).forEach(g => {
    if (!grupos.includes(g) || !Array.isArray(el[g])) return;
    const ok = [...new Set(el[g])].filter(o => { const x = X.opcionDe(g, o); return x && x.disponible !== false; });
    if (ok.length) limpia.elecciones[g] = ok;
  });
  const tx = conf.textos && typeof conf.textos === "object" ? conf.textos : {};
  Object.keys(tx).forEach(g => { if (grupos.includes(g) && tx[g]) limpia.textos[g] = String(tx[g]).slice(0, 60); });
  for (const g of X.gruposProducto(id)) {
    const lim = X.limites(g, limpia);
    if (g.tipo === "texto") { if (lim.min && !String(limpia.textos[g.id] || "").trim()) return { error: `Falta «${g.nombre}» en «${p.nombre}».` }; continue; }
    const n = (limpia.elecciones[g.id] || []).length;
    if (n < lim.min) return { error: `Falta elegir «${g.nombre}» en «${p.nombre}».` };
    if (g.tipo === "elegir" && n > lim.max) return { error: `Elegiste más de lo permitido en «${g.nombre}» de «${p.nombre}».` };
    if (g.tipo === "extra" && n > (g.max || 10)) return { error: `Elegiste más de lo permitido en «${g.nombre}» de «${p.nombre}».` };
  }
  for (const g of X.gruposCambio(id)) {
    if (!g.max) continue;
    for (let r = 0; r < nRolls; r++) {
      if (limpia.cambios.filter(c => c.roll === r && c.grupo === g.id && !c.en).length > g.max) return { error: `Hay demasiados cambios en «${p.nombre}».` };
    }
  }
  const ga = X.gruposArmado(id);
  if (ga.length) {
    const armado = Array.isArray(conf.armado) ? conf.armado : [];
    limpia.armado = X.rollsDe(id).map((r, i) => {
      const orig = armado[i] && typeof armado[i] === "object" ? armado[i] : {};
      const x = {};
      ga.forEach(g => { const o = X.opcionDe(g.id, orig[g.id]); if (o && o.disponible !== false) x[g.id] = o.id; });
      return x;
    });
    for (let r = 0; r < limpia.armado.length; r++) {
      for (const g of ga) if ((g.min || 0) > 0 && !limpia.armado[r][g.id]) return { error: `Falta elegir «${g.nombre}» en «${p.nombre}».` };
    }
  }
  return { conf: limpia };
}

function detalleArmado(X, id, conf) {
  const armado = conf.armado || [];
  const filas = armado.map(() => ({}));
  X.gruposArmado(id).forEach(g => {
    let gratis = g.gratis || 0;
    const usadas = {};
    armado.forEach((r, i) => {
      const o = r && X.opcionDe(g.id, r[g.id]);
      if (!o) return;
      let cobro = o.precio || 0, libre = false;
      usadas[o.id] = (usadas[o.id] || 0) + 1;
      if (cobro > 0 && o.gratis && usadas[o.id] <= o.gratis) { cobro = 0; libre = true; }
      else if (cobro > 0 && gratis > 0) { gratis--; cobro = 0; libre = true; }
      filas[i][g.id] = { o, cobro, gratis: libre };
    });
  });
  return filas;
}
function precioUnitario(X, id, conf) {
  const p = X.PRODUCTOS[id].p;
  let total = conf.opcion && p.preciosOpciones && p.preciosOpciones[conf.opcion] != null ? p.preciosOpciones[conf.opcion] : p.precio;
  detalleArmado(X, id, conf).forEach(f => Object.keys(f).forEach(k => { total += f[k].cobro; }));
  conf.cambios.forEach(c => { const o = X.opcionDe(c.grupo, c.opcion); if (o) total += o.precio || 0; });
  Object.keys(conf.elecciones).forEach(g => conf.elecciones[g].forEach(oid => { const o = X.opcionDe(g, oid); if (o) total += o.precio || 0; }));
  return total;
}
function nombreLinea(X, id) {
  const x = X.PRODUCTOS[id];
  if (sinTildes(x.sec.nombre) === "promos" || sinTildes(x.cat.nombre) === sinTildes(x.p.nombre)) return x.p.nombre;
  return x.cat.nombre + " · " + x.p.nombre;
}
function ingrediente(X, id) { return (X.C.ingredientes && X.C.ingredientes[id]) || String(id || "").replace(/-/g, " "); }
function textoCambio(X, c) {
  const o = X.opcionDe(c.grupo, c.opcion), g = X.GRUPOS[c.grupo];
  const nombre = o ? o.nombre : c.opcion;
  let t;
  if (c.en) t = mayus(minus(nombre)) + " en vez de " + minus(ingrediente(X, c.en));
  else if (g && g.tipo === "envoltura") t = "Envoltura: " + minus(nombre);
  else if (g && g.tipo === "extra") t = nombre;
  else t = "Agregar " + minus(nombre);
  return t + (o && o.precio ? " +" + plata(o.precio) : "");
}
/* Las líneas de detalle de un producto, como en el mensaje de WhatsApp */
function detalle(X, id, conf) {
  const p = X.PRODUCTOS[id].p;
  const unidad = p.unidad || "Roll";
  const lineas = [];
  if (conf.opcion) lineas.push("Opción: " + conf.opcion);
  const varios = X.rollsDe(id).length > 1;
  const ga = X.gruposArmado(id);
  const armado = detalleArmado(X, id, conf);
  armado.forEach((f, i) => {
    const partes = ga.filter(g => f[g.id]).map(g => {
      const x = f[g.id];
      return g.nombre + ": " + x.o.nombre + (x.cobro ? " +" + plata(x.cobro) : x.gratis ? " (gratis)" : "");
    });
    if (partes.length) lineas.push((armado.length > 1 ? unidad + " " + (i + 1) : "Tu " + minus(unidad)) + ": " + partes.join(" · "));
  });
  conf.cambios.forEach(c => lineas.push("Cambio" + (varios ? " en " + minus(unidad) + " " + (c.roll + 1) : "") + ": " + textoCambio(X, c)));
  X.gruposProducto(id).forEach(g => {
    if (g.tipo === "texto") { if (conf.textos[g.id]) lineas.push(g.nombre + ": " + conf.textos[g.id]); return; }
    const sel = conf.elecciones[g.id] || [];
    if (sel.length) lineas.push(g.nombre + ": " + sel.map(oid => { const o = X.opcionDe(g.id, oid); return o ? o.nombre + (o.precio ? " +" + plata(o.precio) : "") : oid; }).join(", "));
  });
  return lineas;
}

function cuponDe(C, cod) {
  const k = String(cod || "").toUpperCase().replace(/\s+/g, "");
  return k ? (C.cupones || []).find(c => c && String(c.codigo || "").toUpperCase().replace(/\s+/g, "") === k) : null;
}
function descuentoCupon(X, c, modo, items, sub, t) {
  if (!c || c.activo === false) return 0;
  if ((c.desde && t.fecha < c.desde) || (c.hasta && t.fecha > c.hasta)) return 0;
  if (c.dias && c.dias.length && !c.dias.includes(DIAS[t.dia])) return 0;
  if (c.modo && c.modo !== modo) return 0;
  if (c.minimo && sub < c.minimo) return 0;
  let base = sub;
  if (c.aplica && c.aplica.length) base = items.reduce((s, it) => s + (c.aplica.includes(X.PRODUCTOS[it.id].cat.id) ? it.unit * it.cant : 0), 0);
  let d = c.tipo === "monto" ? Math.min(c.valor || 0, base) : Math.round(base * (c.valor || 0) / 100);
  if (c.tipo !== "monto" && c.tope) d = Math.min(d, c.tope);
  return Math.max(0, d);
}

/* Delivery: el valor fijo si la ubicación está en la zona (o si no se sabe la ubicación); null si queda fuera */
function costoDelivery(N, ubicacion) {
  if (typeof N.valorDelivery !== "number") return null;
  const z = N.zonaDelivery;
  if (ubicacion && z && Array.isArray(z.poligono) && z.poligono.length > 2 && !dentro(ubicacion, z.poligono)) return null;
  return N.valorDelivery;
}

/* El pedido completo: productos con nombre, detalle y precio, subtotal, cupón, delivery y total */
function calcular(C, d, t) {
  const X = indice(C);
  t = t || ahora();
  const modo = d.modo === "delivery" ? "delivery" : "retiro";
  const items = [];
  for (const it of (Array.isArray(d.items) ? d.items : []).slice(0, 60)) {
    const x = it && X.PRODUCTOS[it.id];
    if (!x) return { error: "Hay un producto que ya no está en la carta. Revisa tu pedido." };
    if (x.p.disponible === false) return { error: `«${x.p.nombre}» está agotado.` };
    if (Array.isArray(x.p.dias) && x.p.dias.length && !x.p.dias.includes(DIAS[t.dia])) return { error: `«${x.p.nombre}» es solo los ${diasTexto(x.p.dias)}.` };
    const r = revisarConf(X, it.id, it.conf);
    if (r.error) return { error: r.error };
    const cant = Math.min(99, Math.max(1, Math.round(+it.cant) || 1));
    const unit = precioUnitario(X, it.id, r.conf);
    const nota = String(it.nota || "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, 140);
    items.push({ id: it.id, cant, unit, precio: unit * cant, nombre: nombreLinea(X, it.id), detalle: detalle(X, it.id, r.conf).concat(nota ? ["Nota: " + nota] : []) });
  }
  if (!items.length) return { error: "El pedido está vacío." };
  const subtotal = items.reduce((s, it) => s + it.precio, 0);
  const c = d.cupon ? cuponDe(C, d.cupon) : null;
  const descuento = c ? descuentoCupon(X, c, modo, items, subtotal, t) : 0;
  const N = C.negocio || {};
  const delivery = modo === "delivery" ? costoDelivery(N, d.ubicacion) : null;
  return { items, subtotal, cupon: descuento ? String(c.codigo).toUpperCase() : "", descuento, delivery,
    total: subtotal - descuento + (delivery || 0), fueraDeZona: modo === "delivery" && delivery === null && typeof N.valorDelivery === "number" };
}

module.exports = { cargarCarta, calcular, dentro, costoDelivery, ahora, plata, indice, nombreLinea, sinTildes, DIAS };
