/**
 * @fileoverview HTML和Markdown源码预览模式切换演示
 * 展示HTML和Markdown代码块的源码和预览模式切换功能
 */

import { MarkdownEditor } from '@ant-design/agentic-ui';
import React from 'react';

const htmlCode = `<div style="padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px;">
  <h2>HTML 预览演示</h2>
  <p>这是一个HTML代码块的预览模式演示。</p>
  <ul>
    <li>支持HTML渲染</li>
    <li>支持CSS样式</li>
    <li>支持交互元素</li>
  </ul>
  <button onclick="alert('Hello from HTML!')" style="background: #ff6b6b; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
    点击我
  </button>
</div>`;

const markdownCode = `# Markdown 预览演示

这是一个 **Markdown** 代码块的预览模式演示。

## 功能特性

- ✅ 支持标题渲染
- ✅ 支持**粗体**和*斜体*文本
- ✅ 支持代码块

\`\`\`javascript
function hello() {
  console.log("Hello from Markdown!");
}
\`\`\`

> 这是一个引用块

[链接示例](https://example.com)

## 列表

1. 有序列表项 1
2. 有序列表项 2
3. 有序列表项 3

- 无序列表项 A
- 无序列表项 B
- 无序列表项 C`;

const HtmlMarkdownPreviewDemo: React.FC = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>HTML 和 Markdown 源码预览模式切换演示</h1>

      <div style={{ marginBottom: '40px' }}>
        <h2>HTML 代码块演示</h2>
        <p>
          在只读模式下，HTML代码块会显示切换按钮，可以在源码和预览模式之间切换：
        </p>
        <MarkdownEditor
          readonly
          initValue={`\`\`\`html
${htmlCode}
\`\`\``}
        />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>Markdown 代码块演示</h2>
        <p>
          在只读模式下，Markdown代码块也会显示切换按钮，可以在源码和预览模式之间切换：
        </p>
        <MarkdownEditor
          readonly
          initValue={`\`\`\`markdown
${markdownCode}
\`\`\``}
        />
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2>其他语言代码块</h2>
        <p>其他语言的代码块不会显示切换按钮，只显示常规的工具栏：</p>
        <MarkdownEditor
          readonly
          initValue={`\`\`\`javascript
function example() {
  console.log("这是JavaScript代码");
  return "Hello World";
}
\`\`\``}
        />
      </div>

      <div
        style={{
          background: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '40px',
        }}
      >
        <h3>使用说明</h3>
        <ul>
          <li>
            <strong>HTML代码块</strong>
            ：在只读模式下会显示眼睛图标按钮，点击可在源码和HTML预览之间切换
          </li>
          <li>
            <strong>Markdown代码块</strong>
            ：在只读模式下会显示眼睛图标按钮，点击可在源码和Markdown预览之间切换
          </li>
          <li>
            <strong>其他语言</strong>
            ：JavaScript、Python等语言的代码块不会显示切换按钮
          </li>
          <li>
            <strong>编辑模式</strong>
            ：在编辑模式下，所有代码块都显示为编辑器，不显示切换按钮
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HtmlMarkdownPreviewDemo;
