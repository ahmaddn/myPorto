// ═══════════════════════════════════════════
//  AUTH — auth.js
// ═══════════════════════════════════════════

import { safeGet, toast, hashPassword } from "./utils.js";
import { ADMIN_CREDENTIALS } from "./constants.js";
import { navigate, closeModal } from "./ui.js";


export function isAdmin() {
  return sessionStorage.getItem("isAdmin") === "true";
}

export function updateAdminBtn() {
  const loginBtn = safeGet("admin-nav-btn");
  const dashBtn = safeGet("dashboard-nav-btn");
  const loginBtnMob = safeGet("admin-nav-btn-mob");
  const dashBtnMob = safeGet("dashboard-nav-btn-mob");
  const isAdminUser = isAdmin();

  if (loginBtn) loginBtn.style.display = isAdminUser ? "none" : "";
  if (dashBtn) {
      if (isAdminUser) dashBtn.classList.remove("hidden");
      else dashBtn.classList.add("hidden");
  }

  if (loginBtnMob) loginBtnMob.style.display = isAdminUser ? "none" : "";
  if (dashBtnMob) {
      if (isAdminUser) dashBtnMob.classList.remove("hidden");
      else dashBtnMob.classList.add("hidden");
  }
}

export async function doAdminLogin() {
  try {
    const usernameInput = safeGet("admin-username");
    const passwordInput = safeGet("admin-password");
    if (!usernameInput || !passwordInput) return;

    const username = usernameInput.value;
    const password = passwordInput.value;
    const hashed = await hashPassword(password);

    if (username === ADMIN_CREDENTIALS.username && hashed === ADMIN_CREDENTIALS.password) {
      sessionStorage.setItem("isAdmin", "true");
      updateAdminBtn();
      closeModal('modal-admin-login');
      navigate("admin");
      toast("Login berhasil!", "success");
    } else {
      toast("Username atau password salah!", "error");
    }
  } catch (error) {
    console.error("Error during admin login:", error);
    toast("Terjadi kesalahan saat login: " + error.message, "error");
  }
}

export function doAdminLogout() {
  sessionStorage.removeItem("isAdmin");
  updateAdminBtn();
  navigate("dashboard");
  toast("Logout berhasil.", "info");
}
