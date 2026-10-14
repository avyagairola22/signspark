# How SignSpark Works

A walkthrough of the code, so you can explain any part of it to a judge. File paths are relative to the project folder.

## The big picture

```
data/  ──►  engine/lesson.js  ──►  views/player.js + views/exercises.js  ──►  core/progress.js  ──►  core/store.js
(what to teach)  (builds a lesson)    (shows it and checks answers)          (XP, streaks, badges)    (saves to the device)
```

Content lives in plain data files. The engine turns content into exercises. The views draw screens and react to taps. The core keeps score and saves progress. Each layer only talks to the one next to it, which keeps the code easy to test and change.

## 1. Content: `src/data/`

| File | Holds |
|---|---|
| `signs.js` | All 96 signs. Letters and numbers have a handshape and a description. Word signs also have a **location**, **movement**, **palm orientation** and **facial expression**: the parameters ASL teachers use to describe a sign. |
| `handshapes.js` | 45 handshape "recipes" (see section 2). |
| `curriculum.js` | 9 units and 35 lessons, in path order, plus each unit's guidebook tips. |
| `sentences.js` | 22 sentences in ASL gloss (signs written as capitalized English words). Some list several correct word orders, because ASL word order is flexible. |
| `facts.js` | 16 true/false facts about Deaf culture and history. |
| `spelling.js` | Words for fingerspelling practice. |

Adding a sign means adding one object to `signs.js` and listing its id in a lesson. The tests check that it can be drawn and is taught exactly once.

## 2. Drawing hands with code: `src/render/hands.js`

There are no image files. Each handshape is a recipe, for example:

```js
V: { f: { p: 'curl', r: 'curl', m: -10, i: 11 }, thumb: 'hold' }
```

This reads: pinky and ring finger curled, middle finger straight and leaning 10° left, index finger straight and leaning 11° right, thumb holding the curled fingers down.

The renderer turns that into SVG:

1. Each finger is a thick line that starts at the knuckle. Its end point comes from trigonometry: `x + length × sin(angle)`, `y − length × cos(angle)`.
2. Each line is drawn twice, a wide dark stroke and a narrower skin-colored stroke on top, which produces a clean outline.
3. **Drawing order makes the 3D effect.** Straight fingers are drawn behind the palm; curled fingers are drawn in front of it. For M, N and T the thumb is drawn between particular fingers, so only its tip peeks out between the right pair. That is the only difference between those three letters, so it has to be right.
4. Letters like G and H are rotated, and palm-in shapes are mirrored and get fingernails, because you see the back of the hand.
5. J and Z get a dotted arrow showing the path the finger traces.

Mirroring for left-handed learners is one CSS rule (`.flip .hand { transform: scaleX(-1) }`), so the drawings never need to be redrawn.

`src/render/body.js` draws a simple signer figure for word signs: a dot for the location, arrows for the movement, and eyebrows and mouth for the facial expression (for example, eyebrows down for WH-questions like WHAT).

## 3. Building lessons: `src/engine/lesson.js`

`buildLesson(lessonId)` returns a list of exercises. For a lesson that teaches new signs:

1. For each new sign: a new-sign card, then a question about it right away.
2. A matching round with all the new signs.
3. The same signs asked the other way around (meaning → sign).
4. Fingerspelled words using only letters already taught, or a "sign it yourself" check for word signs.
5. Two signs from earlier lessons, for spaced review.

**Smart wrong answers.** `distractors()` picks wrong options from signs that look alike, such as A, S, E, M, N and T, which are all fists. Telling look-alikes apart is the real skill, so random wrong answers would make quizzes too easy. Wrong options only come from signs the learner has already seen.

Everything in this file is a pure function: no screen, no storage. A seeded random generator (`makeRng`) makes results repeatable in tests.

**Word of the day** shuffles the word list once with a fixed seed and walks through it one day at a time (`days since Jan 1, 2026 mod 59`). Every word appears once before any word repeats, and everyone sees the same word on the same day.

## 4. The lesson player: `src/views/player.js` and `src/views/exercises.js`

The player shows one exercise at a time from a queue. Each exercise type is a small renderer that draws itself and tells the player how to check it. When an answer is wrong, the player puts a reshuffled copy at the back of the queue. The lesson ends when the queue is empty, so every learner finishes, and accuracy is measured on first tries.

While a lesson is open, the page behind it is made `inert`, so keyboard focus cannot wander behind the lesson.

## 5. Progress: `src/core/`

- **`store.js`** keeps all progress in one object and saves it to `localStorage` after every change. If saving is blocked (some private browsing modes), the app keeps working in memory. `parseState()` validates backup codes and fills in fields that older saves are missing.
- **Streaks** (`bumpStreak`): activity today after activity yesterday adds one day; a gap resets the streak to 1. Dates are `YYYY-MM-DD` strings in the learner's own time zone, and day differences are rounded so daylight-saving changes cannot break a streak.
- **`srs.js`** is spaced repetition, based on the SM-2 algorithm used by flashcard apps like Anki. Each card stores an *interval* (days until it comes back) and an *ease*. "Good" grows the interval: 1 day, then 3, then 3 × ease (about 8), and so on. "Again" resets the card and lowers its ease. "Easy" grows it faster.
- **`achievements.js`**: each badge is a function that reads progress and returns `[current, goal]`, which also draws its progress bar.

## 6. Tests: `tests/`

`npm test` runs 18 tests with Node's built-in test runner:

- spaced repetition intervals, streak rules, and dates across month ends and daylight-saving changes
- every sign can be drawn, and every sign is taught exactly once
- every lesson builds valid exercises for several different shuffles: 4 unique options that include the answer, spelling words that only use letters already taught, sentences that only use signs already taught
- word of the day shows every word before repeating
- backups restore correctly

## Questions a judge might ask

**Where do the hand pictures come from?** They are generated by code from 45 small recipes. There are no image files, which keeps the app tiny (about 230 KB) and lets one CSS rule mirror every drawing for left-handed signers.

**What was the hardest technical problem?** Drawing handshapes that differ only in small details, like M, N and T, where only the thumb's position changes. The renderer controls drawing order so the thumb tip shows between exactly the right fingers.

**How does the app decide what to review?** Flashcards use spaced repetition: each card waits longer every time you remember it. Smart review ranks learned signs by how often you missed them.

**How is progress saved?** In the browser's local storage on your own device. There is no server and no account, so there is no personal data to protect. Backup codes move progress to another device.

**Why are there no sounds?** An app about a visual language should work for Deaf users, so all feedback is visual, with optional vibration.

**How do you know the signs are correct?** The descriptions follow common ASL usage, signs vary by region, and every sign links to videos of real signers. [Add how you checked them.]

**What would you add next?** Camera practice: hand tracking in the browser (for example, MediaPipe) could check a learner's handshape and give feedback, plus video clips recorded by Deaf signers.
