---
nav:
  title: 基础能力
  order: 5
group:
  title: 基础能力
  order: 1
---

# 工具函数总览 {#utils-overview}

agentic-ui 提供了丰富的工具函数，用于支持编辑器的各种功能。这些工具函数都是模块化设计的，可以独立使用。

## 工具函数分类 {#utils-categories}

### 🔤 文本处理工具 {#text-utils}

#### [isMarkdown](./isMarkdown.md)

检测字符串是否包含 Markdown 格式。

```typescript | pure
import { isMarkdown } from '@ant-design/agentic-ui';

console.log(isMarkdown('# 标题')); // true
console.log(isMarkdown('普通文本')); // false
```

#### [markdownToHtml](./markdownToHtml.md)

将 Markdown 内容转换为 HTML。

```typescript | pure
import { markdownToHtml, markdownToHtmlSync } from '@ant-design/agentic-ui';

// 异步转换
const html = await markdownToHtml('# 标题\n\n这是内容');

// 同步转换
const htmlSync = markdownToHtmlSync('# 标题\n\n这是内容');
```

#### [htmlToMarkdown](./html-to-markdown-utils.md)

将 HTML 内容转换为 Markdown。

```typescript | pure
import { htmlToMarkdown } from '@ant-design/agentic-ui';

const markdown = htmlToMarkdown('<h1>标题</h1><p>内容</p>');
```

### 🎛️ 编辑器工具 {#editor-utils}

#### [EditorUtils](./editorUtils.md)

编辑器操作工具类，提供丰富的编辑器操作方法。

```typescript | pure
import { EditorUtils } from '@ant-design/agentic-ui';

// 聚焦编辑器
EditorUtils.focus(editor);

// 切换格式
EditorUtils.toggleFormat(editor, 'bold');

// 创建媒体节点
const imageNode = EditorUtils.createMediaNode('image.jpg', 'image');
```

### 🌐 国际化工具 {#i18n}

#### [国际化 (I18n)](./i18n.md) {#i18n-i18n}

提供完整的国际化解决方案，支持中英文切换。

```typescript | pure
import { I18nProvide, useLanguage } from '@ant-design/agentic-ui';

// 使用国际化提供者
<I18nProvide>
  <App />
</I18nProvide>

// 在组件中使用
const { locale, toggleLanguage } = useLanguage();
```

### 🌐 DOM 操作工具 {#dom}

#### [DOM 工具](./dom.md) {#dom-md}

提供 DOM 元素位置计算、字符串处理和媒体类型检测。

```typescript | pure
import { getOffsetTop, slugify, getMediaType } from '@ant-design/agentic-ui';

// 计算元素位置
const top = getOffsetTop(element);

// 生成 slug
const slug = slugify('Hello World!'); // 'hello-world'

// 检测媒体类型
const type = getMediaType('image.jpg'); // 'image'
```

#### [Path 工具](./path.md) {#path-md}

路径处理和链接检测工具。

```typescript | pure
import { isLink, parsePath, toUnixPath } from '@ant-design/agentic-ui';

// 检测链接
console.log(isLink('https://example.com')); // true

// 解析路径
const { path, hash } = parsePath('/file.md#section');

// 标准化路径
const unixPath = toUnixPath('C:\\path\\to\\file'); // 'C:/path/to/file'
```

### 📱 媒体处理工具 {#media-utils}

#### [Media 工具](./media.md) {#media-md}

远程媒体类型检测和图片处理。

```typescript | pure
import {
  getRemoteMediaType,
  convertRemoteImages,
} from '@ant-design/agentic-ui';

// 检测远程媒体类型
const type = await getRemoteMediaType('https://example.com/image.jpg');

// 转换远程图片
await convertRemoteImages(editorNode, store);
```

## 使用指南 {#usage-guide}

### 基本导入 {#basic}

```typescript | pure
import {
  // 文本处理
  isMarkdown,
  markdownToHtml,
  markdownToHtmlSync,
  htmlToMarkdown,

  // 编辑器工具
  EditorUtils,

  // 国际化
  I18nProvide,
  useLanguage,
  cnLabels,
  enLabels,
  compileTemplate,

  // DOM 工具
  getOffsetTop,
  slugify,
  getMediaType,

  // 路径工具
  isLink,
  parsePath,
  toUnixPath,

  // 媒体工具
  getRemoteMediaType,
  convertRemoteImages,
} from '@ant-design/agentic-ui';
```

### 组合使用示例 {#example}

#### 内容验证和处理 {#content}

```typescript | pure
// 验证用户输入
const validateContent = (content: string) => {
  if (isMarkdown(content)) {
    // 转换为 HTML 进行预览
    return markdownToHtml(content);
  } else if (isLink(content)) {
    // 处理链接
    return `<a href="${content}">${content}</a>`;
  } else {
    // 普通文本
    return content;
  }
};
```

#### 编辑器增强 {#editor-enhancements}

```typescript | pure
// 增强编辑器功能
const enhanceEditor = (editor: Editor) => {
  // 自动检测媒体类型
  const handlePaste = async (data: DataTransfer) => {
    const text = data.getData('text/plain');

    if (isLink(text)) {
      const mediaType = await getRemoteMediaType(text);
      if (mediaType === 'image') {
        const imageNode = EditorUtils.createMediaNode(text, 'image');
        Transforms.insertNodes(editor, imageNode);
        return;
      }
    }

    // 默认粘贴行为
    Transforms.insertText(editor, text);
  };

  return { handlePaste };
};
```

#### 路径处理 {#path-processing}

```typescript | pure
// 处理文档链接
const processDocumentLinks = (links: string[]) => {
  return links.map((link) => {
    if (isLink(link)) {
      return { type: 'external', url: link };
    } else {
      const { path, hash } = parsePath(link);
      const normalizedPath = toUnixPath(path);
      return { type: 'internal', path: normalizedPath, anchor: hash };
    }
  });
};
```

## 最佳实践 {#best-practices}

### 1. 错误处理 {#error-handling}

```typescript | pure
// 总是包含错误处理
const safeMarkdownToHtml = async (markdown: string) => {
  try {
    return await markdownToHtml(markdown);
  } catch (error) {
    console.error('Markdown 转换失败:', error);
    return '<p>转换失败</p>';
  }
};
```

### 2. 性能优化 {#performance}

```typescript | pure
// 使用防抖处理频繁操作
import { debounce } from 'lodash-es';

const debouncedValidation = debounce((content: string) => {
  return isMarkdown(content);
}, 300);
```

### 3. 类型安全 {#types}

```typescript | pure
// 使用 TypeScript 类型
import type { HtmlToMarkdownOptions } from '@ant-design/agentic-ui';

const options: HtmlToMarkdownOptions = {
  preserveLineBreaks: true,
  imageHandler: (src, alt) => `![${alt}](${src}?processed)`,
};
```

### 4. 模块化使用 {#modular-usage}

```typescript | pure
// 按需导入，减少包大小
import { isMarkdown } from 'agentic-ui/utils/isMarkdown';
import { htmlToMarkdown } from 'agentic-ui/utils/htmlToMarkdown';
```

## 扩展开发 {#extension-development}

### 自定义工具函数 {#custom}

```typescript | pure
// 扩展 EditorUtils
class CustomEditorUtils extends EditorUtils {
  static customMethod(editor: Editor) {
    // 自定义逻辑
  }
}
```

### 工具函数组合 {#utils-composition}

```typescript | pure
// 创建组合工具函数
const contentProcessor = {
  validate: (content: string) => isMarkdown(content),
  convert: async (content: string) => {
    if (isMarkdown(content)) {
      return await markdownToHtml(content);
    }
    return htmlToMarkdown(content);
  },
  optimize: (content: string) => {
    // 自定义优化逻辑
    return content;
  },
};
```

## 注意事项 {#notes}

1. **浏览器兼容性**：某些工具函数需要现代浏览器支持
2. **网络依赖**：媒体工具函数需要网络连接
3. **性能考虑**：大量数据处理时注意性能影响
4. **错误处理**：始终包含适当的错误处理机制
5. **类型安全**：使用 TypeScript 确保类型安全

## 贡献指南 {#contributing-guide}

欢迎为工具函数贡献代码：

1. 遵循现有的代码风格
2. 添加完整的 TypeScript 类型定义
3. 包含详细的文档和示例
4. 添加相应的测试用例
5. 确保向后兼容性
