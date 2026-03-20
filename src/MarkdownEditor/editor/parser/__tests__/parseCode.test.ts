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

describe('parseCode agentic-ui embed blocks', () => {
  it('should parse agentic-ui-task to typed node with JSON value', () => {
    const raw = `{
  "items": [{ "key": "a", "title": "T", "content": "c", "status": "loading" }]
}`;
    const result = handleCode(
      { value: raw, lang: 'agentic-ui-task', meta: undefined },
      undefined,
    );
    expect(result.type).toBe('agentic-ui-task');
    expect(result.language).toBe('agentic-ui-task');
    expect((result.value as any).items).toHaveLength(1);
    expect((result.value as any).items[0].key).toBe('a');
  });

  it('should parse agentic-ui-toolusebar to typed node with JSON value', () => {
    const raw = `{ "items": [{ "text": "继续", "key": "1" }] }`;
    const result = handleCode(
      { value: raw, lang: 'agentic-ui-toolusebar', meta: undefined },
      undefined,
    );
    expect(result.type).toBe('agentic-ui-toolusebar');
    expect(result.language).toBe('agentic-ui-toolusebar');
    expect((result.value as any).items[0].text).toBe('继续');
  });

  it('should map legacy agentic-ui-usertoolbar lang to agentic-ui-toolusebar node', () => {
    const raw = `{ "items": [{ "text": "继续", "key": "1" }] }`;
    const result = handleCode(
      { value: raw, lang: 'agentic-ui-usertoolbar', meta: undefined },
      undefined,
    );
    expect(result.type).toBe('agentic-ui-toolusebar');
    expect(result.language).toBe('agentic-ui-toolusebar');
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
