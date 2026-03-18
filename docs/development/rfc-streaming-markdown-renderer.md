# RFC: 流式场景下使用 Markdown Renderer 替代 Slate 渲染

> **状态**: Draft
> **作者**: agentic-ui team
> **创建日期**: 2026-03-18

## 目录 {#toc}

- [背景与动机](#background)
- [现有架构分析](#current-architecture)
- [性能瓶颈分析](#performance-bottlenecks)
- [方案概览](#proposal-overview)
- [详细设计](#detailed-design)
  - [双模渲染架构](#dual-mode-architecture)
  - [字符队列系统](#character-queue-system)
  - [MarkdownRenderer 组件](#markdown-renderer-component)
  - [插件渲染适配](#plugin-rendering-adaptation)
  - [流式 → 编辑模式切换](#mode-switching)
- [迁移策略](#migration-strategy)
- [对比评估](#comparison)
- [风险与缓解](#risks)
- [实施路线](#implementation-roadmap)

---

## 背景与动机 {#background}

在 AI 对话场景中，消息以 SSE 流式方式逐 token 到达。当前系统使用 Slate 编辑器同时承担"流式渲染"和"内容编辑"两个职责。但流式场景**从不需要编辑能力**——用户只是在看 AI 逐字输出的内容。让一个富文本编辑器框架去承担纯渲染任务，是典型的"杀鸡用牛刀"。

核心诉求：

1. **极致的流式渲染性能**——每个 token 到达时 < 1ms 完成 DOM 更新
2. **天然的打字动画支持**——字符队列驱动，天然支持逐字/逐词/逐段动画
3. **降低架构复杂度**——消除 Markdown → Slate AST → Diff → Transforms → DOM 的冗长链路
4. **保持功能完整性**——代码高亮、图表、Mermaid、KaTeX 等插件能力不丢失

---

## 现有架构分析 {#current-architecture}

### 流式渲染链路

```
SSE token 到达
  → originData.content 字符串增长
    → MarkdownPreview useEffect 触发
      → parserMdToSchema(content)          // Markdown → mdast → Slate Nodes
        → store.updateNodeList(schema)     // Diff 旧 Slate 树 vs 新 Slate 树
          → generateDiffOperations()       // 生成 insert/remove/update/text 操作
            → executeOperations()          // 通过 Slate Transforms 应用操作
              → Slate reconcile            // Slate 内部 reconciliation
                → React re-render          // React 更新真实 DOM
```

### 涉及文件

| 文件 | 职责 |
|------|------|
| `src/Bubble/MessagesContent/MarkdownPreview.tsx` | 流式场景入口，content → schema → updateNodeList |
| `src/MarkdownEditor/BaseMarkdownEditor.tsx` | 创建 Slate Editor 实例，挂载全部编辑态基础设施 |
| `src/MarkdownEditor/editor/Editor.tsx` | Slate `<Editable>` 渲染，包含 paste/keyboard/composition 等编辑逻辑 |
| `src/MarkdownEditor/editor/store.ts` | `updateNodeList` + `generateDiffOperations` 差分更新核心 |
| `src/MarkdownEditor/editor/parser/parserMdToSchema.ts` | Markdown → Slate Node 解析 |
| `src/MarkdownEditor/editor/elements/` | 各元素的 Readonly 组件（ReadonlyParagraph、ReadonlyCode 等） |
| `src/Plugins/` | 标准插件（chart、code、katex、mermaid） |

### 只读渲染时仍加载的编辑态开销

即使 `readonly=true`，当前系统仍然：

- 创建完整的 Slate Editor 实例（`createEditor()` + `withHistory` + `withReact` + `withMarkdown`）
- 创建 `EditorStore` 及其全部状态管理（高亮缓存、拖拽、输入法、脚注映射等）
- 加载键盘事件系统 `useSystemKeyboard`
- 注册 `useOnchange`、`useHighlight`、`useKeyboard` hooks
- 创建 RxJS Subject（`keyTask$`、`insertCompletionText$`、`openInsertLink$`）
- 维护 Slate 内部的 Operation 队列、History 栈、Normalizing 逻辑

---

## 性能瓶颈分析 {#performance-bottlenecks}

### 每次 token 到达的计算成本

以一条包含代码块和表格的典型 AI 回复为例，每次 `content` 变化时：

| 步骤 | 操作 | 时间复杂度 | 说明 |
|------|------|-----------|------|
| 1 | `parserMdToSchema(content)` | O(n) | 全量重新解析整个 content 字符串 |
| 2 | `generateDiffOperations()` | O(n) | 递归比较新旧 Slate 节点树 |
| 3 | `executeOperations()` | O(k) | 通过 Transforms 执行 k 个操作 |
| 4 | Slate normalizing | O(k) | 每个 Transform 触发 normalize |
| 5 | React reconciliation | O(m) | Slate 触发 m 个组件更新 |

**关键问题**：步骤 1 和 2 在每个 token 到达时都是 **全量** 操作。当 content 达到数千字时，仅解析和比较就需要数毫秒。而 SSE 场景下 token 可能以 50-100ms 间隔到达，导致持续的 CPU 压力。

### Slate 的 Structural Overhead

Slate 为每个文本操作维护以下数据结构：

- **Operation 日志**：每个 `Transforms.insertText` 产生一条不可变 Operation
- **History 栈**：`withHistory` 在 readonly 场景下仍然记录操作（undo/redo 栈）
- **Path 解析**：每次操作都要通过 Path 定位 DOM 节点
- **Normalize**：每个 Transform 后触发 normalizing pass

这些对编辑器至关重要，但对纯渲染来说完全是浪费。

### 内存开销

Slate 维护两棵平行的树：

- **Slate Document Model**：JSON 节点树
- **React VDOM**：通过 `slate-react` 的 `Editable` 渲染的 React 元素树

在流式场景下，两棵树在每次 token 到达时都要同步更新和 reconcile。

---

## 方案概览 {#proposal-overview}

### 核心思路

```
                  ┌──────────────────────────────────────┐
                  │        MarkdownEditor (现有)           │
                  │   Slate 编辑器 —— 仅用于编辑模式        │
                  └──────────────────────────────────────┘

                  ┌──────────────────────────────────────┐
                  │     MarkdownRenderer (新增)            │
                  │   HTML 渲染器 + 字符队列 —— 用于只读/   │
                  │   流式渲染                              │
                  └──────────────────────────────────────┘
```

**在非编辑模式下（流式/只读），完全不创建 Slate 实例**，而是：

1. Markdown 字符串 → unified pipeline → HTML 字符串
2. HTML 通过 React `dangerouslySetInnerHTML` 或自定义渲染树输出
3. 特殊块（代码、图表、Mermaid、KaTeX）通过 HTML 后处理识别并替换为 React 组件
4. 流式场景配合字符队列实现平滑的逐字输出动画

### 新的流式渲染链路

```
SSE token 到达
  → CharacterQueue.push(newChars)        // O(1) 推入队列
    → RAF tick
      → CharacterQueue.flush(batchSize)  // O(b) 取出 b 个字符
        → displayedContent += flushed    // O(1) 字符串拼接
          → markdownToHtml(displayed)    // O(n) 增量或全量转 HTML
            → React setState             // DOM 更新
```

**与现有链路的关键差异**：

- **消除 Slate 整体**：无 Slate 实例、无 Operation、无 History、无 Normalize
- **字符队列解耦**：token 到达和渲染频率解耦，天然防抖
- **更少的中间表示**：Markdown → HTML（两层），而非 Markdown → mdast → Slate Nodes → React VDOM（四层）

---

## 详细设计 {#detailed-design}

### 1. 双模渲染架构 {#dual-mode-architecture}

在 `MarkdownPreview`（Bubble 渲染入口）层面做模式分发：

```tsx
interface MarkdownPreviewProps {
  content: string;
  typing?: boolean;
  readonly?: boolean;
  // ... 其余 props
}

const MarkdownPreview = (props: MarkdownPreviewProps) => {
  const { content, typing, readonly = true } = props;

  // 流式/只读场景：使用轻量级 Markdown Renderer
  if (readonly) {
    return (
      <MarkdownRenderer
        content={content}
        streaming={typing}
        plugins={props.plugins}
        // 传递插件渲染配置
      />
    );
  }

  // 编辑场景：使用 Slate 编辑器（保持不变）
  return (
    <MarkdownEditor
      initValue={content}
      readonly={false}
      // ...
    />
  );
};
```

**向后兼容**：`MarkdownEditor` 组件保持不变，编辑模式完全不受影响。

### 2. 字符队列系统 {#character-queue-system}

字符队列是流式渲染的核心，负责：

- 接收 SSE 推送的 token（任意速率）
- 以固定帧率（60fps / RAF）输出字符
- 支持可配置的输出速率和动画效果

```tsx
interface CharacterQueueOptions {
  /** 每帧输出的最大字符数，默认 3 */
  charsPerFrame?: number;
  /** 是否启用打字动画，默认 true（流式时） */
  animate?: boolean;
  /** 动画速度因子，1.0 为标准速度 */
  speed?: number;
  /** flush 策略: 'character' | 'word' | 'token' */
  flushStrategy?: 'character' | 'word' | 'token';
  /** 内容完成后立即 flush 全部剩余 */
  flushOnComplete?: boolean;
}

class CharacterQueue {
  private buffer: string = '';
  private displayedLength: number = 0;
  private fullContent: string = '';
  private rafId: number | null = null;
  private onFlush: (displayed: string) => void;
  private options: Required<CharacterQueueOptions>;

  constructor(
    onFlush: (displayed: string) => void,
    options?: CharacterQueueOptions,
  ) {
    this.onFlush = onFlush;
    this.options = {
      charsPerFrame: options?.charsPerFrame ?? 3,
      animate: options?.animate ?? true,
      speed: options?.speed ?? 1.0,
      flushStrategy: options?.flushStrategy ?? 'character',
      flushOnComplete: options?.flushOnComplete ?? true,
    };
  }

  /** SSE token 到达时调用 */
  push(content: string): void {
    this.fullContent = content;
    if (!this.options.animate) {
      // 非动画模式，直接显示全部
      this.displayedLength = content.length;
      this.onFlush(content);
      return;
    }
    this.startTick();
  }

  /** 标记流式完成，flush 所有剩余内容 */
  complete(): void {
    if (this.options.flushOnComplete) {
      this.cancelTick();
      this.displayedLength = this.fullContent.length;
      this.onFlush(this.fullContent);
    }
  }

  private startTick(): void {
    if (this.rafId !== null) return;
    this.rafId = requestAnimationFrame(this.tick);
  }

  private tick = (): void => {
    const remaining = this.fullContent.length - this.displayedLength;
    if (remaining <= 0) {
      this.rafId = null;
      return;
    }

    const batchSize = Math.max(
      1,
      Math.ceil(this.options.charsPerFrame * this.options.speed),
    );
    this.displayedLength = Math.min(
      this.displayedLength + batchSize,
      this.fullContent.length,
    );
    this.onFlush(this.fullContent.slice(0, this.displayedLength));

    this.rafId = requestAnimationFrame(this.tick);
  };

  dispose(): void {
    this.cancelTick();
  }

  private cancelTick(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
```

**设计要点**：

- `push(content)` 接收的是**完整的 content 字符串**（与当前 `originData.content` 行为一致），而非增量 diff。队列内部通过 `displayedLength` 指针实现增量输出。
- `flushStrategy` 支持不同粒度的输出：按字符、按词（空格分隔）、按 token（SSE 原始 chunk）。
- 流式完成时，`complete()` 可以立即 flush 所有剩余内容，避免"拖尾"。

### 3. MarkdownRenderer 组件 {#markdown-renderer-component}

MarkdownRenderer 是核心的渲染组件：

```tsx
interface MarkdownRendererProps {
  /** 完整的 markdown 内容（持续增长） */
  content: string;
  /** 是否处于流式状态 */
  streaming?: boolean;
  /** 流式完成 */
  isFinished?: boolean;
  /** 字符队列配置 */
  queueOptions?: CharacterQueueOptions;
  /** 插件配置（用于自定义块渲染） */
  plugins?: MarkdownEditorPlugin[];
  /** markdownToHtml 的额外 remark/rehype 插件 */
  remarkPlugins?: MarkdownRemarkPlugin[];
  /** HTML 渲染配置 */
  htmlConfig?: MarkdownToHtmlConfig;
  /** 自定义块渲染器 */
  blockRenderers?: Record<string, React.ComponentType<BlockRendererProps>>;
  /** 类名 */
  className?: string;
  /** 样式 */
  style?: React.CSSProperties;
}
```

#### 3.1 渲染流程

```
displayedContent (string)
  │
  ├── markdownToHtmlSync(displayedContent)    // unified pipeline
  │     → HTML string
  │
  ├── extractSpecialBlocks(html)              // 提取代码块/图表/mermaid/katex
  │     → { html, blocks: SpecialBlock[] }
  │
  └── render
        ├── <div dangerouslySetInnerHTML>     // 普通 HTML 内容
        └── <SpecialBlockPortal>              // 特殊块通过 React Portal 渲染
              ├── <CodeHighlight />
              ├── <ChartRenderer />
              ├── <MermaidRenderer />
              └── <KatexRenderer />
```

#### 3.2 增量 HTML 转换优化

全量执行 `markdownToHtml` 在长文档时成本较高。采用**分块缓存**策略：

```tsx
interface BlockCache {
  /** 源 markdown 文本 */
  source: string;
  /** 转换后的 HTML */
  html: string;
  /** 块类型标记 */
  blockType: 'paragraph' | 'code' | 'table' | 'heading' | 'list' | 'other';
}

class IncrementalMarkdownRenderer {
  private blockCaches: BlockCache[] = [];
  private lastContent: string = '';

  render(content: string): string {
    // 找到与上次内容的差异起始位置
    const diffStart = this.findDiffStart(content, this.lastContent);

    // 确定受影响的块边界
    const affectedBlockIndex = this.findAffectedBlockIndex(diffStart);

    // 只重新解析受影响的块之后的部分
    const unchangedHtml = this.blockCaches
      .slice(0, affectedBlockIndex)
      .map((b) => b.html)
      .join('');

    const changedContent = this.getContentFromBlock(content, affectedBlockIndex);
    const changedHtml = markdownToHtmlSync(changedContent);

    // 更新缓存
    this.updateCaches(content, affectedBlockIndex, changedHtml);
    this.lastContent = content;

    return unchangedHtml + changedHtml;
  }

  private findDiffStart(a: string, b: string): number {
    const minLen = Math.min(a.length, b.length);
    for (let i = 0; i < minLen; i++) {
      if (a[i] !== b[i]) return i;
    }
    return minLen;
  }

  // ... 其余实现
}
```

#### 3.3 特殊块渲染

特殊块（代码、图表、Mermaid、KaTeX）不能直接用 HTML 渲染，需要 React 组件。解决方案：

**方案 A：HTML 标记 + React Hydration**

在 unified pipeline 中，通过自定义 rehype 插件为特殊块添加 `data-*` 属性标记：

```html
<!-- 代码块 -->
<pre data-block-type="code" data-language="javascript" data-block-id="b1">
  <code>const x = 1;</code>
</pre>

<!-- 图表 -->
<div data-block-type="chart" data-block-id="b2" data-chart-config="...">
</div>
```

渲染后，通过 `useEffect` + `querySelectorAll` 找到标记节点，用 `createPortal` 挂载 React 组件：

```tsx
const useSpecialBlockPortals = (
  containerRef: React.RefObject<HTMLDivElement>,
  plugins: MarkdownEditorPlugin[],
) => {
  const [portals, setPortals] = useState<React.ReactPortal[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const blocks = containerRef.current.querySelectorAll('[data-block-type]');
    const newPortals: React.ReactPortal[] = [];

    blocks.forEach((block) => {
      const blockType = block.getAttribute('data-block-type');
      const renderer = getBlockRenderer(blockType, plugins);
      if (renderer) {
        newPortals.push(
          createPortal(
            React.createElement(renderer, {
              element: block,
              // ... props
            }),
            block,
          ),
        );
      }
    });

    setPortals(newPortals);
  }, [html]); // html 变化时重新扫描

  return portals;
};
```

**方案 B：React Markdown 组件树（推荐）**

不使用 `dangerouslySetInnerHTML`，而是将 HTML AST（hast）直接转为 React 元素树，在转换过程中直接替换特殊节点：

```tsx
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';

const markdownToReact = (
  markdown: string,
  components: Record<string, React.ComponentType>,
) => {
  const hast = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeKatex)
    .runSync(
      unified().use(remarkParse).parse(markdown)
    );

  return toJsxRuntime(hast, {
    Fragment,
    jsx,
    jsxs,
    components: {
      pre: ({ children, ...props }) => {
        // 拦截代码块，使用自定义渲染
        const language = extractLanguage(props);
        return <CodeHighlight language={language}>{children}</CodeHighlight>;
      },
      ...components,
    },
  });
};
```

**推荐方案 B**，因为：
- 无 `dangerouslySetInnerHTML`，无 XSS 风险
- React 组件树有完整的生命周期，可以做 memo 优化
- 插件系统可以直接注入自定义组件
- `hast-util-to-jsx-runtime` 是 unified 生态的标准方案

### 4. 插件渲染适配 {#plugin-rendering-adaptation}

现有的 Plugin 系统（`MarkdownEditorPlugin`）需要适配新的渲染模式。

#### 现有插件接口

```typescript
type MarkdownEditorPlugin = {
  elements?: Record<string, React.ComponentType<ElementProps<any>>>;
  parseMarkdown?: { match; convert }[];
  toMarkdown?: { match; convert }[];
  withEditor?: (editor: Editor) => Editor;
  // ...
};
```

#### 新增渲染器插件接口

```typescript
interface RendererPlugin {
  /** 用于 HTML/React 渲染模式的组件映射 */
  rendererComponents?: Record<string, React.ComponentType<RendererBlockProps>>;

  /** 自定义 rehype 插件，在 HTML 转换时使用 */
  rehypePlugins?: Plugin[];

  /** 自定义 remark 插件 */
  remarkPlugins?: Plugin[];
}

// 扩展现有的 MarkdownEditorPlugin
type MarkdownEditorPlugin = {
  // ... 现有字段保持不变

  /** 渲染器模式下的配置（新增） */
  renderer?: RendererPlugin;
};
```

#### 标准插件适配

```typescript
// 更新 standardPlugins
export const standardPlugins: MarkdownEditorPlugin[] = [
  {
    elements: {
      code: CodeElement,
      chart: ChartElement,
      katex: KatexElement,
      mermaid: Mermaid,
      'inline-katex': InlineKatex,
    },
    renderer: {
      rendererComponents: {
        // pre > code → CodeHighlight
        code: CodeHighlightRenderer,
        // data-chart → ChartRenderer
        chart: ChartBlockRenderer,
        // data-mermaid → MermaidRenderer
        mermaid: MermaidBlockRenderer,
      },
    },
  },
];
```

### 5. 流式 → 编辑模式切换 {#mode-switching}

某些场景需要在流式完成后切换到编辑模式（如用户点击编辑按钮）。设计平滑的切换方案：

```tsx
const EditableMessage = ({ content, isFinished }) => {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <MarkdownRenderer
        content={content}
        streaming={!isFinished}
        isFinished={isFinished}
      />
    );
  }

  // 切换到编辑模式时，才创建 Slate 实例
  return (
    <MarkdownEditor
      initValue={content}
      readonly={false}
      onChange={handleChange}
    />
  );
};
```

切换时延迟可以通过以下方式优化：

- **预解析**：在 `isFinished` 时预先调用 `parserMdToSchema` 缓存 Slate 节点
- **Skeleton**：切换瞬间显示骨架屏，Slate 初始化完成后替换
- **懒初始化**：Slate 实例在 `requestIdleCallback` 中创建

---

## 迁移策略 {#migration-strategy}

### 第一阶段：并行模式（低风险）

- 新增 `MarkdownRenderer` 组件，独立于现有代码
- 通过 feature flag / prop 控制使用哪种渲染模式
- `MarkdownPreview` 根据 `renderMode?: 'slate' | 'html'` 选择渲染器
- 默认仍使用 Slate（`renderMode='slate'`），新模式需要显式开启

```tsx
// MarkdownPreview.tsx
const MarkdownPreview = (props) => {
  const renderMode = props.markdownRenderConfig?.renderMode ?? 'slate';

  if (renderMode === 'html' && props.readonly !== false) {
    return <MarkdownRenderer {...adaptProps(props)} />;
  }

  // 现有逻辑不变
  return <MarkdownEditor readonly initValue={content} ... />;
};
```

### 第二阶段：只读场景默认切换

- 经过充分测试后，将只读场景的默认 `renderMode` 切换为 `'html'`
- `MarkdownEditor` 仅在编辑模式下使用
- 保留 `renderMode='slate'` 作为降级选项

### 第三阶段：清理

- 移除 `MarkdownEditor` 只读模式下的大量 Readonly 组件（`ReadonlyParagraph`、`ReadonlyHead` 等）
- 精简 `EditorStore`，移除只读相关的差分更新逻辑
- 统一插件系统，渲染器侧的组件成为主渲染路径

---

## 对比评估 {#comparison}

### 性能对比

| 指标 | Slate 渲染（现有） | HTML 渲染（新方案） | 提升 |
|------|-------------------|-------------------|------|
| 每 token 处理延迟 | 5-20ms (parse + diff + transforms) | < 1ms (queue push) | 10-20x |
| 首屏渲染 | 慢（需创建 Slate 实例） | 快（纯 HTML/React） | 2-3x |
| 内存占用 | 高（双树 + History + Store） | 低（单树 + HTML cache） | 50%+ |
| 长文档流式 | 线性退化（全量 diff） | 亚线性（增量 HTML + 缓存） | 显著 |
| CPU 占用（流式） | 持续高（每 token 全量计算） | 低（RAF 批量 + 队列） | 5-10x |

### 功能对比

| 功能 | Slate 渲染 | HTML 渲染 | 说明 |
|------|-----------|----------|------|
| 基础 Markdown | ✅ | ✅ | GFM、表格、列表等 |
| 代码高亮 | ✅ | ✅ | 通过 rendererComponents 适配 |
| 图表 | ✅ | ✅ | 通过 rendererComponents 适配 |
| Mermaid | ✅ | ✅ | 通过 rendererComponents 适配 |
| KaTeX | ✅ | ✅ | rehype-katex 原生支持 |
| 打字动画 | ❌ 无原生支持 | ✅ 字符队列天然支持 | 核心优势 |
| 内联编辑 | ✅ | ❌ 需切换到 Slate | 只读场景不需要 |
| 文本选择/复制 | ✅ | ✅ | 原生 HTML 选择 |
| 自定义渲染 | ✅ eleItemRender | ✅ blockRenderers / components | 接口略有不同 |
| Typewriter 滚动 | ✅ | ✅ | useAutoScroll 可复用 |

### 架构复杂度对比

| 维度 | Slate 渲染 | HTML 渲染 |
|------|-----------|----------|
| 中间表示层数 | 4 (MD → mdast → Slate → VDOM) | 2 (MD → HTML/hast → VDOM) |
| 依赖体积 | slate + slate-react + slate-history (~80KB) | unified 生态（已有） |
| 只读组件数 | 15+ Readonly* 组件 | 0（或少量 renderer 组件） |
| Store 复杂度 | EditorStore 2500+ 行 | 无需 Store |

---

## 风险与缓解 {#risks}

### 风险 1：渲染一致性

**问题**：Slate 渲染和 HTML 渲染的视觉输出可能不完全一致。

**缓解**：
- 复用现有的 CSS 类名体系（`prefixCls` + BEM）
- 为 MarkdownRenderer 的 HTML 输出应用相同的 CSS-in-JS 样式
- 建立视觉回归测试（Playwright screenshot comparison）

### 风险 2：插件兼容性

**问题**：现有插件的 `elements` 组件接收的是 Slate `ElementProps`，无法直接用于 HTML 渲染。

**缓解**：
- 新增 `renderer.rendererComponents` 接口，与 `elements` 并行
- 标准插件（code、chart、mermaid、katex）提供双模渲染组件
- 第三方插件可以选择性地实现 `renderer` 字段

### 风险 3：流式中途切换

**问题**：如果在流式进行中切换到编辑模式，需要无缝衔接。

**缓解**：
- 流式进行中禁止切换到编辑模式（UI 上 disable 编辑按钮）
- 流式完成后，通过预缓存的 `parserMdToSchema` 结果快速初始化 Slate

### 风险 4：HTML 安全性

**问题**：`dangerouslySetInnerHTML` 有 XSS 风险。

**缓解**：
- **推荐方案 B**（hast-util-to-jsx-runtime），完全不使用 dangerouslySetInnerHTML
- 如果使用方案 A，通过 `rehype-sanitize` 做 HTML 净化

### 风险 5：流式 Markdown 不完整片段

**问题**：流式过程中的 Markdown 可能是不完整的（如 `` ```js\nconst `` 代码块未闭合）。

**缓解**：
- 现有的 `parserMdToSchema` 已经处理了不完整片段的问题（因为当前就是每个 token 都重新解析）
- unified pipeline 同样能处理不完整的 Markdown（未闭合的代码块会当作最后一个块元素）
- 通过 `rehypeCodeBlock` 插件中已有的 `data-state="loading"` 标记来识别未完成的代码块
- 字符队列的 `flushStrategy` 可以避免在 markdown 语法标记中间截断

---

## 实施路线 {#implementation-roadmap}

### Phase 1：基础设施

涉及的新增/修改：

| 类型 | 路径 | 说明 |
|------|------|------|
| 新增 | `src/MarkdownRenderer/CharacterQueue.ts` | 字符队列核心 |
| 新增 | `src/MarkdownRenderer/MarkdownRenderer.tsx` | 主渲染组件 |
| 新增 | `src/MarkdownRenderer/useMarkdownToReact.ts` | hast → React 转换 hook |
| 新增 | `src/MarkdownRenderer/IncrementalRenderer.ts` | 增量渲染优化 |
| 新增 | `src/MarkdownRenderer/index.tsx` | 导出入口 |
| 新增 | `src/MarkdownRenderer/style.ts` | 样式文件 |
| 新增 | `src/MarkdownRenderer/types.ts` | 类型定义 |
| 新增 | `src/MarkdownRenderer/__tests__/` | 测试文件 |

### Phase 2：插件适配

| 类型 | 路径 | 说明 |
|------|------|------|
| 修改 | `src/MarkdownEditor/plugin.ts` | 扩展 MarkdownEditorPlugin 类型 |
| 新增 | `src/MarkdownRenderer/renderers/CodeRenderer.tsx` | 代码块渲染器 |
| 新增 | `src/MarkdownRenderer/renderers/ChartRenderer.tsx` | 图表渲染器 |
| 新增 | `src/MarkdownRenderer/renderers/MermaidRenderer.tsx` | Mermaid 渲染器 |
| 新增 | `src/MarkdownRenderer/renderers/KatexRenderer.tsx` | KaTeX 渲染器 |
| 修改 | `src/Plugins/defaultPlugins.tsx` | 添加 renderer 字段 |

### Phase 3：集成

| 类型 | 路径 | 说明 |
|------|------|------|
| 修改 | `src/Bubble/MessagesContent/MarkdownPreview.tsx` | 添加 renderMode 分发 |
| 修改 | `src/Workspace/RealtimeFollow/index.tsx` | 适配新渲染器 |
| 修改 | `src/ThoughtChainList/MarkdownEditor.tsx` | 适配新渲染器 |
| 修改 | `src/MarkdownEditor/types.ts` | 添加 renderMode 类型 |
| 修改 | `src/index.ts` | 导出 MarkdownRenderer |

### Phase 4：测试与优化

- 单元测试：CharacterQueue、IncrementalRenderer、MarkdownRenderer
- 集成测试：Bubble 流式渲染 E2E
- 性能基准测试：对比 Slate vs HTML 在不同文档长度下的渲染帧率
- 视觉回归测试：确保渲染一致性

---

## 附录：关键技术决策 {#appendix}

### Q: 为什么不用 react-markdown？

`react-markdown` 是一个成熟的方案，但：

1. 它每次渲染都会完整解析 Markdown，不支持增量渲染
2. 项目已经有完整的 unified pipeline（`markdownToHtml.ts`），复用更合理
3. 自定义控制力更强（hast-util-to-jsx-runtime 是 react-markdown 的底层）

### Q: 字符队列 vs 直接 setState？

直接 setState 的问题：

- SSE token 到达频率不可控（可能 10ms 一次），导致过度渲染
- 无法控制输出速率和动画效果
- `content` 变化 → `markdownToHtml` → DOM 更新的链路在高频触发时会卡顿

字符队列通过 RAF 限流，将渲染频率锁定在 60fps，同时提供平滑的逐字输出效果。

### Q: 增量 HTML 转换有必要吗？

对于 < 5000 字的普通消息，全量 `markdownToHtmlSync` 的耗时约 1-3ms，完全可接受。增量优化主要针对超长文档（> 10000 字）的场景。建议作为 Phase 4 的优化项，初期可以不实现。

### Q: 如何处理 Semantic 样式系统（classNames / styles props）？

MarkdownRenderer 应该复用现有的 CSS 类名和 CSS-in-JS token 系统：

```tsx
const MarkdownRenderer = (props) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-md-editor');
  const { wrapSSR, hashId } = useStyle(prefixCls);

  return wrapSSR(
    <div className={clsx(prefixCls, `${prefixCls}-readonly`, hashId)}>
      {/* HTML 内容 */}
    </div>
  );
};
```

这样 MarkdownRenderer 的输出会自动继承 MarkdownEditor 的样式体系。
