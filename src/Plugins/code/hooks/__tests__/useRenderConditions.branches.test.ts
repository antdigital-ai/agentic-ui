/**
 * useRenderConditions：html && isConfig 隐藏分支。
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useRenderConditions } from '../useRenderConditions';

describe('useRenderConditions branches', () => {
  it('html + isConfig 时 shouldHideConfigHtml 为 true', () => {
    const element = {
      type: 'code',
      language: 'html',
      isConfig: true,
      children: [{ text: '' }],
    } as any;
    const { result } = renderHook(() =>
      useRenderConditions(element, false),
    );
    expect(result.current.shouldHideConfigHtml).toBe(true);
    expect(result.current.shouldRenderAsCodeEditor).toBe(false);
  });
});
