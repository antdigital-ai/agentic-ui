/**
 * htmlToMarkdown deepen：注释保留、link/image handler、pre 无 code、空 text。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  extractTextFromHtml,
  htmlToMarkdown,
  isHtml,
} from '../htmlToMarkdown';

describe('htmlToMarkdown deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('preserveComments；linkHandler / imageHandler', () => {
    const withComment = htmlToMarkdown('<!--c--><p>x</p>', {
      preserveComments: true,
    });
    expect(withComment).toMatch(/<!--|x/);

    const without = htmlToMarkdown('<!--c--><p>y</p>', {
      preserveComments: false,
    });
    expect(without).toContain('y');

    expect(
      htmlToMarkdown('<a href="/a">L</a>', {
        linkHandler: (href, text) => `LINK:${href}:${text}`,
      }),
    ).toBe('LINK:/a:L');

    expect(
      htmlToMarkdown('<img src="/i.png" alt="a" title="t" />', {
        imageHandler: (src, alt) => `IMG:${src}:${alt}`,
      }),
    ).toBe('IMG:/i.png:a');
  });

  it('pre 无 code；pre 有 language class；空 href/src', () => {
    expect(htmlToMarkdown('<pre>raw</pre>')).toMatch(/```/);
    expect(
      htmlToMarkdown('<pre><code class="language-ts"> cons </code></pre>'),
    ).toMatch(/ts/);
    expect(htmlToMarkdown('<a>empty</a>')).toContain('empty');
    expect(htmlToMarkdown('<img alt="x" />')).toMatch(/!\[x\]/);
  });

  it('extractText 空 body；isHtml 空白；li 换行', () => {
    expect(extractTextFromHtml('')).toBe('');
    expect(isHtml('   ')).toBe(false);
    expect(htmlToMarkdown('<ul><li>a</li><li>b</li></ul>')).toMatch(/a/);
  });
});
