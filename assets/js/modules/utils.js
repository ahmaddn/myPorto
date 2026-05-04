// ═══════════════════════════════════════════
//  UTILS — utils.js
// ═══════════════════════════════════════════

import { SESSION_DURATION } from "./constants.js";
import { MODUL_USER_INFO } from "./state.js";

export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = (func, limit = 100) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export function setSessionWithExpiry(key, value) {
  const now = new Date().getTime();
  const item = {
    value: value,
    expiry: now + SESSION_DURATION,
  };
  sessionStorage.setItem(key, JSON.stringify(item));
}

export function getSessionWithExpiry(key) {
  const itemStr = sessionStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    const now = new Date().getTime();
    if (now > item.expiry) {
      sessionStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (e) {
    console.error("Error parsing session data:", e);
    return null;
  }
}

export function cleanExpiredSession() {
  const modulUserData = getSessionWithExpiry("modulUserInfo");
  if (modulUserData === null) {
    MODUL_USER_INFO.name = null;
    MODUL_USER_INFO.class = null;
  }
}

export function safeSet(elementId, property, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element[property] = value;
  } else {
    // console.warn(`Element with id "${elementId}" not found`);
  }
}

export function safeGet(elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    // console.warn(`Element with id "${elementId}" not found`);
  }
  return element;
}

export function uid() {
  return Date.now() + Math.floor(Math.random() * 10000);
}

export async function hashPassword(password) {
  const enc = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", enc);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function toast(msg, type = "info") {
  const iconMap = {
    success: "&#10003;",
    error: "&#10007;",
    info: "&#9432;",
    warning: "&#9888;",
  };

  const colorMap = {
    success: { bg: "#0a1f16", border: "rgba(120,250,185,0.3)", iconBg: "rgba(120,250,185,0.1)", iconColor: "#78fab9" },
    error: { bg: "#1f0a0a", border: "rgba(248,113,113,0.3)", iconBg: "rgba(248,113,113,0.1)", iconColor: "#f87171" },
    info: { bg: "#0a161f", border: "rgba(119,202,237,0.3)", iconBg: "rgba(119,202,237,0.1)", iconColor: "#77caed" },
    warning: { bg: "#1f180a", border: "rgba(251,191,36,0.3)", iconBg: "rgba(251,191,36,0.1)", iconColor: "#fbbf24" },
  };

  const c = colorMap[type] || colorMap.info;
  const icon = iconMap[type] || iconMap.info;

  if (typeof Swal !== 'undefined') {
      const Toast = Swal.mixin({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3200,
        timerProgressBar: true,
        didOpen: (popup) => {
          popup.style.background = c.bg;
          popup.style.border = `1px solid ${c.border}`;
          popup.style.borderRadius = "14px";
          popup.style.boxShadow = "0 8px 32px rgba(0,0,0,0.5)";
          popup.style.padding = "12px 16px";
          popup.addEventListener("mouseenter", Swal.stopTimer);
          popup.addEventListener("mouseleave", Swal.resumeTimer);
        },
        background: c.bg,
        color: "#e8f4f0",
        html: `
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="
              width:34px;height:34px;border-radius:9px;flex-shrink:0;
              background:${c.iconBg};border:1px solid ${c.border};
              display:flex;align-items:center;justify-content:center;
              font-size:15px;font-weight:800;color:${c.iconColor};
              font-family:'JetBrains Mono',monospace;
            ">${icon}</div>
            <span style="font-size:0.85rem;font-family:'DM Sans',sans-serif;font-weight:500;color:#e8f4f0;line-height:1.45;">${msg}</span>
          </div>
        `,
      });
      Toast.fire({});
  } else {
      console.log(`[${type}] ${msg}`);
  }
}
