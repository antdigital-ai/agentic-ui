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
});
