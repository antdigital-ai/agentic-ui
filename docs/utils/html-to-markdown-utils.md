---
nav:
  title: 高级功能
  order: 4
group:
  title: 基础能力
  order: 7
---

# HTML 到 Markdown 转换工具

这个模块提供了一套无依赖的 HTML 到 Markdown 转换工具，可以独立使用。

## 功能特性

- 🚀 **无依赖**: 只使用浏览器原生 API，无需额外依赖
- 🎯 **类型安全**: 完整的 TypeScript 类型定义
- 🔧 **可配置**: 支持自定义图片和链接处理
- 📦 **模块化**: 提供多个独立的工具函数
- 🧪 **测试覆盖**: 完整的单元测试

## 安装

```bash
npm install agentic-ui
```

## 使用方法

### 基本转换

```typescript | pure
import { htmlToMarkdown } from '@ant-design/agentic-ui';

const html = '<h1>标题</h1><p>这是一个段落。</p>';
const markdown = htmlToMarkdown(html);
// 输出: # 标题\n\n这是一个段落。\n\n
```

### 带选项的转换

```typescript | pure
import {
  htmlToMarkdown,
  type HtmlToMarkdownOptions,
} from '@ant-design/agentic-ui';

const options: HtmlToMarkdownOptions = {
  preserveLineBreaks: true,
  preserveComments: false,
  imageHandler: (src, alt) => `![${alt}](${src}?processed)`,
  linkHandler: (href, text) => `[${text}](${href}?processed)`,
};

const html =
  '<img src="image.jpg" alt="图片"><a href="https://example.com">链接</a>';
const markdown = htmlToMarkdown(html, options);
```

### 批量转换

```typescript | pure
import { batchHtmlToMarkdown } from '@ant-design/agentic-ui';

const htmlFragments = ['<h1>标题1</h1>', '<p>段落1</p>', '<h2>标题2</h2>'];

const results = batchHtmlToMarkdown(htmlFragments);
// 输出: ['# 标题1\n\n', '段落1\n\n', '## 标题2\n\n']
```

### HTML 检测

```typescript | pure
import { isHtml } from '@ant-design/agentic-ui';

console.log(isHtml('<p>内容</p>')); // true
console.log(isHtml('普通文本')); // false
```

### 文本提取

```typescript | pure
import { extractTextFromHtml } from '@ant-design/agentic-ui';

const html = '<h1>标题</h1><p>这是<strong>粗体</strong>文本。</p>';
const text = extractTextFromHtml(html);
// 输出: "标题这是粗体文本。"
```

### HTML 清理

```typescript | pure
import { cleanHtml } from '@ant-design/agentic-ui';

const html = '  <p>  内容  </p>  ';
const cleaned = cleanHtml(html);
// 输出: "<p>内容</p>"
```

## API 参考

### `htmlToMarkdown(html: string, options?: HtmlToMarkdownOptions): string`

将 HTML 字符串转换为 Markdown。

**参数:**

- `html`: 要转换的 HTML 字符串
- `options`: 可选的转换选项

**返回值:**

- 转换后的 Markdown 字符串

### `HtmlToMarkdownOptions`

转换选项接口：

```typescript | pure
interface HtmlToMarkdownOptions {
  /** 是否保留换行符 */
  preserveLineBreaks?: boolean;
  /** 是否保留 HTML 注释 */
  preserveComments?: boolean;
  /** 图片处理函数 */
  imageHandler?: (src: string, alt: string) => string;
  /** 链接处理函数 */
  linkHandler?: (href: string, text: string) => string;
}
```

### `batchHtmlToMarkdown(htmlFragments: string[], options?: HtmlToMarkdownOptions): string[]`

批量转换 HTML 片段为 Markdown。

**参数:**

- `htmlFragments`: HTML 字符串数组
- `options`: 可选的转换选项

**返回值:**

- Markdown 字符串数组

### `isHtml(text: string): boolean`

检测字符串是否为 HTML。

**参数:**

- `text`: 要检测的字符串

**返回值:**

- 如果是 HTML 返回 true，否则返回 false

### `extractTextFromHtml(html: string): string`

从 HTML 中提取纯文本。

**参数:**

- `html`: HTML 字符串

**返回值:**

- 提取的纯文本

### `cleanHtml(html: string): string`

清理 HTML 字符串，移除不必要的空白和换行。

**参数:**

- `html`: HTML 字符串

**返回值:**

- 清理后的 HTML 字符串

## 支持的 HTML 标签

### 块级元素

- `<h1>` - `<h6>` → `#` - `######`
- `<p>` → 段落
- `<blockquote>` → `>`
- `<pre>` → 代码块
- `<ul>`, `<ol>` → 列表
- `<table>` → 表格
- `<hr>` → 分隔线
- `<div>` → 容器

### 内联元素

- `<strong>`, `<b>` → `**粗体**`
- `<em>`, `<i>` → `*斜体*`
- `<del>`, `<s>` → `~~删除线~~`
- `<code>` → `内联代码`
- `<a>` → `[链接](URL)`
- `<img>` → `![图片](URL)`
- `<br>` → 换行

## 示例

### 复杂 HTML 转换

```typescript | pure
const complexHtml = `
  <div>
    <h1>文章标题</h1>
    <p>这是第一段，包含<strong>粗体</strong>和<em>斜体</em>文本。</p>
    <blockquote>
      这是一个引用块。
    </blockquote>
    <ul>
      <li>列表项1</li>
      <li>列表项2</li>
    </ul>
    <table>
      <tr><th>列1</th><th>列2</th></tr>
      <tr><td>数据1</td><td>数据2</td></tr>
    </table>
  </div>
`;

const markdown = htmlToMarkdown(complexHtml);
```

### 自定义处理器

```typescript | pure
const options: HtmlToMarkdownOptions = {
  imageHandler: (src, alt) => {
    // 添加 CDN 前缀
    const cdnUrl = `https://cdn.example.com/${src}`;
    return `![${alt}](${cdnUrl})`;
  },
  linkHandler: (href, text) => {
    // 添加跟踪参数
    const trackedUrl = `${href}?utm_source=conversion`;
    return `[${text}](${trackedUrl})`;
  },
};

const html =
  '<img src="image.jpg" alt="图片"><a href="https://example.com">链接</a>';
const markdown = htmlToMarkdown(html, options);
```

## 注意事项

1. **浏览器环境**: 这些工具需要在浏览器环境中运行，因为它们使用了 `DOMParser`
2. **HTML 解析**: 使用浏览器原生的 HTML 解析器，确保兼容性
3. **性能考虑**: 对于大量 HTML 内容，建议分批处理
4. **错误处理**: 函数会优雅地处理无效的 HTML 输入

## 测试

运行测试：

```bash
npm test htmlToMarkdown.test.ts
```

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个工具。
