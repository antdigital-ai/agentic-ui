/**
 * parseCode deepen：空 value catch、agentic/schema 双解析、config 合并、apaasify。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleCode } from '../parseCode';

describe('parseCode deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('schema / agentic：空 value 走 || 默认；非法 JSON 双 catch', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(handleCode({ value: '', lang: 'schema' }).type).toBe('apaasify');
    expect(handleCode({ value: '', lang: 'agentic-ui-task' }).type).toBe(
      'agentic-ui-task',
    );
    expect(handleCode({ value: '{', lang: 'schema' }).type).toBe('apaasify');
    expect(handleCode({ value: '{', lang: 'agentic-ui-filemap' }).value).toBeTruthy();
    spy.mockRestore();
  });

  it('围栏不完整 / indented done；data-language 覆盖；apaasify 语言', () => {
    const partial = handleCode({ value: 'graph', lang: 'mermaid' });
    expect(partial.otherProps?.finished).toBe(false);

    const indented = handleCode({
      value: 'indented',
      lang: 'js',
      meta: 'indented',
    });
    expect(indented.type).toBe('code');

    const overridden = handleCode(
      { value: 'print(1)\n', lang: 'js' },
      { 'data-language': 'apaasify' },
    );
    expect(overridden.language).toBe('apaasify');
  });

  it('handler 合并 otherProps + config；仅 config；别名语言', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const withProps = handleCode(
      {
        value: 'x^2\n',
        lang: 'katex',
        otherProps: { keep: true },
      },
      { theme: 'dark' },
    );
    expect(withProps.otherProps).toMatchObject({ keep: true, theme: 'dark' });

    const onlyConfig = handleCode(
      { value: 'z\n', lang: 'js' },
      { onlyConfig: 1 },
    );
    expect(onlyConfig.otherProps).toMatchObject({ onlyConfig: 1 });

    expect(handleCode({ value: '[]', lang: 'apassify' }).type).toBe('apaasify');
    expect(
      handleCode({ value: '{}', lang: 'agentic-ui-usertoolbar' }).type,
    ).toBe('agentic-ui-toolusebar');
    spy.mockRestore();
  });
});
