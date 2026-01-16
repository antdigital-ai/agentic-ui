---
nav:
  title: 基础能力
  order: 5
group:
  title: 基础能力
  order: 5
---

# DOM 工具函数

`dom.ts` 提供了一系列用于 DOM 操作和处理的工具函数。

## 功能描述

这个模块包含以下主要功能：

- **位置计算** - DOM 元素位置和偏移量计算
- **字符串处理** - 文本 slugify 和清理
- **媒体类型检测** - 根据文件名或 URL 判断媒体类型
- **选区操作** - 获取选区矩形信息

## API 参考

### 位置计算

#### `getOffsetTop(dom: HTMLElement, target: HTMLElement = document.body): number`

计算 DOM 元素相对于目标元素的垂直偏移量。

**参数：**

- `dom: HTMLElement` - 要计算偏移量的 DOM 元素
- `target: HTMLElement` - 目标元素，默认为 `document.body`

**返回值：**

- `number` - 垂直偏移量（像素）

```typescript | pure
import { getOffsetTop } from '@ant-design/agentic-ui';

const element = document.getElementById('my-element');
const offsetTop = getOffsetTop(element);
console.log(`元素距离顶部 ${offsetTop}px`);
```

#### `getOffsetLeft(dom: HTMLElement, target: HTMLElement = document.body): number`

计算 DOM 元素相对于目标元素的水平偏移量。

**参数：**

- `dom: HTMLElement` - 要计算偏移量的 DOM 元素
- `target: HTMLElement` - 目标元素，默认为 `document.body`

**返回值：**

- `number` - 水平偏移量（像素）

```typescript | pure
import { getOffsetLeft } from '@ant-design/agentic-ui';

const element = document.getElementById('my-element');
const offsetLeft = getOffsetLeft(element);
console.log(`元素距离左侧 ${offsetLeft}px`);
```

### 字符串处理

#### `slugify(str: string): string`

将字符串转换为 URL 友好的 slug 格式。

**参数：**

- `str: string` - 要转换的字符串

**返回值：**

- `string` - 转换后的 slug

**转换规则：**

- 移除重音符号
- 移除控制字符
- 将特殊字符替换为连字符
- 移除连续的连字符
- 移除首尾连字符
- 确保不以数字开头
- 转换为小写

```typescript | pure
import { slugify } from '@ant-design/agentic-ui';

console.log(slugify('Hello World!')); // 'hello-world'
console.log(slugify('Café & Résumé')); // 'cafe-resume'
console.log(slugify('123 Number')); // '_123-number'
```

### 媒体类型检测

#### `getMediaType(name?: string, alt?: string): string`

根据文件名或 URL 判断媒体类型。

**参数：**

- `name?: string` - 文件名或 URL
- `alt?: string` - 备用标识符

**返回值：**

- `string` - 媒体类型（'image' | 'video' | 'audio' | 'attachment' | 'markdown' | 'other'）

**支持的媒体类型：**

- **图片**：`.png`, `.jpg`, `.gif`, `.svg`, `.jpeg`, `.webp`
- **视频**：`.mp4`, `.avi`, `.mov`, `.wmv`, `.flv`, `.webm`
- **音频**：`.mp3`, `.ogg`, `.aac`, `.wav`, `.oga`, `.m4a`
- **文档**：`.md`, `.markdown`
- **附件**：其他文件类型

```typescript | pure
import { getMediaType } from '@ant-design/agentic-ui';

// 根据文件扩展名判断
console.log(getMediaType('image.jpg')); // 'image'
console.log(getMediaType('video.mp4')); // 'video'
console.log(getMediaType('audio.mp3')); // 'audio'
console.log(getMediaType('document.md')); // 'markdown'

// 根据 blob URL 判断
console.log(getMediaType('blob:http://example.com/123')); // 'image'

// 根据备用标识符判断
console.log(getMediaType('file', 'data:image/png;base64,...')); // 'image'
console.log(getMediaType('file', 'video:mp4')); // 'video'
```

### 选区操作

#### `getSelRect(): DOMRect | null`

获取当前选区的矩形信息。

**返回值：**

- `DOMRect | null` - 选区矩形信息，如果没有选区则返回 `null`

```typescript | pure
import { getSelRect } from '@ant-design/agentic-ui';

const selection = window.getSelection();
if (selection && !selection.isCollapsed) {
  const rect = getSelRect();
  if (rect) {
    console.log(`选区位置: ${rect.left}, ${rect.top}`);
    console.log(`选区大小: ${rect.width} x ${rect.height}`);
  }
}
```

## 使用场景

### 编辑器定位

```typescript | pure
// 计算工具栏位置
const editorElement = document.querySelector('.agentic-ui');
const toolbarElement = document.querySelector('.toolbar');

if (editorElement && toolbarElement) {
  const editorTop = getOffsetTop(editorElement);
  const editorLeft = getOffsetLeft(editorElement);

  // 设置工具栏位置
  toolbarElement.style.top = `${editorTop - 50}px`;
  toolbarElement.style.left = `${editorLeft}px`;
}
```

### 媒体文件处理

```typescript | pure
// 处理文件上传
const handleFileUpload = (file: File) => {
  const mediaType = getMediaType(file.name);

  switch (mediaType) {
    case 'image':
      // 处理图片文件
      handleImageUpload(file);
      break;
    case 'video':
      // 处理视频文件
      handleVideoUpload(file);
      break;
    case 'audio':
      // 处理音频文件
      handleAudioUpload(file);
      break;
    default:
      // 处理其他文件
      handleAttachmentUpload(file);
  }
};
```

### URL 友好化

```typescript | pure
// 生成锚点链接
const generateAnchor = (text: string) => {
  const slug = slugify(text);
  return `#${slug}`;
};

// 生成文件名
const generateFileName = (title: string) => {
  const slug = slugify(title);
  return `${slug}.md`;
};
```

### 选区操作

```typescript | pure
// 显示选区信息
const showSelectionInfo = () => {
  const rect = getSelRect();
  if (rect) {
    const info = {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    };

    // 显示选区信息
    console.log('选区信息:', info);
  }
};
```

## 注意事项

1. **DOM 依赖**：这些函数需要在浏览器环境中使用
2. **性能考虑**：`getOffsetTop` 和 `getOffsetLeft` 会遍历 DOM 树
3. **兼容性**：确保目标浏览器支持相关 DOM API
4. **错误处理**：函数会处理无效的 DOM 元素和参数

## 扩展性

这些工具函数可以进一步扩展：

- 添加更多媒体类型支持
- 优化位置计算算法
- 增加更多字符串处理功能
- 支持更多选区操作
