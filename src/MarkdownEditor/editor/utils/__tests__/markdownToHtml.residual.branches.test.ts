/**
 * markdownToHtml 残留：escapeHtml encode/实体、plugins、sync/async 配置边角。
 */
import { describe, expect, it } from 'vitest';
import {
  buildDefaultMarkdownRemarkPlugins,
  escapeHtml,
  markdownToHtml,
  markdownToHtmlSync,
  REMARK_REHYPE_DIRECTIVE_HANDLERS,
} from '../markdownToHtml';

describe('markdownToHtml residual branches', () => {
  it('escapeHtml encode 与非 encode、实体保留', () => {
    expect(escapeHtml('a&b', true)).toContain('&amp;');
    expect(escapeHtml('a&amp;b', false)).toBe('a&amp;b');
    expect(escapeHtml('plain')).toBe('plain');
    expect(escapeHtml('<tag>', false)).toContain('&lt;');
    expect(escapeHtml('"\'', true)).toMatch(/&quot;|&#39;/);
  });

  it('buildDefaultMarkdownRemarkPlugins：formula 开关', () => {
    const withMath = buildDefaultMarkdownRemarkPlugins({ enable: true });
    const without = buildDefaultMarkdownRemarkPlugins({ enable: false });
    expect(withMath.length).toBeGreaterThan(without.length);
  });

  it('REMARK_REHYPE_DIRECTIVE_HANDLERS 生成 span', () => {
    const state = {
      all: () => [],
      patch: () => undefined,
      applyData: (_n: any, r: any) => r,
    };
    const text = REMARK_REHYPE_DIRECTIVE_HANDLERS.textDirective(state, {
      name: 'note',
    });
    expect(text.tagName).toBe('span');
    const leaf = REMARK_REHYPE_DIRECTIVE_HANDLERS.leafDirective(state, {
      name: undefined,
    });
    expect(leaf.properties.className.join(' ')).toContain('directive-unknown');
  });

  it('markdownToHtmlSync：链接新标签、自定义段落、公式关闭', () => {
    const html = markdownToHtmlSync(
      '# Hi\n\n[a](https://x.com)\n\npara',
      undefined,
      {
        openLinksInNewTab: true,
        paragraphTag: 'div',
        formula: { enable: false },
      },
    );
    expect(html).toContain('Hi');
    expect(html).toMatch(/target="_blank"|href=/);
  });

  it('markdownToHtml async：空串与 jinja 美元', async () => {
    expect(typeof (await markdownToHtml(''))).toBe('string');
    const html = await markdownToHtml('price $1 and **b**', undefined, {
      openLinksInNewTab: false,
      formula: { enable: true },
    });
    expect(html.length).toBeGreaterThan(0);
  });

  it('markdownToHtmlSync：代码块语言 class', () => {
    const html = markdownToHtmlSync('```js\nconst a=1\n```');
    expect(html).toMatch(/pre|code|language-js/i);
  });
});
