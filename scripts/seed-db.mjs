// On first runtime boot of a fresh container/volume, copy the repo's
// payload.db into the persistent location pointed to by DATABASE_URI.
// Subsequent boots (and local dev) are no-ops.
import fs from 'node:fs';
import path from 'node:path';

const uri = process.env.DATABASE_URI || '';
if (!uri.startsWith('file:')) {
  process.exit(0);
}

const target = uri.replace(/^file:/, '');
const source = path.resolve(process.cwd(), 'payload.db');

if (path.resolve(target) === source) {
  process.exit(0);
}

if (fs.existsSync(target)) {
  console.log(`[seed-db] ${target} already present, skipping`);
  process.exit(0);
}

if (!fs.existsSync(source)) {
  console.log(`[seed-db] no seed DB at ${source}, skipping`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(target), { recursive: true });
fs.copyFileSync(source, target);
console.log(`[seed-db] copied ${source} -> ${target}`);
