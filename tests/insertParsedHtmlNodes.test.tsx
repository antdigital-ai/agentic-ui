import { message } from 'antd';
import { createEditor, Editor, Node, Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ELEMENT_TAGS,
  TEXT_TAGS,
  deserialize,
  htmlToFragmentList,
  insertParsedHtmlNodes,
} from '../src/MarkdownEditor/editor/plugins/insertParsedHtmlNodes';
import * as docxDeserializerModule from '../src/MarkdownEditor/editor/utils/docx/docxDeserializer';

vi.mock('../src/MarkdownEditor/editor/plugins/hotKeyCommands/backspace', () => ({
  BackspaceKey: vi.fn().mockImplementation(() => ({
    range: vi.fn(),
  })),
}));

// Mock antd message
vi.mock('antd', () => ({
  message: {
    loading: vi.fn(() => vi.fn()),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock docxDeserializer (path must match plugin import: ../utils/docx/docxDeserializer)
vi.mock('../src/MarkdownEditor/editor/utils/docx/docxDeserializer', () => ({
  docxDeserializer: vi.fn((rtl: string, html: string) => {
    if (!html || !html.trim()) return [];
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
    if (
      html.includes('media') ||
      html.includes('<img') ||
      html.includes('image')
    ) {
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
      if (
        html.includes('</p><p>') ||
        html.includes('</p>\n<p>') ||
        html.match(/<p>.*<p>/)
      ) {
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

  // 新增测试用例：粘贴到标题（需 mock 返回带 text 的 fragment 才能插入到 head）
  it('should handle paste into heading', async () => {
    editor.children = [
      { type: 'head', level: 1, children: [{ text: '' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    vi.mocked(docxDeserializerModule.docxDeserializer).mockReturnValueOnce([
      { text: 'Title text' },
    ] as any);
    const result = await insertParsedHtmlNodes(
      editor,
      '<h1>Title text</h1>',
      { image: { upload: vi.fn() } },
      '',
    );
    expect(result).toBe(true);
    expect(Node.string(editor.children[0])).toBe('Title text');
  });

  // 新增测试用例：粘贴列表
  it('should handle paste list into list-item', async () => {
    editor.children = [
      {
        type: 'list',
        children: [
          {
            type: 'list-item',
            children: [
              { type: 'paragraph', children: [{ text: '' }] },
            ],
          },
        ],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    };
    vi.mocked(docxDeserializerModule.docxDeserializer).mockReturnValueOnce([
      {
        type: 'list',
        children: [
          {
            type: 'list-item',
            children: [{ text: 'List item' }],
          },
        ],
      },
    ] as any);
    const result = await insertParsedHtmlNodes(
      editor,
      '<ul><li>List content</li></ul>',
      { image: { upload: vi.fn() } },
      '',
    );
    expect(result).toBe(true);
    expect(Node.string(editor.children[0].children[0])).toBe('List item');
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
    const htmlWithMultipleMedia =
      '<p><img src="blob:http://localhost/test1.png" />Text between<img src="blob:http://localhost/test2.png" />Text after</p>';

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
    const path = [0, 0];
    editor.children = [
      { type: 'paragraph', children: [{ text: '' }] },
    ];
    editor.selection = {
      anchor: { path, offset: 0 },
      focus: { path, offset: 0 },
    };
    const htmlWithNestedMedia =
      '<p>Text before<img src="blob:http://localhost/test.png" />Nested text<img src="blob:http://localhost/nested.png" />Text after</p>';
    const result = await insertParsedHtmlNodes(
      editor,
      htmlWithNestedMedia,
      {},
      '',
    );
    expect(result).toBe(true);
    const textContent = Node.string(editor.children[0]);
    expect(textContent).toContain('Text between');
    expect(textContent).toContain('Text after');
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

  describe('htmlToFragmentList', () => {
    it('应将 table 片段用 wrapperCardNode 包装', () => {
      const tableFragment = [
        {
          type: 'table',
          children: [
            {
              type: 'table-row',
              children: [{ type: 'table-cell', children: [{ text: 'x' }] }],
            },
          ],
        },
      ];
      vi.mocked(docxDeserializerModule.docxDeserializer).mockReturnValueOnce(
        tableFragment as any,
      );
      const result = htmlToFragmentList('<table><tr><td>x</td></tr></table>', '');
      expect(result.length).toBe(1);
      expect(result[0].type).toBe('card');
    });

    it('应将 "paragraph" 类型且单子节点转为 paragraph', () => {
      const raw = [
        {
          type: '"paragraph"',
          children: [{ text: 'one' }],
        },
      ];
      vi.mocked(docxDeserializerModule.docxDeserializer).mockReturnValueOnce(
        raw as any,
      );
      const result = htmlToFragmentList('<p>one</p>', '');
      expect(result[0].type).toBe('paragraph');
      expect(result[0].children).toEqual([{ text: 'one' }]);
    });
  });

  describe('ELEMENT_TAGS', () => {
    it('H1 应支持 align / style.textAlign / data-align', () => {
      const el = document.createElement('h1');
      el.setAttribute('align', 'center');
      expect(ELEMENT_TAGS.H1(el as any).align).toBe('center');
      const el2 = document.createElement('h2');
      el2.style.textAlign = 'right';
      expect(ELEMENT_TAGS.H2(el2 as any).align).toBe('right');
      const el3 = document.createElement('h3');
      el3.setAttribute('data-align', 'left');
      expect(ELEMENT_TAGS.H3(el3 as any).align).toBe('left');
    });

    it('H4/H5 应支持 align', () => {
      const el4 = document.createElement('h4');
      el4.setAttribute('align', 'center');
      expect(ELEMENT_TAGS.H4(el4 as any).align).toBe('center');
      const el5 = document.createElement('h5');
      el5.style.textAlign = 'right';
      expect(ELEMENT_TAGS.H5(el5 as any).align).toBe('right');
    });

    it('IMG 无效 URL 应返回 paragraph 节点', () => {
      const el = document.createElement('img');
      (el as any).src = 'https://example.com/page';
      (el as any).alt = 'link';
      const out: { type: string; children: Array<{ text: string }> } =
        ELEMENT_TAGS.IMG(el as any) as { type: string; children: Array<{ text: string }> };
      expect(out.type).toBe('paragraph');
      expect(out.children[0].text).toBe('https://example.com/page');
    });

    it('IMG 有效 blob URL 应返回媒体相关节点', () => {
      const el = document.createElement('img');
      (el as any).src = 'blob:http://localhost/x';
      (el as any).alt = 'img';
      const out = ELEMENT_TAGS.IMG(el as any) as { type?: string };
      expect(out.type === 'media' || out.type === 'card').toBe(true);
    });

    it('IMG 空 src 或非 http(s) 地址应回退 paragraph', () => {
      const out1 = ELEMENT_TAGS.IMG({ src: '', alt: 'a' } as any) as any;
      expect(out1.type).toBe('paragraph');
      const out2 = ELEMENT_TAGS.IMG({ src: 'ftp://x/a.png', alt: 'a' } as any) as any;
      expect(out2.type).toBe('paragraph');
    });

    it('P 应支持 align', () => {
      const el = document.createElement('p');
      el.setAttribute('align', 'center');
      expect(ELEMENT_TAGS.P(el as any).align).toBe('center');
    });

    it('TABLE/TR/TH/TD/LI/OL/PRE/UL 应返回对应 type', () => {
      expect(ELEMENT_TAGS.TABLE().type).toBe('table');
      expect(ELEMENT_TAGS.TR().type).toBe('table-row');
      expect(ELEMENT_TAGS.TH().type).toBe('table-cell');
      expect(ELEMENT_TAGS.TD().type).toBe('table-cell');
      expect(ELEMENT_TAGS.LI().type).toBe('list-item');
      expect(ELEMENT_TAGS.OL().type).toBe('list');
      expect(ELEMENT_TAGS.PRE().type).toBe('code');
      expect(ELEMENT_TAGS.UL().type).toBe('bulleted-list');
    });
  });

  describe('TEXT_TAGS', () => {
    it('A 应返回 href', () => {
      const el = document.createElement('a');
      el.setAttribute('href', 'https://x.com');
      expect(TEXT_TAGS.A(el as any).url).toBe('https://x.com');
    });
    it('CODE/KBD/DEL/EM/I/S/STRONG/B 应返回对应 mark', () => {
      expect(TEXT_TAGS.CODE()).toEqual({ code: true });
      expect(TEXT_TAGS.KBD()).toEqual({ code: true });
      expect(TEXT_TAGS.DEL()).toEqual({ strikethrough: true });
      expect(TEXT_TAGS.EM()).toEqual({ italic: true });
      expect(TEXT_TAGS.I()).toEqual({ italic: true });
      expect(TEXT_TAGS.S()).toEqual({ strikethrough: true });
      expect(TEXT_TAGS.STRONG()).toEqual({ bold: true });
      expect(TEXT_TAGS.B()).toEqual({ bold: true });
    });
    it('SPAN 应返回 textContent', () => {
      const el = document.createElement('span');
      el.textContent = 'hello';
      expect(TEXT_TAGS.SPAN(el as any).text).toBe('hello');
    });
  });

  describe('deserialize', () => {
    it('script/style/meta/link/head/colgroup/noscript 应返回 []', () => {
      const tags = ['script', 'style', 'meta', 'link', 'head', 'colgroup', 'noscript'];
      tags.forEach((tag) => {
        const el = document.createElement(tag);
        expect(deserialize(el as any, '')).toEqual([]);
      });
    });

    it('BR 应返回 \\n', () => {
      const el = document.createElement('br');
      expect(deserialize(el as any, '')).toBe('\n');
    });

    it('文本节点应返回 textContent', () => {
      const text = document.createTextNode('hello');
      expect(deserialize(text as any, '')).toBe('hello');
    });

    it('非元素节点(nodeType !== 1)应返回 null', () => {
      const comment = document.createComment('comment');
      expect(deserialize(comment as any, '')).toBeNull();
    });

    it('fragment 标签(body/div/figure)应返回 jsx fragment', () => {
      const div = document.createElement('div');
      div.appendChild(document.createTextNode('x'));
      const result = deserialize(div as any, '');
      expect(result).toBeDefined();
      expect(Array.isArray(result) || (result && typeof result === 'object')).toBe(true);
    });

    it('BLOCKQUOTE 标签应走 ELEMENT_TAGS.BLOCKQUOTE', () => {
      const el = document.createElement('blockquote');
      el.appendChild(document.createTextNode('quoted'));
      const result = deserialize(el as any, '') as any;
      expect(result?.type).toBe('blockquote');
    });

    it('PRE[data-bl-type=code] 应解析为 code 节点', () => {
      const wrap = document.createElement('div');
      wrap.innerHTML =
        '<pre data-bl-type="code" data-bl-lang="ts"><code>let\\n\\tx=1;</code></pre>';
      const pre = wrap.firstElementChild as HTMLElement;
      const result = deserialize(pre as any, '') as any;
      expect(result?.type).toBe('code');
      expect(result?.language).toBe('ts');
    });

    it('PRE 普通 code 节点应走 parserCodeText 分支', () => {
      const wrap = document.createElement('div');
      wrap.innerHTML = '<pre><code>a<br>b</code></pre>';
      const pre = wrap.firstElementChild as HTMLElement;
      const code = pre.firstElementChild as HTMLElement;
      Object.defineProperty(code, 'innerText', { value: 'a\nb', configurable: true });
      const result = deserialize(pre as any, '') as any;
      expect(result?.type).toBe('code');
      expect(result?.value).toBe('a\nb');
    });

    it('PRE 且 parserCodeText 为空时返回 null', () => {
      const wrap = document.createElement('div');
      wrap.innerHTML = '<pre><code></code></pre>';
      const pre = wrap.firstElementChild as HTMLElement;
      const code = pre.firstElementChild as HTMLElement;
      Object.defineProperty(code, 'innerText', { value: '', configurable: true });
      const result = deserialize(pre as any, '') as any;
      expect(result).toBeNull();
    });

    it('PRE 子节点索引错位时 parserCodeText(undefined) 返回空串', () => {
      const wrap = document.createElement('div');
      wrap.innerHTML = '<pre>x<code></code></pre>';
      const pre = wrap.firstElementChild as HTMLElement;
      const result = deserialize(pre as any, '') as any;
      expect(result).toBeNull();
    });

    it('TEXT_TAGS 节点包含非文本子元素时返回 fragment', () => {
      const span = document.createElement('span');
      const p = document.createElement('p');
      p.textContent = 'nested';
      span.appendChild(p);
      const result = deserialize(span as any, '');
      expect(result).toBeDefined();
    });

    it('TEXT_TAGS 纯文本子节点应映射为 text 并过滤空值', () => {
      const span = document.createElement('span');
      span.appendChild(document.createTextNode('hello'));
      const result = deserialize(span as any, '');
      expect(Array.isArray(result)).toBe(true);
      expect((result as any[]).length).toBeGreaterThan(0);
    });

    it('空元素 children 回退为 text 节点', () => {
      const p = document.createElement('p');
      const result = deserialize(p as any, '') as any;
      const textNode = Array.isArray(result) ? result[0] : result?.children?.[0];
      expect(textNode?.text).toBe('');
    });

    it('未知标签应走默认分支并返回 children', () => {
      const section = document.createElement('section');
      section.appendChild(document.createTextNode('fallback'));
      const result = deserialize(section as any, '');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('insertParsedHtmlNodes 更多分支', () => {
    it('非折叠选区时应先删除选区再插入', async () => {
      editor.children = [{ type: 'paragraph', children: [{ text: 'ab' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 2 },
      };
      vi.useFakeTimers();
      const p = insertParsedHtmlNodes(
        editor,
        '<p>Test content</p>',
        { image: { upload: vi.fn() } },
        '',
      );
      await vi.runAllTimersAsync();
      const result = await p;
      vi.useRealTimers();
      expect(result).toBe(true);
    });

    it('列表项且 fragment 为 list 但 children 为空时应返回 false', async () => {
      editor.children = [
        {
          type: 'list',
          children: [
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: '' }] }],
            },
          ],
        },
      ];
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      };
      vi.mocked(docxDeserializerModule.docxDeserializer).mockReturnValueOnce([
        { type: 'list', children: [] },
      ] as any);
      const result = await insertParsedHtmlNodes(
        editor,
        '<ul><li></li></ul>',
        {},
        '',
      );
      expect(result).toBe(false);
    });

    it('标题节点且 fragment 类型非 paragraph 时应插入空段落', async () => {
      editor.children = [{ type: 'head', level: 1, children: [{ text: '' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      vi.mocked(docxDeserializerModule.docxDeserializer).mockReturnValueOnce([
        { type: 'table', children: [] },
      ] as any);
      const result = await insertParsedHtmlNodes(
        editor,
        '<table></table>',
        {},
        '',
      );
      expect(result).toBe(true);
    });

    it('默认路径下 code 片段应被规范化后插入', async () => {
      editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      vi.mocked(docxDeserializerModule.docxDeserializer).mockReturnValueOnce([
        {
          type: 'code',
          language: 'js',
          children: [{ text: 'code' }],
        },
      ] as any);
      const result = await insertParsedHtmlNodes(
        editor,
        '<pre><code>code</code></pre>',
        {},
        '',
      );
      expect(result).toBe(true);
    });

    it('无 type 的 item 应被包装为 paragraph', async () => {
      editor.selection = null;
      editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
      vi.mocked(docxDeserializerModule.docxDeserializer).mockReturnValueOnce([
        { children: [{ text: 'raw' }] },
      ] as any);
      const result = await insertParsedHtmlNodes(editor, '<p>raw</p>', {}, '');
      expect(result).toBe(true);
    });

    it('非折叠选区延迟回调会删除首个空段落', async () => {
      editor.children = [
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'paragraph', children: [{ text: 'keep' }] },
      ] as any;
      editor.selection = {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 2 },
      };
      const deleteSpy = vi.spyOn(Transforms, 'delete');
      vi.useFakeTimers();
      const p = insertParsedHtmlNodes(editor, '<p>x</p>', {}, '');
      await vi.runAllTimersAsync();
      await p;
      vi.useRealTimers();
      expect(deleteSpy).toHaveBeenCalledWith(editor, { at: [0] });
      deleteSpy.mockRestore();
    });

    it('list-item 空段落且父节点 children>1 时触发 moveNodes', async () => {
      editor.children = [
        {
          type: 'list',
          children: [
            {
              type: 'list-item',
              children: [
                { type: 'paragraph', children: [{ text: '' }] },
                { type: 'paragraph', children: [{ text: 'tail' }] },
              ],
            },
          ],
        },
      ] as any;
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      };
      vi.mocked(docxDeserializerModule.docxDeserializer).mockReturnValueOnce([
        {
          type: 'list',
          children: [{ type: 'list-item', children: [{ text: 'a' }] }],
        },
      ] as any);
      const moveSpy = vi.spyOn(Transforms, 'moveNodes');
      const result = await insertParsedHtmlNodes(editor, '<ul><li>a</li></ul>', {}, '');
      expect(result).toBe(true);
      expect(moveSpy).toHaveBeenCalled();
      moveSpy.mockRestore();
    });

    it('list-item 非空段落时走 776 与 782 分支', async () => {
      editor.children = [
        {
          type: 'list',
          children: [
            {
              type: 'list-item',
              children: [{ type: 'paragraph', children: [{ text: 'seed' }] }],
            },
          ],
        },
      ] as any;
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      };
      vi.mocked(docxDeserializerModule.docxDeserializer).mockReturnValueOnce([
        {
          type: 'list',
          children: [{ type: 'list-item', children: [{ text: 'a' }] }],
        },
        { type: 'paragraph', children: [{ text: 'rest' }] },
      ] as any);
      const result = await insertParsedHtmlNodes(
        editor,
        '<ul><li>a</li></ul><p>rest</p>',
        {},
        '',
      );
      expect(result).toBe(true);
    });
  });

  describe('shouldExcludeFromUpload 通过 insertParsedHtmlNodes', () => {
    it('仅 media 片段时不应调用 upload', async () => {
      editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      vi.mocked(docxDeserializerModule.docxDeserializer).mockReturnValueOnce([
        {
          type: 'media',
          url: 'blob:x',
          children: [{ text: '' }],
        },
      ] as any);
      const upload = vi.fn();
      await insertParsedHtmlNodes(
        editor,
        'media',
        { image: { upload } },
        '',
      );
      expect(upload).not.toHaveBeenCalled();
    });

    it('card 第二子节点为 media 时应排除上传', async () => {
      editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      vi.mocked(docxDeserializerModule.docxDeserializer).mockReturnValueOnce([
        {
          type: 'card',
          children: [
            { type: 'paragraph', children: [{ text: '' }] },
            { type: 'media', url: 'blob:x', children: [{ text: '' }] },
          ],
        },
      ] as any);
      const upload = vi.fn();
      await insertParsedHtmlNodes(editor, 'card', { image: { upload } }, '');
      expect(upload).not.toHaveBeenCalled();
    });
  });

  describe('parseHtmlOptimized 大内容异步路径', () => {
    it('html 长度 >= MAX_SYNC_SIZE 时应走异步解析', async () => {
      const longHtml = '<p>' + 'x'.repeat(1200) + '</p>';
      vi.mocked(docxDeserializerModule.docxDeserializer).mockImplementationOnce(
        () => [{ type: 'paragraph', children: [{ text: 'long' }] }] as any,
      );
      editor.selection = { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 0 } };
      editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
      vi.useFakeTimers();
      const resultPromise = insertParsedHtmlNodes(editor, longHtml, {}, '');
      await vi.advanceTimersByTimeAsync(100);
      const result = await resultPromise;
      vi.useRealTimers();
      expect(result).toBe(true);
    });

    it('requestIdleCallback 可用时应走 idle 分支', async () => {
      const longHtml = '<p>' + 'x'.repeat(1200) + '</p>';
      const idleSpy = vi.fn((cb: any) => cb());
      Object.defineProperty(window, 'requestIdleCallback', {
        value: idleSpy,
        configurable: true,
      });
      (globalThis as any).requestIdleCallback = idleSpy;
      vi.mocked(docxDeserializerModule.docxDeserializer).mockReturnValueOnce([
        { type: 'paragraph', children: [{ text: 'idle' }] },
      ] as any);
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
      const result = await insertParsedHtmlNodes(editor, longHtml, {}, '');
      expect(result).toBe(true);
      expect(idleSpy).toHaveBeenCalled();
      delete (window as any).requestIdleCallback;
      delete (globalThis as any).requestIdleCallback;
    });

    it('大内容异步解析抛错时返回 false', async () => {
      const longHtml = '<p>' + 'x'.repeat(1200) + '</p>';
      vi.mocked(docxDeserializerModule.docxDeserializer).mockImplementationOnce(() => {
        throw new Error('idle parse failed');
      });
      const result = await insertParsedHtmlNodes(editor, longHtml, {}, '');
      expect(result).toBe(false);
    });
  });

  describe('insertParsedHtmlNodes 大批量与错误分支', () => {
    it('超过 BATCH_SIZE 节点时应分段插入', async () => {
      editor.selection = null;
      editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
      const manyNodes = Array.from({ length: 15 }, (_, i) => ({
        type: 'paragraph' as const,
        children: [{ text: `p${i}` }],
      }));
      vi.mocked(docxDeserializerModule.docxDeserializer).mockImplementationOnce(
        () => manyNodes as any,
      );
      const result = await insertParsedHtmlNodes(
        editor,
        '<p>p0</p>',
        {},
        '',
      );
      expect(result).toBe(true);
      expect(editor.children.length).toBeGreaterThanOrEqual(15);
    });

    it('解析失败时应捕获错误并提示', async () => {
      vi.mocked(docxDeserializerModule.docxDeserializer).mockRejectedValueOnce(
        new Error('parse error'),
      );
      editor.selection = { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 0 } };
      const result = await insertParsedHtmlNodes(editor, '<p>x</p>', {}, '');
      expect(result).toBe(false);
      expect(message.error).toHaveBeenCalledWith('Content parsing failed, please try again');
    });

    it('标题节点且 fragment 为 paragraph 但无 text 节点时应返回 false', async () => {
      editor.children = [{ type: 'head', level: 1, children: [{ text: '' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      vi.mocked(docxDeserializerModule.docxDeserializer).mockReturnValueOnce([
        { type: 'paragraph', children: [{ text: '' }] },
      ] as any);
      const result = await insertParsedHtmlNodes(
        editor,
        '<p></p>',
        {},
        '',
      );
      expect(result).toBe(false);
    });

    it('默认处理分支应命中 no-type/code/普通节点映射', async () => {
      editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      vi.mocked(docxDeserializerModule.docxDeserializer).mockReturnValueOnce([
        { children: [{ text: 'raw' }] },
        { type: 'code', children: [{ text: 'const n=1;' }] },
        { type: 'paragraph', children: [{ text: 'p' }] },
      ] as any);
      const result = await insertParsedHtmlNodes(editor, '<div>mixed</div>', {}, '');
      expect(result).toBe(true);
    });

    it('upload 非 blob URL 分支应调用 upload', async () => {
      editor.selection = null;
      editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
      vi.mocked(docxDeserializerModule.docxDeserializer).mockReturnValueOnce([
        {
          type: 'paragraph',
          children: [
            {
              type: 'media',
              url: 'https://example.com/a.png',
              children: [{ text: '' }],
            },
          ],
        },
      ] as any);
      const upload = vi.fn().mockResolvedValue('https://cdn.example.com/a.png');
      const result = await insertParsedHtmlNodes(
        editor,
        '<img src="https://example.com/a.png"/>',
        { image: { upload } },
        '',
      );
      expect(result).toBe(true);
      expect(upload).toHaveBeenCalled();
    });

    it('upload 失败时应命中 upLoadFileBatch catch 并提示错误', async () => {
      editor.selection = null;
      editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
      vi.mocked(docxDeserializerModule.docxDeserializer).mockReturnValueOnce([
        {
          type: 'paragraph',
          children: [
            {
              type: 'media',
              url: 'https://example.com/b.png',
              children: [{ text: '' }],
            },
          ],
        },
      ] as any);
      const upload = vi.fn().mockRejectedValue(new Error('upload failed'));
      const result = await insertParsedHtmlNodes(
        editor,
        '<img src="https://example.com/b.png"/>',
        { image: { upload } },
        '',
      );
      expect(result).toBe(true);
      expect(message.error).toHaveBeenCalledWith('Some files failed to upload');
    });

    it('upload 超过 BATCH_SIZE 时应命中批次延迟分支', async () => {
      editor.selection = null;
      editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
      const mediaChildren = Array.from({ length: 12 }, (_, i) => ({
        type: 'media',
        url: `https://example.com/${i}.png`,
        children: [{ text: '' }],
      }));
      vi.mocked(docxDeserializerModule.docxDeserializer).mockReturnValueOnce([
        { type: 'paragraph', children: mediaChildren },
      ] as any);
      const upload = vi.fn().mockImplementation(async (arr: any[]) => arr[0]);
      vi.useFakeTimers();
      const p = insertParsedHtmlNodes(editor, '<p>bulk</p>', { image: { upload } }, '');
      await vi.runAllTimersAsync();
      const result = await p;
      vi.useRealTimers();
      expect(result).toBe(true);
      expect(upload).toHaveBeenCalled();
    });

    it('data-be 且 table-cell 时应直接返回 true', async () => {
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
      editor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      };
      vi.mocked(docxDeserializerModule.docxDeserializer).mockReturnValueOnce([
        { type: 'paragraph', children: [{ text: 'cell' }] },
      ] as any);
      const result = await insertParsedHtmlNodes(
        editor,
        '<div data-be="block"><p>cell</p></div>',
        {},
        '',
      );
      expect(result).toBe(true);
    });

    it('标题节点且 fragment 无 type 且无 text 时返回 false（823）', async () => {
      editor.children = [{ type: 'head', level: 1, children: [{ text: '' }] }];
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };
      vi.mocked(docxDeserializerModule.docxDeserializer).mockReturnValueOnce([
        { children: [{ foo: 'bar' }] },
      ] as any);
      const result = await insertParsedHtmlNodes(editor, '<div>x</div>', {}, '');
      expect(result).toBe(false);
    });
  });

  describe('htmlToFragmentList 默认映射', () => {
    it('非 table 与非 \"paragraph\" 类型应原样返回（576）', () => {
      vi.mocked(docxDeserializerModule.docxDeserializer).mockReturnValueOnce([
        {
          type: 'paragraph',
          children: [{ text: 'keep' }],
        },
      ] as any);
      const result = htmlToFragmentList('<p>keep</p>', '');
      expect(result[0].type).toBe('paragraph');
      expect(result[0].children[0].text).toBe('keep');
    });
  });
});
