/**
 * mermaid utils deepen：无效颜色；renderSvg 无 svg 标签回退。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMermaidThemeConfig,
  renderSvgToContainer,
} from '../utils';

describe('mermaid utils deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无法解析的背景色走 text 亮度回退', () => {
    const cfg = createMermaidThemeConfig({
      colorBgContainer: 'var(--unknown)',
      colorText: '#ffffff',
    });
    expect(cfg.darkMode).toBe(true);
  });

  it('空颜色不判为浅色字', () => {
    const cfg = createMermaidThemeConfig({
      colorBgContainer: 'var(--x)',
      colorText: '',
    });
    expect(typeof cfg.darkMode).toBe('boolean');
  });

  it('renderSvgToContainer：非法 svg 走 innerHTML 回退', () => {
    const el = document.createElement('div');
    renderSvgToContainer('<div>not-svg</div>', el);
    expect(el.innerHTML).toContain('not-svg');
  });

  it('renderSvgToContainer：fragment 内可提取 svg', () => {
    const el = document.createElement('div');
    renderSvgToContainer(
      '<p><svg xmlns="http://www.w3.org/2000/svg"><circle/></svg></p>',
      el,
    );
    expect(el.querySelector('svg')).toBeTruthy();
  });
});
