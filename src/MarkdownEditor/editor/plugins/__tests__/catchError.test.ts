import { describe, expect, it, vi } from 'vitest';
import { withErrorReporting } from '../catchError';

describe('catchError / withErrorReporting', () => {
  it('应包装 editor 方法，抛出时调用 console.error 和 console.log', () => {
    const err = new Error('test error');
    const editor = {
      someMethod: vi.fn(() => {
        throw err;
      }),
      other: 1,
    };
    const wrapped = withErrorReporting(editor as any);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

    wrapped.someMethod('a', 'b');

    expect(consoleError).toHaveBeenCalledWith(err);
    expect(consoleLog).toHaveBeenCalledWith(['a', 'b']);
    consoleError.mockRestore();
    consoleLog.mockRestore();
  });
});
