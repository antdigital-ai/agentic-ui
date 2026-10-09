import { afterEach, describe, expect, it, vi } from 'vitest';
import { getMediaType } from '../dom';
import { getRemoteMediaType } from '../media';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('media type loading', () => {
  it('releases a stalled HEAD request at its deadline', async () => {
    vi.useFakeTimers();
    let requestSignal: AbortSignal | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, options: RequestInit) => {
        requestSignal = options.signal as AbortSignal;
        // Also exercise transports that do not reject when aborted.
        return new Promise<Response>(() => {});
      }),
    );

    const result = getRemoteMediaType('https://cdn.example/media');
    await vi.advanceTimersByTimeAsync(1000);

    await expect(result).resolves.toBeNull();
    expect(requestSignal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('cleans up the deadline when metadata arrives', async () => {
    vi.useFakeTimers();
    let requestSignal: AbortSignal | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, options: RequestInit) => {
        requestSignal = options.signal as AbortSignal;
        return new Response(null, {
          headers: { 'content-type': ' Video/MP4; charset=utf-8 ' },
        });
      }),
    );

    await expect(getRemoteMediaType('https://cdn.example/media')).resolves.toBe(
      'video',
    );
    expect(vi.getTimerCount()).toBe(0);
    expect(requestSignal?.aborted).toBe(false);
  });

  it('cleans up the deadline after a network failure', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Offline')));

    await expect(
      getRemoteMediaType('https://cdn.example/media'),
    ).resolves.toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    ['https://cdn.example/movie.mp4#t=4', 'video'],
    ['https://cdn.example/music.mp3#start', 'audio'],
    ['https://cdn.example/image.png?token=1#preview', 'image'],
  ])('recognizes %s without probing the network', async (url, type) => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);

    expect(getMediaType(url)).toBe(type);
    await expect(getRemoteMediaType(url)).resolves.toBe(type);
    expect(fetch).not.toHaveBeenCalled();
  });
});
