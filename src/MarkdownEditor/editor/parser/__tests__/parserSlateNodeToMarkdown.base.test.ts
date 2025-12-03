import { describe, expect, it } from 'vitest';
import { parserSlateNodeToMarkdown } from '../parserSlateNodeToMarkdown';

describe('parserSlateNodeToMarkdown', () => {
  describe('handleCard', () => {
    it('should handle card node correctly', () => {
      const node = {
        type: 'card',
        children: [{ type: 'paragraph', children: [{ text: 'Card content' }] }],
      };
      const result = parserSlateNodeToMarkdown([node]);
      expect(result).toBe('Card content');
    });
  });

  describe('handleParagraph', () => {
    it('should handle paragraph node with formatting', () => {
      const node = {
        type: 'paragraph',
        children: [
          { text: 'Normal text ' },
          { text: 'bold text', bold: true },
          { text: ' and ' },
          { text: 'italic', italic: true },
        ],
      };
      const result = parserSlateNodeToMarkdown([node]);
      expect(result).toBe('Normal text **bold text** and *italic*');
    });
  });

  describe('handleHead', () => {
    it('should handle heading with different levels', () => {
      const nodes = [
        {
          type: 'head',
          level: 1,
          children: [{ text: 'Heading 1' }],
        },
        {
          type: 'head',
          level: 2,
          children: [{ text: 'Heading 2' }],
        },
      ];
      const result = parserSlateNodeToMarkdown(nodes);
      expect(result).toBe('# Heading 1\n\n## Heading 2');
    });

    it('should handle consecutive headings without extra newlines', () => {
      const nodes = [
        {
          type: 'head',
          level: 1,
          children: [{ text: 'First Heading' }],
        },
        {
          type: 'head',
          level: 2,
          children: [{ text: 'Second Heading' }],
        },
        {
          type: 'head',
          level: 3,
          children: [{ text: 'Third Heading' }],
        },
      ];
      const result = parserSlateNodeToMarkdown(nodes);
      expect(result).toBe(
        '# First Heading\n\n## Second Heading\n\n### Third Heading',
      );
    });
  });

  describe('handleCode', () => {
    it('should handle different code block types', () => {
      const nodes = [
        {
          type: 'code',
          language: 'javascript',
          value: 'console.log("hello");',
        },
        {
          type: 'code',
          language: 'html',
          render: true,
          value: '<div>Hello</div>',
        },
        {
          type: 'code',
          frontmatter: true,
          value: 'title: Hello',
        },
      ];
      const result = parserSlateNodeToMarkdown(nodes);
      expect(result).toBe(
        '```javascript\nconsole.log("hello");\n```\n\n' +
          '<div>Hello</div>\n\n' +
          '---\ntitle: Hello\n---',
      );
    });
  });

  describe('handleAttach', () => {
    it('should handle attachment with download link', () => {
      const node = {
        type: 'attach',
        url: 'http://example.com/file.pdf',
        name: 'Sample PDF',
        size: '1.2MB',
      };
      const result = parserSlateNodeToMarkdown([node]);
      expect(result).toBe(
        '<a href="http://example.com/file.pdf" download data-size="1.2MB">Sample PDF</a>',
      );
    });
  });

  describe('handleBlockquote', () => {
    it('should handle empty blockquote', () => {
      const node = {
        type: 'blockquote',
        children: [],
      };
      const result = parserSlateNodeToMarkdown([node]);
      expect(result).toBe('');
    });

    it('should handle nested blockquotes', () => {
      const node = {
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'First level' }],
          },
          {
            type: 'blockquote',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'Second level' }],
              },
              {
                type: 'blockquote',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'Third level' }],
                  },
                ],
              },
            ],
          },
        ],
      };
      const result = parserSlateNodeToMarkdown([node]);
      expect(result).toBe('> First level\n> Second level\n> > Third level');
    });

    it('should handle blockquote with empty lines', () => {
      const node = {
        type: 'blockquote',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'First paragraph' }],
          },
          {
            type: 'paragraph',
            children: [{ text: '' }],
          },
          {
            type: 'paragraph',
            children: [{ text: 'Second paragraph' }],
          },
        ],
      };
      const result = parserSlateNodeToMarkdown([node]);
      expect(result).toBe('> First paragraph\n>\n> Second paragraph');
    });
  });

  describe('handleImage', () => {
    it('should handle image with various attributes', () => {
      const node = {
        type: 'image',
        url: 'http://example.com/image.jpg',
        alt: 'Sample image',
        width: 800,
        height: 600,
        block: true,
      };
      const result = parserSlateNodeToMarkdown([node]);
      expect(result).toMatch(
        /!\[Sample image\]\(http:\/\/example\.com\/image\.jpg\?width=800&height=600&block=true\)/,
      );
    });
  });

  describe('handleMedia', () => {
    it('should handle different media types', () => {
      const nodes = [
        {
          type: 'media',
          url: 'video.mp4',
          mediaType: 'video',
          height: 400,
        },
        {
          type: 'media',
          url: 'image.jpg',
          mediaType: 'image',
          align: 'center',
        },
      ];
      const result = parserSlateNodeToMarkdown(nodes);
      expect(result).toBe(
        '<video src="video.mp4" alt="" height="400"/>\n\n' +
          '<img src="image.jpg" alt="" data-align="center"/>',
      );
    });
  });

  describe('handleList', () => {
    it('should handle ordered and unordered lists', () => {
      const nodes = [
        {
          type: 'list',
          children: [
            {
              type: 'list-item',
              children: [{ text: 'First item' }],
            },
            {
              type: 'list-item',
              children: [{ text: 'Second item' }],
            },
          ],
        },
        {
          type: 'list',
          order: true,
          start: 1,
          children: [
            {
              type: 'list-item',
              children: [{ text: 'Ordered item 1' }],
            },
            {
              type: 'list-item',
              children: [{ text: 'Ordered item 2' }],
            },
          ],
        },
      ];
      const result = parserSlateNodeToMarkdown(nodes);
      expect(result).toBe(
        '- First item\n' +
          '- Second item\n\n' +
          '1. Ordered item 1\n' +
          '2. Ordered item 2',
      );
    });
  });
});

describe('handleApaasify', () => {
  it('should handle apaasify node using value property', () => {
    const node = {
      type: 'apaasify',
      language: 'apaasify',
      value: { schema: [] },
      children: [{ text: ' {"schema":[]} ' }], // 原始输入，可能过时
    };
    const result = parserSlateNodeToMarkdown([node]);
    // 应该使用 value 属性生成，而不是 children[0].text
    expect(result).toBe('```apaasify\n{\n  "schema": []\n}\n```');
  });

  it('should handle apaasify node with schema language', () => {
    const node = {
      type: 'apaasify',
      language: 'schema',
      value: {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      },
      children: [{ text: '{"schema":[]}' }], // 原始输入，已经过时
    };
    const result = parserSlateNodeToMarkdown([node]);
    // 应该反映 value 中的最新修改
    expect(result).toBe(
      '```schema\n{\n  "type": "object",\n  "properties": {\n    "name": {\n      "type": "string"\n    }\n  }\n}\n```',
    );
  });

  it('should handle modified apaasify value from your example', () => {
    const node = {
      type: 'apaasify',
      language: 'apaasify',
      render: false,
      value: {
        schema: [],
      },
      isConfig: false,
      children: [
        {
          text: ' {"schema":[]} ',
        },
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toBe('```apaasify\n{\n  "schema": []\n}\n```');
  });

  it('should handle empty or null value', () => {
    const node = {
      type: 'apaasify',
      language: 'apaasify',
      value: null,
      children: [{ text: '' }],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toBe('```apaasify\n```');
  });

  it('should handle apaasify node with indentation', () => {
    const node = {
      type: 'apaasify',
      language: 'schema',
      value: { test: true },
      children: [{ text: '{"test": true}' }],
    };
    const result = parserSlateNodeToMarkdown([node], '  '); // 2 spaces indentation
    expect(result).toBe('  ```schema\n{\n    "test": true\n}\n  ```');
  });

  it('should handle string value', () => {
    const node = {
      type: 'apaasify',
      language: 'apaasify',
      value: 'simple string',
      children: [{ text: 'original text' }],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toBe('```apaasify\nsimple string\n```');
  });

  it('should handle multiline content with proper indentation', () => {
    const node = {
      type: 'apaasify',
      language: 'schema',
      value: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      },
      children: [{ text: '{}' }],
    };
    const result = parserSlateNodeToMarkdown([node]);
    const expected =
      '```schema\n{\n  "type": "object",\n  "properties": {\n    "name": {\n      "type": "string"\n    },\n    "age": {\n      "type": "number"\n    }\n  }\n}\n```';
    expect(result).toBe(expected);
  });
});

describe('parserSlateNodeToMarkdown - answer blocks', () => {
  it('should convert answer code block as normal code block', () => {
    const node = {
      type: 'code',
      language: 'answer',
      value: '这是答案内容',
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toBe('```answer\n这是答案内容\n```');
  });

  it('should convert answer code block with multiline content as normal code block', () => {
    const node = {
      type: 'code',
      language: 'answer',
      value: '第一行答案\n第二行答案\n第三行答案',
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toBe('```answer\n第一行答案\n第二行答案\n第三行答案\n```');
  });
});

describe('parserSlateNodeToMarkdown - tag nodes', () => {
  it('should convert tag with text to inline code', () => {
    const node = {
      type: 'paragraph',
      children: [
        { text: 'Select ' },
        {
          text: '已选择',
          code: true,
          tag: true,
          placeholder: '目标场景',
        },
        { text: ' here' },
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toBe('Select `已选择` here');
  });

  it('should convert tag with placeholder when text is empty', () => {
    const node = {
      type: 'paragraph',
      children: [
        { text: 'Select ' },
        {
          text: ' ',
          code: true,
          tag: true,
          placeholder: '目标场景',
        },
        { text: ' here' },
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toBe('Select `${placeholder:目标场景}` here');
  });

  it('should convert tag with placeholder when text is only whitespace', () => {
    const node = {
      type: 'paragraph',
      children: [
        { text: 'Empty ' },
        {
          text: '   ',
          code: true,
          tag: true,
          placeholder: '请选择',
        },
        { text: ' tag' },
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toBe('Empty `${placeholder:请选择}` tag');
  });

  it('should convert tag with value and placeholder', () => {
    const node = {
      type: 'paragraph',
      children: [
        { text: 'Value ' },
        {
          text: ' ',
          code: true,
          tag: true,
          placeholder: '目标场景',
          value: '已选择的值',
        },
        { text: ' here' },
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toBe(
      'Value `${placeholder:目标场景,value:已选择的值}` here',
    );
  });

  it('should convert tag with text (priority over placeholder)', () => {
    const node = {
      type: 'paragraph',
      children: [
        { text: 'Has ' },
        {
          text: '实际文本',
          code: true,
          tag: true,
          placeholder: '目标场景',
        },
        { text: ' content' },
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toBe('Has `实际文本` content');
  });

  it('should convert tag without placeholder (fallback to default)', () => {
    const node = {
      type: 'paragraph',
      children: [
        { text: 'Default ' },
        {
          text: ' ',
          code: true,
          tag: true,
        },
        { text: ' tag' },
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toBe('Default `${placeholder:-}` tag');
  });

  it('should handle normal inline code (not tag)', () => {
    const node = {
      type: 'paragraph',
      children: [
        { text: 'Code ' },
        {
          text: 'const x = 1',
          code: true,
          tag: false,
        },
        { text: ' here' },
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toBe('Code `const x = 1` here');
  });
});
