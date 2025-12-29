import { message } from 'antd';
import { createEditor, Editor, Node } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { insertParsedHtmlNodes } from '../editor/plugins/insertParsedHtmlNodes';

// Mock antd message
vi.mock('antd', () => ({
  message: {
    loading: vi.fn(() => vi.fn()),
  },
}));

// Mock docxDeserializer
vi.mock('../../utils/docx/docxDeserializer', () => ({
  docxDeserializer: vi.fn((rtl, html) => {
    if (html.includes('table')) {
      return [
        {
          type: 'table',
          children: [
            {
              type: 'table-row',
              children: [
                {
                  type: 'table-cell',
                  children: [{ text: 'Table content' }],
                },
              ],
            },
          ],
        },
      ];
    }
    if (html.includes('code')) {
      return [
        {
          type: 'code',
          language: 'javascript',
          children: [{ text: 'const x = 1;' }],
        },
      ];
    }
    if (html.includes('list')) {
      return [
        {
          type: 'list',
          children: [
            {
              type: 'list-item',
              children: [{ text: 'List item' }],
            },
          ],
        },
      ];
    }
    if (html.includes('head')) {
      return [
        {
          type: 'head',
          level: 1,
          children: [{ text: 'Heading' }],
        },
      ];
    }
    // 默认返回段落节点
    return [
      {
        type: 'paragraph',
        children: [{ text: 'Test content' }],
      },
    ];
  }),
}));

describe('insertParsedHtmlNodes', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = createEditor();
    vi.clearAllMocks();
    // 初始化编辑器内容
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: 'Initial content' }],
      },
    ];
  });

  it('should handle basic text paste', async () => {
    // 设置选区
    const path = [0, 0];
    editor.children = [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
          },
        ],
      },
    ];
    const selection = {
      anchor: { path, offset: 0 },
      focus: { path, offset: 0 },
    };
    editor.selection = selection;

    // 执行粘贴
    const result = await insertParsedHtmlNodes(
      editor,
      '<p>Test content</p>',
      { image: { upload: vi.fn() } },
      '',
    );

    // 验证结果
    expect(result).toBe(true);
    expect(Node.string(editor.children[0])).toBe('Test content');
    expect(message.loading).toHaveBeenCalledWith('parsing...', 0);
  });

  it('should handle paste when no selection', async () => {
    // 清除选区
    editor.selection = null;
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ];

    // 执行粘贴
    const result = await insertParsedHtmlNodes(
      editor,
      '<p>Test content</p>',
      { image: { upload: vi.fn() } },
      '',
    );

    // 验证结果
    expect(result).toBe(true);
    // 应该在文档末尾插入内容
    expect(editor.children.length).toBeGreaterThan(0);
    expect(Node.string(editor.children[editor.children.length - 1])).toBe(
      'Test content',
    );
  });

  it('should handle invalid HTML', async () => {
    // 设置选区
    const path = [0, 0];
    editor.selection = {
      anchor: { path, offset: 0 },
      focus: { path, offset: 0 },
    };

    // 执行粘贴无效的 HTML
    const result = await insertParsedHtmlNodes(
      editor,
      '<html>\r\n<body>\r\n\x3C!--StartFragment--><img src="invalid">',
      { image: { upload: vi.fn() } },
      '',
    );

    // 验证结果
    expect(result).toBe(false);
    // 原始内容应该保持不变
    expect(Node.string(editor.children[0])).toBe('Initial content');
  });

  it('should handle empty fragment list', async () => {
    // 设置选区
    const path = [0, 0];
    editor.selection = {
      anchor: { path, offset: 0 },
      focus: { path, offset: 0 },
    };

    // 执行粘贴空内容
    const result = await insertParsedHtmlNodes(
      editor,
      '',
      { image: { upload: vi.fn() } },
      '',
    );

    // 验证结果
    expect(result).toBe(false);
    // 原始内容应该保持不变
    expect(Node.string(editor.children[0])).toBe('Initial content');
  });

  // 新增测试用例：粘贴到表格单元格
  it('should handle paste into table cell', async () => {
    // 设置初始表格结构
    editor.children = [
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [{ text: '' }],
              },
            ],
          },
        ],
      },
    ];

    // 设置选区在表格单元格内
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    };

    const result = await insertParsedHtmlNodes(
      editor,
      '<p>Test content</p>',
      { image: { upload: vi.fn() } },
      '',
    );

    expect(result).toBe(true);
    expect(Node.string(editor.children[0]?.children?.[0]?.children?.[0])).toBe(
      'Test content',
    );
  });

  // 新增测试用例：粘贴到标题
  it('should handle paste into heading', async () => {
    // 设置初始标题结构
    editor.children = [
      {
        type: 'head',
        level: 1,
        children: [{ text: '' }],
      },
    ];

    // 设置选区在标题内
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    // 测试粘贴纯文本
    const result = await insertParsedHtmlNodes(
      editor,
      'Test content',
      { image: { upload: vi.fn() } },
      '',
    );

    expect(result).toBe(true);
    expect(Node.string(editor.children[0])).toBe('Test content');
  });

  // 新增测试用例：粘贴列表
  it('should handle paste list into list-item', async () => {
    // 设置初始列表结构
    editor.children = [
      {
        type: 'list',
        children: [
          {
            type: 'list-item',
            children: [
              {
                type: 'paragraph',
                children: [{ text: '' }],
              },
            ],
          },
        ],
      },
    ];

    // 设置选区在列表项内
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    };

    const result = await insertParsedHtmlNodes(
      editor,
      '<ul><li>List content</li></ul>',
      { image: { upload: vi.fn() } },
      '',
    );

    expect(result).toBe(true);
    expect(Node.string(editor.children[0].children[0])).toBe('List content');
  });

  // 新增测试用例：粘贴到代码块
  it('should handle paste into code block', async () => {
    // 设置初始代码块结构
    editor.children = [
      {
        type: 'code',
        language: 'javascript',
        children: [{ text: '' }],
      },
    ];

    // 设置选区在代码块内
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };

    const result = await insertParsedHtmlNodes(
      editor,
      '<pre><code>const x = 1;</code></pre>',
      { image: { upload: vi.fn() } },
      '',
    );

    expect(result).toBe(true);
    // 代码块内容应该被更新为新的代码
    expect(Node.string(editor.children[0])).toBe('const x = 1;');
  });
});
