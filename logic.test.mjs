// Tests for the rules behind progress: spaced repetition, streaks and dates.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { schedule, isDue, newCard, formatInterval } from '../src/core/srs.js';
import { bumpStreak, liveStreak, defaultState, parseState } from '../src/core/store.js';
import { addDays, daysBetween } from '../src/core/date.js';

const DAY = '2026-10-12';

test('a new card graded "good" comes back tomorrow, then in 3 days, then grows', () => {
  let c = schedule(undefined, 'good', DAY);
  assert.equal(c.interval, 1);
  assert.equal(c.due, '2026-10-13');
  c = schedule(c, 'good', c.due);
  assert.equal(c.interval, 3);
  c = schedule(c, 'good', c.due);
  assert.equal(c.interval, 8); // 3 x 2.5, rounded
});

test('"again" starts a card over and lowers its ease, but never below 1.3', () => {
  let c = { ...newCard(), interval: 20, reps: 5, ease: 1.4 };
  c = schedule(c, 'again', DAY);
  assert.equal(c.interval, 0);
  assert.equal(c.reps, 0);
  assert.equal(c.lapses, 1);
  assert.equal(c.due, DAY);
  assert.equal(c.ease, 1.3);
  assert.equal(schedule(c, 'again', DAY).ease, 1.3);
});

test('"easy" waits longer than "good" and raises ease up to 3', () => {
  const base = { ...newCard(), interval: 10, reps: 3, ease: 2.95 };
  assert.ok(schedule(base, 'easy', DAY).interval > schedule(base, 'good', DAY).interval);
  assert.equal(schedule(base, 'easy', DAY).ease, 3);
});

test('isDue and formatInterval', () => {
  assert.equal(isDue(undefined, DAY), true);
  assert.equal(isDue({ due: '2026-10-11' }, DAY), true);
  assert.equal(isDue({ due: '2026-10-13' }, DAY), false);
  assert.equal(formatInterval(0), 'today');
  assert.equal(formatInterval(1), '1 day');
  assert.equal(formatInterval(45), '2 months');
});

test('streaks grow on consecutive days, ignore repeats, and reset after a gap', () => {
  let s = { current: 0, best: 0, last: null };
  s = bumpStreak(s, '2026-10-10');
  assert.deepEqual(s, { current: 1, best: 1, last: '2026-10-10' });
  s = bumpStreak(s, '2026-10-10');
  assert.equal(s.current, 1);
  s = bumpStreak(s, '2026-10-11');
  s = bumpStreak(s, '2026-10-12');
  assert.equal(s.current, 3);
  s = bumpStreak(s, '2026-10-15');
  assert.equal(s.current, 1);
  assert.equal(s.best, 3);
});

test('the shown streak drops to 0 once a whole day is missed', () => {
  const s = { current: 4, best: 4, last: '2026-10-11' };
  assert.equal(liveStreak(s, '2026-10-11'), 4);
  assert.equal(liveStreak(s, '2026-10-12'), 4); // still time today
  assert.equal(liveStreak(s, '2026-10-13'), 0);
});

test('date math survives month ends and daylight saving changes', () => {
  assert.equal(addDays('2026-01-31', 1), '2026-02-01');
  assert.equal(daysBetween('2026-03-07', '2026-03-09'), 2); // US clocks change on Mar 8
  assert.equal(daysBetween('2026-10-31', '2026-11-02'), 2); // and on Nov 1
  assert.equal(bumpStreak({ current: 5, best: 5, last: '2026-03-08' }, '2026-03-09').current, 6);
});

test('backups round-trip, and older saves gain new fields', () => {
  const state = defaultState();
  state.xp = 42;
  assert.equal(parseState(JSON.stringify(state)).xp, 42);
  const old = { version: 1, xp: 7, settings: { goal: 30 } };
  const merged = parseState(JSON.stringify(old));
  assert.equal(merged.settings.goal, 30);
  assert.equal(merged.settings.hand, 'right');
  assert.deepEqual(merged.streak, { current: 0, best: 0, last: null });
  assert.throws(() => parseState('{"hello": 1}'));
});
