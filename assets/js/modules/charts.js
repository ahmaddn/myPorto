// ═══════════════════════════════════════════
//  CHARTS — charts.js
// ═══════════════════════════════════════════

import { safeGet } from "./utils.js";
import { chartInstances, FIREBASE_CACHE } from "./state.js";

function getData(key) {
    return FIREBASE_CACHE[key];
}

function checkChartJS() {
    if (typeof Chart === 'undefined') {
        console.warn("⚠️ Chart.js is not loaded yet.");
        return false;
    }
    return true;
}

export function renderSkillsRadarChart() {
  if (!checkChartJS()) return;
  const skills = getData("skills") || [];

  const topSkills = [...skills].sort((a, b) => b.level - a.level).slice(0, 6);
  const chartCanvas = safeGet("radarChart");
  if (!chartCanvas || topSkills.length === 0) return;

  const ctx = chartCanvas.getContext("2d");
  if (chartInstances.radarChart) chartInstances.radarChart.destroy();

  chartInstances.radarChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: topSkills.map((s) => s.name),
      datasets: [
        {
          label: "Level",
          data: topSkills.map((s) => s.level),
          backgroundColor: "rgba(119, 202, 237, 0.2)",
          borderColor: "#77caed",
          borderWidth: 2,
          pointBackgroundColor: "#77caed",
          pointBorderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: { display: false, backdropColor: "transparent" },
          grid: { color: "rgba(255,255,255,0.05)" },
          angleLines: { color: "rgba(255,255,255,0.05)" },
          pointLabels: { color: "#7a9e9a", font: { size: 11 } },
        },
      },
    },
  });
}

export function renderTechDonutChart() {
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
  if (chartInstances.techDonutChart) chartInstances.techDonutChart.destroy();

  const sorted = Object.entries(techCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const labels = sorted.map(([tech]) => tech);
  const data = sorted.map(([, count]) => count);

  chartInstances.techDonutChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: ["#77caed", "#78fab9", "#7a9e9a", "#4a6260", "#77caed80", "#78fab980", "#7a9e9a80", "#4a626080"],
          borderColor: "#1e2626",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "right", labels: { color: "#7a9e9a", font: { size: 11 } } },
      },
    },
  });
}

// ... Tambahkan chart lainnya jika ada di app.js ...

export function renderFeaturedProjects() {
  const projects = getData("projects") || [];
  const featured = projects.filter((p) => p.featured);
  const el = safeGet("featured-projects");
  if (el) {
    el.innerHTML = featured.slice(0, 3).map(p => `
      <div class="group bg-ink2 rounded-2xl border border-white/5 p-6 overflow-hidden hover:border-cyan/30 transition-all duration-300">
        <div class="flex items-start justify-between mb-3">
          <div class="w-12 h-12 bg-cyan/10 rounded-xl flex items-center justify-center">
            <i data-lucide="${p.icon || "code-2"}" class="w-6 h-6 text-cyan"></i>
          </div>
          <span class="text-xs px-2 py-1 rounded-lg bg-mint/10 text-mint">${p.status}</span>
        </div>
        <h3 class="font-mono font-bold text-base mb-2">${p.title}</h3>
        <p class="text-sm text-dim leading-relaxed mb-4">${p.desc}</p>
        <div class="flex gap-2">
            <a href="${p.link}" target="_blank" class="text-xs bg-cyan/10 text-cyan px-3 py-1.5 rounded-lg">Live</a>
            <a href="${p.github}" target="_blank" class="text-xs bg-ink3 text-muted px-3 py-1.5 rounded-lg">Code</a>
        </div>
      </div>
    `).join("");
  }
}

export function renderSkillCategoryChart() {
    const skills = getData("skills") || [];
    const cats = {};
    skills.forEach(s => { cats[s.category] = (cats[s.category] || 0) + 1; });
    const canvas = safeGet("skillCategoryChart");
    if (!canvas || Object.keys(cats).length === 0) return;
    const ctx = canvas.getContext("2d");
    if (chartInstances.skillCategoryChart) chartInstances.skillCategoryChart.destroy();
    chartInstances.skillCategoryChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: Object.keys(cats),
            datasets: [{
                data: Object.values(cats),
                backgroundColor: ['#77caedcc', '#78fab9cc', '#7a9e9acc', '#4a6260cc'],
                borderColor: '#1e2626',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: '#7a9e9a', font: { size: 10 } } } },
            scales: { r: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { display: false } } }
        }
    });
}

export function renderMusicArtistChart() {
    const music = getData("music") || [];
    const counts = {};
    music.forEach(m => { if(m.artist) counts[m.artist] = (counts[m.artist] || 0) + 1; });
    
    const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
        
    const labels = sorted.map(i => i[0]);
    const values = sorted.map(i => i[1]);

    const canvas = safeGet("musicArtistChart");
    if (!canvas || labels.length === 0) return;
    
    const existing = Chart.getChart(canvas);
    if (existing) {
        existing.data.labels = labels;
        existing.data.datasets[0].data = values;
        existing.update();
        return;
    }

    const ctx = canvas.getContext("2d");
    chartInstances.musicArtistChart = new Chart(ctx, {
        type: 'bar',
        data: { 
            labels: labels, 
            datasets: [{ 
                label: 'Plays', 
                data: values, 
                backgroundColor: 'rgba(120,250,185,0.3)',
                borderColor: '#78fab9',
                borderWidth: 1.5,
                borderRadius: 4
            }] 
        },
        options: { 
            indexAxis: 'y',
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#7a9e9a', font: { size: 10 } } },
                y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#7a9e9a', font: { size: 10 } } }
            }
        }
    });
}


export function renderBooksGenreChart() {
  const books = getData("books") || [];
  const genreCount = {};
  books.forEach((b) => { genreCount[b.genre] = (genreCount[b.genre] || 0) + 1; });
  const canvas = safeGet("booksGenreChart");
  if (!canvas || Object.keys(genreCount).length === 0) return;
  const ctx = canvas.getContext("2d");
  if (chartInstances.booksGenreChart) chartInstances.booksGenreChart.destroy();
  chartInstances.booksGenreChart = new Chart(ctx, {
    type: "bar",
    data: { labels: Object.keys(genreCount), datasets: [{ label: "Jumlah Buku", data: Object.values(genreCount), backgroundColor: "rgba(120,250,185,0.6)", borderColor: "#78fab9", borderWidth: 1, borderRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, indexAxis: "y", plugins: { legend: { display: false } }, scales: { x: { grid: { color: "rgba(255,255,255,0.03)" }, ticks: { color: "#7a9e9a", font: { size: 11 }, stepSize: 1 } }, y: { grid: { color: "rgba(255,255,255,0.03)" }, ticks: { color: "#7a9e9a", font: { size: 11 } } } } }
  });
}

export function renderGamesGenreChart() {
  const games = getData("games") || [];
  const genreCount = {};
  games.forEach((g) => { genreCount[g.genre] = (genreCount[g.genre] || 0) + 1; });
  const canvas = safeGet("gamesGenreChart");
  if (!canvas || Object.keys(genreCount).length === 0) return;
  const ctx = canvas.getContext("2d");
  if (chartInstances.gamesGenreChart) chartInstances.gamesGenreChart.destroy();
  chartInstances.gamesGenreChart = new Chart(ctx, {
    type: "bar",
    data: { labels: Object.keys(genreCount), datasets: [{ label: "Jumlah Game", data: Object.values(genreCount), backgroundColor: "rgba(120,250,185,0.6)", borderColor: "#78fab9", borderWidth: 1, borderRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: "rgba(255,255,255,0.03)" }, ticks: { color: "#7a9e9a", font: { size: 11 } } }, y: { grid: { color: "rgba(255,255,255,0.03)" }, ticks: { color: "#7a9e9a", font: { size: 11 }, stepSize: 1 } } } }
  });
}

export function renderFilmsGenreChart() {
    const films = getData("films") || [];
    const counts = {};
    films.forEach(f => { counts[f.genre] = (counts[f.genre] || 0) + 1; });
    const canvas = safeGet("genreChart");
    if (!canvas || Object.keys(counts).length === 0) return;
    const ctx = canvas.getContext("2d");
    if (chartInstances.filmsGenreChart) chartInstances.filmsGenreChart.destroy();
    chartInstances.filmsGenreChart = new Chart(ctx, {
        type: 'polarArea',
        data: { labels: Object.keys(counts), datasets: [{ data: Object.values(counts), backgroundColor: ['#77caedcc', '#78fab9cc', '#7a9e9acc', '#4a6260cc'] }] },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { legend: { position: 'bottom', labels: { color: '#7a9e9a', font: { size: 10 } } } },
            scales: {
                r: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { display: false, backdropColor: 'transparent' },
                    angleLines: { color: 'rgba(255,255,255,0.05)' }
                }
            }
        }
    });
}

export function renderFilmsRatingChart() {
    const films = getData("films") || [];
    const counts = {};
    films.forEach(f => { counts[f.rating] = (counts[f.rating] || 0) + 1; });
    const canvas = safeGet("filmsRatingChart");
    if (!canvas || Object.keys(counts).length === 0) return;
    const ctx = canvas.getContext("2d");
    if (chartInstances.filmsRatingChart) chartInstances.filmsRatingChart.destroy();
    chartInstances.filmsRatingChart = new Chart(ctx, {
        type: 'bar',
        data: { labels: Object.keys(counts).map(r => r + '/10'), datasets: [{ data: Object.values(counts), backgroundColor: '#77caed80' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
}

export function renderMusicMoodChart() {
    const music = getData("music") || [];
    const counts = {};
    music.forEach(m => { if(m.genre) counts[m.genre] = (counts[m.genre] || 0) + 1; });
    const canvas = safeGet("moodChart");
    if (!canvas || Object.keys(counts).length === 0) return;
    
    const existing = Chart.getChart(canvas);
    if (existing) {
        existing.data.labels = Object.keys(counts);
        existing.data.datasets[0].data = Object.values(counts);
        existing.update();
        return;
    }

    const ctx = canvas.getContext("2d");
    chartInstances.moodChart = new Chart(ctx, {
        type: 'bar',
        data: { 
            labels: Object.keys(counts), 
            datasets: [{ 
                label: 'Genre', 
                data: Object.values(counts), 
                backgroundColor: 'rgba(236,72,153,0.3)',
                borderColor: '#ec4899',
                borderWidth: 1.5,
                borderRadius: 4
            }] 
        },
        options: { 
            indexAxis: 'y',
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#7a9e9a', font: { size: 10 } } },
                y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#7a9e9a', font: { size: 10 } } }
            }
        }
    });
}


export function renderBooksStatusChart() {
    const books = getData("books") || [];
    const counts = {};
    books.forEach(b => { counts[b.status] = (counts[b.status] || 0) + 1; });
    const canvas = safeGet("booksStatusChart");
    if (!canvas || Object.keys(counts).length === 0) return;
    const ctx = canvas.getContext("2d");
    if (chartInstances.booksStatusChart) chartInstances.booksStatusChart.destroy();
    chartInstances.booksStatusChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: Object.keys(counts), datasets: [{ data: Object.values(counts), backgroundColor: ['#78fab9', '#7a9e9a', '#4a6260'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

export function renderGamesPlatformChart() {
    const games = getData("games") || [];
    const counts = {};
    games.forEach(g => { counts[g.platform] = (counts[g.platform] || 0) + 1; });
    const canvas = safeGet("gamesPlatformChart");
    if (!canvas || Object.keys(counts).length === 0) return;
    const ctx = canvas.getContext("2d");
    if (chartInstances.gamesPlatformChart) chartInstances.gamesPlatformChart.destroy();
    chartInstances.gamesPlatformChart = new Chart(ctx, {
        type: 'pie',
        data: { labels: Object.keys(counts), datasets: [{ data: Object.values(counts), backgroundColor: ['#78fab9', '#77caed', '#7a9e9a'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

export function renderStorageChart() {
    if (!checkChartJS()) return;
    const canvas = safeGet("storageChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (chartInstances.storageChart) chartInstances.storageChart.destroy();
    
    const counts = {
        Projects: (getData("projects") || []).length,
        Skills: (getData("skills") || []).length,
        Experience: (getData("experience") || []).length,
        Media: (getData("films") || []).length + (getData("music") || []).length + (getData("books") || []).length + (getData("games") || []).length
    };

    chartInstances.storageChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: ['#77caed', '#78fab9', '#7a9e9a', '#4a6260'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#7a9e9a', font: { size: 10 } } } } }
    });
}

export function renderMediaChart() {
    if (!checkChartJS()) return;
    const canvas = safeGet("mediaChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (chartInstances.mediaChart) chartInstances.mediaChart.destroy();

    const counts = {
        Films: (getData("films") || []).length,
        Music: (getData("music") || []).length,
        Books: (getData("books") || []).length,
        Games: (getData("games") || []).length
    };

    chartInstances.mediaChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                label: 'Items',
                data: Object.values(counts),
                backgroundColor: '#78fab9cc',
                borderRadius: 4
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            scales: {
                x: { grid: { display: false }, ticks: { color: '#7a9e9a' } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#7a9e9a' } }
            },
            plugins: { legend: { display: false } }
        }
    });
}
