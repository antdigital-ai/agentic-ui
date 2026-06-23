import { describe, expect, it, vi } from 'vitest';
import { withErrorReporting } from '../catchError';

describe('catchError / withErrorReporting', () => {
  it('应包装 editor 方法，抛出时记录日志并继续 rethrow', () => {
    const err = new Error('test error');
    const editor = {
      someMethod: vi.fn(() => {
        throw err;
      }),
      other: 1,
    };
    const wrapped = withErrorReporting(editor as any);
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => wrapped.someMethod('a', 'b')).toThrow(err);
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('重复 withErrorReporting 不会双层包装', () => {
    const editor = { fn: () => 'ok' };
    const once = withErrorReporting(editor as any);
    const wrappedFn = once.fn;
    const twice = withErrorReporting(once as any);
    expect(twice.fn).toBe(wrappedFn);
    expect(twice.fn()).toBe('ok');
  });
});
