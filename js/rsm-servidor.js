/*
  Rincón Sushi Manager: su base de datos en el servidor de la página (api/manager.js), con la misma forma que
  tenía en claude.ai (db.doc, db.collection, where, get, set, update, delete, onSnapshot, acquire). Los datos se
  revisan cada pocos segundos y solo se baja lo que cambió.
*/
(function () {
  "use strict";
  var API = "api/manager";
  var CLAVE = "rsm.token";
  var CADA = 6000, CADA_OCULTA = 45000;   // cada cuánto se revisan los cambios (pestaña visible / oculta)

  var token = null, g = -1, timer = null, sondeando = false, otraVez = false;
  var cache = {};        // colección → { vers: {id: marca}, docs: {id: datos} }
  var oyentes = [];      // { col, id (o null: toda la colección), where, next, error, listo }

  function leerToken() { try { return localStorage.getItem(CLAVE) || sessionStorage.getItem(CLAVE); } catch (e) { return null; } }
  function guardarToken(t, recordar) {
    token = t;
    try {
      localStorage.removeItem(CLAVE); sessionStorage.removeItem(CLAVE);
      if (t) (recordar ? localStorage : sessionStorage).setItem(CLAVE, t);
    } catch (e) { /* sin almacenamiento: la sesión dura lo que la pestaña */ }
  }

  function fallo(code, mensaje) { var e = new Error(mensaje || code); e.code = code; e.mensaje = mensaje || ""; return e; }
  function llamar(datos) {
    if (token) datos.token = token;
    return fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos), cache: "no-store" })
      .catch(function () { throw fallo("unavailable", "Sin conexión con el servidor. Revisa internet."); })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (r) {
          if (res.ok) return r;
          if (res.status === 401 && r.error === "revoked") { guardarToken(null); parar(); avisarSalida(); }
          throw fallo(r.error || (res.status >= 500 ? "unavailable" : "invalid_argument"), r.mensaje || "");
        });
      });
  }

  /* ---------- fotos de lo que hay ---------- */
  function copiar(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function fotoDoc(id, data) {
    var d = data == null ? undefined : Object.freeze(copiar(data));
    return { id: id, exists: d !== undefined, data: function () { return d; }, metadata: { fromCache: false, hasPendingWrites: false } };
  }
  function cumple(doc, where) {
    return (where || []).every(function (w) {
      var x = doc ? doc[w[0]] : undefined, v = w[2];
      switch (w[1]) {
        case "==": return x === v;
        case "!=": return x !== v;
        case "<": return x < v;
        case "<=": return x <= v;
        case ">": return x > v;
        case ">=": return x >= v;
        case "in": return Array.isArray(v) && v.indexOf(x) >= 0;
        case "not-in": return Array.isArray(v) && v.indexOf(x) < 0;
        case "array-contains": return Array.isArray(x) && x.indexOf(v) >= 0;
        default: return false;
      }
    });
  }
  function fotoCol(docs, where) {
    var lista = Object.keys(docs).sort().filter(function (id) { return docs[id] != null && cumple(docs[id], where); })
      .map(function (id) { return fotoDoc(id, docs[id]); });
    return { docs: lista, size: lista.length, empty: !lista.length, docChanges: function () { return []; }, metadata: { fromCache: false, hasPendingWrites: false } };
  }
  function entregar(o) {
    var C = cache[o.col] || { docs: {} };
    try {
      if (o.id) o.next(fotoDoc(o.id, C.docs[o.id]));
      else o.next(fotoCol(C.docs, o.where));
    } catch (e) { setTimeout(function () { throw e; }); }
  }
  function avisar(col) { oyentes.slice().forEach(function (o) { if (o.listo && o.col === col) entregar(o); }); }

  /* ---------- revisar cambios ---------- */
  function hoyMenos(dias) {
    var p = {};
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(new Date(Date.now() - dias * 864e5)).forEach(function (x) { p[x.type] = x.value; });
    return p.year + "-" + p.month + "-" + p.day;
  }
  function programar(ms) {
    clearTimeout(timer);
    if (!token || !oyentes.length) return;
    timer = setTimeout(sondear, ms != null ? ms : (document.visibilityState === "hidden" ? CADA_OCULTA : CADA));
  }
  function parar() { clearTimeout(timer); timer = null; }
  function sondear() {
    if (sondeando) { otraVez = true; return; }
    if (!token || !oyentes.length) return;
    sondeando = true;
    var cols = []; oyentes.forEach(function (o) { if (cols.indexOf(o.col) < 0) cols.push(o.col); });
    llamar({ accion: "poll", g: g, cols: cols, desde: hoyMenos(40) }).then(function (r) {
      if (!r.vers) { g = r.g; return; }
      var pedir = {}, cambio = {};
      cols.forEach(function (c) {
        var vers = r.vers[c] || {}, C = cache[c] || (cache[c] = { vers: {}, docs: {} });
        var todos = oyentes.some(function (o) { return o.col === c && !o.id; });
        var ids = {}; oyentes.forEach(function (o) { if (o.col === c && o.id) ids[o.id] = true; });
        Object.keys(C.docs).forEach(function (id) { if (!(id in vers)) { delete C.docs[id]; delete C.vers[id]; cambio[c] = true; } });
        Object.keys(vers).forEach(function (id) {
          if (C.vers[id] !== vers[id] && (todos || ids[id])) (pedir[c] = pedir[c] || []).push(id);
        });
        C.pendiente = vers;
      });
      var bajar = Object.keys(pedir).length ? llamar({ accion: "docs", want: pedir }) : Promise.resolve({ docs: {} });
      return bajar.then(function (r2) {
        Object.keys(r2.docs || {}).forEach(function (c) {
          var C = cache[c];
          Object.keys(r2.docs[c]).forEach(function (id) {
            var d = r2.docs[c][id];
            if (d == null) { delete C.docs[id]; delete C.vers[id]; } else { C.docs[id] = d; C.vers[id] = C.pendiente[id]; }
            cambio[c] = true;
          });
        });
        g = r.g;
        oyentes.forEach(function (o) { if (!o.listo) { o.listo = true; cambio[o.col] = cambio[o.col] || "nuevo"; } });
        Object.keys(cambio).forEach(avisar);
      });
    }).catch(function (e) {
      if (e.code === "revoked") oyentes.slice().forEach(function (o) { if (o.error) o.error(e); });
    }).then(function () {
      sondeando = false;
      if (otraVez) { otraVez = false; programar(150); } else programar();
    });
  }
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") programar(100); });

  function escuchar(o) {
    oyentes.push(o);
    // si ya está en memoria se entrega al tiro; si no, llega con la próxima revisión, que se adelanta
    var C = cache[o.col];
    if (C && (o.id ? o.id in C.vers : oyentes.some(function (x) { return x !== o && x.col === o.col && !x.id && x.listo; }))) {
      o.listo = true; setTimeout(function () { if (oyentes.indexOf(o) >= 0) entregar(o); });
    } else { g = -1; programar(60); }
    return function () { var i = oyentes.indexOf(o); if (i >= 0) oyentes.splice(i, 1); };
  }

  /* ---------- la base, con la forma que usaba el Manager ---------- */
  function partir(path) { var s = String(path).split("/"); return { col: s[0], id: s[1] }; }
  function aplicarLocal(col, id, doc, marca) {
    var C = cache[col] || (cache[col] = { vers: {}, docs: {} });
    if (doc == null) { delete C.docs[id]; delete C.vers[id]; } else { C.docs[id] = doc; if (marca) C.vers[id] = marca; }
    avisar(col);
    programar(400);
  }
  function escribir(op, path, data) {
    var r = partir(path);
    return llamar({ accion: "escribir", op: op, path: path, data: data }).then(function (res) { aplicarLocal(r.col, r.id, res.doc, res.marca); });
  }
  function docRef(path) {
    var r = partir(path);
    return {
      id: r.id, path: path,
      get: function () {
        return llamar({ accion: "docs", want: (function () { var w = {}; w[r.col] = [r.id]; return w; })() })
          .then(function (res) { return fotoDoc(r.id, ((res.docs || {})[r.col] || {})[r.id]); });
      },
      set: function (data) { return escribir("set", path, data); },
      update: function (data) { return escribir("update", path, data); },
      delete: function () { return escribir("delete", path, null); },
      acquire: function (o) { return llamar({ accion: "acquire", path: path, holder: o && o.holder, ttlMs: o && o.ttlMs }).then(function (x) { return { acquired: !!x.acquired }; }); },
      onSnapshot: function (next, error) { return escuchar({ col: r.col, id: r.id, next: next, error: error }); }
    };
  }
  function consulta(col, where) {
    return {
      where: function (campo, op, valor) { return consulta(col, (where || []).concat([[campo, op, valor]])); },
      get: function () {
        return llamar({ accion: "consulta", col: col, where: where || [] }).then(function (res) { return fotoCol(res.docs || {}, where); });
      },
      onSnapshot: function (next, error) { return escuchar({ col: col, id: null, where: where || [], next: next, error: error }); },
      doc: function (id) { return docRef(col + "/" + id); }
    };
  }
  var db = { doc: docRef, collection: function (col) { return consulta(col, []); } };

  /* ---------- sesión ---------- */
  var alSalir = null;
  function avisarSalida() { if (alSalir) alSalir(); }
  function limpiarTodo() { parar(); oyentes = []; cache = {}; g = -1; }

  /* ---------- descargas ---------- */
  var downloads = {
    save: function (o) {
      return new Promise(function (ok) {
        var blob = o.data instanceof Blob ? o.data : new Blob([o.data], { type: /\.csv$/i.test(o.filename) ? "text/csv;charset=utf-8" : "application/octet-stream" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = o.filename || "archivo";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
        ok();
      });
    }
  };

  window.RSMServidor = {
    db: db,
    downloads: downloads,
    estado: function () { return llamar({ accion: "estado" }); },
    entrar: function (email, pass, recordar) {
      return llamar({ accion: "entrar", email: email, pass: pass, recordar: !!recordar }).then(function (r) { guardarToken(r.token, recordar); return r.yo; });
    },
    crearAdmin: function (datos) {
      return llamar({ accion: "crear-admin", nombre: datos.nombre, email: datos.email, pass: datos.pass, clave: datos.clave }).then(function (r) { guardarToken(r.token, true); return r.yo; });
    },
    reanudar: function () {
      token = leerToken();
      if (!token) return Promise.resolve(null);
      return llamar({ accion: "yo" }).then(function (r) { return r.yo; }).catch(function () { return null; });
    },
    numero: function () { return llamar({ accion: "numero" }).then(function (r) { return r.n; }); },
    salir: function () { guardarToken(null); limpiarTodo(); },
    alSalir: function (fn) { alSalir = fn; }
  };
})();
