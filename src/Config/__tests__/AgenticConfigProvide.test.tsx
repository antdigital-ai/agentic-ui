import { renderHook } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { AgenticConfigProvide, useFormulaConfig } from '../AgenticConfigProvide';
import {
  getRemarkMathOptions,
  resetGlobalFormulaConfig,
} from '../formulaConfig';

describe('AgenticConfigProvide', () => {
  afterEach(() => {
    resetGlobalFormulaConfig();
  });

  it('应同步 Provider 公式配置到 Hook 与全局解析配置，并在卸载时重置', () => {
    const { result, unmount } = renderHook(() => useFormulaConfig(), {
      wrapper: ({ children }) => (
        <AgenticConfigProvide formula={{ enable: false }}>
          {children}
        </AgenticConfigProvide>
      ),
    });

    expect(result.current).toEqual({
      enable: false,
      singleDollarTextMath: false,
    });
    expect(getRemarkMathOptions()).toBeNull();

    unmount();

    expect(getRemarkMathOptions()).toEqual({ singleDollarTextMath: false });
  });

  it('应允许局部公式配置覆盖 Provider 配置', () => {
    const { result } = renderHook(
      () => useFormulaConfig({ enable: true, singleDollarTextMath: true }),
      {
        wrapper: ({ children }) => (
          <AgenticConfigProvide formula={{ enable: false }}>
            {children}
          </AgenticConfigProvide>
        ),
      },
    );

    expect(result.current).toEqual({
      enable: true,
      singleDollarTextMath: true,
    });
    expect(getRemarkMathOptions()).toBeNull();
  });
});
