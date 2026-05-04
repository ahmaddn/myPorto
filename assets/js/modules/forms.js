// ═══════════════════════════════════════════
//  FORMS — forms.js
// ═══════════════════════════════════════════

import { safeGet, safeSet, toast, uid } from "./utils.js";
import { saveData } from "./data.js";
import { FIREBASE_CACHE } from "./state.js";
import { renderDashboard, renderProjects } from "./render.js";
import { renderTechDonutChart } from "./charts.js";

export async function saveProject() {
  const id = safeGet("proj-id")?.value;
  const item = {
    id: id ? parseInt(id) : uid(),
    title: safeGet("proj-title")?.value || "",
    desc: safeGet("proj-desc")?.value || "",
    tech: safeGet("proj-tech")?.value || "",
    status: safeGet("proj-status")?.value || "Konsep",
    featured: safeGet("proj-featured")?.checked || false,
    link: safeGet("proj-link")?.value || "#",
    github: safeGet("proj-github")?.value || "#",
    icon: safeGet("proj-icon")?.value || "code-2",
  };

  let list = FIREBASE_CACHE.projects || [];
  if (id) {
    list = list.map((p) => (p.id === parseInt(id) ? item : p));
  } else {
    list.push(item);
  }

  const success = await saveData("projects", list);
  if (success) {
      if (typeof closeModal === 'function') closeModal("modal-project");
      toast(id ? "Project diperbarui!" : "Project ditambahkan!", "success");
      // Re-render
      renderDashboard();
      renderProjects();
      renderTechDonutChart();
  }
}

// ... Tambahkan save function lainnya ...
