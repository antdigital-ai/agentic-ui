import { describe, expect, it } from 'vitest';
import {
  markdownToHtml,
  markdownToHtmlSync,
} from '../../MarkdownEditor/editor/utils/markdownToHtml';

describe('rehypeSanitizeUserHtml', () => {
  describe('危险元素过滤', () => {
    it('应移除 script 元素', async () => {
      const result = await markdownToHtml(
        '<script>alert("xss")</script>\n\nSafe content',
      );
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
      expect(result).toContain('Safe content');
    });

    it('应移除 style 元素', async () => {
      const result = await markdownToHtml(
        '<style>body{color:red}</style>\n\nSafe content',
      );
      expect(result).not.toContain('<style>');
      expect(result).not.toContain('body{color:red}');
      expect(result).toContain('Safe content');
    });

    it('应移除 noscript 元素', async () => {
      const result = await markdownToHtml(
        '<noscript>fallback</noscript>\n\nSafe content',
      );
      expect(result).not.toContain('<noscript>');
      expect(result).toContain('Safe content');
    });
  });

  describe('结构性元素解包', () => {
    it('应解包 html/head/body 元素，保留安全子节点', async () => {
      const html =
        '<!DOCTYPE html><html><head><title>Test</title></head><body><p>Content</p></body></html>';
      const result = await markdownToHtml(html);
      expect(result).not.toContain('<html>');
      expect(result).not.toContain('<head>');
      expect(result).not.toContain('<body>');
      expect(result).not.toContain('<title>');
      expect(result).toContain('<p>Content</p>');
    });

    it('应移除 meta/link/base 元素', async () => {
      const result = await markdownToHtml(
        '<meta charset="utf-8">\n\n<link rel="stylesheet" href="x.css">\n\nSafe',
      );
      expect(result).not.toContain('<meta');
      expect(result).not.toContain('<link');
      expect(result).toContain('Safe');
    });
  });

  describe('表单元素处理', () => {
    it('应保留 input[type=checkbox]（GFM 任务列表）', async () => {
      const result = markdownToHtmlSync('~~strikethrough~~\n\n- [ ] task');
      expect(result).toContain('<input type="checkbox" disabled>');
    });

    it('应移除非 checkbox 的 input 元素', async () => {
      const result = await markdownToHtml(
        '<input type="text" value="hack">\n\nSafe',
      );
      expect(result).not.toContain('<input');
      expect(result).toContain('Safe');
    });

    it('应解包 button 元素，保留文本', async () => {
      const result = await markdownToHtml(
        '<button onclick="alert(1)">Click me</button>\n\nSafe',
      );
      expect(result).not.toContain('<button');
      expect(result).not.toContain('onclick');
      expect(result).toContain('Click me');
    });

    it('应解包 form 元素，保留子节点文本', async () => {
      const result = await markdownToHtml(
        '<form action="/submit"><button>Submit</button></form>\n\nSafe',
      );
      expect(result).not.toContain('<form');
      expect(result).toContain('Submit');
    });
  });

  describe('危险属性清理', () => {
    it('应移除 on* 事件属性', async () => {
      const result = await markdownToHtml(
        '<div onclick="alert(1)" onmouseover="alert(2)">Safe</div>',
      );
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('onmouseover');
      expect(result).toContain('Safe');
    });

    it('应将含 onerror 的 img 降级为纯文本', async () => {
      const result = await markdownToHtml('<img src="x" onerror="alert(1)">');
      expect(result).not.toMatch(/<img[\s>]/i);
      expect(result).toMatch(/&#x3C;img|&lt;img/i);
      expect(result).toMatch(/onerror|onError/i);
    });

    it('应将 javascript: 链接降级为纯文本', async () => {
      const result = await markdownToHtml(
        '<a href="javascript:alert(1)">link</a>',
      );
      expect(result).not.toMatch(/<a[\s>]/i);
      expect(result).toContain('javascript:');
      expect(result).toMatch(/&#x3C;a|&lt;a/i);
    });

    it('应将含事件处理器的视频降级为纯文本', async () => {
      const result = await markdownToHtml(
        'Safe\n\n<video src="movie.mp4" onerror="alert(1)"></video>',
      );

      expect(result).toContain('Safe');
      expect(result).not.toMatch(/<video[\s>]/i);
      expect(result).toMatch(/&#x3C;video|&lt;video/i);
      expect(result).toMatch(/onerror|onError/i);
    });

    it('应将危险 source URL 降级为纯文本', async () => {
      const result = await markdownToHtml(
        '<video controls><source src="javascript:alert(1)"></video>',
      );

      expect(result).toMatch(/<video[\s>]/i);
      expect(result).not.toMatch(/<source[\s>]/i);
      expect(result).toContain('javascript:alert(1)');
      expect(result).toMatch(/&#x3C;source|&lt;source/i);
    });
  });

  describe('安全元素保留', () => {
    it('应保留安全的 HTML 元素', async () => {
      const result = await markdownToHtml(
        '<div><h1>Title</h1><p>Paragraph</p></div>',
      );
      expect(result).toContain('<h1>Title</h1>');
      expect(result).toContain('<p>Paragraph</p>');
    });

    it('应保留安全的链接', async () => {
      const result = await markdownToHtml(
        '<a href="https://example.com">link</a>',
      );
      expect(result).toContain('href="https://example.com"');
    });

    it('应保留安全的图片', async () => {
      const result = await markdownToHtml(
        '<img src="https://example.com/img.png" alt="test">',
      );
      expect(result).toContain('src="https://example.com/img.png"');
    });
  });

  describe('完整 HTML 文档处理', () => {
    it('应正确处理用户输入的完整 HTML 文档', async () => {
      const userHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>我的第一个网页</title>
  <style>body { font-family: Arial; }</style>
</head>
<body>
  <h1>欢迎来到我的世界</h1>
  <p>这是一个由 HTML 构建的简单网页示例。</p>
  <button onclick="changeText()">点击我改变文字</button>
  <img src="https://via.placeholder.com/400x200" alt="示例图片">
  <script>function changeText() { document.querySelector('p').innerText = "改变了！"; }</script>
</body>
</html>`;
      const result = await markdownToHtml(userHtml);

      // 危险元素应被移除
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('<style>');
      expect(result).not.toContain('<meta');
      expect(result).not.toContain('<title>');
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('changeText');

      // 结构性元素应被解包
      expect(result).not.toContain('<html');
      expect(result).not.toContain('<head>');
      expect(result).not.toContain('<body>');

      // 安全内容应被保留
      expect(result).toContain('<h1>欢迎来到我的世界</h1>');
      expect(result).toContain('<p>这是一个由 HTML 构建的简单网页示例。</p>');
      expect(result).toContain('点击我改变文字');
      expect(result).toContain('src="https://via.placeholder.com/400x200"');
    });
  });
});
