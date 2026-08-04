/* ============================================
   CHATBOT DE AYUDA — Hospital Regional
   Asistente simulado basado en coincidencia de
   palabras clave (sin backend, sin IA real).
   ============================================ */
(function () {
  "use strict";

  // Base de reglas: cada una tiene palabras clave y una respuesta.
  // Se busca la regla con más coincidencias en el mensaje del usuario.
  const REGLAS = [
    {
      palabras: [
        "hola", "holaa", "hola buenas", "buenas", "buenos dias", "buenas tardes",
        "buenas noches", "hey", "saludos", "que tal", "oe", "aloo", "buenas x",
      ],
      respuesta: "¡Hola! 👋 Soy el asistente virtual del Hospital Regional. Puedo ayudarte con dudas sobre tu DNI, tu código de referencia, tu seguro SIS, el horario de tu cita o tu historia clínica. ¿Qué necesitas saber?",
    },
    {
      palabras: [
        "chau", "adios", "nos vemos", "hasta luego", "bye", "me voy",
        "eso es todo", "listo gracias", "ya no necesito nada",
      ],
      respuesta: "¡Listo! Que te vaya bien con tu trámite. Si necesitas algo más, aquí estaré. 👋",
    },
    {
      palabras: [
        "quien eres", "eres un robot", "eres una IA", "eres real", "eres humano",
        "con quien hablo", "eres una persona", "eres un bot",
      ],
      respuesta: "Soy un asistente virtual del Hospital Regional — respondo con base en palabras clave, no soy una persona real. Para trámites que necesiten atención humana, te recomiendo acercarte a Admisión.",
    },
    {
      palabras: [
        "emergencia", "urgencia", "me siento mal", "dolor fuerte", "es grave",
        "ambulancia", "sangrado", "no puedo respirar",
      ],
      respuesta: "⚠️ Si tienes una emergencia médica real, acude de inmediato al área de Emergencias del hospital o llama a la línea de emergencias de tu localidad — este chat es solo para dudas sobre el trámite de citas, no reemplaza atención médica urgente.",
    },
    {
      palabras: [
        "donde queda", "direccion", "ubicacion", "como llego", "donde esta el hospital",
      ],
      respuesta: "Este es un prototipo académico, así que no tengo una dirección real cargada — en una versión en producción aquí iría la ubicación exacta del Hospital Regional Eleazar Guzmán Barrón.",
    },
    {
      palabras: [
        "dni", "documento de identidad", "nombre", "apellido", "reniec", "mi nombre no sale",
        "no aparece mi nombre", "no carga mi nombre", "no me reconoce el dni",
      ],
      respuesta: "Solo escribe tu número de DNI (8 dígitos) en el paso 1 y tu nombre y apellido se completan automáticamente, como si se validara con RENIEC. No necesitas escribirlos tú mismo. Si no aparece, revisa que sea uno de los DNI de prueba del sistema.",
    },
    {
      palabras: [
        "referencia", "refcon", "codigo", "minsa", "derivacion", "derivar",
        "no tengo referencia", "que es la referencia", "de donde saco el codigo",
      ],
      respuesta: "El código de referencia (formato REF-2026-XXXXX) lo entrega tu centro de salud de origen cuando te derivan al Hospital Regional. Ese código sí debes ingresarlo manualmente en el paso 1. Si estás probando el sistema, en el formulario tienes un panel desplegable con códigos de ejemplo.",
    },
    {
      palabras: [
        "sis", "seguro", "asegurado", "cobertura", "costo", "pagar", "gratis",
        "gratuito", "cuanto cuesta", "es pagado", "tiene costo", "vale algo",
      ],
      respuesta: "Si estás afiliado al SIS y tu referencia es válida, la cita no tiene costo — el sistema valida tu cobertura automáticamente al procesar tu solicitud.",
    },
    {
      palabras: [
        "especialidad", "medico", "doctor", "doctora", "quien me atiende",
        "que especialista", "puedo elegir doctor", "puedo escoger medico",
      ],
      respuesta: "La especialidad y el médico se asignan automáticamente según los datos de tu referencia — no los eliges tú, ya vienen definidos por la derivación de tu centro de salud.",
    },
    {
      palabras: [
        "horario", "hora", "calendario", "cupo", "cupos", "disponibilidad",
        "que dias", "que horas", "hay campo", "hay espacio", "esta lleno",
      ],
      respuesta: "En el paso 3 puedes ver el calendario con los días disponibles para tu especialidad asignada. Elige un día y luego un horario libre entre los cupos que aparezcan.",
    },
    {
      palabras: [
        "cancelar", "cambiar cita", "reprogramar", "anular", "me equivoque de hora",
        "puedo cambiar el horario", "quiero otra fecha",
      ],
      respuesta: "Por ahora este prototipo no permite cancelar o reprogramar desde aquí. Si necesitas cambiar tu cita, comunícate directamente con el área de Admisión del hospital.",
    },
    {
      palabras: [
        "correo", "email", "confirmacion", "notificacion", "me van a avisar",
        "no me llego nada", "no recibi correo", "revisar mi bandeja",
      ],
      respuesta: "Cuando Admisión aprueba u observa tu solicitud, se simula el envío automático de un correo de confirmación con el detalle de tu cita o el motivo de la observación.",
    },
    {
      palabras: ["historia clinica", "historia", "expediente", "hc", "numero de historia"],
      respuesta: "El número de Historia Clínica (HC) se genera cuando tu cita queda APROBADA por Admisión, y aparece en tu comprobante final (paso 4).",
    },
    {
      palabras: [
        "documentos", "que llevar", "presentarme", "requisitos", "llevar",
        "algo mas que llevar", "que necesito llevar",
      ],
      respuesta: "El día de tu cita, preséntate con tu DNI físico al menos 15 minutos antes de la hora asignada. Ese recordatorio también llega en tu correo de confirmación.",
    },
    {
      palabras: [
        "admision", "estado", "aprobado", "observado", "pendiente", "ya fue aprobada",
        "como va mi solicitud", "revisaron mi cita", "ya la revisaron",
      ],
      respuesta: "El personal de Admisión revisa tu solicitud y la marca como Aprobada u Observada. Te enteras del resultado por el correo simulado de confirmación.",
    },
    {
      palabras: [
        "contacto", "telefono", "numero de contacto", "asesor", "hablar con alguien",
        "persona real", "atencion al cliente",
      ],
      respuesta: "Este es un prototipo académico, así que no hay una línea real de atención — pero en un sistema en producción aquí iría el teléfono y horario de Admisión del hospital.",
    },
    {
      palabras: [
        "gracias", "muchas gracias", "genial", "perfecto", "listo", "entendido",
        "buena esa", "de una", "bacan", "chevere",
      ],
      respuesta: "¡De nada! Si te surge otra duda sobre el proceso de tu cita, aquí estoy. 🙂",
    },
    {
      palabras: [
        "pasos", "proceso", "empezar", "comenzar", "ayuda",
        "cita", "citas", "sacar", "saco", "pedir", "pido",
        "reservar", "reservo", "solicitar", "solicito",
        "conseguir", "obtener", "tramitar", "agendar", "agendo",
        "como funciona", "que hago", "por donde empiezo", "primer paso",
      ],
      respuesta: "El proceso tiene 4 pasos: 1) Ingresas tu DNI y código de referencia, 2) el sistema valida tus datos, 3) eliges día y horario disponible, 4) recibes tu comprobante de cita. ¿Sobre cuál paso tienes dudas?",
    },
  ];

  const RESPUESTA_DEFECTO =
    "No estoy seguro de haber entendido eso 🤔. Puedes preguntarme si tienes alguna duda sobre: tu DNI, el código de referencia, tu seguro SIS, la especialidad asignada, el horario de tu cita, o tu historia clínica.";

  const SUGERENCIAS = [
    "¿Cómo saco mi cita?",
    "¿Qué es el código de referencia?",
    "¿Necesito pagar si tengo SIS?",
    "¿Qué debo llevar el día de mi cita?",
  ];

  function normalizar(texto) {
    return texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // quita tildes
  }

  function buscarRespuesta(mensaje) {
    const texto = normalizar(mensaje);
    let mejorRegla = null;
    let mejorPuntaje = 0;

    REGLAS.forEach((regla) => {
      let puntaje = 0;
      regla.palabras.forEach((palabra) => {
        if (texto.includes(normalizar(palabra))) puntaje++;
      });
      if (puntaje > mejorPuntaje) {
        mejorPuntaje = puntaje;
        mejorRegla = regla;
      }
    });

    return mejorRegla ? mejorRegla.respuesta : RESPUESTA_DEFECTO;
  }

  /* ============================================
     UI del widget
     ============================================ */
  document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("chatToggleBtn");
    const panel = document.getElementById("chatPanel");
    const closeBtn = document.getElementById("chatCloseBtn");
    const messagesEl = document.getElementById("chatMessages");
    const form = document.getElementById("chatForm");
    const input = document.getElementById("chatInput");
    const chipsEl = document.getElementById("chatChips");

    if (!toggleBtn || !panel) return;

    let abierto = false;
    let saludoMostrado = false;

    function scrollAbajo() {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function agregarMensaje(texto, autor) {
      const burbuja = document.createElement("div");
      burbuja.className = `chat-msg chat-msg--${autor}`;
      burbuja.textContent = texto;
      messagesEl.appendChild(burbuja);
      scrollAbajo();
    }

    function mostrarEscribiendo(callback) {
      const typing = document.createElement("div");
      typing.className = "chat-msg chat-msg--bot chat-msg--typing";
      typing.innerHTML = "<span></span><span></span><span></span>";
      messagesEl.appendChild(typing);
      scrollAbajo();
      setTimeout(() => {
        typing.remove();
        callback();
      }, 500 + Math.random() * 400);
    }

    function renderChips() {
      chipsEl.innerHTML = "";
      SUGERENCIAS.forEach((s) => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "chat-chip";
        chip.textContent = s;
        chip.addEventListener("click", () => enviarMensaje(s));
        chipsEl.appendChild(chip);
      });
    }

    function enviarMensaje(texto) {
      const limpio = texto.trim();
      if (!limpio) return;
      agregarMensaje(limpio, "user");
      input.value = "";
      chipsEl.innerHTML = "";

      mostrarEscribiendo(() => {
        const respuesta = buscarRespuesta(limpio);
        agregarMensaje(respuesta, "bot");
        if (respuesta === RESPUESTA_DEFECTO) {
          renderChips();
        }
      });
    }

    function abrirChat() {
      abierto = true;
      panel.classList.add("is-open");
      toggleBtn.classList.add("is-active");
      input.focus();

      if (!saludoMostrado) {
        saludoMostrado = true;
        mostrarEscribiendo(() => {
          agregarMensaje(
            "¡Hola! 👋 Soy el asistente virtual del Hospital Regional. ¿En qué te puedo ayudar con tu cita?",
            "bot"
          );
          renderChips();
        });
      }
    }

    function cerrarChat() {
      abierto = false;
      panel.classList.remove("is-open");
      toggleBtn.classList.remove("is-active");
    }

    toggleBtn.addEventListener("click", () => {
      abierto ? cerrarChat() : abrirChat();
    });
    closeBtn.addEventListener("click", cerrarChat);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      enviarMensaje(input.value);
    });
  });
})();