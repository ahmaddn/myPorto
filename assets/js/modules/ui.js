import { safeGet } from "./utils.js";
import { 
    renderDashboard, 
    renderProjects, 
    renderAbout, 
    renderMedia, 
    renderContact, 
    renderModul,
    renderAdminOverview,
    renderAdminProjects,
    renderAdminSkills,
    renderAdminExperience,
    renderAdminFilms,
    renderAdminMusic,
    renderAdminBooks,
    renderAdminGames,
    renderAdminProfile,
    renderAdminModul
} from "./render.js";



export function navigate(pageName) {
  closeMobileMenu();
  
  // Handle sub-pages (e.g. films-detail)
  const fullPageId = pageName.startsWith("page-") ? pageName : `page-${pageName}`;
  
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  const target = safeGet(fullPageId);
  if (target) {
    target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Update nav links
  document.querySelectorAll(".nav-link, .mobile-nav-link").forEach((link) => {
    link.classList.remove("text-cyan");
    link.classList.add("text-muted");
    if (link.dataset.page === pageName) link.classList.add("text-cyan");
  });

  // Render content
  switch (pageName) {
    case "dashboard": renderDashboard(); break;
    case "projects": renderProjects(); break;
    case "about": renderAbout(); break;
    case "media": 
    case "films-detail":
    case "music-detail":
    case "books-detail":
    case "games-detail":
        renderMedia(); 
        break;
    case "contact": renderContact(); break;
    case "modul": renderModul(); break;
    case "admin": renderAdminOverview(); break;

  }


  if (typeof lucide !== 'undefined') lucide.createIcons();
}

export function openModal(id) {
    const el = safeGet(id);
    if (el) el.classList.add("active");
}

export function closeModal(id) {
    const el = safeGet(id);
    if (el) el.classList.remove("active");
}

export function toggleMobile() {
  const nav = safeGet("mobile-nav");
  if (nav) nav.classList.toggle("hidden");
}

export function closeMobileMenu() {
  const nav = safeGet("mobile-nav");
  if (nav) nav.classList.add("hidden");
}
export function switchTab(tabId, forceAdmin = null) {
  // Determine if this is an Admin tab or Media tab
  const isAdmin = forceAdmin !== null ? forceAdmin : (tabId.endsWith('-a') || ['overview', 'profile'].includes(tabId));

  const paneClass = isAdmin ? ".adm-panel" : ".hiburan-pane";
  
  document.querySelectorAll(paneClass).forEach((p) => p.classList.add("hidden"));
  
  const targetId = isAdmin ? (tabId.startsWith('adm-') ? tabId : `adm-${tabId}`) : tabId;
  const target = safeGet(targetId);
  
  if (target) {
    target.classList.remove("hidden");
    console.log(`[switchTab] Unhiding: ${targetId}`);
  } else {
    console.error(`[switchTab] Target panel not found: ${targetId}`);
  }

  const tabs = document.querySelectorAll(isAdmin ? ".adm-tab" : ".hiburan-tab");
  const activeClass = isAdmin ? "active-adm" : "active";

  tabs.forEach((t) => {
    t.classList.remove(activeClass, "border-cyan", "text-cyan");
    if (!isAdmin) t.classList.add("border-transparent", "text-muted");
    
    const dataAttr = isAdmin ? t.dataset.adm : t.dataset.tab;
    if (dataAttr === tabId) {
      t.classList.add(activeClass, "border-cyan", "text-cyan");
      if (!isAdmin) t.classList.remove("border-transparent", "text-muted");
    }
  });


  // Trigger renders for admin tabs
  if (isAdmin) {
    try {
      const cleanId = tabId.replace('-a', '');
      console.log(`[switchTab] Rendering admin section: ${cleanId}`);
      
      switch(cleanId) {
        case 'overview': renderAdminOverview(); break;
        case 'profile': renderAdminProfile(); break;
        case 'projects': renderAdminProjects(); break;
        case 'skills': renderAdminSkills(); break;
        case 'exp': renderAdminExperience(); break;
        case 'films': renderAdminFilms(); break;
        case 'music': renderAdminMusic(); break;
        case 'books': renderAdminBooks(); break;
        case 'games': renderAdminGames(); break;
        case 'modul': renderAdminModul(); break;
      }
    } catch (e) {
      console.error(`[switchTab] Render error for ${tabId}:`, e);
    }
  }
}




export function updateMenuVisibility(showModul) {
    const desktopMenu = safeGet("nav-modul-menu");
    const mobileMenu = safeGet("mobile-nav-modul-menu");
    if (desktopMenu) {
        if (showModul) desktopMenu.classList.remove("hidden");
        else desktopMenu.classList.add("hidden");
    }
    if (mobileMenu) {
        if (showModul) mobileMenu.classList.remove("hidden");
        else mobileMenu.classList.add("hidden");
    }
}

export async function toggleModulVisibility(isChecked) {
    const { saveData } = await import("./data.js");
    const { FIREBASE_CACHE } = await import("./state.js");
    
    FIREBASE_CACHE.settings = FIREBASE_CACHE.settings || {};
    FIREBASE_CACHE.settings.modulVisible = isChecked;
    
    const success = await saveData("settings", FIREBASE_CACHE.settings);
    if (success) {
        updateMenuVisibility(isChecked);
        const label = safeGet("modul-visibility-label");
        if (label) {
            label.innerHTML = isChecked 
                ? '<span class="text-mint font-bold">Aktif</span>' 
                : '<span class="text-muted">Nonaktif</span>';
        }
        if (window.showToast) window.showToast(`Menu Modul Ajar ${isChecked ? 'diaktifkan' : 'dinonaktifkan'}`, "success");
    }
}


