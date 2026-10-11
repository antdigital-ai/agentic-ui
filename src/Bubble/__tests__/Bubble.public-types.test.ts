import { resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

describe('Bubble public TypeScript API', () => {
  it('accepts common message bodies, unified quotes and existing render configuration', () => {
    const fixture = resolve(
      process.cwd(),
      'src/Bubble/__tests__/fixtures/public-api.tsx',
    );
    const configPath = ts.findConfigFile(
      process.cwd(),
      ts.sys.fileExists,
      'tsconfig.json',
    )!;
    const raw = ts.readConfigFile(configPath, ts.sys.readFile);
    const config = ts.parseJsonConfigFileContent(
      raw.config,
      ts.sys,
      process.cwd(),
    );
    const program = ts.createProgram([fixture], {
      ...config.options,
      noEmit: true,
      incremental: false,
    });
    const diagnostics = ts
      .getPreEmitDiagnostics(program)
      .filter(
        (diagnostic) =>
          diagnostic.file && resolve(diagnostic.file.fileName) === fixture,
      )
      .map((diagnostic) =>
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
      );
    expect(diagnostics).toEqual([]);
  }, 60_000);
});
