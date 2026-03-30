import { MarkdownEditor } from '@ant-design/agentic-ui';
import React from 'react';

const HTML_SAMPLE = `<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <title>七彩动画</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0f0f0f;
      font-family: system-ui, sans-serif;
    }
    .card {
      padding: 40px 60px;
      border-radius: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      text-align: center;
      box-shadow: 0 20px 60px rgba(102,126,234,0.4);
    }
    h1 { margin: 0 0 12px; font-size: 2rem; }
    p  { margin: 0 0 24px; opacity: 0.88; }
    button {
      padding: 10px 28px;
      border: none;
      border-radius: 8px;
      background: rgba(255,255,255,0.25);
      color: #fff;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: rgba(255,255,255,0.4); }
  </style>
</head>
<body>
  <div class="card">
    <h1>HTML 本地预览</h1>
    <p>点击下方按钮体验交互效果</p>
    <button onclick="this.textContent = this.textContent === '点我！' ? '✅ 已点击' : '点我！'">
      点我！
    </button>
  </div>
</body>
</html>`;

const MARKDOWN_SAMPLE = `# Markdown 本地预览

欢迎使用 **Markdown** 本地预览功能！

## 文本样式

- **粗体文本** 和 *斜体文本*
- ~~删除线~~ 和 \`行内代码\`

## 代码块

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet('World'));
\`\`\`

## 引用

> 本地预览会将 Markdown 转换为带样式的 HTML，并在新标签页中打开。

## 表格

| 功能 | 说明 |
| ---- | ---- |
| 内联预览 | 在编辑器内切换代码/预览模式 |
| 本地预览 | 在新标签页打开完整渲染结果 |

## 数学公式（KaTeX）

行内公式：$E = mc^2$

块级公式：

$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$
`;

const INIT_VALUE = `\`\`\`html
${HTML_SAMPLE}
\`\`\`

\`\`\`markdown
${MARKDOWN_SAMPLE}
\`\`\``;

const CodeLocalPreviewDemo: React.FC = () => {
  return (
    <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 8 }}>HTML / Markdown 本地预览</h2>
      <p style={{ color: '#666', marginBottom: 24, lineHeight: 1.6 }}>
        在只读模式下，<strong>HTML</strong> 和 <strong>Markdown</strong>{' '}
        代码块的工具栏会显示两个专属按钮：
      </p>
      <ul
        style={{
          color: '#555',
          lineHeight: 1.8,
          marginBottom: 24,
          paddingLeft: 20,
        }}
      >
        <li>
          <strong>预览 / 代码</strong>：在编辑器内切换内联渲染与源码视图
        </li>
        <li>
          <strong>本地预览（↗）</strong>
          ：将内容转换为完整 HTML 后，通过 Blob URL 在新标签页中打开，支持执行
          JavaScript（HTML）或渲染样式（Markdown）
        </li>
      </ul>

      <MarkdownEditor readonly initValue={INIT_VALUE} />

      <div
        style={{
          marginTop: 32,
          padding: '16px 20px',
          background: '#f6f8fa',
          borderRadius: 8,
          fontSize: 13,
          color: '#555',
          lineHeight: 1.7,
        }}
      >
        <strong>说明：</strong>
        <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
          <li>
            HTML 本地预览支持执行页面内的 JavaScript 交互（如按钮点击事件）
          </li>
          <li>
            Markdown 本地预览会自动套用 GitHub 风格样式，并加载 KaTeX 渲染公式
          </li>
          <li>本地预览使用 Blob URL，内容不会上传到任何服务器</li>
          <li>
            若 HTML 代码中包含 <code>&lt;script&gt;</code>、事件属性（onclick
            等）或 <code>javascript:</code>{' '}
            伪协议，编辑器内联预览将被禁用（安全沙箱限制），但本地预览仍可正常打开
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CodeLocalPreviewDemo;
