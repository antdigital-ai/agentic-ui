import { afterEach, describe, expect, it, vi } from 'vitest';
import { debugInfo } from '../debugUtils';

describe('debugInfo', () => {
  afterEach(() => {
    delete (window as any).__DEBUG_AGENTIC__;
    vi.restoreAllMocks();
  });

  it('does not log when debug flag is not set', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    debugInfo('test message');
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('logs when debug flag is set to 1', () => {
    (window as any).__DEBUG_AGENTIC__ = 1;
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    debugInfo('test message', { data: 1 });
    expect(logSpy).toHaveBeenCalledWith(
      '[Agentic Debug] test message',
      { data: 1 },
    );
  });

  it('does not log when debug flag is other value', () => {
    (window as any).__DEBUG_AGENTIC__ = 2;
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    debugInfo('test message');
    expect(logSpy).not.toHaveBeenCalled();
  });
});
