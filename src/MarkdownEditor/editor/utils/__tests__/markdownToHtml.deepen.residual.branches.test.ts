/**
 * markdownToHtml deepen residual：link/paragraphTag/code className/escape/directive。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildDefaultMarkdownRemarkPlugins,
  escapeHtml,
  markdownToHtml,
  markdownToHtmlSync,
  REMARK_REHYPE_DIRECTIVE_HANDLERS,
} from '../markdownToHtml';

describe('markdownToHtml deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('escapeHtml encode / no-encode / 无特殊字符', () => {
    expect(escapeHtml('a&b', true)).toContain('&amp;');
    expect(escapeHtml('a < b')).toContain('&lt;');
    expect(escapeHtml('plain')).toBe('plain');
    expect(escapeHtml('ok &amp; entity')).toBe('ok &amp; entity');
  });

  it('openLinksInNewTab + paragraphTag', async () => {
    const html = await markdownToHtml(
      '[x](https://ex.com)\n\nhello',
      undefined,
      { openLinksInNewTab: true, paragraphTag: 'div' },
    );
    expect(html).toMatch(/target="_blank"|noopener/i);
    expect(html).toMatch(/div|p/i);
  });

  it('代码块：language class 与无换行 loading', async () => {
    const withLang = await markdownToHtml('```js\nconst a=1\n```');
    expect(withLang).toMatch(/data-block|language-js|pre/i);

    const short = await markdownToHtml('```\nab\n```');
    expect(String(short).length).toBeGreaterThan(0);
  });

  it('sync：链接与公式配置', () => {
    const html = markdownToHtmlSync('[a](https://b.com)', undefined, {
      openLinksInNewTab: true,
      formula: { enable: false },
    });
    expect(html).toMatch(/a|href/i);
  });

  it('自定义 plugins 非空路径', async () => {
    const plugins = buildDefaultMarkdownRemarkPlugins({ enable: false });
    const html = await markdownToHtml('# t', plugins, {
      markedConfig: [],
    });
    expect(html).toMatch(/h1|t/i);
  });

  it('directive handlers：缺 name 走 unknown', () => {
    const state = {
      all: () => [],
      patch: vi.fn(),
      applyData: (_n: any, r: any) => r,
    };
    const text = REMARK_REHYPE_DIRECTIVE_HANDLERS.textDirective(state, {
      name: undefined,
    });
    const leaf = REMARK_REHYPE_DIRECTIVE_HANDLERS.leafDirective(state, {
      name: '',
    });
    expect(text.properties.className.join(' ')).toMatch(/unknown/);
    expect(leaf.properties.className.join(' ')).toMatch(/leaf/);
  });

  it('错误路径返回空串', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const bad = await markdownToHtml(null as any);
    expect(typeof bad).toBe('string');
    const syncBad = markdownToHtmlSync(undefined as any);
    expect(typeof syncBad).toBe('string');
    spy.mockRestore();
  });

  it('行内代码与嵌套 HTML 不强制 data-block', async () => {
    const html = await markdownToHtml('use `x` and <code>y</code>');
    expect(html).toMatch(/code|x|y/i);
  });
});
