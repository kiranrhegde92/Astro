#!/usr/bin/env node
/*
 * Walks the static-export output directory and emits a sitemap.xml that
 * lists every public HTML page. Excludes 404 / +not-found pages.
 *
 * Run after `expo export --platform web --output-dir dist`.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SITE = 'https://cosmicself.app';

// Routes the crawler should not index.
const EXCLUDE_PATTERNS = [
  /^\/\+not-found\/?$/,
  /^\/404\/?$/,
  /^\/_sitemap\/?$/,
  /^\/_expo\//,
];

function walk(dir) {
  const out = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      out.push(...walk(full));
    } else if (stat.isFile() && name.endsWith('.html')) {
      out.push(full);
    }
  }
  return out;
}

function toRoute(file) {
  const rel = path.relative(DIST, file).split(path.sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'/index.html'.length);
  if (rel.endsWith('.html')) return '/' + rel.slice(0, -'.html'.length);
  return '/' + rel;
}

function isExcluded(route) {
  return EXCLUDE_PATTERNS.some((re) => re.test(route));
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.error(`[sitemap] dist directory not found at ${DIST}. Run build:web first.`);
    process.exit(1);
  }
  const files = walk(DIST);
  const routes = Array.from(
    new Set(files.map(toRoute).filter((r) => !isExcluded(r))),
  ).sort();

  const today = new Date().toISOString().slice(0, 10);
  const urls = routes
    .map((r) => {
      const loc = r === '/' ? `${SITE}/` : `${SITE}${r}`;
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`;
    })
    .join('\n');

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls +
    '\n</urlset>\n';

  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), xml, 'utf8');
  console.log(`[sitemap] wrote ${routes.length} routes to dist/sitemap.xml`);
}

main();
