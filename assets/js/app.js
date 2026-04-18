// ═══════════════════════════════════════════
//  PORTONAJMY — app.js (Firebase Integrated - FIXED v2)
// ═══════════════════════════════════════════

import {
  getData as getFirebaseData,
  addData as addFirebaseData,
  updateData as updateFirebaseData,
  deleteData as deleteFirebaseData,
  setData as setFirebaseData,
  batchAddData,
  clearCollection,
  getDocumentById,
  db,
} from "./firebase-service.js";

import {
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// ─────────────────────────────────────────
//  GLOBAL STATE & CACHE
// ─────────────────────────────────────────
let FIREBASE_CACHE = {
  profile: null,
  skills: [],
  experience: [],
  projects: [],
  films: [],
  music: [],
  books: [],
  games: [],
  modulFiles: [], // Daftar file PDF modul ajar
  settings: {
    modulVisible: true, // Default: menu modul terlihat
  },
};

let CACHE_LOADED = false;

// State untuk menyimpan info user modul (nama dan kelas)
let MODUL_USER_INFO = {
  name: null,
  class: null,
};

// Konstanta untuk durasi sessionStorage (8 jam dalam milidetik)
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 jam

// Debounce utility untuk optimasi performa
const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle utility untuk event listeners
const throttle = (func, limit = 100) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Expose throttle to window for use in HTML inline scripts
window.throttle = throttle;

/**
 * Simpan data ke sessionStorage dengan timestamp expiry
 */
function setSessionWithExpiry(key, value) {
  const now = new Date().getTime();
  const item = {
    value: value,
    expiry: now + SESSION_DURATION,
  };
  sessionStorage.setItem(key, JSON.stringify(item));
}

/**
 * Ambil data dari sessionStorage dan cek expiry
 * Return null jika data expired atau tidak ada
 */
function getSessionWithExpiry(key) {
  const itemStr = sessionStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    const now = new Date().getTime();

    // Cek apakah data sudah expired
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

/**
 * Hapus data sessionStorage jika expired
 */
function cleanExpiredSession() {
  const modulUserData = getSessionWithExpiry("modulUserInfo");
  if (modulUserData === null) {
    // Data expired atau tidak ada, reset MODUL_USER_INFO
    MODUL_USER_INFO.name = null;
    MODUL_USER_INFO.class = null;
  }
}

// Chart instances untuk destroy sebelum recreate
let chartInstances = {
  radarChart: null,
  activityChart: null,
  techDonutChart: null,
  skillCategoryChart: null,
  genreChart: null,
  moodChart: null,
  storageChart: null,
  mediaChart: null,
  filmsRatingChart: null,
  musicGenreChart: null,
  booksGenreChart: null,
  booksStatusChart: null,
  gamesGenreChart: null,
  gamesPlatformChart: null,
};

// ─────────────────────────────────────────
//  HELPER FUNCTIONS
// ─────────────────────────────────────────
/**
 * Safely set element content - checks if element exists first
 */
function safeSet(elementId, property, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element[property] = value;
  } else {
    console.warn(`Element with id "${elementId}" not found`);
  }
}

/**
 * Safely get element - returns null if not found
 */
function safeGet(elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`Element with id "${elementId}" not found`);
  }
  return element;
}

// ─────────────────────────────────────────
//  GITHUB COMMITS API
// ─────────────────────────────────────────
async function getCommits() {
  try {
    const res = await fetch(
      "https://github-contributions-api.jogruber.de/v4/ahmaddn",
    );
    const data = await res.json();
    return data.contributions;
  } catch (error) {
    console.error("Error fetching commits:", error);
    return [];
  }
}

function getLast12Months() {
  const months = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleString("id-ID", { month: "short" }));
  }

  return months;
}

function commitsPerMonth(contributions) {
  const months = new Array(12).fill(0);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  contributions.forEach((day) => {
    const date = new Date(day.date);
    const year = date.getFullYear();
    const month = date.getMonth();

    // Only count last 12 months
    const monthDiff = (currentYear - year) * 12 + (currentMonth - month);
    if (monthDiff >= 0 && monthDiff < 12) {
      const index = 11 - monthDiff;
      months[index] += day.count;
    }
  });

  return months;
}

// ─────────────────────────────────────────
//  DEFAULT DATA (Dummy Data)
// ─────────────────────────────────────────
const DEFAULTS = {
  profile: {
    name: "Nama Kamu",
    role: "Full Stack Web Developer",
    tagline: "Membangun pengalaman digital yang indah dan fungsional.",
    bio: "Saya adalah web developer yang passionate dalam menciptakan pengalaman digital yang indah dan fungsional. Dengan keahlian di frontend dan backend, saya suka memecahkan masalah kompleks.",
    location: "Bandung, Jawa Barat 🇮🇩",
    email: "hello@example.com",
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com",
    avatar: "👨‍💻",
    available: true,
  },
  skills: [
    { id: 1, name: "HTML & CSS", level: 95, category: "Frontend" },
    { id: 2, name: "JavaScript", level: 88, category: "Frontend" },
    { id: 3, name: "React.js", level: 82, category: "Frontend" },
    { id: 4, name: "Node.js", level: 75, category: "Backend" },
    { id: 5, name: "PHP / Laravel", level: 70, category: "Backend" },
    { id: 6, name: "MySQL", level: 78, category: "Database" },
    { id: 7, name: "Git & GitHub", level: 90, category: "Tools" },
    { id: 8, name: "Figma", level: 65, category: "Design" },
  ],
  experience: [
    {
      id: 1,
      year: "2024 – Sekarang",
      title: "Frontend Developer",
      company: "Tech Startup",
      desc: "Membangun UI modern menggunakan React dan Tailwind CSS.",
      active: true,
    },
    {
      id: 2,
      year: "2022 – 2024",
      title: "Web Developer Freelance",
      company: "Self-Employed",
      desc: "Mengerjakan berbagai proyek web dari landing page hingga sistem CRUD.",
      active: false,
    },
    {
      id: 3,
      year: "2021 – 2022",
      title: "Junior Developer",
      company: "Digital Agency",
      desc: "Belajar dan berkembang dalam dunia web development profesional.",
      active: false,
    },
  ],
  projects: [
    {
      id: 1,
      title: "E-Commerce Platform",
      desc: "Platform belanja online lengkap dengan keranjang, checkout, dan dashboard admin.",
      tech: "React, Node.js, MongoDB",
      status: "Selesai",
      featured: true,
      link: "#",
      github: "#",
      image: "🛒",
    },

    {
      id: 3,
      title: "Task Manager App",
      desc: "Aplikasi manajemen tugas tim dengan fitur real-time dan notifikasi.",
      tech: "React, Firebase, Tailwind",
      status: "Proses",
      featured: false,
      link: "#",
      github: "#",
      image: "✅",
    },
    {
      id: 4,
      title: "Portfolio v2",
      desc: "Website portfolio personal dengan desain modern dan animasi interaktif.",
      tech: "HTML, CSS, JavaScript",
      status: "Selesai",
      featured: true,
      link: "#",
      github: "#",
      image: "🎨",
    },
  ],
  films: [
    {
      id: 1,
      title: "Inception",
      genre: "Sci-Fi",
      year: 2010,
      rating: 10,
      review:
        "Film yang sangat kompleks namun brilian dalam eksekusinya. Nolan berhasil membuat cerita yang berlapis-lapis namun tetap koheren.",
      comment: "Mind-bending masterpiece!",
    },
    {
      id: 2,
      title: "The Shawshank Redemption",
      genre: "Drama",
      year: 1994,
      rating: 10,
      review:
        "Sebuah kisah tentang harapan dan persahabatan yang sangat menyentuh. Akting Morgan Freeman dan Tim Robbins luar biasa.",
      comment: "Hope is a good thing.",
    },
    {
      id: 3,
      title: "Interstellar",
      genre: "Sci-Fi",
      year: 2014,
      rating: 9,
      review:
        "Visual yang memukau dengan cerita yang emosional. Score musik Hans Zimmer menambah kedalaman emosi film ini.",
      comment: "Love transcends dimensions.",
    },
    {
      id: 4,
      title: "Parasite",
      genre: "Thriller",
      year: 2019,
      rating: 10,
      review:
        "Kritik sosial yang tajam dikemas dalam thriller yang mencekam. Bong Joon-ho membuktikan kehebatannya sebagai sutradara.",
      comment: "Brilliant social commentary.",
    },
  ],
  music: [
    {
      id: 1,
      title: "Bohemian Rhapsody",
      artist: "Queen",
      genre: "Rock",
      mood: "Energik",
      emoji: "🎸",
    },
    {
      id: 2,
      title: "Lofi Hip Hop Mix",
      artist: "Various Artists",
      genre: "Lo-fi",
      mood: "Fokus",
      emoji: "🎶",
    },
    {
      id: 3,
      title: "Blinding Lights",
      artist: "The Weeknd",
      genre: "Synth-pop",
      mood: "Energik",
      emoji: "🎸",
    },
    {
      id: 4,
      title: "Night Changes",
      artist: "One Direction",
      genre: "Pop",
      mood: "Santai",
      emoji: "🎤",
    },
    {
      id: 5,
      title: "Coffee",
      artist: "beabadoobee",
      genre: "Indie",
      mood: "Chill",
      emoji: "☕",
    },
  ],
  books: [
    {
      id: 1,
      title: "Clean Code",
      author: "Robert C. Martin",
      genre: "Programming",
      status: "Sudah Baca",
      rating: 9,
      review: "Wajib baca bagi programmer manapun",
    },
    {
      id: 2,
      title: "The Pragmatic Programmer",
      author: "David Thomas",
      genre: "Programming",
      status: "Sudah Baca",
      rating: 9,
      review: "Panduan praktis jadi developer profesional",
    },
    {
      id: 3,
      title: "Atomic Habits",
      author: "James Clear",
      genre: "Self-Help",
      status: "Sudah Baca",
      rating: 10,
      review: "Mengubah cara pandang terhadap kebiasaan",
    },
  ],
  games: [
    {
      id: 1,
      title: "Hollow Knight",
      platform: "PC",
      genre: "Metroidvania",
      status: "Sudah Tamat",
      rating: 10,
      emoji: "🎮",
    },
    {
      id: 2,
      title: "Celeste",
      platform: "PC",
      genre: "Platformer",
      status: "Sudah Tamat",
      rating: 10,
      emoji: "⛰️",
    },
    {
      id: 3,
      title: "Hades",
      platform: "PC",
      genre: "Roguelike",
      status: "Sedang Main",
      rating: 9,
      emoji: "⚔️",
    },
  ],
};

// ─────────────────────────────────────────
//  FIREBASE DATA OPERATIONS (FIXED)
// ─────────────────────────────────────────

/**
 * Initialize Firebase data
 * Load semua data dari Firebase ke cache
 */
async function initData() {
  console.log("🔄 Loading data from Firebase...");

  try {
    // Load profile dari document 'profile'
    const profileDoc = await getDocumentById("profile", "main");
    FIREBASE_CACHE.profile = profileDoc || DEFAULTS.profile;

    // Load collections
    FIREBASE_CACHE.skills = await getFirebaseData("skills");
    FIREBASE_CACHE.experience = await getFirebaseData("experience");
    FIREBASE_CACHE.projects = await getFirebaseData("projects");
    FIREBASE_CACHE.films = await getFirebaseData("films");
    FIREBASE_CACHE.music = await getFirebaseData("music");
    FIREBASE_CACHE.books = await getFirebaseData("books");
    FIREBASE_CACHE.games = await getFirebaseData("games");

    // Load modul files dari Firebase
    FIREBASE_CACHE.modulFiles = await getFirebaseData("modulFiles");
    console.log("📚 Loaded modul files:", FIREBASE_CACHE.modulFiles.length);

    // Load settings dari Firebase
    const settingsDoc = await getDocumentById("settings", "main");
    if (settingsDoc) {
      FIREBASE_CACHE.settings = settingsDoc;
    } else {
      // Default settings jika belum ada
      FIREBASE_CACHE.settings = { modulVisible: true };
    }
    console.log("⚙️ Loaded settings:", FIREBASE_CACHE.settings);

    // NOTE: profile sudah diload via getDocumentById di atas, jangan fetch lagi sebagai collection

    // Jika data kosong, gunakan defaults
    if (!FIREBASE_CACHE.skills.length) FIREBASE_CACHE.skills = DEFAULTS.skills;
    if (!FIREBASE_CACHE.experience.length)
      FIREBASE_CACHE.experience = DEFAULTS.experience;
    if (!FIREBASE_CACHE.projects.length)
      FIREBASE_CACHE.projects = DEFAULTS.projects;
    if (!FIREBASE_CACHE.films.length) FIREBASE_CACHE.films = DEFAULTS.films;
    if (!FIREBASE_CACHE.music.length) FIREBASE_CACHE.music = DEFAULTS.music;
    if (!FIREBASE_CACHE.books.length) FIREBASE_CACHE.books = DEFAULTS.books;
    if (!FIREBASE_CACHE.games.length) FIREBASE_CACHE.games = DEFAULTS.games;
    // Profile adalah object, cek dengan !FIREBASE_CACHE.profile atau field yang wajib ada
    if (!FIREBASE_CACHE.profile || !FIREBASE_CACHE.profile.name)
      FIREBASE_CACHE.profile = DEFAULTS.profile;

    // Restore data user dari sessionStorage (jika belum expired)
    cleanExpiredSession(); // Bersihkan session yang expired
    const savedUserData = getSessionWithExpiry("modulUserInfo");
    if (savedUserData) {
      MODUL_USER_INFO.name = savedUserData.name;
      MODUL_USER_INFO.class = savedUserData.class;
      console.log("✅ Restored user session:", MODUL_USER_INFO);
    }

    CACHE_LOADED = true;
  } catch (error) {
    console.error("Error loading Firebase data:", error);
    // Fallback ke defaults jika error
    FIREBASE_CACHE = { ...DEFAULTS };
    CACHE_LOADED = true;
  }
}

/**
 * Get data dari cache (yang sudah loaded dari Firebase)
 */
function getData(key) {
  if (!CACHE_LOADED) {
    console.warn("⚠️ Cache belum loaded! Gunakan default.");
    return DEFAULTS[key];
  }
  return FIREBASE_CACHE[key];
}

/**
 * Set data ke Firebase DAN update cache
 */
async function setData(key, value) {
  try {
    // Update cache dulu untuk responsiveness
    FIREBASE_CACHE[key] = value;

    // Kemudian save ke Firebase
    if (key === "profile") {
      // Profile disimpan sebagai document dengan ID 'profile'
      await setFirebaseData("profile", "main", value);
    } else {
      // Collections lain perlu di-clear dan batch add
      await clearCollection(key);

      if (Array.isArray(value) && value.length > 0) {
        await batchAddData(key, value);
      }
    }

    console.log(`Data '${key}' saved to Firebase`);
    return true;
  } catch (error) {
    console.error(`Error saving '${key}' to Firebase:`, error);
    return false;
  }
}

// ─────────────────────────────────────────
//  NAVIGATION & UI
// ─────────────────────────────────────────
function navigate(pageName) {
  // Close mobile menu immediately when navigating
  closeMobileMenu();

  // Hide all pages
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));

  // Show target page
  const target = safeGet(`page-${pageName}`);
  if (target) {
    target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Update nav links
  document.querySelectorAll(".nav-link").forEach((link) => {
    // Skip Dashboard Admin button - keep it always cyan
    if (link.id === "dashboard-nav-btn") return;

    link.classList.remove("text-cyan");
    link.classList.add("text-muted");
  });

  const activeLink = document.querySelector(
    `.nav-link[data-page="${pageName}"]`,
  );
  if (activeLink) {
    activeLink.classList.add("text-cyan");
    activeLink.classList.remove("text-muted");
  }

  // Keep Desktop Dashboard Admin button always cyan
  const dashBtn = safeGet("dashboard-nav-btn");
  if (dashBtn) {
    dashBtn.classList.add("text-cyan");
    dashBtn.classList.remove("text-muted");
  }

  // Update mobile nav links
  document.querySelectorAll(".mobile-nav-link").forEach((link) => {
    // Skip Dashboard Admin button - keep it always cyan
    if (link.id === "dashboard-nav-btn-mob") return;

    link.classList.remove("text-cyan");
    link.classList.add("text-muted");
  });

  const activeMobileLink = document.querySelector(
    `.mobile-nav-link[data-page="${pageName}"]`,
  );
  if (activeMobileLink) {
    activeMobileLink.classList.add("text-cyan");
    activeMobileLink.classList.remove("text-muted");
  }

  // Keep Dashboard Admin button always cyan
  const dashBtnMob = safeGet("dashboard-nav-btn-mob");
  if (dashBtnMob) {
    dashBtnMob.classList.add("text-cyan");
    dashBtnMob.classList.remove("text-muted");
  }

  // Render page-specific content
  if (pageName === "dashboard") {
    renderDashboard();
  } else if (pageName === "projects") {
    renderProjects();
    renderTechDonutChart();
  } else if (pageName === "about") {
    renderAbout();
    renderSkillCategoryChart();
  } else if (pageName === "media") {
    renderMedia();
    renderGenreChart();
    renderFilmsRatingChart();
    renderFilmsStatsRow();
    renderMoodChart();
    renderMusicGenreChart();
    renderMusicStatsRow();
    renderBooksGenreChart();
    renderBooksStatusChart();
    renderBooksStatsRow();
    renderGamesGenreChart();
    renderGamesPlatformChart();
    renderGamesStatsRow();
  } else if (pageName === "modul") {
    // Cek apakah user sudah input data (dan belum expired)
    const savedUserData = getSessionWithExpiry("modulUserInfo");
    if (!savedUserData || !savedUserData.name || !savedUserData.class) {
      // Belum ada data atau expired, tampilkan modal input
      openModulUserModal();
    } else {
      // Data sudah ada dan valid, restore dan render modul
      MODUL_USER_INFO.name = savedUserData.name;
      MODUL_USER_INFO.class = savedUserData.class;
      renderModul();
    }
  } else if (pageName === "contact") {
    renderContact();
  } else if (pageName === "admin") {
    if (!isAdmin()) {
      navigate("dashboard");
      toast("Silakan login sebagai admin terlebih dahulu.", "error");
    } else {
      renderAdmin();
    }
  }

  lucide.createIcons();
}

function toggleMobile() {
  const nav = safeGet("mobile-nav");
  const hamBtn = safeGet("ham-btn");

  if (nav) {
    nav.classList.toggle("hidden");
  }

  // Animate hamburger icon
  if (hamBtn) {
    const h1 = document.getElementById("h1");
    const h2 = document.getElementById("h2");
    const h3 = document.getElementById("h3");

    if (nav && !nav.classList.contains("hidden")) {
      // Menu open - transform to X
      if (h1) {
        h1.style.transform = "rotate(45deg) translateY(7px)";
      }
      if (h2) {
        h2.style.opacity = "0";
      }
      if (h3) {
        h3.style.transform = "rotate(-45deg) translateY(-7px)";
      }
    } else {
      // Menu closed - reset to hamburger
      if (h1) h1.style.transform = "";
      if (h2) h2.style.opacity = "";
      if (h3) h3.style.transform = "";
    }
  }
}

// Helper function untuk cek apakah mobile menu terbuka
function isMobileMenuOpen() {
  const nav = safeGet("mobile-nav");
  return nav && !nav.classList.contains("hidden");
}

// Helper function untuk menutup mobile menu
function closeMobileMenu() {
  const nav = safeGet("mobile-nav");
  if (nav && !nav.classList.contains("hidden")) {
    nav.classList.add("hidden");

    // Reset hamburger icon
    const h1 = document.getElementById("h1");
    const h2 = document.getElementById("h2");
    const h3 = document.getElementById("h3");
    if (h1) h1.style.transform = "";
    if (h2) h2.style.opacity = "";
    if (h3) h3.style.transform = "";
  }
}

// ─────────────────────────────────────────
//  ADMIN AUTH
// ─────────────────────────────────────────
const ADMIN_CREDENTIALS = {
  username: "Canbemyy",
  password: "9367592da5356c4e4f79f7128edb0028e65daccc53f1cc8d231b35e4bb03a110",
};

function isAdmin() {
  return sessionStorage.getItem("isAdmin") === "true";
}

function updateAdminBtn() {
  const loginBtn = safeGet("admin-nav-btn");
  const loginBtnMob = safeGet("admin-nav-btn-mob");
  const dashBtn = safeGet("dashboard-nav-btn");
  const dashBtnMob = safeGet("dashboard-nav-btn-mob");

  if (isAdmin()) {
    if (loginBtn) loginBtn.style.display = "none";
    if (loginBtnMob) loginBtnMob.style.display = "none";

    if (dashBtn) dashBtn.classList.remove("hidden");
    if (dashBtnMob) dashBtnMob.classList.remove("hidden");
  } else {
    if (loginBtn) loginBtn.style.display = "";
    if (loginBtnMob) loginBtnMob.style.display = "";

    if (dashBtn) dashBtn.classList.add("hidden");
    if (dashBtnMob) dashBtnMob.classList.add("hidden");
  }
}

function openAdminLogin() {
  const modal = safeGet("modal-admin-login");
  if (modal) modal.classList.add("open");
}

function closeAdminLogin() {
  const modal = safeGet("modal-admin-login");
  if (modal) modal.classList.remove("open");
}
async function hashPassword(password) {
  const enc = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", enc);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function doAdminLogin() {
  const usernameInput = safeGet("admin-username");
  const passwordInput = safeGet("admin-password");

  if (!usernameInput || !passwordInput) return;

  const username = usernameInput.value;
  const password = passwordInput.value;

  const hashedPassword = await hashPassword(password);

  if (
    username === ADMIN_CREDENTIALS.username &&
    hashedPassword === ADMIN_CREDENTIALS.password
  ) {
    sessionStorage.setItem("isAdmin", "true");
    closeAdminLogin();
    updateAdminBtn();
    navigate("admin");
    toast("Login berhasil! Selamat datang Admin.", "success");

    usernameInput.value = "";
    passwordInput.value = "";
  } else {
    toast("Username atau password salah!", "error");
  }
}

function doAdminLogout() {
  sessionStorage.removeItem("isAdmin");
  updateAdminBtn();
  navigate("dashboard");
  toast("Logout berhasil.", "info");
}

// ─────────────────────────────────────────
//  MODAL FUNCTIONS
// ─────────────────────────────────────────
function openModal(modalId) {
  const modal = safeGet(modalId);
  if (modal) modal.classList.add("open");
}

function closeModal(modalId) {
  const modal = safeGet(modalId);
  if (modal) modal.classList.remove("open");
}

// Fungsi untuk reset form modal
function resetProjectForm() {
  safeSet("proj-id", "value", "");
  safeSet("proj-title", "value", "");
  safeSet("proj-desc", "value", "");
  safeSet("proj-tech", "value", "");
  safeSet("proj-status", "value", "Konsep");
  safeSet("proj-link", "value", "");
  safeSet("proj-github", "value", "");
  safeSet("proj-icon", "value", "code-2");
  const featuredCheckbox = safeGet("proj-featured");
  if (featuredCheckbox) featuredCheckbox.checked = false;
  safeSet("modal-project-title", "textContent", "Tambah Project");
}

function resetSkillForm() {
  safeSet("skill-id", "value", "");
  safeSet("skill-name", "value", "");
  safeSet("skill-level", "value", "50");
  safeSet("skill-category", "value", "Frontend");
  safeSet("skill-icon", "value", "");
  safeSet("modal-skill-title", "textContent", "Tambah Skill");
}

function resetExpForm() {
  safeSet("exp-id", "value", "");
  safeSet("exp-year", "value", "");
  safeSet("exp-title", "value", "");
  safeSet("exp-company", "value", "");
  safeSet("exp-desc", "value", "");
  safeSet("modal-exp-title", "textContent", "Tambah Pengalaman");
}

function resetFilmForm() {
  safeSet("film-id", "value", "");
  safeSet("film-title", "value", "");
  safeSet("film-year", "value", "");
  safeSet("film-genre", "value", "");
  safeSet("film-rating", "value", "5");
  safeSet("film-rating-label", "textContent", "5");
  safeSet("film-review", "value", "");
  safeSet("film-comment", "value", "");
  safeSet("modal-film-title", "textContent", "Tambah Film");
}

function resetMusicForm() {
  safeSet("music-id", "value", "");
  safeSet("music-title", "value", "");
  safeSet("music-artist", "value", "");
  safeSet("music-genre", "value", "");
  safeSet("music-year", "value", "");
  safeSet("music-cover", "value", "");
  safeSet("modal-music-title", "textContent", "Tambah Musik");
}

function resetBookForm() {
  safeSet("book-id", "value", "");
  safeSet("book-title", "value", "");
  safeSet("book-author", "value", "");
  safeSet("book-year", "value", "");
  safeSet("book-genre", "value", "");
  safeSet("book-rating", "value", "5");
  safeSet("book-cover", "value", "");
  safeSet("modal-book-title", "textContent", "Tambah Buku");
}

function resetGameForm() {
  safeSet("game-id", "value", "");
  safeSet("game-title", "value", "");
  safeSet("game-platform", "value", "");
  safeSet("game-genre", "value", "");
  safeSet("game-year", "value", "");
  safeSet("game-rating", "value", "5");
  safeSet("game-cover", "value", "");
  safeSet("modal-game-title", "textContent", "Tambah Game");
}

let _confirmCb = null;
function showConfirm(callback) {
  _confirmCb = callback;
  const modal = safeGet("confirm-dialog");
  if (modal) modal.classList.add("open");
}

function closeConfirm() {
  const modal = safeGet("confirm-dialog");
  if (modal) modal.classList.remove("open");
  _confirmCb = null;
}

// ─────────────────────────────────────────
//  TOAST NOTIFICATION
// ─────────────────────────────────────────
function toast(msg, type = "info") {
  const container = safeGet("toast-container");
  if (!container) return;

  const color =
    type === "success"
      ? "bg-mint/20 text-mint border-mint/30"
      : type === "error"
        ? "bg-red-500/20 text-red-400 border-red-400/30"
        : "bg-cyan/20 text-cyan border-cyan/30";

  const t = document.createElement("div");
  t.className = `${color} border px-4 py-3 rounded-xl text-sm font-medium shadow-card animate-scale-in`;
  t.textContent = msg;
  container.appendChild(t);

  setTimeout(() => {
    t.style.transition = "all 0.3s ease";
    t.style.opacity = "0";
    t.style.transform = "scale(0.9)";
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

// ─────────────────────────────────────────
//  HELPER
// ─────────────────────────────────────────
function uid() {
  return Date.now() + Math.floor(Math.random() * 10000);
}

// ─────────────────────────────────────────
//  RENDER: DASHBOARD
// ─────────────────────────────────────────
async function renderDashboard() {
  const profile = getData("profile") || {};
  const skills = getData("skills") || [];
  const exp = getData("experience") || [];
  const projects = getData("projects") || [];

  // Update visibility menu modul sesuai settings
  const isModulVisible = FIREBASE_CACHE.settings?.modulVisible ?? true;
  updateModulMenuVisibility(isModulVisible);

  // Intro - with null checks
  safeSet("hero-avatar-display", "textContent", profile.avatar || "👨‍💻");
  safeSet("hero-name-display", "textContent", profile.name);

  // Typewriter effect for role
  if (typeof window.typewriterEffect === "function" && profile.role) {
    window.typewriterEffect("hero-role-display", profile.role, 45);
  } else {
    safeSet("hero-role-display", "textContent", profile.role);
  }

  safeSet("hero-tagline-display", "textContent", profile.tagline);

  // Availability badge
  const avail = safeGet("hero-available-badge");
  if (avail) {
    if (profile.available) {
      avail.innerHTML = `Tersedia untuk project`;
      avail.classList.add(
        "inline-flex",
        "items-center",
        "gap-2",
        "text-sm",
        "text-mint",
        "bg-mint/10",
        "px-3",
        "py-1.5",
        "rounded-full",
        "border-mint/20",
      );
    } else {
      avail.textContent = "Sedang Tidak Tersedia";
      avail.classList.add(
        "text-sm",
        "text-muted",
        "bg-ink3",
        "px-3",
        "py-1.5",
        "rounded-full",
      );
    }
  }

  // Quick Stats - with animated counters
  const completedProjects = projects.filter(
    (p) => p.status === "Selesai",
  ).length;
  if (typeof window.animateCounter === "function") {
    window.animateCounter("stat-projects", completedProjects);
    window.animateCounter("stat-skills", skills.length);
    window.animateCounter("stat-exp", exp.length, "+");
  } else {
    safeSet("stat-projects", "textContent", completedProjects);
    safeSet("stat-skills", "textContent", skills.length);
    safeSet("stat-exp", "textContent", exp.length + "+");
  }

  // Skills Radar Chart
  renderSkillsRadarChart();

  // Featured Projects Preview
  renderFeaturedProjects();

  // Activity Chart
  try {
    const commits = await getCommits();
    const chartData = commitsPerMonth(commits);
    const chartLabels = getLast12Months();

    const chartCanvas = safeGet("activityChart");
    if (chartCanvas) {
      const ctx = chartCanvas.getContext("2d");

      // Destroy previous chart if exists
      if (chartInstances.activityChart) {
        chartInstances.activityChart.destroy();
      }

      chartInstances.activityChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: chartLabels,
          datasets: [
            {
              label: "Commits",
              data: chartData,
              backgroundColor: (ctx) => {
                const chart = ctx.chart;
                const { chartArea, ctx: canvasCtx } = chart;
                if (!chartArea) return "rgba(119, 202, 237, 0.2)";
                const gradient = canvasCtx.createLinearGradient(
                  0,
                  chartArea.top,
                  0,
                  chartArea.bottom,
                );
                gradient.addColorStop(0, "rgba(119, 202, 237, 0.5)");
                gradient.addColorStop(1, "rgba(119, 202, 237, 0.05)");
                return gradient;
              },
              borderColor: "#77caed",
              borderWidth: 1.5,
              borderRadius: 6,
              borderSkipped: false,
              hoverBackgroundColor: "rgba(120, 250, 185, 0.4)",
              hoverBorderColor: "#78fab9",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#1e2626",
              titleColor: "#e8f4f0",
              bodyColor: "#7a9e9a",
              borderColor: "rgba(255,255,255,0.1)",
              borderWidth: 1,
              padding: 12,
              displayColors: false,
            },
          },
          scales: {
            x: {
              grid: { color: "rgba(255,255,255,0.03)" },
              ticks: { color: "#7a9e9a", font: { size: 11 } },
            },
            y: {
              grid: { color: "rgba(255,255,255,0.03)" },
              ticks: { color: "#7a9e9a", font: { size: 11 } },
            },
          },
        },
      });
    }
  } catch (error) {
    console.error("Error rendering activity chart:", error);
  }

  lucide.createIcons();
}

// ─────────────────────────────────────────
//  NEW: Render Skills Radar Chart
// ─────────────────────────────────────────
function renderSkillsRadarChart() {
  const skills = getData("skills") || [];

  // Ambil top 6 skills berdasarkan level
  const topSkills = skills.sort((a, b) => b.level - a.level).slice(0, 6);

  const chartCanvas = safeGet("radarChart");
  if (!chartCanvas || topSkills.length === 0) return;

  const ctx = chartCanvas.getContext("2d");

  // Destroy previous chart if exists
  if (chartInstances.radarChart) {
    chartInstances.radarChart.destroy();
  }

  chartInstances.radarChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: topSkills.map((s) => s.name),
      datasets: [
        {
          label: "Skill Level",
          data: topSkills.map((s) => s.level),
          backgroundColor: "rgba(119, 202, 237, 0.2)",
          borderColor: "#77caed",
          borderWidth: 2,
          pointBackgroundColor: "#77caed",
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: "#77caed",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1e2626",
          titleColor: "#e8f4f0",
          bodyColor: "#7a9e9a",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function (context) {
              return context.parsed.r + "%";
            },
          },
        },
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: {
            display: false,
          },
          grid: {
            color: "rgba(255,255,255,0.1)",
          },
          pointLabels: {
            color: "#7a9e9a",
            font: { size: 11 },
          },
        },
      },
    },
  });
}

// ─────────────────────────────────────────
//  NEW: Render Featured Projects
// ─────────────────────────────────────────
function renderFeaturedProjects() {
  const projects = getData("projects") || [];
  const featured = projects.filter((p) => p.featured);

  const featuredProjectsEl = safeGet("featured-projects");
  if (featuredProjectsEl) {
    featuredProjectsEl.innerHTML =
      featured
        .slice(0, 3) // Maksimal 3 featured projects
        .map(
          (p) => `
      <div class="group bg-ink2 rounded-2xl border border-white/5 overflow-hidden hover:border-cyan/30 transition-all duration-300 hover:shadow-glow-cyan" data-aos="fade-up">
        <div class="p-6">
          <div class="flex items-start justify-between mb-3">
            <div class="proj-icon-wrap w-12 h-12 bg-gradient-to-br from-cyan/20 to-mint/20 rounded-xl flex items-center justify-center">
              <i data-lucide="${p.icon || "code-2"}" class="w-6 h-6 text-cyan"></i>
            </div>
            <span class="text-xs px-2 py-1 rounded-lg ${p.status === "Selesai" ? "bg-mint/10 text-mint" : "bg-cyan/10 text-cyan"}">${p.status}</span>
          </div>
          <h3 class="font-mono font-bold text-base mb-2 group-hover:text-cyan transition-colors">${p.title}</h3>
          <p class="text-sm text-dim leading-relaxed mb-4">${p.desc}</p>
          <div class="flex flex-wrap gap-1.5 mb-4">
            ${p.tech
              .split(",")
              .map(
                (t) =>
                  `<span class="text-xs bg-ink3 px-2 py-1 rounded-lg text-muted">${t.trim()}</span>`,
              )
              .join("")}
          </div>
          <div class="flex gap-2">
            <a href="${p.link}" class="text-xs bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all flex items-center gap-1.5"><i data-lucide="external-link" class="w-3 h-3"></i> Live</a>
            <a href="${p.github}" class="text-xs bg-ink3 text-muted px-3 py-1.5 rounded-lg hover:bg-ink4 transition-all flex items-center gap-1.5"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                  />
                </svg> Code</a>
          </div>
        </div>
      </div>`,
        )
        .join("") ||
      '<p class="text-muted text-sm">Belum ada project featured.</p>';
  }

  lucide.createIcons();
}

// ─────────────────────────────────────────
//  RENDER: MODUL AJAR (Landing Page)
// ─────────────────────────────────────────
async function renderModul() {
  // **PERBAIKAN UTAMA: Selalu load ulang data saat render**
  let allFiles = getData("modulFiles");

  // Jika cache kosong atau tidak ada, load ulang
  if (!allFiles || allFiles.length === 0) {
    console.log("Cache kosong, loading modul files...");
    allFiles = await loadModulFiles();
  }

  // Filter files berdasarkan kelas user
  let files = allFiles;
  if (MODUL_USER_INFO.class) {
    files = allFiles.filter((file) => {
      return file.name.includes(MODUL_USER_INFO.class);
    });
  }

  const modulGridEl = safeGet("modul-grid");
  const modulEmptyEl = safeGet("modul-empty");

  if (files.length === 0) {
    if (modulGridEl) modulGridEl.innerHTML = "";
    if (modulEmptyEl) {
      modulEmptyEl.classList.remove("hidden");

      // Jika sudah pilih kelas tapi tidak ada file
      if (MODUL_USER_INFO.class) {
        modulEmptyEl.innerHTML = `
          <div class="text-center py-12">
            <div class="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i data-lucide="file-x" class="w-8 h-8 text-muted"></i>
            </div>
            <p class="text-muted text-sm">Belum ada modul untuk kelas ${MODUL_USER_INFO.class}</p>
          </div>
        `;
      } else {
        // Jika belum pilih kelas
        modulEmptyEl.innerHTML = `
          <div class="text-center py-12">
            <div class="w-16 h-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i data-lucide="info" class="w-8 h-8 text-muted"></i>
            </div>
            <p class="text-muted text-sm">Silakan isi data kelas terlebih dahulu</p>
          </div>
        `;
      }
      lucide.createIcons();
    }
    return;
  }

  if (modulEmptyEl) modulEmptyEl.classList.add("hidden");

  if (modulGridEl) {
    modulGridEl.innerHTML = files
      .map(
        (file) => `
      <div class="bg-ink2 rounded-2xl border border-white/5 overflow-hidden hover:border-cyan/30 transition-all duration-300 hover:shadow-glow-cyan" data-aos="fade-up">
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="w-14 h-14 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl flex items-center justify-center">
              <i data-lucide="file-text" class="w-7 h-7 text-red-400"></i>
            </div>
            <span class="text-xs px-2 py-1 rounded-lg bg-red-500/10 text-red-400">PDF</span>
          </div>
          <h3 class="font-mono font-bold text-base mb-2 line-clamp-1">${file.name.replace(".pdf", "")}</h3>
          <p class="text-sm text-dim mb-4">${file.size}</p>
          <div class="flex gap-2">
            <button
              onclick="viewPDF('${file.path}')"
              class="flex-1 flex items-center justify-center gap-1.5 text-xs bg-cyan/10 text-cyan border border-cyan/30 px-3 py-2 rounded-lg hover:bg-cyan/20 transition-all"
            >
              <i data-lucide="eye" class="w-3.5 h-3.5"></i>
              Lihat
            </button>
            <button
              onclick="downloadPDF('${file.path}', '${file.name}')"
              class="flex-1 flex items-center justify-center gap-1.5 text-xs bg-mint/10 text-mint border border-mint/30 px-3 py-2 rounded-lg hover:bg-mint/20 transition-all"
            >
              <i data-lucide="download" class="w-3.5 h-3.5"></i>
              Download
            </button>
          </div>
        </div>
      </div>
    `,
      )
      .join("");

    lucide.createIcons();
  }
}

// ─────────────────────────────────────────
//  RENDER: PROJECTS
// ─────────────────────────────────────────
function renderProjects() {
  const projects = getData("projects") || [];

  const projectsGridEl = safeGet("projects-grid");
  const projectsEmptyEl = safeGet("projects-empty");

  if (projects.length === 0) {
    if (projectsGridEl) projectsGridEl.innerHTML = "";
    if (projectsEmptyEl) projectsEmptyEl.classList.remove("hidden");
    return;
  }

  if (projectsEmptyEl) projectsEmptyEl.classList.add("hidden");

  if (projectsGridEl) {
    projectsGridEl.innerHTML = projects
      .map(
        (p) => `
    <div class="project-card bg-ink2 rounded-2xl border border-white/5 overflow-hidden hover:border-cyan/30 transition-all duration-300 hover:shadow-glow-cyan" data-status="${p.status}" data-aos="fade-up">
      <div class="p-6">
        <div class="flex items-start justify-between mb-3">
          <div class="proj-icon-wrap w-12 h-12 bg-gradient-to-br from-cyan/20 to-mint/20 rounded-xl flex items-center justify-center">
            <i data-lucide="${p.icon || "code-2"}" class="w-6 h-6 text-cyan"></i>
          </div>
          <span class="text-xs px-2 py-1 rounded-lg ${p.status === "Selesai" ? "bg-mint/10 text-mint" : p.status === "Proses" ? "bg-cyan/10 text-cyan" : "bg-ink4 text-muted"}">${p.status}</span>
        </div>
        <h3 class="font-mono font-bold text-base mb-2">${p.title}</h3>
        <p class="text-sm text-dim leading-relaxed mb-4">${p.desc}</p>
        <div class="flex flex-wrap gap-1.5 mb-4">
          ${p.tech
            .split(",")
            .map(
              (t) =>
                `<span class="text-xs bg-ink3 px-2 py-1 rounded-lg text-muted">${t.trim()}</span>`,
            )
            .join("")}
        </div>
        <div class="flex gap-2">
          <a href="${p.link}" class="text-xs bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all flex items-center gap-1.5"><i data-lucide="external-link" class="w-3 h-3"></i> Live</a>
          <a href="${p.github}" class="text-xs bg-ink3 text-muted px-3 py-1.5 rounded-lg hover:bg-ink4 transition-all flex items-center gap-1.5"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                  />
                </svg> Code</a>
        </div>
      </div>
    </div>`,
      )
      .join("");
  }

  lucide.createIcons();
}

window.filterProjects = function (status) {
  const cards = document.querySelectorAll(".project-card");
  const btns = document.querySelectorAll(".project-filter-btn");

  // Update button states
  btns.forEach((btn) => {
    if (btn.dataset.filter === status) {
      btn.classList.add(
        "active-filter",
        "bg-cyan/10",
        "text-cyan",
        "border-cyan/30",
      );
      btn.classList.remove("text-muted", "border-white/10");
    } else {
      btn.classList.remove(
        "active-filter",
        "bg-cyan/10",
        "text-cyan",
        "border-cyan/30",
      );
      btn.classList.add("text-muted", "border-white/10");
    }
  });

  // Filter cards
  cards.forEach((card) => {
    if (status === "all") {
      card.style.display = "";
    } else {
      card.style.display = card.dataset.status === status ? "" : "none";
    }
  });
};

// ─────────────────────────────────────────
//  NEW: Tech Donut Chart
// ─────────────────────────────────────────
function renderTechDonutChart() {
  const projects = getData("projects") || [];
  const techCount = {};

  projects.forEach((p) => {
    const techs = p.tech.split(",").map((t) => t.trim());
    techs.forEach((tech) => {
      techCount[tech] = (techCount[tech] || 0) + 1;
    });
  });

  const chartCanvas = safeGet("techDonutChart");
  if (!chartCanvas || Object.keys(techCount).length === 0) return;

  const ctx = chartCanvas.getContext("2d");

  // Destroy previous chart if exists
  if (chartInstances.techDonutChart) {
    chartInstances.techDonutChart.destroy();
  }

  // Sort dan ambil top 8
  const sorted = Object.entries(techCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const labels = sorted.map(([tech]) => tech);
  const data = sorted.map(([, count]) => count);

  chartInstances.techDonutChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: [
            "#77caed",
            "#78fab9",
            "#7a9e9a",
            "#4a6260",
            "#77caed80",
            "#78fab980",
            "#7a9e9a80",
            "#4a626080",
          ],
          borderColor: "#1e2626",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: "#7a9e9a",
            font: { size: 11 },
            padding: 10,
          },
        },
        tooltip: {
          backgroundColor: "#1e2626",
          titleColor: "#e8f4f0",
          bodyColor: "#7a9e9a",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          padding: 12,
        },
      },
    },
  });
}

// ─────────────────────────────────────────
//  RENDER: ABOUT
// ─────────────────────────────────────────
function renderAbout() {
  const profile = getData("profile");
  const skills = getData("skills") || [];
  const exp = getData("experience") || [];

  // Bio
  safeSet("about-bio-display", "textContent", profile.bio);

  // Info
  safeSet("about-location", "textContent", profile.location);
  safeSet("about-email", "textContent", profile.email);

  const availIcon = safeGet("about-avail-icon");
  const availText = safeGet("about-avail-text");
  if (profile.available) {
    if (availIcon) {
      availIcon.setAttribute("data-lucide", "circle-dot");
      availIcon.classList.add("text-mint");
    }
    if (availText) {
      availText.textContent = "Tersedia";
      availText.classList.add("text-mint");
    }
  } else {
    if (availIcon) {
      availIcon.setAttribute("data-lucide", "circle");
      availIcon.classList.add("text-muted");
    }
    if (availText) {
      availText.textContent = "Tidak Tersedia";
      availText.classList.add("text-muted");
    }
  }

  // Social links
  const githubLink = safeGet("about-github");
  const linkedinLink = safeGet("about-linkedin");
  if (githubLink) githubLink.href = profile.github || "#";
  if (linkedinLink) linkedinLink.href = profile.linkedin || "#";

  // Experience timeline
  const timelineEl = safeGet("timeline-list");
  if (timelineEl) {
    timelineEl.innerHTML = exp
      .map(
        (e) => `
      <div class="flex gap-4">
        ${e.active ? '<div class="flex-shrink-0 w-3 h-3 bg-mint rounded-full mt-1.5 shadow-glow-mint"></div>' : '<div class="flex-shrink-0 w-3 h-3 bg-ink4 rounded-full mt-1.5 border border-white/10"></div>'}
        <div class="flex-1 pb-6">
          <p class="text-xs text-muted mb-1">${e.year}</p>
          <p class="font-semibold text-sm mb-0.5">${e.title}</p>
          <p class="text-xs text-cyan mb-2">${e.company}</p>
          <p class="text-sm text-dim leading-relaxed">${e.desc}</p>
        </div>
      </div>`,
      )
      .join("");
  }

  // Skills - by category
  const categories = [...new Set(skills.map((s) => s.category))];

  const skillCatsEl = safeGet("skill-cats");
  if (skillCatsEl) {
    skillCatsEl.innerHTML =
      categories
        .map(
          (cat) => `
      <button 
        onclick="filterSkills('${cat}')" 
        class="skill-filter-btn px-3 py-1.5 rounded-lg text-xs font-medium border border-white/10 text-muted hover:border-cyan/30 hover:text-cyan transition-all"
        data-category="${cat}"
      >
        ${cat}
      </button>`,
        )
        .join("") +
      '<button onclick="filterSkills(\'all\')" class="skill-filter-btn active-filter px-3 py-1.5 rounded-lg text-xs font-medium border border-cyan/30 text-cyan bg-cyan/10 transition-all" data-category="all">Semua</button>';
  }

  const skillsListEl = safeGet("skills-list");
  if (skillsListEl) {
    skillsListEl.innerHTML = skills
      .map(
        (s) => `
      <div class="skill-item bg-ink2 rounded-2xl border border-white/5 p-5" data-category="${s.category}">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium">${s.name}</span>
          <span class="text-xs text-muted skill-pct">0%</span>
        </div>
        <div class="w-full bg-ink3 rounded-full h-2 overflow-hidden">
          <div class="skill-bar-fill bg-gradient-to-r from-cyan to-mint h-full rounded-full transition-all duration-700" style="width:0%" data-level="${s.level}"></div>
        </div>
        <div class="mt-2">
          <span class="text-xs text-dim">${s.category}</span>
        </div>
      </div>`,
      )
      .join("");
  }

  lucide.createIcons();
}

window.filterSkills = function (category) {
  const items = document.querySelectorAll(".skill-item");
  const btns = document.querySelectorAll(".skill-filter-btn");

  // Update button states
  btns.forEach((btn) => {
    if (btn.dataset.category === category) {
      btn.classList.add(
        "active-filter",
        "bg-cyan/10",
        "text-cyan",
        "border-cyan/30",
      );
      btn.classList.remove("text-muted", "border-white/10");
    } else {
      btn.classList.remove(
        "active-filter",
        "bg-cyan/10",
        "text-cyan",
        "border-cyan/30",
      );
      btn.classList.add("text-muted", "border-white/10");
    }
  });

  // Filter items
  items.forEach((item) => {
    if (category === "all") {
      item.style.display = "";
    } else {
      item.style.display = item.dataset.category === category ? "" : "none";
    }
  });
};

// ─────────────────────────────────────────
//  NEW: Skill Category Chart
// ─────────────────────────────────────────
function renderSkillCategoryChart() {
  const skills = getData("skills") || [];
  const categoryCount = {};

  skills.forEach((s) => {
    categoryCount[s.category] = (categoryCount[s.category] || 0) + 1;
  });

  const chartCanvas = safeGet("skillCategoryChart");
  if (!chartCanvas || Object.keys(categoryCount).length === 0) return;

  const ctx = chartCanvas.getContext("2d");

  // Destroy previous chart if exists
  if (chartInstances.skillCategoryChart) {
    chartInstances.skillCategoryChart.destroy();
  }

  const labels = Object.keys(categoryCount);
  const data = Object.values(categoryCount);

  chartInstances.skillCategoryChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: ["#77caed", "#78fab9", "#7a9e9a", "#4a6260"],
          borderColor: "#1e2626",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#7a9e9a",
            font: { size: 11 },
            padding: 10,
          },
        },
        tooltip: {
          backgroundColor: "#1e2626",
          titleColor: "#e8f4f0",
          bodyColor: "#7a9e9a",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          padding: 12,
        },
      },
    },
  });
}

// ─────────────────────────────────────────
//  RENDER: MEDIA (Favorit)
// ─────────────────────────────────────────
function renderMedia() {
  let films = getData("films") || [];
  let music = getData("music") || [];
  let books = getData("books") || [];
  let games = getData("games") || [];

  // Apply sorting untuk films
  const filmSort = mediaSort.films;
  films = [...films].sort((a, b) => {
    let va = a[filmSort.sortKey] ?? "";
    let vb = b[filmSort.sortKey] ?? "";
    if (typeof va === "string") va = va.toLowerCase();
    if (typeof vb === "string") vb = vb.toLowerCase();
    if (va < vb) return filmSort.sortDir === "asc" ? -1 : 1;
    if (va > vb) return filmSort.sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // Apply sorting untuk music
  const musicSort = mediaSort.music;
  music = [...music].sort((a, b) => {
    let va = a[musicSort.sortKey] ?? "";
    let vb = b[musicSort.sortKey] ?? "";
    if (typeof va === "string") va = va.toLowerCase();
    if (typeof vb === "string") vb = vb.toLowerCase();
    if (va < vb) return musicSort.sortDir === "asc" ? -1 : 1;
    if (va > vb) return musicSort.sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // Apply sorting untuk books
  const bookSort = mediaSort.books;
  books = [...books].sort((a, b) => {
    let va = a[bookSort.sortKey] ?? "";
    let vb = b[bookSort.sortKey] ?? "";
    if (typeof va === "string") va = va.toLowerCase();
    if (typeof vb === "string") vb = vb.toLowerCase();
    if (va < vb) return bookSort.sortDir === "asc" ? -1 : 1;
    if (va > vb) return bookSort.sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // Apply sorting untuk games
  const gameSort = mediaSort.games;
  games = [...games].sort((a, b) => {
    let va = a[gameSort.sortKey] ?? "";
    let vb = b[gameSort.sortKey] ?? "";
    if (typeof va === "string") va = va.toLowerCase();
    if (typeof vb === "string") vb = vb.toLowerCase();
    if (va < vb) return gameSort.sortDir === "asc" ? -1 : 1;
    if (va > vb) return gameSort.sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // Films Table
  const filmsTbodyEl = safeGet("films-tbody");
  const filmsEmptyEl = safeGet("films-empty");

  // Update sort icons untuk films
  const filmsSortTitle = document.getElementById("films-sort-title");
  const filmsSortGenre = document.getElementById("films-sort-genre");
  const filmsSortYear = document.getElementById("films-sort-year");
  const filmsSortRating = document.getElementById("films-sort-rating");

  if (filmsSortTitle)
    filmsSortTitle.innerHTML = mediaSortIcon("films", "title");
  if (filmsSortGenre)
    filmsSortGenre.innerHTML = mediaSortIcon("films", "genre");
  if (filmsSortYear) filmsSortYear.innerHTML = mediaSortIcon("films", "year");
  if (filmsSortRating)
    filmsSortRating.innerHTML = mediaSortIcon("films", "rating");

  if (films.length === 0) {
    if (filmsTbodyEl) filmsTbodyEl.innerHTML = "";
    if (filmsEmptyEl) filmsEmptyEl.classList.remove("hidden");
  } else {
    if (filmsEmptyEl) filmsEmptyEl.classList.add("hidden");
    if (filmsTbodyEl) {
      // Hanya tampilkan Top 10 untuk tab utama
      const top10Films = films.slice(0, 10);
      filmsTbodyEl.innerHTML = top10Films
        .map(
          (f, i) => `
        <tr class="border-b border-white/5 hover:bg-ink3/30 transition-colors">
          <td class="px-5 py-4 text-muted">${i + 1}</td>
          <td class="px-5 py-4 font-medium">${f.title}</td>
          <td class="px-5 py-4 text-muted">${f.genre}</td>
          <td class="px-5 py-4 text-muted">${f.year}</td>
          <td class="px-5 py-4">
            <div class="flex items-center gap-2">
              <div class="flex gap-0.5">
                ${Array(10)
                  .fill(0)
                  .map(
                    (_, j) =>
                      `<span class="w-1.5 h-1.5 rounded-full ${j < f.rating ? "bg-cyan" : "bg-ink4"}"></span>`,
                  )
                  .join("")}
              </div>
              <span class="text-xs text-muted">${f.rating}/10</span>
            </div>
          </td>
          <td class="px-5 py-4 text-dim text-xs max-w-xs truncate">${f.review || "-"}</td>
          <td class="px-5 py-4 text-dim italic text-xs">"${f.comment}"</td>
        </tr>`,
        )
        .join("");
    }
  }

  // Render halaman detail films (semua data)
  const filmsDetailTbody = safeGet("films-detail-tbody");
  if (filmsDetailTbody) {
    filmsDetailTbody.innerHTML = films
      .map(
        (f, i) => `
      <tr class="border-b border-white/5 hover:bg-ink3/30 transition-colors">
        <td class="px-5 py-4 text-muted">${i + 1}</td>
        <td class="px-5 py-4 font-medium">${f.title}</td>
        <td class="px-5 py-4 text-muted">${f.genre}</td>
        <td class="px-5 py-4 text-muted">${f.year}</td>
        <td class="px-5 py-4">
          <div class="flex items-center gap-2">
            <div class="flex gap-0.5">
              ${Array(10)
                .fill(0)
                .map(
                  (_, j) =>
                    `<span class="w-1.5 h-1.5 rounded-full ${j < f.rating ? "bg-cyan" : "bg-ink4"}"></span>`,
                )
                .join("")}
            </div>
            <span class="text-xs text-muted">${f.rating}/10</span>
          </div>
        </td>
        <td class="px-5 py-4 text-dim text-xs max-w-md">${f.review || "-"}</td>
        <td class="px-5 py-4 text-dim italic text-xs">"${f.comment}"</td>
      </tr>`,
      )
      .join("");
  }

  // Music Grid
  const musicGridEl = safeGet("music-grid");
  const musicEmptyEl = safeGet("music-empty");

  if (music.length === 0) {
    if (musicGridEl) musicGridEl.innerHTML = "";
    if (musicEmptyEl) musicEmptyEl.classList.remove("hidden");
  } else {
    if (musicEmptyEl) musicEmptyEl.classList.add("hidden");
    if (musicGridEl) {
      // Hanya tampilkan Top 10 untuk tab utama
      const top10Music = music.slice(0, 10);
      musicGridEl.innerHTML = top10Music
        .map(
          (m) => `
        <div class="bg-ink2 rounded-2xl border border-white/5 p-5 hover:border-cyan/20 transition-all group">
          <div class="flex items-start gap-4 mb-3">
            <div class="w-12 h-12 bg-gradient-to-br from-cyan/20 to-mint/20 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
              <i data-lucide="${m.icon || "music"}" class="w-6 h-6 text-cyan relative z-10"></i>
              <div class="absolute inset-0 bg-gradient-to-br from-cyan/10 to-mint/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-sm mb-0.5 truncate group-hover:text-cyan transition-colors">${m.title}</p>
              <p class="text-xs text-muted truncate">${m.artist}</p>
            </div>
          </div>
          <div class="flex items-center justify-between text-xs mb-3">
            <span class="text-dim">${m.genre}</span>
            <span class="px-2 py-1 bg-ink3 text-muted rounded-lg">${m.mood}</span>
          </div>
          <div class="waveform opacity-0 group-hover:opacity-100 transition-opacity">
            <div class="waveform-bar"></div>
            <div class="waveform-bar"></div>
            <div class="waveform-bar"></div>
            <div class="waveform-bar"></div>
            <div class="waveform-bar"></div>
          </div>
        </div>`,
        )
        .join("");
    }
  }

  // Render halaman detail music (semua data)
  const musicDetailGrid = safeGet("music-detail-grid");
  if (musicDetailGrid) {
    musicDetailGrid.innerHTML = music
      .map(
        (m) => `
      <div class="bg-ink2 rounded-2xl border border-white/5 p-5 hover:border-cyan/20 transition-all group">
        <div class="flex items-start gap-4 mb-3">
          <div class="w-12 h-12 bg-gradient-to-br from-cyan/20 to-mint/20 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
            <i data-lucide="${m.icon || "music"}" class="w-6 h-6 text-cyan relative z-10"></i>
            <div class="absolute inset-0 bg-gradient-to-br from-cyan/10 to-mint/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm mb-0.5 truncate group-hover:text-cyan transition-colors">${m.title}</p>
            <p class="text-xs text-muted truncate">${m.artist}</p>
          </div>
        </div>
        <div class="flex items-center justify-between text-xs mb-3">
          <span class="text-dim">${m.genre}</span>
          <span class="px-2 py-1 bg-ink3 text-muted rounded-lg">${m.mood}</span>
        </div>
        <div class="waveform opacity-0 group-hover:opacity-100 transition-opacity">
          <div class="waveform-bar"></div>
          <div class="waveform-bar"></div>
          <div class="waveform-bar"></div>
          <div class="waveform-bar"></div>
          <div class="waveform-bar"></div>
        </div>
      </div>`,
      )
      .join("");
  }

  // Books Grid
  const booksGridEl = safeGet("books-grid");
  const booksEmptyEl = safeGet("books-empty");

  if (books.length === 0) {
    if (booksGridEl) booksGridEl.innerHTML = "";
    if (booksEmptyEl) booksEmptyEl.classList.remove("hidden");
  } else {
    if (booksEmptyEl) booksEmptyEl.classList.add("hidden");
    if (booksGridEl) {
      // Hanya tampilkan Top 10 untuk tab utama
      const top10Books = books.slice(0, 10);
      booksGridEl.innerHTML = top10Books
        .map(
          (b) => `
        <div class="bg-ink2 rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all">
          <div class="flex items-start gap-3 mb-3">
            <div class="w-10 h-14 bg-gradient-to-br from-cyan/20 to-mint/20 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
              📖
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-sm mb-0.5">${b.title}</p>
              <p class="text-xs text-muted">${b.author}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 mb-2">
            <div class="flex gap-0.5">
              ${Array(10)
                .fill(0)
                .map(
                  (_, i) =>
                    `<span class="w-2 h-2 rounded-full ${i < b.rating ? "bg-mint" : "bg-ink4"}"></span>`,
                )
                .join("")}
            </div>
            <span class="text-xs text-muted">${b.rating}/10</span>
          </div>
          <p class="text-xs text-dim italic mb-2">"${b.review}"</p>
          <div class="flex items-center justify-between text-xs">
            <span class="text-dim">${b.genre}</span>
            <span class="px-2 py-0.5 bg-ink3 text-muted rounded-lg">${b.status}</span>
          </div>
        </div>`,
        )
        .join("");
    }
  }

  // Render halaman detail books (semua data)
  const booksDetailGrid = safeGet("books-detail-grid");
  if (booksDetailGrid) {
    booksDetailGrid.innerHTML = books
      .map(
        (b) => `
      <div class="bg-ink2 rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all">
        <div class="flex items-start gap-3 mb-3">
          <div class="w-10 h-14 bg-gradient-to-br from-cyan/20 to-mint/20 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
            📖
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm mb-0.5">${b.title}</p>
            <p class="text-xs text-muted">${b.author}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 mb-2">
          <div class="flex gap-0.5">
            ${Array(10)
              .fill(0)
              .map(
                (_, i) =>
                  `<span class="w-2 h-2 rounded-full ${i < b.rating ? "bg-mint" : "bg-ink4"}"></span>`,
              )
              .join("")}
          </div>
          <span class="text-xs text-muted">${b.rating}/10</span>
        </div>
        <p class="text-xs text-dim italic mb-2">"${b.review}"</p>
        <div class="flex items-center justify-between text-xs">
          <span class="text-dim">${b.genre}</span>
          <span class="px-2 py-0.5 bg-ink3 text-muted rounded-lg">${b.status}</span>
        </div>
      </div>`,
      )
      .join("");
  }

  // Games Grid
  const gamesGridEl = safeGet("games-grid");
  const gamesEmptyEl = safeGet("games-empty");

  if (games.length === 0) {
    if (gamesGridEl) gamesGridEl.innerHTML = "";
    if (gamesEmptyEl) gamesEmptyEl.classList.remove("hidden");
  } else {
    if (gamesEmptyEl) gamesEmptyEl.classList.add("hidden");
    if (gamesGridEl) {
      // Hanya tampilkan Top 10 untuk tab utama
      const top10Games = games.slice(0, 10);
      gamesGridEl.innerHTML = top10Games
        .map(
          (g) => `
        <div class="bg-ink2 rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all">
          <div class="flex items-start gap-3 mb-3">
            <div class="w-10 h-10 bg-gradient-to-br from-mint/20 to-cyan/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <i data-lucide="${g.icon || "gamepad-2"}" class="w-5 h-5 text-mint"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-sm mb-0.5">${g.title}</p>
              <p class="text-xs text-muted">${g.platform} · ${g.genre}</p>
            </div>
          </div>
          <div class="flex items-center gap-2 mb-2">
            <div class="flex gap-0.5">
              ${Array(10)
                .fill(0)
                .map(
                  (_, i) =>
                    `<span class="w-2 h-2 rounded-full ${i < g.rating ? "bg-cyan" : "bg-ink4"}"></span>`,
                )
                .join("")}
            </div>
            <span class="text-xs text-muted">${g.rating}/10</span>
          </div>
          <span class="text-xs px-2 py-1 bg-ink3 text-muted rounded-lg">${g.status}</span>
        </div>`,
        )
        .join("");
    }
  }

  // Render halaman detail games (semua data)
  const gamesDetailGrid = safeGet("games-detail-grid");
  if (gamesDetailGrid) {
    gamesDetailGrid.innerHTML = games
      .map(
        (g) => `
      <div class="bg-ink2 rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all">
        <div class="flex items-start gap-3 mb-3">
          <div class="w-10 h-10 bg-gradient-to-br from-mint/20 to-cyan/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <i data-lucide="${g.icon || "gamepad-2"}" class="w-5 h-5 text-mint"></i>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm mb-0.5">${g.title}</p>
            <p class="text-xs text-muted">${g.platform} · ${g.genre}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 mb-2">
          <div class="flex gap-0.5">
            ${Array(10)
              .fill(0)
              .map(
                (_, i) =>
                  `<span class="w-2 h-2 rounded-full ${i < g.rating ? "bg-cyan" : "bg-ink4"}"></span>`,
              )
              .join("")}
          </div>
          <span class="text-xs text-muted">${g.rating}/10</span>
        </div>
        <span class="text-xs px-2 py-1 bg-ink3 text-muted rounded-lg">${g.status}</span>
      </div>`,
      )
      .join("");
  }

  lucide.createIcons();
}

window.switchTab = function (tabId) {
  // Hide all panes
  document
    .querySelectorAll(".hiburan-pane")
    .forEach((p) => p.classList.add("hidden"));

  // Show target pane
  const target = safeGet(tabId);
  if (target) target.classList.remove("hidden");

  // Update tabs
  document.querySelectorAll(".hiburan-tab").forEach((t) => {
    t.classList.remove("active-tab", "border-cyan", "text-cyan");
    t.classList.add("border-transparent", "text-muted");
  });

  const activeTab = document.querySelector(`.hiburan-tab[data-tab="${tabId}"]`);
  if (activeTab) {
    activeTab.classList.add("active-tab", "border-cyan", "text-cyan");
    activeTab.classList.remove("border-transparent", "text-muted");
  }
};

// ─────────────────────────────────────────
//  NEW: Genre Chart (Films)
// ─────────────────────────────────────────
function renderGenreChart() {
  const films = getData("films") || [];
  const genreCount = {};

  films.forEach((f) => {
    genreCount[f.genre] = (genreCount[f.genre] || 0) + 1;
  });

  const chartCanvas = safeGet("genreChart");
  if (!chartCanvas || Object.keys(genreCount).length === 0) return;

  const ctx = chartCanvas.getContext("2d");

  // Destroy previous chart if exists
  if (chartInstances.genreChart) {
    chartInstances.genreChart.destroy();
  }

  const labels = Object.keys(genreCount);
  const data = Object.values(genreCount);

  chartInstances.genreChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Jumlah Film",
          data: data,
          backgroundColor: "rgba(119, 202, 237, 0.6)",
          borderColor: "#77caed",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1e2626",
          titleColor: "#e8f4f0",
          bodyColor: "#7a9e9a",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          padding: 12,
          displayColors: false,
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.03)" },
          ticks: { color: "#7a9e9a", font: { size: 11 } },
        },
        y: {
          grid: { color: "rgba(255,255,255,0.03)" },
          ticks: { color: "#7a9e9a", font: { size: 11 }, stepSize: 1 },
          beginAtZero: true,
        },
      },
    },
  });
}

// ─────────────────────────────────────────
//  NEW: Mood Chart (Music)
// ─────────────────────────────────────────
function renderMoodChart() {
  const music = getData("music") || [];
  const moodCount = {};

  music.forEach((m) => {
    moodCount[m.mood] = (moodCount[m.mood] || 0) + 1;
  });

  const chartCanvas = safeGet("moodChart");
  if (!chartCanvas || Object.keys(moodCount).length === 0) return;

  const ctx = chartCanvas.getContext("2d");

  // Destroy previous chart if exists
  if (chartInstances.moodChart) {
    chartInstances.moodChart.destroy();
  }

  const labels = Object.keys(moodCount);
  const data = Object.values(moodCount);

  chartInstances.moodChart = new Chart(ctx, {
    type: "polarArea",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: [
            "rgba(119, 202, 237, 0.6)",
            "rgba(120, 250, 185, 0.6)",
            "rgba(122, 158, 154, 0.6)",
            "rgba(74, 98, 96, 0.6)",
          ],
          borderColor: "#1e2626",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#7a9e9a",
            font: { size: 11 },
            padding: 10,
          },
        },
        tooltip: {
          backgroundColor: "#1e2626",
          titleColor: "#e8f4f0",
          bodyColor: "#7a9e9a",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          padding: 12,
        },
      },
      scales: {
        r: {
          ticks: {
            color: "#7a9e9a",
            backdropColor: "transparent",
            stepSize: 1,
          },
          grid: {
            color: "rgba(255,255,255,0.1)",
          },
        },
      },
    },
  });

  // Re-render Lucide icons
  lucide.createIcons();
}

// ─────────────────────────────────────────
//  NEW: Films Rating Distribution Chart
// ─────────────────────────────────────────
function renderFilmsRatingChart() {
  const films = getData("films") || [];
  const chartCanvas = safeGet("filmsRatingChart");
  if (!chartCanvas || films.length === 0) return;

  // Bucket ratings 1-10
  const buckets = Array(10).fill(0);
  films.forEach((f) => {
    const r = Math.max(1, Math.min(10, Math.round(f.rating || 0)));
    buckets[r - 1]++;
  });

  const ctx = chartCanvas.getContext("2d");
  if (chartInstances.filmsRatingChart)
    chartInstances.filmsRatingChart.destroy();

  chartInstances.filmsRatingChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      datasets: [
        {
          label: "Jumlah Film",
          data: buckets,
          backgroundColor: buckets.map((_, i) =>
            i >= 7
              ? "rgba(120,250,185,0.7)"
              : i >= 4
                ? "rgba(119,202,237,0.6)"
                : "rgba(74,98,96,0.5)",
          ),
          borderColor: buckets.map((_, i) =>
            i >= 7 ? "#78fab9" : i >= 4 ? "#77caed" : "#4a6260",
          ),
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1e2626",
          titleColor: "#e8f4f0",
          bodyColor: "#7a9e9a",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          padding: 12,
          displayColors: false,
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.03)" },
          ticks: { color: "#7a9e9a", font: { size: 11 } },
        },
        y: {
          grid: { color: "rgba(255,255,255,0.03)" },
          ticks: { color: "#7a9e9a", font: { size: 11 }, stepSize: 1 },
          beginAtZero: true,
        },
      },
    },
  });
}

// ─────────────────────────────────────────
//  NEW: Music Genre Chart
// ─────────────────────────────────────────
function renderMusicGenreChart() {
  const music = getData("music") || [];
  const genreCount = {};
  music.forEach((m) => {
    genreCount[m.genre] = (genreCount[m.genre] || 0) + 1;
  });

  const chartCanvas = safeGet("musicGenreChart");
  if (!chartCanvas || Object.keys(genreCount).length === 0) return;

  const ctx = chartCanvas.getContext("2d");
  if (chartInstances.musicGenreChart) chartInstances.musicGenreChart.destroy();

  const palette = [
    "rgba(119,202,237,0.7)",
    "rgba(120,250,185,0.7)",
    "rgba(122,158,154,0.7)",
    "rgba(74,98,96,0.7)",
    "rgba(51,64,64,0.9)",
    "rgba(42,53,53,0.9)",
  ];

  chartInstances.musicGenreChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(genreCount),
      datasets: [
        {
          data: Object.values(genreCount),
          backgroundColor: palette,
          borderColor: "#171c1c",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#7a9e9a", font: { size: 11 }, padding: 10 },
        },
        tooltip: {
          backgroundColor: "#1e2626",
          titleColor: "#e8f4f0",
          bodyColor: "#7a9e9a",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          padding: 12,
        },
      },
    },
  });
}

// ─────────────────────────────────────────
//  NEW: Books Genre Chart
// ─────────────────────────────────────────
function renderBooksGenreChart() {
  const books = getData("books") || [];
  const genreCount = {};
  books.forEach((b) => {
    genreCount[b.genre] = (genreCount[b.genre] || 0) + 1;
  });

  const chartCanvas = safeGet("booksGenreChart");
  if (!chartCanvas || Object.keys(genreCount).length === 0) return;

  const ctx = chartCanvas.getContext("2d");
  if (chartInstances.booksGenreChart) chartInstances.booksGenreChart.destroy();

  chartInstances.booksGenreChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(genreCount),
      datasets: [
        {
          label: "Jumlah Buku",
          data: Object.values(genreCount),
          backgroundColor: "rgba(120,250,185,0.6)",
          borderColor: "#78fab9",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1e2626",
          titleColor: "#e8f4f0",
          bodyColor: "#7a9e9a",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          padding: 12,
          displayColors: false,
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.03)" },
          ticks: { color: "#7a9e9a", font: { size: 11 }, stepSize: 1 },
          beginAtZero: true,
        },
        y: {
          grid: { color: "rgba(255,255,255,0.03)" },
          ticks: { color: "#7a9e9a", font: { size: 11 } },
        },
      },
    },
  });
}

// ─────────────────────────────────────────
//  NEW: Books Status Chart
// ─────────────────────────────────────────
function renderBooksStatusChart() {
  const books = getData("books") || [];
  const statusCount = {};
  books.forEach((b) => {
    statusCount[b.status] = (statusCount[b.status] || 0) + 1;
  });

  const chartCanvas = safeGet("booksStatusChart");
  if (!chartCanvas || Object.keys(statusCount).length === 0) return;

  const ctx = chartCanvas.getContext("2d");
  if (chartInstances.booksStatusChart)
    chartInstances.booksStatusChart.destroy();

  const palette = [
    "rgba(119,202,237,0.7)",
    "rgba(120,250,185,0.7)",
    "rgba(122,158,154,0.7)",
    "rgba(74,98,96,0.7)",
  ];

  chartInstances.booksStatusChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(statusCount),
      datasets: [
        {
          data: Object.values(statusCount),
          backgroundColor: palette,
          borderColor: "#171c1c",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#7a9e9a", font: { size: 11 }, padding: 10 },
        },
        tooltip: {
          backgroundColor: "#1e2626",
          titleColor: "#e8f4f0",
          bodyColor: "#7a9e9a",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          padding: 12,
        },
      },
    },
  });
}

// ─────────────────────────────────────────
//  NEW: Games Genre Chart
// ─────────────────────────────────────────
function renderGamesGenreChart() {
  const games = getData("games") || [];
  const genreCount = {};
  games.forEach((g) => {
    genreCount[g.genre] = (genreCount[g.genre] || 0) + 1;
  });

  const chartCanvas = safeGet("gamesGenreChart");
  if (!chartCanvas || Object.keys(genreCount).length === 0) return;

  const ctx = chartCanvas.getContext("2d");
  if (chartInstances.gamesGenreChart) chartInstances.gamesGenreChart.destroy();

  chartInstances.gamesGenreChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(genreCount),
      datasets: [
        {
          label: "Jumlah Game",
          data: Object.values(genreCount),
          backgroundColor: "rgba(120,250,185,0.6)",
          borderColor: "#78fab9",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1e2626",
          titleColor: "#e8f4f0",
          bodyColor: "#7a9e9a",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          padding: 12,
          displayColors: false,
        },
      },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.03)" },
          ticks: { color: "#7a9e9a", font: { size: 11 } },
        },
        y: {
          grid: { color: "rgba(255,255,255,0.03)" },
          ticks: { color: "#7a9e9a", font: { size: 11 }, stepSize: 1 },
          beginAtZero: true,
        },
      },
    },
  });
}

// ─────────────────────────────────────────
//  NEW: Games Platform Chart
// ─────────────────────────────────────────
function renderGamesPlatformChart() {
  const games = getData("games") || [];
  const platformCount = {};
  games.forEach((g) => {
    platformCount[g.platform] = (platformCount[g.platform] || 0) + 1;
  });

  const chartCanvas = safeGet("gamesPlatformChart");
  if (!chartCanvas || Object.keys(platformCount).length === 0) return;

  const ctx = chartCanvas.getContext("2d");
  if (chartInstances.gamesPlatformChart)
    chartInstances.gamesPlatformChart.destroy();

  const palette = [
    "rgba(119,202,237,0.7)",
    "rgba(120,250,185,0.7)",
    "rgba(122,158,154,0.7)",
    "rgba(74,98,96,0.7)",
    "rgba(51,64,64,0.9)",
  ];

  chartInstances.gamesPlatformChart = new Chart(ctx, {
    type: "polarArea",
    data: {
      labels: Object.keys(platformCount),
      datasets: [
        {
          data: Object.values(platformCount),
          backgroundColor: palette,
          borderColor: "#1e2626",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#7a9e9a", font: { size: 11 }, padding: 10 },
        },
        tooltip: {
          backgroundColor: "#1e2626",
          titleColor: "#e8f4f0",
          bodyColor: "#7a9e9a",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          padding: 12,
        },
      },
      scales: {
        r: {
          ticks: {
            color: "#7a9e9a",
            backdropColor: "transparent",
            stepSize: 1,
          },
          grid: { color: "rgba(255,255,255,0.1)" },
        },
      },
    },
  });
}

// ─────────────────────────────────────────
//  NEW: Render Stats Row helper
// ─────────────────────────────────────────
function renderMediaStatsRow(containerId, stats) {
  const el = safeGet(containerId);
  if (!el) return;
  el.innerHTML = stats
    .map(
      (s) => `
    <div class="bg-ink2 rounded-2xl border border-white/5 p-4 flex flex-col gap-1">
      <p class="font-mono text-xs text-muted uppercase tracking-widest">${s.label}</p>
      <p class="font-mono font-black text-2xl ${s.color || "text-cyan"}">${s.value}</p>
    </div>
  `,
    )
    .join("");
}

function renderFilmsStatsRow() {
  const films = getData("films") || [];
  if (films.length === 0) return;
  const avg = films.length
    ? (films.reduce((a, b) => a + (b.rating || 0), 0) / films.length).toFixed(1)
    : 0;
  const top = films.reduce(
    (a, b) => ((b.rating || 0) > (a.rating || 0) ? b : a),
    films[0],
  );
  const genres = new Set(films.map((f) => f.genre)).size;
  renderMediaStatsRow("films-stats-row", [
    { label: "Total Film", value: films.length, color: "text-cyan" },
    { label: "Rata-rata Rating", value: avg + "/10", color: "text-mint" },
    { label: "Jumlah Genre", value: genres, color: "text-cyan" },
    {
      label: "Top Rating",
      value: top ? top.rating + "/10" : "-",
      color: "text-mint",
    },
  ]);
}

function renderMusicStatsRow() {
  const music = getData("music") || [];
  if (music.length === 0) return;
  const moods = new Set(music.map((m) => m.mood)).size;
  const genres = new Set(music.map((m) => m.genre)).size;
  const artists = new Set(music.map((m) => m.artist)).size;
  renderMediaStatsRow("music-stats-row", [
    { label: "Total Musik", value: music.length, color: "text-cyan" },
    { label: "Jumlah Artis", value: artists, color: "text-mint" },
    { label: "Jumlah Genre", value: genres, color: "text-cyan" },
    { label: "Jumlah Mood", value: moods, color: "text-mint" },
  ]);
}

function renderBooksStatsRow() {
  const books = getData("books") || [];
  if (books.length === 0) return;
  const avg = books.length
    ? (books.reduce((a, b) => a + (b.rating || 0), 0) / books.length).toFixed(1)
    : 0;
  const genres = new Set(books.map((b) => b.genre)).size;
  const done = books.filter(
    (b) =>
      (b.status || "").toLowerCase().includes("selesai") ||
      (b.status || "").toLowerCase().includes("done") ||
      (b.status || "").toLowerCase().includes("tamat"),
  ).length;
  renderMediaStatsRow("books-stats-row", [
    { label: "Total Buku", value: books.length, color: "text-mint" },
    { label: "Rata-rata Rating", value: avg + "/10", color: "text-cyan" },
    { label: "Jumlah Genre", value: genres, color: "text-mint" },
    { label: "Sudah Selesai", value: done, color: "text-cyan" },
  ]);
}

function renderGamesStatsRow() {
  const games = getData("games") || [];
  if (games.length === 0) return;
  const avg = games.length
    ? (games.reduce((a, b) => a + (b.rating || 0), 0) / games.length).toFixed(1)
    : 0;
  const platforms = new Set(games.map((g) => g.platform)).size;
  const genres = new Set(games.map((g) => g.genre)).size;
  const top = games.reduce(
    (a, b) => ((b.rating || 0) > (a.rating || 0) ? b : a),
    games[0],
  );
  renderMediaStatsRow("games-stats-row", [
    { label: "Total Game", value: games.length, color: "text-mint" },
    { label: "Rata-rata Rating", value: avg + "/10", color: "text-cyan" },
    { label: "Platform", value: platforms, color: "text-mint" },
    {
      label: "Top Rating",
      value: top ? top.rating + "/10" : "-",
      color: "text-cyan",
    },
  ]);
}
// ─────────────────────────────────────────
function renderContact() {
  const profile = getData("profile");
  if (!profile) return; // ← guard jika profile belum loaded

  // textContent tetap pakai safeSet
  safeSet("contact-email", "textContent", profile.email);
  safeSet("contact-location", "textContent", profile.location);

  // href harus set langsung ke element, bukan lewat safeSet
  const emailLink = safeGet("contact-email");
  if (emailLink) emailLink.href = `mailto:${profile.email}`;

  const githubLink = safeGet("contact-github");
  const linkedinLink = safeGet("contact-linkedin");
  const instagramLink = safeGet("contact-instagram");

  if (githubLink) githubLink.href = profile.github || "#";
  if (linkedinLink) linkedinLink.href = profile.linkedin || "#";
  if (instagramLink) instagramLink.href = profile.instagram || "#";

  lucide.createIcons();
}

// ─────────────────────────────────────────
//  RENDER: FOOTER
// ─────────────────────────────────────────
function renderFooter() {
  const profile = getData("profile");
  const year = new Date().getFullYear();

  safeSet("footer-name", "textContent", profile.name);
  safeSet("footer-year", "textContent", year);
}

// ═════════════════════════════════════════
//  ADMIN PANEL
// ═════════════════════════════════════════

const admState = {
  section: "overview",
  projects: {
    page: 1,
    perPage: 10,
    search: "",
    sortKey: "title",
    sortDir: "asc",
  },
  skills: { page: 1, perPage: 10, search: "", sortKey: "name", sortDir: "asc" },
  experience: {
    page: 1,
    perPage: 10,
    search: "",
    sortKey: "year",
    sortDir: "desc",
  },
  films: { page: 1, perPage: 10, search: "", sortKey: "title", sortDir: "asc" },
  music: { page: 1, perPage: 10, search: "", sortKey: "title", sortDir: "asc" },
  books: { page: 1, perPage: 10, search: "", sortKey: "title", sortDir: "asc" },
  games: { page: 1, perPage: 10, search: "", sortKey: "title", sortDir: "asc" },
};

// State untuk sorting di section biasa (non-admin)
let mediaSort = {
  films: { sortKey: "title", sortDir: "asc" },
  music: { sortKey: "title", sortDir: "asc" },
  books: { sortKey: "title", sortDir: "asc" },
  games: { sortKey: "title", sortDir: "asc" },
};

// ─── Sort helper ───────────────────────────────────────────────────────────
function admSort(key, stateKey, renderFn) {
  const s = admState[stateKey];
  if (s.sortKey === key) {
    s.sortDir = s.sortDir === "asc" ? "desc" : "asc";
  } else {
    s.sortKey = key;
    s.sortDir = "asc";
  }
  s.page = 1;
  renderFn();
}

function applySortAndFilter(items, state, filterFn) {
  const q = state.search.toLowerCase();
  let filtered = q ? items.filter(filterFn) : [...items];
  const { sortKey, sortDir } = state;
  filtered.sort((a, b) => {
    let va = a[sortKey] ?? "";
    let vb = b[sortKey] ?? "";
    if (typeof va === "string") va = va.toLowerCase();
    if (typeof vb === "string") vb = vb.toLowerCase();
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });
  return filtered;
}

function sortIcon(stateKey, col) {
  const s = admState[stateKey];
  if (s.sortKey !== col)
    return `<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-30"></i>`;
  // ASC = naik (A-Z, 0-9) = arrow UP
  // DESC = turun (Z-A, 9-0) = arrow DOWN
  return s.sortDir === "asc"
    ? `<i data-lucide="arrow-up" class="w-3 h-3 inline ml-1 text-cyan"></i>`
    : `<i data-lucide="arrow-down" class="w-3 h-3 inline ml-1 text-cyan"></i>`;
}

// Fungsi sorting untuk tabel media section biasa
function mediaSortIcon(mediaType, col) {
  const s = mediaSort[mediaType];
  if (!s || s.sortKey !== col)
    return `<i data-lucide="chevrons-up-down" class="w-3 h-3 inline ml-1 opacity-30"></i>`;
  return s.sortDir === "asc"
    ? `<i data-lucide="arrow-up" class="w-3 h-3 inline ml-1 text-cyan"></i>`
    : `<i data-lucide="arrow-down" class="w-3 h-3 inline ml-1 text-cyan"></i>`;
}

function sortMedia(mediaType, key) {
  const s = mediaSort[mediaType];
  if (s.sortKey === key) {
    s.sortDir = s.sortDir === "asc" ? "desc" : "asc";
  } else {
    s.sortKey = key;
    s.sortDir = "asc";
  }
  renderMedia();
}

function thSort(label, col, stateKey, renderFnName, align = "left") {
  return `<th class="text-${align} px-4 py-3 font-mono text-xs text-cyan tracking-widest uppercase cursor-pointer select-none hover:text-mint transition-colors" onclick="admSort('${col}','${stateKey}',${renderFnName})">${label}${sortIcon(stateKey, col)}</th>`;
}

function showAdminSection(section) {
  admState.section = section;

  // Hide all sections
  document
    .querySelectorAll(".admin-section")
    .forEach((s) => s.classList.add("hidden"));

  // Show target section
  const target = safeGet(`admin-${section}`);
  if (target) target.classList.remove("hidden");

  // Update nav
  document.querySelectorAll(".admin-nav-btn").forEach((btn) => {
    btn.classList.remove("bg-cyan/10", "text-cyan", "border-cyan/30");
    btn.classList.add("text-muted", "border-white/10");
  });

  const activeBtn = document.querySelector(
    `.admin-nav-btn[onclick="showAdminSection('${section}')"]`,
  );
  if (activeBtn) {
    activeBtn.classList.add("bg-cyan/10", "text-cyan", "border-cyan/30");
    activeBtn.classList.remove("text-muted", "border-white/10");
  }

  // Render section
  if (section === "overview") renderAdminOverview();
  else if (section === "projects") renderAdmProjects();
  else if (section === "skills") renderAdmSkills();
  else if (section === "experience") renderAdmExp();
  else if (section === "films") renderAdmFilms();
  else if (section === "music") renderAdmMusic();
  else if (section === "books") renderAdmBooks();
  else if (section === "games") renderAdmGames();

  lucide.createIcons();
}

function renderAdmin() {
  showAdminSection(admState.section);
}

// ─────────────────────────────────────────
//  ADMIN TAB NAVIGATION
// ─────────────────────────────────────────
function adminTab(tab) {
  // Hide all admin panels
  document.querySelectorAll(".adm-panel").forEach((panel) => {
    panel.classList.add("hidden");
  });

  // Show selected panel
  const targetPanel = document.getElementById(`adm-${tab}`);
  if (targetPanel) {
    targetPanel.classList.remove("hidden");
  }

  // Update sidebar buttons
  document.querySelectorAll(".adm-tab").forEach((btn) => {
    btn.classList.remove(
      "active-adm",
      "border-cyan",
      "bg-white/5",
      "text-cyan",
    );
    btn.classList.add("text-muted", "border-transparent");
  });

  const activeBtn = document.querySelector(`.adm-tab[data-adm="${tab}"]`);
  if (activeBtn) {
    activeBtn.classList.add(
      "active-adm",
      "border-cyan",
      "bg-white/5",
      "text-cyan",
    );
    activeBtn.classList.remove("text-muted", "border-transparent");
  }

  // Close sidebar on mobile after selecting tab
  if (window.innerWidth < 768) {
    closeAdminSidebar();
  }

  // Render content based on tab
  if (tab === "overview") renderAdminOverview();
  else if (tab === "profile") renderAdminProfile();
  else if (tab === "projects-a") renderAdmProjects();
  else if (tab === "skills-a") renderAdmSkills();
  else if (tab === "exp-a") renderAdmExp();
  else if (tab === "films-a") renderAdmFilms();
  else if (tab === "music-a") renderAdmMusic();
  else if (tab === "books-a") renderAdmBooks();
  else if (tab === "games-a") renderAdmGames();
  else if (tab === "modul-a") renderAdminModul();
  else if (tab === "messages-a") renderAdminMessages();

  // Reinitialize icons
  lucide.createIcons();
}

// ─────────────────────────────────────────
//  ADMIN: OVERVIEW
// ─────────────────────────────────────────
async function renderAdminOverview() {
  // Load data from Firebase
  const projects =
    FIREBASE_CACHE.projects.length > 0
      ? FIREBASE_CACHE.projects
      : await getData("projects");
  const skills =
    FIREBASE_CACHE.skills.length > 0
      ? FIREBASE_CACHE.skills
      : await getData("skills");
  const films =
    FIREBASE_CACHE.films.length > 0
      ? FIREBASE_CACHE.films
      : await getData("films");
  const music =
    FIREBASE_CACHE.music.length > 0
      ? FIREBASE_CACHE.music
      : await getData("music");
  const books =
    FIREBASE_CACHE.books.length > 0
      ? FIREBASE_CACHE.books
      : await getData("books");
  const games =
    FIREBASE_CACHE.games.length > 0
      ? FIREBASE_CACHE.games
      : await getData("games");
  const experience =
    FIREBASE_CACHE.experience.length > 0
      ? FIREBASE_CACHE.experience
      : await getData("experience");

  // Update stats
  safeSet("ov-projects", "textContent", projects.length);
  safeSet("ov-skills", "textContent", skills.length);
  safeSet("ov-films", "textContent", films.length);
  safeSet("ov-music", "textContent", music.length);
  safeSet("ov-books", "textContent", books.length);
  safeSet("ov-games", "textContent", games.length);
  safeSet("ov-experience", "textContent", experience.length);

  // Create charts
  renderStorageChart(projects.length, skills.length, experience.length);
  renderMediaChart(films.length, music.length, books.length, games.length);
}

function renderStorageChart(projectsCount, skillsCount, experienceCount) {
  const ctx = document.getElementById("storageChart");
  if (!ctx) return;

  // Destroy existing chart if exists
  if (chartInstances.storageChart) {
    chartInstances.storageChart.destroy();
  }

  chartInstances.storageChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Projects", "Skills", "Experience"],
      datasets: [
        {
          data: [projectsCount, skillsCount, experienceCount],
          backgroundColor: [
            "rgba(119, 202, 237, 0.7)",
            "rgba(120, 250, 185, 0.7)",
            "rgba(192, 132, 252, 0.7)",
          ],
          borderColor: [
            "rgba(119, 202, 237, 1)",
            "rgba(120, 250, 185, 1)",
            "rgba(192, 132, 252, 1)",
          ],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#7a9e9a",
            padding: 15,
            font: {
              size: 11,
            },
          },
        },
      },
    },
  });
}

function renderMediaChart(filmsCount, musicCount, booksCount, gamesCount) {
  const ctx = document.getElementById("mediaChart");
  if (!ctx) return;

  // Destroy existing chart if exists
  if (chartInstances.mediaChart) {
    chartInstances.mediaChart.destroy();
  }

  chartInstances.mediaChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Film", "Musik", "Buku", "Game"],
      datasets: [
        {
          label: "Total Item",
          data: [filmsCount, musicCount, booksCount, gamesCount],
          backgroundColor: [
            "rgba(250, 204, 21, 0.7)",
            "rgba(244, 114, 182, 0.7)",
            "rgba(251, 146, 60, 0.7)",
            "rgba(74, 222, 128, 0.7)",
          ],
          borderColor: [
            "rgba(250, 204, 21, 1)",
            "rgba(244, 114, 182, 1)",
            "rgba(251, 146, 60, 1)",
            "rgba(74, 222, 128, 1)",
          ],
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "#7a9e9a",
            stepSize: 1,
          },
          grid: {
            color: "rgba(255,255,255,0.05)",
          },
        },
        x: {
          ticks: {
            color: "#7a9e9a",
          },
          grid: {
            display: false,
          },
        },
      },
    },
  });
}

async function renderAdminProfile() {
  const profile = FIREBASE_CACHE.profile || (await getData("profile"));

  safeSet("p-name", "value", profile?.name || "");
  safeSet("p-role", "value", profile?.role || "");
  safeSet("p-tagline", "value", profile?.tagline || "");
  safeSet("p-bio", "value", profile?.bio || "");
  safeSet("p-loc", "value", profile?.location || "");
  safeSet("p-email", "value", profile?.email || "");
  safeSet("p-github", "value", profile?.github || "");
  safeSet("p-linkedin", "value", profile?.linkedin || "");
  safeSet("p-Instagram", "value", profile?.instagram || "");
  safeSet("p-avatar", "value", profile?.avatar || "");

  const availCheckbox = safeGet("p-avail");
  if (availCheckbox) availCheckbox.checked = profile?.available || false;
}

async function renderAdminMessages() {
  // Get messages from Firebase
  const messages = await getFirebaseData("messages");

  const msgCountEl = safeGet("msg-count");
  const messagesListEl = safeGet("messages-list");
  const messagesEmptyEl = safeGet("messages-empty");

  if (!messagesListEl) return;

  const messageCount = messages ? messages.length : 0;

  if (msgCountEl) {
    msgCountEl.textContent = messageCount;
  }

  if (!messages || messages.length === 0) {
    messagesListEl.innerHTML = "";
    if (messagesEmptyEl) {
      messagesEmptyEl.classList.remove("hidden");
    }
    return;
  }

  if (messagesEmptyEl) {
    messagesEmptyEl.classList.add("hidden");
  }

  // Sort messages by timestamp (newest first)
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
  );

  messagesListEl.innerHTML = sortedMessages
    .map((msg) => {
      const date = new Date(msg.timestamp);
      const formattedDate = date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const readBadge = msg.read
        ? ""
        : '<span class="inline-block w-2 h-2 bg-cyan rounded-full"></span>';

      return `
      <div class="bg-ink3 rounded-xl border border-white/5 p-4 hover:border-cyan/30 transition-all ${!msg.read ? "ring-1 ring-cyan/20" : ""}">
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <p class="font-medium text-sm mb-1">${msg.name}</p>
              ${readBadge}
            </div>
            <p class="text-xs text-cyan mb-2">${msg.email}</p>
          </div>
          <span class="text-xs text-muted">${formattedDate}</span>
        </div>
        <p class="text-sm text-muted mb-3 line-clamp-2">${msg.message}</p>
        <button 
          onclick="viewMessage('${msg._docId}')" 
          class="text-xs text-cyan hover:text-mint transition-colors flex items-center gap-1"
        >
          <i data-lucide="eye" class="w-3.5 h-3.5"></i> Lihat Detail
        </button>
      </div>
    `;
    })
    .join("");

  lucide.createIcons();
}

async function saveProfile() {
  const profile = {
    name: safeGet("p-name")?.value || "",
    role: safeGet("p-role")?.value || "",
    tagline: safeGet("p-tagline")?.value || "",
    bio: safeGet("p-bio")?.value || "",
    location: safeGet("p-loc")?.value || "",
    email: safeGet("p-email")?.value || "",
    github: safeGet("p-github")?.value || "",
    linkedin: safeGet("p-linkedin")?.value || "",
    instagram: safeGet("p-Instagram")?.value || "",
    avatar: safeGet("p-avatar")?.value || "",
    available: safeGet("p-avail")?.checked || false,
  };

  try {
    await setData("profile", profile);
    FIREBASE_CACHE.profile = profile;
    toast("Profil berhasil diperbarui!", "success");

    // Re-render sections that use profile data
    renderDashboard();
    renderAbout();
    renderContact();
    renderFooter();
  } catch (error) {
    console.error("Error saving profile:", error);
    toast("Gagal menyimpan profil", "error");
  }
}

// ─────────────────────────────────────────
//  ADMIN: PAGINATION HELPER
// ─────────────────────────────────────────
function admPaginator(total, state, renderFn, containerId) {
  const totalPages = Math.ceil(total / state.perPage);
  const container = safeGet(containerId);
  if (!container) return;

  if (total === 0) {
    container.innerHTML = "";
    return;
  }

  const cur = state.page;
  const from = (cur - 1) * state.perPage + 1;
  const to = Math.min(cur * state.perPage, total);

  const range = 2;
  let pageButtons = "";
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= cur - range && i <= cur + range)) {
      const active = i === cur;
      pageButtons += `<button onclick="${renderFn.name}_goPage(${i})" class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${active ? "bg-cyan/10 text-cyan border border-cyan/30" : "text-muted border border-white/10 hover:border-cyan/30 hover:text-cyan"}">${i}</button>`;
    } else if (i === cur - range - 1 || i === cur + range + 1) {
      pageButtons += `<span class="px-1 text-muted text-xs">…</span>`;
    }
  }

  const prevDisabled = cur <= 1;
  const nextDisabled = cur >= totalPages;

  container.innerHTML = `
    <div class="flex items-center justify-between mt-4 flex-wrap gap-2">
      <p class="text-xs text-muted font-mono">${from}–${to} dari ${total} data</p>
      <div class="flex items-center gap-1.5 flex-wrap">
        <button onclick="${renderFn.name}_goPage(${cur - 1})" ${prevDisabled ? "disabled" : ""} class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${prevDisabled ? "text-dim border-white/5 cursor-not-allowed opacity-40" : "text-muted border-white/10 hover:border-cyan/30 hover:text-cyan"}">
          <i data-lucide="chevron-left" class="w-3 h-3"></i>
        </button>
        ${pageButtons}
        <button onclick="${renderFn.name}_goPage(${cur + 1})" ${nextDisabled ? "disabled" : ""} class="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${nextDisabled ? "text-dim border-white/5 cursor-not-allowed opacity-40" : "text-muted border-white/10 hover:border-cyan/30 hover:text-cyan"}">
          <i data-lucide="chevron-right" class="w-3 h-3"></i>
        </button>
      </div>
    </div>`;
  lucide.createIcons();
}

// ─────────────────────────────────────────
//  ADMIN: PROJECTS
// ─────────────────────────────────────────
function renderAdmProjects() {
  const state = admState.projects;
  const all = applySortAndFilter(
    getData("projects") || [],
    state,
    (p) =>
      p.title.toLowerCase().includes(state.search.toLowerCase()) ||
      (p.tech || "").toLowerCase().includes(state.search.toLowerCase()),
  );
  const total = all.length;
  const { page, perPage } = state;
  const slice = all.slice((page - 1) * perPage, page * perPage);

  // Update sort headers
  const thead = document
    .querySelector("#adm-projects-tbody")
    ?.closest("table")
    ?.querySelector("thead tr");
  if (thead) {
    thead.innerHTML =
      thSort("Proyek", "title", "projects", "renderAdmProjects") +
      thSort("Tech", "tech", "projects", "renderAdmProjects") +
      thSort("Status", "status", "projects", "renderAdmProjects") +
      thSort("Featured", "featured", "projects", "renderAdmProjects") +
      `<th class="text-right px-4 py-3 font-mono text-xs text-cyan tracking-widest uppercase">Aksi</th>`;
  }

  const listEl = safeGet("adm-projects-tbody");
  if (listEl) {
    listEl.innerHTML =
      slice
        .map(
          (p) => `
      <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
        <td class="px-4 py-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-cyan/20 to-mint/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <i data-lucide="${p.icon || "code-2"}" class="w-5 h-5 text-cyan"></i>
            </div>
            <div>
              <p class="font-semibold text-sm">${p.title}</p>
              <p class="text-xs text-dim mt-0.5">${p.desc}</p>
            </div>
          </div>
        </td>
        <td class="px-4 py-4">
          <div class="flex flex-wrap gap-1.5">
            ${(p.tech || "")
              .split(",")
              .map(
                (t) =>
                  `<span class="text-xs bg-ink3 px-2 py-0.5 rounded-lg text-muted">${t.trim()}</span>`,
              )
              .join("")}
          </div>
        </td>
        <td class="px-4 py-4">
          <span class="text-xs px-2 py-1 rounded-lg ${p.status === "Selesai" ? "bg-mint/10 text-mint" : "bg-cyan/10 text-cyan"}">${p.status}</span>
        </td>
        <td class="px-4 py-4">
          ${p.featured ? '<span class="text-xs px-2 py-1 bg-mint/10 text-mint rounded-lg">⭐ Yes</span>' : '<span class="text-xs text-muted">No</span>'}
        </td>
        <td class="px-4 py-4 text-right">
          <div class="flex gap-2 justify-end">
            <button onclick="editProject(${p.id})" class="text-xs bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all"><i data-lucide="pencil" class="w-3 h-3"></i></button>
            <button onclick="deleteItem('projects',${p.id})" class="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
          </div>
        </td>
      </tr>`,
        )
        .join("") ||
      '<tr><td colspan="5" class="text-center py-8 text-muted text-sm">Tidak ada hasil.</td></tr>';
  }
  admPaginator(total, state, renderAdmProjects, "adm-projects-pages");
  lucide.createIcons();
}

function renderAdmProjects_goPage(p) {
  admState.projects.page = p;
  renderAdmProjects();
}

function admProjectsSearch(v) {
  admState.projects.search = v;
  admState.projects.page = 1;
  renderAdmProjects();
}

function editProject(id) {
  const p = (getData("projects") || []).find((x) => x.id === id);
  if (!p) return;

  safeSet("modal-project-title", "textContent", "Edit Project");
  safeSet("proj-id", "value", p.id);
  safeSet("proj-title", "value", p.title);
  safeSet("proj-desc", "value", p.desc);
  safeSet("proj-tech", "value", p.tech);
  safeSet("proj-status", "value", p.status);
  safeSet("proj-link", "value", p.link);
  safeSet("proj-github", "value", p.github);
  safeSet("proj-icon", "value", p.icon || "code-2");

  const featuredCheckbox = safeGet("proj-featured");
  if (featuredCheckbox) featuredCheckbox.checked = p.featured;

  openModal("modal-project");
}

async function saveProject() {
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

  let list = getData("projects") || [];
  if (id) {
    list = list.map((p) => (p.id === parseInt(id) ? item : p));
  } else {
    list.push(item);
  }

  await setData("projects", list);
  closeModal("modal-project");
  toast(id ? "Project diperbarui!" : "Project ditambahkan!", "success");
  renderAdmProjects();
  renderDashboard();
  renderProjects();
  renderTechDonutChart();

  // Reset form
  safeSet("proj-id", "value", "");
  safeSet("modal-project-title", "textContent", "Tambah Project");
}

// ─────────────────────────────────────────
//  ADMIN: SKILLS
// ─────────────────────────────────────────
function renderAdmSkills() {
  const state = admState.skills;
  const all = applySortAndFilter(
    getData("skills") || [],
    state,
    (s) =>
      s.name.toLowerCase().includes(state.search.toLowerCase()) ||
      (s.category || "").toLowerCase().includes(state.search.toLowerCase()),
  );
  const total = all.length;
  const { page, perPage } = state;
  const slice = all.slice((page - 1) * perPage, page * perPage);

  const thead = document
    .querySelector("#adm-skills-tbody")
    ?.closest("table")
    ?.querySelector("thead tr");
  if (thead) {
    thead.innerHTML =
      thSort("Skill", "name", "skills", "renderAdmSkills") +
      thSort("Kategori", "category", "skills", "renderAdmSkills") +
      thSort("Level", "level", "skills", "renderAdmSkills") +
      `<th class="text-right px-4 py-3 font-mono text-xs text-cyan tracking-widest uppercase">Aksi</th>`;
  }

  const listEl = safeGet("adm-skills-tbody");
  if (listEl) {
    listEl.innerHTML =
      slice
        .map(
          (s) => `
      <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
        <td class="px-4 py-4"><p class="font-semibold text-sm">${s.name}</p></td>
        <td class="px-4 py-4"><span class="text-xs text-muted">${s.category}</span></td>
        <td class="px-4 py-4">
          <div class="flex items-center gap-3">
            <div class="flex-1 bg-ink3 rounded-full h-2 overflow-hidden max-w-[200px]">
              <div class="bg-gradient-to-r from-cyan to-mint h-full rounded-full transition-all" style="width:${s.level}%"></div>
            </div>
            <span class="text-xs text-cyan font-medium min-w-[3rem]">${s.level}%</span>
          </div>
        </td>
        <td class="px-4 py-4 text-right">
          <div class="flex gap-2 justify-end">
            <button onclick="editSkill(${s.id})" class="text-xs bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all"><i data-lucide="pencil" class="w-3 h-3"></i></button>
            <button onclick="deleteItem('skills',${s.id})" class="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
          </div>
        </td>
      </tr>`,
        )
        .join("") ||
      '<tr><td colspan="4" class="text-center py-8 text-muted text-sm">Tidak ada hasil.</td></tr>';
  }
  admPaginator(total, state, renderAdmSkills, "adm-skills-pages");
  lucide.createIcons();
}

function renderAdmSkills_goPage(p) {
  admState.skills.page = p;
  renderAdmSkills();
}

function admSkillsSearch(v) {
  admState.skills.search = v;
  admState.skills.page = 1;
  renderAdmSkills();
}

function editSkill(id) {
  const s = (getData("skills") || []).find((x) => x.id === id);
  if (!s) return;

  safeSet("modal-skill-title", "textContent", "Edit Skill");
  safeSet("skill-id", "value", s.id);
  safeSet("skill-name", "value", s.name);
  safeSet("skill-cat", "value", s.category);
  safeSet("skill-level", "value", s.level);
  safeSet("skill-level-label", "textContent", s.level);

  openModal("modal-skill");
}

async function saveSkill() {
  const id = safeGet("skill-id")?.value;
  const item = {
    id: id ? parseInt(id) : uid(),
    name: safeGet("skill-name")?.value || "",
    category: safeGet("skill-cat")?.value || "Frontend",
    level: parseInt(safeGet("skill-level")?.value || "80"),
  };

  let list = getData("skills") || [];
  if (id) {
    list = list.map((s) => (s.id === parseInt(id) ? item : s));
  } else {
    list.push(item);
  }

  await setData("skills", list);
  closeModal("modal-skill");
  toast(id ? "Skill diperbarui!" : "Skill ditambahkan!", "success");
  renderAdmSkills();
  renderDashboard();
  renderAbout();
  renderSkillsRadarChart();
  renderSkillCategoryChart();

  // Reset form
  safeSet("skill-id", "value", "");
  safeSet("modal-skill-title", "textContent", "Tambah Skill");
}

// ─────────────────────────────────────────
//  ADMIN: EXPERIENCE
// ─────────────────────────────────────────
function renderAdmExp() {
  const state = admState.experience;
  const all = applySortAndFilter(
    getData("experience") || [],
    state,
    (e) =>
      e.title.toLowerCase().includes(state.search.toLowerCase()) ||
      (e.company || "").toLowerCase().includes(state.search.toLowerCase()) ||
      (e.year || "").toLowerCase().includes(state.search.toLowerCase()),
  );
  const total = all.length;
  const { page, perPage } = state;
  const slice = all.slice((page - 1) * perPage, page * perPage);

  // Update sort headers
  const thead = document
    .querySelector("#adm-exp-tbody")
    ?.closest("table")
    ?.querySelector("thead tr");
  if (thead) {
    thead.innerHTML =
      thSort("Periode", "year", "experience", "renderAdmExp") +
      thSort("Jabatan", "title", "experience", "renderAdmExp") +
      thSort("Perusahaan", "company", "experience", "renderAdmExp") +
      thSort("Status", "active", "experience", "renderAdmExp") +
      `<th class="text-right px-4 py-3 font-mono text-xs text-cyan tracking-widest uppercase">Aksi</th>`;
  }

  const listEl = safeGet("adm-exp-tbody");
  if (listEl) {
    listEl.innerHTML =
      slice
        .map(
          (e) => `
      <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
        <td class="px-4 py-4"><span class="text-xs text-muted font-mono">${e.year}</span></td>
        <td class="px-4 py-4">
          <p class="font-semibold text-sm">${e.title}</p>
          <p class="text-xs text-dim mt-0.5">${e.desc}</p>
        </td>
        <td class="px-4 py-4"><span class="text-xs text-cyan">${e.company}</span></td>
        <td class="px-4 py-4">
          ${
            e.active
              ? '<span class="text-xs px-2 py-1 bg-mint/10 text-mint rounded-lg">Aktif</span>'
              : '<span class="text-xs px-2 py-1 bg-ink3 text-muted rounded-lg">Selesai</span>'
          }
        </td>
        <td class="px-4 py-4 text-right">
          <div class="flex gap-2 justify-end">
            <button onclick="editExp(${e.id})" class="text-xs bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all"><i data-lucide="pencil" class="w-3 h-3"></i></button>
            <button onclick="deleteItem('experience',${e.id})" class="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
          </div>
        </td>
      </tr>`,
        )
        .join("") ||
      '<tr><td colspan="5" class="text-center py-8 text-muted text-sm">Tidak ada hasil.</td></tr>';
  }
  admPaginator(total, state, renderAdmExp, "adm-exp-pages");
  lucide.createIcons();
}

function renderAdmExp_goPage(p) {
  admState.experience.page = p;
  renderAdmExp();
}

function admExpSearch(v) {
  admState.experience.search = v;
  admState.experience.page = 1;
  renderAdmExp();
}

function editExp(id) {
  const e = (getData("experience") || []).find((x) => x.id === id);
  if (!e) return;

  safeSet("modal-exp-title", "textContent", "Edit Experience");
  safeSet("exp-id", "value", e.id);
  safeSet("exp-year", "value", e.year);
  safeSet("exp-title", "value", e.title);
  safeSet("exp-company", "value", e.company);
  safeSet("exp-desc", "value", e.desc);

  const activeCheckbox = safeGet("exp-active");
  if (activeCheckbox) activeCheckbox.checked = e.active;

  openModal("modal-exp");
}

async function saveExp() {
  const id = safeGet("exp-id")?.value;
  const item = {
    id: id ? parseInt(id) : uid(),
    year: safeGet("exp-year")?.value || "",
    title: safeGet("exp-title")?.value || "",
    company: safeGet("exp-company")?.value || "",
    desc: safeGet("exp-desc")?.value || "",
    active: safeGet("exp-active")?.checked || false,
  };

  let list = getData("experience") || [];
  if (id) {
    list = list.map((e) => (e.id === parseInt(id) ? item : e));
  } else {
    list.push(item);
  }

  await setData("experience", list);
  closeModal("modal-exp");
  toast(id ? "Experience diperbarui!" : "Experience ditambahkan!", "success");
  renderAdmExp();
  renderDashboard();
  renderAbout();

  // Reset form
  safeSet("exp-id", "value", "");
  safeSet("modal-exp-title", "textContent", "Tambah Experience");
}

// ─────────────────────────────────────────
//  ADMIN: FILMS
// ─────────────────────────────────────────
function renderAdmFilms() {
  const state = admState.films;
  const all = applySortAndFilter(
    getData("films") || [],
    state,
    (f) =>
      f.title.toLowerCase().includes(state.search.toLowerCase()) ||
      (f.genre || "").toLowerCase().includes(state.search.toLowerCase()),
  );
  const total = all.length;
  const { page, perPage } = state;
  const slice = all.slice((page - 1) * perPage, page * perPage);

  const thead = document
    .querySelector("#adm-films-tbody")
    ?.closest("table")
    ?.querySelector("thead tr");
  if (thead) {
    thead.innerHTML =
      `<th class="text-left px-4 py-3 font-mono text-xs text-cyan tracking-widest uppercase">#</th>` +
      thSort("Judul", "title", "films", "renderAdmFilms") +
      thSort("Genre", "genre", "films", "renderAdmFilms") +
      thSort("Tahun", "year", "films", "renderAdmFilms") +
      thSort("Rating", "rating", "films", "renderAdmFilms") +
      `<th class="text-right px-4 py-3 font-mono text-xs text-cyan tracking-widest uppercase">Aksi</th>`;
  }

  const listEl = safeGet("adm-films-tbody");
  if (listEl) {
    listEl.innerHTML =
      slice
        .map(
          (f, idx) => `
      <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
        <td class="px-4 py-4 text-muted text-xs">${(page - 1) * perPage + idx + 1}</td>
        <td class="px-4 py-4">
          <p class="font-semibold text-sm">${f.title}</p>
          <p class="text-xs text-dim mt-0.5">${f.comment || ""}</p>
        </td>
        <td class="px-4 py-4"><span class="text-xs text-muted">${f.genre}</span></td>
        <td class="px-4 py-4"><span class="text-xs text-muted">${f.year}</span></td>
        <td class="px-4 py-4">
          <div class="flex items-center gap-2">
            <div class="flex gap-0.5">
              ${Array(10)
                .fill(0)
                .map(
                  (_, i) =>
                    `<span class="w-1.5 h-1.5 rounded-full ${i < f.rating ? "bg-cyan" : "bg-ink4"}"></span>`,
                )
                .join("")}
            </div>
            <span class="text-xs text-muted">${f.rating}/10</span>
          </div>
        </td>
        <td class="px-4 py-4 text-right">
          <div class="flex gap-2 justify-end">
            <button onclick="editFilm(${f.id})" class="text-xs bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all"><i data-lucide="pencil" class="w-3 h-3"></i></button>
            <button onclick="deleteItem('films',${f.id})" class="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
          </div>
        </td>
      </tr>`,
        )
        .join("") ||
      '<tr><td colspan="6" class="text-center py-8 text-muted text-sm">Tidak ada hasil.</td></tr>';
  }
  admPaginator(total, state, renderAdmFilms, "adm-films-pages");
  lucide.createIcons();
}

function renderAdmFilms_goPage(p) {
  admState.films.page = p;
  renderAdmFilms();
}

function admFilmsSearch(v) {
  admState.films.search = v;
  admState.films.page = 1;
  renderAdmFilms();
}

function editFilm(id) {
  const f = (getData("films") || []).find((x) => x.id === id);
  if (!f) return;

  safeSet("modal-film-title", "textContent", "Edit Film");
  safeSet("film-id", "value", f.id);
  safeSet("film-title", "value", f.title);
  safeSet("film-genre", "value", f.genre);
  safeSet("film-year", "value", f.year);
  safeSet("film-rating", "value", f.rating);
  safeSet("film-rating-label", "textContent", f.rating);
  safeSet("film-review", "value", f.review || "");
  safeSet("film-comment", "value", f.comment);

  openModal("modal-film");
}

async function saveFilm() {
  const id = safeGet("film-id")?.value;
  const item = {
    id: id ? parseInt(id) : uid(),
    title: safeGet("film-title")?.value || "",
    genre: safeGet("film-genre")?.value || "",
    year: parseInt(safeGet("film-year")?.value || "2024"),
    rating: parseInt(safeGet("film-rating")?.value || "8"),
    review: safeGet("film-review")?.value || "",
    comment: safeGet("film-comment")?.value || "",
  };

  let list = getData("films") || [];
  if (id) {
    list = list.map((f) => (f.id === parseInt(id) ? item : f));
  } else {
    list.push(item);
  }

  await setData("films", list);
  closeModal("modal-film");
  toast(id ? "Film diperbarui!" : "Film ditambahkan!", "success");
  renderAdmFilms();
  renderMedia();
  renderGenreChart();

  // Reset form
  safeSet("film-id", "value", "");
  safeSet("modal-film-title", "textContent", "Tambah Film");
}

// ─────────────────────────────────────────
//  ADMIN: MUSIC
// ─────────────────────────────────────────
function renderAdmMusic() {
  const state = admState.music;
  const all = applySortAndFilter(
    getData("music") || [],
    state,
    (m) =>
      m.title.toLowerCase().includes(state.search.toLowerCase()) ||
      (m.artist || "").toLowerCase().includes(state.search.toLowerCase()) ||
      (m.genre || "").toLowerCase().includes(state.search.toLowerCase()),
  );
  const total = all.length;
  const { page, perPage } = state;
  const slice = all.slice((page - 1) * perPage, page * perPage);

  const thead = document
    .querySelector("#adm-music-tbody")
    ?.closest("table")
    ?.querySelector("thead tr");
  if (thead) {
    thead.innerHTML =
      thSort("Judul", "title", "music", "renderAdmMusic") +
      thSort("Artis", "artist", "music", "renderAdmMusic") +
      thSort("Genre", "genre", "music", "renderAdmMusic") +
      thSort("Mood", "mood", "music", "renderAdmMusic") +
      `<th class="text-right px-4 py-3 font-mono text-xs text-cyan tracking-widest uppercase">Aksi</th>`;
  }

  const listEl = safeGet("adm-music-tbody");
  if (listEl) {
    listEl.innerHTML =
      slice
        .map(
          (m) => `
      <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
        <td class="px-4 py-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-cyan/10 rounded-lg flex items-center justify-center">
              <i data-lucide="${m.icon || "music"}" class="w-4 h-4 text-cyan"></i>
            </div>
            <p class="font-semibold text-sm">${m.title}</p>
          </div>
        </td>
        <td class="px-4 py-4"><span class="text-xs text-muted">${m.artist}</span></td>
        <td class="px-4 py-4"><span class="text-xs text-muted">${m.genre}</span></td>
        <td class="px-4 py-4"><span class="text-xs bg-cyan/10 text-cyan px-2 py-0.5 rounded-lg">${m.mood}</span></td>
        <td class="px-4 py-4 text-right">
          <div class="flex gap-2 justify-end">
            <button onclick="editMusic(${m.id})" class="text-xs bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all"><i data-lucide="pencil" class="w-3 h-3"></i></button>
            <button onclick="deleteItem('music',${m.id})" class="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
          </div>
        </td>
      </tr>`,
        )
        .join("") ||
      '<tr><td colspan="5" class="text-center py-8 text-muted text-sm">Tidak ada hasil.</td></tr>';
  }
  admPaginator(total, state, renderAdmMusic, "adm-music-pages");
  lucide.createIcons();
}

function renderAdmMusic_goPage(p) {
  admState.music.page = p;
  renderAdmMusic();
}

function admMusicSearch(v) {
  admState.music.search = v;
  admState.music.page = 1;
  renderAdmMusic();
}

function editMusic(id) {
  const m = (getData("music") || []).find((x) => x.id === id);
  if (!m) return;

  safeSet("modal-music-title", "textContent", "Edit Music");
  safeSet("music-id", "value", m.id);
  safeSet("music-title", "value", m.title);
  safeSet("music-artist", "value", m.artist);
  safeSet("music-genre", "value", m.genre);
  safeSet("music-mood", "value", m.mood);
  safeSet("music-icon", "value", m.icon || "music");

  openModal("modal-music");
}

async function saveMusic() {
  const id = safeGet("music-id")?.value;
  const item = {
    id: id ? parseInt(id) : uid(),
    title: safeGet("music-title")?.value || "",
    artist: safeGet("music-artist")?.value || "",
    genre: safeGet("music-genre")?.value || "",
    mood: safeGet("music-mood")?.value || "",
    icon: safeGet("music-icon")?.value || "music",
  };

  let list = getData("music") || [];
  if (id) {
    list = list.map((m) => (m.id === parseInt(id) ? item : m));
  } else {
    list.push(item);
  }

  await setData("music", list);
  closeModal("modal-music");
  toast(id ? "Music diperbarui!" : "Music ditambahkan!", "success");
  renderAdmMusic();
  renderMedia();
  renderMoodChart();

  // Reset form
  safeSet("music-id", "value", "");
  safeSet("modal-music-title", "textContent", "Tambah Music");
}

// ─────────────────────────────────────────
//  ADMIN: BOOKS
// ─────────────────────────────────────────
function renderAdmBooks() {
  const state = admState.books;
  const all = applySortAndFilter(
    getData("books") || [],
    state,
    (b) =>
      b.title.toLowerCase().includes(state.search.toLowerCase()) ||
      (b.author || "").toLowerCase().includes(state.search.toLowerCase()) ||
      (b.genre || "").toLowerCase().includes(state.search.toLowerCase()),
  );
  const total = all.length;
  const { page, perPage } = state;
  const slice = all.slice((page - 1) * perPage, page * perPage);

  const thead = document
    .querySelector("#adm-books-tbody")
    ?.closest("table")
    ?.querySelector("thead tr");
  if (thead) {
    thead.innerHTML =
      thSort("Judul", "title", "books", "renderAdmBooks") +
      thSort("Penulis", "author", "books", "renderAdmBooks") +
      thSort("Genre", "genre", "books", "renderAdmBooks") +
      thSort("Status", "status", "books", "renderAdmBooks") +
      thSort("Rating", "rating", "books", "renderAdmBooks") +
      `<th class="text-right px-4 py-3 font-mono text-xs text-cyan tracking-widest uppercase">Aksi</th>`;
  }

  const listEl = safeGet("adm-books-tbody");
  if (listEl) {
    listEl.innerHTML =
      slice
        .map(
          (b) => `
      <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
        <td class="px-4 py-4"><p class="font-semibold text-sm">${b.title}</p></td>
        <td class="px-4 py-4"><span class="text-xs text-muted">${b.author}</span></td>
        <td class="px-4 py-4"><span class="text-xs text-muted">${b.genre}</span></td>
        <td class="px-4 py-4"><span class="text-xs px-2 py-0.5 rounded-lg ${b.status === "Sudah Baca" ? "bg-mint/10 text-mint" : "bg-cyan/10 text-cyan"}">${b.status}</span></td>
        <td class="px-4 py-4">
          <div class="flex items-center gap-2">
            <div class="flex gap-0.5">
              ${Array(10)
                .fill(0)
                .map(
                  (_, i) =>
                    `<span class="w-1.5 h-1.5 rounded-full ${i < b.rating ? "bg-mint" : "bg-ink4"}"></span>`,
                )
                .join("")}
            </div>
            <span class="text-xs text-muted">${b.rating}/10</span>
          </div>
        </td>
        <td class="px-4 py-4 text-right">
          <div class="flex gap-2 justify-end">
            <button onclick="editBook(${b.id})" class="text-xs bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all"><i data-lucide="pencil" class="w-3 h-3"></i></button>
            <button onclick="deleteItem('books',${b.id})" class="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
          </div>
        </td>
      </tr>`,
        )
        .join("") ||
      '<tr><td colspan="6" class="text-center py-8 text-muted text-sm">Tidak ada hasil.</td></tr>';
  }
  admPaginator(total, state, renderAdmBooks, "adm-books-pages");
  lucide.createIcons();
}

function renderAdmBooks_goPage(p) {
  admState.books.page = p;
  renderAdmBooks();
}

function admBooksSearch(v) {
  admState.books.search = v;
  admState.books.page = 1;
  renderAdmBooks();
}

function editBook(id) {
  const b = (getData("books") || []).find((x) => x.id === id);
  if (!b) return;

  safeSet("modal-book-title", "textContent", "Edit Book");
  safeSet("book-id", "value", b.id);
  safeSet("book-title", "value", b.title);
  safeSet("book-author", "value", b.author);
  safeSet("book-genre", "value", b.genre);
  safeSet("book-status", "value", b.status);
  safeSet("book-rating", "value", b.rating);
  safeSet("book-rating-label", "textContent", b.rating);
  safeSet("book-review", "value", b.review);

  openModal("modal-book");
}

async function saveBook() {
  const id = safeGet("book-id")?.value;
  const item = {
    id: id ? parseInt(id) : uid(),
    title: safeGet("book-title")?.value || "",
    author: safeGet("book-author")?.value || "",
    genre: safeGet("book-genre")?.value || "",
    status: safeGet("book-status")?.value || "Sudah Baca",
    rating: parseInt(safeGet("book-rating")?.value || "8"),
    review: safeGet("book-review")?.value || "",
  };

  let list = getData("books") || [];
  if (id) {
    list = list.map((b) => (b.id === parseInt(id) ? item : b));
  } else {
    list.push(item);
  }

  await setData("books", list);
  closeModal("modal-book");
  toast(id ? "Book diperbarui!" : "Book ditambahkan!", "success");
  renderAdmBooks();
  renderMedia();

  // Reset form
  safeSet("book-id", "value", "");
  safeSet("modal-book-title", "textContent", "Tambah Book");
}

// ─────────────────────────────────────────
//  ADMIN: GAMES
// ─────────────────────────────────────────
function renderAdmGames() {
  const state = admState.games;
  const all = applySortAndFilter(
    getData("games") || [],
    state,
    (g) =>
      g.title.toLowerCase().includes(state.search.toLowerCase()) ||
      (g.platform || "").toLowerCase().includes(state.search.toLowerCase()) ||
      (g.genre || "").toLowerCase().includes(state.search.toLowerCase()),
  );
  const total = all.length;
  const { page, perPage } = state;
  const slice = all.slice((page - 1) * perPage, page * perPage);

  const thead = document
    .querySelector("#adm-games-tbody")
    ?.closest("table")
    ?.querySelector("thead tr");
  if (thead) {
    thead.innerHTML =
      thSort("Judul", "title", "games", "renderAdmGames") +
      thSort("Platform", "platform", "games", "renderAdmGames") +
      thSort("Genre", "genre", "games", "renderAdmGames") +
      thSort("Status", "status", "games", "renderAdmGames") +
      thSort("Rating", "rating", "games", "renderAdmGames") +
      `<th class="text-right px-4 py-3 font-mono text-xs text-cyan tracking-widest uppercase">Aksi</th>`;
  }

  const listEl = safeGet("adm-games-tbody");
  if (listEl) {
    listEl.innerHTML =
      slice
        .map(
          (g) => `
      <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
        <td class="px-4 py-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-mint/10 rounded-lg flex items-center justify-center">
              <i data-lucide="${g.icon || "gamepad-2"}" class="w-4 h-4 text-mint"></i>
            </div>
            <p class="font-semibold text-sm">${g.title}</p>
          </div>
        </td>
        <td class="px-4 py-4"><span class="text-xs text-muted">${g.platform}</span></td>
        <td class="px-4 py-4"><span class="text-xs text-muted">${g.genre}</span></td>
        <td class="px-4 py-4"><span class="text-xs px-2 py-0.5 rounded-lg ${g.status === "Sudah Tamat" ? "bg-mint/10 text-mint" : "bg-cyan/10 text-cyan"}">${g.status}</span></td>
        <td class="px-4 py-4">
          <div class="flex items-center gap-2">
            <div class="flex gap-0.5">
              ${Array(10)
                .fill(0)
                .map(
                  (_, i) =>
                    `<span class="w-1.5 h-1.5 rounded-full ${i < g.rating ? "bg-cyan" : "bg-ink4"}"></span>`,
                )
                .join("")}
            </div>
            <span class="text-xs text-muted">${g.rating}/10</span>
          </div>
        </td>
        <td class="px-4 py-4 text-right">
          <div class="flex gap-2 justify-end">
            <button onclick="editGame(${g.id})" class="text-xs bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all"><i data-lucide="pencil" class="w-3 h-3"></i></button>
            <button onclick="deleteItem('games',${g.id})" class="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
          </div>
        </td>
      </tr>`,
        )
        .join("") ||
      '<tr><td colspan="6" class="text-center py-8 text-muted text-sm">Tidak ada hasil.</td></tr>';
  }
  admPaginator(total, state, renderAdmGames, "adm-games-pages");
  lucide.createIcons();
}

function renderAdmGames_goPage(p) {
  admState.games.page = p;
  renderAdmGames();
}

function admGamesSearch(v) {
  admState.games.search = v;
  admState.games.page = 1;
  renderAdmGames();
}

function editGame(id) {
  const g = (getData("games") || []).find((x) => x.id === id);
  if (!g) return;

  safeSet("modal-game-title", "textContent", "Edit Game");
  safeSet("game-id", "value", g.id);
  safeSet("game-title", "value", g.title);
  safeSet("game-platform", "value", g.platform);
  safeSet("game-genre", "value", g.genre);
  safeSet("game-status", "value", g.status);
  safeSet("game-rating", "value", g.rating);
  safeSet("game-rating-label", "textContent", g.rating);
  safeSet("game-icon", "value", g.icon || "gamepad-2");

  openModal("modal-game");
}

async function saveGame() {
  const id = safeGet("game-id")?.value;
  const item = {
    id: id ? parseInt(id) : uid(),
    title: safeGet("game-title")?.value || "",
    platform: safeGet("game-platform")?.value || "",
    genre: safeGet("game-genre")?.value || "",
    status: safeGet("game-status")?.value || "Sudah Tamat",
    rating: parseInt(safeGet("game-rating")?.value || "8"),
    icon: safeGet("game-icon")?.value || "gamepad-2",
  };

  let list = getData("games") || [];
  if (id) {
    list = list.map((g) => (g.id === parseInt(id) ? item : g));
  } else {
    list.push(item);
  }

  await setData("games", list);
  closeModal("modal-game");
  toast(id ? "Game diperbarui!" : "Game ditambahkan!", "success");
  renderAdmGames();
  renderMedia();

  // Reset form
  safeSet("game-id", "value", "");
  safeSet("modal-game-title", "textContent", "Tambah Game");
}

// ─────────────────────────────────────────
//  DELETE ITEM (UNIVERSAL)
// ─────────────────────────────────────────
async function deleteItem(collection, id) {
  showConfirm(async () => {
    let list = getData(collection) || [];
    list = list.filter((item) => item.id !== id);
    await setData(collection, list);
    toast("Data berhasil dihapus!", "success");

    // Re-render based on collection
    const renderMap = {
      projects: () => {
        renderAdmProjects();
        renderDashboard();
        renderProjects();
        renderTechDonutChart();
      },
      skills: () => {
        renderAdmSkills();
        renderDashboard();
        renderAbout();
        renderSkillsRadarChart();
        renderSkillCategoryChart();
      },
      experience: () => {
        renderAdmExp();
        renderDashboard();
        renderAbout();
      },
      films: () => {
        renderAdmFilms();
        renderMedia();
        renderGenreChart();
      },
      music: () => {
        renderAdmMusic();
        renderMedia();
        renderMoodChart();
      },
      books: () => {
        renderAdmBooks();
        renderMedia();
      },
      games: () => {
        renderAdmGames();
        renderMedia();
      },
    };
    if (renderMap[collection]) renderMap[collection]();
  });
}

// ── Reset all ──
async function resetAllData() {
  showConfirm(async () => {
    for (const key of Object.keys(DEFAULTS)) {
      await setData(key, DEFAULTS[key]);
    }
    toast("Semua data direset ke default.", "info");
    renderAdminOverview();
    renderDashboard();
    renderProjects();
    renderAbout();
    renderMedia();
    renderContact();
  });
}

// ─────────────────────────────────────────
//  CONTACT FORM SUBMISSION WITH SECURITY
// ─────────────────────────────────────────

/**
 * Check if device has sent message today
 */
function canSendMessage() {
  const lastSent = localStorage.getItem("lastMessageSent");
  if (!lastSent) return true;

  const lastDate = new Date(lastSent);
  const today = new Date();

  // Reset jika hari berbeda
  if (
    lastDate.getDate() !== today.getDate() ||
    lastDate.getMonth() !== today.getMonth() ||
    lastDate.getFullYear() !== today.getFullYear()
  ) {
    return true;
  }

  return false;
}

/**
 * Get remaining time until can send again
 */
function getTimeUntilReset() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const diff = tomorrow - now;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours} jam ${minutes} menit`;
}

/**
 * Sanitize input untuk mencegah XSS
 */
function sanitizeInput(input) {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Detect spam patterns
 */
function containsSpam(text) {
  const spamPatterns = [
    /\b(viagra|cialis|casino|lottery|winner)\b/i,
    /https?:\/\/[^\s]+/gi, // Multiple URLs
    /(.)\1{10,}/, // Repeated characters
  ];

  return spamPatterns.some((pattern) => pattern.test(text));
}

async function submitContact() {
  console.log("🚀 submitContact() called");

  // 1. Check honeypot field (hidden field untuk menangkap bot)
  const honeypot = safeGet("form-website")?.value || "";
  if (honeypot) {
    console.warn("Bot detected via honeypot");
    toast("Pesan berhasil dikirim!", "success"); // Fake success untuk bot
    return;
  }

  // 2. Get and validate inputs
  const nameRaw = safeGet("form-name")?.value || "";
  const emailRaw = safeGet("form-email")?.value || "";
  const messageRaw = safeGet("form-msg")?.value || "";

  console.log("📝 Input values:", {
    name: nameRaw,
    email: emailRaw,
    messageLength: messageRaw.length,
  });

  if (!nameRaw || !emailRaw || !messageRaw) {
    console.log("Empty fields detected");
    toast("Harap isi semua field!", "error");
    return;
  }

  // 3. Sanitize inputs
  const name = sanitizeInput(nameRaw.trim());
  const email = sanitizeInput(emailRaw.trim().toLowerCase());
  const message = sanitizeInput(messageRaw.trim());

  // 4. Validate email
  if (!isValidEmail(email)) {
    console.log("Invalid email format:", email);
    toast("Format email tidak valid!", "error");
    return;
  }

  // 5. Check length
  if (name.length < 2 || name.length > 100) {
    console.log("Invalid name length:", name.length);
    toast("Nama harus 2-100 karakter!", "error");
    return;
  }

  if (message.length < 10 || message.length > 1000) {
    console.log("Invalid message length:", message.length);
    toast("Pesan harus 10-1000 karakter!", "error");
    return;
  }

  // 6. Spam detection
  if (containsSpam(message) || containsSpam(name)) {
    console.log("Spam detected");
    toast("Pesan terdeteksi sebagai spam!", "error");
    return;
  }

  // 7. Rate limiting check (setelah validasi)
  const canSend = canSendMessage();
  console.log("⏰ Rate limit check:", canSend);

  if (!canSend) {
    const timeLeft = getTimeUntilReset();
    console.log("⏳ Rate limited. Time left:", timeLeft);
    toast(
      `⏳ Anda sudah mengirim pesan hari ini. Coba lagi dalam ${timeLeft}`,
      "error",
    );
    return;
  }

  // 8. Prepare data
  const messageData = {
    id: uid(),
    name,
    email,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    device: navigator.userAgent.substring(0, 100), // Track device
  };

  console.log("📦 Message data prepared:", messageData);

  try {
    console.log("💾 Saving to Firebase...");

    // Set rate limit SEBELUM mengirim data untuk mencegah double submission
    localStorage.setItem("lastMessageSent", new Date().toISOString());
    console.log("localStorage set");

    const result = await addFirebaseData("messages", messageData);
    console.log("📡 Firebase result:", result);

    if (result.success) {
      console.log("Message saved successfully with ID:", result.id);

      // Clear form
      safeSet("form-name", "value", "");
      safeSet("form-email", "value", "");
      safeSet("form-msg", "value", "");

      toast("Pesan berhasil dikirim!", "success");
    } else {
      throw new Error(result.error || "Failed to save message");
    }
  } catch (error) {
    console.error("Error submitting contact:", error);
    // Hapus localStorage jika gagal kirim
    localStorage.removeItem("lastMessageSent");
    console.log("🔄 localStorage cleared due to error");
    toast("Gagal mengirim pesan. Coba lagi!", "error");
  }
}

/**
 * Send message via WhatsApp
 */
function sendViaWhatsApp() {
  // Get form values
  const name = safeGet("form-name")?.value || "";
  const email = safeGet("form-email")?.value || "";
  const message = safeGet("form-msg")?.value || "";

  if (!name || !email || !message) {
    toast("Harap isi semua field!", "error");
    return;
  }

  // Format WhatsApp message
  const waMessage = `*Pesan dari Portfolio Website*\n\n*Nama:* ${name}\n*Email:* ${email}\n\n*Pesan:*\n${message}`;

  // GANTI DENGAN NOMOR WHATSAPP ANDA (format: 62xxx tanpa +)
  const phoneNumber = "6285700391890"; // ⚠️ UBAH INI!

  // Encode message untuk URL
  const encodedMessage = encodeURIComponent(waMessage);

  // Buka WhatsApp
  const waUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(waUrl, "_blank");

  // Optional: Clear form setelah redirect
  setTimeout(() => {
    safeSet("form-name", "value", "");
    safeSet("form-email", "value", "");
    safeSet("form-msg", "value", "");
  }, 500);
}

// ─────────────────────────────────────────
//  MODUL AJAR (PDF FILES)
// ─────────────────────────────────────────
/**
 * Scan folder assets/file/ untuk mendapatkan daftar PDF
 */
async function loadModulFiles() {
  try {
    // Daftar file PDF yang ada di folder assets/file/
    const possibleFiles = [];
    const kelasList = ["11 PPLG 1", "11 PPLG 2"];

    for (const kelas of kelasList) {
      for (let i = 1; i <= 4; i++) {
        possibleFiles.push(`Modul ${i} - ${kelas}.pdf`);
      }
    }

    console.log("Possible modul files to check:", possibleFiles);
    const existingFiles = [];

    for (const filename of possibleFiles) {
      try {
        const response = await fetch(`assets/file/${filename}`, {
          method: "HEAD",
        });
        if (response.ok) {
          const size = response.headers.get("content-length");
          existingFiles.push({
            name: filename,
            path: `assets/file/${filename}`,
            size: size ? formatFileSize(parseInt(size)) : "Unknown",
          });
        }
      } catch (e) {
        // File doesn't exist, skip
        console.log(`File not found: ${filename}`);
      }
    }

    FIREBASE_CACHE.modulFiles = existingFiles;
    return existingFiles;
  } catch (error) {
    console.error("Error loading modul files:", error);
    return [];
  }
}
/**
 * Format file size dari bytes ke KB/MB
 */
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Search modul files
 */
const searchModulFiles = debounce((searchTerm) => {
  const tbody = document.getElementById("adm-modul-tbody");
  const emptyDiv = document.getElementById("modul-empty");

  if (!tbody) return;

  const files = FIREBASE_CACHE.modulFiles;
  const filtered =
    searchTerm.trim() === ""
      ? files
      : files.filter((file) =>
          file.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );

  if (filtered.length === 0) {
    tbody.innerHTML = "";
    if (emptyDiv) {
      emptyDiv.classList.remove("hidden");
      emptyDiv.querySelector("p").textContent = searchTerm
        ? `Tidak ada file yang cocok dengan "${searchTerm}"`
        : "Belum ada file modul ajar.";
    }
    return;
  }

  if (emptyDiv) emptyDiv.classList.add("hidden");
  renderModulTable(filtered);
}, 300);

/**
 * Sort modul files
 */
let currentSortOrder = { field: "name", ascending: true };

function sortModulFiles(field) {
  const files = [...FIREBASE_CACHE.modulFiles];

  // Toggle sort order if clicking same field
  if (currentSortOrder.field === field) {
    currentSortOrder.ascending = !currentSortOrder.ascending;
  } else {
    currentSortOrder.field = field;
    currentSortOrder.ascending = true;
  }

  files.sort((a, b) => {
    let compareA, compareB;

    if (field === "name") {
      compareA = a.name.toLowerCase();
      compareB = b.name.toLowerCase();
    } else if (field === "size") {
      // Convert size string to bytes for comparison
      compareA = parseSizeToBytes(a.size);
      compareB = parseSizeToBytes(b.size);
    }

    if (currentSortOrder.ascending) {
      return compareA > compareB ? 1 : -1;
    } else {
      return compareA < compareB ? 1 : -1;
    }
  });

  renderModulTable(files);

  // Visual feedback
  toast(
    `Diurutkan berdasarkan ${field} (${currentSortOrder.ascending ? "A-Z" : "Z-A"})`,
    "info",
  );
}

/**
 * Parse size string to bytes for comparison
 */
function parseSizeToBytes(sizeStr) {
  const units = { Bytes: 1, KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
  const match = sizeStr.match(/^([\d.]+)\s*(\w+)$/);
  if (!match) return 0;
  return parseFloat(match[1]) * (units[match[2]] || 1);
}

/**
 * Render modul table with given files array
 */
function renderModulTable(files) {
  const tbody = document.getElementById("adm-modul-tbody");
  if (!tbody) return;

  tbody.innerHTML = files
    .map(
      (file, index) => `
    <tr class="border-t border-white/5 hover:bg-white/3 transition-all">
      <td class="px-4 py-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <i data-lucide="file-text" class="w-4 h-4 text-red-400"></i>
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-medium text-sm truncate">${file.name}</p>
            <p class="text-xs text-muted">${file.path}</p>
          </div>
        </div>
      </td>
      <td class="px-4 py-4 text-sm text-muted hidden md:table-cell">
        ${file.size}
      </td>
      <td class="px-4 py-4">
        <div class="flex items-center justify-end gap-2">
          <button
            onclick="viewPDF('${file.path}')"
            class="flex items-center gap-1.5 text-xs bg-cyan/10 text-cyan border border-cyan/30 px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all"
            title="Lihat PDF"
          >
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
            <span class="hidden sm:inline">Lihat</span>
          </button>
          <button
            onclick="downloadPDF('${file.path}', '${file.name}')"
            class="flex items-center gap-1.5 text-xs bg-mint/10 text-mint border border-mint/30 px-3 py-1.5 rounded-lg hover:bg-mint/20 transition-all"
            title="Download PDF"
          >
            <i data-lucide="download" class="w-3.5 h-3.5"></i>
            <span class="hidden sm:inline">Download</span>
          </button>
        </div>
      </td>
    </tr>
  `,
    )
    .join("");

  lucide.createIcons();
}

/**
 * Render daftar modul ajar di admin panel
 */
async function renderAdminModul() {
  const tbody = document.getElementById("adm-modul-tbody");
  const emptyDiv = document.getElementById("modul-empty");

  if (!tbody) return;

  // Sync toggle state dengan data dari cache
  syncModulVisibilityToggle();

  await loadModulFiles();
  const files = FIREBASE_CACHE.modulFiles;

  if (files.length === 0) {
    tbody.innerHTML = "";
    if (emptyDiv) emptyDiv.classList.remove("hidden");
    return;
  }

  if (emptyDiv) emptyDiv.classList.add("hidden");

  // Use renderModulTable helper
  renderModulTable(files);
}

/**
 * View PDF in new tab
 */
function viewPDF(path) {
  window.open(path, "_blank");
}

/**
 * Download PDF file
 */
async function downloadPDF(path, filename) {
  try {
    const response = await fetch(path);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast("File berhasil didownload", "success");
  } catch (error) {
    console.error("Error downloading PDF:", error);
    toast("Gagal mendownload file", "error");
  }
}

/**
 * Refresh daftar modul
 */
async function refreshModulList() {
  toast("Memuat ulang daftar modul...", "info");
  await renderAdminModul();
  toast("Daftar modul berhasil dimuat ulang", "success");
}

// ─────────────────────────────────────────
//  ADMIN: MESSAGES FUNCTIONS
// ─────────────────────────────────────────
async function clearMessages() {
  showConfirm(async () => {
    try {
      await clearCollection("messages");
      toast("Semua pesan berhasil dihapus!", "success");
      renderAdminMessages();
    } catch (error) {
      console.error("Error clearing messages:", error);
      toast("Gagal menghapus pesan", "error");
    }
  });
}

async function viewMessage(docId) {
  try {
    const message = await getDocumentById("messages", docId);
    if (!message) {
      toast("Pesan tidak ditemukan", "error");
      return;
    }

    // Show message in modal
    const formattedDate = new Date(message.timestamp).toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "short",
    });

    const messageHTML = `
      <div class="space-y-3">
        <div>
          <p class="text-xs text-muted mb-1">Dari:</p>
          <p class="font-medium">${message.name}</p>
          <p class="text-sm text-cyan">${message.email}</p>
        </div>
        <div>
          <p class="text-xs text-muted mb-1">Tanggal:</p>
          <p class="text-sm">${formattedDate}</p>
        </div>
        <div>
          <p class="text-xs text-muted mb-1">Pesan:</p>
          <p class="text-sm leading-relaxed">${message.message}</p>
        </div>
      </div>
    `;

    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm";
    modal.innerHTML = `
      <div class="bg-ink2 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-mono font-bold text-xl">Detail Pesan</h3>
          <button onclick="this.closest('.fixed').remove()" class="text-muted hover:text-cyan transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
        ${messageHTML}
        <button 
          onclick="this.closest('.fixed').remove()" 
          class="w-full mt-6 bg-cyan/10 text-cyan px-4 py-2.5 rounded-xl hover:bg-cyan/20 transition-all font-medium text-sm"
        >
          Tutup
        </button>
      </div>
    `;

    document.body.appendChild(modal);
    lucide.createIcons();

    // Mark as read - update menggunakan docId langsung
    if (!message.read) {
      try {
        // Update document langsung menggunakan docId
        const docRef = doc(db, "messages", docId);
        await updateDoc(docRef, { read: true });
        renderAdminMessages();
      } catch (updateError) {
        console.error("Error marking message as read:", updateError);
      }
    }
  } catch (error) {
    console.error("Error viewing message:", error);
    toast("Gagal membuka pesan", "error");
  }
}

// ─────────────────────────────────────────
//  MODUL AJAR - USER INFO MODAL
// ─────────────────────────────────────────
/**
 * Buka modal input nama dan kelas untuk akses modul ajar
 */
function openModulUserModal() {
  openModal("modal-modul-user");

  // Cek apakah sudah ada data user di session (yang belum expired)
  const savedUserData = getSessionWithExpiry("modulUserInfo");

  if (savedUserData && savedUserData.name && savedUserData.class) {
    // Auto-fill dengan data yang tersimpan
    safeSet("modul-user-name", "value", savedUserData.name);
    safeSet("modul-user-class", "value", savedUserData.class);
  } else {
    // Reset form jika tidak ada data atau expired
    safeSet("modul-user-name", "value", "");
    safeSet("modul-user-class", "value", "");
  }

  lucide.createIcons();
}

/**
 * Sync toggle visibility dengan state dari cache
 */
function syncModulVisibilityToggle() {
  const toggle = safeGet("modul-visibility-toggle");
  const label = safeGet("modul-visibility-label");

  if (!toggle) return;

  const isVisible = FIREBASE_CACHE.settings?.modulVisible ?? true;
  toggle.checked = isVisible;

  if (label) {
    label.innerHTML = isVisible
      ? '<span class="text-mint font-semibold">Aktif</span>'
      : '<span class="text-muted">Nonaktif</span>';
  }

  // Update menu visibility
  updateModulMenuVisibility(isVisible);
}

/**
 * Toggle visibility menu modul ajar
 */
async function toggleModulVisibility(isVisible) {
  try {
    // Update cache
    FIREBASE_CACHE.settings.modulVisible = isVisible;

    // Save to Firebase
    await setFirebaseData("settings", "main", FIREBASE_CACHE.settings);

    // Update label
    const label = safeGet("modul-visibility-label");
    if (label) {
      label.innerHTML = isVisible
        ? '<span class="text-mint font-semibold">Aktif</span>'
        : '<span class="text-muted">Nonaktif</span>';
    }

    // Update menu visibility
    updateModulMenuVisibility(isVisible);

    // Show notification
    if (window.showToast) {
      showToast(
        `Menu Modul Ajar ${isVisible ? "ditampilkan" : "disembunyikan"} di landing page`,
        "success",
      );
    } else {
      toast(
        `Menu Modul Ajar ${isVisible ? "ditampilkan" : "disembunyikan"}`,
        "success",
      );
    }

    console.log(`✅ Modul visibility updated: ${isVisible}`);
  } catch (error) {
    console.error("Error updating modul visibility:", error);
    toast("Gagal mengupdate visibilitas menu", "error");
  }
}

/**
 * Update visibility menu modul di navbar
 */
function updateModulMenuVisibility(isVisible) {
  const desktopMenu = safeGet("nav-modul-menu");
  const mobileMenu = safeGet("mobile-nav-modul-menu");

  if (isVisible) {
    if (desktopMenu) desktopMenu.classList.remove("hidden");
    if (mobileMenu) mobileMenu.classList.remove("hidden");
  } else {
    if (desktopMenu) desktopMenu.classList.add("hidden");
    if (mobileMenu) mobileMenu.classList.add("hidden");
  }
}

/**
 * Submit info user dan navigasi ke halaman modul
 */
function submitModulUserInfo() {
  const name = safeGet("modul-user-name")?.value?.trim();
  const userClass = safeGet("modul-user-class")?.value?.trim();

  // Validasi
  if (!name) {
    toast("Nama tidak boleh kosong", "error");
    return;
  }

  if (!userClass) {
    toast("Silakan pilih kelas", "error");
    return;
  }

  // Simpan info user ke state
  MODUL_USER_INFO.name = name;
  MODUL_USER_INFO.class = userClass;

  // Simpan ke sessionStorage dengan expiry 8 jam
  setSessionWithExpiry("modulUserInfo", {
    name: name,
    class: userClass,
  });

  console.log("✅ User data saved to sessionStorage (expires in 8 hours)");

  // Tutup modal
  closeModal("modal-modul-user");

  // Navigasi ke halaman modul dan render dengan filter
  navigate("modul");

  // Tampilkan notifikasi selamat datang
  toast(`Selamat datang, ${name} (${userClass})!`, "success");
}

// ─────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  await initData();
  AOS.init({ duration: 600, once: true, offset: 40 });
  lucide.createIcons();
  renderDashboard();
  renderFooter();
  updateAdminBtn();

  // Admin login on Enter key
  ["admin-username", "admin-password"].forEach((id) => {
    const el = document.getElementById(id);
    if (el)
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter") doAdminLogin();
      });
  });

  // Confirm dialog ok button
  const confirmOkBtn = document.getElementById("confirm-ok-btn");
  if (confirmOkBtn) {
    confirmOkBtn.addEventListener("click", () => {
      if (_confirmCb) {
        _confirmCb();
        closeConfirm();
      }
    });
  }

  // Close modals with overlay click
  document.querySelectorAll(".modal-wrap").forEach((m) => {
    m.addEventListener("click", (e) => {
      if (e.target === m) m.classList.remove("open");
    });
  });

  // Close modals with Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape")
      document
        .querySelectorAll(".modal-wrap.open")
        .forEach((m) => m.classList.remove("open"));
  });
});

// ─────────────────────────────────────────
//  ADMIN SIDEBAR TOGGLE (MOBILE)
// ─────────────────────────────────────────
function toggleAdminSidebar() {
  const sidebar = document.getElementById("admin-sidebar");
  const overlay = document.getElementById("admin-sidebar-overlay");
  const toggleBtn = document.getElementById("admin-sidebar-toggle");

  if (!sidebar) return;

  const isOpen = sidebar.classList.contains("translate-x-0");

  if (isOpen) {
    sidebar.classList.remove("translate-x-0");
    sidebar.classList.add("-translate-x-full");
    if (overlay) {
      overlay.classList.remove("opacity-100", "pointer-events-auto");
      overlay.classList.add("opacity-0", "pointer-events-none");
    }
    if (toggleBtn) toggleBtn.classList.remove("hidden"); // tampilkan toggle
    document.body.style.overflow = "";
  } else {
    sidebar.classList.remove("-translate-x-full");
    sidebar.classList.add("translate-x-0");
    if (overlay) {
      overlay.classList.remove("opacity-0", "pointer-events-none");
      overlay.classList.add("opacity-100", "pointer-events-auto");
    }
    if (toggleBtn) toggleBtn.classList.add("hidden"); // sembunyikan toggle
    document.body.style.overflow = "hidden";
  }
}

function closeAdminSidebar() {
  const sidebar = document.getElementById("admin-sidebar");
  const overlay = document.getElementById("admin-sidebar-overlay");
  const toggleBtn = document.getElementById("admin-sidebar-toggle");

  if (sidebar) {
    sidebar.classList.remove("translate-x-0");
    sidebar.classList.add("-translate-x-full");
  }
  if (overlay) {
    overlay.classList.remove("opacity-100", "pointer-events-auto");
    overlay.classList.add("opacity-0", "pointer-events-none");
  }
  if (toggleBtn) toggleBtn.classList.remove("hidden"); // tampilkan toggle kembali
  document.body.style.overflow = "";
}

// Export functions ke global scope untuk onclick handlers
window.navigate = navigate;
window.navigateTo = navigate; // Alias untuk kompatibilitas dengan onclick di HTML
window.toggleMobile = toggleMobile;
window.closeMobileMenu = closeMobileMenu;
window.isMobileMenuOpen = isMobileMenuOpen;
window.admSort = admSort;
window.toggleAdminSidebar = toggleAdminSidebar;
window.closeAdminSidebar = closeAdminSidebar;
window.openAdminLogin = openAdminLogin;
window.closeAdminLogin = closeAdminLogin;
window.doAdminLogin = doAdminLogin;
window.doAdminLogout = doAdminLogout;
window.openModal = openModal;
window.closeModal = closeModal;
window.resetProjectForm = resetProjectForm;
window.resetSkillForm = resetSkillForm;
window.resetExpForm = resetExpForm;
window.resetFilmForm = resetFilmForm;
window.resetMusicForm = resetMusicForm;
window.resetBookForm = resetBookForm;
window.resetGameForm = resetGameForm;
window.showConfirm = showConfirm;
window.closeConfirm = closeConfirm;
window.sortMedia = sortMedia;
window.showAdminSection = showAdminSection;
window.adminTab = adminTab;
window.saveProfile = saveProfile;
window.editProject = editProject;
window.saveProject = saveProject;
window.renderAdmProjects_goPage = renderAdmProjects_goPage;
window.admProjectsSearch = admProjectsSearch;
window.editSkill = editSkill;
window.saveSkill = saveSkill;
window.renderAdmSkills_goPage = renderAdmSkills_goPage;
window.admSkillsSearch = admSkillsSearch;
window.editExp = editExp;
window.saveExp = saveExp;
window.renderAdmExp_goPage = renderAdmExp_goPage;
window.admExpSearch = admExpSearch;
window.editFilm = editFilm;
window.saveFilm = saveFilm;
window.renderAdmFilms_goPage = renderAdmFilms_goPage;
window.admFilmsSearch = admFilmsSearch;
window.editMusic = editMusic;
window.saveMusic = saveMusic;
window.renderAdmMusic_goPage = renderAdmMusic_goPage;
window.admMusicSearch = admMusicSearch;
window.editBook = editBook;
window.saveBook = saveBook;
window.renderAdmBooks_goPage = renderAdmBooks_goPage;
window.admBooksSearch = admBooksSearch;
window.editGame = editGame;
window.saveGame = saveGame;
window.renderAdmGames_goPage = renderAdmGames_goPage;
window.admGamesSearch = admGamesSearch;
window.deleteItem = deleteItem;
window.resetAllData = resetAllData;
window.submitContact = submitContact;
window.sendViaWhatsApp = sendViaWhatsApp;
window.clearMessages = clearMessages;
window.viewMessage = viewMessage;
window.renderAdmProjects = renderAdmProjects;
window.renderAdmSkills = renderAdmSkills;
window.renderAdmExp = renderAdmExp;
window.renderAdmFilms = renderAdmFilms;
window.renderAdmMusic = renderAdmMusic;
window.renderAdmBooks = renderAdmBooks;
window.renderAdmGames = renderAdmGames;
window.renderAdminModul = renderAdminModul;
window.refreshModulList = refreshModulList;
window.viewPDF = viewPDF;
window.downloadPDF = downloadPDF;
window.openModulUserModal = openModulUserModal;
window.submitModulUserInfo = submitModulUserInfo;
window.toggleModulVisibility = toggleModulVisibility;
window.syncModulVisibilityToggle = syncModulVisibilityToggle;
window.updateModulMenuVisibility = updateModulMenuVisibility;
window.searchModulFiles = searchModulFiles;
window.sortModulFiles = sortModulFiles;

// ─────────────────────────────────────────
//  EVENT LISTENERS SETUP
// ─────────────────────────────────────────
// Setup event listeners setelah DOM loaded
document.addEventListener("DOMContentLoaded", () => {
  // Hamburger menu toggle
  const hamBtn = document.getElementById("ham-btn");
  if (hamBtn) {
    hamBtn.addEventListener("click", toggleMobile);
  }

  // Admin sidebar toggle button
  const adminToggleBtn = document.getElementById("admin-sidebar-toggle");
  if (adminToggleBtn) {
    adminToggleBtn.addEventListener("click", toggleAdminSidebar);
  }

  // Admin sidebar overlay close
  const adminOverlay = document.getElementById("admin-sidebar-overlay");
  if (adminOverlay) {
    adminOverlay.addEventListener("click", closeAdminSidebar);
  }

  // Mobile menu links - close menu when clicked
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      // Close mobile menu immediately when any link is clicked
      closeMobileMenu();
    });
  });
});
