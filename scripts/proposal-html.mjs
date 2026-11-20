/**
 * Writes a static shell for each proposal route so the first HTML already
 * carries noindex, its own social tags, and no home-image preload.
 * `ng build` copies `index.html` for every URL; this runs after it.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = 'https://marcosmorales.dev';
const dist = join(root, 'dist/portfolio-dev/browser');
const indexPath = join(dist, 'index.html');

/** modulepreload ignores <base href> and would request /propuestas/chunk-*.js. */
function absolutizePreloads(html) {
  return html.replace(
    /(<link\s+rel="modulepreload"\s+href=")(?!\/|https?:)([^"]+)"/g,
    '$1/$2"',
  );
}

const index = absolutizePreloads(readFileSync(indexPath, 'utf8'));
writeFileSync(indexPath, index);

function escapeAttr(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function spanish(source, key) {
  const match = source.match(new RegExp(`${key}:\\s*\\{\\s*es:\\s*'((?:\\\\'|[^'])*)'`));
  return match ? match[1].replace(/\\'/g, "'") : '';
}

function shell({ path, title, description, image }) {
  const url = `${site}${path}`;
  let html = index
    .replace('<html lang="en">', '<html lang="es">')
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(title)}</title>`)
    .replace(
      /<meta name="description" content="[^"]*">/,
      `<meta name="description" content="${escapeAttr(description)}">`,
    )
    .replace(
      /<meta property="og:title" content="[^"]*">/,
      `<meta property="og:title" content="${escapeAttr(title)}">`,
    )
    .replace(
      /<meta property="og:description" content="[^"]*">/,
      `<meta property="og:description" content="${escapeAttr(description)}">`,
    )
    .replace(
      /<meta property="og:url" content="[^"]*">/,
      `<meta property="og:url" content="${url}">`,
    )
    .replace(
      /<meta property="og:locale" content="[^"]*">/,
      '<meta property="og:locale" content="es_ES">',
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*">/,
      `<meta name="twitter:title" content="${escapeAttr(title)}">`,
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*">/,
      `<meta name="twitter:description" content="${escapeAttr(description)}">`,
    );

  if (image) {
    html = html
      .replace(
        /<meta property="og:image" content="[^"]*">/,
        `<meta property="og:image" content="${image}">`,
      )
      .replace(
        /<meta name="twitter:image" content="[^"]*">/,
        `<meta name="twitter:image" content="${image}">`,
      );
  }

  const tags =
    `\n  <meta name="robots" content="noindex, nofollow">` +
    `\n  <link rel="canonical" href="${url}">`;
  return html.replace('<head>', `<head>${tags}`);
}

const registry = readFileSync(join(root, 'src/app/proposals/registry.ts'), 'utf8');
const files = [...registry.matchAll(/from '\.\/data\/([^']+)'/g)].map((match) => match[1]);
const pages = [
  {
    path: '/propuestas',
    title: 'Propuesta no encontrada',
    description: 'No hay ninguna propuesta en esta dirección.',
    image: '',
  },
];

for (const file of files) {
  const source = readFileSync(join(root, 'src/app/proposals/data', `${file}.ts`), 'utf8');
  const slug = source.match(/slug:\s*'([^']+)'/)?.[1];
  if (!slug) continue;
  const poster = source.match(/poster:\s*'([^']+)'/)?.[1] ?? '';
  pages.push({
    path: `/propuestas/${slug}`,
    title: `${spanish(source, 'client')} — ${spanish(source, 'title')}`,
    description: spanish(source, 'subtitle'),
    image: poster ? new URL(poster, site).href : '',
  });
}

for (const page of pages) {
  const file = join(dist, page.path.slice(1), 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, shell(page));
  console.log('proposal shell', page.path);
}
