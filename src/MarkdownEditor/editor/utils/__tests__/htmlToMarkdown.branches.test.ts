import { describe, expect, it } from 'vitest';
import {
  batchHtmlToMarkdown,
  cleanHtml,
  cleanWordHtml,
  extractTextFromHtml,
  htmlToMarkdown,
  isHtml,
  isWordHtml,
} from '../htmlToMarkdown';

describe('htmlToMarkdown 分支覆盖', () => {
  it('htmlToMarkdown 纯文本段落', () => {
    expect(htmlToMarkdown('<p>hello</p>')).toContain('hello');
  });

  it('preserveComments 保留 HTML 注释', () => {
    const result = htmlToMarkdown(
      '<div><!-- note --><p>x</p></div>',
      { preserveComments: true },
    );
    expect(result).toContain('<!-- note -->');
  });

  it('preserveComments false 丢弃注释', () => {
    expect(htmlToMarkdown('<!-- x -->', { preserveComments: false })).toBe('');
  });

  it('linkHandler 自定义链接', () => {
    const result = htmlToMarkdown('<a href="/u">User</a>', {
      linkHandler: (href, text) => `[${text}](${href})!`,
    });
    expect(result).toBe('[User](/u)!');
  });

  it('imageHandler 自定义图片', () => {
    const result = htmlToMarkdown('<img src="/a.png" alt="A" />', {
      imageHandler: (src, alt) => `IMG:${alt}:${src}`,
    });
    expect(result).toBe('IMG:A:/a.png');
  });

  it('图片带 title 属性', () => {
    expect(
      htmlToMarkdown('<img src="/x.png" alt="a" title="t" />'),
    ).toContain('"t"');
  });

  it('有序列表转换', () => {
    const result = htmlToMarkdown('<ol><li>one</li><li>two</li></ol>');
    expect(result).toMatch(/1\. one/);
    expect(result).toMatch(/2\. two/);
  });

  it('无序列表转换', () => {
    expect(htmlToMarkdown('<ul><li>item</li></ul>')).toContain('- item');
  });

  it('空表格返回空字符串', () => {
    expect(htmlToMarkdown('<table></table>')).toBe('');
  });

  it('表格含 th/td', () => {
    const result = htmlToMarkdown(
      '<table><tr><th>H</th></tr><tr><td>D</td></tr></table>',
    );
    expect(result).toContain('| H |');
    expect(result).toContain('| --- |');
  });

  it('cleanHtml 返回字符串', () => {
    const cleaned = cleanHtml('<div><p>ok</p></div>');
    expect(typeof cleaned).toBe('string');
    expect(cleaned).toContain('ok');
  });

  it('isWordHtml 检测 Word 标记', () => {
    expect(isWordHtml('xmlns:o="urn:schemas-microsoft-com:office:office"')).toBe(
      true,
    );
    expect(isWordHtml('<p>plain</p>')).toBe(false);
  });

  it('cleanWordHtml 清理 Word 冗余', () => {
    const result = cleanWordHtml(
      '<p class="MsoNormal"><span>text</span></p>',
    );
    expect(result).toContain('text');
  });

  it('isHtml 检测 HTML 标签', () => {
    expect(isHtml('<div>x</div>')).toBe(true);
    expect(isHtml('plain text')).toBe(false);
  });

  it('extractTextFromHtml 提取纯文本', () => {
    expect(extractTextFromHtml('<b>bold</b> text')).toContain('bold');
  });

  it('batchHtmlToMarkdown 批量转换', () => {
    const results = batchHtmlToMarkdown(['<p>a</p>', '<p>b</p>']);
    expect(results).toHaveLength(2);
    expect(results[0]).toContain('a');
  });

  it('preserveLineBreaks br 换行', () => {
    const result = htmlToMarkdown('<p>line1<br/>line2</p>', {
      preserveLineBreaks: true,
    });
    expect(result).toMatch(/line1/);
    expect(result).toMatch(/line2/);
  });
});
