/**
 * media residual：content-type 空串；HEAD 后 abort 定时器清理。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRemoteMediaType } from '../media';

describe('media residual branches', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllTimers();
    vi.unstubAllGlobals();
  });

  it.skip('HEAD 成功但 content-type 空 → 空主类型', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => '' },
      }),
    );
    const p = getRemoteMediaType('https://cdn.test/noext');
    await vi.runAllTimersAsync();
    expect(await p).toBe('');
  });

  it.skip('已知扩展不发 fetch', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    expect(await getRemoteMediaType('https://x.test/a.jpeg')).toBe('image');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
