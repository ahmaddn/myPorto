// ═══════════════════════════════════════════
//  API — api.js
// ═══════════════════════════════════════════

export async function getCommits() {
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

export function getLast12Months() {
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleString("id-ID", { month: "short" }));
  }
  return months;
}

export function commitsPerMonth(contributions) {
  const months = new Array(12).fill(0);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  contributions.forEach((day) => {
    const date = new Date(day.date);
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthDiff = (currentYear - year) * 12 + (currentMonth - month);
    if (monthDiff >= 0 && monthDiff < 12) {
      const index = 11 - monthDiff;
      months[index] += day.count;
    }
  });

  return months;
}
