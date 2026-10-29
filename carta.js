/*
  CARTA
  =====
  Aquí están los datos del local, los colores, el horario y todos los productos con sus precios.
  Lo más fácil es editarla desde el panel (tu-pagina/admin). Para editarla aquí, cambia el texto
  entre comillas o el número y guarda el archivo.

  Reglas rápidas:
  - Los precios van sin punto ni signo: 14500 (no "$14.500").
  - "tema": colores de la marca. "color" es el principal (botones, detalles) y "colorDestacado" el de
    los títulos destacados. Van en formato #rrggbb. Si quedan vacíos, se usan el rojo y el amarillo de la plantilla.
  - Horario: "13:00-22:00" o "cerrado". Para dos turnos: "12:00-15:30, 19:00-23:00".
    Si "horario" queda en null, la página no muestra abierto/cerrado y siempre deja pedir.
  - horarioConfirmado: con false el horario solo se muestra como referencia ("por confirmar"):
    no aparece abierto/cerrado ni se bloquean pedidos. Cámbialo a true cuando esté confirmado.
  - diasCerrados: fechas en que no se atiende aunque el horario diga abierto. Ej: ["2026-12-25"].
  - "textos": los títulos y textos fijos de la página (portada, carta, pasos, pie).
  - Lo que quede vacío ("") no se muestra: por ejemplo, sin "direccion" no aparece la sección Ubicación.
  - "secciones" son los botones grandes de la carta (Promos, Sushi, Hamburguesas…) y cada una tiene
    sus "categorias" (si hay más de una, aparecen como botones chicos).
  - Producto agotado: agrega "disponible": false
  - Producto en la portada (promo destacada): agrega "destacado": true y una "foto".
  - Fotos: guárdalas en la carpeta img/carta/ y escribe la ruta, ej: "img/carta/mi-foto.webp".
    Si una categoría tiene al menos un producto con foto, se muestra en tarjetas; si no, en lista.
  - "detalle" con varias líneas (separadas por \n) se muestra como «Ver qué incluye».
  - "opciones": lo que el cliente elige (ej: ["Simple", "Doble"]).
    Si cada opción tiene otro precio, ponlo en "preciosOpciones".
  - "personalizar": los grupos de "personalizacion" que el cliente elige en ese producto o en toda
    la categoría (ej: ["punto", "agregados"] en las hamburguesas). Un producto con su propio
    "personalizar" no usa el de la categoría.
  - Grupos de "personalizacion":
      "tipo": "elegir" con "min": 1 y "max": 1  → el cliente elige una sí o sí (ej: punto de la carne).
      "tipo": "extra" con "max": 10             → agregados opcionales con precio (ej: tocino +$1.000).
      "porRoll": true                           → se elige en cada roll (proteína, relleno, envoltura).
      "porDefecto": true en una opción          → queda marcada de entrada.
  - "cupones": códigos de descuento (un cupón por pedido).
      "tipo": "porcentaje" (10 = 10%) o "monto" (2000 = $2.000), con su "valor".
      Opcionales: "minimo" (pedido mínimo), "tope" (descuento máximo de un porcentaje),
      "desde" y "hasta" ("2026-12-31"), "dias" (["martes"]), "modo" ("retiro" o "delivery"),
      "aplica" (ids de categorías: el descuento se calcula solo sobre esas), "activo": false (apagado)
      y "visible": false (no aparece en la página; sirve para redes o volantes).
      Ojo: los códigos se pueden ver en este archivo. El local confirma cada cupón en el WhatsApp.
  - "rolls": cuántos rolls arma el cliente en ese producto (20 cortes = 2 rolls de 10).
  - En una opción de "personalizacion", "gratis": 1 significa que la primera de esa opción no se cobra
    y desde la segunda se cobra su precio (ej: la primera envoltura en palta y la primera en queso).
  Cuidado con las comas: cada elemento de una lista va separado por una coma.
*/
window.CARTA = {
  "negocio": {
    "nombre": "El Rincón del Sushi",
    "whatsapp": "56976400876",
    "whatsappVisible": "+56 9 7640 0876",
    "facebook": "",
    "instagram": "_rincondelsushi",
    "direccion": "",
    "sector": "",
    "ciudad": "Ovalle",
    "region": "",
    "mapa": "",
    "mapaBusqueda": "",
    "valorDelivery": 2500,
    "notaDelivery": "Sector urbano de Ovalle",
    "datosTransferencia": "",
    "sucursales": [
      {
        "nombre": "Villa Los Naranjos",
        "whatsapp": "56976400876",
        "whatsappVisible": "+56 9 7640 0876",
        "direccion": "Los Sauces 895"
      },
      {
        "nombre": "Villa El Portal",
        "whatsapp": "56946324426",
        "whatsappVisible": "+56 9 4632 4426"
      }
    ],
    "zonaDelivery": {
      "nombre": "sector urbano de Ovalle",
      "poligono": [
        [
          -30.57,
          -71.215
        ],
        [
          -30.57,
          -71.18
        ],
        [
          -30.582,
          -71.16
        ],
        [
          -30.615,
          -71.16
        ],
        [
          -30.63,
          -71.18
        ],
        [
          -30.63,
          -71.22
        ],
        [
          -30.612,
          -71.238
        ],
        [
          -30.585,
          -71.235
        ]
      ]
    },
    "pagosDelivery": [
      "Efectivo",
      "Transferencia",
      "Edenred"
    ],
    "pagosRetiro": [
      "Efectivo",
      "Transferencia",
      "Tarjeta",
      "Edenred"
    ]
  },
  "tema": {
    "color": "#d01c23",
    "colorDestacado": "#ffcc1f"
  },
  "horario": null,
  "horarioConfirmado": false,
  "diasCerrados": [],
  "textos": {
    "portada": {
      "titulo": "¿Pedimos",
      "destacado": "sushi?",
      "bajada": "Elige tus favoritos, pide para retiro o delivery y paga como te acomode."
    },
    "carta": {
      "titulo": "Elige tu",
      "destacado": "tabla",
      "bajada": "Promos, menú del día, tablas, cortes premium, rolls con topping, hand rolls, especiales, box, aperitivos, bebidas y salsas. Suma lo que quieras al pedido."
    },
    "cupones": {
      "titulo": "Cupones",
      "destacado": "de la semana",
      "bajada": "Toca «Usar cupón» y el descuento se aplica solo en tu pedido. Un cupón por pedido."
    },
    "arma": {
      "titulo": "Arma tu",
      "destacado": "hand roll"
    },
    "pasos": {
      "titulo": "Haz tu pedido",
      "destacado": "en 3 pasos.",
      "lista": [
        {
          "titulo": "Elige o arma",
          "texto": "Escoge una promo, tu tabla o tus cortes, o arma tus hand rolls y especiales como más te gusten."
        },
        {
          "titulo": "Retiro o delivery",
          "texto": "Elige tu sucursal, Villa Los Naranjos o Villa El Portal, o escribe tu dirección y elígela en la lista."
        },
        {
          "titulo": "Paga y envía",
          "texto": "Paga online o al recibir. El pedido llega al WhatsApp de la sucursal y te avisamos por correo."
        }
      ]
    },
    "ubicacion": {
      "titulo": "Te esperamos"
    },
    "antojo": {
      "titulo": "¿Qué se te",
      "destacado": "antoja hoy?"
    }
  },
  "secciones": [
    {
      "nombre": "Súper promociones",
      "categorias": [
        {
          "id": "promos-de-la-semana",
          "nombre": "Promos de la semana",
          "nota": "Cada una vale solo su día.",
          "productos": [
            {
              "id": "promo-lunes",
              "nombre": "Promo especial de lunes: 30 piezas",
              "precio": 9990,
              "foto": "img/carta/promo-lunes.webp",
              "dias": [
                "lunes"
              ],
              "destacado": true,
              "detalle": "10 cortes envueltos en panko: pollo, queso y cebollín\n10 cortes envueltos en panko: camarón, queso y aceituna\n5 cortes envueltos en queso: pollo, queso y morrón\n5 cortes envueltos en palta: champiñón, queso y pepino"
            },
            {
              "id": "promo-martes",
              "nombre": "Promoción martes: 50 cortes calientes",
              "precio": 13990,
              "foto": "img/carta/promo-martes.webp",
              "dias": [
                "martes"
              ],
              "destacado": true,
              "detalle": "50 cortes calientes, fritos en panko."
            },
            {
              "id": "promo-miercoles",
              "nombre": "Miércoles 3x2 en sushiburger",
              "precio": 15000,
              "foto": "img/carta/promo-miercoles.webp",
              "dias": [
                "miercoles"
              ],
              "destacado": true,
              "rolls": 3,
              "unidad": "Sushiburger",
              "personalizar": [
                "sb3-proteina",
                "sb3-agregado-1",
                "sb3-agregado-2",
                "sb3-agregado-3"
              ],
              "detalle": "Lleva 3 sushiburger y paga solo 2. Cada una con base de queso crema, 1 proteína y 3 agregados."
            }
          ]
        },
        {
          "id": "promos-con-bebida",
          "nombre": "Con Coca-Cola",
          "productos": [
            {
              "id": "promocion-a1",
              "nombre": "Promoción A1",
              "precio": 17800,
              "foto": "img/carta/promo-bandeja-bebida.webp",
              "detalle": "10 cortes calientes: pollo, queso y cebollín\n10 cortes calientes: camarón, queso y aceituna\n10 cortes calientes: kanikama, queso y cebollín\n10 cortes fríos envueltos en queso: pollo, queso y morrón\n10 cortes fríos envueltos en palta: champiñón, queso y pepino",
              "nota": "50 cortes mixtos + Coca-Cola 1,25 L.",
              "destacado": true
            },
            {
              "id": "promocion-a2",
              "nombre": "Promoción A2",
              "precio": 17800,
              "foto": "img/carta/promo-panko-bebida.webp",
              "detalle": "20 cortes calientes: pollo, queso y cebollín\n20 cortes calientes: camarón, queso y aceituna\n10 cortes calientes: kanikama, queso y cebollín",
              "nota": "50 cortes calientes + Coca-Cola 1,25 L.",
              "destacado": true
            },
            {
              "id": "promocion-b1",
              "nombre": "Promoción B1",
              "precio": 19800,
              "foto": "img/carta/promo-bandeja-bebida.webp",
              "detalle": "20 cortes calientes: pollo, queso y cebollín\n10 cortes calientes: camarón, queso y aceituna\n10 cortes calientes: kanikama, queso y cebollín\n10 cortes fríos envueltos en queso: pollo, queso y morrón\n10 cortes fríos envueltos en palta: champiñón, queso y pepino",
              "nota": "60 cortes mixtos + Coca-Cola 1,25 L."
            },
            {
              "id": "promocion-b2",
              "nombre": "Promoción B2",
              "precio": 19800,
              "foto": "img/carta/promo-panko-bebida.webp",
              "detalle": "20 cortes calientes: pollo, queso y cebollín\n20 cortes calientes: camarón, queso y aceituna\n20 cortes calientes: kanikama, queso y cebollín",
              "nota": "60 cortes calientes + Coca-Cola 1,25 L."
            }
          ]
        },
        {
          "id": "promos-con-acompanamiento",
          "nombre": "Con arrollados o gyozas",
          "productos": [
            {
              "id": "promocion-c",
              "nombre": "Promoción C",
              "precio": 19000,
              "foto": "img/carta/promo-bandeja-arrollados.webp",
              "detalle": "50 cortes mixtos o en panko, a elección\nMixtos: 10 pollo, 10 camarón y 10 kanikama calientes; 10 fríos en queso y 10 en palta\nEn panko: 20 pollo, 20 camarón y 10 kanikama\n5 arrollados (primavera o jamón queso) o 5 gyozas (pollo, cerdo, camarón o vegetarianas)",
              "nota": "50 cortes + arrollados o gyozas.",
              "opciones": [
                "Mixtos",
                "En panko"
              ],
              "personalizar": [
                "promo-acompanamiento"
              ],
              "destacado": true
            },
            {
              "id": "promocion-d",
              "nombre": "Promoción D",
              "precio": 21000,
              "foto": "img/carta/promo-panko-arrollados.webp",
              "detalle": "60 cortes mixtos o en panko, a elección\nMixtos: 20 pollo, 10 camarón y 10 kanikama calientes; 10 fríos en queso y 10 en palta\nEn panko: 20 pollo, 20 camarón y 20 kanikama\n5 arrollados (primavera o jamón queso) o 5 gyozas (pollo, cerdo, camarón o vegetarianas)",
              "nota": "60 cortes + arrollados o gyozas.",
              "opciones": [
                "Mixtos",
                "En panko"
              ],
              "personalizar": [
                "promo-acompanamiento"
              ],
              "destacado": true
            }
          ]
        }
      ]
    },
    {
      "nombre": "Menú del día",
      "categorias": [
        {
          "id": "menu-del-dia",
          "nombre": "Menú del día",
          "nota": "Almuerzos ricos, contundentes y preparados al momento.",
          "productos": [
            {
              "id": "menu-del-dia",
              "nombre": "Menú del día",
              "precio": 5000,
              "foto": "img/carta/menu-del-dia.webp",
              "detalle": "1 proteína a elección y 2 agregados a elección (arroz, ensalada o papas fritas).",
              "personalizar": [
                "md-proteina",
                "md-agregados",
                "md-extras"
              ]
            }
          ]
        }
      ]
    },
    {
      "nombre": "Tablas",
      "categorias": [
        {
          "id": "tablas-mixtas",
          "nombre": "Tablas mixtas",
          "nota": "Cortes calientes y fríos.",
          "productos": [
            {
              "id": "tabla-20-mixtos",
              "nombre": "20 cortes mixtos",
              "detalle": "10 cortes calientes: pollo, queso y cebollín\n5 cortes fríos envueltos en queso: pollo, queso y morrón\n5 cortes fríos envueltos en palta: champiñón, queso y pepino",
              "precio": 9500,
              "foto": "img/carta/tabla-20-cortes.webp"
            },
            {
              "id": "tabla-30-mixtos",
              "nombre": "30 cortes mixtos",
              "detalle": "10 cortes calientes: pollo, queso y cebollín\n10 cortes calientes: camarón, queso y aceituna\n5 cortes fríos envueltos en queso: pollo, queso y morrón\n5 cortes fríos envueltos en palta: champiñón, queso y pepino",
              "precio": 11500,
              "foto": "img/carta/tabla-30-cortes.webp"
            },
            {
              "id": "tabla-40-mixtos",
              "nombre": "40 cortes mixtos",
              "detalle": "10 cortes calientes: pollo, queso y cebollín\n10 cortes calientes: camarón, queso y aceituna\n10 cortes calientes: kanikama, queso y cebollín\n5 cortes fríos envueltos en queso: pollo, queso y morrón\n5 cortes fríos envueltos en palta: champiñón, queso y pepino",
              "precio": 14500,
              "foto": "img/carta/tabla-40-cortes.webp"
            },
            {
              "id": "tabla-40-mixtos-sin-kanikama",
              "nombre": "40 cortes mixtos sin kanikama",
              "detalle": "10 cortes calientes: pollo, queso y cebollín\n10 cortes calientes: camarón, queso y aceituna\n10 cortes calientes: pollo, queso y palta\n5 cortes fríos envueltos en queso: pollo, queso y morrón\n5 cortes fríos envueltos en palta: champiñón, queso y pepino",
              "precio": 15500,
              "foto": "img/carta/tabla-40-cortes.webp"
            },
            {
              "id": "tabla-50-mixtos",
              "nombre": "50 cortes mixtos",
              "detalle": "10 cortes calientes: pollo, queso y cebollín\n10 cortes calientes: camarón, queso y aceituna\n10 cortes calientes: kanikama, queso y cebollín\n10 cortes fríos envueltos en queso: pollo, queso y morrón\n10 cortes fríos envueltos en palta: champiñón, queso y pepino",
              "precio": 17000,
              "foto": "img/carta/tabla-50-cortes.webp"
            },
            {
              "id": "tabla-50-mixtos-sin-kanikama",
              "nombre": "50 cortes mixtos sin kanikama",
              "detalle": "10 cortes calientes: pollo, queso y cebollín\n10 cortes calientes: camarón, queso y aceituna\n10 cortes calientes: pollo, queso y palta\n10 cortes fríos envueltos en queso: pollo, queso y morrón\n10 cortes fríos envueltos en palta: champiñón, queso y pepino",
              "precio": 18500,
              "foto": "img/carta/tabla-50-cortes.webp"
            },
            {
              "id": "tabla-60-mixtos",
              "nombre": "60 cortes mixtos",
              "detalle": "20 cortes calientes: pollo, queso y cebollín\n10 cortes calientes: camarón, queso y aceituna\n10 cortes calientes: kanikama, queso y cebollín\n10 cortes fríos envueltos en queso: pollo, queso y morrón\n10 cortes fríos envueltos en palta: champiñón, queso y pepino",
              "precio": 19000,
              "foto": "img/carta/tabla-60-cortes.webp"
            },
            {
              "id": "tabla-60-mixtos-sin-kanikama",
              "nombre": "60 cortes mixtos sin kanikama",
              "detalle": "20 cortes calientes: pollo, queso y cebollín\n10 cortes calientes: camarón, queso y aceituna\n10 cortes calientes: pollo, queso y palta\n10 cortes fríos envueltos en queso: pollo, queso y morrón\n10 cortes fríos envueltos en palta: champiñón, queso y pepino",
              "precio": 20000,
              "foto": "img/carta/tabla-60-cortes.webp"
            },
            {
              "id": "tabla-70-mixtos",
              "nombre": "70 cortes mixtos",
              "detalle": "20 cortes calientes: pollo, queso y cebollín\n20 cortes calientes: camarón, queso y aceituna\n10 cortes calientes: kanikama, queso y cebollín\n10 cortes fríos envueltos en queso: pollo, queso y morrón\n10 cortes fríos envueltos en palta: champiñón, queso y pepino",
              "precio": 22000,
              "foto": "img/carta/tabla-70-cortes.webp"
            },
            {
              "id": "tabla-70-mixtos-sin-kanikama",
              "nombre": "70 cortes mixtos sin kanikama",
              "detalle": "20 cortes calientes: pollo, queso y cebollín\n20 cortes calientes: camarón, queso y aceituna\n10 cortes calientes: pollo, queso y palta\n10 cortes fríos envueltos en queso: pollo, queso y morrón\n10 cortes fríos envueltos en palta: champiñón, queso y pepino",
              "precio": 23000,
              "foto": "img/carta/tabla-70-cortes.webp"
            },
            {
              "id": "tabla-80-mixtos",
              "nombre": "80 cortes mixtos",
              "detalle": "20 cortes calientes: pollo, queso y cebollín\n20 cortes calientes: camarón, queso y aceituna\n20 cortes calientes: kanikama, queso y cebollín\n10 cortes fríos envueltos en queso: pollo, queso y morrón\n10 cortes fríos envueltos en palta: champiñón, queso y pepino",
              "precio": 24000,
              "foto": "img/carta/tabla-80-cortes.webp"
            },
            {
              "id": "tabla-80-mixtos-sin-kanikama",
              "nombre": "80 cortes mixtos sin kanikama",
              "detalle": "20 cortes calientes: pollo, queso y cebollín\n20 cortes calientes: camarón, queso y aceituna\n20 cortes calientes: pollo, queso y palta\n10 cortes fríos envueltos en queso: pollo, queso y morrón\n10 cortes fríos envueltos en palta: champiñón, queso y pepino",
              "precio": 25000,
              "foto": "img/carta/tabla-80-cortes.webp"
            },
            {
              "id": "tabla-100-mixtos",
              "nombre": "100 cortes mixtos",
              "detalle": "20 cortes calientes: pollo, queso y cebollín\n20 cortes calientes: camarón, queso y aceituna\n20 cortes calientes: kanikama, queso y cebollín\n20 cortes fríos envueltos en queso: pollo, queso y morrón\n20 cortes fríos envueltos en palta: champiñón, queso y pepino",
              "precio": 27000,
              "foto": "img/carta/tabla-100-cortes.webp"
            },
            {
              "id": "tabla-100-mixtos-sin-kanikama",
              "nombre": "100 cortes mixtos sin kanikama",
              "detalle": "20 cortes calientes: pollo, queso y cebollín\n20 cortes calientes: camarón, queso y aceituna\n20 cortes calientes: pollo, queso y palta\n20 cortes fríos envueltos en queso: pollo, queso y morrón\n20 cortes fríos envueltos en palta: champiñón, queso y pepino",
              "precio": 29000,
              "foto": "img/carta/tabla-100-cortes.webp"
            },
            {
              "id": "tabla-200-mixtos",
              "nombre": "200 cortes mixtos",
              "precio": 50000,
              "detalle": "200 cortes mixtos, calientes y fríos."
            },
            {
              "id": "tabla-200-mixtos-sin-kanikama",
              "nombre": "200 cortes mixtos sin kanikama",
              "precio": 51000,
              "detalle": "200 cortes mixtos, calientes y fríos, sin kanikama: con pollo, palta y queso crema."
            }
          ]
        },
        {
          "id": "tablas-calientes",
          "nombre": "Tablas calientes",
          "nota": "Todos los cortes calientes.",
          "productos": [
            {
              "id": "tabla-20-calientes",
              "nombre": "20 cortes calientes",
              "detalle": "10 cortes calientes: pollo, queso y cebollín\n10 cortes calientes: camarón, queso y aceituna",
              "precio": 9500,
              "foto": "img/carta/tabla-20-cortes.webp"
            },
            {
              "id": "tabla-30-calientes",
              "nombre": "30 cortes calientes",
              "detalle": "10 cortes calientes: pollo, queso y cebollín\n10 cortes calientes: camarón, queso y aceituna\n10 cortes calientes: kanikama, queso y cebollín",
              "precio": 11500,
              "foto": "img/carta/tabla-30-cortes.webp"
            },
            {
              "id": "tabla-30-calientes-sin-kanikama",
              "nombre": "30 cortes calientes sin kanikama",
              "detalle": "10 cortes calientes: pollo, queso y cebollín\n10 cortes calientes: camarón, queso y aceituna\n10 cortes calientes: pollo, queso y palta",
              "precio": 12500,
              "foto": "img/carta/tabla-30-cortes.webp"
            },
            {
              "id": "tabla-40-calientes",
              "nombre": "40 cortes calientes",
              "detalle": "20 cortes calientes: pollo, queso y cebollín\n10 cortes calientes: camarón, queso y aceituna\n10 cortes calientes: kanikama, queso y cebollín",
              "precio": 14500,
              "foto": "img/carta/tabla-40-cortes.webp"
            },
            {
              "id": "tabla-40-calientes-sin-kanikama",
              "nombre": "40 cortes calientes sin kanikama",
              "detalle": "20 cortes calientes: pollo, queso y cebollín\n10 cortes calientes: camarón, queso y aceituna\n10 cortes calientes: pollo, queso y palta",
              "precio": 15500,
              "foto": "img/carta/tabla-40-cortes.webp"
            },
            {
              "id": "tabla-50-calientes",
              "nombre": "50 cortes calientes",
              "precio": 17000,
              "detalle": "20 cortes calientes: pollo, queso y cebollín\n20 cortes calientes: camarón, queso y aceituna\n10 cortes calientes: kanikama, queso y cebollín",
              "foto": "img/carta/tabla-50-cortes.webp"
            },
            {
              "id": "tabla-50-calientes-sin-kanikama",
              "nombre": "50 cortes calientes sin kanikama",
              "precio": 18500,
              "detalle": "20 cortes calientes: pollo, queso y cebollín\n20 cortes calientes: camarón, queso y aceituna\n10 cortes calientes: pollo, queso y palta",
              "foto": "img/carta/tabla-50-cortes.webp"
            },
            {
              "id": "tabla-60-calientes",
              "nombre": "60 cortes calientes",
              "detalle": "20 cortes calientes: pollo, queso y cebollín\n20 cortes calientes: camarón, queso y aceituna\n20 cortes calientes: kanikama, queso y cebollín",
              "precio": 19000,
              "foto": "img/carta/tabla-60-cortes.webp"
            },
            {
              "id": "tabla-60-calientes-sin-kanikama",
              "nombre": "60 cortes calientes sin kanikama",
              "detalle": "20 cortes calientes: pollo, queso y cebollín\n20 cortes calientes: camarón, queso y aceituna\n20 cortes calientes: pollo, queso y palta",
              "precio": 20000,
              "foto": "img/carta/tabla-60-cortes.webp"
            },
            {
              "id": "tabla-70-calientes",
              "nombre": "70 cortes calientes",
              "detalle": "20 cortes calientes: pollo, queso y cebollín\n20 cortes calientes: camarón, queso y aceituna\n20 cortes calientes: kanikama, queso y cebollín\n10 cortes calientes: champiñón, queso y pepino",
              "precio": 22000,
              "foto": "img/carta/tabla-70-cortes.webp"
            },
            {
              "id": "tabla-70-calientes-sin-kanikama",
              "nombre": "70 cortes calientes sin kanikama",
              "detalle": "20 cortes calientes: pollo, queso y cebollín\n20 cortes calientes: camarón, queso y aceituna\n20 cortes calientes: pollo, queso y palta\n10 cortes calientes: champiñón, queso y pepino",
              "precio": 23000,
              "foto": "img/carta/tabla-70-cortes.webp"
            },
            {
              "id": "tabla-80-calientes",
              "nombre": "80 cortes calientes",
              "detalle": "20 cortes calientes: pollo, queso y cebollín\n20 cortes calientes: camarón, queso y aceituna\n20 cortes calientes: kanikama, queso y cebollín\n20 cortes calientes: champiñón, queso y pepino",
              "precio": 24000,
              "foto": "img/carta/tabla-80-cortes.webp"
            },
            {
              "id": "tabla-80-calientes-sin-kanikama",
              "nombre": "80 cortes calientes sin kanikama",
              "detalle": "20 cortes calientes: pollo, queso y cebollín\n20 cortes calientes: camarón, queso y aceituna\n20 cortes calientes: pollo, queso y palta\n20 cortes calientes: champiñón, queso y pepino",
              "precio": 25000,
              "foto": "img/carta/tabla-80-cortes.webp"
            },
            {
              "id": "tabla-100-calientes",
              "nombre": "100 cortes calientes",
              "detalle": "40 cortes calientes: pollo, queso y cebollín\n40 cortes calientes: camarón, queso y aceituna\n20 cortes calientes: kanikama, queso y cebollín",
              "precio": 27000,
              "foto": "img/carta/tabla-100-cortes.webp"
            },
            {
              "id": "tabla-100-calientes-sin-kanikama",
              "nombre": "100 cortes calientes sin kanikama",
              "detalle": "40 cortes calientes: pollo, queso y cebollín\n40 cortes calientes: camarón, queso y aceituna\n20 cortes calientes: pollo, queso y palta",
              "precio": 29000,
              "foto": "img/carta/tabla-100-cortes.webp"
            },
            {
              "id": "tabla-200-calientes",
              "nombre": "200 cortes calientes",
              "precio": 50000,
              "detalle": "200 cortes calientes, fritos en panko."
            },
            {
              "id": "tabla-200-calientes-sin-kanikama",
              "nombre": "200 cortes calientes sin kanikama",
              "precio": 51000,
              "detalle": "200 cortes calientes, fritos en panko, sin kanikama: con pollo, palta y queso crema."
            }
          ]
        },
        {
          "id": "tablas-especiales",
          "nombre": "Tablas especiales",
          "productos": [
            {
              "id": "tabla-especial-1",
              "nombre": "Tabla especial 1",
              "precio": 11500,
              "foto": "img/carta/tabla-especial-1.webp",
              "detalle": "10 cortes envueltos en salmón: camarón, queso y palta\n10 cortes envueltos en tempura: pollo, queso y champiñón"
            },
            {
              "id": "tabla-especial-2",
              "nombre": "Tabla especial 2",
              "precio": 10000,
              "foto": "img/carta/tabla-especial-2.webp",
              "detalle": "10 cortes envueltos en panko merkén: pollo, queso y cebollín\n10 cortes envueltos en tempura: pollo, queso y palta"
            },
            {
              "id": "tabla-especial-3",
              "nombre": "Tabla especial 3",
              "precio": 13000,
              "foto": "img/carta/tabla-especial-3.webp",
              "detalle": "10 cortes envueltos en queso crema: salmón, queso y palta\n10 cortes envueltos en tempura: pollo, queso y almendra"
            },
            {
              "id": "tabla-especial-4",
              "nombre": "Tabla especial 4",
              "precio": 11500,
              "foto": "img/carta/tabla-especial-4.webp",
              "detalle": "10 cortes envueltos en tempura: salmón, queso y cebollín\n10 cortes envueltos en tempura: vacuno, queso y palta"
            },
            {
              "id": "tabla-especial-5",
              "nombre": "Tabla especial 5",
              "precio": 20000,
              "foto": "img/carta/tabla-especial-5.webp",
              "detalle": "10 cortes envueltos en tempura: salmón, queso y palta\n10 cortes envueltos en palta: camarón, queso y cebollín\n10 cortes envueltos en queso crema: pollo, queso y frutilla"
            },
            {
              "id": "tabla-fria",
              "nombre": "Tabla fría (20 cortes)",
              "precio": 12500,
              "foto": "img/carta/tabla-fria.webp",
              "detalle": "10 cortes envueltos en queso crema: pollo, queso y palmito\n10 cortes envueltos en palta: camarón, queso y champiñón"
            },
            {
              "id": "tabla-panko-pollo-vacuno",
              "nombre": "Tabla panko pollo vacuno",
              "precio": 15500,
              "foto": "img/carta/tabla-panko-pollo-vacuno.webp",
              "detalle": "10 cortes: pollo, queso crema y cebollín\n10 cortes: pollo, queso crema y champiñones\n10 cortes: vacuno, queso crema y palta"
            },
            {
              "id": "tabla-vegetariana",
              "nombre": "Tabla vegetariana (30 cortes)",
              "precio": 16000,
              "foto": "img/carta/tabla-vegetariana.webp",
              "detalle": "10 cortes envueltos en panko: palta, queso crema y cebollín\n10 cortes envueltos en panko: palmito, queso crema y aceituna\n10 cortes envueltos en palta: cebollín, queso crema y aceituna"
            },
            {
              "id": "tabla-vegana",
              "nombre": "Tabla vegana (30 cortes)",
              "precio": 17000,
              "foto": "img/carta/tabla-vegana.webp",
              "detalle": "10 cortes envueltos en palta: palmito y choclito\n10 cortes envueltos en panko: palta y aceituna\n10 cortes envueltos en panko: aceituna y choclito"
            },
            {
              "id": "tabla-panko-sin-nori",
              "nombre": "Tabla panko sin nori (30 cortes)",
              "precio": 15500,
              "foto": "img/carta/tabla-panko-sin-nori.webp",
              "detalle": "10 cortes: pollo, queso crema y palta\n10 cortes: pollo, queso crema y cebollín\n10 cortes: camarón, queso crema y aceituna"
            },
            {
              "id": "tabla-panko",
              "nombre": "Tabla panko (30 cortes)",
              "precio": 15500,
              "foto": "img/carta/tabla-panko.webp",
              "detalle": "10 cortes: pollo, queso crema y cebollín\n10 cortes: pollo, queso crema y palmito\n10 cortes envueltos en palta: pollo, queso crema y aceituna"
            },
            {
              "id": "tabla-panko-especial",
              "nombre": "Tabla panko especial (40 cortes)",
              "precio": 19000,
              "foto": "img/carta/tabla-panko-especial.webp",
              "detalle": "10 cortes: pollo, queso crema y palmito\n10 cortes: pollo, queso crema y aceituna\n10 cortes: camarón, queso crema y palta\n10 cortes: champiñón, queso crema y aceituna"
            },
            {
              "id": "tabla-pollo-panko",
              "nombre": "Tabla pollo panko (50 cortes)",
              "precio": 23500,
              "foto": "img/carta/tabla-pollo-panko.webp",
              "detalle": "20 cortes: pollo, queso crema y palta\n20 cortes: pollo, queso crema y aceituna\n10 cortes: pollo, queso crema y cebollín"
            },
            {
              "id": "tabla-fria-especial",
              "nombre": "Tabla fría especial (40 cortes)",
              "precio": 24500,
              "foto": "img/carta/tabla-fria-especial.webp",
              "detalle": "10 cortes envueltos en nori: queso crema, champiñón y aceituna\n10 cortes envueltos en palta: queso crema, camarón y aceituna\n10 cortes envueltos en sésamo: queso crema, champiñón y palta\n10 cortes envueltos en queso crema: pollo, queso crema y palmito"
            }
          ]
        },
        {
          "id": "tortas",
          "nombre": "Tortas de sushi",
          "nota": "Para celebrar: con velas incluidas. Solo retiro.",
          "productos": [
            {
              "id": "torta-corazon",
              "nombre": "Torta de corazón",
              "precio": 19500,
              "foto": "img/carta/torta-corazon.webp",
              "detalle": "60 cortes mixtos\nVelas incluidas",
              "nota": "Solo retiro."
            },
            {
              "id": "torta-corona",
              "nombre": "Torta de corona",
              "precio": 20500,
              "foto": "img/carta/torta-corona.webp",
              "detalle": "60 cortes mixtos\nVelas incluidas",
              "nota": "Solo retiro."
            },
            {
              "id": "torta-familiar",
              "nombre": "Torta familiar",
              "precio": 28500,
              "foto": "img/carta/torta-familiar.webp",
              "detalle": "100 cortes mixtos\nVelas incluidas",
              "nota": "Solo retiro."
            }
          ]
        }
      ]
    },
    {
      "nombre": "Cortes premium",
      "categorias": [
        {
          "id": "cortes-premium",
          "nombre": "Cortes premium",
          "productos": [
            {
              "id": "pollo-spicy",
              "nombre": "Pollo spicy",
              "detalle": "10 cortes envueltos en panko de pollo, queso y cebollín con salsa spicy.",
              "precio": 5200,
              "foto": "img/carta/pollo-spicy.webp"
            },
            {
              "id": "guacamole-roll",
              "nombre": "Guacamole roll",
              "detalle": "10 cortes envueltos en sésamo mixto. Pollo, queso y palta con topping de guacamole.",
              "precio": 7000,
              "foto": "img/carta/guacamole-roll.webp"
            },
            {
              "id": "camaron-al-olivo",
              "nombre": "Camarón al olivo",
              "detalle": "10 cortes envueltos en panko de camarón, queso y palta con salsa al olivo.",
              "precio": 5200,
              "foto": "img/carta/camaron-al-olivo.webp"
            },
            {
              "id": "pulpo-al-olivo",
              "nombre": "Pulpo al olivo",
              "detalle": "10 cortes envueltos en panko de pulpo, queso y palta con topping de salsa al olivo.",
              "precio": 7000,
              "foto": "img/carta/pulpo-al-olivo.webp"
            },
            {
              "id": "masago-roll",
              "nombre": "Masago roll",
              "detalle": "10 cortes envueltos en masago con salmón, queso crema y cebollín o palta.",
              "precio": 8500,
              "foto": "img/carta/masago-roll.webp",
              "opciones": [
                "Cebollín",
                "Palta"
              ],
              "personalizar": [
                "masago-extra"
              ]
            },
            {
              "id": "roll-acevichado",
              "nombre": "Roll acevichado",
              "detalle": "10 cortes envueltos en palta, de camarón, queso y palta. Cubiertos de nuestro exquisito ceviche de salmón.",
              "precio": 8500,
              "foto": "img/carta/roll-acevichado.webp"
            },
            {
              "id": "roll-sin-arroz",
              "nombre": "Roll sin arroz predeterminado",
              "detalle": "10 cortes sin arroz envueltos en palta, de pollo, queso, palmito, cebollín y aceituna.",
              "precio": 8000,
              "foto": "img/carta/roll-sin-arroz.webp"
            },
            {
              "id": "sin-arroz-a-eleccion",
              "nombre": "Sin arroz a elección",
              "precio": 6000,
              "foto": "img/carta/sin-arroz-a-eleccion.webp",
              "detalle": "Base de queso crema: tiene que ser 1 envoltura, 1 proteína y 3 agregados.",
              "personalizar": [
                "sa-envoltura",
                "sa-proteina",
                "sa-agregados",
                "esp-extras"
              ]
            },
            {
              "id": "panko-vacuno",
              "nombre": "Panko vacuno",
              "detalle": "10 cortes envueltos en panko de vacuno, queso y palta.",
              "precio": 5500,
              "foto": "img/carta/panko-vacuno.webp"
            },
            {
              "id": "pulpo-panko",
              "nombre": "Pulpo panko",
              "detalle": "10 cortes envueltos en panko de pulpo, queso y palta.",
              "precio": 6500,
              "foto": "img/carta/pulpo-panko.webp"
            },
            {
              "id": "panko-salmon",
              "nombre": "Panko salmón",
              "detalle": "10 cortes envueltos en panko de salmón, queso y palta.",
              "precio": 6500,
              "foto": "img/carta/panko-salmon.webp"
            }
          ]
        }
      ]
    },
    {
      "nombre": "Rolls",
      "categorias": [
        {
          "id": "topping-spicy",
          "nombre": "Topping spicy",
          "productos": [
            {
              "id": "topping-spicy-1",
              "nombre": "Camarón, queso y palta",
              "precio": 5700,
              "foto": "img/carta/topping-spicy-1.webp",
              "detalle": "10 cortes fritos en panko con topping spicy."
            },
            {
              "id": "topping-spicy-2",
              "nombre": "Pollo, queso y cebollín",
              "precio": 5200,
              "foto": "img/carta/topping-spicy-2.webp",
              "detalle": "10 cortes fritos en panko con topping spicy."
            },
            {
              "id": "topping-spicy-3",
              "nombre": "Pollo, queso y aceituna",
              "precio": 5200,
              "foto": "img/carta/topping-spicy-3.webp",
              "detalle": "10 cortes fritos en panko con topping spicy."
            },
            {
              "id": "topping-spicy-4",
              "nombre": "Pollo, queso y palta",
              "precio": 5700,
              "foto": "img/carta/topping-spicy-4.webp",
              "detalle": "10 cortes fritos en panko con topping spicy."
            },
            {
              "id": "topping-spicy-5",
              "nombre": "Salmón, queso y cebollín",
              "precio": 6700,
              "foto": "img/carta/topping-spicy-5.webp",
              "detalle": "10 cortes fritos en panko con topping spicy."
            },
            {
              "id": "topping-spicy-6",
              "nombre": "Vacuno, queso y champiñón",
              "precio": 6200,
              "foto": "img/carta/topping-spicy-6.webp",
              "detalle": "10 cortes fritos en panko con topping spicy."
            },
            {
              "id": "topping-spicy-7",
              "nombre": "Choclito, queso y cebollín",
              "precio": 5700,
              "foto": "img/carta/topping-spicy-7.webp",
              "detalle": "10 cortes fritos en panko con topping spicy.",
              "nota": "Vegetariano."
            },
            {
              "id": "topping-spicy-8",
              "nombre": "Champiñón y palta",
              "precio": 5700,
              "foto": "img/carta/topping-spicy-8.webp",
              "detalle": "10 cortes fritos en panko con topping spicy.",
              "nota": "Vegano."
            },
            {
              "id": "topping-spicy-9",
              "nombre": "Vacuno, queso y cebollín en palta",
              "precio": 7700,
              "foto": "img/carta/topping-spicy-9.webp",
              "detalle": "10 cortes envueltos en palta con topping spicy."
            },
            {
              "id": "topping-spicy-10",
              "nombre": "Camarón, queso y champiñón en palta",
              "precio": 6700,
              "foto": "img/carta/topping-spicy-10.webp",
              "detalle": "10 cortes envueltos en palta con topping spicy."
            },
            {
              "id": "topping-spicy-11",
              "nombre": "Pollo, queso y aceituna en palta",
              "precio": 6700,
              "foto": "img/carta/topping-spicy-11.webp",
              "detalle": "10 cortes envueltos en palta con topping spicy."
            }
          ]
        },
        {
          "id": "topping-acevichada",
          "nombre": "Topping salsa acevichada",
          "productos": [
            {
              "id": "topping-acevichada-1",
              "nombre": "Vacuno, queso y palta",
              "precio": 6700,
              "foto": "img/carta/topping-acevichada-1.webp",
              "detalle": "10 cortes fritos en panko con topping de salsa acevichada."
            },
            {
              "id": "topping-acevichada-2",
              "nombre": "Camarón, queso y palta",
              "precio": 5700,
              "foto": "img/carta/topping-acevichada-2.webp",
              "detalle": "10 cortes fritos en panko con topping de salsa acevichada."
            },
            {
              "id": "topping-acevichada-3",
              "nombre": "Camarón, queso y aceituna",
              "precio": 5200,
              "foto": "img/carta/topping-acevichada-3.webp",
              "detalle": "10 cortes fritos en panko con topping de salsa acevichada."
            },
            {
              "id": "topping-acevichada-4",
              "nombre": "Palmito, queso y champiñón",
              "precio": 5700,
              "foto": "img/carta/topping-acevichada-4.webp",
              "detalle": "10 cortes fritos en panko con topping de salsa acevichada.",
              "nota": "Vegetariano."
            },
            {
              "id": "topping-acevichada-5",
              "nombre": "Pollo, queso y champiñón",
              "precio": 5200,
              "foto": "img/carta/topping-acevichada-5.webp",
              "detalle": "10 cortes fritos en panko con topping de salsa acevichada."
            },
            {
              "id": "topping-acevichada-6",
              "nombre": "Pollo, queso y cebollín",
              "precio": 5200,
              "foto": "img/carta/topping-acevichada-6.webp",
              "detalle": "10 cortes fritos en panko con topping de salsa acevichada."
            },
            {
              "id": "topping-acevichada-7",
              "nombre": "Pollo, queso y palta",
              "precio": 5700,
              "foto": "img/carta/topping-acevichada-7.webp",
              "detalle": "10 cortes fritos en panko con topping de salsa acevichada."
            },
            {
              "id": "topping-acevichada-8",
              "nombre": "Salmón, queso y cebollín",
              "precio": 6700,
              "foto": "img/carta/topping-acevichada-8.webp",
              "detalle": "10 cortes fritos en panko con topping de salsa acevichada."
            },
            {
              "id": "topping-acevichada-9",
              "nombre": "Vacuno, queso y morrón",
              "precio": 6200,
              "foto": "img/carta/topping-acevichada-9.webp",
              "detalle": "10 cortes fritos en panko con topping de salsa acevichada."
            },
            {
              "id": "topping-acevichada-10",
              "nombre": "Choclito y aceituna",
              "precio": 5200,
              "foto": "img/carta/topping-acevichada-10.webp",
              "detalle": "10 cortes fritos en panko con topping de salsa acevichada.",
              "nota": "Vegano."
            }
          ]
        },
        {
          "id": "topping-olivo",
          "nombre": "Topping al olivo",
          "productos": [
            {
              "id": "topping-olivo-1",
              "nombre": "Camarón, queso y choclito",
              "precio": 5700,
              "foto": "img/carta/topping-olivo-1.webp",
              "detalle": "10 cortes fritos en panko con topping al olivo."
            },
            {
              "id": "topping-olivo-2",
              "nombre": "Palmito y palta",
              "precio": 6200,
              "foto": "img/carta/topping-olivo-2.webp",
              "detalle": "10 cortes fritos en panko con topping al olivo.",
              "nota": "Vegano."
            },
            {
              "id": "topping-olivo-3",
              "nombre": "Choclito, queso y palta",
              "precio": 6200,
              "foto": "img/carta/topping-olivo-3.webp",
              "detalle": "10 cortes fritos en panko con topping al olivo.",
              "nota": "Vegetariano."
            },
            {
              "id": "topping-olivo-4",
              "nombre": "Pollo, queso y palta",
              "precio": 5700,
              "foto": "img/carta/topping-olivo-4.webp",
              "detalle": "10 cortes fritos en panko con topping al olivo."
            },
            {
              "id": "topping-olivo-5",
              "nombre": "Vacuno, queso y champiñón",
              "precio": 6200,
              "foto": "img/carta/topping-olivo-5.webp",
              "detalle": "10 cortes fritos en panko con topping al olivo."
            },
            {
              "id": "topping-olivo-6",
              "nombre": "Salmón, queso y cebollín",
              "precio": 6700,
              "foto": "img/carta/topping-olivo-6.webp",
              "detalle": "10 cortes fritos en panko con topping al olivo."
            },
            {
              "id": "topping-olivo-7",
              "nombre": "Vacuno, queso y palta",
              "precio": 8200,
              "foto": "img/carta/topping-olivo-7.webp",
              "detalle": "10 cortes con topping al olivo."
            },
            {
              "id": "topping-olivo-8",
              "nombre": "Pollo, queso y aceituna",
              "precio": 6700,
              "foto": "img/carta/topping-olivo-8.webp",
              "detalle": "10 cortes con topping al olivo."
            },
            {
              "id": "topping-olivo-9",
              "nombre": "Vacuno, queso y cebollín en palta",
              "precio": 7700,
              "foto": "img/carta/topping-olivo-9.webp",
              "detalle": "10 cortes envueltos en palta con topping al olivo."
            },
            {
              "id": "topping-olivo-10",
              "nombre": "Pollo, queso y palmito en palta",
              "precio": 7200,
              "foto": "img/carta/topping-olivo-10.webp",
              "detalle": "10 cortes envueltos en palta con topping al olivo."
            }
          ]
        },
        {
          "id": "topping-acevichado",
          "nombre": "Topping acevichado",
          "productos": [
            {
              "id": "topping-acevichado-1",
              "nombre": "Vacuno, queso y champiñón",
              "precio": 7500,
              "foto": "img/carta/topping-acevichado-1.webp",
              "detalle": "10 cortes fritos en panko con topping acevichado (ceviche)."
            },
            {
              "id": "topping-acevichado-2",
              "nombre": "Camarón, queso y palta",
              "precio": 7000,
              "foto": "img/carta/topping-acevichado-2.webp",
              "detalle": "10 cortes fritos en panko con topping acevichado (ceviche)."
            },
            {
              "id": "topping-acevichado-3",
              "nombre": "Pollo, queso y palta",
              "precio": 7000,
              "foto": "img/carta/topping-acevichado-3.webp",
              "detalle": "10 cortes fritos en panko con topping acevichado (ceviche)."
            },
            {
              "id": "topping-acevichado-4",
              "nombre": "Camarón, queso y aceituna en palta",
              "precio": 8000,
              "foto": "img/carta/topping-acevichado-4.webp",
              "detalle": "10 cortes envueltos en palta con topping acevichado (ceviche)."
            },
            {
              "id": "topping-acevichado-5",
              "nombre": "Vacuno, queso y palta en palta",
              "precio": 9500,
              "foto": "img/carta/topping-acevichado-5.webp",
              "detalle": "10 cortes envueltos en palta con topping acevichado (ceviche)."
            },
            {
              "id": "topping-acevichado-6",
              "nombre": "Camarón, queso y champiñón en palta",
              "precio": 8500,
              "foto": "img/carta/topping-acevichado-6.webp",
              "detalle": "10 cortes envueltos en palta con topping acevichado (ceviche)."
            },
            {
              "id": "topping-acevichado-7",
              "nombre": "Pollo, queso y palta en palta",
              "precio": 8500,
              "foto": "img/carta/topping-acevichado-7.webp",
              "detalle": "10 cortes envueltos en palta con topping acevichado (ceviche)."
            }
          ]
        },
        {
          "id": "topping-guacamole",
          "nombre": "Topping guacamole",
          "productos": [
            {
              "id": "topping-guacamole-1",
              "nombre": "Vacuno, queso y champiñón",
              "precio": 7500,
              "foto": "img/carta/topping-guacamole-1.webp",
              "detalle": "10 cortes fritos en panko con topping de guacamole."
            },
            {
              "id": "topping-guacamole-2",
              "nombre": "Pollo, queso y aceituna",
              "precio": 6500,
              "foto": "img/carta/topping-guacamole-2.webp",
              "detalle": "10 cortes fritos en panko con topping de guacamole."
            },
            {
              "id": "topping-guacamole-3",
              "nombre": "Pollo, queso y choclito",
              "precio": 7000,
              "foto": "img/carta/topping-guacamole-3.webp",
              "detalle": "10 cortes fritos en panko con topping de guacamole."
            },
            {
              "id": "topping-guacamole-4",
              "nombre": "Camarón, queso y aceituna",
              "precio": 6500,
              "foto": "img/carta/topping-guacamole-4.webp",
              "detalle": "10 cortes fritos en panko con topping de guacamole."
            },
            {
              "id": "topping-guacamole-5",
              "nombre": "Vacuno, queso y aceituna en palta",
              "precio": 9000,
              "foto": "img/carta/topping-guacamole-5.webp",
              "detalle": "10 cortes envueltos en palta con topping de guacamole."
            },
            {
              "id": "topping-guacamole-6",
              "nombre": "Palta, queso y aceituna",
              "precio": 7000,
              "foto": "img/carta/topping-guacamole-6.webp",
              "detalle": "10 cortes fritos en panko con topping de guacamole.",
              "nota": "Vegetariano."
            },
            {
              "id": "topping-guacamole-7",
              "nombre": "Palta y champiñón",
              "precio": 7000,
              "foto": "img/carta/topping-guacamole-7.webp",
              "detalle": "10 cortes fritos en panko con topping de guacamole.",
              "nota": "Vegano."
            }
          ]
        },
        {
          "id": "topping-papas-hilo",
          "nombre": "Topping papas hilo",
          "productos": [
            {
              "id": "topping-papas-hilo-1",
              "nombre": "Salmón, queso y palta",
              "precio": 7500,
              "foto": "img/carta/topping-papas-hilo-1.webp",
              "detalle": "10 cortes fritos en panko con topping de papas hilo."
            },
            {
              "id": "topping-papas-hilo-2",
              "nombre": "Camarón, queso y palta",
              "precio": 6000,
              "foto": "img/carta/topping-papas-hilo-2.webp",
              "detalle": "10 cortes fritos en panko con topping de papas hilo."
            },
            {
              "id": "topping-papas-hilo-3",
              "nombre": "Vacuno, queso y palta",
              "precio": 7000,
              "foto": "img/carta/topping-papas-hilo-3.webp",
              "detalle": "10 cortes fritos en panko con topping de papas hilo."
            },
            {
              "id": "topping-papas-hilo-4",
              "nombre": "Pollo, queso y palta",
              "precio": 6000,
              "foto": "img/carta/topping-papas-hilo-4.webp",
              "detalle": "10 cortes fritos en panko con topping de papas hilo."
            },
            {
              "id": "topping-papas-hilo-5",
              "nombre": "Palmito y palta",
              "precio": 6500,
              "foto": "img/carta/topping-papas-hilo-5.webp",
              "detalle": "10 cortes fritos en panko con topping de papas hilo.",
              "nota": "Vegano."
            },
            {
              "id": "topping-papas-hilo-6",
              "nombre": "Champiñón, queso y morrón",
              "precio": 5500,
              "foto": "img/carta/topping-papas-hilo-6.webp",
              "detalle": "10 cortes fritos en panko con topping de papas hilo.",
              "nota": "Vegetariano."
            }
          ]
        },
        {
          "id": "arma-tu-roll",
          "nombre": "Arma tu roll",
          "productos": [
            {
              "id": "arma-tu-roll",
              "nombre": "Arma tu roll",
              "precio": 4500,
              "foto": "img/carta/arma-tu-roll.webp",
              "detalle": "10 cortes: elige envoltura, proteína, relleno y topping.",
              "personalizar": [
                "ar-envoltura",
                "ar-proteina",
                "ar-relleno",
                "ar-topping",
                "ar-nori",
                "ar-extras"
              ]
            }
          ]
        }
      ]
    },
    {
      "nombre": "Hand rolls",
      "categorias": [
        {
          "id": "hand-rolls",
          "nombre": "Hand rolls",
          "ayuda": "Hand roll de 20 cm: base de queso + 1 proteína + 1 agregado. Promoción 3 × $10.000 solo en pollo, camarón o kanikama.",
          "personalizar": [
            "hr-proteina",
            "hr-agregado",
            "hr-envoltura"
          ],
          "productos": [
            {
              "id": "hand-roll",
              "nombre": "Hand rolls",
              "precio": 3500,
              "foto": "img/carta/hand-roll.webp",
              "detalle": "Tiene que ser una proteína (base de queso) y un agregado. Ejemplo: pollo, queso y champiñón; kanikama, queso y cebollín.",
              "personalizar": [
                "hr-proteina",
                "hr-agregado",
                "hr-envoltura",
                "hr-extra",
                "hr-sin-nori"
              ]
            },
            {
              "id": "hand-roll-vegetariano",
              "nombre": "Hand roll vegetariano o vegano",
              "precio": 3500,
              "foto": "img/carta/hand-roll.webp",
              "detalle": "Sin proteína: lleva 2 agregados.",
              "personalizar": [
                "hr-tipo",
                "hr-agregado",
                "hr-agregado-2",
                "hr-envoltura",
                "hr-extra",
                "hr-sin-nori"
              ]
            },
            {
              "id": "hand-roll-xl",
              "nombre": "Handroll XL",
              "precio": 9000,
              "foto": "img/carta/hand-roll-xl.webp",
              "detalle": "Hand roll de 1 kilo con queso crema de base: 2 proteínas y 3 agregados.",
              "personalizar": [
                "xl-proteinas",
                "xl-agregados",
                "xl-envoltura"
              ]
            },
            {
              "id": "promo-hand-rolls",
              "nombre": "Promoción de hand rolls 3 × $10.000",
              "precio": 10000,
              "foto": "img/carta/hand-roll.webp",
              "rolls": 3,
              "destacado": true,
              "detalle": "3 hand rolls, solo de pollo, camarón o kanikama. Cada uno con una proteína (base de queso) y un agregado. Ejemplo: pollo, queso y cebollín; kanikama, queso y cebollín.",
              "personalizar": [
                "hr-proteina-promo",
                "hr-agregado",
                "hr-envoltura",
                "hr-extra",
                "hr-sin-nori"
              ]
            }
          ]
        }
      ]
    },
    {
      "nombre": "Especiales",
      "categorias": [
        {
          "id": "especiales",
          "nombre": "Especiales",
          "nota": "Pídelos de lunes a domingo.",
          "productos": [
            {
              "id": "gohan",
              "nombre": "Gohan",
              "precio": 7000,
              "foto": "img/carta/gohan.webp",
              "detalle": "Arma tu gohan seleccionando 1 relleno y 1 agregado. Base de palta y queso.",
              "personalizar": [
                "gohan-proteina",
                "gohan-agregados",
                "esp-extras"
              ]
            },
            {
              "id": "sushiburger",
              "nombre": "Sushiburger",
              "precio": 7500,
              "foto": "img/carta/sushiburger.webp",
              "detalle": "Como es de costumbre, lleva base de queso crema: escoge 1 proteína y 3 agregados. ¡Puedes combinarla como tú quieras!",
              "personalizar": [
                "burger-proteina",
                "burger-agregados",
                "esp-extras"
              ]
            },
            {
              "id": "sushi-arepa",
              "nombre": "Sushi arepa",
              "precio": 5000,
              "foto": "img/carta/sushi-arepa.webp",
              "detalle": "Arma tu sushi arepa escogiendo 1 proteína y 1 agregado. Base de palta y queso.",
              "personalizar": [
                "arepa-proteina",
                "arepa-agregados",
                "esp-extras"
              ]
            },
            {
              "id": "sushipleto",
              "nombre": "Sushipleto",
              "precio": 5000,
              "foto": "img/carta/sushipleto.webp",
              "detalle": "Arma tu sushipleto escogiendo 1 proteína y 1 agregado. Base de queso.",
              "personalizar": [
                "pleto-proteina",
                "pleto-agregados",
                "esp-extras"
              ]
            }
          ]
        }
      ]
    },
    {
      "nombre": "Box Rincón",
      "categorias": [
        {
          "id": "box-rincon",
          "nombre": "Box Rincón",
          "productos": [
            {
              "id": "box-rincon-1",
              "nombre": "Box Rincón del Sushi 1",
              "precio": 24000,
              "foto": "img/carta/box-rincon-1.webp",
              "detalle": "10 aros de cebolla\n6 trutros crispy\n1 porción de papas fritas\n10 cortes fritos en panko: pollo, queso y cebollín\n10 cortes envueltos en queso crema: pollo, queso y morrón\n10 cortes envueltos en palta: champiñón, queso y pepino",
              "nota": "Con aros de cebolla."
            },
            {
              "id": "box-rincon-2",
              "nombre": "Box Rincón del Sushi 2",
              "precio": 24500,
              "foto": "img/carta/box-rincon-2.webp",
              "detalle": "5 arrollados: jamón queso o primavera\n6 trutros crispy\n1 porción de papas fritas\n10 cortes fritos en panko: pollo, queso y cebollín\n10 cortes envueltos en queso crema: pollo, queso y morrón\n10 cortes envueltos en palta: champiñón, queso y pepino",
              "opciones": [
                "Jamón queso",
                "Primavera"
              ],
              "nota": "Con arrollados de jamón queso o primavera, a elección."
            },
            {
              "id": "box-rincon-3",
              "nombre": "Box Rincón del Sushi 3",
              "precio": 24500,
              "foto": "img/carta/box-rincon-3.webp",
              "detalle": "5 gyozas fritas: camarón, cerdo, pollo o vegetarianas\n6 trutros crispy\n1 porción de papas fritas\n10 cortes fritos en panko: pollo, queso y cebollín\n10 cortes envueltos en queso crema: pollo, queso y morrón\n10 cortes envueltos en palta: champiñón, queso y pepino",
              "opciones": [
                "Camarón",
                "Cerdo",
                "Pollo",
                "Vegetarianas"
              ],
              "nota": "Con gyozas de camarón, cerdo, pollo o vegetarianas, a elección."
            }
          ]
        }
      ]
    },
    {
      "nombre": "Aperitivos",
      "categorias": [
        {
          "id": "aperitivos",
          "nombre": "Aperitivos",
          "productos": [
            {
              "id": "aros-de-cebolla",
              "nombre": "Aros de cebolla",
              "precio": 2000,
              "foto": "img/carta/aros-de-cebolla.webp",
              "detalle": "Porción de 10 aros de cebolla."
            },
            {
              "id": "empanadas-de-queso",
              "nombre": "Empanadas de queso",
              "precio": 2500,
              "foto": "img/carta/empanadas-de-queso.webp",
              "detalle": "10 empanadas de queso fritas."
            },
            {
              "id": "papas-fritas",
              "nombre": "Papas fritas",
              "precio": 3500,
              "foto": "img/carta/papas-fritas.webp",
              "detalle": "Porción de 400 g de papas fritas."
            },
            {
              "id": "bolitas-crispy",
              "nombre": "Bolitas crispy",
              "precio": 4500,
              "foto": "img/carta/bolitas-crispy.webp",
              "detalle": "Porción de 6 bolitas crispy rellenas de pollo y queso crema, o de camarón y queso crema.",
              "opciones": [
                "Pollo queso crema",
                "Camarón queso crema"
              ]
            },
            {
              "id": "box-nino",
              "nombre": "Box niño",
              "precio": 4500,
              "foto": "img/carta/box-nino.webp",
              "detalle": "7 nuggets de pollo con 400 g de papas fritas."
            },
            {
              "id": "box-trutros",
              "nombre": "Box trutros",
              "precio": 7000,
              "foto": "img/carta/box-trutros.webp",
              "detalle": "6 trutros de pollo crispy con 400 g de papas fritas."
            },
            {
              "id": "trutros-crispy",
              "nombre": "8 trutros crispy",
              "precio": 7000,
              "foto": "img/carta/trutros-crispy.webp",
              "detalle": "Porción de 8 trutros apanados."
            },
            {
              "id": "camarones-apanados",
              "nombre": "Camarones apanados",
              "precio": 5000,
              "foto": "img/carta/camarones-apanados.webp",
              "detalle": "Porción de 6 camarones apanados."
            },
            {
              "id": "arrollados",
              "nombre": "Arrollados",
              "precio": 4000,
              "foto": "img/carta/arrollados.webp",
              "detalle": "Porción de 5 arrollados fritos, primavera o jamón queso.",
              "opciones": [
                "Primavera",
                "Jamón queso"
              ]
            },
            {
              "id": "gyozas",
              "nombre": "Gyozas",
              "precio": 4000,
              "foto": "img/carta/gyozas.webp",
              "detalle": "Porción de 5 gyozas fritas: camarón, cerdo, pollo o vegetarianas.",
              "opciones": [
                "Camarón",
                "Cerdo",
                "Pollo",
                "Vegetarianas"
              ]
            },
            {
              "id": "palitos-de-queso",
              "nombre": "Palitos de queso",
              "precio": 4000,
              "foto": "img/carta/palitos-de-queso.webp",
              "detalle": "8 palitos de queso."
            },
            {
              "id": "papas-salsa-blanca",
              "nombre": "Papas con salsa blanca y camarones",
              "precio": 10000,
              "foto": "img/carta/papas-salsa-blanca.webp",
              "detalle": "Papas fritas con salsa blanca y camarones."
            },
            {
              "id": "nigiri-camaron",
              "nombre": "Nigiri camarón",
              "precio": 3500,
              "foto": "img/carta/nigiri-camaron.webp",
              "detalle": "4 unidades."
            },
            {
              "id": "nigiri-palta",
              "nombre": "Nigiri de palta",
              "precio": 3000,
              "foto": "img/carta/nigiri-palta.webp",
              "detalle": "4 unidades."
            },
            {
              "id": "nigiri-kanikama",
              "nombre": "Nigiri kanikama",
              "precio": 3000,
              "foto": "img/carta/nigiri-kanikama.webp",
              "detalle": "4 unidades."
            },
            {
              "id": "pote-ceviche",
              "nombre": "Pote de ceviche",
              "precio": 6000,
              "foto": "img/carta/pote-ceviche.webp",
              "detalle": "Pote de 350 cc de ceviche de salmón y camarón ecuatoriano."
            }
          ]
        }
      ]
    },
    {
      "nombre": "Bebidas",
      "categorias": [
        {
          "id": "bebidas",
          "nombre": "Bebidas",
          "tarjetas": true,
          "productos": [
            {
              "id": "bebida-1250",
              "nombre": "Bebida 1.250 cc",
              "precio": 2000
            },
            {
              "id": "monster",
              "nombre": "Monster",
              "precio": 2000
            },
            {
              "id": "jugo-1400",
              "nombre": "Jugo 1.400 cc",
              "precio": 1900
            },
            {
              "id": "coca-cola-express",
              "nombre": "Coca-Cola express",
              "precio": 1500
            },
            {
              "id": "score",
              "nombre": "Score",
              "precio": 1500
            },
            {
              "id": "aloe-vera",
              "nombre": "Aloe vera",
              "precio": 1500
            },
            {
              "id": "jugo-jumex",
              "nombre": "Jugo Jumex",
              "precio": 1500
            },
            {
              "id": "nectar-400",
              "nombre": "Néctar 400 cc",
              "precio": 1500
            },
            {
              "id": "agua-con-gas",
              "nombre": "Agua con gas 600 cc",
              "precio": 1000
            },
            {
              "id": "agua-sin-gas",
              "nombre": "Agua sin gas 600 cc",
              "precio": 1000
            },
            {
              "id": "kapo",
              "nombre": "Kapo",
              "precio": 500
            }
          ]
        },
        {
          "id": "jugos",
          "nombre": "Jugos",
          "tarjetas": true,
          "productos": [
            {
              "id": "jugo",
              "nombre": "Jugo",
              "precio": 2500,
              "detalle": "Frutilla, piña o mango.",
              "opciones": [
                "Frutilla",
                "Piña",
                "Mango"
              ]
            },
            {
              "id": "jugo-con-leche",
              "nombre": "Jugo con leche",
              "precio": 3500,
              "detalle": "Frutilla, mango o piña con leche.",
              "opciones": [
                "Frutilla",
                "Mango",
                "Piña"
              ]
            }
          ]
        },
        {
          "id": "cocteleria",
          "nombre": "Coctelería sin alcohol",
          "tarjetas": true,
          "productos": [
            {
              "id": "mojito-tradicional",
              "nombre": "Mojito tradicional",
              "precio": 5000,
              "detalle": "1 litro, sin alcohol."
            },
            {
              "id": "mojito-sabores",
              "nombre": "Mojito de sabores",
              "precio": 6000,
              "detalle": "1 litro, sin alcohol: maracuyá, mango, piña o frutilla.",
              "opciones": [
                "Maracuyá",
                "Mango",
                "Piña",
                "Frutilla"
              ]
            },
            {
              "id": "pina-colada",
              "nombre": "Piña colada",
              "precio": 9000,
              "detalle": "1 litro, sin alcohol."
            },
            {
              "id": "limonada",
              "nombre": "Limonada",
              "precio": 4500,
              "detalle": "1 litro."
            },
            {
              "id": "limonada-menta",
              "nombre": "Limonada menta",
              "precio": 5000,
              "detalle": "1 litro."
            },
            {
              "id": "limonada-menta-jengibre",
              "nombre": "Limonada menta jengibre",
              "precio": 5000,
              "detalle": "1 litro."
            }
          ]
        }
      ]
    },
    {
      "nombre": "Salsas y extras",
      "categorias": [
        {
          "id": "salsas",
          "nombre": "Salsas",
          "productos": [
            {
              "id": "salsa-spicy",
              "nombre": "Pote de salsa spicy",
              "precio": 700,
              "foto": "img/carta/salsa-spicy.webp"
            },
            {
              "id": "salsa-al-olivo",
              "nombre": "Pote de salsa al olivo",
              "precio": 700,
              "foto": "img/carta/salsa-al-olivo.webp"
            },
            {
              "id": "salsa-acevichada",
              "nombre": "Pote de salsa acevichada",
              "precio": 700,
              "foto": "img/carta/salsa-acevichada.webp"
            },
            {
              "id": "salsa-teriyaki",
              "nombre": "Salsa teriyaki",
              "precio": 500,
              "foto": "img/carta/salsa-teriyaki.webp"
            },
            {
              "id": "salsa-soya",
              "nombre": "Salsa soya",
              "precio": 500,
              "foto": "img/carta/salsa-soya.webp"
            },
            {
              "id": "jengibre",
              "nombre": "Pote de jengibre",
              "precio": 500,
              "foto": "img/carta/jengibre.webp"
            }
          ]
        },
        {
          "id": "extras",
          "nombre": "Extras",
          "productos": [
            {
              "id": "ayuda-palitos",
              "nombre": "Ayuda para palitos",
              "precio": 700,
              "foto": "img/carta/ayuda-palitos.webp",
              "detalle": "2 unidades, para comer más fácil con palitos."
            }
          ]
        }
      ]
    }
  ],
  "cupones": [],
  "personalizacion": [
    {
      "id": "hr-proteina",
      "nombre": "Proteína",
      "tipo": "elegir",
      "porRoll": true,
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "pollo",
          "nombre": "Pollo",
          "precio": 0
        },
        {
          "id": "camaron",
          "nombre": "Camarón",
          "precio": 0
        },
        {
          "id": "kanikama",
          "nombre": "Kanikama",
          "precio": 0
        },
        {
          "id": "pollo-crispy",
          "nombre": "Pollo crispy",
          "precio": 500
        },
        {
          "id": "camaron-crispy",
          "nombre": "Camarón crispy",
          "precio": 500
        },
        {
          "id": "vacuno",
          "nombre": "Vacuno",
          "precio": 2000
        }
      ],
      "ayuda": "¿Vegetariano o vegano? Pide el «Hand roll vegetariano o vegano»: lleva 2 agregados."
    },
    {
      "id": "hr-proteina-promo",
      "nombre": "Proteína",
      "tipo": "elegir",
      "porRoll": true,
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "pollo",
          "nombre": "Pollo",
          "precio": 0
        },
        {
          "id": "camaron",
          "nombre": "Camarón",
          "precio": 0
        },
        {
          "id": "kanikama",
          "nombre": "Kanikama",
          "precio": 0
        }
      ]
    },
    {
      "id": "hr-tipo",
      "nombre": "Tipo",
      "tipo": "elegir",
      "porRoll": true,
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "vegetariano",
          "nombre": "Vegetariano",
          "precio": 0
        },
        {
          "id": "vegano",
          "nombre": "Vegano",
          "precio": 0
        }
      ]
    },
    {
      "id": "hr-agregado",
      "nombre": "Agregado",
      "tipo": "elegir",
      "porRoll": true,
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "champinon",
          "nombre": "Champiñón",
          "precio": 0
        },
        {
          "id": "cebollin",
          "nombre": "Cebollín",
          "precio": 0
        },
        {
          "id": "aceituna",
          "nombre": "Aceituna",
          "precio": 0
        },
        {
          "id": "morron",
          "nombre": "Morrón",
          "precio": 0
        },
        {
          "id": "pepino",
          "nombre": "Pepino",
          "precio": 0
        },
        {
          "id": "pepinillo",
          "nombre": "Pepinillo",
          "precio": 500
        },
        {
          "id": "nuez",
          "nombre": "Nuez",
          "precio": 500
        },
        {
          "id": "almendra",
          "nombre": "Almendra",
          "precio": 500
        },
        {
          "id": "palta",
          "nombre": "Palta",
          "precio": 500
        },
        {
          "id": "palmito",
          "nombre": "Palmito",
          "precio": 500
        },
        {
          "id": "choclito",
          "nombre": "Choclito",
          "precio": 500
        },
        {
          "id": "frutilla",
          "nombre": "Frutilla",
          "precio": 1000
        }
      ]
    },
    {
      "id": "hr-agregado-2",
      "nombre": "Segundo agregado",
      "tipo": "elegir",
      "porRoll": true,
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "champinon",
          "nombre": "Champiñón",
          "precio": 0
        },
        {
          "id": "cebollin",
          "nombre": "Cebollín",
          "precio": 0
        },
        {
          "id": "aceituna",
          "nombre": "Aceituna",
          "precio": 0
        },
        {
          "id": "morron",
          "nombre": "Morrón",
          "precio": 0
        },
        {
          "id": "pepino",
          "nombre": "Pepino",
          "precio": 0
        },
        {
          "id": "pepinillo",
          "nombre": "Pepinillo",
          "precio": 500
        },
        {
          "id": "nuez",
          "nombre": "Nuez",
          "precio": 500
        },
        {
          "id": "almendra",
          "nombre": "Almendra",
          "precio": 500
        },
        {
          "id": "palta",
          "nombre": "Palta",
          "precio": 500
        },
        {
          "id": "palmito",
          "nombre": "Palmito",
          "precio": 500
        },
        {
          "id": "choclito",
          "nombre": "Choclito",
          "precio": 500
        },
        {
          "id": "frutilla",
          "nombre": "Frutilla",
          "precio": 1000
        }
      ]
    },
    {
      "id": "hr-envoltura",
      "nombre": "Envoltura",
      "tipo": "elegir",
      "porRoll": true,
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "panko",
          "nombre": "Panko",
          "precio": 0,
          "porDefecto": true
        },
        {
          "id": "tempura",
          "nombre": "Tempura",
          "precio": 0
        },
        {
          "id": "panko-merken",
          "nombre": "Panko merkén",
          "precio": 500
        }
      ]
    },
    {
      "id": "hr-extra",
      "nombre": "Extra",
      "tipo": "agregar",
      "porRoll": true,
      "min": 0,
      "max": 5,
      "opciones": [
        {
          "id": "pollo-extra",
          "nombre": "Pollo extra",
          "precio": 1000
        },
        {
          "id": "camaron-extra",
          "nombre": "Camarón extra",
          "precio": 1000
        },
        {
          "id": "kanikama-extra",
          "nombre": "Kanikama extra",
          "precio": 1000
        },
        {
          "id": "pepino-extra",
          "nombre": "Pepino extra",
          "precio": 500
        },
        {
          "id": "morron-extra",
          "nombre": "Morrón extra",
          "precio": 500
        },
        {
          "id": "aceituna-extra",
          "nombre": "Aceituna extra",
          "precio": 500
        },
        {
          "id": "cebollin-extra",
          "nombre": "Cebollín extra",
          "precio": 500
        },
        {
          "id": "champinon-extra",
          "nombre": "Champiñón extra",
          "precio": 500
        }
      ]
    },
    {
      "id": "hr-sin-nori",
      "nombre": "Sin nori",
      "tipo": "extra",
      "porRoll": true,
      "min": 0,
      "max": 5,
      "opciones": [
        {
          "id": "sin-nori",
          "nombre": "Sin nori",
          "precio": 500
        }
      ]
    },
    {
      "id": "xl-proteinas",
      "nombre": "Proteínas",
      "tipo": "elegir",
      "min": 2,
      "max": 2,
      "opciones": [
        {
          "id": "pollo",
          "nombre": "Pollo",
          "precio": 0
        },
        {
          "id": "camaron",
          "nombre": "Camarón",
          "precio": 0
        },
        {
          "id": "vacuno",
          "nombre": "Vacuno",
          "precio": 0
        },
        {
          "id": "salmon",
          "nombre": "Salmón",
          "precio": 0
        },
        {
          "id": "kanikama",
          "nombre": "Kanikama",
          "precio": 0
        },
        {
          "id": "pollo-crispy",
          "nombre": "Pollo crispy",
          "precio": 0
        },
        {
          "id": "camaron-crispy",
          "nombre": "Camarón crispy",
          "precio": 0
        }
      ]
    },
    {
      "id": "xl-agregados",
      "nombre": "Agregados",
      "tipo": "elegir",
      "min": 3,
      "max": 3,
      "opciones": [
        {
          "id": "palta",
          "nombre": "Palta",
          "precio": 0
        },
        {
          "id": "palmito",
          "nombre": "Palmito",
          "precio": 0
        },
        {
          "id": "choclito",
          "nombre": "Choclito",
          "precio": 0
        },
        {
          "id": "pepinillo",
          "nombre": "Pepinillo",
          "precio": 0
        },
        {
          "id": "nuez",
          "nombre": "Nuez",
          "precio": 0
        },
        {
          "id": "almendra",
          "nombre": "Almendra",
          "precio": 0
        },
        {
          "id": "frutilla",
          "nombre": "Frutilla",
          "precio": 0
        },
        {
          "id": "cebollin",
          "nombre": "Cebollín",
          "precio": 0
        },
        {
          "id": "pepino",
          "nombre": "Pepino",
          "precio": 0
        },
        {
          "id": "morron",
          "nombre": "Morrón",
          "precio": 0
        },
        {
          "id": "champinon",
          "nombre": "Champiñón",
          "precio": 0
        },
        {
          "id": "aceituna",
          "nombre": "Aceituna",
          "precio": 0
        }
      ]
    },
    {
      "id": "xl-envoltura",
      "nombre": "Envoltura",
      "tipo": "elegir",
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "panko",
          "nombre": "Panko",
          "precio": 0,
          "porDefecto": true
        },
        {
          "id": "tempura",
          "nombre": "Tempura",
          "precio": 0
        }
      ]
    },
    {
      "id": "gohan-proteina",
      "nombre": "Proteína",
      "tipo": "elegir",
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "pollo",
          "nombre": "Pollo",
          "precio": 0
        },
        {
          "id": "camaron",
          "nombre": "Camarón",
          "precio": 0
        },
        {
          "id": "kanikama",
          "nombre": "Kanikama",
          "precio": 0
        },
        {
          "id": "pollo-crispy",
          "nombre": "Pollo crispy",
          "precio": 500
        },
        {
          "id": "camaron-crispy",
          "nombre": "Camarón crispy",
          "precio": 500
        },
        {
          "id": "vacuno",
          "nombre": "Vacuno",
          "precio": 2000
        },
        {
          "id": "salmon",
          "nombre": "Salmón",
          "precio": 2000
        },
        {
          "id": "pulpo",
          "nombre": "Pulpo",
          "precio": 2000
        },
        {
          "id": "salmon-apanado",
          "nombre": "Salmón apanado",
          "precio": 2500
        },
        {
          "id": "vegetariano",
          "nombre": "Vegetariano (2 agregados)",
          "precio": 0,
          "suma": {
            "gohan-agregados": 1
          }
        }
      ]
    },
    {
      "id": "gohan-agregados",
      "nombre": "Agregado",
      "tipo": "elegir",
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "aceituna",
          "nombre": "Aceituna",
          "precio": 0
        },
        {
          "id": "champinones",
          "nombre": "Champiñones",
          "precio": 0
        },
        {
          "id": "cebollin",
          "nombre": "Cebollín",
          "precio": 0
        },
        {
          "id": "pepino",
          "nombre": "Pepino",
          "precio": 0
        },
        {
          "id": "morron",
          "nombre": "Morrón",
          "precio": 0
        },
        {
          "id": "palta",
          "nombre": "Palta",
          "precio": 500
        },
        {
          "id": "palmito",
          "nombre": "Palmito",
          "precio": 500
        },
        {
          "id": "choclito",
          "nombre": "Choclito",
          "precio": 500
        },
        {
          "id": "almendra-tostada",
          "nombre": "Almendra tostada",
          "precio": 500
        },
        {
          "id": "nuez",
          "nombre": "Nuez",
          "precio": 500
        },
        {
          "id": "pepinillo",
          "nombre": "Pepinillo",
          "precio": 500
        },
        {
          "id": "frutilla",
          "nombre": "Frutilla",
          "precio": 1000
        }
      ]
    },
    {
      "id": "burger-proteina",
      "nombre": "Proteína",
      "tipo": "elegir",
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "pollo",
          "nombre": "Pollo",
          "precio": 0
        },
        {
          "id": "camaron",
          "nombre": "Camarón",
          "precio": 0
        },
        {
          "id": "kanikama",
          "nombre": "Kanikama",
          "precio": 0
        },
        {
          "id": "pollo-crispy",
          "nombre": "Pollo crispy",
          "precio": 500
        },
        {
          "id": "camaron-crispy",
          "nombre": "Camarón crispy",
          "precio": 500
        },
        {
          "id": "vacuno",
          "nombre": "Vacuno",
          "precio": 0
        },
        {
          "id": "salmon",
          "nombre": "Salmón",
          "precio": 2000
        },
        {
          "id": "pulpo",
          "nombre": "Pulpo",
          "precio": 2000
        },
        {
          "id": "salmon-apanado",
          "nombre": "Salmón apanado",
          "precio": 2500
        },
        {
          "id": "vegetariano",
          "nombre": "Vegetariano (2 agregados)",
          "precio": 0,
          "suma": {
            "burger-agregados": 1
          }
        }
      ]
    },
    {
      "id": "burger-agregados",
      "nombre": "Agregados",
      "tipo": "elegir",
      "min": 3,
      "max": 3,
      "opciones": [
        {
          "id": "aceituna",
          "nombre": "Aceituna",
          "precio": 0
        },
        {
          "id": "champinones",
          "nombre": "Champiñones",
          "precio": 0
        },
        {
          "id": "cebollin",
          "nombre": "Cebollín",
          "precio": 0
        },
        {
          "id": "pepino",
          "nombre": "Pepino",
          "precio": 0
        },
        {
          "id": "morron",
          "nombre": "Morrón",
          "precio": 0
        },
        {
          "id": "palta",
          "nombre": "Palta",
          "precio": 500
        },
        {
          "id": "palmito",
          "nombre": "Palmito",
          "precio": 500
        },
        {
          "id": "choclito",
          "nombre": "Choclito",
          "precio": 500
        },
        {
          "id": "almendra-tostada",
          "nombre": "Almendra tostada",
          "precio": 500
        },
        {
          "id": "nuez",
          "nombre": "Nuez",
          "precio": 500
        },
        {
          "id": "pepinillo",
          "nombre": "Pepinillo",
          "precio": 500
        },
        {
          "id": "frutilla",
          "nombre": "Frutilla",
          "precio": 1000
        }
      ]
    },
    {
      "id": "arepa-proteina",
      "nombre": "Proteína",
      "tipo": "elegir",
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "pollo",
          "nombre": "Pollo",
          "precio": 0
        },
        {
          "id": "camaron",
          "nombre": "Camarón",
          "precio": 0
        },
        {
          "id": "kanikama",
          "nombre": "Kanikama",
          "precio": 0
        },
        {
          "id": "pollo-crispy",
          "nombre": "Pollo crispy",
          "precio": 500
        },
        {
          "id": "camaron-crispy",
          "nombre": "Camarón crispy",
          "precio": 500
        },
        {
          "id": "vacuno",
          "nombre": "Vacuno",
          "precio": 2000
        },
        {
          "id": "salmon",
          "nombre": "Salmón",
          "precio": 2000
        },
        {
          "id": "pulpo",
          "nombre": "Pulpo",
          "precio": 2000
        },
        {
          "id": "salmon-apanado",
          "nombre": "Salmón apanado",
          "precio": 2500
        },
        {
          "id": "vegetariano",
          "nombre": "Vegetariano (2 agregados)",
          "precio": 0,
          "suma": {
            "arepa-agregados": 1
          }
        }
      ]
    },
    {
      "id": "arepa-agregados",
      "nombre": "Agregado",
      "tipo": "elegir",
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "aceituna",
          "nombre": "Aceituna",
          "precio": 0
        },
        {
          "id": "champinones",
          "nombre": "Champiñones",
          "precio": 0
        },
        {
          "id": "cebollin",
          "nombre": "Cebollín",
          "precio": 0
        },
        {
          "id": "pepino",
          "nombre": "Pepino",
          "precio": 0
        },
        {
          "id": "morron",
          "nombre": "Morrón",
          "precio": 0
        },
        {
          "id": "palta",
          "nombre": "Palta",
          "precio": 500
        },
        {
          "id": "palmito",
          "nombre": "Palmito",
          "precio": 500
        },
        {
          "id": "choclito",
          "nombre": "Choclito",
          "precio": 500
        },
        {
          "id": "almendra-tostada",
          "nombre": "Almendra tostada",
          "precio": 500
        },
        {
          "id": "nuez",
          "nombre": "Nuez",
          "precio": 500
        },
        {
          "id": "pepinillo",
          "nombre": "Pepinillo",
          "precio": 500
        },
        {
          "id": "frutilla",
          "nombre": "Frutilla",
          "precio": 1000
        }
      ]
    },
    {
      "id": "pleto-proteina",
      "nombre": "Proteína",
      "tipo": "elegir",
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "pollo",
          "nombre": "Pollo",
          "precio": 0
        },
        {
          "id": "camaron",
          "nombre": "Camarón",
          "precio": 0
        },
        {
          "id": "kanikama",
          "nombre": "Kanikama",
          "precio": 0
        },
        {
          "id": "pollo-crispy",
          "nombre": "Pollo crispy",
          "precio": 500
        },
        {
          "id": "camaron-crispy",
          "nombre": "Camarón crispy",
          "precio": 500
        },
        {
          "id": "vacuno",
          "nombre": "Vacuno",
          "precio": 2000
        },
        {
          "id": "salmon",
          "nombre": "Salmón",
          "precio": 2000
        },
        {
          "id": "pulpo",
          "nombre": "Pulpo",
          "precio": 2000
        },
        {
          "id": "salmon-apanado",
          "nombre": "Salmón apanado",
          "precio": 2500
        },
        {
          "id": "vegetariano",
          "nombre": "Vegetariano (2 agregados)",
          "precio": 0,
          "suma": {
            "pleto-agregados": 1
          }
        }
      ]
    },
    {
      "id": "pleto-agregados",
      "nombre": "Agregado",
      "tipo": "elegir",
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "aceituna",
          "nombre": "Aceituna",
          "precio": 0
        },
        {
          "id": "champinones",
          "nombre": "Champiñones",
          "precio": 0
        },
        {
          "id": "cebollin",
          "nombre": "Cebollín",
          "precio": 0
        },
        {
          "id": "pepino",
          "nombre": "Pepino",
          "precio": 0
        },
        {
          "id": "morron",
          "nombre": "Morrón",
          "precio": 0
        },
        {
          "id": "palta",
          "nombre": "Palta",
          "precio": 500
        },
        {
          "id": "palmito",
          "nombre": "Palmito",
          "precio": 500
        },
        {
          "id": "choclito",
          "nombre": "Choclito",
          "precio": 500
        },
        {
          "id": "almendra-tostada",
          "nombre": "Almendra tostada",
          "precio": 500
        },
        {
          "id": "nuez",
          "nombre": "Nuez",
          "precio": 500
        },
        {
          "id": "pepinillo",
          "nombre": "Pepinillo",
          "precio": 500
        },
        {
          "id": "frutilla",
          "nombre": "Frutilla",
          "precio": 1000
        }
      ]
    },
    {
      "id": "esp-extras",
      "nombre": "Extras",
      "tipo": "extra",
      "min": 0,
      "max": 10,
      "ayuda": "Proteína extra (pollo, camarón o kanikama) $1.000; agregado extra (pepino, morrón, aceituna, cebollín o champiñones) $500.",
      "opciones": [
        {
          "id": "pollo-extra",
          "nombre": "Pollo extra",
          "precio": 1000
        },
        {
          "id": "camaron-extra",
          "nombre": "Camarón extra",
          "precio": 1000
        },
        {
          "id": "kanikama-extra",
          "nombre": "Kanikama extra",
          "precio": 1000
        },
        {
          "id": "pepino-extra",
          "nombre": "Pepino extra",
          "precio": 500
        },
        {
          "id": "morron-extra",
          "nombre": "Morrón extra",
          "precio": 500
        },
        {
          "id": "aceituna-extra",
          "nombre": "Aceituna extra",
          "precio": 500
        },
        {
          "id": "cebollin-extra",
          "nombre": "Cebollín extra",
          "precio": 500
        },
        {
          "id": "champinones-extra",
          "nombre": "Champiñones extra",
          "precio": 500
        }
      ]
    },
    {
      "id": "sa-envoltura",
      "nombre": "Envoltura",
      "tipo": "elegir",
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "palta",
          "nombre": "Palta",
          "precio": 1500
        },
        {
          "id": "queso-crema",
          "nombre": "Queso crema",
          "precio": 1500
        },
        {
          "id": "nori",
          "nombre": "Nori",
          "precio": 0
        },
        {
          "id": "panko",
          "nombre": "Panko",
          "precio": 0
        }
      ]
    },
    {
      "id": "sa-proteina",
      "nombre": "Proteína",
      "tipo": "elegir",
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "pollo",
          "nombre": "Pollo",
          "precio": 0
        },
        {
          "id": "camaron",
          "nombre": "Camarón",
          "precio": 0
        },
        {
          "id": "kanikama",
          "nombre": "Kanikama",
          "precio": 0
        },
        {
          "id": "vacuno",
          "nombre": "Vacuno",
          "precio": 500
        },
        {
          "id": "pollo-apanado",
          "nombre": "Pollo apanado",
          "precio": 500
        },
        {
          "id": "camaron-apanado",
          "nombre": "Camarón apanado",
          "precio": 500
        },
        {
          "id": "salmon",
          "nombre": "Salmón",
          "precio": 2500
        },
        {
          "id": "salmon-apanado",
          "nombre": "Salmón apanado",
          "precio": 3000
        },
        {
          "id": "vegetariano",
          "nombre": "Vegetariano (+1 agregado)",
          "precio": 0,
          "suma": {
            "sa-agregados": 1
          }
        },
        {
          "id": "vegano",
          "nombre": "Vegano (+1 agregado)",
          "precio": 0,
          "suma": {
            "sa-agregados": 1
          }
        }
      ]
    },
    {
      "id": "sa-agregados",
      "nombre": "Agregados",
      "tipo": "elegir",
      "min": 3,
      "max": 3,
      "opciones": [
        {
          "id": "cebollin",
          "nombre": "Cebollín",
          "precio": 0
        },
        {
          "id": "aceituna",
          "nombre": "Aceituna",
          "precio": 0
        },
        {
          "id": "morron",
          "nombre": "Morrón",
          "precio": 0
        },
        {
          "id": "pepino",
          "nombre": "Pepino",
          "precio": 0
        },
        {
          "id": "champinon",
          "nombre": "Champiñón",
          "precio": 0
        },
        {
          "id": "pepinillo",
          "nombre": "Pepinillo",
          "precio": 500
        },
        {
          "id": "nuez",
          "nombre": "Nuez",
          "precio": 500
        },
        {
          "id": "almendra",
          "nombre": "Almendra",
          "precio": 500
        },
        {
          "id": "palta",
          "nombre": "Palta",
          "precio": 500
        },
        {
          "id": "choclito",
          "nombre": "Choclito",
          "precio": 500
        },
        {
          "id": "palmito",
          "nombre": "Palmito",
          "precio": 500
        },
        {
          "id": "frutilla",
          "nombre": "Frutilla",
          "precio": 1500
        }
      ]
    },
    {
      "id": "ar-envoltura",
      "nombre": "Envoltura",
      "tipo": "elegir",
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "tempura",
          "nombre": "Tempura",
          "precio": 0
        },
        {
          "id": "panko",
          "nombre": "Panko",
          "precio": 0
        },
        {
          "id": "masago",
          "nombre": "Masago",
          "precio": 2000
        },
        {
          "id": "salmon",
          "nombre": "Salmón",
          "precio": 2000
        },
        {
          "id": "palta",
          "nombre": "Palta",
          "precio": 1500
        },
        {
          "id": "queso-crema",
          "nombre": "Queso crema",
          "precio": 1500
        },
        {
          "id": "nori",
          "nombre": "Nori",
          "precio": 1500
        },
        {
          "id": "sesamo-mixto",
          "nombre": "Sésamo mixto",
          "precio": 1000
        },
        {
          "id": "sesamo-blanco",
          "nombre": "Sésamo blanco",
          "precio": 500
        },
        {
          "id": "sesamo-negro",
          "nombre": "Sésamo negro",
          "precio": 500
        },
        {
          "id": "salsa-spicy",
          "nombre": "Salsa spicy",
          "precio": 600
        },
        {
          "id": "salsa-olivo",
          "nombre": "Salsa al olivo",
          "precio": 600
        },
        {
          "id": "nori-panko",
          "nombre": "Nori panko",
          "precio": 500
        },
        {
          "id": "panko-merken",
          "nombre": "Panko merkén",
          "precio": 500
        },
        {
          "id": "panko-coco",
          "nombre": "Panko coco",
          "precio": 500
        },
        {
          "id": "coco-rallado",
          "nombre": "Coco rallado",
          "precio": 500
        },
        {
          "id": "merken",
          "nombre": "Merkén",
          "precio": 500
        }
      ]
    },
    {
      "id": "ar-proteina",
      "nombre": "Proteína",
      "tipo": "elegir",
      "min": 1,
      "max": 1,
      "ayuda": "El precio depende de la proteína: $4.500 con pollo, camarón, kanikama, vegetariano o vegano.",
      "opciones": [
        {
          "id": "pollo",
          "nombre": "Pollo",
          "precio": 0
        },
        {
          "id": "camaron",
          "nombre": "Camarón",
          "precio": 0
        },
        {
          "id": "kanikama",
          "nombre": "Kanikama",
          "precio": 0
        },
        {
          "id": "vegetariano",
          "nombre": "Vegetariano",
          "precio": 0
        },
        {
          "id": "vegano",
          "nombre": "Vegano",
          "precio": 0
        },
        {
          "id": "pollo-crispy",
          "nombre": "Pollo crispy",
          "precio": 500
        },
        {
          "id": "camaron-apanado",
          "nombre": "Camarón apanado",
          "precio": 500
        },
        {
          "id": "vacuno",
          "nombre": "Vacuno",
          "precio": 1000
        },
        {
          "id": "salmon",
          "nombre": "Salmón",
          "precio": 1500
        },
        {
          "id": "pulpo",
          "nombre": "Pulpo",
          "precio": 1500
        },
        {
          "id": "salmon-apanado",
          "nombre": "Salmón apanado",
          "precio": 2000
        }
      ]
    },
    {
      "id": "ar-relleno",
      "nombre": "Relleno",
      "tipo": "elegir",
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "cebollin",
          "nombre": "Cebollín",
          "precio": 0
        },
        {
          "id": "aceituna",
          "nombre": "Aceituna",
          "precio": 0
        },
        {
          "id": "champinon",
          "nombre": "Champiñón",
          "precio": 0
        },
        {
          "id": "pimenton",
          "nombre": "Pimentón",
          "precio": 0
        },
        {
          "id": "pepinillo",
          "nombre": "Pepinillo",
          "precio": 500
        },
        {
          "id": "palta",
          "nombre": "Palta",
          "precio": 500
        },
        {
          "id": "palmitos",
          "nombre": "Palmitos",
          "precio": 500
        },
        {
          "id": "choclito",
          "nombre": "Choclito",
          "precio": 500
        },
        {
          "id": "nuez",
          "nombre": "Nuez",
          "precio": 500
        },
        {
          "id": "almendra",
          "nombre": "Almendra",
          "precio": 500
        },
        {
          "id": "frutilla",
          "nombre": "Frutilla",
          "precio": 1000
        }
      ]
    },
    {
      "id": "ar-topping",
      "nombre": "Topping",
      "tipo": "elegir",
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "sin-topping",
          "nombre": "Sin topping",
          "precio": 0,
          "porDefecto": true
        },
        {
          "id": "salsa-acevichada",
          "nombre": "Salsa acevichada",
          "precio": 700
        },
        {
          "id": "al-olivo",
          "nombre": "Al olivo",
          "precio": 700
        },
        {
          "id": "spicy",
          "nombre": "Spicy",
          "precio": 700
        },
        {
          "id": "papas-hilo",
          "nombre": "Papas al hilo",
          "precio": 1000
        },
        {
          "id": "acevichado",
          "nombre": "Acevichado",
          "precio": 2000
        },
        {
          "id": "guacamole",
          "nombre": "Guacamole",
          "precio": 2000
        }
      ]
    },
    {
      "id": "ar-nori",
      "nombre": "Nori",
      "tipo": "elegir",
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "con-nori",
          "nombre": "Con nori",
          "precio": 0,
          "porDefecto": true
        },
        {
          "id": "sin-nori",
          "nombre": "Sin nori",
          "precio": 500
        }
      ]
    },
    {
      "id": "ar-extras",
      "nombre": "Extras",
      "tipo": "extra",
      "min": 0,
      "max": 10,
      "opciones": [
        {
          "id": "pollo-extra",
          "nombre": "Pollo extra",
          "precio": 1000
        },
        {
          "id": "camaron-extra",
          "nombre": "Camarón extra",
          "precio": 1000
        },
        {
          "id": "kanikama-extra",
          "nombre": "Kanikama extra",
          "precio": 1000
        },
        {
          "id": "pepino-extra",
          "nombre": "Pepino extra",
          "precio": 500
        },
        {
          "id": "morron-extra",
          "nombre": "Morrón extra",
          "precio": 500
        },
        {
          "id": "aceituna-extra",
          "nombre": "Aceituna extra",
          "precio": 500
        },
        {
          "id": "cebollin-extra",
          "nombre": "Cebollín extra",
          "precio": 500
        },
        {
          "id": "champinones-extra",
          "nombre": "Champiñones extra",
          "precio": 500
        },
        {
          "id": "relleno-extra",
          "nombre": "Relleno extra",
          "precio": 1000
        }
      ]
    },
    {
      "id": "promo-acompanamiento",
      "nombre": "Acompañamiento",
      "tipo": "elegir",
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "arrollados-primavera",
          "nombre": "5 arrollados primavera",
          "precio": 0
        },
        {
          "id": "arrollados-jamon-queso",
          "nombre": "5 arrollados jamón queso",
          "precio": 0
        },
        {
          "id": "gyozas-pollo",
          "nombre": "5 gyozas de pollo",
          "precio": 0
        },
        {
          "id": "gyozas-cerdo",
          "nombre": "5 gyozas de cerdo",
          "precio": 0
        },
        {
          "id": "gyozas-camaron",
          "nombre": "5 gyozas de camarón",
          "precio": 0
        },
        {
          "id": "gyozas-vegetarianas",
          "nombre": "5 gyozas vegetarianas",
          "precio": 0
        }
      ]
    },
    {
      "id": "masago-extra",
      "nombre": "Extra",
      "tipo": "extra",
      "min": 0,
      "max": 3,
      "opciones": [
        {
          "id": "camaron-ecuatoriano-apanado",
          "nombre": "Camarón ecuatoriano apanado",
          "precio": 7000
        },
        {
          "id": "salmon-apanado",
          "nombre": "Salmón apanado",
          "precio": 7000
        },
        {
          "id": "atun-rojo",
          "nombre": "Atún rojo",
          "precio": 7000
        }
      ]
    },
    {
      "id": "sb3-proteina",
      "nombre": "Proteína",
      "tipo": "elegir",
      "porRoll": true,
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "pollo",
          "nombre": "Pollo",
          "precio": 0
        },
        {
          "id": "camaron",
          "nombre": "Camarón",
          "precio": 0
        },
        {
          "id": "kanikama",
          "nombre": "Kanikama",
          "precio": 0
        },
        {
          "id": "pollo-crispy",
          "nombre": "Pollo crispy",
          "precio": 500
        },
        {
          "id": "camaron-crispy",
          "nombre": "Camarón crispy",
          "precio": 500
        },
        {
          "id": "vacuno",
          "nombre": "Vacuno",
          "precio": 0
        },
        {
          "id": "salmon",
          "nombre": "Salmón",
          "precio": 2000
        },
        {
          "id": "pulpo",
          "nombre": "Pulpo",
          "precio": 2000
        },
        {
          "id": "salmon-apanado",
          "nombre": "Salmón apanado",
          "precio": 2500
        }
      ]
    },
    {
      "id": "sb3-agregado-1",
      "nombre": "Agregado 1",
      "tipo": "elegir",
      "porRoll": true,
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "aceituna",
          "nombre": "Aceituna",
          "precio": 0
        },
        {
          "id": "champinones",
          "nombre": "Champiñones",
          "precio": 0
        },
        {
          "id": "cebollin",
          "nombre": "Cebollín",
          "precio": 0
        },
        {
          "id": "pepino",
          "nombre": "Pepino",
          "precio": 0
        },
        {
          "id": "morron",
          "nombre": "Morrón",
          "precio": 0
        },
        {
          "id": "palta",
          "nombre": "Palta",
          "precio": 500
        },
        {
          "id": "palmito",
          "nombre": "Palmito",
          "precio": 500
        },
        {
          "id": "choclito",
          "nombre": "Choclito",
          "precio": 500
        },
        {
          "id": "almendra-tostada",
          "nombre": "Almendra tostada",
          "precio": 500
        },
        {
          "id": "nuez",
          "nombre": "Nuez",
          "precio": 500
        },
        {
          "id": "pepinillo",
          "nombre": "Pepinillo",
          "precio": 500
        },
        {
          "id": "frutilla",
          "nombre": "Frutilla",
          "precio": 1000
        }
      ]
    },
    {
      "id": "sb3-agregado-2",
      "nombre": "Agregado 2",
      "tipo": "elegir",
      "porRoll": true,
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "aceituna",
          "nombre": "Aceituna",
          "precio": 0
        },
        {
          "id": "champinones",
          "nombre": "Champiñones",
          "precio": 0
        },
        {
          "id": "cebollin",
          "nombre": "Cebollín",
          "precio": 0
        },
        {
          "id": "pepino",
          "nombre": "Pepino",
          "precio": 0
        },
        {
          "id": "morron",
          "nombre": "Morrón",
          "precio": 0
        },
        {
          "id": "palta",
          "nombre": "Palta",
          "precio": 500
        },
        {
          "id": "palmito",
          "nombre": "Palmito",
          "precio": 500
        },
        {
          "id": "choclito",
          "nombre": "Choclito",
          "precio": 500
        },
        {
          "id": "almendra-tostada",
          "nombre": "Almendra tostada",
          "precio": 500
        },
        {
          "id": "nuez",
          "nombre": "Nuez",
          "precio": 500
        },
        {
          "id": "pepinillo",
          "nombre": "Pepinillo",
          "precio": 500
        },
        {
          "id": "frutilla",
          "nombre": "Frutilla",
          "precio": 1000
        }
      ]
    },
    {
      "id": "sb3-agregado-3",
      "nombre": "Agregado 3",
      "tipo": "elegir",
      "porRoll": true,
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "aceituna",
          "nombre": "Aceituna",
          "precio": 0
        },
        {
          "id": "champinones",
          "nombre": "Champiñones",
          "precio": 0
        },
        {
          "id": "cebollin",
          "nombre": "Cebollín",
          "precio": 0
        },
        {
          "id": "pepino",
          "nombre": "Pepino",
          "precio": 0
        },
        {
          "id": "morron",
          "nombre": "Morrón",
          "precio": 0
        },
        {
          "id": "palta",
          "nombre": "Palta",
          "precio": 500
        },
        {
          "id": "palmito",
          "nombre": "Palmito",
          "precio": 500
        },
        {
          "id": "choclito",
          "nombre": "Choclito",
          "precio": 500
        },
        {
          "id": "almendra-tostada",
          "nombre": "Almendra tostada",
          "precio": 500
        },
        {
          "id": "nuez",
          "nombre": "Nuez",
          "precio": 500
        },
        {
          "id": "pepinillo",
          "nombre": "Pepinillo",
          "precio": 500
        },
        {
          "id": "frutilla",
          "nombre": "Frutilla",
          "precio": 1000
        }
      ]
    },
    {
      "id": "md-proteina",
      "nombre": "Proteína",
      "tipo": "elegir",
      "min": 1,
      "max": 1,
      "opciones": [
        {
          "id": "pollo-plancha",
          "nombre": "Pollo a la plancha",
          "precio": 0
        },
        {
          "id": "pollo-crispy",
          "nombre": "Pollo crispy",
          "precio": 0
        },
        {
          "id": "pollo-champinones",
          "nombre": "Pollo con champiñones a la crema",
          "precio": 0
        },
        {
          "id": "pollo-pobre",
          "nombre": "Pollo a lo pobre",
          "precio": 1500
        },
        {
          "id": "chuleta-plancha",
          "nombre": "Chuleta a la plancha",
          "precio": 0
        },
        {
          "id": "chuleta-champinon",
          "nombre": "Chuleta con champiñón a la crema",
          "precio": 0
        },
        {
          "id": "chuleta-pobre",
          "nombre": "Chuleta a la plancha a lo pobre",
          "precio": 1500
        },
        {
          "id": "milanesa-pollo",
          "nombre": "Milanesa de pollo",
          "precio": 0
        },
        {
          "id": "bistec",
          "nombre": "Bistec",
          "precio": 0
        }
      ]
    },
    {
      "id": "md-agregados",
      "nombre": "Agregados",
      "tipo": "elegir",
      "min": 2,
      "max": 2,
      "opciones": [
        {
          "id": "arroz",
          "nombre": "Arroz",
          "precio": 0
        },
        {
          "id": "ensalada",
          "nombre": "Ensalada",
          "precio": 0
        },
        {
          "id": "papas-fritas",
          "nombre": "Papas fritas",
          "precio": 0
        }
      ]
    },
    {
      "id": "md-extras",
      "nombre": "Agregados extras",
      "tipo": "extra",
      "min": 0,
      "max": 6,
      "opciones": [
        {
          "id": "a-lo-pobre",
          "nombre": "A lo pobre",
          "precio": 2500
        },
        {
          "id": "arroz-extra",
          "nombre": "Arroz",
          "precio": 1000
        },
        {
          "id": "ensalada-extra",
          "nombre": "Ensalada",
          "precio": 1000
        },
        {
          "id": "papas-extra",
          "nombre": "Papas fritas",
          "precio": 2000
        },
        {
          "id": "huevo-frito",
          "nombre": "Huevo frito",
          "precio": 800
        }
      ]
    }
  ],
  "ingredientes": {}
};
