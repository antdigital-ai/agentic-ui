/**
 * mermaid/utils：主题解析、apply、renderSvg、cleanup 分支。
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  applyMermaidTheme,
  cleanupTempElement,
  createMermaidThemeConfig,
  renderSvgToContainer,
} from '../utils';

describe('mermaid utils branches', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('createMermaidThemeConfig：短 hex / 长 hex / rgb / 无效色 / 默认 light/dark', () => {
    const light = createMermaidThemeConfig({
      colorBgContainer: '#fff',
      colorText: '#111',
    });
    expect(light.darkMode).toBe(false);

    const darkHex = createMermaidThemeConfig({
      colorBgContainer: '#141414',
    });
    expect(darkHex.darkMode).toBe(true);

    const darkRgb = createMermaidThemeConfig({
      colorBgContainer: 'rgb(20, 20, 20)',
    });
    expect(darkRgb.darkMode).toBe(true);

    const viaText = createMermaidThemeConfig({
      colorBgContainer: 'var(--bg)',
      colorText: '#f5f5f5',
    });
    expect(viaText.darkMode).toBe(true);

    const empty = createMermaidThemeConfig();
    expect(empty.darkMode).toBe(false);
    expect(empty.themeVariables.primaryColor).toBeTruthy();

    const withAll = createMermaidThemeConfig({
      colorBgContainer: '#000000',
      colorBgElevated: '#111',
      colorText: '#eee',
      colorTextSecondary: '#ccc',
      colorBorder: '#333',
      colorPrimary: '#ff0000',
      fontFamily: 'Arial',
    });
    expect(withAll.darkMode).toBe(true);
    expect(withAll.themeVariables.fontFamily).toBe('Arial');
  });

  it('applyMermaidTheme：无 initialize / 无 config / 有 config', () => {
    expect(() => applyMermaidTheme({} as any)).not.toThrow();
    const initialize = vi.fn();
    applyMermaidTheme({ initialize } as any);
    expect(initialize).toHaveBeenCalled();
    applyMermaidTheme({ initialize } as any, createMermaidThemeConfig());
    expect(initialize).toHaveBeenCalledTimes(2);
  });

  it('renderSvgToContainer：合法 svg / 内嵌 html / 纯文本回退', () => {
    const container = document.createElement('div');
    renderSvgToContainer('<svg class="a"><g></g></svg>', container);
    expect(container.querySelector('[data-mermaid-svg]')).toBeTruthy();
    expect(container.querySelector('[data-mermaid-wrapper]')).toBeTruthy();
    // foreignObject 等内部节点可能非 SVGElement；至少挂上 svg 标记
    expect(container.querySelector('svg.mermaid-isolated')).toBeTruthy();

    renderSvgToContainer('<div><svg></svg></div>', container);
    expect(container.querySelector('[data-mermaid-svg]')).toBeTruthy();

    renderSvgToContainer('<span>no-svg</span>', container);
    expect(container.innerHTML).toContain('no-svg');
  });

  it('cleanupTempElement：存在/不存在/无 parent', () => {
    cleanupTempElement('missing');
    const el = document.createElement('div');
    el.id = 'dtemp1';
    document.body.appendChild(el);
    cleanupTempElement('temp1');
    expect(document.getElementById('dtemp1')).toBeNull();

    const orphan = document.createElement('div');
    orphan.id = 'dtemp2';
    Object.defineProperty(orphan, 'parentNode', { get: () => null });
    vi.spyOn(document, 'querySelector').mockReturnValue(orphan as any);
    expect(() => cleanupTempElement('temp2')).not.toThrow();
  });
});
