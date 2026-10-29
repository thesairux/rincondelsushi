/* Carta, pedido y envío por WhatsApp.
   Los productos, precios y el horario están en carta.js. */
(function () {
  "use strict";

  if (!window.CARTA) return;
  var C, N;
  // Dentro del panel (/admin) la página se muestra con los cambios sin publicar, y en modo edición
  // los textos se cambian tocándolos (nunca en la página publicada).
  var PREVIA = /[?&]preview/.test(location.search) && window.parent !== window;
  var EDITAR = PREVIA && /[?&]edit/.test(location.search);
  var editando = EDITAR;
  var ZONA = "America/Santiago";
  var GUARDADO = "pedido-v1";
  var DIAS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  var DIAS_TXT = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var DIAS_CORTO = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

  /* ---------- utilidades ---------- */
  function $(sel, raiz) { return (raiz || document).querySelector(sel); }
  function $$(sel, raiz) { return Array.prototype.slice.call((raiz || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function plata(n) { return "$" + String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function sinTildes(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  function minus(s) { s = String(s || ""); return s.charAt(0).toLowerCase() + s.slice(1); }
  function mayus(s) { s = String(s || ""); return s.charAt(0).toUpperCase() + s.slice(1); }
  function dos(n) { return (n < 10 ? "0" : "") + n; }
  function leer(clave) { try { return JSON.parse(localStorage.getItem(clave) || "null"); } catch (e) { return null; } }
  function guardar(clave, valor) { try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* sin almacenamiento */ } }
  /* Con "sucursales" en carta.js, el pedido va al WhatsApp de la sucursal elegida; sin elegir, a la primera. */
  function sucursales() { return (N.sucursales || []).filter(function (s) { return s && s.nombre && s.whatsapp; }); }
  function sucursalElegida() {
    var ss = sucursales();
    var elegida = typeof pedido === "object" && pedido ? pedido.sucursal : "";
    return ss.filter(function (s) { return s.nombre === elegida; })[0] || null;
  }
  function wsp(texto) {
    var s = sucursalElegida() || sucursales()[0];
    return "https://wa.me/" + String((s || N).whatsapp || "").replace(/\D/g, "") + (texto ? "?text=" + encodeURIComponent(texto) : "");
  }

  var ICONOS = {
    mas: '<path d="M12 5v14M5 12h14"/>',
    flecha: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    abajo: '<path d="m6 9 6 6 6-6"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    check: '<path d="m5 12 4.5 4.5L19 7"/>',
    pausa: '<path d="M9 6v12M15 6v12"/>',
    play: '<path d="M8 5.5v13l10-6.5-10-6.5Z"/>',
    ubicacion: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>',
    cupon: '<path d="M3.5 7h17v3a2 2 0 0 0 0 4v3h-17v-3a2 2 0 0 0 0-4Z"/><path d="M10 7.5v1.5M10 11.25v1.5M10 15v1.5"/>',
    wsp: '<path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.6Z"/><path d="M9.2 8.6c.3 2.7 2.4 5 5.2 5.6l1.2-1.3-1.8-1-1 .7c-.9-.5-1.7-1.3-2.2-2.2l.7-1-1-1.8Z"/>',
    izquierda: '<path d="m15 6-6 6 6 6"/>',
    derecha: '<path d="m9 6 6 6-6 6"/>'
  };
  function icono(nombre) { return '<svg class="icono" viewBox="0 0 24 24" aria-hidden="true">' + ICONOS[nombre] + "</svg>"; }

  /* ---------- índice de la carta ---------- */
  var PRODUCTOS = {};
  var GRUPOS = {};
  var RUTA_CAT = {};
  var CATS = {};
  var CON_HORARIO = false;
  var HORARIO_ACTIVO = false;
  /* Toma los datos de carta.js, o los que manda el panel en la vista previa. "ruta" dice dónde está
     cada texto dentro de los datos, para que el panel sepa qué se editó. */
  function usarCarta(datos) {
    C = datos;
    N = C.negocio || {};
    if (window.aplicarTema) window.aplicarTema(C);
    PRODUCTOS = {};
    GRUPOS = {};
    RUTA_CAT = {};
    CATS = {};
    (C.secciones || []).forEach(function (sec, si) {
      (sec.categorias || []).forEach(function (cat, ci) {
        var ruta = "secciones." + si + ".categorias." + ci;
        RUTA_CAT[cat.id] = ruta;
        CATS[cat.id] = cat;
        (cat.productos || []).forEach(function (p, pi) {
          PRODUCTOS[p.id] = { p: p, cat: cat, sec: sec, ruta: ruta + ".productos." + pi };
        });
      });
    });
    (C.personalizacion || []).forEach(function (g) { GRUPOS[g.id] = g; });
    CON_HORARIO = !!C.horario && Object.keys(C.horario).some(function (k) { return rangos(C.horario[k]).length > 0; });
    // Con "horarioConfirmado": false el horario solo se muestra: no hay abierto/cerrado ni se bloquean pedidos.
    HORARIO_ACTIVO = CON_HORARIO && C.horarioConfirmado !== false;
  }
  usarCarta(window.CARTA);

  function ingrediente(id) { return (C.ingredientes && C.ingredientes[id]) || String(id || "").replace(/-/g, " "); }
  function gruposDe(id) {
    var x = PRODUCTOS[id];
    var lista = x.p.personalizar || x.cat.personalizar || [];
    return lista.map(function (g) { return GRUPOS[g]; }).filter(Boolean);
  }
  function gruposProducto(id) { return gruposDe(id).filter(function (g) { return !g.porRoll; }); }
  function gruposRoll(id) { return gruposDe(id).filter(function (g) { return g.porRoll; }); }
  /* Grupos que se eligen en cada roll (proteína, relleno, envoltura) y grupos de cambios opcionales. */
  function gruposArmado(id) { return gruposRoll(id).filter(function (g) { return g.tipo === "elegir"; }); }
  function gruposCambio(id) { return gruposRoll(id).filter(function (g) { return g.tipo !== "elegir"; }); }
  function rollsDe(id) {
    var p = PRODUCTOS[id].p;
    if (typeof p.rolls === "number" && p.rolls > 0) {
      var lista = [];
      for (var i = 0; i < Math.min(Math.floor(p.rolls), 30); i++) lista.push({});
      return lista;
    }
    if (p.rolls && p.rolls.length) return p.rolls;
    return gruposRoll(id).length ? [{}] : [];
  }
  /* Mínimo y máximo de un grupo según lo elegido: una opción con "suma" ({ "agregados": 1 }) deja elegir
     más en otro grupo (ej: vegetariano lleva 2 agregados). */
  function limites(g, conf) {
    var mas = 0;
    var el = (conf && conf.elecciones) || {};
    Object.keys(el).forEach(function (gid) {
      (el[gid] || []).forEach(function (oid) { var o = opcionDe(gid, oid); if (o && o.suma && o.suma[g.id] > 0) mas += o.suma[g.id]; });
    });
    return { min: (g.min || 0) + mas, max: (g.max || 1) + mas };
  }
  /* Al desmarcar una opción con "suma", lo elegido de más en el otro grupo se quita. */
  function recortarElecciones(id, conf) {
    gruposProducto(id).forEach(function (g) {
      var sel = conf.elecciones[g.id];
      var max = limites(g, conf).max;
      if (sel && sel.length > max) conf.elecciones[g.id] = sel.slice(0, max);
    });
  }
  function tieneOpciones(p) { return !!(p.opciones && p.opciones.length); }
  function unidad(id) { return PRODUCTOS[id].p.unidad || "Roll"; }
  function personalizable(id) { return tieneOpciones(PRODUCTOS[id].p) || gruposDe(id).length > 0; }
  function opcionDe(grupoId, opId) {
    var g = GRUPOS[grupoId];
    return g && (g.opciones || []).filter(function (o) { return o.id === opId; })[0];
  }
  function precioBase(p, opcion) {
    if (opcion && p.preciosOpciones && p.preciosOpciones[opcion] != null) return p.preciosOpciones[opcion];
    return p.precio;
  }
  function precioMinimo(p) {
    var lista = p.preciosOpciones ? Object.keys(p.preciosOpciones).map(function (k) { return p.preciosOpciones[k]; }) : [];
    var min = lista.length ? Math.min.apply(null, lista) : p.precio;
    var varia = lista.some(function (v) { return v !== min; });
    return { valor: min, desde: varia };
  }
  /* Lo elegido en cada roll con lo que se cobra. Con "gratis" en una opción, las primeras de esa opción no se cobran;
     con "gratis" en el grupo, las primeras opciones con precio del grupo. */
  function detalleArmado(id, conf) {
    var armado = conf.armado || [];
    var filas = armado.map(function () { return {}; });
    gruposArmado(id).forEach(function (g) {
      var gratis = g.gratis || 0;
      var usadas = {};
      armado.forEach(function (r, i) {
        var o = r && opcionDe(g.id, r[g.id]);
        if (!o) return;
        var cobro = o.precio || 0;
        var libre = false;
        usadas[o.id] = (usadas[o.id] || 0) + 1;
        if (cobro > 0 && o.gratis && usadas[o.id] <= o.gratis) { cobro = 0; libre = true; }
        else if (cobro > 0 && gratis > 0) { gratis--; cobro = 0; libre = true; }
        filas[i][g.id] = { o: o, cobro: cobro, gratis: libre };
      });
    });
    return filas;
  }
  function precioUnitario(id, conf) {
    var total = precioBase(PRODUCTOS[id].p, conf.opcion);
    detalleArmado(id, conf).forEach(function (f) { Object.keys(f).forEach(function (k) { total += f[k].cobro; }); });
    (conf.cambios || []).forEach(function (c) { var o = opcionDe(c.grupo, c.opcion); if (o) total += o.precio || 0; });
    var el = conf.elecciones || {};
    Object.keys(el).forEach(function (g) {
      el[g].forEach(function (oid) { var o = opcionDe(g, oid); if (o) total += o.precio || 0; });
    });
    return total;
  }
  function nombreLinea(id) {
    var x = PRODUCTOS[id];
    if (sinTildes(x.sec.nombre) === "promos" || sinTildes(x.cat.nombre) === sinTildes(x.p.nombre)) return x.p.nombre;
    return x.cat.nombre + " · " + x.p.nombre;
  }
  function textoCambio(c) {
    var o = opcionDe(c.grupo, c.opcion);
    var g = GRUPOS[c.grupo];
    var nombre = o ? o.nombre : c.opcion;
    var t;
    if (c.en) t = mayus(minus(nombre)) + " en vez de " + minus(ingrediente(c.en));
    else if (g && g.tipo === "envoltura") t = "Envoltura: " + minus(nombre);
    else if (g && g.tipo === "extra") t = nombre;
    else t = "Agregar " + minus(nombre);
    return t + (o && o.precio ? " +" + plata(o.precio) : "");
  }
  /* Detalle de lo elegido, una línea por cambio. Sirve para el pedido y para el mensaje. */
  function detalleConf(id, conf) {
    var lineas = [];
    var varios = rollsDe(id).length > 1;
    var ga = gruposArmado(id);
    var armado = detalleArmado(id, conf);
    armado.forEach(function (f, i) {
      var partes = ga.filter(function (g) { return f[g.id]; }).map(function (g) {
        var x = f[g.id];
        return g.nombre + ": " + x.o.nombre + (x.cobro ? " +" + plata(x.cobro) : x.gratis ? " (gratis)" : "");
      });
      if (partes.length) lineas.push({ texto: (armado.length > 1 ? unidad(id) + " " + (i + 1) : "Tu " + minus(unidad(id))) + ": " + partes.join(" · "), armado: true });
    });
    (conf.cambios || []).forEach(function (c, i) {
      lineas.push({ texto: (varios ? unidad(id) + " " + (c.roll + 1) + ": " : "") + textoCambio(c), cambio: i, roll: varios ? c.roll + 1 : 0, solo: textoCambio(c) });
    });
    gruposProducto(id).forEach(function (g) {
      if (g.tipo === "texto") {
        var t = (conf.textos || {})[g.id];
        if (t) lineas.push({ texto: g.nombre + ": " + t });
        return;
      }
      var sel = (conf.elecciones || {})[g.id] || [];
      if (!sel.length) return;
      var nombres = sel.map(function (oid) {
        var o = opcionDe(g.id, oid);
        return o ? o.nombre + (o.precio ? " +" + plata(o.precio) : "") : oid;
      });
      lineas.push({ texto: g.nombre + ": " + nombres.join(", ") });
    });
    return lineas;
  }

  /* ---------- horario ---------- */
  function rangos(txt) {
    if (!txt || /cerrad/i.test(txt)) return [];
    return String(txt).split(",").map(function (r) {
      var m = r.trim().match(/^(\d{1,2})[:.](\d{2})\s*(?:-|–|a)\s*(\d{1,2})[:.](\d{2})$/);
      if (!m) return null;
      var a = +m[1] * 60 + +m[2];
      var b = +m[3] * 60 + +m[4];
      if (b <= a) b += 1440;
      return [a, b];
    }).filter(Boolean);
  }
  function hora(min) { min = min % 1440; return dos(Math.floor(min / 60)) + ":" + dos(min % 60); }
  function ahora() {
    var d = new Date();
    try {
      var x = {};
      new Intl.DateTimeFormat("en-CA", { timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
        .formatToParts(d).forEach(function (p) { x[p.type] = p.value; });
      var dia = new Date(Date.UTC(+x.year, +x.month - 1, +x.day)).getUTCDay();
      return { fecha: x.year + "-" + x.month + "-" + x.day, dia: dia, min: (+x.hour % 24) * 60 + +x.minute };
    } catch (e) {
      return { fecha: d.getFullYear() + "-" + dos(d.getMonth() + 1) + "-" + dos(d.getDate()), dia: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }
  function fechaMas(fecha, n) {
    var d = new Date(fecha + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function horarioDel(fecha, dia) {
    if ((C.diasCerrados || []).indexOf(fecha) >= 0) return [];
    return rangos((C.horario || {})[DIAS[dia]]);
  }
  function direccionCompleta() { return [N.direccion, N.sector].filter(Boolean).join(", "); }
  function estadoLocal() {
    if (!HORARIO_ACTIVO) return { abierto: true, texto: "", sinHorario: true };
    var t = ahora();
    var i, r;
    var ayer = horarioDel(fechaMas(t.fecha, -1), (t.dia + 6) % 7);
    for (i = 0; i < ayer.length; i++) {
      r = ayer[i];
      if (r[1] > 1440 && t.min < r[1] - 1440) return { abierto: true, texto: "Cerramos a las " + hora(r[1]) };
    }
    var hoy = horarioDel(t.fecha, t.dia);
    for (i = 0; i < hoy.length; i++) {
      r = hoy[i];
      if (t.min >= r[0] && t.min < r[1]) return { abierto: true, texto: "Cerramos a las " + hora(r[1]) };
    }
    for (i = 0; i < hoy.length; i++) {
      if (t.min < hoy[i][0]) return { abierto: false, texto: "Abrimos hoy a las " + hora(hoy[i][0]) };
    }
    for (i = 1; i <= 7; i++) {
      var d = (t.dia + i) % 7;
      var rs = horarioDel(fechaMas(t.fecha, i), d);
      if (rs.length) return { abierto: false, texto: "Abrimos " + (i === 1 ? "mañana" : "el " + DIAS_TXT[d]) + " a las " + hora(rs[0][0]) };
    }
    return { abierto: false, texto: "" };
  }
  function textoRangos(txt, sep) {
    var r = rangos(txt);
    return r.length ? r.map(function (x) { return hora(x[0]) + sep + hora(x[1]); }).join(", ") : "";
  }
  /* Agrupa los días seguidos con el mismo horario, empezando el lunes. */
  function tramosHorario() {
    var tramos = [];
    [1, 2, 3, 4, 5, 6, 0].forEach(function (d) {
      var v = textoRangos((C.horario || {})[DIAS[d]], "–");
      var ult = tramos[tramos.length - 1];
      if (ult && ult.v === v) ult.hasta = d; else tramos.push({ desde: d, hasta: d, v: v });
    });
    return tramos;
  }
  function horarioCorto() {
    if (!CON_HORARIO) return "";
    return tramosHorario().map(function (t) {
      return mayus(DIAS_CORTO[t.desde] + (t.hasta !== t.desde ? "–" + DIAS_CORTO[t.hasta] : "")) + " " + (t.v || "cerrado");
    }).join(" · ");
  }
  function horarioLargo() {
    return tramosHorario().map(function (t) {
      var dias = mayus(DIAS_TXT[t.desde]) + (t.hasta !== t.desde ? " a " + DIAS_TXT[t.hasta] : "");
      return "<b>" + esc(dias) + "</b><span>" + esc(t.v ? t.v.replace(/–/g, " – ") : "Cerrado") + "</span>";
    }).join("");
  }

  var estado = estadoLocal();

  /* ---------- cupones ----------
     Un cupón por pedido. Se valida aquí con las condiciones de carta.js y el pedido llega por
     WhatsApp con el cupón y el descuento, para que el local lo confirme. */
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  function codigo(s) { return String(s || "").toUpperCase().replace(/\s+/g, ""); }
  function cuponDe(cod) {
    var k = codigo(cod);
    return k ? (C.cupones || []).filter(function (c) { return c && codigo(c.codigo) === k; })[0] : null;
  }
  function fechaTexto(f) { var p = String(f).split("-"); return +p[2] + " de " + MESES[+p[1] - 1]; }
  function listaY(a) { return a.length > 1 ? a.slice(0, -1).join(", ") + " y " + a[a.length - 1] : a.join(""); }
  // "los martes", "los sábados"
  function diasTexto(dias) {
    return listaY(dias.map(function (d) { var t = DIAS_TXT[DIAS.indexOf(d)]; return t && (/o$/.test(t) ? t + "s" : t); }).filter(Boolean));
  }
  function catsTexto(ids) { return listaY(ids.map(function (id) { return CATS[id] && CATS[id].nombre; }).filter(Boolean)); }
  function valorCupon(c) { return c.tipo === "monto" ? plata(c.valor) : (c.valor || 0) + "%"; }
  function nombreCupon(c) { return c.nombre || valorCupon(c) + " de descuento"; }
  function condicionesCupon(c) {
    var t = [];
    if (c.minimo) t.push("Pedido mínimo " + plata(c.minimo));
    if (c.aplica && c.aplica.length) t.push("Solo en " + catsTexto(c.aplica));
    if (c.modo === "retiro") t.push("Solo retiro en el local");
    else if (c.modo === "delivery") t.push("Solo delivery");
    if (c.dias && c.dias.length) t.push("Solo los " + diasTexto(c.dias));
    if (c.tipo !== "monto" && c.tope) t.push("Hasta " + plata(c.tope) + " de descuento");
    if (c.desde && c.desde > ahora().fecha) t.push("Desde el " + fechaTexto(c.desde));
    if (c.hasta) t.push("Hasta el " + fechaTexto(c.hasta));
    return t;
  }
  /* Si el cupón vale para el pedido de ahora y cuánto descuenta; si no, por qué */
  function evaluarCupon(c) {
    if (!c || c.activo === false) return { ok: false, motivo: "Este cupón ya no está disponible." };
    var t = ahora();
    if (c.desde && t.fecha < c.desde) return { ok: false, motivo: "Este cupón vale desde el " + fechaTexto(c.desde) + "." };
    if (c.hasta && t.fecha > c.hasta) return { ok: false, motivo: "Este cupón venció el " + fechaTexto(c.hasta) + "." };
    if (c.dias && c.dias.length && c.dias.indexOf(DIAS[t.dia]) < 0) return { ok: false, motivo: "Este cupón vale solo los " + diasTexto(c.dias) + "." };
    if (c.modo && c.modo !== pedido.modo) return { ok: false, motivo: c.modo === "retiro" ? "Este cupón es solo para retiro en el local." : "Este cupón es solo para delivery." };
    var sub = subtotal();
    if (c.minimo && sub < c.minimo) return { ok: false, motivo: "Es para pedidos desde " + plata(c.minimo) + ": te faltan " + plata(c.minimo - sub) + "." };
    var base = sub;
    if (c.aplica && c.aplica.length) {
      base = pedido.items.reduce(function (s, it) {
        return s + (c.aplica.indexOf(PRODUCTOS[it.id].cat.id) >= 0 ? precioUnitario(it.id, it.conf) * it.cant : 0);
      }, 0);
      if (!base) return { ok: false, motivo: "Es para " + catsTexto(c.aplica) + ": agrega algo de ahí a tu pedido." };
    }
    var d = c.tipo === "monto" ? Math.min(c.valor || 0, base) : Math.round(base * (c.valor || 0) / 100);
    if (c.tipo !== "monto" && c.tope) d = Math.min(d, c.tope);
    return d > 0 ? { ok: true, descuento: d } : { ok: false, motivo: "Este cupón no tiene descuento." };
  }
  function cuponActual() { return pedido.cupon ? cuponDe(pedido.cupon) : null; }
  function descuento() {
    if (!pedido.cupon || !pedido.items.length) return 0;
    var e = evaluarCupon(cuponActual());
    return e.ok ? e.descuento : 0;
  }

  /* ---------- datos del local en la página ---------- */
  function pintarDatos() {
    var direccionCiudad = [N.direccion, N.sector, N.ciudad].filter(Boolean).join(", ");
    var datos = {
      nombre: N.nombre, direccion: N.direccion, ciudad: N.ciudad, region: N.region,
      "direccion-ciudad": direccionCiudad, horario: horarioCorto(),
      instagram: N.instagram ? "@" + N.instagram : "",
      facebook: N.facebook,
      sector: N.sector || N.ciudad,
      "sector-ciudad": [N.sector, N.ciudad].filter(Boolean).join(", "),
      "nota-horario": !CON_HORARIO ? "" : HORARIO_ACTIVO
        ? "Estado según el horario publicado; puede variar, confirma por WhatsApp."
        : "Horario referencial, por confirmar. Escríbenos por WhatsApp antes de venir.",
      mapa: N.mapa
    };
    var ss = sucursales();
    $$("[data-dato]").forEach(function (el) {
      var v = datos[el.getAttribute("data-dato")];
      if (v) el.textContent = v;
    });
    // un botón de WhatsApp por sucursal: en la portada con su nombre, en el pie también con el número
    var numeros = ss.length ? ss : N.whatsapp ? [{ nombre: "WhatsApp", whatsapp: N.whatsapp, whatsappVisible: N.whatsappVisible }] : [];
    var botonWsp = function (s, clase, texto) {
      return '<a class="' + clase + '" href="https://wa.me/' + esc(String(s.whatsapp).replace(/\D/g, "")) + '" target="_blank" rel="noopener">' + icono("wsp") + texto + "</a>";
    };
    var portadaWsp = $("[data-portada-wsp]"), pieWsp = $("[data-pie-wsp]");
    if (portadaWsp && numeros.length) {
      portadaWsp.innerHTML = numeros.map(function (s) {
        return botonWsp(s, "wsp-sucursal wsp-sucursal--portada", "<span><small>Pedir por WhatsApp</small><b>" + esc(s.nombre) + "</b></span>");
      }).join("");
    }
    if (pieWsp && numeros.length) {
      pieWsp.innerHTML = numeros.map(function (s) {
        return botonWsp(s, "wsp-sucursal", "<span><b>" + esc(s.nombre) + "</b><small>" + esc(s.whatsappVisible || "+" + s.whatsapp) + "</small></span>" + icono("flecha"));
      }).join("");
    }
    // lo que no tiene datos (dirección, horario, Instagram) no se muestra
    $$("[data-si]").forEach(function (el) { el.hidden = !datos[el.getAttribute("data-si")]; });
    $$("[data-wsp]").forEach(function (a) { a.href = wsp(""); });
    if (N.instagram) $$("[data-instagram]").forEach(function (a) { a.href = "https://www.instagram.com/" + N.instagram + "/"; });
    if (N.facebook) $$("[data-facebook]").forEach(function (a) { a.href = N.facebook; });
    if (N.mapa) $$("[data-mapa]").forEach(function (a) { a.href = N.mapa; });
    var mapa = $("[data-mapa-embed]");
    if (mapa && N.direccion && !$("#ubicacion").hidden) {
      var busqueda = N.mapaBusqueda || [N.direccion, N.sector, N.ciudad, "Chile"].filter(Boolean).join(", ");
      var src = "https://www.google.com/maps?q=" + encodeURIComponent(busqueda) + "&output=embed";
      if (mapa.getAttribute("src") !== src) mapa.src = src;
    }
    var largo = $("[data-horario-largo]");
    if (largo) largo.innerHTML = horarioLargo();
  }

  /* Títulos y textos fijos de la página ("textos" en carta.js) */
  function valorEn(obj, ruta) {
    return ruta.split(".").reduce(function (a, k) { return a == null ? a : a[k]; }, obj);
  }
  function pintarTextos() {
    var T = C.textos || {};
    $$("[data-texto]").forEach(function (el) {
      var v = valorEn(T, el.getAttribute("data-texto"));
      if (typeof v === "string" && el.textContent !== v && document.activeElement !== el) el.textContent = v;
    });
  }

  var estadoOculto = false;
  function pintarEstado() {
    var el = $("[data-estado]");
    if (!el) return;
    el.hidden = estadoOculto || !!estado.sinHorario;
    el.className = "estado" + (estado.abierto ? " abierto" : "");
    el.innerHTML = '<span class="estado-punto" aria-hidden="true"></span><b>' + (estado.abierto ? "Abierto ahora" : "Cerrado ahora") + "</b>" +
      (estado.texto ? '<span class="estado-mas">' + esc(estado.texto) + "</span>" : "") +
      '<button type="button" data-ocultar-estado aria-label="Ocultar estado de apertura">×</button>';
  }

  /* ---------- botones para agregar ---------- */
  /* "dias": ["lunes"] en un producto: se pide solo esos días */
  function disponibleHoy(p) { return !(p.dias && p.dias.length) || p.dias.indexOf(DIAS[ahora().dia]) >= 0; }
  function botonAgregar(p, modo) {
    if (p.disponible === false) return '<span class="estado-pill">Agotado</span>';
    if (!disponibleHoy(p)) return '<span class="estado-pill">Solo los ' + esc(diasTexto(p.dias)) + "</span>";
    if (!estado.abierto) return '<span class="estado-pill">Cerrado</span>';
    var elegir = tieneOpciones(p);
    var texto = modo === "fila" ? (elegir ? "Elegir" : "") : (elegir ? (modo === "destacado" ? "Elegir" : "Elegir opción") : "Agregar");
    var aria = elegir ? "Elegir opción para " + p.nombre : "Agregar " + p.nombre + " al pedido";
    return '<button class="agregar" type="button" data-agregar="' + esc(p.id) + '" aria-label="' + esc(aria) + '">' +
      (texto ? "<span>" + texto + "</span>" : "") + '<span class="mas">' + icono("mas") + "</span></button>";
  }
  function precioLista(p) {
    var m = precioMinimo(p);
    if (!m.valor) return "";
    return (m.desde ? "<small>desde </small>" : "") + plata(m.valor);
  }

  /* ---------- portada: promos destacadas ---------- */
  var carrusel = { lista: [], i: 0, pausado: false, timer: null, ms: 6000, turno: 0 };
  // las fotos de las promos se bajan de antemano, para que al cambiar no quede el cuadro en negro
  var fotosPromo = {};
  function precargarPromos() {
    carrusel.lista.forEach(function (p) {
      if (fotosPromo[p.foto]) return;
      var im = new Image();
      im.src = p.foto;
      fotosPromo[p.foto] = im;
    });
  }
  function pintarDestacados() {
    var caja = $("[data-destacados]");
    if (!caja) return;
    carrusel.lista = Object.keys(PRODUCTOS).map(function (k) { return PRODUCTOS[k].p; })
      .filter(function (p) { return p.destacado && p.foto && p.disponible !== false && disponibleHoy(p); });
    if (!carrusel.lista.length) { caja.hidden = true; return; }
    if (carrusel.i >= carrusel.lista.length) carrusel.i = 0;
    var p = carrusel.lista[carrusel.i];
    var varias = carrusel.lista.length > 1;
    caja.classList.toggle("pausado", carrusel.pausado);
    // la foto que se estaba viendo queda debajo hasta que la nueva termina de cargar
    var anterior = caja.querySelector(".destacado-foto img.actual");
    var antes = anterior && anterior.classList.contains("lista") ? anterior.getAttribute("src") : "";
    var misma = antes === p.foto;
    caja.innerHTML =
      '<div class="destacado" aria-roledescription="carrusel" aria-label="Promos destacadas">' +
        (varias ? '<div class="destacado-barras" style="--duracion:' + carrusel.ms + 'ms">' + carrusel.lista.map(function (q, i) {
          return '<button type="button" data-ir="' + i + '" aria-label="Ver promoción ' + (i + 1) + ": " + esc(q.nombre) + '" class="' +
            (i < carrusel.i ? "hecha" : i === carrusel.i ? "activa" : "") + '"><span><i></i></span></button>';
        }).join("") + "</div>" +
        '<button class="destacado-pausa" type="button" data-pausa aria-label="' + (carrusel.pausado ? "Reanudar" : "Pausar") + ' rotación de promociones">' + icono(carrusel.pausado ? "play" : "pausa") + "</button>" +
        '<button class="destacado-flecha anterior" type="button" data-carrusel="-1" aria-label="Promoción anterior">' + icono("izquierda") + "</button>" +
        '<button class="destacado-flecha siguiente" type="button" data-carrusel="1" aria-label="Promoción siguiente">' + icono("derecha") + "</button>" : "") +
        '<div class="destacado-foto">' + (antes && !misma ? '<img class="previa" src="' + esc(antes) + '" alt="" width="1000" height="725">' : "") +
          '<img class="actual' + (misma ? " lista" : "") + '" src="' + esc(p.foto) + '" alt="Foto de ' + esc(p.nombre) + '" width="1000" height="725"></div>' +
        '<div class="destacado-panel">' +
          '<span class="destacado-etiqueta">Promo destacada</span>' +
          '<h2 class="destacado-nombre">' + esc(p.nombre) + "</h2>" +
          '<span class="destacado-precio">' + plata(precioMinimo(p).valor) + "</span>" +
          botonAgregar(p, "destacado") +
        "</div>" +
      "</div>";
    medirPanelPromo();
    var foto = caja.querySelector(".destacado-foto img.actual"), marco = foto.parentNode;
    var mostrar = function () {
      requestAnimationFrame(function () { foto.classList.add("lista"); marco.classList.remove("esperando"); });
      precargarPromos();
    };
    if (misma) precargarPromos();
    else if (foto.complete && foto.naturalWidth) mostrar();
    else { marco.classList.add("esperando"); foto.addEventListener("load", mostrar); foto.addEventListener("error", mostrar); }
    programarCarrusel();
  }
  // las flechas van al medio de la parte de la foto que no tapa el recuadro blanco
  function medirPanelPromo() {
    var d = $(".destacado"), panel = d && d.querySelector(".destacado-panel");
    if (panel) d.style.setProperty("--alto-panel", panel.offsetHeight + 16 + "px");
  }
  window.addEventListener("resize", medirPanelPromo);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medirPanelPromo);
  function programarCarrusel() {
    clearTimeout(carrusel.timer);
    var quieto = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (carrusel.lista.length < 2 || carrusel.pausado || quieto) return;
    var turno = ++carrusel.turno;
    carrusel.timer = setTimeout(function () {
      // si la foto siguiente todavía no llega, espera a que cargue antes de pasar
      var sig = (carrusel.i + 1) % carrusel.lista.length, im = fotosPromo[carrusel.lista[sig].foto];
      var pasar = function () {
        if (turno !== carrusel.turno || carrusel.pausado) return;
        carrusel.i = sig;
        pintarDestacados();
      };
      if (!im || im.complete) pasar();
      else { im.addEventListener("load", pasar, { once: true }); im.addEventListener("error", pasar, { once: true }); }
    }, carrusel.ms);
  }

  /* ---------- carta ---------- */
  var vista = { seccion: 0, categoria: null, busqueda: "" };

  function pintarNavegacion() {
    var secs = $("[data-secciones]");
    var cats = $("[data-categorias]");
    secs.innerHTML = C.secciones.map(function (s, i) {
      return '<button class="pildora" type="button" data-seccion="' + i + '" aria-pressed="' + (!vista.busqueda && i === vista.seccion) + '">' + esc(s.nombre) + "</button>";
    }).join("");
    var sec = C.secciones[vista.seccion];
    cats.hidden = !!vista.busqueda || !sec || sec.categorias.length < 2;
    if (cats.hidden) { cats.innerHTML = ""; return; }
    cats.innerHTML = '<button class="pildora" type="button" data-categoria="" aria-pressed="' + !vista.categoria + '">Todas</button>' +
      sec.categorias.map(function (c) {
        return '<button class="pildora" type="button" data-categoria="' + esc(c.id) + '" aria-pressed="' + (vista.categoria === c.id) + '">' + esc(c.nombre) + "</button>";
      }).join("");
  }

  /* Total de piezas solo si todas las líneas son piezas o cortes (ej: "25 piezas frías"; no en un combo con hamburguesas) */
  function sumaPiezas(lineas) {
    var total = 0;
    for (var i = 0; i < lineas.length; i++) {
      var m = lineas[i].match(/^\s*(\d+)\s+(piezas?|cortes?)\b/i);
      if (!m) return 0;
      total += +m[1];
    }
    return total;
  }
  function detalleLista(p) {
    var lineas = String(p.detalle || "").split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
    if (lineas.length > 1) {
      var piezas = sumaPiezas(lineas);
      return '<button class="variedades" type="button" aria-expanded="false">Ver qué incluye' +
        (piezas ? " · <b>" + piezas + " piezas</b>" : "") + icono("abajo") + "</button>" +
        '<ul class="variedades-lista" hidden>' + lineas.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("") + "</ul>";
    }
    return lineas.length ? '<p class="fila-detalle"' + rutaDe(p, "detalle") + ">" + esc(lineas[0]) + "</p>" : "";
  }
  /* atributo con la ruta del texto, solo en el modo edición del panel */
  function ruta(r) { return EDITAR ? ' data-e="' + esc(r) + '"' : ""; }
  function rutaDe(p, campo) { return ruta(PRODUCTOS[p.id].ruta + "." + campo); }
  function notaProducto(p) { return p.nota ? '<p class="fila-incluye"' + rutaDe(p, "nota") + ">" + esc(p.nota) + "</p>" : ""; }
  function fila(p) {
    return '<li class="fila' + (p.disponible === false ? " fila--agotada" : "") + '">' +
      '<div class="fila-texto"><h4 class="fila-nombre"' + rutaDe(p, "nombre") + ">" + esc(p.nombre) + "</h4>" + detalleLista(p) + notaProducto(p) + "</div>" +
      '<div class="fila-lado"><span class="precio">' + precioLista(p) + "</span>" + botonAgregar(p, "fila") + "</div></li>";
  }
  function tarjeta(p) {
    var foto = p.foto
      ? '<div class="tarjeta-foto"><img src="' + esc(p.foto) + '" alt="Foto de ' + esc(p.nombre) + '" width="1000" height="725" loading="lazy"></div>'
      : '<div class="tarjeta-foto tarjeta-foto--vacia"><img src="img/logo.png" alt="" width="399" height="240" loading="lazy"></div>';
    return '<li class="tarjeta' + (p.disponible === false ? " fila--agotada" : "") + '">' + foto +
      '<div class="tarjeta-cuerpo"><h4 class="fila-nombre"' + rutaDe(p, "nombre") + ">" + esc(p.nombre) + "</h4>" + detalleLista(p) + notaProducto(p) +
      '<div class="tarjeta-pie"><span class="precio">' + precioLista(p) + "</span>" + botonAgregar(p, "tarjeta") + "</div></div></li>";
  }
  function bloque(cat, productos, titulo) {
    // con "tarjetas": true la categoría va en tarjetas aunque falten las fotos (queda el espacio de la imagen)
    var conFotos = cat.tarjetas || productos.some(function (p) { return p.foto; });
    return '<section class="bloque" id="cat-' + esc(cat.id) + '" aria-label="' + esc(titulo || cat.nombre) + '">' +
      '<header class="bloque-cab"><h3' + ruta(RUTA_CAT[cat.id] + ".nombre") + ">" + esc(titulo || cat.nombre) + "</h3>" +
      (cat.nota ? "<p" + ruta(RUTA_CAT[cat.id] + ".nota") + ">" + esc(cat.nota) + "</p>" : "") + "</header>" +
      (conFotos ? '<ul class="tarjetas">' + productos.map(tarjeta).join("") + "</ul>" : '<ul class="filas">' + productos.map(fila).join("") + "</ul>") +
      "</section>";
  }
  function pintarLista() {
    var lista = $("[data-lista]");
    var html = "";
    if (vista.busqueda) {
      var palabras = sinTildes(vista.busqueda).split(/\s+/).filter(Boolean);
      var hay = 0;
      C.secciones.forEach(function (sec) {
        sec.categorias.forEach(function (cat) {
          var encontrados = cat.productos.filter(function (p) {
            var texto = sinTildes([p.nombre, p.detalle, p.incluye, p.nota, cat.nombre, sec.nombre, (p.opciones || []).join(" ")].join(" "));
            return palabras.every(function (w) { return texto.indexOf(w) >= 0; });
          });
          hay += encontrados.length;
          if (encontrados.length) html += bloque(cat, encontrados);
        });
      });
      if (!hay) {
        html = '<div class="bloque"><p class="bloque-vacio">No encontramos «' + esc(vista.busqueda) + '» en la carta. ' +
          '<a href="' + esc(wsp("Hola, ¿tienen " + vista.busqueda + "?")) + '" target="_blank" rel="noopener">Pregúntanos por WhatsApp</a>.</p></div>';
      }
    } else {
      var sec = C.secciones[vista.seccion];
      sec.categorias.forEach(function (cat) {
        if (vista.categoria && vista.categoria !== cat.id) return;
        if (cat.productos.length) html += bloque(cat, cat.productos);
      });
    }
    lista.innerHTML = html;
  }
  function pintarCarta() { pintarNavegacion(); pintarLista(); }
  function subirALista() {
    var nav = $(".secciones");
    var lista = $("[data-lista]");
    var alto = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--alto-cabecera")) || 84;
    var tope = lista.getBoundingClientRect().top + window.scrollY - alto - nav.offsetHeight - 12;
    if (window.scrollY > tope) window.scrollTo({ top: tope, behavior: "smooth" });
  }

  /* ---------- pedido ---------- */
  var pedido = { items: [], nombre: "", email: "", modo: "retiro", direccion: "", pago: "", cupon: "", sucursal: "", ubicacion: null };
  (function cargar() {
    var g = leer(GUARDADO);
    if (!g || typeof g !== "object") return;
    ["nombre", "email", "direccion", "pago", "sucursal"].forEach(function (k) { if (typeof g[k] === "string") pedido[k] = g[k]; });
    if (g.ubicacion && isFinite(g.ubicacion.lat) && isFinite(g.ubicacion.lng)) pedido.ubicacion = g.ubicacion;
    if (typeof g.cupon === "string") pedido.cupon = codigo(g.cupon);
    if (g.modo === "delivery") pedido.modo = "delivery";
    if (Array.isArray(g.items)) {
      pedido.items = g.items.filter(function (it) {
        return it && PRODUCTOS[it.id] && it.cant > 0 && it.conf && typeof it.conf === "object";
      }).map(function (it) {
        return { uid: String(it.uid || Math.random().toString(36).slice(2)), id: it.id, cant: Math.min(99, Math.floor(it.cant)), conf: limpiarConf(it.id, it.conf), nota: String(it.nota || "") };
      });
    }
  })();
  function guardarPedido() {
    guardar(GUARDADO, { items: pedido.items, nombre: pedido.nombre, email: pedido.email, modo: pedido.modo, direccion: pedido.direccion, pago: pedido.pago, cupon: pedido.cupon, sucursal: pedido.sucursal, ubicacion: pedido.ubicacion });
  }
  /* Descarta opciones que ya no existen en la carta (por si cambió desde la última visita). */
  function limpiarConf(id, conf) {
    var p = PRODUCTOS[id].p;
    var limpia = { cambios: [], elecciones: {}, textos: {} };
    if (conf.opcion && (p.opciones || []).indexOf(conf.opcion) >= 0) limpia.opcion = conf.opcion;
    var nRolls = rollsDe(id).length;
    var grupos = gruposDe(id).map(function (g) { return g.id; });
    (conf.cambios || []).forEach(function (c) {
      if (c && c.roll >= 0 && c.roll < nRolls && grupos.indexOf(c.grupo) >= 0 && opcionDe(c.grupo, c.opcion)) {
        limpia.cambios.push(c.en ? { roll: c.roll, grupo: c.grupo, opcion: c.opcion, en: c.en } : { roll: c.roll, grupo: c.grupo, opcion: c.opcion });
      }
    });
    Object.keys(conf.elecciones || {}).forEach(function (g) {
      if (grupos.indexOf(g) < 0 || !Array.isArray(conf.elecciones[g])) return;
      var ok = conf.elecciones[g].filter(function (o) { return opcionDe(g, o); });
      if (ok.length) limpia.elecciones[g] = ok;
    });
    Object.keys(conf.textos || {}).forEach(function (g) {
      if (grupos.indexOf(g) >= 0 && conf.textos[g]) limpia.textos[g] = String(conf.textos[g]).slice(0, 60);
    });
    var ga = gruposArmado(id);
    if (ga.length) {
      limpia.armado = rollsDe(id).map(function (r, i) {
        var orig = (conf.armado || [])[i] || {};
        var x = {};
        ga.forEach(function (g) {
          var o = opcionDe(g.id, orig[g.id]);
          if (o && o.disponible !== false) x[g.id] = o.id;
        });
        return x;
      });
    }
    return limpia;
  }
  function claveConf(conf) { return JSON.stringify([conf.opcion || "", conf.cambios || [], conf.elecciones || {}, conf.textos || {}, conf.armado || []]); }
  function cantidadTotal() { return pedido.items.reduce(function (s, it) { return s + it.cant; }, 0); }
  function subtotal() { return pedido.items.reduce(function (s, it) { return s + precioUnitario(it.id, it.conf) * it.cant; }, 0); }

  function agregarAlPedido(id, conf) {
    if (!disponibleHoy(PRODUCTOS[id].p)) return;
    var clave = claveConf(conf);
    var igual = pedido.items.filter(function (it) { return it.id === id && !it.nota && claveConf(it.conf) === clave; })[0];
    if (igual) igual.cant = Math.min(99, igual.cant + 1);
    else pedido.items.push({ uid: Math.random().toString(36).slice(2), id: id, cant: 1, conf: conf, nota: "" });
    guardarPedido();
    pintarContador(true);
    avisar("Agregado: <b>" + esc(PRODUCTOS[id].p.nombre) + "</b>");
  }
  function pintarContador(saltar) {
    var n = cantidadTotal();
    $$("[data-contador]").forEach(function (el) {
      el.textContent = n;
      if (saltar) { el.classList.remove("salta"); void el.offsetWidth; el.classList.add("salta"); }
    });
    $$(".boton-pedido").forEach(function (b) { b.setAttribute("aria-label", "Mi pedido, " + n + (n === 1 ? " producto" : " productos")); });
    var barra = $("[data-barra]");
    barra.hidden = n === 0;
    document.body.classList.toggle("con-barra", n > 0);
    $("[data-barra-total]").textContent = plata(subtotal() - descuento());
  }
  var avisoTimer;
  function avisar(html) {
    var el = $("[data-aviso]");
    el.innerHTML = html;
    el.classList.add("visible");
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(function () { el.classList.remove("visible"); }, 2400);
  }

  /* ---------- ventanas ---------- */
  function abrir(dlg) {
    if (!dlg.open) {
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    }
    document.documentElement.classList.add("con-dialogo");
  }
  function cerrar(dlg) {
    if (dlg.open) { if (dlg.close) dlg.close(); else dlg.removeAttribute("open"); }
  }
  function alCerrar() {
    if (!$$("dialog").some(function (d) { return d.open; })) document.documentElement.classList.remove("con-dialogo");
  }
  $$("dialog").forEach(function (d) {
    d.addEventListener("close", alCerrar);
    // clic fuera de la caja: cierra
    d.addEventListener("click", function (e) { if (e.target === d) cerrar(d); });
  });

  /* ---------- ficha de producto ---------- */
  var ficha = null; // { id, conf, uid, roll, accion }
  var dlgFicha = $("[data-ficha]");
  var cuerpoFicha = $("[data-ficha-cuerpo]");

  function confInicial(id) {
    var p = PRODUCTOS[id].p;
    var conf = { cambios: [], elecciones: {}, textos: {} };
    if (tieneOpciones(p)) conf.opcion = p.opciones[0];
    gruposProducto(id).forEach(function (g) {
      if (g.tipo !== "elegir") return;
      var def = (g.opciones || []).filter(function (o) { return o.porDefecto && o.disponible !== false; }).map(function (o) { return o.id; });
      if (def.length) conf.elecciones[g.id] = def.slice(0, g.max || 1);
    });
    var ga = gruposArmado(id);
    if (ga.length) {
      conf.armado = rollsDe(id).map(function () {
        var x = {};
        ga.forEach(function (g) {
          var def = (g.opciones || []).filter(function (o) { return o.porDefecto && o.disponible !== false; })[0];
          if (def) x[g.id] = def.id;
        });
        return x;
      });
    }
    return conf;
  }
  function abrirFicha(id, uid) {
    var item = uid && pedido.items.filter(function (it) { return it.uid === uid; })[0];
    ficha = { id: id, uid: item ? uid : null, roll: null, accion: null, conf: JSON.parse(JSON.stringify(item ? item.conf : confInicial(id))) };
    pintarFicha();
    abrir(dlgFicha);
    cuerpoFicha.scrollTop = 0;
  }
  function faltante() {
    var conf = ficha.conf;
    var grupos = gruposProducto(ficha.id);
    for (var i = 0; i < grupos.length; i++) {
      var g = grupos[i];
      var min = limites(g, conf).min;
      if (g.tipo === "texto") { if (min && !String((conf.textos || {})[g.id] || "").trim()) return { g: g }; continue; }
      if (((conf.elecciones || {})[g.id] || []).length < min) return { g: g };
    }
    var ga = gruposArmado(ficha.id);
    var rolls = rollsDe(ficha.id);
    for (var r = 0; r < rolls.length; r++) {
      for (var k = 0; k < ga.length; k++) {
        if ((ga[k].min || 0) > 0 && !((conf.armado || [])[r] || {})[ga[k].id]) return { g: ga[k], roll: r };
      }
    }
    return null;
  }
  function pintarPieFicha() {
    var b = $("[data-confirmar]");
    var falta = faltante();
    var total = precioUnitario(ficha.id, ficha.conf);
    b.setAttribute("aria-disabled", falta ? "true" : "false");
    if (falta) {
      b.innerHTML = (falta.g.tipo === "texto" ? "Escribe " : "Elige ") + esc(minus(falta.g.nombre)) +
        (falta.roll != null && rollsDe(ficha.id).length > 1 ? " del roll " + (falta.roll + 1) : "");
    }
    else b.innerHTML = (ficha.uid ? "Guardar cambios por" : "Agregar por") + " <b>" + plata(total) + "</b> " + icono("flecha");
  }
  function grupoHtml(g) {
    var conf = ficha.conf;
    if (g.tipo === "texto") {
      return '<label class="grupo"><span class="grupo-titulo">' + esc(g.nombre) + (g.min ? "" : " <small>Opcional</small>") + "</span>" +
        '<input class="texto-libre" type="text" maxlength="60" data-texto="' + esc(g.id) + '" value="' + esc((conf.textos || {})[g.id] || "") + '" placeholder="Escribe tu elección"></label>';
    }
    var sel = (conf.elecciones || {})[g.id] || [];
    var lim = limites(g, conf);
    var max = lim.max;
    var unica = g.tipo === "elegir" && max === 1;
    var ayuda = g.tipo === "extra" || !lim.min ? "Opcional" : (lim.min === max ? "Elige " + max : "Elige de " + lim.min + " a " + max);
    return '<fieldset class="grupo"><legend>' + esc(g.nombre) + " <small>" + ayuda + "</small></legend>" +
      (g.opciones || []).map(function (o) {
        var marcado = sel.indexOf(o.id) >= 0;
        var bloqueado = o.disponible === false || (!unica && !marcado && sel.length >= max);
        return '<label class="eleccion' + (marcado ? " sel" : "") + (bloqueado ? " no" : "") + '">' +
          '<input type="' + (unica ? "radio" : "checkbox") + '" name="g-' + esc(g.id) + '" data-grupo="' + esc(g.id) + '" value="' + esc(o.id) + '"' +
          (marcado ? " checked" : "") + (bloqueado ? " disabled" : "") + ">" +
          '<span class="eleccion-nombre">' + esc(o.nombre) + (o.disponible === false ? " (agotado)" : "") + "</span>" +
          (o.precio ? '<span class="eleccion-precio">+' + plata(o.precio) + "</span>" : "") + "</label>";
      }).join("") + "</fieldset>";
  }
  /* Acciones posibles sobre un roll: agregar, reemplazar un ingrediente, cambiar envoltura o un extra (ej. sin nori). */
  function accionesRoll(i) {
    var roll = rollsDe(ficha.id)[i];
    var cambios = ficha.conf.cambios.filter(function (c) { return c.roll === i; });
    var acciones = [];
    gruposCambio(ficha.id).forEach(function (g) {
      if (g.tipo === "agregar") {
        var hechos = cambios.filter(function (c) { return c.grupo === g.id && !c.en; }).length;
        acciones.push({ id: "agregar:" + g.id, texto: "Agregar", lleno: g.max && hechos >= g.max });
        if ((g.opciones || []).some(function (o) { return o.reemplazo; })) {
          (roll.relleno || []).forEach(function (ing) {
            if (cambios.some(function (c) { return c.en === ing; })) return;
            acciones.push({ id: "en:" + g.id + ":" + ing, texto: "En vez de " + minus(ingrediente(ing)) });
          });
        }
      } else if (g.tipo === "envoltura") {
        acciones.push({ id: "envoltura:" + g.id, texto: "Cambiar envoltura" });
      } else if (g.tipo === "extra") {
        (g.opciones || []).forEach(function (o) {
          if (o.disponible === false || cambios.some(function (c) { return c.grupo === g.id && c.opcion === o.id; })) return;
          acciones.push({ id: "extra:" + g.id + ":" + o.id, texto: o.nombre, directo: true });
        });
      }
    });
    return acciones;
  }
  function opcionesAccion(i, accion) {
    var partes = accion.split(":");
    var g = GRUPOS[partes[1]];
    var roll = rollsDe(ficha.id)[i];
    var cambios = ficha.conf.cambios.filter(function (c) { return c.roll === i && c.grupo === g.id; });
    var ops = (g.opciones || []).filter(function (o) { return o.disponible !== false; });
    if (partes[0] === "agregar") {
      ops = ops.filter(function (o) { return !cambios.some(function (c) { return !c.en && c.opcion === o.id; }); });
      return { pregunta: "¿Qué le agregas?", ops: ops };
    }
    if (partes[0] === "en") {
      ops = ops.filter(function (o) { return o.reemplazo && o.ingrediente !== partes[2]; });
      return { pregunta: "¿Qué le pones en vez de " + minus(ingrediente(partes[2])) + "?", ops: ops };
    }
    ops = ops.filter(function (o) { return !o.ingrediente || o.ingrediente !== roll.envoltura; });
    return { pregunta: "¿Con qué lo envuelves?", ops: ops };
  }
  function rollHtml(roll, i, total, p) {
    var abierto = ficha.roll === i;
    var cambios = ficha.conf.cambios.map(function (c, k) { return { c: c, k: k }; }).filter(function (x) { return x.c.roll === i; });
    var texto = roll.texto || (total === 1 ? p.detalle || "" : "");
    var html = '<div class="roll' + (abierto ? " abierto" : "") + '">' +
      '<p class="roll-titulo"><b>' + (total > 1 ? unidad(ficha.id) + " " + (i + 1) : "Tu " + minus(unidad(ficha.id))) + "</b> " + esc(texto) + "</p>";
    var ga = gruposArmado(ficha.id);
    if (ga.length) {
      var elegido = (ficha.conf.armado || [])[i] || {};
      var cobros = detalleArmado(ficha.id, ficha.conf)[i] || {};
      html += '<div class="armado">' + ga.map(function (g) {
        var x = cobros[g.id];
        return '<label class="armado-campo"><span>' + esc(g.nombre) + "</span>" +
          '<select data-armado="' + i + '" data-grupo-roll="' + esc(g.id) + '"' + (elegido[g.id] ? "" : ' class="vacio"') + ">" +
          '<option value="">Elige…</option>' + (g.opciones || []).filter(function (o) { return o.disponible !== false; }).map(function (o) {
            return '<option value="' + esc(o.id) + '"' + (elegido[g.id] === o.id ? " selected" : "") + ">" + esc(o.nombre) + (o.precio ? " (+" + plata(o.precio) + ")" : "") + "</option>";
          }).join("") + "</select>" +
          (x && x.gratis ? '<small class="armado-gratis">Gratis</small>' : x && x.cobro ? "<small>+" + plata(x.cobro) + "</small>" : "") +
          "</label>";
      }).join("") + "</div>";
      var completo = ga.every(function (g) { return elegido[g.id]; });
      var faltan = (ficha.conf.armado || []).some(function (r, k) { return k !== i && ga.some(function (g) { return !(r || {})[g.id]; }); });
      if (total > 1 && completo && faltan) html += '<button class="copiar" type="button" data-copiar="' + i + '">Repetir ' + (unidad(ficha.id) === "Roll" ? "este roll" : "esta " + minus(unidad(ficha.id))) + ' en los que faltan</button>';
    }
    if (cambios.length) {
      html += '<ul class="roll-cambios">' + cambios.map(function (x) {
        return "<li><span>" + esc(textoCambio(x.c)) + '</span><button class="quitar" type="button" data-quitar-cambio="' + x.k + '" aria-label="Quitar: ' + esc(textoCambio(x.c)) + '">' + icono("x") + "</button></li>";
      }).join("") + "</ul>";
    }
    if (!abierto) {
      var acciones = accionesRoll(i);
      if (acciones.some(function (a) { return !a.lleno; })) html += '<button class="roll-boton" type="button" data-roll="' + i + '">+ Agregar o cambiar</button>';
      return html + "</div>";
    }
    var lista = accionesRoll(i);
    html += '<div class="editor"><p class="editor-pregunta">¿Qué quieres hacer?</p><div class="chips">' + lista.map(function (a) {
      return '<button class="chip" type="button" data-accion="' + esc(a.id) + '" aria-pressed="' + (ficha.accion === a.id) + '"' + (a.lleno ? " disabled" : "") + ">" + esc(a.texto) + "</button>";
    }).join("") + "</div>";
    if (ficha.accion && ficha.accion.indexOf("extra:") !== 0) {
      var o = opcionesAccion(i, ficha.accion);
      html += '<p class="editor-pregunta">' + esc(o.pregunta) + '</p><div class="chips">' + o.ops.map(function (op) {
        return '<button class="chip" type="button" data-elegir="' + esc(op.id) + '">' + esc(op.nombre) + (op.precio ? " · +" + plata(op.precio) : "") + "</button>";
      }).join("") + "</div>";
    }
    return html + '<button class="editor-cancelar" type="button" data-roll-cerrar>Cancelar</button></div></div>';
  }
  function pintarFicha() {
    var x = PRODUCTOS[ficha.id];
    var p = x.p;
    var rolls = rollsDe(ficha.id);
    var lineasEnRolls = rolls.length > 1 && rolls.every(function (r) { return r.texto; });
    var html = "";
    if (p.foto) html += '<div class="ficha-foto"><img src="' + esc(p.foto) + '" alt="Foto de ' + esc(p.nombre) + '" width="1000" height="725"></div>';
    html += '<h2 class="ficha-titulo" id="ficha-titulo">' + esc(p.nombre) + "</h2>";
    if (p.detalle && !lineasEnRolls && !(rolls.length === 1 && !rolls[0].texto && gruposRoll(ficha.id).length)) {
      html += '<p class="ficha-detalle">' + esc(p.detalle) + "</p>";
    }
    if (p.nota) html += '<p class="ficha-nota">' + esc(p.nota) + "</p>";
    if (p.incluye) html += '<div class="incluye"><p class="incluye-titulo">Incluye</p><p>' + icono("check") + esc(p.incluye) + "</p></div>";
    if (tieneOpciones(p)) {
      html += '<fieldset class="grupo"><legend>Elige una opción</legend>' + p.opciones.map(function (o) {
        var marcado = ficha.conf.opcion === o;
        return '<label class="eleccion' + (marcado ? " sel" : "") + '"><input type="radio" name="opcion" data-opcion value="' + esc(o) + '"' + (marcado ? " checked" : "") + ">" +
          '<span class="eleccion-nombre">' + esc(o) + "</span>" +
          (p.preciosOpciones && p.preciosOpciones[o] != null ? '<span class="eleccion-precio">' + plata(p.preciosOpciones[o]) + "</span>" : "") + "</label>";
      }).join("") + "</fieldset>";
    }
    gruposProducto(ficha.id).forEach(function (g) { html += grupoHtml(g); });
    if (rolls.length) {
      var ga = gruposArmado(ficha.id);
      if (ga.length) {
        var ayudas = [x.cat.ayuda].concat(ga.map(function (g) { return g.ayuda; })).filter(Boolean);
        html += '<div class="rolls"><h3>' + (rolls.length > 1 ? "Arma tus " + rolls.length + " " + minus(unidad(ficha.id)) + "s" : "Arma tu " + minus(unidad(ficha.id))) + "</h3>" +
          (ayudas.length ? '<p class="rolls-ayuda">' + ayudas.map(esc).join(" ") + "</p>" : "");
      } else {
        var tipos = gruposCambio(ficha.id).map(function (g) { return g.tipo; });
        var puede = [];
        if (tipos.indexOf("agregar") >= 0) puede.push("agregar o cambiar ingredientes");
        if (tipos.indexOf("envoltura") >= 0) puede.push("cambiar la envoltura");
        html += '<div class="rolls"><h3>¿Quieres cambiar algo?</h3><p class="rolls-ayuda">Opcional.' +
          (puede.length ? " " + (rolls.length > 1 ? "En cada roll puedes " : "Puedes ") + puede.join(" y ") + ";" : "") +
          " cada cambio se cobra a precio de carta.</p>";
      }
      html += rolls.map(function (r, i) { return rollHtml(r, i, rolls.length, p); }).join("") + "</div>";
    }
    // al volver a pintar, el foco queda en el mismo campo
    var activo = document.activeElement;
    var foco = activo && cuerpoFicha.contains(activo) && activo.getAttribute("data-armado") != null
      ? '[data-armado="' + activo.getAttribute("data-armado") + '"][data-grupo-roll="' + activo.getAttribute("data-grupo-roll") + '"]' : null;
    var scroll = cuerpoFicha.scrollTop;
    cuerpoFicha.innerHTML = html;
    cuerpoFicha.scrollTop = scroll;
    if (foco && $(foco, cuerpoFicha)) $(foco, cuerpoFicha).focus({ preventScroll: true });
    pintarPieFicha();
  }
  function confirmarFicha() {
    var falta = faltante();
    if (falta) {
      var campo = falta.roll != null
        ? $('[data-armado="' + falta.roll + '"][data-grupo-roll="' + falta.g.id + '"]', cuerpoFicha)
        : $('[data-grupo="' + falta.g.id + '"], [data-texto="' + falta.g.id + '"]', cuerpoFicha);
      if (campo) { campo.scrollIntoView({ block: "center", behavior: "smooth" }); campo.focus({ preventScroll: true }); }
      return;
    }
    var conf = limpiarConf(ficha.id, ficha.conf);
    if (ficha.uid) {
      pedido.items.forEach(function (it) { if (it.uid === ficha.uid) it.conf = conf; });
      guardarPedido();
      pintarContador(false);
      pintarPedido();
    } else {
      agregarAlPedido(ficha.id, conf);
    }
    cerrar(dlgFicha);
  }

  cuerpoFicha.addEventListener("change", function (e) {
    var t = e.target;
    if (!ficha) return;
    if (t.hasAttribute("data-opcion")) { ficha.conf.opcion = t.value; pintarFicha(); return; }
    if (t.hasAttribute("data-armado")) {
      var r = +t.getAttribute("data-armado");
      if (!ficha.conf.armado) ficha.conf.armado = [];
      var elegido = ficha.conf.armado[r] = ficha.conf.armado[r] || {};
      if (t.value) elegido[t.getAttribute("data-grupo-roll")] = t.value;
      else delete elegido[t.getAttribute("data-grupo-roll")];
      pintarFicha();
      return;
    }
    var gid = t.getAttribute("data-grupo");
    if (gid) {
      var g = GRUPOS[gid];
      var unica = g.tipo === "elegir" && limites(g, ficha.conf).max === 1;
      var sel = (ficha.conf.elecciones[gid] || []).slice();
      if (unica) sel = [t.value];
      else if (t.checked) { if (sel.indexOf(t.value) < 0) sel.push(t.value); }
      else sel = sel.filter(function (v) { return v !== t.value; });
      if (sel.length) ficha.conf.elecciones[gid] = sel; else delete ficha.conf.elecciones[gid];
      recortarElecciones(ficha.id, ficha.conf);
      pintarFicha();
    }
  });
  cuerpoFicha.addEventListener("input", function (e) {
    var gid = e.target.getAttribute("data-texto");
    if (!gid || !ficha) return;
    ficha.conf.textos[gid] = e.target.value;
    pintarPieFicha();
  });
  cuerpoFicha.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b || !ficha) return;
    if (b.hasAttribute("data-copiar")) {
      var base = ficha.conf.armado[+b.getAttribute("data-copiar")];
      ficha.conf.armado.forEach(function (r) {
        Object.keys(base).forEach(function (g) { if (!r[g]) r[g] = base[g]; });
      });
      pintarFicha();
    } else if (b.hasAttribute("data-roll")) {
      ficha.roll = +b.getAttribute("data-roll");
      var primera = accionesRoll(ficha.roll).filter(function (a) { return !a.lleno && !a.directo; })[0];
      ficha.accion = primera ? primera.id : null;
      pintarFicha();
    } else if (b.hasAttribute("data-roll-cerrar")) {
      ficha.roll = null; ficha.accion = null; pintarFicha();
    } else if (b.hasAttribute("data-accion")) {
      var accion = b.getAttribute("data-accion");
      if (accion.indexOf("extra:") === 0) {
        var pe = accion.split(":");
        ficha.conf.cambios.push({ roll: ficha.roll, grupo: pe[1], opcion: pe[2] });
        ficha.roll = null; ficha.accion = null;
      } else {
        ficha.accion = accion;
      }
      pintarFicha();
    } else if (b.hasAttribute("data-elegir")) {
      var partes = ficha.accion.split(":");
      var cambio = { roll: ficha.roll, grupo: partes[1], opcion: b.getAttribute("data-elegir") };
      if (partes[0] === "en") cambio.en = partes[2];
      if (partes[0] === "envoltura") {
        var r = ficha.roll;
        ficha.conf.cambios = ficha.conf.cambios.filter(function (c) { return !(c.roll === r && c.grupo === partes[1]); });
      }
      ficha.conf.cambios.push(cambio);
      ficha.roll = null; ficha.accion = null;
      pintarFicha();
    } else if (b.hasAttribute("data-quitar-cambio")) {
      ficha.conf.cambios.splice(+b.getAttribute("data-quitar-cambio"), 1);
      pintarFicha();
    }
  });
  $("[data-confirmar]").addEventListener("click", confirmarFicha);

  /* ---------- ventana del pedido ---------- */
  var dlgPedido = $("[data-pedido]");
  var cuerpoPedido = $("[data-pedido-cuerpo]");
  var piePedido = $("[data-pedido-pie]");
  var ubicacionMsg = "";

  function lineaHtml(it) {
    var x = PRODUCTOS[it.id];
    var unit = precioUnitario(it.id, it.conf);
    var detalle = detalleConf(it.id, it.conf);
    var editable = personalizable(it.id);
    var conCambios = !!(detalle.length || (it.conf.opcion && x.p.opciones.length > 1));
    return '<li class="linea" data-uid="' + esc(it.uid) + '">' +
      '<div class="linea-cab"><div><h3 class="linea-nombre">' + esc(nombreLinea(it.id)) + (it.conf.opcion ? " <small>· " + esc(it.conf.opcion) + "</small>" : "") + "</h3>" +
      '<p class="linea-unitario">' + plata(unit) + " c/u</p></div>" +
      '<span class="linea-total">' + plata(unit * it.cant) + "</span></div>" +
      (detalle.length ? '<ul class="linea-cambios">' + detalle.map(function (d) {
        return "<li><span>" + esc(d.texto) + "</span>" + (d.cambio != null ? '<button class="quitar" type="button" data-quitar-linea="' + d.cambio + '" aria-label="Quitar: ' + esc(d.texto) + '">' + icono("x") + "</button>" : "") + "</li>";
      }).join("") + "</ul>" : "") +
      (editable ? '<button class="linea-editar" type="button" data-editar>' + (conCambios ? "Editar" : "Personalizar") + "</button>" : "") +
      '<div class="linea-pie"><div class="cantidad">' +
        '<button type="button" data-menos aria-label="' + (it.cant === 1 ? "Quitar " : "Uno menos de ") + esc(x.p.nombre) + '">−</button>' +
        '<span aria-live="polite">' + it.cant + "</span>" +
        '<button type="button" data-mas aria-label="Uno más de ' + esc(x.p.nombre) + '">+</button></div>' +
        '<label class="campo"><span>¿Algo que debamos saber?</span>' +
        '<input type="text" data-nota maxlength="140" placeholder="Deja una nota (opcional)" value="' + esc(it.nota) + '"></label>' +
      "</div></li>";
  }
  var cuponMsg = "";
  function cuponHtml() {
    var hay = (C.cupones || []).some(function (c) { return c && c.codigo && c.activo !== false; });
    if (pedido.cupon) {
      var c = cuponActual();
      var e = evaluarCupon(c);
      return '<div class="cupon-pedido' + (e.ok ? " ok" : "") + '"><div><b>' + icono("cupon") + esc(pedido.cupon) + "</b>" +
        "<span>" + esc(e.ok ? nombreCupon(c) + ": −" + plata(e.descuento) : e.motivo) + "</span></div>" +
        '<button type="button" data-quitar-cupon aria-label="Quitar el cupón ' + esc(pedido.cupon) + '">Quitar</button></div>';
    }
    if (!hay) return "";
    return '<div class="campo"><label class="campo-titulo" for="cupon-codigo">¿Tienes un cupón?</label><div class="cupon-fila">' +
      '<input type="text" id="cupon-codigo" data-cupon-codigo maxlength="30" autocapitalize="characters" autocomplete="off" spellcheck="false" enterkeyhint="done" placeholder="Escribe el código">' +
      '<button class="cupon-aplicar" type="button" data-aplicar-cupon>Aplicar</button></div>' +
      '<span class="campo-ayuda' + (cuponMsg ? " falta" : "") + '">' + esc(cuponMsg) + "</span></div>";
  }
  function aplicarCupon(cod) {
    var c = cuponDe(cod);
    if (!c || c.activo === false) return { ok: false, motivo: codigo(cod) ? "No encontramos ese cupón. Revisa que esté bien escrito." : "Escribe el código del cupón." };
    pedido.cupon = codigo(c.codigo);
    cuponMsg = "";
    guardarPedido();
    pintarContador(false);
    pintarCupones();
    return { ok: true, c: c };
  }
  function formularioHtml() {
    var html = '<div class="formulario">' + enviadoHtml() + cuponHtml() + (TIENDA.cuentas ? cuentaHtml() : "") +
      '<label class="campo"><span class="campo-titulo">Tu nombre, para el pedido</span>' +
      '<input type="text" data-campo="nombre" autocomplete="given-name" maxlength="60" placeholder="Ej: Ana" value="' + esc(pedido.nombre) + '">' +
      '<span class="campo-ayuda" data-ayuda="nombre"></span></label>';
    if ((TIENDA.correo || TIENDA.online) && !CUENTA && acceso.modo !== "cuenta") {
      html += '<label class="campo"><span class="campo-titulo">Tu correo <small>' + (pedido.pago === "Online" ? "(para el comprobante y el aviso)" : "(opcional)") + "</small></span>" +
        '<input type="email" data-campo="email" autocomplete="email" inputmode="email" maxlength="120" placeholder="tucorreo@ejemplo.cl" value="' + esc(pedido.email) + '">' +
        '<span class="campo-ayuda" data-ayuda="email"></span></label>';
    }
    var ss = sucursales();
    if (ss.length > 1) {
      html += '<fieldset class="campo"><legend class="campo-titulo">¿A qué sucursal pides?</legend><div class="dos">' +
        ss.map(function (s) {
          var sel = pedido.sucursal === s.nombre;
          return '<label class="radio-tarjeta' + (sel ? " sel" : "") + '"><input type="radio" name="sucursal" value="' + esc(s.nombre) + '"' + (sel ? " checked" : "") + "> " + esc(s.nombre) + "</label>";
        }).join("") +
        '</div><span class="campo-ayuda" data-ayuda="sucursal"></span></fieldset>';
    }
    var valor = typeof N.valorDelivery === "number" ? " · " + plata(N.valorDelivery) : "";
    html += '<fieldset class="campo"><legend class="campo-titulo">¿Retiras o te lo llevamos?</legend><div class="dos">' +
        '<label class="radio-tarjeta' + (pedido.modo === "retiro" ? " sel" : "") + '"><input type="radio" name="modo" value="retiro"' + (pedido.modo === "retiro" ? " checked" : "") + "> Retiro en el local</label>" +
        '<label class="radio-tarjeta' + (pedido.modo === "delivery" ? " sel" : "") + '"><input type="radio" name="modo" value="delivery"' + (pedido.modo === "delivery" ? " checked" : "") + "> Delivery" + esc(valor) + "</label>" +
      "</div></fieldset>";
    var suc = sucursalElegida();
    if (pedido.modo === "retiro" && suc) {
      html += '<div class="retiro-info"><b>Retiras en la sucursal ' + esc(suc.nombre) + "</b>" +
        "<span>" + esc(suc.direccion ? suc.direccion + (N.ciudad ? ", " + N.ciudad : "") : "Te confirmamos la dirección y la hora de retiro por WhatsApp.") + "</span>" +
        (suc.mapa || suc.direccion ? '<a href="' + esc(suc.mapa || "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent([suc.direccion, N.ciudad, "Chile"].filter(Boolean).join(", "))) + '" target="_blank" rel="noopener">Ver cómo llegar</a>' : "") + "</div>";
    } else if (pedido.modo === "retiro") {
      html += '<div class="retiro-info">' + (N.direccion
        ? "<b>Retiras en " + esc(direccionCompleta()) + "</b>" + (CON_HORARIO ? "<span>" + esc(horarioCorto()) + (HORARIO_ACTIVO ? "" : " (por confirmar)") + "</span>" : "")
        : "<b>Retiro en el local</b><span>Te confirmamos la dirección y la hora de retiro por WhatsApp.</span>") +
        (N.mapa ? '<a href="' + esc(N.mapa) + '" target="_blank" rel="noopener">Ver cómo llegar</a>' : "") + "</div>";
    } else {
      var guardadas = CUENTA && perfil && perfil.perfil && perfil.perfil.direcciones || [];
      html += '<div class="campo"><label class="campo-titulo" for="direccion-entrega">Dirección de entrega</label>' +
        (guardadas.length ? '<div class="direcciones-guardadas"><span>Tus direcciones:</span>' + guardadas.map(function (d, i) {
          return '<button type="button" data-direccion-guardada="' + i + '">' + esc(d.texto) + "</button>";
        }).join("") + "</div>" : "") +
        '<div class="direccion-caja"><input type="text" id="direccion-entrega" data-campo="direccion" autocomplete="off" maxlength="160" placeholder="Ej: Avenida San Luis 1234" value="' + esc(pedido.direccion) + '"' +
        ' role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="sugerencias-direccion">' +
        '<ul class="sugerencias" id="sugerencias-direccion" role="listbox" data-sugerencias hidden></ul></div>' +
        '<span class="campo-ayuda" data-ayuda="direccion"></span></div>' +
        '<div class="campo"><button class="ubicacion-boton" type="button" data-ubicacion>' + icono("ubicacion") + (pedido.ubicacionDe === "gps" ? "Actualizar mi ubicación" : "Usar mi ubicación actual") + "</button>" +
        '<span class="ubicacion-estado" data-ubicacion-estado></span></div>';
    }
    html += pagoHtml();
    if (pedido.pago === "Transferencia" && N.datosTransferencia) html += '<p class="transferencia">' + esc(N.datosTransferencia) + "</p>";
    return html + "</div>";
  }
  function faltaPedido() {
    if (TIENDA.cuentas && acceso.modo === "cuenta" && !CUENTA) return { campo: "acceso", texto: "Termina de iniciar sesión o sigue como invitado", ayuda: "" };
    var noHoy = pedido.items.filter(function (it) { return !disponibleHoy(PRODUCTOS[it.id].p); })[0];
    if (noHoy) return { campo: "items", texto: "«" + PRODUCTOS[noHoy.id].p.nombre + "» es solo los " + diasTexto(PRODUCTOS[noHoy.id].p.dias), ayuda: "" };
    if (!pedido.nombre.trim()) return { campo: "nombre", texto: "Falta tu nombre", ayuda: "Escribe tu nombre para poder enviar el pedido." };
    var correo = CUENTA ? CUENTA.email : pedido.email.trim();
    if (correo && !CUENTA && !EMAIL.test(correo)) return { campo: "email", texto: "Revisa tu correo", ayuda: "Revisa que el correo esté bien escrito, o déjalo vacío." };
    if (sucursales().length > 1 && !sucursalElegida()) return { campo: "sucursal", texto: "Elige tu sucursal", ayuda: "Elige la sucursal: el pedido llega a su WhatsApp." };
    if (pedido.modo === "delivery" && !pedido.direccion.trim()) return { campo: "direccion", texto: "Falta tu dirección de entrega", ayuda: "Escribe tu dirección para poder enviar el pedido." };
    if (!pedido.pago) return { campo: "pago", texto: "Elige cómo pagas", ayuda: "Elige cómo pagas para poder enviar el pedido." };
    if (pedido.pago === "Online") {
      if (!correo) return { campo: "email", texto: "Falta tu correo para pagar online", ayuda: "Para pagar online necesitamos tu correo: ahí te llega el comprobante." };
      if (pedido.modo === "delivery" && (!pedido.ubicacion || fueraDeZona())) {
        return { campo: "direccion", texto: fueraDeZona() ? "Fuera de la zona: paga al recibir" : "Elige tu dirección de la lista",
          ayuda: fueraDeZona() ? "Esta dirección queda fuera de la zona de despacho: el valor se confirma por WhatsApp, así que no se puede pagar online." : "Para pagar online el delivery, elige tu dirección en la lista o usa tu ubicación." };
      }
    }
    return null;
  }
  function pintarAyudas() {
    var falta = faltaPedido();
    var normal = { nombre: "Así sabemos a nombre de quién dejarlo.", direccion: "Escribe tu calle y elígela en la lista: así queda ubicada en el mapa.", pago: "", sucursal: "",
      email: !TIENDA.correo ? "Para el comprobante del pago online." : pedido.modo === "delivery" ? "Te avisamos por correo cuando tu pedido vaya en camino." : "Te avisamos por correo cuando tu pedido esté listo para retirar." };
    $$("[data-ayuda]", cuerpoPedido).forEach(function (el) {
      var campo = el.getAttribute("data-ayuda");
      var mal = falta && falta.campo === campo;
      el.textContent = mal ? falta.ayuda : normal[campo];
      el.classList.toggle("falta", !!mal);
    });
  }
  function pintarPiePedido() {
    if (!pedido.items.length) { piePedido.innerHTML = ""; return; }
    var falta = faltaPedido();
    var sub = subtotal();
    var desc = descuento();
    var delivery = pedido.modo === "delivery";
    var costo = delivery ? costoDelivery() : null;
    var fijo = costo !== null;
    var html = '<div class="totales">';
    if (!desc && !fijo) {
      html += "<div><span>Subtotal referencial" + (delivery ? " (sin delivery)" : "") + "</span><b>" + plata(sub) + "</b></div>";
    } else {
      html += "<div><span>Subtotal</span><span>" + plata(sub) + "</span></div>";
    }
    if (desc) html += '<div class="descuento"><span>Cupón ' + esc(pedido.cupon) + "</span><span>−" + plata(desc) + "</span></div>";
    if (delivery) html += "<div><span>Delivery" + (fijo && N.notaDelivery ? " <small>(" + esc(minus(N.notaDelivery)) + ")</small>" : "") + "</span><span>" + (fijo ? plata(costo) : "Por confirmar") + "</span></div>";
    if (desc || fijo) {
      html += "<div><span>Total referencial" + (delivery && !fijo ? " (sin delivery)" : "") + "</span><b>" + plata(sub - desc + (fijo ? costo : 0)) + "</b></div>";
    }
    var total = sub - desc + (fijo ? costo : 0);
    var online = pedido.pago === "Online";
    html += "</div>" +
      '<p class="pedido-aviso">' + (online ? "Pagas ahora en Flow (Webpay). Te confirmamos el pedido por WhatsApp" + (TIENDA.correo ? " y te avisamos por correo." : ".")
        : "No pagas aquí: pagas " + (delivery ? "al recibir" : "al retirar") + ". Te confirmamos disponibilidad y total por WhatsApp.") +
      (estado.abierto ? "" : " Ahora estamos cerrados: te respondemos apenas abramos.") + "</p>" +
      (envio.msg ? '<p class="pedido-error" role="alert">' + esc(envio.msg) + "</p>" : "");
    if (falta) html += '<button class="boton boton--grande" type="button" aria-disabled="true" data-falta="' + falta.campo + '">' + esc(falta.texto) + "</button>";
    else if (envio.cargando) html += '<button class="boton boton--grande" type="button" aria-disabled="true">' + (online ? "Abriendo el pago…" : "Enviando…") + "</button>";
    else if (online && pagadoYa()) html += '<button class="boton boton--grande" type="button" data-enviar-pedido>Avisar al local por WhatsApp ' + icono("flecha") + "</button>";
    else if (online) html += '<button class="boton boton--grande" type="button" data-pagar-online>Pagar ' + plata(total) + " online " + icono("flecha") + "</button>";
    else if (TIENDA.pedidos) html += '<button class="boton boton--grande" type="button" data-enviar-pedido>' + (enviadoVigente() ? "Volver a enviar por WhatsApp " : "Enviar pedido por WhatsApp ") + icono("flecha") + "</button>";
    else html += '<a class="boton boton--grande" href="' + esc(wsp(mensaje())) + '" target="_blank" rel="noopener" data-enviar>Enviar pedido por WhatsApp ' + icono("flecha") + "</a>";
    piePedido.innerHTML = html;
  }
  function pintarPedido() {
    var n = cantidadTotal();
    $("[data-pedido-cuenta]").textContent = n ? "(" + n + ")" : "";
    if (!pedido.items.length) {
      cuerpoPedido.innerHTML = (enviado ? '<div class="formulario">' + enviadoHtml() + "</div>" : "") +
        '<div class="vacio"><b>Tu pedido está vacío.</b><span>Elige algo de la carta y aparecerá aquí.</span>' +
        '<a class="boton" href="#carta" data-ir-carta>Ver la carta ' + icono("flecha") + "</a></div>";
      pintarPiePedido();
      return;
    }
    var scroll = cuerpoPedido.scrollTop;
    cuerpoPedido.innerHTML = '<ul class="lineas">' + pedido.items.map(lineaHtml).join("") + "</ul>" +
      '<button class="pedido-vaciar" type="button" data-vaciar>Vaciar pedido</button>' + formularioHtml();
    cuerpoPedido.scrollTop = scroll;
    pintarUbicacion();
    pintarAyudas();
    pintarPiePedido();
  }
  function itemDe(el) {
    var li = el.closest("[data-uid]");
    var uid = li && li.getAttribute("data-uid");
    return pedido.items.filter(function (it) { return it.uid === uid; })[0];
  }
  function cambioPedido() { guardarPedido(); pintarContador(false); pintarPedido(); }

  cuerpoPedido.addEventListener("click", function (e) {
    var el = e.target.closest("button, a");
    if (!el) return;
    var it = itemDe(el);
    if (el.hasAttribute("data-mas") && it) { it.cant = Math.min(99, it.cant + 1); cambioPedido(); }
    else if (el.hasAttribute("data-menos") && it) {
      it.cant -= 1;
      if (it.cant < 1) pedido.items = pedido.items.filter(function (x) { return x !== it; });
      cambioPedido();
    } else if (el.hasAttribute("data-quitar-linea") && it) {
      it.conf.cambios.splice(+el.getAttribute("data-quitar-linea"), 1);
      cambioPedido();
    } else if (el.hasAttribute("data-editar") && it) {
      abrirFicha(it.id, it.uid);
    } else if (el.hasAttribute("data-vaciar")) {
      // se confirma con un segundo toque, sin ventanas del navegador
      if (el.getAttribute("data-vaciar") === "seguro") { pedido.items = []; cambioPedido(); return; }
      el.setAttribute("data-vaciar", "seguro");
      el.textContent = "Toca otra vez para vaciar el pedido";
      setTimeout(function () {
        if (el.isConnected) { el.setAttribute("data-vaciar", ""); el.textContent = "Vaciar pedido"; }
      }, 4000);
    } else if (el.hasAttribute("data-ir-carta")) {
      cerrar(dlgPedido);
    } else if (el.hasAttribute("data-ubicacion")) {
      pedirUbicacion();
    } else if (el.hasAttribute("data-direccion-guardada")) {
      var dg = perfil.perfil.direcciones[+el.getAttribute("data-direccion-guardada")];
      if (dg) { pedido.direccion = dg.texto; pedido.ubicacion = dg.ubicacion || null; pedido.ubicacionDe = dg.ubicacion ? "lista" : ""; cambioPedido(); }
    } else if (el.hasAttribute("data-acceso")) {
      accionAcceso(el.getAttribute("data-acceso"));
    } else if (el.hasAttribute("data-estado-actualizar")) {
      actualizarEnviado(true);
    } else if (el.hasAttribute("data-otro-pedido")) {
      pedido.items = []; enviado = null; guardar(ENVIADO, null); cambioPedido();
    } else if (el.hasAttribute("data-wsp-enviado")) {
      e.preventDefault();
      abrirWhatsapp(wsp(mensaje(enviado)));
    } else if (el.hasAttribute("data-aplicar-cupon")) {
      var r = aplicarCupon($("[data-cupon-codigo]", cuerpoPedido).value);
      if (!r.ok) cuponMsg = r.motivo;
      pintarPedido();
      if (!r.ok) $("[data-cupon-codigo]", cuerpoPedido).focus();
    } else if (el.hasAttribute("data-quitar-cupon")) {
      pedido.cupon = "";
      cambioPedido();
      pintarCupones();
    }
  });
  cuerpoPedido.addEventListener("input", function (e) {
    var t = e.target;
    if (t.hasAttribute("data-nota")) {
      var it = itemDe(t);
      if (it) it.nota = t.value;
    } else if (t.getAttribute("data-campo")) {
      pedido[t.getAttribute("data-campo")] = t.value;
      if (t.getAttribute("data-campo") === "direccion") escribioDireccion(t);
      pintarAyudas();
    } else if (t.hasAttribute("data-acceso-email") || t.hasAttribute("data-acceso-cod")) {
      if (t.hasAttribute("data-acceso-email")) acceso.email = t.value; else acceso.codigo = t.value;
      return;
    } else return;
    guardarPedido();
    pintarPiePedido();
  });
  cuerpoPedido.addEventListener("change", function (e) {
    var t = e.target;
    if (t.name === "modo") { pedido.modo = t.value; if (pedido.pago && pedido.pago !== "Online" && pagosDisponibles().indexOf(pedido.pago) < 0) pedido.pago = ""; cambioPedido(); }
    else if (t.name === "acceso-modo") { acceso.modo = t.value; acceso.msg = ""; pintarPedido(); }
    else if (t.name === "sucursal") { pedido.sucursal = t.value; cambioPedido(); pintarDatos(); }
    else if (t.name === "pago") { pedido.pago = t.value; cambioPedido(); }
  });
  cuerpoPedido.addEventListener("keydown", function (e) {
    var t = e.target;
    if (t.getAttribute("data-campo") === "direccion") { teclaDireccion(e); return; }
    if (e.key !== "Enter") return;
    if (t.hasAttribute("data-acceso-email")) { e.preventDefault(); accionAcceso("codigo"); return; }
    if (t.hasAttribute("data-acceso-cod")) { e.preventDefault(); accionAcceso("entrar"); return; }
    if (!t.hasAttribute("data-cupon-codigo")) return;
    e.preventDefault();
    $("[data-aplicar-cupon]", cuerpoPedido).click();
  });
  // las sugerencias se eligen con mousedown, antes de que el campo pierda el foco
  cuerpoPedido.addEventListener("mousedown", function (e) {
    var li = e.target.closest("[data-sugerencia]");
    if (!li) return;
    e.preventDefault();
    elegirSugerencia(+li.getAttribute("data-sugerencia"));
  });
  cuerpoPedido.addEventListener("focusout", function (e) {
    if (e.target.getAttribute("data-campo") === "direccion") setTimeout(cerrarSugerencias, 150);
  });
  piePedido.addEventListener("click", function (e) {
    if (e.target.closest("[data-enviar-pedido]")) { enviarPedido(false); return; }
    if (e.target.closest("[data-pagar-online]")) { enviarPedido(true); return; }
    var b = e.target.closest("[data-falta]");
    if (!b) return;
    var campo = b.getAttribute("data-falta");
    var input = campo === "acceso" ? $("[data-acceso-email], [data-acceso-cod], input[name=\"acceso-modo\"]", cuerpoPedido)
      : campo === "items" ? $(".lineas", cuerpoPedido)
      : $(campo === "pago" || campo === "sucursal" ? 'input[name="' + campo + '"]' : '[data-campo="' + campo + '"]', cuerpoPedido);
    if (input) { input.scrollIntoView({ block: "center", behavior: "smooth" }); input.focus({ preventScroll: true }); }
  });

  function pedirUbicacion() {
    var estadoEl = $("[data-ubicacion-estado]", cuerpoPedido);
    if (!navigator.geolocation) {
      ubicacionMsg = "Tu navegador no permite compartir la ubicación. Escribe la dirección y elígela en la lista.";
      pintarUbicacion();
      return;
    }
    if (estadoEl) estadoEl.textContent = "Buscando tu ubicación…";
    navigator.geolocation.getCurrentPosition(function (pos) {
      pedido.ubicacion = { lat: +pos.coords.latitude.toFixed(6), lng: +pos.coords.longitude.toFixed(6) };
      pedido.ubicacionDe = "gps";
      ubicacionMsg = "";
      guardarPedido();
      pintarPedido();
      // si no escribió la dirección, se completa con la de su ubicación
      if (!pedido.direccion.trim()) {
        buscarJson(BUSCADOR_REVERSO + "?lat=" + pedido.ubicacion.lat + "&lon=" + pedido.ubicacion.lng, function (r) {
          var f = r && r.features && r.features[0];
          if (!f || pedido.direccion.trim()) return;
          pedido.direccion = sugerenciaDe(f, "").texto;
          guardarPedido();
          pintarPedido();
        });
      }
    }, function () {
      ubicacionMsg = "No pudimos obtener tu ubicación. Escribe la dirección y elígela en la lista.";
      pintarUbicacion();
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 });
  }

  /* ---------- cuenta, aviso por correo, dirección y pago online ----------
     Funcionan si el servidor del pedido está configurado (api/pedidos.js); si no, el pedido va solo por
     WhatsApp, como siempre. */
  var TIENDA = { pedidos: false, correo: false, cuentas: false, online: false };
  var API_PEDIDOS = "api/pedidos";
  var SESION = "cuenta-v1";
  var ENVIADO = "pedido-enviado-v1";
  var EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  var CUENTA = null;                 // { email, token }
  var perfil = null;                 // { perfil: { nombre, direcciones }, pedidos: [...] }
  var acceso = { modo: "invitado", paso: "email", email: "", codigo: "", msg: "", cargando: false };
  var enviado = leer(ENVIADO);       // el último pedido registrado: { id, numero, clave, firma, estado… }
  var envio = { cargando: false, msg: "" };

  function llamar(datos, listo) {
    var x = new XMLHttpRequest();
    x.open("POST", API_PEDIDOS);
    x.setRequestHeader("Content-Type", "application/json");
    x.timeout = 20000;
    x.onload = function () { var r = null; try { r = JSON.parse(x.responseText); } catch (e) {} listo(x.status, r || {}); };
    x.onerror = x.ontimeout = function () { listo(0, {}); };
    x.send(JSON.stringify(datos));
  }

  /* inicio o invitado */
  function cuentaHtml() {
    if (CUENTA) {
      var pp = perfil && perfil.pedidos || [];
      return '<div class="cuenta"><div class="cuenta-fila"><div><b>Hola' + (perfil && perfil.perfil && perfil.perfil.nombre ? ", " + esc(perfil.perfil.nombre) : "") + "</b>" +
        "<span>" + esc(CUENTA.email) + "</span></div>" + '<button type="button" class="enlace" data-acceso="salir">Cerrar sesión</button></div>' +
        (pp.length ? '<ul class="mis-pedidos">' + pp.slice(0, 3).map(function (x) {
          return "<li><b>N° " + esc(x.numero) + "</b> <span>" + esc(x.estadoTexto) + "</span> <small>" + plata(x.total) + "</small></li>";
        }).join("") + "</ul>" : "") + "</div>";
    }
    var html = '<fieldset class="campo"><legend class="campo-titulo">¿Cómo quieres seguir?</legend><div class="dos">' +
      '<label class="radio-tarjeta' + (acceso.modo === "invitado" ? " sel" : "") + '"><input type="radio" name="acceso-modo" value="invitado"' + (acceso.modo === "invitado" ? " checked" : "") + "> Como invitado</label>" +
      '<label class="radio-tarjeta' + (acceso.modo === "cuenta" ? " sel" : "") + '"><input type="radio" name="acceso-modo" value="cuenta"' + (acceso.modo === "cuenta" ? " checked" : "") + "> Iniciar sesión</label></div>";
    if (acceso.modo === "cuenta") {
      if (acceso.paso === "email") {
        html += '<p class="campo-ayuda">Te mandamos un código a tu correo, sin contraseñas. Guardamos tu nombre, tus direcciones y tus pedidos.</p>' +
          '<div class="cupon-fila"><input type="email" data-acceso-email autocomplete="email" inputmode="email" maxlength="120" placeholder="tucorreo@ejemplo.cl" value="' + esc(acceso.email) + '">' +
          '<button class="cupon-aplicar" type="button" data-acceso="codigo"' + (acceso.cargando ? " disabled" : "") + ">" + (acceso.cargando ? "Enviando…" : "Enviarme un código") + "</button></div>";
      } else {
        html += '<p class="campo-ayuda">Te mandamos un código de 6 números a <b>' + esc(acceso.email) + "</b>. Revisa también la carpeta de spam.</p>" +
          '<div class="cupon-fila"><input type="text" data-acceso-cod inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="123456" value="' + esc(acceso.codigo) + '">' +
          '<button class="cupon-aplicar" type="button" data-acceso="entrar"' + (acceso.cargando ? " disabled" : "") + ">" + (acceso.cargando ? "Entrando…" : "Entrar") + "</button></div>" +
          '<button type="button" class="enlace" data-acceso="volver">Usar otro correo</button>';
      }
      if (acceso.msg) html += '<span class="campo-ayuda falta" role="alert">' + esc(acceso.msg) + "</span>";
    }
    return html + "</fieldset>";
  }
  function guardarSesion(c) { CUENTA = c; try { if (c) localStorage.setItem(SESION, JSON.stringify(c)); else localStorage.removeItem(SESION); } catch (e) {} }
  function usarPerfil(r) {
    perfil = { perfil: r.perfil || {}, pedidos: r.pedidos || [] };
    if (!pedido.nombre.trim() && perfil.perfil.nombre) pedido.nombre = perfil.perfil.nombre;
  }
  function accionAcceso(que) {
    if (que === "salir") { guardarSesion(null); perfil = null; acceso = { modo: "invitado", paso: "email", email: "", codigo: "", msg: "", cargando: false }; pintarPedido(); return; }
    if (que === "volver") { acceso.paso = "email"; acceso.codigo = ""; acceso.msg = ""; pintarPedido(); return; }
    if (que === "codigo") {
      if (!EMAIL.test(acceso.email.trim())) { acceso.msg = "Revisa que el correo esté bien escrito."; pintarPedido(); return; }
      acceso.cargando = true; acceso.msg = ""; pintarPedido();
      llamar({ accion: "codigo", email: acceso.email.trim(), local: N.nombre }, function (st, r) {
        acceso.cargando = false;
        if (st === 200) { acceso.paso = "codigo"; acceso.codigo = ""; }
        else acceso.msg = st === 429 ? "Ya te mandamos varios códigos. Espera unos minutos o sigue como invitado." : "No pudimos mandar el código. Revisa el correo o sigue como invitado.";
        pintarPedido();
        var c = $("[data-acceso-cod]", cuerpoPedido); if (c) c.focus();
      });
      return;
    }
    if (que === "entrar") {
      var cod = acceso.codigo.replace(/\D/g, "");
      if (cod.length !== 6) { acceso.msg = "El código tiene 6 números."; pintarPedido(); return; }
      acceso.cargando = true; acceso.msg = ""; pintarPedido();
      llamar({ accion: "entrar", email: acceso.email.trim(), codigo: cod }, function (st, r) {
        acceso.cargando = false;
        if (st === 200 && r.token) {
          guardarSesion({ email: acceso.email.trim().toLowerCase(), token: r.token });
          usarPerfil(r);
          acceso.modo = "invitado"; acceso.paso = "email";
          guardarPedido();
        } else acceso.msg = r.error === "vencido" ? "El código venció. Pide uno nuevo." : "El código no coincide. Revísalo e inténtalo de nuevo.";
        pintarPedido();
      });
    }
  }
  function cargarPerfil() {
    if (!CUENTA) return;
    llamar({ accion: "perfil", token: CUENTA.token }, function (st, r) {
      if (st === 401) { guardarSesion(null); perfil = null; }
      else if (st === 200) usarPerfil(r);
      if (dlgPedido.open) pintarPedido();
    });
  }

  /* el pedido registrado: número y estado */
  function firmaPedido() {
    return JSON.stringify([pedido.items.map(function (it) { return [it.id, it.cant, claveConf(it.conf), it.nota]; }), pedido.modo, pedido.sucursal, pedido.direccion, pedido.pago, pedido.cupon]);
  }
  function enviadoVigente() { return enviado && enviado.firma === firmaPedido() && pedido.items.length; }
  // el mismo pedido ya se pagó online: no se vuelve a cobrar, solo se avisa al local
  function pagadoYa() { return !!(enviadoVigente() && enviado.pago && enviado.pago.estado === "pagado"); }
  function enviadoHtml() {
    if (!enviado) return "";
    var e = enviado;
    var pagado = e.pago && e.pago.estado === "pagado";
    var rechazado = e.pago && (e.pago.estado === "rechazado" || e.pago.estado === "anulado");
    var titulo = rechazado ? "El pago no se completó" : pagado ? "¡Pago recibido! Pedido N° " + e.numero : "Pedido N° " + e.numero;
    var texto = rechazado ? "No se cobró nada. Puedes intentar de nuevo o elegir pagar al " + (e.modo === "delivery" ? "recibir." : "retirar.")
      : e.pago && e.pago.metodo === "Online" && !pagado ? "Estamos esperando la confirmación del pago."
      : (e.estadoTexto ? "Estado: " + e.estadoTexto + "." : "") + (e.email ? " Te avisaremos a " + e.email + " cuando " + (e.modo === "delivery" ? "vaya en camino." : "esté listo para retirar.") : "");
    return '<div class="pedido-enviado' + (rechazado ? " mal" : pagado ? " ok" : "") + '" role="status"><b>' + esc(titulo) + "</b><span>" + esc(texto) + "</span>" +
      '<div class="pedido-enviado-acciones">' +
        (pagado && !e.avisado ? '<a class="boton" href="#" data-wsp-enviado>Avisar al local por WhatsApp ' + icono("flecha") + "</a>" : "") +
        '<button type="button" class="enlace" data-estado-actualizar>Actualizar estado</button>' +
        (pedido.items.length && !rechazado ? '<button type="button" class="enlace" data-otro-pedido>Hacer otro pedido</button>' : "") +
      "</div></div>";
  }
  function actualizarEnviado(pintar) {
    if (!enviado || !TIENDA.pedidos) return;
    llamar({ accion: "estado", id: enviado.id, clave: enviado.clave, token: CUENTA && CUENTA.token }, function (st, r) {
      if (st === 200 && r.pedido) {
        enviado.estadoTexto = r.pedido.estadoTexto; enviado.pago = r.pedido.pago; enviado.modo = r.pedido.modo; enviado.total = r.pedido.total;
        guardar(ENVIADO, enviado);
      }
      if (pintar !== false && dlgPedido.open) pintarPedido();
    });
  }

  /* formas de pago */
  function pagosDisponibles() {
    var l = pedido.modo === "delivery" ? N.pagosDelivery : N.pagosRetiro;
    return l && l.length ? l : N.pagos && N.pagos.length ? N.pagos : ["Efectivo", "Transferencia"];
  }
  function pagoHtml() {
    if (pedido.pago === "Online" && !TIENDA.online) pedido.pago = "";
    var cuando = pedido.modo === "delivery" ? "al recibir" : "al retirar";
    var radio = function (v, t, sub) {
      var sel = pedido.pago === v;
      return '<label class="radio-tarjeta' + (sel ? " sel" : "") + (sub ? " radio-tarjeta--doble" : "") + '"><input type="radio" name="pago" value="' + esc(v) + '"' + (sel ? " checked" : "") + "> " +
        (sub ? "<span><b>" + esc(t) + "</b><small>" + esc(sub) + "</small></span>" : esc(t)) + "</label>";
    };
    return '<fieldset class="campo"><legend class="campo-titulo">¿Cómo pagas?</legend>' +
      (TIENDA.online ? radio("Online", "Pagar online ahora", "Webpay: tarjeta de débito, crédito o prepago") + '<p class="pagos-o">o paga ' + cuando + ":</p>" : "") +
      '<div class="dos">' + pagosDisponibles().map(function (m) { return radio(m, m); }).join("") + "</div>" +
      '<span class="campo-ayuda" data-ayuda="pago"></span></fieldset>';
  }

  /* delivery: zona de despacho y valor */
  function dentro(u, poligono) {
    var si = false;
    for (var i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
      var a = poligono[i], b = poligono[j];
      if ((a[1] > u.lng) !== (b[1] > u.lng) && u.lat < (b[0] - a[0]) * (u.lng - a[1]) / (b[1] - a[1]) + a[0]) si = !si;
    }
    return si;
  }
  function zona() { var z = N.zonaDelivery; return z && z.poligono && z.poligono.length > 2 ? z : null; }
  function fueraDeZona() { var z = zona(); return !!(pedido.modo === "delivery" && pedido.ubicacion && z && !dentro(pedido.ubicacion, z.poligono)); }
  function costoDelivery() { return typeof N.valorDelivery === "number" && !fueraDeZona() ? N.valorDelivery : null; }
  function pintarUbicacion() {
    var el = $("[data-ubicacion-estado]", cuerpoPedido);
    if (!el) return;
    var z = zona(), u = pedido.ubicacion;
    var mapa = u ? ' <a href="https://www.google.com/maps/search/?api=1&query=' + u.lat + "," + u.lng + '" target="_blank" rel="noopener">Ver en Google Maps</a>' : "";
    el.className = "ubicacion-estado" + (u ? (fueraDeZona() ? " fuera" : " ok") : "");
    el.innerHTML = u
      ? (fueraDeZona() ? "Esta dirección queda fuera del " + esc(z.nombre || "sector de despacho") + ": el valor del delivery se confirma por WhatsApp."
        : (pedido.ubicacionDe === "gps" ? "Usamos tu ubicación actual" : "Dirección ubicada en el mapa") + (z ? ", dentro del " + esc(z.nombre || "sector de despacho") : "") + ".") + mapa
      : esc(ubicacionMsg || "Elige tu dirección en la lista o usa tu ubicación: así el repartidor llega directo." +
        (z && typeof N.valorDelivery === "number" ? " Delivery " + plata(N.valorDelivery) + " en el " + (z.nombre || "sector de despacho") + "." : ""));
  }

  /* sugerencias de direcciones (OpenStreetMap, con Photon) cerca del local */
  var BUSCADOR = "https://photon.komoot.io/api/";
  var BUSCADOR_REVERSO = "https://photon.komoot.io/reverse";
  var sug = { lista: [], activa: -1, timer: 0, pedido: null, cache: {}, texto: "" };
  function buscarJson(url, listo) {
    if (sug.pedido) sug.pedido.abort();
    var x = new XMLHttpRequest();
    sug.pedido = x;
    x.open("GET", url);
    x.timeout = 8000;
    x.onload = function () { sug.pedido = null; var r = null; try { r = JSON.parse(x.responseText); } catch (e) {} listo(r); };
    x.onerror = x.ontimeout = function () { sug.pedido = null; listo(null); };
    x.send();
  }
  function centroZona() {
    var z = zona();
    if (N.mapaCentro) return N.mapaCentro;
    if (!z) return null;
    var la = 0, ln = 0;
    z.poligono.forEach(function (p) { la += p[0]; ln += p[1]; });
    return { lat: la / z.poligono.length, lng: ln / z.poligono.length };
  }
  function sugerenciaDe(f, escrito) {
    var pr = f.properties || {};
    var c = f.geometry && f.geometry.coordinates || [];
    var calle = pr.street || pr.name || "";
    var num = pr.housenumber || "";
    var escritoNum = (String(escrito).match(/\b\d{1,5}\b/) || [""])[0];
    if (!num && escritoNum && (pr.type === "street" || pr.osm_key === "highway")) num = escritoNum;
    var principal = (pr.housenumber || pr.type === "street" || pr.osm_key === "highway" ? calle : pr.name || calle) + (num ? " " + num : "");
    var zonas = [];
    [pr.district, pr.locality, pr.city || pr.county].forEach(function (v) { if (v && zonas.indexOf(v) < 0 && v !== principal) zonas.push(v); });
    return { principal: principal, zona: zonas.join(", "), texto: principal + (zonas.length ? ", " + zonas[zonas.length - 1] : ""), ubicacion: { lat: +(+c[1]).toFixed(6), lng: +(+c[0]).toFixed(6) } };
  }
  function escribioDireccion(input) {
    if (pedido.ubicacionDe === "lista") { pedido.ubicacion = null; pedido.ubicacionDe = ""; pintarUbicacion(); pintarPiePedido(); }
    clearTimeout(sug.timer);
    var q = input.value.trim();
    if (q.length < 4) { cerrarSugerencias(); return; }
    sug.timer = setTimeout(function () { buscarDirecciones(q); }, 280);
  }
  function buscarDirecciones(q) {
    var cz = centroZona();
    var z = zona();
    var url = BUSCADOR + "?limit=8&q=" + encodeURIComponent(q) + (cz ? "&lat=" + cz.lat + "&lon=" + cz.lng : "");
    if (z) {
      var la = z.poligono.map(function (p) { return p[0]; }), ln = z.poligono.map(function (p) { return p[1]; });
      url += "&bbox=" + [Math.min.apply(0, ln) - 0.08, Math.min.apply(0, la) - 0.08, Math.max.apply(0, ln) + 0.08, Math.max.apply(0, la) + 0.08].join(",");
    }
    var listo = function (r) {
      sug.cache[url] = r;
      var vistos = {};
      sug.lista = (r && r.features || []).map(function (f) { return sugerenciaDe(f, q); })
        .filter(function (x) { var k = x.texto.toLowerCase(); if (!x.principal || vistos[k]) return false; vistos[k] = 1; return true; }).slice(0, 6);
      sug.activa = -1;
      pintarSugerencias();
    };
    if (sug.cache[url]) listo(sug.cache[url]); else buscarJson(url, listo);
  }
  function pintarSugerencias() {
    var ul = $("[data-sugerencias]", cuerpoPedido), input = $('[data-campo="direccion"]', cuerpoPedido);
    if (!ul || !input) return;
    ul.hidden = !sug.lista.length;
    input.setAttribute("aria-expanded", String(!!sug.lista.length));
    ul.innerHTML = sug.lista.map(function (x, i) {
      return '<li role="option" id="sug-' + i + '" data-sugerencia="' + i + '" aria-selected="' + (i === sug.activa) + '">' + icono("ubicacion") +
        "<span><b>" + esc(x.principal) + "</b>" + (x.zona ? "<small>" + esc(x.zona) + "</small>" : "") + "</span></li>";
    }).join("");
    if (sug.activa >= 0) input.setAttribute("aria-activedescendant", "sug-" + sug.activa); else input.removeAttribute("aria-activedescendant");
  }
  function cerrarSugerencias() { sug.lista = []; sug.activa = -1; pintarSugerencias(); }
  function teclaDireccion(e) {
    if (!sug.lista.length) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      sug.activa = (sug.activa + (e.key === "ArrowDown" ? 1 : -1) + sug.lista.length) % sug.lista.length;
      pintarSugerencias();
    } else if (e.key === "Enter" && sug.activa >= 0) { e.preventDefault(); elegirSugerencia(sug.activa); }
    else if (e.key === "Escape") cerrarSugerencias();
  }
  function elegirSugerencia(i) {
    var x = sug.lista[i];
    if (!x) return;
    pedido.direccion = x.texto;
    pedido.ubicacion = x.ubicacion;
    pedido.ubicacionDe = "lista";
    ubicacionMsg = "";
    cerrarSugerencias();
    guardarPedido();
    pintarPedido();
  }

  /* enviar: se registra el pedido (número para el aviso) y se abre WhatsApp o el pago online */
  function datosPedido() {
    var costo = pedido.modo === "delivery" ? costoDelivery() : null;
    return {
      nombre: pedido.nombre.trim(), email: CUENTA ? CUENTA.email : pedido.email.trim(), sucursal: pedido.sucursal,
      modo: pedido.modo, direccion: pedido.direccion.trim(), ubicacion: pedido.modo === "delivery" ? pedido.ubicacion : null,
      pago: pedido.pago, cupon: pedido.cupon,
      items: pedido.items.map(function (it) { return { id: it.id, cant: it.cant, conf: it.conf, nota: it.nota }; }),
      total: subtotal() - descuento() + (costo || 0)
    };
  }
  function abrirWhatsapp(url, ventana) {
    if (ventana && !ventana.closed) { ventana.location.href = url; return; }
    // sin "noopener": con esa opción window.open siempre devuelve null y no se sabría si se abrió
    var w = window.open(url, "_blank");
    if (w) { try { w.opener = null; } catch (e) {} }
    else location.href = url;
  }
  function enviarPedido(online) {
    if (envio.cargando || faltaPedido()) return;
    if (enviadoVigente() && (!online || pagadoYa())) { abrirWhatsapp(wsp(mensaje(enviado))); return; }
    // la pestaña de WhatsApp se abre ahora (al tocar), porque después del envío el navegador la bloquearía
    var ventana = online ? null : window.open("", "_blank");
    envio = { cargando: true, msg: "" };
    pintarPiePedido();
    llamar({ accion: "crear", pedido: datosPedido(), token: CUENTA && CUENTA.token }, function (st, r) {
      envio.cargando = false;
      if (st === 200 && r.id) {
        enviado = { id: r.id, numero: r.numero, clave: r.clave, firma: firmaPedido(), modo: pedido.modo, total: r.total,
          email: CUENTA ? CUENTA.email : pedido.email.trim(), estadoTexto: online ? "" : "Recibido", pago: { metodo: pedido.pago, estado: online ? "pendiente" : "" } };
        guardar(ENVIADO, enviado);
        if (online) { location.href = r.pagoUrl; return; }
        abrirWhatsapp(wsp(mensaje(enviado)), ventana);
        if (CUENTA) cargarPerfil();
        pintarPedido();
        return;
      }
      if (st === 0 || st >= 500 && !r.motivo) {
        // sin conexión con el servidor: el pedido igual va por WhatsApp (sin número)
        if (online) envio.msg = "No pudimos abrir el pago online. Revisa tu conexión o elige pagar " + (pedido.modo === "delivery" ? "al recibir." : "al retirar.");
        else abrirWhatsapp(wsp(mensaje()), ventana);
      } else {
        if (ventana) ventana.close();
        envio.msg = r.motivo || "No pudimos enviar el pedido. Inténtalo de nuevo.";
      }
      pintarPiePedido();
    });
  }
  function revisarTienda() {
    if (!/^https?:$/.test(location.protocol) || PREVIA) return;
    var x = new XMLHttpRequest();
    x.open("GET", API_PEDIDOS);
    x.onload = function () {
      var r = null; try { r = JSON.parse(x.responseText); } catch (e) {}
      if (x.status !== 200 || !r) return;
      TIENDA = { pedidos: !!r.pedidos, correo: !!r.correo, cuentas: !!r.cuentas, online: !!r.online };
      if (TIENDA.cuentas) { CUENTA = leer(SESION); cargarPerfil(); }
      volverDelPago();
      if (dlgPedido.open) pintarPedido();
    };
    x.send();
  }
  /* vuelta de Flow: ?pedido=ID&c=CLAVE */
  function volverDelPago() {
    var m = /[?&]pedido=(\d+)&c=([\w-]+)/.exec(location.search);
    if (!m) return;
    history.replaceState(null, "", location.pathname + location.hash);
    if (!enviado || String(enviado.id) !== m[1]) enviado = { id: +m[1], clave: m[2], numero: String(m[1]).padStart(4, "0"), firma: firmaPedido() };
    else enviado.clave = m[2];
    llamar({ accion: "estado", id: +m[1], clave: m[2], token: CUENTA && CUENTA.token }, function (st, r) {
      if (st !== 200 || !r.pedido) return;
      var x = r.pedido;
      Object.assign(enviado, { numero: x.numero, estadoTexto: x.estadoTexto, pago: x.pago, modo: x.modo, total: x.total });
      guardar(ENVIADO, enviado);
      pintarPedido();
      abrir(dlgPedido);
    });
  }

  /* ---------- mensaje de WhatsApp ---------- */
  function mensaje(registro) {
    var l = [];
    l.push("Hola, quiero hacer un pedido" + (registro ? " (N° " + registro.numero + ")" : "") + ":");
    l.push("Nombre: " + pedido.nombre.trim());
    var correoAviso = CUENTA ? CUENTA.email : pedido.email.trim();
    if (registro && correoAviso) l.push("Correo para el aviso: " + correoAviso);
    var suc = sucursalElegida();
    if (suc) l.push("Sucursal: " + suc.nombre);
    if (pedido.modo === "retiro" && suc) {
      l.push("Modalidad: Retiro en la sucursal" + (suc.direccion ? " (" + suc.direccion + ")" : ""));
    } else if (pedido.modo === "retiro") {
      l.push("Modalidad: Retiro en el local" + (N.direccion ? " (" + direccionCompleta() + ")" : ""));
    } else {
      l.push("Modalidad: Delivery" + (fueraDeZona() ? " (fuera de la zona de despacho: consultar costo)" : typeof N.valorDelivery === "number" ? "" : " (consultar cobertura y costo)"));
      l.push("Dirección: " + pedido.direccion.trim());
      if (pedido.ubicacion) l.push("Ubicación: https://maps.google.com/?q=" + pedido.ubicacion.lat + "," + pedido.ubicacion.lng);
      var cd = costoDelivery();
      l.push("Delivery: " + (cd !== null ? plata(cd) : fueraDeZona() ? "por confirmar: la dirección queda fuera de la zona de despacho" : "valor " + (N.notaDelivery ? minus(N.notaDelivery) + ", " : "") + "por confirmar (no incluido en el subtotal)"));
    }
    if (pedido.pago) l.push("Pago: " + (pedido.pago === "Online" ? "online" + (registro && registro.pago && registro.pago.estado === "pagado" ? " (pagado)" : "") : pedido.pago + (pedido.modo === "delivery" ? " al recibir" : " al retirar")));
    l.push("");
    pedido.items.forEach(function (it, i) {
      var p = PRODUCTOS[it.id].p;
      var unit = precioUnitario(it.id, it.conf);
      l.push((i + 1) + ") " + it.cant + " × " + nombreLinea(it.id) + " — " + plata(unit * it.cant));
      if (it.cant > 1) l.push("   Precio unitario: " + plata(unit));
      if (it.conf.opcion) l.push("   Opción: " + it.conf.opcion);
      if (p.incluye) l.push("   Incluye: " + p.incluye);
      var rolls = rollsDe(it.id);
      if (rolls.length > 1 && it.conf.cambios.length) {
        rolls.forEach(function (r, k) { if (r.texto) l.push("   Roll " + (k + 1) + ": " + r.texto); });
      }
      detalleConf(it.id, it.conf).forEach(function (d) {
        if (d.cambio == null) l.push("   " + d.texto);
        else if (d.armado) l.push("   " + d.texto);
        else l.push("   Cambio" + (d.roll ? " en roll " + d.roll : "") + ": " + d.solo);
      });
      if (it.nota.trim()) l.push("   Nota: " + it.nota.trim());
    });
    l.push("");
    var sub = subtotal();
    var desc = descuento();
    var costo = pedido.modo === "delivery" ? costoDelivery() : null;
    var fijo = costo !== null;
    if (desc || fijo) {
      l.push("Subtotal: " + plata(sub));
      if (desc) l.push("Cupón " + pedido.cupon + " (" + nombreCupon(cuponActual()) + "): −" + plata(desc));
      if (fijo) l.push("Delivery: " + plata(costo));
      l.push("Total referencial: " + plata(sub - desc + (fijo ? costo : 0)) + (pedido.modo === "delivery" && !fijo ? " + delivery" : ""));
    } else {
      l.push("Subtotal referencial: " + plata(sub));
    }
    l.push("¿Me confirman disponibilidad, precio vigente y total?");
    return l.join("\n");
  }

  /* ---------- eventos generales ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("button, a");
    if (!t) return;
    if (t.hasAttribute("data-agregar")) {
      var id = t.getAttribute("data-agregar");
      if (!PRODUCTOS[id]) return;
      if (personalizable(id)) abrirFicha(id, null);
      else agregarAlPedido(id, { cambios: [], elecciones: {}, textos: {} });
    } else if (t.hasAttribute("data-abrir-pedido")) {
      cuponMsg = "";
      pintarPedido();
      abrir(dlgPedido);
      actualizarEnviado();
    } else if (t.hasAttribute("data-cerrar")) {
      cerrar(t.closest("dialog"));
    } else if (t.hasAttribute("data-seccion")) {
      vista.seccion = +t.getAttribute("data-seccion");
      vista.categoria = null;
      if (vista.busqueda) { vista.busqueda = ""; $("[data-buscar]").value = ""; }
      pintarCarta();
      subirALista();
    } else if (t.hasAttribute("data-ir-seccion")) {
      vista.seccion = +t.getAttribute("data-ir-seccion");
      vista.categoria = null;
      pintarCarta();
    } else if (t.hasAttribute("data-categoria")) {
      vista.categoria = t.getAttribute("data-categoria") || null;
      pintarCarta();
      subirALista();
    } else if (t.classList.contains("variedades")) {
      var abierta = t.getAttribute("aria-expanded") === "true";
      t.setAttribute("aria-expanded", String(!abierta));
      t.nextElementSibling.hidden = abierta;
      var fila = t.closest(".fila");
      if (fila) fila.classList.toggle("abierta", !abierta);
    } else if (t.hasAttribute("data-usar-cupon")) {
      var r = aplicarCupon(t.getAttribute("data-usar-cupon"));
      if (r.ok) {
        var e = evaluarCupon(r.c);
        avisar("Cupón <b>" + esc(pedido.cupon) + "</b> " + (!pedido.items.length ? "listo: se descuenta en tu pedido."
          : e.ok ? "aplicado: −" + plata(e.descuento) + "." : "guardado. " + esc(e.motivo)));
      }
    } else if (t.hasAttribute("data-ocultar-estado")) {
      estadoOculto = true;
      pintarEstado();
    } else if (t.hasAttribute("data-pausa")) {
      carrusel.pausado = !carrusel.pausado;
      pintarDestacados();
    } else if (t.hasAttribute("data-ir")) {
      carrusel.i = +t.getAttribute("data-ir");
      pintarDestacados();
    } else if (t.hasAttribute("data-carrusel")) {
      var paso = t.getAttribute("data-carrusel"), total = carrusel.lista.length;
      carrusel.i = (carrusel.i + +paso + total) % total;
      pintarDestacados();
      // el botón se vuelve a dibujar: queda enfocado para seguir con el teclado
      var mismo = $('[data-carrusel="' + paso + '"]');
      if (mismo) mismo.focus({ preventScroll: true });
    }
  });

  var buscarTimer;
  $("[data-buscar]").addEventListener("input", function (e) {
    clearTimeout(buscarTimer);
    var valor = e.target.value;
    buscarTimer = setTimeout(function () {
      vista.busqueda = valor.trim();
      pintarCarta();
    }, 150);
  });

  // sombra bajo la barra de secciones cuando queda pegada arriba
  var nav = $(".secciones");
  function revisarNav() {
    var alto = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--alto-cabecera")) || 84;
    nav.classList.toggle("pegada", nav.getBoundingClientRect().top <= alto + 1);
  }
  window.addEventListener("scroll", revisarNav, { passive: true });

  // revisa cada minuto si el local abrió o cerró
  setInterval(function () {
    var nuevo = estadoLocal();
    if (nuevo.abierto !== estado.abierto || nuevo.texto !== estado.texto) {
      var cambioApertura = nuevo.abierto !== estado.abierto;
      estado = nuevo;
      pintarEstado();
      if (cambioApertura) { pintarDestacados(); pintarLista(); if (dlgPedido.open) pintarPiePedido(); }
    }
  }, 60000);

  /* ---------- sección "arma tu roll": opciones a la vista ---------- */
  function pintarArmado() {
    var caja = $("[data-armado-info]");
    if (!caja) return;
    var encontrado = null;
    C.secciones.forEach(function (sec, si) {
      sec.categorias.forEach(function (cat) {
        if (encontrado) return;
        var ga = (cat.personalizar || []).map(function (g) { return GRUPOS[g]; })
          .filter(function (g) { return g && g.porRoll && g.tipo === "elegir"; });
        if (ga.length) encontrado = { si: si, cat: cat, ga: ga };
      });
    });
    var seccion = caja.closest("section");
    seccion.hidden = !encontrado;
    $$('a[href="#arma"]').forEach(function (a) { a.hidden = !encontrado; });
    if (!encontrado) return;
    $("[data-armado-ayuda]").textContent = encontrado.cat.ayuda || "";
    $("[data-armado-ir]").setAttribute("data-ir-seccion", encontrado.si);
    caja.innerHTML = encontrado.ga.map(function (g) {
      return '<div class="arma-grupo"><h3>' + esc(g.nombre + (/[aeiouáéíóú]$/i.test(g.nombre) ? "s" : "es")) + "</h3>" +
        "<ul>" + (g.opciones || []).filter(function (o) { return o.disponible !== false; }).map(function (o) {
          return "<li>" + esc(o.nombre) + (o.precio ? " <small>" + (o.gratis ? "1ª gratis, luego +" : "+") + plata(o.precio) + "</small>" : "") + "</li>";
        }).join("") + "</ul>" + (g.ayuda ? '<p class="arma-promo">' + esc(g.ayuda) + "</p>" : "") + "</div>";
    }).join("");
  }

  /* ---------- sección de cupones ---------- */
  function pintarCupones() {
    var caja = $("[data-cupones]");
    if (!caja) return;
    var hoy = ahora().fecha;
    var lista = (C.cupones || []).map(function (c, i) { return { c: c, i: i }; }).filter(function (x) {
      return x.c && x.c.codigo && x.c.activo !== false && x.c.visible !== false && !(x.c.hasta && x.c.hasta < hoy);
    });
    caja.closest("section").hidden = !lista.length;
    $$('a[href="#cupones"]').forEach(function (a) { a.hidden = !lista.length; });
    caja.innerHTML = lista.map(function (x) {
      var c = x.c;
      var cod = codigo(c.codigo);
      var cond = condicionesCupon(c);
      var usado = pedido.cupon === cod;
      return '<li class="cupon' + (usado ? " usado" : "") + '">' +
        '<div class="cupon-valor"><b' + (valorCupon(c).length > 5 ? ' class="largo"' : "") + ">" + esc(valorCupon(c)) + "</b><span>de descuento</span></div>" +
        '<div class="cupon-cuerpo"><h3' + ruta("cupones." + x.i + ".nombre") + ">" + esc(nombreCupon(c)) + "</h3>" +
        (cond.length ? '<p class="cupon-cond">' + esc(cond.join(" · ")) + "</p>" : "") +
        '<div class="cupon-pie"><span class="cupon-codigo">' + esc(cod) + "</span>" +
        (usado ? '<span class="cupon-listo">' + icono("check") + "En tu pedido</span>"
          : '<button class="cupon-usar" type="button" data-usar-cupon="' + esc(cod) + '">Usar cupón</button>') +
        "</div></div></li>";
    }).join("");
  }

  /* ---------- inicio ---------- */
  function pintarTodo() {
    pintarDatos();
    pintarTextos();
    pintarArmado();
    pintarCupones();
    pintarEstado();
    pintarDestacados();
    pintarCarta();
    pintarContador(false);
  }
  if (EDITAR) carrusel.pausado = true;
  pintarTodo();
  revisarNav();
  revisarTienda();

  /* ---------- vista previa y edición desde el panel (/admin) ---------- */
  if (!PREVIA) return;
  var alPanel = function (msg) { window.parent.postMessage(msg, location.origin); };
  var ZONAS = [["#inicio", "textos negocio", "Editar portada"], ["#carta", "carta", "Editar carta y precios"],
    ["#cupones", "cupones", "Editar cupones"], ["#arma", "armado", "Editar opciones para elegir"], ["#como-pedir", "textos", "Editar pasos"],
    ["#ubicacion", "negocio horario", "Editar dirección y horario"], [".antojo", "textos", "Editar textos"],
    [".pie", "negocio textos", "Editar pie de página"]];
  var SOLO_TEXTO = (function () { var d = document.createElement("div"); d.contentEditable = "plaintext-only"; return d.contentEditable === "plaintext-only"; })();
  function rutaEditable(el) { return el.hasAttribute("data-texto") ? "textos." + el.getAttribute("data-texto") : el.getAttribute("data-e"); }
  function marcarEditables() {
    document.documentElement.classList.toggle("editando", editando);
    $$("[data-e],[data-texto]").forEach(function (el) {
      if (editando) { el.contentEditable = SOLO_TEXTO ? "plaintext-only" : "true"; el.spellcheck = true; }
      else el.removeAttribute("contenteditable");
    });
    $$(".editar-chip").forEach(function (c) { c.hidden = !editando; });
    if (!editando) return;
    ZONAS.forEach(function (z) {
      var zona = $(z[0]);
      if (!zona || zona.querySelector(":scope > .editar-chip")) return;
      zona.setAttribute("data-grupo", z[1]);
      var b = document.createElement("button");
      b.type = "button";
      b.className = "editar-chip";
      b.setAttribute("data-abrir-grupos", z[1]);
      b.innerHTML = '<svg class="icono" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4"/></svg>' + z[2];
      zona.appendChild(b);
    });
  }
  if (EDITAR) {
    // en edición los botones no piden ni abren enlaces: los de cada producto abren su editor en el panel
    document.addEventListener("click", function (e) {
      if (!editando) return;
      var chip = e.target.closest("[data-abrir-grupos]");
      var agregar = e.target.closest("[data-agregar]");
      if (e.target.closest("[data-usar-cupon]")) {
        e.preventDefault(); e.stopPropagation();
        alPanel({ type: "pagina-abrir", grupos: ["cupones"] });
        return;
      }
      if (chip || agregar) {
        e.preventDefault(); e.stopPropagation();
        alPanel(chip ? { type: "pagina-abrir", grupos: chip.getAttribute("data-abrir-grupos").split(" ") }
          : { type: "pagina-abrir", grupos: ["carta"], producto: agregar.getAttribute("data-agregar") });
        return;
      }
      if (e.target.closest("a, [data-abrir-pedido]")) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    document.addEventListener("input", function (e) {
      var el = editando && e.target.closest && e.target.closest("[data-e],[data-texto]");
      if (!el) return;
      // textContent y no innerText: innerText entrega los títulos en mayúsculas, como los muestra el CSS
      var valor = el.textContent.replace(/\s+/g, " ");
      alPanel({ type: "pagina-editar", ruta: rutaEditable(el), valor: valor });
    });
    document.addEventListener("keydown", function (e) {
      var el = e.target.closest && e.target.closest("[contenteditable]");
      if (!el) return;
      if (e.key === "Enter" || e.key === "Escape") { e.preventDefault(); el.blur(); }
    });
    document.addEventListener("paste", function (e) {
      var el = e.target.closest && e.target.closest("[contenteditable]");
      if (!el || SOLO_TEXTO) return;
      e.preventDefault();
      document.execCommand("insertText", false, (e.clipboardData || window.clipboardData).getData("text/plain"));
    });
  }
  window.addEventListener("message", function (e) {
    if (e.origin !== location.origin || !e.data) return;
    var d = e.data;
    if (d.type === "pagina-vista" && d.carta && typeof d.carta === "object") {
      usarCarta(d.carta);
      estado = estadoLocal();
      pedido.items = pedido.items.filter(function (it) { return PRODUCTOS[it.id]; });
      if (vista.seccion >= C.secciones.length) { vista.seccion = 0; vista.categoria = null; }
      pintarTodo();
      if (EDITAR) marcarEditables();
    }
    if (d.type === "pagina-modo") { editando = !!d.editar; marcarEditables(); }
    if (d.type === "pagina-ir" && /^[a-z]+$/.test(d.grupo)) {
      var zona = $('[data-grupo~="' + d.grupo + '"]');
      if (zona) zona.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
  if (EDITAR) marcarEditables();
  alPanel({ type: "pagina-lista" });
})();
