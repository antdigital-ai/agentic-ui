import { describe, expect, it, vi } from 'vitest';
import { getRemoteMediaType } from '../media';

describe('media getRemoteMediaType 分支覆盖', () => {
  it('空 / 非字符串 / data url', async () => {
    expect(await getRemoteMediaType('')).toBe('other');
    expect(await getRemoteMediaType(1 as any)).toBe('other');
    expect(await getRemoteMediaType('data:image/png;base64,x')).toBe('image');
    expect(await getRemoteMediaType('data:video/mp4;base64,x')).toBe('video');
    expect(await getRemoteMediaType('data:audio/mp3;base64,x')).toBe('audio');
    expect(await getRemoteMediaType('data:application/pdf;base64,x')).toBe(
      'other',
    );
  });

  it('已知扩展名短路；HEAD 成功取 content-type', async () => {
    expect(await getRemoteMediaType('https://a.com/a.png')).toBe('image');

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'video/mp4' },
    });
    vi.stubGlobal('fetch', fetchMock);
    expect(await getRemoteMediaType('https://a.com/unknown')).toBe('video');
    vi.unstubAllGlobals();
  });

  it('HEAD 失败返回 null', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, headers: { get: () => null } }),
    );
    expect(await getRemoteMediaType('https://a.com/unknown2')).toBeNull();
    vi.unstubAllGlobals();
  });

  it('data url 无 mime 返回 other；fetch 抛错返回 null', async () => {
    expect(await getRemoteMediaType('data:;base64,abc')).toBe('other');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    expect(await getRemoteMediaType('https://a.com/noext')).toBeNull();
    vi.unstubAllGlobals();
  });
});
