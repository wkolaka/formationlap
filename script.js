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
  if (!teamName) return "#888899";
  const str = String(teamName).toLowerCase();
  for (const key in teamColors) {
    if (str.includes(key.toLowerCase())) {
      return teamColors[key];
    }
  }
  return "#888899";
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (sidebar && overlay) {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("open");
  }
}

const USERS_KEY = "fl_users_db";
const CURRENT_USER_KEY = "fl_current_user";

function getUsersDB() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveUsersDB(db) {
  localStorage.setItem(USERS_KEY, JSON.stringify(db));
}

function getCurrentUser() {
  return localStorage.getItem(CURRENT_USER_KEY);
}

function getMskDateKey() {
  const mskDate = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const y = mskDate.getUTCFullYear();
  const m = String(mskDate.getUTCMonth() + 1).padStart(2, "0");
  const d = String(mskDate.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getTimeUntilMskMidnight() {
  const nowMs = Date.now();
  const mskNow = new Date(nowMs + 3 * 60 * 60 * 1000);
  const nextMidnightUtc = Date.UTC(
    mskNow.getUTCFullYear(),
    mskNow.getUTCMonth(),
    mskNow.getUTCDate() + 1,
    0, 0, 0
  ) - 3 * 60 * 60 * 1000;
  const diff = Math.max(0, nextMidnightUtc - nowMs);
  const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function generateNovemberBoard() {
  const rewards = [];
  for (let i = 0; i < 10; i++) {
    rewards.push(Math.floor(Math.random() * 16) + 5);
  }
  for (let i = 0; i < 19; i++) {
    rewards.push(Math.floor(Math.random() * 81) + 20);
  }
  rewards.push(500);

  for (let i = rewards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = rewards[i];
    rewards[i] = rewards[j];
    rewards[j] = temp;
  }
  return rewards.map((pts) => ({ points: pts, opened: false }));
}

function injectAuthModal() {
  if (document.getElementById("auth-modal")) return;
  const modalHtml = `
    <div class="modal-overlay" id="auth-modal" onclick="if(event.target===this) closeAuthModal()">
      <div class="modal-box">
        <button class="modal-close" onclick="closeAuthModal()" aria-label="Закрыть">&times;</button>
        <div class="modal-tabs">
          <button class="modal-tab active" id="auth-tab-register" onclick="switchAuthMode('register')">Регистрация</button>
          <button class="modal-tab" id="auth-tab-login" onclick="switchAuthMode('login')">Вход</button>
        </div>
        <form class="auth-form" id="form-register" onsubmit="handleRegister(event)">
          <div class="auth-bonus-note">Бонус за регистрацию: карточка <strong>Ferrari SF-26 (200)</strong> и календарь отметок на 30 клеток!</div>
          <label>Придумайте ник</label>
          <input type="text" id="reg-nick" placeholder="Например: ScuderiaFan" minlength="3" maxlength="20" required>
          <label>Придумайте пароль</label>
          <input type="password" id="reg-pass" placeholder="Минимум 4 символа" minlength="4" required>
          <div class="auth-msg" id="reg-msg"></div>
          <button type="submit" class="btn">Зарегистрироваться</button>
        </form>
        <form class="auth-form hidden" id="form-login" onsubmit="handleLogin(event)">
          <label>Ваш ник</label>
          <input type="text" id="login-nick" placeholder="Введите ник" required>
          <label>Пароль</label>
          <input type="password" id="login-pass" placeholder="Введите пароль" required>
          <div class="auth-msg" id="login-msg"></div>
          <button type="submit" class="btn">Войти</button>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function openAuthModal(mode = "register") {
  injectAuthModal();
  switchAuthMode(mode);
  document.getElementById("auth-modal").classList.add("open");
}

function closeAuthModal() {
  const modal = document.getElementById("auth-modal");
  if (modal) modal.classList.remove("open");
}

function switchAuthMode(mode) {
  const regForm = document.getElementById("form-register");
  const logForm = document.getElementById("form-login");
  const regTab = document.getElementById("auth-tab-register");
  const logTab = document.getElementById("auth-tab-login");
  if (mode === "register") {
    regForm.classList.remove("hidden");
    logForm.classList.add("hidden");
    regTab.classList.add("active");
    logTab.classList.remove("active");
  } else {
    logForm.classList.remove("hidden");
    regForm.classList.add("hidden");
    logTab.classList.add("active");
    regTab.classList.remove("active");
  }
}
function ensureUserFields(user) {
  if (typeof user.points !== "number") user.points = 0;
  if (!Array.isArray(user.cards)) user.cards = ["ferrari-sf26"];
  if (!Array.isArray(user.novemberBoard) || user.novemberBoard.length !== 30) {
    user.novemberBoard = generateNovemberBoard();
  }
  if (!user.lastMskClaimDate) user.lastMskClaimDate = "";
}

function handleRegister(event) {
  event.preventDefault();
  const nick = document.getElementById("reg-nick").value.trim();
  const pass = document.getElementById("reg-pass").value;
  const msgEl = document.getElementById("reg-msg");
  const db = getUsersDB();
  if (db[nick.toLowerCase()]) {
    msgEl.className = "auth-msg";
    msgEl.textContent = "Этот ник уже занят. Выберите другой.";
    return;
  }
  db[nick.toLowerCase()] = {
    nick: nick,
    password: pass,
    points: 0,
    cards: ["ferrari-sf26"],
    novemberBoard: generateNovemberBoard(),
    lastMskClaimDate: ""
  };
  saveUsersDB(db);
  localStorage.setItem(CURRENT_USER_KEY, nick.toLowerCase());
  msgEl.className = "auth-msg ok";
  msgEl.textContent = "Аккаунт создан! Карточка Ferrari SF-26 добавлена.";
  updateAuthUI();
  setTimeout(closeAuthModal, 900);
}

function handleLogin(event) {
  event.preventDefault();
  const nick = document.getElementById("login-nick").value.trim();
  const pass = document.getElementById("login-pass").value;
  const msgEl = document.getElementById("login-msg");
  const db = getUsersDB();
  const user = db[nick.toLowerCase()];
  if (!user || user.password !== pass) {
    msgEl.className = "auth-msg";
    msgEl.textContent = "Неверный ник или пароль.";
    return;
  }
  ensureUserFields(user);
  saveUsersDB(db);
  localStorage.setItem(CURRENT_USER_KEY, nick.toLowerCase());
  msgEl.className = "auth-msg ok";
  msgEl.textContent = "Вход выполнен!";
  updateAuthUI();
  setTimeout(closeAuthModal, 600);
}

function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
  updateAuthUI();
}

function updateAuthUI() {
  const headerBox = document.getElementById("auth-header-box");
  const currentKey = getCurrentUser();
  const db = getUsersDB();
  const user = currentKey ? db[currentKey] : null;
  if (user) {
    ensureUserFields(user);
    saveUsersDB(db);
  }
  if (headerBox) {
    if (user) {
      headerBox.innerHTML = `
        <div class="user-badge">
          <span class="points-pill">&#129689; ${user.points} поинтов</span>
          <span class="user-nick">${user.nick}</span>
          <button class="logout-btn" onclick="logoutUser()">Выйти</button>
        </div>
      `;
    } else {
      headerBox.innerHTML = `
        <button class="auth-open-btn" onclick="openAuthModal('register')">Войти / Регистрация</button>
      `;
    }
  }
  if (document.getElementById("collectible-cards-grid")) {
    renderCollectibleCards();
  }
  if (document.getElementById("checkin-container")) {
    renderCheckinPage();
  }
  if (document.getElementById("packs-container")) {
    renderPacksPage();
  }

}

function openNovemberCell(index) {
  const currentKey = getCurrentUser();
  const db = getUsersDB();
  const user = currentKey ? db[currentKey] : null;
  if (!user) return;
  ensureUserFields(user);
  const todayMsk = getMskDateKey();
  if (user.lastMskClaimDate === todayMsk) return;
  const cell = user.novemberBoard[index];
  if (!cell || cell.opened) return;
  cell.opened = true;
  user.lastMskClaimDate = todayMsk;
  user.points += cell.points;
  saveUsersDB(db);
  updateAuthUI();
}

function renderCheckinPage() {
  const box = document.getElementById("checkin-container");
  if (!box) return;
  const currentKey = getCurrentUser();
  const db = getUsersDB();
  const user = currentKey ? db[currentKey] : null;
  if (!user) {
    box.innerHTML = `
      <div class="checkin-card">
        <p style="margin-bottom: 16px; color: #b8b8c7;">Войдите или зарегистрируйтесь, чтобы открывать по 1 клетке в день в календаре <strong>Ноябрь</strong>.</p>
        <button class="btn" onclick="openAuthModal('register')">Войти / Регистрация</button>
      </div>
    `;
    return;
  }
  ensureUserFields(user);
  const todayMsk = getMskDateKey();
  const canOpenToday = user.lastMskClaimDate !== todayMsk;
  const openedCount = user.novemberBoard.filter((c) => c.opened).length;
  const cellsHtml = user.novemberBoard.map((cell, idx) => {
    if (cell.opened) {
      const isJackpot = cell.points === 500;
      return `
        <div class="mystery-cell opened ${isJackpot ? "jackpot" : ""}">
          <div class="cell-num">Клетка #${idx + 1}</div>
          <div class="cell-prize">+${cell.points}</div>
          <div class="cell-hint">${isJackpot ? "ДЖЕКПОТ!" : "поинтов"}</div>
        </div>
      `;
    }
    return `
      <button class="mystery-cell ${canOpenToday ? "available" : "wait"}" onclick="openNovemberCell(${idx})" ${canOpenToday ? "" : "disabled"}>
        <div class="cell-num">Клетка #${idx + 1}</div>
        <div class="cell-secret">?</div>
        <div class="cell-hint">${canOpenToday ? "Открыть" : "Ждите 00:00"}</div>
      </button>
    `;
  }).join("");
  box.innerHTML = `
    <div class="checkin-card">
      <div class="month-banner">
        <div class="month-title">Ноябрь</div>
        <div class="msk-reset-timer">Сброс попытки в 00:00 МСК (осталось <strong id="msk-countdown" style="color:#ffffff;">${getTimeUntilMskMidnight()}</strong>)</div>
      </div>
      <div class="checkin-stats">
        <div class="stat-box">
          <div class="stat-label">Ваш баланс</div>
          <div class="stat-val">${user.points} поинтов</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Открыто клеток</div>
          <div class="stat-val" style="color:#ffffff;">${openedCount} / 30</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Попытка на сегодня</div>
          <div class="stat-val" style="color:${canOpenToday ? "#00d27a" : "#888899"};">${canOpenToday ? "Доступна (1)" : "Использована"}</div>
        </div>
      </div>
      <div class="november-grid">${cellsHtml}</div>
    </div>
  `;
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeAuthModal();
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    if (sidebar && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
      overlay.classList.remove("open");
    }
  }
});

const ferrariSvgArt = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://w3.org" viewBox="0 0 600 320">
  <rect width="600" height="320" fill="#1b0d12"/>
  <line x1="0" y1="258" x2="600" y2="258" stroke="#343448" stroke-width="4"/>
  <polygon points="88,125 135,125 142,188 102,188" fill="#14141c"/>
  <rect x="82" y="120" width="58" height="14" rx="3" fill="#e80020"/>
  <path d="M140,185 L165,132 L255,132 L295,165 L140,188 Z" fill="#f4f6fa"/>
  <path d="M180,145 L245,145 L258,158 L175,158 Z" fill="#0066cc"/>
  <path d="M115,195 L165,172 L310,165 L485,198 L518,214 L115,214 Z" fill="#e80020"/>
  <path d="M275,165 Q305,136 342,168" fill="none" stroke="#181822" stroke-width="7"/>
  <circle cx="296" cy="156" r="11" fill="#ffd700"/>
  <rect x="145" y="212" width="320" height="8" rx="3" fill="#121218"/>
  <polygon points="468,205 535,212 535,222 465,220" fill="#e80020"/>
  <circle cx="152" cy="212" r="44" fill="#16161e" stroke="#2c2c3a" stroke-width="4"/>
  <circle cx="152" cy="212" r="24" fill="#101016" stroke="#e80020" stroke-width="3"/>
  <circle cx="435" cy="214" r="42" fill="#16161e" stroke="#2c2c3a" stroke-width="4"/>
  <circle cx="435" cy="214" r="23" fill="#101016" stroke="#e80020" stroke-width="3"/>
  <text x="28" y="46" fill="#ffffff" font-family="Arial, sans-serif" font-weight="900" font-style="italic" font-size="24">SCUDERIA FERRARI SF-26</text>
</svg>
`);

const astonDuoSvgArt = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://w3.org" viewBox="0 0 600 320">
  <rect width="600" height="320" fill="#0b241d"/>
  <polygon points="0,320 260,0 340,0 80,320" fill="#12382d"/>
  <line x1="300" y1="30" x2="300" y2="290" stroke="#229971" stroke-width="3" stroke-dasharray="8 6"/>
  <circle cx="155" cy="128" r="44" fill="#144738" stroke="#cedc00" stroke-width="3"/>
  <path d="M125,118 Q155,95 185,118 Z" fill="#0066cc"/>
  <rect x="128" y="122" width="54" height="14" rx="5" fill="#101018"/>
  <path d="M90,235 Q155,180 220,235 Z" fill="#229971"/>
  <text x="155" y="272" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-weight="900" font-size="22">#14 ALONSO</text>
  <circle cx="445" cy="128" r="44" fill="#144738" stroke="#cedc00" stroke-width="3"/>
  <path d="M415,118 Q445,95 475,118 Z" fill="#229971"/>
  <rect x="418" y="122" width="54" height="14" rx="5" fill="#101018"/>
  <path d="M380,235 Q445,180 510,235 Z" fill="#229971"/>
  <text x="445" y="272" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-weight="900" font-size="22">#18 STROLL</text>
  <text x="300" y="38" text-anchor="middle" fill="#cedc00" font-family="Arial, sans-serif" font-weight="900" font-style="italic" font-size="18" letter-spacing="2">ASTON MARTIN ARAMCO DUO</text>
</svg>
`);

const neweySvgArt = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://w3.org" viewBox="0 0 600 320">
  <rect width="600" height="320" fill="#0e1b2e"/>
  <g stroke="#1e3a5f" stroke-width="1">
    <line x1="0" y1="60" x2="600" y2="60"/><line x1="0" y1="120" x2="600" y2="120"/>
    <line x1="0" y1="180" x2="600" y2="180"/><line x1="0" y1="240" x2="600" y2="240"/>
    <line x1="100" y1="0" x2="100" y2="320"/><line x1="200" y1="0" x2="200" y2="320"/>
    <line x1="300" y1="0" x2="300" y2="320"/><line x1="400" y1="0" x2="400" y2="320"/>
    <line x1="500" y1="0" x2="500" y2="320"/>
  </g>
  <path d="M260,120 Q390,90 560,125" fill="none" stroke="#3b82f6" stroke-width="3" stroke-dasharray="10 6"/>
  <path d="M270,165 Q410,150 565,175" fill="none" stroke="#7cc0ff" stroke-width="3"/>
  <path d="M265,210 Q400,225 560,210" fill="none" stroke="#229971" stroke-width="3" stroke-dasharray="8 5"/>
  <circle cx="155" cy="118" r="42" fill="#183254" stroke="#7cc0ff" stroke-width="3"/>
  <rect x="128" y="110" width="22" height="12" rx="3" fill="none" stroke="#ffffff" stroke-width="2.5"/>
  <rect x="160" y="110" width="22" height="12" rx="3" fill="none" stroke="#ffffff" stroke-width="2.5"/>
  <line x1="150" y1="115" x2="160" y2="115" stroke="#ffffff" stroke-width="2.5"/>
  <path d="M85,245 Q155,180 225,245 Z" fill="#1f4e3d" stroke="#229971" stroke-width="2"/>
  <rect x="165" y="195" width="64" height="46" rx="4" fill="#f4f6fa" stroke="#3b82f6" stroke-width="2"/>
  <text x="28" y="42" fill="#ffffff" font-family="Arial, sans-serif" font-weight="900" font-style="italic" font-size="24">ADRIAN NEWEY • AERO MASTER</text>
  <text x="28" y="294" fill="#7cc0ff" font-family="Arial, sans-serif" font-weight="bold" font-size="14" letter-spacing="1.5">ASTON MARTIN ARAMCO F1 TEAM</text>
</svg>
`);

const mclarenMonacoSvgArt = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://w3.org" viewBox="0 0 600 320">
  <rect width="600" height="320" fill="#1f140a"/>
  <polygon points="0,320 220,0 380,0 160,320" fill="#2e1c0d"/>
  <line x1="0" y1="258" x2="600" y2="258" stroke="#4a3520" stroke-width="4"/>
  <polygon points="88,125 135,125 142,188 102,188" fill="#14141c"/>
  <rect x="82" y="120" width="58" height="14" rx="3" fill="#ff8000"/>
  <path d="M115,195 L165,172 L310,165 L485,198 L518,214 L115,214 Z" fill="#ff8000"/>
  <polygon points="180,171 290,166 340,214 210,214" fill="#f4f6fa"/>
  <polygon points="290,166 355,172 415,214 340,214" fill="#00a3e0"/>
  <path d="M275,165 Q305,136 342,168" fill="none" stroke="#181822" stroke-width="7"/>
  <circle cx="296" cy="156" r="11" fill="#ceff00"/>
  <polygon points="468,205 535,212 535,222 465,220" fill="#ff8000"/>
  <circle cx="152" cy="212" r="44" fill="#16161e" stroke="#2c2c3a" stroke-width="4"/>
  <circle cx="152" cy="212" r="24" fill="#101016" stroke="#ff8000" stroke-width="3"/>
  <circle cx="435" cy="214" r="42" fill="#16161e" stroke="#2c2c3a" stroke-width="4"/>
  <circle cx="435" cy="214" r="23" fill="#101016" stroke="#ff8000" stroke-width="3"/>
  <text x="28" y="42" fill="#ffffff" font-family="Arial, sans-serif" font-weight="900" font-style="italic" font-size="22">MCLAREN MONACO SPECIAL LIVERY</text>
  <text x="28" y="68" fill="#ff8000" font-family="Arial, sans-serif" font-weight="900" font-size="14" letter-spacing="2">GRAND PRIX DE MONACO EDITION</text>
</svg>
`);

const safetyCarSvgArt = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://w3.org" viewBox="0 0 600 320">
  <rect width="600" height="320" fill="#171024"/>
  <line x1="0" y1="258" x2="600" y2="258" stroke="#3c2b56" stroke-width="4"/>
  <rect x="255" y="114" width="68" height="12" rx="4" fill="#ff7b00"/>
  <rect x="275" y="114" width="28" height="12" fill="#00ff88"/>
  <path d="M95,204 L118,162 L195,134 L315,130 L422,164 L508,184 L518,208 L95,208 Z" fill="#c8102e"/>
  <polygon points="205,140 310,137 368,162 195,162" fill="#101018"/>
  <polygon points="92,158 124,158 120,174 96,174" fill="#14141c"/>
  <rect x="84" y="152" width="46" height="7" rx="2" fill="#14141c"/>
  <circle cx="168" cy="210" r="40" fill="#14141c" stroke="#2e2e3e" stroke-width="4"/>
  <circle cx="168" cy="210" r="22" fill="#0e0e14" stroke="#c084fc" stroke-width="3"/>
  <circle cx="436" cy="210" r="40" fill="#14141c" stroke="#2e2e3e" stroke-width="4"/>
  <circle cx="436" cy="210" r="22" fill="#0e0e14" stroke="#c084fc" stroke-width="3"/>
  <text x="26" y="42" fill="#f3d4ff" font-family="Arial, sans-serif" font-weight="900" font-style="italic" font-size="20">MERCEDES-AMG GT 63 PRO 4MATIC+</text>
  <text x="26" y="68" fill="#00ff88" font-family="Arial, sans-serif" font-weight="900" font-size="14" letter-spacing="2">FIA F1 SAFETY CAR</text>
</svg>
`);
const maxVs100SvgArt = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://w3.org" viewBox="0 0 600 320">
  <rect width="600" height="320" fill="#181208"/>
  <polygon points="0,320 240,0 360,0 120,320" fill="#2b200a"/>
  <text x="300" y="135" text-anchor="middle" fill="#ffd700" font-family="Arial, sans-serif" font-weight="900" font-style="italic" font-size="68">VS 100</text>
  <text x="300" y="185" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-weight="900" font-size="26">MAX VERSTAPPEN</text>
  <text x="300" y="218" text-anchor="middle" fill="#3671C6" font-family="Arial, sans-serif" font-weight="bold" font-size="15" letter-spacing="2">ORACLE RED BULL RACING</text>
</svg>
`);

const antonelliChampionSvgArt = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://w3.org" viewBox="0 0 600 320">
  <rect width="600" height="320" fill="#091f1d"/>
  <polygon points="0,320 260,0 340,0 80,320" fill="#103632"/>
  <polygon points="270,70 330,70 318,125 282,125" fill="#ffd700"/>
  <rect x="285" y="125" width="30" height="16" fill="#ffd700"/>
  <rect x="272" y="141" width="56" height="10" rx="2" fill="#e6b800"/>
  <text x="300" y="195" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-weight="900" font-style="italic" font-size="25">ANDREA KIMI ANTONELLI</text>
  <text x="300" y="228" text-anchor="middle" fill="#27F4D2" font-family="Arial, sans-serif" font-weight="900" font-size="16" letter-spacing="2">2026 WORLD CHAMPION</text>
</svg>
`);

const collectibleCards = [
  {
    id: "ferrari-sf26",
    name: "Ferrari SF-26",
    team: "Scuderia Ferrari HP",
    season: "2026",
    rarity: "Обычная",
    rarityClass: "",
    borderColor: "#E80020",
    rating: 200,
    image: "sf26.jpg",
    fallbackImage: ferrariSvgArt
  },
  {
    id: "alonso-stroll-2026",
    name: "Alonso 🇪🇸 × Stroll 🇨🇦",
    team: "Aston Martin Aramco • Дуэт пилотов",
    season: "2026",
    rarity: "Необычная",
    rarityClass: "uncommon",
    borderColor: "#229971",
    rating: 300,
    image: "aston-duo.jpg",
    fallbackImage: astonDuoSvgArt
  },
  {
    id: "adrian-newey-2026",
    name: "Эдриан Ньюи",
    team: "Aston Martin Aramco • Управляющий технический партнёр",
    season: "2026",
    rarity: "Редкая",
    rarityClass: "rare",
    borderColor: "#3b82f6",
    rating: 500,
    image: "newey.jpg",
    fallbackImage: neweySvgArt
  },
  {
    id: "mclaren-monaco-2026",
    name: "McLaren — спец. ливрея ГП Монако",
    team: "McLaren Formula 1 Team • Monaco Edition",
    season: "2026",
    rarity: "Эпическая",
    rarityClass: "epic",
    borderColor: "#ff8000",
    rating: 1000,
    image: "mclaren-monaco.jpg",
    fallbackImage: mclarenMonacoSvgArt
  },
  {
    id: "max-verstappen-vs100",
    name: "Макс Ферстаппен — VS 100",
    team: "Oracle Red Bull Racing • Special Edition",
    season: "2026",
    rarity: "Легендарная",
    rarityClass: "legendary",
    borderColor: "#ffd700",
    rating: 1200,
    image: "max-vs100.jpg",
    fallbackImage: maxVs100SvgArt
  },
  {
    id: "kimi-antonelli-champion",
    name: "Кими Антонелли (Чемпион мира)",
    team: "Mercedes-AMG PETRONAS F1 Team • World Champion",
    season: "2026",
    rarity: "Чемпионы",
    rarityClass: "champion",
    borderColor: "#27F4D2",
    rating: 1700,
    image: "antonelli-champion.jpg",
    fallbackImage: antonelliChampionSvgArt
  },
  {
    id: "amg-gt63-safety-car",
    name: "Mercedes-AMG GT 63 PRO 4MATIC+ (Safety Car)",
    team: "FIA Official Safety Car",
    season: "2026",
    rarity: "Секретная",
    rarityClass: "secret",
    borderColor: "#a855f7",
    rating: 2000,
    image: "safety-car.jpg",
    fallbackImage: safetyCarSvgArt
  }
];

const races = [
  { name: "Гран-при Лас-Вегаса", circuit: "Las Vegas Strip Circuit (США)", start: "2026-11-22T07:00:00+03:00", trackTimeZone: "America/Los_Angeles", trackCity: "Лас-Вегас" },
  { name: "Гран-при Катара", circuit: "Lusail International Circuit (Катар)", start: "2026-11-29T19:00:00+03:00", trackTimeZone: "Asia/Qatar", trackCity: "Лусаил" },
  { name: "Гран-при Абу-Даби", circuit: "Yas Marina Circuit (ОАЭ)", start: "2026-12-06T16:00:00+03:00", trackTimeZone: "Asia/Dubai", trackCity: "Абу-Даби" }
];

const RACE_DURATION_MS = 2 * 60 * 60 * 1000;

function getUserTimeZoneLabel() {
  const offsetMin = -new Date().getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const absHours = Math.floor(Math.abs(offsetMin) / 60);
  const absMins = Math.abs(offsetMin) % 60;
  const formatted = absMins > 0 ? `UTC${sign}${absHours}:${String(absMins).padStart(2, "0")}` : `UTC${sign}${absHours}`;
  return `Ваше время (${formatted})`;
}

function formatTrackDate(isoString, timeZone, city) {
  const formatted = new Date(isoString).toLocaleString("ru-RU", { timeZone: timeZone, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  return `${formatted} <small style="color:#888899">(${city})</small>`;
}

function formatUserDate(isoString) {
  return new Date(isoString).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
function updateSchedule() {
  const now = Date.now();
  const tbody = document.getElementById("schedule-body");
  const labelEl = document.getElementById("next-race-label");
  const nameEl = document.getElementById("next-race-name");
  const timerEl = document.getElementById("next-race-timer");
  const userTzHeader = document.getElementById("user-tz-header");
  if (userTzHeader) userTzHeader.textContent = getUserTimeZoneLabel();
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
      timerEl.textContent = `${days}д ${String(hours).padStart(2, "0")}ч ${String(minutes).padStart(2, "0")}м ${String(seconds).padStart(2, "0")}с`;
    } else {
      badgeHtml = '<span class="badge badge-upcoming">Ожидается</span>';
    }
    rowsHtml += `<tr class="${rowClass}"><td><strong>${race.name}</strong></td><td>${race.circuit}</td><td>${formatTrackDate(race.start, race.trackTimeZone, race.trackCity)}</td><td><strong>${formatUserDate(race.start)}</strong></td><td>${badgeHtml}</td></tr>`;
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
  { pos: 10, name: "Пьер Гасли", team: "Alpine", wins: 0, points: 42 }
];

const extraFallbackDrivers = [
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

const raceHistory2026 = [
  { round: 1, gp: "Гран-при Австралии", date: "15 марта", p1: { name: "Дж. Расселл", team: "Mercedes" }, p2: { name: "А. К. Антонелли", team: "Mercedes" }, p3: { name: "Ш. Леклер", team: "Ferrari" }, fl: "М. Ферстаппен (1:22.091)" },
  { round: 2, gp: "Гран-при Китая", date: "22 марта", p1: { name: "А. К. Антонелли", team: "Mercedes" }, p2: { name: "Дж. Расселл", team: "Mercedes" }, p3: { name: "Л. Хэмилтон", team: "Ferrari" }, fl: "А. К. Антонелли (1:35.275)" },
  { round: 3, gp: "Гран-при Японии", date: "5 апреля", p1: { name: "А. К. Антонелли", team: "Mercedes" }, p2: { name: "О. Пиастри", team: "McLaren" }, p3: { name: "Ш. Леклер", team: "Ferrari" }, fl: "А. К. Антонелли (1:30.965)" },
  { round: 4, gp: "Гран-при Бахрейна", date: "19 апреля", p1: { name: "Л. Норрис", team: "McLaren" }, p2: { name: "А. К. Антонелли", team: "Mercedes" }, p3: { name: "Дж. Расселл", team: "Mercedes" }, fl: "Л. Норрис (1:33.140)" },
  { round: 5, gp: "Гран-при Саудовской Аравии", date: "3 мая", p1: { name: "М. Ферстаппен", team: "Red Bull Racing" }, p2: { name: "Л. Норрис", team: "McLaren" }, p3: { name: "Ш. Леклер", team: "Ferrari" }, fl: "М. Ферстаппен (1:31.632)" },
  { round: 6, gp: "Гран-при Майами", date: "17 мая", p1: { name: "А. К. Антонелли", team: "Mercedes" }, p2: { name: "М. Ферстаппен", team: "Red Bull Racing" }, p3: { name: "Л. Норрис", team: "McLaren" }, fl: "О. Пиастри (1:30.412)" },
  { round: 7, gp: "Гран-при Канады", date: "31 мая", p1: { name: "А. К. Антонелли", team: "Mercedes" }, p2: { name: "Ш. Леклер", team: "Ferrari" }, p3: { name: "Дж. Расселл", team: "Mercedes" }, fl: "А. К. Антонелли (1:14.856)" },
  { round: 8, gp: "Гран-при Монако", date: "7 июня", p1: { name: "Ш. Леклер", team: "Ferrari" }, p2: { name: "Л. Норрис", team: "McLaren" }, p3: { name: "Л. Хэмилтон", team: "Ferrari" }, fl: "Л. Хэмилтон (1:14.165)" },
  { round: 9, gp: "Гран-при Испании (Барселона)", date: "14 июня", p1: { name: "А. К. Антонелли", team: "Mercedes" }, p2: { name: "Л. Норрис", team: "McLaren" }, p3: { name: "О. Пиастри", team: "McLaren" }, fl: "Л. Норрис (1:17.115)" },
  { round: 10, gp: "Гран-при Австрии", date: "28 июня", p1: { name: "Дж. Расселл", team: "Mercedes" }, p2: { name: "М. Ферстаппен", team: "Red Bull Racing" }, p3: { name: "О. Пиастри", team: "McLaren" }, fl: "М. Ферстаппен (1:07.694)" },
  { round: 11, gp: "Гран-при Великобритании", date: "5 июля", p1: { name: "Л. Хэмилтон", team: "Ferrari" }, p2: { name: "А. К. Антонелли", team: "Mercedes" }, p3: { name: "Л. Норрис", team: "McLaren" }, fl: "Л. Хэмилтон (1:28.293)" },
  { round: 12, gp: "Гран-при Бельгии", date: "19 июля", p1: { name: "М. Ферстаппен", team: "Red Bull Racing" }, p2: { name: "Ш. Леклер", team: "Ferrari" }, p3: { name: "Дж. Расселл", team: "Mercedes" }, fl: "А. К. Антонелли (1:44.701)" },
  { round: 13, gp: "Гран-при Венгрии", date: "26 июля", p1: { name: "Л. Норрис", team: "McLaren" }, p2: { name: "О. Пиастри", team: "McLaren" }, p3: { name: "Л. Хэмилтон", team: "Ferrari" }, fl: "Дж. Расселл (1:20.305)" },
  { round: 14, gp: "Гран-при Нидерландов", date: "23 августа", p1: { name: "А. К. Антонелли", team: "Mercedes" }, p2: { name: "М. Ферстаппен", team: "Red Bull Racing" }, p3: { name: "Л. Хэмилтон", team: "Ferrari" }, fl: "Л. Норрис (1:13.817)" },
  { round: 15, gp: "Гран-при Италии (Монца)", date: "6 сентября", p1: { name: "А. К. Антонелли", team: "Mercedes" }, p2: { name: "Ш. Леклер", team: "Ferrari" }, p3: { name: "Л. Хэмилтон", team: "Ferrari" }, fl: "Л. Норрис (1:21.432)" },
  { round: 16, gp: "Гран-при Мадрида", date: "13 сентября", p1: { name: "Л. Норрис", team: "McLaren" }, p2: { name: "А. К. Антонелли", team: "Mercedes" }, p3: { name: "Дж. Расселл", team: "Mercedes" }, fl: "А. К. Антонелли (1:24.510)" },
  { round: 17, gp: "Гран-при Азербайджана", date: "27 сентября", p1: { name: "А. К. Антонелли", team: "Mercedes" }, p2: { name: "Л. Хэмилтон", team: "Ferrari" }, p3: { name: "И. Аджар", team: "Red Bull Racing" }, fl: "Л. Норрис (1:45.255)" },
  { round: 18, gp: "Гран-при Сингапура", date: "11 октября", p1: { name: "Дж. Расселл", team: "Mercedes" }, p2: { name: "А. К. Антонелли", team: "Mercedes" }, p3: { name: "Л. Хэмилтон", team: "Ferrari" }, fl: "Ф. Колапинто (1:34.486)" },
  { round: 19, gp: "Гран-при США (Остин)", date: "25 октября", p1: { name: "М. Ферстаппен", team: "Red Bull Racing" }, p2: { name: "Л. Хэмилтон", team: "Ferrari" }, p3: { name: "Ш. Леклер", team: "Ferrari" }, fl: "М. Ферстаппен (1:37.330)" },
  { round: 20, gp: "Гран-при Мехико", date: "1 ноября", p1: { name: "Ш. Леклер", team: "Ferrari" }, p2: { name: "Л. Норрис", team: "McLaren" }, p3: { name: "М. Ферстаппен", team: "Red Bull Racing" }, fl: "Ш. Леклер (1:18.336)" },
  { round: 21, gp: "Гран-при Сан-Паулу", date: "8 ноября", p1: { name: "А. К. Антонелли", team: "Mercedes" }, p2: { name: "М. Ферстаппен", team: "Red Bull Racing" }, p3: { name: "Дж. Расселл", team: "Mercedes" }, fl: "М. Ферстаппен (1:12.486)" }
];
let driversData = [...fallbackDrivers, ...extraFallbackDrivers];
let constructorsData = [...fallbackConstructors];
let showAllDrivers = false;

function getPosClass(pos) {
  if (pos === 1) return "pos-1";
  if (pos === 2) return "pos-2";
  if (pos === 3) return "pos-3";
  return "";
}

function renderCollectibleCards() {
  const grid = document.getElementById("collectible-cards-grid");
  const hint = document.getElementById("cards-hint");
  if (!grid) return;
  const currentKey = getCurrentUser();
  const db = getUsersDB();
  const user = currentKey ? db[currentKey] : null;
  const ownedIds = user && Array.isArray(user.cards) ? user.cards : [];
  if (hint) {
    hint.textContent = user
      ? `Игрок ${user.nick}: открыто ${ownedIds.length} из ${collectibleCards.length} карточек.`
      : "Зарегистрируйтесь или войдите в аккаунт справа вверху, чтобы получить стартовую карточку Ferrari SF-26.";
  }
  grid.innerHTML = collectibleCards.map((card) => {
    const isOwned = ownedIds.includes(card.id);
    const borderStyle = isOwned ? `border-color: ${card.borderColor}; box-shadow: 0 8px 24px ${card.borderColor}40;` : "";
    return `
      <div class="f1-card ${isOwned ? "" : "locked"}" style="${borderStyle}">
        <div class="f1-card-top">
          <div class="card-top-left">
            <span class="card-rating">${card.rating}</span>
            <span class="card-season-tag">${card.season}</span>
          </div>
          <span class="card-rarity ${card.rarityClass}">${card.rarity}</span>
        </div>
        <div class="f1-card-img-wrap">
          <img src="${card.image}" alt="${card.name}" data-fallback="${card.fallbackImage}" onerror="if(this.dataset.fallback){this.src=this.dataset.fallback;this.dataset.fallback='';}">
          ${isOwned
            ? '<span class="card-owned-badge">&#10003; В коллекции</span>'
            : '<span class="card-lock-badge">&#128274; Не получена</span>'}
        </div>
        <div class="f1-card-body">
          <div class="f1-card-title">${card.name}</div>
          <div class="f1-card-sub">${card.team}</div>
        </div>
      </div>
    `;
  }).join("");
}

function renderHistory() {
  const historyBody = document.getElementById("history-body");
  if (!historyBody) return;
  historyBody.innerHTML = raceHistory2026.map((r) => `
    <tr>
      <td class="pos-cell">${r.round}</td>
      <td><strong>${r.gp}</strong></td>
      <td>${r.date}</td>
      <td>
        <div><span class="pos-1">1.</span> <span class="team-stripe" style="background:${getTeamColor(r.p1.team)}"></span><strong>${r.p1.name}</strong></div>
        <div><span class="pos-2">2.</span> <span class="team-stripe" style="background:${getTeamColor(r.p2.team)}"></span>${r.p2.name}</div>
        <div><span class="pos-3">3.</span> <span class="team-stripe" style="background:${getTeamColor(r.p3.team)}"></span>${r.p3.name}</div>
      </td>
      <td>${r.fl}</td>
    </tr>
  `).join("");
}

function renderStandings() {
  const driversBody = document.getElementById("drivers-body");
  const constructorsBody = document.getElementById("constructors-body");
  const toggleBtn = document.getElementById("toggle-drivers-btn");
  if (!driversBody || !constructorsBody) return;
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
  if (toggleBtn) {
    toggleBtn.textContent = showAllDrivers
      ? "Свернуть до топ-10"
      : `Показать всех пилотов (${driversData.length})`;
  }
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
  if (!statusEl) return;
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
    const apiDrivers = drvLists && drvLists.length > 0 ? drvLists[0].DriverStandings : null;
    const apiConstructors = conLists && conLists.length > 0 ? conLists[0].ConstructorStandings : null;
    if (apiDrivers && apiDrivers.length > 0) {
      driversData = apiDrivers.map((item) => ({
        pos: Number(item.position),
        name: `${item.Driver.givenName} ${item.Driver.familyName}`,
        team: item.Constructors && item.Constructors.length > 0 ? item.Constructors[0].name : "—",
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

try { updateAuthUI(); } catch (e) { console.error("AuthUI error:", e); }

if (document.getElementById("checkin-container")) {
  setInterval(() => {
    const timerEl = document.getElementById("msk-countdown");
    if (timerEl) timerEl.textContent = getTimeUntilMskMidnight();
  }, 1000);
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

if (document.getElementById("history-body")) {
  renderHistory();
}
const PACK_2026_COST = 100;

const pack2026Odds = [
  { rarity: "Обычная", chance: 55, dupeRefund: 15 },
  { rarity: "Необычная", chance: 26, dupeRefund: 25 },
  { rarity: "Редкая", chance: 12, dupeRefund: 40 },
  { rarity: "Эпическая", chance: 5, dupeRefund: 75 },
  { rarity: "Легендарная", chance: 1.5, dupeRefund: 150 },
  { rarity: "Чемпионы", chance: 0.4, dupeRefund: 300 },
  { rarity: "Секретная", chance: 0.1, dupeRefund: 500 }
];

function rollCardFromPack2026() {
  const roll = Math.random() * 100;
  let cumulative = 0;
  let chosenRarity = "Обычная";
  for (const tier of pack2026Odds) {
    cumulative += tier.chance;
    if (roll < cumulative) {
      chosenRarity = tier.rarity;
      break;
    }
  }
  const pool = collectibleCards.filter((c) => c.rarity === chosenRarity);
  const targetPool = pool.length > 0 ? pool : collectibleCards;
  const card = targetPool[Math.floor(Math.random() * targetPool.length)];
  const tierInfo = pack2026Odds.find((t) => t.rarity === card.rarity) || pack2026Odds;
  return { card: card, dupeRefund: tierInfo.dupeRefund };
}

function openPack2026() {
  const currentKey = getCurrentUser();
  const db = getUsersDB();
  const user = currentKey ? db[currentKey] : null;
  if (!user) {
    openAuthModal("register");
    return;
  }
  ensureUserFields(user);
  if (user.points < PACK_2026_COST) {
    renderPacksPage([], "Недостаточно поинтов! Откройте клетку в разделе «Отметка на сайте».");
    return;
  }
  user.points -= PACK_2026_COST;
  const dropCount = Math.floor(Math.random() * 3) + 1;
  const drops = [];
  let totalRefund = 0;

  for (let i = 0; i < dropCount; i++) {
    const rolled = rollCardFromPack2026();
    const isDuplicate = user.cards.includes(rolled.card.id);
    if (!isDuplicate) {
      user.cards.push(rolled.card.id);
    } else {
      user.points += rolled.dupeRefund;
      totalRefund += rolled.dupeRefund;
    }
    drops.push({
      card: rolled.card,
      isDuplicate: isDuplicate,
      refund: rolled.dupeRefund
    });
  }

  saveUsersDB(db);
  updateAuthUI();
  const statusMsg = totalRefund > 0
    ? `Выпало карт: ${dropCount}! За дубликаты возвращено +${totalRefund} поинтов.`
    : `Выпало новых карт: ${dropCount}! Все добавлены в вашу коллекцию.`;
  renderPacksPage(drops, statusMsg, true);
}

function renderPacksPage(lastDrops = [], statusMessage = "", isSuccess = false) {
  const container = document.getElementById("packs-container");
  if (!container) return;
  const currentKey = getCurrentUser();
  const db = getUsersDB();
  const user = currentKey ? db[currentKey] : null;
  const canAfford = user && user.points >= PACK_2026_COST;

  const oddsHtml = pack2026Odds
    .map((o) => `<span class="odds-pill">${o.rarity}: <strong>${o.chance}%</strong></span>`)
    .join("");

  let dropsHtml = "";
  if (lastDrops.length > 0) {
    const cardsHtml = lastDrops.map((item) => {
      const c = item.card;
      const borderStyle = `border-color: ${c.borderColor}; box-shadow: 0 8px 24px ${c.borderColor}40;`;
      return `
        <div class="f1-card" style="${borderStyle}">
          <div class="f1-card-top">
            <div class="card-top-left">
              <span class="card-rating">${c.rating}</span>
              <span class="card-season-tag">${c.season}</span>
            </div>
            <span class="card-rarity ${c.rarityClass}">${c.rarity}</span>
          </div>
          <div class="f1-card-img-wrap">
            ${item.isDuplicate ? `<span class="dupe-badge">Дубликат (+${item.refund} поинтов)</span>` : ""}
            <img src="${c.image}" alt="${c.name}" data-fallback="${c.fallbackImage}" onerror="if(this.dataset.fallback){this.src=this.dataset.fallback;this.dataset.fallback='';}">
            <span class="card-owned-badge">&#10003; В коллекции</span>
          </div>
          <div class="f1-card-body">
            <div class="f1-card-title">${c.name}</div>
            <div class="f1-card-sub">${c.team}</div>
          </div>
        </div>
      `;
    }).join("");

    dropsHtml = `
      <div class="pack-drop-area">
        <div class="pack-drop-title">Ваш улов из пака «2026» (${lastDrops.length} шт.):</div>
        <div class="collectible-grid">${cardsHtml}</div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="pack-card">
      <div class="pack-header">
        <div class="pack-title">Пак «2026»</div>
        <div class="pack-badge">&#129689; ${PACK_2026_COST} поинтов</div>
      </div>
      <div class="pack-meta">
        Содержит все <strong>${collectibleCards.length} карточек</strong> коллекции 2026. Гарантировано выпадает от <strong>1 до 3 карт</strong> за открытие.
      </div>
      <div class="odds-list">${oddsHtml}</div>
      <div class="pack-actions">
        ${user
          ? `<button class="btn" onclick="openPack2026()" ${canAfford ? "" : "style='opacity:0.65;'"}>Открыть пак за ${PACK_2026_COST} поинтов</button>`
          : `<button class="btn" onclick="openAuthModal('register')">Войти, чтобы открыть</button>`}
        ${statusMessage ? `<span class="pack-msg ${isSuccess ? "ok" : ""}">${statusMessage}</span>` : ""}
      </div>
    </div>
    ${dropsHtml}
  `;
}

if (document.getElementById("packs-container")) {
  renderPacksPage();
}

