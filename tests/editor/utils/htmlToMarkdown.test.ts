import { describe, expect, it } from 'vitest';
import {
  batchHtmlToMarkdown,
  cleanHtml,
  extractTextFromHtml,
  htmlToMarkdown,
  isHtml,
  type HtmlToMarkdownOptions,
} from '../../../src/MarkdownEditor/editor/utils/htmlToMarkdown';

describe('HTML to Markdown Utils', () => {
  describe('htmlToMarkdown', () => {
    it('应该将基本 HTML 转换为 Markdown', () => {
      const html = '<h1>标题</h1><p>这是一个段落。</p>';
      const result = htmlToMarkdown(html);
      expect(result).toBe('# 标题\n\n这是一个段落。\n\n');
    });

    it('应该处理空字符串', () => {
      const result = htmlToMarkdown('');
      expect(result).toBe('');
    });

    it('应该处理 null 和 undefined', () => {
      expect(htmlToMarkdown(null as any)).toBe('');
      expect(htmlToMarkdown(undefined as any)).toBe('');
    });

    it('应该转换标题', () => {
      const html = '<h1>一级标题</h1><h2>二级标题</h2><h3>三级标题</h3>';
      const result = htmlToMarkdown(html);
      expect(result).toBe('# 一级标题\n\n## 二级标题\n\n### 三级标题\n\n');
    });

    it('应该转换粗体和斜体', () => {
      const html = '<p>这是<strong>粗体</strong>和<em>斜体</em>文本。</p>';
      const result = htmlToMarkdown(html);
      expect(result).toBe('这是**粗体**和*斜体*文本。\n\n');
    });

    it('应该转换链接', () => {
      const html = '<p>访问<a href="https://example.com">示例网站</a></p>';
      const result = htmlToMarkdown(html);
      expect(result).toBe('访问[示例网站](https://example.com)\n\n');
    });

    it('应该转换图片', () => {
      const html = '<img src="image.jpg" alt="图片描述" title="图片标题">';
      const result = htmlToMarkdown(html);
      expect(result).toBe('![图片描述](image.jpg "图片标题")');
    });

    it('应该转换代码块', () => {
      const html =
        '<pre><code class="language-javascript">console.log("Hello");</code></pre>';
      const result = htmlToMarkdown(html);
      expect(result).toBe('```javascript\nconsole.log("Hello");\n```\n\n');
    });

    it('应该转换内联代码', () => {
      const html = '<p>使用<code>console.log()</code>函数</p>';
      const result = htmlToMarkdown(html);
      expect(result).toBe('使用`console.log()`函数\n\n');
    });

    it('应该转换列表', () => {
      const html = '<ul><li>项目1</li><li>项目2</li></ul>';
      const result = htmlToMarkdown(html);
      expect(result).toBe('- 项目1\n- 项目2\n\n');
    });

    it('应该转换有序列表', () => {
      const html = '<ol><li>第一项</li><li>第二项</li></ol>';
      const result = htmlToMarkdown(html);
      expect(result).toBe('1. 第一项\n2. 第二项\n\n');
    });

    it('应该转换表格', () => {
      const html =
        '<table><tr><th>姓名</th><th>年龄</th></tr><tr><td>张三</td><td>25</td></tr><tr><td>李四</td><td>30</td></tr></table>';
      const result = htmlToMarkdown(html);
      expect(result).toBe(
        '| 姓名 | 年龄 |\n| --- | --- |\n| 张三 | 25 |\n| 李四 | 30 |\n',
      );
    });

    it('应该转换引用块', () => {
      const html = '<blockquote>这是一个引用。</blockquote>';
      const result = htmlToMarkdown(html);
      expect(result).toBe('> 这是一个引用。\n\n');
    });

    it('应该处理自定义图片处理器', () => {
      const html = '<img src="image.jpg" alt="图片">';
      const options: HtmlToMarkdownOptions = {
        imageHandler: (src, alt) => `![${alt}](${src}?processed)`,
      };
      const result = htmlToMarkdown(html, options);
      expect(result).toBe('![图片](image.jpg?processed)');
    });

    it('应该处理自定义链接处理器', () => {
      const html = '<a href="https://example.com">链接</a>';
      const options: HtmlToMarkdownOptions = {
        linkHandler: (href, text) => `[${text}](${href}?processed)`,
      };
      const result = htmlToMarkdown(html, options);
      expect(result).toBe('[链接](https://example.com?processed)');
    });

    it('preserveComments 为 true 时应保留 HTML 注释 (37-38)', () => {
      const html = '<p>before</p><!-- comment --><p>after</p>';
      const result = htmlToMarkdown(html, { preserveComments: true });
      expect(result).toContain('<!-- comment -->');
    });

    it('preserveComments 为 false 时应忽略 HTML 注释 (37, 41)', () => {
      const html = '<p>before</p><!-- comment --><p>after</p>';
      const result = htmlToMarkdown(html, { preserveComments: false });
      expect(result).not.toContain('<!-- comment -->');
      expect(result).toContain('before');
      expect(result).toContain('after');
    });

    it('空表格应返回空字符串 (112)', () => {
      const html = '<table></table>';
      const result = htmlToMarkdown(html);
      expect(result).toBe('');
    });

    it('应转换 br 为换行 (181)', () => {
      const html = '<p>line1<br>line2</p>';
      const result = htmlToMarkdown(html);
      expect(result).toContain('\n');
      expect(result).toContain('line1');
      expect(result).toContain('line2');
    });

    it('应转换 b 标签为粗体 (183)', () => {
      const html = '<p>text <b>bold</b> end</p>';
      const result = htmlToMarkdown(html);
      expect(result).toBe('text **bold** end\n\n');
    });

    it('应转换 i 标签为斜体 (185)', () => {
      const html = '<p>text <i>italic</i> end</p>';
      const result = htmlToMarkdown(html);
      expect(result).toBe('text *italic* end\n\n');
    });

    it('应转换内联 code 标签 (191)', () => {
      const html = '<p>use <code>fn()</code> here</p>';
      const result = htmlToMarkdown(html);
      expect(result).toBe('use `fn()` here\n\n');
    });

    it('pre 内无 code 子元素时应使用 textContent (214)', () => {
      const html = '<pre>plain text\nno code tag</pre>';
      const result = htmlToMarkdown(html);
      expect(result).toBe('```\nplain text\nno code tag\n```\n\n');
    });

    it('应转换 div 为段落式换行 (246)', () => {
      const html = '<div>div content</div>';
      const result = htmlToMarkdown(html);
      expect(result).toBe('div content\n\n');
    });

    it('应转换 span 为内联无换行 (249)', () => {
      const html = '<p><span>span content</span></p>';
      const result = htmlToMarkdown(html);
      expect(result).toBe('span content\n\n');
    });

    it('未知标签应走 default 返回 children (252)', () => {
      const html = '<article>article content</article>';
      const result = htmlToMarkdown(html);
      expect(result).toBe('article content');
    });
  });

  describe('batchHtmlToMarkdown', () => {
    it('应该批量转换 HTML 片段', () => {
      const htmlFragments = [
        '<h1>标题1</h1>',
        '<p>段落1</p>',
        '<h2>标题2</h2>',
      ];
      const results = batchHtmlToMarkdown(htmlFragments);
      expect(results).toEqual(['# 标题1\n\n', '段落1\n\n', '## 标题2\n\n']);
    });
  });

  describe('cleanHtml', () => {
    it('应该清理 HTML 中的多余空白', () => {
      const html = '  <p>  内容  </p>  ';
      const result = cleanHtml(html);
      expect(result).toBe('<p>内容</p>');
    });
  });

  describe('isHtml', () => {
    it('应该检测 HTML 字符串', () => {
      expect(isHtml('<p>内容</p>')).toBe(true);
      expect(isHtml('<div>内容</div>')).toBe(true);
      expect(isHtml('普通文本')).toBe(false);
      expect(isHtml('')).toBe(false);
      expect(isHtml('   ')).toBe(false);
    });
  });

  describe('extractTextFromHtml', () => {
    it('应该从 HTML 中提取纯文本', () => {
      const html = '<h1>标题</h1><p>这是<strong>粗体</strong>文本。</p>';
      const result = extractTextFromHtml(html);
      expect(result).toBe('标题这是粗体文本。');
    });

    it('应该处理空 HTML', () => {
      expect(extractTextFromHtml('')).toBe('');
    });
  });
});
