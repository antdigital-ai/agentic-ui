/**
 * parseCode deepen8 safe：value|| 假值 catch、endsWithNewline if、
 * otherProps 双分支合并、config-only else。
 * L216 handler 去 otherProps：现有 handler 均 spread → 死臂，跳过。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleCode } from '../parseCode';

describe('parseCode deepen8 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('agentic/schema：空 value catch → || 默认 JSON', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const agentic = handleCode({ value: '', lang: 'agentic-ui-task' });
    expect(agentic.type).toBe('agentic-ui-task');
    const schema = handleCode({ value: '', lang: 'schema' });
    expect(schema.type).toBe('apaasify');
    spy.mockRestore();
  });

  it('围栏有换行 → endsWithNewline if 臂', () => {
    const withNewline = handleCode({
      value: 'console.log(1)\n',
      lang: 'javascript',
    });
    expect(withNewline.type).toBe('code');
    expect(withNewline.otherProps?.finished).toBe(false);
    const noNewline = handleCode({ value: 'print(1)', lang: 'python' });
    expect(noNewline.otherProps?.finished).toBe(false);
  });

  it('katex：双 otherProps 合并 + config', () => {
    const katex = handleCode(
      {
        value: 'a^2\n',
        lang: 'katex',
        otherProps: { finished: false, keep: true },
      },
      { theme: 'dark' },
    );
    expect(katex.type).toBe('katex');
    expect(katex.otherProps?.keep).toBe(true);
    expect(katex.otherProps?.theme).toBe('dark');
  });

  it('无 handler + config 键：else if config 合并', () => {
    const withCfg = handleCode(
      { value: 'plain\n', lang: 'unknown-lang-abc' },
      { 'data-language': 'python', theme: 'light' },
    );
    expect(withCfg.otherProps?.theme).toBe('light');
    expect(withCfg.language).toBe('python');
  });

  it('otherPropsKeys 三元：有 otherProps', () => {
    const open = handleCode({ value: 'x', lang: 'python' });
    expect(open.type).toBe('code');
    expect(open.otherProps?.finished).toBe(false);
  });
});
