/* Prueba del pedido por WhatsApp (necesita Playwright): con «node pruebas/servidor.js» corriendo, «node pruebas/pedido.js». */
const { chromium } = require('playwright');
const BASE = 'http://localhost:8790';
const ok = (c, m) => { if (!c) throw new Error('FALLÓ: ' + m); console.log('  ✓ ' + m); };
// Photon simulado: una calle dentro del sector urbano y otra fuera
const PHOTON = { features: [
  { geometry: { coordinates: [-71.2003, -30.6021] }, properties: { name: 'Avenida San Luis', type: 'street', osm_key: 'highway', city: 'Ovalle', district: 'Centro' } },
  { geometry: { coordinates: [-71.3300, -30.4500] }, properties: { name: 'Camino San Luis', type: 'street', osm_key: 'highway', city: 'Sotaquí' } } ] };

(async () => {
  const b = await chromium.launch(); const errores = [], llamadas = [];
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.route('https://photon.komoot.io/**', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify(PHOTON) }));
  await ctx.route('https://wa.me/**', r => r.fulfill({ contentType: 'text/html', body: '<p>WhatsApp</p>' }));
  const vigilar = (p, n) => {
    p.on('pageerror', e => errores.push(n + ': ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errores.push(n + ': ' + m.text()); });
    p.on('request', r => { if (r.url().startsWith(BASE + '/api/')) llamadas.push(r.url()); });
  };
  const p = await ctx.newPage(); vigilar(p, 'cliente');
  const sec = async n => { await p.click('[data-seccion="' + (await p.$$eval('[data-secciones] .pildora', (x, n) => x.findIndex(y => y.textContent === n), n)) + '"]'); await p.waitForTimeout(250); };
  const abrirProd = async n => { await p.locator('.tarjeta, .fila', { has: p.locator('.fila-nombre', { hasText: new RegExp('^' + n + '$') }) }).first().locator('button').last().click(); await p.waitForTimeout(250); };
  const confirmar = async () => { if (await p.locator('[data-ficha][open]').count()) { await p.click('[data-confirmar]'); await p.waitForTimeout(250); } };
  const abrirPedido = async () => { await p.locator('.boton-pedido').click(); await p.waitForTimeout(400); };
  const pie = async () => (await p.locator('[data-pedido-pie] .boton').innerText()).trim().replace(/\s+/g, ' ');
  const pagos = () => p.$$eval('input[name="pago"]', x => x.map(i => i.value).join(', '));
  const enlace = async () => {
    const href = await p.locator('[data-pedido-pie] a[data-enviar]').getAttribute('href');
    const u = new URL(href);
    return { numero: u.pathname.slice(1), texto: u.searchParams.get('text') };
  };

  // un pedido guardado de antes (con correo y pago online) no debe romper nada
  await p.goto(BASE + '/');
  await p.evaluate(() => localStorage.setItem('pedido-v1', JSON.stringify({ items: [], nombre: 'Ana', email: 'ana@correo.cl', modo: 'retiro', pago: 'Online' })));

  console.log('1) Retiro en Villa Los Naranjos');
  await p.reload(); await p.waitForTimeout(800);
  ok(await p.locator('.destacado').count() === 1, 'la portada carga');
  ok(/envía por whatsapp/i.test(await p.locator('.pasos-lista').innerText()), 'el paso 3 dice «Envía por WhatsApp»');
  await sec('Tablas'); await abrirProd('20 cortes mixtos'); await confirmar();
  await abrirPedido();
  ok(await p.locator('input[name="acceso-modo"]').count() === 0, 'no aparece «¿Cómo quieres seguir?» (invitado / iniciar sesión)');
  ok(await p.locator('[data-campo="email"]').count() === 0, 'no pide el correo');
  ok((await p.locator('label:has(input[name="modo"][value="delivery"])').innerText()).trim() === 'Delivery', 'la opción de delivery no muestra el valor');
  ok(await p.inputValue('[data-campo="nombre"]') === 'Ana', 'recuerda el nombre del pedido guardado');
  await p.locator('input[name="sucursal"][value="Villa Los Naranjos"]').check({ force: true }); await p.waitForTimeout(150);
  ok(await pagos() === 'Efectivo, Transferencia, Tarjeta, Edenred', 'pagos en retiro: ' + await pagos());
  ok(await pie() === 'Elige cómo pagas', 'el pago online guardado se descarta y pide elegir: ' + await pie());
  const pieTexto = await p.locator('[data-pedido-pie]').innerText();
  ok(pieTexto.includes('Te confirmamos disponibilidad y total por WhatsApp.') && !/No pagas aquí|al retirar\.|Webpay|Flow/.test(pieTexto), 'bajo el subtotal solo dice «Te confirmamos disponibilidad y total por WhatsApp.»');
  ok(/Subtotal referencial\s*\$9\.500/.test(pieTexto), 'subtotal referencial $9.500');
  await p.locator('input[name="pago"][value="Tarjeta"]').check({ force: true }); await p.waitForTimeout(150);
  let e = await enlace();
  ok(e.numero === '56976400876', 'el enlace va al WhatsApp de Villa Los Naranjos');
  ok(e.texto.includes('Nombre: Ana') && e.texto.includes('Sucursal: Villa Los Naranjos') && e.texto.includes('Retiro en la sucursal (Los Sauces 895)') && e.texto.includes('Pago: Tarjeta al retirar'), 'el mensaje trae nombre, sucursal, retiro y pago');
  ok(!/correo|online|N° \d/i.test(e.texto), 'el mensaje no habla de correo, pago online ni número de pedido');
  const [wsp] = await Promise.all([ctx.waitForEvent('page'), p.click('[data-pedido-pie] a[data-enviar]')]);
  ok(wsp.url().startsWith('https://wa.me/56976400876?text='), 'al tocar «Enviar pedido por WhatsApp» se abre WhatsApp');
  await wsp.close();

  console.log('2) Delivery en Villa El Portal');
  await p.locator('input[name="sucursal"][value="Villa El Portal"]').check({ force: true });
  await p.locator('input[name="modo"][value="delivery"]').check({ force: true }); await p.waitForTimeout(200);
  ok(await pagos() === 'Efectivo, Transferencia, Edenred', 'pagos en delivery: ' + await pagos());
  ok(await pie() === 'Falta tu dirección de entrega', 'pide la dirección');
  await p.locator('[data-campo="direccion"]').pressSequentially('avenida san luis 1234', { delay: 20 }); await p.waitForTimeout(700);
  await p.locator('[data-sugerencia="1"]').dispatchEvent('mousedown'); await p.waitForTimeout(300);
  const fuera = await p.locator('[data-ubicacion-estado]').innerText();
  ok(fuera.includes('fuera del sector urbano de Ovalle') && !fuera.includes('$'), 'fuera de la zona avisa, sin valor: ' + fuera.split('.')[0]);
  await p.fill('[data-campo="direccion"]', ''); await p.locator('[data-campo="direccion"]').pressSequentially('avenida san luis 1234', { delay: 20 }); await p.waitForTimeout(700);
  await p.locator('[data-sugerencia="0"]').dispatchEvent('mousedown'); await p.waitForTimeout(300);
  ok(!(await p.locator('[data-ubicacion-estado]').innerText()).includes('$'), 'la ubicación no muestra el valor del delivery');
  ok(await pie() === 'Elige cómo pagas', 'la tarjeta no sirve en delivery: pide elegir de nuevo');
  await p.locator('input[name="pago"][value="Edenred"]').check({ force: true }); await p.waitForTimeout(150);
  const totales = await p.locator('.totales').innerText();
  ok(!totales.includes('2.500') && !/delivery/i.test(totales), 'los totales no suman delivery: ' + totales.replace(/\s+/g, ' '));
  e = await enlace();
  ok(e.numero === '56946324426', 'el enlace va al WhatsApp de Villa El Portal');
  ok(e.texto.includes('Modalidad: Delivery') && e.texto.includes('Dirección: Avenida San Luis 1234, Ovalle') && e.texto.includes('Ubicación: https://maps.google.com/?q=') && e.texto.includes('Pago: Edenred al recibir'), 'el mensaje trae dirección, ubicación y pago');
  ok(!e.texto.includes('2.500') && !/Delivery: /.test(e.texto), 'el mensaje no trae el valor del delivery');
  await p.screenshot({ path: require('path').join(require('os').tmpdir(), 'pedido-delivery.png') });

  console.log('3) Celular');
  const m = await ctx.newPage(); vigilar(m, 'celular');
  await m.setViewportSize({ width: 390, height: 844 });
  await m.goto(BASE + '/'); await m.waitForTimeout(800);
  await m.locator('.barra-pedido').click(); await m.waitForTimeout(400);
  ok(await m.evaluate(() => document.querySelector('[data-pedido-cuerpo]').scrollWidth <= document.querySelector('[data-pedido-cuerpo]').clientWidth), 'el pedido no se sale de la pantalla');
  await m.screenshot({ path: require('path').join(require('os').tmpdir(), 'pedido-celular.png') });

  ok(!llamadas.length, 'la página no llama a ningún servidor de pedidos' + (llamadas.length ? ': ' + llamadas.join(', ') : ''));
  ok(!errores.length, 'sin errores en la consola' + (errores.length ? ': ' + errores.join(' | ') : ''));
  await b.close();
  console.log('Todo bien.');
})().catch(e => { console.error(e.message); process.exit(1); });
