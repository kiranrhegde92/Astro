#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '..', 'dist');

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (entry.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function findHrefs(html) {
  const hrefs = [];
  for (const m of html.matchAll(/href="([^"]+)"/g)) hrefs.push(m[1]);
  return hrefs;
}

function main() {
  if (!fs.existsSync(DIST)) {
    console.error('dist/ not found. Run build:web first.');
    process.exit(1);
  }
  const files = walk(DIST);
  const pageSet = new Set(
    files.map((f) =>
      '/' +
      path
        .relative(DIST, f)
        .replace(/\\/g, '/')
        .replace(/index\.html$/, '')
        .replace(/\.html$/, ''),
    ),
  );
  const problems = [];
  for (const f of files) {
    const html = fs.readFileSync(f, 'utf8');
    for (const href of findHrefs(html)) {
      if (!href.startsWith('/')) continue;
      if (href.startsWith('//')) continue;
      const clean = href.split('#')[0].split('?')[0];
      const candidates = [clean, clean.replace(/\/$/, ''), clean + '/'];
      const found = candidates.some((c) => pageSet.has(c) || pageSet.has(c + '/'));
      if (!found) problems.push(`${path.relative(DIST, f)} -> ${href}`);
    }
  }
  if (problems.length) {
    console.error('Broken internal links:');
    for (const p of problems) console.error('  ' + p);
    process.exit(1);
  }
  console.log(`ok: ${files.length} pages, all internal links resolve`);
}

main();
