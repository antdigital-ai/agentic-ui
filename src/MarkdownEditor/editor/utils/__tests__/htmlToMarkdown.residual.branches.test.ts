/**
 * htmlToMarkdown residual：空输入、Word 检测/清理、isHtml、batch。
 */
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

describe('htmlToMarkdown residual branches', () => {
  it('htmlToMarkdown：空/非字符串；基础标签', () => {
    expect(htmlToMarkdown('')).toBe('');
    expect(htmlToMarkdown(null as any)).toBe('');
    expect(htmlToMarkdown('<p>Hi <strong>b</strong></p>')).toMatch(/Hi/);
    expect(htmlToMarkdown('<a href="https://x">L</a>')).toContain('https://x');
  });

  it('isWordHtml / cleanWordHtml 矩阵', () => {
    expect(isWordHtml('')).toBe(false);
    expect(
      isWordHtml('<meta name="Generator" content="Microsoft Word 15">'),
    ).toBe(true);
    expect(isWordHtml('<p class="MsoNormal">x</p>')).toBe(true);
    expect(isWordHtml('<o:p></o:p>')).toBe(true);
    expect(cleanWordHtml('')).toBe('');
    expect(cleanWordHtml('<o:p>x</o:p>&nbsp;<span class="MsoX">y</span>')).toMatch(
      /x|y/,
    );
  });

  it('cleanHtml / isHtml / extractText / batch', () => {
    expect(cleanHtml('  <p>  a  </p>  ')).toContain('<p>');
    expect(isHtml('')).toBe(false);
    expect(isHtml('plain')).toBe(false);
    expect(isHtml('<div>x</div>')).toBe(true);
    expect(extractTextFromHtml('<p>Hello</p>')).toContain('Hello');
    expect(batchHtmlToMarkdown(['<p>a</p>', ''])).toEqual(
      expect.arrayContaining([expect.any(String), '']),
    );
  });
});
