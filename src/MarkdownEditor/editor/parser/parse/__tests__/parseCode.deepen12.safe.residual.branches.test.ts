/**
 * parseCode deepen12 safe：空 value catch、endsWithNewline else、
 * katex otherProps 合并、无 handler config 合并。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleCode } from '../parseCode';

describe('parseCode deepen12 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('schema：双 catch → raw value', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const out = handleCode({ value: '[[[bad', lang: 'schema' });
    expect(out.type).toBe('apaasify');
    spy.mockRestore();
  });

  it('无换行结尾 → loading 臂', () => {
    const out = handleCode({ value: 'print(1)', lang: 'python' });
    expect(out.type).toBe('code');
    expect(out.otherProps?.finished).toBe(false);
  });

  it('katex：otherProps + config 合并', () => {
    const out = handleCode(
      {
        value: 'a^2\n',
        lang: 'katex',
        otherProps: { finished: false, keep: true },
      },
      { theme: 'dark' },
    );
    expect(out.type).toBe('katex');
    expect(out.otherProps?.keep).toBe(true);
    expect(out.otherProps?.theme).toBe('dark');
  });

  it('无 handler + config 键合并', () => {
    const out = handleCode(
      { value: 'plain\n', lang: 'unknown-lang-abc' },
      { 'data-language': 'python', theme: 'light' },
    );
    expect(out.otherProps?.theme).toBe('light');
    expect(out.language).toBe('python');
  });
});
