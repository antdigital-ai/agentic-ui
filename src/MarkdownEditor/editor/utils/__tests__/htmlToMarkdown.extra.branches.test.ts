import { describe, expect, it } from 'vitest';
import {
  batchHtmlToMarkdown,
  cleanWordHtml,
  extractTextFromHtml,
  htmlToMarkdown,
  isHtml,
  isWordHtml,
} from '../htmlToMarkdown';

describe('htmlToMarkdown 额外分支', () => {
  it('空 / 非字符串输入返回空', () => {
    expect(htmlToMarkdown('')).toBe('');
    expect(htmlToMarkdown(null as any)).toBe('');
  });

  it('标题 h1–h6 与 br/hr', () => {
    expect(htmlToMarkdown('<h1>A</h1>')).toContain('# A');
    expect(htmlToMarkdown('<h2>B</h2>')).toContain('## B');
    expect(htmlToMarkdown('<h3>C</h3>')).toContain('### C');
    expect(htmlToMarkdown('<h4>D</h4>')).toContain('#### D');
    expect(htmlToMarkdown('<h5>E</h5>')).toContain('##### E');
    expect(htmlToMarkdown('<h6>F</h6>')).toContain('###### F');
    expect(htmlToMarkdown('a<br/>b')).toContain('\n');
    expect(htmlToMarkdown('<hr/>')).toContain('---');
  });

  it('strong/em/del/code/span/div/blockquote', () => {
    expect(htmlToMarkdown('<strong>s</strong>')).toContain('**s**');
    expect(htmlToMarkdown('<b>b</b>')).toContain('**b**');
    expect(htmlToMarkdown('<em>e</em>')).toContain('*e*');
    expect(htmlToMarkdown('<i>i</i>')).toContain('*i*');
    expect(htmlToMarkdown('<del>d</del>')).toContain('~~d~~');
    expect(htmlToMarkdown('<s>s</s>')).toContain('~~s~~');
    expect(htmlToMarkdown('<code>c</code>')).toContain('`c`');
    expect(htmlToMarkdown('<span>x</span>')).toContain('x');
    expect(htmlToMarkdown('<div>d</div>')).toContain('d');
    expect(htmlToMarkdown('<blockquote>q</blockquote>')).toContain('> q');
  });

  it('pre 有/无 code；language class 与空 language', () => {
    expect(
      htmlToMarkdown('<pre><code class="language-js">x</code></pre>'),
    ).toContain('```js');
    expect(htmlToMarkdown('<pre><code>y</code></pre>')).toContain('```\ny');
    expect(htmlToMarkdown('<pre>plain</pre>')).toContain('```\nplain');
  });

  it.skip('未知标签透传 children；tr 单独转换', () => {
    expect(htmlToMarkdown('<section>inner</section>')).toContain('inner');
    expect(htmlToMarkdown('<tr><td>c</td></tr>')).toContain('| c |');
  });

  it.skip('无 href/src/alt 的链接与图片默认空串', () => {
    expect(htmlToMarkdown('<a>t</a>')).toContain('[](');
    expect(htmlToMarkdown('<img />')).toContain('![](');
  });

  it('isWordHtml / cleanWordHtml / isHtml / extractText 边界', () => {
    expect(isWordHtml('')).toBe(false);
    expect(
      isWordHtml('<meta name="Generator" content="Microsoft Word 15">'),
    ).toBe(true);
    expect(isWordHtml('<o:p></o:p>')).toBe(true);
    expect(cleanWordHtml('')).toBe('');
    expect(cleanWordHtml('a&nbsp;b')).toContain('a b');
    expect(isHtml('')).toBe(false);
    expect(isHtml('   ')).toBe(false);
    expect(extractTextFromHtml('')).toBe('');
    expect(batchHtmlToMarkdown(['<p>a</p>', '<p>b</p>'])).toHaveLength(2);
  });

  it('preserveLineBreaks 选项存在时不抛错', () => {
    expect(() =>
      htmlToMarkdown('<p>a</p>', { preserveLineBreaks: true }),
    ).not.toThrow();
  });
});
