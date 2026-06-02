import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useStyle } from '../../AreaChart/style';

describe('AreaChart style', () => {
  it('useStyle 应返回 hashId', () => {
    const { result } = renderHook(() => useStyle('area-chart'));

    expect(result.current).toBeDefined();
    expect(result.current.hashId).toBeDefined();
  });

  it('应支持无参数调用', () => {
    const { result } = renderHook(() => useStyle());

    expect(result.current).toBeDefined();
  });
});
