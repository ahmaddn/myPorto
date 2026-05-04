// ═══════════════════════════════════════════
//  STATE — state.js
// ═══════════════════════════════════════════

export let FIREBASE_CACHE = {
  profile: null,
  skills: [],
  experience: [],
  projects: [],
  films: [],
  music: [],
  books: [],
  games: [],
  modulFiles: [],
  settings: {
    modulVisible: true,
  },
};

export let CACHE_LOADED = false;

export function setCacheLoaded(val) {
  CACHE_LOADED = val;
}

export let MODUL_USER_INFO = {
  name: null,
  class: null,
};

export let chartInstances = {
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
