/**
 * debugUtils 测试用例
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debugInfo } from '../../src/Utils/debugUtils';

describe('debugUtils', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    delete (global.window as Window & { __DEBUG_AGENTIC__?: number }).__DEBUG_AGENTIC__;
  });

  it('当 __DEBUG_AGENTIC__ 为 1 时应输出调试信息', () => {
    (global.window as Window & { __DEBUG_AGENTIC__?: number }).__DEBUG_AGENTIC__ = 1;

    debugInfo('test message');

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Agentic Debug] test message',
    );
  });

  it('当 __DEBUG_AGENTIC__ 为 1 时应传递额外参数', () => {
    (global.window as Window & { __DEBUG_AGENTIC__?: number }).__DEBUG_AGENTIC__ = 1;

    debugInfo('msg', { foo: 1 }, 'bar');

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[Agentic Debug] msg',
      { foo: 1 },
      'bar',
    );
  });

  it('当 __DEBUG_AGENTIC__ 不为 1 时不应输出', () => {
    (global.window as Window & { __DEBUG_AGENTIC__?: number }).__DEBUG_AGENTIC__ = 0;

    debugInfo('should not log');

    expect(consoleLogSpy).not.toHaveBeenCalled();
  });
});
