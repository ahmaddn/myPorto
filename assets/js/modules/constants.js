// ═══════════════════════════════════════════
//  CONSTANTS — constants.js
// ═══════════════════════════════════════════

export const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 jam

export const ADMIN_CREDENTIALS = {
  username: "Canbemyy",
  password: "9367592da5356c4e4f79f7128edb0028e65daccc53f1cc8d231b35e4bb03a110",
};

export const DEFAULTS = {
  profile: {
    name: "Najmy Ahmad Maulana",
    role: "Full Stack Web Developer",
    tagline: "Membangun pengalaman digital yang indah dan fungsional.",
    bio: "Saya adalah web developer yang passionate dalam menciptakan pengalaman digital yang indah dan fungsional. Dengan keahlian di frontend dan backend, saya suka memecahkan masalah kompleks.",
    location: "Bandung, Jawa Barat \uD83C\uDDEE\uD83C\uDDE9",
    email: "hello@example.com",
    github: "https://github.com/ahmaddn",
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com",
    avatar: "\uD83D\uDC68\u200D\uD83D\uDCBB",
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
      icon: "shopping-cart",
    },
  ],
  films: [],
  music: [],
  books: [],
  games: [],
};
