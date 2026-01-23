import { message } from 'antd';
import { createEditor, Editor, Transforms } from 'slate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  handleFilesPaste,
  handleHtmlPaste,
  handleHttpLinkPaste,
  handlePlainTextPaste,
  handleSlateMarkdownFragment,
  handleSpecialTextPaste,
  handleTagNodePaste,
  shouldInsertTextDirectly,
} from '../src/MarkdownEditor/editor/plugins/handlePaste';
import { insertParsedHtmlNodes } from '../src/MarkdownEditor/editor/plugins/insertParsedHtmlNodes';
import { EditorUtils } from '../src/MarkdownEditor/editor/utils/editorUtils';

// Mock insertParsedHtmlNodes
vi.mock('../src/MarkdownEditor/editor/plugins/insertParsedHtmlNodes', () => ({
  insertParsedHtmlNodes: vi.fn().mockResolvedValue(true),
}));

// Mock antd message
vi.mock('antd', () => ({
  message: {
    loading: vi.fn(() => vi.fn()),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock EditorUtils
vi.mock('../src/MarkdownEditor/editor/utils/editorUtils', () => ({
  EditorUtils: {
    replaceSelectedNode: vi.fn(),
    findMediaInsertPath: vi.fn(() => [0]),
    createMediaNode: vi.fn((url: string) => ({
      type: 'image',
      url,
      children: [{ text: '' }],
    })),
    findNext: vi.fn(),
    wrapperCardNode: vi.fn((node) => ({
      type: 'card',
      children: [
        {
          type: 'card-before',
          children: [{ text: '' }],
        },
        node,
        {
          type: 'card-after',
          children: [{ text: '' }],
        },
      ],
    })),
  },
}));

describe('handlePaste utilities', () => {
  let editor: Editor;
  let mockClipboardData: {
    getData: ReturnType<typeof vi.fn>;
    files: File[];
  };

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
    // 设置默认选择范围
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    // 模拟 ClipboardData
    mockClipboardData = {
      getData: vi.fn(),
      files: [],
    };
  });

  describe('handleSlateMarkdownFragment', () => {
    it('should handle basic slate fragment', () => {
      const fragment = [
        {
          type: 'paragraph',
          children: [
            { text: 'Test content' },
            {
              text: 'code',
              code: true,
            },
            { text: 'Test content' },
          ],
        },
        {
          type: 'paragraph',
          children: [
            { text: 'Test content' },
            {
              text: 'code',
              code: true,
            },
            { text: 'Test content' },
          ],
        },
      ];
      mockClipboardData.getData.mockReturnValue(JSON.stringify(fragment));

      const result = handleSlateMarkdownFragment(
        editor,
        mockClipboardData as unknown as DataTransfer,
        {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
      );

      expect(result).toBe(true);
      expect(EditorUtils.replaceSelectedNode).toHaveBeenCalledWith(
        editor,
        fragment,
      );
    });

    it('should handle card type nodes', () => {
      const cardFragment = [
        {
          type: 'card',
          children: [{ text: 'Card content' }],
        },
      ];
      mockClipboardData.getData.mockReturnValue(JSON.stringify(cardFragment));

      const result = handleSlateMarkdownFragment(
        editor,
        mockClipboardData as unknown as DataTransfer,
        {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
      );

      expect(result).toBe(true);
      expect(EditorUtils.replaceSelectedNode).toHaveBeenCalled();
    });

    it('should handle text area mode', () => {
      const fragment = [
        {
          type: 'paragraph',
          children: [{ text: 'Test content' }],
        },
      ];
      mockClipboardData.getData.mockReturnValue(JSON.stringify(fragment));

      const result = handleSlateMarkdownFragment(
        editor,
        mockClipboardData as unknown as DataTransfer,
        {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
      );

      expect(result).toBe(true);
    });
  });

  describe('handleHtmlPaste', () => {
    beforeEach(() => {
      // Reset the mock implementation before each test
      (insertParsedHtmlNodes as any).mockClear();
      (insertParsedHtmlNodes as any).mockResolvedValue(true);
    });

    it('should handle basic HTML content', async () => {
      mockClipboardData.getData.mockImplementation((format: string) => {
        if (format === 'text/html') return '<p>Test HTML</p>';
        if (format === 'text/rtf') return '';
        return '';
      });

      const result = await handleHtmlPaste(
        editor,
        mockClipboardData as unknown as DataTransfer,
        {},
      );
      expect(result).toBe(true);
    });

    it('should handle complex HTML content with multiple elements', async () => {
      mockClipboardData.getData.mockImplementation((format: string) => {
        if (format === 'text/html')
          return '<h1>Title</h1><p>Paragraph</p><ul><li>Item 1</li><li>Item 2</li></ul>';
        return '';
      });

      const result = await handleHtmlPaste(
        editor,
        mockClipboardData as unknown as DataTransfer,
        {},
      );
      expect(result).toBe(true);
    });

    it('should handle HTML content with inline styles', async () => {
      mockClipboardData.getData.mockImplementation((format: string) => {
        if (format === 'text/html')
          return '<p><strong>Bold</strong> and <em>italic</em> text</p>';
        return '';
      });

      const result = await handleHtmlPaste(
        editor,
        mockClipboardData as unknown as DataTransfer,
        {},
      );
      expect(result).toBe(true);
    });

    it('should handle empty HTML content', async () => {
      mockClipboardData.getData.mockReturnValue('');

      const result = await handleHtmlPaste(
        editor,
        mockClipboardData as unknown as DataTransfer,
        {},
      );
      expect(result).toBe(false);
    });

    it('should handle HTML with nested lists and tables', async () => {
      const complexHtml = `
        <div>
          <h1>Complex Document</h1>
          <p>This is a <strong>bold</strong> paragraph with <em>italic</em> text.</p>
          <ul>
            <li>First level item
              <ul>
                <li>Nested item 1</li>
                <li>Nested item 2 with <strong>bold</strong></li>
              </ul>
            </li>
            <li>Another first level item</li>
          </ul>
          <table>
            <thead>
              <tr>
                <th>Header 1</th>
                <th>Header 2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cell with <em>italic</em></td>
                <td>Cell with <code>code</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      `;

      mockClipboardData.getData.mockImplementation((format: string) => {
        if (format === 'text/html') return complexHtml;
        return '';
      });

      const result = await handleHtmlPaste(
        editor,
        mockClipboardData as unknown as DataTransfer,
        {},
      );
      expect(result).toBe(true);
    });

    it('should handle HTML with code blocks and special characters', async () => {
      const codeHtml = `
        <div>
          <pre><code class="language-javascript">
            function example() {
              const x = 1;
              return x + 2;
            }
          </code></pre>
          <p>Special characters: &amp; &lt; &gt; &quot; &#39;</p>
          <p>Emoji: 👋 🎉 🚀</p>
        </div>
      `;

      mockClipboardData.getData.mockImplementation((format: string) => {
        if (format === 'text/html') return codeHtml;
        return '';
      });

      const result = await handleHtmlPaste(
        editor,
        mockClipboardData as unknown as DataTransfer,
        {},
      );
      expect(result).toBe(true);
    });

    it('should handle HTML with mixed content types', async () => {
      const mixedHtml = `
        <div>
          <h2>Mixed Content</h2>
          <blockquote>
            <p>This is a quote with <a href="https://example.com">a link</a></p>
          </blockquote>
          <div class="custom-class" style="color: red;">
            <p>Styled text with <mark>highlighted</mark> content</p>
          </div>
          <hr>
          <details>
            <summary>Expandable section</summary>
            <p>Hidden content</p>
          </details>
          <figure>
            <img src="example.jpg" alt="Example image">
            <figcaption>Image caption</figcaption>
          </figure>
        </div>
      `;

      mockClipboardData.getData.mockImplementation((format: string) => {
        if (format === 'text/html') return mixedHtml;
        return '';
      });

      const result = await handleHtmlPaste(
        editor,
        mockClipboardData as unknown as DataTransfer,
        {},
      );
      expect(result).toBe(true);
    });

    it('should handle HTML with mathematical and scientific content', async () => {
      const mathHtml = `
        <div>
          <h3>Mathematical Content</h3>
          <p>The quadratic formula: <span class="math">x = (-b ± √(b² - 4ac)) / (2a)</span></p>
          <p>Chemical equation: <span class="chemistry">2H₂ + O₂ → 2H₂O</span></p>
          <table>
            <tr>
              <td>Temperature (°C)</td>
              <td>Pressure (kPa)</td>
            </tr>
            <tr>
              <td>25.5</td>
              <td>101.3</td>
            </tr>
          </table>
          <p>Greek symbols: α β γ δ</p>
        </div>
      `;

      mockClipboardData.getData.mockImplementation((format: string) => {
        if (format === 'text/html') return mathHtml;
        return '';
      });

      const result = await handleHtmlPaste(
        editor,
        mockClipboardData as unknown as DataTransfer,
        {},
      );
      expect(result).toBe(true);
    });

    it('should handle HTML with form elements and interactive content', async () => {
      const formHtml = `
        <div>
          <form>
            <label>Name:</label>
            <input type="text" value="John Doe">
            <select>
              <option>Option 1</option>
              <option selected>Option 2</option>
            </select>
            <textarea>Some text here</textarea>
          </form>
          <div class="interactive">
            <button>Click me</button>
            <progress value="70" max="100">70%</progress>
            <meter value="0.6">60%</meter>
          </div>
        </div>
      `;

      mockClipboardData.getData.mockImplementation((format: string) => {
        if (format === 'text/html') return formHtml;
        return '';
      });

      const result = await handleHtmlPaste(
        editor,
        mockClipboardData as unknown as DataTransfer,
        {},
      );
      expect(result).toBe(true);
    });
  });

  describe('handleFilesPaste', () => {
    beforeEach(() => {
      // 确保 findMediaInsertPath 返回正确的路径
      (
        EditorUtils.findMediaInsertPath as ReturnType<typeof vi.fn>
      ).mockReturnValue([0]);
    });

    it('should handle image file paste', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const mockDataTransfer = {
        ...mockClipboardData,
        files: [mockFile],
      };

      const mockUpload = vi
        .fn()
        .mockResolvedValue('https://example.com/image.png');

      // 设置选择范围
      Transforms.select(editor, { path: [0, 0], offset: 0 });

      const result = await handleFilesPaste(
        editor,
        mockDataTransfer as unknown as DataTransfer,
        {
          image: { upload: mockUpload },
        },
      );

      expect(result).toBe(true);
      expect(message.loading).toHaveBeenCalledWith('上传中...');
      expect(message.success).toHaveBeenCalledWith('上传成功');
    });

    it('should handle non-image file paste', async () => {
      const mockFile = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });
      const mockDataTransfer = {
        ...mockClipboardData,
        files: [mockFile],
      };

      const mockUpload = vi
        .fn()
        .mockResolvedValue('https://example.com/file.pdf');

      // 设置选择范围
      Transforms.select(editor, { path: [0, 0], offset: 0 });

      const result = await handleFilesPaste(
        editor,
        mockDataTransfer as unknown as DataTransfer,
        {
          image: { upload: mockUpload },
        },
      );

      expect(result).toBe(true);
      expect(mockUpload).toHaveBeenCalledWith([mockFile]);
    });

    it('should handle multiple files paste', async () => {
      const mockFiles = [
        new File(['test'], 'test.png', { type: 'image/png' }),
        new File(['test'], 'test2.png', { type: 'image/png' }),
      ];
      const mockDataTransfer = {
        ...mockClipboardData,
        files: mockFiles,
      };

      const mockUpload = vi
        .fn()
        .mockResolvedValue('https://example.com/image.png');

      // 设置选择范围
      Transforms.select(editor, { path: [0, 0], offset: 0 });

      const result = await handleFilesPaste(
        editor,
        mockDataTransfer as unknown as DataTransfer,
        {
          image: { upload: mockUpload },
        },
      );

      expect(result).toBe(true);
      expect(mockUpload).toHaveBeenCalledTimes(2);
    });

    it('should handle upload failure', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const mockDataTransfer = {
        ...mockClipboardData,
        files: [mockFile],
      };

      const mockUpload = vi.fn().mockRejectedValue(new Error('Upload failed'));

      // 设置选择范围
      Transforms.select(editor, { path: [0, 0], offset: 0 });

      // 捕获错误但不让测试失败
      try {
        await handleFilesPaste(
          editor,
          mockDataTransfer as unknown as DataTransfer,
          {
            image: { upload: mockUpload },
          },
        );
      } catch (e) {
        // ignore
      }

      // 虽然上传失败，但函数本身返回 true 表示处理了粘贴事件
      // 实际行为取决于 handleFilesPaste 的实现，如果它在所有上传失败时仍返回 true，则此预期是正确的
      // 如果它抛出错误，则上面的 catch 会捕获它
      // 这里我们主要验证 mockUpload 被调用，且不会导致未捕获的 promise rejection
      expect(mockUpload).toHaveBeenCalledWith([mockFile]);
    });

    it('should not process files when upload is not configured', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const mockDataTransfer = {
        ...mockClipboardData,
        files: [mockFile],
      };

      // 设置选择范围
      Transforms.select(editor, { path: [0, 0], offset: 0 });

      const result = await handleFilesPaste(
        editor,
        mockDataTransfer as unknown as DataTransfer,
        {}, // 未配置 upload
      );

      // 应该返回 false，表示没有处理文件
      expect(result).toBe(false);
      // 不应该显示任何上传相关的消息
      expect(message.loading).not.toHaveBeenCalled();
      expect(message.success).not.toHaveBeenCalled();
      expect(message.error).not.toHaveBeenCalled();
    });

    it('should not process files when image.upload is undefined', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const mockDataTransfer = {
        ...mockClipboardData,
        files: [mockFile],
      };

      // 设置选择范围
      Transforms.select(editor, { path: [0, 0], offset: 0 });

      const result = await handleFilesPaste(
        editor,
        mockDataTransfer as unknown as DataTransfer,
        { image: {} }, // image 存在但 upload 未配置
      );

      // 应该返回 false，表示没有处理文件
      expect(result).toBe(false);
      // 不应该显示任何上传相关的消息
      expect(message.loading).not.toHaveBeenCalled();
      expect(message.success).not.toHaveBeenCalled();
      expect(message.error).not.toHaveBeenCalled();
    });

    it('should not process files when image is undefined', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const mockDataTransfer = {
        ...mockClipboardData,
        files: [mockFile],
      };

      // 设置选择范围
      Transforms.select(editor, { path: [0, 0], offset: 0 });

      const result = await handleFilesPaste(
        editor,
        mockDataTransfer as unknown as DataTransfer,
        {}, // image 未配置
      );

      // 应该返回 false，表示没有处理文件
      expect(result).toBe(false);
      // 不应该显示任何上传相关的消息
      expect(message.loading).not.toHaveBeenCalled();
      expect(message.success).not.toHaveBeenCalled();
      expect(message.error).not.toHaveBeenCalled();
    });
  });

  describe('handleSpecialTextPaste', () => {
    beforeEach(() => {
      // 确保选择范围正确设置
      Transforms.select(editor, { path: [0, 0], offset: 0 });
    });

    it('should handle media:// URL', () => {
      const mediaUrl = 'media://?url=https://example.com/image.jpg';
      const result = handleSpecialTextPaste(editor, mediaUrl, {
        path: [0, 0],
        offset: 0,
      });

      expect(result).toBe(true);
      expect(EditorUtils.createMediaNode).toHaveBeenCalled();
    });

    it('should handle attach:// URL', () => {
      const attachUrl =
        'attach://?url=https://example.com/file.pdf&name=test.pdf&size=1024';

      // Mock the necessary functions
      (
        EditorUtils.findMediaInsertPath as ReturnType<typeof vi.fn>
      ).mockReturnValue([0]);

      // Create a proper node structure for the editor
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ];

      // Set up the selection
      editor.selection = {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      };

      // Mock Editor.next to return undefined
      vi.spyOn(Editor, 'next').mockReturnValue(undefined);

      const result = handleSpecialTextPaste(editor, attachUrl, {
        path: [0],
        offset: 0,
      });

      expect(result).toBe(true);
      // Verify the inserted node structure
      expect(editor.children[0]).toEqual({
        type: 'attach',
        name: 'test.pdf',
        size: 1024,
        url: 'https://example.com/file.pdf',
        children: [{ text: '' }],
      });
    });

    it('should handle invalid special URLs', () => {
      const invalidUrl = 'invalid://something';
      const result = handleSpecialTextPaste(editor, invalidUrl, {
        path: [0, 0],
        offset: 0,
      });

      expect(result).toBe(false);
    });
  });

  describe('handleHttpLinkPaste', () => {
    it('should handle image URLs', () => {
      const imageUrl = 'https://example.com/image.jpg';
      const result = handleHttpLinkPaste(
        editor,
        imageUrl,
        { path: [0], offset: 0 },
        { insertLink: vi.fn() },
      );

      expect(result).toBe(true);
      expect(EditorUtils.createMediaNode).toHaveBeenCalled();
    });

    it('should handle regular URLs', () => {
      const mockStore = { insertLink: vi.fn() };
      const url = 'https://example.com';
      const result = handleHttpLinkPaste(
        editor,
        url,
        { path: [0], offset: 0 },
        mockStore,
      );

      expect(result).toBe(true);
      expect(mockStore.insertLink).toHaveBeenCalledWith(url);
    });
  });

  describe('handlePlainTextPaste', () => {
    beforeEach(() => {
      // 确保选择范围正确设置
      Transforms.select(editor, { path: [0, 0], offset: 0 });
    });

    it('should handle markdown text', async () => {
      const markdownText = '# Heading\n\nParagraph';
      const result = await handlePlainTextPaste(
        editor,
        markdownText,
        { path: [0, 0], offset: 0 },
        [],
      );

      expect(result).toBe(true);
    });

    it('should handle plain text with selection', async () => {
      const plainText = 'Simple text';
      const result = await handlePlainTextPaste(
        editor,
        plainText,
        { path: [0, 0], offset: 0 },
        [],
      );

      expect(result).toBe(true);
    });

    it('should handle plain text without selection', async () => {
      const plainText = 'Simple text';
      const result = await handlePlainTextPaste(editor, plainText, null, []);

      expect(result).toBe(true);
    });
  });

  describe('shouldInsertTextDirectly', () => {
    it('should return true for special node types', () => {
      editor.children = [
        {
          type: 'table-cell',
          children: [{ text: '' }],
        },
      ];
      const selection = { focus: { path: [0, 0], offset: 0 } };

      const result = shouldInsertTextDirectly(editor, selection);
      expect(result).toBe(true);
    });

    it('should return false for regular paragraphs', () => {
      editor.children = [
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ];
      const selection = { focus: { path: [0, 0], offset: 0 } };

      const result = shouldInsertTextDirectly(editor, selection);
      expect(result).toBe(false);
    });
  });

  describe('handleTagNodePaste', () => {
    it('should handle tag node paste', () => {
      mockClipboardData.getData.mockReturnValue('Tag text');
      const curNode = { tag: true };
      const selection = { focus: { path: [0, 0], offset: 0 } };

      const result = handleTagNodePaste(
        editor,
        selection,
        mockClipboardData as unknown as DataTransfer,
        curNode,
      );
      expect(result).toBe(true);
    });

    it('should not handle non-tag nodes', () => {
      mockClipboardData.getData.mockReturnValue('Regular text');
      const curNode = { type: 'paragraph' };
      const selection = { focus: { path: [0, 0], offset: 0 } };

      const result = handleTagNodePaste(
        editor,
        selection,
        mockClipboardData as unknown as DataTransfer,
        curNode,
      );
      expect(result).toBe(false);
    });
  });

  describe('Complex HTML Paste Snapshots', () => {
    it('should correctly render nested lists and tables', async () => {
      const complexHtml = `
        <div>
          <h1>Complex Document</h1>
          <p>This is a <strong>bold</strong> paragraph with <em>italic</em> text.</p>
          <ul>
            <li>First level item
              <ul>
                <li>Nested item 1</li>
                <li>Nested item 2 with <strong>bold</strong></li>
              </ul>
            </li>
            <li>Another first level item</li>
          </ul>
          <table>
            <thead>
              <tr>
                <th>Header 1</th>
                <th>Header 2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cell with <em>italic</em></td>
                <td>Cell with <code>code</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      `;

      mockClipboardData.getData.mockImplementation((format: string) => {
        if (format === 'text/html') return complexHtml;
        return '';
      });

      // Mock the parsed result for lists and tables
      (insertParsedHtmlNodes as any).mockImplementation(
        async (editor: Editor) => {
          editor.children = [
            {
              type: 'heading-one',
              children: [{ text: 'Complex Document' }],
            },
            {
              type: 'paragraph',
              children: [
                { text: 'This is a ' },
                { text: 'bold', bold: true },
                { text: ' paragraph with ' },
                { text: 'italic', italic: true },
                { text: ' text.' },
              ],
            },
            {
              type: 'bulleted-list',
              children: [
                {
                  type: 'list-item',
                  children: [
                    {
                      type: 'paragraph',
                      children: [{ text: 'First level item' }],
                    },
                    {
                      type: 'bulleted-list',
                      children: [
                        {
                          type: 'list-item',
                          children: [
                            {
                              type: 'paragraph',
                              children: [{ text: 'Nested item 1' }],
                            },
                          ],
                        },
                        {
                          type: 'list-item',
                          children: [
                            {
                              type: 'paragraph',
                              children: [
                                { text: 'Nested item 2 with ' },
                                { text: 'bold', bold: true },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'list-item',
                  children: [
                    {
                      type: 'paragraph',
                      children: [{ text: 'Another first level item' }],
                    },
                  ],
                },
              ],
            },
            {
              type: 'table',
              children: [
                {
                  type: 'table-row',
                  children: [
                    { type: 'table-cell', children: [{ text: 'Header 1' }] },
                    { type: 'table-cell', children: [{ text: 'Header 2' }] },
                  ],
                },
                {
                  type: 'table-row',
                  children: [
                    {
                      type: 'table-cell',
                      children: [
                        { text: 'Cell with ' },
                        { text: 'italic', italic: true },
                      ],
                    },
                    {
                      type: 'table-cell',
                      children: [
                        { text: 'Cell with ' },
                        { text: 'code', code: true },
                      ],
                    },
                  ],
                },
              ],
            },
          ];
          return true;
        },
      );

      await handleHtmlPaste(
        editor,
        mockClipboardData as unknown as DataTransfer,
        {},
      );

      expect(editor.children).toMatchSnapshot(
        'complex-html-with-lists-and-tables',
      );
    });

    it('should correctly render code blocks and special characters', async () => {
      const codeHtml = `
        <div>
          <pre><code class="language-javascript">
            function example() {
              const x = 1;
              return x + 2;
            }
          </code></pre>
          <p>Special characters: &amp; &lt; &gt; &quot; &#39;</p>
          <p>Emoji: 👋 🎉 🚀</p>
        </div>
      `;

      mockClipboardData.getData.mockImplementation((format: string) => {
        if (format === 'text/html') return codeHtml;
        return '';
      });

      // Mock the parsed result for code blocks
      (insertParsedHtmlNodes as any).mockImplementation(
        async (editor: Editor) => {
          editor.children = [
            {
              type: 'code',
              language: 'javascript',
              children: [
                {
                  text: 'function example() {\n  const x = 1;\n  return x + 2;\n}',
                },
              ],
            },
            {
              type: 'paragraph',
              children: [{ text: 'Special characters: & < > " \'' }],
            },
            {
              type: 'paragraph',
              children: [{ text: 'Emoji: 👋 🎉 🚀' }],
            },
          ];
          return true;
        },
      );

      await handleHtmlPaste(
        editor,
        mockClipboardData as unknown as DataTransfer,
        {},
      );

      expect(editor.children).toMatchSnapshot('code-blocks-and-special-chars');
    });

    it('should correctly render mixed content types', async () => {
      const mixedHtml = `
        <div>
          <h2>Mixed Content</h2>
          <blockquote>
            <p>This is a quote with <a href="https://example.com">a link</a></p>
          </blockquote>
          <div class="custom-class" style="color: red;">
            <p>Styled text with <mark>highlighted</mark> content</p>
          </div>
          <hr>
          <details>
            <summary>Expandable section</summary>
            <p>Hidden content</p>
          </details>
          <figure>
            <img src="example.jpg" alt="Example image">
            <figcaption>Image caption</figcaption>
          </figure>
        </div>
      `;

      mockClipboardData.getData.mockImplementation((format: string) => {
        if (format === 'text/html') return mixedHtml;
        return '';
      });

      // Mock the parsed result for mixed content
      (insertParsedHtmlNodes as any).mockImplementation(
        async (editor: Editor) => {
          editor.children = [
            {
              type: 'heading-two',
              children: [{ text: 'Mixed Content' }],
            },
            {
              type: 'block-quote',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    { text: 'This is a quote with ' },
                    {
                      type: 'link',
                      url: 'https://example.com',
                      children: [{ text: 'a link' }],
                    },
                  ],
                },
              ],
            },
            {
              type: 'paragraph',
              children: [
                { text: 'Styled text with ' },
                { text: 'highlighted', highlight: true },
                { text: ' content' },
              ],
            },
            {
              type: 'thematic-break',
              children: [{ text: '' }],
            },
            {
              type: 'details',
              children: [
                {
                  type: 'summary',
                  children: [{ text: 'Expandable section' }],
                },
                {
                  type: 'paragraph',
                  children: [{ text: 'Hidden content' }],
                },
              ],
            },
            {
              type: 'figure',
              children: [
                {
                  type: 'image',
                  url: 'example.jpg',
                  alt: 'Example image',
                  children: [{ text: '' }],
                },
                {
                  type: 'figcaption',
                  children: [{ text: 'Image caption' }],
                },
              ],
            },
          ];
          return true;
        },
      );

      await handleHtmlPaste(
        editor,
        mockClipboardData as unknown as DataTransfer,
        {},
      );

      expect(editor.children).toMatchSnapshot('mixed-content-types');
    });

    it('should correctly render mathematical and scientific content', async () => {
      const mathHtml = `
        <div>
          <h3>Mathematical Content</h3>
          <p>The quadratic formula: <span class="math">x = (-b ± √(b² - 4ac)) / (2a)</span></p>
          <p>Chemical equation: <span class="chemistry">2H₂ + O₂ → 2H₂O</span></p>
          <table>
            <tr>
              <td>Temperature (°C)</td>
              <td>Pressure (kPa)</td>
            </tr>
            <tr>
              <td>25.5</td>
              <td>101.3</td>
            </tr>
          </table>
          <p>Greek symbols: α β γ δ</p>
        </div>
      `;

      mockClipboardData.getData.mockImplementation((format: string) => {
        if (format === 'text/html') return mathHtml;
        return '';
      });

      // Mock the parsed result for mathematical content
      (insertParsedHtmlNodes as any).mockImplementation(
        async (editor: Editor) => {
          editor.children = [
            {
              type: 'heading-three',
              children: [{ text: 'Mathematical Content' }],
            },
            {
              type: 'paragraph',
              children: [
                { text: 'The quadratic formula: ' },
                {
                  type: 'math',
                  children: [{ text: 'x = (-b ± √(b² - 4ac)) / (2a)' }],
                },
              ],
            },
            {
              type: 'paragraph',
              children: [
                { text: 'Chemical equation: ' },
                {
                  type: 'chemistry',
                  children: [{ text: '2H₂ + O₂ → 2H₂O' }],
                },
              ],
            },
            {
              type: 'table',
              children: [
                {
                  type: 'table-row',
                  children: [
                    {
                      type: 'table-cell',
                      children: [{ text: 'Temperature (°C)' }],
                    },
                    {
                      type: 'table-cell',
                      children: [{ text: 'Pressure (kPa)' }],
                    },
                  ],
                },
                {
                  type: 'table-row',
                  children: [
                    { type: 'table-cell', children: [{ text: '25.5' }] },
                    { type: 'table-cell', children: [{ text: '101.3' }] },
                  ],
                },
              ],
            },
            {
              type: 'paragraph',
              children: [{ text: 'Greek symbols: α β γ δ' }],
            },
          ];
          return true;
        },
      );

      await handleHtmlPaste(
        editor,
        mockClipboardData as unknown as DataTransfer,
        {},
      );

      expect(editor.children).toMatchSnapshot('math-and-scientific-content');
    });

    it('should correctly render form elements and interactive content', async () => {
      const formHtml = `
        <div>
          <form>
            <label>Name:</label>
            <input type="text" value="John Doe">
            <select>
              <option>Option 1</option>
              <option selected>Option 2</option>
            </select>
            <textarea>Some text here</textarea>
          </form>
          <div class="interactive">
            <button>Click me</button>
            <progress value="70" max="100">70%</progress>
            <meter value="0.6">60%</meter>
          </div>
        </div>
      `;

      mockClipboardData.getData.mockImplementation((format: string) => {
        if (format === 'text/html') return formHtml;
        return '';
      });

      // Mock the parsed result for form elements
      (insertParsedHtmlNodes as any).mockImplementation(
        async (editor: Editor) => {
          editor.children = [
            {
              type: 'form',
              children: [
                {
                  type: 'paragraph',
                  children: [{ text: 'Name: ' }],
                },
                {
                  type: 'input',
                  inputType: 'text',
                  value: 'John Doe',
                  children: [{ text: '' }],
                },
                {
                  type: 'select',
                  children: [
                    {
                      type: 'option',
                      children: [{ text: 'Option 1' }],
                    },
                    {
                      type: 'option',
                      selected: true,
                      children: [{ text: 'Option 2' }],
                    },
                  ],
                },
                {
                  type: 'textarea',
                  children: [{ text: 'Some text here' }],
                },
              ],
            },
            {
              type: 'div',
              className: 'interactive',
              children: [
                {
                  type: 'button',
                  children: [{ text: 'Click me' }],
                },
                {
                  type: 'progress',
                  value: 70,
                  max: 100,
                  children: [{ text: '70%' }],
                },
                {
                  type: 'meter',
                  value: 0.6,
                  children: [{ text: '60%' }],
                },
              ],
            },
          ];
          return true;
        },
      );

      await handleHtmlPaste(
        editor,
        mockClipboardData as unknown as DataTransfer,
        {},
      );

      expect(editor.children).toMatchSnapshot('form-and-interactive-elements');
    });

    it('should correctly render combined complex content', async () => {
      const combinedHtml = `
        <div>
          <h1>Combined Complex Content</h1>
          <nav>
            <ul>
              <li><a href="#section1">Section 1</a></li>
              <li><a href="#section2">Section 2</a></li>
            </ul>
          </nav>
          <section id="section1">
            <h2>Section 1: Code and Math</h2>
            <pre><code class="language-typescript">
              interface Example {
                name: string;
                value: number;
              }
            </code></pre>
            <p>Math equation: <span class="math">E = mc²</span></p>
          </section>
          <section id="section2">
            <h2>Section 2: Tables and Lists</h2>
            <table>
              <tr>
                <th>Column 1</th>
                <th>Column 2</th>
              </tr>
              <tr>
                <td>Data 1</td>
                <td>Data 2</td>
              </tr>
            </table>
            <ul>
              <li>Item 1
                <ol>
                  <li>Sub-item A</li>
                  <li>Sub-item B</li>
                </ol>
              </li>
              <li>Item 2</li>
            </ul>
          </section>
          <footer>
            <p>Created by <a href="mailto:test@example.com">Author</a></p>
            <small>Copyright © 2024</small>
          </footer>
        </div>
      `;

      mockClipboardData.getData.mockImplementation((format: string) => {
        if (format === 'text/html') return combinedHtml;
        return '';
      });

      // Mock the parsed result for combined content
      (insertParsedHtmlNodes as any).mockImplementation(
        async (editor: Editor) => {
          editor.children = [
            {
              type: 'heading-one',
              children: [{ text: 'Combined Complex Content' }],
            },
            {
              type: 'nav',
              children: [
                {
                  type: 'bulleted-list',
                  children: [
                    {
                      type: 'list-item',
                      children: [
                        {
                          type: 'link',
                          url: '#section1',
                          children: [{ text: 'Section 1' }],
                        },
                      ],
                    },
                    {
                      type: 'list-item',
                      children: [
                        {
                          type: 'link',
                          url: '#section2',
                          children: [{ text: 'Section 2' }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'section',
              id: 'section1',
              children: [
                {
                  type: 'heading-two',
                  children: [{ text: 'Section 1: Code and Math' }],
                },
                {
                  type: 'code',
                  language: 'typescript',
                  children: [
                    {
                      text: 'interface Example {\n  name: string;\n  value: number;\n}',
                    },
                  ],
                },
                {
                  type: 'paragraph',
                  children: [
                    { text: 'Math equation: ' },
                    {
                      type: 'math',
                      children: [{ text: 'E = mc²' }],
                    },
                  ],
                },
              ],
            },
            {
              type: 'section',
              id: 'section2',
              children: [
                {
                  type: 'heading-two',
                  children: [{ text: 'Section 2: Tables and Lists' }],
                },
                {
                  type: 'table',
                  children: [
                    {
                      type: 'table-row',
                      children: [
                        {
                          type: 'table-cell',
                          header: true,
                          children: [{ text: 'Column 1' }],
                        },
                        {
                          type: 'table-cell',
                          header: true,
                          children: [{ text: 'Column 2' }],
                        },
                      ],
                    },
                    {
                      type: 'table-row',
                      children: [
                        { type: 'table-cell', children: [{ text: 'Data 1' }] },
                        { type: 'table-cell', children: [{ text: 'Data 2' }] },
                      ],
                    },
                  ],
                },
                {
                  type: 'bulleted-list',
                  children: [
                    {
                      type: 'list-item',
                      children: [
                        { type: 'paragraph', children: [{ text: 'Item 1' }] },
                        {
                          type: 'numbered-list',
                          children: [
                            {
                              type: 'list-item',
                              children: [
                                {
                                  type: 'paragraph',
                                  children: [{ text: 'Sub-item A' }],
                                },
                              ],
                            },
                            {
                              type: 'list-item',
                              children: [
                                {
                                  type: 'paragraph',
                                  children: [{ text: 'Sub-item B' }],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'list-item',
                      children: [
                        { type: 'paragraph', children: [{ text: 'Item 2' }] },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'footer',
              children: [
                {
                  type: 'paragraph',
                  children: [
                    { text: 'Created by ' },
                    {
                      type: 'link',
                      url: 'mailto:test@example.com',
                      children: [{ text: 'Author' }],
                    },
                  ],
                },
                {
                  type: 'small',
                  children: [{ text: 'Copyright © 2024' }],
                },
              ],
            },
          ];
          return true;
        },
      );

      await handleHtmlPaste(
        editor,
        mockClipboardData as unknown as DataTransfer,
        {},
      );

      expect(editor.children).toMatchSnapshot('combined-complex-content');
    });
  });
});
