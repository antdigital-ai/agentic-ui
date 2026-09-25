/**
 * 检查并修复 docs/ 内 Markdown 标题锚点的同文件重复：
 * 同一文件中第二次及以后出现的相同锚点，追加 -2 / -3 ... 后缀。
 * 用法：node scripts/dedupe-heading-anchors.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';

const CHECK = process.argv.includes('--check');

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.md')) files.push(p);
  }
})(path.resolve('docs'));

let fixed = 0;
for (const f of files) {
  const raw = fs.readFileSync(f, 'utf8');
  const usesCRLF = raw.includes('\r\n');
  const lines = raw.split(/\r?\n/);
  const seen = new Map();
  let changed = false;

  const out = lines.map((line) => {
    const m = line.match(/^(#{1,6}\s+.+?)\s*\{#([a-zA-Z0-9_-]+)\}$/);
    if (!m) return line;
    const [, heading, anchor] = m;
    const count = seen.get(anchor) ?? 0;
    seen.set(anchor, count + 1);
    if (count === 0) return line;
    const next = `${anchor}-${count + 1}`;
    fixed += 1;
    changed = true;
    return `${heading} {#${next}}`;
  });

  if (changed && !CHECK) {
    fs.writeFileSync(f, out.join(usesCRLF ? '\r\n' : '\n'), 'utf8');
  }
}
console.log(`${CHECK ? '[check] ' : ''}duplicate anchors fixed: ${fixed}`);
