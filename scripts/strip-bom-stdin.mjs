/**
 * 移除 stdin 或命令行传入文件的 UTF-8 BOM，输出结果到 stdout（stdin 模式）。
 *
 * 用途：接入 prettier / lint-staged 管线，因为 prettier 3 会原样保留 BOM。
 *
 * 用法：
 *   cat file | node scripts/strip-bom-stdin.mjs > out   # stdin -> stdout
 *   node scripts/strip-bom-stdin.mjs file1 file2        # 原地写回
 */
import { readFileSync, writeFileSync } from 'node:fs';

const BOM = Buffer.from([0xef, 0xbb, 0xbf]);

const hasBom = (buf) =>
  buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf;

const files = process.argv.slice(2);

if (files.length > 0) {
  for (const file of files) {
    try {
      const buf = readFileSync(file);
      if (hasBom(buf)) {
        writeFileSync(file, buf.subarray(3));
        console.log(`strip-bom: ${file}`);
      }
    } catch (error) {
      console.error(`strip-bom: skip ${file} (${error.message})`);
    }
  }
} else {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const buf = Buffer.concat(chunks);
  process.stdout.write(hasBom(buf) ? buf.subarray(3) : buf);
}
