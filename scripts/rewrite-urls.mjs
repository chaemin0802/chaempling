// Rewrite all /media/FILE URLs in src/data/*.json → R2 public URL
// Run: node scripts/rewrite-urls.mjs

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const R2 = 'https://pub-377fea399d6d4161a5ce1c307767b726.r2.dev';
const dir = path.join(process.cwd(), 'src/data');

let totalReplaced = 0;
for (const f of readdirSync(dir)) {
  if (!f.endsWith('.json')) continue;
  const full = path.join(dir, f);
  const before = readFileSync(full, 'utf-8');
  // /media/something → https://pub-…/something
  const after = before.replace(/"\/media\/([^"]+)"/g, (_m, name) => `"${R2}/${name}"`);
  if (after !== before) {
    const count = (before.match(/"\/media\//g) || []).length;
    totalReplaced += count;
    writeFileSync(full, after);
    console.log(`  ${f}: ${count} URLs rewritten`);
  }
}
console.log(`Total URLs rewritten: ${totalReplaced}`);
