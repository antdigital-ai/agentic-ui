/**
 * docs/ 文档 Dumi → Rspress 转换脚本（幂等，可重复执行）。
 *
 * 处理项：
 * 1. 移除标题行尾的 dumi 锚点 `{#anchor}`（保留标题原有换行结构），
 *    站内 `(#anchor)` 引用替换为 Rspress 的标题 slug 锚点
 * 2. ` ```tsx | pure ` → ` ```tsx pure `（plugin-preview 的 pure 元信息语法）
 * 3. 生成 docs/_nav.json 与各目录 _meta.json（源自 frontmatter nav/group）
 *
 * 首页 docs/index.md 的 inline HomePage demo 由 theme/HomePage 挂载处理，
 * 不在本脚本范围内（避免覆盖手工维护的内容）。
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const docsDir = resolve(repoRoot, 'docs');

function collectMdFiles(dir) {
  const files = [];
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const p = join(d, name);
      const st = statSync(p);
      if (st.isDirectory()) walk(p);
      else if (name.endsWith('.md')) files.push(p);
    }
  };
  walk(dir);
  return files;
}

/** slug 化：与 Rspress/GitHub 兼容的小写连字符（中文字符保留） */
function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');
}

const mdFiles = collectMdFiles(docsDir);

/** 第一遍：收集 anchor → 标题文本（全站，供引用替换） */
const anchorToText = new Map();
for (const file of mdFiles) {
  const text = readFileSync(file, 'utf8');
  const re = /^(#{1,6})\s+(.+?)\s+\{#([\w-]+)\}(?=\s*$)/gm;
  let m;
  while ((m = re.exec(text)) !== null) {
    anchorToText.set(m[3], m[2].trim());
  }
}

/** 第二遍：逐文件转换（只在行内替换，不吞换行） */
let changedCount = 0;
for (const file of mdFiles) {
  const orig = readFileSync(file, 'utf8');
  const lines = orig.split(/(\r?\n)/);
  const out = [];
  for (let line of lines) {
    // 标题锚点：仅去掉行尾 {#anchor}
    const heading = line.match(/^(#{1,6}\s+.+?)\s+\{#([\w-]+)\}(?:\d+\})?\s*$/);
    if (heading) {
      out.push(`${heading[1]}`);
      continue;
    }
    // dumi 代码块 meta `lang | pure`
    const fence = line.match(/^(```\s*)([\w-]+)\s*\|\s*(pure)\s*$/);
    if (fence) {
      out.push(`${fence[1]}${fence[2]} ${fence[3]}`);
      continue;
    }
    // 站内锚点链接
    if (line.includes('](#')) {
      out.push(line.replace(/\]\(#([\w-]+)\)/g, (all, anchor) => {
        const headingText = anchorToText.get(anchor);
        return headingText ? `](#${slugify(headingText)})` : all;
      }));
      continue;
    }
    // 指向 docs/ 之外源码文件的链接（../../src/...）：Rspress 死链校验不通过，
    // 把 `[text](../../src/x.ts)` 还原为 `text`（文本保持原样，链接降级为普通文字）
    if (line.includes('](../')) {
      line = line.replace(/\[((?:[^\]])+)\]\((?:\.\.\/)+(?:src|home)\/[^)]+\)/g, '$1');
    }
    out.push(line);
  }
  const text = out.join('');
  if (text !== orig) {
    writeFileSync(file, text);
    changedCount += 1;
  }
}

console.log(`transformed ${changedCount}/${mdFiles.length} md files`);

/** 生成 _nav.json / _meta.json */
function parseFrontmatter(text) {
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return null;
  const out = {};
  const titleM = fm[1].match(/^title:\s*(.+)$/m);
  if (titleM) out.title = titleM[1].trim();
  const navInline = fm[1].match(/^nav:\s*\{\s*title:\s*['"]?([^,'"}]+?)['"]?\s*,\s*order:\s*(\d+)/m);
  const navBlock = fm[1].match(/^nav:\s*\r?\n\s+title:\s*(.+?)\r?\n\s+order:\s*(\d+)/m);
  if (navInline) out.nav = { title: navInline[1].trim(), order: Number(navInline[2]) };
  else if (navBlock) out.nav = { title: navBlock[1].trim(), order: Number(navBlock[2]) };
  if (/^nav:\s*false/m.test(fm[1])) out.nav = false;
  const gInline = fm[1].match(/^group:\s*\{\s*title:\s*['"]?([^,'"}]+?)['"]?\s*,\s*order:\s*(\d+)/m);
  const gBlock = fm[1].match(/^group:\s*\r?\n\s+title:\s*(.+?)\r?\n\s+order:\s*(\d+)/m);
  if (gInline) out.group = { title: gInline[1].trim(), order: Number(gInline[2]) };
  else if (gBlock) out.group = { title: gBlock[1].trim(), order: Number(gBlock[2]) };
  return out;
}

const navByTitle = new Map();
const pagesWithoutNav = [];

/** 目录 → 默认 nav（dumi 约定：组件目录页共享 nav.title=组件，无显式 nav 字段） */
const DIR_DEFAULT_NAV = {
  components: { title: '组件', order: 1 },
  'demos-pages': { title: 'Demo', order: 5 },
  development: { title: '项目研发', order: 6 },
  faq: { title: '常见问题', order: 8 },
  plugin: { title: '插件', order: 2 },
  utils: { title: '基础能力', order: 4 },
};

for (const file of mdFiles) {
  const rel = relative(docsDir, file).replace(/\\/g, '/');
  const fm = parseFrontmatter(readFileSync(file, 'utf8'));
  if (!fm) {
    pagesWithoutNav.push(rel);
    continue;
  }
  if (fm.nav === false) continue;
  if (!fm.nav) {
    const dirName = rel.includes('/') ? rel.split('/')[0] : '';
    const defaultNav = DIR_DEFAULT_NAV[dirName];
    if (!defaultNav) {
      pagesWithoutNav.push(rel);
      continue;
    }
    fm.nav = { ...defaultNav };
  }
  const entry = navByTitle.get(fm.nav.title) ?? { order: fm.nav.order, files: [] };
  entry.files.push({
    file: rel,
    title: fm.title ?? '',
    group: fm.group?.title,
    groupOrder: fm.group?.order ?? 0,
    dir: rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : '',
  });
  navByTitle.set(fm.nav.title, entry);
}

const NAV_ROUTE_PREFIX = {
  '组件': '/components',
  'Demo': '/demos-pages',
  '项目研发': '/development',
  '常见问题': '/faq',
  '插件': '/plugin',
  '基础能力': '/utils',
};

const navJson = [];
const seenNav = new Set();
for (const [title, info] of [...navByTitle.entries()].sort((a, b) => a[1].order - b[1].order)) {
  const prefix = NAV_ROUTE_PREFIX[title];
  if (!prefix || seenNav.has(prefix)) continue;
  seenNav.add(prefix);
  const indexFile = info.files.find((f) => f.file === `${prefix.slice(1)}/index.md`);
  navJson.push({
    text: title,
    link: indexFile ? `${prefix}/` : prefix,
    activeMatch: `^${prefix}/`,
  });
}
writeFileSync(resolve(docsDir, '_nav.json'), `${JSON.stringify(navJson, null, 2)}\n`);

/** 每目录 _meta.json：group 分节 + 文件项 */
const dirGroups = new Map();
for (const [, info] of navByTitle) {
  for (const f of info.files) {
    const dir = f.dir || '.';
    const list = dirGroups.get(dir) ?? [];
    list.push(f);
    dirGroups.set(dir, list);
  }
}

for (const [dir, files] of dirGroups) {
  const metaItems = [];
  const groupBuckets = new Map();
  for (const f of files) {
    if (f.file.endsWith('/index.md')) continue;
    const bucket = groupBuckets.get(f.group ?? '') ?? [];
    bucket.push(f);
    groupBuckets.set(f.group ?? '', bucket);
  }
  const sortedGroups = [...groupBuckets.entries()].sort(
    (a, b) => Math.min(...a[1].map((x) => x.groupOrder)) - Math.min(...b[1].map((x) => x.groupOrder)),
  );
  for (const [group, groupFiles] of sortedGroups) {
    if (group) metaItems.push({ type: 'section-header', label: group });
    for (const f of groupFiles.sort((a, b) =>
      a.file.split('/').pop().localeCompare(b.file.split('/').pop()),
    )) {
      const name = f.file.split('/').pop().replace(/\.md$/, '');
      if (f.title) metaItems.push({ type: 'file', name, label: f.title.split(/\s+/)[0] });
      else metaItems.push(name);
    }
  }
  const metaPath = dir === '.' ? resolve(docsDir, '_meta.json') : resolve(docsDir, dir, '_meta.json');
  writeFileSync(metaPath, `${JSON.stringify(metaItems, null, 2)}\n`);
}

console.log(`nav groups: ${navJson.length}, dirs with _meta: ${dirGroups.size}`);
if (pagesWithoutNav.length) {
  console.log(`pages without nav frontmatter (${pagesWithoutNav.length}):`);
  for (const p of pagesWithoutNav.slice(0, 6)) console.log('  ' + p);
}
