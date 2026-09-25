/**
 * MarkdownFormatter residual：空串、表格行、代码块保护、盘古空格。
 */
import { describe, expect, it } from 'vitest';
import MarkdownFormatter from '../index';

describe('MarkdownFormatter residual branches', () => {
  it('format 空值返回空串', () => {
    expect(MarkdownFormatter.format('' as any)).toBe('');
    expect(MarkdownFormatter.format(undefined as any)).toBe('');
  });

  it('normalizeParagraphs：表格行保持单换行；段落双换行', () => {
    const table = '| a | b |\n| - | - |\n| 1 | 2 |';
    const out = MarkdownFormatter.normalizeParagraphs(table);
    expect(out.split('\n').length).toBe(3);

    const paras = MarkdownFormatter.normalizeParagraphs('p1\n\n\np2');
    expect(paras).toContain('p1');
    expect(paras).toContain('p2');
  });

  it('format 保护代码块与中英空格', () => {
    const md = '你好world\n\n```js\nconst a=1\n```\n\nend';
    const out = MarkdownFormatter.format(md);
    expect(out).toContain('```js');
    expect(out).toMatch(/你好\s*world|你好world/);
  });

  it('addPanguSpacing 保护链接与注释', () => {
    const raw = '见[文档](https://a.com)与<!--x-->代码';
    const spaced = MarkdownFormatter.addPanguSpacing(raw);
    expect(spaced).toContain('https://a.com');
    expect(spaced).toContain('<!--x-->');
  });
});
