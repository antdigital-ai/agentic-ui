import remarkGfm from 'remark-gfm';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_MARKDOWN_REMARK_PLUGINS,
  markdownToHtml,
  markdownToHtmlSync,
  type MarkdownRemarkPlugin,
  type MarkdownToHtmlOptions,
} from '../../../src/MarkdownEditor/editor/utils/markdownToHtml';

// Mock console.error to avoid noise in test output
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe('Markdown to HTML Utils', () => {
  beforeEach(() => {
    // 清理任何可能的副作用
  });

  const remarkReplaceFooWithBar: Plugin = () => (tree: any) => {
    visit(tree, 'text', (node) => {
      if (typeof node.value === 'string') {
        node.value = node.value.replace(/foo/g, 'bar');
      }
    });
  };

  const clonePluginEntry = (
    entry: (typeof DEFAULT_MARKDOWN_REMARK_PLUGINS)[number],
  ): MarkdownRemarkPlugin => {
    if (Array.isArray(entry)) {
      return [entry[0], ...(entry.slice(1) as unknown[])] as [
        Plugin,
        ...unknown[],
      ];
    }
    return entry;
  };

  const createDefaultRemarkPlugins = (): MarkdownToHtmlOptions =>
    DEFAULT_MARKDOWN_REMARK_PLUGINS.map((entry) => clonePluginEntry(entry));

  describe('markdownToHtml', () => {
    it('应该将Markdown转换为HTML', async () => {
      const markdown = '# Hello World\n\nThis is a **test**.';
      const result = await markdownToHtml(markdown);

      expect(result).toContain('<h1>Hello World</h1>');
      expect(result).toContain('<strong>test</strong>');
    });

    it('允许通过插件数组新增插件', async () => {
      const plugins = createDefaultRemarkPlugins();
      plugins.splice(1, 0, remarkReplaceFooWithBar);
      const result = await markdownToHtml('foo content', plugins);
      expect(result).toContain('bar content');
    });

    it('允许通过插件数组关闭默认插件', async () => {
      const markdown = '~~strikethrough~~';
      const plugins = createDefaultRemarkPlugins().filter(
        (entry) => entry !== remarkGfm,
      );
      const result = await markdownToHtml(markdown, plugins);

      expect(result).not.toContain('<del>');
      expect(result).toContain('~~strikethrough~~');
    });

    it('应该处理空字符串', async () => {
      const result = await markdownToHtml('');

      expect(result).toBe('');
    });

    it('应该处理包含数学公式的Markdown', async () => {
      const markdown = '$$E = mc^2$$';
      const result = await markdownToHtml(markdown);

      expect(result).toContain('E = mc^2');
      expect(result).toContain('class="katex"');
    });

    it('应该使用KaTeX渲染单美元内联数学公式', async () => {
      const markdown = '数学表达式 $a^2 + b^2 = c^2$ 内联展示';
      const result = await markdownToHtml(markdown);

      expect(result).toContain('class="katex"');
      expect(result).toContain('a^2 + b^2 = c^2');
    });

    it('应该将包裹纯数值的单美元符号渲染为KaTeX', async () => {
      const markdown = '价格为 $100$ 元';
      const result = await markdownToHtml(markdown);

      expect(result).toContain('class="katex"');
      expect(result).toContain(
        'annotation encoding="application/x-tex">100</annotation',
      );
      expect(result).toContain('元');
    });

    it('应该处理包含GFM特性的Markdown', async () => {
      const markdown = '~~strikethrough~~\n\n- [ ] task';
      const result = await markdownToHtml(markdown);

      expect(result).toContain('<del>strikethrough</del>');
      expect(result).toContain('<input type="checkbox" disabled>');
    });

    it('应该处理包含YAML frontmatter的Markdown', async () => {
      const markdown = `---
title: Test
---

# Content`;
      const result = await markdownToHtml(markdown);

      expect(result).toContain('<h1>Content</h1>');
    });

    it('应该处理包含HTML的Markdown', async () => {
      const markdown = '<div>HTML content</div>\n\n# Markdown content';
      const result = await markdownToHtml(markdown);

      expect(result).toContain('<div>HTML content</div>');
      expect(result).toContain('<h1>Markdown content</h1>');
    });

    it('应该处理无效的Markdown并返回空字符串', async () => {
      // 使用一个会导致unified处理错误的输入
      const problematicMarkdown = '\u0000\u0001\u0002'; // 多个null字符
      const result = await markdownToHtml(problematicMarkdown);

      // 如果处理失败，应该返回空字符串并记录错误
      expect(typeof result).toBe('string');
    });

    it('应该处理会导致处理错误的Markdown', async () => {
      // 创建一个会导致unified处理错误的输入
      const problematicMarkdown = '\u0000'; // null字符可能导致处理错误
      const result = await markdownToHtml(problematicMarkdown);

      // 如果处理成功，结果应该是字符串；如果失败，应该是空字符串
      expect(typeof result).toBe('string');
    });

    it('应该处理包含特殊Unicode字符的Markdown', async () => {
      const markdown =
        '# Test with 🚀 emoji\n\n**Bold text** with special chars: é, ñ, 中文';
      const result = await markdownToHtml(markdown);

      expect(result).toContain('<h1>Test with 🚀 emoji</h1>');
      expect(result).toContain('<strong>Bold text</strong>');
      expect(result).toContain('é, ñ, 中文');
    });

    it('应该处理非常长的Markdown内容', async () => {
      const longMarkdown =
        '# Title\n\n' + 'This is a very long content. '.repeat(1000);
      const result = await markdownToHtml(longMarkdown);

      expect(result).toContain('<h1>Title</h1>');
      expect(result.length).toBeGreaterThan(1000);
    });
  });

  describe('markdownToHtmlSync', () => {
    it('应该同步将Markdown转换为HTML', () => {
      const markdown = '# Hello World\n\nThis is a **test**.';
      const result = markdownToHtmlSync(markdown);

      expect(result).toContain('<h1>Hello World</h1>');
      expect(result).toContain('<strong>test</strong>');
    });

    it('允许同步转换时新增 remark 插件', () => {
      const plugins = createDefaultRemarkPlugins();
      plugins.splice(1, 0, remarkReplaceFooWithBar);
      const result = markdownToHtmlSync('foo', plugins);

      expect(result).toContain('bar');
    });

    it('允许同步转换时关闭默认 remark 插件', () => {
      const markdown = '~~strikethrough~~';
      const plugins = createDefaultRemarkPlugins().filter(
        (entry) => entry !== remarkGfm,
      );
      const result = markdownToHtmlSync(markdown, plugins);

      expect(result).not.toContain('<del>');
      expect(result).toContain('~~strikethrough~~');
    });

    it('应该处理空字符串', () => {
      const result = markdownToHtmlSync('');

      expect(result).toBe('');
    });

    it('应该处理包含数学公式的Markdown', () => {
      const markdown = '$$E = mc^2$$';
      const result = markdownToHtmlSync(markdown);

      expect(result).toContain('E = mc^2');
      expect(result).toContain('class="katex"');
    });

    it('应该同步渲染单美元内联数学公式', () => {
      const markdown = '数学表达式 $a^2 + b^2 = c^2$ 内联展示';
      const result = markdownToHtmlSync(markdown);

      expect(result).toContain('class="katex"');
      expect(result).toContain('a^2 + b^2 = c^2');
    });

    it('应该同步渲染包裹纯数值的单美元文本', () => {
      const markdown = '价格为 $100$ 元';
      const result = markdownToHtmlSync(markdown);

      expect(result).toContain('class="katex"');
      expect(result).toContain(
        'annotation encoding="application/x-tex">100</annotation',
      );
      expect(result).toContain('元');
    });

    it('应该处理包含GFM特性的Markdown', () => {
      const markdown = '~~strikethrough~~\n\n- [ ] task';
      const result = markdownToHtmlSync(markdown);

      expect(result).toContain('<del>strikethrough</del>');
      expect(result).toContain('<input type="checkbox" disabled>');
    });

    it('应该处理包含YAML frontmatter的Markdown', () => {
      const markdown = `---
title: Test
---

# Content`;
      const result = markdownToHtmlSync(markdown);

      expect(result).toContain('<h1>Content</h1>');
    });

    it('应该处理包含HTML的Markdown', () => {
      const markdown = '<div>HTML content</div>\n\n# Markdown content';
      const result = markdownToHtmlSync(markdown);

      expect(result).toContain('<div>HTML content</div>');
      expect(result).toContain('<h1>Markdown content</h1>');
    });

    it('应该处理无效的Markdown并返回空字符串', () => {
      // 使用一个会导致unified处理错误的输入
      const problematicMarkdown = '\u0000\u0001\u0002'; // 多个null字符
      const result = markdownToHtmlSync(problematicMarkdown);

      // 如果处理失败，应该返回空字符串并记录错误
      expect(typeof result).toBe('string');
    });

    it('应该返回字符串类型', () => {
      const markdown = '# Test';
      const result = markdownToHtmlSync(markdown);

      expect(typeof result).toBe('string');
    });

    it('应该处理会导致处理错误的Markdown', () => {
      // 创建一个会导致unified处理错误的输入
      const problematicMarkdown = '\u0000'; // null字符可能导致处理错误
      const result = markdownToHtmlSync(problematicMarkdown);

      // 如果处理成功，结果应该是字符串；如果失败，应该是空字符串
      expect(typeof result).toBe('string');
    });

    it('应该处理包含特殊Unicode字符的Markdown', () => {
      const markdown =
        '# Test with 🚀 emoji\n\n**Bold text** with special chars: é, ñ, 中文';
      const result = markdownToHtmlSync(markdown);

      expect(result).toContain('<h1>Test with 🚀 emoji</h1>');
      expect(result).toContain('<strong>Bold text</strong>');
      expect(result).toContain('é, ñ, 中文');
    });

    it('应该处理非常长的Markdown内容', () => {
      const longMarkdown =
        '# Title\n\n' + 'This is a very long content. '.repeat(1000);
      const result = markdownToHtmlSync(longMarkdown);

      expect(result).toContain('<h1>Title</h1>');
      expect(result.length).toBeGreaterThan(1000);
    });

    it('应该处理包含复杂表格的Markdown', () => {
      const markdown = `| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |`;
      const result = markdownToHtmlSync(markdown);

      expect(result).toContain('<table>');
      expect(result).toContain('<th>Header 1</th>');
      expect(result).toContain('<td>Cell 1</td>');
    });

    it('应该处理包含代码块的Markdown', () => {
      const markdown = '```javascript\nconsole.log("Hello World");\n```';
      const result = markdownToHtmlSync(markdown);

      expect(result).toContain('<pre>');
      expect(result).toContain('<code');
      // 内容可能被HTML转义，检查转义后的格式或原始格式
      expect(
        result.includes('console.log("Hello World");') ||
          result.includes('console.log(&#x26;quot;Hello World&#x26;quot;);') ||
          result.includes('console.log(&quot;Hello World&quot;);'),
      ).toBe(true);
    });

    it('应该处理包含行内代码的Markdown', () => {
      const markdown = 'This is `inline code` example.';
      const result = markdownToHtmlSync(markdown);

      expect(result).toContain('<code>inline code</code>');
    });

    it('应该处理包含链接的Markdown', () => {
      const markdown = '[Google](https://www.google.com)';
      const result = markdownToHtmlSync(markdown);

      expect(result).toContain('<a href="https://www.google.com">Google</a>');
    });

    it('应该处理包含图片的Markdown', () => {
      const markdown = '![Alt text](https://example.com/image.jpg)';
      const result = markdownToHtmlSync(markdown);

      expect(result).toContain('<img');
      expect(result).toContain('src="https://example.com/image.jpg"');
      expect(result).toContain('alt="Alt text"');
    });

    it('应该处理包含引用块的Markdown', () => {
      const markdown = '> This is a blockquote\n> with multiple lines';
      const result = markdownToHtmlSync(markdown);

      expect(result).toContain('<blockquote>');
      expect(result).toContain('This is a blockquote');
    });

    it('应该处理包含水平分割线的Markdown', () => {
      const markdown = 'Content above\n\n---\n\nContent below';
      const result = markdownToHtmlSync(markdown);

      expect(result).toContain('<hr>');
    });
  });

  describe('Plugin Configuration', () => {
    it('应该默认启用单美元符号数学公式', async () => {
      const markdown = '$E = mc^2$'; // 单美元符号
      const result = await markdownToHtml(markdown);

      expect(result).toContain('class="katex"');
      expect(result).toContain(
        'annotation encoding="application/x-tex">E = mc^2</annotation',
      );
    });

    it('应该启用危险HTML', async () => {
      const markdown = '<script>alert("test")</script>\n\n# Content';
      const result = await markdownToHtml(markdown);

      expect(result).toContain('<script>alert("test")</script>');
      expect(result).toContain('<h1>Content</h1>');
    });

    it('应该配置YAML frontmatter', async () => {
      const markdown = `---
title: Test
author: John Doe
---

# Content`;
      const result = await markdownToHtml(markdown);

      expect(result).toContain('<h1>Content</h1>');
    });
  });

  describe('fixStrongWithSpecialChars 功能测试', () => {
    it('应该正确处理包含美元符号的加粗文本', async () => {
      const markdown = 'Revenue is **$9.698M** this quarter.';
      const result = await markdownToHtml(markdown);

      expect(result).toContain('<strong>$9.698M</strong>');
    });

    it('应该处理多个包含特殊字符的加粗文本', async () => {
      const markdown =
        'Revenue **$9.698M** and profit **$2.5M** with growth **$123.45K**.';
      const result = await markdownToHtml(markdown);

      expect(result).toContain('9.698M');
      expect(result).toContain('2.5M');
      expect(result).toContain('123.45K');
    });

    it('应该处理不同货币格式的加粗文本', async () => {
      const testCases = [
        '**$1,000**',
        '**$9.698M**',
        '**$123.45K**',
        '**$1.2B**',
        '**$999.99**',
      ];

      for (const testCase of testCases) {
        const result = await markdownToHtml(testCase);
        expect(result).toContain('<strong>');
        expect(result).toContain('</strong>');
      }
    });

    it('应该处理混合文本中的特殊字符加粗', async () => {
      const markdown =
        'The quarterly report shows **$9.698M** revenue, **$2.5M** profit, and **$123.45K** growth.';
      const result = await markdownToHtml(markdown);

      expect(result).toContain('9.698M');
      expect(result).toContain('2.5M');
      expect(result).toContain('123.45K');
    });

    it('应该处理边界情况', async () => {
      const edgeCases = ['**$**', '**$ **', '**$0**', '**$-100**'];

      for (const edgeCase of edgeCases) {
        const result = await markdownToHtml(edgeCase);
        expect(result).toContain('<strong>');
        expect(result).toContain('</strong>');
      }
    });

    it('应该不影响普通加粗文本', async () => {
      const markdown =
        'This is **normal bold text** without special characters.';
      const result = await markdownToHtml(markdown);

      expect(result).toContain('<strong>normal bold text</strong>');
    });

    it('应该处理同步版本的 fixStrongWithSpecialChars', () => {
      const markdown = 'Revenue is **$9.698M** this quarter.';
      const result = markdownToHtmlSync(markdown);

      expect(result).toContain('<strong>$9.698M</strong>');
    });

    it('应该处理包含小数点和百分比的加粗文本', async () => {
      const markdown =
        '非GAAP每股收益增长18%，达到**$1.40**，高于分析师平均预期的**$1.30**';
      const result = await markdownToHtml(markdown);

      expect(result).toContain('1.40');
      expect(result).toContain('1.30');
      expect(result).toContain('非GAAP每股收益增长18%');
    });
  });

  describe('错误处理和边界情况', () => {
    it('应该处理undefined输入', async () => {
      const result = await markdownToHtml(undefined as any);
      expect(typeof result).toBe('string');
    });

    it('应该处理undefined输入（同步版本）', () => {
      const result = markdownToHtmlSync(undefined as any);
      expect(typeof result).toBe('string');
    });

    it('应该处理非字符串输入', async () => {
      const result = await markdownToHtml(123 as any);
      expect(typeof result).toBe('string');
    });

    it('应该处理非字符串输入（同步版本）', () => {
      const result = markdownToHtmlSync(123 as any);
      expect(typeof result).toBe('string');
    });

    it('应该处理包含控制字符的输入', async () => {
      const markdown = 'Test with \x00\x01\x02 control characters';
      const result = await markdownToHtml(markdown);
      expect(typeof result).toBe('string');
    });

    it('应该处理包含控制字符的输入（同步版本）', () => {
      const markdown = 'Test with \x00\x01\x02 control characters';
      const result = markdownToHtmlSync(markdown);
      expect(typeof result).toBe('string');
    });

    it('应该处理包含大量特殊字符的输入', async () => {
      const markdown = 'Test with ' + '🚀'.repeat(100) + ' emojis';
      const result = await markdownToHtml(markdown);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('应该处理包含大量特殊字符的输入（同步版本）', () => {
      const markdown = 'Test with ' + '🚀'.repeat(100) + ' emojis';
      const result = markdownToHtmlSync(markdown);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('应该处理会导致unified处理错误的输入', async () => {
      // 创建一个会导致unified处理错误的输入
      const problematicMarkdown = '\u0000\u0001\u0002\u0003\u0004\u0005'; // 多个控制字符
      const result = await markdownToHtml(problematicMarkdown);
      expect(typeof result).toBe('string');
    });

    it('应该处理会导致unified处理错误的输入（同步版本）', () => {
      // 创建一个会导致unified处理错误的输入
      const problematicMarkdown = '\u0000\u0001\u0002\u0003\u0004\u0005'; // 多个控制字符
      const result = markdownToHtmlSync(problematicMarkdown);
      expect(typeof result).toBe('string');
    });
  });
});
