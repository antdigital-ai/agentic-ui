import { describe, expect, it } from 'vitest';
import {
  batchHtmlToMarkdown,
  cleanHtml,
  extractTextFromHtml,
  htmlToMarkdown,
  isHtml,
} from '../htmlToMarkdown';

describe('htmlToMarkdown', () => {
  it('returns empty string for empty input', () => {
    expect(htmlToMarkdown('')).toBe('');
    expect(htmlToMarkdown(null as any)).toBe('');
  });

  it('converts headings', () => {
    expect(htmlToMarkdown('<h1>Title</h1>')).toContain('# Title');
    expect(htmlToMarkdown('<h2>Sub</h2>')).toContain('## Sub');
    expect(htmlToMarkdown('<h3>H3</h3>')).toContain('### H3');
    expect(htmlToMarkdown('<h4>H4</h4>')).toContain('#### H4');
    expect(htmlToMarkdown('<h5>H5</h5>')).toContain('##### H5');
    expect(htmlToMarkdown('<h6>H6</h6>')).toContain('###### H6');
  });

  it('converts paragraph', () => {
    expect(htmlToMarkdown('<p>Hello</p>')).toContain('Hello');
  });

  it('converts bold and italic', () => {
    expect(htmlToMarkdown('<strong>bold</strong>')).toContain('**bold**');
    expect(htmlToMarkdown('<b>bold</b>')).toContain('**bold**');
    expect(htmlToMarkdown('<em>italic</em>')).toContain('*italic*');
    expect(htmlToMarkdown('<i>italic</i>')).toContain('*italic*');
  });

  it('converts strikethrough', () => {
    expect(htmlToMarkdown('<del>deleted</del>')).toContain('~~deleted~~');
    expect(htmlToMarkdown('<s>deleted</s>')).toContain('~~deleted~~');
  });

  it('converts inline code', () => {
    expect(htmlToMarkdown('<code>code</code>')).toContain('`code`');
  });

  it('converts code block with language', () => {
    const result = htmlToMarkdown(
      '<pre><code class="language-js">var x = 1;</code></pre>',
    );
    expect(result).toContain('```js');
    expect(result).toContain('var x = 1;');
  });

  it('converts code block without language', () => {
    const result = htmlToMarkdown('<pre>plain code</pre>');
    expect(result).toContain('```');
    expect(result).toContain('plain code');
  });

  it('converts blockquote', () => {
    expect(htmlToMarkdown('<blockquote>quote</blockquote>')).toContain(
      '> quote',
    );
  });

  it('converts unordered list', () => {
    const result = htmlToMarkdown('<ul><li>a</li><li>b</li></ul>');
    expect(result).toContain('- a');
    expect(result).toContain('- b');
  });

  it('converts ordered list', () => {
    const result = htmlToMarkdown('<ol><li>a</li><li>b</li></ol>');
    expect(result).toContain('1. a');
    expect(result).toContain('2. b');
  });

  it('converts links', () => {
    expect(
      htmlToMarkdown('<a href="https://example.com">link</a>'),
    ).toContain('[link](https://example.com)');
  });

  it('converts images', () => {
    expect(
      htmlToMarkdown('<img src="https://example.com/img.png" alt="alt" />'),
    ).toContain('![alt](https://example.com/img.png)');
  });

  it('converts images with title', () => {
    expect(
      htmlToMarkdown(
        '<img src="https://example.com/img.png" alt="alt" title="title" />',
      ),
    ).toContain('![alt](https://example.com/img.png "title")');
  });

  it('converts table', () => {
    const html =
      '<table><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table>';
    const result = htmlToMarkdown(html);
    expect(result).toContain('| A | B |');
    expect(result).toContain('| --- | --- |');
    expect(result).toContain('| 1 | 2 |');
  });

  it('converts hr', () => {
    expect(htmlToMarkdown('<hr />')).toContain('---');
  });

  it('converts br', () => {
    expect(htmlToMarkdown('a<br/>b')).toContain('\n');
  });

  it('converts div', () => {
    expect(htmlToMarkdown('<div>content</div>')).toContain('content');
  });

  it('converts span', () => {
    expect(htmlToMarkdown('<span>text</span>')).toContain('text');
  });

  it('handles unknown tags', () => {
    expect(htmlToMarkdown('<custom>text</custom>')).toContain('text');
  });

  it('preserves comments when option is set', () => {
    const result = htmlToMarkdown('<div><!-- comment -->text</div>', {
      preserveComments: true,
    });
    expect(result).toContain('text');
  });

  it('strips comments by default', () => {
    const result = htmlToMarkdown('<div><!-- comment -->text</div>');
    expect(result).toContain('text');
  });

  it('uses custom link handler', () => {
    const result = htmlToMarkdown('<a href="url">text</a>', {
      linkHandler: (href, text) => `[custom:${text}](${href})`,
    });
    expect(result).toContain('[custom:text](url)');
  });

  it('uses custom image handler', () => {
    const result = htmlToMarkdown('<img src="url" alt="alt" />', {
      imageHandler: (src, alt) => `[img:${alt}](${src})`,
    });
    expect(result).toContain('[img:alt](url)');
  });
});

describe('isHtml', () => {
  it('returns false for empty string', () => {
    expect(isHtml('')).toBe(false);
    expect(isHtml('   ')).toBe(false);
  });

  it('returns true for HTML tags', () => {
    expect(isHtml('<p>hello</p>')).toBe(true);
    expect(isHtml('<div>')).toBe(true);
  });

  it('returns false for non-HTML', () => {
    expect(isHtml('just text')).toBe(false);
  });
});

describe('cleanHtml', () => {
  it('removes extra whitespace', () => {
    expect(cleanHtml('  hello  world  ')).toBe('hello world');
  });

  it('removes whitespace between tags', () => {
    expect(cleanHtml('<p> </p>')).toBe('<p></p>');
  });
});

describe('extractTextFromHtml', () => {
  it('returns empty for empty input', () => {
    expect(extractTextFromHtml('')).toBe('');
  });

  it('extracts text from HTML', () => {
    expect(extractTextFromHtml('<p>hello <b>world</b></p>')).toBe(
      'hello world',
    );
  });
});

describe('batchHtmlToMarkdown', () => {
  it('converts array of HTML fragments', () => {
    const result = batchHtmlToMarkdown(['<p>a</p>', '<p>b</p>']);
    expect(result.length).toBe(2);
    expect(result[0]).toContain('a');
    expect(result[1]).toContain('b');
  });
});
