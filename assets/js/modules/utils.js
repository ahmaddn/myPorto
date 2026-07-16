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

// Fallback SHA-256 pure JS implementation for non-secure contexts (HTTP)
function sha256Fallback(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  var mathPow = Math.pow;
  var maxWord = 0xffffffff;
  var lengthProperty = 'length';
  var i, j;
  var result = '';

  var words = [];
  var asciiLength = ascii[lengthProperty] * 8;
  
  var hash = sha256Fallback.h = sha256Fallback.h || [];
  var k = sha256Fallback.k = sha256Fallback.k || [];
  var primeCounter = k[lengthProperty];

  var isPrime = function(n) {
    var divisor = 2;
    while (divisor * divisor <= n) {
      if (n % divisor === 0) return false;
      divisor++;
    }
    return true;
  };

  var candidate = 2;
  while (primeCounter < 64) {
    if (isPrime(candidate)) {
      if (primeCounter < 8) {
        hash[primeCounter] = (mathPow(candidate, 1/2) * 0x100000000) | 0;
      }
      k[primeCounter] = (mathPow(candidate, 1/3) * 0x100000000) | 0;
      primeCounter++;
    }
    candidate++;
  }
  
  var hashBuffer = [];
  for (i = 0; i < ascii[lengthProperty]; i++) {
    hashBuffer[i] = ascii.charCodeAt(i);
  }
  hashBuffer[ascii[lengthProperty]] = 0x80;
  while (hashBuffer[lengthProperty] % 64 !== 56) {
    hashBuffer.push(0);
  }
  for (i = 0; i < hashBuffer[lengthProperty]; i++) {
    j = (hashBuffer[i] << 24) | (hashBuffer[++i] << 16) | (hashBuffer[++i] << 8) | hashBuffer[++i];
    words.push(j);
  }
  words.push((asciiLength / 0x100000000) | 0);
  words.push(asciiLength | 0);
  
  var currentHash = hash.slice(0);
  for (i = 0; i < words[lengthProperty]; ) {
    var w = words.slice(i, i += 16);
    var oldHash = currentHash.slice(0);
    
    for (j = 0; j < 64; j++) {
      var wItem = w[j];
      if (j >= 16) {
        var s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        var s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        wItem = w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }
      
      var ch = (currentHash[4] & currentHash[5]) ^ (~currentHash[4] & currentHash[6]);
      var maj = (currentHash[0] & currentHash[1]) ^ (currentHash[0] & currentHash[2]) ^ (currentHash[1] & currentHash[2]);
      var sigma0 = rightRotate(currentHash[0], 2) ^ rightRotate(currentHash[0], 13) ^ rightRotate(currentHash[0], 22);
      var sigma1 = rightRotate(currentHash[4], 6) ^ rightRotate(currentHash[4], 11) ^ rightRotate(currentHash[4], 25);
      
      var temp1 = currentHash[7] + sigma1 + ch + k[j] + (wItem || 0);
      var temp2 = sigma0 + maj;
      
      currentHash = [(temp1 + temp2) | 0].concat(currentHash);
      currentHash[4] = (currentHash[4] + temp1) | 0;
      currentHash.length = 8;
    }
    
    for (j = 0; j < 8; j++) {
      currentHash[j] = (currentHash[j] + oldHash[j]) | 0;
    }
  }
  
  for (i = 0; i < 8; i++) {
    var hex = (currentHash[i] >>> 0).toString(16);
    while (hex[lengthProperty] < 8) {
      hex = '0' + hex;
    }
    result += hex;
  }
  return result;
}

export async function hashPassword(password) {
  if (window.crypto && window.crypto.subtle) {
    try {
      const enc = new TextEncoder().encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", enc);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (e) {
      console.warn("Crypto subtle failed, falling back to pure JS hash", e);
    }
  }
  return sha256Fallback(password);
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
