/**
 * AgenticConfigProvide：formula 有无、context ?? {}、useFormulaConfig override。
 */
import { render, renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  AgenticConfigProvide,
  useAgenticConfig,
  useFormulaConfig,
} from '../AgenticConfigProvide';
import {
  getRemarkMathOptions,
  isFormulaEnabled,
  resetGlobalFormulaConfig,
} from '../formulaConfig';

describe('AgenticConfigProvide branches', () => {
  afterEach(() => {
    resetGlobalFormulaConfig();
  });

  it('无 formula 时重置全局并提供空配置', () => {
    const Probe = () => {
      const cfg = useAgenticConfig();
      return <span data-testid="f">{String(!!cfg.formula)}</span>;
    };
    const { getByTestId, unmount } = render(
      <AgenticConfigProvide>
        <Probe />
      </AgenticConfigProvide>,
    );
    expect(getByTestId('f').textContent).toBe('false');
    expect(isFormulaEnabled()).toBe(true);
    unmount();
  });

  it('有 formula 时写入全局并在卸载时重置', () => {
    const { unmount } = render(
      <AgenticConfigProvide formula={{ enable: false }}>
        <span>ok</span>
      </AgenticConfigProvide>,
    );
    expect(isFormulaEnabled()).toBe(false);
    expect(getRemarkMathOptions()).toBeNull();
    unmount();
    expect(isFormulaEnabled()).toBe(true);
  });

  it('useAgenticConfig 在 Provider 外返回 {}', () => {
    const { result } = renderHook(() => useAgenticConfig());
    expect(result.current).toEqual({});
  });

  it('useFormulaConfig override 覆盖 context', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AgenticConfigProvide formula={{ enable: true, singleDollarTextMath: true }}>
        {children}
      </AgenticConfigProvide>
    );
    const { result } = renderHook(
      () => useFormulaConfig({ enable: false }),
      { wrapper },
    );
    expect(result.current.enable).toBe(false);
  });
});
