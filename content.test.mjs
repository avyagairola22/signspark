// Tests that the lesson content fits together: every sign can be drawn,
// every lesson builds valid exercises, and every sentence only uses signs
// the learner has already been taught.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SIGNS, BY_ID, WORDS, LETTERS, NUMBERS, glossOf } from '../src/data/signs.js';
import { HANDSHAPES } from '../src/data/handshapes.js';
import { LESSONS, UNITS, signsThrough } from '../src/data/curriculum.js';
import { SENTENCES } from '../src/data/sentences.js';
import { FACTS, FACT_BY_ID } from '../src/data/facts.js';
import { LOCATIONS, bodySVG } from '../src/render/body.js';
import { handSVG } from '../src/render/hands.js';
import {
  buildLesson, makeRng, checkGloss, wordOfDay, factOfDay, buildSmartReview, reshuffle, spellWords, buildSignPractice,
} from '../src/engine/lesson.js';
import { addDays } from '../src/core/date.js';
import { defaultState } from '../src/core/store.js';

test('every sign uses a real handshape, location and category', () => {
  const ids = new Set();
  for (const s of SIGNS) {
    assert.ok(!ids.has(s.id), `duplicate id ${s.id}`);
    ids.add(s.id);
    for (const key of [s.hand, s.hand2, s.base].filter(Boolean)) assert.ok(HANDSHAPES[key], `${s.id}: unknown handshape ${key}`);
    assert.ok(s.how, `${s.id} needs a description`);
    if (s.type === 'word') {
      assert.ok(LOCATIONS[s.loc], `${s.id}: unknown location ${s.loc}`);
      if (s.move?.to) assert.ok(LOCATIONS[s.move.to], `${s.id}: unknown target ${s.move.to}`);
      for (const f of ['short', 'cue', 'moveText', 'cat']) assert.ok(s[f], `${s.id} needs ${f}`);
    }
  }
  assert.equal(LETTERS.length, 26);
  assert.equal(NUMBERS.length, 11);
});

test('every handshape and every word sign can be drawn', () => {
  for (const key of Object.keys(HANDSHAPES)) {
    const svg = handSVG(key);
    assert.match(svg, /^<svg[\s\S]*<\/svg>$/);
    assert.doesNotMatch(svg, /NaN|undefined/, `handshape ${key}`);
  }
  for (const w of WORDS) assert.doesNotMatch(bodySVG(w), /NaN|undefined/, `body map for ${w.id}`);
});

test('every sign is taught by exactly one lesson', () => {
  const taught = LESSONS.flatMap((l) => l.signs || []);
  assert.equal(new Set(taught).size, taught.length, 'a sign is taught twice');
  for (const s of SIGNS) assert.ok(taught.includes(s.id), `${s.id} is never taught`);
  for (const id of taught) assert.ok(BY_ID[id], `lesson teaches unknown sign ${id}`);
});

test('sentences only use signs taught by the time their lesson starts', () => {
  const glossToId = Object.fromEntries(SIGNS.filter((s) => s.type === 'word').map((s) => [glossOf(s), s.id]));
  for (const s of SENTENCES) {
    const unit = UNITS.find((u) => u.id === s.unit);
    const lesson = unit.lessons.find((l) => l.kind === 'sentences');
    assert.ok(lesson, `${s.unit} has sentences but no sentences lesson`);
    const known = new Set(signsThrough(lesson.id));
    for (const token of [...s.answers.flat(), ...s.extra]) {
      const id = glossToId[token];
      assert.ok(id, `${s.id}: "${token}" is not a sign in the dictionary`);
      assert.ok(known.has(id), `${s.id}: "${token}" is not taught before ${lesson.id}`);
    }
    for (const a of s.answers) assert.ok(checkGloss(s.id, a), `${s.id} rejects its own answer`);
    for (const a of s.answers) assert.deepEqual([...a].sort(), [...s.answers[0]].sort(), `${s.id}: answers use different tiles`);
  }
});

test('every lesson builds valid exercises, whatever the shuffle', () => {
  for (const lesson of LESSONS) {
    const seen = new Set(signsThrough(lesson.id));
    for (let seed = 1; seed <= 6; seed++) {
      const ex = buildLesson(lesson.id, makeRng(seed));
      assert.ok(ex.length >= 6, `${lesson.id} is too short (${ex.length})`);
      for (const e of ex) {
        if (e.options) {
          assert.equal(e.options.length, 4, `${lesson.id}: ${e.type} needs 4 options`);
          assert.equal(new Set(e.options).size, 4, `${lesson.id}: repeated option`);
          assert.ok(e.options.includes(e.sign), `${lesson.id}: answer missing from options`);
          const type = BY_ID[e.sign].type;
          assert.ok(e.options.every((o) => BY_ID[o].type === type), `${lesson.id}: mixed option types`);
        }
        if (e.type === 'match') {
          assert.ok(e.pairs.length >= 3 && new Set(e.pairs).size === e.pairs.length);
          assert.equal(new Set(e.pairs.map((id) => BY_ID[id].type)).size, 1);
        }
        if (e.type === 'spellRead' || e.type === 'spellBuild') {
          for (const ch of e.word) assert.ok(seen.has(ch.toLowerCase()), `${lesson.id}: "${e.word}" uses untaught letter ${ch}`);
        }
        if (e.type === 'spellBuild') {
          const bank = [...e.tiles];
          for (const ch of e.word) {
            const i = bank.indexOf(ch);
            assert.ok(i >= 0, `${lesson.id}: tiles cannot spell ${e.word}`);
            bank.splice(i, 1);
          }
        }
        if (e.type === 'gloss') {
          const s = SENTENCES.find((x) => x.id === e.sentence);
          assert.deepEqual([...e.tiles].sort(), [...s.answers[0], ...s.extra].sort());
        }
        if (e.type === 'fact') assert.ok(FACT_BY_ID[e.fact]);
        if (['intro', 'selfCheck'].includes(e.type)) assert.ok(BY_ID[e.sign]);
      }
      // Options must come from signs already taught (plus look-alikes the
      // learner has met), so nothing shows up before its lesson.
      for (const e of ex.filter((x) => x.options)) {
        for (const o of e.options) assert.ok(seen.has(o), `${lesson.id}: option ${o} is not taught yet`);
      }
    }
  }
});

test('retries reshuffle without changing the answer', () => {
  const ex = buildLesson('u1-1', makeRng(3)).find((e) => e.options);
  const again = reshuffle(ex, makeRng(9));
  assert.equal(again.sign, ex.sign);
  assert.deepEqual([...again.options].sort(), [...ex.options].sort());
});

test('gloss answers accept every listed word order', () => {
  assert.ok(checkGloss('s-fine', ['ME', 'FINE']));
  assert.ok(checkGloss('s-fine', ['FINE', 'ME']));
  assert.ok(!checkGloss('s-name', ['WHAT', 'YOUR', 'NAME']));
});

test('fingerspelling words only use the letters given', () => {
  const words = spellWords(['a', 'b', 'c', 'd', 'e'], ['a']);
  assert.ok(words.includes('CAB'));
  assert.ok(words.every((w) => /^[ABCDE]+$/.test(w)));
});

test('word of the day is stable for a date and shows every word before repeating', () => {
  assert.equal(wordOfDay('2026-10-12').id, wordOfDay('2026-10-12').id);
  const seen = new Set();
  for (let i = 0; i < WORDS.length; i++) seen.add(wordOfDay(addDays('2026-10-12', i)).id);
  assert.equal(seen.size, WORDS.length);
  assert.ok(factOfDay('2026-10-12').text);
  assert.ok(wordOfDay('2019-05-01')); // dates before the epoch still work
});

test('smart review and single-sign practice build questions', () => {
  const state = defaultState();
  for (const id of ['a', 'b', 'c', 'd', 'e', 'hello', 'yes']) state.learned[id] = '2026-10-01';
  state.misses.c = 4;
  const ex = buildSmartReview(state, makeRng(5));
  assert.ok(ex.length >= 7);
  assert.ok(ex.some((e) => e.sign === 'c'), 'the most-missed sign is included');
  assert.equal(buildSignPractice('hello', makeRng(1)).length, 4);
  assert.equal(FACTS.length >= 10, true);
});
