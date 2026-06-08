import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BOM, hasUtf8Bom, runStripUtf8Bom } from './strip-utf8-bom.mjs';

describe('strip-utf8-bom', () => {
  let fixtureRoot: string;

  beforeEach(() => {
    fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'strip-bom-'));
  });

  afterEach(() => {
    fs.rmSync(fixtureRoot, { force: true, recursive: true });
  });

  function writeFixture(relativePath: string, contents: Buffer | string) {
    const filePath = path.join(fixtureRoot, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, contents);
  }

  function readFixture(relativePath: string) {
    return fs.readFileSync(path.join(fixtureRoot, relativePath));
  }

  function runWithLogs(argv: string[] = []) {
    const logs: string[] = [];
    const status = runStripUtf8Bom({
      root: fixtureRoot,
      argv,
      log: (message) => logs.push(message),
    });

    return {
      logs,
      output: logs.join('\n'),
      status,
    };
  }

  it('reports BOM files in check mode without modifying them', () => {
    writeFixture('src/with-bom.ts', Buffer.concat([BOM, Buffer.from('ok\n')]));
    writeFixture('src/without-bom.ts', 'ok\n');
    writeFixture(
      'dist/ignored.ts',
      Buffer.concat([BOM, Buffer.from('ignored\n')]),
    );

    const result = runWithLogs(['--check']);

    expect(result.status).toBe(1);
    expect(result.output).toContain('strip-utf8-bom (check): 1 file(s)');
    expect(result.output).toContain('src/with-bom.ts');
    expect(result.output).not.toContain('dist/ignored.ts');
    expect(hasUtf8Bom(readFixture('src/with-bom.ts'))).toBe(true);
    expect(hasUtf8Bom(readFixture('dist/ignored.ts'))).toBe(true);
  });

  it('lists BOM files in dry-run mode without modifying them', () => {
    writeFixture('package.json', Buffer.concat([BOM, Buffer.from('{}\n')]));

    const result = runWithLogs(['--dry-run']);

    expect(result.status).toBe(0);
    expect(result.output).toContain('strip-utf8-bom (dry-run): 1 file(s)');
    expect(result.output).toContain('package.json');
    expect(hasUtf8Bom(readFixture('package.json'))).toBe(true);
  });

  it('removes BOM from matched files and leaves ignored files unchanged', () => {
    writeFixture(
      'scripts/tool.mjs',
      Buffer.concat([BOM, Buffer.from('tool\n')]),
    );
    writeFixture(
      'node_modules/pkg/index.js',
      Buffer.concat([BOM, Buffer.from('ignored\n')]),
    );

    const result = runWithLogs();

    expect(result.status).toBe(0);
    expect(result.output).toContain('strip-utf8-bom (fixed): 1 file(s)');
    expect(result.output).toContain('scripts/tool.mjs');
    expect(hasUtf8Bom(readFixture('scripts/tool.mjs'))).toBe(false);
    expect(readFixture('scripts/tool.mjs').toString('utf8')).toBe('tool\n');
    expect(hasUtf8Bom(readFixture('node_modules/pkg/index.js'))).toBe(true);
  });
});
