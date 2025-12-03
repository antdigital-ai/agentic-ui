import { describe, expect, it } from 'vitest';
import { parserMarkdownToSlateNode } from '../parserMarkdownToSlateNode';

import { parserSlateNodeToMarkdown } from '../parserSlateNodeToMarkdown';

describe('parserMarkdownToSlateNode', () => {
  describe('handleParagraph', () => {
    it('should handle simple paragraph', () => {
      const markdown = 'This is a simple paragraph';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [{ text: 'This is a simple paragraph' }],
      });
    });

    it('should parse single dollar inline math into inline-katex node', () => {
      const markdown = 'Inline math $a^2 + b^2 = c^2$ stays inline.';
      const { schema } = parserMarkdownToSlateNode(markdown);

      expect(schema).toHaveLength(1);
      const paragraph = schema[0] as any;
      expect(paragraph.type).toBe('paragraph');

      const inlineKatexNode = paragraph.children.find(
        (child: any) => child?.type === 'inline-katex',
      );
      expect(inlineKatexNode).toMatchObject({
        type: 'inline-katex',
        children: [{ text: 'a^2 + b^2 = c^2' }],
      });

      const numericTextNode = paragraph.children.find(
        (child: any) => child?.text === '$a^2 + b^2 = c^2$',
      );
      expect(numericTextNode).toBeUndefined();
    });

    it('should keep numeric content wrapped in dollars as plain text', () => {
      const markdown = 'Price is $100$ only.';
      const { schema } = parserMarkdownToSlateNode(markdown);

      expect(schema).toHaveLength(1);
      const paragraph = schema[0] as any;
      expect(paragraph.type).toBe('paragraph');

      const inlineKatexNode = paragraph.children.find(
        (child: any) => child?.type === 'inline-katex',
      );
      expect(inlineKatexNode).toBeUndefined();

      const numericParagraphNode = paragraph.children.find(
        (child: any) => child?.type === 'paragraph',
      );
      expect(numericParagraphNode).toBeDefined();
      expect(numericParagraphNode.children).toEqual([{ text: '$100$' }]);
    });

    it('should handle paragraph with bold text', () => {
      const markdown = 'Normal text **bold text** and more';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [
          { text: 'Normal text ' },
          { text: 'bold text', bold: true },
          { text: ' and more' },
        ],
      });
    });

    it('should handle paragraph with italic text', () => {
      const markdown = 'Normal text *italic* text';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [
          { text: 'Normal text ' },
          { text: 'italic', italic: true },
          { text: ' text' },
        ],
      });
    });

    it('should handle paragraph with combined formatting', () => {
      const markdown = 'Normal ***bold and italic*** text';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [
          { text: 'Normal ' },
          { text: 'bold and italic', bold: true, italic: true },
          { text: ' text' },
        ],
      });
    });

    it('should handle paragraph with strikethrough', () => {
      const markdown = 'Normal ~~strikethrough~~ text';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [
          { text: 'Normal ' },
          { text: 'strikethrough', strikethrough: true },
          { text: ' text' },
        ],
      });
    });

    it('should handle paragraph with inline code', () => {
      const markdown = 'Some `inline code` here';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [
          { text: 'Some ' },
          {
            text: 'inline code',
            code: true,
            initialValue: undefined,
            placeholder: undefined,
            tag: false,
          },
          { text: ' here' },
        ],
      });
    });

    it('should handle tag with placeholder', () => {
      const markdown = 'Select `${placeholder:目标场景}`';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      const paragraph = result.schema[0] as any;
      const tagNode = paragraph.children.find(
        (child: any) => child?.tag === true,
      );

      expect(tagNode).toMatchObject({
        code: true,
        tag: true,
        text: ' ',
        placeholder: '目标场景',
        initialValue: undefined,
      });
    });

    it('should handle tag with initialValue', () => {
      const markdown = 'Value `${placeholder:目标场景,initialValue:已选择}`';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      const paragraph = result.schema[0] as any;
      const tagNode = paragraph.children.find(
        (child: any) => child?.tag === true,
      );

      expect(tagNode).toMatchObject({
        code: true,
        tag: true,
        text: '已选择',
        placeholder: '目标场景',
        initialValue: '已选择',
      });
    });

    it('should handle tag with only placeholder (empty text)', () => {
      const markdown = 'Empty `${placeholder:请选择}` tag';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      const paragraph = result.schema[0] as any;
      const tagNode = paragraph.children.find(
        (child: any) => child?.tag === true,
      );

      expect(tagNode).toMatchObject({
        code: true,
        tag: true,
        text: ' ',
        placeholder: '请选择',
        initialValue: undefined,
      });
    });

    it('should handle normal inline code (not tag)', () => {
      const markdown = 'Code `const x = 1` here';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      const paragraph = result.schema[0] as any;
      const codeNode = paragraph.children.find(
        (child: any) => child?.code === true,
      );

      expect(codeNode).toMatchObject({
        code: true,
        tag: false,
        text: 'const x = 1',
        placeholder: undefined,
        initialValue: undefined,
      });
    });
  });

  describe('handleHeading', () => {
    it('should handle different heading levels', () => {
      const markdown = '# Heading 1\n## Heading 2\n### Heading 3';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(3);
      expect(result.schema[0]).toEqual({
        type: 'head',
        level: 1,
        children: [{ text: 'Heading 1' }],
      });
      expect(result.schema[1]).toEqual({
        type: 'head',
        level: 2,
        children: [{ text: 'Heading 2' }],
      });
      expect(result.schema[2]).toEqual({
        type: 'head',
        level: 3,
        children: [{ text: 'Heading 3' }],
      });
    });

    it('should handle heading with formatting', () => {
      const markdown = '## Heading with **bold** text';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'head',
        level: 2,
        children: [
          { text: 'Heading with ' },
          { text: 'bold', bold: true },
          { text: ' text' },
        ],
      });
    });
  });

  describe('handleCode', () => {
    it('should handle code block with language', () => {
      const markdown = '```javascript\nconsole.log("hello");\n```';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      const codeNode = result.schema[0];
      expect(codeNode).toMatchObject({
        type: 'code',
        language: 'javascript',
        render: false,
        isConfig: false,
        value: 'console.log("hello");',
        children: [{ text: 'console.log("hello");' }],
      });
      // 验证 otherProps 存在并包含预期的属性
      expect(codeNode).toHaveProperty('otherProps');
      expect((codeNode as any).otherProps).toMatchObject({
        'data-block': 'true',
      });
    });

    it('should handle code block without language', () => {
      const markdown = '```\nsome code\n```';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      const codeNode = result.schema[0];
      expect(codeNode).toMatchObject({
        type: 'code',
        language: null,
        render: false,
        isConfig: false,
        value: 'some code',
        children: [{ text: 'some code' }],
      });
      // 验证 otherProps 存在并包含预期的属性
      expect(codeNode).toHaveProperty('otherProps');
      expect((codeNode as any).otherProps).toMatchObject({
        'data-block': 'true',
      });
    });

    it('should handle multi-line code block', () => {
      const markdown =
        '```python\ndef hello():\n    print("Hello World")\n    return True\n```';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      const codeNode = result.schema[0];
      expect(codeNode).toMatchObject({
        type: 'code',
        language: 'python',
        render: false,
        isConfig: false,
        value: 'def hello():\n    print("Hello World")\n    return True',
        children: [
          { text: 'def hello():\n    print("Hello World")\n    return True' },
        ],
      });
      // 验证 otherProps 存在并包含预期的属性
      expect(codeNode).toHaveProperty('otherProps');
      expect((codeNode as any).otherProps).toMatchObject({
        'data-block': 'true',
        'data-language': 'python',
      });
    });
  });

  describe('handleBlockquote', () => {
    it('should handle simple blockquote', () => {
      const markdown = '> This is a quote';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'This is a quote' }],
          },
        ],
      });
    });

    it('should handle multi-line blockquote', () => {
      const markdown = '> First line\n> Second line\n> Third line';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'First line\nSecond line\nThird line' }],
          },
        ],
      });
    });

    it('should handle nested blockquotes', () => {
      const markdown = '> First level\n> > Second level\n> > > Third level';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('blockquote');
      expect(result.schema[0].children).toHaveLength(2);
    });
  });

  describe('handleList', () => {
    it('should handle unordered list', () => {
      const markdown = '- First item\n- Second item\n- Third item';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'list',
        order: false,
        start: null,
        task: false,
        children: [
          {
            type: 'list-item',
            checked: null,
            mentions: undefined,
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'First item' }],
              },
            ],
          },
          {
            type: 'list-item',
            checked: null,
            mentions: undefined,
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'Second item' }],
              },
            ],
          },
          {
            type: 'list-item',
            checked: null,
            mentions: undefined,
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'Third item' }],
              },
            ],
          },
        ],
      });
    });

    it('should handle ordered list', () => {
      const markdown = '1. First item\n2. Second item\n3. Third item';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'list',
        order: true,
        start: 1,
        task: false,
        children: [
          {
            type: 'list-item',
            checked: null,
            mentions: undefined,
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'First item' }],
              },
            ],
          },
          {
            type: 'list-item',
            checked: null,
            mentions: undefined,
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'Second item' }],
              },
            ],
          },
          {
            type: 'list-item',
            checked: null,
            mentions: undefined,
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'Third item' }],
              },
            ],
          },
        ],
      });
    });

    it('should handle nested lists', () => {
      const markdown =
        '- Item 1\n  - Nested item 1\n  - Nested item 2\n- Item 2';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('list');
      expect(result.schema[0].children).toHaveLength(2);
    });
  });

  describe('handleImage', () => {
    it('should handle simple image', () => {
      const markdown = '![Alt text](http://example.com/image.jpg)';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'card',
        block: false,
        children: [
          {
            type: 'card-before',
            children: [{ text: '' }],
          },
          {
            type: 'image',
            url: 'http://example.com/image.jpg',
            alt: 'Alt text',
            block: false,
            height: undefined,
            width: undefined,
            mediaType: 'image',
            children: [{ text: '' }],
          },
          {
            type: 'card-after',
            children: [{ text: '' }],
          },
        ],
      });
    });

    it('should handle image with title', () => {
      const markdown =
        '![Alt text](http://example.com/image.jpg "Image Title")';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'card',
        block: false,
        children: [
          {
            type: 'card-before',
            children: [{ text: '' }],
          },
          {
            type: 'image',
            url: 'http://example.com/image.jpg',
            alt: 'Alt text',
            block: false,
            height: undefined,
            width: undefined,
            mediaType: 'image',
            children: [{ text: '' }],
          },
          {
            type: 'card-after',
            children: [{ text: '' }],
          },
        ],
      });
    });
  });

  describe('handleLink', () => {
    it('should handle simple link', () => {
      const markdown = '[Link text](http://example.com)';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [
          {
            text: 'Link text',
            url: 'http://example.com',
          },
        ],
      });
    });

    it('should handle link with title', () => {
      const markdown = '[Link text](http://example.com "Link Title")';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [
          {
            text: 'Link text',
            url: 'http://example.com',
          },
        ],
      });
    });

    it('should handle autolink', () => {
      const markdown = '<http://example.com>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [
          {
            text: 'http://example.com',
            url: 'http://example.com',
          },
        ],
      });
    });
  });

  describe('handleTable', () => {
    it('should handle simple table', () => {
      const markdown =
        '| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('card');
      expect(result.schema[0].children[1].type).toBe('table');
      expect(result.schema[0].children[1].children).toHaveLength(2);
    });

    it('should handle table with alignment', () => {
      const markdown =
        '| Left | Center | Right |\n| :--- | :----: | ----: |\n| L1   | C1     | R1    |';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('card');
      expect(result.schema[0].children[1].type).toBe('table');
      expect(result.schema[0].children[1].children[0].children[0].align).toBe(
        'left',
      );
      expect(result.schema[0].children[1].children[0].children[1].align).toBe(
        'center',
      );
      expect(result.schema[0].children[1].children[0].children[2].align).toBe(
        'right',
      );
    });
  });

  describe('handleThematicBreak', () => {
    it('should handle horizontal rule', () => {
      const markdown = '---';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'hr',
        children: [{ text: '' }],
      });
    });

    it('should handle different horizontal rule styles', () => {
      const markdown = '***\n\n___';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(2);
      expect(result.schema[0].type).toBe('hr');
      expect(result.schema[1].type).toBe('hr');
    });
  });

  describe('handleHTML', () => {
    it('should handle HTML blocks', () => {
      const markdown = '<div>HTML content</div>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        text: 'HTML content',
      });
    });

    it('should handle inline HTML', () => {
      const markdown = 'Text with <em>inline HTML</em> content';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('paragraph');
    });
  });

  describe('handleFrontmatter', () => {
    it('should handle YAML frontmatter', () => {
      const markdown = '---\ntitle: Test\nauthor: John\n---\n\n# Content';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(2);
      expect(result.schema[0]).toEqual({
        type: 'code',
        language: 'yaml',
        frontmatter: true,
        value: 'title: Test\nauthor: John',
        children: [{ text: 'title: Test\nauthor: John' }],
      });
      expect(result.schema[1]).toEqual({
        type: 'head',
        level: 1,
        children: [{ text: 'Content' }],
      });
    });
  });

  describe('mixed content parsing', () => {
    it('should handle complex markdown with multiple elements', () => {
      const markdown = `# Main Title

This is a paragraph with **bold** and *italic* text.

## Subsection

Here's a list:
- Item 1
- Item 2
- Item 3

And a code block:

\`\`\`javascript
function hello() {
  console.log("Hello World");
}
\`\`\`

> This is a blockquote
> with multiple lines

[Link to example](http://example.com)`;

      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema.length).toBeGreaterThan(5);
      expect(result.schema[0].type).toBe('head');
      expect(result.schema[1].type).toBe('paragraph');
      expect(result.schema[2].type).toBe('head');

      // 查找列表
      const listIndex = result.schema.findIndex((node) => node.type === 'list');
      expect(listIndex).toBeGreaterThan(-1);

      // 查找代码块
      const codeIndex = result.schema.findIndex((node) => node.type === 'code');
      expect(codeIndex).toBeGreaterThan(-1);

      // 查找引用
      const blockquoteIndex = result.schema.findIndex(
        (node) => node.type === 'blockquote',
      );
      expect(blockquoteIndex).toBeGreaterThan(-1);
    });

    it('should preserve whitespace and formatting', () => {
      const markdown = 'Text with   multiple   spaces and\n\nnew paragraphs';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(2);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [{ text: 'Text with   multiple   spaces and' }],
      });
      expect(result.schema[1]).toEqual({
        type: 'paragraph',
        children: [{ text: 'new paragraphs' }],
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty markdown', () => {
      const markdown = '';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [{ text: '' }],
      });
    });

    it('should handle only whitespace', () => {
      const markdown = '   \n  \n   ';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [{ text: '' }],
      });
    });

    it('should handle malformed markdown gracefully', () => {
      const markdown =
        '# Heading without content\n\n**Bold without closing\n\n```\nCode without closing';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema.length).toBeGreaterThan(0);
      expect(result.schema[0].type).toBe('head');
    });
  });

  describe('alignment parsing', () => {
    it('should handle alignment comments for paragraphs', () => {
      const markdown =
        '<!--{"align":"center"}-->\nThis is a centered paragraph';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        contextProps: { align: 'center' },
        otherProps: { align: 'center' },
        children: [{ text: 'This is a centered paragraph' }],
      });
    });

    it('should handle alignment comments for headings', () => {
      const markdown = '<!--{"align":"right"}-->\n## Right Aligned Heading';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'head',
        level: 2,
        contextProps: { align: 'right' },
        otherProps: { align: 'right' },
        children: [{ text: 'Right Aligned Heading' }],
      });
    });
  });

  describe('handleMedia', () => {
    it('should handle video tags as media elements', () => {
      const markdown = '<video src="video.mp4" alt="" height="400"/>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('card');
      expect(result.schema[0].children[1].type).toBe('media');
    });

    it('should handle img tags as image elements', () => {
      const markdown = '<img src="image.jpg" alt="" data-align="center"/>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('card');
      expect(result.schema[0].children[1].type).toBe('image');
    });
  });

  describe('handleAttachment', () => {
    it('should handle download links as attachments', () => {
      const markdown =
        '<a href="http://example.com/file.pdf" download data-size="1.2MB">Sample PDF</a>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('attach');
      expect((result.schema[0] as any).url).toBe('http://example.com/file.pdf');
      expect((result.schema[0] as any).name).toBe('Sample PDF');
    });
  });

  describe('handleSchema', () => {
    it('should handle schema code blocks', () => {
      const markdown =
        '```schema\n{\n  "type": "object",\n  "properties": {\n    "name": { "type": "string" }\n  }\n}\n```';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('apaasify');
      expect((result.schema[0] as any).language).toBe('schema');
    });
  });

  describe('handleLinkCard', () => {
    it('should handle link cards as regular links', () => {
      const markdown = '[Example Link](http://example.com "Example Link")';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [
          {
            text: 'Example Link',
            url: 'http://example.com',
          },
        ],
      });
    });
  });

  describe('handleFootnoteDefinition', () => {
    it('should handle footnote definitions', () => {
      const markdown = '[^1]: [Footnote content](http://example.com)';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('footnoteDefinition');
      expect((result.schema[0] as any).identifier).toBe('1');
      expect((result.schema[0] as any).value).toBe('Footnote content');
      expect((result.schema[0] as any).url).toBe('http://example.com');
    });

    it('should handle footnote references', () => {
      const markdown = 'This has a footnote[^1]';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [{ text: 'This has a footnote[^1]' }],
      });
    });
  });

  describe('handleDefinitionList', () => {
    it('should handle definition lists as regular content', () => {
      const markdown = 'Term 1\n: Definition 1\n\nTerm 2\n: Definition 2';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(2);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [{ text: 'Term 1\n: Definition 1' }],
      });
      expect(result.schema[1]).toEqual({
        type: 'paragraph',
        children: [{ text: 'Term 2\n: Definition 2' }],
      });
    });
  });

  describe('special characters and escaping', () => {
    it('should handle escaped characters', () => {
      const markdown = 'Text with \\*escaped\\* asterisks and \\[brackets\\]';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [{ text: 'Text with *escaped* asterisks and [brackets]' }],
      });
    });

    it('should handle unicode characters', () => {
      const markdown = 'Unicode: 你好 🌟 ∑∞≠';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [{ text: 'Unicode: 你好 🌟 ∑∞≠' }],
      });
    });
  });

  describe('handleThinkTag', () => {
    it('should parse <think> tag to think code block', () => {
      const markdown = '<think>深度思考内容</think>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toMatchObject({
        type: 'code',
        language: 'think',
        value: '深度思考内容',
        children: [{ text: '深度思考内容' }],
      });
    });

    it('should parse <think> tag with multiline content', () => {
      const markdown = '<think>第一行思考\n第二行思考\n第三行思考</think>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toMatchObject({
        type: 'code',
        language: 'think',
        value: '第一行思考\n第二行思考\n第三行思考',
      });
    });

    it('should handle <think> tag with nested code block', () => {
      const markdown = `<think>
分析问题：

\`\`\`javascript
console.log('测试代码');
\`\`\`

这是嵌套的代码块
</think>`;
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toMatchObject({
        type: 'code',
        language: 'think',
      });

      // 验证内容包含特殊标记
      const codeNode = result.schema[0] as { value?: string };
      const value = codeNode.value as string;
      expect(value).toContain('【CODE_BLOCK:javascript】');
      expect(value).toContain('【/CODE_BLOCK】');
      expect(value).toContain("console.log('测试代码');");
    });

    it('should handle <think> tag with nested think code block', () => {
      const markdown = `<think>
第一步：理解需求

\`\`\`think
这是嵌套的 think 代码块
\`\`\`

第二步：实现方案
</think>`;
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toMatchObject({
        type: 'code',
        language: 'think',
      });

      // 验证嵌套的 think 代码块被正确转换
      const codeNode = result.schema[0] as { value?: string };
      const value = codeNode.value as string;
      expect(value).toContain('【CODE_BLOCK:think】');
      expect(value).toContain('这是嵌套的 think 代码块');
    });
  });

  describe('handleCustomHtmlTags', () => {
    it('should extract content from non-standard HTML tags (hide tags)', () => {
      const markdown = '<custom>自定义内容</custom>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [{ text: '自定义内容' }],
      });
    });

    it('should extract content from multiple custom tags', () => {
      const markdown = '<foo>内容1</foo> 和 <bar>内容2</bar>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0].type).toBe('paragraph');
      // 验证自定义标签内容被提取
      const text = result.schema[0].children
        .map((child: any) => child.text)
        .join('');
      expect(text).toBe('内容1 和 内容2');
      expect(text).not.toContain('<foo>');
      expect(text).not.toContain('</foo>');
    });

    it('should handle standard HTML tags normally', () => {
      const markdown = '<div>标准 HTML</div>';
      const result = parserMarkdownToSlateNode(markdown);

      // 标准 HTML 标签应该被解析为 HTML 代码块或片段
      expect(result.schema).toHaveLength(1);
      // div 标签会被 htmlToFragmentList 处理
      expect(result.schema[0].type).not.toBe('paragraph');
    });

    it('should extract content from nested custom tags', () => {
      const markdown = '<outer><inner>嵌套内容</inner></outer>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      // 嵌套标签都会被移除，只保留最内层的内容
      const text = result.schema[0].children
        .map((child: any) => child.text)
        .join('');
      expect(text).toBe('嵌套内容');
    });
  });

  describe('handleAnswerTag', () => {
    it('should extract content from <answer> tag (hide tags)', () => {
      const markdown = '<answer>这是答案内容</answer>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [{ text: '这是答案内容' }],
      });
    });

    it('should extract multiline content from <answer> tag', () => {
      const markdown = '<answer>第一行答案\n第二行答案</answer>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [{ text: '第一行答案\n第二行答案' }],
      });
    });

    it('should handle empty <answer> tag', () => {
      const markdown = '<answer></answer>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [{ text: '' }],
      });
    });

    it('should handle both <think> and <answer> tags correctly', () => {
      const markdown = `<think>思考过程</think>

<answer>答案内容</answer>`;
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(2);
      // think 被转换为代码块
      expect(result.schema[0]).toMatchObject({
        type: 'code',
        language: 'think',
        value: '思考过程',
      });
      // answer 只显示内容
      expect(result.schema[1]).toEqual({
        type: 'paragraph',
        children: [{ text: '答案内容' }],
      });
    });

    it('should handle <answer> with special characters', () => {
      const markdown =
        '<answer>答案：这是一个包含特殊字符的答案！@#$%</answer>';
      const result = parserMarkdownToSlateNode(markdown);

      expect(result.schema).toHaveLength(1);
      expect(result.schema[0]).toEqual({
        type: 'paragraph',
        children: [{ text: '答案：这是一个包含特殊字符的答案！@#$%' }],
      });
    });
  });

  describe('round-trip conversion with apaasify', () => {
    it('should maintain apaasify node type through round-trip conversion', () => {
      // 原始 Markdown 字符串，包含 apaasify 代码块
      const originalMarkdown = `好的

\`\`\`apaasify
[
  {
    "componentPath": "CrowdSelectionCard",
    "name": "人群选择卡片",
    "componentProps": {
      "instId": "CRCBANK",
      "data": {
        "itemList": [
          {
            "title": "ap_crowd.crowd_ok15a8z9o_alipay_id_dd",
            "checked": true,
            "id": "ap_crowd.crowd_ok15a8z9o_alipay_id_dd",
            "type": "ODPS_TABLE"
          }
        ]
      }
    }
  }
]
\`\`\``;

      // 第一次转换：Markdown -> AST
      const firstAst = parserMarkdownToSlateNode(originalMarkdown);
      expect(firstAst.schema).toHaveLength(2);
      expect(firstAst.schema[0].type).toBe('paragraph');
      expect(firstAst.schema[1].type).toBe('apaasify');
      expect((firstAst.schema[1] as any).language).toBe('apaasify');

      // 第二次转换：AST -> Markdown
      const markdownString = parserSlateNodeToMarkdown(firstAst.schema);
      expect(markdownString).toContain('```apaasify');
      expect(markdownString).toContain('CrowdSelectionCard');

      // 第三次转换：Markdown -> AST（第二次）
      const secondAst = parserMarkdownToSlateNode(markdownString);

      // 验证节点数量保持一致（应该是 2 个节点，而不是 3 个）
      expect(secondAst.schema).toHaveLength(2);

      // 验证第一个节点仍然是段落
      expect(secondAst.schema[0].type).toBe('paragraph');

      // 验证第二个节点仍然是 apaasify 类型，而不是 code 类型
      expect(secondAst.schema[1].type).toBe('apaasify');
      expect((secondAst.schema[1] as any).language).toBe('apaasify');

      // 验证不应该有 HTML 代码节点
      const htmlCodeNodes = secondAst.schema.filter(
        (node: any) => node.type === 'code' && node.language === 'html',
      );
      expect(htmlCodeNodes).toHaveLength(0);
    });

    it('should handle apaasify node with otherProps through round-trip', () => {
      // 创建一个包含 otherProps 的 apaasify 节点
      const randomId = Math.random().toString(36).substring(7);
      const componentName = `Component${randomId}`;
      const templateText = `Sample template ${Math.floor(Math.random() * 1000)}`;
      const actionType = `ACTION_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const apaasifyNode = {
        type: 'apaasify',
        language: 'apaasify',
        render: false,
        value: [
          {
            componentPath: componentName,
            componentProps: {
              data: {
                template: templateText,
              },
              extraPayload: {
                intentionType: actionType,
              },
            },
          },
        ],
        isConfig: false,
        children: [
          {
            text: JSON.stringify([
              {
                componentPath: componentName,
                componentProps: {
                  data: {
                    template: templateText,
                  },
                  extraPayload: {
                    intentionType: actionType,
                  },
                },
              },
            ]),
          },
        ],
        otherProps: {
          'data-block': 'true',
          'data-state': 'loading',
          finish: false,
          'data-language': 'apaasify',
        },
      };

      // AST -> Markdown
      const markdownString = parserSlateNodeToMarkdown([apaasifyNode]);
      expect(markdownString).toContain('```apaasify');
      expect(markdownString).toContain(componentName);

      // Markdown -> AST
      const ast = parserMarkdownToSlateNode(markdownString);

      // 验证节点类型正确
      expect(ast.schema.length).toBeGreaterThan(0);
      const codeNode = ast.schema.find(
        (node: any) => node.type === 'apaasify' || node.type === 'code',
      );
      expect(codeNode).toBeDefined();
      expect(codeNode?.type).toBe('apaasify');
      expect((codeNode as any).language).toBe('apaasify');

      // 验证不应该有独立的 HTML 注释节点
      const htmlNodes = ast.schema.filter(
        (node: any) => node.type === 'code' && node.language === 'html',
      );
      expect(htmlNodes.length).toBe(0);
    });

    it('should handle multiple apaasify blocks in sequence', () => {
      const markdown = `First paragraph

\`\`\`apaasify
[{"test": "first"}]
\`\`\`

Second paragraph

\`\`\`apaasify
[{"test": "second"}]
\`\`\``;

      // 第一次转换
      const firstAst = parserMarkdownToSlateNode(markdown);
      const apaasifyNodes = firstAst.schema.filter(
        (node: any) => node.type === 'apaasify',
      );
      expect(apaasifyNodes.length).toBe(2);

      // 往返转换
      const markdownString = parserSlateNodeToMarkdown(firstAst.schema);
      const secondAst = parserMarkdownToSlateNode(markdownString);

      // 验证节点数量一致
      expect(secondAst.schema.length).toBe(firstAst.schema.length);

      // 验证所有 apaasify 节点都保持正确类型
      const secondApaasifyNodes = secondAst.schema.filter(
        (node: any) => node.type === 'apaasify',
      );
      expect(secondApaasifyNodes.length).toBe(2);

      // 验证没有 HTML 代码节点
      const htmlNodes = secondAst.schema.filter(
        (node: any) => node.type === 'code' && node.language === 'html',
      );
      expect(htmlNodes.length).toBe(0);
    });

    it('should not accumulate HTML code nodes through multiple round-trip conversions', () => {
      // 原始 Markdown，包含 apaasify 代码块
      const randomId = Math.random().toString(36).substring(7);
      const componentName = `TestComponent${randomId}`;
      const templateValue = `Template ${Math.floor(Math.random() * 10000)}`;

      const originalMarkdown = `\`\`\`apaasify
[
  {
    "componentPath": "${componentName}",
    "componentProps": {
      "data": {
        "template": "${templateValue}"
      }
    }
  }
]
\`\`\``;

      let currentMarkdown = originalMarkdown;
      let previousNodeCount = 0;

      // 执行多次往返转换（5次）
      for (let round = 1; round <= 5; round++) {
        // Markdown -> AST
        const ast = parserMarkdownToSlateNode(currentMarkdown);
        const nodeCount = ast.schema.length;

        // 第一次转换后记录节点数量
        if (round === 1) {
          previousNodeCount = nodeCount;
        }

        // 验证节点数量不应该增加
        expect(nodeCount).toBe(previousNodeCount);

        // 统计 HTML 代码节点数量
        const htmlCodeNodes = ast.schema.filter(
          (node: any) => node.type === 'code' && node.language === 'html',
        );

        // 验证不应该有 HTML 代码节点累积
        expect(htmlCodeNodes.length).toBe(0);

        // 验证 apaasify 节点仍然存在
        const apaasifyNodes = ast.schema.filter(
          (node: any) => node.type === 'apaasify',
        );
        expect(apaasifyNodes.length).toBe(1);

        // AST -> Markdown
        currentMarkdown = parserSlateNodeToMarkdown(ast.schema);
      }
    });

    it('should skip standalone HTML comment with metadata props', () => {
      // 包含独立 HTML 注释的 Markdown（模拟多次转换后的情况）
      const markdown = `<!--{"data-block":"true","data-state":"loading","data-language":"apaasify"}-->

\`\`\`apaasify
[{"test": "value"}]
\`\`\``;

      const ast = parserMarkdownToSlateNode(markdown);

      // 验证 HTML 注释被跳过，不应该生成独立的 HTML 代码节点
      const htmlCodeNodes = ast.schema.filter(
        (node: any) => node.type === 'code' && node.language === 'html',
      );
      expect(htmlCodeNodes.length).toBe(0);

      // 验证只有一个 apaasify 节点
      const apaasifyNodes = ast.schema.filter(
        (node: any) => node.type === 'apaasify',
      );
      expect(apaasifyNodes.length).toBe(1);
    });

    it('should skip HTML comment with metadata even without following code block', () => {
      // HTML 注释后面没有代码块的情况（多次转换后可能出现）
      const markdown = `<!--{"data-block":"true","data-state":"loading","data-language":"apaasify"}-->

Some text here.`;

      const ast = parserMarkdownToSlateNode(markdown);

      // 验证 HTML 注释被跳过，不应该生成独立的 HTML 代码节点
      const htmlCodeNodes = ast.schema.filter(
        (node: any) => node.type === 'code' && node.language === 'html',
      );
      expect(htmlCodeNodes.length).toBe(0);

      // 应该只有段落节点
      const paragraphNodes = ast.schema.filter(
        (node: any) => node.type === 'paragraph',
      );
      expect(paragraphNodes.length).toBeGreaterThan(0);
    });
  });
});
