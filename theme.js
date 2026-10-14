// Applies display settings: theme, hand color, mirrored drawings, motion.

export const SKINS = {
  gold: { label: 'Gold', hand: '#FFCF5A', hand2: '#F2B93B', line: '#8A5A0E', nail: '#FFF0C2' },
  light: { label: 'Light', hand: '#F7D7BD', hand2: '#EDC4A3', line: '#9A6A50', nail: '#FDEDE2' },
  medlight: { label: 'Medium light', hand: '#E3AE87', hand2: '#D59C74', line: '#86553A', nail: '#F6D6BF' },
  medium: { label: 'Medium', hand: '#C68A5E', hand2: '#B67A50', line: '#673C22', nail: '#E6B996' },
  meddark: { label: 'Medium dark', hand: '#9A6644', hand2: '#8A5838', line: '#4A2914', nail: '#C4946F' },
  dark: { label: 'Dark', hand: '#6E4A33', hand2: '#5F3F2A', line: '#2A170B', nail: '#9C7559' },
};

// Remember the host page's own theme choice so "System" can restore it.
const hostTheme = typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : null;

export function applySettings(settings) {
  const root = document.documentElement;
  // Drawings show a right-handed signer facing you. Flip them for left-handed
  // signers, or when the learner wants to see the hand as if it were their own.
  root.classList.toggle('flip', (settings.hand === 'left') !== settings.mirror);
  root.classList.toggle('reduce-motion', Boolean(settings.reduceMotion));
  const skin = SKINS[settings.skin] || SKINS.gold;
  root.style.setProperty('--hand', skin.hand);
  root.style.setProperty('--hand-2', skin.hand2);
  root.style.setProperty('--hand-line', skin.line);
  root.style.setProperty('--hand-nail', skin.nail);
  if (settings.theme === 'light' || settings.theme === 'dark') root.setAttribute('data-theme', settings.theme);
  else if (hostTheme) root.setAttribute('data-theme', hostTheme);
  else root.removeAttribute('data-theme');
}
