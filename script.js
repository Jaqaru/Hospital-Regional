(function () {
  "use strict";

  /* ============================================
     CONFIGURACIÓN DE ENVÍO REAL DE CORREOS (EmailJS)
     ============================================
     Completa estos 3 valores con los datos de tu cuenta EmailJS
     (Service ID, Template ID y Public Key). Mientras estén vacíos,
     el sistema sigue funcionando en modo simulado (solo guarda el
     correo en la bandeja/localStorage, sin enviarlo de verdad). */
  const EMAILJS_SERVICE_ID = "service_hxa3p8a";   // ej: "service_abc1234"
  const EMAILJS_TEMPLATE_ID = "template_voafdlo";  // ej: "template_xyz789"
  const EMAILJS_PUBLIC_KEY = "w2yEMlU962oWP1Ecy";   // ej: "AbCdEfGhIjKlMnOp"

  const EMAILJS_ACTIVO = !!(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY);

  if (EMAILJS_ACTIVO && typeof emailjs !== "undefined") {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  /* ============================================
     BASE DE DATOS SIMULADA (en memoria)
     ============================================ */

  // Simula la respuesta de RENIEC a partir del DNI
  const PACIENTES_DB = {
    "45231890": { nombres: "María Fernanda", apellidos: "Torres Quiñones" },
    "71029384": { nombres: "Carlos Alberto", apellidos: "Ramírez Solis" },
    "60918273": { nombres: "Luis Enrique", apellidos: "Vargas Peña" },
    "80215467": { nombres: "Rosa Isabel", apellidos: "Mendoza Castro" },
    "52147896": { nombres: "Miguel Ángel", apellidos: "Chávez Rojas" },
    "93012345": { nombres: "Elena Patricia", apellidos: "Flores Aguilar" },
    "74125836": { nombres: "Fernando Alonso", apellidos: "Quispe Mamani" },
    "68520147": { nombres: "Diana Carolina", apellidos: "Espinoza Bravo" },
    "90384756": { nombres: "Jhon Anderson", apellidos: "Palacios Ruiz" },
    "55647382": { nombres: "Katherine Milagros", apellidos: "Soto Guevara" },
    "41926350": { nombres: "Brayan Steve", apellidos: "Huamán Cárdenas" },
    "63857291": { nombres: "Lucero Anais", apellidos: "Mendieta Salas" },
    "78462913": { nombres: "Renzo Gabriel", apellidos: "Alvarado Chumpitaz" },
    "32918475": { nombres: "Vanessa Noelia", apellidos: "Zúñiga Torres" },
    "84763152": { nombres: "Marco Fabricio", apellidos: "León Gutiérrez" },
    "27418596": { nombres: "Ariana Belén", apellidos: "Cárdenas Ponce" },
    "15937482": { nombres: "Patricia Noemí", apellidos: "Salvador Injante" },
    "26480951": { nombres: "Josué Emmanuel", apellidos: "Rivas Cotrina" },
    "37159264": { nombres: "Xiomara Nicole", apellidos: "Beltrán Salcedo" },
    "48267103": { nombres: "Cristopher Joel", apellidos: "Manrique Solano" },
    "59372841": { nombres: "Estefany Milagros", apellidos: "Yupanqui Ccora" },
  };

  // Simula la respuesta de REFCON/MINSA + estado del SIS
  const REFERENCIAS_DB = {
    "REF-2026-00147": {
      dniEsperado: "45231890",
      estadoReferencia: "aprobada",
      sisActivo: true,
      especialidad: "Cardiología",
      medico: "Dr. Jorge Salinas Reyes",
      asunto: "Evaluación cardiológica por derivación de Medicina Interna",
    },
    "REF-2026-00220": {
      dniEsperado: "71029384",
      estadoReferencia: "observada",
      sisActivo: true,
      especialidad: "Traumatología",
      medico: "Dra. Ana Beltrán Rios",
      asunto: "Evaluación traumatológica",
      motivoObservacion: "Su referencia aún se encuentra en evaluación por el servicio médico correspondiente y todavía no ha sido aprobada.",
    },
    "REF-2026-00305": {
      dniEsperado: "60918273",
      estadoReferencia: "aprobada",
      sisActivo: false,
      especialidad: "Medicina Interna",
      medico: "Dr. Percy Huamán Díaz",
      asunto: "Control por Medicina Interna",
      motivoObservacion: "Su seguro SIS no se encuentra habilitado. Por favor regularice su afiliación antes de continuar.",
    },
    "REF-2026-00410": {
      dniEsperado: "80215467",
      estadoReferencia: "aprobada",
      sisActivo: true,
      especialidad: "Ginecología",
      medico: "Dra. Carmen Ríos Salazar",
      asunto: "Control ginecológico anual",
    },
    "REF-2026-00512": {
      dniEsperado: "52147896",
      estadoReferencia: "vencida",
      sisActivo: true,
      especialidad: "Neurología",
      medico: "Dr. Iván Suárez Campos",
      asunto: "Evaluación neurológica",
      motivoObservacion: "Tu referencia se encuentra vencida. Debes solicitar una nueva referencia en tu establecimiento de origen.",
    },
    "REF-2026-00633": {
      // Registrada a nombre de otro DNI a propósito: sirve para demostrar
      // la validación de coincidencia entre el DNI ingresado y el titular de la referencia.
      dniEsperado: "40112233",
      estadoReferencia: "aprobada",
      sisActivo: true,
      especialidad: "Dermatología",
      medico: "Dra. Katherine Loyola Vidal",
      asunto: "Evaluación dermatológica",
    },
    "REF-2026-00701": {
      dniEsperado: "74125836",
      estadoReferencia: "aprobada",
      sisActivo: true,
      especialidad: "Oftalmología",
      medico: "Dr. Renato Salcedo Vega",
      asunto: "Evaluación oftalmológica por catarata",
    },
    "REF-2026-00702": {
      dniEsperado: "68520147",
      estadoReferencia: "aprobada",
      sisActivo: true,
      especialidad: "Urología",
      medico: "Dr. Marco Antonio Cueva Rivas",
      asunto: "Control urológico",
    },
    "REF-2026-00703": {
      dniEsperado: "90384756",
      estadoReferencia: "aprobada",
      sisActivo: true,
      especialidad: "Endocrinología",
      medico: "Dra. Silvia Patricia Ochoa Lazo",
      asunto: "Control de diabetes tipo 2",
    },
    "REF-2026-00704": {
      dniEsperado: "55647382",
      estadoReferencia: "aprobada",
      sisActivo: true,
      especialidad: "Neumología",
      medico: "Dr. Raúl Enrique Paredes Nina",
      asunto: "Evaluación por asma bronquial",
    },
    "REF-2026-00705": {
      dniEsperado: "41926350",
      estadoReferencia: "aprobada",
      sisActivo: true,
      especialidad: "Otorrinolaringología",
      medico: "Dra. Pamela Cecilia Rojas Meza",
      asunto: "Evaluación por pérdida auditiva",
    },
    "REF-2026-00706": {
      dniEsperado: "63857291",
      estadoReferencia: "aprobada",
      sisActivo: true,
      especialidad: "Reumatología",
      medico: "Dr. Gonzalo Andrés Peña Ibarra",
      asunto: "Evaluación por artritis",
    },
    "REF-2026-00707": {
      dniEsperado: "78462913",
      estadoReferencia: "aprobada",
      sisActivo: true,
      especialidad: "Nefrología",
      medico: "Dra. Milagros Esther Contreras Díaz",
      asunto: "Control de función renal",
    },
    "REF-2026-00708": {
      dniEsperado: "32918475",
      estadoReferencia: "aprobada",
      sisActivo: true,
      especialidad: "Oncología",
      medico: "Dr. Hernán David Salazar Cotrina",
      asunto: "Evaluación oncológica",
    },
    "REF-2026-00709": {
      dniEsperado: "84763152",
      estadoReferencia: "aprobada",
      sisActivo: true,
      especialidad: "Psiquiatría",
      medico: "Dra. Fiorella Andrea Guerrero Núñez",
      asunto: "Evaluación por ansiedad",
    },
    "REF-2026-00710": {
      dniEsperado: "27418596",
      estadoReferencia: "aprobada",
      sisActivo: true,
      especialidad: "Gastroenterología",
      medico: "Dr. Iván Alexander Bocanegra Ríos",
      asunto: "Evaluación por gastritis crónica",
    },
    "REF-2026-00711": {
      dniEsperado: "15937482",
      estadoReferencia: "aprobada",
      sisActivo: true,
      especialidad: "Cardiología",
      medico: "Dr. Jorge Salinas Reyes",
      asunto: "Control cardiológico post consulta",
    },
    "REF-2026-00712": {
      dniEsperado: "26480951",
      estadoReferencia: "aprobada",
      sisActivo: true,
      especialidad: "Traumatología",
      medico: "Dra. Ana Beltrán Rios",
      asunto: "Evaluación traumatológica por caída",
    },
    "REF-2026-00713": {
      dniEsperado: "37159264",
      estadoReferencia: "aprobada",
      sisActivo: true,
      especialidad: "Ginecología",
      medico: "Dra. Carmen Ríos Salazar",
      asunto: "Control ginecológico",
    },
    "REF-2026-00714": {
      dniEsperado: "48267103",
      estadoReferencia: "aprobada",
      sisActivo: true,
      especialidad: "Dermatología",
      medico: "Dra. Katherine Loyola Vidal",
      asunto: "Evaluación dermatológica por dermatitis",
    },
    "REF-2026-00715": {
      dniEsperado: "59372841",
      estadoReferencia: "aprobada",
      sisActivo: true,
      especialidad: "Oftalmología",
      medico: "Dr. Renato Salcedo Vega",
      asunto: "Control oftalmológico",
    },
  };

  // Horarios base por día (se generan para los próximos días hábiles)
  const HORAS_BASE = ["08:00", "08:30", "09:00", "09:30", "10:30", "11:00", "11:30", "15:00", "15:30", "16:00"];

  // Cupos ya tomados (simulación de bloqueo de horario). Se llenan en runtime.
  const cuposOcupados = new Set(); // formato "YYYY-MM-DD|HH:MM"

  // Algunos cupos ya ocupados de ejemplo, para demostrar el bloqueo
  cuposOcupados.add(`${isoIn(2)}|09:00`);
  cuposOcupados.add(`${isoIn(3)}|15:30`);

  function isoIn(daysAhead) {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return d.toISOString().slice(0, 10);
  }

  /* ============================================
     PLANTILLA VISUAL DEL CORREO (HTML)
     ============================================
     Arma el cuerpo del correo con el mismo estilo en los 4 casos
     (registrado, observado en validación, aprobado por Admisión,
     observado por Admisión): saludo, breve introducción, una tabla
     con los datos clave en negrita, y una nota final. */
  window.construirCuerpoCorreo = function ({ nombreCompleto, introduccion, filas, notaFinal }) {
    const filasHtml = (filas || [])
      .filter((f) => f && f.value)
      .map(
        (f) => `
        <tr>
          <td style="padding:7px 16px 7px 0; color:#64748b; font-size:13px; white-space:nowrap; vertical-align:top;">${f.label}</td>
          <td style="padding:7px 0; color:#0B3D62; font-size:14px; font-weight:600;">${f.value}</td>
        </tr>`
      )
      .join("");

    return `
      <p style="margin:0 0 14px; font-size:15px; color:#16324A;">Estimado(a) <strong>${nombreCompleto}</strong>,</p>
      <p style="margin:0 0 18px; font-size:14px; color:#4C6B85; line-height:1.5;">${introduccion}</p>
      ${filasHtml ? `<table role="presentation" style="width:100%; border-collapse:collapse; margin:0 0 18px; border-top:1px solid #DCEBF7; border-bottom:1px solid #DCEBF7;">${filasHtml}</table>` : ""}
      <p style="margin:0; font-size:13px; color:#4C6B85; line-height:1.5;">${notaFinal || ""}</p>
    `;
  };

  /* ============================================
     SERVICIO DE CORREO ELECTRÓNICO (SIMULADO)
     ============================================
     Simula el "Servicio de Correo Electrónico" del diagrama de
     colaboración: cada vez que una solicitud termina (aprobada u
     observada), se registra un correo en una bandeja compartida
     (localStorage). admision.js reutiliza esta misma función. */
  window.enviarCorreoSimulado = function (destinatario, asunto, cuerpo, enviarReal) {
    const correo = {
      destinatario: destinatario || "(correo no proporcionado)",
      asunto,
      cuerpo,
      fecha: new Date().toLocaleString("es-PE"),
      enviadoReal: false,
    };
    window.CorreosStore.add(correo);
    console.log("[Servicio de Correo] Registrado para", correo.destinatario, "-", asunto);

    // Envío real (solo si el llamador lo pide explícitamente, p. ej. Admisión
    // al aprobar/observar una cita) y hay credenciales de EmailJS configuradas.
    if (enviarReal && EMAILJS_ACTIVO && typeof emailjs !== "undefined" && destinatario) {
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: destinatario,
        subject: asunto,
        message: cuerpo,
      }).then(() => {
        console.log("[EmailJS] Correo real enviado a", destinatario);
      }).catch((err) => {
        console.error("[EmailJS] No se pudo enviar el correo real:", err);
      });
    }

    // Notifica a otras partes de la MISMA página (p. ej. si el panel de Admisión
    // estuviera embebido en la misma pestaña)
    document.dispatchEvent(new CustomEvent("correoEnviado", { detail: correo }));
    return correo;
  };

  /* ============================================
     PERSISTENCIA COMPARTIDA (localStorage)
     ============================================
     index.html y admision.html son páginas distintas: cada una carga su
     propio JavaScript y NO comparten variables en memoria entre sí.
     Por eso, cuando un paciente confirmaba su cita en index.html, esa
     solicitud nunca llegaba al panel de Admisión (que vive en otra
     pestaña/página). Usamos localStorage, que sí persiste entre páginas
     del mismo sitio, como bandeja compartida. */
  const LS_SOLICITUDES = "hreg_solicitudesAdmision";
  const LS_CORREOS = "hreg_bandejaCorreos";
  window.STORAGE_KEYS = { SOLICITUDES: LS_SOLICITUDES, CORREOS: LS_CORREOS };

  window.SolicitudesStore = {
    seedDefault() {
      return [
        {
          id: "SOL-101", dni: "45231890", paciente: "María Fernanda Torres Quiñones",
          especialidad: "Cardiología", medico: "Dr. Jorge Salinas Reyes",
          fecha: "2026-08-05", hora: "09:00", refcon: "REF-2026-00147",
          correo: "maria.torres@example.com", estado: "PENDIENTE",
        },
        {
          id: "SOL-102", dni: "71029384", paciente: "Carlos Alberto Ramírez Solis",
          especialidad: "Traumatología", medico: "Dra. Ana Beltrán Rios",
          fecha: "2026-08-06", hora: "10:30", refcon: "REF-2026-00220",
          correo: "carlos.ramirez@example.com", estado: "PENDIENTE",
        },
      ];
    },
    load() {
      try {
        const raw = localStorage.getItem(LS_SOLICITUDES);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.warn("No se pudo leer solicitudes de localStorage", e);
      }
      const seed = this.seedDefault();
      this.save(seed);
      return seed;
    },
    save(lista) {
      try {
        localStorage.setItem(LS_SOLICITUDES, JSON.stringify(lista));
      } catch (e) {
        console.warn("No se pudo guardar solicitudes en localStorage", e);
      }
    },
    add(item) {
      const lista = this.load();
      lista.push(item);
      this.save(lista);
      return lista;
    },
  };

  window.CorreosStore = {
    load() {
      try {
        const raw = localStorage.getItem(LS_CORREOS);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.warn("No se pudo leer correos de localStorage", e);
        return [];
      }
    },
    save(lista) {
      try {
        localStorage.setItem(LS_CORREOS, JSON.stringify(lista));
      } catch (e) {
        console.warn("No se pudo guardar correos en localStorage", e);
      }
    },
    add(correo) {
      const lista = this.load();
      lista.unshift(correo);
      this.save(lista);
      return lista;
    },
  };

  /* ============================================
     ESTADO DE LA SESIÓN
     ============================================ */
  const state = {
    dni: "",
    nombres: "",
    apellidos: "",
    referenciaCodigo: "",
    correo: "",
    telefono: "",
    especialidad: "",
    medico: "",
    asunto: "",
    calendarViewDate: new Date(),
    selectedDate: null, // "YYYY-MM-DD"
    selectedTime: null, // "HH:MM"
  };

  /* ============================================
     NAVEGACIÓN ENTRE PASOS
     ============================================ */
  function goToStep(stepNumber) {
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("is-visible"));
    document.getElementById(`panel-${stepNumber}`).classList.add("is-visible");

    document.querySelectorAll(".step").forEach((li) => {
      const n = Number(li.dataset.step);
      li.classList.remove("is-active", "is-done");
      if (n < stepNumber) li.classList.add("is-done");
      if (n === stepNumber) li.classList.add("is-active");
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ============================================
     PASO 1 — FORMULARIO
     ============================================ */
  const dniInput = document.getElementById("dni");
  const nombresInput = document.getElementById("nombres");
  const apellidosInput = document.getElementById("apellidos");
  const referenciaInput = document.getElementById("referencia");
  const dniMsg = document.getElementById("dniMsg");
  const refMsg = document.getElementById("refMsg");

  dniInput.addEventListener("input", () => {
    dniInput.value = dniInput.value.replace(/\D/g, "").slice(0, 8);
  });

  dniInput.addEventListener("blur", () => {
    const dni = dniInput.value.trim();
    if (dni.length !== 8) {
      nombresInput.value = "";
      apellidosInput.value = "";
      if (dni.length > 0) {
        dniMsg.textContent = "El DNI debe tener 8 dígitos.";
        dniMsg.classList.add("is-error");
      } else {
        dniMsg.textContent = "";
      }
      return;
    }
    const registro = PACIENTES_DB[dni];
    if (registro) {
      nombresInput.value = registro.nombres;
      apellidosInput.value = registro.apellidos;
      dniMsg.textContent = "Datos encontrados en RENIEC.";
      dniMsg.classList.remove("is-error");
    } else {
      nombresInput.value = "";
      apellidosInput.value = "";
      dniMsg.textContent = "No se encontró este DNI en el registro (usa uno de los datos de prueba).";
      dniMsg.classList.add("is-error");
    }
  });

  document.getElementById("formDatos").addEventListener("submit", (e) => {
    e.preventDefault();

    const dni = dniInput.value.trim();
    const codigo = referenciaInput.value.trim().toUpperCase();
    const correo = document.getElementById("correo").value.trim();
    const telefono = document.getElementById("telefono").value.trim();

    if (dni.length !== 8 || !nombresInput.value) {
      dniMsg.textContent = "Ingresa un DNI válido registrado en RENIEC.";
      dniMsg.classList.add("is-error");
      dniInput.focus();
      return;
    }
    if (!REFERENCIAS_DB[codigo]) {
      refMsg.textContent = "No se encontró este código de referencia en REFCON/MINSA.";
      refMsg.classList.add("is-error");
      referenciaInput.focus();
      return;
    }

    state.dni = dni;
    state.nombres = nombresInput.value;
    state.apellidos = apellidosInput.value;
    state.referenciaCodigo = codigo;
    state.correo = correo;
    state.telefono = telefono;

    // Evita que un paciente que ya tiene una solicitud activa (pendiente o
    // aprobada) vuelva a registrar otra, generando datos duplicados en Admisión.
    const solicitudActiva = buscarSolicitudActivaPorDni(dni);
    if (solicitudActiva) {
      mostrarSolicitudDuplicada(solicitudActiva);
      return;
    }

    goToStep(2);
    runValidation();
  });

  function buscarSolicitudActivaPorDni(dni) {
    if (!window.SolicitudesStore) return null;
    const lista = window.SolicitudesStore.load();
    return lista.find((s) => s.dni === dni && (s.estado === "PENDIENTE" || s.estado === "APROBADA")) || null;
  }

  function mostrarSolicitudDuplicada(solicitud) {
    const resultDuplicateTitle = document.getElementById("resultDuplicateTitle");
    const resultDuplicateReason = document.getElementById("resultDuplicateReason");
    const resultDuplicate = document.getElementById("resultDuplicate");

    if (solicitud.estado === "APROBADA") {
      resultDuplicateTitle.textContent = "Tu cita ya fue programada";
      resultDuplicateReason.textContent = `Ya cuentas con una cita de ${solicitud.especialidad} con ${solicitud.medico}, programada para el ${solicitud.fecha} a las ${solicitud.hora}. Revisa tu correo electrónico para ver el detalle.`;
    } else {
      resultDuplicateTitle.textContent = "Tu solicitud está en evaluación";
      resultDuplicateReason.textContent = `Ya registraste una solicitud de cita (${solicitud.id}) para ${solicitud.especialidad}, y el personal de Admisión aún la está revisando. Te notificaremos por correo electrónico en cuanto sea aprobada u observada.`;
    }

    validatingState.hidden = true;
    resultOk.hidden = true;
    resultFail.hidden = true;
    resultDuplicate.hidden = false;
    goToStep(2);
  }

  /* ============================================
     PASO 2 — VALIDACIÓN SIMULADA
     ============================================ */
  const validatingState = document.getElementById("validatingState");
  const resultOk = document.getElementById("resultOk");
  const resultFail = document.getElementById("resultFail");
  const resultFailReason = document.getElementById("resultFailReason");
  const checkRef = document.getElementById("checkRef");
  const checkSis = document.getElementById("checkSis");

  function runValidation() {
    validatingState.hidden = false;
    resultOk.hidden = true;
    resultFail.hidden = true;
    document.getElementById("resultDuplicate").hidden = true;
    checkRef.classList.remove("is-done");
    checkSis.classList.remove("is-done");

    const ref = REFERENCIAS_DB[state.referenciaCodigo];

    setTimeout(() => {
      checkRef.classList.add("is-done");
    }, 700);

    setTimeout(() => {
      checkSis.classList.add("is-done");
    }, 1400);

    setTimeout(() => {
      validatingState.hidden = true;

      const referenciaAprobada = ref.estadoReferencia === "aprobada";
      const sisActivo = ref.sisActivo === true;
      const dniCoincide = ref.dniEsperado === state.dni;

      if (referenciaAprobada && sisActivo && dniCoincide) {
        state.especialidad = ref.especialidad;
        state.medico = ref.medico;
        state.asunto = ref.asunto;
        resultOk.hidden = false;
      } else {
        let motivo = ref.motivoObservacion || "No fue posible validar tu solicitud.";
        if (!dniCoincide) {
          motivo = "El DNI ingresado no coincide con el titular de esta referencia.";
        }
        resultFailReason.textContent = motivo;
        resultFail.hidden = false;

        const cuerpoCorreo = window.construirCuerpoCorreo({
          nombreCompleto: `${state.nombres} ${state.apellidos}`,
          introduccion: `Su solicitud de cita con el código de referencia <strong>${state.referenciaCodigo}</strong> ha quedado <strong style="color:#0B3D62;">OBSERVADA</strong>.`,
          filas: [
            { label: "Motivo", value: motivo },
          ],
          notaFinal: "Corrija lo indicado con su establecimiento de origen e inténtelo nuevamente. Este correo es una notificación automática, por favor no responder.",
        });
        window.enviarCorreoSimulado(
          state.correo,
          "Tu solicitud de cita quedó observada — Hospital Regional Eleazar Guzmán Barrón",
          cuerpoCorreo
        );
      }
    }, 2000);
  }

  document.getElementById("btnReintentar").addEventListener("click", () => {
    goToStep(1);
  });

  document.getElementById("btnContinuarPaso3").addEventListener("click", () => {
    fillSummary();
    goToStep(3);
    renderCalendar();
  });

  /* ============================================
     PASO 3 — RESUMEN + AGENDA
     ============================================ */
  function fillSummary() {
    document.getElementById("sumPaciente").textContent = `${state.nombres} ${state.apellidos}`;
    document.getElementById("sumDni").textContent = state.dni;
    document.getElementById("sumEspecialidad").textContent = state.especialidad;
    document.getElementById("sumMedico").textContent = state.medico;
    document.getElementById("sumAsunto").textContent = state.asunto;
  }

  const calDays = document.getElementById("calDays");
  const calMonthLabel = document.getElementById("calMonthLabel");
  const slotsGrid = document.getElementById("slotsGrid");
  const slotsTitle = document.getElementById("slotsTitle");
  const selectionSummary = document.getElementById("selectionSummary");
  const btnConfirmarCita = document.getElementById("btnConfirmarCita");

  const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  function toISODate(d) {
    return d.toISOString().slice(0, 10);
  }

  function isPastDay(d) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d < today;
  }

  function hasAgenda(d) {
    // Agenda disponible de lunes a viernes, dentro de los próximos 21 días
    const day = d.getDay(); // 0 = domingo, 6 = sábado
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((d - today) / 86400000);
    return day !== 0 && day !== 6 && diff >= 1 && diff <= 21;
  }

  function renderCalendar() {
    const view = state.calendarViewDate;
    calMonthLabel.textContent = `${MESES[view.getMonth()]} ${view.getFullYear()}`;

    const firstOfMonth = new Date(view.getFullYear(), view.getMonth(), 1);
    const startWeekday = (firstOfMonth.getDay() + 6) % 7; // convertir a lunes=0
    const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();

    calDays.innerHTML = "";

    for (let i = 0; i < startWeekday; i++) {
      const empty = document.createElement("span");
      empty.className = "cal-day is-empty";
      calDays.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(view.getFullYear(), view.getMonth(), day);
      const iso = toISODate(d);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cal-day";
      btn.textContent = String(day);

      const disponible = hasAgenda(d) && !isPastDay(d);

      if (!disponible) {
        btn.disabled = true;
      } else {
        btn.classList.add("has-agenda");
        btn.addEventListener("click", () => selectDate(iso, btn));
      }

      if (state.selectedDate === iso) {
        btn.classList.add("is-selected");
      }

      calDays.appendChild(btn);
    }
  }

  function selectDate(iso, btnEl) {
    state.selectedDate = iso;
    state.selectedTime = null;
    document.querySelectorAll(".cal-day").forEach((b) => b.classList.remove("is-selected"));
    btnEl.classList.add("is-selected");
    renderSlots();
    updateFooter();
  }

  function renderSlots() {
    slotsGrid.innerHTML = "";
    if (!state.selectedDate) {
      slotsTitle.textContent = "Selecciona primero una fecha";
      return;
    }

    const [y, m, dd] = state.selectedDate.split("-").map(Number);
    const dateLabel = new Date(y, m - 1, dd).toLocaleDateString("es-PE", {
      weekday: "long", day: "numeric", month: "long",
    });
    slotsTitle.textContent = `Horarios disponibles — ${dateLabel}`;

    HORAS_BASE.forEach((hora) => {
      const key = `${state.selectedDate}|${hora}`;
      const ocupado = cuposOcupados.has(key);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slot" + (ocupado ? " is-taken" : "");
      btn.textContent = hora;
      btn.disabled = ocupado;

      if (state.selectedTime === hora) btn.classList.add("is-selected");

      if (!ocupado) {
        btn.addEventListener("click", () => selectTime(hora, btn));
      }

      slotsGrid.appendChild(btn);
    });
  }

  function selectTime(hora, btnEl) {
    state.selectedTime = hora;
    document.querySelectorAll(".slot").forEach((b) => b.classList.remove("is-selected"));
    btnEl.classList.add("is-selected");
    updateFooter();
  }

  function updateFooter() {
    if (state.selectedDate && state.selectedTime) {
      const [y, m, dd] = state.selectedDate.split("-").map(Number);
      const dateLabel = new Date(y, m - 1, dd).toLocaleDateString("es-PE", {
        day: "numeric", month: "long", year: "numeric",
      });
      selectionSummary.textContent = `Seleccionaste: ${dateLabel}, ${state.selectedTime}`;
      btnConfirmarCita.disabled = false;
    } else {
      selectionSummary.textContent = "Ningún horario seleccionado todavía.";
      btnConfirmarCita.disabled = true;
    }
  }

  document.getElementById("calPrev").addEventListener("click", () => {
    state.calendarViewDate.setMonth(state.calendarViewDate.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById("calNext").addEventListener("click", () => {
    state.calendarViewDate.setMonth(state.calendarViewDate.getMonth() + 1);
    renderCalendar();
  });

 /* btnConfirmarCita.addEventListener("click", () => {
    // Doble verificación de bloqueo de cupo (evita cruce de horarios)
    const key = `${state.selectedDate}|${state.selectedTime}`;
    if (cuposOcupados.has(key)) {
      alert("Este horario acaba de ser tomado por otro paciente. Por favor elige otro.");
      renderSlots();
      return;
    }
    cuposOcupados.add(key);
    fillConfirmation();
    goToStep(4);
  }); */

  // Conexion con solicitudes de admision
  btnConfirmarCita.addEventListener("click", () => {
  // Doble verificación de bloqueo de cupo (evita cruce de horarios)
  const key = `${state.selectedDate}|${state.selectedTime}`;
  if (cuposOcupados.has(key)) {
    alert("Este horario acaba de ser tomado por otro paciente. Por favor elige otro.");
    renderSlots();
    return;
  }
  cuposOcupados.add(key);

  window.SolicitudesStore.add({
    id: `SOL-${Math.floor(1000 + Math.random() * 9000)}`,
    dni: state.dni,
    paciente: `${state.nombres} ${state.apellidos}`,
    especialidad: state.especialidad,
    medico: state.medico,
    fecha: state.selectedDate,
    hora: state.selectedTime,
    refcon: state.referenciaCodigo,
    correo: state.correo,
    estado: "PENDIENTE"
  });

  // Si el panel de Admisión está abierto en la MISMA pestaña, se actualiza al instante.
  // Si está en otra pestaña, se sincroniza solo al recargar (o vía el evento "storage").
  if (typeof solicitudesAdmision !== "undefined" && typeof renderTablaAdmision === "function") {
    solicitudesAdmision = window.SolicitudesStore.load();
    renderTablaAdmision();
  }

  fillConfirmation();
  goToStep(4);
});

  /* ============================================
     PASO 4 — CONFIRMACIÓN
     ============================================ */
  function fillConfirmation() {
    const [y, m, dd] = state.selectedDate.split("-").map(Number);
    const dateLabel = new Date(y, m - 1, dd).toLocaleDateString("es-PE", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    const hc = `HC-${state.dni}`;

    document.getElementById("cfPaciente").textContent = `${state.nombres} ${state.apellidos}`;
    document.getElementById("cfDni").textContent = state.dni;
    document.getElementById("cfEspecialidad").textContent = state.especialidad;
    document.getElementById("cfMedico").textContent = state.medico;
    document.getElementById("cfFecha").textContent = dateLabel;
    document.getElementById("cfHora").textContent = state.selectedTime;
    document.getElementById("cfHc").textContent = hc;

    const cuerpoCorreo = window.construirCuerpoCorreo({
      nombreCompleto: `${state.nombres} ${state.apellidos}`,
      introduccion: `Su cita ha sido <strong style="color:#0B3D62;">registrada</strong> y está en espera de confirmación final por el personal de Admisión.`,
      filas: [
        { label: "Especialidad", value: state.especialidad },
        { label: "Médico", value: state.medico },
        { label: "Fecha", value: dateLabel },
        { label: "Hora", value: state.selectedTime },
      ],
      notaFinal: "Preséntese con su DNI 15 minutos antes de la hora programada. Este correo es una notificación automática, por favor no responder.",
    });
    window.enviarCorreoSimulado(
      state.correo,
      "Registro de tu solicitud de cita — Hospital Regional Eleazar Guzmán Barrón",
      cuerpoCorreo,
      true // enviarReal: el paciente debe recibir confirmación de que su solicitud fue registrada
    );
  }

  function reiniciarFormulario() {
    document.getElementById("formDatos").reset();
    nombresInput.value = "";
    apellidosInput.value = "";
    dniMsg.textContent = "";
    dniMsg.classList.remove("is-error");
    refMsg.textContent = "";
    refMsg.classList.remove("is-error");
    state.selectedDate = null;
    state.selectedTime = null;
    state.calendarViewDate = new Date();
    goToStep(1);
  }

  document.getElementById("btnNuevaSolicitud").addEventListener("click", reiniciarFormulario);
  document.getElementById("btnCancelarSolicitud").addEventListener("click", reiniciarFormulario);
  document.getElementById("btnEntendidoDuplicado").addEventListener("click", reiniciarFormulario);

})();