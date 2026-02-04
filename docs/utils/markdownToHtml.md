---
nav:
  title: 基础能力
  order: 5
group:
  title: 基础能力
  order: 3
title: markdownToHtml 工具函数
---

<!-- markdownlint-disable-next-line MD025 -->

# markdownToHtml 工具函数

`markdownToHtml` 是一个用于将 Markdown 内容转换为 HTML 的工具函数集合。

## 功能描述

这个工具提供了两个主要函数：

- `markdownToHtml` - 异步转换函数
- `markdownToHtmlSync` - 同步转换函数

两个函数都基于 `unified` 生态系统，支持丰富的 Markdown 扩展功能，包括：

- **GitHub Flavored Markdown (GFM)** - 支持表格、删除线、任务列表等
- **数学公式** - 支持 KaTeX 渲染的数学公式
- **YAML Front Matter** - 支持文档前置元数据
- **HTML 内联** - 支持在 Markdown 中嵌入 HTML
- **特殊字符处理** - 修复特殊字符在粗体中的显示问题

## API 参考

### `markdownToHtml(markdown: string, plugins?: MarkdownToHtmlOptions): Promise<string>`

异步将 Markdown 字符串转换为 HTML。

**参数：**

- `markdown: string` - 要转换的 Markdown 字符串
- `plugins?: MarkdownToHtmlOptions` - Babel 风格的 remark 插件数组

**返回值：**

- `Promise<string>` - 转换后的 HTML 字符串

### `markdownToHtmlSync(markdown: string, plugins?: MarkdownToHtmlOptions): string`

同步将 Markdown 字符串转换为 HTML。

**参数：**

- `markdown: string` - 要转换的 Markdown 字符串
- `plugins?: MarkdownToHtmlOptions` - Babel 风格的 remark 插件数组
- `string` - 转换后的 HTML 字符串

### `MarkdownToHtmlOptions`

- 类型：`Array<Plugin | [Plugin, ...unknown[]]>`
- 结构与 Babel 插件数组一致，每一项是一个 remark 插件，第二个及之后的元素为该插件的配置。
- 当提供该数组时，会完全覆盖默认的 remark 插件链，请确保链条完整。

```typescript
import { DEFAULT_MARKDOWN_REMARK_PLUGINS } from '@ant-design/agentic-ui';

const plugins: MarkdownToHtmlOptions = [...DEFAULT_MARKDOWN_REMARK_PLUGINS];
```

**返回值：**

- `string` - 转换后的 HTML 字符串

## 使用示例

### 异步转换

```typescript | pure
import { markdownToHtml } from '@ant-design/agentic-ui';

const markdown = `
# 标题

这是一个**粗体**和*斜体*的段落。

## 列表

- 项目 1
- 项目 2

## 代码

\`\`\`javascript
console.log('Hello, World!');
\`\`\`

## 数学公式

$$
E = mc^2
$$
`;

const html = await markdownToHtml(markdown);
console.log(html);
```

### 同步转换

```typescript | pure
import { markdownToHtmlSync } from '@ant-design/agentic-ui';

const markdown = '# 标题\n\n这是一个段落。';
const html = markdownToHtmlSync(markdown);
console.log(html);
```

### 自定义 remark 插件

```typescript | pure
import remarkDirective from 'remark-directive';
import {
  DEFAULT_MARKDOWN_REMARK_PLUGINS,
  markdownToHtml,
} from '@ant-design/agentic-ui';

const markdown = `
:::info
这里是一个自定义指令块
:::
`;

const html = await markdownToHtml(markdown, [
  ...DEFAULT_MARKDOWN_REMARK_PLUGINS.slice(0, 2),
  remarkDirective,
  ...DEFAULT_MARKDOWN_REMARK_PLUGINS.slice(2),
]);
```

### 关闭默认插件

```typescript | pure
import remarkGfm from 'remark-gfm';
import {
  DEFAULT_MARKDOWN_REMARK_PLUGINS,
  markdownToHtmlSync,
} from '@ant-design/agentic-ui';

const markdown = '~~不会再被渲染成删除线~~';

const html = markdownToHtmlSync(
  markdown,
  DEFAULT_MARKDOWN_REMARK_PLUGINS.filter((plugin) => plugin !== remarkGfm),
);
```

```typescript | pure
import { markdownToHtmlSync } from '@ant-design/agentic-ui';

const markdown = '# 标题\n\n这是一个段落。';
const html = markdownToHtmlSync(markdown);
console.log(html);
```

## 支持的 Markdown 特性

### 基础语法

- **标题**：`#` 到 `######`
- **段落**：普通文本段落
- **粗体**：`**text**` 或 `__text__`
- **斜体**：`*text*` 或 `_text_`
- **删除线**：`~~text~~`
- **内联代码**：`` `code` ``
- **代码块**：` ` ```
- **引用**：`> text`
- **链接**：`[text](url)`
- **图片**：`![alt](url)`

### GitHub Flavored Markdown

- **表格**：

  ```markdown
  | 列1   | 列2   |
  | ----- | ----- |
  | 数据1 | 数据2 |
  ```

- **任务列表**：

  ```markdown
  - [x] 已完成任务
  - [ ] 未完成任务
  ```

- **删除线**：`~~删除的文本~~`

### 数学公式

- **行内公式**：`$E = mc^2$`
- **块级公式**：

  ```markdown
  $$
  E = mc^2
  $$
  ```

### YAML Front Matter

```markdown
---
title: 文档标题
author: 作者名
date: 2024-01-01
---

# 文档内容
```

### HTML 内联

```markdown
# 标题

<div class="custom-class">
  自定义 HTML 内容
</div>

<iframe src="https://example.com"></iframe>
```

## 处理流程

默认处理流程使用以下 unified 插件（可通过自定义 `MarkdownToHtmlOptions` 完全覆盖）：

1. **remarkParse** - 解析 Markdown
2. **remarkGfm** - GitHub Flavored Markdown 支持
3. **fixStrongWithSpecialChars** - 修复特殊字符问题
4. **remarkMath** - 数学公式支持
5. **remarkFrontmatter** - YAML 前置元数据
6. **remarkRehype** - 转换为 rehype 格式
7. **rehypeRaw** - 处理原始 HTML
8. **rehypeKatex** - KaTeX 数学公式渲染
9. **rehypeStringify** - 输出 HTML 字符串

## 错误处理

两个函数都包含错误处理机制：

- 如果转换过程中出现错误，会在控制台输出错误信息
- 返回空字符串作为默认值
- 不会抛出异常，确保程序稳定性

## 性能考虑

### 异步 vs 同步

- **异步版本**：适合处理大量内容或需要非阻塞操作
- **同步版本**：适合简单转换或需要立即结果

### 内存使用

- 转换过程会创建中间 AST（抽象语法树）
- 对于大型文档，建议使用异步版本避免阻塞

## 配置选项

当前实现使用固定的配置：

- `singleDollarTextMath: false` - 禁用单美元符号数学公式
- `allowDangerousHtml: true` - 允许危险的 HTML 内容
- 支持 YAML 前置元数据

## 使用场景

- **预览功能**：将编辑的 Markdown 转换为 HTML 进行预览
- **导出功能**：将 Markdown 文档导出为 HTML 格式
- **内容渲染**：在应用中显示 Markdown 内容
- **文档生成**：生成静态网站或文档页面

## 注意事项

1. **依赖项**：需要安装 `unified` 生态系统相关包
2. **数学公式**：需要 KaTeX CSS 样式支持
3. **HTML 安全**：`allowDangerousHtml: true` 可能带来安全风险
4. **错误处理**：转换失败时返回空字符串，需要额外检查
