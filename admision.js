/* ============================================
   MÓDULO DE ADMISIÓN (Panel de Control)
   ============================================ */

// Simulación de bandeja de solicitudes que llegan desde la web del paciente
let solicitudesAdmision = [
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
  
  // Notificación visual de simulación de vinculación con LOLCLI 9000
  alert(` Cita ${cita.id} APROBADA.\n\nSe ha generado la Historia Clínica HC-${cita.dni} en LOLCLI 9000 y se notificó al paciente.`);
  renderTablaAdmision();
}

function observarCita(index) {
  const motivo = prompt("Ingrese el motivo de la observación (ej. Refcon vencido / Firma ilegible):", "Documentación REFCON inconsistente");
  if (motivo) {
    const cita = solicitudesAdmision[index];
    cita.estado = "OBSERVADA";
    alert(`Cita ${cita.id} OBSERVADA.\nMotivo: ${motivo}\n\nEl cupo de las ${cita.hora} del ${cita.fecha} ha sido liberado en la agenda.`);
    renderTablaAdmision();
  }
}

// Inicializar tabla al cargar
document.addEventListener("DOMContentLoaded", renderTablaAdmision);