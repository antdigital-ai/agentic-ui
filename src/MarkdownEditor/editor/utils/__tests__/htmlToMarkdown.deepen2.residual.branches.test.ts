/**
 * htmlToMarkdown deepen2：h1–h6、hr、del/s、空表、tr 行、未知节点、preserveLineBreaks。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { htmlToMarkdown, isHtml } from '../htmlToMarkdown';

describe('htmlToMarkdown deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('标题 h1–h6 与 hr / del / s / strong / em', () => {
    expect(htmlToMarkdown('<h1>A</h1>')).toMatch(/^# A/);
    expect(htmlToMarkdown('<h2>B</h2>')).toMatch(/^## B/);
    expect(htmlToMarkdown('<h3>C</h3>')).toMatch(/^### C/);
    expect(htmlToMarkdown('<h4>D</h4>')).toMatch(/#### D/);
    expect(htmlToMarkdown('<h5>E</h5>')).toMatch(/##### E/);
    expect(htmlToMarkdown('<h6>F</h6>')).toMatch(/###### F/);
    expect(htmlToMarkdown('<hr/>')).toContain('---');
    expect(htmlToMarkdown('<del>x</del>')).toContain('~~x~~');
    expect(htmlToMarkdown('<s>y</s>')).toContain('~~y~~');
    expect(htmlToMarkdown('<b>z</b>')).toContain('**z**');
    expect(htmlToMarkdown('<i>w</i>')).toContain('*w*');
  });

  it('空 table 返回空；有表头与数据行；单独 tr', () => {
    expect(htmlToMarkdown('<table></table>').trim()).toBe('');
    const md = htmlToMarkdown(
      '<table><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table>',
    );
    expect(md).toMatch(/A/);
    expect(md).toMatch(/1/);
    expect(htmlToMarkdown('<tr><td>only</td></tr>')).toMatch(/only/);
  });

  it('ol 有序列表；blockquote；br；div；code', () => {
    expect(htmlToMarkdown('<ol><li>one</li><li>two</li></ol>')).toMatch(/1\./);
    expect(htmlToMarkdown('<blockquote>q</blockquote>')).toMatch(/>/);
    expect(htmlToMarkdown('a<br/>b')).toMatch(/a/);
    expect(htmlToMarkdown('<div>d</div>')).toContain('d');
    expect(htmlToMarkdown('<code>c</code>')).toContain('`c`');
  });

  it('img 带 title；无 title；isHtml 真值', () => {
    expect(
      htmlToMarkdown('<img src="/x.png" alt="n" title="t" />'),
    ).toMatch(/"t"/);
    expect(htmlToMarkdown('<img src="/y.png" alt="n" />')).toMatch(/!\[n\]/);
    expect(isHtml('<p>hi</p>')).toBe(true);
  });

  it('preserveLineBreaks 与未知标签透传子节点', () => {
    const md = htmlToMarkdown('<span>inner</span><custom>x</custom>', {
      preserveLineBreaks: true,
    });
    expect(md).toMatch(/inner|x/);
  });
});
