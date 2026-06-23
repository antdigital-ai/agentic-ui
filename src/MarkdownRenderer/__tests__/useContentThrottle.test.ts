import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useContentThrottle } from '../useContentThrottle';
import { installRafStub } from './installRafStub';

describe('useContentThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    installRafStub();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('applies updated throttle options when streaming content is unchanged', async () => {
    const { result, rerender } = renderHook(
      ({ charsPerFrame }) =>
        useContentThrottle('abcdef', true, { charsPerFrame }, false),
      { initialProps: { charsPerFrame: 1 } },
    );

    expect(result.current).toBe('');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(16);
    });
    expect(result.current).toBe('a');

    await act(async () => {
      rerender({ charsPerFrame: 5 });
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(16);
    });

    expect(result.current).toBe('abcdef');
  });

  it('returns full content immediately when stream is already finished', () => {
    const { result } = renderHook(() =>
      useContentThrottle('finished content', true, { charsPerFrame: 1 }, true),
    );

    expect(result.current).toBe('finished content');
  });

  it('flushes remaining content when stream finishes mid-throttle', async () => {
    const { result, rerender } = renderHook(
      ({ isFinished }) =>
        useContentThrottle('abcdef', true, { charsPerFrame: 1 }, isFinished),
      { initialProps: { isFinished: false } },
    );

    expect(result.current).toBe('');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(16);
    });
    expect(result.current).toBe('a');

    await act(async () => {
      rerender({ isFinished: true });
    });

    expect(result.current).toBe('abcdef');
  });

  it('disposes pending throttle work when disabled', async () => {
    const { result, rerender } = renderHook(
      ({ content, enabled }) =>
        useContentThrottle(content, enabled, { charsPerFrame: 1 }, false),
      {
        initialProps: {
          content: 'abcdef',
          enabled: true,
        },
      },
    );

    expect(result.current).toBe('');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(16);
    });
    expect(result.current).toBe('a');

    await act(async () => {
      rerender({
        content: 'disabled content',
        enabled: false,
      });
    });

    expect(result.current).toBe('disabled content');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(64);
    });

    expect(result.current).toBe('disabled content');
  });
});
