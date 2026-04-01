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
} from "./firebase-service.js";

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
  blogs: [],
};

let CACHE_LOADED = false;

// Chart instances untuk destroy sebelum recreate
let chartInstances = {
  radarChart: null,
  activityChart: null,
  techDonutChart: null,
  skillCategoryChart: null,
  genreChart: null,
  moodChart: null,
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
      id: 2,
      title: "Blog CMS",
      desc: "Sistem manajemen konten blog dengan editor WYSIWYG dan manajemen tag.",
      tech: "Laravel, Vue.js, MySQL",
      status: "Selesai",
      featured: true,
      link: "#",
      github: "#",
      image: "📝",
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
      comment: "Mind-bending masterpiece!",
    },
    {
      id: 2,
      title: "The Shawshank Redemption",
      genre: "Drama",
      year: 1994,
      rating: 10,
      comment: "Hope is a good thing.",
    },
    {
      id: 3,
      title: "Interstellar",
      genre: "Sci-Fi",
      year: 2014,
      rating: 9,
      comment: "Love transcends dimensions.",
    },
    {
      id: 4,
      title: "Parasite",
      genre: "Thriller",
      year: 2019,
      rating: 10,
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
  blogs: [
    {
      id: 1,
      title: "Memulai dengan React Hooks",
      category: "Tutorial",
      emoji: "⚛️",
      summary: "Panduan lengkap untuk memahami React Hooks dari dasar.",
      content:
        "React Hooks adalah cara baru untuk menggunakan state dan lifecycle di functional components...",
      tags: "react, hooks, javascript",
      date: "2024-01-15",
    },
    {
      id: 2,
      title: "Tips Produktivitas Developer",
      category: "Tips",
      emoji: "💡",
      summary: "10 tips untuk meningkatkan produktivitas sebagai developer.",
      content:
        "Produktivitas adalah kunci kesuksesan developer. Berikut adalah tips yang saya gunakan...",
      tags: "productivity, tips, developer",
      date: "2024-01-10",
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
    FIREBASE_CACHE.blogs = await getFirebaseData("blogs");
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
    if (!FIREBASE_CACHE.blogs.length) FIREBASE_CACHE.blogs = DEFAULTS.blogs;
    // Profile adalah object, cek dengan !FIREBASE_CACHE.profile atau field yang wajib ada
    if (!FIREBASE_CACHE.profile || !FIREBASE_CACHE.profile.name)
      FIREBASE_CACHE.profile = DEFAULTS.profile;

    CACHE_LOADED = true;
    console.log("✅ Firebase data loaded successfully:", FIREBASE_CACHE);
  } catch (error) {
    console.error("❌ Error loading Firebase data:", error);
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

    console.log(`✅ Data '${key}' saved to Firebase`);
    return true;
  } catch (error) {
    console.error(`❌ Error saving '${key}' to Firebase:`, error);
    return false;
  }
}

// ─────────────────────────────────────────
//  NAVIGATION & UI
// ─────────────────────────────────────────
function navigate(pageName) {
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

  // Mobile nav close
  const mobileNav = safeGet("mobile-nav");
  if (mobileNav) mobileNav.classList.remove("open");

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
    renderMoodChart();
  } else if (pageName === "blog") {
    renderBlog();
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
  const dashBtn = safeGet("dashboard-nav-btn");
  const dashBtnMob = safeGet("dashboard-nav-btn-mob");

  if (isAdmin()) {
    if (loginBtn) loginBtn.style.display = "none";

    if (dashBtn) dashBtn.classList.remove("hidden");
    if (dashBtnMob) dashBtnMob.classList.remove("hidden");
  } else {
    if (loginBtn) loginBtn.style.display = "";

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
  const blogs = getData("blogs") || [];
  console.log("profile:", profile.name);
  // Intro - with null checks
  safeSet("hero-avatar-display", "textContent", profile.avatar || "👨‍💻");
  safeSet("hero-name-display", "textContent", profile.name);
  safeSet("hero-role-display", "textContent", profile.role);
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

  // Quick Stats
  const completedProjects = projects.filter(
    (p) => p.status === "Selesai",
  ).length;
  safeSet("stat-projects", "textContent", completedProjects);
  safeSet("stat-skills", "textContent", skills.length);
  safeSet("stat-exp", "textContent", exp.length + "+");
  safeSet("stat-blogs", "textContent", blogs.length);

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
              backgroundColor: "rgba(119, 202, 237, 0.2)",
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
            <span class="text-3xl">${p.image || "📁"}</span>
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
          <span class="text-3xl">${p.image || "📁"}</span>
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
          <span class="text-xs text-muted">${s.level}%</span>
        </div>
        <div class="w-full bg-ink3 rounded-full h-2 overflow-hidden">
          <div class="bg-gradient-to-r from-cyan to-mint h-full rounded-full transition-all duration-700" style="width:${s.level}%"></div>
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
//  RENDER: MEDIA (Selera Saya)
// ─────────────────────────────────────────
function renderMedia() {
  const films = getData("films") || [];
  const music = getData("music") || [];
  const books = getData("books") || [];
  const games = getData("games") || [];

  // Films Table
  const filmsTbodyEl = safeGet("films-tbody");
  const filmsEmptyEl = safeGet("films-empty");

  if (films.length === 0) {
    if (filmsTbodyEl) filmsTbodyEl.innerHTML = "";
    if (filmsEmptyEl) filmsEmptyEl.classList.remove("hidden");
  } else {
    if (filmsEmptyEl) filmsEmptyEl.classList.add("hidden");
    if (filmsTbodyEl) {
      filmsTbodyEl.innerHTML = films
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
          <td class="px-5 py-4 text-dim italic text-xs">"${f.comment}"</td>
        </tr>`,
        )
        .join("");
    }
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
      musicGridEl.innerHTML = music
        .map(
          (m) => `
        <div class="bg-ink2 rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all">
          <div class="flex items-start gap-4 mb-3">
            <div class="w-12 h-12 bg-gradient-to-br from-cyan/20 to-mint/20 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
              ${m.emoji}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-sm mb-0.5 truncate">${m.title}</p>
              <p class="text-xs text-muted truncate">${m.artist}</p>
            </div>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="text-dim">${m.genre}</span>
            <span class="px-2 py-1 bg-ink3 text-muted rounded-lg">${m.mood}</span>
          </div>
        </div>`,
        )
        .join("");
    }
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
      booksGridEl.innerHTML = books
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

  // Games Grid
  const gamesGridEl = safeGet("games-grid");
  const gamesEmptyEl = safeGet("games-empty");

  if (games.length === 0) {
    if (gamesGridEl) gamesGridEl.innerHTML = "";
    if (gamesEmptyEl) gamesEmptyEl.classList.remove("hidden");
  } else {
    if (gamesEmptyEl) gamesEmptyEl.classList.add("hidden");
    if (gamesGridEl) {
      gamesGridEl.innerHTML = games
        .map(
          (g) => `
        <div class="bg-ink2 rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all">
          <div class="flex items-start gap-3 mb-3">
            <div class="text-3xl flex-shrink-0">${g.emoji}</div>
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
}

// ─────────────────────────────────────────
//  RENDER: BLOG
// ─────────────────────────────────────────
function renderBlog() {
  const blogs = getData("blogs") || [];

  const blogGridEl = safeGet("blog-grid");
  const blogEmptyEl = safeGet("blog-empty");

  if (blogs.length === 0) {
    if (blogGridEl) blogGridEl.innerHTML = "";
    if (blogEmptyEl) blogEmptyEl.classList.remove("hidden");
    return;
  }

  if (blogEmptyEl) blogEmptyEl.classList.add("hidden");

  if (blogGridEl) {
    blogGridEl.innerHTML = blogs
      .map(
        (b) => `
      <div class="bg-ink2 rounded-2xl border border-white/5 p-6 hover:border-cyan/30 transition-all group" data-aos="fade-up">
        <div class="flex items-start gap-4 mb-4">
          <span class="text-3xl flex-shrink-0">${b.emoji}</span>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-muted mb-1">${b.category} · ${b.date || "2024"}</p>
            <h3 class="font-mono font-bold text-base mb-2 group-hover:text-cyan transition-colors">${b.title}</h3>
            <p class="text-sm text-dim leading-relaxed">${b.summary}</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-1.5 mb-3">
          ${b.tags
            .split(",")
            .map(
              (tag) =>
                `<span class="text-xs bg-ink3 px-2 py-1 rounded-lg text-muted">${tag.trim()}</span>`,
            )
            .join("")}
        </div>
        <button onclick="showBlogDetail(${b.id})" class="text-xs text-cyan hover:underline flex items-center gap-1">
          Baca selengkapnya <i data-lucide="arrow-right" class="w-3 h-3"></i>
        </button>
      </div>`,
      )
      .join("");
  }

  lucide.createIcons();
}

window.showBlogDetail = function (id) {
  const blog = (getData("blogs") || []).find((b) => b.id === id);
  if (!blog) return;

  // Simple alert for now - bisa diganti dengan modal detail nanti
  alert(`${blog.title}\n\n${blog.content}`);
};

// ─────────────────────────────────────────
//  RENDER: CONTACT
// ─────────────────────────────────────────
function renderContact() {
  const profile = getData("profile");
  if (!profile) return; // ← guard jika profile belum loaded
  console.log("Rendering contact with profile:", profile);

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
  projects: { page: 1, perPage: 5, search: "" },
  skills: { page: 1, perPage: 10, search: "" },
  experience: { page: 1, perPage: 5, search: "" },
  films: { page: 1, perPage: 5, search: "" },
  music: { page: 1, perPage: 5, search: "" },
  books: { page: 1, perPage: 6, search: "" },
  games: { page: 1, perPage: 6, search: "" },
  blogs: { page: 1, perPage: 5, search: "" },
};

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
  else if (section === "blogs") renderAdmBlog();

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
  else if (tab === "blog-a") renderAdmBlog();
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
  const blogs =
    FIREBASE_CACHE.blogs.length > 0
      ? FIREBASE_CACHE.blogs
      : await getData("blogs");

  // Update stats
  safeSet("ov-projects", "textContent", projects.length);
  safeSet("ov-skills", "textContent", skills.length);
  safeSet("ov-films", "textContent", films.length);
  safeSet("ov-blogs", "textContent", blogs.length);

  // Create storage chart
  renderStorageChart(
    projects.length,
    skills.length,
    films.length,
    blogs.length,
  );
}

function renderStorageChart(
  projectsCount,
  skillsCount,
  filmsCount,
  blogsCount,
) {
  const ctx = document.getElementById("storageChart");
  if (!ctx) return;

  // Destroy existing chart if exists
  if (chartInstances.storageChart) {
    chartInstances.storageChart.destroy();
  }

  chartInstances.storageChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Projects", "Skills", "Films", "Blogs"],
      datasets: [
        {
          data: [projectsCount, skillsCount, filmsCount, blogsCount],
          backgroundColor: [
            "rgba(119, 202, 237, 0.7)",
            "rgba(120, 250, 185, 0.7)",
            "rgba(250, 204, 21, 0.7)",
            "rgba(167, 139, 250, 0.7)",
          ],
          borderColor: [
            "rgba(119, 202, 237, 1)",
            "rgba(120, 250, 185, 1)",
            "rgba(250, 204, 21, 1)",
            "rgba(167, 139, 250, 1)",
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

      return `
      <div class="bg-ink3 rounded-xl border border-white/5 p-4 hover:border-cyan/30 transition-all">
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1">
            <p class="font-medium text-sm mb-1">${msg.name}</p>
            <p class="text-xs text-cyan mb-2">${msg.email}</p>
          </div>
          <span class="text-xs text-muted">${formattedDate}</span>
        </div>
        <p class="text-sm text-muted mb-3 line-clamp-2">${msg.message}</p>
        <button 
          onclick="viewMessage('${msg.id}')" 
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
    toast("✅ Profil berhasil diperbarui!", "success");

    // Re-render sections that use profile data
    renderDashboard();
    renderAbout();
    renderContact();
    renderFooter();
  } catch (error) {
    console.error("Error saving profile:", error);
    toast("❌ Gagal menyimpan profil", "error");
  }
}

// ─────────────────────────────────────────
//  ADMIN: PAGINATION HELPER
// ─────────────────────────────────────────
function admPaginator(total, state, renderFn, containerId) {
  const totalPages = Math.ceil(total / state.perPage);
  const container = safeGet(containerId);
  if (!container) return;

  if (totalPages <= 1) {
    container.innerHTML = "";
    return;
  }

  let html = "";
  for (let i = 1; i <= totalPages; i++) {
    const active = i === state.page;
    html += `<button onclick="${renderFn.name}_goPage(${i})" class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${active ? "bg-cyan/10 text-cyan border border-cyan/30" : "text-muted border border-white/10 hover:border-cyan/30 hover:text-cyan"}">${i}</button>`;
  }

  container.innerHTML = html;
}

// ─────────────────────────────────────────
//  ADMIN: PROJECTS
// ─────────────────────────────────────────
function renderAdmProjects() {
  const q = admState.projects.search.toLowerCase();
  const all = (getData("projects") || []).filter(
    (p) => !q || p.title.toLowerCase().includes(q),
  );
  const total = all.length;
  const { page, perPage } = admState.projects;
  const slice = all.slice((page - 1) * perPage, page * perPage);

  const listEl = safeGet("adm-projects-tbody");
  if (listEl) {
    listEl.innerHTML =
      slice
        .map(
          (p) => `
      <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
        <td class="px-4 py-4">
          <div class="flex items-center gap-3">
            <span class="text-2xl">${p.image || "📁"}</span>
            <div>
              <p class="font-semibold text-sm">${p.title}</p>
              <p class="text-xs text-dim mt-0.5">${p.desc}</p>
            </div>
          </div>
        </td>
        <td class="px-4 py-4">
          <div class="flex flex-wrap gap-1.5">
            ${p.tech
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

  admPaginator(
    total,
    admState.projects,
    renderAdmProjects,
    "adm-projects-pages",
  );
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
  safeSet("project-id", "value", p.id);
  safeSet("project-title", "value", p.title);
  safeSet("project-desc", "value", p.desc);
  safeSet("project-tech", "value", p.tech);
  safeSet("project-status", "value", p.status);
  safeSet("project-link", "value", p.link);
  safeSet("project-github", "value", p.github);
  safeSet("project-image", "value", p.image);

  const featuredCheckbox = safeGet("project-featured");
  if (featuredCheckbox) featuredCheckbox.checked = p.featured;

  openModal("modal-project");
}

async function saveProject() {
  const id = safeGet("project-id")?.value;
  const item = {
    id: id ? parseInt(id) : uid(),
    title: safeGet("project-title")?.value || "",
    desc: safeGet("project-desc")?.value || "",
    tech: safeGet("project-tech")?.value || "",
    status: safeGet("project-status")?.value || "Konsep",
    featured: safeGet("project-featured")?.checked || false,
    link: safeGet("project-link")?.value || "#",
    github: safeGet("project-github")?.value || "#",
    image: safeGet("project-image")?.value || "📁",
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
  safeSet("project-id", "value", "");
  safeSet("modal-project-title", "textContent", "Tambah Project");
}

// ─────────────────────────────────────────
//  ADMIN: SKILLS
// ─────────────────────────────────────────
function renderAdmSkills() {
  const q = admState.skills.search.toLowerCase();
  const all = (getData("skills") || []).filter(
    (s) => !q || s.name.toLowerCase().includes(q),
  );
  const total = all.length;
  const { page, perPage } = admState.skills;
  const slice = all.slice((page - 1) * perPage, page * perPage);

  const listEl = safeGet("adm-skills-tbody");
  if (listEl) {
    listEl.innerHTML =
      slice
        .map(
          (s) => `
      <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
        <td class="px-4 py-4">
          <p class="font-semibold text-sm">${s.name}</p>
        </td>
        <td class="px-4 py-4">
          <span class="text-xs text-muted">${s.category}</span>
        </td>
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

  admPaginator(total, admState.skills, renderAdmSkills, "adm-skills-pages");
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
  const q = admState.experience.search.toLowerCase();
  const all = (getData("experience") || []).filter(
    (e) =>
      !q ||
      e.title.toLowerCase().includes(q) ||
      e.company.toLowerCase().includes(q),
  );
  const total = all.length;
  const { page, perPage } = admState.experience;
  const slice = all.slice((page - 1) * perPage, page * perPage);

  const listEl = safeGet("adm-exp-list");
  if (listEl) {
    listEl.innerHTML =
      slice
        .map(
          (e) => `
      <div class="bg-ink2 rounded-2xl border border-white/5 p-5 flex items-start gap-4">
        ${e.active ? '<div class="w-3 h-3 bg-mint rounded-full mt-1 flex-shrink-0"></div>' : '<div class="w-3 h-3 bg-ink4 rounded-full mt-1 flex-shrink-0 border border-white/10"></div>'}
        <div class="flex-1 min-w-0">
          <p class="text-xs text-muted mb-1">${e.year}</p>
          <p class="font-semibold text-sm mb-0.5">${e.title}</p>
          <p class="text-xs text-cyan mb-2">${e.company}</p>
          <p class="text-xs text-dim">${e.desc}</p>
        </div>
        <div class="flex gap-2 flex-shrink-0">
          <button onclick="editExp(${e.id})" class="text-xs bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all"><i data-lucide="pencil" class="w-3 h-3"></i></button>
          <button onclick="deleteItem('experience',${e.id})" class="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
        </div>
      </div>`,
        )
        .join("") || '<p class="text-muted text-sm">Tidak ada hasil.</p>';
  }

  admPaginator(total, admState.experience, renderAdmExp, "adm-exp-pages");
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
  const q = admState.films.search.toLowerCase();
  const all = (getData("films") || []).filter(
    (f) => !q || f.title.toLowerCase().includes(q),
  );
  const total = all.length;
  const { page, perPage } = admState.films;
  const slice = all.slice((page - 1) * perPage, page * perPage);

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
        <td class="px-4 py-4">
          <span class="text-xs text-muted">${f.genre} (${f.year})</span>
        </td>
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
      '<tr><td colspan="5" class="text-center py-8 text-muted text-sm">Tidak ada hasil.</td></tr>';
  }

  admPaginator(total, admState.films, renderAdmFilms, "adm-films-pages");
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
  const q = admState.music.search.toLowerCase();
  const all = (getData("music") || []).filter(
    (m) =>
      !q ||
      m.title.toLowerCase().includes(q) ||
      m.artist.toLowerCase().includes(q),
  );
  const total = all.length;
  const { page, perPage } = admState.music;
  const slice = all.slice((page - 1) * perPage, page * perPage);

  const listEl = safeGet("adm-music-list");
  if (listEl) {
    listEl.innerHTML =
      slice
        .map(
          (m) => `
      <div class="bg-ink2 rounded-2xl border border-white/5 p-5 flex items-center gap-4">
        <span class="text-2xl flex-shrink-0">${m.emoji}</span>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-sm mb-0.5">${m.title}</p>
          <p class="text-xs text-muted mb-1">${m.artist}</p>
          <div class="flex gap-2 text-xs">
            <span class="text-dim">${m.genre}</span>
            <span>·</span>
            <span class="text-cyan">${m.mood}</span>
          </div>
        </div>
        <div class="flex gap-2 flex-shrink-0">
          <button onclick="editMusic(${m.id})" class="text-xs bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all"><i data-lucide="pencil" class="w-3 h-3"></i></button>
          <button onclick="deleteItem('music',${m.id})" class="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
        </div>
      </div>`,
        )
        .join("") || '<p class="text-muted text-sm">Tidak ada hasil.</p>';
  }

  admPaginator(total, admState.music, renderAdmMusic, "adm-music-pages");
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
  safeSet("music-emoji", "value", m.emoji);

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
    emoji: safeGet("music-emoji")?.value || "🎵",
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
  const q = admState.books.search.toLowerCase();
  const all = (getData("books") || []).filter(
    (b) => !q || b.title.toLowerCase().includes(q),
  );
  const total = all.length;
  const { page, perPage } = admState.books;
  const slice = all.slice((page - 1) * perPage, page * perPage);

  const listEl = safeGet("adm-books-list");
  if (listEl) {
    listEl.innerHTML =
      slice
        .map(
          (b) => `
      <div class="bg-ink2 rounded-2xl border border-white/5 p-5">
        <p class="font-semibold text-sm mb-1">${b.title}</p>
        <p class="text-xs text-muted mb-2">${b.author} · ${b.genre}</p>
        <div class="flex items-center gap-2 mb-2">
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
        <p class="text-xs text-dim italic mb-3">"${b.review}"</p>
        <div class="flex gap-2">
          <button onclick="editBook(${b.id})" class="text-xs bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all"><i data-lucide="pencil" class="w-3 h-3"></i></button>
          <button onclick="deleteItem('books',${b.id})" class="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
        </div>
      </div>`,
        )
        .join("") || '<p class="text-muted text-sm">Tidak ada hasil.</p>';
  }

  admPaginator(total, admState.books, renderAdmBooks, "adm-books-pages");
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
  const q = admState.games.search.toLowerCase();
  const all = (getData("games") || []).filter(
    (g) => !q || g.title.toLowerCase().includes(g),
  );
  const total = all.length;
  const { page, perPage } = admState.games;
  const slice = all.slice((page - 1) * perPage, page * perPage);

  const listEl = safeGet("adm-games-list");
  if (listEl) {
    listEl.innerHTML =
      slice
        .map(
          (g) => `
      <div class="bg-ink2 rounded-2xl border border-white/5 p-5">
        <div class="flex items-start gap-3 mb-3">
          <span class="text-2xl flex-shrink-0">${g.emoji}</span>
          <div class="flex-1">
            <p class="font-semibold text-sm mb-0.5">${g.title}</p>
            <p class="text-xs text-muted">${g.platform} · ${g.genre}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 mb-3">
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
        <div class="flex gap-2">
          <button onclick="editGame(${g.id})" class="text-xs bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all"><i data-lucide="pencil" class="w-3 h-3"></i></button>
          <button onclick="deleteItem('games',${g.id})" class="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
        </div>
      </div>`,
        )
        .join("") || '<p class="text-muted text-sm">Tidak ada hasil.</p>';
  }

  admPaginator(total, admState.games, renderAdmGames, "adm-games-pages");
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
  safeSet("game-emoji", "value", g.emoji);

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
    emoji: safeGet("game-emoji")?.value || "🎮",
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
//  ADMIN: BLOG
// ─────────────────────────────────────────
function renderAdmBlog() {
  const q = admState.blogs.search.toLowerCase();
  const all = (getData("blogs") || []).filter(
    (b) => !q || b.title.toLowerCase().includes(q),
  );
  const total = all.length;
  const { page, perPage } = admState.blogs;
  const slice = all.slice((page - 1) * perPage, page * perPage);

  const listEl = safeGet("adm-blog-list");
  if (listEl) {
    listEl.innerHTML =
      slice
        .map(
          (b) => `
      <div class="bg-ink2 rounded-2xl border border-white/5 p-5">
        <div class="flex items-start gap-4 mb-3">
          <span class="text-2xl flex-shrink-0">${b.emoji}</span>
          <div class="flex-1">
            <p class="font-semibold text-sm mb-1">${b.title}</p>
            <p class="text-xs text-muted mb-2">${b.category} · ${b.date || "2024"}</p>
            <p class="text-xs text-dim">${b.summary}</p>
          </div>
        </div>
        <div class="flex gap-2">
          <button onclick="editBlog(${b.id})" class="text-xs bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all"><i data-lucide="pencil" class="w-3 h-3"></i></button>
          <button onclick="deleteItem('blogs',${b.id})" class="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
        </div>
      </div>`,
        )
        .join("") || '<p class="text-muted text-sm">Tidak ada hasil.</p>';
  }

  admPaginator(total, admState.blogs, renderAdmBlog, "adm-blog-pages");
  lucide.createIcons();
}

function renderAdmBlog_goPage(p) {
  admState.blogs.page = p;
  renderAdmBlog();
}

function admBlogSearch(v) {
  admState.blogs.search = v;
  admState.blogs.page = 1;
  renderAdmBlog();
}

function editBlog(id) {
  const b = (getData("blogs") || []).find((x) => x.id === id);
  if (!b) return;

  safeSet("modal-blog-title", "textContent", "Edit Blog");
  safeSet("blog-id", "value", b.id);
  safeSet("blog-title", "value", b.title);
  safeSet("blog-cat", "value", b.category);
  safeSet("blog-emoji", "value", b.emoji);
  safeSet("blog-summary", "value", b.summary);
  safeSet("blog-content", "value", b.content);
  safeSet("blog-tags", "value", b.tags);

  openModal("modal-blog");
}

async function saveBlog() {
  const id = safeGet("blog-id")?.value;
  const item = {
    id: id ? parseInt(id) : uid(),
    title: safeGet("blog-title")?.value || "",
    category: safeGet("blog-cat")?.value || "",
    emoji: safeGet("blog-emoji")?.value || "📝",
    summary: safeGet("blog-summary")?.value || "",
    content: safeGet("blog-content")?.value || "",
    tags: safeGet("blog-tags")?.value || "",
    date: id
      ? (getData("blogs") || []).find((x) => x.id === parseInt(id))?.date
      : new Date().toISOString().split("T")[0],
  };

  let list = getData("blogs") || [];
  if (id) {
    list = list.map((b) => (b.id === parseInt(id) ? item : b));
  } else {
    list.push(item);
  }

  await setData("blogs", list);
  closeModal("modal-blog");
  toast(id ? "Blog diperbarui!" : "Blog ditambahkan!", "success");
  renderAdmBlog();
  renderBlog();
  renderDashboard();

  // Reset form
  safeSet("blog-id", "value", "");
  safeSet("modal-blog-title", "textContent", "Tambah Blog");
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
      blogs: () => {
        renderAdmBlog();
        renderBlog();
        renderDashboard();
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
    renderBlog();
    renderContact();
  });
}

// ─────────────────────────────────────────
//  CONTACT FORM SUBMISSION
// ─────────────────────────────────────────
async function submitContact() {
  const name = safeGet("form-name")?.value || "";
  const email = safeGet("form-email")?.value || "";
  const message = safeGet("form-msg")?.value || "";

  if (!name || !email || !message) {
    toast("❌ Harap isi semua field!", "error");
    return;
  }

  const messageData = {
    id: uid(),
    name,
    email,
    message,
    timestamp: new Date().toISOString(),
    read: false,
  };

  try {
    await addFirebaseData("messages", messageData);

    // Clear form
    safeSet("form-name", "value", "");
    safeSet("form-email", "value", "");
    safeSet("form-msg", "value", "");

    toast("✅ Pesan berhasil dikirim!", "success");
  } catch (error) {
    console.error("Error submitting contact:", error);
    toast("❌ Gagal mengirim pesan", "error");
  }
}

// ─────────────────────────────────────────
//  ADMIN: MESSAGES FUNCTIONS
// ─────────────────────────────────────────
async function clearMessages() {
  showConfirm(async () => {
    try {
      await clearCollection("messages");
      toast("✅ Semua pesan berhasil dihapus!", "success");
      renderAdminMessages();
    } catch (error) {
      console.error("Error clearing messages:", error);
      toast("❌ Gagal menghapus pesan", "error");
    }
  });
}

async function viewMessage(id) {
  try {
    const message = await getDocumentById("messages", id);
    if (!message) {
      toast("❌ Pesan tidak ditemukan", "error");
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

    // Mark as read
    if (!message.read) {
      await updateFirebaseData("messages", id, { read: true });
      renderAdminMessages();
    }
  } catch (error) {
    console.error("Error viewing message:", error);
    toast("❌ Gagal membuka pesan", "error");
  }
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
window.toggleMobile = toggleMobile;
window.isMobileMenuOpen = isMobileMenuOpen;
window.toggleAdminSidebar = toggleAdminSidebar;
window.closeAdminSidebar = closeAdminSidebar;
window.openAdminLogin = openAdminLogin;
window.closeAdminLogin = closeAdminLogin;
window.doAdminLogin = doAdminLogin;
window.doAdminLogout = doAdminLogout;
window.openModal = openModal;
window.closeModal = closeModal;
window.showConfirm = showConfirm;
window.closeConfirm = closeConfirm;
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
window.editBlog = editBlog;
window.saveBlog = saveBlog;
window.renderAdmBlog_goPage = renderAdmBlog_goPage;
window.admBlogSearch = admBlogSearch;
window.deleteItem = deleteItem;
window.resetAllData = resetAllData;
window.submitContact = submitContact;
window.clearMessages = clearMessages;
window.viewMessage = viewMessage;

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
});
