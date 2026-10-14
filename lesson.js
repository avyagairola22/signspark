// Lesson builder. Turns a lesson from the curriculum into a list of
// exercises. Everything here is a pure function (no screen, no storage),
// so it can be unit-tested and replayed with a seeded random generator.

import { BY_ID, SIGNS, WORDS, similarIds } from '../data/signs.js';
import { LESSON_BY_ID, UNIT_BY_ID, signsThrough, unitSigns } from '../data/curriculum.js';
import { SENTENCES, SENTENCE_BY_ID } from '../data/sentences.js';
import { FACTS } from '../data/facts.js';
import { SPELL_WORDS } from '../data/spelling.js';
import { daysBetween } from '../core/date.js';

// ---- Random helpers ----------------------------------------------------

/** Small seeded random generator (mulberry32) so tests are repeatable. */
export function makeRng(seed = Date.now()) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates shuffle that returns a new array. */
export function shuffle(list, rng = Math.random) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pick = (list, rng) => list[Math.floor(rng() * list.length)];

// ---- Questions -----------------------------------------------------------

/**
 * Wrong answers for a question about `id`. Look-alike signs come first,
 * because telling similar signs apart is the real skill.
 * @param {Set<string>} [pool] signs the learner has already seen
 */
export function distractors(id, count, rng = Math.random, pool = null) {
  const type = BY_ID[id].type;
  const out = [];
  const take = (ids, onlyPool) => {
    for (const x of ids) {
      if (out.length >= count) return;
      if (x === id || out.includes(x) || BY_ID[x]?.type !== type) continue;
      if (onlyPool && pool && !pool.has(x)) continue;
      out.push(x);
    }
  };
  take(shuffle(similarIds(id).slice(0, 5), rng).slice(0, 2), true); // up to two look-alikes
  if (pool) take(shuffle([...pool], rng), true); // then anything already seen
  take(shuffle(SIGNS.map((s) => s.id), rng), false); // top up if still short
  return out;
}

/**
 * One multiple-choice question.
 *   'first'  shows the sign and asks what it means
 *   'second' shows the meaning and asks for the sign (a drawing for letters
 *            and numbers, a description for word signs)
 */
export function quiz(id, rng = Math.random, pool = null, which = 'first') {
  const options = shuffle([id, ...distractors(id, 3, rng, pool)], rng);
  if (which === 'first') return { type: 'pickLabel', sign: id, options };
  return { type: BY_ID[id].type === 'word' ? 'pickHow' : 'pickVisual', sign: id, options };
}

// ---- Fingerspelling ------------------------------------------------------

/** Practice words made only from `letterIds`, using at least one of `mustUse`. */
export function spellWords(letterIds, mustUse = [], maxLen = 4) {
  const letters = new Set(letterIds.map((id) => BY_ID[id].label));
  const must = new Set(mustUse.map((id) => BY_ID[id]?.label).filter(Boolean));
  return SPELL_WORDS.filter(
    (w) => w.length <= maxLen && [...w].every((ch) => letters.has(ch)) && (!must.size || [...w].some((ch) => must.has(ch))),
  );
}

function spellBuild(word, rng, letterIds) {
  const extras = shuffle(letterIds.map((id) => BY_ID[id].label).filter((ch) => !word.includes(ch)), rng).slice(0, 2);
  return { type: 'spellBuild', word, tiles: shuffle([...word, ...extras], rng) };
}

export const toLetters = (text) => text.toUpperCase().replace(/[^A-Z]/g, '');

// ---- Sentences -------------------------------------------------------------

export function glossExercise(sentence, rng = Math.random) {
  return { type: 'gloss', sentence: sentence.id, tiles: shuffle([...sentence.answers[0], ...sentence.extra], rng) };
}

/** Is this order of gloss tiles one of the accepted answers? */
export function checkGloss(sentenceId, tokens) {
  const s = SENTENCE_BY_ID[sentenceId];
  return s.answers.some((a) => a.length === tokens.length && a.every((t, i) => t === tokens[i]));
}

// ---- Lessons ---------------------------------------------------------------

/** Build the exercises for a lesson on the path. */
export function buildLesson(lessonId, rng = Math.random) {
  const lesson = LESSON_BY_ID[lessonId];
  if (!lesson) throw new Error(`Unknown lesson ${lessonId}`);
  const unit = UNIT_BY_ID[lesson.unit];
  const pool = new Set(signsThrough(lessonId));
  switch (lesson.kind) {
    case 'culture': return buildCultureQuiz(rng);
    case 'review': return buildReview(unit, pool, rng);
    case 'sentences': return buildSentences(unit, pool, rng);
    default: return buildLearn(lesson, unit, pool, rng);
  }
}

function buildLearn(lesson, unit, pool, rng) {
  const fresh = lesson.signs;
  const ex = [];
  // Meet each new sign, then answer a question about it right away.
  for (const id of fresh) ex.push({ type: 'intro', sign: id }, quiz(id, rng, pool, 'first'));
  if (fresh.length >= 3) ex.push({ type: 'match', pairs: shuffle(fresh, rng).slice(0, 5) });
  // Ask the other way around.
  for (const id of shuffle(fresh, rng).slice(0, 3)) ex.push(quiz(id, rng, pool, 'second'));

  if (unit.kind === 'letters') {
    const letters = [...pool].filter((id) => BY_ID[id].type === 'letter');
    const words = shuffle(spellWords(letters, fresh, 4), rng);
    if (words[0]) ex.push({ type: 'spellRead', word: words[0] });
    if (words[1]) ex.push(spellBuild(words[1], rng, letters));
  }
  if (unit.kind === 'words') ex.push({ type: 'selfCheck', sign: pick(fresh, rng) });

  // Spaced review: bring back two signs from earlier lessons.
  const type = BY_ID[fresh[0]].type;
  const older = [...pool].filter((id) => !fresh.includes(id) && BY_ID[id].type === type);
  for (const id of shuffle(older, rng).slice(0, 2)) ex.push(quiz(id, rng, pool, rng() < 0.5 ? 'first' : 'second'));
  return ex;
}

function buildReview(unit, pool, rng) {
  const ids = unitSigns(unit.id);
  const order = shuffle(ids, rng);
  const ex = [];
  const count = unit.kind === 'letters' ? 8 : 10;
  for (let i = 0; i < count; i++) ex.push(quiz(order[i % order.length], rng, pool, i % 2 ? 'second' : 'first'));
  ex.push({ type: 'match', pairs: shuffle(ids, rng).slice(0, 5) });

  if (unit.kind === 'letters') {
    const letters = [...pool].filter((id) => BY_ID[id].type === 'letter');
    const finalUnit = unit.id === 'u2';
    const words = shuffle(spellWords(letters, finalUnit ? ids : [], finalUnit ? 6 : 4), rng);
    const reads = finalUnit ? 4 : 2;
    words.slice(0, reads).forEach((w) => ex.push({ type: 'spellRead', word: w }));
    if (words[reads]) ex.push(spellBuild(words[reads], rng, letters));
  }
  return shuffle(ex, rng);
}

function buildSentences(unit, pool, rng) {
  const ex = shuffle(SENTENCES.filter((s) => s.unit === unit.id), rng).slice(0, 5).map((s) => glossExercise(s, rng));
  const ids = unitSigns(unit.id);
  shuffle(ids, rng).slice(0, 4).forEach((id, i) => ex.push(quiz(id, rng, pool, i % 2 ? 'second' : 'first')));
  ex.push({ type: 'selfCheck', sign: pick(ids, rng) });
  return shuffle(ex, rng);
}

// ---- Practice sessions -----------------------------------------------------

export function buildCultureQuiz(rng = Math.random) {
  return shuffle(FACTS, rng).slice(0, 8).map((f) => ({ type: 'fact', fact: f.id }));
}

/** Review the learned signs the learner misses most. */
export function buildSmartReview(state, rng = Math.random) {
  const learned = Object.keys(state.learned).filter((id) => BY_ID[id]);
  const weight = (id) => (state.misses[id] || 0) * 3 - (state.hits[id] || 0) + rng() * 2;
  const picks = [...learned].sort((a, b) => weight(b) - weight(a)).slice(0, 9);
  const pool = new Set(learned);
  const ex = picks.map((id, i) => quiz(id, rng, pool, i % 2 ? 'second' : 'first'));
  // A matching round, using whichever kind of sign is most common in the picks.
  const byType = {};
  picks.forEach((id) => (byType[BY_ID[id].type] ||= []).push(id));
  const group = Object.values(byType).sort((a, b) => b.length - a.length)[0] || [];
  if (group.length >= 3) ex.splice(3, 0, { type: 'match', pairs: group.slice(0, 5) });
  return ex;
}

/** A short drill for one sign (used by the word of the day). */
export function buildSignPractice(id, rng = Math.random) {
  const ex = [{ type: 'intro', sign: id }, quiz(id, rng, null, 'first'), quiz(id, rng, null, 'second')];
  if (BY_ID[id].type === 'word') ex.push({ type: 'selfCheck', sign: id });
  return ex;
}

export function buildSentencePractice(unitIds, rng = Math.random) {
  return shuffle(SENTENCES.filter((s) => unitIds.includes(s.unit)), rng).slice(0, 6).map((s) => glossExercise(s, rng));
}

/** Same exercise with its options or tiles shuffled again (for a retry). */
export function reshuffle(ex, rng = Math.random) {
  const copy = { ...ex };
  if (copy.options) copy.options = shuffle(copy.options, rng);
  if (copy.tiles) copy.tiles = shuffle(copy.tiles, rng);
  if (copy.pairs) copy.pairs = shuffle(copy.pairs, rng);
  return copy;
}

// ---- Daily picks -----------------------------------------------------------

const EPOCH = '2026-01-01';
const WORD_ORDER = shuffle(WORDS.map((w) => w.id), makeRng(2026));
const FACT_ORDER = shuffle(FACTS.map((f) => f.id), makeRng(1817));
const cycle = (list, dayKey) => list[(((daysBetween(EPOCH, dayKey)) % list.length) + list.length) % list.length];

/** The word of the day. Every word appears once before any repeats. */
export const wordOfDay = (dayKey) => BY_ID[cycle(WORD_ORDER, dayKey)];
export const factOfDay = (dayKey) => FACTS.find((f) => f.id === cycle(FACT_ORDER, dayKey));
