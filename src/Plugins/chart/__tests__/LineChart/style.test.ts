import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useStyle } from '../../LineChart/style';

describe('LineChart style', () => {
  it('useStyle 应返回 hashId', () => {
    const { result } = renderHook(() => useStyle('line-chart'));

    expect(result.current).toBeDefined();
    expect(result.current.hashId).toBeDefined();
  });

  it('应支持无参数调用', () => {
    const { result } = renderHook(() => useStyle());

    expect(result.current).toBeDefined();
  });
});
