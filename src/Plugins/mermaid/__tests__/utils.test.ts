import { describe, expect, it, vi } from 'vitest';
import {
  applyMermaidTheme,
  cleanupTempElement,
  createMermaidThemeConfig,
  renderSvgToContainer,
} from '../utils';

describe('createMermaidThemeConfig', () => {
  it('creates light theme by default', () => {
    const config = createMermaidThemeConfig();
    expect(config.darkMode).toBe(false);
    expect(config.themeVariables.mainBkg).toContain('#');
  });

  it('detects dark mode from dark background', () => {
    const config = createMermaidThemeConfig({
      colorBgContainer: '#141414',
    });
    expect(config.darkMode).toBe(true);
  });

  it('detects dark mode from light text color', () => {
    const config = createMermaidThemeConfig({
      colorText: '#ffffff',
    });
    expect(config.darkMode).toBe(true);
  });

  it('uses provided tokens', () => {
    const config = createMermaidThemeConfig({
      colorBgContainer: '#ffffff',
      colorBgElevated: '#fafafa',
      colorText: '#1f1f1f',
      colorTextSecondary: '#595959',
      colorBorder: '#d9d9d9',
      colorPrimary: '#1890ff',
      fontFamily: 'Arial',
    });
    expect(config.themeVariables.primaryColor).toBe('#1890ff');
    expect(config.themeVariables.fontFamily).toBe('Arial');
  });

  it('handles short hex colors', () => {
    const config = createMermaidThemeConfig({
      colorBgContainer: '#fff',
    });
    expect(config.darkMode).toBe(false);
  });

  it('handles rgb colors', () => {
    const config = createMermaidThemeConfig({
      colorBgContainer: 'rgb(20, 20, 20)',
    });
    expect(config.darkMode).toBe(true);
  });

  it('handles rgba colors', () => {
    const config = createMermaidThemeConfig({
      colorBgContainer: 'rgba(255, 255, 255, 0.9)',
    });
    expect(config.darkMode).toBe(false);
  });

  it('handles unparseable colors', () => {
    const config = createMermaidThemeConfig({
      colorBgContainer: 'not-a-color',
    });
    expect(config).toBeDefined();
  });

  it('generates cache key', () => {
    const config = createMermaidThemeConfig();
    expect(config.cacheKey).toBeTruthy();
    expect(typeof config.cacheKey).toBe('string');
  });
});

describe('applyMermaidTheme', () => {
  it('handles null api', () => {
    applyMermaidTheme(null as any);
  });

  it('handles api without initialize', () => {
    applyMermaidTheme({} as any);
  });

  it('initializes without theme config', () => {
    const api = { initialize: vi.fn() };
    applyMermaidTheme(api as any);
    expect(api.initialize).toHaveBeenCalledWith({ startOnLoad: false });
  });

  it('initializes with theme config', () => {
    const api = { initialize: vi.fn() };
    const config = createMermaidThemeConfig();
    applyMermaidTheme(api as any, config);
    expect(api.initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'base',
        darkMode: config.darkMode,
      }),
    );
  });
});

describe('renderSvgToContainer', () => {
  it('renders valid SVG into container', () => {
    const container = document.createElement('div');
    renderSvgToContainer('<svg><rect/></svg>', container);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('handles invalid SVG content', () => {
    const container = document.createElement('div');
    renderSvgToContainer('not svg', container);
    expect(container.querySelector('[data-mermaid-wrapper]')).toBeTruthy();
  });

  it('handles SVG wrapped in HTML', () => {
    const container = document.createElement('div');
    renderSvgToContainer('<div><svg><rect/></svg></div>', container);
    expect(container.querySelector('[data-mermaid-wrapper]')).toBeTruthy();
  });
});

describe('cleanupTempElement', () => {
  it('removes existing temp element', () => {
    const el = document.createElement('div');
    el.id = 'dtemp-id';
    document.body.appendChild(el);
    cleanupTempElement('temp-id');
    expect(document.querySelector('#dtemp-id')).toBeNull();
  });

  it('handles non-existent element', () => {
    cleanupTempElement('non-existent');
  });
});
