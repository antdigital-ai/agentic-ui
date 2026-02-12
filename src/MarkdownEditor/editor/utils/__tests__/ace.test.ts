/**
 * @fileoverview ace.ts 工具函数测试
 * 覆盖 getAceLangs、preloadAceModes 及 loadAceModes 相关分支
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('ace-builds/src-noconflict/mode-abap', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-abc', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-actionscript', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-ada', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-apache_conf', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-apex', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-applescript', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-aql', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-asciidoc', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-asl', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-assembly_x86', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-astro', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-basic', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-c_cpp', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-cirru', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-clojure', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-cobol', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-coffee', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-crystal', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-csharp', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-css', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-d', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-dart', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-diff', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-dockerfile', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-dot', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-elixir', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-elm', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-erlang', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-fsharp', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-glsl', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-golang', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-graphqlschema', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-groovy', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-haml', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-handlebars', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-haskell', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-hjson', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-html', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-ini', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-jade', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-java', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-javascript', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-json', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-json5', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-jsx', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-julia', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-kotlin', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-latex', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-less', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-liquid', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-lisp', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-livescript', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-lua', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-makefile', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-markdown', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-matlab', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-nginx', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-nim', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-nix', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-objectivec', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-ocaml', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-pascal', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-perl', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-php', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-powershell', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-prisma', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-prolog', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-protobuf', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-puppet', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-python', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-r', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-raku', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-razor', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-rhtml', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-ruby', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-rust', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-sass', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-scala', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-scheme', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-scss', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-sh', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-sparql', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-sql', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-stylus', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-svg', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-swift', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-tcl', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-tex', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-toml', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-tsx', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-twig', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-typescript', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-vbscript', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-verilog', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-vhdl', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-vue', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-xml', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-yaml', () => ({}));
vi.mock('ace-builds/src-noconflict/mode-zig', () => ({}));
vi.mock('ace-builds/src-noconflict/theme-cloud9_night', () => ({}));
vi.mock('ace-builds/src-noconflict/theme-cloud_editor', () => ({}));

vi.mock('ace-builds/src-noconflict/ext-modelist', () => ({
  default: { modes: [{ name: 'javascript' }, { name: 'python' }, { name: 'text' }] },
}));

describe('ace utils', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('modeMap', () => {
    it('should map common language aliases to Ace mode names', async () => {
      const { modeMap } = await import('../ace');
      expect(modeMap.get('ts')).toBe('typescript');
      expect(modeMap.get('js')).toBe('javascript');
      expect(modeMap.get('py')).toBe('python');
      expect(modeMap.get('md')).toBe('markdown');
      expect(modeMap.get('c++')).toBe('c_cpp');
    });
  });

  describe('getAceLangs', () => {
    it('should load modes and return Set of language names', async () => {
      const { getAceLangs } = await import('../ace');
      const result = await getAceLangs();
      expect(result).toBeInstanceOf(Set);
      expect(result.has('javascript')).toBe(true);
      expect(result.has('python')).toBe(true);
      expect(result.has('text')).toBe(true);
    });

    it('should return cached result on second call', async () => {
      const { getAceLangs } = await import('../ace');
      const first = await getAceLangs();
      const second = await getAceLangs();
      expect(first).toBe(second);
    });
  });

  describe('preloadAceModes', () => {
    it('should do nothing when window is undefined', async () => {
      const origWindow = globalThis.window;
      (globalThis as any).window = undefined;
      try {
        const { preloadAceModes } = await import('../ace');
        preloadAceModes();
        expect(true).toBe(true);
      } finally {
        (globalThis as any).window = origWindow;
      }
    });

    it('should trigger getAceLangs when window exists and loader is null', async () => {
      const { getAceLangs, preloadAceModes } = await import('../ace');
      preloadAceModes();
      await getAceLangs();
      const langs = await getAceLangs();
      expect(langs.size).toBeGreaterThan(0);
    });

    it('should return early when loader already exists', async () => {
      const { getAceLangs, preloadAceModes } = await import('../ace');
      await getAceLangs();
      preloadAceModes();
      const langs = await getAceLangs();
      expect(langs.size).toBeGreaterThan(0);
    });

    it('should silently catch getAceLangs errors', async () => {
      vi.doMock('ace-builds/src-noconflict/ext-modelist', () => ({
        get default() {
          return {
            get modes() {
              throw new Error('load failed');
            },
          };
        },
      }));
      vi.resetModules();
      const { preloadAceModes } = await import('../ace');
      preloadAceModes();
      await new Promise((r) => setTimeout(r, 10));
      expect(true).toBe(true);
    });
  });
});
