import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const scriptPath = path.join(scriptDir, 'checkTestImports.js');

describe('checkTestImports', () => {
  let fixtureRoot: string;

  beforeEach(() => {
    fixtureRoot = fs.mkdtempSync(
      path.join(os.tmpdir(), 'check-test-imports-'),
    );
  });

  afterEach(() => {
    fs.rmSync(fixtureRoot, { force: true, recursive: true });
  });

  function writeFixture(relativePath: string, contents: string) {
    const filePath = path.join(fixtureRoot, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, contents);
  }

  function runCheck(extraArgs: string[] = []) {
    return spawnSync(
      process.execPath,
      [scriptPath, `--root=${fixtureRoot}`, ...extraArgs],
      {
        cwd: repoRoot,
        encoding: 'utf8',
      },
    );
  }

  it('reports broken real imports from nested test directories', () => {
    writeFixture('Feature/Feature.tsx', 'export const Feature = null;\n');
    writeFixture(
      'Feature/__tests__/scenarios/Feature.test.tsx',
      "import { Feature } from '../Feature';\n" +
        "import { describe, it } from 'vitest';\n" +
        "describe('Feature', () => { it('renders', () => Feature); });\n",
    );

    const result = runCheck(['--quiet']);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('found 1 broken relative import');
    expect(result.stderr).toContain(
      'Feature/__tests__/scenarios/Feature.test.tsx',
    );
    expect(result.stderr).toContain("'../Feature'");
  });

  it('accepts extensionless files and directory index imports', () => {
    writeFixture('Feature/index.ts', 'export const Feature = null;\n');
    writeFixture('Feature/utils.ts', 'export const getValue = () => 1;\n');
    writeFixture(
      'Feature/__tests__/Feature.test.ts',
      "import { Feature } from '..';\n" +
        "export { getValue } from '../utils';\n" +
        "const loadFeature = () => import('..');\n" +
        "const localData = require('./fixtures/data.json');\n" +
        'void Feature;\n' +
        'void getValue;\n' +
        'void loadFeature;\n' +
        'void localData;\n',
    );
    writeFixture('Feature/__tests__/fixtures/data.json', '{"ok":true}\n');

    const result = runCheck();

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('all relative imports resolve correctly');
  });

  it('ignores mock-only virtual paths unless strict mode is enabled', () => {
    writeFixture(
      'Feature/__tests__/Feature.test.ts',
      "import { vi } from 'vitest';\n" +
        "vi.mock('../virtual-module', () => ({ value: 1 }));\n",
    );

    const defaultResult = runCheck(['--quiet']);
    const strictResult = runCheck(['--quiet', '--strict']);

    expect(defaultResult.status).toBe(0);
    expect(strictResult.status).toBe(1);
    expect(strictResult.stderr).toContain("'../virtual-module'");
    expect(strictResult.stderr).toContain('[mock-only]');
  });
});
