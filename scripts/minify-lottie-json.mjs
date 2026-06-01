/**
 * 将 Lottie JSON 压缩为单行，减少发布体积（语义不变）。
 * 用法：node scripts/minify-lottie-json.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'glob';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const patterns = [
  'src/Components/lotties/**/*.json',
  'src/Components/Robot/lotties/**/*.json',
];

const files = globSync(patterns, { cwd: root, absolute: true });
let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const before = readFileSync(file);
  totalBefore += before.length;
  const min = JSON.stringify(JSON.parse(before.toString('utf8')));
  const buf = Buffer.from(min, 'utf8');
  writeFileSync(file, buf);
  totalAfter += buf.length;
}

// eslint-disable-next-line no-console
console.log(
  `minify-lottie-json: ${files.length} files, ${totalBefore} -> ${totalAfter} bytes`,
);
