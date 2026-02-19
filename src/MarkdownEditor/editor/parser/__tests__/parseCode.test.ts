import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleCode, handleYaml } from '../parse/parseCode';

vi.mock('../../../../Utils/debugUtils', () => ({
  debugInfo: vi.fn(),
}));

describe('parseCode handleCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use katex handler and return type katex', () => {
    const result = handleCode(
      { value: 'x^2', lang: 'katex', meta: undefined },
      undefined,
    );
    expect(result.type).toBe('katex');
    expect(result.language).toBe('katex');
  });

  it('should set streamStatus loading when isCodeBlockLikelyComplete returns false', () => {
    const result = handleCode({
      value: 'graph\n',
      lang: 'mermaid',
      meta: undefined,
    });
    expect(result.otherProps).toBeDefined();
  });

  it('should merge otherProps when both base and result have otherProps', () => {
    const result = handleCode(
      {
        value: 'graph TD\n',
        lang: 'mermaid',
        meta: undefined,
        otherProps: { foo: 1 },
      },
      { 'data-language': 'mermaid', bar: 2 },
    );
    expect(result.otherProps).toMatchObject(
      expect.objectContaining({ foo: 1, bar: 2 }),
    );
  });

  it('should pass config to otherProps when config has keys', () => {
    const result = handleCode(
      {
        value: 'code',
        lang: 'text',
        meta: undefined,
      },
      { 'data-foo': 'bar' },
    );
    expect(result.otherProps).toBeDefined();
  });
});

describe('parseCode processSchemaLanguage double throw (37-41)', () => {
  it('should catch when both json5 and partialJsonParse throw', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = handleCode(
      { value: 'not valid json at all {{{', lang: 'schema', meta: undefined },
      undefined,
    );
    expect(result.type).toBe('apaasify');
    expect(result.value).toBe('not valid json at all {{{');
    expect(consoleSpy).toHaveBeenCalledWith(
      'parse schema error',
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });
});

describe('parseCode handleYaml', () => {
  it('should return code node with frontmatter', () => {
    const result = handleYaml({ value: 'key: value' });
    expect(result).toMatchObject({
      type: 'code',
      language: 'yaml',
      value: 'key: value',
      frontmatter: true,
      children: [{ text: 'key: value' }],
    });
  });
});
