/**
 * parseCode deepen7：缩进代码 done；围栏无换行 else；
 * L47/L71 catch 内 value|| 假值臂：json5 对 '{}'/'[]' 不抛 → 死臂，跳过。
 * L216 handler 去 otherProps：现有 handler 均 spread → 死臂，跳过。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleCode } from '../parseCode';

describe('parseCode deepen7 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('indented meta → stream done；围栏无结尾换行 → else loading', () => {
    const indented = handleCode({
      value: '  print(1)',
      lang: 'python',
      meta: 'indented',
    });
    expect(indented.type).toBe('code');
    expect(indented.otherProps?.finished).not.toBe(false);

    const open = handleCode({ value: 'print(1)', lang: 'python' });
    expect(open.otherProps?.finished).toBe(false);
  });

  it('config 有键 + 无 handler：else if config 合并；空 config 不进', () => {
    const withCfg = handleCode(
      { value: 'x\n', lang: 'unknown-lang-zzz' },
      { theme: 'dark' },
    );
    expect(withCfg.otherProps?.theme).toBe('dark');

    const noCfg = handleCode({ value: 'y\n', lang: 'unknown-lang-zzz' });
    expect(noCfg.type).toBe('code');
  });

  it('katex / mermaid：保留 otherProps；agentic 非法 json 走 catch', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const katex = handleCode({
      value: 'a^2',
      lang: 'katex',
      otherProps: { finished: false },
    });
    expect(katex.type).toBe('katex');

    const agentic = handleCode({
      value: '{not-json',
      lang: 'agentic-ui-task',
    });
    expect(agentic.type).toBe('agentic-ui-task');
    spy.mockRestore();
  });
});
