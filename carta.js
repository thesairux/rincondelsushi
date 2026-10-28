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
      "bajada": "Tablas mixtas y calientes, con o sin kanikama. Arma tu pedido y mándalo por WhatsApp: el resto lo confirmamos contigo."
    },
    "carta": {
      "titulo": "Elige tu",
      "destacado": "tabla",
      "bajada": "Tablas mixtas y calientes, con o sin kanikama. Suma lo que quieras al pedido."
    },
    "cupones": {
      "titulo": "Cupones",
      "destacado": "de la semana",
      "bajada": "Toca «Usar cupón» y el descuento se aplica solo en tu pedido. Un cupón por pedido."
    },
    "arma": {
      "titulo": "Arma tu",
      "destacado": "roll"
    },
    "pasos": {
      "titulo": "Haz tu pedido",
      "destacado": "en 3 pasos.",
      "bajada": "El pedido te llega listo para enviar por WhatsApp. Nosotros te confirmamos disponibilidad, modalidad y total.",
      "lista": [
        {
          "titulo": "Elige tu tabla",
          "texto": "Mixta o caliente, con o sin kanikama, del tamaño que necesites."
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
    }
  ],
  "cupones": [],
  "personalizacion": [],
  "ingredientes": {}
};
