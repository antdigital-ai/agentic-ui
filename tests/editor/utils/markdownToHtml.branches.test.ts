/**
 * markdownToHtml.ts 分支覆盖补充测试
 *
 * 目标覆盖行：77-78, 94-99, 110-114, 125, 131-132, 134, 253, 257, 264
 */
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  escapeHtml,
  markdownToHtml,
  markdownToHtmlSync,
} from '../../../src/MarkdownEditor/editor/utils/markdownToHtml';

const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalConsoleError;
});

describe('markdownToHtml 分支覆盖', () => {
  describe('escapeHtml — encode=false 且含需转义字符', () => {
    it('encode=undefined 时对 < 进行转义', () => {
      const result = escapeHtml('<div>hello</div>');
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
    });

    it('encode=false 时对引号转义', () => {
      const result = escapeHtml('"quoted" & \'apostrophe\'', false);
      expect(result).toContain('&quot;');
      expect(result).toContain('&#39;');
    });

    it('encode=false 时已转义的 &amp; 不再重复转义', () => {
      const result = escapeHtml('&amp; already escaped', false);
      // &amp; 匹配命名实体，不应被二次转义
      expect(result).toBe('&amp; already escaped');
    });

    it('encode=false 时无需转义的字符串原样返回', () => {
      const result = escapeHtml('plain text', false);
      expect(result).toBe('plain text');
    });
  });

  describe('config.openLinksInNewTab — 链接在新标签页打开', () => {
    it('同步：链接添加 target="_blank" 和 rel 属性', () => {
      const md = '[Google](https://www.google.com)';
      const result = markdownToHtmlSync(md, undefined, {
        openLinksInNewTab: true,
      });
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
      expect(result).toContain('href="https://www.google.com"');
    });

    it('异步：链接添加 target="_blank"', async () => {
      const md = 'Visit [Example](https://example.com) site';
      const result = await markdownToHtml(md, undefined, {
        openLinksInNewTab: true,
      });
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    it('未设置 openLinksInNewTab 时不添加 target', () => {
      const md = '[Link](https://example.com)';
      const result = markdownToHtmlSync(md);
      expect(result).not.toContain('target="_blank"');
    });
  });

  describe('config.paragraphTag — 自定义段落标签', () => {
    it('同步：段落标签替换为 div', () => {
      const md = 'Hello world\n\nSecond paragraph';
      const result = markdownToHtmlSync(md, undefined, {
        paragraphTag: 'div',
      });
      expect(result).toContain('<div>');
      expect(result).toContain('</div>');
      expect(result).not.toContain('<p>');
    });

    it('异步：段落标签替换为 section', async () => {
      const md = 'Content here';
      const result = await markdownToHtml(md, undefined, {
        paragraphTag: 'section',
      });
      expect(result).toContain('<section>');
      expect(result).toContain('</section>');
    });

    it('paragraphTag="p" 时不做替换', () => {
      const md = 'Normal paragraph';
      const result = markdownToHtmlSync(md, undefined, {
        paragraphTag: 'p',
      });
      expect(result).toContain('<p>');
    });
  });

  describe('config.markedConfig — 用户自定义 rehype 插件', () => {
    it('同步：自定义插件被应用', () => {
      const customPlugin: Plugin = () => (tree: any) => {
        visit(tree, 'element', (node: any) => {
          if (node.tagName === 'h1' && node.properties) {
            node.properties.id = 'custom-heading';
          }
        });
      };

      const md = '# My Heading';
      const result = markdownToHtmlSync(md, undefined, {
        markedConfig: [customPlugin],
      });
      expect(result).toContain('id="custom-heading"');
    });

    it('异步：自定义插件被应用', async () => {
      const customPlugin: Plugin = () => (tree: any) => {
        visit(tree, 'element', (node: any) => {
          if (node.tagName === 'strong' && node.properties) {
            node.properties.className = ['highlight'];
          }
        });
      };

      const md = '**bold text**';
      const result = await markdownToHtml(md, undefined, {
        markedConfig: [customPlugin],
      });
      expect(result).toContain('class="highlight"');
    });
  });

  describe('getCodeText — 嵌套元素和无 children', () => {
    it('代码块含嵌套 span 元素时递归提取文本', () => {
      // 通过 raw HTML 注入一个 pre>code 包含 span 子元素
      const md = `<pre><code class="language-html"><span>nested</span> text\n</code></pre>`;
      const result = markdownToHtmlSync(md);
      // rehypeCodeBlock 会处理这个代码块，getCodeText 递归处理 span
      expect(result).toContain('data-block="true"');
      expect(result).toContain('nested');
    });

    it('代码块无子节点时 getCodeText 返回空串', () => {
      // 空 code 元素，无 children
      const md = `<pre><code class="language-js"></code></pre>`;
      const result = markdownToHtmlSync(md);
      // 空代码块仍应正常渲染
      expect(result).toContain('<pre>');
      expect(result).toContain('<code');
    });

    it('代码块含多层嵌套元素', () => {
      const md = `<pre><code class="language-py"><span><em>deep</em></span> plain\n</code></pre>`;
      const result = markdownToHtmlSync(md);
      expect(result).toContain('deep');
      expect(result).toContain('plain');
    });

    it('代码块含 HTML 注释子节点时 getCodeText 返回空串', () => {
      // HTML 注释在 HAST 中的 type 是 'comment'，既不是 'text' 也不是 'element'
      const md = `<pre><code class="language-js">code<!-- comment -->more\n</code></pre>`;
      const result = markdownToHtmlSync(md);
      expect(result).toContain('<pre>');
      expect(result).toContain('code');
    });
  });

  /* ====== 组合配置 ====== */

  describe('多个配置选项同时使用', () => {
    it('同时启用 openLinksInNewTab + paragraphTag + markedConfig', async () => {
      const customPlugin: Plugin = () => (tree: any) => {
        visit(tree, 'element', (node: any) => {
          if (node.tagName === 'em' && node.properties) {
            node.properties['data-custom'] = 'true';
          }
        });
      };

      const md =
        'Hello *world* with [link](https://example.com)\n\nSecond para';
      const result = await markdownToHtml(md, undefined, {
        openLinksInNewTab: true,
        paragraphTag: 'div',
        markedConfig: [customPlugin],
      });

      expect(result).toContain('target="_blank"');
      expect(result).toContain('<div>');
      expect(result).not.toContain('<p>');
      expect(result).toContain('data-custom="true"');
    });
  });
});
