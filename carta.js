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
    "lema": "Tablas de sushi por WhatsApp",
    "whatsapp": "56946324426",
    "whatsappVisible": "+56 9 4632 4426",
    "facebook": "",
    "instagram": "",
    "direccion": "",
    "sector": "",
    "ciudad": "",
    "region": "",
    "mapa": "",
    "mapaBusqueda": "",
    "cartaReferencial": true,
    "valorDelivery": null,
    "notaDelivery": "Según el sector",
    "datosTransferencia": ""
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
      "titulo": "Tablas de sushi",
      "destacado": "para compartir",
      "bajada": "Tablas mixtas y calientes (con o sin kanikama), cortes premium, hand rolls, gohan, sushiburger, sushi arepa y sushipleto. Arma tu pedido y mándalo por WhatsApp: el resto lo confirmamos contigo."
    },
    "carta": {
      "titulo": "Elige tu",
      "destacado": "tabla",
      "bajada": "Tablas, cortes premium, hand rolls, especiales (gohan, sushiburger, sushi arepa y sushipleto), box y salsas. Suma lo que quieras al pedido."
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
      "bajada": "El pedido te llega listo para enviar por WhatsApp. Nosotros te confirmamos disponibilidad, modalidad y total.",
      "lista": [
        {
          "titulo": "Elige o arma",
          "texto": "Escoge tu tabla o tus cortes premium, o arma tus hand rolls, gohan y especiales como más te gusten."
        },
        {
          "titulo": "Revisa tu pedido",
          "texto": "Ajusta cantidades, deja una nota y elige si lo retiras o pides delivery."
        },
        {
          "titulo": "Envíalo por WhatsApp",
          "texto": "Te respondemos para confirmar el pedido y el total."
        }
      ]
    },
    "ubicacion": {
      "titulo": "Te esperamos"
    },
    "antojo": {
      "titulo": "¿Qué se te",
      "destacado": "antoja hoy?"
    },
    "pie": {
      "nota": "Precios y promociones sujetos a confirmación por WhatsApp."
    }
  },
  "secciones": [
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
              "foto": "img/carta/tabla-20-cortes.webp",
              "destacado": true
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
              "foto": "img/carta/tabla-40-cortes.webp",
              "destacado": true
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
              "foto": "img/carta/tabla-60-cortes.webp",
              "destacado": true
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
              "foto": "img/carta/tabla-70-cortes.webp",
              "destacado": true
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
              "foto": "img/carta/tabla-100-cortes.webp",
              "destacado": true
            },
            {
              "id": "tabla-100-mixtos-sin-kanikama",
              "nombre": "100 cortes mixtos sin kanikama",
              "detalle": "20 cortes calientes: pollo, queso y cebollín\n20 cortes calientes: camarón, queso y aceituna\n20 cortes calientes: pollo, queso y palta\n20 cortes fríos envueltos en queso: pollo, queso y morrón\n20 cortes fríos envueltos en palta: champiñón, queso y pepino",
              "precio": 29000,
              "foto": "img/carta/tabla-100-cortes.webp"
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
              "detalle": "10 cortes envueltos en panko de pulpo, queso y palta (salsa al olivo).",
              "precio": 7000,
              "foto": "img/carta/pulpo-al-olivo.webp"
            },
            {
              "id": "masago-roll",
              "nombre": "Masago roll",
              "detalle": "Salmón, queso crema y cebollín o palta.",
              "precio": 8500,
              "foto": "img/carta/masago-roll.webp",
              "opciones": [
                "Cebollín",
                "Palta"
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
              "nombre": "Roll sin arroz",
              "detalle": "10 cortes sin arroz envueltos en palta, de pollo, queso, palmito, cebollín y aceituna.",
              "precio": 8000,
              "foto": "img/carta/roll-sin-arroz.webp"
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
              "nombre": "Gohan pollo o camarón",
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
      "nombre": "Salsas",
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
          "precio": 1000
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
          "precio": 1000
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
    }
  ],
  "ingredientes": {}
};
