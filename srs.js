// Spaced repetition for flashcards: a simplified version of the SM-2
// algorithm. Every card remembers how many days to wait before it comes
// back (interval) and how easy it has been (ease). Remembering a card makes
// the wait grow; forgetting it starts the card over.

import { addDays } from './date.js';

export const GRADES = ['again', 'hard', 'good', 'easy'];

export const newCard = () => ({ interval: 0, ease: 2.5, reps: 0, lapses: 0, due: null });

/**
 * Schedule a card after the learner grades it.
 * @param {object} card   current card state (or undefined for a new card)
 * @param {'again'|'hard'|'good'|'easy'} grade
 * @param {string} today  'YYYY-MM-DD'
 * @returns {object} the new card state (the input is not changed)
 */
export function schedule(card, grade, today) {
  const c = { ...newCard(), ...card };
  if (grade === 'again') {
    c.reps = 0;
    c.lapses += 1;
    c.interval = 0;
    c.ease = Math.max(1.3, c.ease - 0.2);
  } else {
    if (grade === 'hard') {
      c.interval = Math.max(1, Math.round(Math.max(c.interval, 1) * 1.2));
      c.ease = Math.max(1.3, c.ease - 0.15);
    } else if (grade === 'good') {
      c.interval = c.reps === 0 ? 1 : c.reps === 1 ? 3 : Math.round(c.interval * c.ease);
    } else if (grade === 'easy') {
      c.interval = c.reps === 0 ? 3 : Math.round(Math.max(c.interval, 1) * c.ease * 1.3);
      c.ease = Math.min(3, c.ease + 0.15);
    }
    c.reps += 1;
  }
  c.ease = Math.round(c.ease * 100) / 100;
  c.due = addDays(today, c.interval);
  return c;
}

/** True when a card should be reviewed today. */
export const isDue = (card, today) => !card || !card.due || card.due <= today;

/** How long each grade button would wait, for showing under the buttons. */
export function previewIntervals(card, today) {
  return Object.fromEntries(GRADES.map((g) => [g, schedule(card, g, today).interval]));
}

export function formatInterval(days) {
  if (days <= 0) return 'today';
  if (days === 1) return '1 day';
  if (days < 30) return `${days} days`;
  const months = Math.round(days / 30);
  return months === 1 ? '1 month' : `${months} months`;
}
