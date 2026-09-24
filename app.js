// =====================================================================
// 1. Data
// =====================================================================

// Phase order through a cycle. Colours come from CSS variables in style.css.
const PHASE_ORDER = ["follicular", "ovulatory", "luteal", "menstrual"];

// Suggestions inspired by In the FLO (own wording, not medical advice).
// strengths / watchOuts fill the Alignment cards when today's tasks don't.
const PHASES = {
  follicular: {
    name: "Follicular",
    powr: "Prepare",
    icon: "leaf",
    tagline: "Creativity and fresh starts. Energy is rising.",
    move: ["Dance class", "Jumping rope", "Indoor cycling", "Hiking"],
    eat: ["Broccoli and zucchini", "Oats and citrus", "Lentils and eggs", "Fermented foods"],
    work: ["Start new projects", "Brainstorm", "Research new ideas", "Plan the month ahead"],
    strengths: [
      { label: "Big ideas", icon: "bulb" },
      { label: "New projects", icon: "spark" },
      { label: "Planning", icon: "compass" },
    ],
    watchOuts: [
      { label: "Routine admin", icon: "doc" },
      { label: "Over-booking", icon: "calendar" },
      { label: "Late nights", icon: "moon" },
    ],
  },
  ovulatory: {
    name: "Ovulatory",
    powr: "Open Up",
    icon: "sun",
    tagline: "Communication. Energy and confidence are at their peak.",
    move: ["HIIT", "Kettlebells", "Kickboxing", "Power yoga"],
    eat: ["Spinach and red peppers", "Quinoa and berries", "Salmon or shrimp", "Plenty of fibre"],
    work: ["Pitch and present", "Negotiate", "Network", "Have the important conversations"],
    strengths: [
      { label: "Networking", icon: "people" },
      { label: "Presenting", icon: "presentation" },
      { label: "High energy", icon: "dumbbell" },
    ],
    watchOuts: [
      { label: "Admin work", icon: "doc" },
      { label: "High stress", icon: "bolt" },
      { label: "Over-booking", icon: "calendar" },
    ],
  },
  luteal: {
    name: "Luteal",
    powr: "Work",
    icon: "sunset",
    tagline: "Completion. Energy gradually winds down.",
    move: ["Weight lifting", "Pilates", "Barre", "Yoga"],
    eat: ["Sweet potato and squash", "Brown rice and chickpeas", "Leafy greens", "Apples and walnuts"],
    work: ["Deep focused work", "Admin", "Wrap up projects", "Review documents"],
    strengths: [
      { label: "Deep work", icon: "target" },
      { label: "Wrapping up", icon: "check" },
      { label: "Strength", icon: "dumbbell" },
    ],
    watchOuts: [
      { label: "New pitches", icon: "presentation" },
      { label: "High stress", icon: "bolt" },
      { label: "Skipping carbs", icon: "leaf" },
    ],
  },
  menstrual: {
    name: "Menstrual",
    powr: "Rest",
    icon: "moon",
    tagline: "Rest and reflection. Energy is at its lowest.",
    move: ["Walking", "Yin yoga", "Gentle mat Pilates", "Rest"],
    eat: ["Soups and stews", "Beets and mushrooms", "Kidney beans", "Herbal tea"],
    work: ["Review the past month", "Journal", "Set intentions", "Take breaks"],
    strengths: [
      { label: "Reflection", icon: "pen" },
      { label: "Rest", icon: "moon" },
      { label: "Gentle walks", icon: "leaf" },
    ],
    watchOuts: [
      { label: "Big meetings", icon: "people" },
      { label: "Intense workouts", icon: "dumbbell" },
      { label: "Packed days", icon: "calendar" },
    ],
  },
};

// Task types. suits → High Sync, avoid → Low Sync, any other phase → Good.
const TASK_TYPES = {
  pitch:      { label: "Pitch / presentation",          short: "Presenting",  icon: "presentation", suits: ["ovulatory"],               avoid: ["menstrual"] },
  networking: { label: "Networking / key conversation", short: "Networking",  icon: "people",       suits: ["ovulatory"],               avoid: ["menstrual"] },
  meeting:    { label: "Meeting / check-in",            short: "Meetings",    icon: "chat",         suits: [],                          avoid: ["menstrual"] },
  brainstorm: { label: "Brainstorm / new project",      short: "Big ideas",   icon: "bulb",         suits: ["follicular"],              avoid: ["luteal"] },
  planning:   { label: "Planning / research",           short: "Planning",    icon: "compass",      suits: ["follicular"],              avoid: [] },
  deepwork:   { label: "Deep work / admin",             short: "Admin work",  icon: "doc",          suits: ["luteal"],                  avoid: ["ovulatory"] },
  wrapup:     { label: "Wrap-up / finishing",           short: "Wrapping up", icon: "check",        suits: ["luteal"],                  avoid: ["follicular"] },
  review:     { label: "Review / reflection",           short: "Reflection",  icon: "pen",          suits: ["menstrual"],               avoid: ["ovulatory"] },
  hiit:       { label: "High-intensity workout",        short: "High energy", icon: "dumbbell",     suits: ["follicular", "ovulatory"], avoid: ["menstrual"] },
  strength:   { label: "Strength / Pilates / yoga",     short: "Strength",    icon: "target",       suits: ["luteal"],                  avoid: [] },
  rest:       { label: "Rest / gentle walk",            short: "Rest",        icon: "leaf",         suits: ["menstrual"],               avoid: [] },
};

// How well one task fits the phase on its day. points feed the 0–100 score.
const SYNC_LEVELS = {
  high: { label: "High Sync", points: 100, icon: "target" },
  good: { label: "Good",      points: 65,  icon: "diamond" },
  low:  { label: "Low Sync",  points: 0,   icon: "dash-circle" },
};

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
const STORAGE_KEYS = {
  settings: "cyclesync.settings",
  tasks: IS_DEMO ? "cyclesync.demo.tasks" : "cyclesync.tasks",
};

// Until onboarding (step 5) exists: 28/5 cycle with today as day 14.
const DEFAULT_SETTINGS = {
  lastPeriodStart: toISODate(addDays(today(), -13)),
  cycleLength: 28,
  periodLength: 5,
};

function loadSettings() {
  if (IS_DEMO) return DEFAULT_SETTINGS;
  const saved = localStorage.getItem(STORAGE_KEYS.settings);
  return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
}

function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEYS.tasks);
  return saved ? JSON.parse(saved) : [];
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
}

// =====================================================================
// 5. Calendar source
// Everything reads events through this object. A Google Calendar / Outlook
// adapter can later replace it, as long as it returns the same event shape:
// { id, title, date: "YYYY-MM-DD", start: "HH:MM", end: "HH:MM", type }
// =====================================================================

const calendarSource = {
  getEvents(isoDate) {
    return loadTasks()
      .filter((t) => t.date === isoDate)
      .sort((a, b) => a.start.localeCompare(b.start));
  },
  addEvent(event) {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    saveTasks([...loadTasks(), { ...event, id }]);
  },
  deleteEvent(id) {
    saveTasks(loadTasks().filter((t) => t.id !== id));
  },
};

// =====================================================================
// 6. Alignment engine
// =====================================================================

function getSyncLevel(typeId, phaseKey) {
  const type = TASK_TYPES[typeId];
  if (!type) return "good";
  if (type.suits.includes(phaseKey)) return "high";
  if (type.avoid.includes(phaseKey)) return "low";
  return "good";
}

// Short labels from matching tasks first, then the phase's own list, max 3, no repeats.
function pickInsights(events, level, fallback) {
  const items = [];
  const add = (item) => {
    if (items.length < INSIGHT_COUNT && !items.some((i) => i.label === item.label)) items.push(item);
  };
  for (const e of events) {
    if (e.sync === level) add({ label: TASK_TYPES[e.type].short, icon: TASK_TYPES[e.type].icon, fromTask: true });
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
    goodForYou: pickInsights(rated, "high", PHASES[phase].strengths),
    watchOuts: pickInsights(rated, "low", PHASES[phase].watchOuts),
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

function seedDemoTasks() {
  if (localStorage.getItem(STORAGE_KEYS.tasks)) return;
  const t = today();
  const day = (offset) => toISODate(addDays(t, offset));
  const tasks = [
    { title: "Morning HIIT",        date: day(0),  start: "07:30", end: "08:15", type: "hiit" },
    { title: "Client Presentation", date: day(0),  start: "10:00", end: "11:00", type: "pitch" },
    { title: "Team Sync",           date: day(0),  start: "13:00", end: "14:00", type: "meeting" },
    { title: "Contract Review",     date: day(0),  start: "16:00", end: "17:00", type: "deepwork" },
    { title: "Quarterly planning",  date: day(-3), start: "09:00", end: "11:00", type: "planning" },
    { title: "Product brainstorm",  date: day(-2), start: "14:00", end: "15:30", type: "brainstorm" },
    { title: "Investor coffee",     date: day(-1), start: "09:30", end: "10:30", type: "networking" },
    { title: "Salary conversation", date: day(1),  start: "11:00", end: "11:30", type: "networking" },
    { title: "Pilates",             date: day(2),  start: "18:00", end: "19:00", type: "strength" },
    { title: "Close out Q3 report", date: day(3),  start: "10:00", end: "12:00", type: "wrapup" },
  ];
  tasks.forEach((task, i) => (task.id = "demo" + i));
  saveTasks(tasks);
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
    "</p>";
}

const RING = { size: 200, stroke: 12, radius: 86 };

function buildRing() {
  const c = RING.size / 2;
  const circumference = 2 * Math.PI * RING.radius;
  document.getElementById("ring").innerHTML =
    '<svg viewBox="0 0 ' + RING.size + " " + RING.size + '" aria-hidden="true">' +
      '<defs><linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" style="stop-color: var(--blue-light)"/><stop offset="1" style="stop-color: var(--blue)"/>' +
      "</linearGradient></defs>" +
      '<circle class="ring-track" cx="' + c + '" cy="' + c + '" r="' + RING.radius + '" stroke-width="' + RING.stroke + '"/>' +
      '<circle class="ring-fill" id="ring-fill" cx="' + c + '" cy="' + c + '" r="' + RING.radius + '" stroke-width="' + RING.stroke + '"' +
        ' stroke-dasharray="' + circumference + '" stroke-dashoffset="' + circumference + '"/>' +
      '<g class="ring-knob" id="ring-knob"><circle cx="' + c + '" cy="' + (c - RING.radius) + '" r="' + (RING.stroke / 2 + 2) + '"/></g>' +
    "</svg>" +
    '<div class="ring-center" id="ring-center" role="img"></div>';
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
  center.setAttribute("aria-label", score === null ? "No tasks today to score" : "Cycle alignment " + score + " out of 100");

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
  if (event.sync === "high") return typeLabel + ". A great fit for your " + phaseName + " phase.";
  if (event.sync === "low") return typeLabel + ". Could fit better in your " + suitedPhaseNames(event.type) + " phase.";
  return typeLabel + ". A fair fit for your " + phaseName + " phase.";
}

function renderCalendarEvent(event, phaseKey) {
  const sync = SYNC_LEVELS[event.sync];
  const isOpen = event.id === openEventId;
  return (
    '<li class="event sync-' + event.sync + '">' +
      '<button type="button" class="event-row" data-event="' + event.id + '" aria-expanded="' + isOpen + '" aria-controls="detail-' + event.id + '">' +
        '<span class="event-dot"></span>' +
        '<span class="event-time"><span>' + event.start + "</span><span>" + event.end + "</span></span>" +
        '<span class="event-title">' + escapeHTML(event.title) + "</span>" +
        '<span class="badge">' + icon(sync.icon) + sync.label + "</span>" +
        '<span class="event-chevron">' + icon("chevron") + "</span>" +
      "</button>" +
      '<div class="event-detail" id="detail-' + event.id + '"' + (isOpen ? "" : " hidden") + ">" +
        "<p>" + eventDetailText(event, phaseKey) + "</p>" +
        '<button type="button" class="delete-btn" data-delete="' + event.id + '">' + icon("trash") + "Delete</button>" +
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
  const settings = loadSettings();
  const now = getCycleState(today(), settings);
  const result = calculateCycleAlignment({
    phase: now.phaseKey,
    cycleDay: now.cycleDay,
    events: calendarSource.getEvents(toISODate(today())),
  });
  renderPhaseNow(now);
  updateRing(result.score);
  renderInsights(result);
  renderWeek(settings);
  renderDayEvents(settings);
}

// =====================================================================
// 9. Navigation
// =====================================================================

// Show one screen and hide all the others.
// name is e.g. "alignment", which matches the section id "screen-alignment".
function showScreen(name) {
  for (const screen of document.querySelectorAll(".screen")) {
    screen.hidden = screen.id !== "screen-" + name;
  }
  for (const tab of document.querySelectorAll(".tab")) {
    const active = tab.dataset.screen === name;
    tab.classList.toggle("active", active);
    if (active) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  }
}

// =====================================================================
// 10. Add-task sheet
// =====================================================================

const taskDialog = document.getElementById("task-dialog");
const taskForm = document.getElementById("task-form");
const taskError = document.getElementById("task-error");
const fields = taskForm.elements; // form.title would be the form's own title attribute

function openTaskDialog() {
  taskForm.reset();
  fields.date.value = toISODate(selectedDate);
  taskError.textContent = "";
  taskDialog.showModal();
  fields.title.focus();
}

taskForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const title = fields.title.value.trim();
  const { date, start, end, type } = fields;
  if (!title) return (taskError.textContent = "Add a title for the task.");
  if (!date.value) return (taskError.textContent = "Pick a date.");
  if (!start.value || !end.value || end.value <= start.value) {
    return (taskError.textContent = "End time must be after the start time.");
  }
  calendarSource.addEvent({ title, date: date.value, start: start.value, end: end.value, type: type.value });
  selectedDate = parseLocalDate(date.value);
  taskDialog.close();
  renderAlignment();
});

document.getElementById("task-cancel").addEventListener("click", () => taskDialog.close());

// =====================================================================
// 11. Start
// =====================================================================

// Fill every <span data-icon="name"> placeholder in the HTML.
for (const el of document.querySelectorAll("[data-icon]")) {
  el.outerHTML = icon(el.dataset.icon);
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
  const target = e.target.closest("[data-screen], [data-go], [data-date], [data-event], [data-delete], #add-task-btn");
  if (!target) return;
  if (target.dataset.screen || target.dataset.go) {
    showScreen(target.dataset.screen || target.dataset.go);
  } else if (target.dataset.date) {
    selectedDate = parseLocalDate(target.dataset.date);
    openEventId = null;
    renderAlignment();
    refocus('[data-date="' + target.dataset.date + '"]');
  } else if (target.dataset.event) {
    openEventId = openEventId === target.dataset.event ? null : target.dataset.event;
    renderDayEvents(loadSettings());
    refocus('[data-event="' + target.dataset.event + '"]');
  } else if (target.dataset.delete) {
    calendarSource.deleteEvent(target.dataset.delete);
    openEventId = null;
    renderAlignment();
  } else if (target.id === "add-task-btn") {
    openTaskDialog();
  }
});

if (IS_DEMO) seedDemoTasks();
buildRing();
renderAlignment();
showScreen("alignment");
