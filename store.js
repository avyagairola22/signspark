// App state and saving.
//
// Everything the learner does is kept in one plain object and saved to the
// browser's localStorage. If storage is unavailable (private browsing,
// blocked cookies), the app keeps working in memory for the session.

import { daysBetween } from './date.js';

const STORAGE_KEY = 'signspark:v1';

export function defaultState() {
  return {
    version: 1,
    profile: { name: '', since: null, welcomed: false },
    settings: {
      goal: 20, // daily XP goal
      hand: 'right', // dominant hand
      mirror: false, // show drawings as if looking at your own hand
      skin: 'gold',
      theme: 'system',
      reduceMotion: false,
      haptics: true,
      unlockAll: false, // demo mode: every lesson open
    },
    xp: 0,
    xpByDate: {}, // { 'YYYY-MM-DD': xp earned that day }
    streak: { current: 0, best: 0, last: null },
    lessons: {}, // { lessonId: { done: true, best: 0-100, plays: n } }
    learned: {}, // { signId: 'YYYY-MM-DD' first learned }
    srs: {}, // { signId: flashcard schedule }
    hits: {}, // { signId: correct answers }
    misses: {}, // { signId: wrong answers }
    stats: {
      answered: 0, correct: 0, perfect: 0, cards: 0, wotd: 0, wotdLast: null,
      readerWords: 0, lightningBest: 0, culture: false,
    },
    achievements: {}, // { achievementId: 'YYYY-MM-DD' }
  };
}

// Fill in any fields that older saves are missing.
function merge(base, saved) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return base;
  const out = { ...base };
  for (const [k, v] of Object.entries(saved)) {
    const isPlain = base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]);
    out[k] = isPlain && Object.keys(base[k]).length ? merge(base[k], v) : v;
  }
  return out;
}

export function parseState(text) {
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object' || data.version !== 1) throw new Error('This does not look like a SignSpark backup.');
  return merge(defaultState(), data);
}

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseState(raw) : defaultState();
  } catch {
    return defaultState();
  }
}

let saved = true;
function write(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    saved = true;
  } catch {
    saved = false; // keep going in memory
  }
}

const listeners = new Set();

export const store = {
  state: read(),
  /** Change state, save it, and tell the screen to refresh. */
  update(fn) {
    fn(this.state);
    write(this.state);
    listeners.forEach((l) => l(this.state));
  },
  replace(next) {
    this.state = next;
    this.update(() => {});
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  get canSave() {
    return saved;
  },
};

// ---- Streak rules (pure functions, unit-tested) ---------------------------

/** Update a streak for activity on `today`. */
export function bumpStreak(streak, today) {
  const s = { ...streak };
  if (s.last === today) return s;
  s.current = s.last && daysBetween(s.last, today) === 1 ? s.current + 1 : 1;
  s.last = today;
  s.best = Math.max(s.best, s.current);
  return s;
}

/** The streak to show today: it is broken if you missed yesterday entirely. */
export function liveStreak(streak, today) {
  if (!streak.last) return 0;
  return daysBetween(streak.last, today) <= 1 ? streak.current : 0;
}
