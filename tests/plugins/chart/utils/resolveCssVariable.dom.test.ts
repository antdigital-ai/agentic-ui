import { describe, expect, it, vi } from 'vitest';
import { resolveCssVariable } from '../../../../src/Plugins/chart/utils';

describe('resolveCssVariable DOM 解析', () => {
  it('应解析 CSS 变量并写入缓存', () => {
    const originalGetComputedStyle = window.getComputedStyle;
    const originalCreateElement = document.createElement;
    const mockAppend = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation(() => document.body);
    const mockRemove = vi
      .spyOn(document.body, 'removeChild')
      .mockImplementation(() => document.body);

    (window.getComputedStyle as any) = vi.fn().mockReturnValue({
      color: 'rgb(29, 122, 252)',
    });
    (document.createElement as any) = vi
      .fn()
      .mockImplementation((tag: string) => {
        const el = originalCreateElement.call(document, tag);
        el.style.color = '';
        return el;
      });

    const result1 = resolveCssVariable('var(--color-blue)');
    const result2 = resolveCssVariable('var(--color-blue)');

    expect(result1).toBe('#1d7afc');
    expect(result2).toBe('#1d7afc');

    (window.getComputedStyle as any) = originalGetComputedStyle;
    (document.createElement as any) = originalCreateElement;
    mockAppend.mockRestore();
    mockRemove.mockRestore();
  });
});
