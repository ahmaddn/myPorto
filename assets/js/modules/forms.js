// ═══════════════════════════════════════════
//  FORMS — forms.js
// ═══════════════════════════════════════════

import { safeGet, safeSet, toast, uid } from "./utils.js";
import { saveData } from "./data.js";
import { FIREBASE_CACHE } from "./state.js";
import { 
    renderDashboard, 
    renderProjects, 
    renderAbout, 
    renderMedia,
    renderAdminProjects,
    renderAdminSkills,
    renderAdminExperience,
    renderAdminFilms,
    renderAdminMusic,
    renderAdminBooks,
    renderAdminGames,
    renderAdminProfile
} from "./render.js";
import { 
    renderTechDonutChart, 
    renderSkillCategoryChart,
    renderFilmsGenreChart,
    renderMusicMoodChart,
    renderBooksStatusChart,
    renderGamesPlatformChart
} from "./charts.js";
import { closeModal, openModal } from "./ui.js";

// ─────────────────────────────────────────
//  PROJECTS
// ─────────────────────────────────────────
export function resetProjectForm() {
    safeSet("proj-id", "value", "");
    safeSet("proj-title", "value", "");
    safeSet("proj-desc", "value", "");
    safeSet("proj-tech", "value", "");
    safeSet("proj-status", "value", "Selesai");
    safeSet("proj-link", "value", "");
    safeSet("proj-github", "value", "");
    safeSet("proj-icon", "value", "code-2");
    const featured = safeGet("proj-featured");
    if (featured) featured.checked = false;
    safeSet("modal-project-title", "textContent", "Tambah Proyek");
}

export function editProject(id) {
    const p = FIREBASE_CACHE.projects.find(x => x.id == id);
    if (!p) return;
    safeSet("proj-id", "value", p.id);
    safeSet("proj-title", "value", p.title);
    safeSet("proj-desc", "value", p.desc);
    safeSet("proj-tech", "value", p.tech);
    safeSet("proj-status", "value", p.status);
    safeSet("proj-link", "value", p.link);
    safeSet("proj-github", "value", p.github);
    safeSet("proj-icon", "value", p.icon || "code-2");
    const featured = safeGet("proj-featured");
    if (featured) featured.checked = p.featured || false;
    safeSet("modal-project-title", "textContent", "Edit Proyek");
    openModal('modal-project');
}

export async function saveProject() {
  const id = safeGet("proj-id")?.value;
  const item = {
    id: id ? (isNaN(id) ? id : parseInt(id)) : uid(),
    title: safeGet("proj-title")?.value || "",
    desc: safeGet("proj-desc")?.value || "",
    tech: safeGet("proj-tech")?.value || "",
    status: safeGet("proj-status")?.value || "Konsep",
    featured: safeGet("proj-featured")?.checked || false,
    link: safeGet("proj-link")?.value || "#",
    github: safeGet("proj-github")?.value || "#",
    icon: safeGet("proj-icon")?.value || "code-2",
  };

  let list = FIREBASE_CACHE.projects || [];
  if (id) {
    list = list.map((p) => (p.id == id ? item : p));
  } else {
    list.push(item);
  }

  const success = await saveData("projects", list);
  if (success) {
      closeModal("modal-project");
      toast(id ? "Project diperbarui!" : "Project ditambahkan!", "success");
      renderAdminProjects();
      renderProjects();
      renderDashboard();
  }
}

export async function deleteProject(id) {
    if (!confirm("Hapus proyek ini?")) return;
    let list = FIREBASE_CACHE.projects || [];
    list = list.filter(p => p.id != id);
    const success = await saveData("projects", list);
    if (success) {
        toast("Proyek dihapus", "success");
        renderAdminProjects();
        renderProjects();
        renderDashboard();
    }
}

// ─────────────────────────────────────────
//  SKILLS
// ─────────────────────────────────────────
export function resetSkillForm() {
    safeSet("skill-id", "value", "");
    safeSet("skill-name", "value", "");
    safeSet("skill-cat", "value", "Frontend");
    safeSet("skill-level", "value", "80");
    safeSet("skill-level-label", "textContent", "80");
    safeSet("modal-skill-title", "textContent", "Tambah Skill");
}

export async function saveSkill() {
    const id = safeGet("skill-id")?.value;
    const item = {
        id: id || uid(),
        name: safeGet("skill-name")?.value || "",
        category: safeGet("skill-cat")?.value || "Frontend",
        level: parseInt(safeGet("skill-level")?.value || "0")
    };
    let list = FIREBASE_CACHE.skills || [];
    if (id) list = list.map(s => s.id === id ? item : s);
    else list.push(item);

    if (await saveData("skills", list)) {
        closeModal("modal-skill");
        toast("Skill disimpan", "success");
        renderAdminSkills();
        renderDashboard();
    }
}

export async function deleteSkill(id) {
    if (!confirm("Hapus skill ini?")) return;
    let list = (FIREBASE_CACHE.skills || []).filter(s => s.id !== id);
    if (await saveData("skills", list)) {
        toast("Skill dihapus", "success");
        renderAdminSkills();
        renderDashboard();
    }
}

// ─────────────────────────────────────────
//  EXPERIENCE
// ─────────────────────────────────────────
export function resetExpForm() {
    safeSet("exp-id", "value", "");
    safeSet("exp-year", "value", "");
    safeSet("exp-title", "value", "");
    safeSet("exp-company", "value", "");
    safeSet("exp-desc", "value", "");
    const active = safeGet("exp-active");
    if (active) active.checked = false;
    safeSet("modal-exp-title", "textContent", "Tambah Pengalaman");
}

export async function saveExp() {
    const id = safeGet("exp-id")?.value;
    const item = {
        id: id || uid(),
        year: safeGet("exp-year")?.value || "",
        title: safeGet("exp-title")?.value || "",
        company: safeGet("exp-company")?.value || "",
        desc: safeGet("exp-desc")?.value || "",
        active: safeGet("exp-active")?.checked || false
    };
    let list = FIREBASE_CACHE.experience || [];
    if (id) list = list.map(e => e.id === id ? item : e);
    else list.push(item);

    if (await saveData("experience", list)) {
        closeModal("modal-exp");
        toast("Pengalaman disimpan", "success");
        renderAdminExperience();
        renderAbout();
        renderDashboard();
    }
}

export async function deleteExperience(id) {
    if (!confirm("Hapus pengalaman ini?")) return;
    let list = (FIREBASE_CACHE.experience || []).filter(e => e.id !== id);
    if (await saveData("experience", list)) {
        toast("Pengalaman dihapus", "success");
        renderAdminExperience();
        renderAbout();
        renderDashboard();
    }
}

// ─────────────────────────────────────────
//  MEDIA (FILMS, MUSIC, BOOKS, GAMES)
// ─────────────────────────────────────────

// Films
export function resetFilmForm() {
    safeSet("film-id", "value", "");
    safeSet("film-title", "value", "");
    safeSet("film-genre", "value", "");
    safeSet("film-year", "value", "2024");
    safeSet("film-rating", "value", "8");
    safeSet("film-rating-label", "textContent", "8");
    safeSet("film-review", "value", "");
    safeSet("film-comment", "value", "");
}
export async function saveFilm() {
    const id = safeGet("film-id")?.value;
    const item = {
        id: id || uid(),
        title: safeGet("film-title")?.value || "",
        genre: safeGet("film-genre")?.value || "",
        year: safeGet("film-year")?.value || "",
        rating: safeGet("film-rating")?.value || "8",
        review: safeGet("film-review")?.value || "",
        comment: safeGet("film-comment")?.value || ""
    };
    let list = FIREBASE_CACHE.films || [];
    if (id) list = list.map(f => f.id === id ? item : f);
    else list.push(item);
    if (await saveData("films", list)) {
        closeModal("modal-film"); toast("Film disimpan", "success");
        renderAdminFilms(); renderMedia();
    }
}
export async function deleteFilm(id) {
    if (!confirm("Hapus film?")) return;
    let list = (FIREBASE_CACHE.films || []).filter(f => f.id !== id);
    if (await saveData("films", list)) { toast("Film dihapus", "success"); renderAdminFilms(); renderMedia(); }
}

// Music
export function resetMusicForm() {
    safeSet("music-id", "value", "");
    safeSet("music-title", "value", "");
    safeSet("music-artist", "value", "");
    safeSet("music-genre", "value", "");
    safeSet("music-mood", "value", "Chill");
    safeSet("music-icon", "value", "music");
}
export async function saveMusic() {
    const id = safeGet("music-id")?.value;
    const item = {
        id: id || uid(),
        title: safeGet("music-title")?.value || "",
        artist: safeGet("music-artist")?.value || "",
        genre: safeGet("music-genre")?.value || "",
        mood: safeGet("music-mood")?.value || "Chill",
        icon: safeGet("music-icon")?.value || "music"
    };
    let list = FIREBASE_CACHE.music || [];
    if (id) list = list.map(m => m.id === id ? item : m);
    else list.push(item);
    if (await saveData("music", list)) {
        closeModal("modal-music"); toast("Musik disimpan", "success");
        renderAdminMusic(); renderMedia();
    }
}
export async function deleteMusic(id) {
    if (!confirm("Hapus musik?")) return;
    let list = (FIREBASE_CACHE.music || []).filter(m => m.id !== id);
    if (await saveData("music", list)) { toast("Musik dihapus", "success"); renderAdminMusic(); renderMedia(); }
}

// Books
export function resetBookForm() {
    safeSet("book-id", "value", "");
    safeSet("book-title", "value", "");
    safeSet("book-author", "value", "");
    safeSet("book-genre", "value", "");
    safeSet("book-status", "value", "Sudah Baca");
    safeSet("book-rating", "value", "8");
    safeSet("book-rating-label", "textContent", "8");
    safeSet("book-review", "value", "");
}
export async function saveBook() {
    const id = safeGet("book-id")?.value;
    const item = {
        id: id || uid(),
        title: safeGet("book-title")?.value || "",
        author: safeGet("book-author")?.value || "",
        genre: safeGet("book-genre")?.value || "",
        status: safeGet("book-status")?.value || "Sudah Baca",
        rating: safeGet("book-rating")?.value || "8",
        review: safeGet("book-review")?.value || ""
    };
    let list = FIREBASE_CACHE.books || [];
    if (id) list = list.map(b => b.id === id ? item : b);
    else list.push(item);
    if (await saveData("books", list)) {
        closeModal("modal-book"); toast("Buku disimpan", "success");
        renderAdminBooks(); renderMedia();
    }
}
export async function deleteBook(id) {
    if (!confirm("Hapus buku?")) return;
    let list = (FIREBASE_CACHE.books || []).filter(b => b.id !== id);
    if (await saveData("books", list)) { toast("Buku dihapus", "success"); renderAdminBooks(); renderMedia(); }
}

// Games
export function resetGameForm() {
    safeSet("game-id", "value", "");
    safeSet("game-title", "value", "");
    safeSet("game-platform", "value", "");
    safeSet("game-genre", "value", "");
    safeSet("game-status", "value", "Sudah Tamat");
    safeSet("game-rating", "value", "8");
    safeSet("game-rating-label", "textContent", "8");
    safeSet("game-icon", "value", "gamepad-2");
}
export async function saveGame() {
    const id = safeGet("game-id")?.value;
    const item = {
        id: id || uid(),
        title: safeGet("game-title")?.value || "",
        platform: safeGet("game-platform")?.value || "",
        genre: safeGet("game-genre")?.value || "",
        status: safeGet("game-status")?.value || "Sudah Tamat",
        rating: safeGet("game-rating")?.value || "8",
        icon: safeGet("game-icon")?.value || "gamepad-2"
    };
    let list = FIREBASE_CACHE.games || [];
    if (id) list = list.map(g => g.id === id ? item : g);
    else list.push(item);
    if (await saveData("games", list)) {
        closeModal("modal-game"); toast("Game disimpan", "success");
        renderAdminGames(); renderMedia();
    }
}
export async function deleteGame(id) {
    if (!confirm("Hapus game?")) return;
    let list = (FIREBASE_CACHE.games || []).filter(g => g.id !== id);
    if (await saveData("games", list)) { toast("Game dihapus", "success"); renderAdminGames(); renderMedia(); }
}

// ─────────────────────────────────────────
//  PROFILE
// ─────────────────────────────────────────
export async function saveProfile() {
    const profile = {
        name: safeGet("p-name")?.value || "",
        role: safeGet("p-role")?.value || "",
        location: safeGet("p-loc")?.value || "",
        email: safeGet("p-email")?.value || "",
        github: safeGet("p-github")?.value || "",
        linkedin: safeGet("p-linkedin")?.value || "",
        instagram: safeGet("p-Instagram")?.value || "",
        avatar: safeGet("p-avatar")?.value || "",
        tagline: safeGet("p-tagline")?.value || "",
        bio: safeGet("p-bio")?.value || "",
        available: safeGet("p-avail")?.checked || false
    };

    if (await saveData("profile", profile)) {
        toast("Profil diperbarui!", "success");
        renderDashboard();
        renderAbout();
        renderAdminProfile();
    }
}

// ─────────────────────────────────────────
//  SEARCH & UTILS
// ─────────────────────────────────────────
export function admProjectsSearch(query) { admGenericSearch(query, "#adm-projects-tbody tr"); }
export function admSkillsSearch(query) { admGenericSearch(query, "#adm-skills-tbody tr"); }
export function admExpSearch(query) { admGenericSearch(query, "#adm-exp-tbody tr"); }
export function admFilmsSearch(query) { admGenericSearch(query, "#adm-films-tbody tr"); }
export function admMusicSearch(query) { admGenericSearch(query, "#adm-music-tbody tr"); }
export function admBooksSearch(query) { admGenericSearch(query, "#adm-books-tbody tr"); }
export function admGamesSearch(query) { admGenericSearch(query, "#adm-games-tbody tr"); }
export function searchModulFiles(query) { admGenericSearch(query, "#adm-modul-tbody tr"); }

function admGenericSearch(query, selector) {
    const q = query.toLowerCase();
    const rows = document.querySelectorAll(selector);
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? "" : "none";
    });
}

// ─────────────────────────────────────────
//  BLOG (STUB - Quill required)
// ─────────────────────────────────────────
export function resetBlogForm() {
    safeSet("blog-id", "value", "");
    safeSet("blog-title", "value", "");
    safeSet("blog-cat", "value", "");
    safeSet("blog-summary", "value", "");
    safeSet("blog-tags", "value", "");
    safeSet("blog-icon", "value", "file-text");
    // Handle Quill reset if exists
    if (window.quillEditor) window.quillEditor.setContents([]);
}

export async function saveBlog() {
    toast("Fitur blog dalam pengembangan (Quill Editor required)", "info");
    closeModal("modal-blog");
}

export async function resetAllData() {
    if (!confirm("APAKAH ANDA YAKIN? Semua data akan dikembalikan ke default dan data di Firebase akan dihapus!")) return;
    
    const { DEFAULTS } = await import("./constants.js");
    
    // Reset Profile
    await saveData("profile", DEFAULTS.profile);
    
    // Reset Collections
    const collections = ["skills", "experience", "projects", "films", "music", "books", "games", "modulFiles"];
    for (const col of collections) {
        await saveData(col, DEFAULTS[col] || []);
    }
    
    toast("Semua data telah direset!", "success");
    location.reload();
}

