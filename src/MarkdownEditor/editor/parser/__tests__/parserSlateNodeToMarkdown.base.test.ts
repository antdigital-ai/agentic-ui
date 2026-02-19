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

describe('parserSlateNodeToMarkdown - coverage', () => {
  it('should handle empty code block', () => {
    const node = { type: 'code', language: 'js', value: '' };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('```');
    expect(result).toContain('js');
  });

  it('should handle code block with only whitespace', () => {
    const node = { type: 'code', language: 'text', value: '   \n  ' };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('```');
  });

  it('should handle think language code block', () => {
    const node = { type: 'code', language: 'think', value: 'reasoning here' };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toBe('<think>reasoning here</think>');
  });

  it('should handle chart node as table', () => {
    const node = {
      type: 'chart',
      children: [
        {
          type: 'table-row',
          children: [
            { type: 'table-cell', children: [{ text: 'A' }] },
            { type: 'table-cell', children: [{ text: 'B' }] },
          ],
        },
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('|');
    expect(result).toContain('A');
  });

  it('should handle schema node', () => {
    const node = { type: 'schema', otherProps: { title: 'Form' } };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('```schema');
    expect(result).toContain('Form');
  });

  it('should handle link-card node', () => {
    const node = {
      type: 'link-card',
      name: 'Example',
      url: 'https://example.com',
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toBe('[Example](https://example.com "Example")');
  });

  it('should handle hr node', () => {
    const node = { type: 'hr', children: [{ text: '' }] };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('***');
  });

  it('should handle break node', () => {
    const node = { type: 'break', children: [{ text: '' }] };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('<br/>');
  });

  it('should handle footnoteDefinition node', () => {
    const node = {
      type: 'footnoteDefinition',
      identifier: '1',
      value: 'Note text',
      url: 'https://example.com',
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toMatch(/\[\^1\].*Note text/);
  });

  it('should handle paragraph with align', () => {
    const node = {
      type: 'paragraph',
      align: 'center',
      children: [{ text: 'Centered' }],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('<p align="center">');
    expect(result).toContain('Centered');
  });

  it('should handle head with align', () => {
    const node = {
      type: 'head',
      level: 2,
      align: 'right',
      children: [{ text: 'Aligned' }],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('<h2 align="right">');
    expect(result).toContain('Aligned');
  });

  it('should handle text with highColor', () => {
    const node = {
      type: 'paragraph',
      children: [{ text: 'Highlighted', highColor: 'yellow' }],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('span');
    expect(result).toContain('yellow');
  });

  it('should handle text with identifier/fnc', () => {
    const node = {
      type: 'paragraph',
      children: [{ text: 'Ref', identifier: true }],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('[^');
  });

  it('should handle mixed format text with space between words', () => {
    const node = {
      type: 'paragraph',
      children: [
        { text: 'BoldItalic', bold: true, italic: true },
        { text: ' next' },
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('***');
    expect(result).toContain('next');
  });

  it('should handle node with otherProps and chart config', () => {
    const node = {
      type: 'chart',
      otherProps: {
        config: [{ chartType: 'bar', x: 'name', y: 'value' }],
      },
      children: [
        {
          type: 'table-row',
          children: [
            { type: 'table-cell', children: [{ text: 'X' }] },
            { type: 'table-cell', children: [{ text: 'Y' }] },
          ],
        },
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('<!--');
    expect(result).toContain('config');
  });

  it('should handle link-card with otherProps', () => {
    const node = {
      type: 'link-card',
      url: 'https://a.com',
      name: 'Card',
      title: 'Title',
      otherProps: { description: 'Desc' },
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('Card');
    expect(result).toContain('https://a.com');
  });

  it('should handle list-item with nested list', () => {
    const node = {
      type: 'list',
      children: [
        {
          type: 'list-item',
          children: [
            { type: 'paragraph', children: [{ text: 'Item' }] },
            {
              type: 'bulleted-list',
              children: [
                {
                  type: 'list-item',
                  children: [{ type: 'paragraph', children: [{ text: 'Nested' }] }],
                },
              ],
            },
          ],
        },
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('Item');
    expect(result).toContain('Nested');
  });

  it('should handle paragraph between two lists', () => {
    const nodes = [
      {
        type: 'bulleted-list',
        children: [
          { type: 'list-item', children: [{ type: 'paragraph', children: [{ text: 'A' }] }] },
        ],
      },
      { type: 'paragraph', children: [{ text: '   ' }] },
      {
        type: 'numbered-list',
        children: [
          { type: 'list-item', children: [{ type: 'paragraph', children: [{ text: 'B' }] }] },
        ],
      },
    ];
    const result = parserSlateNodeToMarkdown(nodes);
    expect(result).toContain('<br/>');
    expect(result).toContain('A');
    expect(result).toContain('B');
  });

  it('should handle image with invalid URL fallback', () => {
    const node = {
      type: 'image',
      url: 'not-a-valid-url://',
      alt: 'Img',
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('![');
    expect(result).toContain('Img');
  });

  it('should handle media with height and image type', () => {
    const node = {
      type: 'media',
      url: 'img.jpg',
      mediaType: 'image',
      height: 300,
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('<img');
    expect(result).toContain('height="300"');
  });

  it('should handle media with align', () => {
    const node = {
      type: 'media',
      url: 'img.jpg',
      mediaType: 'image',
      align: 'center',
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('data-align="center"');
  });

  it('should handle media iframe type', () => {
    const node = {
      type: 'media',
      url: 'https://example.com/embed',
      mediaType: 'iframe',
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('<iframe');
  });

  it('should handle table with empty head', () => {
    const node = {
      type: 'table',
      children: [{ type: 'table-row', children: [] }],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toBe('');
  });

  it('should handle plugin that returns converted node', () => {
    const plugin = {
      toMarkdown: [
        {
          match: (n: any) => n.type === 'custom-block',
          convert: (n: any) => ({ type: 'paragraph', children: [{ text: n.value || '' }] }),
        },
      ],
    };
    const node = { type: 'custom-block', value: 'From plugin' };
    const result = parserSlateNodeToMarkdown([node], '', [{ root: true }], [plugin as any]);
    expect(result).toBe('From plugin');
  });

  it('should handle card-before and card-after (no output)', () => {
    const nodes = [
      { type: 'card-before', children: [] },
      { type: 'paragraph', children: [{ text: 'Content' }] },
      { type: 'card-after', children: [] },
    ];
    const result = parserSlateNodeToMarkdown(nodes);
    expect(result).toBe('Content');
  });

  it('should handle plugin convert returning blockquote', () => {
    const plugin = {
      toMarkdown: [
        {
          match: (n: any) => n.type === 'custom-quote',
          convert: () => ({
            type: 'blockquote',
            children: [{ type: 'paragraph', children: [{ text: 'Quoted' }] }],
          }),
        },
      ],
    };
    const result = parserSlateNodeToMarkdown(
      [{ type: 'custom-quote' }],
      '',
      [{ root: true }],
      [plugin as any],
    );
    expect(result).toContain('>');
    expect(result).toContain('Quoted');
  });

  it('should handle plugin convert returning heading', () => {
    const plugin = {
      toMarkdown: [
        {
          match: (n: any) => n.type === 'custom-head',
          convert: () => ({
            type: 'heading',
            depth: 2,
            children: [{ text: 'Plugin Title' }],
          }),
        },
      ],
    };
    const result = parserSlateNodeToMarkdown(
      [{ type: 'custom-head' }],
      '',
      [{ root: true }],
      [plugin as any],
    );
    expect(result).toBe('## Plugin Title');
  });

  it('should handle plugin convert returning code with multi-line value', () => {
    const plugin = {
      toMarkdown: [
        {
          match: (n: any) => n.type === 'custom-code',
          convert: () => ({
            type: 'code',
            lang: 'js',
            value: 'line1\nline2\nline3',
          }),
        },
      ],
    };
    const result = parserSlateNodeToMarkdown(
      [{ type: 'custom-code' }],
      '',
      [{ root: true }],
      [plugin as any],
    );
    expect(result).toContain('```js');
    expect(result).toContain('line1');
    expect(result).toContain('line2');
    expect(result).toContain('line3');
  });

  it('should handle plugin convert returning text node', () => {
    const plugin = {
      toMarkdown: [
        {
          match: (n: any) => n.type === 'custom-text',
          convert: () => ({ type: 'text', value: 'Plain text value' }),
        },
      ],
    };
    const result = parserSlateNodeToMarkdown(
      [{ type: 'custom-text' }],
      '',
      [{ root: true }],
      [plugin as any],
    );
    expect(result).toBe('Plain text value');
  });

  it('should handle plugin convert returning default (unknown type)', () => {
    const plugin = {
      toMarkdown: [
        {
          match: (n: any) => n.type === 'custom-other',
          convert: () => ({ type: 'unknown-type', value: 'ignored' }),
        },
      ],
    };
    const result = parserSlateNodeToMarkdown(
      [{ type: 'custom-other' }],
      '',
      [{ root: true }],
      [plugin as any],
    );
    expect(result).toBe('');
  });

  it('should handle blockquote with multiple paragraphs', () => {
    const nodes = [
      {
        type: 'blockquote',
        children: [
          { type: 'paragraph', children: [{ text: 'First' }] },
          { type: 'paragraph', children: [{ text: 'Second' }] },
        ],
      },
    ];
    const result = parserSlateNodeToMarkdown(nodes);
    expect(result).toContain('> First');
    expect(result).toContain('> Second');
  });

  it('should handle lastNode code then next node', () => {
    const nodes = [
      { type: 'code', language: 'js', value: 'const x = 1;' },
      { type: 'paragraph', children: [{ text: 'After code' }] },
    ];
    const result = parserSlateNodeToMarkdown(nodes);
    expect(result).toContain('```');
    expect(result).toContain('After code');
  });

  it('should handle lastNode media then next node', () => {
    const nodes = [
      { type: 'media', url: 'https://example.com/a.jpg', mediaType: 'image' },
      { type: 'paragraph', children: [{ text: 'After media' }] },
    ];
    const result = parserSlateNodeToMarkdown(nodes);
    expect(result).toContain('example.com/a.jpg');
    expect(result).toContain('After media');
  });

  it('should handle media video with height', () => {
    const node = {
      type: 'media',
      url: 'https://example.com/v.mp4',
      mediaType: 'video',
      height: 200,
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('<video');
    expect(result).toContain('height="200"');
  });

  it('should handle media image with align and no height', () => {
    const node = {
      type: 'media',
      url: 'https://example.com/p.jpg',
      mediaType: 'image',
      align: 'left',
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('data-align="left"');
    expect(result).toContain('<img');
  });

  it('should handle media non-video non-image type as iframe', () => {
    const node = {
      type: 'media',
      url: 'https://example.com/x',
      mediaType: 'embed',
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('<iframe');
    expect(result).toContain('example.com/x');
  });

  it('should handle list-item with second child as paragraph (not nested list)', () => {
    const node = {
      type: 'bulleted-list',
      children: [
        {
          type: 'list-item',
          children: [
            { type: 'paragraph', children: [{ text: 'First' }] },
            { type: 'paragraph', children: [{ text: 'Second block' }] },
          ],
        },
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('First');
    expect(result).toContain('Second block');
  });

  it('should handle chart with otherProps config as numeric-key object', () => {
    const node = {
      type: 'chart',
      otherProps: {
        chartType: 'line',
        config: { 0: { chartType: 'line', x: 'a', y: 'b' } },
      },
      children: [
        {
          type: 'table-row',
          children: [
            { type: 'table-cell', children: [{ text: 'A' }] },
            { type: 'table-cell', children: [{ text: 'B' }] },
          ],
        },
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('<!--');
    expect(result).toContain('config');
  });

  it('should handle link-card otherProps with empty array and empty object removed', () => {
    const node = {
      type: 'link-card',
      url: 'https://example.com',
      name: 'Link',
      otherProps: {
        emptyArr: [],
        emptyObj: {},
        keep: 'value',
      },
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('Link');
    expect(result).toContain('https://example.com');
  });

  it('should handle text with tag and value/placeholder', () => {
    const node = {
      type: 'paragraph',
      children: [
        { text: ' ', tag: true, value: 'var', placeholder: 'default' } as any,
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('placeholder');
    expect(result).toContain('value');
  });

  it('should handle text with tag and only placeholder', () => {
    const node = {
      type: 'paragraph',
      children: [{ text: ' ', tag: true, placeholder: 'hint' } as any],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('placeholder');
  });

  it('should handle default node without text or tag', () => {
    const node = {
      type: 'paragraph',
      children: [{ type: 'unknown-inline', something: true } as any],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toBe('');
  });

  it('should handle two consecutive headings', () => {
    const nodes = [
      { type: 'head', level: 1, children: [{ text: 'H1' }] },
      { type: 'head', level: 2, children: [{ text: 'H2' }] },
    ];
    const result = parserSlateNodeToMarkdown(nodes);
    expect(result).toBe('# H1\n\n## H2');
  });

  it('should handle list with no children (listItems empty)', () => {
    const node = {
      type: 'bulleted-list',
      children: [],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toBe('');
  });

  it('should handle list with null child (parserNode null path)', () => {
    const node = {
      type: 'bulleted-list',
      children: [
        null as any,
        { type: 'list-item', children: [{ type: 'paragraph', children: [{ text: 'Item' }] }] },
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('Item');
  });

  it('should handle plugin convert returning code with empty value (convertCodeNode trim branch)', () => {
    const plugin = {
      toMarkdown: [
        {
          match: (n: any) => n.type === 'empty-code',
          convert: () => ({ type: 'code', lang: 'text', value: '   \n  ' }),
        },
      ],
    };
    const result = parserSlateNodeToMarkdown(
      [{ type: 'empty-code' }],
      '',
      [{ root: true }],
      [plugin as any],
    );
    expect(result).toContain('```');
    expect(result).toContain('text');
  });

  it('should handle plugin convert returning code with empty string value', () => {
    const plugin = {
      toMarkdown: [
        {
          match: (n: any) => n.type === 'blank-code',
          convert: () => ({ type: 'code', lang: 'js', value: '' }),
        },
      ],
    };
    const result = parserSlateNodeToMarkdown(
      [{ type: 'blank-code' }],
      '',
      [{ root: true }],
      [plugin as any],
    );
    expect(result).toMatch(/```js\s*```/);
  });

  it('should handle chart with chartType but no config (use configProps as chartConfig)', () => {
    const node = {
      type: 'chart',
      otherProps: { chartType: 'bar', x: 'a', y: 'b' },
      children: [
        {
          type: 'table-row',
          children: [
            { type: 'table-cell', children: [{ text: 'X' }] },
            { type: 'table-cell', children: [{ text: 'Y' }] },
          ],
        },
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('<!--');
    expect(result).toContain('chartType');
  });

  it('should handle chart config as non-array object with single numeric key', () => {
    const node = {
      type: 'chart',
      otherProps: {
        config: { 0: { chartType: 'pie' } },
      },
      children: [
        {
          type: 'table-row',
          children: [
            { type: 'table-cell', children: [{ text: 'A' }] },
            { type: 'table-cell', children: [{ text: 'B' }] },
          ],
        },
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('<!--');
    expect(result).toContain('config');
  });

  it('should handle chart config as object with chartType (single config object)', () => {
    const node = {
      type: 'chart',
      otherProps: {
        config: { chartType: 'line', x: 't', y: 'v' },
      },
      children: [
        {
          type: 'table-row',
          children: [
            { type: 'table-cell', children: [{ text: 'K' }] },
            { type: 'table-cell', children: [{ text: 'V' }] },
          ],
        },
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('<!--');
  });

  it('should handle non-chart node with otherProps object config (serialize as object)', () => {
    const node = {
      type: 'paragraph',
      children: [{ text: 'P' }],
      otherProps: { foo: 'bar', num: 1 },
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('P');
    expect(result).toContain('<!--');
  });

  it('should handle blockquote with multiple paragraphs (trailing blockquote marker)', () => {
    const nodes = [
      {
        type: 'blockquote',
        children: [
          { type: 'paragraph', children: [{ text: 'First' }] },
          { type: 'paragraph', children: [{ text: 'Second' }] },
        ],
      },
    ];
    const result = parserSlateNodeToMarkdown(nodes);
    expect(result).toContain('> First');
    expect(result).toContain('> Second');
    expect(result).toContain('\n> ');
  });

  it('should handle nested blockquote in convertTree', () => {
    const nodes = [
      {
        type: 'blockquote',
        children: [
          {
            type: 'blockquote',
            children: [{ type: 'paragraph', children: [{ text: 'Nested' }] }],
          },
        ],
      },
    ];
    const result = parserSlateNodeToMarkdown(nodes);
    expect(result).toContain('>');
    expect(result).toContain('Nested');
  });

  it('should handle table with header row and data rows', () => {
    const node = {
      type: 'table',
      children: [
        { type: 'table-row', children: [{ type: 'table-cell', children: [{ text: 'A' }] }] },
        { type: 'table-row', children: [{ type: 'table-cell', children: [{ text: 'B' }] }] },
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('|');
    expect(result).toContain('A');
    expect(result).toContain('B');
  });

  it('should handle table with child as table-cell (processRow [c])', () => {
    const node = {
      type: 'table',
      children: [
        { type: 'table-row', children: [{ type: 'table-cell', children: [{ text: 'H' }] }] },
        { type: 'table-cell', children: [{ text: 'Cell' }] } as any,
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('|');
    expect(result).toContain('H');
    expect(result).toContain('Cell');
  });

  it('should handle table with center and right align (separatorStrategies)', () => {
    const node = {
      type: 'table',
      children: [
        {
          type: 'table-row',
          children: [
            { type: 'table-cell', children: [{ text: 'L' }], align: 'left' },
            { type: 'table-cell', children: [{ text: 'C' }], align: 'center' },
            { type: 'table-cell', children: [{ text: 'R' }], align: 'right' },
          ],
        },
        {
          type: 'table-row',
          children: [
            { type: 'table-cell', children: [{ text: 'a' }] },
            { type: 'table-cell', children: [{ text: 'b' }] },
            { type: 'table-cell', children: [{ text: 'c' }] },
          ],
        },
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('|');
    expect(result).toContain('L');
    expect(result).toContain('C');
    expect(result).toContain('R');
  });

  it('should handle code node with value as object (apaasify)', () => {
    const node = {
      type: 'code',
      language: 'json',
      value: { key: 'value', nested: { a: 1 } },
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('"key"');
    expect(result).toContain('"value"');
  });

  it('should handle code node with language html and render true', () => {
    const node = {
      type: 'code',
      language: 'html',
      value: '<p>Raw HTML</p>',
      render: true,
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toBe('<p>Raw HTML</p>');
  });

  it('should handle blockquote with empty children via plugin (handleBlockquote)', () => {
    const plugin = {
      toMarkdown: [
        {
          match: (n: any) => n.type === 'empty-quote',
          convert: () => ({ type: 'blockquote', children: [] }),
        },
      ],
    };
    const result = parserSlateNodeToMarkdown(
      [{ type: 'empty-quote' }],
      '',
      [{ root: true }],
      [plugin as any],
    );
    expect(result).toBe('> ');
  });

  it('should handle blockquote with nested blockquote child (handleBlockquote)', () => {
    const node = {
      type: 'blockquote',
      children: [
        {
          type: 'blockquote',
          children: [{ type: 'paragraph', children: [{ text: 'Deep' }] }],
        },
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('>');
    expect(result).toContain('Deep');
  });

  it('should handle image with width and height (searchParams)', () => {
    const node = {
      type: 'image',
      url: 'https://example.com/img.png',
      alt: 'Img',
      width: '100',
      height: '200',
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('width=100');
    expect(result).toContain('height=200');
  });

  it('should handle image with block param', () => {
    const node = {
      type: 'image',
      url: 'https://example.com/img.png',
      alt: 'Img',
      block: true,
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('block=true');
  });

  it('should handle text with highColor and code and url (textHtml branches)', () => {
    const node = {
      type: 'paragraph',
      children: [
        {
          text: 'Link',
          highColor: 'red',
          code: true,
          italic: true,
          bold: true,
          strikethrough: true,
          url: 'https://example.com',
          identifier: true,
        } as any,
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('span');
    expect(result).toContain('code');
    expect(result).toContain('href');
    expect(result).toContain('[^');
  });

  it('should handle mixed format text with no space then next word (isMix space)', () => {
    const node = {
      type: 'paragraph',
      children: [
        { text: 'BoldItalic', bold: true, italic: true },
        { text: 'Next' },
      ],
    };
    const result = parserSlateNodeToMarkdown([node]);
    expect(result).toContain('BoldItalic');
    expect(result).toContain('Next');
  });

  it('should handle lastNode table trailing newline cleanup', () => {
    const nodes = [
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: 'A' }] },
              { type: 'table-cell', children: [{ text: 'B' }] },
            ],
          },
        ],
      },
    ];
    const result = parserSlateNodeToMarkdown(nodes);
    expect(result).not.toMatch(/\n\n$/);
  });

  it('should handle card node not adding extra newlines (node.type === card branch)', () => {
    const nodes = [
      { type: 'card', children: [{ type: 'paragraph', children: [{ text: 'C' }] }] },
      { type: 'paragraph', children: [{ text: 'P' }] },
    ];
    const result = parserSlateNodeToMarkdown(nodes);
    expect(result).toContain('C');
    expect(result).toContain('P');
  });

  it('should handle list then code newline handling', () => {
    const nodes = [
      {
        type: 'bulleted-list',
        children: [
          { type: 'list-item', children: [{ type: 'paragraph', children: [{ text: 'L' }] }] },
        ],
      },
      { type: 'code', language: 'js', value: 'x=1' },
    ];
    const result = parserSlateNodeToMarkdown(nodes);
    expect(result).toContain('```');
    expect(result).toContain('L');
  });
});
