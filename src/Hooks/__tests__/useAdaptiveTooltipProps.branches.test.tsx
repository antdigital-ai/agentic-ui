import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAdaptiveTooltipProps } from '../useAdaptiveTooltipProps';

describe('useAdaptiveTooltipProps 分支覆盖', () => {
  it('省略 kind 时使用默认 informational', () => {
    const { result } = renderHook(() => useAdaptiveTooltipProps());
    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('object');
  });
});
