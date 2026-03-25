import { describe, expect, it } from 'vitest';
import { markdownToHtml, markdownToHtmlSync } from '../markdownToHtml';

describe('markdownToHtml', () => {
  it('时间与行内 :icon 共存时应稳定输出 HTML（不抛错；仅解析 ::: 容器，行内指令保持原文）', async () => {
    const markdown = '创建时间 2026-03-18 02:20:31，状态 :icon[done]';
    const html = await markdownToHtml(markdown);

    expect(html).not.toBe('');
    expect(html).toContain('创建时间 2026-03-18 02:20');
    expect(html).toContain(':icon[done]');
    expect(html).toContain('done');
    // remarkDirectiveContainersOnly 不解析行内 :foo，避免 02:20:31 等被误解析为指令
    expect(html).not.toMatch(/directive-\d+/);
  });

  it('markdownToHtmlSync 对块级 ::badge 在未启用全文 directive 时保持原文', () => {
    const markdown = '::badge[ready]';
    const html = markdownToHtmlSync(markdown);

    expect(html).toContain('ready');
    expect(html).toContain('::badge');
  });

  it('openLinksInNewTab 开启时应为链接追加 target 与 rel', () => {
    const html = markdownToHtmlSync('[官网](https://example.com)', undefined, {
      openLinksInNewTab: true,
    });

    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
});
