/**
 * htmlToMarkdown deepen5：空 alt/textContent、extractText 空 body、isHtml/cleanHtml。
 */
import { describe, expect, it } from 'vitest';
import {
  cleanHtml,
  extractTextFromHtml,
  htmlToMarkdown,
  isHtml,
  isWordHtml,
} from '../htmlToMarkdown';

describe('htmlToMarkdown deepen5 residual branches', () => {
  it('img 无 alt；pre/code 空 textContent', () => {
    expect(htmlToMarkdown('<img src="a.png">')).toContain('![](a.png)');
    expect(
      htmlToMarkdown('<pre><code class="language-js"></code></pre>'),
    ).toMatch(/```js\n\n```/);
    expect(htmlToMarkdown('<pre></pre>')).toMatch(/```\n\n```/);
  });

  it('extractTextFromHtml 空文档与纯文本', () => {
    expect(extractTextFromHtml('')).toBe('');
    expect(extractTextFromHtml('<div></div>')).toBe('');
    expect(extractTextFromHtml('<p>x</p>')).toBe('x');
  });

  it('isHtml / isWordHtml / cleanHtml 边界', () => {
    expect(isHtml('')).toBe(false);
    expect(isHtml('   ')).toBe(false);
    expect(isHtml('<b>x</b>')).toBe(true);
    expect(isWordHtml('')).toBe(false);
    expect(isWordHtml('<p class="MsoNormal">x</p>')).toBe(true);
    expect(cleanHtml('  <a>  <b>  </b>  </a>  ')).toContain('<a><b>');
  });
});
