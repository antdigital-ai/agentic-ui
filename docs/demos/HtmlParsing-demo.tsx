import { MarkdownEditor } from '@ant-design/agentic-ui';
import React, { useState } from 'react';

/**
 * HTML 解析演示
 *
 * 展示编辑器如何处理各种 HTML 标签
 */
const HtmlParsingDemo: React.FC = () => {
  const [value, setValue] = useState(`# HTML 标签解析演示

本演示展示编辑器如何处理各种 HTML 标签。

---

## 1. 特殊标签：<think>

think 标签会被转换为特殊的思考块（在只读模式下有专门的 UI）：

<think>这是一个思考过程，会被转换为特殊的思考块组件</think>

<think>
可以包含多行内容：

1. 第一步分析
2. 第二步实现
3. 第三步验证

还可以嵌套代码块：

\`\`\`javascript
console.log('嵌套的代码');
\`\`\`
</think>

---

## 2. 标准 HTML 元素

### 2.1 块级元素

<div>这是一个 div 容器</div>

<p>这是一个 p 标签段落</p>

### 2.2 列表

<ul>
  <li>无序列表项 1</li>
  <li>无序列表项 2</li>
</ul>

### 2.3 内联元素

这是 <strong>粗体文本</strong> 和 <em>斜体文本</em>。

这是 <b>加粗</b>、<i>倾斜</i>、<del>删除线</del>。

这是一个 <a href="https://example.com">链接</a>。

颜色文本：<span style="color: red">红色</span> 和 <font color="blue">蓝色</font>。

### 2.4 媒体元素

<img src="https://via.placeholder.com/150" alt="示例图片" width="150" height="150" />

---

## 3. 非标准 HTML 元素

### 3.1 <answer> 标签（只显示内容）

原始：\`<answer>这是答案内容</answer>\`

渲染：<answer>这是答案内容</answer>

多行示例：

<answer>这是一个答案
可以包含多行
标签会被自动移除</answer>

### 3.2 其他自定义标签（也只显示内容）

原始：\`<custom>自定义内容</custom>\`

渲染：<custom>自定义内容</custom>

原始：\`<foo>foo 标签内容</foo>\`

渲染：<foo>foo 标签内容</foo>

原始：\`<mycomponent>组件内容</mycomponent>\`

渲染：<mycomponent>组件内容</mycomponent>

### 3.3 嵌套自定义标签

原始：\`<outer><inner>嵌套内容</inner></outer>\`

渲染：<outer><inner>嵌套内容</inner></outer>

---

## 4. HTML 注释（用于配置）

<!-- { "align": "center" } -->
这段文字会居中显示（配置从注释中提取）

---

## 5. 换行标签

第一行<br/>第二行（使用 br 标签换行）

---

## 对比总结

| 标签类型 | 示例 | 处理方式 |
|---------|------|---------|
| think | think内容think | 转换为特殊思考块 UI ⭐ |
| answer | \`<answer>内容</answer>\` | **只显示内容**，隐藏标签 ✨ |
| 其他非标准标签 | \`<custom>\`, \`<foo>\` 等 | **只显示内容**，隐藏标签 ✨ |
| 标准 HTML | \`<div>\`, \`<p>\`, \`<img>\` 等 | 正常解析为 HTML |
| HTML 注释 | \`<!-- {...} -->\` | 提取配置属性 |

---

## 提示

- 切换到**只读模式**可以看到 think 标签的特殊 UI 效果
- **所有非标准 HTML 标签都会自动隐藏，只显示内容**
- 包括：answer、\`<custom>\`、\`<foo>\` 等任意自定义标签
- 嵌套的非标准标签也会被递归处理
`);

  return (
    <div
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'row',
        gap: '16px',
      }}
    >
      <div style={{ flex: 1, maxWidth: '50%', minWidth: '50%' }}>
        <h3>编辑模式</h3>
        <MarkdownEditor
          initValue={value}
          onChange={(val) => setValue(val)}
          readonly={false}
          style={{ minHeight: '600px', border: '1px solid #d9d9d9' }}
        />
      </div>
      <div style={{ flex: 1, maxWidth: '50%', minWidth: '50%' }}>
        <h3>只读模式（查看 think 块效果）</h3>
        <MarkdownEditor
          initValue={value}
          readonly={true}
          style={{ minHeight: '600px', border: '1px solid #d9d9d9' }}
        />
      </div>
    </div>
  );
};

export default HtmlParsingDemo;
