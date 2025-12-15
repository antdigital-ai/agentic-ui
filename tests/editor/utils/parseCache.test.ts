import { beforeEach, describe, expect, it } from 'vitest';
import {
  findHtmlClosingTagEnd,
  findHtmlCommentEnd,
  findHtmlTagInfo,
  getFenceLength,
  ParseCache,
  shouldProtectSeparator,
  splitMarkdownIntoBlocks,
} from '../../../src/MarkdownEditor/editor/parser/parseCache';
import type { Elements } from '../../../src/MarkdownEditor/el';

describe('parseCache', () => {
  describe('ParseCache', () => {
    let parseCache: ParseCache;
    let mockElements: Elements[];

    beforeEach(() => {
      parseCache = new ParseCache();
      mockElements = [{ type: 'paragraph', children: [{ text: 'test' }] }];
    });

    it('should initialize with empty cache', () => {
      expect(parseCache.size()).toBe(0);
    });

    it('should set and get cache entries', () => {
      const markdown = '# Hello World';
      parseCache.set(markdown, mockElements);

      expect(parseCache.size()).toBe(1);
      expect(parseCache.get(markdown)).toEqual(mockElements);
    });

    it('should return null for non-existent entries', () => {
      const markdown = '# Hello World';
      expect(parseCache.get(markdown)).toBeNull();
    });

    it('should check if entry exists', () => {
      const markdown = '# Hello World';
      expect(parseCache.has(markdown)).toBe(false);

      parseCache.set(markdown, mockElements);
      expect(parseCache.has(markdown)).toBe(true);
    });

    it('should clear all cache entries', () => {
      parseCache.set('# Hello', mockElements);
      parseCache.set('# World', mockElements);

      expect(parseCache.size()).toBe(2);

      parseCache.clear();
      expect(parseCache.size()).toBe(0);
      expect(parseCache.get('# Hello')).toBeNull();
      expect(parseCache.get('# World')).toBeNull();
    });
  });

  describe('splitMarkdownIntoBlocks', () => {
    it('should return empty array for empty input', () => {
      expect(splitMarkdownIntoBlocks('')).toEqual([]);
      expect(splitMarkdownIntoBlocks(null as any)).toEqual([]);
      expect(splitMarkdownIntoBlocks(undefined as any)).toEqual([]);
    });

    it('should split basic markdown by double newlines', () => {
      const markdown = `# Title

Paragraph 1

Paragraph 2`;

      const result = splitMarkdownIntoBlocks(markdown);
      expect(result).toEqual(['# Title', 'Paragraph 1', 'Paragraph 2']);
    });

    it('should protect code blocks from splitting', () => {
      const markdown = `# Title

\`\`\`javascript
const x = 1;

const y = 2;
\`\`\`

Paragraph after code`;

      const result = splitMarkdownIntoBlocks(markdown);
      expect(result).toEqual([
        '# Title',
        '```javascript\nconst x = 1;\n\nconst y = 2;\n```',
        'Paragraph after code',
      ]);
    });

    it('should handle tilde fenced code blocks', () => {
      const markdown = `# Title

~~~python
def func():
    pass

    return True
~~~

Paragraph after code`;

      const result = splitMarkdownIntoBlocks(markdown);
      expect(result).toEqual([
        '# Title',
        '~~~python\ndef func():\n    pass\n\n    return True\n~~~',
        'Paragraph after code',
      ]);
    });

    it('should protect HTML comments from splitting', () => {
      const markdown = `# Title

<!-- This is a comment

with multiple lines -->

Paragraph after comment`;

      const result = splitMarkdownIntoBlocks(markdown);
      expect(result).toEqual([
        '# Title',
        '<!-- This is a comment\n\nwith multiple lines -->',
        'Paragraph after comment',
      ]);
    });

    it('should protect HTML tags from splitting', () => {
      const markdown = `# Title

<div>
  <p>Paragraph 1</p>

  <p>Paragraph 2</p>
</div>

Paragraph after div`;

      const result = splitMarkdownIntoBlocks(markdown);
      expect(result).toEqual([
        '# Title',
        '<div>\n  <p>Paragraph 1</p>\n\n  <p>Paragraph 2</p>\n</div>',
        'Paragraph after div',
      ]);
    });

    it('should handle self-closing HTML tags', () => {
      const markdown = `# Title

<img src="test.jpg" />

Paragraph after image`;

      const result = splitMarkdownIntoBlocks(markdown);
      expect(result).toEqual([
        '# Title',
        '<img src="test.jpg" />',
        'Paragraph after image',
      ]);
    });

    it('should protect separators when HTML comment is followed by table', () => {
      const markdown = `# Title

<!-- This is a comment -->
| Column 1 | Column 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |

Paragraph after table`;

      const result = splitMarkdownIntoBlocks(markdown);
      expect(result).toEqual([
        '# Title',
        '<!-- This is a comment -->\n| Column 1 | Column 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |',
        'Paragraph after table',
      ]);
    });

    it('should protect separators when current block contains table rows', () => {
      const markdown = `# Title

| Column 1 | Column 2 |
| -------- | -------- |

| Cell 1   | Cell 2   |

Paragraph after table`;

      const result = splitMarkdownIntoBlocks(markdown);
      expect(result).toEqual([
        '# Title',
        '| Column 1 | Column 2 |\n| -------- | -------- |\n\n| Cell 1   | Cell 2   |',
        'Paragraph after table',
      ]);
    });

    it('should handle nested HTML tags', () => {
      const markdown = `# Title

<div>
  <span>
    Nested content

    More content
  </span>
</div>

Paragraph after nested tags`;

      const result = splitMarkdownIntoBlocks(markdown);
      expect(result).toEqual([
        '# Title',
        '<div>\n  <span>\n    Nested content\n\n    More content\n  </span>\n</div>',
        'Paragraph after nested tags',
      ]);
    });

    it('should handle mismatched HTML tags gracefully', () => {
      const markdown = `# Title

<div>
  Content

</span>

Paragraph after mismatched tags`;

      const result = splitMarkdownIntoBlocks(markdown);
      expect(result).toEqual([
        '# Title',
        '<div>\n  Content\n\n</span>\n\nParagraph after mismatched tags',
      ]);
    });

    it('should filter out empty blocks', () => {
      const markdown = `# Title



Paragraph 1



Paragraph 2`;

      const result = splitMarkdownIntoBlocks(markdown);
      expect(result).toEqual(['# Title', 'Paragraph 1', 'Paragraph 2']);
    });
  });

  describe('getFenceLength', () => {
    it('should return correct fence length for backticks', () => {
      const markdown = '```javascript';
      expect(getFenceLength(markdown, 0, '`')).toBe(3);
    });

    it('should return correct fence length for tildes', () => {
      const markdown = '~~~~python';
      expect(getFenceLength(markdown, 0, '~')).toBe(4);
    });

    it('should return 0 for non-matching characters', () => {
      const markdown = '```javascript';
      expect(getFenceLength(markdown, 0, '~')).toBe(0);
    });

    it('should handle edge case at end of string', () => {
      const markdown = '```';
      expect(getFenceLength(markdown, 0, '`')).toBe(3);
    });
  });

  describe('findHtmlCommentEnd', () => {
    it('should find the end of a valid HTML comment', () => {
      const markdown = '<!-- This is a comment -->';
      expect(findHtmlCommentEnd(markdown, 0)).toBe(26);
    });

    it('should return -1 for invalid HTML comment start', () => {
      const markdown = '<!- This is not a comment -->';
      expect(findHtmlCommentEnd(markdown, 0)).toBe(-1);
    });

    it('should return -1 when comment is not closed', () => {
      const markdown = '<!-- This is not closed';
      expect(findHtmlCommentEnd(markdown, 0)).toBe(-1);
    });
  });

  describe('findHtmlTagInfo', () => {
    it('should find opening tag information', () => {
      const markdown = '<div class="test">';
      const result = findHtmlTagInfo(markdown, 0);
      expect(result).toEqual({
        name: 'div',
        end: 18,
        isSelfClosing: false,
      });
    });

    it('should find self-closing tag information', () => {
      const markdown = '<img src="test.jpg" />';
      const result = findHtmlTagInfo(markdown, 0);
      expect(result).toEqual({
        name: 'img',
        end: 22,
        isSelfClosing: true,
      });
    });

    it('should return null for closing tag', () => {
      const markdown = '</div>';
      const result = findHtmlTagInfo(markdown, 0);
      expect(result).toBeNull();
    });

    it('should return null for non-tag content', () => {
      const markdown = 'This is not a tag';
      const result = findHtmlTagInfo(markdown, 0);
      expect(result).toBeNull();
    });

    it('should return null for empty tag name', () => {
      const markdown = '<>'; // Edge case
      const result = findHtmlTagInfo(markdown, 0);
      expect(result).toBeNull();
    });
  });

  describe('findHtmlClosingTagEnd', () => {
    it('should find the end of a matching closing tag', () => {
      const markdown = '</div>';
      expect(findHtmlClosingTagEnd(markdown, 0, 'div')).toBe(6);
    });

    it('should find the end of a closing tag with whitespace', () => {
      const markdown = '</div  >';
      expect(findHtmlClosingTagEnd(markdown, 0, 'div')).toBe(8);
    });

    it('should return -1 for non-matching tag names', () => {
      const markdown = '</span>';
      expect(findHtmlClosingTagEnd(markdown, 0, 'div')).toBe(-1);
    });

    it('should return -1 for invalid closing tag start', () => {
      const markdown = '<div>';
      expect(findHtmlClosingTagEnd(markdown, 0, 'div')).toBe(-1);
    });
  });

  describe('shouldProtectSeparator', () => {
    it('should return true when HTML comment is followed by table row', () => {
      // 在实际处理中，当遇到分隔符时，currentBlock 应该已经包含了 HTML 注释
      const markdown = 'A\n\n<!-- comment -->\n| table |';
      // currentBlock 应该是在处理完 HTML 注释后的状态
      const currentBlock = 'A\n\n<!-- comment -->';
      // separatorIndex 应该是指向 \n\n 的第一个 \n 的位置
      // 'A\n\n<!-- comment -->' 后面是 \n\n，所以 separatorIndex 是 18
      expect(shouldProtectSeparator(markdown, 18, currentBlock)).toBe(true);
    });

    it('should return true when current block contains table rows', () => {
      const markdown =
        'A\n\n| col1 | col2 |\n| ---- | ---- |\n\n| cell1 | cell2 |';
      const currentBlock = 'A\n\n| col1 | col2 |\n| ---- | ---- |';
      // 在索引 1 处是第一个 \n\n
      expect(shouldProtectSeparator(markdown, 1, currentBlock)).toBe(true);
    });

    it('should return false when no protection condition is met', () => {
      const markdown = 'A\n\nParagraph 1\n\nParagraph 2';
      const currentBlock = 'Paragraph 1';
      expect(shouldProtectSeparator(markdown, 1, currentBlock)).toBe(false);
    });

    it('should return false when next line is not a table row', () => {
      const markdown = 'A\n\n<!-- comment -->\nNormal text';
      const currentBlock = '<!-- comment -->';
      expect(shouldProtectSeparator(markdown, 1, currentBlock)).toBe(false);
    });
  });
});
