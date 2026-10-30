# El Rincón del Sushi: página web

Página de pedidos de **El Rincón del Sushi**, hecha con la plantilla demo multipropósito
([thesairux/sushi-demo](https://github.com/thesairux/sushi-demo)): portada con promos destacadas, carta con
buscador, armado de rolls (proteína, relleno y envoltura en cada roll), cupones de descuento y envío del pedido
ordenado por WhatsApp a la sucursal que elige el cliente (Villa Los Naranjos o Villa El Portal), con retiro o delivery.

El pedido va **solo por WhatsApp**: no hay cuentas, correo ni pago online. El cliente elige retiro o delivery
(la dirección con sugerencias de calles reales y el mapa) y cómo paga al retirar (efectivo, transferencia, tarjeta o
Edenred) o al recibir (efectivo, transferencia o Edenred), y el pedido se abre en el WhatsApp de la sucursal que
eligió. El total es referencial: el local confirma disponibilidad, delivery y total al responder.

La página funciona sin servidor (también abriendo `index.html` directo en el navegador). El único servidor es el
del panel `/admin`, para guardar los cambios.

## Publicar

1. En Vercel: *Add New… → Project* → importa este repositorio → **Deploy**.
2. Activa el panel (ver abajo): `GITHUB_TOKEN` y `ADMIN_PASSWORD` en Vercel, y **Redeploy**.

Antes de publicar, revisa en `carta.js` → `negocio` el WhatsApp, la dirección, el mapa, las redes y los datos de
transferencia, y cambia `img/icono-192.png`, `img/icono-180.png` y `favicon.ico` por el ícono del local (los que
vienen son provisorios, con el nombre en letras). El logo (`img/logo-rincon.webp`) ya es el del local.

## Pendiente de confirmar con el local

- **Zona de despacho**: está cargado un polígono **aproximado** del sector urbano de Ovalle (en `carta.js` →
  `negocio.zonaDelivery`, pares `[latitud, longitud]`). Hay que confirmarlo con el local; si la dirección queda
  fuera, la página lo avisa y el pedido lo dice para que el local confirme si llega.
- **Villa El Portal**: falta su dirección (la de Villa Los Naranjos es Los Sauces 895, según el afiche).
- **Menú del día**: el afiche dice «Pollo a lo pobre $6.500» y «Chuleta a lo pobre $6.500» (están como +$1.500)
  y también «A lo pobre +$2.500» (está como agregado extra para las demás proteínas). Falta saber si es así y en
  qué días y horas se sirve (hoy se puede pedir siempre).
- **Miércoles 3x2 en sushiburger**: el afiche tiene el logo «Rincón del Sabor». Está cargado a $15.000 (3 × $7.500
  pagando 2) con los recargos de la sushiburger en cada una; sin opción vegetariana. **Promoción martes**: el
  afiche no detalla los 50 cortes.

La carta combina el catálogo de WhatsApp con la carta en PDF del local. Donde no coincidían, quedó lo del PDF
(es la más reciente), salvo lo que el local confirmó aparte:

- **Sushiburger**: confirmado que vale $7.500 también con vacuno (el PDF dice vacuno +$2.000). Las demás
  proteínas y agregados tienen los recargos del PDF.
- **Masago roll**: el PDF pone «EXTRA: camarón ecuatoriano apanado, salmón apanado o atún rojo $7.000». Está
  cargado como agregado opcional de +$7.000; falta saber si es eso o si son otras versiones del roll.
- **Arma tu roll**: el PDF no dice cuántos rellenos lleva (está cargado con 1, y se pueden sumar extras) y pone
  «Relleno extra $1.000» en la columna de envolturas (está cargado como extra).
- **Rolls con topping**: el PDF no dice los cortes; están cargados como 10 cortes, igual que «Arma tu roll».
  Dos del topping al olivo (vacuno, queso y palta $8.200; pollo, queso y aceituna $6.700) no dicen la envoltura.
- **Tablas de 200 cortes**: el PDF no detalla los cortes. La de 50 cortes calientes tiene los de la
  Promoción A2 (y la sin kanikama cambia la kanikama por pollo, queso y palta).
- **Hand roll de vacuno**: «Vacuno $5.500» está cargado como +$2.000 sobre el hand roll de $3.500 (total
  $5.500), igual que en «Arma tu roll», donde $5.500 es el precio del roll con vacuno.
- **Sucursales**: falta el horario de Villa Los Naranjos y de Villa El Portal, y si las dos hacen delivery. El enlace de Facebook («Rincon Delsushi») tampoco está: se agrega en el panel.
- **Fotos**: las bebidas, los jugos, la coctelería y las tablas de 200 cortes no tienen foto (queda el espacio).
- Datos de transferencia, logo y colores del local.

## Direcciones y pruebas

**Direcciones**: las sugerencias salen de OpenStreetMap con [Photon](https://photon.komoot.io) (gratis, sin clave),
buscando cerca de la zona de despacho. Al elegir una, el pedido lleva el enlace a Google Maps para el repartidor.
El cliente también puede tocar **Usar mi ubicación actual**.

**Pruebas** (necesitan Playwright): `node pruebas/servidor.js` levanta la página y el panel con GitHub simulado
(«Publicar» no guarda nada). Con eso corriendo, `node pruebas/pedido.js` arma pedidos de retiro y delivery y revisa
el enlace y el mensaje de WhatsApp de cada sucursal, y `node pruebas/panel.js` revisa Stock, Promos y Publicar.

## Panel de administración

Entra a **tu-pagina.vercel.app/admin**. El usuario es `rincondelsushi` (se cambia con `ADMIN_USER`) y la contraseña es la
que pongas en `ADMIN_PASSWORD`. El panel no aparece en ningún menú de la página ni en Google.

Ahí ves la página tal cual, y arriba tienes:
- **Stock**: un interruptor por producto y por ingrediente (salmón, camarón, palta…). Lo apagas y en la página sale
  **Agotado** y no se puede pedir; lo prendes cuando llega. Arriba dice qué está agotado y hay un buscador.
- **Promos**: como «Agregar servicio» en el panel de SanFelect. Cada promo tiene nombre, precio, qué trae, nota,
  foto, los días que se puede pedir (sin marcar, todos) y si sale en la portada. **Agregar promo** suma una nueva;
  con las flechas se ordenan y con el tacho se borran. También se pueden crear grupos de promos.
- **Todas las opciones**: lo anterior más **Carta y precios** (los demás productos), **Local y WhatsApp** (el
  WhatsApp de cada sucursal, dirección y colores), **Horario** y **Textos de la página**. Abajo, en *Más opciones*,
  quedan **Opciones para elegir** (proteínas, rellenos, agregados) y **Cupones**.

Además:
- **Tocas cualquier texto** (títulos, nombres y descripciones de productos) y escribes encima.
- Los botones amarillos **Editar** de cada parte, o el **+** de cada producto, abren lo suyo (el **+** de una promo
  abre Promos). Lo que se usa poco de cada producto (variantes, lo que elige el cliente) está en *Más opciones*.
- **Ver como cliente** muestra la página sin marcas de edición; **Celular** la muestra en tamaño de teléfono.
- Al tocar **Publicar**, los cambios se guardan en el repositorio y Vercel actualiza la página sola
  en uno o dos minutos.

### Configuración (una sola vez, en Vercel)

En el proyecto de Vercel: **Settings → Environment Variables**

| Nombre | Para qué sirve |
| --- | --- |
| `GITHUB_TOKEN` | Obligatoria. Clave de GitHub (*fine-grained token*) con permiso *Contents: Read and write* solo sobre este repositorio. Solo la usa el servidor; nunca llega al navegador. |
| `ADMIN_PASSWORD` | Obligatoria. Contraseña del panel. No hay contraseña de fábrica. |
| `ADMIN_USER` | Opcional. Usuario del panel (si no está: `rincondelsushi`). |
| `GITHUB_REPO` | Opcional. `usuario/repositorio`, si Vercel no lo detecta solo. |
| `GITHUB_BRANCH` | Opcional. Rama donde guarda el panel (si no está: la rama que Vercel publicó, o `main`). |

Después de agregar o cambiar una variable, hay que volver a publicar (**Deployments → Redeploy**).
Para revisar la configuración, abre **tu-pagina.vercel.app/api/admin**: dice si la clave de GitHub y la contraseña
están puestas (nunca las muestra).

## Cómo está armada la carta (`carta.js`)

```
secciones            → botones grandes de la carta: Promos, Sushi, Hamburguesas…
  categorias         → si una sección tiene más de una, aparecen como botones chicos (Bebidas, Jugos…)
    productos        → cada producto con su precio
personalizacion      → grupos que el cliente elige: punto de la carne, agregados, proteína de cada roll…
```

La sección con `"promos": true` (o con «promo» en el nombre) es la que el panel muestra en **Promos**.

**Productos**
- **Precio**: `"precio": 14500`, sin punto ni signo.
- **Variantes con otro precio** (simple/doble, mediana/grande): `"opciones": ["Simple", "Doble"]` y
  `"preciosOpciones": { "Simple": 6490, "Doble": 8490 }`. Sin `preciosOpciones`, todas cuestan lo mismo (sabores).
- **Qué incluye** (combos y promos): en `"detalle"`, una cosa por línea separada con `\n`:
  `"1 hamburguesa a elección\n1 papas fritas\n1 bebida en lata"`. Si todas las líneas son piezas o cortes
  (`"25 piezas frías\n25 piezas calientes"`), además suma las piezas.
- **Nota destacada**: `"nota": "Válido por tiempo limitado."`
- **Agotado**: `"disponible": false`.
- **Promo en la portada**: `"destacado": true` y una `"foto"`.
- **Fotos**: en `img/carta/`, con `"foto": "img/carta/mi-foto.webp"`. Si una categoría tiene al menos un producto
  con foto, se muestra en tarjetas; si no, en lista. Se ven mejor en formato horizontal (1000 × 725).
  Con `"tarjetas": true` en la categoría, va en tarjetas aunque no tenga fotos: queda el espacio de la imagen
  con el logo hasta que se suba la foto.
  Al agregar o cambiar una foto en `img/carta/`, corre `python3 herramientas/miniaturas.py`: crea la copia liviana
  de 600 px (`img/carta/600/`) que usan las tarjetas para cargar rápido. Si falta, la tarjeta usa la foto original.
- **Producto nuevo**: copia uno parecido y cambia `id` (no se puede repetir), `nombre`, `detalle` y `precio`.

**Opciones para elegir** (`personalizacion`)
- `"tipo": "elegir"`, `"min": 1`, `"max": 1` → el cliente elige una sí o sí (punto de la carne, salsa).
  Con `"porDefecto": true` en una opción, queda marcada de entrada.
- `"tipo": "extra"`, `"max": 10` → agregados opcionales, cada uno con su `"precio"` (tocino +$1.000).
- `"suma": { "gohan-agregados": 1 }` en una opción → al elegirla, el cliente elige uno más en ese otro grupo
  (la proteína «Vegetariano (2 agregados)» del gohan, el sushiburger, la sushi arepa y el sushipleto).
- `"porRoll": true` → se elige en cada roll; el producto dice cuántos rolls arma el cliente con `"rolls": 2`.
  Con `"gratis": 1` en una opción, la primera no se cobra y cada repetida sí (envoltura en palta o en queso).
- Para usar un grupo: `"personalizar": ["punto", "agregados"]` en la categoría (vale para todos sus productos)
  o en un producto (reemplaza al de la categoría; por ejemplo el pollo crispy solo lleva `["agregados"]`).
- La sección **Arma tu roll** de la página aparece sola si hay una categoría con grupos `porRoll`;
  si el local no vende sushi, desaparece junto con su enlace del menú.

**Cupones** (`cupones`)
- Cada cupón tiene un `"codigo"` (lo que escribe el cliente), un `"nombre"` (cómo se muestra), un `"tipo"`
  (`"porcentaje"` o `"monto"`) y un `"valor"` (`10` = 10%, o `2000` = $2.000).
- Condiciones opcionales: `"minimo"` (pedido mínimo), `"tope"` (descuento máximo de un porcentaje),
  `"desde"` y `"hasta"` (`"2026-12-31"`), `"dias"` (`["martes"]`), `"modo"` (`"retiro"` o `"delivery"`) y
  `"aplica"` (ids de categorías, por ejemplo `["hamburguesas"]`: el descuento se calcula solo sobre esos productos).
- `"activo": false` lo apaga sin borrarlo; `"visible": false` lo saca de la página, pero el código sigue funcionando
  (para redes, volantes o clientes frecuentes).
- Un cupón por pedido. Si el pedido no cumple una condición, el cliente ve por qué (por ejemplo «te faltan $2.300») y el
  descuento se aplica solo cuando la cumple. El mensaje de WhatsApp lleva el cupón, el descuento y el total.
- La página no tiene servidor de pedidos: los códigos se pueden ver en `carta.js` y no se puede limitar a «un uso por persona».
  Por eso cada cupón llega escrito en el pedido, para que el local lo confirme al responder.
- Si no hay cupones activos y visibles, la sección **Cupones** y su enlace del menú no aparecen.

**Local, horario y delivery**
- **Sucursales**: en `negocio`, `"sucursales": [{ "nombre": "Villa El Portal", "whatsapp": "56946324426",
  "whatsappVisible": "+56 9 4632 4426", "direccion": "…" }]`. Con dos o más, el cliente elige la sucursal al
  pedir y el pedido llega al WhatsApp de esa sucursal; en la portada y el pie aparecen todos los números.
  Se editan en el panel, en «Local y WhatsApp».
- **Formas de pago**: `"pagosDelivery": ["Efectivo", "Transferencia", "Edenred"]` (al recibir) y
  `"pagosRetiro": ["Efectivo", "Transferencia", "Tarjeta", "Edenred"]` (al retirar).
- **Delivery**: `"zonaDelivery": { "nombre": "sector urbano de Ovalle", "poligono": […] }`. La página no muestra ni
  suma el valor del delivery: el local lo confirma por WhatsApp junto con el total.
- **Productos de un día**: `"dias": ["lunes"]` en un producto: solo se puede pedir ese día (los otros días dice
  «Solo los lunes») y en la portada aparece solo ese día. `"unidad": "Sushiburger"` cambia «Roll 1, Roll 2…» por
  «Sushiburger 1, 2…» en los productos que se arman de a varios.
- **Horario**: `"lunes": "12:30-23:00"`, `"domingo": "cerrado"` o dos turnos `"12:00-15:30, 19:00-23:00"`.
  Con `"horarioConfirmado": false` se muestra como *horario referencial, por confirmar* y no bloquea pedidos;
  con `true` aparece *Abierto ahora / Cerrado ahora* y fuera de horario no se puede agregar.
- **Días sin atención** (feriados): `"diasCerrados": ["2026-12-25", "2027-01-01"]`.
- Lo que quede vacío no se muestra: sin `"direccion"` no aparece la sección de ubicación; sin `"instagram"`, no hay enlace.
- **Mapa**: `"mapa"` es el enlace del local en Google Maps y `"mapaBusqueda"` lo que se busca para mostrar el mapa.
- **Transferencia**: `"datosTransferencia": "Banco …\nCuenta …\nRUT …"` se muestra cuando el cliente elige ese pago.

Al editar a mano, cuida las comillas y las comas: cada elemento de una lista va separado por una coma.
Si la carta deja de aparecer, lo más probable es que falte o sobre una coma en el último cambio.

## Archivos

- `index.html`: estructura de la página y textos fijos (portada, arma tu roll, cómo pedir, ubicación).
- `carta.js`: datos del local, colores, horario, productos, precios y opciones para elegir.
- `css/estilos.css`: diseño (computador y celular). Los colores se cambian desde `carta.js` → `tema`.
- `js/app.js`: carta, buscador, pedido, horario de apertura y mensaje de WhatsApp.
- `js/tema.js`: aplica los colores de la marca.
- `img/`: logo e íconos; en `img/carta/` las imágenes de los productos y en `img/carta/600/` sus copias livianas.
- `herramientas/miniaturas.py`: crea esas copias livianas.
- `admin.html`: el panel de administración.
- `api/admin.js`: el servidor del panel (revisa la contraseña y guarda los cambios en GitHub).
- `pruebas/`: el servidor de prueba y las pruebas del pedido y del panel.
- `fotos/`: las fotos que se suben desde el panel (se crea sola).
- `vercel.json` y `robots.txt`: configuración para que el panel no aparezca en Google.

## Cómo funciona el pedido

El cliente arma el pedido, escribe su nombre, elige la sucursal, retiro o delivery (con la dirección elegida en la
lista o su ubicación) y cómo paga. Al tocar **Enviar pedido por WhatsApp** se abre el WhatsApp de esa sucursal con un
mensaje ordenado: sucursal, modalidad, dirección y ubicación, forma de pago, productos con todo lo elegido, notas,
cupón y subtotal. El local responde confirmando disponibilidad y total. El pedido queda guardado en el navegador
del cliente aunque cierre la página.
