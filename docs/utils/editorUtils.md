---
nav:
  title: 基础能力
  order: 5
group:
  title: 基础能力
  order: 4
---

# EditorUtils 工具类

`EditorUtils` 是一个提供编辑器操作工具方法的静态类，封装了常用的 Slate 编辑器操作。

## 功能描述

`EditorUtils` 类提供了丰富的编辑器操作方法，包括：

- **路径操作** - 路径查找、比较、移动
- **节点操作** - 节点创建、删除、替换
- **格式操作** - 文本格式设置、清除
- **媒体操作** - 媒体节点创建和管理
- **选择操作** - 选区管理和操作
- **DOM 操作** - DOM 元素和事件处理

## 主要方法

### 路径操作

#### `hasPath(editor: Editor, path: Path): boolean`

检查路径是否存在于编辑器中。

```typescript | pure
const isValid = EditorUtils.hasPath(editor, [0, 1]);
```

#### `isPrevious(firstPath: Path, nextPath: Path): boolean`

检查第一个路径是否在第二个路径之前。

```typescript | pure
const isPrev = EditorUtils.isPrevious([0, 0], [0, 1]); // true
```

#### `isNextPath(firstPath: Path, nextPath: Path): boolean`

检查第一个路径是否在第二个路径之后。

```typescript | pure
const isNext = EditorUtils.isNextPath([0, 2], [0, 1]); // true
```

#### `findPrev(editor: Editor, path: Path): Path`

查找指定路径的前一个有效路径。

```typescript | pure
const prevPath = EditorUtils.findPrev(editor, [0, 2]);
```

#### `findNext(editor: Editor, path: Path): Path`

查找指定路径的下一个有效路径。

```typescript | pure
const nextPath = EditorUtils.findNext(editor, [0, 1]);
```

### 节点操作

#### `replaceSelectedNode(editor: Editor, newNode: Elements[]): void`

替换当前选中的节点。

```typescript | pure
const newNodes = [{ type: 'paragraph', children: [{ text: '新内容' }] }];
EditorUtils.replaceSelectedNode(editor, newNodes);
```

#### `deleteAll(editor: Editor, insertNodes?: Elements[]): void`

删除所有内容，可选择插入新节点。

```typescript | pure
// 清空编辑器
EditorUtils.deleteAll(editor);

// 清空并插入新内容
EditorUtils.deleteAll(editor, [
  { type: 'paragraph', children: [{ text: '新内容' }] },
]);
```

#### `reset(editor: Editor, insertNodes?: Elements[], force?: boolean | History): void`

重置编辑器内容。

```typescript | pure
// 重置为空
EditorUtils.reset(editor);

// 重置并插入内容
EditorUtils.reset(editor, [
  { type: 'paragraph', children: [{ text: '重置内容' }] },
]);
```

### 格式操作

#### `clearMarks(editor: Editor, split = false): void`

清除当前选区的所有格式标记。

```typescript | pure
// 清除格式
EditorUtils.clearMarks(editor);

// 清除格式并分割节点
EditorUtils.clearMarks(editor, true);
```

#### `toggleFormat(editor: Editor, format: string): void`

切换指定格式的激活状态。

```typescript | pure
// 切换粗体
EditorUtils.toggleFormat(editor, 'bold');

// 切换斜体
EditorUtils.toggleFormat(editor, 'italic');
```

#### `isFormatActive(editor: Editor, format: string, value?: any): boolean`

检查指定格式是否处于激活状态。

```typescript | pure
const isBold = EditorUtils.isFormatActive(editor, 'bold');
const isItalic = EditorUtils.isFormatActive(editor, 'italic');
```

#### `setAlignment(editor: Editor, alignment: 'left' | 'center' | 'right'): void`

设置文本对齐方式。

```typescript | pure
EditorUtils.setAlignment(editor, 'center');
EditorUtils.setAlignment(editor, 'right');
```

#### `isAlignmentActive(editor: Editor, alignment: string): boolean`

检查指定对齐方式是否激活。

```typescript | pure
const isCentered = EditorUtils.isAlignmentActive(editor, 'center');
```

### 媒体操作

#### `createMediaNode(src: string | undefined, type: string, extraPros?: Record<string, any>): CardNode | { text: string }`

创建媒体节点（图片、视频、音频等）。

```typescript | pure
// 创建图片节点
const imageNode = EditorUtils.createMediaNode(
  'https://example.com/image.jpg',
  'image',
  { alt: '图片描述' },
);

// 创建视频节点
const videoNode = EditorUtils.createMediaNode(
  'https://example.com/video.mp4',
  'video',
);
```

#### `wrapperCardNode(node: any, props: Record<string, any> = {}): CardNode`

将节点包装为卡片节点。

```typescript | pure
const cardNode = EditorUtils.wrapperCardNode(
  { type: 'table', children: [] },
  { className: 'custom-table' },
);
```

### 选择操作

#### `focus(editor: Editor): void`

聚焦编辑器。

```typescript | pure
EditorUtils.focus(editor);
```

#### `blur(editor: Editor): void`

取消编辑器聚焦。

```typescript | pure
EditorUtils.blur(editor);
```

#### `copyText(editor: Editor, start: Point, end?: Point): string`

复制指定范围的文本。

```typescript | pure
const text = EditorUtils.copyText(editor, { path: [0, 0], offset: 0 });
```

#### `cutText(editor: Editor, start: Point, end?: Point): string`

剪切指定范围的文本。

```typescript | pure
const text = EditorUtils.cutText(editor, { path: [0, 0], offset: 0 });
```

### 工具方法

#### `copy(data: object): object`

深度复制对象。

```typescript | pure
const copied = EditorUtils.copy({ a: 1, b: { c: 2 } });
```

#### `checkEnd(editor: Editor): boolean`

检查是否在编辑器末尾。

```typescript | pure
const isAtEnd = EditorUtils.checkEnd(editor);
```

#### `checkSelEnd(editor: Editor, path: Path): boolean`

检查指定路径是否在选区末尾。

```typescript | pure
const isSelEnd = EditorUtils.checkSelEnd(editor, [0, 1]);
```

## 常量

### `p`

段落节点的默认结构。

```typescript | pure
const paragraph = EditorUtils.p;
// { type: 'paragraph', children: [{ text: '' }] }
```

### `CLEARABLE_MARKS`

可清除的格式标记列表。

```typescript | pure
const marks = ['bold', 'italic', 'code', 'strikethrough', 'url'];
```

## 使用场景

### 编辑器初始化

```typescript | pure
// 重置编辑器内容
EditorUtils.reset(editor, [
  { type: 'paragraph', children: [{ text: '欢迎使用编辑器' }] },
]);
```

### 格式操作

```typescript | pure
// 切换文本格式
const toggleBold = () => {
  EditorUtils.toggleFormat(editor, 'bold');
};

const clearFormat = () => {
  EditorUtils.clearMarks(editor);
};
```

### 媒体插入

```typescript | pure
// 插入图片
const insertImage = (src: string, alt: string) => {
  const imageNode = EditorUtils.createMediaNode(src, 'image', { alt });
  Transforms.insertNodes(editor, imageNode);
};
```

### 内容操作

```typescript | pure
// 替换选中内容
const replaceContent = (newContent: string) => {
  const newNode = { type: 'paragraph', children: [{ text: newContent }] };
  EditorUtils.replaceSelectedNode(editor, [newNode]);
};
```

## 注意事项

1. **错误处理**：所有方法都包含错误处理，不会抛出异常
2. **路径验证**：使用前应验证路径的有效性
3. **选区检查**：某些操作需要有效的选区
4. **性能考虑**：大量操作时注意性能影响
5. **类型安全**：使用 TypeScript 确保类型安全

## 扩展性

`EditorUtils` 类设计为可扩展的，可以：

- 添加新的工具方法
- 自定义节点创建逻辑
- 扩展格式操作功能
- 集成第三方编辑器功能
