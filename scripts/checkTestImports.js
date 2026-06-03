#!/usr/bin/env node

/**
 * 测试文件 import 路径检查脚本
 *
 * 背景：
 *   当测试文件位于 src/Foo/__tests__/Foo.test.tsx 时，相对路径 `../Foo`
 *   能正确指向 src/Foo/Foo.tsx；但当测试文件被移到子目录，例如
 *   src/Foo/__tests__/scenarios/Foo.test.tsx，相对路径仍写成 `../Foo`
 *   就会指向 src/Foo/__tests__/Foo.tsx（不存在）。这类 BUG 不会让测试
 *   失败而是直接被 vitest 显示为「(0 test)」，很容易漏掉。
 *
 * 本脚本会：
 *   1) 扫描 src 下所有测试文件 (*.test.ts / *.test.tsx)
 *   2) 解析其中的 import / vi.mock / require 相对路径
 *   3) 解析后的目标文件如果不存在，则报告为可疑 BUG
 *   4) 命中 BUG 时以非 0 退出码退出（便于 CI 接入）
 *
 * 使用方法：
 *   node scripts/checkTestImports.js [--root=src] [--quiet]
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');

/** 解析命令行参数 */
function parseArgs(argv) {
  const args = { root: 'src', quiet: false, strict: false };
  for (const a of argv.slice(2)) {
    if (a === '--quiet' || a === '-q') args.quiet = true;
    else if (a === '--strict') args.strict = true;
    else if (a.startsWith('--root=')) args.root = a.slice('--root='.length);
  }
  return args;
}

/** 递归收集 src 下所有 *.test.ts / *.test.tsx 文件 */
function collectTestFiles(dir, acc = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (_) {
    return acc;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // 跳过 node_modules 与 dist
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      collectTestFiles(full, acc);
    } else if (/\.test\.(ts|tsx)$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

/**
 * 从源码文本中提取所有相对 specifier。
 * 返回结构：[{ spec, kind }]
 *   - kind = 'real'  : 真正会被加载的 import / export-from / require / 动态 import
 *   - kind = 'mock'  : vi.mock / jest.mock 的虚拟路径
 * 同一 spec 可能同时出现两类。仅保留 '.' 开头的相对路径。
 */
function extractRelativeSpecifiers(src) {
  /** @type {{spec:string, kind:'real'|'mock'}[]} */
  const out = [];
  const realPatterns = [
    /import\s+(?:[^'"`;]+?\s+from\s+)?['"]([^'"`]+)['"]/g,
    /export\s+(?:[^'"`;]+?\s+from\s+)?['"]([^'"`]+)['"]/g,
    /require\(\s*['"]([^'"`]+)['"]\s*\)/g,
    /import\(\s*['"]([^'"`]+)['"]\s*\)/g,
  ];
  const mockPatterns = [/(?:vi|jest)\.(?:mock|doMock)\(\s*['"]([^'"`]+)['"]/g];
  for (const re of realPatterns) {
    let m;
    while ((m = re.exec(src)) !== null) {
      if (m[1].startsWith('.')) out.push({ spec: m[1], kind: 'real' });
    }
  }
  for (const re of mockPatterns) {
    let m;
    while ((m = re.exec(src)) !== null) {
      if (m[1].startsWith('.')) out.push({ spec: m[1], kind: 'mock' });
    }
  }
  return out;
}

/**
 * 给定测试文件绝对路径与相对 import 字符串，判断目标是否能解析到一个真实文件。
 * 解析顺序参考 vite/vitest：先按字面量补常见后缀，再当作目录看 index.*。
 */
function resolveSpecifier(testFileAbs, spec) {
  const base = path.resolve(path.dirname(testFileAbs), spec);
  const tryExts = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json'];

  // 1) 字面量 + 后缀
  for (const ext of tryExts) {
    const p = base + ext;
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }

  // 2) 当作目录解析 index.*
  if (fs.existsSync(base) && fs.statSync(base).isDirectory()) {
    for (const ext of tryExts) {
      if (!ext) continue;
      const p = path.join(base, 'index' + ext);
      if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
    }
  }

  return null;
}

/** 主流程 */
function main() {
  const args = parseArgs(process.argv);
  const rootAbs = path.resolve(REPO_ROOT, args.root);

  if (!fs.existsSync(rootAbs)) {
    console.error(`[checkTestImports] root not found: ${rootAbs}`);
    process.exit(2);
  }

  const testFiles = collectTestFiles(rootAbs);
  if (!args.quiet) {
    console.log(
      `[checkTestImports] scanning ${testFiles.length} test files under ${path.relative(REPO_ROOT, rootAbs)} ...`,
    );
  }

  /** @type {{file:string, spec:string, kind:'real'|'mock'}[]} */
  const broken = [];

  for (const file of testFiles) {
    let src;
    try {
      src = fs.readFileSync(file, 'utf8');
    } catch (_) {
      continue;
    }
    const items = extractRelativeSpecifiers(src);
    // 聚合：判断每个 spec 是否同时出现在 real 与 mock
    const specToKinds = new Map();
    for (const it of items) {
      if (!specToKinds.has(it.spec)) specToKinds.set(it.spec, new Set());
      specToKinds.get(it.spec).add(it.kind);
    }
    for (const [spec, kinds] of specToKinds) {
      const resolved = resolveSpecifier(file, spec);
      if (resolved) continue;
      const isRealOnly = kinds.has('real');
      // 默认模式：仅报告"真正会被 import"的路径；只在 vi.mock 里出现的虚拟路径跳过
      if (!args.strict && !isRealOnly) continue;
      broken.push({ file, spec, kind: isRealOnly ? 'real' : 'mock' });
    }
  }

  if (broken.length === 0) {
    if (!args.quiet) {
      const mode = args.strict ? 'strict' : 'default';
      console.log(
        `[checkTestImports] ✅ all relative imports resolve correctly (${testFiles.length} files, mode=${mode}).`,
      );
    }
    process.exit(0);
  }

  console.error(
    `[checkTestImports] ❌ found ${broken.length} broken relative import(s):\n`,
  );
  // 按文件聚合输出
  const byFile = new Map();
  for (const item of broken) {
    if (!byFile.has(item.file)) byFile.set(item.file, []);
    byFile.get(item.file).push(item);
  }
  for (const [file, items] of byFile) {
    const rel = path.relative(rootAbs, file);
    console.error(`  ${rel.split(path.sep).join('/')}`);
    for (const it of items) {
      const tag = it.kind === 'mock' ? ' [mock-only]' : '';
      console.error(`    └─ '${it.spec}'  → not found${tag}`);
    }
  }
  console.error(
    `\n提示：测试文件位于 __tests__/<子目录>/... 时，相对路径常常需要多加一层 '../'。\n` +
      `      默认仅报告会被真正加载的 import；如需同时检查 vi.mock 虚拟路径，请加 --strict。`,
  );
  process.exit(1);
}

main();
