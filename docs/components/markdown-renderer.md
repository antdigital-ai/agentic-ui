---
title: MarkdownRenderer - 流式 Markdown 渲染器
atomId: MarkdownRenderer
nav:
  order: 2
group:
  title: 内容呈现
  order: 4
---

# MarkdownRenderer - 流式 Markdown 渲染器 {#markdown-renderer}

`MarkdownRenderer` 是轻量只读 Markdown 渲染组件，面向 LLM **流式输出**。相比 `MarkdownEditor` 只读模式，无 Slate 依赖，体积更小、首屏更快；内置 GPT 风格逐词淡入，并支持图表 / 思维链 / 工具调用 / 文件预览 / Mermaid / 公式等代码块扩展。

## 何时使用 {#when-to-use}

- 聊天 / Agent 场景渲染 LLM 的 Markdown 输出
- 内容流式追加（`streaming` + 持续更新 `content`），需要 GPT 风格逐词淡入
- 将代码块语言扩展为图表、Mermaid、文件树、工具调用、Schema 等业务渲染器
- 不需要编辑能力，希望尽可能轻量

> 如需可编辑能力（评论、富文本、表格 inline 编辑等），请使用 [MarkdownEditor](./api)。

## 代码演示 {#demos}

### API Playground {#api-playground}

<code src="../demos/markdown-renderer-playground.tsx">串联调试流式、链接、自定义渲染与 ref</code>

### 流式与逐词淡入 {#streaming-fade}

<code src="../demos/markdown-renderer-streaming.tsx">流式输出 · 限流 / 淡入开关与对比预览</code>

`streaming={true}` 时默认开启 GPT 风格逐词淡入：新词各自淡入一次，已显示内容复用 DOM、不闪烁；纯 CSS 驱动，尊重 `prefers-reduced-motion`。代码块、表格、公式不参与拆词。关闭方式：

```tsx | pure
<MarkdownRenderer
  content={content}
  streaming
  throttleOptions={{ fade: false }}
/>
```

限流与淡入相互独立：`throttleOptions.enabled: false` 时内容即时渲染，`fade` 仍可单独控制。

### Mark 标签颜色与 Label {#mark-label}

<code src="../demos/mark-color-label-demo.tsx">Mark 颜色定制与 Label 显示</code>

## 快速上手 {#quick-start}

### 静态 Markdown {#static}

```tsx
import { MarkdownRenderer } from '@ant-design/agentic-ui';
import React from 'react';

export default () => (
  <MarkdownRenderer
    content={`# Hello\n\n这是 **Markdown** 内容。\n\n- 支持列表\n- 支持 \`代码\`\n\n\`\`\`ts\nconst answer = 42;\n\`\`\``}
  />
);
```

### 流式渲染 {#streaming}

```tsx
import { MarkdownRenderer } from '@ant-design/agentic-ui';
import React, { useEffect, useState } from 'react';

const FULL = '# 流式输出\n\n智能体正在思考，逐字给出答案……';

export default () => {
  const [content, setContent] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i += 3;
      setContent(FULL.slice(0, i));
      if (i >= FULL.length) {
        setDone(true);
        clearInterval(timer);
      }
    }, 60);
    return () => clearInterval(timer);
  }, []);

  return (
    <MarkdownRenderer
      content={content}
      streaming={!done}
      isFinished={done}
      // 逐词淡入默认开启；传 throttleOptions={{ fade: false }} 可关闭
    />
  );
};
```

在 Bubble 中经 `markdownRenderConfig` 透传即可：

```tsx | pure
<BubbleList
  markdownRenderConfig={{
    renderMode: 'markdown',
    throttleOptions: { fade: false }, // 可选：关闭淡入
  }}
/>
```

### 自定义代码块渲染 {#custom-code-block}

通过 `plugins[].renderer.rendererComponents` 注册渲染器，键名对应代码块 `language`。内置语言（`mermaid`、`chart`、`schema` 等）的同名键会**优先**覆盖默认渲染。

````tsx
import { MarkdownRenderer } from '@ant-design/agentic-ui';
import React from 'react';

export default () => (
  <MarkdownRenderer
    content={'```mermaid\ngraph TD;\nA-->B;\n```'}
    plugins={[
      {
        renderer: {
          rendererComponents: {
            // 键名是 language；props.language 与 props.children 会透传
            mermaid: ({ language, children }) => (
              <pre>自定义 {language} 渲染</pre>
            ),
          },
        },
      },
    ]}
  />
);
````

> `MarkdownEditorPlugin.elements` 仅用于 Slate 编辑器；`MarkdownRenderer` 只读 `plugin.renderer.rendererComponents`。

> 完整示例见 [OfficeViewer - Markdown 中渲染卡片](./office-viewer)：Word / Excel 渲染为文件卡片、PPTX 卡片内展示幻灯片缩略图列表，点击打开详情预览。

## API {#api}

### MarkdownRendererProps {#markdown-renderer-props}

| Property        | Description                                                                                           | Type                                                                                | Default                  | Version |
| --------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------ | ------- |
| apaasify        | Apaas 数据双向绑定（`render` 签名与 [`MarkdownEditor.apaasify`](./api) 不同：此处入参为已解析 value） | `{ enable?: boolean; render?: (value: any) => React.ReactNode }`                    | -                        | -       |
| className       | 自定义类名                                                                                            | `string`                                                                            | -                        | -       |
| codeProps       | 代码块配置（透传 MarkdownEditor 同名属性）                                                            | `MarkdownEditorProps['codeProps']`                                                  | -                        | -       |
| content         | Markdown 文本内容                                                                                     | `string`                                                                            | -                        | -       |
| eleRender       | 自定义节点渲染回退；返回 `undefined` 时用默认渲染                                                     | `(props: MarkdownRendererEleProps, defaultDom: React.ReactNode) => React.ReactNode` | -                        | -       |
| fileMapConfig   | 文件地图（`agentic-ui-filemap`）代码块渲染配置                                                        | `FileMapConfig`                                                                     | -                        | -       |
| fncProps        | 脚注配置（透传 MarkdownEditor 同名属性）                                                              | `MarkdownEditorProps['fncProps']`                                                   | -                        | -       |
| htmlConfig      | Markdown → HTML 配置，见 [MarkdownToHtmlConfig](#markdowntohtmlconfig)                                | `MarkdownToHtmlConfig`                                                              | -                        | -       |
| isFinished      | 流式是否已结束（触发限流器立即 flush）；仅 `streaming={true}` 时生效                                  | `boolean`                                                                           | `false`                  | -       |
| linkConfig      | 链接行为；仅显式 `openInNewTab: false` 时同标签页打开                                                 | `{ openInNewTab?: boolean; onClick?: (url?: string) => boolean \| void }`           | `{ openInNewTab: true }` | -       |
| plugins         | 编辑器 / 渲染器插件                                                                                   | `MarkdownEditorPlugin[]`                                                            | -                        | -       |
| prefixCls       | 类名前缀（透传 antd `getPrefixCls`）                                                                  | `string`                                                                            | `'agentic-md-editor'`    | -       |
| remarkPlugins   | 自定义 remark/rehype 插件，如 `[remarkGfm, [remarkMath, { singleDollarTextMath: false }]]`            | `MarkdownRemarkPlugin[]`                                                            | -                        | -       |
| streaming       | 是否处于流式输出                                                                                      | `boolean`                                                                           | `false`                  | -       |
| style           | 自定义样式                                                                                            | `React.CSSProperties`                                                               | -                        | -       |
| throttleOptions | 流式限流与展示配置（含逐词淡入 `fade`）；`streaming={true}` 且未设 `enabled: false` 时默认开启限流    | `ContentThrottleOptions`                                                            | -                        | -       |

### MarkdownRendererRef {#markdown-renderer-ref}

| Property / Method   | Description                                | Type                     |
| ------------------- | ------------------------------------------ | ------------------------ |
| getDisplayedContent | 获取当前已实际渲染（含限流推进）的文本内容 | `() => string`           |
| nativeElement       | 根 DOM 节点                                | `HTMLDivElement \| null` |

### ContentThrottleOptions {#content-throttle-options}

控制流式内容按帧推进的节奏，并统一承载逐词淡入开关。

| Property                  | Description                                              | Type      | Default | Version |
| ------------------------- | -------------------------------------------------------- | --------- | ------- | ------- |
| backgroundBatchMultiplier | 后台每批字符相对前台倍数                                 | `number`  | `10`    | -       |
| backgroundInterval        | 标签页不可见时的轮询间隔（ms）                           | `number`  | `100`   | -       |
| charsPerFrame             | 每帧最多推进字符数                                       | `number`  | `3`     | -       |
| enabled                   | 为 `false` 时关闭限流，流式内容即时渲染                  | `boolean` | `true`  | -       |
| fade                      | GPT 风格逐词淡入；仅 `streaming` 时生效，传 `false` 关闭 | `boolean` | `true`  | -       |
| flushOnComplete           | 流式结束时是否立即展示剩余内容                           | `boolean` | `true`  | -       |
| speed                     | 速度倍率                                                 | `number`  | `1`     | -       |

### MarkdownToHtmlConfig {#markdowntohtmlconfig}

| Property          | Description                                                           | Type                     | Default |
| ----------------- | --------------------------------------------------------------------- | ------------------------ | ------- |
| markedConfig      | 用户自定义 unified 插件数组                                           | `MarkdownRemarkPlugin[]` | -       |
| openLinksInNewTab | 是否在新标签页打开链接（与外层 `linkConfig.openInNewTab` 二选一即可） | `boolean`                | -       |
| paragraphTag      | 自定义段落标签                                                        | `string`                 | `'p'`   |

### FileMapConfig {#filemapconfig}

| Property      | Description                                                   | Type                                                                                    |
| ------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| itemRender    | 自定义媒体条目渲染                                            | `FileMapViewProps['itemRender']`                                                        |
| normalizeFile | 将原始 JSON 条目转为 `AttachmentFile`，返回 `null` 过滤该条目 | `(raw: Record<string, unknown>, defaultFile: AttachmentFile) => AttachmentFile \| null` |
| onPreview     | 自定义预览（传入则阻止内置灯箱 / 弹窗 / window.open）         | `(file: AttachmentFile) => void`                                                        |

## 内置代码块渲染器 {#built-in-renderers}

按代码块 `language` 路由；业务可直接书写带语言标记的代码块触发：

| Language                                            | Renderer                           | Description                                           |
| --------------------------------------------------- | ---------------------------------- | ----------------------------------------------------- |
| `mermaid`                                           | `MermaidBlockRenderer`             | Mermaid 流程图 / 时序图                               |
| `chart` / `json-chart`                              | `ChartBlockRenderer`               | 内置图表（line/bar/pie/area/scatter/radar/funnel 等） |
| `agentic-ui-filemap`                                | `AgenticUiFileMapBlockRenderer`    | 文件地图 / 附件列表预览                               |
| `agentic-ui-task`                                   | `AgenticUiTaskBlockRenderer`       | TaskList 任务步骤                                     |
| `agentic-ui-toolusebar` / `agentic-ui-usertoolbar`  | `AgenticUiToolUseBarBlockRenderer` | ToolUseBar 工具调用                                   |
| `schema` / `apaasify` / `apassify` / `agentar-card` | `SchemaBlockRenderer`              | Schema 渲染 / 编辑（多语言别名等价触发）              |
| 其它（含 `katex`、`ts`、`bash` 等）                 | `CodeBlockRenderer`                | 代码高亮、KaTeX 公式                                  |

> 上述渲染器均由 `MarkdownRenderer` 顶层导出，可在自定义流水线中独立复用。

## 相关 Hook 与工具 {#hooks}

| Name                        | Description                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `useMarkdownToReact`        | 将 Markdown 同步转为 React 节点（非流式）                                                                    |
| `markdownToReactSync`       | `useMarkdownToReact` 的非 Hook 版本                                                                          |
| `useStreaming`              | 流式 token 安全缓存，暂缓未闭合语法避免半成品 DOM                                                            |
| `useStreamingMarkdownReact` | 与 `useMarkdownToReact` 同一函数（互为别名）；token 缓存 + Markdown→React 组合发生在 `MarkdownRenderer` 内部 |
| `useContentThrottle`        | 按 `ContentThrottleOptions` 限流推进已展示内容                                                               |

## 注意事项 {#notes}

1. **`isFinished` vs `streaming`**：流式过程保持 `streaming={true}`；结束时将 `isFinished` 置 `true` 可立即 flush 限流剩余字符。`isFinished` 仅在 `streaming={true}` 时生效；不传也不会卡住，限流器会按 `charsPerFrame` 自然推完。
2. **`throttleOptions.fade`**：仅 `streaming={true}` 时生效，默认开启；仅显式 `fade: false` 关闭。代码块、表格、公式不参与拆词。Slate 模式（默认 `renderMode: 'slate'`）无逐词淡入。
3. **`linkConfig.onClick`**：返回 `false` 可阻止默认跳转。
4. **`eleRender`**：返回 `undefined` / `null` 回退默认 DOM；只有显式返回 React 节点才会覆盖。
