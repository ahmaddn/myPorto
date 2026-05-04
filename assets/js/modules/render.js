// ═══════════════════════════════════════════
//  RENDER — render.js
// ═══════════════════════════════════════════

import { safeSet, safeGet, toast } from "./utils.js";
import { FIREBASE_CACHE, chartInstances } from "./state.js";
import { getCommits, commitsPerMonth, getLast12Months } from "./api.js";
import { 
    renderSkillsRadarChart, 
    renderFeaturedProjects,
    renderTechDonutChart,
    renderSkillCategoryChart,
    renderMusicArtistChart,
    renderBooksGenreChart,
    renderGamesGenreChart,
    renderFilmsGenreChart,
    renderFilmsRatingChart,
    renderMusicMoodChart,
    renderBooksStatusChart,
    renderGamesPlatformChart,
    renderStorageChart,
    renderMediaChart
} from "./charts.js";


export function renderAdminProfile() {
    const p = FIREBASE_CACHE.profile || {};
    safeSet("p-name", "value", p.name || "");
    safeSet("p-role", "value", p.role || "");
    safeSet("p-loc", "value", p.location || "");
    safeSet("p-email", "value", p.email || "");
    safeSet("p-github", "value", p.github || "");
    safeSet("p-linkedin", "value", p.linkedin || "");
    safeSet("p-Instagram", "value", p.instagram || "");
    safeSet("p-avatar", "value", p.avatar || "");
    safeSet("p-tagline", "value", p.tagline || "");
    safeSet("p-bio", "value", p.bio || "");
    const avail = safeGet("p-avail");
    if (avail) avail.checked = p.available || false;
}


export async function renderDashboard() {
  const profile = FIREBASE_CACHE.profile || {};
  const skills = FIREBASE_CACHE.skills || [];
  const exp = FIREBASE_CACHE.experience || [];
  const projects = FIREBASE_CACHE.projects || [];

  safeSet("hero-name-display", "textContent", profile.name);
  safeSet("hero-role-display", "textContent", profile.role);
  safeSet("hero-tagline-display", "textContent", profile.tagline);

  const completedProjects = projects.filter((p) => p.status === "Selesai").length;
  
  if (window.animateCounter) {
      window.animateCounter("stat-projects", completedProjects);
      window.animateCounter("stat-skills", skills.length);
      window.animateCounter("stat-exp", exp.length, "+");
  } else {
      safeSet("stat-projects", "textContent", completedProjects);
      safeSet("stat-skills", "textContent", skills.length);
      safeSet("stat-exp", "textContent", exp.length + "+");
  }

  renderSkillsRadarChart();
  renderFeaturedProjects();
  
  try {
    const commits = await getCommits();
    const chartData = commitsPerMonth(commits);
    const chartLabels = getLast12Months();
    renderActivityChart(chartLabels, chartData);
  } catch (e) { console.error(e); }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderActivityChart(labels, data) {
    const canvas = safeGet("activityChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (chartInstances.activityChart) chartInstances.activityChart.destroy();
    chartInstances.activityChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Commits",
                data: data,
                backgroundColor: "rgba(119, 202, 237, 0.2)",
                borderColor: "#77caed",
                borderWidth: 1.5,
                borderRadius: 6,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: "rgba(255,255,255,0.03)" }, ticks: { color: "#7a9e9a", font: { size: 11 } } },
                y: { grid: { color: "rgba(255,255,255,0.03)" }, ticks: { color: "#7a9e9a", font: { size: 11 } } },
            },
        },
    });
}

export function renderProjects() {
    const projects = FIREBASE_CACHE.projects || [];
    const grid = safeGet("projects-grid");
    if (!grid) return;

    if (projects.length === 0) {
        grid.innerHTML = '<p class="text-center text-muted py-10">Belum ada proyek.</p>';
        return;
    }

    grid.innerHTML = projects.map(p => `
        <div class="project-card bg-ink2 rounded-2xl border border-white/5 p-6 hover:border-cyan/30 transition-all">
            <div class="flex items-start justify-between mb-3">
                <div class="w-12 h-12 bg-cyan/10 rounded-xl flex items-center justify-center">
                    <i data-lucide="${p.icon || "code-2"}" class="w-6 h-6 text-cyan"></i>
                </div>
                <span class="text-xs px-2 py-1 rounded-lg bg-cyan/10 text-cyan">${p.status}</span>
            </div>
            <h3 class="font-mono font-bold text-base mb-2">${p.title}</h3>
            <p class="text-sm text-dim leading-relaxed mb-4">${p.desc}</p>
            <div class="flex gap-2">
                <a href="${p.link}" class="text-xs bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg">Live</a>
                <a href="${p.github}" class="text-xs bg-ink3 text-muted px-3 py-1.5 rounded-lg">Code</a>
            </div>
        </div>
    `).join("");
    
    renderTechDonutChart();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

export function renderAbout() {
    const profile = FIREBASE_CACHE.profile || {};
    const exp = FIREBASE_CACHE.experience || [];
    
    safeSet("about-bio-display", "textContent", profile.bio);
    safeSet("about-location", "textContent", profile.location);
    safeSet("about-email", "textContent", profile.email);

    const timeline = safeGet("timeline-list");
    if (timeline) {
        timeline.innerHTML = exp.map(e => `
            <div class="flex gap-4">
                <div class="flex-shrink-0 w-3 h-3 ${e.active ? 'bg-mint shadow-glow-mint' : 'bg-ink4'} rounded-full mt-1.5"></div>
                <div class="flex-1 pb-6">
                    <p class="text-xs text-muted mb-1">${e.year}</p>
                    <p class="font-semibold text-sm mb-0.5">${e.title}</p>
                    <p class="text-xs text-cyan mb-2">${e.company}</p>
                    <p class="text-sm text-dim leading-relaxed">${e.desc}</p>
                </div>
            </div>
        `).join("");
    }
    
    renderSkillCategoryChart();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

export function renderMedia() {
    const music = FIREBASE_CACHE.music || [];
    const books = FIREBASE_CACHE.books || [];
    const games = FIREBASE_CACHE.games || [];
    const films = FIREBASE_CACHE.films || [];

    // Summary Tables
    const filmsTbody = safeGet("films-tbody");
    if (filmsTbody) {
        filmsTbody.innerHTML = films.slice(0, 8).map((f, i) => `
            <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
                <td class="px-5 py-3 text-muted font-mono text-xs">${i + 1}</td>
                <td class="px-5 py-3 font-bold text-sm">${f.title}</td>
                <td class="px-5 py-3 text-xs text-muted">${f.genre}</td>
                <td class="px-5 py-3 text-xs text-muted">${f.year}</td>
                <td class="px-5 py-3">
                    <div class="flex items-center gap-1 text-xs text-yellow-400">
                        <i data-lucide="star" class="w-3 h-3 fill-current"></i>
                        <span>${f.rating}/10</span>
                    </div>
                </td>
                <td class="px-5 py-3 text-xs text-muted truncate max-w-[150px]">${f.review || "-"}</td>
                <td class="px-5 py-3 text-xs text-dim italic truncate max-w-[150px]">${f.comment || "-"}</td>
            </tr>
        `).join("");
    }

    const musicGrid = safeGet("music-grid");
    if (musicGrid) {
        musicGrid.innerHTML = music.slice(0, 6).map(m => `
            <div class="bg-ink3 p-4 rounded-xl flex items-center gap-4 border border-white/5 hover:border-pink-400/30 transition-all">
                <div class="w-12 h-12 bg-pink-400/10 rounded-lg flex items-center justify-center text-pink-400 flex-shrink-0">
                    <i data-lucide="music" class="w-6 h-6"></i>
                </div>
                <div class="min-w-0">
                    <p class="font-bold text-sm truncate">${m.title}</p>
                    <p class="text-xs text-muted truncate">${m.artist}</p>
                </div>
            </div>
        `).join("");
    }

    // Detail Grids
    const musicDetail = safeGet("music-detail-grid");
    if (musicDetail) {
        musicDetail.innerHTML = music.map(m => `
            <div class="bg-ink3 p-4 rounded-xl flex items-center gap-4 border border-white/5 hover:border-pink-400/30 transition-all">
                <div class="w-12 h-12 bg-pink-400/10 rounded-lg flex items-center justify-center text-pink-400 flex-shrink-0">
                    <i data-lucide="music" class="w-6 h-6"></i>
                </div>
                <div class="min-w-0">
                    <p class="font-bold text-sm truncate">${m.title}</p>
                    <p class="text-xs text-muted truncate">${m.artist}</p>
                </div>
            </div>
        `).join("");
    }

    const filmsDetailTbody = safeGet("films-detail-tbody");
    if (filmsDetailTbody) {
        filmsDetailTbody.innerHTML = films.map((f, i) => `
            <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
                <td class="px-5 py-3 text-muted font-mono text-xs">${i + 1}</td>
                <td class="px-5 py-3 font-bold text-sm">${f.title}</td>
                <td class="px-5 py-3 text-xs text-muted">${f.genre}</td>
                <td class="px-5 py-3 text-xs text-muted">${f.year}</td>
                <td class="px-5 py-3">
                    <div class="flex items-center gap-1 text-xs text-yellow-400">
                        <i data-lucide="star" class="w-3 h-3 fill-current"></i>
                        <span>${f.rating}/10</span>
                    </div>
                </td>
                <td class="px-5 py-3 text-xs text-muted truncate max-w-[150px]">${f.review || "-"}</td>
                <td class="px-5 py-3 text-xs text-dim italic truncate max-w-[150px]">${f.comment || "-"}</td>
            </tr>
        `).join("");
    }

    const booksGrid = safeGet("books-grid");
    const booksEmpty = safeGet("books-empty");
    if (booksGrid) {
        if (books.length === 0) {
            booksGrid.innerHTML = "";
            if (booksEmpty) booksEmpty.classList.remove("hidden");
        } else {
            if (booksEmpty) booksEmpty.classList.add("hidden");
            booksGrid.innerHTML = books.slice(0, 6).map(b => `
                <div class="bg-ink3 p-4 rounded-xl flex items-center gap-4 border border-white/5 hover:border-orange-400/30 transition-all">
                    <div class="w-12 h-12 bg-orange-400/10 rounded-lg flex items-center justify-center text-orange-400 flex-shrink-0">
                        <i data-lucide="book" class="w-6 h-6"></i>
                    </div>
                    <div class="min-w-0">
                        <p class="font-bold text-sm truncate">${b.title}</p>
                        <p class="text-xs text-muted truncate">${b.author || '-'}</p>
                    </div>
                </div>
            `).join("");
        }
    }

    const gamesGrid = safeGet("games-grid");
    const gamesEmpty = safeGet("games-empty");
    if (gamesGrid) {
        if (games.length === 0) {
            gamesGrid.innerHTML = "";
            if (gamesEmpty) gamesEmpty.classList.remove("hidden");
        } else {
            if (gamesEmpty) gamesEmpty.classList.add("hidden");
            gamesGrid.innerHTML = games.slice(0, 6).map(g => `
                <div class="bg-ink3 p-4 rounded-xl flex items-center gap-4 border border-white/5 hover:border-green-400/30 transition-all">
                    <div class="w-12 h-12 bg-green-400/10 rounded-lg flex items-center justify-center text-green-400 flex-shrink-0">
                        <i data-lucide="gamepad-2" class="w-6 h-6"></i>
                    </div>
                    <div class="min-w-0">
                        <p class="font-bold text-sm truncate">${g.title}</p>
                        <p class="text-xs text-muted truncate">${g.platform || '-'}</p>
                    </div>
                </div>
            `).join("");
        }
    }

    // Charts
    renderFilmsGenreChart();
    renderFilmsRatingChart();
    renderMusicArtistChart();
    renderMusicMoodChart();

    renderBooksGenreChart();
    renderBooksStatusChart();
    renderGamesGenreChart();
    renderGamesPlatformChart();
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

export function renderContact() {
    const profile = FIREBASE_CACHE.profile || {};
    safeSet("contact-email", "textContent", profile.email);
    safeSet("contact-location", "textContent", profile.location);
}

export function renderModul() {
    const moduls = FIREBASE_CACHE.modulFiles || [];
    const grid = safeGet("modul-grid");
    if (!grid) return;

    if (moduls.length === 0) {
        grid.innerHTML = '<p class="text-center text-muted py-10">Belum ada modul.</p>';
        return;
    }

    grid.innerHTML = moduls.map(m => `
        <div class="bg-ink2 rounded-2xl border border-white/5 p-6 group hover:border-cyan/30 transition-all">
            <div class="flex items-start justify-between mb-4">
                <div class="w-12 h-12 bg-cyan/10 rounded-xl flex items-center justify-center text-cyan group-hover:scale-110 transition-transform">
                    <i data-lucide="file-text" class="w-6 h-6"></i>
                </div>
                <span class="text-[10px] font-mono text-dim uppercase tracking-widest">${m.size || "PDF"}</span>
            </div>
            <h3 class="font-bold text-sm mb-2 text-[#e8f4f0] line-clamp-1">${m.name}</h3>
            <p class="text-xs text-muted mb-4 line-clamp-2">Modul pembelajaran untuk materi ${m.name.split('-')[0].trim()}.</p>
            <button onclick="openModulUserModal()" class="w-full flex items-center justify-center gap-2 text-xs bg-cyan/10 text-cyan hover:bg-cyan hover:text-ink px-4 py-2.5 rounded-xl transition-all font-semibold">
                <i data-lucide="download" class="w-3.5 h-3.5"></i> Download PDF
            </button>
        </div>
    `).join("");
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

export function renderAdminOverview() {
    const stats = {
        projects: (FIREBASE_CACHE.projects || []).length,
        skills: (FIREBASE_CACHE.skills || []).length,
        experience: (FIREBASE_CACHE.experience || []).length,
        films: (FIREBASE_CACHE.films || []).length,
        music: (FIREBASE_CACHE.music || []).length,
        books: (FIREBASE_CACHE.books || []).length,
        games: (FIREBASE_CACHE.games || []).length
    };

    safeSet("ov-projects", "textContent", stats.projects);
    safeSet("ov-skills", "textContent", stats.skills);
    safeSet("ov-experience", "textContent", stats.experience);
    safeSet("ov-films", "textContent", stats.films);
    safeSet("ov-music", "textContent", stats.music);
    safeSet("ov-books", "textContent", stats.books);
    safeSet("ov-games", "textContent", stats.games);

    renderStorageChart();
    renderMediaChart();
    
    // Auto-render all admin sections
    renderAdminProjects();
    renderAdminSkills();
    renderAdminFilms();
    renderAdminMusic();
    renderAdminBooks();
    renderAdminGames();
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

export function renderAdminProjects() {
    const list = FIREBASE_CACHE.projects || [];
    const tbody = safeGet("adm-projects-tbody");
    if (!tbody) return;
    tbody.innerHTML = list.map(p => `
        <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
            <td class="px-4 py-3 font-bold">${p.title}</td>
            <td class="px-4 py-3 text-xs text-muted">${p.tech}</td>
            <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full bg-cyan/10 text-cyan text-[10px]">${p.status}</span></td>
            <td class="px-4 py-3 text-center">${p.featured ? '⭐' : '-'}</td>
            <td class="px-4 py-3 text-right">
                <button onclick="editProject('${p.id}')" class="text-cyan hover:text-white mr-2"><i data-lucide="edit-2" class="w-3.5 h-3.5"></i></button>
                <button onclick="deleteProject('${p.id}')" class="text-red-400 hover:text-white"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
            </td>
        </tr>
    `).join("");
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

export function renderAdminSkills() {
    const list = FIREBASE_CACHE.skills || [];
    const tbody = safeGet("adm-skills-tbody");
    if (!tbody) return;
    tbody.innerHTML = list.map(s => `
        <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
            <td class="px-4 py-3 font-bold">${s.name}</td>
            <td class="px-4 py-3 text-xs text-muted">${s.category}</td>
            <td class="px-4 py-3">${s.level}%</td>
            <td class="px-4 py-3 text-right">
                <button onclick="deleteSkill('${s.id}')" class="text-red-400 hover:text-white"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
            </td>
        </tr>
    `).join("");
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

export function renderAdminFilms() {
    const list = FIREBASE_CACHE.films || [];
    const tbody = safeGet("adm-films-tbody");
    if (!tbody) return;
    tbody.innerHTML = list.map(f => `
        <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
            <td class="px-4 py-3 font-bold">${f.title}</td>
            <td class="px-4 py-3 text-xs text-muted">${f.genre}</td>
            <td class="px-4 py-3 text-xs">${f.rating}/10</td>
            <td class="px-4 py-3 text-right">
                <button onclick="deleteFilm('${f.id}')" class="text-red-400 hover:text-white"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
            </td>
        </tr>
    `).join("");
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

export function renderAdminMusic() {
    const list = FIREBASE_CACHE.music || [];
    const tbody = safeGet("adm-music-tbody");
    if (!tbody) return;
    tbody.innerHTML = list.map(m => `
        <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
            <td class="px-4 py-3 font-bold">${m.title}</td>
            <td class="px-4 py-3 text-xs text-muted">${m.artist}</td>
            <td class="px-4 py-3 text-xs">${m.genre}</td>
            <td class="px-4 py-3 text-right">
                <button onclick="deleteMusic('${m.id}')" class="text-red-400 hover:text-white"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
            </td>
        </tr>
    `).join("");
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

export function renderAdminBooks() {
    const list = FIREBASE_CACHE.books || [];
    const tbody = safeGet("adm-books-tbody");
    if (!tbody) return;
    tbody.innerHTML = list.map(b => `
        <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
            <td class="px-4 py-3 font-bold">${b.title}</td>
            <td class="px-4 py-3 text-xs text-muted">${b.author}</td>
            <td class="px-4 py-3 text-xs">${b.status}</td>
            <td class="px-4 py-3 text-right">
                <button onclick="deleteBook('${b.id}')" class="text-red-400 hover:text-white"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
            </td>
        </tr>
    `).join("");
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

export function renderAdminGames() {
    const list = FIREBASE_CACHE.games || [];
    const tbody = safeGet("adm-games-tbody");
    if (!tbody) return;
    tbody.innerHTML = list.map(g => `
        <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
            <td class="px-4 py-3 font-bold">${g.title}</td>
            <td class="px-4 py-3 text-xs text-muted">${g.platform}</td>
            <td class="px-4 py-3 text-xs">${g.rating}/10</td>
            <td class="px-4 py-3 text-right">
                <button onclick="deleteGame('${g.id}')" class="text-red-400 hover:text-white"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
            </td>
        </tr>
    `).join("");
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

export function renderAdminExperience() {
    const list = FIREBASE_CACHE.experience || [];
    const tbody = safeGet("adm-exp-tbody");
    if (!tbody) return;
    tbody.innerHTML = list.map(e => `
        <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
            <td class="px-4 py-3 font-bold">${e.title}</td>
            <td class="px-4 py-3 text-xs text-muted">${e.company}</td>
            <td class="px-4 py-3 text-xs">${e.year}</td>
            <td class="px-4 py-3 text-right">
                <button onclick="deleteExperience('${e.id}')" class="text-red-400 hover:text-white"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
            </td>
        </tr>
    `).join("");
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

export function renderAdminModul() {
    const list = FIREBASE_CACHE.modulFiles || [];
    const tbody = safeGet("adm-modul-tbody");
    const emptyMsg = safeGet("modul-empty");
    
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = "";
        if (emptyMsg) emptyMsg.classList.remove("hidden");
        return;
    }

    if (emptyMsg) emptyMsg.classList.add("hidden");
    tbody.innerHTML = list.map((m, i) => `
        <tr class="border-b border-white/5 hover:bg-white/5 transition-all">
            <td class="px-4 py-3 font-bold flex items-center gap-2">
                <i data-lucide="file-text" class="w-4 h-4 text-cyan"></i>
                <span class="truncate max-w-[200px] md:max-w-xs">${m.name}</span>
            </td>
            <td class="px-4 py-3 text-xs text-muted hidden md:table-cell">${m.size || "Unknown"}</td>
            <td class="px-4 py-3 text-right">
                <button onclick="deleteModul('${m.id}')" class="text-red-400 hover:text-white bg-red-400/10 p-2 rounded-lg transition-all hover:scale-110" title="Hapus File">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
            </td>
        </tr>
    `).join("");

    // Update toggle state visually
    const toggle = safeGet("modul-visibility-toggle");
    const label = safeGet("modul-visibility-label");
    const isVisible = FIREBASE_CACHE.settings?.modulVisible !== false;
    
    if (toggle) toggle.checked = isVisible;
    if (label) {
        label.innerHTML = isVisible 
            ? '<span class="text-mint font-bold">Aktif</span>' 
            : '<span class="text-muted">Nonaktif</span>';
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

export async function refreshModulList() {
    console.log("🔄 Refreshing modul list...");
    if (window.showToast) window.showToast("Mencari file di folder assets/file/...", "info");
    
    // File list from user screenshot and common pattern
    const commonFiles = [
        "Modul 1 - 11 PPLG 1.pdf",
        "Modul 2 - 11 PPLG 1.pdf",
        "Modul 3 - 11 PPLG 1.pdf"
    ];
    
    const detectedFiles = [];
    
    for (const filename of commonFiles) {
        try {
            // Using HEAD request to check existence without downloading
            const response = await fetch(`assets/file/${filename}`, { method: 'HEAD' });
            if (response.ok) {
                const size = response.headers.get('content-length');
                const sizeStr = size ? (parseInt(size) / 1024).toFixed(1) + " KB" : "PDF File";
                detectedFiles.push({
                    id: btoa(filename).substring(0, 10),
                    name: filename,
                    size: sizeStr,
                    path: `assets/file/${filename}`
                });
            }
        } catch (e) {
            console.warn(`File check failed for ${filename}`);
        }
    }

    if (detectedFiles.length > 0) {
        const { saveData } = await import("./data.js");
        const success = await saveData("modulFiles", detectedFiles);
        if (success) {
            if (window.showToast) window.showToast(`${detectedFiles.length} file modul berhasil dideteksi!`, "success");
            renderAdminModul();
            renderModul(); // Update public view too
        }
    } else {
        if (window.showToast) window.showToast("Tidak ada file modul baru di folder assets/file/", "warning");
    }
}