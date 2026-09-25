/**
 * useRenderConditions deepen：language=think 且 readonly 命中 && 右侧。
 */
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useRenderConditions } from '../useRenderConditions';

describe('useRenderConditions deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('think + readonly 渲染思考块', () => {
    const { result } = renderHook(() =>
      useRenderConditions({ language: 'think' } as any, true),
    );
    expect(result.current.shouldRenderAsThinkBlock).toBe(true);
    expect(result.current.shouldRenderAsCodeEditor).toBe(false);
  });

  it('think + 非 readonly 不渲染思考块', () => {
    const { result } = renderHook(() =>
      useRenderConditions({ language: 'think' } as any, false),
    );
    expect(result.current.shouldRenderAsThinkBlock).toBe(false);
    expect(result.current.shouldRenderAsCodeEditor).toBe(true);
  });
});
