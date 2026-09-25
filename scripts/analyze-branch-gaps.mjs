import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const cov = JSON.parse(
  fs.readFileSync('./coverage-exclusive/coverage-summary.json', 'utf8'),
);

const branchesTests = globSync('src/**/*.branches.test.{ts,tsx}');

const prefer = [
  'Utils',
  'Bubble',
  'Workspace',
  'Components',
  'MarkdownEditor',
  'I18n',
  'Plugins',
  'Hooks',
  'History',
];

const candidates = [];
for (const [file, data] of Object.entries(cov)) {
  if (file === 'total') continue;
  const b = data.branches;
  if (!b || b.total === 0) continue;
  const miss = b.total - b.covered;
  if (miss < 8 || miss > 20) continue;

  const srcPath = file
    .replace(/^E:\/github\/md-editor\//i, '')
    .replace(/\\/g, '/');
  const parts = srcPath.split('/');
  const topDir = parts[1] || '';
  const fileName = path.basename(srcPath, path.extname(srcPath));
  const dir = parts.slice(0, -1).join('/');

  const hasBranchesTest = branchesTests.some(
    (t) =>
      t.includes(`${fileName}.branches`) ||
      t.includes(`/${fileName}.branches`),
  );

  const saturated = branchesTests.filter((t) => {
    const testDir = t.replace(/^src\//, '').replace(/\/__tests__\/.*$/, '');
    return testDir === dir.replace(/^src\//, '') || testDir.startsWith(dir);
  }).length;

  const preferScore = prefer.some(
    (p) => srcPath.includes(`/${p}/`) || topDir === p,
  )
    ? 1
    : 0;

  candidates.push({
    srcPath,
    miss,
    total: b.total,
    pct: b.pct,
    topDir,
    fileName,
    hasBranchesTest,
    saturated,
    preferScore,
  });
}

candidates.sort((a, b) => {
  if (a.hasBranchesTest !== b.hasBranchesTest) return a.hasBranchesTest ? 1 : -1;
  if (a.saturated !== b.saturated) return a.saturated - b.saturated;
  if (b.preferScore !== a.preferScore) return b.preferScore - a.preferScore;
  return b.miss - a.miss;
});

console.log('Total candidates (miss 8-20):', candidates.length);
console.log(
  'Total miss in range:',
  candidates.reduce((s, c) => s + c.miss, 0),
);
console.log('\nTop 50 (no branches test, low saturation, preferred):');
candidates
  .filter((c) => !c.hasBranchesTest && c.saturated <= 2)
  .slice(0, 50)
  .forEach((c) =>
    console.log(
      `${c.miss.toString().padStart(2)} miss | sat=${c.saturated} | ${c.srcPath}`,
    ),
  );

console.log('\nPreferred dirs (Utils/I18n/Components/Bubble/Workspace/History/Hooks):');
candidates
  .filter((c) =>
    /src\/(Utils|I18n|Components|Bubble|Workspace|History|Hooks)\//.test(
      c.srcPath,
    ),
  )
  .forEach((c) =>
    console.log(
      `${c.hasBranchesTest ? 'EXT' : 'NEW'} ${c.miss.toString().padStart(2)} miss | sat=${c.saturated} | ${c.srcPath}`,
    ),
  );
