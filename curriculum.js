// The learning path: units of lessons, in order.
//
// Lesson kinds:
//   learn      (default) introduces the signs listed in `signs`
//   review     mixes everything taught so far in the unit
//   sentences  ASL word-order practice with the unit's sentences
//   culture    true/false questions about Deaf culture

export const UNITS = [
  {
    id: 'u1', title: 'Fingerspelling A–M', blurb: 'Your first thirteen letters.', color: '#2350E6', kind: 'letters',
    guide: [
      'Fingerspell with your dominant hand only, held near your shoulder with the palm facing out.',
      'Keep your hand steady. Bouncing on every letter makes words hard to read.',
      'Fingerspelling is for names, places and words that have no sign of their own.',
    ],
    lessons: [
      { id: 'u1-1', title: 'A to E', signs: ['a', 'b', 'c', 'd', 'e'] },
      { id: 'u1-2', title: 'F to I', signs: ['f', 'g', 'h', 'i'] },
      { id: 'u1-3', title: 'J to M', signs: ['j', 'k', 'l', 'm'] },
      { id: 'u1-r', title: 'Review A–M', kind: 'review' },
    ],
  },
  {
    id: 'u2', title: 'Fingerspelling N–Z', blurb: 'Finish the alphabet and read whole words.', color: '#0B7F72', kind: 'letters',
    guide: [
      'J and Z are the only letters that move. Your pinky draws the J and your index finger draws the Z.',
      'For a double letter, like the LL in BALL, slide or bounce the letter slightly.',
      'Read the shape of the whole word instead of stopping at each letter.',
    ],
    lessons: [
      { id: 'u2-1', title: 'N to R', signs: ['n', 'o', 'p', 'q', 'r'] },
      { id: 'u2-2', title: 'S to V', signs: ['s', 't', 'u', 'v'] },
      { id: 'u2-3', title: 'W to Z', signs: ['w', 'x', 'y', 'z'] },
      { id: 'u2-r', title: 'Spell words', kind: 'review' },
    ],
  },
  {
    id: 'u3', title: 'Numbers 0–10', blurb: 'Count, share your age, and give phone numbers.', color: '#C9441C', kind: 'numbers',
    guide: [
      'When you count from 1 to 5, your palm faces you.',
      'For 6 to 9 the thumb touches one finger: pinky (6), ring (7), middle (8), index (9).',
      '10 is a thumbs-up with a little shake.',
    ],
    lessons: [
      { id: 'u3-1', title: '0 to 5', signs: ['n0', 'n1', 'n2', 'n3', 'n4', 'n5'] },
      { id: 'u3-2', title: '6 to 10', signs: ['n6', 'n7', 'n8', 'n9', 'n10'] },
      { id: 'u3-r', title: 'Review numbers', kind: 'review' },
    ],
  },
  {
    id: 'u4', title: 'First conversations', blurb: 'Greet people, use manners, and introduce yourself.', color: '#9A6500', kind: 'words',
    guide: [
      'Keep eye contact while you sign. Looking away can seem like you stopped listening.',
      'Your face is part of the grammar. Lower your eyebrows for WH-questions like WHAT.',
      'ASL drops small words like "is" and "are": HOW YOU? means "How are you?"',
    ],
    lessons: [
      { id: 'u4-1', title: 'Hello and goodbye', signs: ['hello', 'goodbye', 'yes', 'no'] },
      { id: 'u4-2', title: 'Manners', signs: ['thank-you', 'please', 'sorry', 'good'] },
      { id: 'u4-3', title: 'Me and you', signs: ['me', 'you', 'my', 'your'] },
      { id: 'u4-4', title: 'Names', signs: ['name', 'what', 'nice', 'meet'] },
      { id: 'u4-5', title: 'How are you?', signs: ['how', 'fine', 'i-love-you'] },
      { id: 'u4-s', title: 'Introduce yourself', kind: 'sentences' },
    ],
  },
  {
    id: 'u5', title: 'Family and friends', blurb: 'Talk about the people in your life.', color: '#C2306B', kind: 'words',
    guide: [
      'Many family signs use location: near the forehead for men, near the chin for women.',
      'GRANDMOTHER and GRANDFATHER start like MOTHER and FATHER, then bounce forward.',
      'You can show a topic first and then comment on it: MY FAMILY, ME LOVE.',
    ],
    lessons: [
      { id: 'u5-1', title: 'Parents', signs: ['mother', 'father', 'grandmother', 'grandfather'] },
      { id: 'u5-2', title: 'Siblings', signs: ['sister', 'brother', 'baby', 'family'] },
      { id: 'u5-3', title: 'Friends', signs: ['friend', 'love'] },
      { id: 'u5-s', title: 'Talk about family', kind: 'sentences' },
    ],
  },
  {
    id: 'u6', title: 'Feelings', blurb: 'Show how you feel with your hands and your face.', color: '#6B45C8', kind: 'words',
    guide: [
      'Your face carries the feeling. HAPPY signed with a blank face looks sarcastic.',
      'The bigger the feeling, the bigger the movement and expression.',
      'Raise your eyebrows to ask a yes/no question, like YOU TIRED?',
    ],
    lessons: [
      { id: 'u6-1', title: 'Big feelings', signs: ['happy', 'sad', 'angry', 'tired'] },
      { id: 'u6-2', title: 'More feelings', signs: ['excited', 'scared', 'like', 'want'] },
      { id: 'u6-s', title: 'Share feelings', kind: 'sentences' },
    ],
  },
  {
    id: 'u7', title: 'Questions', blurb: 'Ask who, where, when and why.', color: '#23784C', kind: 'words',
    guide: [
      'WH-question signs often come at the end of the sentence: BATHROOM WHERE?',
      'Lower your eyebrows and lean in a little for WH-questions.',
      'Hold the last sign for a moment to show you are waiting for an answer.',
    ],
    lessons: [
      { id: 'u7-1', title: 'Who and where', signs: ['who', 'where'] },
      { id: 'u7-2', title: 'When and why', signs: ['when', 'why'] },
      { id: 'u7-s', title: 'Ask questions', kind: 'sentences' },
    ],
  },
  {
    id: 'u8', title: 'Everyday life', blurb: 'Food, places, and getting things done.', color: '#2F5E9E', kind: 'words',
    guide: [
      'Many everyday signs copy the action: EAT, DRINK.',
      'FINISH after a verb shows it already happened: YOU EAT FINISH?',
      'Point to places and things that are nearby instead of naming them.',
    ],
    lessons: [
      { id: 'u8-1', title: 'Food and drink', signs: ['eat', 'drink', 'water', 'more'] },
      { id: 'u8-2', title: 'Places', signs: ['school', 'work', 'home', 'bathroom'] },
      { id: 'u8-3', title: 'Getting things done', signs: ['help', 'finish', 'need'] },
      { id: 'u8-s', title: 'Everyday sentences', kind: 'sentences' },
    ],
  },
  {
    id: 'u9', title: 'Signing and Deaf culture', blurb: 'Keep a conversation going and learn the culture behind the language.', color: '#8A5A2B', kind: 'words',
    guide: [
      'It is fine to ask a signer to slow down or repeat: SLOW, PLEASE or AGAIN, PLEASE.',
      'Name signs are given by people in the Deaf community. Fingerspell your name until someone gives you one.',
      'To get a Deaf person\'s attention, wave in their line of sight or tap them gently on the shoulder.',
    ],
    lessons: [
      { id: 'u9-1', title: 'Deaf and hearing', signs: ['deaf', 'hearing', 'sign', 'learn'] },
      { id: 'u9-2', title: 'Keep it going', signs: ['understand', 'again', 'slow'] },
      { id: 'u9-s', title: 'Signing sentences', kind: 'sentences' },
      { id: 'u9-c', title: 'Deaf culture', kind: 'culture' },
    ],
  },
];

// Flattened lookups, in path order.
export const LESSONS = UNITS.flatMap((u) => u.lessons.map((l) => ({ kind: 'learn', ...l, unit: u.id })));
export const LESSON_BY_ID = Object.fromEntries(LESSONS.map((l) => [l.id, l]));
export const UNIT_BY_ID = Object.fromEntries(UNITS.map((u) => [u.id, u]));

/** Every sign taught in a unit, in order. */
export const unitSigns = (unitId) => UNIT_BY_ID[unitId].lessons.flatMap((l) => l.signs || []);

/** Every sign taught up to and including a lesson, in path order. */
export function signsThrough(lessonId) {
  const out = [];
  for (const l of LESSONS) {
    out.push(...(l.signs || []));
    if (l.id === lessonId) break;
  }
  return out;
}

/** XP for a lesson: new lessons pay more than replays. */
export const XP = { lesson: 10, perfect: 5, replay: 5, practice: 5, wotd: 5, card: 1, trainerWord: 2 };
