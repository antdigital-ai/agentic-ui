---
nav:
  title: 基础能力
  order: 5
group:
  title: 基础能力
  order: 6
---

# isMarkdown 工具函数

`isMarkdown` 是一个用于检测字符串是否包含 Markdown 格式的工具函数。

## 功能描述

这个函数通过正则表达式检测文本中是否包含常见的 Markdown 语法元素，包括：

- 标题（`#` 到 `######`）
- 表格（`|` 分隔的表格）
- 链接（`[text](url)` 格式）
- 图片（`![alt](url)` 格式）
- 代码块（``` 包围的代码）
- 内联代码（`code` 格式）
- 引用块（`>` 开头的行）
- 粗体文本（`**text**` 或 `__text__`）
- 斜体文本（`*text*`）
- 删除线（`~~text~~`）
- 水平分割线（`---`、`===`、`***`）

## API 参考

### `isMarkdown(text: string): boolean`

检测字符串是否包含 Markdown 格式。

**参数：**

- `text: string` - 要检测的字符串

**返回值：**

- `boolean` - 如果包含 Markdown 格式返回 `true`，否则返回 `false`

## 使用示例

```typescript | pure
import { isMarkdown } from '@ant-design/agentic-ui';

// 检测包含 Markdown 的文本
console.log(isMarkdown('# 标题')); // true
console.log(isMarkdown('**粗体**文本')); // true
console.log(isMarkdown('[链接](https://example.com)')); // true

// 检测普通文本
console.log(isMarkdown('普通文本')); // false
console.log(isMarkdown('')); // false
console.log(isMarkdown('   ')); // false
```

## 检测规则

### 标题检测

```typescript | pure
// 匹配 # 到 ###### 开头的行
/^#+\s+.+/m;
```

### 表格检测

```typescript | pure
// 匹配包含 | 分隔符的表格
/\|.+\|[\r\n]+\|[\s-:]+\|/m;
```

### 链接检测

```typescript | pure
// 匹配 [text](url) 格式的链接
/\[.+\]\(.+\)/;
```

### 图片检测

```typescript | pure
// 匹配 ![alt](url) 格式的图片
/!\[.+\]\(.+\)/;
```

### 代码块检测

````typescript | pure
// 匹配 ``` 包围的代码块
/```[\s\S]*```/;
````

### 内联代码检测

```typescript | pure
// 匹配 `code` 格式的内联代码
/`.+`/;
```

### 引用块检测

```typescript | pure
// 匹配 > 开头的引用行
/^>\s+.+/m;
```

### 粗体文本检测

```typescript | pure
// 匹配 **text** 或 __text__ 格式
/\*\*.+\*\*/.test(text) || /__.+__/.test(text);
```

### 斜体文本检测

```typescript | pure
// 匹配 *text* 格式（排除单独的 *）
/\*.+\*/.test(text) && !/^\*$/.test(text);
```

### 删除线检测

```typescript | pure
// 匹配 ~~text~~ 格式
/~~.+~~/;
```

### 水平分割线检测

```typescript | pure
// 匹配 ---、===、*** 格式
/^(---|===|\*\*\*)$/m;
```

## 注意事项

1. **性能考虑**：函数使用多个正则表达式进行检测，对于长文本可能会有性能影响
2. **准确性**：检测基于常见的 Markdown 语法，可能无法识别所有变体
3. **空值处理**：函数会正确处理空字符串和只包含空格的字符串
4. **大小写敏感**：正则表达式是大小写敏感的

## 使用场景

- **内容类型检测**：在粘贴内容时判断是否为 Markdown 格式
- **编辑器功能**：根据内容类型启用不同的编辑模式
- **导入功能**：在导入文本时自动识别格式
- **预览切换**：根据内容格式决定是否显示预览
