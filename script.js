const teamColors = {
  "Mercedes": "#27F4D2",
  "Ferrari": "#E80020",
  "Red Bull Racing": "#3671C6",
  "McLaren": "#FF8000",
  "Racing Bulls": "#6692FF",
  "Alpine": "#0093CC",
  "Haas": "#B6BABD",
  "Audi": "#F50537",
  "Williams": "#64C4FF",
  "Aston Martin": "#229971",
  "Cadillac": "#D4AF37"
};

function getTeamColor(teamName) {
  for (const key in teamColors) {
    if (teamName.toLowerCase().includes(key.toLowerCase())) {
      return teamColors[key];
    }
  }
  return "#888899";
}

const races = [
  {
    name: "Гран-при Лас-Вегаса",
    circuit: "Las Vegas Strip Circuit (США)",
    start: "2026-11-22T07:00:00+03:00",
    trackTimeZone: "America/Los_Angeles",
    trackCity: "Лас-Вегас"
  },
  {
    name: "Гран-при Катара",
    circuit: "Lusail International Circuit (Катар)",
    start: "2026-11-29T19:00:00+03:00",
    trackTimeZone: "Asia/Qatar",
    trackCity: "Лусаил"
  },
  {
    name: "Гран-при Абу-Даби",
    circuit: "Yas Marina Circuit (ОАЭ)",
    start: "2026-12-06T16:00:00+03:00",
    trackTimeZone: "Asia/Dubai",
    trackCity: "Абу-Даби"
  }
];

const RACE_DURATION_MS = 2 * 60 * 60 * 1000;

function getUserTimeZoneLabel() {
  const offsetMin = -new Date().getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const absHours = Math.floor(Math.abs(offsetMin) / 60);
  const absMins = Math.abs(offsetMin) % 60;
  const formatted = absMins > 0
    ? `UTC${sign}${absHours}:${String(absMins).padStart(2, "0")}`
    : `UTC${sign}${absHours}`;
  return `Ваше время (${formatted})`;
}

function formatTrackDate(isoString, timeZone, city) {
  const formatted = new Date(isoString).toLocaleString("ru-RU", {
    timeZone: timeZone,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
  return `${formatted} <small style="color:#888899">(${city})</small>`;
}

function formatUserDate(isoString) {
  return new Date(isoString).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function updateSchedule() {
  const now = Date.now();
  const tbody = document.getElementById("schedule-body");
  const labelEl = document.getElementById("next-race-label");
  const nameEl = document.getElementById("next-race-name");
  const timerEl = document.getElementById("next-race-timer");
  const userTzHeader = document.getElementById("user-tz-header");

  if (userTzHeader) {
    userTzHeader.textContent = getUserTimeZoneLabel();
  }

  let nextRaceFound = false;
  let rowsHtml = "";

  races.forEach((race) => {
    const startTime = new Date(race.start).getTime();
    const endTime = startTime + RACE_DURATION_MS;
    let badgeHtml = "";
    let rowClass = "";

    if (now >= endTime) {
      badgeHtml = '<span class="badge badge-done">Завершён</span>';
      rowClass = "row-done";
    } else if (now >= startTime && now < endTime) {
      badgeHtml = '<span class="badge badge-live">Идёт гонка</span>';
      if (!nextRaceFound) {
        nextRaceFound = true;
        labelEl.textContent = "Прямо сейчас на трассе";
        nameEl.textContent = race.name;
        timerEl.textContent = "LIVE";
      }
    } else if (!nextRaceFound) {
      nextRaceFound = true;
      badgeHtml = '<span class="badge badge-next">Следующий</span>';

      const diff = startTime - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      labelEl.textContent = "До старта ближайшей гонки";
      nameEl.textContent = race.name;
      timerEl.textContent =
        `${days}д ${String(hours).padStart(2, "0")}ч ` +
        `${String(minutes).padStart(2, "0")}м ${String(seconds).padStart(2, "0")}с`;
    } else {
      badgeHtml = '<span class="badge badge-upcoming">Ожидается</span>';
    }

    rowsHtml += `
      <tr class="${rowClass}">
        <td><strong>${race.name}</strong></td>
        <td>${race.circuit}</td>
        <td>${formatTrackDate(race.start, race.trackTimeZone, race.trackCity)}</td>
        <td><strong>${formatUserDate(race.start)}</strong></td>
        <td>${badgeHtml}</td>
      </tr>
    `;
  });

  if (!nextRaceFound) {
    labelEl.textContent = "Сезон 2026";
    nameEl.textContent = "Все этапы календаря завершены";
    timerEl.textContent = "ФИНИШ";
  }

  tbody.innerHTML = rowsHtml;
}
const fallbackDrivers = [
  { pos: 1, name: "Андреа Кими Антонелли", team: "Mercedes", wins: 9, points: 390 },
  { pos: 2, name: "Макс Ферстаппен", team: "Red Bull Racing", wins: 3, points: 279 },
  { pos: 3, name: "Джордж Расселл", team: "Mercedes", wins: 3, points: 262 },
  { pos: 4, name: "Льюис Хэмилтон", team: "Ferrari", wins: 1, points: 261 },
  { pos: 5, name: "Шарль Леклер", team: "Ferrari", wins: 1, points: 249 },
  { pos: 6, name: "Ландо Норрис", team: "McLaren", wins: 3, points: 246 },
  { pos: 7, name: "Оскар Пиастри", team: "McLaren", wins: 0, points: 152 },
  { pos: 8, name: "Изак Аджар", team: "Red Bull Racing", wins: 0, points: 122 },
  { pos: 9, name: "Лиам Лоусон", team: "Racing Bulls", wins: 0, points: 89 },
  { pos: 10, name: "Пьер Гасли", team: "Alpine", wins: 0, points: 42 },
  { pos: 11, name: "Арвид Линдблад", team: "Racing Bulls", wins: 0, points: 38 },
  { pos: 12, name: "Франко Колапинто", team: "Alpine", wins: 0, points: 27 },
  { pos: 13, name: "Оливер Бермэн", team: "Haas", wins: 0, points: 23 },
  { pos: 14, name: "Габриэл Бортолето", team: "Audi", wins: 0, points: 14 },
  { pos: 15, name: "Нико Хюлькенберг", team: "Audi", wins: 0, points: 14 },
  { pos: 16, name: "Эстебан Окон", team: "Haas", wins: 0, points: 7 },
  { pos: 17, name: "Фернандо Алонсо", team: "Aston Martin", wins: 0, points: 7 },
  { pos: 18, name: "Карлос Сайнс", team: "Williams", wins: 0, points: 7 },
  { pos: 19, name: "Алекс Албон", team: "Williams", wins: 0, points: 5 },
  { pos: 20, name: "Юки Цунода", team: "Racing Bulls", wins: 0, points: 1 },
  { pos: 21, name: "Рё Хиракава", team: "Haas", wins: 0, points: 1 },
  { pos: 22, name: "Ланс Стролл", team: "Aston Martin", wins: 0, points: 0 },
  { pos: 23, name: "Валттери Боттас", team: "Cadillac", wins: 0, points: 0 },
  { pos: 24, name: "Серхио Перес", team: "Cadillac", wins: 0, points: 0 },
  { pos: 25, name: "Рафаэл Камара", team: "Haas", wins: 0, points: 0 }
];

const fallbackConstructors = [
  { pos: 1, team: "Mercedes", wins: 12, points: 652 },
  { pos: 2, team: "Ferrari", wins: 2, points: 510 },
  { pos: 3, team: "Red Bull Racing", wins: 3, points: 415 },
  { pos: 4, team: "McLaren", wins: 3, points: 398 },
  { pos: 5, team: "Racing Bulls", wins: 0, points: 114 },
  { pos: 6, team: "Alpine", wins: 0, points: 69 },
  { pos: 7, team: "Haas", wins: 0, points: 31 },
  { pos: 8, team: "Audi", wins: 0, points: 28 },
  { pos: 9, team: "Williams", wins: 0, points: 12 },
  { pos: 10, team: "Aston Martin", wins: 0, points: 7 },
  { pos: 11, team: "Cadillac", wins: 0, points: 0 }
];

let driversData = [...fallbackDrivers];
let constructorsData = [...fallbackConstructors];
let showAllDrivers = false;

function getPosClass(pos) {
  if (pos === 1) return "pos-1";
  if (pos === 2) return "pos-2";
  if (pos === 3) return "pos-3";
  return "";
}

function renderStandings() {
  const driversBody = document.getElementById("drivers-body");
  const constructorsBody = document.getElementById("constructors-body");
  const toggleBtn = document.getElementById("toggle-drivers-btn");
  const visibleDrivers = showAllDrivers ? driversData : driversData.slice(0, 10);

  driversBody.innerHTML = visibleDrivers.map((d) => `
    <tr>
      <td class="pos-cell ${getPosClass(Number(d.pos))}">${d.pos}</td>
      <td><span class="team-stripe" style="background:${getTeamColor(d.team)}"></span><strong>${d.name}</strong></td>
      <td>${d.team}</td>
      <td>${d.wins}</td>
      <td class="pts-cell">${d.points}</td>
    </tr>
  `).join("");

  toggleBtn.textContent = showAllDrivers
    ? "Свернуть до топ-10"
    : `Показать всех пилотов (${driversData.length})`;

  constructorsBody.innerHTML = constructorsData.map((c) => `
    <tr>
      <td class="pos-cell ${getPosClass(Number(c.pos))}">${c.pos}</td>
      <td><span class="team-stripe" style="background:${getTeamColor(c.team)}"></span><strong>${c.team}</strong></td>
      <td>${c.wins}</td>
      <td class="pts-cell">${c.points}</td>
    </tr>
  `).join("");
}

function toggleAllDrivers() {
  showAllDrivers = !showAllDrivers;
  renderStandings();
}

function switchTab(tab) {
  const driversPanel = document.getElementById("panel-drivers");
  const constructorsPanel = document.getElementById("panel-constructors");
  const driversBtn = document.getElementById("tab-drivers");
  const constructorsBtn = document.getElementById("tab-constructors");

  if (tab === "drivers") {
    driversPanel.classList.remove("hidden");
    constructorsPanel.classList.add("hidden");
    driversBtn.classList.add("active");
    constructorsBtn.classList.remove("active");
  } else {
    constructorsPanel.classList.remove("hidden");
    driversPanel.classList.add("hidden");
    constructorsBtn.classList.add("active");
    driversBtn.classList.remove("active");
  }
}

async function loadLiveStandings() {
  const statusEl = document.getElementById("sync-status");
  try {
    const [drvRes, conRes] = await Promise.all([
      fetch("https://jolpi.ca"),
      fetch("https://jolpi.ca")
    ]);

    if (!drvRes.ok || !conRes.ok) throw new Error("API недоступно");

    const drvJson = await drvRes.json();
    const conJson = await conRes.json();

    const drvLists = drvJson.MRData.StandingsTable.StandingsLists;
    const conLists = conJson.MRData.StandingsTable.StandingsLists;

    const apiDrivers = drvLists[0] ? drvLists[0].DriverStandings : null;
    const apiConstructors = conLists[0] ? conLists[0].ConstructorStandings : null;

    if (apiDrivers && apiDrivers.length > 0) {
      driversData = apiDrivers.map((item) => ({
        pos: Number(item.position),
        name: `${item.Driver.givenName} ${item.Driver.familyName}`,
        team: item.Constructors[0] ? item.Constructors[0].name : "—",
        wins: Number(item.wins),
        points: Number(item.points)
      }));
    }

    if (apiConstructors && apiConstructors.length > 0) {
      constructorsData = apiConstructors.map((item) => ({
        pos: Number(item.position),
        team: item.Constructor.name,
        wins: Number(item.wins),
        points: Number(item.points)
      }));
    }

    renderStandings();
    statusEl.textContent = "Обновлено по API в реальном времени";
  } catch (e) {
    statusEl.textContent = "Актуальная таблица сезона 2026 (после ГП Сан-Паулу)";
  }
}
if (document.getElementById("schedule-body")) {
  updateSchedule();
  setInterval(updateSchedule, 1000);
}

if (document.getElementById("drivers-body")) {
  renderStandings();
  loadLiveStandings();
  setInterval(loadLiveStandings, 300000);
}
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (sidebar && overlay) {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("open");
  }
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    if (sidebar && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
      overlay.classList.remove("open");
    }
  }
});
