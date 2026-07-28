(function () {
  "use strict";

  /* ============================================
     BASE DE DATOS SIMULADA (en memoria)
     ============================================ */

  // Simula la respuesta de RENIEC a partir del DNI
  const PACIENTES_DB = {
    "45231890": { nombres: "María Fernanda", apellidos: "Torres Quiñones" },
    "71029384": { nombres: "Carlos Alberto", apellidos: "Ramírez Solis" },
    "60918273": { nombres: "Luis Enrique", apellidos: "Vargas Peña" },
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

    goToStep(2);
    runValidation();
  });

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

  if (typeof solicitudesAdmision !== "undefined") {
    solicitudesAdmision.push({
      id: `SOL-${Math.floor(1000 + Math.random() * 9000)}`,
      dni: state.dni,
      paciente: `${state.nombres} ${state.apellidos}`,
      especialidad: state.especialidad,
      medico: state.medico,
      fecha: state.selectedDate,
      hora: state.selectedTime,
      refcon: state.referenciaCodigo,
      estado: "PENDIENTE"
    });

    // Si el panel de admisión está visible en la página, se actualiza al instante
    if (typeof renderTablaAdmision === "function") {
      renderTablaAdmision();
    }
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

    document.getElementById("emailTo").textContent = state.correo || "(correo no proporcionado)";
    document.getElementById("emailBody").textContent =
      `Estimado(a) ${state.nombres} ${state.apellidos}, su cita de ${state.especialidad} con ${state.medico} ha sido confirmada para el ${dateLabel} a las ${state.selectedTime}. Preséntese con su DNI 15 minutos antes de la hora programada. Este correo es una notificación automática, por favor no responder.`;
  }

  document.getElementById("btnNuevaSolicitud").addEventListener("click", () => {
    document.getElementById("formDatos").reset();
    dniMsg.textContent = "";
    refMsg.textContent = "";
    state.selectedDate = null;
    state.selectedTime = null;
    state.calendarViewDate = new Date();
    goToStep(1);
  });

})();