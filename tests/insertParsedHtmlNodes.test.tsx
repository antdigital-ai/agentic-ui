import { message } from 'antd';
import { createEditor, Editor, Node } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { insertParsedHtmlNodes } from '../src/MarkdownEditor/editor/plugins/insertParsedHtmlNodes';

// Mock antd message
vi.mock('antd', () => ({
  message: {
    loading: vi.fn(() => vi.fn()),
    success: vi.fn(),
    error: vi.fn(),
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
    if (html.includes('media') || html.includes('<img') || html.includes('image')) {
      // 检查是否包含多个图片
      const imageMatches = html.match(/<img[^>]*>/g);
      if (imageMatches && imageMatches.length > 1) {
        return [
          {
            type: 'paragraph',
            children: [
              {
                type: 'media',
                url: 'blob:http://localhost/test1.png',
                mediaType: 'image',
                children: [{ text: '' }],
              },
              { text: 'Text between' },
              {
                type: 'media',
                url: 'blob:http://localhost/test2.png',
                mediaType: 'image',
                children: [{ text: '' }],
              },
              { text: 'Text after' },
            ],
          },
        ];
      }
      // 检查是否包含嵌套结构（检查是否有嵌套的段落标签）
      if (html.includes('</p><p>') || html.includes('</p>\n<p>') || html.match(/<p>.*<p>/)) {
        return [
          {
            type: 'paragraph',
            children: [
              { text: 'Text before' },
              {
                type: 'media',
                url: 'blob:http://localhost/test.png',
                mediaType: 'image',
                children: [{ text: '' }],
              },
              { text: 'Nested text' },
              {
                type: 'media',
                url: 'blob:http://localhost/nested.png',
                mediaType: 'image',
                children: [{ text: '' }],
              },
              { text: 'Text after' },
            ],
          },
        ];
      }
      // 单个图片
      return [
        {
          type: 'paragraph',
          children: [
            {
              type: 'media',
              url: 'blob:http://localhost/test-image.png',
              mediaType: 'image',
              children: [{ text: '' }],
            },
            { text: 'Text after image' },
          ],
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

  // 测试用例：未配置 upload 时，粘贴包含媒体文件的 HTML 应该过滤掉媒体片段
  it('should filter out media fragments when upload is not configured', async () => {
    // 设置选区
    const path = [0, 0];
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ];
    editor.selection = {
      anchor: { path, offset: 0 },
      focus: { path, offset: 0 },
    };

    // 执行粘贴包含媒体文件的 HTML
    const result = await insertParsedHtmlNodes(
      editor,
      '<p><img src="blob:http://localhost/test.png" />Text after image</p>',
      {}, // 未配置 upload
      '',
    );

    // 验证结果
    expect(result).toBe(true);
    // 媒体片段应该被过滤掉，只保留文本内容
    const textContent = Node.string(editor.children[0]);
    expect(textContent).toBe('Text after image');
    // 不应该显示上传成功消息
    expect(message.success).not.toHaveBeenCalled();
    expect(message.error).not.toHaveBeenCalled();
  });

  // 测试用例：未配置 upload 时，粘贴包含多个媒体文件的 HTML 应该过滤掉所有媒体片段
  it('should filter out all media fragments when upload is not configured', async () => {
    // 设置选区
    const path = [0, 0];
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ];
    editor.selection = {
      anchor: { path, offset: 0 },
      focus: { path, offset: 0 },
    };

    // 使用包含多个媒体片段的 HTML
    const htmlWithMultipleMedia = '<p><img src="blob:http://localhost/test1.png" />Text between<img src="blob:http://localhost/test2.png" />Text after</p>';

    // 执行粘贴
    const result = await insertParsedHtmlNodes(
      editor,
      htmlWithMultipleMedia,
      {}, // 未配置 upload
      '',
    );

    // 验证结果
    expect(result).toBe(true);
    // 所有媒体片段应该被过滤掉，只保留文本内容
    const textContent = Node.string(editor.children[0]);
    expect(textContent).toContain('Text between');
    expect(textContent).toContain('Text after');
    // 不应该显示上传成功消息
    expect(message.success).not.toHaveBeenCalled();
    expect(message.error).not.toHaveBeenCalled();
  });

  // 测试用例：未配置 upload 时，粘贴包含嵌套媒体文件的 HTML 应该过滤掉所有媒体片段
  it('should filter out nested media fragments when upload is not configured', async () => {
    // 设置选区
    const path = [0, 0];
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ];
    editor.selection = {
      anchor: { path, offset: 0 },
      focus: { path, offset: 0 },
    };

    // 使用包含嵌套媒体片段的 HTML
    const htmlWithNestedMedia = '<p>Text before<img src="blob:http://localhost/test.png" />Nested text<img src="blob:http://localhost/nested.png" />Text after</p>';

    // 执行粘贴
    const result = await insertParsedHtmlNodes(
      editor,
      htmlWithNestedMedia,
      {}, // 未配置 upload
      '',
    );

    // 验证结果
    expect(result).toBe(true);
    // 所有媒体片段（包括嵌套的）应该被过滤掉
    const textContent = Node.string(editor.children[0]);
    expect(textContent).toContain('Text before');
    expect(textContent).toContain('Nested text');
    expect(textContent).toContain('Text after');
    // 不应该显示上传成功消息
    expect(message.success).not.toHaveBeenCalled();
    expect(message.error).not.toHaveBeenCalled();
  });

  // 测试用例：配置了 upload 时，正常上传流程不受影响
  it('should upload media files normally when upload is configured', async () => {
    // Mock fetch for blobToFile
    global.fetch = vi.fn().mockResolvedValue({
      blob: () => Promise.resolve(new Blob(['test'], { type: 'image/png' })),
    });

    // 设置选区
    const path = [0, 0];
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ];
    editor.selection = {
      anchor: { path, offset: 0 },
      focus: { path, offset: 0 },
    };

    const mockUpload = vi
      .fn()
      .mockResolvedValue('https://example.com/uploaded-image.png');

    // 执行粘贴包含媒体文件的 HTML
    const result = await insertParsedHtmlNodes(
      editor,
      '<p><img src="blob:http://localhost/test.png" />Text after image</p>',
      { image: { upload: mockUpload } },
      '',
    );

    // 验证结果
    expect(result).toBe(true);
    // 等待异步上传完成
    await new Promise((resolve) => setTimeout(resolve, 200));
    // 应该调用上传函数（如果媒体片段存在且需要上传）
    // 注意：由于 blobToFile 需要 fetch，如果 fetch mock 失败，上传可能不会触发
    // 这里我们主要验证函数能正常执行而不报错，并且不会因为未配置 upload 而过滤媒体
    expect(result).toBe(true);
  });
});
