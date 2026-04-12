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

  it('markdownToHtmlSync 对块级 ::badge 规范化为 :::badge 容器指令', () => {
    const markdown = '::badge[ready]';
    const html = markdownToHtmlSync(markdown);

    expect(html).toContain('ready');
    expect(html).toContain('markdown-container');
    expect(html).toContain('badge');
  });

  it('::warning … ::: 关闭符生成 warning 容器', () => {
    const html = markdownToHtmlSync('::warning\n内容\n:::');

    expect(html).toContain('markdown-container');
    expect(html).toContain('warning');
    expect(html).toContain('内容');
  });

  it('::warning … :: 关闭符与 ::: 关闭符输出等价', () => {
    const htmlTriple = markdownToHtmlSync('::warning\ncontent\n:::');
    const htmlDouble = markdownToHtmlSync('::warning\ncontent\n::');

    expect(htmlDouble).toBe(htmlTriple);
  });

  it('::info 生成 info 类容器', () => {
    const html = markdownToHtmlSync('::info\n提示\n::');

    expect(html).toContain('markdown-container');
    expect(html).toContain('info');
    expect(html).toContain('提示');
  });

  it('行内 ::warning 不触发容器（非行首）', () => {
    const html = markdownToHtmlSync('文本 ::warning 行内双冒号');

    expect(html).not.toContain('markdown-container');
    expect(html).toContain('::warning');
  });

  it('原始 issue 场景：含路径与日志行的 ::warning 块正确生成容器', () => {
    const md = [
      '::warning',
      'No API key found for provider "anthropic". Auth store: /home/node/.openclaw/agents/main/agent/auth-profiles.json',
      'Logs: openclaw logs --follow',
      '',
      '::',
    ].join('\n');
    const html = markdownToHtmlSync(md);

    expect(html).toContain('markdown-container');
    expect(html).toContain('warning');
    expect(html).toContain('No API key found');
    expect(html).toContain('openclaw');
  });

  it('openLinksInNewTab 开启时应为链接追加 target 与 rel', () => {
    const html = markdownToHtmlSync('[官网](https://example.com)', undefined, {
      openLinksInNewTab: true,
    });

    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('converts code block with language', () => {
    const html = markdownToHtmlSync('```javascript\nvar x = 1;\n```');
    expect(html).toContain('language-javascript');
  });

  it('converts frontmatter', () => {
    const html = markdownToHtmlSync('---\ntitle: Test\n---\nContent');
    expect(html).toContain('Content');
  });

  it('converts math blocks', () => {
    const html = markdownToHtmlSync('$x^2$');
    expect(html).toBeTruthy();
  });

  it('handles GFM table rendering', () => {
    const md = '| A | B |\n|---|---|\n| 1 | 2 |';
    const html = markdownToHtmlSync(md);
    expect(html).toContain('<table>');
    expect(html).toContain('<th>');
  });

  it('handles GFM strikethrough', () => {
    const html = markdownToHtmlSync('~~deleted~~');
    expect(html).toContain('<del>');
  });

  it('converts paragraph tag with custom config', () => {
    const html = markdownToHtmlSync('hello', undefined, {
      paragraphTag: 'div',
    });
    expect(html).toContain('hello');
  });

  it('handles empty input', () => {
    const html = markdownToHtmlSync('');
    expect(html).toBe('');
  });

  it('converts code block without newline (loading state)', () => {
    const html = markdownToHtmlSync('```js\nvar x = 1\n```');
    expect(html).toBeTruthy();
  });

  it('handles marked config', () => {
    const fakePlugin = () => (tree: any) => tree;
    const html = markdownToHtmlSync('test', undefined, {
      markedConfig: [[fakePlugin as any, {}]],
    });
    expect(html).toContain('test');
  });

  it('handles marked config as single function', () => {
    const fakePlugin = () => (tree: any) => tree;
    const html = markdownToHtmlSync('test', undefined, {
      markedConfig: [fakePlugin as any],
    });
    expect(html).toContain('test');
  });
});
