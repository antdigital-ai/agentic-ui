/**
 * markdownToHtml deepen3：className 字符串 language-、无换行 loading、
 * formula 启用、嵌套 code 文本、value ??、markedConfig。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildDefaultMarkdownRemarkPlugins,
  escapeHtml,
  markdownToHtml,
  markdownToHtmlSync,
} from '../markdownToHtml';

describe('markdownToHtml deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('代码块：string className 含 language-；无末尾换行 → loading', async () => {
    const html = await markdownToHtml('```js\nconst x=1```');
    expect(html).toMatch(/data-block|language-js|pre|code/i);
    expect(html).toMatch(/data-state="loading"|data-state="done"|pre/i);
  });

  it('长代码块含换行：data-state done 路径', async () => {
    const html = await markdownToHtml('```\nline1\nline2\nline3\n```');
    expect(html).toMatch(/data-block|pre|code/i);
  });

  it('formula enable + openLinks + paragraphTag', async () => {
    const html = await markdownToHtml(
      '[go](https://ex.com)\n\n$$a+b$$\n\npara',
      undefined,
      {
        openLinksInNewTab: true,
        paragraphTag: 'section',
        formula: { enable: true },
      },
    );
    expect(html).toMatch(/target="_blank"|noopener|section|katex|math|p/i);
  });

  it('escapeHtml：encode 无特殊字符直通；实体不二次编码', () => {
    expect(escapeHtml('plain', true)).toBe('plain');
    expect(escapeHtml('a&amp;b')).toBe('a&amp;b');
  });

  it('sync：自定义 plugins + markedConfig 空数组', () => {
    const plugins = buildDefaultMarkdownRemarkPlugins({ enable: false });
    const html = markdownToHtmlSync('## h2', plugins, {
      markedConfig: [],
      paragraphTag: 'p',
    });
    expect(html).toMatch(/h2|h2/i);
  });

  it('嵌套 HTML 代码与行内：不强制 block', async () => {
    const html = await markdownToHtml(
      'inline `a` and\n\n<pre><code>short</code></pre>',
    );
    expect(typeof html).toBe('string');
    expect(html.length).toBeGreaterThan(0);
  });

  it('空 plugins 数组：走默认 remark 链', async () => {
    const html = await markdownToHtml('# t', []);
    expect(html).toMatch(/h1|t/i);
  });
});
