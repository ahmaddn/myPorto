// ═══════════════════════════════════════════
//  PORTONAJMY — main.js
// ═══════════════════════════════════════════

async function getCommits() {
  const res = await fetch(
    "https://github-contributions-api.jogruber.de/v4/ahmaddn",
  );

  const data = await res.json();
  return data.contributions;
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

  contributions.forEach((day) => {
    const date = new Date(day.date);
    const month = date.getMonth();

    months[month] += day.count;
  });

  return months;
}

// ─────────────────────────────────────────
//  DEFAULT DATA
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
    Instagram: "https://Instagram.com",
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
      title: "Interstellar",
      genre: "Sci-Fi",
      year: 2014,
      rating: 10,
      comment: "Masterpiece visual dan emosional",
    },
    {
      id: 2,
      title: "The Dark Knight",
      genre: "Action",
      year: 2008,
      rating: 10,
      comment: "Film superhero terbaik sepanjang masa",
    },
    {
      id: 3,
      title: "Inception",
      genre: "Sci-Fi",
      year: 2010,
      rating: 9,
      comment: "Plot twist yang membuat otak berasap",
    },
    {
      id: 4,
      title: "Parasite",
      genre: "Thriller",
      year: 2019,
      rating: 9,
      comment: "Kritik sosial yang dikemas sempurna",
    },
    {
      id: 5,
      title: "Your Name",
      genre: "Anime",
      year: 2016,
      rating: 9,
      comment: "Film anime paling emosional yang pernah ditonton",
    },
  ],
  music: [
    {
      id: 1,
      title: "Stressed Out",
      artist: "Twenty One Pilots",
      genre: "Alternative",
      mood: "Energik",
      emoji: "🎵",
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
      emoji: "🦋",
    },
    {
      id: 2,
      title: "Celeste",
      platform: "PC",
      genre: "Platformer",
      status: "Sudah Tamat",
      rating: 9,
      emoji: "⛰️",
    },
    {
      id: 3,
      title: "Stardew Valley",
      platform: "PC",
      genre: "Simulation",
      status: "Sedang Main",
      rating: 9,
      emoji: "🌾",
    },
  ],
  blogs: [
    {
      id: 1,
      title: "Cara Memulai Belajar Web Development di 2024",
      category: "Tutorial",
      emoji: "🚀",
      summary:
        "Panduan lengkap untuk pemula yang ingin terjun ke dunia web development.",
      content: "",
      tags: "javascript,web,pemula",
      date: "2024-01-15",
    },
    {
      id: 2,
      title: "Tips Menulis CSS yang Bersih dan Terorganisir",
      category: "Tips",
      emoji: "🎨",
      summary:
        "Kebiasaan baik dalam menulis CSS agar kode lebih mudah dipelihara.",
      content: "",
      tags: "css,tips,clean-code",
      date: "2024-02-20",
    },
  ],
  messages: [],
};

// ─────────────────────────────────────────
//  DATA MANAGER
// ─────────────────────────────────────────
function getData(key) {
  try {
    return JSON.parse(localStorage.getItem("ptf_" + key));
  } catch (e) {
    return null;
  }
}
function setData(key, val) {
  localStorage.setItem("ptf_" + key, JSON.stringify(val));
}
function initData() {
  if (!getData("profile")) setData("profile", DEFAULTS.profile);
  if (!getData("skills")) setData("skills", DEFAULTS.skills);
  if (!getData("experience")) setData("experience", DEFAULTS.experience);
  if (!getData("projects")) setData("projects", DEFAULTS.projects);
  if (!getData("films")) setData("films", DEFAULTS.films);
  if (!getData("music")) setData("music", DEFAULTS.music);
  if (!getData("books")) setData("books", DEFAULTS.books);
  if (!getData("games")) setData("games", DEFAULTS.games);
  if (!getData("blogs")) setData("blogs", DEFAULTS.blogs);
  if (!getData("messages")) setData("messages", []);
}
function uid() {
  return Date.now() + Math.floor(Math.random() * 9999);
}

// ─────────────────────────────────────────
//  ROUTER
// ─────────────────────────────────────────
// ─────────────────────────────────────────
//  ADMIN AUTH (sessionStorage)
// ─────────────────────────────────────────
function isAdminLoggedIn() {
  return sessionStorage.getItem("admin_auth") === "true";
}

function openAdminLogin() {
  document.getElementById("modal-admin-login").classList.add("open");
  document.getElementById("admin-login-error").classList.add("hidden");
  document.getElementById("admin-username").value = "";
  document.getElementById("admin-password").value = "";
  setTimeout(() => document.getElementById("admin-username").focus(), 100);
}

function closeAdminLogin() {
  document.getElementById("modal-admin-login").classList.remove("open");
}

function doAdminLogin() {
  const u = document.getElementById("admin-username").value;
  const p = document.getElementById("admin-password").value;
  if (u === "Canbemyy" && p === "NajmyAhmadPorto12345#") {
    sessionStorage.setItem("admin_auth", "true");
    closeAdminLogin();
    _navigateTo("admin");
    updateAdminBtn();
  } else {
    document.getElementById("admin-login-error").classList.remove("hidden");
    document.getElementById("admin-password").value = "";
  }
}

function doAdminLogout() {
  sessionStorage.removeItem("admin_auth");
  updateAdminBtn();
  navigate("dashboard");
  toast("Berhasil logout dari Admin.", "info");
}

function updateAdminBtn() {
  const btn = document.getElementById("admin-nav-btn");
  const btnMob = document.getElementById("admin-nav-btn-mob");
  const dashBtn = document.getElementById("dashboard-nav-btn");
  const dashBtnMob = document.getElementById("dashboard-nav-btn-mob");

  if (!btn) return;

  if (isAdminLoggedIn()) {
    // Tombol Admin menjadi Logout
    btn.innerHTML = `<i data-lucide="log-out" class="w-3.5 h-3.5"></i> Logout`;
    btn.onclick = doAdminLogout;

    if (btnMob) {
      btnMob.innerHTML = `<i data-lucide="log-out" class="w-4 h-4"></i> Logout Admin`;
      btnMob.onclick = doAdminLogout;
    }

    // Tampilkan tombol Dashboard Admin
    if (dashBtn) {
      dashBtn.classList.remove("hidden");
      dashBtn.classList.add("flex");
    }
    if (dashBtnMob) {
      dashBtnMob.classList.remove("hidden");
      dashBtnMob.classList.add("flex");
    }
  } else {
    // Tombol Admin normal
    btn.innerHTML = `<i data-lucide="shield" class="w-3.5 h-3.5"></i> Admin`;
    btn.onclick = openAdminLogin;

    if (btnMob) {
      btnMob.innerHTML = `<i data-lucide="shield" class="w-4 h-4"></i> Admin Panel`;
      btnMob.onclick = () => {
        openAdminLogin();
        if (mobileOpen) toggleMobile();
      };
    }

    // Sembunyikan tombol Dashboard Admin
    if (dashBtn) {
      dashBtn.classList.add("hidden");
      dashBtn.classList.remove("flex");
    }
    if (dashBtnMob) {
      dashBtnMob.classList.add("hidden");
      dashBtnMob.classList.remove("flex");
    }
  }

  lucide.createIcons();
}

// ─────────────────────────────────────────
//  ROUTER
// ─────────────────────────────────────────
let currentPage = "dashboard";

function _navigateTo(page) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  const el = document.getElementById("page-" + page);
  if (el) el.classList.add("active");
  document.querySelectorAll(".nav-link").forEach((l) => {
    l.classList.toggle("active", l.dataset.page === page);
  });
  currentPage = page;
  window.scrollTo(0, 0);
  if (page === "dashboard") renderDashboard();
  if (page === "projects") renderProjects();
  if (page === "about") renderAbout();
  if (page === "hiburan") renderHiburan();
  if (page === "blog") renderBlog();
  if (page === "contact") renderContact();
  if (page === "admin") renderAdmin();
  AOS.refresh();
}

function navigate(page) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-link")
    .forEach((n) => n.classList.remove("active"));

  const pageEl = document.getElementById(`page-${page}`);
  const navEl = document.querySelector(`[data-page="${page}"]`);

  if (pageEl) pageEl.classList.add("active");
  if (navEl) navEl.classList.add("active");

  window.location.hash = page;
  window.scrollTo(0, 0);

  // AUTO REFRESH berdasarkan page
  refreshPageContent(page);
}

// Fungsi untuk refresh konten berdasarkan page
function refreshPageContent(page) {
  switch (page) {
    case "dashboard":
      renderDashboard();
      break;
    case "projects":
      renderProjects();
      break;
    case "skills":
      renderSkills();
      break;
    case "about":
      renderAbout();
      break;
    case "media":
      renderFilms();
      renderMusic();
      renderBooks();
      renderGames();
      break;
    case "blog":
      renderBlog();
      break;
    case "contact":
      renderContact();
      break;
    case "admin":
      // Refresh admin overview saat masuk
      if (currentAdminTab === "overview" || !currentAdminTab) {
        updateOverviewStats();
      }
      break;
  }
}

// ─────────────────────────────────────────
//  MOBILE NAV
// ─────────────────────────────────────────
let mobileOpen = false;
function toggleMobile() {
  mobileOpen = !mobileOpen;
  document.getElementById("mobile-nav").classList.toggle("hidden", !mobileOpen);
  const h1 = document.getElementById("h1"),
    h2 = document.getElementById("h2"),
    h3 = document.getElementById("h3");
  if (mobileOpen) {
    h1.style.transform = "translateY(7px) rotate(45deg)";
    h2.style.opacity = "0";
    h3.style.transform = "translateY(-7px) rotate(-45deg)";
  } else {
    h1.style.transform = "";
    h2.style.opacity = "";
    h3.style.transform = "";
  }
}

// ─────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────
function toast(msg, type = "success") {
  const icons = { success: "check-circle", error: "x-circle", info: "info" };
  const colors = {
    success: "border-l-4 border-mint bg-ink3",
    error: "border-l-4 border-red-500 bg-ink3",
    info: "border-l-4 border-cyan bg-ink3",
  };
  const el = document.createElement("div");
  el.className = `toast ${colors[type]}`;
  el.innerHTML = `<i data-lucide="${icons[type]}" style="width:16px;height:16px;flex-shrink:0;color:${type === "success" ? "#78fab9" : type === "error" ? "#ef4444" : "#77caed"}"></i><span>${msg}</span>`;
  document.getElementById("toast-container").appendChild(el);
  lucide.createIcons({ nodes: [el] });
  setTimeout(() => el.remove(), 3200);
}

// ─────────────────────────────────────────
//  MODALS
// ─────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add("open");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

let _confirmCb = null;
function showConfirm(cb) {
  _confirmCb = cb;
  document.getElementById("confirm-dialog").classList.add("open");
}
function closeConfirm() {
  document.getElementById("confirm-dialog").classList.remove("open");
  _confirmCb = null;
}

// ─────────────────────────────────────────
//  STARS RENDERER
// ─────────────────────────────────────────
function renderStars(rating, max = 10) {
  const full = Math.round((rating / max) * 5);
  return Array.from(
    { length: 5 },
    (_, i) =>
      `<span class="${i < full ? "star-filled" : "star-empty"}">★</span>`,
  ).join("");
}

// ─────────────────────────────────────────
//  STATUS BADGE
// ─────────────────────────────────────────
function statusBadge(s) {
  const map = {
    Selesai: "bg-mint/10 text-mint",
    Proses: "bg-cyan/10 text-cyan",
    Konsep: "bg-white/5 text-muted",
  };
  return `<span class="text-xs font-mono px-2.5 py-1 rounded-full ${map[s] || "bg-white/5 text-muted"}">${s}</span>`;
}

// ─────────────────────────────────────────
//  CHART.JS GLOBAL DEFAULTS
// ─────────────────────────────────────────
Chart.defaults.color = "#7a9e9a";
Chart.defaults.borderColor = "rgba(255,255,255,0.05)";
Chart.defaults.font.family = "'DM Sans', sans-serif";

const CHART_COLORS = [
  "#77caed",
  "#78fab9",
  "#a78bfa",
  "#f59e0b",
  "#f472b6",
  "#34d399",
  "#60a5fa",
  "#fb923c",
];
const destroyChart = (id) => {
  const c = Chart.getChart(id);
  if (c) c.destroy();
};

// ─────────────────────────────────────────
//  DASHBOARD RENDER
// ─────────────────────────────────────────
function renderDashboard() {
  const p = getData("profile");
  document.getElementById("hero-name-display").textContent = p.name;
  document.getElementById("hero-role-display").textContent = p.role;
  document.getElementById("hero-tagline-display").textContent = p.tagline;
  document.getElementById("hero-avatar-display").textContent = p.avatar;
  document.getElementById("hero-available-badge").textContent = p.available
    ? "Tersedia untuk Project Baru"
    : "Saat Ini Tidak Tersedia";

  const projects = getData("projects") || [];
  const skills = getData("skills") || [];
  const blogs = getData("blogs") || [];
  document.getElementById("stat-projects").textContent = projects.filter(
    (x) => x.status === "Selesai",
  ).length;
  document.getElementById("stat-skills").textContent = skills.length;
  document.getElementById("stat-blogs").textContent = blogs.length;

  // Featured projects
  const fp = projects.filter((x) => x.featured).slice(0, 3);
  const fpEl = document.getElementById("featured-projects");
  fpEl.innerHTML = fp.length
    ? fp.map((p) => projectCard(p)).join("")
    : '<p class="text-muted text-sm col-span-3">Belum ada proyek featured.</p>';

  // Radar Chart
  destroyChart("radarChart");
  const topSkills = skills.slice(0, 8);
  new Chart(document.getElementById("radarChart"), {
    type: "radar",
    data: {
      labels: topSkills.map((s) => s.name),
      datasets: [
        {
          label: "Level",
          data: topSkills.map((s) => s.level),
          backgroundColor: "rgba(119,202,237,.15)",
          borderColor: "#77caed",
          pointBackgroundColor: "#78fab9",
          pointBorderColor: "#78fab9",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { stepSize: 25, display: false },
          grid: { color: "rgba(255,255,255,.07)" },
          pointLabels: { font: { size: 11 }, color: "#7a9e9a" },
          angleLines: { color: "rgba(255,255,255,.07)" },
        },
      },
      plugins: { legend: { display: false } },
    },
  });

  // Activity Bar Chart
  destroyChart("activityChart");
  async function loadChart() {
    const events = await getCommits();

    const labels = getLast12Months();
    const data = commitsPerMonth(events);

    new Chart(document.getElementById("activityChart"), {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Commit",
            data: data,
            backgroundColor: "rgba(119,202,237,.7)",
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }

  loadChart();

  lucide.createIcons();
}

// ─────────────────────────────────────────
//  PROJECT CARD
// ─────────────────────────────────────────
function projectCard(p) {
  const techTags = p.tech
    .split(",")
    .map(
      (t) =>
        `<span class="text-xs font-mono bg-white/5 px-2 py-0.5 rounded text-muted">${t.trim()}</span>`,
    )
    .join("");
  return `
  <div class="bg-ink2 rounded-2xl border border-white/5 p-6 hover:border-cyan/20 hover:shadow-glow-cyan transition-all group" data-aos="fade-up">
    <div class="flex items-start justify-between mb-4">
      <span class="text-4xl">${p.image || "📁"}</span>
      ${statusBadge(p.status)}
    </div>
    <h3 class="font-display font-bold text-lg mb-2 group-hover:text-cyan transition-all">${p.title}</h3>
    <p class="text-muted text-sm leading-relaxed mb-4">${p.desc}</p>
    <div class="flex flex-wrap gap-1.5 mb-5">${techTags}</div>
    <div class="flex items-center gap-3 border-t border-white/5 pt-4">
      <a href="${p.link}" target="_blank" class="flex items-center gap-1.5 text-xs text-cyan hover:underline underline-offset-4">
        <i data-lucide="external-link" class="w-3.5 h-3.5"></i> Demo
      </a>
      <a href="${p.github}" target="_blank" class="flex items-center gap-1.5 text-xs text-muted hover:text-cyan transition-all">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg> GitHub
      </a>
    </div>
  </div>`;
}

// ─────────────────────────────────────────
//  PROJECTS PAGE
// ─────────────────────────────────────────
let _projectFilter = "all";
function renderProjects(filter) {
  if (filter) _projectFilter = filter;
  const projects = getData("projects") || [];
  const filtered =
    _projectFilter === "all"
      ? projects
      : projects.filter((p) => p.status === _projectFilter);
  const grid = document.getElementById("projects-grid");
  const empty = document.getElementById("projects-empty");
  grid.innerHTML = filtered.map((p) => projectCard(p)).join("");
  empty.classList.toggle("hidden", filtered.length > 0);

  // Donut chart
  destroyChart("techDonutChart");
  const techCount = {};
  projects.forEach((p) =>
    p.tech.split(",").forEach((t) => {
      const k = t.trim();
      techCount[k] = (techCount[k] || 0) + 1;
    }),
  );
  const labels = Object.keys(techCount).slice(0, 8),
    vals = labels.map((k) => techCount[k]);
  new Chart(document.getElementById("techDonutChart"), {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: vals,
          backgroundColor: CHART_COLORS,
          borderColor: "#1e2626",
          borderWidth: 3,
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: {
          position: "right",
          labels: { boxWidth: 12, padding: 12, font: { size: 11 } },
        },
      },
    },
  });
  lucide.createIcons();
}

function filterProjects(f) {
  _projectFilter = f;
  document.querySelectorAll(".project-filter-btn").forEach((b) => {
    const active = b.dataset.filter === f;
    b.classList.toggle("active-filter", active);
    b.classList.toggle("border-cyan/30", active);
    b.classList.toggle("text-cyan", active);
    b.classList.toggle("bg-cyan/10", active);
    b.classList.toggle("border-white/10", !active);
    b.classList.toggle("text-muted", !active);
    b.classList.toggle("bg-transparent", !active);
  });
  renderProjects(f);
}

// ─────────────────────────────────────────
//  ABOUT PAGE
// ─────────────────────────────────────────
let _skillCat = "all";
function renderAbout() {
  const p = getData("profile");
  const skills = getData("skills") || [];
  const exp = getData("experience") || [];

  document.getElementById("about-bio-display").textContent = p.bio;
  document.getElementById("about-location").textContent = p.location;

  // FIX: Render email sebagai link yang bisa diklik
  const emailEl = document.getElementById("about-email");
  emailEl.innerHTML = `<a href="mailto:${p.email}" class="hover:text-cyan transition-colors">${p.email}</a>`;

  // FIX: Pastikan href diset dengan benar
  const githubEl = document.getElementById("about-github");
  githubEl.href = p.github;
  githubEl.textContent = p.github.replace("https://github.com/", "@");

  const linkedinEl = document.getElementById("about-linkedin");
  linkedinEl.href = p.linkedin;
  linkedinEl.textContent = "LinkedIn";

  const avail = p.available;
  document.getElementById("about-avail-text").textContent = avail
    ? "Tersedia untuk Hire"
    : "Tidak Tersedia";
  document
    .getElementById("about-avail-icon")
    .setAttribute("data-lucide", avail ? "check-circle" : "x-circle");
  document.getElementById("about-avail-icon").style.color = avail
    ? "#78fab9"
    : "#ef4444";

  // Timeline
  const tl = document.getElementById("timeline-list");
  tl.innerHTML = exp
    .map(
      (e, i) => `
    <div class="relative pl-8 pb-8 ${i < exp.length - 1 ? "border-l-2 border-white/5" : ""}">
      <div class="absolute left-0 top-1 w-3 h-3 rounded-full -translate-x-1.5 ${e.active ? "bg-cyan shadow-glow-cyan" : "bg-ink4 border-2 border-white/10"}"></div>
      <p class="font-mono text-xs text-mint mb-1">${e.year}</p>
      <p class="font-bold text-sm">${e.title} <span class="text-muted font-normal">@ ${e.company}</span></p>
      <p class="text-muted text-xs mt-1 leading-relaxed">${e.desc}</p>
    </div>`,
    )
    .join("");

  // Skill category pills
  const cats = ["all", ...new Set(skills.map((s) => s.category))];
  document.getElementById("skill-cats").innerHTML = cats
    .map(
      (c) => `
    <button onclick="filterSkills('${c}')" class="cat-pill ${c === _skillCat ? "active" : ""} text-xs font-mono px-3 py-1.5 rounded-full border border-white/10 text-muted hover:text-cyan transition-all">${c === "all" ? "Semua" : c}</button>
  `,
    )
    .join("");

  renderSkills(skills);

  // Category donut
  destroyChart("skillCategoryChart");
  const catCount = {};
  skills.forEach((s) => {
    catCount[s.category] = (catCount[s.category] || 0) + 1;
  });
  new Chart(document.getElementById("skillCategoryChart"), {
    type: "doughnut",
    data: {
      labels: Object.keys(catCount),
      datasets: [
        {
          data: Object.values(catCount),
          backgroundColor: CHART_COLORS,
          borderColor: "#1e2626",
          borderWidth: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "60%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 10, padding: 8, font: { size: 10 } },
        },
      },
    },
  });
  lucide.createIcons();
}

function filterSkills(cat) {
  _skillCat = cat;
  const skills = getData("skills") || [];
  document
    .querySelectorAll(".cat-pill")
    .forEach((p) =>
      p.classList.toggle(
        "active",
        p.textContent === (cat === "all" ? "Semua" : cat),
      ),
    );
  renderSkills(skills);
}

function renderSkills(skills) {
  const filtered =
    _skillCat === "all"
      ? skills
      : skills.filter((s) => s.category === _skillCat);
  document.getElementById("skills-list").innerHTML = filtered
    .map(
      (s) => `
    <div class="bg-ink2 rounded-2xl border border-white/5 p-5" data-aos="fade-up">
      <div class="flex items-center justify-between mb-2">
        <span class="font-medium text-sm">${s.name}</span>
        <span class="font-mono text-xs text-cyan">${s.level}%</span>
      </div>
      <p class="font-mono text-xs text-dim mb-3">${s.category}</p>
      <div class="h-1.5 bg-ink4 rounded-full overflow-hidden">
        <div class="h-full bg-cyan rounded-full bar-fill" style="width:${s.level}%"></div>
      </div>
    </div>`,
    )
    .join("");
}

// ─────────────────────────────────────────
//  HIBURAN PAGE
// ─────────────────────────────────────────
function renderHiburan() {
  renderFilms();
  renderMusic();
  renderBooks();
  renderGames();
}

function switchTab(tabId) {
  document
    .querySelectorAll(".hiburan-pane")
    .forEach((p) => p.classList.add("hidden"));
  document.querySelectorAll(".hiburan-tab").forEach((t) => {
    const active = t.dataset.tab === tabId;
    t.classList.toggle("active-tab", active);
    t.classList.toggle("border-cyan", active);
    t.classList.toggle("text-cyan", active);
    t.classList.toggle("border-transparent", !active);
    t.classList.toggle("text-muted", !active);
  });
  document.getElementById(tabId).classList.remove("hidden");
}

function renderFilms() {
  const films = getData("films") || [];
  const tbody = document.getElementById("films-tbody");
  tbody.innerHTML = films
    .map(
      (f, i) => `
    <tr class="border-b border-white/5 hover:bg-white/2 transition-all">
      <td class="px-5 py-3.5 font-mono font-bold text-mint">${i + 1}</td>
      <td class="px-5 py-3.5 font-semibold">${f.title}</td>
      <td class="px-5 py-3.5"><span class="text-xs font-mono bg-cyan/10 text-cyan px-2 py-0.5 rounded-full">${f.genre}</span></td>
      <td class="px-5 py-3.5 text-muted text-sm">${f.year}</td>
      <td class="px-5 py-3.5">${renderStars(f.rating)} <span class="text-xs text-muted ml-1">${f.rating}/10</span></td>
      <td class="px-5 py-3.5 text-sm text-muted">${f.comment || "—"}</td>
    </tr>`,
    )
    .join("");
  document
    .getElementById("films-empty")
    .classList.toggle("hidden", films.length > 0);

  // Genre chart
  destroyChart("genreChart");
  const gc = {};
  films.forEach((f) => {
    gc[f.genre] = (gc[f.genre] || 0) + 1;
  });
  new Chart(document.getElementById("genreChart"), {
    type: "bar",
    data: {
      labels: Object.keys(gc),
      datasets: [
        {
          label: "Film",
          data: Object.values(gc),
          backgroundColor: CHART_COLORS,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: "rgba(255,255,255,.04)" }, ticks: { stepSize: 1 } },
        y: { grid: { display: false } },
      },
    },
  });
}

function renderMusic() {
  const music = getData("music") || [];
  const grid = document.getElementById("music-grid");
  grid.innerHTML = music
    .map(
      (m, i) => `
    <div class="bg-ink2 rounded-2xl border border-white/5 p-5 flex items-center gap-4 hover:border-cyan/20 transition-all">
      <span class="text-2xl font-display font-black text-ink4 w-8 text-center">${i + 1}</span>
      <div class="w-12 h-12 bg-ink3 rounded-xl flex items-center justify-center text-2xl border border-white/5 flex-shrink-0">${m.emoji || "🎵"}</div>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-sm truncate">${m.title}</p>
        <p class="text-muted text-xs mt-0.5">${m.artist}</p>
        <p class="font-mono text-xs text-cyan mt-1">${m.genre} · ${m.mood}</p>
      </div>
      <div class="flex gap-1 flex-shrink-0">
        <span class="eq-bar h-1.5"></span>
        <span class="eq-bar h-1.5"></span>
        <span class="eq-bar h-1.5"></span>
      </div>
    </div>`,
    )
    .join("");
  document
    .getElementById("music-empty")
    .classList.toggle("hidden", music.length > 0);

  // Mood chart
  destroyChart("moodChart");
  const mc = {};
  music.forEach((m) => {
    mc[m.mood] = (mc[m.mood] || 0) + 1;
  });
  new Chart(document.getElementById("moodChart"), {
    type: "polarArea",
    data: {
      labels: Object.keys(mc),
      datasets: [
        {
          data: Object.values(mc),
          backgroundColor: CHART_COLORS.map((c) => c + "99"),
          borderColor: CHART_COLORS,
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
          labels: { boxWidth: 10, font: { size: 11 } },
        },
      },
      scales: {
        r: {
          grid: { color: "rgba(255,255,255,.06)" },
          ticks: { display: false },
        },
      },
    },
  });
}

function renderBooks() {
  const books = getData("books") || [];
  document.getElementById("books-grid").innerHTML = books
    .map(
      (b) => `
    <div class="bg-ink2 rounded-2xl border border-white/5 p-6 hover:border-cyan/20 transition-all">
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-mono bg-ink3 px-2.5 py-1 rounded-full text-muted">${b.genre}</span>
        <span class="text-xs font-mono ${b.status === "Sudah Baca" ? "text-mint" : b.status === "Sedang Baca" ? "text-cyan" : "text-muted"}">${b.status}</span>
      </div>
      <h3 class="font-display font-bold text-base mb-1">${b.title}</h3>
      <p class="text-muted text-xs mb-3">oleh ${b.author}</p>
      <div class="mb-3">${renderStars(b.rating)}</div>
      <p class="text-muted text-xs leading-relaxed italic">"${b.review || ""}"</p>
    </div>`,
    )
    .join("");
  document
    .getElementById("books-empty")
    .classList.toggle("hidden", books.length > 0);
}

function renderGames() {
  const games = getData("games") || [];
  document.getElementById("games-grid").innerHTML = games
    .map(
      (g) => `
    <div class="bg-ink2 rounded-2xl border border-white/5 p-6 hover:border-cyan/20 transition-all">
      <div class="flex items-center justify-between mb-4">
        <span class="text-3xl">${g.emoji || "🎮"}</span>
        <span class="text-xs font-mono ${g.status === "Sudah Tamat" ? "text-mint" : g.status === "Sedang Main" ? "text-cyan" : "text-muted"}">${g.status}</span>
      </div>
      <h3 class="font-display font-bold text-base mb-1">${g.title}</h3>
      <p class="text-xs text-muted mb-3">${g.platform} · ${g.genre}</p>
      <div>${renderStars(g.rating)} <span class="text-xs text-muted">${g.rating}/10</span></div>
    </div>`,
    )
    .join("");
  document
    .getElementById("games-empty")
    .classList.toggle("hidden", games.length > 0);
}

// ─────────────────────────────────────────
//  BLOG PAGE
// ─────────────────────────────────────────
function renderBlog() {
  const blogs = getData("blogs") || [];
  const grid = document.getElementById("blog-grid");
  grid.innerHTML = blogs
    .map(
      (b) => `
    <article class="bg-ink2 rounded-2xl border border-white/5 p-6 hover:border-cyan/20 hover:shadow-glow-cyan transition-all group" data-aos="fade-up">
      <div class="text-4xl mb-4">${b.emoji || "📝"}</div>
      <div class="flex items-center gap-2 mb-3">
        <span class="text-xs font-mono bg-cyan/10 text-cyan px-2.5 py-0.5 rounded-full">${b.category}</span>
        <span class="text-xs text-dim">${b.date || ""}</span>
      </div>
      <h3 class="font-display font-bold text-lg mb-2 group-hover:text-cyan transition-all leading-snug">${b.title}</h3>
      <p class="text-muted text-sm leading-relaxed mb-4">${b.summary}</p>
      <div class="flex flex-wrap gap-1.5 border-t border-white/5 pt-4">
        ${(b.tags || "")
          .split(",")
          .filter(Boolean)
          .map(
            (t) =>
              `<span class="text-xs font-mono text-dim bg-white/3 px-2 py-0.5 rounded">#${t.trim()}</span>`,
          )
          .join("")}
      </div>
    </article>`,
    )
    .join("");
  document
    .getElementById("blog-empty")
    .classList.toggle("hidden", blogs.length > 0);
  lucide.createIcons();
}

// ─────────────────────────────────────────
//  CONTACT PAGE
// ─────────────────────────────────────────
function renderContact() {
  const p = getData("profile");
  document.getElementById("contact-email").textContent = p.email;
  document.getElementById("contact-location").textContent = p.location;
  document.getElementById("social-github").href = p.github;
  document.getElementById("social-linkedin").href = p.linkedin;
  document.getElementById("social-Instagram").href = p.Instagram;
  renderMessages();
  lucide.createIcons();
}
function submitContact() {
  const name = document.getElementById("form-name").value.trim();
  const email = document.getElementById("form-email").value.trim();
  const msg = document.getElementById("form-msg").value.trim();
  if (!name || !email || !msg) {
    toast("Harap isi semua field.", "error");
    return;
  }
  const messages = getData("messages") || [];
  messages.unshift({
    id: uid(),
    name,
    email,
    msg,
    date: new Date().toLocaleString("id-ID"),
  });
  setData("messages", messages);
  document.getElementById("form-name").value = "";
  document.getElementById("form-email").value = "";
  document.getElementById("form-msg").value = "";
  toast("Pesan berhasil dikirim!", "success");

  // Update counter di overview admin (jika ada)
  updateOverviewStats();
}

function renderMessages() {
  const messages = getData("messages") || [];
  const list = document.getElementById("messages-list");
  const empty = document.getElementById("messages-empty");
  const msgCount = document.getElementById("msg-count");

  // Cek apakah elemen ada (karena hanya ada di admin panel)
  if (!list || !empty || !msgCount) return;

  msgCount.textContent = messages.length;

  list.innerHTML = messages
    .map(
      (m) => `
    <div class="bg-ink3 rounded-2xl border border-white/5 p-5">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-sm">${m.name} <span class="text-muted font-normal text-xs">&lt;${m.email}&gt;</span></p>
          <p class="text-xs text-dim mt-0.5">${m.date}</p>
          <p class="text-muted text-sm mt-3 leading-relaxed whitespace-pre-wrap">${m.msg}</p>
        </div>
        <button onclick="deleteMessage(${m.id})" class="text-dim hover:text-red-400 transition-all flex-shrink-0">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    </div>`,
    )
    .join("");

  empty.classList.toggle("hidden", messages.length > 0);
  list.classList.toggle("hidden", messages.length === 0);
  lucide.createIcons();
}

function deleteMessage(id) {
  showConfirm(() => {
    setData(
      "messages",
      (getData("messages") || []).filter((m) => m.id !== id),
    );
    toast("Pesan dihapus.", "info");
    renderMessages();
    updateOverviewStats();
  });
}

function clearMessages() {
  const messages = getData("messages") || [];
  if (!messages.length) {
    toast("Tidak ada pesan untuk dihapus.", "info");
    return;
  }
  showConfirm(() => {
    setData("messages", []);
    toast("Semua pesan dihapus.", "info");
    renderMessages();
    updateOverviewStats();
  });
}

// ─────────────────────────────────────────
//  FOOTER
// ─────────────────────────────────────────
function renderFooter() {
  const p = getData("profile");
  document.getElementById("footer-name").textContent = p.name;
  document.getElementById("footer-year").textContent = new Date().getFullYear();
  document.getElementById("footer-github").href = p.github;
  document.getElementById("footer-linkedin").href = p.linkedin;
  document.getElementById("footer-Instagram").href = p.Instagram;
}

// ─────────────────────────────────────────
//  ADMIN TABS
// ─────────────────────────────────────────
let currentAdminTab = "overview"; // Variable untuk track tab aktif

function adminTab(tab) {
  currentAdminTab = tab; // Simpan tab yang aktif

  // Toggle active class untuk sidebar
  document.querySelectorAll(".adm-tab").forEach((t) => {
    t.classList.remove("active-adm");
    if (t.dataset.adm === tab) t.classList.add("active-adm");
  });

  // Toggle active class untuk mobile tabs
  document.querySelectorAll(".mob-adm").forEach((t) => {
    t.classList.remove("bg-cyan", "text-ink", "border-cyan");
    t.classList.add("text-muted", "border-white/10");
    if (t.dataset.adm === tab) {
      t.classList.remove("text-muted", "border-white/10");
      t.classList.add("bg-cyan", "text-ink", "border-cyan");
    }
  });

  // Toggle panel visibility
  document
    .querySelectorAll(".adm-panel")
    .forEach((p) => p.classList.add("hidden"));
  const panel = document.getElementById(`adm-${tab}`);
  if (panel) panel.classList.remove("hidden");

  // AUTO REFRESH berdasarkan tab admin
  refreshAdminTab(tab);
}

// Fungsi untuk refresh konten admin berdasarkan tab
function refreshAdminTab(tab) {
  switch (tab) {
    case "overview":
      updateOverviewStats();
      renderAdmin();
      break;
    case "profile":
      loadProfileForm();
      break;
    case "projects-a":
      renderAdmProjects();
      break;
    case "skills-a":
      renderAdmSkills();
      break;
    case "exp-a":
      renderAdmExp();
      break;
    case "films-a":
      renderAdmFilms();
      break;
    case "music-a":
      renderAdmMusic();
      break;
    case "books-a":
      renderAdmBooks();
      break;
    case "games-a":
      renderAdmGames();
      break;
    case "blog-a":
      renderAdmBlog();
      break;
    case "messages-a":
      renderMessages(); // Refresh pesan masuk
      break;
  }

  // Refresh icons setelah render
  setTimeout(() => lucide.createIcons(), 100);
}

function updateOverviewStats() {
  const projects = getData("projects") || [];
  const skills = getData("skills") || [];
  const films = getData("films") || [];
  const blogs = getData("blogs") || [];
  const messages = getData("messages") || [];

  // Update overview cards
  const ovProjects = document.getElementById("ov-projects");
  const ovSkills = document.getElementById("ov-skills");
  const ovFilms = document.getElementById("ov-films");
  const ovBlogs = document.getElementById("ov-blogs");

  if (ovProjects) ovProjects.textContent = projects.length;
  if (ovSkills) ovSkills.textContent = skills.length;
  if (ovFilms) ovFilms.textContent = films.length;
  if (ovBlogs) ovBlogs.textContent = blogs.length;

  // Update message count di admin panel (jika ada)
  const msgCount = document.getElementById("msg-count");
  if (msgCount) msgCount.textContent = messages.length;
}

// ─────────────────────────────────────────
//  ADMIN RENDER
// ─────────────────────────────────────────
function renderAdmin() {
  renderOverview();
  lucide.createIcons();
}

function renderOverview() {
  const proj = (getData("projects") || []).length;
  const sk = (getData("skills") || []).length;
  const films = (getData("films") || []).length;
  const blogs = (getData("blogs") || []).length;
  document.getElementById("ov-projects").textContent = proj;
  document.getElementById("ov-skills").textContent = sk;
  document.getElementById("ov-films").textContent = films;
  document.getElementById("ov-blogs").textContent = blogs;
  document.getElementById("stat-projects").textContent = (
    getData("projects") || []
  ).filter((x) => x.status === "Selesai").length;
  document.getElementById("stat-skills").textContent = sk;
  document.getElementById("stat-blogs").textContent = blogs;

  // Storage doughnut
  destroyChart("storageChart");
  new Chart(document.getElementById("storageChart"), {
    type: "doughnut",
    data: {
      labels: ["Proyek", "Skill", "Film", "Musik", "Buku", "Games", "Blog"],
      datasets: [
        {
          data: [
            proj,
            sk,
            films,
            (getData("music") || []).length,
            (getData("books") || []).length,
            (getData("games") || []).length,
            blogs,
          ],
          backgroundColor: CHART_COLORS,
          borderColor: "#1e2626",
          borderWidth: 3,
          hoverOffset: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "60%",
      plugins: {
        legend: {
          position: "right",
          labels: { boxWidth: 12, padding: 14, font: { size: 11 } },
        },
      },
    },
  });
  lucide.createIcons();
}

// ── Profile form ──
function loadProfileForm() {
  const p = getData("profile");
  document.getElementById("p-name").value = p.name;
  document.getElementById("p-role").value = p.role;
  document.getElementById("p-loc").value = p.location;
  document.getElementById("p-email").value = p.email;
  document.getElementById("p-github").value = p.github;
  document.getElementById("p-linkedin").value = p.linkedin;
  document.getElementById("p-Instagram").value = p.Instagram;
  document.getElementById("p-avatar").value = p.avatar;
  document.getElementById("p-tagline").value = p.tagline;
  document.getElementById("p-bio").value = p.bio;
  document.getElementById("p-avail").checked = p.available;
}

function saveProfile() {
  setData("profile", {
    name: document.getElementById("p-name").value,
    role: document.getElementById("p-role").value,
    location: document.getElementById("p-loc").value,
    email: document.getElementById("p-email").value,
    github: document.getElementById("p-github").value,
    linkedin: document.getElementById("p-linkedin").value,
    Instagram: document.getElementById("p-Instagram").value,
    avatar: document.getElementById("p-avatar").value || "👨‍💻",
    tagline: document.getElementById("p-tagline").value,
    bio: document.getElementById("p-bio").value,
    available: document.getElementById("p-avail").checked,
  });
  toast("Profil berhasil disimpan! ✓", "success");
  renderFooter();
}

// ─────────────────────────────────────────
//  ADMIN SEARCH + PAGINATION STATE
// ─────────────────────────────────────────
const admState = {
  projects: { search: "", page: 1, perPage: 8 },
  skills: { search: "", page: 1, perPage: 8 },
  films: { search: "", page: 1, perPage: 8 },
  music: { search: "", page: 1, perPage: 8 },
  books: { search: "", page: 1, perPage: 8 },
  games: { search: "", page: 1, perPage: 8 },
  blogs: { search: "", page: 1, perPage: 8 },
};

function admPaginator(total, state, renderFn, containerId) {
  const totalPages = Math.max(1, Math.ceil(total / state.perPage));
  if (state.page > totalPages) state.page = totalPages;
  const start = (state.page - 1) * state.perPage + 1;
  const end = Math.min(state.page * state.perPage, total);
  const el = document.getElementById(containerId);
  if (!el) return;
  if (totalPages <= 1) {
    el.innerHTML = "";
    return;
  }
  let pages = "";
  for (let i = 1; i <= totalPages; i++) {
    pages += `<button onclick="(${renderFn.name}_goPage)(${i})" class="w-8 h-8 text-xs rounded-lg font-mono ${i === state.page ? "bg-cyan text-ink font-bold" : "bg-ink3 text-muted hover:bg-ink4"} transition-all">${i}</button>`;
  }
  el.innerHTML = `<div class="flex items-center gap-2 flex-wrap mt-4">
    <span class="text-xs text-dim font-mono">${start}–${end} dari ${total}</span>
    <div class="flex gap-1">${pages}</div>
  </div>`;
}

// ─── Projects admin ──
function renderAdmProjects() {
  const q = admState.projects.search.toLowerCase();
  const all = (getData("projects") || []).filter(
    (p) =>
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.tech.toLowerCase().includes(q),
  );
  const total = all.length;
  const { page, perPage } = admState.projects;
  const slice = all.slice((page - 1) * perPage, page * perPage);
  document.getElementById("adm-projects-tbody").innerHTML =
    slice
      .map(
        (p) => `
    <tr class="border-b border-white/5 hover:bg-white/2 transition-all">
      <td class="px-4 py-3.5"><div class="flex items-center gap-3"><span class="text-xl">${p.image || "📁"}</span><span class="font-medium text-sm">${p.title}</span></div></td>
      <td class="px-4 py-3.5 text-xs text-muted max-w-[180px] truncate">${p.tech}</td>
      <td class="px-4 py-3.5">${statusBadge(p.status)}</td>
      <td class="px-4 py-3.5"><span class="text-xs ${p.featured ? "text-mint" : "text-dim"}">${p.featured ? "★ Ya" : "—"}</span></td>
      <td class="px-4 py-3.5 text-right">
        <div class="flex items-center justify-end gap-2">
          <button onclick="editProject(${p.id})" class="text-xs flex items-center gap-1 bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all"><i data-lucide="pencil" class="w-3 h-3"></i> Edit</button>
          <button onclick="deleteItem('projects',${p.id})" class="text-xs flex items-center gap-1 bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
        </div>
      </td>
    </tr>`,
      )
      .join("") ||
    '<tr><td colspan="5" class="text-center py-8 text-muted text-sm">Tidak ada hasil</td></tr>';
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

function openProjectModal(data = null) {
  document.getElementById("modal-project-title").textContent = data
    ? "Edit Proyek"
    : "Tambah Proyek";
  document.getElementById("proj-id").value = data?.id || "";
  document.getElementById("proj-title").value = data?.title || "";
  document.getElementById("proj-desc").value = data?.desc || "";
  document.getElementById("proj-tech").value = data?.tech || "";
  document.getElementById("proj-status").value = data?.status || "Selesai";
  document.getElementById("proj-link").value = data?.link || "";
  document.getElementById("proj-github").value = data?.github || "";
  document.getElementById("proj-image").value = data?.image || "";
  document.getElementById("proj-featured").checked = data?.featured || false;
  openModal("modal-project");
}

function editProject(id) {
  openProjectModal((getData("projects") || []).find((p) => p.id === id));
}

function saveProject() {
  const id = document.getElementById("proj-id").value;
  const item = {
    id: id ? parseInt(id) : uid(),
    title: document.getElementById("proj-title").value,
    desc: document.getElementById("proj-desc").value,
    tech: document.getElementById("proj-tech").value,
    status: document.getElementById("proj-status").value,
    link: document.getElementById("proj-link").value,
    github: document.getElementById("proj-github").value,
    image: document.getElementById("proj-image").value || "📁",
    featured: document.getElementById("proj-featured").checked,
  };
  let list = getData("projects") || [];
  if (id) {
    list = list.map((p) => (p.id === parseInt(id) ? item : p));
  } else {
    list.push(item);
  }
  setData("projects", list);
  closeModal("modal-project");
  toast(id ? "Proyek diperbarui!" : "Proyek ditambahkan!", "success");
  renderAdmProjects();
}

// ── Skills admin ──
function renderAdmSkills() {
  const q = admState.skills.search.toLowerCase();
  const all = (getData("skills") || []).filter(
    (s) =>
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q),
  );
  const total = all.length;
  const { page, perPage } = admState.skills;
  const slice = all.slice((page - 1) * perPage, page * perPage);
  document.getElementById("adm-skills-tbody").innerHTML =
    slice
      .map(
        (s) => `
    <tr class="border-b border-white/5 hover:bg-white/2 transition-all">
      <td class="px-4 py-3.5 font-medium text-sm">${s.name}</td>
      <td class="px-4 py-3.5"><span class="text-xs font-mono bg-ink3 text-muted px-2.5 py-0.5 rounded-full">${s.category}</span></td>
      <td class="px-4 py-3.5">
        <div class="flex items-center gap-3">
          <div class="h-1.5 bg-ink4 rounded-full overflow-hidden w-28"><div class="h-full bg-cyan rounded-full" style="width:${s.level}%"></div></div>
          <span class="font-mono text-xs text-cyan">${s.level}%</span>
        </div>
      </td>
      <td class="px-4 py-3.5 text-right">
        <div class="flex items-center justify-end gap-2">
          <button onclick="editSkill(${s.id})" class="text-xs flex items-center gap-1 bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all"><i data-lucide="pencil" class="w-3 h-3"></i> Edit</button>
          <button onclick="deleteItem('skills',${s.id})" class="text-xs flex items-center gap-1 bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
        </div>
      </td>
    </tr>`,
      )
      .join("") ||
    '<tr><td colspan="4" class="text-center py-8 text-muted text-sm">Tidak ada hasil</td></tr>';
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
  document.getElementById("modal-skill-title").textContent = "Edit Skill";
  document.getElementById("skill-id").value = s.id;
  document.getElementById("skill-name").value = s.name;
  document.getElementById("skill-cat").value = s.category;
  document.getElementById("skill-level").value = s.level;
  document.getElementById("skill-level-label").textContent = s.level;
  openModal("modal-skill");
}

function saveSkill() {
  const id = document.getElementById("skill-id").value;
  const item = {
    id: id ? parseInt(id) : uid(),
    name: document.getElementById("skill-name").value,
    category: document.getElementById("skill-cat").value,
    level: parseInt(document.getElementById("skill-level").value),
  };
  let list = getData("skills") || [];
  if (id) {
    list = list.map((s) => (s.id === parseInt(id) ? item : s));
  } else {
    list.push(item);
  }
  setData("skills", list);
  closeModal("modal-skill");
  toast(id ? "Skill diperbarui!" : "Skill ditambahkan!", "success");
  renderAdmSkills();
  document.getElementById("skill-id").value = "";
  document.getElementById("modal-skill-title").textContent = "Tambah Skill";
}

// ── Experience admin ──
function renderAdmExp() {
  const list = getData("experience") || [];
  document.getElementById("adm-exp-list").innerHTML =
    list
      .map(
        (e) => `
    <div class="bg-ink2 rounded-2xl border border-white/5 p-5 flex items-start justify-between gap-4">
      <div>
        <p class="font-mono text-xs text-mint mb-1">${e.year}</p>
        <p class="font-bold text-sm">${e.title} @ ${e.company}</p>
        <p class="text-muted text-xs mt-1">${e.desc}</p>
        ${e.active ? '<span class="text-xs text-cyan mt-2 inline-block font-mono">● Aktif sekarang</span>' : ""}
      </div>
      <div class="flex gap-2 flex-shrink-0">
        <button onclick="editExp(${e.id})" class="text-xs flex items-center gap-1 bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all"><i data-lucide="pencil" class="w-3 h-3"></i></button>
        <button onclick="deleteItem('experience',${e.id})" class="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
      </div>
    </div>`,
      )
      .join("") || '<p class="text-muted text-sm">Belum ada pengalaman.</p>';
  lucide.createIcons();
}

function editExp(id) {
  const e = (getData("experience") || []).find((x) => x.id === id);
  document.getElementById("modal-exp-title").textContent = "Edit Pengalaman";
  document.getElementById("exp-id").value = e.id;
  document.getElementById("exp-year").value = e.year;
  document.getElementById("exp-title").value = e.title;
  document.getElementById("exp-company").value = e.company;
  document.getElementById("exp-desc").value = e.desc;
  document.getElementById("exp-active").checked = e.active;
  openModal("modal-exp");
}

function saveExp() {
  const id = document.getElementById("exp-id").value;
  const item = {
    id: id ? parseInt(id) : uid(),
    year: document.getElementById("exp-year").value,
    title: document.getElementById("exp-title").value,
    company: document.getElementById("exp-company").value,
    desc: document.getElementById("exp-desc").value,
    active: document.getElementById("exp-active").checked,
  };
  let list = getData("experience") || [];
  if (id) {
    list = list.map((e) => (e.id === parseInt(id) ? item : e));
  } else {
    list.push(item);
  }
  setData("experience", list);
  closeModal("modal-exp");
  toast(id ? "Pengalaman diperbarui!" : "Pengalaman ditambahkan!", "success");
  renderAdmExp();
  document.getElementById("exp-id").value = "";
  document.getElementById("modal-exp-title").textContent = "Tambah Pengalaman";
}

// ── Films admin ──
function renderAdmFilms() {
  const q = admState.films.search.toLowerCase();
  const all = (getData("films") || []).filter(
    (f) =>
      !q ||
      f.title.toLowerCase().includes(q) ||
      f.genre.toLowerCase().includes(q),
  );
  const total = all.length;
  const { page, perPage } = admState.films;
  const slice = all.slice((page - 1) * perPage, page * perPage);
  document.getElementById("adm-films-tbody").innerHTML =
    slice
      .map(
        (f, i) => `
    <tr class="border-b border-white/5 hover:bg-white/2 transition-all">
      <td class="px-4 py-3.5 font-mono font-bold text-mint">${(page - 1) * perPage + i + 1}</td>
      <td class="px-4 py-3.5 font-medium text-sm">${f.title}</td>
      <td class="px-4 py-3.5"><span class="text-xs font-mono bg-cyan/10 text-cyan px-2 py-0.5 rounded-full">${f.genre}</span></td>
      <td class="px-4 py-3.5 text-sm text-muted">${f.rating}/10</td>
      <td class="px-4 py-3.5 text-right">
        <div class="flex items-center justify-end gap-2">
          <button onclick="editFilm(${f.id})" class="text-xs flex items-center gap-1 bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all"><i data-lucide="pencil" class="w-3 h-3"></i></button>
          <button onclick="deleteItem('films',${f.id})" class="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
        </div>
      </td>
    </tr>`,
      )
      .join("") ||
    '<tr><td colspan="5" class="text-center py-8 text-muted text-sm">Tidak ada hasil</td></tr>';
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
  document.getElementById("modal-film-title").textContent = "Edit Film";
  document.getElementById("film-id").value = f.id;
  document.getElementById("film-title").value = f.title;
  document.getElementById("film-genre").value = f.genre;
  document.getElementById("film-year").value = f.year;
  document.getElementById("film-rating").value = f.rating;
  document.getElementById("film-rating-label").textContent = f.rating;
  document.getElementById("film-comment").value = f.comment || "";
  openModal("modal-film");
}

function saveFilm() {
  const id = document.getElementById("film-id").value;
  const item = {
    id: id ? parseInt(id) : uid(),
    title: document.getElementById("film-title").value,
    genre: document.getElementById("film-genre").value,
    year: parseInt(document.getElementById("film-year").value),
    rating: parseInt(document.getElementById("film-rating").value),
    comment: document.getElementById("film-comment").value,
  };
  let list = getData("films") || [];
  if (id) {
    list = list.map((f) => (f.id === parseInt(id) ? item : f));
  } else {
    list.push(item);
  }
  setData("films", list);
  closeModal("modal-film");
  toast(id ? "Film diperbarui!" : "Film ditambahkan!", "success");
  renderAdmFilms();
  document.getElementById("film-id").value = "";
  document.getElementById("modal-film-title").textContent = "Tambah Film";
}

// ── Music admin ──
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
  document.getElementById("adm-music-list").innerHTML =
    slice
      .map(
        (m) => `
    <div class="bg-ink2 rounded-2xl border border-white/5 p-4 flex items-center gap-4">
      <span class="text-xl w-8 text-center">${m.emoji || "🎵"}</span>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-sm">${m.title}</p>
        <p class="text-xs text-muted">${m.artist} · <span class="text-cyan">${m.genre}</span> · ${m.mood}</p>
      </div>
      <div class="flex gap-2">
        <button onclick="editMusic(${m.id})" class="text-xs bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all"><i data-lucide="pencil" class="w-3 h-3"></i></button>
        <button onclick="deleteItem('music',${m.id})" class="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
      </div>
    </div>`,
      )
      .join("") || '<p class="text-muted text-sm">Tidak ada hasil.</p>';
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
  document.getElementById("modal-music-title").textContent = "Edit Musik";
  document.getElementById("music-id").value = m.id;
  document.getElementById("music-title").value = m.title;
  document.getElementById("music-artist").value = m.artist;
  document.getElementById("music-genre").value = m.genre;
  document.getElementById("music-mood").value = m.mood;
  document.getElementById("music-emoji").value = m.emoji || "🎵";
  openModal("modal-music");
}

function saveMusic() {
  const id = document.getElementById("music-id").value;
  const item = {
    id: id ? parseInt(id) : uid(),
    title: document.getElementById("music-title").value,
    artist: document.getElementById("music-artist").value,
    genre: document.getElementById("music-genre").value,
    mood: document.getElementById("music-mood").value,
    emoji: document.getElementById("music-emoji").value || "🎵",
  };
  let list = getData("music") || [];
  if (id) {
    list = list.map((m) => (m.id === parseInt(id) ? item : m));
  } else {
    list.push(item);
  }
  setData("music", list);
  closeModal("modal-music");
  toast(id ? "Musik diperbarui!" : "Musik ditambahkan!", "success");
  renderAdmMusic();
  document.getElementById("music-id").value = "";
  document.getElementById("modal-music-title").textContent = "Tambah Musik";
}

// ── Books admin ──
function renderAdmBooks() {
  const q = admState.books.search.toLowerCase();
  const all = (getData("books") || []).filter(
    (b) =>
      !q ||
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q),
  );
  const total = all.length;
  const { page, perPage } = admState.books;
  const slice = all.slice((page - 1) * perPage, page * perPage);
  document.getElementById("adm-books-list").innerHTML =
    slice
      .map(
        (b) => `
    <div class="bg-ink2 rounded-2xl border border-white/5 p-4 flex items-center gap-4">
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-sm">${b.title}</p>
        <p class="text-xs text-muted">oleh ${b.author} · ${b.genre} · <span class="${b.status === "Sudah Baca" ? "text-mint" : b.status === "Sedang Baca" ? "text-cyan" : "text-muted"}">${b.status}</span></p>
      </div>
      <span class="text-xs font-mono text-muted">${b.rating}/10</span>
      <div class="flex gap-2">
        <button onclick="editBook(${b.id})" class="text-xs bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all"><i data-lucide="pencil" class="w-3 h-3"></i></button>
        <button onclick="deleteItem('books',${b.id})" class="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
      </div>
    </div>`,
      )
      .join("") || '<p class="text-muted text-sm">Tidak ada hasil.</p>';
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
  document.getElementById("modal-book-title").textContent = "Edit Buku";
  document.getElementById("book-id").value = b.id;
  document.getElementById("book-title").value = b.title;
  document.getElementById("book-author").value = b.author;
  document.getElementById("book-genre").value = b.genre;
  document.getElementById("book-status").value = b.status;
  document.getElementById("book-rating").value = b.rating;
  document.getElementById("book-rating-label").textContent = b.rating;
  document.getElementById("book-review").value = b.review || "";
  openModal("modal-book");
}

function saveBook() {
  const id = document.getElementById("book-id").value;
  const item = {
    id: id ? parseInt(id) : uid(),
    title: document.getElementById("book-title").value,
    author: document.getElementById("book-author").value,
    genre: document.getElementById("book-genre").value,
    status: document.getElementById("book-status").value,
    rating: parseInt(document.getElementById("book-rating").value),
    review: document.getElementById("book-review").value,
  };
  let list = getData("books") || [];
  if (id) {
    list = list.map((b) => (b.id === parseInt(id) ? item : b));
  } else {
    list.push(item);
  }
  setData("books", list);
  closeModal("modal-book");
  toast(id ? "Buku diperbarui!" : "Buku ditambahkan!", "success");
  renderAdmBooks();
  document.getElementById("book-id").value = "";
  document.getElementById("modal-book-title").textContent = "Tambah Buku";
}

// ── Games admin ──
function renderAdmGames() {
  const q = admState.games.search.toLowerCase();
  const all = (getData("games") || []).filter(
    (g) =>
      !q ||
      g.title.toLowerCase().includes(g) ||
      g.platform.toLowerCase().includes(q) ||
      g.title.toLowerCase().includes(q),
  );
  const total = all.length;
  const { page, perPage } = admState.games;
  const slice = all.slice((page - 1) * perPage, page * perPage);
  document.getElementById("adm-games-list").innerHTML =
    slice
      .map(
        (g) => `
    <div class="bg-ink2 rounded-2xl border border-white/5 p-4 flex items-center gap-4">
      <span class="text-2xl">${g.emoji || "🎮"}</span>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-sm">${g.title}</p>
        <p class="text-xs text-muted">${g.platform} · ${g.genre} · <span class="${g.status === "Sudah Tamat" ? "text-mint" : g.status === "Sedang Main" ? "text-cyan" : "text-muted"}">${g.status}</span></p>
      </div>
      <span class="text-xs font-mono text-muted">${g.rating}/10</span>
      <div class="flex gap-2">
        <button onclick="editGame(${g.id})" class="text-xs bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all"><i data-lucide="pencil" class="w-3 h-3"></i></button>
        <button onclick="deleteItem('games',${g.id})" class="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
      </div>
    </div>`,
      )
      .join("") || '<p class="text-muted text-sm">Tidak ada hasil.</p>';
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
  document.getElementById("modal-game-title").textContent = "Edit Game";
  document.getElementById("game-id").value = g.id;
  document.getElementById("game-title").value = g.title;
  document.getElementById("game-platform").value = g.platform;
  document.getElementById("game-genre").value = g.genre;
  document.getElementById("game-status").value = g.status;
  document.getElementById("game-rating").value = g.rating;
  document.getElementById("game-rating-label").textContent = g.rating;
  document.getElementById("game-emoji").value = g.emoji || "🎮";
  openModal("modal-game");
}

function saveGame() {
  const id = document.getElementById("game-id").value;
  const item = {
    id: id ? parseInt(id) : uid(),
    title: document.getElementById("game-title").value,
    platform: document.getElementById("game-platform").value,
    genre: document.getElementById("game-genre").value,
    status: document.getElementById("game-status").value,
    rating: parseInt(document.getElementById("game-rating").value),
    emoji: document.getElementById("game-emoji").value || "🎮",
  };
  let list = getData("games") || [];
  if (id) {
    list = list.map((g) => (g.id === parseInt(id) ? item : g));
  } else {
    list.push(item);
  }
  setData("games", list);
  closeModal("modal-game");
  toast(id ? "Game diperbarui!" : "Game ditambahkan!", "success");
  renderAdmGames();
  document.getElementById("game-id").value = "";
  document.getElementById("modal-game-title").textContent = "Tambah Game";
}

// ── Blog admin ──
function renderAdmBlog() {
  const q = admState.blogs.search.toLowerCase();
  const all = (getData("blogs") || []).filter(
    (b) =>
      !q ||
      b.title.toLowerCase().includes(q) ||
      (b.category || "").toLowerCase().includes(q),
  );
  const total = all.length;
  const { page, perPage } = admState.blogs;
  const slice = all.slice((page - 1) * perPage, page * perPage);
  document.getElementById("adm-blog-list").innerHTML =
    slice
      .map(
        (b) => `
    <div class="bg-ink2 rounded-2xl border border-white/5 p-5 flex items-start gap-4">
      <span class="text-2xl flex-shrink-0">${b.emoji || "📝"}</span>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-sm">${b.title}</p>
        <p class="text-xs text-muted mt-0.5">${b.category} · ${b.date || "—"}</p>
        <p class="text-xs text-dim mt-1 truncate">${b.summary}</p>
      </div>
      <div class="flex gap-2 flex-shrink-0">
        <button onclick="editBlog(${b.id})" class="text-xs bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg hover:bg-cyan/20 transition-all"><i data-lucide="pencil" class="w-3 h-3"></i></button>
        <button onclick="deleteItem('blogs',${b.id})" class="text-xs bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-all"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
      </div>
    </div>`,
      )
      .join("") || '<p class="text-muted text-sm">Tidak ada hasil.</p>';
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
  document.getElementById("modal-blog-title").textContent = "Edit Artikel";
  document.getElementById("blog-id").value = b.id;
  document.getElementById("blog-title").value = b.title;
  document.getElementById("blog-cat").value = b.category;
  document.getElementById("blog-emoji").value = b.emoji || "📝";
  document.getElementById("blog-summary").value = b.summary;
  document.getElementById("blog-content").value = b.content || "";
  document.getElementById("blog-tags").value = b.tags || "";
  openModal("modal-blog");
}

function saveBlog() {
  const id = document.getElementById("blog-id").value;
  const item = {
    id: id ? parseInt(id) : uid(),
    title: document.getElementById("blog-title").value,
    category: document.getElementById("blog-cat").value,
    emoji: document.getElementById("blog-emoji").value || "📝",
    summary: document.getElementById("blog-summary").value,
    content: document.getElementById("blog-content").value,
    tags: document.getElementById("blog-tags").value,
    date: id
      ? (getData("blogs") || []).find((b) => b.id === parseInt(id))?.date
      : new Date().toISOString().split("T")[0],
  };
  let list = getData("blogs") || [];
  if (id) {
    list = list.map((b) => (b.id === parseInt(id) ? item : b));
  } else {
    list.push(item);
  }
  setData("blogs", list);
  closeModal("modal-blog");
  toast(id ? "Artikel diperbarui!" : "Artikel ditambahkan!", "success");
  renderAdmBlog();
  document.getElementById("blog-id").value = "";
  document.getElementById("modal-blog-title").textContent = "Tambah Artikel";
}

// ── Generic delete ──
function deleteItem(key, id) {
  showConfirm(() => {
    setData(
      key,
      (getData(key) || []).filter((x) => x.id !== id),
    );
    toast("Data berhasil dihapus.", "info");
    const renderMap = {
      projects: renderAdmProjects,
      skills: renderAdmSkills,
      experience: renderAdmExp,
      films: renderAdmFilms,
      music: renderAdmMusic,
      books: renderAdmBooks,
      games: renderAdmGames,
      blogs: renderAdmBlog,
    };
    if (renderMap[key]) renderMap[key]();
  });
}

// ── Reset all ──
function resetAllData() {
  showConfirm(() => {
    Object.keys(DEFAULTS).forEach((k) => setData(k, DEFAULTS[k]));
    toast("Semua data direset ke default.", "info");
    renderOverview();
  });
}

// ─────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initData();
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
  document.getElementById("confirm-ok-btn").addEventListener("click", () => {
    if (_confirmCb) {
      _confirmCb();
      closeConfirm();
    }
  });

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
