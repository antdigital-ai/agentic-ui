import { describe, expect, it } from 'vitest';
import { createJinjaPlugin, jinjaPlugin } from '../jinja';

describe('createJinjaPlugin', () => {
  it('returns plugin with jinja: true when called without options', () => {
    const plugin = createJinjaPlugin();
    expect(plugin.jinja).toBe(true);
    expect(plugin.jinjaConfig).toBeUndefined();
  });

  it('returns plugin with jinjaConfig when called with options', () => {
    const plugin = createJinjaPlugin({
      docLink: 'https://example.com/jinja',
    });
    expect(plugin.jinja).toBe(true);
    expect(plugin.jinjaConfig).toBeDefined();
    expect(plugin.jinjaConfig!.enable).toBe(true);
    expect(plugin.jinjaConfig!.docLink).toBe('https://example.com/jinja');
  });

  it('always sets enable: true in jinjaConfig (options cannot override)', () => {
    const plugin = createJinjaPlugin({
      docLink: 'https://custom.doc',
      templatePanel: { trigger: '{{', enable: true },
    });
    expect(plugin.jinjaConfig!.enable).toBe(true);
  });

  it('merges options into jinjaConfig with enable: true', () => {
    const plugin = createJinjaPlugin({
      docLink: 'https://custom.doc',
      templatePanel: { trigger: '{{', enable: true },
    });
    expect(plugin.jinjaConfig!.enable).toBe(true);
    expect(plugin.jinjaConfig!.docLink).toBe('https://custom.doc');
    expect(plugin.jinjaConfig!.templatePanel).toEqual({
      trigger: '{{',
      enable: true,
    });
  });
});

describe('jinjaPlugin', () => {
  it('is default instance from createJinjaPlugin()', () => {
    expect(jinjaPlugin.jinja).toBe(true);
    expect(jinjaPlugin).toEqual(createJinjaPlugin());
  });
});
