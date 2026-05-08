/* eslint-disable no-console */
/**
 * 批量重写迁移后所有测试文件 + 支撑文件的 import 路径。
 *
 * 处理的 import 模式：
 *   1. 任何形如 from '<相对路径>/src(/...)' 或 from '<相对路径>/src' 的引用
 *      → 重写为相对当前文件位置到 src 的真实相对路径
 *   2. 引用支撑文件路径（_mocks_、testUtils、setupTests、ErrorBoundary、fixtures、pages、constants、utils/dumiDemoFrame、utils/index、demo/word）
 *      → 重写为相对当前文件到 src/__test_helpers__/<...> 的路径
 *   3. require('...') 形式同步处理
 *
 * 输入：扫描 src/ 下所有 *.test.ts(x) 和 src/__test_helpers__/ 下所有 .ts(x)
 * 不修改：node_modules、dist、e2e（e2e 仍引用 ../tests/...，单独处理）
 *
 * 用法：
 *   node scripts/migrate-tests/rewriteImports.mjs --dry-run
 *   node scripts/migrate-tests/rewriteImports.mjs --apply
 */
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const srcRoot = path.join(repoRoot, 'src');
const helpersRel = '__test_helpers__';
const helpersAbs = path.join(srcRoot, helpersRel);

const mode = process.argv.includes('--apply') ? 'apply' : 'dry-run';

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

/** 将绝对路径转换为相对当前文件目录的 POSIX 风格 import 路径 */
function toRelImport(fromFileAbs, toAbs) {
  let rel = path.relative(path.dirname(fromFileAbs), toAbs);
  // 去掉 .ts(x)/.js(x) 扩展名（与原 import 保持一致；index.ts 也直接到目录）
  rel = rel.replace(/\.(tsx?|jsx?)$/, '');
  rel = rel.split(path.sep).join('/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

/**
 * 给定一个原始 import 路径与当前文件，判断这个 import 是不是指向 "某种 ../../src/..." 的形态，
 * 如果是，返回它最终指向的 src 内绝对路径；否则返回 null。
 *
 * 兼容：
 *   '../src'、'../src/...'、'../../src'、'../../src/X/Y' 等多层
 */
function resolveOldSrcImport(fromFileAbs, importPath) {
  // 仅处理相对路径
  if (!importPath.startsWith('.')) return null;
  // 必须包含 /src 或以 src 结尾
  // 例：'../src'、'../src/Bubble'、'../../src/MarkdownEditor/foo'
  const m = importPath.match(/^((?:\.\.\/)+|\.\/)src(?:\/(.+))?$/);
  if (!m) return null;
  const sub = m[2] || '';
  return path.join(srcRoot, sub);
}

/**
 * 处理支撑文件路径的引用：旧的 ./testUtils、../_mocks_/foo 等。
 * 返回 src/__test_helpers__/ 下的绝对路径，否则 null。
 *
 * 仅当 fromFile 在 src/__test_helpers__/ 下，或 fromFile 在 src/<X>/__tests__/ 下时才走该规则。
 *
 * 旧引用形态：
 *   './testUtils'           → src/__test_helpers__/testUtils.tsx
 *   './setupTests'          → src/__test_helpers__/setupTests.ts
 *   '../_mocks_/lottieMock' → src/__test_helpers__/_mocks_/lottieMock.ts
 *   '../constants/foo'      → src/__test_helpers__/constants/foo.ts
 *   '../pages/foo'          → src/__test_helpers__/pages/foo.ts
 *   '../fixtures/foo'       → src/__test_helpers__/fixtures/foo.ts
 *   './ErrorBoundary'       → src/__test_helpers__/ErrorBoundary.tsx
 *   './word'（仅 __test_helpers__/demo/ 下）→ src/__test_helpers__/demo/word.ts
 *   '../../utils/dumiDemoFrame'（旧 tests/utils/） → src/__test_helpers__/utils/dumiDemoFrame.ts
 */
const SUPPORT_FILE_NAMES = new Set([
  'testUtils',
  'setupTests',
  'ErrorBoundary',
]);
const SUPPORT_DIR_NAMES = new Set([
  '_mocks_',
  'fixtures',
  'pages',
  'constants',
]);

function resolveOldSupportImport(fromFileAbs, importPath) {
  if (!importPath.startsWith('.')) return null;
  // 提取最后一段
  const segs = importPath.split('/');
  const last = segs[segs.length - 1];

  // 单文件支撑：./testUtils、./setupTests、./ErrorBoundary
  if (SUPPORT_FILE_NAMES.has(last)) {
    // 候选扩展名
    for (const ext of ['.tsx', '.ts']) {
      const candidate = path.join(helpersAbs, last + ext);
      if (fs.existsSync(candidate)) return candidate;
    }
  }

  // 目录支撑：../_mocks_/foo、../constants/foo、../pages/foo、../fixtures/foo
  for (let i = 0; i < segs.length - 1; i++) {
    if (SUPPORT_DIR_NAMES.has(segs[i])) {
      const trailing = segs.slice(i).join('/'); // 如 _mocks_/lottieMock
      for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
        const candidate = path.join(helpersAbs, trailing + ext);
        if (fs.existsSync(candidate)) return candidate;
      }
    }
  }

  // 特殊：旧的 '../utils/dumiDemoFrame' / '../utils/index' 在 helpers 下也建了 utils 目录
  // 仅当 fromFile 属于 helpers 体系时才匹配
  if (
    fromFileAbs.startsWith(helpersAbs + path.sep) &&
    importPath.includes('/utils/')
  ) {
    const idx = segs.indexOf('utils');
    if (idx >= 0) {
      const trailing = segs.slice(idx).join('/');
      for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
        const candidate = path.join(helpersAbs, trailing + ext);
        if (fs.existsSync(candidate)) return candidate;
      }
    }
  }

  // 特殊：'./word' 在 helpers/demo 下
  if (
    fromFileAbs.startsWith(path.join(helpersAbs, 'demo') + path.sep) &&
    last === 'word'
  ) {
    const candidate = path.join(helpersAbs, 'demo/word.ts');
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

/**
 * 重写单个文件
 */
function rewriteFile(absFile) {
  const original = fs.readFileSync(absFile, 'utf8');
  let modified = original;
  const stats = { srcRewrites: 0, supportRewrites: 0 };

  // 同时匹配 from '...' / from "..." / require('...') / vi.mock('...') 等
  const importRe =
    /(from\s+|import\(|require\(|vi\.mock\(\s*|vi\.importActual\(\s*|vi\.importMock\(\s*|vitest\.mock\(\s*)(['"])([^'"]+)(['"])/g;

  modified = modified.replace(importRe, (whole, prefix, q1, importPath, q2) => {
    // 跳过非相对路径（包名、绝对路径）
    if (!importPath.startsWith('.')) return whole;

    // 1) 旧 src 引用
    const srcAbs = resolveOldSrcImport(absFile, importPath);
    if (srcAbs) {
      const newRel = toRelImport(absFile, srcAbs);
      stats.srcRewrites++;
      return `${prefix}${q1}${newRel}${q2}`;
    }

    // 2) 旧支撑文件引用
    const supAbs = resolveOldSupportImport(absFile, importPath);
    if (supAbs) {
      const newRel = toRelImport(absFile, supAbs);
      stats.supportRewrites++;
      return `${prefix}${q1}${newRel}${q2}`;
    }

    return whole;
  });

  if (modified !== original) {
    if (mode === 'apply') {
      fs.writeFileSync(absFile, modified, 'utf8');
    }
    return stats;
  }
  return null;
}

/** 收集所有要扫描的文件 */
function collectTargets() {
  const targets = [];
  // src/ 下所有 *.test.ts(x)
  const srcFiles = walk(srcRoot);
  for (const f of srcFiles) {
    if (/\.test\.tsx?$/.test(f)) targets.push(f);
    else if (f.startsWith(helpersAbs + path.sep) && /\.tsx?$/.test(f))
      targets.push(f);
  }
  return targets;
}

const targets = collectTargets();
let touched = 0;
let totalSrcRewrites = 0;
let totalSupportRewrites = 0;

console.log(`=== ${mode === 'apply' ? 'APPLY' : 'DRY RUN'} ===`);
console.log(`Scanning ${targets.length} files...`);

for (const f of targets) {
  const stats = rewriteFile(f);
  if (stats) {
    touched++;
    totalSrcRewrites += stats.srcRewrites;
    totalSupportRewrites += stats.supportRewrites;
    if (mode === 'dry-run' && touched <= 20) {
      console.log(
        `  ${path.relative(repoRoot, f)}  src:${stats.srcRewrites} sup:${stats.supportRewrites}`,
      );
    }
  }
}

console.log(`\nFiles touched: ${touched}`);
console.log(`Total src import rewrites: ${totalSrcRewrites}`);
console.log(`Total support import rewrites: ${totalSupportRewrites}`);
if (mode === 'dry-run') {
  console.log('\nUse --apply to write changes.');
}
