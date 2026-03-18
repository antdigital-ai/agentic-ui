import { describe, expect, it } from 'vitest';
import { markdownToHtml, markdownToHtmlSync } from '../markdownToHtml';

describe('markdownToHtml', () => {
  it('应正确处理包含 time 文本与 textDirective 的内容', async () => {
    const markdown = '创建时间 2026-03-18 02:20:31，状态 :icon[done]';
    const html = await markdownToHtml(markdown);

    expect(html).toContain('02:20:31');
    expect(html).toContain('done');
    expect(html).toContain('directive-icon');
  });

  it('markdownToHtmlSync 应正确处理 leafDirective 语法', () => {
    const markdown = '::badge[ready]';
    const html = markdownToHtmlSync(markdown);

    expect(html).toContain('ready');
    expect(html).toContain('directive-badge');
  });

  it('openLinksInNewTab 开启时应为链接追加 target 与 rel', () => {
    const html = markdownToHtmlSync(
      '[官网](https://example.com)',
      undefined,
      { openLinksInNewTab: true },
    );

    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
});
