import { describe, expect, it } from 'vitest';
import {
  markdownToHtml,
  markdownToHtmlSync,
} from '../src/MarkdownEditor/editor/utils/markdownToHtml';

describe('Markdown to HTML Safe Conversion Tests', () => {
  const testMarkdown = `FTAI Infrastructure在2025-08-09宣布了一项价值10亿美元的铁路资产收购。

- FTAI Infrastructure的核心价值在于其高盈利的铁路资产Transtar，该资产贡献了公司**57%**的收入。
- 公司近期达成协议，计划扩展其铁路业务，因为铁路是其主要的利润来源，而其他资产处于不同的盈利阶段。
- FTAI Infrastructure还可能从一级铁路整合中的去监管化剥离交易中获益。`;

  describe('markdownToHtml - Async Version', () => {
    it('should convert markdown with inline code correctly', async () => {
      const html = await markdownToHtml(testMarkdown);

      // 验证HTML结构
      expect(html).toContain(
        '<p>FTAI Infrastructure在2025-08-09宣布了一项价值10亿美元的铁路资产收购。</p>',
      );

      // 验证列表转换
      expect(html).toContain('<ul>');
      expect(html).toContain('<li>');
      expect(html).toContain('</ul>');

      // 验证粗体文本
      expect(html).toContain('<strong>57%</strong>');

      // 基本验证：确保没有原始的 markdown 语法残留
      expect(html).not.toContain('**');
    });

    it('should handle empty markdown', async () => {
      const html = await markdownToHtml('');
      expect(html).toBe('');
    });

    it('should handle markdown with special characters', async () => {
      const specialMarkdown = `# Test & <script>alert('xss')</script>
      
Text with "quotes" and & symbols.`;

      const html = await markdownToHtml(specialMarkdown);

      // 验证HTML转义 - 使用实际的转义格式
      expect(html).toContain("<script>alert('xss')</script>"); // 脚本标签会被保留（因为 allowDangerousHtml: true）
      expect(html).toContain('&#x26;'); // & 符号被转义
      expect(html).toContain('<script>alert'); // 脚本标签被保留
    });
  });

  describe('markdownToHtmlSync - Sync Version', () => {
    it('should convert markdown with inline code correctly (sync)', () => {
      const html = markdownToHtmlSync(testMarkdown);

      // 验证HTML结构
      expect(html).toContain(
        '<p>FTAI Infrastructure在2025-08-09宣布了一项价值10亿美元的铁路资产收购。</p>',
      );

      // 验证列表转换
      expect(html).toContain('<ul>');
      expect(html).toContain('<li>');
      expect(html).toContain('</ul>');

      // 验证粗体文本
      expect(html).toContain('<strong>57%</strong>');

      // 基本验证：确保没有原始的 markdown 语法残留
      expect(html).not.toContain('**');
    });

    it('should produce same result as async version', async () => {
      const asyncHtml = await markdownToHtml(testMarkdown);
      const syncHtml = markdownToHtmlSync(testMarkdown);

      expect(syncHtml).toBe(asyncHtml);
    });
  });

  describe('Code Block Handling', () => {
    it('should handle various code block scenarios', async () => {
      const codeMarkdown = `
# Code Examples

Inline code: \`console.log('hello')\`

Block code:
\`\`\`javascript
function test() {
  return 'hello world';
}
\`\`\`

Multiple inline codes: \`const a = 1\` and \`const b = 2\`
`;

      const html = await markdownToHtml(codeMarkdown);

      // 验证内联代码
      expect(html).toContain("<code>console.log('hello')</code>");
      expect(html).toContain('<code>const a = 1</code>');
      expect(html).toContain('<code>const b = 2</code>');

      // 验证代码块 - 现在包含 data-block 和 data-state 属性
      expect(html).toContain('<pre><code class="language-javascript"');
      expect(html).toContain('data-block="true"');
      expect(html).toContain('function test()');
      // 内容可能被HTML转义，检查转义后的格式
      expect(
        html.includes("return 'hello world';") ||
          html.includes('return &#x26;#39;hello world&#x26;#39;;') ||
          html.includes('return &#39;hello world&#39;;'),
      ).toBe(true);
    });

    it('should handle edge cases with backticks', async () => {
      const edgeCases = `
Text with single backtick at end\`
Text with backtick in \`middle\` of sentence
Text with multiple backticks \`\`not code\`\`
Empty code: \`\`
`;

      const html = await markdownToHtml(edgeCases);

      // 验证基本的 HTML 结构生成
      expect(html).toContain('<p>');
      expect(typeof html).toBe('string');
    });
  });

  describe('Security and Safety', () => {
    it('should safely handle potentially dangerous markdown', async () => {
      const dangerousMarkdown = `
# Safe Test

\`<script>alert('xss')</script>\`

[Click me](javascript:alert('xss'))

<img src="x" onerror="alert('xss')">

\`\`\`html
<script>alert('safe in code block')</script>
\`\`\`
`;

      const html = await markdownToHtml(dangerousMarkdown);

      // 验证代码块中的脚本被安全处理 - 使用实际的转义格式
      expect(html).toContain(
        "<code>&#x3C;script>alert('xss')&#x3C;/script></code>",
      );

      // 验证JavaScript链接 - 允许，因为 allowDangerousHtml: true
      expect(html).toContain('javascript:alert');

      // 验证代码块中的内容被安全显示
      // 代码块中的内容被HTML转义，格式可能为 &#x26;lt; 或 &lt;
      expect(
        html.includes('&#x3C;script>alert') ||
          html.includes('&#x26;lt;script&#x26;gt;alert') ||
          html.includes('&lt;script&gt;alert'),
      ).toBe(true);
      // 验证代码块存在
      expect(html).toContain('<pre><code class="language-html"');
    });
  });

  describe('Performance and Error Handling', () => {
    it('should handle large markdown content', async () => {
      const largeMarkdown =
        `# Large Content\n\n` +
        Array(100)
          .fill('This is a line with `inline code` and **bold text**.')
          .join('\n\n');

      const startTime = Date.now();
      const html = await markdownToHtml(largeMarkdown);
      const endTime = Date.now();

      expect(html).toContain('<h1>Large Content</h1>');
      expect(html).toContain('<code>inline code</code>');
      expect(html).toContain('<strong>bold text</strong>');

      console.log(`Processing time: ${endTime - startTime}ms`);
      expect(endTime - startTime).toBeLessThan(1000); // 应该在1秒内完成
    });

    it('should handle malformed markdown gracefully', async () => {
      const malformedMarkdown = `
# Incomplete

\`\`\`
unclosed code block

**unclosed bold

[incomplete link](
`;

      const html = await markdownToHtml(malformedMarkdown);

      // 应该仍然生成有效的HTML，即使markdown格式不完整
      expect(html).toContain('<h1>Incomplete</h1>');
      expect(typeof html).toBe('string');
      expect(html.length).toBeGreaterThan(0);
    });
  });
});
