/* Prueba de punta a punta del pedido (necesita Playwright): con «node pruebas/servidor.js» corriendo, «node pruebas/pedido.js». */
const { chromium } = require('playwright');
const BASE = 'http://localhost:8790';
const ok = (c, m) => { if (!c) throw new Error('FALLÓ: ' + m); console.log('  ✓ ' + m); };
// Photon simulado: una calle dentro del sector urbano y otra fuera
const PHOTON = { features: [
  { geometry: { coordinates: [-71.2003, -30.6021] }, properties: { name: 'Avenida San Luis', type: 'street', osm_key: 'highway', city: 'Ovalle', district: 'Centro' } },
  { geometry: { coordinates: [-71.2101, -30.5930] }, properties: { street: 'Avenida San Luis', housenumber: '1234', type: 'house', city: 'Ovalle' } },
  { geometry: { coordinates: [-71.3300, -30.4500] }, properties: { name: 'Camino San Luis', type: 'street', osm_key: 'highway', city: 'Sotaquí' } } ] };

(async () => {
  const b = await chromium.launch(); const errores = [];
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.route('https://photon.komoot.io/**', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify(PHOTON) }));
  await ctx.route('https://wa.me/**', r => r.fulfill({ contentType: 'text/html', body: '<p>WhatsApp</p>' }));
  const vigilar = (p, n) => { p.on('pageerror', e => errores.push(n + ': ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errores.push(n + ': ' + m.text()); }); };
  const p = await ctx.newPage(); vigilar(p, 'cliente');
  const correos = async () => (await (await fetch(BASE + '/__correos')).json());
  const sec = async n => { await p.click('[data-seccion="' + (await p.$$eval('[data-secciones] .pildora', (x, n) => x.findIndex(y => y.textContent === n), n)) + '"]'); await p.waitForTimeout(250); };
  const abrirProd = async n => { await p.locator('.tarjeta, .fila', { has: p.locator('.fila-nombre', { hasText: new RegExp('^' + n.replace(/[()$×]/g, '\\$&') + '$') }) }).first().locator('button').last().click(); await p.waitForTimeout(250); };
  const confirmar = async () => { if (await p.locator('[data-ficha][open]').count()) { await p.click('[data-confirmar]'); await p.waitForTimeout(250); } };
  const marcar = async (g, v) => { await p.locator(`[data-grupo="${g}"][value="${v}"]`).check({ force: true }); await p.waitForTimeout(80); };
  const elegir = async (r, g, v) => { await p.selectOption(`[data-armado="${r}"][data-grupo-roll="${g}"]`, v); await p.waitForTimeout(80); };
  const abrirPedido = async () => { await p.locator('.boton-pedido').click(); await p.waitForTimeout(400); };
  const pie = async () => (await p.locator('[data-pedido-pie] .boton').innerText()).trim().replace(/\s+/g, ' ');

  console.log('1) Invitado, retiro, efectivo');
  await p.goto(BASE + '/'); await p.waitForTimeout(800);
  ok(await p.locator('.destacado').count() === 1, 'la portada carga');
  await sec('Tablas'); await abrirProd('20 cortes mixtos'); await confirmar();
  await abrirPedido();
  ok(await p.locator('input[name="acceso-modo"]').count() === 2, 'aparece «Como invitado» / «Iniciar sesión»');
  await p.fill('[data-campo="nombre"]', 'Ana'); await p.fill('[data-campo="email"]', 'ana@correo.cl');
  await p.locator('input[name="sucursal"][value="Villa Los Naranjos"]').check({ force: true }); await p.waitForTimeout(150);
  ok((await p.locator('.retiro-info').innerText()).includes('Los Sauces 895'), 'el retiro muestra Los Sauces 895');
  ok(await pie() === 'Elige cómo pagas', 'pide la forma de pago: ' + await pie());
  const pagosRetiro = await p.$$eval('input[name="pago"]', x => x.map(i => i.value));
  ok(JSON.stringify(pagosRetiro) === JSON.stringify(['Online', 'Efectivo', 'Transferencia', 'Tarjeta', 'Edenred']), 'pagos en retiro: ' + pagosRetiro.join(', '));
  await p.locator('input[name="pago"][value="Efectivo"]').check({ force: true }); await p.waitForTimeout(150);
  const [wsp] = await Promise.all([ctx.waitForEvent('page'), p.click('[data-enviar-pedido]')]);
  await wsp.waitForLoadState(); await p.waitForTimeout(600);
  const msg1 = decodeURIComponent(wsp.url().split('text=')[1] || '');
  ok(wsp.url().startsWith('https://wa.me/56976400876'), 'WhatsApp de Villa Los Naranjos');
  const N1 = (msg1.match(/pedido \(N° (\d{4})\)/) || [])[1];
  ok(N1 && msg1.includes('Correo para el aviso: ana@correo.cl') && msg1.includes('Pago: Efectivo al retirar'), 'mensaje con número, correo y pago');
  console.log(msg1.split('\n').map(l => '     ' + l).join('\n'));
  await wsp.close();
  ok((await p.locator('.pedido-enviado').innerText()).includes('Pedido N° ' + N1), 'la página muestra el pedido N° ' + N1);

  console.log('2) El local lo marca listo en el panel');
  const a = await ctx.newPage(); vigilar(a, 'panel');
  await a.goto(BASE + '/admin'); await a.fill('#user', 'rincondelsushi'); await a.fill('#pass', 'clave'); await a.click('#login-btn'); await a.waitForTimeout(1500);
  await a.click('#btn-pedidos'); await a.waitForTimeout(800);
  ok((await a.locator('.ped').count()) >= 1, 'el panel muestra los pedidos: ' + await a.locator('.ped').count());
  const card = a.locator('.ped', { hasText: 'N° ' + N1 });
  ok((await card.innerText()).includes('Paga al retirar: Efectivo'), 'la tarjeta dice cómo paga');
  await a.screenshot({ path: require('path').join(require('os').tmpdir(), 'e2e-panel.png') });
  await card.locator('[data-estado="listo"]').click(); await a.waitForTimeout(600);
  const c1 = (await correos()).find(c => c.subject.includes('N° ' + N1 + ' está listo'));
  ok(c1 && c1.to[0] === 'ana@correo.cl', 'le llega el correo «listo para retirar» a ana@correo.cl');
  await p.click('[data-estado-actualizar]'); await p.waitForTimeout(500);
  ok((await p.locator('.pedido-enviado').innerText()).includes('Listo para retirar'), 'el cliente ve «Listo para retirar»');

  console.log('3) Inicia sesión, delivery con sugerencias y pago online');
  await p.click('[data-otro-pedido]'); await p.waitForTimeout(300);
  await p.click('[data-cerrar]').catch(() => {}); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  await sec('Menú del día'); await abrirProd('Menú del día');
  await marcar('md-proteina', 'pollo-pobre'); await marcar('md-agregados', 'arroz'); await marcar('md-agregados', 'ensalada'); await marcar('md-extras', 'huevo-frito');
  ok((await p.locator('[data-confirmar]').innerText()).includes('7.300'), 'menú del día pollo a lo pobre + huevo = $7.300');
  await confirmar();
  await sec('Rolls'); await p.click('[data-categoria="arma-tu-roll"]'); await p.waitForTimeout(200); await abrirProd('Arma tu roll');
  await marcar('ar-envoltura', 'salmon'); await marcar('ar-proteina', 'pulpo'); await marcar('ar-relleno', 'frutilla'); await marcar('ar-topping', 'spicy');
  await confirmar();
  await sec('Hand rolls'); await abrirProd('Promoción de hand rolls 3 × $10.000');
  for (const r of [0, 1, 2]) { await elegir(r, 'hr-proteina-promo', r === 2 ? 'camaron' : 'pollo'); await elegir(r, 'hr-agregado', r === 1 ? 'palta' : 'cebollin'); }
  await confirmar();
  await sec('Súper promociones');
  ok((await p.locator('.tarjeta', { hasText: 'Promo especial de lunes' }).innerText()).toLowerCase().includes('solo los lunes'), 'la promo del lunes dice «Solo los lunes» (hoy es miércoles)');
  await abrirProd('Miércoles 3x2 en sushiburger');
  ok((await p.locator('.rolls h3').innerText()).toLowerCase().includes('arma tus 3 sushiburgers'), 'el 3x2 arma 3 sushiburgers');
  await elegir(0, 'sb3-proteina', 'salmon'); for (const k of [1, 2, 3]) await elegir(0, 'sb3-agregado-' + k, k === 1 ? 'palta' : 'cebollin');
  await p.click('[data-copiar="0"]'); await p.waitForTimeout(150);
  ok((await p.locator('[data-confirmar]').innerText()).includes('22.500'), '3x2 con salmón y palta: $15.000 + 3 × ($2.000 + $500) = $22.500');
  await confirmar();
  await abrirPedido();
  await p.locator('input[name="acceso-modo"][value="cuenta"]').check({ force: true }); await p.waitForTimeout(200);
  await p.fill('[data-acceso-email]', 'luis@correo.cl'); await p.click('[data-acceso="codigo"]'); await p.waitForTimeout(600);
  const cod = ((await correos()).reverse().find(c => c.to[0] === 'luis@correo.cl') || {}).subject.match(/\d{6}/)[0];
  ok(cod, 'llega el código al correo: ' + cod);
  await p.fill('[data-acceso-cod]', '000000'); await p.click('[data-acceso="entrar"]'); await p.waitForTimeout(400);
  ok((await p.locator('.campo-ayuda.falta').innerText()).includes('no coincide'), 'un código malo no entra');
  await p.fill('[data-acceso-cod]', cod); await p.click('[data-acceso="entrar"]'); await p.waitForTimeout(600);
  ok((await p.locator('.cuenta').innerText()).includes('luis@correo.cl'), 'quedó con la sesión iniciada');
  await p.fill('[data-campo="nombre"]', 'Luis');
  await p.locator('input[name="sucursal"][value="Villa El Portal"]').check({ force: true });
  await p.locator('input[name="modo"][value="delivery"]').check({ force: true }); await p.waitForTimeout(200);
  const pagosDel = await p.$$eval('input[name="pago"]', x => x.map(i => i.value));
  ok(JSON.stringify(pagosDel) === JSON.stringify(['Online', 'Efectivo', 'Transferencia', 'Edenred']), 'pagos en delivery: ' + pagosDel.join(', '));
  await p.locator('[data-campo="direccion"]').pressSequentially('avenida san luis 1234', { delay: 20 }); await p.waitForTimeout(700);
  const sug = await p.$$eval('[data-sugerencia] b', x => x.map(y => y.textContent));
  ok(sug.length === 2 && sug[0] === 'Avenida San Luis 1234' && sug[1] === 'Camino San Luis 1234', 'sugerencias de Maps: ' + sug.join(' | '));
  await p.screenshot({ path: require('path').join(require('os').tmpdir(), 'e2e-sugerencias.png') });
  // fuera de la zona
  await p.locator('[data-sugerencia="1"]').dispatchEvent('mousedown'); await p.waitForTimeout(300);
  ok((await p.locator('[data-ubicacion-estado]').innerText()).includes('fuera del sector urbano de Ovalle'), 'avisa que Sotaquí queda fuera de la zona');
  await p.locator('input[name="pago"][value="Online"]').check({ force: true }); await p.waitForTimeout(200);
  ok(await pie() === 'Fuera de la zona: paga al recibir', 'fuera de la zona no deja pagar online');
  // dentro de la zona
  await p.fill('[data-campo="direccion"]', ''); await p.locator('[data-campo="direccion"]').pressSequentially('avenida san luis 1234', { delay: 20 }); await p.waitForTimeout(700);
  await p.locator('[data-sugerencia="0"]').dispatchEvent('mousedown'); await p.waitForTimeout(300);
  ok((await p.locator('[data-ubicacion-estado]').innerText()).includes('dentro del sector urbano de Ovalle'), 'la dirección queda ubicada en la zona');
  const totales = await p.locator('.totales').innerText();
  ok(totales.includes('$2.500'), 'suma el delivery de $2.500');
  await p.screenshot({ path: require('path').join(require('os').tmpdir(), 'e2e-delivery.png') });
  const boton = await pie();
  ok(/^Pagar \$[\d.]+ online/.test(boton), 'botón: ' + boton);
  const montoPagina = +boton.match(/\$([\d.]+)/)[1].replace(/\./g, '');
  await Promise.all([p.waitForURL(/flow-pagar/), p.click('[data-pagar-online]')]);
  ok(+(await p.locator('#monto').innerText()) === montoPagina, 'Flow cobra lo mismo que muestra la página: ' + montoPagina);
  await Promise.all([p.waitForURL(u => /\/(\?|$)/.test(new URL(u).pathname + new URL(u).search) && !/flow/.test(u)), p.click('#pagar')]);
  await p.waitForTimeout(1200);
  const N2 = String(+N1 + 1).padStart(4, '0');
  ok((await p.locator('.pedido-enviado').innerText()).includes('¡Pago recibido! Pedido N° ' + N2), 'vuelve a la página con «¡Pago recibido! Pedido N° ' + N2 + '»');
  ok(!/pedido=/.test(p.url()), 'la dirección queda limpia: ' + p.url());
  await p.screenshot({ path: require('path').join(require('os').tmpdir(), 'e2e-pagado.png') });
  ok((await correos()).some(c => c.to[0] === 'luis@correo.cl' && c.subject.includes('Recibimos tu pago del pedido N° ' + N2)), 'le llega el correo del pago');
  const [w2] = await Promise.all([ctx.waitForEvent('page'), p.click('[data-wsp-enviado]')]);
  await w2.waitForLoadState();
  const msg2 = decodeURIComponent(w2.url().split('text=')[1] || '');
  console.log(msg2.split('\n').map(l => '     ' + l).join('\n'));
  ok(w2.url().startsWith('https://wa.me/56946324426') && msg2.includes('Pago: online (pagado)') && msg2.includes('Ubicación: https://maps.google.com/?q=-30.6021,-71.2003'), 'aviso a Villa El Portal por WhatsApp, pagado y con ubicación');
  console.log(msg2.split('\n').map(l => '     ' + l).join('\n'));
  await w2.close();

  console.log('4) El panel: pagado online y «en camino»');
  await a.click('#ped-recargar'); await a.waitForTimeout(700);
  const c3 = a.locator('.ped', { hasText: 'N° ' + N2 });
  const t3 = await c3.innerText();
  ok(t3.includes('Online: pagado') && t3.includes('Avenida San Luis 1234') && t3.includes('$2.500'), 'pedido N° ' + N2 + ' pagado online, con dirección y delivery');
  await c3.locator('[data-estado="en-camino"]').click(); await a.waitForTimeout(600);
  ok((await correos()).some(c => c.to[0] === 'luis@correo.cl' && c.subject.includes('N° ' + N2 + ' va en camino')), 'le llega el correo «va en camino»');
  await a.screenshot({ path: require('path').join(require('os').tmpdir(), 'e2e-panel2.png') });

  console.log('5) Pago rechazado');
  await p.click('[data-otro-pedido]').catch(() => {}); await p.keyboard.press('Escape'); await p.waitForTimeout(200);

  await sec('Aperitivos'); await abrirProd('Aros de cebolla'); await confirmar();
  await abrirPedido();
  await p.locator('input[name="modo"][value="retiro"]').check({ force: true }); await p.waitForTimeout(150);
  await p.locator('input[name="pago"][value="Online"]').check({ force: true }); await p.waitForTimeout(150);
  await Promise.all([p.waitForURL(/flow-pagar/), p.click('[data-pagar-online]')]);
  await Promise.all([p.waitForURL(u => !/flow/.test(u)), p.click('#rechazar')]); await p.waitForTimeout(1200);
  ok((await p.locator('.pedido-enviado').innerText()).includes('El pago no se completó'), 'avisa que el pago no se completó');
  await p.reload(); await p.waitForTimeout(800); await abrirPedido();
  ok((await p.locator('.cuenta').innerText()).includes('N° ' + N2), 'la sesión sigue tras recargar y muestra sus pedidos');

  // celular
  const m = await b.newPage({ viewport: { width: 390, height: 844 } }); vigilar(m, 'celular');
  await m.goto(BASE + '/'); await m.waitForTimeout(600); await m.click('[data-seccion="2"]'); await m.waitForTimeout(300); await m.locator('.tarjeta .agregar').first().click(); await m.waitForTimeout(300);
  if (await m.locator('[data-ficha][open]').count()) { await m.locator('[data-confirmar]').click(); await m.waitForTimeout(300); }
  await m.locator('[data-abrir-pedido]').first().click(); await m.waitForTimeout(400);
  await m.locator('input[name="modo"][value="delivery"]').check({ force: true }); await m.waitForTimeout(300);
  await m.locator('[data-pedido]').screenshot({ path: require('path').join(require('os').tmpdir(), 'e2e-celular.png') });
  ok(await m.evaluate(() => document.documentElement.scrollWidth) === 390, 'sin scroll horizontal en celular');
  console.log('errores:', errores.length ? errores : 'ninguno');
  await b.close();
})().catch(e => { console.error(e.message); process.exit(1); });
