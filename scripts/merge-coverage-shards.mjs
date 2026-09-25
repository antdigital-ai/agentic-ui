/**
 * Merge vitest istanbul coverage-final.json shards into one summary.
 * Usage: node scripts/merge-coverage-shards.mjs coverage-shard-1 ... --out coverage-exclusive
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const rootRequire = createRequire(import.meta.url);
const vitestCovReq = createRequire(
  rootRequire.resolve('@vitest/coverage-istanbul'),
);
const libCoverage = vitestCovReq('istanbul-lib-coverage');
const libReport = vitestCovReq('istanbul-lib-report');
const reports = vitestCovReq('istanbul-reports');

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outDir = outIdx >= 0 ? args[outIdx + 1] : 'coverage-exclusive';
const shardDirs = args.filter((a, i) => a !== '--out' && i !== outIdx + 1);

if (shardDirs.length === 0) {
  console.error(
    'Usage: node scripts/merge-coverage-shards.mjs <shardDir>... --out <dir>',
  );
  process.exit(1);
}

const map = libCoverage.createCoverageMap({});
for (const dir of shardDirs) {
  const finalPath = path.join(dir, 'coverage-final.json');
  if (!fs.existsSync(finalPath)) {
    console.error('Missing', finalPath);
    process.exit(1);
  }
  map.merge(JSON.parse(fs.readFileSync(finalPath, 'utf8')));
  console.log('merged', finalPath);
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'coverage-final.json'),
  JSON.stringify(map.toJSON()),
);

const context = libReport.createContext({
  dir: outDir,
  coverageMap: map,
});
reports.create('json-summary', {}).execute(context);
reports.create('text-summary', {}).execute(context);

const summary = JSON.parse(
  fs.readFileSync(path.join(outDir, 'coverage-summary.json'), 'utf8'),
);
const b = summary.total.branches;
const need = Math.ceil(b.total * 0.99) - b.covered;
console.log(
  'TOTAL branches',
  `${b.pct}%`,
  `${b.covered}/${b.total}`,
  'need_for_99',
  need,
);
