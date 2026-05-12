import { renderHook } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { useStyle } from '../style';

/**
 * 回归用：BubbleList 的 genStyle 与 resetComponent 在 styleFn 返回数组里
 * 必须保持 `[genStyle, resetComponent]` 的顺序 —— resetComponent 后写，
 * 其 `padding: 0` 才能在 CSS 级联里盖过 genStyle 的 `padding: var(--padding-6x)`。
 *
 * 迁移到 genStyleHooks 时如把顺序写反，BubbleList 容器会出现 24px 内边距，
 * 破坏既有视觉。该测试通过校验注入到 document.head 的样式串里、
 * 同一组件 selector 下 `padding: 0` 出现在 `padding: var(--padding-6x)` 之后，
 * 直接锁死级联顺序。
 */
describe('BubbleList style 级联顺序', () => {
  it('resetComponent 的 padding: 0 应出现在 genStyle 的 padding 之后', () => {
    const prefixCls = 'agentic-bubble-list-regression';
    renderHook(() => useStyle(prefixCls), {
      wrapper: ({ children }) => <ConfigProvider>{children}</ConfigProvider>,
    });

    const cssText = Array.from(document.head.querySelectorAll('style'))
      .map((el) => el.textContent ?? '')
      .filter((t) => t.includes(prefixCls))
      .join('\n');

    expect(cssText).toContain(prefixCls);
    const genStyleIdx = cssText.indexOf('padding:var(--padding-6x)');
    const resetIdx = cssText.lastIndexOf('padding:0');
    expect(genStyleIdx).toBeGreaterThanOrEqual(0);
    expect(resetIdx).toBeGreaterThanOrEqual(0);
    expect(resetIdx).toBeGreaterThan(genStyleIdx);
  });
});
