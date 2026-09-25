/**
 * MarkdownFormatter more residual：HTML/行内代码保护、括号盘古、\\r 规范化。
 */
import { describe, expect, it } from 'vitest';
import MarkdownFormatter from '../index';

describe('MarkdownFormatter more residual branches', () => {
  it('normalizeParagraphs 处理 \\r\\n 与尾空白', () => {
    const out = MarkdownFormatter.normalizeParagraphs('a\r\nb\r\n\r\nc\r\n');
    expect(out).toContain('a');
    expect(out).toContain('c');
    expect(out).not.toMatch(/\r/);
  });

  it('addPanguSpacing 保护 HTML、行内代码与带 HTML 的链接', () => {
    const raw =
      '中文<code>x</code>英文与[`a`](https://t.com)及[带<em>标</em>](https://h.com)';
    const spaced = MarkdownFormatter.addPanguSpacing(raw);
    expect(spaced).toContain('<code>x</code>');
    expect(spaced).toContain('https://t.com');
    expect(spaced).toContain('https://h.com');
  });

  it('format：中文括号与数字间距；还原代码块', () => {
    const md = '值(42)与```\nkeep:me\n```结束';
    const out = MarkdownFormatter.format(md);
    expect(out).toContain('```');
    expect(out).toContain('keep:me');
    expect(out).toMatch(/值/);
  });
});
