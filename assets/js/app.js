// ═══════════════════════════════════════════
//  PORTONAJMY — app.js (Modular Version)
// ═══════════════════════════════════════════

import { initData } from "./modules/data.js";
import { navigate, toggleMobile, closeMobileMenu, switchTab, updateMenuVisibility, openModal, closeModal, toggleModulVisibility } from "./modules/ui.js";
import { throttle, debounce, safeGet, safeSet, toast } from "./modules/utils.js";
import { doAdminLogin, doAdminLogout, updateAdminBtn, isAdmin } from "./modules/auth.js";
import { saveProject } from "./modules/forms.js";
import { renderProjects, renderAbout, renderDashboard, refreshModulList } from "./modules/render.js";
import { FIREBASE_CACHE } from "./modules/state.js";

// ─────────────────────────────────────────
//  EXPOSE TO WINDOW (for HTML access)
// ─────────────────────────────────────────
window.navigate = navigate;
window.navigateTo = navigate;
window.toggleMobile = toggleMobile;
window.closeMobileMenu = closeMobileMenu;
window.switchTab = switchTab;
window.adminTab = switchTab; 
window.doAdminLogin = doAdminLogin;
window.doAdminLogout = doAdminLogout;
window.openModal = openModal;
window.closeModal = closeModal;
window.safeGet = safeGet;
window.safeSet = safeSet;
window.toast = toast;
window.showToast = toast;
window.refreshModulList = refreshModulList;
window.toggleModulVisibility = toggleModulVisibility;
window.deleteModul = async (id) => {
    if (!confirm('Hapus file modul ini dari daftar?')) return;
    const { FIREBASE_CACHE } = await import("./modules/state.js");
    const { saveData } = await import("./modules/data.js");
    const { renderAdminModul } = await import("./modules/render.js");
    
    FIREBASE_CACHE.modulFiles = FIREBASE_CACHE.modulFiles.filter(m => m.id !== id);
    const success = await saveData("modulFiles", FIREBASE_CACHE.modulFiles);
    if (success) {
        toast("File dihapus dari daftar", "success");
        renderAdminModul();
    }
};



window.openAdminLogin = () => {
    console.log("🔓 Triggering admin login modal...");
    openModal('modal-admin-login');
};

window.closeAdminLogin = () => closeModal('modal-admin-login');


window.openModulUserModal = () => openModal('modal-modul-user');

window.submitModulUserInfo = () => {
    const name = safeGet('modul-user-name')?.value;
    const cls = safeGet('modul-user-class')?.value;
    if (name && cls) {
        closeModal('modal-modul-user');
        if (window.showToast) window.showToast('Identitas disimpan. Silakan download modul.', 'success');
    } else {
        alert('Harap isi nama dan kelas!');
    }
};

window.filterProjects = (status) => {
    const cards = document.querySelectorAll("#projects-grid > div");
    cards.forEach(c => {
        const s = c.querySelector("span")?.textContent;
        c.style.display = (status === "all" || s === status) ? "" : "none";
    });
};


// ─────────────────────────────────────────
//  STARTUP
// ─────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 App initializing...");
    
    // Initial UI Setup
    updateAdminBtn();
    
    // Load Data
    await initData();
    
    console.log("📊 Global Cache State:", FIREBASE_CACHE);
    
    // Handle Modul Visibility
    const profile = FIREBASE_CACHE.profile || {};
    const settings = FIREBASE_CACHE.settings || {};
    
    // Check various possible flags - Default is HIDDEN if explicitly false or "false"
    // If status_modul is "nonaktif", hide it.
    const isModulOff = profile.show_modul === false || profile.show_modul === "false" || 
                      settings.modulVisible === false || settings.modulVisible === "false" ||
                      profile.status_modul === "nonaktif" || settings.status_modul === "nonaktif";
    
    const showModul = !isModulOff;
    
    console.log("📁 Visibility Check:", { 
        show_modul: profile.show_modul, 
        status_modul: profile.status_modul,
        settings_visible: settings.modulVisible,
        settings_status: settings.status_modul,
        result: showModul 
    });
    updateMenuVisibility(showModul);
    
    // Initial Route - Wait a bit for libs
    setTimeout(() => {
        navigate("dashboard");
        
        // Libs Init
        if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true });
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 100);
});




