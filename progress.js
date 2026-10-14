// Progress rules: XP, streaks, finished lessons, learned signs and badges.
// The screens call these functions; the functions update the saved state.

import { store, bumpStreak, liveStreak } from './store.js';
import { toKey } from './date.js';
import { ACHIEVEMENTS, isEarned } from './achievements.js';
import { LESSONS, LESSON_BY_ID, XP } from '../data/curriculum.js';

const handlers = new Set();
/** Listen for 'goal' (daily goal reached) and 'achievement' (badge earned). */
export function onProgress(fn) {
  handlers.add(fn);
  return () => handlers.delete(fn);
}
const emit = (type, data) => handlers.forEach((h) => h(type, data));

export const today = () => toKey();
export const streakNow = (state = store.state) => liveStreak(state.streak, today());
export const xpToday = (state = store.state) => state.xpByDate[today()] || 0;

export function awardXp(amount) {
  if (!amount || amount <= 0) return;
  const day = today();
  const before = store.state.xpByDate[day] || 0;
  const goal = store.state.settings.goal;
  store.update((s) => {
    s.xp += amount;
    s.xpByDate[day] = before + amount;
    s.streak = bumpStreak(s.streak, day);
    if (!s.profile.since) s.profile.since = day;
  });
  if (before < goal && before + amount >= goal) emit('goal', { goal });
  checkAchievements();
}

export function checkAchievements() {
  const s = store.state;
  const earned = ACHIEVEMENTS.filter((a) => !s.achievements[a.id] && isEarned(a, s));
  if (!earned.length) return;
  store.update((st) => earned.forEach((a) => { st.achievements[a.id] = today(); }));
  earned.forEach((a) => emit('achievement', a));
}

/** Count an answer. signId is optional (spelling and sentences have none). */
export function recordAnswer(signId, correct) {
  store.update((s) => {
    s.stats.answered += 1;
    if (correct) s.stats.correct += 1;
    if (!signId) return;
    const bucket = correct ? s.hits : s.misses;
    bucket[signId] = (bucket[signId] || 0) + 1;
  });
}

export function markLearned(ids) {
  const day = today();
  store.update((s) => ids.forEach((id) => { if (!s.learned[id]) s.learned[id] = day; }));
}

export const learnedIds = (state = store.state) => Object.keys(state.learned);

/** Save a finished lesson and award its XP. Returns the XP earned. */
export function completeLesson(lessonId, { accuracy, perfect }) {
  const lesson = LESSON_BY_ID[lessonId];
  const prev = store.state.lessons[lessonId];
  const xp = (prev?.done ? XP.replay : XP.lesson) + (perfect ? XP.perfect : 0);
  store.update((s) => {
    s.lessons[lessonId] = { done: true, best: Math.max(prev?.best || 0, accuracy), plays: (prev?.plays || 0) + 1 };
    if (perfect) s.stats.perfect += 1;
    if (lesson.kind === 'culture') s.stats.culture = true;
  });
  if (lesson.signs) markLearned(lesson.signs);
  awardXp(xp);
  return xp;
}

/** 'done', 'open' or 'locked'. Lessons open one after another along the path. */
export function lessonStatus(lessonId, state = store.state) {
  if (state.lessons[lessonId]?.done) return 'done';
  const i = LESSONS.findIndex((l) => l.id === lessonId);
  if (i === 0 || state.settings.unlockAll || state.lessons[LESSONS[i - 1].id]?.done) return 'open';
  return 'locked';
}

/** The lesson the learner should do next (or null when the path is finished). */
export function nextLesson(state = store.state) {
  return LESSONS.find((l) => lessonStatus(l.id, state) === 'open') || null;
}

export const lessonsDone = (state = store.state) => LESSONS.filter((l) => state.lessons[l.id]?.done).length;

export const accuracy = (state = store.state) =>
  state.stats.answered ? Math.round((state.stats.correct / state.stats.answered) * 100) : 0;
