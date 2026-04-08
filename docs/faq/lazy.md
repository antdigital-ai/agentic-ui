---
title: 性能优化
nav:
  title: 常见问题
  order: 6
group:
  title: 通用
  order: 3
---

# 懒加载渲染 (Lazy Render)

`BaseMarkdownEditor` 支持懒加载渲染模式，通过 `IntersectionObserver` API 实现按需渲染，显著提升大型文档的渲染性能。

## 何时使用

- 文档内容很长，包含大量元素
- 需要优化首屏加载性能
- 文档包含大量图片、表格等复杂元素
- 移动端或性能较低的设备

## 工作原理

启用懒加载后，每个编辑器元素都会被 `LazyElement` 组件包裹。该组件使用 `IntersectionObserver` 监听元素是否进入视口：

1. **初始状态**：元素显示为占位符，不渲染实际内容
2. **进入视口**：当元素即将进入视口时（可配置提前量），开始渲染实际内容
3. **保持渲染**：元素一旦被渲染，会保持渲染状态，不会卸载

## 基本使用

```tsx | pure
import { BaseMarkdownEditor } from '@ant-design/agentic-ui';

export default () => {
  return (
    <BaseMarkdownEditor
      lazy={{ enable: true }}
      initValue="# 长文档内容\n\n这里是很多内容..."
      height={600}
    />
  );
};
```

## 配置选项

通过 `lazy` 对象可以自定义懒加载行为：

```tsx | pure
import { BaseMarkdownEditor } from '@ant-design/agentic-ui';

export default () => {
  return (
    <BaseMarkdownEditor
      lazy={{
        enable: true,
        placeholderHeight: 150, // 占位符高度，默认 25px
        rootMargin: '300px', // 提前加载距离，默认 '200px'
      }}
      initValue="# 长文档内容"
      height={600}
    />
  );
};
```

### 配置说明

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| lazy.enable | 是否启用懒加载 | boolean | false | - |
| lazy.placeholderHeight | 占位符高度（单位：px） | number | 25 | - |
| lazy.rootMargin | 提前加载距离 | string | '200px' | - |
| lazy.renderPlaceholder | 自定义占位符渲染函数 | function | - | - |

## 自定义占位符渲染

通过 `renderPlaceholder` 函数，你可以完全自定义懒加载时的占位符显示内容：

```tsx | pure
<BaseMarkdownEditor
  lazy={{
    enable: true,
    placeholderHeight: 120,
    rootMargin: '300px',
    renderPlaceholder: ({ height, style, isIntersecting, elementInfo }) => (
      <div style={style}>
        <div>加载中... {isIntersecting ? '(即将显示)' : ''}</div>
        {elementInfo && (
          <div>
            {elementInfo.type} - {elementInfo.index + 1}/{elementInfo.total}
          </div>
        )}
      </div>
    ),
  }}
  initValue={content}
  height={600}
/>
```

### renderPlaceholder 参数说明

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| height | 占位符高度（px） | `number` | - | - |
| style | 计算后的占位符样式 | `CSSProperties` | - | - |
| isIntersecting | 元素是否即将进入视口 | `boolean` | - | - |
| elementInfo | 元素信息（可选） | `object` | - | - |
| elementInfo.type | 元素类型 | `string` | - | - |
| elementInfo.index | 元素在文档中的索引 | `number` | - | - |
| elementInfo.total | 元素总数量 | `number` | - | - |

### 占位符样式示例

```tsx | pure
// 渐变背景占位符
renderPlaceholder: ({ height, style, isIntersecting }) => (
  <div
    style={{
      ...style,
      background: isIntersecting
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      borderRadius: '8px',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {isIntersecting ? '即将显示...' : '加载中...'}
  </div>
);

// 骨架屏占位符
renderPlaceholder: ({ height, style }) => (
  <div style={{ ...style, padding: '16px', background: '#fafafa' }}>
    <div
      style={{
        height: '20px',
        background: '#e0e0e0',
        borderRadius: '4px',
        marginBottom: '12px',
      }}
    />
    <div
      style={{
        height: '16px',
        background: '#e0e0e0',
        borderRadius: '4px',
        marginBottom: '8px',
        width: '80%',
      }}
    />
    <div
      style={{
        height: '16px',
        background: '#e0e0e0',
        borderRadius: '4px',
        width: '60%',
      }}
    />
  </div>
);
```

## 性能优化建议

### 1. 调整 rootMargin

`rootMargin` 控制提前加载的距离。较大的值可以让内容提前加载，避免用户看到占位符：

```tsx | pure
// 提前 500px 加载，适合滚动速度较快的场景
lazy={{ enable: true, rootMargin: '500px' }}

// 只在进入视口时加载，最大化性能优化
lazy={{ enable: true, rootMargin: '0px' }}
```

### 2. 设置合适的占位符高度

`placeholderHeight` 应该接近实际元素的高度，以减少布局抖动：

```tsx | pure
// 根据内容类型设置不同高度
lazy={{
  enable: true,
  placeholderHeight: 200  // 适合包含大量图片的段落
}}
```

### 3. 只读模式下使用

懒加载特别适合只读模式的长文档：

```tsx | pure
<BaseMarkdownEditor
  lazy={{ enable: true }}
  readonly={true}
  initValue={longMarkdownContent}
/>
```

### 4. 动态加载长文档内容

对于需要动态设置内容的场景，可以使用 `setMDContent` 方法配合 `options` 参数来优化长文档的加载性能：

```tsx | pure
import {
  BaseMarkdownEditor,
  MarkdownEditorInstance,
} from '@ant-design/agentic-ui';
import { useRef } from 'react';

export default () => {
  const editorRef = useRef<MarkdownEditorInstance>(null);

  const handleLoadContent = async () => {
    const longMarkdown = '...'; // 很长的 markdown 内容

    // 使用 setMDContent 的 options 优化加载
    await editorRef.current?.store.setMDContent(longMarkdown, undefined, {
      chunkSize: 5000, // 超过 5000 字符启用分批处理
      separator: '\n\n', // 使用段落分隔符拆分
      useRAF: true, // 使用 RAF 避免卡顿
      batchSize: 50, // 每帧处理 50 个节点
      onProgress: (progress) => {
        console.log(`加载进度: ${Math.round(progress * 100)}%`);
      },
    });
  };

  return <BaseMarkdownEditor lazy={{ enable: true }} editorRef={editorRef} />;
};
```

#### setMDContent Options 配置说明

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| chunkSize | 分块大小阈值，超过此大小会启用分批处理 | `number` | `5000` | - |
| separator | 分隔符，用于拆分长文本 | `string` | `'\n\n'` | - |
| useRAF | 是否使用 RAF 优化，分批解析和插入内容，避免长文本处理时卡顿 | `boolean` | `true` | - |
| batchSize | 每帧处理的节点数量（仅在 useRAF=true 时生效） | `number` | `50` | - |
| onProgress | 进度回调函数，接收当前进度 (0-1) 作为参数，边解析边插入 | `(progress: number) => void` | - | - |

**使用建议**：

- **超长文档（10000+ 字符）**：启用 `useRAF` 和适当的 `batchSize`，避免主线程阻塞
- **实时进度显示**：使用 `onProgress` 回调显示加载进度条，进度值从 0 到 1
  - 边解析边插入，实时显示内容，提升用户体验
- **合理的分块**：根据文档结构调整 `separator`（如 `\n\n` 按段落，`\n# ` 按标题）
- **配合懒加载**：`setMDContent` 的优化针对解析和插入两个阶段，配合 `lazy` 渲染可获得最佳性能

**性能优化原理**：

当 `useRAF=true` 且分块数量 > 10 时，`setMDContent` 会使用 RAF 边解析边插入：

1. **单阶段处理**：每帧解析 `batchSize/10` 个 markdown chunks 并立即插入到编辑器
2. **实时显示**：内容逐步显示，用户可以看到加载过程，提升体验
3. **非阻塞**：使用 RAF 避免长时间阻塞主线程，保持页面响应

这样可以避免大文档解析时卡住主线程，同时提供更好的用户体验。

## 注意事项

1. **表格元素**：表格的单元格和行不会被懒加载包裹，以保持表格结构的完整性
2. **编辑模式**：懒加载在编辑模式下可能会影响编辑体验，建议主要在只读模式下使用
3. **首屏内容**：调整 `rootMargin` 以确保首屏内容能够立即加载
4. **布局抖动**：设置合适的 `placeholderHeight` 可以减少滚动时的布局跳动

### 加载可靠性优化

为了解决偶发加载不出来的问题，`LazyElement` 组件实现了双重保障机制：

1. **IntersectionObserver 监听**：主要的加载触发机制，实时监听元素进入视口
2. **后备检查机制**：100ms 后自动检查元素是否在视口内，确保不会遗漏

**常见场景处理：**

- ✅ **初始加载时元素已在视口内**：后备检查会立即触发加载
- ✅ **快速滚动**：IntersectionObserver 会及时捕获
- ✅ **动态内容加载**：两种机制互为补充，确保可靠性

**调试建议：**

如果发现元素未加载，可以检查：

**方案 1：增加 rootMargin 提前加载距离**

```tsx | pure
lazy={{
  enable: true,
  rootMargin: '500px', // 更大的提前加载范围
}}
```

**方案 2：使用自定义占位符来观察加载状态**

```tsx | pure
lazy={{
  enable: true,
  renderPlaceholder: ({ height, style, isIntersecting, elementInfo }) => (
    <div style={{ ...style, padding: '10px', background: '#f0f0f0' }}>
      <div>元素 {elementInfo.index + 1}/{elementInfo.total}</div>
      <div>状态: {isIntersecting ? '即将加载' : '等待中'}</div>
    </div>
  ),
}}
```

## 性能对比

### 懒加载渲染性能

在包含 1000+ 段落的长文档测试中：

| 指标         | 普通模式 | 懒加载模式 | 提升    |
| ------------ | -------- | ---------- | ------- |
| 首次渲染时间 | ~3000ms  | ~300ms     | **10x** |
| 内存占用     | ~150MB   | ~50MB      | **3x**  |
| 滚动流畅度   | 偶尔卡顿 | 流畅       | ✅      |

### setMDContent 优化性能

在处理 50000000+ 字符的超长文档时：

| 指标         | 普通模式    | 使用 RAF 优化 | 提升   |
| ------------ | ----------- | ------------- | ------ |
| 内容解析时间 | ~2000ms     | ~500ms        | **4x** |
| 主线程阻塞   | 严重（2s+） | 无阻塞        | ✅     |
| 用户交互     | 卡顿        | 流畅          | ✅     |

**最佳实践**：结合懒加载渲染和 setMDContent 优化，可获得最佳的性能体验。

## API

### MarkdownEditorProps

```tsx | pure
interface MarkdownEditorProps {
  /**
   * 懒加载渲染配置
   * 启用后，每个元素都会被包裹在 IntersectionObserver 容器中
   * 只有在视口内时才会真正渲染
   */
  lazy?: {
    /**
     * 是否启用懒加载，默认 false
     */
    enable?: boolean;
    /**
     * 占位符高度（单位：px），默认 25
     */
    placeholderHeight?: number;
    /**
     * 提前加载的距离，默认 '200px'
     * 支持所有 IntersectionObserver rootMargin 的值
     * 例如: '200px', '50%', '100px 200px'
     */
    rootMargin?: string;
  };
}
```

### EditorStore.setMDContent

动态设置编辑器内容的方法，支持性能优化配置：

```tsx | pure
/**
 * 从 markdown 文本设置编辑器内容
 * @param md - Markdown 字符串
 * @param plugins - 可选的自定义解析插件
 * @param options - 可选的性能优化配置
 * @returns 如果使用 RAF，返回 Promise；否则同步执行
 */
setMDContent(
  md: string,
  plugins?: any[],
  options?: {
    /** 分块大小阈值，默认 5000 字符 */
    chunkSize?: number;
    /** 分隔符，默认 '\n\n' */
    separator?: string;
    /** 是否使用 RAF 优化，默认 true */
    useRAF?: boolean;
    /** 每帧处理的节点数量，默认 50 */
    batchSize?: number;
    /** 进度回调函数 */
    onProgress?: (progress: number) => void;
  }
): void | Promise<void>;
```

**使用示例**：

```tsx | pure
// 通过 editorRef 访问 store
const editorRef = useRef<MarkdownEditorInstance>(null);

// 加载长文档
await editorRef.current?.store.setMDContent(longMarkdown, undefined, {
  useRAF: true,
  batchSize: 50,
  onProgress: (progress) => {
    setLoadingProgress(progress);
  },
});
```

## 示例

### 懒加载渲染示例

<code src="../demos/lazy-render-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

### setMDContent 动态加载示例

<code src="../demos/setmd-content-demo.tsx" background="var(--main-bg-color)" iframe=680></code>

### 懒加载 PDF 跳转示例

<code src="../demos/lazy-render-pdf-jump-demo.tsx" background="var(--main-bg-color)" iframe=540></code>
