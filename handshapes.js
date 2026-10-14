// Handshape recipes.
//
// Instead of storing 45 pictures, every handshape is a tiny recipe that
// src/render/hands.js turns into an SVG drawing at runtime.
//
//   f       finger states for the pinky (p), ring (r), middle (m) and index (i):
//             a number        finger straight up, leaning that many degrees
//                             (+ leans toward the thumb, - toward the pinky)
//             'curl'          folded into the palm, like a fist
//             'tight'         bent down onto the thumb (the letter E)
//             'hook'          crooked like a hook (the letter X)
//             { s: 'bent' }   bent forward at the big knuckle (claw, bent-B)
//   thumb   where the thumb sits (see buildThumb in hands.js)
//   view    'back' when the back of the hand faces the viewer
//   rotate  degrees to turn the whole hand (G, H, P and Q point sideways or down)
//   motion  a traced path for letters that move (J, Z) or a shake (10)
//   custom  side-view shapes that have their own paths (C, O, flat-O)

const c = 'curl';
const t = 'tight';
const bent = (a) => ({ s: 'bent', a });
const FIST = { p: c, r: c, m: c, i: c };

export const HANDSHAPES = {
  // ---- Manual alphabet -------------------------------------------------
  A: { name: 'A-hand', f: FIST, thumb: 'side' },
  B: { name: 'B-hand (flat hand)', f: { p: -1, r: -0.5, m: 0, i: 0.5 }, thumb: 'tuck' },
  C: { name: 'C-hand', custom: 'C' },
  D: { name: 'D-hand', f: { p: c, r: c, m: c, i: 0 }, thumb: { t: 'touch', to: 'm' } },
  E: { name: 'E-hand', f: { p: t, r: t, m: t, i: t }, thumb: 'low' },
  F: { name: 'F-hand', f: { p: -16, r: -6, m: 3, i: c }, thumb: { t: 'touch', to: 'i' } },
  G: { name: 'G-hand', f: { p: c, r: c, m: c, i: 0 }, thumb: 'parallel', rotate: -90, view: 'back' },
  H: { name: 'H-hand', f: { p: c, r: c, m: -1.5, i: 1.5 }, thumb: 'hold', rotate: -90, view: 'back' },
  I: { name: 'I-hand', f: { p: -3, r: c, m: c, i: c }, thumb: 'across' },
  J: { name: 'J', f: { p: -3, r: c, m: c, i: c }, thumb: 'across', motion: 'J' },
  K: { name: 'K-hand', f: { p: c, r: c, m: -17, i: 3 }, thumb: 'k' },
  L: { name: 'L-hand', f: { p: c, r: c, m: c, i: 0 }, thumb: 'out90' },
  M: { name: 'M-hand', f: FIST, thumb: { t: 'under', gap: 'rp' } },
  N: { name: 'N-hand', f: FIST, thumb: { t: 'under', gap: 'mr' } },
  O: { name: 'O-hand', custom: 'O' },
  P: { name: 'P-hand', f: { p: c, r: c, m: -17, i: 3 }, thumb: 'k', rotate: 155 },
  Q: { name: 'Q-hand', f: { p: c, r: c, m: c, i: 0 }, thumb: 'parallel', rotate: 180, view: 'back' },
  R: { name: 'R-hand', f: { p: c, r: c, m: 10, i: -11 }, thumb: 'hold' },
  S: { name: 'S-hand (fist)', f: FIST, thumb: 'across' },
  T: { name: 'T-hand', f: FIST, thumb: { t: 'under', gap: 'im' } },
  U: { name: 'U-hand', f: { p: c, r: c, m: -1.5, i: 1.5 }, thumb: 'hold' },
  V: { name: 'V-hand', f: { p: c, r: c, m: -10, i: 11 }, thumb: 'hold' },
  W: { name: 'W-hand', f: { p: c, r: -13, m: 0, i: 13 }, thumb: { t: 'touch', to: 'p' } },
  X: { name: 'X-hand', f: { p: c, r: c, m: c, i: 'hook' }, thumb: 'across' },
  Y: { name: 'Y-hand', f: { p: -26, r: c, m: c, i: c }, thumb: 'outWide' },
  Z: { name: 'Z', f: { p: c, r: c, m: c, i: 0 }, thumb: 'hold', motion: 'Z' },

  // ---- Numbers (1 to 5 face the signer when counting) -------------------
  N0: { name: '0', custom: 'O' },
  N1: { name: '1', f: { p: c, r: c, m: c, i: 0 }, thumb: 'hold', view: 'back' },
  N2: { name: '2', f: { p: c, r: c, m: -10, i: 11 }, thumb: 'hold', view: 'back' },
  N3: { name: '3', f: { p: c, r: c, m: -8, i: 10 }, thumb: 'out', view: 'back' },
  N4: { name: '4', f: { p: -12, r: -4, m: 3, i: 10 }, thumb: 'tuck', view: 'back' },
  N5: { name: '5', f: { p: -22, r: -8, m: 2, i: 12 }, thumb: 'out', view: 'back' },
  N6: { name: '6', f: { p: c, r: -13, m: 0, i: 13 }, thumb: { t: 'touch', to: 'p' } },
  N7: { name: '7', f: { p: -20, r: c, m: 2, i: 13 }, thumb: { t: 'touch', to: 'r' } },
  N8: { name: '8', f: { p: -20, r: -8, m: c, i: 13 }, thumb: { t: 'touch', to: 'm' } },
  N9: { name: '9', f: { p: -16, r: -6, m: 3, i: c }, thumb: { t: 'touch', to: 'i' } },
  N10: { name: '10', f: FIST, thumb: 'side', motion: 'shake' },

  // ---- Common handshapes used by word signs -----------------------------
  OPEN5: { name: '5-hand (open, fingers spread)', f: { p: -22, r: -8, m: 2, i: 12 }, thumb: 'out' },
  CLAW: { name: 'claw hand', f: { p: bent(-22), r: bent(-8), m: bent(2), i: bent(12) }, thumb: 'out' },
  BENTB: { name: 'bent flat hand', f: { p: bent(-1), r: bent(-0.5), m: bent(0), i: bent(0.5) }, thumb: 'tuck' },
  OPEN8: { name: 'open-8 hand (middle finger bent)', f: { p: -22, r: -8, m: bent(2), i: 12 }, thumb: 'out' },
  FLATO: { name: 'flat-O hand (fingertips together)', custom: 'flatO' },
  ILY: { name: 'I-love-you hand', f: { p: -16, r: c, m: c, i: 4 }, thumb: 'out' },
  SNAP: { name: 'two fingers and thumb out', f: { p: c, r: c, m: -1.5, i: 1.5 }, thumb: 'out' },
  IDX: { name: '1-hand (index finger)', f: { p: c, r: c, m: c, i: 0 }, thumb: 'hold' },
};
