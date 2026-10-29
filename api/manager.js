/*
  Rincón Sushi Manager (manager.html): entrada del personal y su base de datos, en el mismo servidor que la página.
  POST /api/manager { accion: … }
    estado                      → si hay base de datos y si ya hay usuarios (sin datos privados)
    crear-admin                 → la primera cuenta de administración (pide la clave del panel, ADMIN_PASSWORD)
    entrar { email, pass }      → sesión del personal
    con { token } además:
    yo · poll · docs · consulta · escribir · acquire · numero
  Cada persona ve y cambia solo lo de su cargo: administración todo; caja pedidos, caja, pagos y clientes;
  cocina solo la pantalla de cocina, sin datos de los clientes; repartidor solo sus entregas.

  Configuración (Vercel → Settings → Environment Variables): la misma base de datos de los pedidos
  (ver api/_tienda.js) y ADMIN_PASSWORD para crear la primera cuenta. MANAGER_SECRET (opcional) firma las
  sesiones; si no está, se usa una clave que sale de las otras (nunca llega al navegador).
*/
const crypto = require("crypto");
const T = require("./_tienda");
const M = require("./_manager");

const ROLES = ["admin", "caja", "cocina", "repartidor"];
const DIAS_SESION = { recordar: 30, normal: 1 };

/* ---------- sesiones ---------- */
function llave() {
  const base = (process.env.MANAGER_SECRET || "").trim() || T.secreto() || (process.env.ADMIN_PASSWORD || "");
  return base ? crypto.createHmac("sha256", base).update("rincon-sushi-manager").digest() : null;
}
function firmar(id, dias) {
  const datos = Buffer.from(JSON.stringify({ u: id, x: Date.now() + dias * 864e5 })).toString("base64url");
  return datos + "." + crypto.createHmac("sha256", llave()).update(datos).digest("base64url");
}
function sesion(token) {
  if (typeof token !== "string" || !llave()) return null;
  const [datos, firma] = token.split(".");
  if (!datos || !firma) return null;
  const ok = crypto.createHmac("sha256", llave()).update(datos).digest("base64url");
  if (ok.length !== firma.length || !crypto.timingSafeEqual(Buffer.from(ok), Buffer.from(firma))) return null;
  try { const d = JSON.parse(Buffer.from(datos, "base64url").toString("utf8")); return d && d.x > Date.now() && typeof d.u === "string" ? d.u : null; } catch (e) { return null; }
}

/* ---------- contraseñas ----------
   El Manager manda la contraseña como sha256(sal:contraseña) (así funcionaba en claude.ai); aquí se guarda
   además pasada por scrypt, y nunca vuelve al navegador. */
const sha = (sal, pass) => crypto.createHash("sha256").update(sal + ":" + pass).digest("hex");
function envolver(hashCliente) {
  const s = crypto.randomBytes(12).toString("hex");
  return "k1$" + s + "$" + crypto.scryptSync(String(hashCliente), s, 32).toString("hex");
}
function confirmar(guardado, hashCliente) {
  const m = /^k1\$([0-9a-f]+)\$([0-9a-f]+)$/.exec(String(guardado || ""));
  if (!m) return false;
  const a = crypto.scryptSync(String(hashCliente), m[1], 32), b = Buffer.from(m[2], "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function mismaClave(a, b) {
  const x = crypto.createHash("sha256").update(String(a)).digest(), y = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
}

/* ---------- lo que cada cargo puede leer ---------- */
const LEE = {
  admin: M.COLECCIONES, caja: M.COLECCIONES,
  cocina: ["config", "productos", "staff", "dias"],
  repartidor: ["config", "productos", "staff", "dias"]
};
function limpiarStaff(s, yo) {
  if (!s) return s;
  const { pass, salt, ...resto } = s;
  if (yo.rol === "admin" || yo.rol === "caja" || yo.id === s.id) return resto;
  return { nombre: resto.nombre, rol: resto.rol, sucursal: resto.sucursal, activo: resto.activo };
}
function limpiarDia(d, yo) {
  if (!d || yo.rol === "admin" || yo.rol === "caja") return d;
  const pedidos = {};
  for (const [id, o] of Object.entries(d.pedidos || {})) {
    if (!o) continue;
    if (yo.rol === "repartidor") { if (o.repartidor === yo.id) pedidos[id] = o; continue; }
    // cocina: lo que hay que preparar, sin datos del cliente
    const { cliente, entrega, pago, ...resto } = o;
    pedidos[id] = { ...resto, cliente: { nombre: String((cliente && cliente.nombre) || "").split(" ")[0] } };
  }
  return { ...d, pedidos };
}
function limpiar(c, id, doc, yo) {
  if (doc == null) return null;
  if (c === "staff") return limpiarStaff({ ...doc, id }, yo);
  if (c === "dias") return limpiarDia(doc, yo);
  return doc;
}

/* ---------- consultas (where del Manager) ---------- */
function cumple(doc, where) {
  return (where || []).every(([campo, op, v]) => {
    const x = doc ? doc[campo] : undefined;
    switch (op) {
      case "==": return x === v;
      case "!=": return x !== v;
      case "<": return x < v;
      case "<=": return x <= v;
      case ">": return x > v;
      case ">=": return x >= v;
      case "in": return Array.isArray(v) && v.includes(x);
      case "not-in": return Array.isArray(v) && !v.includes(x);
      case "array-contains": return Array.isArray(x) && x.includes(v);
      default: return false;
    }
  });
}

/* ---------- escrituras: quién puede y qué hace el servidor además ---------- */
function soloCampos(obj, permitidos) {
  return obj && typeof obj === "object" && Object.keys(obj).every(k => permitidos.includes(k));
}
// JSON con las claves ordenadas, para comparar documentos sin importar el orden de sus campos
function canonico(v) {
  if (Array.isArray(v)) return "[" + v.map(canonico).join(",") + "]";
  if (v && typeof v === "object") return "{" + Object.keys(v).filter(k => v[k] !== undefined).sort().map(k => JSON.stringify(k) + ":" + canonico(v[k])).join(",") + "}";
  return JSON.stringify(v === undefined ? null : v);
}
async function escribir(yo, body) {
  const r = M.ruta(body.path);
  const op = body.op;
  if (!r || !["set", "update", "delete"].includes(op)) throw M.err("invalid_argument", "Ruta o cambio no válido.");
  const data = op === "delete" ? null : body.data;
  if (op !== "delete" && (!data || typeof data !== "object" || Array.isArray(data))) throw M.err("invalid_argument", "Datos no válidos.");
  if (data && JSON.stringify(data).length > 250000) throw M.err("invalid_argument", "El cambio es demasiado grande.");
  const rol = yo.rol, admin = rol === "admin", caja = rol === "caja";
  const sinPermiso = () => M.err("permiso", "Tu cargo no permite este cambio.");

  // qué colecciones toca cada cargo
  if (r.c === "staff" && !admin) throw sinPermiso();
  if (["clientes", "turnos"].includes(r.c) && !admin && !caja) throw sinPermiso();
  if (r.c === "config" && r.id === "contador") throw M.err("permiso", "El número de pedido lo da el servidor.");
  if (r.c === "config" && !admin && !(caja && r.id === "general" && op === "update")) throw sinPermiso();
  if (r.c === "productos" && !admin && !caja) throw sinPermiso();
  if (r.c === "dias" && !admin && !caja && op !== "update") throw sinPermiso();

  return M.conCandado(r.c + "/" + r.id, async () => {
    const prev = await M.leerDoc(r.c, r.id);
    let doc;
    if (op === "delete") doc = null;
    else if (op === "set") doc = data;
    else {
      if (!prev) throw M.err("invalid_argument", "El documento no existe.");
      doc = M.mezclar(prev, data);
    }

    if (r.c === "config" && r.id === "general" && caja) {
      // caja solo pausa o reanuda la recepción de pedidos
      const ok = soloCampos(data, ["sucursales"]) && Object.values(data.sucursales || {}).every(s => soloCampos(s, ["recibiendo"]));
      if (!ok) throw sinPermiso();
    }
    if (r.c === "config" && r.id === "carta" && doc) {
      // las secciones de la página se cambian en el panel de la página; aquí solo se agregan secciones propias
      const pagina = ((prev && prev.secciones) || []).filter(s => s && s.origen === "pagina");
      const ids = new Set(pagina.map(s => s.id));
      const propias = (Array.isArray(doc.secciones) ? doc.secciones : []).filter(s => s && s.id && !ids.has(s.id) && s.origen !== "pagina")
        .map(s => ({ id: String(s.id).slice(0, 40), nombre: T.texto(s.nombre, 60) || "Sin nombre" }));
      doc = { ...doc, secciones: pagina.concat(propias) };
    }
    if (r.c === "productos") {
      const dePagina = prev && prev.origen === "pagina";
      if (dePagina) {
        if (op === "delete") throw M.err("pagina", "Este producto viene de la carta de la página: se quita desde el panel de la página. Aquí lo puedes ocultar o marcar agotado.");
        // de un producto de la página, aquí solo se cambia si está agotado u oculto
        const campos = caja ? ["agotado"] : ["agotado", "visible"];
        doc = { ...prev };
        for (const k of campos) if (k in data) doc[k] = !!data[k];
        if (op === "set" && caja && data.visible !== undefined && data.visible !== prev.visible) throw sinPermiso();
      } else if (caja) {
        // caja solo marca agotado (con update, o guardando la ficha sin cambiar nada más)
        const soloAgotado = prev && (op === "update" ? soloCampos(data, ["agotado"]) : op === "set" && canonico({ ...data, agotado: !!prev.agotado }) === canonico({ ...prev, agotado: !!prev.agotado }));
        if (!soloAgotado) throw sinPermiso();
        doc = { ...prev, agotado: !!data.agotado };
      } else if (doc) {
        delete doc.origen;
      }
    }
    if (r.c === "staff" && op === "delete" && r.id === yo.id) throw M.err("permiso", "No puedes borrar tu propio usuario.");
    if (r.c === "staff" && doc) {
      if (!ROLES.includes(doc.rol)) throw M.err("invalid_argument", "Cargo no válido.");
      doc.email = String(doc.email || "").trim().toLowerCase();
      if (!T.email(doc.email)) throw M.err("invalid_argument", "Correo no válido.");
      const otros = Object.entries(await M.todos("staff")).filter(([id, s]) => id !== r.id && s && String(s.email || "").toLowerCase() === doc.email);
      if (otros.length) throw M.err("invalid_argument", "Ya hay un usuario con ese correo.");
      if (data.pass) {
        if (typeof data.pass !== "string" || typeof data.salt !== "string") throw M.err("invalid_argument", "Contraseña no válida.");
        doc.pass = envolver(data.pass); doc.salt = data.salt;
      } else if (prev) { doc.pass = prev.pass; doc.salt = prev.salt; }
      if (!doc.pass) throw M.err("invalid_argument", "Falta la contraseña.");
      if (r.id === yo.id && (doc.rol !== "admin" || doc.activo === false)) throw M.err("permiso", "No puedes quitarte el cargo de administración ni desactivarte.");
    }
    if (r.c === "dias" && op === "update" && !admin && !caja) {
      // cocina y repartidor solo cambian pedidos existentes (estado, horas, cobro); el repartidor, solo los suyos
      if (!soloCampos(data, ["pedidos"])) throw sinPermiso();
      for (const [oid, cambio] of Object.entries(data.pedidos || {})) {
        const o = prev && prev.pedidos && prev.pedidos[oid];
        if (!o || !cambio || typeof cambio !== "object") throw sinPermiso();
        if (rol === "repartidor" && o.repartidor !== yo.id) throw sinPermiso();
        const campos = rol === "cocina" ? ["estado", "t", "cocina"] : ["estado", "t", "pago", "entregado", "nota"];
        if (!soloCampos(cambio, campos)) throw sinPermiso();
      }
    }

    const marca = await M.guardarDoc(r.c, r.id, doc);

    // efectos en la página
    if (r.c === "dias" && doc) {
      for (const [oid, o] of Object.entries(doc.pedidos || {})) {
        const antes = prev && prev.pedidos && prev.pedidos[oid];
        if (o && o.canal === "web" && JSON.stringify(antes) !== JSON.stringify(o)) await M.aPagina(o, antes).catch(e => console.error("a la página:", e.message));
      }
    }
    if (r.c === "productos" || (r.c === "config" && r.id === "general")) await M.recalcularDisp();
    if (r.c === "clientes" && doc && T.email(doc.email)) await T.redis([["HSET", T.PREFIJO + "m:cliente-email", T.email(doc.email), r.id]]);
    return { ok: true, marca, doc: limpiar(r.c, r.id, doc, yo) };
  });
}

/* ---------- entrada ---------- */
async function quien(token) {
  const id = sesion(token);
  if (!id) return null;
  const s = await M.leerDoc("staff", id);
  return s && s.activo !== false && ROLES.includes(s.rol) ? { ...s, id } : null;
}
function tokenPara(id, recordar) { return firmar(id, recordar ? DIAS_SESION.recordar : DIAS_SESION.normal); }

async function crearAdmin(body, req) {
  if (!process.env.ADMIN_PASSWORD) return [503, { error: "sin-clave", mensaje: "Falta configurar ADMIN_PASSWORD en Vercel." }];
  if (!(await T.permitido("manager-admin:" + T.ip(req), 10, 3600))) return [429, { error: "espera", mensaje: "Demasiados intentos. Espera un rato." }];
  if (!mismaClave(body.clave || "", process.env.ADMIN_PASSWORD)) return [401, { error: "clave", mensaje: "La clave del panel no coincide." }];
  const nombre = T.texto(body.nombre, 60), email = T.email(body.email), pass = String(body.pass || "");
  if (!nombre || !email || pass.length < 6) return [400, { error: "datos", mensaje: "Completa nombre, un correo válido y una contraseña de al menos 6 caracteres." }];
  return M.conCandado("crear-admin", async () => {
    if (await M.cuantos("staff")) return [409, { error: "ya-hay", mensaje: "Ya hay usuarios. Entra con tu correo y contraseña." }];
    const salt = "s" + crypto.randomBytes(6).toString("hex"), id = "u" + Date.now().toString(36) + crypto.randomBytes(3).toString("hex");
    const st = { nombre, email, rol: "admin", sucursal: "", tel: "", activo: true, salt, pass: envolver(sha(salt, pass)), creado: Date.now() };
    await M.guardarDoc("staff", id, st);
    await M.sincronizar(true);
    return [200, { ok: true, token: tokenPara(id, true), yo: limpiarStaff({ ...st, id }, { ...st, id }) }];
  });
}

async function entrar(body, req) {
  const email = T.email(body.email), pass = String(body.pass || "");
  if (!email || !pass) return [400, { error: "datos", mensaje: "Escribe tu correo y tu contraseña." }];
  if (!(await T.permitido("manager-entrar:" + email, 8, 900)) || !(await T.permitido("manager-ip:" + T.ip(req), 30, 900))) {
    return [429, { error: "espera", mensaje: "Demasiados intentos. Espera unos minutos." }];
  }
  const lista = Object.entries(await M.todos("staff"));
  const par = lista.find(([, s]) => s && String(s.email || "").toLowerCase() === email);
  if (!par || par[1].activo === false) { await new Promise(r => setTimeout(r, 600)); return [401, { error: "acceso", mensaje: "No hay un usuario activo con ese correo." }]; }
  const [id, s] = par;
  if (!confirmar(s.pass, sha(s.salt || "", pass))) { await new Promise(r => setTimeout(r, 600)); return [401, { error: "acceso", mensaje: "La contraseña no coincide. Revísala e intenta de nuevo." }]; }
  return [200, { ok: true, token: tokenPara(id, body.recordar !== false), yo: limpiarStaff({ ...s, id }, { ...s, id }) }];
}

async function acquire(body) {
  const r = M.ruta(body.path);
  if (!r) throw M.err("invalid_argument", "Ruta no válida.");
  const holder = String(body.holder || "").slice(0, 80) || "x";
  const ttl = Math.min(600000, Math.max(1000, +body.ttlMs || 30000));
  const k = T.PREFIJO + "m:lease:" + r.c + "/" + r.id;
  const [ok] = await T.redis([["SET", k, holder, "NX", "PX", ttl]]);
  if (ok === "OK") return { acquired: true };
  const [h] = await T.redis([["GET", k]]);
  if (h === holder) { await T.redis([["SET", k, holder, "PX", ttl]]); return { acquired: true }; }
  return { acquired: false };
}

async function accion(yo, body) {
  const lee = LEE[yo.rol] || [];
  switch (body.accion) {
    case "yo": return { ok: true, yo: limpiarStaff(yo, yo) };
    case "poll": {
      const g = await M.version();
      if (+body.g === g) return { ok: true, g };
      const cols = [...new Set(Array.isArray(body.cols) ? body.cols : [])].filter(c => lee.includes(c));
      const vers = await M.versiones(cols);
      const desde = /^\d{4}-\d{2}-\d{2}$/.test(body.desde || "") ? body.desde : "";
      if (vers.dias && desde) for (const id of Object.keys(vers.dias)) if (id.slice(0, 10) < desde) delete vers.dias[id];
      return { ok: true, g, vers };
    }
    case "docs": {
      const out = {};
      for (const [c, ids] of Object.entries(body.want || {})) {
        if (!lee.includes(c) || !Array.isArray(ids)) continue;
        const docs = await M.leerDocs(c, ids.filter(id => typeof id === "string" && id.length <= 120).slice(0, 500));
        out[c] = Object.fromEntries(Object.entries(docs).map(([id, d]) => [id, limpiar(c, id, d, yo)]));
      }
      return { ok: true, docs: out };
    }
    case "consulta": {
      if (!lee.includes(body.col)) return { ok: true, docs: {} };
      const where = Array.isArray(body.where) ? body.where.slice(0, 10) : [];
      const docs = await M.todos(body.col);
      const out = {};
      for (const [id, d] of Object.entries(docs)) if (d && cumple(d, where)) out[id] = limpiar(body.col, id, d, yo);
      return { ok: true, docs: out };
    }
    case "escribir": return escribir(yo, body);
    case "acquire": return { ok: true, ...(await acquire(body)) };
    case "numero": {
      if (yo.rol !== "admin" && yo.rol !== "caja") throw M.err("permiso", "Tu cargo no permite crear pedidos.");
      const [n] = await T.redis([["INCR", T.PREFIJO + "contador"]]);
      return { ok: true, n };
    }
    default: throw M.err("invalid_argument", "Acción desconocida.");
  }
}

module.exports = async (req, res) => {
  res.setHeader("X-Robots-Tag", "noindex");
  if (req.method !== "POST") return T.send(res, 405, { error: "metodo" });
  let body;
  try { body = (await T.readBody(req)) || {}; } catch (e) { return T.send(res, 400, { error: "datos" }); }
  if (!T.redisConf()) return T.send(res, 503, { error: "sin-base", mensaje: "Falta conectar la base de datos (Upstash Redis) en Vercel." });
  if (!llave()) return T.send(res, 503, { error: "sin-clave", mensaje: "Falta configurar ADMIN_PASSWORD en Vercel." });
  try {
    if (body.accion === "estado") return T.send(res, 200, { ok: true, hayUsuarios: (await M.cuantos("staff")) > 0 });
    if (body.accion === "crear-admin") { const [s, r] = await crearAdmin(body, req); return T.send(res, s, r); }
    if (body.accion === "entrar") { const [s, r] = await entrar(body, req); return T.send(res, s, r); }
    const yo = await quien(body.token);
    if (!yo) return T.send(res, 401, { error: "revoked", mensaje: "Tu sesión terminó. Vuelve a entrar." });
    await M.sincronizar();
    return T.send(res, 200, await accion(yo, body));
  } catch (e) {
    if (e.code) return T.send(res, e.code === "unavailable" ? 503 : 400, { error: e.code, mensaje: e.mensaje || "" });
    if (e.client) return T.send(res, 503, { error: e.client });
    console.error("manager:", e.message);
    return T.send(res, 502, { error: "unavailable", mensaje: "No se pudo guardar. Revisa la conexión y vuelve a intentar." });
  }
};
