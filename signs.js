// The sign dictionary: every letter, number and word the app teaches.
//
// Word signs are described with the five parameters ASL teachers use:
//   hand  - handshape (a key of HANDSHAPES); hand2 = the shape it changes into
//   base  - handshape of the non-dominant hand, for two-handed signs
//   loc   - location (a key of LOCATIONS in src/render/body.js)
//   move  - movement (drawn as an arrow) + moveText (written out)
//   palm  - palm orientation
//   face  - facial expression / non-manual marker
//
// Descriptions are written for a right-handed signer. Left-handed signers
// mirror everything (the app can flip the drawings in Settings).

const L = (label, how, tip) => ({ id: label.toLowerCase(), type: 'letter', label, hand: label, how, tip });
const N = (n, how, tip) => ({ id: `n${n}`, type: 'number', label: String(n), hand: `N${n}`, how, tip });

export const LETTERS = [
  L('A', 'Make a fist with your thumb resting straight up along the side of your index finger.', 'A and S are both fists. A keeps the thumb on the side; S wraps it across the front.'),
  L('B', 'Hold your four fingers straight up and together. Fold your thumb across your palm.', 'Flat as a board: B is the flat hand used in many signs.'),
  L('C', 'Curve your fingers and thumb into a C shape, like you are holding a cup.', 'It looks like the letter itself.'),
  L('D', 'Point your index finger up. Touch your thumb to your other curved fingertips to make a circle.', 'The finger and the circle make a lowercase d.'),
  L('E', 'Curl your fingertips down so they rest on your thumb, which is tucked across your palm.', 'Show your fingernails. The fingertips sit on top of the thumb.'),
  L('F', 'Touch the tips of your index finger and thumb to make a circle. Keep your other three fingers up and spread.', 'It looks like the "OK" gesture.'),
  L('G', 'Point your index finger and thumb sideways, parallel to each other, with your palm facing you.', 'Like showing "a little bit" between finger and thumb.'),
  L('H', 'Point your index and middle fingers sideways, together, with your palm facing you.', 'H is a U lying down: H for horizontal.'),
  L('I', 'Make a fist and raise your pinky straight up.', 'The smallest finger spells the skinniest letter.'),
  L('J', 'Make an I, then draw a J in the air with your pinky.', 'J is I plus a movement. Your pinky writes the J.'),
  L('K', 'Raise your index and middle fingers in a V and put your thumb up between them, touching the middle finger.', 'Like a V with your thumb climbing up the middle.'),
  L('L', 'Raise your index finger and stretch your thumb out to the side.', 'It looks like the letter L.'),
  L('M', 'Fold your thumb under your first three fingers. Its tip peeks out between your ring finger and pinky.', 'A lowercase m has three humps: three fingers over the thumb.'),
  L('N', 'Fold your thumb under your index and middle fingers.', 'A lowercase n has two humps: two fingers over the thumb.'),
  L('O', 'Curve all your fingers to touch your thumb, making an O.', 'It looks like the letter O.'),
  L('P', 'Make a K, then tip your hand so your middle finger points down.', 'P is K turned upside down.'),
  L('Q', 'Make a G, then point your index finger and thumb down.', 'Q is G pointing at the floor.'),
  L('R', 'Cross your middle finger over your index finger.', 'Crossed fingers, like wishing for luck.'),
  L('S', 'Make a fist with your thumb wrapped across the front of your fingers.', 'S for strong fist.'),
  L('T', 'Tuck your thumb between your index and middle fingers.', 'Only the thumb tip peeks out, between the first two fingers.'),
  L('U', 'Hold your index and middle fingers straight up, together.', 'U fingers are united. V fingers are apart.'),
  L('V', 'Hold your index and middle fingers up and apart.', 'Like a peace sign or "victory."'),
  L('W', 'Hold up your index, middle and ring fingers, spread apart. Touch your thumb to your pinky.', 'Three fingers make the three points of a W.'),
  L('X', 'Make a fist and crook your index finger into a hook.', 'A hook, like a pirate.'),
  L('Y', 'Stretch out your thumb and pinky. Fold your other fingers down.', 'The same shape as the "hang loose" gesture.'),
  L('Z', 'Point your index finger and draw a Z in the air.', 'Your finger writes the Z, the way you would read it.'),
];

export const NUMBERS = [
  N(0, 'Curve your fingers to touch your thumb, making an O.', 'The same shape as the letter O.'),
  N(1, 'Raise your index finger, palm facing you.', 'For 1 to 5, the palm faces you when you count.'),
  N(2, 'Raise your index and middle fingers, palm facing you.', 'Same shape as V, but facing you.'),
  N(3, 'Raise your thumb, index finger and middle finger.', 'In ASL, 3 uses the thumb.'),
  N(4, 'Raise all four fingers, spread apart, with your thumb tucked in. Palm faces you.', 'Count the fingers: four up, thumb hidden.'),
  N(5, 'Spread all five fingers, palm facing you.', 'Every finger counts.'),
  N(6, 'Touch your thumb to your pinky. The other three fingers stay up.', '6 to 9: the thumb touches the pinky, ring, middle, then index finger.'),
  N(7, 'Touch your thumb to your ring finger.', 'One finger closer to the thumb than 6.'),
  N(8, 'Touch your thumb to your middle finger.', 'The thumb keeps moving toward the index finger.'),
  N(9, 'Touch your thumb to your index finger, with the other fingers up.', 'Same shape as the letter F.'),
  N(10, 'Make a thumbs-up fist and give it a little shake.', 'A thumbs-up that wiggles.'),
];

const W = (o) => ({ type: 'word', ...o });

export const WORDS = [
  // ---- Greetings & manners ----
  W({ id: 'hello', label: 'Hello', cat: 'greetings', hand: 'B', loc: 'temple', move: { type: 'out', dir: 290 }, moveText: 'outward, like a salute', palm: 'facing out',
    how: 'Touch the side of your forehead with a flat hand, then move it outward, like a friendly salute.',
    short: 'Flat hand at the forehead moves outward like a salute', cue: 'Salute from the forehead',
    tip: 'Smile while you sign it. Your face is part of the greeting.', example: { gloss: 'HELLO, HOW YOU?', en: 'Hi, how are you?' } }),
  W({ id: 'goodbye', label: 'Goodbye', cat: 'greetings', hand: 'B', loc: 'shoulder', move: 'wave', moveText: 'fingers bend down and up, a few times', palm: 'facing out',
    how: 'Raise an open hand, palm facing out, and bend your fingers down and up a few times, like a small wave.',
    short: 'Open hand, palm out, fingers bend down and up', cue: 'A small wave' }),
  W({ id: 'yes', label: 'Yes', cat: 'greetings', hand: 'S', loc: 'neutral', move: 'nod', moveText: 'bends up and down at the wrist', palm: 'facing out',
    how: 'Make a fist and bend your wrist up and down, like your fist is nodding its head.',
    short: 'A fist nods up and down at the wrist', cue: 'Fist nods', tip: 'Your head can nod along with it.' }),
  W({ id: 'no', label: 'No', cat: 'greetings', hand: 'SNAP', loc: 'neutral', move: 'together', moveText: 'fingers snap shut onto the thumb, twice', palm: 'facing out',
    how: 'Hold out your index and middle fingers and your thumb, then snap the fingers closed onto your thumb twice.',
    short: 'Index and middle fingers snap shut onto the thumb', cue: 'Fingers snap onto thumb' }),
  W({ id: 'thank-you', label: 'Thank you', cat: 'greetings', hand: 'B', loc: 'chin', move: { type: 'out', dir: 160 }, moveText: 'forward and down, toward the person', palm: 'toward you, then up',
    how: 'Touch the fingertips of a flat hand to your chin, then move your hand forward and down toward the person you are thanking.',
    short: 'Flat-hand fingertips at the chin move forward and down', cue: 'From the chin out to them', tip: 'Add a small smile and nod.' }),
  W({ id: 'please', label: 'Please', cat: 'greetings', hand: 'B', loc: 'chest', move: 'circle', moveText: 'rub in a circle', palm: 'facing you',
    how: 'Place a flat hand on your chest and rub it in a circle.',
    short: 'Flat hand rubs a circle on the chest', cue: 'Flat hand circles chest',
    tip: 'PLEASE uses a flat hand. SORRY uses a fist.', example: { gloss: 'WATER, PLEASE', en: 'Water, please.' } }),
  W({ id: 'sorry', label: 'Sorry', cat: 'greetings', hand: 'A', loc: 'chest', move: 'circle', moveText: 'rub in a circle', palm: 'facing you',
    how: 'Make an A-hand (a fist with the thumb up the side) and rub it in a circle on your chest.',
    short: 'A fist rubs a circle on the chest', cue: 'Fist circles chest', tip: 'Look sorry too. Your face shows you mean it.' }),
  W({ id: 'good', label: 'Good', cat: 'greetings', hand: 'B', base: 'B', loc: 'chin', move: 'down', moveText: 'down to land in the other palm', palm: 'toward you, then up',
    how: 'Touch the fingertips of a flat hand to your chin, then bring it down to land in your other palm, which faces up.',
    short: 'Flat hand from the chin lands in the other palm', cue: 'Chin down into palm',
    tip: 'It starts like THANK-YOU but lands in your other hand.' }),
  W({ id: 'name', label: 'Name', cat: 'greetings', hand: 'H', base: 'H', loc: 'neutral', move: 'tap', moveText: 'tap twice, making an X', palm: 'facing sideways',
    how: 'Make H-hands with both hands. Tap the middle finger of your dominant H across the index finger of your other H twice, like making an X.',
    short: 'Two-finger hands tap together twice in an X', cue: 'Two H-hands tap in an X', example: { gloss: 'YOUR NAME WHAT?', en: 'What is your name?' } }),
  W({ id: 'what', label: 'What', cat: 'greetings', hand: 'OPEN5', base: 'OPEN5', loc: 'neutral', move: 'shake', moveText: 'shake a little side to side', palm: 'facing up', face: 'q-wh',
    how: 'Hold both open hands palms up in front of you and shake them a little side to side, with your eyebrows lowered.',
    short: 'Both palms up, shaking slightly side to side', cue: 'Palms up, shake', example: { gloss: 'YOUR NAME WHAT?', en: 'What is your name?' } }),
  W({ id: 'nice', label: 'Nice', cat: 'greetings', hand: 'B', base: 'B', loc: 'neutral', move: 'slide', moveText: 'slide across the other palm', palm: 'down, over the other palm facing up',
    how: 'Slide your dominant flat hand across the palm of your other flat hand, from the heel to the fingertips.',
    short: 'One flat hand slides across the other palm', cue: 'Palm slides across palm', example: { gloss: 'NICE MEET YOU', en: 'Nice to meet you.' } }),
  W({ id: 'meet', label: 'Meet', cat: 'greetings', hand: 'IDX', base: 'IDX', loc: 'neutral', move: 'together', moveText: 'the two hands come together', palm: 'facing each other',
    how: 'Hold up both index fingers, palms facing each other, and bring your hands together until they meet, like two people meeting.',
    short: 'Two upright index fingers move together', cue: 'Two fingers meet', example: { gloss: 'NICE MEET YOU', en: 'Nice to meet you.' } }),
  W({ id: 'how', label: 'How', cat: 'greetings', hand: 'BENTB', base: 'BENTB', loc: 'neutral', move: 'twist', moveText: 'roll forward so the palms face up', palm: 'down, then up', face: 'q-wh',
    how: 'Put the backs of your bent fingers together, knuckles touching, then roll your hands forward so your palms face up.',
    short: 'Bent hands, backs together, roll forward and open', cue: 'Knuckles together, roll open', example: { gloss: 'HOW YOU?', en: 'How are you?' } }),
  W({ id: 'fine', label: 'Fine', cat: 'greetings', hand: 'OPEN5', loc: 'chest', move: 'tap', moveText: 'thumb taps the chest', palm: 'facing sideways',
    how: 'Spread your fingers and tap your thumb on your chest.',
    short: 'Open hand, thumb taps the chest', cue: 'Thumb taps chest', example: { gloss: 'ME FINE', en: "I'm fine." } }),
  W({ id: 'i-love-you', label: 'I love you', cat: 'greetings', hand: 'ILY', loc: 'neutral', move: 'hold', moveText: 'hold it up', palm: 'facing out',
    how: 'Stretch out your thumb, index finger and pinky, keep your middle and ring fingers down, and show your palm.',
    short: 'Thumb, index and pinky out, palm facing out', cue: 'Thumb, index, pinky up', tip: 'It combines the letters I, L and Y.' }),

  // ---- Pronouns ----
  W({ id: 'me', label: 'Me', cat: 'pronouns', hand: 'IDX', loc: 'chest', move: 'tap', moveText: 'point to yourself', palm: 'facing you',
    how: 'Point your index finger at the center of your chest.',
    short: 'Index finger points to your own chest', cue: 'Point to yourself', tip: 'ME is also used for "I".' }),
  W({ id: 'you', label: 'You', cat: 'pronouns', hand: 'IDX', loc: 'neutral', move: 'hold', moveText: 'point at the person', palm: 'pointing outward',
    how: 'Point your index finger at the person you are talking to.',
    short: 'Index finger points at the other person', cue: 'Point at them', tip: 'If the person is right there, point to them instead of saying their name.' }),
  W({ id: 'my', label: 'My', cat: 'pronouns', hand: 'B', loc: 'chest', move: 'tap', moveText: 'press to your chest', palm: 'against your chest',
    how: 'Place your flat hand against your chest, palm in.',
    short: 'Flat palm pressed to your chest', cue: 'Palm on chest', tip: 'ME points with a finger. MY uses your whole palm.' }),
  W({ id: 'your', label: 'Your', cat: 'pronouns', hand: 'B', loc: 'neutral', move: { type: 'out', dir: 180 }, moveText: 'push toward the person', palm: 'facing out',
    how: 'Face your flat palm toward the person and push it slightly toward them.',
    short: 'Flat palm faces out toward the other person', cue: 'Palm toward them' }),

  // ---- Family & friends ----
  W({ id: 'mother', label: 'Mother', cat: 'family', hand: 'OPEN5', loc: 'chin', move: 'tap', moveText: 'thumb taps the chin, twice', palm: 'facing sideways',
    how: 'Spread your fingers and tap your thumb on your chin twice.',
    short: 'Open hand, thumb taps the chin', cue: 'Thumb taps chin',
    tip: 'Signs for women in the family are often made near the chin.', example: { gloss: 'MY MOTHER DEAF', en: 'My mom is Deaf.' } }),
  W({ id: 'father', label: 'Father', cat: 'family', hand: 'OPEN5', loc: 'forehead', move: 'tap', moveText: 'thumb taps the forehead, twice', palm: 'facing sideways',
    how: 'Spread your fingers and tap your thumb on your forehead twice.',
    short: 'Open hand, thumb taps the forehead', cue: 'Thumb taps forehead',
    tip: 'Signs for men in the family are often made near the forehead.' }),
  W({ id: 'grandmother', label: 'Grandmother', cat: 'family', hand: 'OPEN5', loc: 'chin', move: { type: 'arc', dir: 110 }, moveText: 'two small bounces forward', palm: 'facing sideways',
    how: 'Start with your thumb on your chin, like MOTHER, then move your hand forward in two small arcs.',
    short: 'Thumb starts at the chin, then bounces forward twice', cue: 'MOTHER, bouncing forward' }),
  W({ id: 'grandfather', label: 'Grandfather', cat: 'family', hand: 'OPEN5', loc: 'forehead', move: { type: 'arc', dir: 70 }, moveText: 'two small bounces forward', palm: 'facing sideways',
    how: 'Start with your thumb on your forehead, like FATHER, then move your hand forward in two small arcs.',
    short: 'Thumb starts at the forehead, then bounces forward twice', cue: 'FATHER, bouncing forward' }),
  W({ id: 'sister', label: 'Sister', cat: 'family', hand: 'L', base: 'L', loc: 'jaw', move: { type: 'to', to: 'neutral' }, moveText: 'down to land on the other L-hand', palm: 'facing sideways',
    how: 'Start with the thumb of an L-hand on your jaw, then bring it down to land on top of your other L-hand.',
    short: 'L-hand from the jaw lands on the other L-hand', cue: 'L from jaw lands on L', tip: 'BROTHER is the same movement, starting at the forehead.' }),
  W({ id: 'brother', label: 'Brother', cat: 'family', hand: 'L', base: 'L', loc: 'forehead', move: { type: 'to', to: 'neutral' }, moveText: 'down to land on the other L-hand', palm: 'facing sideways',
    how: 'Start with the thumb of an L-hand on your forehead, then bring it down to land on top of your other L-hand.',
    short: 'L-hand from the forehead lands on the other L-hand', cue: 'L from forehead lands on L' }),
  W({ id: 'baby', label: 'Baby', cat: 'family', hand: 'B', base: 'B', loc: 'chest', move: 'rock', moveText: 'rock side to side', palm: 'facing up',
    how: 'Cradle your arms as if you are holding a baby and rock them gently side to side.',
    short: 'Cradled arms rock side to side', cue: 'Rock a baby' }),
  W({ id: 'family', label: 'Family', cat: 'family', hand: 'F', base: 'F', loc: 'neutral', move: 'circle', moveText: 'circle outward until the pinkies touch', palm: 'facing out, then toward you',
    how: 'Make F-hands with both hands, touching at the fingertips. Move them apart in a circle until your pinkies touch.',
    short: 'Two F-hands circle outward until the pinkies meet', cue: 'Two F-hands circle', example: { gloss: 'ME LOVE MY FAMILY', en: 'I love my family.' } }),
  W({ id: 'friend', label: 'Friend', cat: 'family', hand: 'X', base: 'X', loc: 'neutral', move: 'twist', moveText: 'hook, flip, and hook again',
    how: 'Hook your index fingers together, then flip your hands and hook them the other way.',
    short: 'Hooked index fingers link, then switch', cue: 'Hook fingers, flip', example: { gloss: 'MY FRIEND LEARN SIGN', en: 'My friend is learning to sign.' } }),
  W({ id: 'love', label: 'Love', cat: 'family', hand: 'S', base: 'S', loc: 'chest', move: 'cross', moveText: 'cross your arms over your chest', palm: 'facing you',
    how: 'Make fists and cross your arms over your chest, like a hug.',
    short: 'Fists crossed over the chest like a hug', cue: 'Hug yourself' }),

  // ---- Feelings ----
  W({ id: 'happy', label: 'Happy', cat: 'feelings', hand: 'B', loc: 'chest', move: 'brushUp', moveText: 'brush upward, again and again', palm: 'facing you', face: 'happy',
    how: 'Brush a flat hand up your chest in small upward circles, with a happy face.',
    short: 'Flat hand brushes up the chest, repeating', cue: 'Brush up the chest', example: { gloss: 'ME HAPPY', en: "I'm happy." } }),
  W({ id: 'sad', label: 'Sad', cat: 'feelings', hand: 'OPEN5', base: 'OPEN5', loc: 'face', move: 'down', moveText: 'slowly down in front of the face', palm: 'facing you', face: 'sad',
    how: 'Hold both open hands in front of your face, palms in, and move them down slowly with a sad face.',
    short: 'Open hands slide down in front of the face', cue: 'Hands slide down face' }),
  W({ id: 'angry', label: 'Angry', cat: 'feelings', hand: 'CLAW', loc: 'face', move: { type: 'out', dir: 210 }, moveText: 'tense and pull away a little', palm: 'facing you', face: 'angry',
    how: 'Hold a claw hand in front of your face, palm in, and pull it slightly away with a tense, angry face.',
    short: 'A claw hand at the face pulls away, tense', cue: 'Claw hand at face' }),
  W({ id: 'tired', label: 'Tired', cat: 'feelings', hand: 'BENTB', base: 'BENTB', loc: 'chest', move: 'down', moveText: 'droop downward', palm: 'facing you', face: 'tired',
    how: 'Put the fingertips of both bent hands on your upper chest, then let your hands roll down as your shoulders droop.',
    short: 'Bent hands on the chest droop downward', cue: 'Hands droop on chest' }),
  W({ id: 'excited', label: 'Excited', cat: 'feelings', hand: 'OPEN8', base: 'OPEN8', loc: 'chest', move: 'brushUp', moveText: 'brush up the chest, taking turns', palm: 'facing you', face: 'excited',
    how: 'Bend your middle fingers forward and brush them up your chest in alternating circles.',
    short: 'Bent middle fingers brush up the chest, taking turns', cue: 'Middle fingers brush up' }),
  W({ id: 'scared', label: 'Scared', cat: 'feelings', hand: 'S', hand2: 'OPEN5', base: 'OPEN5', loc: 'chest', move: 'together', moveText: 'fists burst open toward each other', palm: 'facing you', face: 'scared',
    how: 'Start with fists at the sides of your chest and quickly open them into spread hands that move toward each other, as if startled.',
    short: 'Fists snap open toward the chest, startled', cue: 'Startled hands open' }),
  W({ id: 'like', label: 'Like', cat: 'feelings', hand: 'OPEN8', loc: 'chest', move: { type: 'out', dir: 140 }, moveText: 'pull away while closing the fingers', palm: 'facing you',
    how: 'Touch your chest with your middle finger and thumb, then pull your hand away while closing them together.',
    short: 'Middle finger and thumb pull off the chest and close', cue: 'Pull off the chest', example: { gloss: 'YOU LIKE SCHOOL?', en: 'Do you like school?' } }),
  W({ id: 'want', label: 'Want', cat: 'feelings', hand: 'CLAW', base: 'CLAW', loc: 'neutral', move: 'pullIn', moveText: 'pull toward you', palm: 'facing up',
    how: 'Hold both claw hands palms up and pull them toward your body.',
    short: 'Claw hands, palms up, pull toward the body', cue: 'Claws pull in', example: { gloss: 'YOU WANT WATER?', en: 'Do you want water?' } }),

  // ---- Questions ----
  W({ id: 'who', label: 'Who', cat: 'questions', hand: 'L', loc: 'chin', move: 'wiggle', moveText: 'index finger bends up and down', face: 'q-wh',
    how: 'Rest the thumb of an L-hand on your chin and bend your index finger up and down.',
    short: 'Thumb on the chin, index finger bends up and down', cue: 'Thumb on chin, index wiggles',
    tip: 'There are a few ways to sign WHO. This one is very common.', example: { gloss: 'YOUR FRIEND WHO?', en: 'Who is your friend?' } }),
  W({ id: 'where', label: 'Where', cat: 'questions', hand: 'IDX', loc: 'neutral', move: 'shake', moveText: 'shake side to side', palm: 'facing out', face: 'q-wh',
    how: 'Hold up your index finger, palm out, and shake it side to side.',
    short: 'Index finger up, shaking side to side', cue: 'Finger shakes side to side', example: { gloss: 'BATHROOM WHERE?', en: 'Where is the bathroom?' } }),
  W({ id: 'when', label: 'When', cat: 'questions', hand: 'IDX', base: 'IDX', loc: 'neutral', move: 'circle', moveText: 'circle, then land on the other fingertip', face: 'q-wh',
    how: 'Hold your non-dominant index finger up. Circle it with your dominant index finger, then touch the fingertips together.',
    short: 'One index finger circles the other and lands on it', cue: 'Finger circles, then lands' }),
  W({ id: 'why', label: 'Why', cat: 'questions', hand: 'B', hand2: 'Y', loc: 'forehead', move: { type: 'out', dir: 110 }, moveText: 'pull forward as the hand becomes a Y', face: 'q-wh',
    how: 'Touch your fingertips to your forehead, then pull your hand forward as it changes into a Y-hand.',
    short: 'Fingertips leave the forehead and become a Y', cue: 'Forehead, then Y', example: { gloss: 'YOU SAD WHY?', en: 'Why are you sad?' } }),

  // ---- Everyday life ----
  W({ id: 'eat', label: 'Eat', cat: 'everyday', hand: 'FLATO', loc: 'mouth', move: 'tap', moveText: 'tap the lips, twice',
    how: 'Bring the fingertips of a flat-O hand to your lips a couple of times, like putting food in your mouth.',
    short: 'Bunched fingertips tap the lips', cue: 'Food to mouth', example: { gloss: 'YOU EAT FINISH?', en: 'Did you eat already?' } }),
  W({ id: 'drink', label: 'Drink', cat: 'everyday', hand: 'C', loc: 'mouth', move: 'twist', moveText: 'tip toward your mouth', palm: 'facing sideways',
    how: 'Hold a C-hand near your mouth and tip it up, like drinking from a cup.',
    short: 'C-hand tips toward the mouth like a cup', cue: 'Tip a cup' }),
  W({ id: 'water', label: 'Water', cat: 'everyday', hand: 'W', loc: 'chin', move: 'tap', moveText: 'tap the chin, twice',
    how: 'Tap the index finger of a W-hand on your chin twice.',
    short: 'W-hand taps the chin', cue: 'W taps chin', example: { gloss: 'WATER, PLEASE', en: 'Water, please.' } }),
  W({ id: 'more', label: 'More', cat: 'everyday', hand: 'FLATO', base: 'FLATO', loc: 'neutral', move: 'together', moveText: 'fingertips tap together, twice',
    how: 'Tap the fingertips of two flat-O hands together twice.',
    short: 'Two bunched hands tap their fingertips together', cue: 'Fingertips tap together', example: { gloss: 'WANT MORE?', en: 'Do you want more?' } }),
  W({ id: 'school', label: 'School', cat: 'everyday', hand: 'B', base: 'B', loc: 'neutral', move: 'tap', moveText: 'clap twice', palm: 'down onto the other palm facing up',
    how: 'Clap your dominant flat hand down onto your other palm twice, like a teacher calling the class.',
    short: 'Flat hand claps twice on the other palm', cue: 'Clap twice', example: { gloss: 'SCHOOL WHERE?', en: 'Where is the school?' } }),
  W({ id: 'work', label: 'Work', cat: 'everyday', hand: 'S', base: 'S', loc: 'neutral', move: 'tap', moveText: 'tap the other wrist, twice', palm: 'facing down',
    how: "Tap the side of your dominant fist on the back of your other fist's wrist twice.",
    short: 'Fist taps the back of the other wrist', cue: 'Fist taps wrist', example: { gloss: 'YOU WORK WHERE?', en: 'Where do you work?' } }),
  W({ id: 'home', label: 'Home', cat: 'everyday', hand: 'FLATO', loc: 'mouth', move: { type: 'to', to: 'cheek' }, moveText: 'touch the mouth corner, then the cheek',
    how: 'Touch the fingertips of a flat-O hand near the corner of your mouth, then on your cheek.',
    short: 'Bunched fingertips touch the mouth corner, then the cheek', cue: 'Mouth, then cheek' }),
  W({ id: 'bathroom', label: 'Bathroom', cat: 'everyday', hand: 'T', loc: 'neutral', move: 'shake', moveText: 'shake side to side', palm: 'facing out',
    how: 'Make a T-hand and shake it gently side to side.',
    short: 'T-hand shakes side to side', cue: 'Shake a T', example: { gloss: 'BATHROOM WHERE?', en: 'Where is the bathroom?' } }),
  W({ id: 'help', label: 'Help', cat: 'everyday', hand: 'A', base: 'B', loc: 'neutral', move: 'up', moveText: 'lift both hands up together', palm: 'base hand facing up',
    how: 'Rest a thumbs-up fist on your other flat palm, then lift both hands up together.',
    short: 'Thumbs-up fist on a flat palm lifts up', cue: 'Lift the thumbs-up', example: { gloss: 'YOU NEED HELP?', en: 'Do you need help?' } }),
  W({ id: 'finish', label: 'Finish', cat: 'everyday', hand: 'OPEN5', base: 'OPEN5', loc: 'neutral', move: 'twist', moveText: 'flip from palms-in to palms-out', palm: 'toward you, then out',
    how: 'Hold both open hands with palms facing you, then flip them quickly so your palms face out.',
    short: 'Open hands flip from palms-in to palms-out', cue: 'Flip both hands',
    tip: 'FINISH also shows something already happened: ME EAT FINISH means "I already ate."' }),
  W({ id: 'need', label: 'Need', cat: 'everyday', hand: 'X', loc: 'neutral', move: 'nod', moveText: 'bend down twice', palm: 'facing down',
    how: 'Make an X-hand, palm down, and bend it down twice from the wrist.',
    short: 'Hooked index finger bends down twice', cue: 'Hook bends down twice', example: { gloss: 'ME NEED HELP', en: 'I need help.' } }),

  // ---- Signing & Deaf culture ----
  W({ id: 'deaf', label: 'Deaf', cat: 'signing', hand: 'IDX', loc: 'ear', move: { type: 'to', to: 'mouth' }, moveText: 'touch near the ear, then near the mouth',
    how: 'Touch your index finger near your ear, then near the corner of your mouth.',
    short: 'Index finger touches near the ear, then the mouth', cue: 'Ear, then mouth',
    tip: 'Many people write Deaf with a capital D to mean the Deaf community and its culture.', example: { gloss: 'YOU DEAF?', en: 'Are you Deaf?' } }),
  W({ id: 'hearing', label: 'Hearing', cat: 'signing', hand: 'IDX', loc: 'mouth', move: 'circle', moveText: 'roll forward in small circles',
    how: 'Point your index finger sideways in front of your lips and roll it forward in small circles.',
    short: 'Index finger rolls forward in front of the lips', cue: 'Roll from the lips', example: { gloss: 'ME HEARING', en: "I'm hearing." } }),
  W({ id: 'sign', label: 'Sign', cat: 'signing', hand: 'IDX', base: 'IDX', loc: 'neutral', move: 'circle', moveText: 'circle toward you, taking turns', palm: 'facing out',
    how: 'Point both index fingers up and circle them toward your body, one after the other.',
    short: 'Two index fingers circle, taking turns', cue: 'Fingers take turns circling', tip: 'SIGN also means "sign language."',
    example: { gloss: 'ME LEARN SIGN', en: "I'm learning sign language." } }),
  W({ id: 'learn', label: 'Learn', cat: 'signing', hand: 'OPEN5', hand2: 'FLATO', base: 'B', loc: 'neutral', move: { type: 'to', to: 'forehead' }, moveText: 'lift from the palm to the forehead', palm: 'base hand facing up',
    how: 'Place your fingertips on your other palm, then lift them to your forehead while closing them, like putting knowledge into your head.',
    short: 'Fingertips lift from the palm to the forehead', cue: 'Palm to forehead' }),
  W({ id: 'understand', label: 'Understand', cat: 'signing', hand: 'S', hand2: 'IDX', loc: 'temple', move: 'flick', moveText: 'index finger flicks up', palm: 'facing you',
    how: 'Hold a fist near your temple and flick your index finger up, like a light turning on.',
    short: 'Fist at the temple flicks the index finger up', cue: 'Flick at the temple', example: { gloss: 'YOU UNDERSTAND?', en: 'Do you understand?' } }),
  W({ id: 'again', label: 'Again', cat: 'signing', hand: 'BENTB', base: 'B', loc: 'neutral', move: { type: 'arc', dir: 150 }, moveText: 'arc over and land in the other palm', palm: 'base hand facing up',
    how: 'Hold your other palm up. Bring your bent hand up and flip it over so the fingertips land in your palm.',
    short: 'Bent hand arcs over and lands in the other palm', cue: 'Arc into the palm', example: { gloss: 'AGAIN, PLEASE', en: 'Can you repeat that?' } }),
  W({ id: 'slow', label: 'Slow', cat: 'signing', hand: 'B', base: 'B', loc: 'neutral', move: { type: 'out', dir: 60 }, moveText: 'slide slowly up the back of the other hand', palm: 'facing down',
    how: 'Slowly slide your dominant hand up the back of your other hand, from the fingertips toward the wrist.',
    short: 'Hand slides slowly up the back of the other hand', cue: 'Slow slide up the hand', example: { gloss: 'PLEASE SIGN SLOW', en: 'Please sign slowly.' } }),
];

export const CATEGORIES = [
  { id: 'letters', label: 'Letters' },
  { id: 'numbers', label: 'Numbers' },
  { id: 'greetings', label: 'Greetings' },
  { id: 'pronouns', label: 'Pronouns' },
  { id: 'family', label: 'Family' },
  { id: 'feelings', label: 'Feelings' },
  { id: 'questions', label: 'Questions' },
  { id: 'everyday', label: 'Everyday' },
  { id: 'signing', label: 'Signing' },
];

export const FACE_LABELS = {
  'q-wh': 'eyebrows down (a WH-question)',
  'q-yn': 'eyebrows up (a yes/no question)',
  happy: 'a happy face',
  sad: 'a sad face',
  angry: 'a tense, angry face',
  scared: 'wide eyes, startled',
  tired: 'droopy, tired eyes',
  excited: 'eyebrows up, big smile',
};

export const SIGNS = [...LETTERS, ...NUMBERS, ...WORDS];
export const BY_ID = Object.fromEntries(SIGNS.map((s) => [s.id, s]));

/** ASL gloss for a sign: the English label in capitals, hyphenated. */
export const glossOf = (s) => s.label.toUpperCase().replace(/\s+/g, '-');

/** How a sign is named in questions: "the letter K", "the number 7", "HELLO". */
export function nameOf(s) {
  if (s.type === 'letter') return `the letter ${s.label}`;
  if (s.type === 'number') return `the number ${s.label}`;
  return glossOf(s);
}

// Letters that are easy to mix up. Quizzes use these as tricky wrong answers.
const LETTER_GROUPS = [
  ['a', 's', 'e', 'm', 'n', 't', 'o', 'x'],
  ['b', 'c', 'o', 'e'],
  ['d', 'g', 'l', 'z', 'x', 'i'],
  ['u', 'v', 'h', 'k', 'r', 'n', 'p'],
  ['w', 'f', 'd', 'k'],
  ['i', 'j', 'y'],
  ['g', 'q', 'h', 'p'],
];
const NUMBER_GROUPS = [
  ['n1', 'n2', 'n3', 'n4', 'n5'],
  ['n6', 'n7', 'n8', 'n9'],
  ['n0', 'n10', 'n5', 'n9'],
];

/** Signs that look alike, best first. Used to pick challenging wrong answers. */
export function similarIds(id) {
  const s = BY_ID[id];
  if (!s) return [];
  if (s.type !== 'word') {
    const groups = s.type === 'letter' ? LETTER_GROUPS : NUMBER_GROUPS;
    return [...new Set(groups.filter((g) => g.includes(id)).flat())].filter((x) => x !== id);
  }
  const score = (w) => (w.hand === s.hand ? 2 : 0) + (w.loc === s.loc ? 2 : 0) + (w.cat === s.cat ? 1 : 0);
  return WORDS.filter((w) => w.id !== id && score(w) > 0)
    .sort((a, b) => score(b) - score(a))
    .map((w) => w.id);
}

/** A link to videos of real signers for this sign. */
export function videoUrl(s) {
  const q = s.type === 'letter' ? `ASL letter ${s.label}` : s.type === 'number' ? `ASL number ${s.label}` : `ASL sign ${s.label}`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
}
