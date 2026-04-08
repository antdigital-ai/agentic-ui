/**
 * useMarkdownInputFieldStyles Hook 测试
 */

import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useMarkdownInputFieldStyles } from '../useMarkdownInputFieldStyles';

describe('useMarkdownInputFieldStyles', () => {
  const baseParams = {
    toolsRender: undefined,
    maxHeight: undefined,
    style: {},
    attachment: undefined,
    isEnlarged: false,
    rightPadding: 0,
    topRightPadding: 0,
    quickRightOffset: 0,
    totalActionCount: 2,
    isMultiRowLayout: false,
  };

  it('当 hasEnlargeAction 和 hasRefineAction 均为 true 且无 style.minHeight 时应返回 computedMinHeight 140', () => {
    const { result } = renderHook(() =>
      useMarkdownInputFieldStyles({
        ...baseParams,
        hasEnlargeAction: true,
        hasRefineAction: true,
      }),
    );

    expect(result.current.computedMinHeight).toBe(140);
  });
});
