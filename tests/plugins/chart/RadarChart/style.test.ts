import { renderHook } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { useStyle } from '../../../../src/Plugins/chart/RadarChart/style';

describe('RadarChart style', () => {
  it('useStyle 应返回 wrapSSR 与 hashId', () => {
    const { result } = renderHook(() => useStyle('radar-chart'));

    expect(result.current).toBeDefined();
    expect(result.current.wrapSSR).toBeDefined();
    expect(result.current.hashId).toBeDefined();
    expect(typeof result.current.wrapSSR).toBe('function');
  });

  it('应支持无参数调用', () => {
    const { result } = renderHook(() => useStyle());

    expect(result.current).toBeDefined();
  });

  it('wrapSSR 应能包装节点', () => {
    const { result } = renderHook(() => useStyle('radar-chart'));
    expect(result.current.wrapSSR(React.createElement('div', null, 'test'))).toBeDefined();
  });
});
