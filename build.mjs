// Build script: bundles the app into single, self-contained pages.
//
//   dist/index.html     the whole app in one file. Open it in any browser,
//                       or upload it to GitHub Pages or any static host.
//   dist/artifact.html  the same app without the <html>/<head>/<body>
//                       wrapper, for hosts that add their own.
//
// Run with: npm run build

import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const FONTS =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=DM+Mono:wght@400;500&family=Lexend:wght@400;500;600;700&display=swap';

const result = await build({
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'iife',
  target: 'es2020',
  write: false,
  legalComments: 'none',
});

// Escape "</script" so the bundle can sit inside an inline <script> tag.
const js = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const css = await readFile('src/styles.css', 'utf8');
const favicon = `data:image/svg+xml,${encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🤟</text></svg>")}`;

const head = `<title>SignSpark</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>
${css}
</style>`;
const body = `<div id="app"></div>
<noscript>SignSpark needs JavaScript turned on.</noscript>
<script>
${js}
</script>`;

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="Learn American Sign Language with short lessons, flashcards, a word of the day and practice games.">
<meta name="theme-color" content="#2350E6">
<link rel="icon" href="${favicon}">
${head}
</head>
<body>
${body}
</body>
</html>
`;

await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', page);
await writeFile('dist/artifact.html', `${head}\n${body}\n`);
console.log(`Built dist/index.html (${Math.round(page.length / 1024)} KB) and dist/artifact.html`);
