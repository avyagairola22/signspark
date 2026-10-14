// Badges. Each one checks the saved state and reports its progress.

import { LESSONS, UNITS } from '../data/curriculum.js';

const lessonsDone = (s) => LESSONS.filter((l) => s.lessons[l.id]?.done).length;
const unitDone = (s, unitId) => UNITS.find((u) => u.id === unitId).lessons.every((l) => s.lessons[l.id]?.done);
const unitsDone = (s, ids) => ids.filter((id) => unitDone(s, id)).length;

export const ACHIEVEMENTS = [
  { id: 'first', title: 'First Sign', desc: 'Finish your first lesson', icon: 'star', progress: (s) => [lessonsDone(s), 1] },
  { id: 'alphabet', title: 'A to Z', desc: 'Finish both fingerspelling units', icon: 'abc', progress: (s) => [unitsDone(s, ['u1', 'u2']), 2] },
  { id: 'numbers', title: 'Count On Me', desc: 'Finish the numbers unit', icon: 'hash', progress: (s) => [unitsDone(s, ['u3']), 1] },
  { id: 'chat', title: 'Conversation Starter', desc: 'Finish First conversations', icon: 'chat', progress: (s) => [unitsDone(s, ['u4']), 1] },
  { id: 'perfect', title: 'Flawless', desc: 'Finish a lesson with no mistakes', icon: 'check', progress: (s) => [s.stats.perfect, 1] },
  { id: 'streak3', title: 'On a Roll', desc: 'Reach a 3-day streak', icon: 'flame', progress: (s) => [s.streak.best, 3] },
  { id: 'streak7', title: 'Week Strong', desc: 'Reach a 7-day streak', icon: 'flame', progress: (s) => [s.streak.best, 7] },
  { id: 'streak30', title: 'Habit Formed', desc: 'Reach a 30-day streak', icon: 'flame', progress: (s) => [s.streak.best, 30] },
  { id: 'xp100', title: 'Spark', desc: 'Earn 100 XP', icon: 'bolt', progress: (s) => [s.xp, 100] },
  { id: 'xp1000', title: 'Bonfire', desc: 'Earn 1,000 XP', icon: 'bolt', progress: (s) => [s.xp, 1000] },
  { id: 'cards', title: 'Card Shark', desc: 'Review 50 flashcards', icon: 'cards', progress: (s) => [s.stats.cards, 50] },
  { id: 'reader', title: 'Speed Reader', desc: 'Read 10 words in the fingerspelling reader', icon: 'eye', progress: (s) => [s.stats.readerWords, 10] },
  { id: 'lightning', title: 'Quick Hands', desc: 'Score 15 in a lightning round', icon: 'timer', progress: (s) => [s.stats.lightningBest, 15] },
  { id: 'wotd', title: 'Word Collector', desc: 'Learn 5 words of the day', icon: 'sun', progress: (s) => [s.stats.wotd, 5] },
  { id: 'culture', title: 'Culture Keeper', desc: 'Finish the Deaf culture lesson', icon: 'heart', progress: (s) => [s.stats.culture ? 1 : 0, 1] },
  { id: 'graduate', title: 'Graduate', desc: 'Finish every lesson on the path', icon: 'trophy', progress: (s) => [lessonsDone(s), LESSONS.length] },
];

/** [current, goal] clamped to the goal. */
export function progressOf(a, state) {
  const [cur, goal] = a.progress(state);
  return [Math.min(cur, goal), goal];
}

export const isEarned = (a, state) => {
  const [cur, goal] = progressOf(a, state);
  return cur >= goal;
};
