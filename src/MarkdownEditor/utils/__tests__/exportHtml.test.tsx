import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { exportHtml, generateHtmlDocument } from '../exportHtml';

describe('exportHtml utils', () => {
  // Mock DOM methods for testing
  const mockCreateObjectURL = vi.fn();
  const mockRevokeObjectURL = vi.fn();
  const mockAppendChild = vi.fn();
  const mockRemoveChild = vi.fn();
  const mockClick = vi.fn();

  beforeEach(() => {
    // Mock URL object
    global.URL = {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    } as any;

    // Mock document methods
    global.document = {
      createElement: vi.fn().mockReturnValue({
        href: '',
        download: '',
        click: mockClick,
      }),
      body: {
        appendChild: mockAppendChild,
        removeChild: mockRemoveChild,
      },
    } as any;

    // Mock Blob
    global.Blob = vi.fn().mockImplementation((content, options) => ({
      content,
      options,
      type: options?.type,
    })) as any;

    // Mock console.error
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Setup mock return values
    mockCreateObjectURL.mockReturnValue('blob:mock-url');
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('generateHtmlDocument', () => {
    it('应该生成基本的 HTML 文档', () => {
      const content = '<h1>Hello World</h1>';
      const result = generateHtmlDocument(content);

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<html>');
      expect(result).toContain('<head>');
      expect(result).toContain('<body>');
      expect(result).toContain(content);
      expect(result).toContain('</html>');
    });

    it('应该使用默认标题', () => {
      const content = '<p>Test content</p>';
      const result = generateHtmlDocument(content);

      expect(result).toContain('<title>Markdown Export</title>');
    });

    it('应该使用自定义标题', () => {
      const content = '<p>Test content</p>';
      const customTitle = 'My Custom Title';
      const result = generateHtmlDocument(content, customTitle);

      expect(result).toContain(`<title>${customTitle}</title>`);
    });

    it('应该包含默认样式', () => {
      const content = '<p>Test content</p>';
      const result = generateHtmlDocument(content);

      expect(result).toContain('font-family: -apple-system');
      expect(result).toContain('line-height: 1.6');
      expect(result).toContain('pre {');
      expect(result).toContain('code {');
      expect(result).toContain('blockquote {');
      expect(result).toContain('img {');
      expect(result).toContain('table {');
    });

    it('应该包含自定义样式', () => {
      const content = '<p>Test content</p>';
      const customStyles = '.custom { color: red; }';
      const result = generateHtmlDocument(content, 'Test', customStyles);

      expect(result).toContain(customStyles);
    });

    it('应该正确设置 meta 标签', () => {
      const content = '<p>Test content</p>';
      const result = generateHtmlDocument(content);

      expect(result).toContain('<meta charset="UTF-8">');
      expect(result).toContain(
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      );
    });

    it('应该处理空内容', () => {
      const result = generateHtmlDocument('');

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('<body>\n  \n</body>');
    });

    it('应该处理包含特殊字符的内容', () => {
      const content = '<p>Test & "quotes" <script>alert("xss")</script></p>';
      const result = generateHtmlDocument(content);

      expect(result).toContain(content);
    });

    it('应该处理多行内容', () => {
      const content = `<h1>Title</h1>
<p>Paragraph 1</p>
<p>Paragraph 2</p>`;
      const result = generateHtmlDocument(content);

      expect(result).toContain(content);
    });
  });

  describe('exportHtml', () => {
    it('应该创建 Blob 并触发下载', () => {
      const htmlContent = '<h1>Test</h1>';
      const filename = 'test.html';

      exportHtml(htmlContent, filename);

      // 验证 Blob 创建
      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining(htmlContent)],
        { type: 'text/html;charset=utf-8' },
      );

      // 验证 URL 创建
      expect(mockCreateObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'text/html;charset=utf-8',
        }),
      );

      // 验证 DOM 操作
      expect(global.document.createElement).toHaveBeenCalledWith('a');
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('应该使用默认文件名', () => {
      const htmlContent = '<h1>Test</h1>';
      const mockElement = {
        href: '',
        download: '',
        click: mockClick,
      };
      (global.document.createElement as any).mockReturnValue(mockElement);

      exportHtml(htmlContent);

      expect(mockElement.download).toBe('export.html');
    });

    it('应该使用自定义文件名', () => {
      const htmlContent = '<h1>Test</h1>';
      const customFilename = 'custom-export.html';
      const mockElement = {
        href: '',
        download: '',
        click: mockClick,
      };
      (global.document.createElement as any).mockReturnValue(mockElement);

      exportHtml(htmlContent, customFilename);

      expect(mockElement.download).toBe(customFilename);
    });

    it('应该设置正确的 href', () => {
      const htmlContent = '<h1>Test</h1>';
      const mockElement = {
        href: '',
        download: '',
        click: mockClick,
      };
      (global.document.createElement as any).mockReturnValue(mockElement);

      exportHtml(htmlContent);

      expect(mockElement.href).toBe('blob:mock-url');
    });

    it('应该在延迟后清理资源', async () => {
      const htmlContent = '<h1>Test</h1>';
      const mockElement = {
        href: '',
        download: '',
        click: mockClick,
      };
      (global.document.createElement as any).mockReturnValue(mockElement);

      exportHtml(htmlContent);

      // 验证立即调用的方法
      expect(mockAppendChild).toHaveBeenCalledWith(mockElement);
      expect(mockClick).toHaveBeenCalled();

      // 等待延迟清理
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 150);
      });

      expect(mockRemoveChild).toHaveBeenCalledWith(mockElement);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('应该处理导出错误', () => {
      // 模拟 Blob 构造函数抛出错误
      (global.Blob as any).mockImplementation(() => {
        throw new Error('Blob creation failed');
      });

      const htmlContent = '<h1>Test</h1>';

      expect(() => exportHtml(htmlContent)).not.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error exporting HTML:',
        expect.any(Error),
      );
    });

    it('应该处理 DOM 操作错误', () => {
      // 模拟 createElement 返回 null
      (global.document.createElement as any).mockReturnValue(null);

      const htmlContent = '<h1>Test</h1>';

      expect(() => exportHtml(htmlContent)).not.toThrow();
      expect(console.error).toHaveBeenCalledWith(
        'Error exporting HTML:',
        expect.any(Error),
      );
    });

    it('应该处理空内容', () => {
      const mockElement = {
        href: '',
        download: '',
        click: mockClick,
      };
      (global.document.createElement as any).mockReturnValue(mockElement);

      exportHtml('');

      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining('<!DOCTYPE html>')],
        { type: 'text/html;charset=utf-8' },
      );
    });

    it('应该处理包含复杂HTML的内容', () => {
      const complexHtml = `
        <div class="container">
          <h1>Title with <em>emphasis</em></h1>
          <table>
            <thead>
              <tr><th>Column 1</th><th>Column 2</th></tr>
            </thead>
            <tbody>
              <tr><td>Data 1</td><td>Data 2</td></tr>
            </tbody>
          </table>
          <pre><code>function test() { return true; }</code></pre>
          <blockquote>This is a quote</blockquote>
          <img src="test.jpg" alt="Test image" />
        </div>
      `;

      const mockElement = {
        href: '',
        download: '',
        click: mockClick,
      };
      (global.document.createElement as any).mockReturnValue(mockElement);

      exportHtml(complexHtml, 'complex.html');

      expect(global.Blob).toHaveBeenCalledWith(
        [expect.stringContaining(complexHtml)],
        { type: 'text/html;charset=utf-8' },
      );
      expect(mockElement.download).toBe('complex.html');
    });
  });

  describe('集成测试', () => {
    it('应该生成包含完整文档结构的可导出HTML', () => {
      const content = '<h1>Integration Test</h1><p>This is a test.</p>';
      const title = 'Integration Test Document';
      const styles = '.test { background: yellow; }';

      const mockElement = {
        href: '',
        download: '',
        click: mockClick,
      };
      (global.document.createElement as any).mockReturnValue(mockElement);

      exportHtml(
        generateHtmlDocument(content, title, styles),
        'integration-test.html',
      );

      // 验证生成的HTML包含所有预期元素
      const generatedHtml = (global.Blob as any).mock.calls[0][0][0];

      expect(generatedHtml).toContain('<!DOCTYPE html>');
      expect(generatedHtml).toContain(`<title>${title}</title>`);
      expect(generatedHtml).toContain(content);
      expect(generatedHtml).toContain(styles);
      expect(generatedHtml).toContain('font-family: -apple-system');

      // 验证下载参数
      expect(mockElement.download).toBe('integration-test.html');
    });

    it('应该处理包含特殊字符的标题和内容', () => {
      const content = '<p>Content with "quotes" & symbols</p>';
      const title = 'Title with <special> & "characters"';

      const mockElement = {
        href: '',
        download: '',
        click: mockClick,
      };
      (global.document.createElement as any).mockReturnValue(mockElement);

      exportHtml(generateHtmlDocument(content, title), 'special-chars.html');

      const generatedHtml = (global.Blob as any).mock.calls[0][0][0];

      expect(generatedHtml).toContain(`<title>${title}</title>`);
      expect(generatedHtml).toContain(content);
    });
  });
});
