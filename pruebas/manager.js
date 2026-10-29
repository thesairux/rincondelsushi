/* Prueba del Manager conectado a la página (necesita Playwright): con «node pruebas/servidor.js» corriendo,
   «node pruebas/manager.js». Empieza con la base de datos vacía (la borra el servidor de prueba). */
const { chromium } = require('playwright');
const BASE = 'http://localhost:8790';
const ok = (c, m) => { if (!c) throw new Error('FALLÓ: ' + m); console.log('  ✓ ' + m); };
const api = async (datos) => (await fetch(BASE + '/api/manager', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) })).json();
const esperar = async (fn, ms = 15000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await fn()) return true; await new Promise(r => setTimeout(r, 300)); } return false; };

(async () => {
  await fetch(BASE + '/__reiniciar');
  const b = await chromium.launch(); const errores = [];
  const vigilar = (p, n) => { p.on('pageerror', e => errores.push(n + ': ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|404|401|400/.test(m.text())) errores.push(n + ': ' + m.text()); }); };
  const correos = async () => (await (await fetch(BASE + '/__correos')).json());

  console.log('1) Primera cuenta de administración');
  const cm = await b.newContext({ viewport: { width: 1400, height: 900 } });
  const m = await cm.newPage(); vigilar(m, 'manager');
  await m.goto(BASE + '/manager');
  await m.waitForSelector('form[data-submit="setup"]', { timeout: 8000 });
  ok(true, 'sin usuarios, pide crear la cuenta de administración');
  ok(!(await m.content()).includes('sushi2026'), 'no muestra contraseñas de ejemplo');
  await m.fill('#su-n', 'Camila Rojas'); await m.fill('#su-e', 'camila@local.cl'); await m.fill('#su-p', 'secreto1'); await m.fill('#su-c', 'mala');
  await m.click('form[data-submit="setup"] button[type="submit"]'); await m.waitForTimeout(800);
  ok((await m.locator('.err').innerText()).includes('no coincide'), 'con una clave del panel equivocada no deja crearla');
  await m.fill('#su-c', 'clave'); await m.click('form[data-submit="setup"] button[type="submit"]');
  await m.waitForSelector('.app .side', { timeout: 10000 });
  ok(true, 'entra al Manager');

  console.log('2) Los productos de la página');
  await m.click('[data-act="nav"][data-v="productos"]'); await m.waitForTimeout(500);
  const sub = await m.locator('.page .sub, .page p').first().innerText();
  ok(/176 productos/.test(await m.locator('.page').innerText()), 'están los 176 productos de la carta');
  await m.fill('#pr-q', '40 cortes mixtos'); await m.waitForTimeout(300);
  await m.locator('.pr-row').first().click(); await m.waitForTimeout(300);
  ok((await m.locator('.note-box').first().innerText()).includes('Viene de la carta de la página'), 'avisa que el producto viene de la carta');
  ok(await m.locator('#pe-p').isDisabled(), 'su precio no se cambia aquí');

  console.log('3) Un pedido de la página llega al Manager');
  const cp = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await cp.route('https://wa.me/**', r => r.fulfill({ contentType: 'text/html', body: '<p>WhatsApp</p>' }));
  const p = await cp.newPage(); vigilar(p, 'página');
  const sec = async n => { await p.click('[data-seccion="' + (await p.$$eval('[data-secciones] .pildora', (x, n) => x.findIndex(y => y.textContent === n), n)) + '"]'); await p.waitForTimeout(250); };
  const abrirProd = async n => { await p.locator('.tarjeta, .fila', { has: p.locator('.fila-nombre', { hasText: new RegExp('^' + n + '$') }) }).first().locator('button').last().click(); await p.waitForTimeout(250); };
  const confirmar = async () => { if (await p.locator('[data-ficha][open]').count()) { await p.click('[data-confirmar]'); await p.waitForTimeout(250); } };
  await p.goto(BASE + '/'); await p.waitForTimeout(800);
  await sec('Tablas'); await abrirProd('20 cortes mixtos'); await confirmar();
  await p.locator('.boton-pedido').click(); await p.waitForTimeout(400);
  await p.fill('[data-campo="nombre"]', 'Ana Pérez'); await p.fill('[data-campo="email"]', 'ana@correo.cl');
  await p.locator('input[name="sucursal"][value="Villa Los Naranjos"]').check({ force: true }); await p.waitForTimeout(150);
  await p.locator('input[name="pago"][value="Efectivo"]').check({ force: true }); await p.waitForTimeout(150);
  const [wsp] = await Promise.all([cp.waitForEvent('page'), p.click('[data-enviar-pedido]')]);
  await wsp.close(); await p.waitForTimeout(500);
  const N1 = ((await p.locator('.pedido-enviado').innerText()).match(/N° (\d{4})/) || [])[1];
  ok(N1 === '0001', 'la página registra el pedido N° ' + N1);
  await m.click('[data-act="nav"][data-v="pedidos"]');
  ok(await esperar(async () => (await m.locator('.page').innerText()).includes('#' + N1)), 'aparece en el tablero del Manager como #' + N1 + ' (sin recargar)');
  const tablero = await m.locator('.page').innerText();
  ok(tablero.includes('Ana P.'), 'con el nombre del cliente (Ana P.)');

  console.log('4) El Manager cambia el estado y el cliente lo ve');
  for (const to of ['confirmado', 'preparacion', 'listo']) {
    await m.locator(`[data-act="step"][data-id="n1"][data-to="${to}"]`).first().click(); await m.waitForTimeout(700);
  }
  ok(await esperar(async () => (await correos()).some(c => c.subject.includes('N° 0001 está listo'))), 'al marcarlo listo le llega el correo a ana@correo.cl');
  await p.click('[data-estado-actualizar]'); await p.waitForTimeout(600);
  ok((await p.locator('.pedido-enviado').innerText()).includes('Listo para retirar'), 'la página muestra «Listo para retirar»');

  console.log('5) El panel de la página también mueve el pedido en el Manager');
  const a = await cp.newPage(); vigilar(a, 'panel');
  await a.goto(BASE + '/admin'); await a.fill('#user', 'rincondelsushi'); await a.fill('#pass', 'clave'); await a.click('#login-btn'); await a.waitForTimeout(1500);
  await a.click('#btn-pedidos'); await a.waitForTimeout(800);
  await a.locator('.ped', { hasText: 'N° 0001' }).locator('[data-estado="entregado"]').click(); await a.waitForTimeout(600);
  await m.fill('#ped-q', '').catch(() => {});
  ok(await esperar(async () => {
    const r = await m.evaluate(() => S.byId.n1 && S.byId.n1.estado);
    return r === 'entregado';
  }), 'el Manager lo ve entregado');

  console.log('6) Agotado y oculto en el Manager → la página');
  await m.click('[data-act="nav"][data-v="productos"]'); await m.waitForTimeout(400);
  await m.fill('#pr-q', '20 cortes mixtos'); await m.waitForTimeout(300);
  await m.locator('.pr-row').first().click(); await m.waitForTimeout(300);
  await m.click('[data-act="pe-tab"][data-t="disp"]'); await m.waitForTimeout(200);
  await m.locator('#pe-ag').check({ force: true }); await m.waitForTimeout(200);
  await m.click('[data-act="prod-save"]'); await m.waitForTimeout(900);
  await p.reload(); await p.waitForTimeout(1200);
  await sec('Tablas');
  const fila = p.locator('.tarjeta', { has: p.locator('.fila-nombre', { hasText: /^20 cortes mixtos$/ }) }).first();
  ok(/agotado/i.test(await fila.innerText()), 'la página lo muestra agotado');
  const r1 = await (await fetch(BASE + '/api/pedidos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accion: 'crear', pedido: { nombre: 'X', sucursal: 'Villa Los Naranjos', modo: 'retiro', pago: 'Efectivo', items: [{ id: 'tabla-20-mixtos', cant: 1, conf: {} }] } }) })).json();
  ok(r1.error && /agotado/.test(r1.motivo), 'y el servidor no deja pedirlo: ' + r1.motivo);

  console.log('7) Pausar la recepción de pedidos');
  await m.click('[data-act="toggle-live"]'); await m.waitForTimeout(900);
  await p.reload(); await p.waitForTimeout(1200);
  await sec('Tablas'); await abrirProd('30 cortes mixtos'); await confirmar();
  await p.locator('.boton-pedido').click(); await p.waitForTimeout(400);
  ok(await p.locator('input[name="sucursal"][value="Villa Los Naranjos"]').isDisabled(), 'en la página la sucursal aparece en pausa');
  const r2 = await (await fetch(BASE + '/api/pedidos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accion: 'crear', pedido: { nombre: 'X', sucursal: 'Villa El Portal', modo: 'retiro', pago: 'Efectivo', items: [{ id: 'tabla-30-mixtos', cant: 1, conf: {} }] } }) })).json();
  ok(r2.error === 'pausa', 'el servidor no recibe pedidos de una sucursal en pausa');
  await m.click('[data-act="toggle-live"]'); await m.waitForTimeout(900);

  console.log('8) Venta en caja: el número sigue al de la página');
  await m.click('[data-act="nav"][data-v="caja"]'); await m.waitForTimeout(500);
  if (await m.locator('[data-act="caja-open"]').count()) { await m.locator('[data-act="caja-open"]').first().click(); await m.waitForTimeout(300); await m.click('[data-act="caja-open-ok"]'); await m.waitForTimeout(900); }
  await m.fill('#pos-q', 'Coca-Cola'); await m.waitForTimeout(300);
  await m.locator('[data-act="pos-add"]:not([aria-disabled])').first().click(); await m.waitForTimeout(300);
  if (await m.locator('[data-act="opt-ok"]').count()) { await m.click('[data-act="opt-ok"]'); await m.waitForTimeout(300); }
  await m.locator('[data-act="pos-pay"]').first().click(); await m.waitForTimeout(1200);
  const ventas = await m.evaluate(() => S.orders.map(o => o.num + ':' + o.canal));
  ok(ventas.includes('2:caja'), 'la venta de caja queda como #0002: ' + ventas.join(', '));

  console.log('9) Usuario de cocina: sin datos de los clientes');
  await m.click('[data-act="nav"][data-v="usuarios"]'); await m.waitForTimeout(400);
  await m.click('[data-act="staff-new"]'); await m.waitForTimeout(300);
  await m.fill('#st-n', 'Pedro Cocina'); await m.fill('#st-e', 'cocina@local.cl'); await m.fill('#st-p', 'cocina123');
  await m.click('[data-act="st-rol"][data-r="cocina"]'); await m.waitForTimeout(150);
  await m.click('[data-act="st-ok"]'); await m.waitForTimeout(900);
  const entrada = await api({ accion: 'entrar', email: 'cocina@local.cl', pass: 'cocina123' });
  ok(entrada.ok && entrada.yo.rol === 'cocina', 'la cocina entra con su usuario');
  const cli = await api({ accion: 'consulta', token: entrada.token, col: 'clientes', where: [] });
  ok(cli.ok && !Object.keys(cli.docs).length, 'la cocina no puede leer los clientes');
  const dias = await api({ accion: 'consulta', token: entrada.token, col: 'dias', where: [] });
  const txt = JSON.stringify(dias.docs);
  ok(txt.includes('Ana') && !txt.includes('Pérez') && !txt.includes('ana@correo.cl'), 've los pedidos con el primer nombre, sin apellido ni correo');
  const st = await api({ accion: 'escribir', token: entrada.token, op: 'set', path: 'staff/u-x', data: { nombre: 'X', email: 'x@x.cl', rol: 'admin', pass: 'a', salt: 'b' } });
  ok(st.error === 'permiso', 'y no puede crear usuarios');
  const mala = await api({ accion: 'entrar', email: 'cocina@local.cl', pass: 'otra' });
  ok(mala.error === 'acceso', 'con otra contraseña no entra');
  ok(!JSON.stringify(await api({ accion: 'consulta', token: entrada.token, col: 'staff', where: [] })).includes('k1$'), 'las contraseñas nunca salen del servidor');

  console.log('10) Pago online: llega al Manager cuando Flow lo confirma');
  const r3 = await (await fetch(BASE + '/api/pedidos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accion: 'crear', pedido: { nombre: 'Luis Soto', email: 'luis@correo.cl', sucursal: 'Villa El Portal', modo: 'retiro', pago: 'Online', items: [{ id: 'tabla-30-mixtos', cant: 1, conf: {} }] } }) })).json();
  ok(r3.ok && r3.pagoUrl, 'pedido N° ' + r3.numero + ' esperando el pago online');
  const enManager = async () => (await api({ accion: 'consulta', token: (await api({ accion: 'entrar', email: 'camila@local.cl', pass: 'secreto1' })).token, col: 'dias', where: [] })).docs;
  ok(!JSON.stringify(await enManager()).includes('Luis Soto'), 'antes de pagar no aparece en el Manager');
  await fetch(r3.pagoUrl + '&r=ok'); // Flow (de prueba) confirma el pago al servidor
  const pagado = Object.values(await enManager()).flatMap(d => Object.values(d.pedidos || {})).find(o => o.cliente && o.cliente.nombre === 'Luis Soto');
  ok(pagado && pagado.pago.metodo === 'online' && pagado.pago.estado === 'pagado', 'pagado, aparece en el Manager como pago online confirmado');

  console.log('11) Salir y volver a entrar');
  await m.click('[data-act="pop"][data-pop="user"]').catch(() => {});
  await m.evaluate(() => A.logout()); await m.waitForTimeout(900);
  ok(await m.locator('form[data-submit="login"]').count() === 1, 'al salir vuelve a la entrada');
  await m.fill('#l-email', 'camila@local.cl'); await m.fill('#l-pass', 'secreto1'); await m.click('form[data-submit="login"] button[type="submit"]');
  await m.waitForSelector('.app .side', { timeout: 10000 });
  ok(true, 'entra con su correo y contraseña');
  await m.reload(); await m.waitForSelector('.app .side', { timeout: 10000 });
  ok(true, 'al recargar sigue con la sesión');

  ok(!errores.length, 'sin errores en las páginas' + (errores.length ? ': ' + errores.join(' | ') : ''));
  await b.close();
  console.log('Todo bien');
})().catch(e => { console.error(e.message); process.exit(1); });
