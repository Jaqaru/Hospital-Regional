/* ============================================
   MÓDULO DE ADMISIÓN (Panel de Control)
   ============================================ */

// Las solicitudes ya no viven solo en memoria: se leen de la bandeja
// compartida en localStorage (window.SolicitudesStore, definida en
// script.js), que es donde el portal del paciente (index.html) las
// escribe. Si por algún motivo script.js no se cargó, se usa un
// arreglo local como respaldo mínimo.
let solicitudesAdmision = window.SolicitudesStore
  ? window.SolicitudesStore.load()
  : [
      {
        id: "SOL-101",
        dni: "45231890",
        paciente: "María Fernanda Torres Quiñones",
        especialidad: "Cardiología",
        medico: "Dr. Jorge Salinas Reyes",
        fecha: "2026-08-05",
        hora: "09:00",
        refcon: "REF-2026-00147",
        estado: "PENDIENTE"
      },
      {
        id: "SOL-102",
        dni: "71029384",
        paciente: "Carlos Alberto Ramírez Solis",
        especialidad: "Traumatología",
        medico: "Dra. Ana Beltrán Rios",
        fecha: "2026-08-06",
        hora: "10:30",
        refcon: "REF-2026-00220",
        estado: "PENDIENTE"
      }
    ];

function renderStats() {
  const total = solicitudesAdmision.length;
  const pendientes = solicitudesAdmision.filter((s) => s.estado === "PENDIENTE").length;
  const aprobadas = solicitudesAdmision.filter((s) => s.estado === "APROBADA").length;
  const observadas = solicitudesAdmision.filter((s) => s.estado === "OBSERVADA").length;

  const setValor = (id, valor) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = valor;
  };

  setValor("statTotal", total);
  setValor("statPendientes", pendientes);
  setValor("statAprobadas", aprobadas);
  setValor("statObservadas", observadas);
}

function renderTablaAdmision() {
  const tbody = document.getElementById("tablaAdmisionBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  solicitudesAdmision.forEach((item, index) => {
    const tr = document.createElement("tr");

    let badgeClass = "badge-pendiente";
    if (item.estado === "APROBADA") badgeClass = "badge-aprobada";
    if (item.estado === "OBSERVADA") badgeClass = "badge-observada";

    tr.innerHTML = `
      <td><strong>${item.id}</strong></td>
      <td>${item.paciente}<br><small style="color:#64748b;">DNI: ${item.dni}</small></td>
      <td>${item.especialidad}<br><small style="color:#64748b;">${item.medico}</small></td>
      <td>${item.fecha}<br><strong>${item.hora}</strong></td>
      <td><code>${item.refcon}</code></td>
      <td><span class="badge ${badgeClass}">${item.estado}</span></td>
      <td>
        ${
          item.estado === "PENDIENTE"
            ? `<button class="btn-action btn-aprobar" onclick="aprobarCita(${index})">Aprobar</button>
               <button class="btn-action btn-observar" onclick="observarCita(${index})">Observar</button>`
            : `<small style="color:#94a3b8;">Procesado</small>`
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function aprobarCita(index) {
  const cita = solicitudesAdmision[index];
  cita.estado = "APROBADA";
  if (window.SolicitudesStore) window.SolicitudesStore.save(solicitudesAdmision);

  // Notificación por correo electrónico al paciente (Servicio de Correo Electrónico)
  const cuerpo = window.construirCuerpoCorreo
    ? window.construirCuerpoCorreo({
        nombreCompleto: cita.paciente,
        introduccion: `Su cita ha sido <strong style="color:#166534;">APROBADA</strong> y no tiene ningún costo, ya que está cubierta por su seguro SIS.`,
        filas: [
          { label: "Especialidad", value: cita.especialidad },
          { label: "Médico", value: cita.medico },
          { label: "Fecha", value: cita.fecha },
          { label: "Hora", value: cita.hora },
          { label: "N.º de Historia Clínica", value: `HC-${cita.dni}` },
        ],
        notaFinal: "Preséntese con su DNI 15 minutos antes de la hora programada. Este correo es una notificación automática, por favor no responder.",
      })
    : `Estimado(a) ${cita.paciente}, su cita ha sido APROBADA. Especialidad: ${cita.especialidad}. Médico: ${cita.medico}. Fecha: ${cita.fecha}. Hora: ${cita.hora}. N.º de Historia Clínica: HC-${cita.dni}.`;

  if (typeof window.enviarCorreoSimulado === "function") {
    window.enviarCorreoSimulado(
      cita.correo,
      "Tu cita fue APROBADA — Hospital Regional Eleazar Guzmán Barrón",
      cuerpo,
      true // enviarReal: la cita recién es definitiva cuando Admisión la aprueba
    );
  }

  // Notificación visual de simulación de vinculación con LOLCLI 9000
  alert(`Cita ${cita.id} APROBADA.\n\nSe ha generado la Historia Clínica HC-${cita.dni} en LOLCLI 9000 y se notificó al paciente por correo (${cita.correo || "sin correo registrado"}).`);
  renderTablaAdmision();
  renderStats();
}

function observarCita(index) {
  const motivo = prompt("Ingrese el motivo de la observación (ej. Refcon vencido / Firma ilegible):", "Documentación REFCON inconsistente");
  if (motivo) {
    const cita = solicitudesAdmision[index];
    cita.estado = "OBSERVADA";
    if (window.SolicitudesStore) window.SolicitudesStore.save(solicitudesAdmision);

    // Notificación por correo electrónico al paciente (Servicio de Correo Electrónico)
    const cuerpo = window.construirCuerpoCorreo
      ? window.construirCuerpoCorreo({
          nombreCompleto: cita.paciente,
          introduccion: `Su solicitud de cita (<strong>${cita.id}</strong>) ha quedado <strong style="color:#991b1b;">OBSERVADA</strong> por el personal de Admisión. El horario que había seleccionado ha sido liberado en la agenda.`,
          filas: [
            { label: "Motivo", value: motivo },
          ],
          notaFinal: "Por favor gestione la corrección correspondiente con su establecimiento de origen. Este correo es una notificación automática, por favor no responder.",
        })
      : `Estimado(a) ${cita.paciente}, su solicitud de cita (${cita.id}) ha quedado OBSERVADA. Motivo: ${motivo}`;

    if (typeof window.enviarCorreoSimulado === "function") {
      window.enviarCorreoSimulado(
        cita.correo,
        "Tu solicitud de cita quedó OBSERVADA — Hospital Regional Eleazar Guzmán Barrón",
        cuerpo,
        true // enviarReal: la decisión final (observada) también la toma Admisión
      );
    }

    alert(`Cita ${cita.id} OBSERVADA.\nMotivo: ${motivo}\n\nEl cupo de las ${cita.hora} del ${cita.fecha} ha sido liberado en la agenda y se notificó al paciente por correo (${cita.correo || "sin correo registrado"}).`);
    renderTablaAdmision();
    renderStats();
  }
}

/* ============================================
   BANDEJA DE CORREOS ENVIADOS (auditoría)
   ============================================ */
function renderBandejaCorreos() {
  const cont = document.getElementById("correosLogBody");
  if (!cont) return;
  const bandeja = window.CorreosStore ? window.CorreosStore.load() : [];
  cont.innerHTML = "";

  if (bandeja.length === 0) {
    cont.innerHTML = `<p class="email-empty">Aún no se han enviado correos.</p>`;
    return;
  }

  // Más recientes primero
  [...bandeja].reverse().forEach((c) => {
    const inicial = (c.destinatario || "?").trim().charAt(0).toUpperCase();
    const card = document.createElement("article");
    card.className = "email-card";
    card.innerHTML = `
      <button type="button" class="email-card__head">
        <span class="email-card__avatar">${inicial}</span>
        <span class="email-card__headtext">
          <span class="email-card__line1">
            <span class="email-card__from">Hospital Regional Eleazar Guzmán Barrón</span>
            <span class="email-card__date">${c.fecha}</span>
          </span>
          <span class="email-card__subject">${c.asunto}</span>
          <span class="email-card__to">Para: ${c.destinatario}</span>
        </span>
      </button>
      <div class="email-card__body">${c.cuerpo}</div>
    `;
    const headBtn = card.querySelector(".email-card__head");
    headBtn.addEventListener("click", () => card.classList.toggle("is-open"));
    cont.appendChild(card);
  });

  // La más reciente arranca expandida
  const primera = cont.querySelector(".email-card");
  if (primera) primera.classList.add("is-open");
}

document.addEventListener("correoEnviado", renderBandejaCorreos);

// Cerrar sesión: borra la marca de login y regresa a la pantalla de acceso.
document.getElementById("btnCerrarSesion").addEventListener("click", () => {
  sessionStorage.removeItem("isLogged");
  window.location.href = "login_intranet.html";
});

// Limpiar datos de prueba: borra las solicitudes y correos guardados en
// localStorage y vuelve a dejar los 2 pacientes de ejemplo originales.
// Útil mientras se hacen pruebas repetidas para evitar datos duplicados.
document.getElementById("btnLimpiarDatos").addEventListener("click", () => {
  const confirmar = confirm(
    "Esto borrará TODAS las solicitudes y correos guardados (incluyendo los reales que hayan llegado a un correo) y dejará solo los 2 pacientes de ejemplo. ¿Deseas continuar?"
  );
  if (!confirmar) return;

  if (window.SolicitudesStore) {
    window.SolicitudesStore.save(window.SolicitudesStore.seedDefault());
    solicitudesAdmision = window.SolicitudesStore.load();
  }
  if (window.CorreosStore) {
    window.CorreosStore.save([]);
  }

  renderTablaAdmision();
  renderBandejaCorreos();
  renderStats();
  alert("Datos de prueba reiniciados.");
});

// Si el paciente confirma su solicitud en OTRA pestaña (index.html) mientras
// este panel está abierto, localStorage dispara este evento y refrescamos
// la tabla y la bandeja de correos automáticamente.
window.addEventListener("storage", (e) => {
  if (window.STORAGE_KEYS && e.key === window.STORAGE_KEYS.SOLICITUDES) {
    solicitudesAdmision = window.SolicitudesStore.load();
    renderTablaAdmision();
    renderStats();
  }
  if (window.STORAGE_KEYS && e.key === window.STORAGE_KEYS.CORREOS) {
    renderBandejaCorreos();
  }
});

// Inicializar tabla al cargar
document.addEventListener("DOMContentLoaded", () => {
  renderTablaAdmision();
  renderBandejaCorreos();
  renderStats();
});