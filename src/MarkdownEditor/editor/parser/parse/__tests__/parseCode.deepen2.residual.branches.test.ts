/**
 * parseCode deepen2：mermaid 换行未完整、agentic/schema 双 fail、
 * handler 无 otherProps + base 合并、config 仅合并、debug 空 keys。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleCode } from '../parseCode';

describe('parseCode deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('mermaid 以换行结尾但语法不完整 → finished false', () => {
    const r = handleCode({ value: 'graph TD\n', lang: 'mermaid' });
    expect(r.type).toBe('mermaid');
    expect(r.otherProps?.finished).toBe(false);
  });

  it('agentic / schema：非法 JSON 走 catch（partial 也可能吞错）', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const agentic = handleCode({
      value: 'not-json-@@@',
      lang: 'agentic-ui-task',
    });
    expect(agentic.type).toBe('agentic-ui-task');
    expect(agentic.value).toBeTruthy();

    const schema = handleCode({ value: 'not-json-@@@', lang: 'schema' });
    expect(schema.type).toBe('apaasify');
    spy.mockRestore();
  });

  it('katex 带 otherProps + config 合并；js 仅 config；finished false 保留', () => {
    const withBoth = handleCode(
      {
        value: 'x^2\n',
        lang: 'katex',
        otherProps: { finished: false, keep: 1 },
      },
      { theme: 'x' },
    );
    expect(withBoth.otherProps).toMatchObject({
      keep: 1,
      theme: 'x',
      finished: false,
    });

    const onlyCfg = handleCode(
      { value: 'console.log(1)\n', lang: 'javascript' },
      { only: true },
    );
    expect(onlyCfg.otherProps).toMatchObject({ only: true });

    const incomplete = handleCode({
      value: 'print(1)',
      lang: 'python',
    });
    expect(incomplete.otherProps?.finished).toBe(false);
  });

  it('apaasify data-language 覆盖 + agentic-ui-toolusebar 别名', () => {
    const r = handleCode(
      { value: '[]\n', lang: 'js' },
      { 'data-language': 'apaasify' },
    );
    expect(r.language).toBe('apaasify');
    expect(
      handleCode({ value: '{}', lang: 'agentic-ui-usertoolbar' }).type,
    ).toBe('agentic-ui-toolusebar');
  });
});
