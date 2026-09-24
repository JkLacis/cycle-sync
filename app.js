// =====================================================================
// 1. Data
// =====================================================================

// Text content lives in content.js (loaded first). Short aliases for the two most used parts.
const PHASES = CONTENT.phases;
const TASK_TYPES = CONTENT.taskTypes;

// How well one task fits the phase on its day. points feed the 0–100 score.
const SYNC_LEVELS = {
  high:     { label: "High Sync", points: 100, icon: "target" },
  good:     { label: "Good",      points: 75,  icon: "diamond" },
  moderate: { label: "Moderate",  points: 60,  icon: "dash-circle" },
  low:      { label: "Low Sync",  points: 0,   icon: "octagon" },
};
// Below this score the Alignment screen switches to the pink "recovery" look.
const RECOVERY_BELOW = 50;

const INSIGHT_COUNT = 3;
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Outline icons (24×24, stroke = text colour).
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  chat: '<path d="M21 12a8.5 8.5 0 0 1-12.3 7.6L3.5 21l1.4-4.8A8.5 8.5 0 1 1 21 12z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  chevron: '<path d="M9 5l7 7-7 7"/>',
  arrow: '<path d="M4 12h16M14 6l6 6-6 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14a5 5 0 0 1 5 5"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.1V16h5v-.1c0-.8.4-1.6 1.1-2.1A6 6 0 0 0 12 3z"/>',
  dumbbell: '<path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>',
  doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  bolt: '<path d="M13 2 4.5 14H11l-1 8 8.5-12H12z"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  sunset: '<path d="M3 18h18M7 18a5 5 0 0 1 10 0M12 6v4M5.3 11.3l1.4 1.4M18.7 11.3l-1.4 1.4M6 22h12"/>',
  leaf: '<path d="M5 19C5 11 10 5 20 4c-1 10-7 15-15 15z"/><path d="M5 19l7-7"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  presentation: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v4M8 20h8M7.5 12l3-3 2 2 4-4"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  diamond: '<circle cx="12" cy="12" r="9"/><path d="M12 8l4 4-4 4-4-4z"/>',
  "dash-circle": '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
  wave: '<path d="M2 17c4 0 5-9 10-9s6 9 10 9"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  sprout: '<path d="M12 21v-9M12 12C12 8 9 5 4 5c0 4 3 7 8 7zM12 10c0-3.5 2.5-6 7-6 0 3.5-2.5 6-7 6z"/>',
  smile: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0M9 9.5h.01M15 9.5h.01"/>',
  focus: '<circle cx="11" cy="13" r="8"/><circle cx="11" cy="13" r="4"/><path d="M11 13l9-9M16 4h4v4"/>',
  bed: '<path d="M3 6v13M3 16h18v3M21 16v-3a3 3 0 0 0-3-3h-8v6"/><circle cx="6.5" cy="12" r="1.8"/>',
  cutlery: '<path d="M6 3v6a2 2 0 0 0 4 0V3M8 3v18M17 21V3c-2 2-3 5-3 8h3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  sparkle: '<path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z"/><path d="M19 3v3M17.5 4.5h3"/>',
  send: '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4z"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z"/>',
  heart: '<path d="M12 20s-7.5-4.5-7.5-10A4.2 4.2 0 0 1 12 7.3 4.2 4.2 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10z"/>',
  octagon: '<path d="M8.3 3h7.4L21 8.3v7.4L15.7 21H8.3L3 15.7V8.3z"/><circle cx="12" cy="12" r="2.5"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7l8 6 8-6"/>',
  "doc-plus": '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M12 11v6M9 14h6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
};

// =====================================================================
// 2. Small helpers
// =====================================================================

function icon(name) {
  return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[name] + "</svg>";
}

// Makes user-typed text safe to put inside HTML.
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ===== Flower illustration (soft see-through petals + a sage leaf) =====
// Colours come from CSS variables (--petal-deep, --petal-light, --leaf-deep, --leaf-light),
// so the same drawing turns pink in the Alignment "recovery" look.

// [angle, length, width, kind] — drawn back to front from one base point,
// sweeping up and to the right with a sage leaf on the left (as in the mockups).
const FLOWER_PARTS = [
  [-28, 150, 40, "petal"],
  [60, 128, 36, "petal"],
  [-4, 186, 44, "petal"],
  [28, 168, 42, "petal"],
  [-68, 92, 24, "leaf"],
];
let flowerCount = 0;

function petalPath(l, w) {
  return "M0 0C" + -w + " " + -l * 0.3 + " " + -w * 0.75 + " " + -l * 0.82 + " 0 " + -l +
    "C" + w * 0.75 + " " + -l * 0.82 + " " + w + " " + -l * 0.3 + " 0 0Z";
}

// Midrib + fine side veins, for the delicate "painted" look.
function veinPath(l, w) {
  let d = "M0 -4Q" + w * 0.12 + " " + -l * 0.5 + " 0 " + -l * 0.95;
  for (const t of [0.22, 0.36, 0.5, 0.64, 0.78]) {
    const reach = w * 0.62 * (1 - Math.abs(t - 0.42) * 1.3);
    d += "M0 " + -l * t + "Q" + reach * 0.5 + " " + -l * (t + 0.04) + " " + reach + " " + -l * (t + 0.12);
    d += "M0 " + -l * t + "Q" + -reach * 0.5 + " " + -l * (t + 0.04) + " " + -reach + " " + -l * (t + 0.12);
  }
  return d;
}

function flowerSVG() {
  const id = "flower" + flowerCount++;
  const gradient = (name, deep, light) =>
    '<linearGradient id="' + id + name + '" x1="0.5" y1="1" x2="0.5" y2="0">' +
      '<stop offset="0" style="stop-color: var(' + deep + ')"/><stop offset="1" style="stop-color: var(' + light + ')"/>' +
    "</linearGradient>";
  const parts = FLOWER_PARTS.map(([angle, l, w, kind]) =>
    '<g transform="translate(95 206) rotate(' + angle + ')">' +
      '<path d="' + petalPath(l, w) + '" fill="url(#' + id + kind + ')" fill-opacity="0.88"/>' +
      '<path class="flower-vein" d="' + veinPath(l, w) + '"/>' +
    "</g>"
  ).join("");
  return (
    '<svg viewBox="0 0 220 210" preserveAspectRatio="xMidYMax meet" aria-hidden="true">' +
      "<defs>" + gradient("petal", "--petal-deep", "--petal-light") + gradient("leaf", "--leaf-deep", "--leaf-light") + "</defs>" +
      parts +
    "</svg>"
  );
}

// ===== Dates: always local calendar days, never UTC =====

// "2026-09-01" → local Date at midnight. (new Date("2026-09-01") would be UTC.)
function parseLocalDate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Local Date → "2026-09-01"
function toISODate(date) {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return date.getFullYear() + "-" + m + "-" + d;
}

function today() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

// Whole days from a to b. Uses Date.UTC on the local parts so DST can't shift it.
function daysBetween(a, b) {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / MS_PER_DAY);
}

// Monday of the week that contains date.
function startOfWeek(date) {
  const mondayOffset = (date.getDay() + 6) % 7;
  return addDays(date, -mondayOffset);
}

// =====================================================================
// 3. Cycle logic (check from the console, e.g. getPhase(14, DEFAULT_SETTINGS))
// =====================================================================

// Day ranges per phase. A range with start > end is zero days long (short cycles).
function getPhaseRanges(settings) {
  const { cycleLength, periodLength } = settings;
  const ovulationDay = cycleLength - 14;
  return {
    menstrual:  { start: 1, end: periodLength },
    follicular: { start: periodLength + 1, end: ovulationDay - 2 },
    ovulatory:  { start: Math.max(periodLength + 1, ovulationDay - 1), end: ovulationDay + 1 },
    luteal:     { start: ovulationDay + 2, end: cycleLength },
  };
}

// Day 1 = first day of the last period. Keeps counting forward past later cycles.
function getCycleDay(date, settings) {
  const start = parseLocalDate(settings.lastPeriodStart);
  const diff = daysBetween(start, date);
  const n = settings.cycleLength;
  return (((diff % n) + n) % n) + 1;
}

// Menstrual is checked first, so it wins any overlap.
function getPhase(cycleDay, settings) {
  const ranges = getPhaseRanges(settings);
  for (const key of ["menstrual", "follicular", "ovulatory", "luteal"]) {
    const r = ranges[key];
    if (cycleDay >= r.start && cycleDay <= r.end) return key;
  }
  return "luteal";
}

function getPhaseForDate(date, settings) {
  return getPhase(getCycleDay(date, settings), settings);
}

function daysUntilNextPhase(date, settings) {
  const current = getPhaseForDate(date, settings);
  for (let i = 1; i <= settings.cycleLength; i++) {
    if (getPhaseForDate(addDays(date, i), settings) !== current) return i;
  }
  return settings.cycleLength;
}

function getCycleState(date, settings) {
  const cycleDay = getCycleDay(date, settings);
  const phaseKey = getPhase(cycleDay, settings);
  return { date, cycleDay, phaseKey, phase: PHASES[phaseKey] };
}

// =====================================================================
// 4. Storage
// =====================================================================

const IS_DEMO = new URLSearchParams(location.search).get("demo") === "1";
const STORAGE_PREFIX = "cyclesync.";
// Demo mode keeps its own copies, so ?demo=1 never touches real data.
const STORAGE_NS = STORAGE_PREFIX + (IS_DEMO ? "demo." : "");
// Bump SCHEMA_VERSION and add a MIGRATIONS entry whenever the saved data shape changes.
// Data saved before versioning existed counts as version 1.
const SCHEMA_VERSION = 2;
const SCHEMA_KEY = STORAGE_PREFIX + "schemaVersion";
// { n: () => void } upgrades saved data from version n to n + 1.
const MIGRATIONS = {
  // v2: integration cards no longer store a fake on/off state.
  1: () => {
    for (const key of [STORAGE_PREFIX + "prefs", STORAGE_PREFIX + "demo.prefs"]) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const prefs = JSON.parse(raw);
      delete prefs.integrations;
      localStorage.setItem(key, JSON.stringify(prefs));
    }
  },
};

// Allowed ranges for the cycle form (onboarding + Settings). NHS: cycles 21–35 days, periods 2–7 days.
const CYCLE_LIMITS = {
  cycleLength: { min: 21, max: 35 },
  periodLength: { min: 2, max: 7 },
};

// Demo mode (and the screens drawn behind onboarding): 28/5 cycle with today as day 14.
const DEFAULT_SETTINGS = {
  lastPeriodStart: toISODate(addDays(today(), -13)),
  cycleLength: 28,
  periodLength: 5,
};

const NAME_MAX = 30;
const CHAT_MAX = 50; // messages kept on the device

// weeklyInsight = show the weekly insight under the bell. insightSeenWeek = Monday (ISO) of the last week it was opened.
const DEFAULT_PREFS = {
  weeklyInsight: true,
  insightSeenWeek: null,
};

// Returns an error message, or "" when the settings are fine.
function validateCycleSettings({ lastPeriodStart, cycleLength, periodLength }) {
  const { cycleLength: c, periodLength: p } = CYCLE_LIMITS;
  if (!lastPeriodStart) return "Pick the first day of your last period.";
  if (parseLocalDate(lastPeriodStart) > today()) return "That date is in the future. Pick today or earlier.";
  if (!Number.isInteger(cycleLength) || cycleLength < c.min || cycleLength > c.max) {
    return "Cycle length must be " + c.min + "–" + c.max + " days.";
  }
  if (!Number.isInteger(periodLength) || periodLength < p.min || periodLength > p.max) {
    return "Period length must be " + p.min + "–" + p.max + " days.";
  }
  return "";
}

// Low-level JSON read/write. Corrupt or blocked storage falls back instead of crashing the app.
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_NS + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (err) {
    console.warn("Cycle Sync: could not read " + key, err);
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(STORAGE_NS + key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn("Cycle Sync: could not save " + key, err);
    showToast("Couldn't save. Storage may be full or blocked.");
    return false;
  }
}

// The only code that touches localStorage. Swap this object to move to a server later.
const store = {
  settings: {
    // Invalid saved data (e.g. edited by hand) is treated as missing, so onboarding runs again.
    loadSaved() {
      const saved = readJSON("settings", null);
      return saved && !validateCycleSettings(saved) ? saved : null;
    },
    load() {
      return IS_DEMO ? DEFAULT_SETTINGS : this.loadSaved() ?? DEFAULT_SETTINGS;
    },
    // False until onboarding has saved valid cycle data.
    exists() {
      return IS_DEMO || this.loadSaved() !== null;
    },
    save(settings) {
      return writeJSON("settings", settings);
    },
  },
  // [{ id, title, date: "YYYY-MM-DD", start: "HH:MM", end: "HH:MM", type }]
  tasks: {
    load() {
      return readJSON("tasks", []);
    },
    save(tasks) {
      return writeJSON("tasks", tasks);
    },
  },
  // Daily check-ins: { "YYYY-MM-DD": { energy, mood, focus, sleep } }
  logs: {
    load() {
      return readJSON("logs", {});
    },
    saveDay(isoDate, log) {
      return writeJSON("logs", { ...this.load(), [isoDate]: log });
    },
    replaceAll(logs) {
      return writeJSON("logs", logs);
    },
  },
  prefs: {
    load() {
      return { ...DEFAULT_PREFS, ...readJSON("prefs", {}) };
    },
    save(prefs) {
      return writeJSON("prefs", prefs);
    },
  },
  // Coach chat, newest last, capped at CHAT_MAX: [{ from: "user" | "coach", text, list?, after?, session? }]
  chat: {
    load() {
      const messages = readJSON("chat", []);
      return Array.isArray(messages) ? messages : [];
    },
    save(messages) {
      return writeJSON("chat", messages.slice(-CHAT_MAX));
    },
  },
  // Server-side conversation id for the AI coach (random UUID; "Clear chat" starts a new one).
  coachConversation: {
    load() {
      return readJSON("coach.conversation", null);
    },
    save(id) {
      return writeJSON("coach.conversation", id);
    },
  },
  // { name } — optional first name, only used for greetings and the avatar initial.
  profile: {
    load() {
      return { name: "", ...readJSON("profile", {}) };
    },
    save(profile) {
      return writeJSON("profile", profile);
    },
  },
  demoVersion: {
    load() {
      return readJSON("version", null);
    },
    save(version) {
      return writeJSON("version", version);
    },
  },
  // Everything in the current namespace, for "Export my data".
  exportAll() {
    return {
      app: "Cycle Sync",
      exportedAt: new Date().toISOString(),
      schemaVersion: SCHEMA_VERSION,
      settings: IS_DEMO ? DEFAULT_SETTINGS : this.settings.loadSaved(),
      profile: this.profile.load(),
      tasks: this.tasks.load(),
      logs: this.logs.load(),
      prefs: this.prefs.load(),
      chat: this.chat.load(),
    };
  },
  // Removes everything Cycle Sync saved in this browser (real and demo data).
  clearAll() {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(STORAGE_PREFIX))
        .forEach((key) => localStorage.removeItem(key));
    } catch (err) {
      console.warn("Cycle Sync: could not clear storage", err);
    }
  },
};

// Brings saved data up to SCHEMA_VERSION, one step at a time.
function migrateStorage() {
  try {
    let version = Number(localStorage.getItem(SCHEMA_KEY)) || 1;
    while (version < SCHEMA_VERSION) {
      MIGRATIONS[version]();
      version++;
    }
    localStorage.setItem(SCHEMA_KEY, String(SCHEMA_VERSION));
  } catch (err) {
    console.warn("Cycle Sync: storage migration failed", err);
  }
}

// =====================================================================
// 5. Calendar source
// Everything reads events through this object. A Google Calendar / Outlook
// adapter can later replace it, as long as it returns the same event shape:
// { id, title, date: "YYYY-MM-DD", start: "HH:MM", end: "HH:MM", type }
// =====================================================================

const calendarSource = {
  getEvents(isoDate) {
    return store.tasks.load()
      .filter((t) => t.date === isoDate)
      .sort((a, b) => a.start.localeCompare(b.start));
  },
  addEvent(event) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    store.tasks.save([...store.tasks.load(), { ...event, id }]);
  },
  getEvent(id) {
    return store.tasks.load().find((t) => t.id === id) || null;
  },
  updateEvent(id, changes) {
    store.tasks.save(store.tasks.load().map((t) => (t.id === id ? { ...t, ...changes, id } : t)));
  },
  // Returns the removed event so it can be restored (Undo).
  deleteEvent(id) {
    const event = this.getEvent(id);
    store.tasks.save(store.tasks.load().filter((t) => t.id !== id));
    return event;
  },
  restoreEvent(event) {
    if (!this.getEvent(event.id)) store.tasks.save([...store.tasks.load(), event]);
  },
};

// =====================================================================
// 6. Alignment engine
// =====================================================================

// High Sync = suits this phase · Low Sync = best avoided in it ·
// Good = fine in any phase · Moderate = better in another phase.
function getSyncLevel(typeId, phaseKey) {
  const type = TASK_TYPES[typeId];
  if (!type) return "good";
  if (type.suits.includes(phaseKey)) return "high";
  if (type.avoid.includes(phaseKey)) return "low";
  return type.suits.length ? "moderate" : "good";
}

// Short labels from matching tasks first (in the order of levels), then the phase's own list, max 3, no repeats.
function pickInsights(events, levels, fallback) {
  const items = [];
  const add = (item) => {
    if (items.length < INSIGHT_COUNT && !items.some((i) => i.label === item.label)) items.push(item);
  };
  for (const level of levels) {
    for (const e of events) {
      if (e.sync === level) add({ label: TASK_TYPES[e.type].short, icon: TASK_TYPES[e.type].icon, fromTask: true });
    }
  }
  for (const item of fallback) add(item);
  return items;
}

// Score = average fit of the day's tasks (0–100). null when there are no tasks.
function calculateCycleAlignment({ phase, cycleDay, events }) {
  const rated = events.map((e) => ({ ...e, sync: getSyncLevel(e.type, phase) }));
  const score = rated.length
    ? Math.round(rated.reduce((sum, e) => sum + SYNC_LEVELS[e.sync].points, 0) / rated.length)
    : null;
  return {
    score,
    cycleDay,
    goodForYou: pickInsights(rated, ["high"], PHASES[phase].strengths),
    watchOuts: pickInsights(rated, ["low", "moderate"], PHASES[phase].watchOuts),
    events: rated,
  };
}

// Better phase(s) for a task type, e.g. "Luteal" — used in event details.
function suitedPhaseNames(typeId) {
  return TASK_TYPES[typeId].suits.map((k) => PHASES[k].name).join(" or ");
}

// =====================================================================
// 7. Demo data (only with ?demo=1)
// =====================================================================

// Bump DEMO_VERSION when the sample data changes, so old demo data is replaced.
const DEMO_VERSION = "2";

function seedDemoData() {
  if (store.demoVersion.load() === DEMO_VERSION) return;
  const t = today();
  const day = (offset) => toISODate(addDays(t, offset));
  // Today = the three events from the mockup (score 78 on Day 14).
  const tasks = [
    { title: "Client Presentation", date: day(0),  start: "10:00", end: "11:00", type: "networking" },
    { title: "Team Sync",           date: day(0),  start: "13:00", end: "14:00", type: "meeting" },
    { title: "Contract Review",     date: day(0),  start: "16:00", end: "17:00", type: "deepwork" },
    { title: "Quarterly planning",  date: day(-3), start: "09:00", end: "11:00", type: "planning" },
    { title: "Product brainstorm",  date: day(-2), start: "14:00", end: "15:30", type: "brainstorm" },
    { title: "Investor coffee",     date: day(-1), start: "09:30", end: "10:30", type: "networking" },
    { title: "Morning HIIT",        date: day(1),  start: "07:30", end: "08:15", type: "hiit" },
    { title: "Salary conversation", date: day(1),  start: "11:00", end: "11:30", type: "networking" },
    { title: "Pilates",             date: day(2),  start: "18:00", end: "19:00", type: "strength" },
    { title: "Close out Q3 report", date: day(3),  start: "10:00", end: "12:00", type: "wrapup" },
  ];
  tasks.forEach((task, i) => (task.id = "demo" + i));
  store.tasks.save(tasks);
  store.logs.replaceAll({ [day(0)]: { energy: 7, mood: "Good", focus: "High", sleep: "8h" } });
  store.demoVersion.save(DEMO_VERSION);
}

// =====================================================================
// 8. Alignment screen components
// =====================================================================

let selectedDate = today();
let openEventId = null;

function renderPhaseNow(state) {
  document.getElementById("phase-now").innerHTML =
    '<p class="phase-day">DAY ' + state.cycleDay + "</p>" +
    '<p class="phase-name" style="--phase-color: var(--' + state.phaseKey + ')">' +
      state.phase.name +
      '<span class="phase-icon" title="' + state.phase.powr + '">' + icon(state.phase.icon) + "</span>" +
    "</p>" +
    '<button type="button" class="phase-link" data-phase="' + state.phaseKey + '">View phase details' + icon("chevron") + "</button>";
}

// Bar under the hero: normal = phase tips, recovery = gentler wording.
function renderRecommendation(state, isRecovery) {
  const bar = document.getElementById("rec-bar");
  // Recovery opens the "lighter day" sheet; otherwise the phase detail.
  if (isRecovery) {
    delete bar.dataset.phase;
    bar.dataset.sheet = "lighter-day";
  } else {
    delete bar.dataset.sheet;
    bar.dataset.phase = state.phaseKey;
  }
  bar.innerHTML =
    '<span class="rec-icon">' + icon(isRecovery ? "heart" : "bulb") + "</span>" +
    '<span class="rec-text">See recommendations for ' + (isRecovery ? "recovery" : "your current phase") + "</span>" +
    icon("chevron");
}

const RING = { size: 200, stroke: 14, radius: 86 };

function buildRing() {
  const c = RING.size / 2;
  const circumference = 2 * Math.PI * RING.radius;
  document.getElementById("ring").innerHTML =
    '<svg viewBox="0 0 ' + RING.size + " " + RING.size + '" aria-hidden="true">' +
      '<defs><linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" style="stop-color: var(--ring-start)"/><stop offset="1" style="stop-color: var(--ring-end)"/>' +
      "</linearGradient></defs>" +
      '<circle class="ring-track" cx="' + c + '" cy="' + c + '" r="' + RING.radius + '" stroke-width="' + RING.stroke + '"/>' +
      '<circle class="ring-fill" id="ring-fill" cx="' + c + '" cy="' + c + '" r="' + RING.radius + '" stroke-width="' + RING.stroke + '"' +
        ' stroke-dasharray="' + circumference + '" stroke-dashoffset="' + circumference + '"/>' +
      '<g class="ring-knob" id="ring-knob"><circle cx="' + c + '" cy="' + (c - RING.radius) + '" r="' + (RING.stroke / 2 + 2) + '"/></g>' +
    "</svg>" +
    '<div class="ring-center" id="ring-center"></div>';
}

function updateRing(score) {
  const circumference = 2 * Math.PI * RING.radius;
  const fraction = score === null ? 0 : score / 100;
  const center = document.getElementById("ring-center");
  const knob = document.getElementById("ring-knob");

  center.innerHTML =
    '<div class="ring-score"><span class="ring-number">' + (score === null ? "–" : score) + '</span><span class="ring-max">/100</span></div>' +
    '<div class="ring-label">' + (score === null ? "No tasks today" : "Cycle Alignment") + "</div>" +
    '<div class="ring-wave">' + icon("wave") + "</div>";
  document.getElementById("ring").setAttribute("aria-label",
    (score === null ? "No tasks today to score" : "Cycle alignment " + score + " out of 100") + ". How your score works");

  knob.style.visibility = score === null ? "hidden" : "visible";
  // Next frame, so the first render animates from empty.
  requestAnimationFrame(() => {
    document.getElementById("ring-fill").style.strokeDashoffset = circumference * (1 - fraction);
    knob.style.transform = "rotate(" + fraction * 360 + "deg)";
  });
}

function renderInsightList(listId, items) {
  document.getElementById(listId).innerHTML = items
    .map((item) => '<li class="insight-item"><span class="insight-chip">' + icon(item.icon) + "</span>" + item.label + "</li>")
    .join("");
}

function renderInsights(result) {
  renderInsightList("good-list", result.goodForYou);
  renderInsightList("watch-list", result.watchOuts);
}

function renderWeek(settings) {
  const monday = startOfWeek(today());
  const todayISO = toISODate(today());
  const selectedISO = toISODate(selectedDate);
  let html = "";
  for (let i = 0; i < 7; i++) {
    const date = addDays(monday, i);
    const iso = toISODate(date);
    const phase = PHASES[getPhaseForDate(date, settings)];
    const count = calendarSource.getEvents(iso).length;
    const label = date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }) +
      ", " + phase.name + " phase, " + count + (count === 1 ? " task" : " tasks");
    html +=
      '<button type="button" class="day' + (iso === todayISO ? " is-today" : "") + '" data-date="' + iso + '"' +
        ' aria-pressed="' + (iso === selectedISO) + '" aria-label="' + label + '"' +
        ' style="--phase-color: var(--' + getPhaseForDate(date, settings) + ')">' +
        '<span class="day-name">' + DAY_NAMES[i] + "</span>" +
        '<span class="day-num">' + date.getDate() + "</span>" +
        '<span class="day-dots"><span class="day-phase-dot"></span>' + (count ? '<span class="day-task-dot"></span>' : "") + "</span>" +
      "</button>";
  }
  document.getElementById("week-strip").innerHTML = html;
}

function eventDetailText(event, phaseKey) {
  const phaseName = PHASES[phaseKey].name;
  const typeLabel = TASK_TYPES[event.type].label;
  const better = suitedPhaseNames(event.type);
  if (event.sync === "high") return typeLabel + ". A great fit for your " + phaseName + " phase.";
  if (event.sync === "moderate") return typeLabel + ". Fine today, even better in your " + better + " phase.";
  if (event.sync === "low") {
    return typeLabel + (better ? ". Could fit better in your " + better + " phase." : ". Keep it light in your " + phaseName + " phase.");
  }
  return typeLabel + ". A fair fit for any phase.";
}

function renderCalendarEvent(event, phaseKey) {
  const sync = SYNC_LEVELS[event.sync];
  const isOpen = event.id === openEventId;
  return (
    '<li class="event sync-' + event.sync + '">' +
      '<button type="button" class="event-row" data-event="' + event.id + '" aria-expanded="' + isOpen + '" aria-controls="detail-' + event.id + '">' +
        '<span class="event-dot"></span>' +
        '<span class="event-time">' + event.start + " – " + event.end + "</span>" +
        '<span class="event-title">' + escapeHTML(event.title) + "</span>" +
        '<span class="badge">' + icon(sync.icon) + sync.label + "</span>" +
        '<span class="event-chevron">' + icon("chevron") + "</span>" +
      "</button>" +
      '<div class="event-detail" id="detail-' + event.id + '"' + (isOpen ? "" : " hidden") + ">" +
        "<p>" + eventDetailText(event, phaseKey) + "</p>" +
        '<span class="event-actions">' +
          '<button type="button" class="delete-btn" data-edit="' + event.id + '">' + icon("pen") + "Edit</button>" +
          '<button type="button" class="delete-btn" data-delete="' + event.id + '">' + icon("trash") + "Delete</button>" +
        "</span>" +
      "</div>" +
    "</li>"
  );
}

function renderDayEvents(settings) {
  const state = getCycleState(selectedDate, settings);
  const events = calendarSource.getEvents(toISODate(selectedDate));
  const { events: rated } = calculateCycleAlignment({ phase: state.phaseKey, cycleDay: state.cycleDay, events });
  const list = document.getElementById("events");
  list.innerHTML = rated.map((e) => renderCalendarEvent(e, state.phaseKey)).join("");
  if (!rated.length) {
    list.innerHTML = '<li class="events-empty">Nothing planned. Add a task to see how it fits your phase.</li>';
  }
}

// Draws the whole Alignment screen from current data.
function renderAlignment() {
  const settings = store.settings.load();
  const now = getCycleState(today(), settings);
  const result = calculateCycleAlignment({
    phase: now.phaseKey,
    cycleDay: now.cycleDay,
    events: calendarSource.getEvents(toISODate(today())),
  });
  const isRecovery = result.score !== null && result.score < RECOVERY_BELOW;
  document.getElementById("screen-alignment").classList.toggle("is-recovery", isRecovery);
  for (const btn of document.querySelectorAll("[data-phase-today]")) btn.dataset.phase = now.phaseKey;
  renderPhaseNow(now);
  updateRing(result.score);
  renderRecommendation(now, isRecovery);
  renderInsights(result);
  renderWeek(settings);
  renderDayEvents(settings);
}

// ----- Info sheets (score explanation, lighter day) -----

const infoSheet = document.getElementById("info-sheet");

function openSheet(title, bodyHTML) {
  document.getElementById("info-title").textContent = title;
  document.getElementById("info-body").innerHTML = bodyHTML;
  infoSheet.showModal();
}

document.getElementById("info-close").addEventListener("click", () => infoSheet.close());

// Today's tasks rated for today's phase (shared by the sheets below).
function todaysAlignment() {
  const now = getCycleState(today(), store.settings.load());
  const result = calculateCycleAlignment({ phase: now.phaseKey, cycleDay: now.cycleDay, events: calendarSource.getEvents(toISODate(today())) });
  return { now, result };
}

function syncBadge(level) {
  return '<span class="badge sync-' + level + '">' + icon(SYNC_LEVELS[level].icon) + SYNC_LEVELS[level].label + "</span>";
}

function openScoreSheet() {
  const { now, result } = todaysAlignment();
  const text = CONTENT.score;
  const levels = Object.keys(SYNC_LEVELS).map((level) =>
    "<li>" + syncBadge(level) + "<span>" + text.levels[level] + '</span><span class="points">' + SYNC_LEVELS[level].points + "</span></li>"
  ).join("");
  const tasks = result.events.length
    ? "<ul class=\"sheet-list\">" + result.events.map((e) =>
        "<li><span>" + escapeHTML(e.title) + "</span>" + syncBadge(e.sync) + "</li>").join("") + "</ul>"
    : "<p>" + text.noTasks + "</p>";
  openSheet(text.title,
    "<p>" + fillTemplate(text.intro, now.phaseKey) + "</p>" +
    '<ul class="sheet-list level-list">' + levels + "</ul>" +
    "<h3>" + text.todayHeading + (result.score === null ? "" : ": " + result.score + "/100") + "</h3>" + tasks +
    '<p class="sheet-note">' + text.note + "</p>");
}

// Lowest-scoring task today (first one on ties), or null.
function lowestFitTask(events) {
  return events.reduce((worst, e) => (!worst || SYNC_LEVELS[e.sync].points < SYNC_LEVELS[worst.sync].points ? e : worst), null);
}

function openLighterDaySheet() {
  const { now, result } = todaysAlignment();
  const text = CONTENT.lighterDay;
  const worst = lowestFitTask(result.events);
  let taskTip = "";
  if (worst) {
    const better = suitedPhaseNames(worst.type);
    const vars = { task: escapeHTML(worst.title), better };
    taskTip =
      "<p>" + fillTemplate(better ? text.moveTask : text.shortenTask, now.phaseKey, vars) + "</p>" +
      '<button type="button" class="sheet-btn" data-edit="' + worst.id + '">' + icon("pen") + text.editLabel + "</button>";
  }
  openSheet(text.title,
    "<p>" + fillTemplate(text.intro, now.phaseKey) + "</p>" + taskTip +
    '<ul class="sheet-bullets">' + text.tips.map((t) => "<li>" + t + "</li>").join("") + "</ul>" +
    '<button type="button" class="sheet-btn" data-session="calm">' + icon("play") + text.breatheLabel + "</button>" +
    '<button type="button" class="sheet-btn" data-phase="' + now.phaseKey + '">' + icon("chevron") +
      fillTemplate(text.detailsLabel, now.phaseKey) + "</button>");
}

// =====================================================================
// 9. Cycle Plan screen components
// =====================================================================

// Order in the phase bar and legend: a cycle starts with the period.
const CYCLE_ORDER = ["menstrual", "follicular", "ovulatory", "luteal"];

// Month shown in the Cycle Plan calendar (always the 1st of that month).
let planMonth = new Date(today().getFullYear(), today().getMonth(), 1);

// "Days 13–15", "Day 8" or "" for a zero-day phase.
function phaseRangeText(range) {
  if (range.start > range.end) return "";
  return range.start === range.end ? "Day " + range.start : "Days " + range.start + "–" + range.end;
}

function phaseLength(range) {
  return Math.max(0, range.end - range.start + 1);
}

// Hero: today's phase, a bar of the whole cycle with a marker for today, and the next phase.
function renderPlanHero(state, settings) {
  const ranges = getPhaseRanges(settings);
  const segments = CYCLE_ORDER.filter((key) => phaseLength(ranges[key]) > 0).map((key) =>
    '<span class="cycle-seg" style="--phase-color: var(--' + key + "); flex-grow: " + phaseLength(ranges[key]) + '"></span>'
  ).join("");
  const markerAt = ((state.cycleDay - 0.5) / settings.cycleLength) * 100;
  const days = daysUntilNextPhase(today(), settings);
  const next = PHASES[getPhaseForDate(addDays(today(), days), settings)];

  document.getElementById("plan-hero").innerHTML =
    '<p class="plan-day">Day ' + state.cycleDay + "</p>" +
    '<p class="plan-phase" style="--phase-color: var(--' + state.phaseKey + ')">' + state.phase.name +
      '<span class="plan-phase-icon">' + icon(state.phase.icon) + "</span></p>" +
    '<div class="cycle-line" role="img" aria-label="Day ' + state.cycleDay + " of " + settings.cycleLength + '">' +
      segments + '<span class="cycle-marker" style="left: ' + markerAt + '%"></span>' +
    "</div>" +
    '<p class="plan-next-label">Next phase</p>' +
    '<p class="plan-next">' + next.name + " in " + days + (days === 1 ? " day" : " days") + "</p>";
}

function renderMonth(settings) {
  const year = planMonth.getFullYear();
  const month = planMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (planMonth.getDay() + 6) % 7; // empty cells before the 1st (weeks start Monday)
  const weeks = Math.ceil((offset + daysInMonth) / 7);
  const todayISO = toISODate(today());
  const ranges = getPhaseRanges(settings);

  document.getElementById("plan-month").textContent =
    planMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  let html = '<div class="month-row month-names" aria-hidden="true">' +
    DAY_NAMES.map((d) => "<span>" + d + "</span>").join("") + "</div>";

  for (let w = 0; w < weeks; w++) {
    const cells = [];
    for (let i = 0; i < 7; i++) {
      const dayNum = w * 7 + i - offset + 1;
      if (dayNum < 1 || dayNum > daysInMonth) {
        cells.push(null);
        continue;
      }
      const date = new Date(year, month, dayNum);
      const cycleDay = getCycleDay(date, settings);
      const phaseKey = getPhase(cycleDay, settings);
      const iso = toISODate(date);
      cells.push({ iso, dayNum, phaseKey, isStart: cycleDay === ranges[phaseKey].start, isToday: iso === todayISO });
    }

    // Numbers
    html += '<div class="month-row">' + cells.map((c) => {
      if (!c) return "<span></span>";
      return '<button type="button" class="m-day' + (c.isToday ? " is-today" : "") + '" data-day="' + c.iso + '">' + c.dayNum +
        '<span class="sr-only">, ' + PHASES[c.phaseKey].name + (c.isToday ? ", today" : "") + "</span></button>";
    }).join("") + "</div>";

    // Phase bar: one segment per run of days in the same phase, icon where a phase starts.
    let bar = "";
    let runStart = -1;
    for (let i = 0; i <= 7; i++) {
      const c = cells[i];
      const prev = runStart >= 0 ? cells[runStart] : null;
      if (prev && (!c || c.phaseKey !== prev.phaseKey)) {
        bar += '<span class="m-seg" style="--phase-color: var(--' + prev.phaseKey + "); grid-column: " +
          (runStart + 1) + " / span " + (i - runStart) + '"></span>';
        runStart = -1;
      }
      if (c && runStart < 0) runStart = i;
    }
    cells.forEach((c, i) => {
      if (c && c.isStart) {
        bar += '<span class="m-icon" style="--phase-color: var(--' + c.phaseKey + "); grid-column: " + (i + 1) + '">' +
          icon(PHASES[c.phaseKey].icon) + "</span>";
      }
    });
    html += '<div class="month-row month-bar" aria-hidden="true">' + bar + "</div>";
  }
  document.getElementById("month").innerHTML = html;
}

function renderLegend() {
  document.getElementById("legend").innerHTML = CYCLE_ORDER.map((key) =>
    '<li><button type="button" class="legend-item" data-phase="' + key + '" style="--phase-color: var(--' + key + ')">' +
      '<span class="legend-icon">' + icon(PHASES[key].icon) + "</span>" +
      '<span class="legend-text"><span class="legend-name">' + PHASES[key].name + "</span>" +
      '<span class="legend-days">' + PHASES[key].typical + "</span></span>" +
    "</button></li>"
  ).join("");
}

// ----- Track Today (daily check-in) -----

const LOG_FIELDS = [
  { id: "energy", label: "Energy", icon: "bolt",  color: "energy", format: (v) => v + "/10" },
  { id: "mood",   label: "Mood",   icon: "smile", color: "mood",   options: ["Low", "Okay", "Good", "Great"] },
  { id: "focus",  label: "Focus",  icon: "focus", color: "focus",  options: ["Low", "Medium", "High"] },
  { id: "sleep",  label: "Sleep",  icon: "moon",  color: "sleep",  options: ["<8h", "8h", ">8h"] },
];
const DEFAULT_ENERGY = 5;

function renderTrackToday() {
  const log = store.logs.load()[toISODate(today())] || {};
  document.getElementById("track-grid").innerHTML = LOG_FIELDS.map((f) => {
    const value = log[f.id] === undefined ? "–" : f.format ? f.format(log[f.id]) : log[f.id];
    return (
      '<button type="button" class="track track-' + f.color + '" data-log="' + f.id + '" aria-label="' + f.label + ": " + value + '">' +
        '<span class="track-top"><span class="track-icon">' + icon(f.icon) + "</span>" + f.label + "</span>" +
        '<span class="track-bottom"><span class="track-value">' + escapeHTML(value) + "</span>" + icon("chevron") + "</span>" +
      "</button>"
    );
  }).join("");
}

// Mood / Focus / Sleep as rows of pill buttons (radio inputs).
function renderLogChoices() {
  document.getElementById("log-choices").innerHTML = LOG_FIELDS.filter((f) => f.options).map((f) =>
    '<fieldset class="choice" id="log-' + f.id + '"><legend>' + f.label + "</legend>" +
      f.options.map((opt) =>
        '<label><input type="radio" name="' + f.id + '" value="' + escapeHTML(opt) + '"><span>' + escapeHTML(opt) + "</span></label>"
      ).join("") +
    "</fieldset>"
  ).join("");
}

const logDialog = document.getElementById("log-dialog");
const logForm = document.getElementById("log-form");

function openLogDialog(fieldId) {
  const log = store.logs.load()[toISODate(today())] || {};
  logForm.reset();
  logForm.elements.energy.value = log.energy ?? DEFAULT_ENERGY;
  document.getElementById("energy-out").textContent = logForm.elements.energy.value;
  for (const f of LOG_FIELDS) {
    if (f.options && log[f.id]) {
      const input = logForm.querySelector('input[name="' + f.id + '"][value="' + CSS.escape(log[f.id]) + '"]');
      if (input) input.checked = true;
    }
  }
  logDialog.showModal();
  // Put focus on the field that was tapped.
  const target = fieldId === "energy" ? logForm.elements.energy : logForm.querySelector('input[name="' + fieldId + '"]');
  if (target) target.focus();
}

logForm.elements.energy.addEventListener("input", function () {
  document.getElementById("energy-out").textContent = this.value;
});

logForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const log = { energy: Number(this.elements.energy.value) };
  for (const f of LOG_FIELDS) {
    const checked = this.querySelector('input[name="' + f.id + '"]:checked');
    if (f.options && checked) log[f.id] = checked.value;
  }
  store.logs.saveDay(toISODate(today()), log);
  logDialog.close();
  renderTrackToday();
});

document.getElementById("log-cancel").addEventListener("click", () => logDialog.close());

// Three picture tiles for the current phase.
function renderPhaseFocus(state) {
  document.getElementById("focus-grid").innerHTML = state.phase.focus.map((item, i) =>
    '<button type="button" class="focus-tile focus-tile-' + (i + 1) + '" data-phase="' + state.phaseKey + '" data-section="' + item.section + '">' +
      '<span class="focus-icon">' + icon(item.icon) + "</span>" +
      '<span class="focus-label">' + item.label + "</span>" +
    "</button>"
  ).join("");
  document.getElementById("focus-more").dataset.phase = state.phaseKey;
}

function renderPlan() {
  const settings = store.settings.load();
  const now = getCycleState(today(), settings);
  renderPlanHero(now, settings);
  renderMonth(settings);
  renderLegend();
  renderTrackToday();
  renderPhaseFocus(now);
}

const DETAIL_ICONS = { work: "target", move: "dumbbell", eat: "cutlery" };

function renderTipCard(id, title, iconName, items, ordered) {
  const tag = ordered ? "ol" : "ul";
  return (
    '<section class="tip-card"' + (id ? ' id="' + id + '"' : "") + ">" +
      '<h2><span class="tip-icon">' + icon(iconName) + "</span>" + title + "</h2>" +
      "<" + tag + ">" + items.map((t) => "<li>" + t + "</li>").join("") + "</" + tag + ">" +
    "</section>"
  );
}

function renderPhaseDetail(phaseKey) {
  const phase = PHASES[phaseKey];
  const text = CONTENT.phaseDetail;
  const days = phaseRangeText(getPhaseRanges(store.settings.load())[phaseKey]);
  document.getElementById("phase-detail").innerHTML =
    '<div class="detail-head" style="--phase-color: var(--' + phaseKey + ')">' +
      '<span class="phase-icon">' + icon(phase.icon) + "</span>" +
      "<h1>" + phase.name + "</h1>" +
      '<p class="detail-meta">' + phase.powr + (days ? " · " + days + " (estimated)" : "") + "</p>" +
      '<p class="detail-tagline">' + phase.tagline + " " + phase.hormones + "</p>" +
    "</div>" +
    ["work", "move", "eat"].map((key) => renderTipCard("phase-section-" + key, text.headings[key], DETAIL_ICONS[key], phase[key])).join("") +
    renderTipCard("", text.planTitle, "calendar", text.planSteps, true) +
    '<p class="detail-note">' + text.evidence + "</p>" +
    '<p class="detail-note">' + text.source + "</p>";
}

// Opens phase detail; section ("work" | "move" | "eat") scrolls to that list.
function openPhaseDetail(phaseKey, section) {
  renderPhaseDetail(phaseKey);
  openScreen("phase-detail");
  if (section) document.getElementById("phase-section-" + section).scrollIntoView({ block: "start" });
}

// ----- Day sheet (tap a date in the month calendar) -----

function openDaySheet(iso) {
  const date = parseLocalDate(iso);
  const state = getCycleState(date, store.settings.load());
  const text = CONTENT.daySheet;
  const { events } = calculateCycleAlignment({ phase: state.phaseKey, cycleDay: state.cycleDay, events: calendarSource.getEvents(iso) });
  const tasks = events.length
    ? '<ul class="sheet-list">' + events.map((e) =>
        '<li><span><span class="sheet-time">' + e.start + "–" + e.end + "</span> " + escapeHTML(e.title) + "</span>" + syncBadge(e.sync) + "</li>"
      ).join("") + "</ul>"
    : "<p>" + text.noTasks + "</p>";
  openSheet(date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }),
    '<p class="sheet-phase" style="--phase-color: var(--' + state.phaseKey + ')"><span class="phase-icon">' + icon(state.phase.icon) + "</span>" +
      fillTemplate(text.phaseLine, state.phaseKey, { day: state.cycleDay }) + "</p>" +
    tasks +
    '<button type="button" class="sheet-btn" data-add-on="' + iso + '">' + icon("plus") + text.addLabel + "</button>" +
    '<button type="button" class="sheet-btn" data-phase="' + state.phaseKey + '">' + icon("chevron") +
      fillTemplate(text.ideasLabel, state.phaseKey) + "</button>");
}

// =====================================================================
// 10. AI Coach screen (scripted demo: pre-written replies, not real AI)
// =====================================================================

const COACH = CONTENT.coach;

// Fills "{phase}", "{powr}", ... in a content template for one phase.
// extra = more values (already HTML-safe), e.g. { task: escapeHTML(title) }.
function fillTemplate(template, phaseKey, extra = {}) {
  const phase = PHASES[phaseKey];
  const vars = { phase: phase.name, powr: phase.powr, tagline: phase.tagline, firstMove: phase.move[0], firstWork: phase.work[0], ...extra };
  return template.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? vars[name] : match));
}

// Named lists a reply can point to (besides the phase's own work / move / eat).
function namedList(name, phaseKey) {
  return name === "planSteps" ? CONTENT.phaseDetail.planSteps : PHASES[phaseKey][name];
}

// Today's numbers for coach templates: {day}, {nextPhase}, {nextIn}, {scoreText}, {levels}.
function coachVars() {
  const settings = store.settings.load();
  const { now, result } = todaysAlignment();
  const nextIn = daysUntilNextPhase(today(), settings);
  return {
    phaseKey: now.phaseKey,
    vars: {
      day: now.cycleDay,
      nextPhase: PHASES[getPhaseForDate(addDays(today(), nextIn), settings)].name,
      nextIn: nextIn + (nextIn === 1 ? " day" : " days"),
      scoreText: result.score === null ? "no tasks yet" : result.score + "/100",
      levels: Object.values(SYNC_LEVELS).map((l) => l.label + " " + l.points).join(", "),
    },
  };
}

// Content reply spec → plain-text message: { text, list?, after?, session? }
function coachReply(reply, phaseKey, vars) {
  const spec = reply.byPhase ? reply.byPhase[phaseKey] : reply;
  return {
    text: fillTemplate(spec.text, phaseKey, vars),
    list: typeof spec.list === "string" ? namedList(spec.list, phaseKey) : spec.list,
    after: spec.after && fillTemplate(spec.after, phaseKey, vars),
    session: spec.session,
  };
}

// Drawn scenes for the session cards (stand-ins for photos).
const SESSION_ART = {
  water:
    '<defs><linearGradient id="art-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d3deea"/><stop offset="1" stop-color="#5a7ba6"/></linearGradient></defs>' +
    '<rect width="100" height="160" fill="url(#art-water)"/>' +
    '<path d="M0 52C20 42 35 62 55 50S85 42 100 52V160H0Z" fill="#9fb6d2" opacity="0.7"/>' +
    '<path d="M0 72C25 60 40 82 60 68S88 62 100 72V160H0Z" fill="#7d9bc2" opacity="0.8"/>' +
    '<path d="M0 94C20 84 45 102 65 90S90 86 100 94V160H0Z" fill="#5d7fab"/>',
  sunrise:
    '<defs><linearGradient id="art-sunrise" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7e6cf"/><stop offset="1" stop-color="#c99f7c"/></linearGradient>' +
    '<radialGradient id="art-glow"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#fffaf0" stop-opacity="0"/></radialGradient></defs>' +
    '<rect width="100" height="160" fill="url(#art-sunrise)"/>' +
    '<circle cx="62" cy="62" r="40" fill="url(#art-glow)"/>' +
    '<path d="M0 110C25 96 55 104 100 92V160H0Z" fill="#a88468"/>' +
    '<path d="M0 126C30 116 70 124 100 114V160H0Z" fill="#7d6250"/>',
  notebook:
    '<defs><linearGradient id="art-desk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1ece5"/><stop offset="1" stop-color="#c9b7a2"/></linearGradient></defs>' +
    '<rect width="100" height="160" fill="url(#art-desk)"/>' +
    '<ellipse cx="80" cy="20" rx="13" ry="9" fill="#7f9a78"/><rect x="73" y="26" width="14" height="13" rx="2" fill="#ebe5dc"/>' +
    '<g transform="rotate(-18 50 90)"><rect x="10" y="52" width="82" height="92" rx="3" fill="#fbfaf7"/>' +
    '<path d="M51 52v92" stroke="#e2dcd2"/><path d="M18 70h26M18 80h26M18 90h26M58 70h26M58 80h26" stroke="#e7e2da"/></g>' +
    '<path d="M60 64 86 110" stroke="#2d2d30" stroke-width="3" stroke-linecap="round"/>',
  mountains:
    '<defs><linearGradient id="art-dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d6b8"/><stop offset="1" stop-color="#9eb0cc"/></linearGradient></defs>' +
    '<rect width="100" height="160" fill="url(#art-dusk)"/>' +
    '<circle cx="64" cy="44" r="10" fill="#fff4dc" opacity="0.6"/><circle cx="64" cy="44" r="5" fill="#fffaf0"/>' +
    '<path d="M0 78 22 60 40 74 62 56 100 80V160H0Z" fill="#8c9fc2"/>' +
    '<path d="M0 96 30 76 52 92 78 72 100 88V160H0Z" fill="#6e84ad"/>' +
    '<path d="M0 116 26 98 58 114 84 96 100 104V160H0Z" fill="#50668f"/>',
};

let chatMessages = [];

// Keywords match from the start of a word ("eat" matches "eating", not "breathing").
function findTopic(text) {
  const lower = text.toLowerCase();
  const matches = (keyword) => new RegExp("\\b" + keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(lower);
  return COACH.topics.find((t) => t.keywords.some(matches));
}

// Four starter questions for today's phase (C8).
function renderCoachChips() {
  const phaseKey = getCycleState(today(), store.settings.load()).phaseKey;
  document.getElementById("clear-chat-btn").innerHTML = icon("trash") + COACH.clearLabel;
  document.getElementById("coach-chips").innerHTML = COACH.chipsByPhase[phaseKey].map((question) =>
    '<button type="button" class="chip" data-ask="' + escapeHTML(question) + '">' + escapeHTML(question) + icon("arrow") + "</button>"
  ).join("");
}

// ----- AI coach connection -----

const COACH_API = "/api/coach";
const COACH_HEALTH = "/api/health";
const COACH_TIMEOUT_MS = 100000; // a little above the server's own timeout
const HEALTH_TIMEOUT_MS = 4000;
const CHECKIN_DAYS = 7;

// "ai" = server + key ready · "offline" = no server (e.g. GitHub Pages) · "not_configured" = server without API key
let coachMode = "offline";
let coachProvider = "gemini"; // from /api/health; picks the AI provider note
let coachRequest = null; // AbortController of the reply being streamed

async function checkCoachServer() {
  try {
    const res = await fetch(COACH_HEALTH, { signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS) });
    const health = res.ok ? await res.json() : null;
    coachMode = health && health.coach === "ready" ? "ai" : health ? "not_configured" : "offline";
    if (health && COACH.aiNotes[health.provider]) coachProvider = health.provider;
  } catch {
    coachMode = "offline";
  }
  renderCoachNote();
}

function renderCoachNote() {
  document.getElementById("coach-note").textContent = coachMode === "ai" ? COACH.aiNotes[coachProvider] : COACH.offlineNote;
}

// The conversation id ties this device's chat to its history on the server.
function coachConversationId() {
  let id = store.coachConversation.load();
  if (!id) {
    id = crypto.randomUUID();
    store.coachConversation.save(id);
  }
  return id;
}

// What the coach needs to know about today (C5). Computed here; never includes name or email.
function coachContext() {
  const settings = store.settings.load();
  const now = getCycleState(today(), settings);
  const nextIn = daysUntilNextPhase(today(), settings);
  const { result } = todaysAlignment();
  const logs = store.logs.load();
  const checkins = [];
  for (let i = CHECKIN_DAYS - 1; i >= 0; i--) {
    const iso = toISODate(addDays(today(), -i));
    if (logs[iso]) checkins.push({ date: iso, ...logs[iso] });
  }
  return {
    date: toISODate(today()),
    cycle_day: now.cycleDay,
    cycle_length: settings.cycleLength,
    period_length: settings.periodLength,
    phase: now.phaseKey,
    phase_days: phaseRangeText(getPhaseRanges(settings)[now.phaseKey]),
    next_phase: getPhaseForDate(addDays(today(), nextIn), settings),
    next_phase_in_days: nextIn,
    score: result.score,
    tasks: result.events.slice(0, 12).map((e) => ({
      title: e.title.slice(0, 60),
      start: e.start,
      end: e.end,
      type: TASK_TYPES[e.type] ? TASK_TYPES[e.type].label : e.type,
      level: e.sync,
    })),
    checkins,
  };
}

// Reads "event: x\ndata: {...}\n\n" blocks from a fetch body and calls onEvent for each.
async function readEventStream(body, onEvent) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let end;
    while ((end = buffer.indexOf("\n\n")) >= 0) {
      const block = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      const data = block.split("\n").find((line) => line.startsWith("data: "));
      if (data) onEvent(JSON.parse(data.slice(6)));
    }
  }
}

// ----- Safe Markdown (escape first, then only **bold**, *italic*, lists, paragraphs) -----

function inlineMarkdown(line) {
  return escapeHTML(line.replace(/^#{1,6}\s+/, ""))
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*(?!\s)([^*]+?)\*(?=[\s).,!?:;]|$)/g, "$1<em>$2</em>");
}

function renderMarkdown(text) {
  const html = [];
  let paragraph = [];
  let list = null; // { tag, items }
  const flushParagraph = () => {
    if (paragraph.length) html.push("<p>" + paragraph.map(inlineMarkdown).join("<br>") + "</p>");
    paragraph = [];
  };
  const flushList = () => {
    if (list) html.push("<" + list.tag + ">" + list.items.map((i) => "<li>" + inlineMarkdown(i) + "</li>").join("") + "</" + list.tag + ">");
    list = null;
  };
  for (const line of text.replace(/\r/g, "").split("\n")) {
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const item = bullet || numbered;
    if (item) {
      flushParagraph();
      const tag = bullet ? "ul" : "ol";
      if (!list || list.tag !== tag) {
        flushList();
        list = { tag, items: [] };
      }
      list.items.push(item[1]);
    } else if (!line.trim()) {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  flushList();
  return html.join("");
}

// ----- Chat rendering -----

function renderChatMessage(m, index) {
  if (m.from === "user") return '<div class="bubble bubble-user">' + escapeHTML(m.text) + "</div>";
  if (m.pending) {
    return '<div class="bubble bubble-coach" data-msg="' + index + '">' +
      (m.text ? renderMarkdown(m.text) : '<span class="typing" aria-label="Coach is typing"><i></i><i></i><i></i></span>') + "</div>";
  }
  if (m.error) {
    return '<div class="bubble bubble-coach bubble-error" role="alert">' +
      "<p>" + escapeHTML(m.error.message) + "</p>" +
      (m.error.retryable ? '<button type="button" class="bubble-action" data-retry="' + index + '">' + icon("arrow") + COACH.retryLabel + "</button>" : "") +
    "</div>";
  }
  if (m.source === "ai") {
    return '<div class="bubble bubble-coach">' + renderMarkdown(m.text) +
      (m.truncated ? '<p class="bubble-meta">' + COACH.truncated + "</p>" : "") + "</div>";
  }
  // Scripted (offline) reply
  const session = m.session && COACH.sessions.find((s) => s.id === m.session);
  return (
    '<div class="bubble bubble-coach">' +
      (m.source === "offline" ? '<p class="bubble-meta">' + COACH.offlineLabel + "</p>" : "") +
      "<p>" + escapeHTML(m.text) + "</p>" +
      (m.list ? "<ul>" + m.list.map((item) => "<li>" + escapeHTML(item) + "</li>").join("") + "</ul>" : "") +
      (m.after ? "<p>" + escapeHTML(m.after) + "</p>" : "") +
      (session
        ? '<button type="button" class="bubble-action" data-session="' + session.id + '">' +
            icon("play") + "Start " + session.title + " · " + session.minutes + " min</button>"
        : "") +
      (m.source === "offline" && index === chatMessages.length - 1
        ? '<button type="button" class="bubble-action" data-retry="' + index + '">' + icon("sparkle") + COACH.retryAiLabel + "</button>"
        : "") +
    "</div>"
  );
}

function renderChat() {
  document.getElementById("coach-chat").innerHTML = chatMessages.map(renderChatMessage).join("");
  document.getElementById("clear-chat-btn").hidden = chatMessages.length === 0;
}

// Saved chat never keeps a half-streamed answer.
function saveChat() {
  store.chat.save(chatMessages.filter((m) => !m.pending));
}

function loadChat() {
  chatMessages = store.chat.load();
  renderChat();
}

// Clears on screen at once; the server copy is deleted only after the Undo window closes.
function clearChat() {
  if (coachRequest) coachRequest.abort();
  const previous = chatMessages;
  const previousId = store.coachConversation.load();
  chatMessages = [];
  store.coachConversation.save(crypto.randomUUID());
  saveChat();
  renderChat();
  let undone = false;
  showToast(COACH.cleared, {
    label: "Undo",
    onClick: () => {
      undone = true;
      chatMessages = previous;
      store.coachConversation.save(previousId);
      saveChat();
      renderChat();
    },
  });
  setTimeout(() => {
    if (!undone && previousId && coachMode === "ai") {
      fetch(COACH_API + "/" + previousId, { method: "DELETE" }).catch(() => {}); // best effort
    }
  }, TOAST_ACTION_MS + 500);
}

function scrollToLastMessage() {
  const last = document.querySelector("#coach-chat .bubble:last-child");
  if (last) last.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function setComposerBusy(busy) {
  document.querySelector("#ask-form .send-btn").disabled = busy;
  for (const chip of document.querySelectorAll("#coach-chips .chip")) chip.disabled = busy;
}

// Scripted answer for the same question, used when the AI server can't be reached (C9).
function offlineReply(text) {
  const { phaseKey, vars } = coachVars();
  const topic = findTopic(text);
  return { from: "coach", source: "offline", ...coachReply(topic ? topic.reply : COACH.fallback, phaseKey, vars) };
}

// One question → one answer: streamed from the AI coach, or the offline coach if there's no server.
function askCoach(text) {
  if (coachRequest) return; // one answer at a time
  chatMessages.push({ from: "user", text });
  answerLastQuestion();
}

function answerLastQuestion() {
  const question = chatMessages[chatMessages.length - 1].text;
  if (coachMode !== "ai") {
    chatMessages.push(offlineReply(question));
    chatMessages = chatMessages.slice(-CHAT_MAX);
    saveChat();
    renderChat();
    scrollToLastMessage();
    return;
  }
  const reply = { from: "coach", pending: true, text: "" };
  chatMessages.push(reply);
  renderChat();
  scrollToLastMessage();
  streamAnswer(question, reply);
}

async function streamAnswer(question, reply) {
  const controller = new AbortController();
  coachRequest = controller;
  setComposerBusy(true);
  const timeout = setTimeout(() => controller.abort("timeout"), COACH_TIMEOUT_MS);
  let result = null; // { done } | { error } | { offline }
  try {
    const res = await fetch(COACH_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversation_id: coachConversationId(), message: question, context: coachContext() }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      if (!body || res.status === 404 || res.status === 405) result = { offline: true };
      else if (body.code === "not_configured") result = { offline: true, notConfigured: true };
      else result = { error: { message: body.message, retryable: res.status === 429 || res.status >= 500 } };
    } else {
      await readEventStream(res.body, (event) => {
        if (event.event === "delta") {
          reply.text += event.text;
          const bubble = document.querySelector('[data-msg="' + chatMessages.indexOf(reply) + '"]');
          if (bubble) bubble.innerHTML = renderMarkdown(reply.text);
        } else if (event.event === "done") {
          result = { done: true, truncated: event.truncated };
        } else if (event.event === "error") {
          result = { error: { message: event.message, retryable: event.retryable } };
        }
      });
      if (!result) result = { error: { message: COACH.interrupted, retryable: true } };
    }
  } catch (err) {
    const aborted = controller.signal.aborted;
    result = aborted && controller.signal.reason !== "timeout"
      ? { cancelled: true } // chat was cleared while streaming
      : aborted
        ? { error: { message: "The coach took too long to answer. Try again.", retryable: true } }
        : { offline: true }; // network failure: server unreachable
  } finally {
    clearTimeout(timeout);
    coachRequest = null;
    setComposerBusy(false);
  }
  finishAnswer(reply, result);
}

function finishAnswer(reply, result) {
  const index = chatMessages.indexOf(reply);
  if (index < 0 || result.cancelled) return; // chat was cleared meanwhile
  if (result.done) {
    chatMessages[index] = { from: "coach", source: "ai", text: reply.text.trim(), truncated: Boolean(result.truncated) };
  } else if (result.offline) {
    coachMode = result.notConfigured ? "not_configured" : "offline";
    renderCoachNote();
    chatMessages[index] = offlineReply(chatMessages[index - 1].text);
  } else {
    chatMessages[index] = { from: "coach", error: result.error };
  }
  chatMessages = chatMessages.slice(-CHAT_MAX);
  saveChat();
  renderChat();
  scrollToLastMessage();
}

// Retry: drop the failed or offline answer and ask again (re-checking the server first if offline).
async function retryAnswer(index) {
  if (coachRequest || !chatMessages[index] || chatMessages[index].from !== "coach") return;
  chatMessages.splice(index, 1);
  if (coachMode !== "ai") await checkCoachServer();
  answerLastQuestion();
}

function renderSessions() {
  document.getElementById("session-row").innerHTML = COACH.sessions.map((s) =>
    '<button type="button" class="session-card" data-session="' + s.id + '">' +
      '<svg class="session-art" viewBox="0 0 100 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + SESSION_ART[s.art] + "</svg>" +
      '<span class="session-play">' + icon("play") + "</span>" +
      '<span class="session-min">' + s.minutes + " min</span>" +
      '<span class="session-title">' + s.title + "</span>" +
    "</button>"
  ).join("");
}

// ----- Guided timer -----

const BREATH = { in: 4, out: 6 }; // seconds
const timerDialog = document.getElementById("timer-dialog");
let timer = null; // { session, remaining, elapsed, started, intervalId }

function formatTime(seconds) {
  return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
}

// state: "in" (circle grows), "out" (circle shrinks) or "" (resting size)
function setBreath(state, cue) {
  document.getElementById("breath").className = "breath" + (state ? " is-" + state : "");
  const cueEl = document.getElementById("breath-cue");
  if (cueEl.textContent !== cue) cueEl.textContent = cue;
}

function breathTick() {
  const inhale = timer.elapsed % (BREATH.in + BREATH.out) < BREATH.in;
  setBreath(inhale ? "in" : "out", inhale ? "Breathe in" : "Breathe out");
}

function renderTimer() {
  let label = "Start";
  if (timer.intervalId) label = "Pause";
  else if (timer.remaining === 0) label = "Start again";
  else if (timer.started) label = "Resume";
  document.getElementById("timer-time").textContent = formatTime(timer.remaining);
  document.getElementById("timer-toggle").textContent = label;
}

function stopTimer() {
  clearInterval(timer.intervalId);
  timer.intervalId = null;
  renderTimer();
}

function startTimer() {
  if (timer.remaining === 0) {
    timer.remaining = timer.session.minutes * 60;
    timer.elapsed = 0;
  }
  timer.started = true;
  breathTick();
  timer.intervalId = setInterval(() => {
    timer.elapsed++;
    timer.remaining--;
    if (timer.remaining <= 0) {
      stopTimer();
      setBreath("", "Well done");
      return;
    }
    breathTick();
    renderTimer();
  }, 1000);
  renderTimer();
}

function openSession(id) {
  const session = COACH.sessions.find((s) => s.id === id);
  const phaseKey = getCycleState(today(), store.settings.load()).phaseKey;
  timer = { session, remaining: session.minutes * 60, elapsed: 0, started: false, intervalId: null };
  document.getElementById("timer-title").textContent = session.title;
  document.getElementById("timer-tips").innerHTML = session.tips.map((t) => "<li>" + fillTemplate(t, phaseKey) + "</li>").join("");
  setBreath("", "Ready when you are");
  renderTimer();
  timerDialog.showModal();
}

document.getElementById("timer-toggle").addEventListener("click", () => {
  if (timer.intervalId) {
    stopTimer();
    setBreath("", "Paused");
  } else {
    startTimer();
  }
});
document.getElementById("timer-close").addEventListener("click", () => timerDialog.close());
timerDialog.addEventListener("close", () => {
  if (timer) stopTimer();
});

document.getElementById("ask-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const input = document.getElementById("ask-input");
  const text = input.value.trim();
  if (!text || coachRequest) return; // keep the typed text while an answer is still streaming
  askCoach(text);
  input.value = "";
});

// Phone keyboards: keep the question box in view when it opens.
document.getElementById("ask-input").addEventListener("focus", () => {
  setTimeout(() => document.getElementById("ask-form").scrollIntoView({ block: "center", behavior: "smooth" }), 300);
});

// =====================================================================
// 11. Settings screen
// =====================================================================

// Small drawn logos (24×24, filled) for the integration cards; names come from content.js.
const INTEGRATION_LOGOS = {
  whatsapp: '<rect width="24" height="24" rx="6" fill="#2fbf62"/><path d="M12 5.5a6.5 6.5 0 0 0-5.6 9.8L5.5 18.5l3.3-.9A6.5 6.5 0 1 0 12 5.5z" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M9.5 9.5c0 2.5 2.5 5 5 5l.8-1.2-1.4-.7-.6.6c-.9-.4-1.6-1.1-2-2l.6-.6-.7-1.4z" fill="#fff"/>',
  gcal: '<rect x="2" y="2" width="20" height="20" rx="4" fill="#fff" stroke="#dfe3ea"/><path d="M2 6a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v2H2z" fill="#4285f4"/><text x="12" y="18.5" text-anchor="middle" font-size="9" font-weight="700" fill="#4285f4" font-family="system-ui, sans-serif">31</text>',
  apple: '<rect x="2" y="2" width="20" height="20" rx="5" fill="#fff" stroke="#eceff3"/><path d="M12 18s-6-3.6-6-8a3.3 3.3 0 0 1 6-1.9A3.3 3.3 0 0 1 18 10c0 4.4-6 8-6 8z" fill="#f0506e"/>',
  outlook: '<rect width="24" height="24" rx="6" fill="#1f6fd1"/><ellipse cx="12" cy="12" rx="4.5" ry="5.5" fill="none" stroke="#fff" stroke-width="2.2"/>',
  garmin: '<rect width="24" height="24" rx="6" fill="#1c2b45"/><path d="M12 6 18 17H6z" fill="#fff"/>',
  oura: '<rect width="24" height="24" rx="6" fill="#2a2f3a"/><circle cx="12" cy="13" r="5" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M9 6.5h6" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>',
};
const INTEGRATIONS = CONTENT.integrations;
const INTEGRATIONS_SHOWN = 3; // before "See All"
const TOAST_MS = 2000;
const TOAST_ACTION_MS = 5000; // longer when there is a button to press

let showAllIntegrations = false;
let toastTimer = null;

// action = { label, onClick } adds a button, e.g. Undo.
function showToast(text, action) {
  const toast = document.getElementById("toast");
  const hide = () => toast.classList.remove("is-visible", "has-action");
  toast.textContent = text;
  if (action) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "toast-action";
    button.textContent = action.label;
    button.addEventListener("click", () => {
      hide();
      action.onClick();
    });
    toast.append(" ", button);
  }
  toast.classList.add("is-visible");
  toast.classList.toggle("has-action", Boolean(action));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hide, action ? TOAST_ACTION_MS : TOAST_MS);
}

// Nothing is connected in this prototype; ?demo=1 shows the mockup's "Connected" cards.
function isConnected(item) {
  return IS_DEMO && Boolean(item.demoConnected);
}

function renderIntegrations() {
  const list = showAllIntegrations ? INTEGRATIONS : INTEGRATIONS.slice(0, INTEGRATIONS_SHOWN);
  document.getElementById("int-grid").innerHTML = list.map((item) => {
    const on = isConnected(item);
    return (
      '<button type="button" class="int-card' + (on ? " is-on" : "") + '" data-integration="' + item.id + '">' +
        '<svg class="int-logo" viewBox="0 0 24 24" aria-hidden="true">' + INTEGRATION_LOGOS[item.id] + "</svg>" +
        '<span class="int-chevron">' + icon("chevron") + "</span>" +
        '<span class="int-name">' + item.name + "</span>" +
        '<span class="int-status">' + (on ? "Connected" : "Not connected") + "</span>" +
      "</button>"
    );
  }).join("");
}

function openIntegrationSheet(id) {
  const item = INTEGRATIONS.find((i) => i.id === id);
  const text = CONTENT.integrationSheet;
  openSheet(item.name,
    "<p>" + item.description + "</p>" +
    '<p class="sheet-note">' + text.comingSoon + (isConnected(item) ? " " + text.demoNote : "") + "</p>");
}

// ----- Bell: weekly insight -----

function weekKey(date) {
  return toISODate(startOfWeek(date));
}

function hasUnseenInsight() {
  const prefs = store.prefs.load();
  return prefs.weeklyInsight && prefs.insightSeenWeek !== weekKey(today());
}

function renderBell() {
  const unseen = hasUnseenInsight();
  const bell = document.getElementById("bell-btn");
  bell.classList.toggle("has-dot", unseen);
  bell.setAttribute("aria-label", unseen ? "Notifications, 1 new" : "Notifications");
}

// Current phase until it ends, then the next one — from the user's own dates.
function weeklyInsightHTML() {
  const settings = store.settings.load();
  const text = CONTENT.notifications;
  const now = getCycleState(today(), settings);
  const nextStart = addDays(today(), daysUntilNextPhase(today(), settings));
  const nextKey = getPhaseForDate(nextStart, settings);
  const shortDate = (date) => date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  const goodFor = (key) => PHASES[key].work.slice(0, 2).join(", ").toLowerCase();
  const vars = {
    phaseEnds: shortDate(addDays(nextStart, -1)),
    goodFor: goodFor(now.phaseKey),
    nextPhase: PHASES[nextKey].name,
    nextStarts: shortDate(nextStart),
    nextGoodFor: goodFor(nextKey),
  };
  return (
    "<h3>" + text.insightTitle + "</h3>" +
    "<p>" + fillTemplate(text.insight, now.phaseKey, vars) + "</p>" +
    "<p>" + fillTemplate(text.insightNext, now.phaseKey, vars) + "</p>" +
    '<p class="sheet-note">' + text.estimate + "</p>"
  );
}

function openNotifications() {
  const prefs = store.prefs.load();
  const text = CONTENT.notifications;
  openSheet(text.title, prefs.weeklyInsight ? weeklyInsightHTML() : "<p>" + text.empty + "</p>");
  if (prefs.weeklyInsight) {
    store.prefs.save({ ...prefs, insightSeenWeek: weekKey(today()) });
    renderBell();
  }
}

// ----- Reset (in-app confirm) -----

function openResetSheet() {
  const text = CONTENT.resetSheet;
  openSheet(text.title,
    "<p>" + text.body + "</p>" +
    '<button type="button" class="danger-btn" data-confirm-reset>' + icon("trash") + text.confirm + "</button>" +
    '<button type="button" class="sheet-btn sheet-cancel" data-close-sheet>' + text.cancel + "</button>");
}

function fillCycleForm() {
  const form = document.getElementById("cycle-form");
  const settings = store.settings.load();
  form.elements.lastPeriodStart.value = settings.lastPeriodStart;
  form.elements.lastPeriodStart.max = toISODate(today());
  form.elements.cycleLength.value = settings.cycleLength;
  form.elements.periodLength.value = settings.periodLength;
  document.getElementById("cycle-error").textContent = "";
  // Demo mode always uses Day 14, so the form is view-only there.
  for (const field of form.elements) field.disabled = IS_DEMO;
  document.getElementById("cycle-demo-note").hidden = !IS_DEMO;
  document.getElementById("cycle-save").hidden = IS_DEMO;
}

// Onboarding + Cycle settings share this: read, check, save, redraw. Returns true when saved.
function submitCycleForm(form, errorId) {
  const settings = {
    lastPeriodStart: form.elements.lastPeriodStart.value,
    cycleLength: Number(form.elements.cycleLength.value),
    periodLength: Number(form.elements.periodLength.value),
  };
  const error = validateCycleSettings(settings);
  document.getElementById(errorId).textContent = error;
  if (error || !store.settings.save(settings)) return false;
  renderAlignment();
  renderPlan();
  renderCoachChips();
  return true;
}

document.getElementById("cycle-form").addEventListener("submit", function (e) {
  e.preventDefault();
  if (!submitCycleForm(this, "cycle-error")) return;
  goBack("settings");
  showToast("Cycle settings saved");
});

document.getElementById("onboard-form").addEventListener("submit", function (e) {
  e.preventDefault();
  if (!submitCycleForm(this, "onboard-error")) return;
  store.profile.save({ name: cleanName(this.elements.name.value) });
  renderProfile();
  openTab("alignment");
});

document.getElementById("weekly-toggle").addEventListener("change", function () {
  const prefs = store.prefs.load();
  prefs.weeklyInsight = this.checked;
  store.prefs.save(prefs);
  renderBell();
  showToast("Weekly insight " + (this.checked ? "on" : "off"));
});

function formatLongDate(date) {
  return date.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

const REPORT_LOG_DAYS = 30;

// One line per logged day in the last REPORT_LOG_DAYS days, oldest first.
function reportLogLines() {
  const logs = store.logs.load();
  const lines = [];
  for (let i = REPORT_LOG_DAYS - 1; i >= 0; i--) {
    const iso = toISODate(addDays(today(), -i));
    const log = logs[iso];
    if (!log) continue;
    const parts = LOG_FIELDS.filter((f) => log[f.id] !== undefined)
      .map((f) => f.label + " " + (f.format ? f.format(log[f.id]) : log[f.id]));
    lines.push("  " + iso + "  " + parts.join(" · "));
  }
  return lines.length ? lines : ["  None logged."];
}

// Plain-text summary to share with a doctor.
function buildDoctorReport() {
  const settings = store.settings.load();
  const now = getCycleState(today(), settings);
  const ranges = getPhaseRanges(settings);
  const nextPeriod = addDays(today(), settings.cycleLength - now.cycleDay + 1);
  return [
    "Cycle Sync: cycle summary",
    "Created: " + formatLongDate(today()),
    "",
    "Last period started: " + formatLongDate(parseLocalDate(settings.lastPeriodStart)),
    "Cycle length: " + settings.cycleLength + " days",
    "Period length: " + settings.periodLength + " days",
    "",
    "Today: Day " + now.cycleDay + ", " + now.phase.name + " phase",
    "Next period expected: " + formatLongDate(nextPeriod),
    "",
    "Phase days in this cycle:",
    ...CYCLE_ORDER.map((key) => "  " + PHASES[key].name + ": " + (phaseRangeText(ranges[key]) || "none")),
    "",
    "Daily check-ins (last " + REPORT_LOG_DAYS + " days):",
    ...reportLogLines(),
    "",
    "Predictions are estimates based on the numbers above.",
    "For general wellness only. Not medical advice, and not for contraception.",
  ].join("\n");
}

function downloadFile(filename, text, type) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([text], { type }));
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000); // after the download has started
}

function downloadDoctorReport() {
  downloadFile("cycle-sync-report-" + toISODate(today()) + ".txt", buildDoctorReport(), "text/plain");
  showToast("Report downloaded");
}

function exportData() {
  downloadFile("cycle-sync-data-" + toISODate(today()) + ".json", JSON.stringify(store.exportAll(), null, 2), "application/json");
  showToast("Data exported");
}

// "High Sync (100), Good (75), ..." — built from SYNC_LEVELS so text never drifts from the scoring.
function scoreLevelsText() {
  return Object.values(SYNC_LEVELS).map((l) => l.label + " (" + l.points + ")").join(", ");
}

function renderFaq() {
  document.getElementById("faq-list").innerHTML = CONTENT.faq.map((item) =>
    "<details><summary>" + item.q + icon("chevron") + "</summary><p>" + item.a.replace("{levels}", scoreLevelsText()) + "</p></details>"
  ).join("");
}

// ----- Profile (name shown in avatars and the Coach greeting) -----

function renderProfile() {
  const name = store.profile.load().name;
  const avatar = name ? '<span class="avatar-initial">' + escapeHTML(name[0].toUpperCase()) + "</span>" : icon("user");
  for (const el of document.querySelectorAll(".avatar, .profile-avatar")) el.innerHTML = avatar;
  document.getElementById("coach-hello-name").textContent = name ? "Hi " + name : "Hi there";
  document.getElementById("profile-form").elements.name.value = name;
}

// Trims and length-checks a first name. Empty is allowed (the name is optional).
function cleanName(value) {
  return value.trim().replace(/\s+/g, " ").slice(0, NAME_MAX);
}

document.getElementById("profile-form").addEventListener("submit", function (e) {
  e.preventDefault();
  if (!store.profile.save({ name: cleanName(this.elements.name.value) })) return;
  renderProfile();
  goBack("settings");
  showToast("Profile saved");
});

function renderSettings() {
  renderIntegrations();
  renderFaq();
  renderBell();
  const { email, subject } = CONTENT.contact;
  document.getElementById("contact-link").href = "mailto:" + email + "?subject=" + encodeURIComponent(subject);
  document.getElementById("weekly-toggle").checked = store.prefs.load().weeklyInsight;
}

// =====================================================================
// 12. Navigation
// =====================================================================

const TABS = ["alignment", "plan", "coach", "settings"];

// Sub-screens and the tab they belong to.
const SCREEN_TAB = {
  "phase-detail": "plan",
  "cycle-settings": "settings",
  profile: "settings",
  privacy: "settings",
  help: "settings",
};

// Screens opened on top of a tab, so Back returns to where you came from.
const screenHistory = [];
let currentScreen = null;

// A tab starts a fresh history.
function openTab(name) {
  screenHistory.length = 0;
  showScreen(name);
}

// Opens a tab, or a sub-screen on top of the current one.
function openScreen(name) {
  if (TABS.includes(name)) return openTab(name);
  if (currentScreen && currentScreen !== name) screenHistory.push(currentScreen);
  showScreen(name);
}

function goBack(fallback) {
  showScreen(screenHistory.pop() || fallback);
}

// Show one screen and hide all the others.
// name is e.g. "alignment", which matches the section id "screen-alignment".
function showScreen(name) {
  currentScreen = name;
  for (const screen of document.querySelectorAll(".screen")) {
    screen.hidden = screen.id !== "screen-" + name;
  }
  document.querySelector(".screens").scrollTop = 0;
  if (name === "cycle-settings") fillCycleForm(); // fresh values, no leftover edits
  // No dock until onboarding is done.
  document.querySelector(".dock").hidden = name === "onboarding";
  const tabName = SCREEN_TAB[name] || name;
  for (const tab of document.querySelectorAll(".tab")) {
    const active = tab.dataset.screen === tabName;
    tab.classList.toggle("active", active);
    if (active) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  }
}

// =====================================================================
// 13. Add-task sheet
// =====================================================================

const taskDialog = document.getElementById("task-dialog");
const taskForm = document.getElementById("task-form");
const taskError = document.getElementById("task-error");
const fields = taskForm.elements; // form.title would be the form's own title attribute
let editingTaskId = null; // null = adding a new task

// task = existing task to edit; without it the dialog adds a new one on isoDate (default: the selected day).
function openTaskDialog(task, isoDate) {
  taskForm.reset();
  editingTaskId = task ? task.id : null;
  document.getElementById("task-dialog-title").textContent = task ? "Edit task" : "Add task";
  if (task) {
    fields.title.value = task.title;
    fields.type.value = task.type;
    fields.start.value = task.start;
    fields.end.value = task.end;
  }
  fields.date.value = task ? task.date : isoDate || toISODate(selectedDate);
  taskError.textContent = "";
  renderTaskSyncPreview();
  taskDialog.showModal();
  fields.title.focus();
}

// Shows the level the chosen type would get on the chosen day.
function renderTaskSyncPreview() {
  const preview = document.getElementById("task-sync");
  if (!fields.date.value) {
    preview.innerHTML = "";
    return;
  }
  const date = parseLocalDate(fields.date.value);
  const phaseKey = getPhaseForDate(date, store.settings.load());
  const day = date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  preview.innerHTML = syncBadge(getSyncLevel(fields.type.value, phaseKey)) +
    '<span>on ' + day + " (" + PHASES[phaseKey].name + ", estimated)</span>";
}

fields.type.addEventListener("change", renderTaskSyncPreview);
fields.date.addEventListener("change", renderTaskSyncPreview);

taskForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const title = fields.title.value.trim();
  const { date, start, end, type } = fields;
  if (!title) return (taskError.textContent = "Add a title for the task.");
  if (!date.value) return (taskError.textContent = "Pick a date.");
  if (!start.value || !end.value || end.value <= start.value) {
    return (taskError.textContent = "End time must be after the start time.");
  }
  const task = { title, date: date.value, start: start.value, end: end.value, type: type.value };
  if (editingTaskId) calendarSource.updateEvent(editingTaskId, task);
  else calendarSource.addEvent(task);
  selectedDate = parseLocalDate(date.value);
  openEventId = editingTaskId;
  taskDialog.close();
  renderAlignment();
  showToast(editingTaskId ? "Task updated" : "Task added");
});

document.getElementById("task-cancel").addEventListener("click", () => taskDialog.close());

// =====================================================================
// 14. Start
// =====================================================================

// Fill every <span data-icon="name"> placeholder in the HTML.
for (const el of document.querySelectorAll("[data-icon]")) {
  el.outerHTML = icon(el.dataset.icon);
}

for (const el of document.querySelectorAll("[data-flower]")) {
  el.innerHTML = flowerSVG();
}

document.getElementById("task-type").innerHTML = Object.entries(TASK_TYPES)
  .map(([id, t]) => '<option value="' + id + '">' + t.label + "</option>")
  .join("");

// Re-rendering replaces buttons, so put keyboard focus back on the new one.
function refocus(selector) {
  const el = document.querySelector(selector);
  if (el) el.focus();
}

// One click handler for the whole app (tabs, links, days, events).
document.addEventListener("click", function (e) {
  const target = e.target.closest(
    "[data-screen], [data-go], [data-back], [data-sheet], [data-edit], [data-day], [data-add-on], #ring, [data-date], [data-event], [data-delete], [data-phase], [data-month], [data-log], [data-ask], [data-retry], [data-session], " +
      "[data-soon], [data-integration], #add-task-btn, #plan-today-btn, #see-all-btn, #coach-history-btn, " +
      "[data-confirm-reset], [data-close-sheet], #clear-chat-btn, #int-see-all-btn, #bell-btn, #report-btn, #export-btn, #reset-btn"
  );
  if (!target) return;
  // Any action inside an info sheet replaces it.
  if (infoSheet.open && infoSheet.contains(target)) infoSheet.close();
  if (target.id === "ring") {
    openScoreSheet();
  } else if (target.dataset.sheet === "lighter-day") {
    openLighterDaySheet();
  } else if (target.dataset.day) {
    openDaySheet(target.dataset.day);
  } else if (target.dataset.addOn) {
    openTaskDialog(null, target.dataset.addOn);
  } else if (target.dataset.edit) {
    const task = calendarSource.getEvent(target.dataset.edit);
    if (task) openTaskDialog(task);
  } else if (target.dataset.soon) {
    showToast(target.dataset.soon + " is coming soon");
  } else if (target.dataset.integration) {
    openIntegrationSheet(target.dataset.integration);
  } else if (target.id === "int-see-all-btn") {
    showAllIntegrations = !showAllIntegrations;
    target.setAttribute("aria-expanded", showAllIntegrations);
    document.getElementById("int-see-all-label").textContent = showAllIntegrations ? "Show less" : "See All";
    renderIntegrations();
  } else if (target.id === "bell-btn") {
    openNotifications();
  } else if (target.id === "report-btn") {
    downloadDoctorReport();
  } else if (target.id === "export-btn") {
    exportData();
  } else if (target.id === "reset-btn") {
    openResetSheet();
  } else if (target.hasAttribute("data-confirm-reset")) {
    store.clearAll();
    location.reload();
  } else if (target.hasAttribute("data-close-sheet")) {
    // Nothing else to do: the sheet was closed above.
  } else if (target.dataset.ask) {
    askCoach(target.dataset.ask);
  } else if (target.dataset.retry) {
    retryAnswer(Number(target.dataset.retry));
  } else if (target.dataset.session) {
    openSession(target.dataset.session);
  } else if (target.id === "see-all-btn") {
    const showAll = target.getAttribute("aria-expanded") !== "true";
    target.setAttribute("aria-expanded", showAll);
    document.getElementById("session-row").classList.toggle("is-grid", showAll);
    document.getElementById("see-all-label").textContent = showAll ? "Show less" : "See All";
  } else if (target.id === "clear-chat-btn") {
    clearChat();
  } else if (target.id === "coach-history-btn") {
    if (chatMessages.length) {
      scrollToLastMessage();
    } else {
      showToast(COACH.noHistory);
      document.getElementById("ask-input").focus();
    }
  } else if (target.dataset.phase) {
    openPhaseDetail(target.dataset.phase, target.dataset.section);
  } else if (target.dataset.month) {
    planMonth = new Date(planMonth.getFullYear(), planMonth.getMonth() + Number(target.dataset.month), 1);
    renderMonth(store.settings.load());
  } else if (target.id === "plan-today-btn") {
    planMonth = new Date(today().getFullYear(), today().getMonth(), 1);
    renderMonth(store.settings.load());
  } else if (target.dataset.log) {
    openLogDialog(target.dataset.log);
  } else if (target.dataset.back) {
    goBack(target.dataset.back);
  } else if (target.dataset.screen) {
    openTab(target.dataset.screen);
  } else if (target.dataset.go) {
    openScreen(target.dataset.go);
  } else if (target.dataset.date) {
    selectedDate = parseLocalDate(target.dataset.date);
    openEventId = null;
    renderAlignment();
    refocus('[data-date="' + target.dataset.date + '"]');
  } else if (target.dataset.event) {
    openEventId = openEventId === target.dataset.event ? null : target.dataset.event;
    renderDayEvents(store.settings.load());
    refocus('[data-event="' + target.dataset.event + '"]');
  } else if (target.dataset.delete) {
    const removed = calendarSource.deleteEvent(target.dataset.delete);
    openEventId = null;
    renderAlignment();
    if (removed) {
      showToast("Task deleted", {
        label: "Undo",
        onClick: () => {
          calendarSource.restoreEvent(removed);
          openEventId = removed.id;
          renderAlignment();
        },
      });
    }
  } else if (target.id === "add-task-btn") {
    openTaskDialog();
  }
});

migrateStorage();
if (IS_DEMO) seedDemoData();
buildRing();
renderAlignment();
renderLogChoices();
renderPlan();
renderCoachChips();
loadChat();
renderCoachNote();
checkCoachServer();
renderSessions();
renderSettings();
renderProfile();
document.getElementById("onboard-form").elements.lastPeriodStart.max = toISODate(today());
openTab(store.settings.exists() ? "alignment" : "onboarding");
