---
title: MarkdownRenderer - 流式 Markdown 渲染器
atomId: MarkdownRenderer
nav:
  order: 2
group:
  title: 内容呈现
  order: 4
---

# MarkdownRenderer - 流式 Markdown 渲染器

`MarkdownRenderer` 是一个轻量级的只读 Markdown 渲染组件，专为 LLM 的**流式输出**场景设计。相比 `MarkdownEditor` 的只读模式，它没有 Slate 依赖，渲染体积更小、首屏更快，并内置 GPT 风格的逐词淡入动画与丰富的代码块扩展（图表 / 思维链 / 工具调用 / 文件预览 / Mermaid / 公式）。

## 何时使用

- 需要在聊天 / Agent 场景中渲染 LLM 的 Markdown 输出
- 内容是**流式**追加的（`streaming` + 持续更新 `content`），需要 GPT 风格的逐词淡入
- 需要将代码块语言扩展为图表、Mermaid、文件树、工具调用、Schema 等业务渲染器
- 不需要编辑能力，希望尽可能轻量

> 如需可编辑能力（评论、富文本编辑、表格 inline 编辑等），请使用 [MarkdownEditor](./api)。

## 代码演示

### 综合 Demo

<code src="../demos/markdown-renderer-playground.tsx">API Playground - 串联调试核心 API</code>

<code src="../demos/markdown-renderer-streaming.tsx">流式 Markdown - GPT 风格逐词淡入</code>

### Mark 标签颜色与 Label

<code src="../demos/mark-color-label-demo.tsx">Mark 颜色定制与 Label 显示</code>

### 静态 Markdown

```tsx
import { MarkdownRenderer } from '@ant-design/agentic-ui';
import React from 'react';

export default () => (
  <MarkdownRenderer
    content={`# Hello\n\n这是 **Markdown** 内容。\n\n- 支持列表\n- 支持 \`代码\`\n\n\`\`\`ts\nconst answer = 42;\n\`\`\``}
  />
);
```

### 流式渲染

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

### 逐词淡入（GPT 风格）

流式时默认开启 GPT 风格的逐词淡入：新出现的词语各自淡入一次，已显示内容保持稳定、不闪烁，纯 CSS 驱动、性能友好，并自动尊重 `prefers-reduced-motion`。代码块、表格、公式不参与拆词，避免破坏布局。如需关闭，传 `throttleOptions={{ fade: false }}`。

### 自定义代码块渲染

通过 `plugins[].renderer.rendererComponents` 注册渲染器，键名对应代码块的 `language`。内置语言（`mermaid`、`chart`、`schema` 等）在这里注册的同名键会**优先**被使用，覆盖默认渲染。

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
            // 键名是 language；props.language 与 props.children（原始代码字符串节点）会透传
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

> 注意：`MarkdownEditorPlugin.elements` 用于 Slate 编辑器侧的元素渲染；`MarkdownRenderer` 不会读取它，只读 `plugin.renderer.rendererComponents`。

## API

### MarkdownRendererProps

| 属性                        | 说明                                                                                                                                                                                                      | 类型                                                                                | 默认值                   | 版本 |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------ | ---- |
| content                     | Markdown 文本内容                                                                                                                                                                                         | `string`                                                                            | -                        | -    |
| streaming                   | 是否处于流式输出过程中                                                                                                                                                                                    | `boolean`                                                                           | `false`                  | -    |
| isFinished                  | 流式输出是否已结束（触发限流器立即 flush 收尾）；仅在 `streaming={true}` 时生效                                                                                                                           | `boolean`                                                                           | `false`                  | -    |
| throttleOptions             | 流式限流与展示配置（含逐词淡入 `fade`）；`streaming={true}` 且未设 `enabled: false` 时默认开启限流                                                                                                        | `ContentThrottleOptions`                                                            | -                        | -    |
| plugins                     | 编辑器/渲染器插件，用于扩展元素渲染                                                                                                                                                                       | `MarkdownEditorPlugin[]`                                                            | -                        | -    |
| remarkPlugins               | 自定义 remark/rehype 插件，每项为 `Plugin` 或 `[Plugin, ...options]`，例如 `[remarkGfm, [remarkMath, { singleDollarTextMath: false }]]`                                                                   | `MarkdownRemarkPlugin[]`                                                            | -                        | -    |
| htmlConfig                  | Markdown → HTML 配置，详见下方 [MarkdownToHtmlConfig](#markdowntohtmlconfig)                                                                                                                              | `MarkdownToHtmlConfig`                                                              | -                        | -    |
| codeProps                   | 代码块配置（透传给 MarkdownEditor 的同名属性）                                                                                                                                                            | `MarkdownEditorProps['codeProps']`                                                  | -                        | -    |
| fncProps                    | 脚注配置（透传给 MarkdownEditor 的同名属性）                                                                                                                                                              | `MarkdownEditorProps['fncProps']`                                                   | -                        | -    |
| linkConfig                  | 链接行为配置；`openInNewTab` 仅在显式传 `false` 时同标签页打开（不传 `linkConfig` 或不传 `openInNewTab` 都视为新标签页）                                                                                  | `{ openInNewTab?: boolean; onClick?: (url?: string) => boolean \| void }`           | `{ openInNewTab: true }` | -    |
| apaasify                    | Apaas 数据双向绑定配置（注意：`render` 签名与 [`MarkdownEditor.apaasify`](./api) 不同——此处入参为已解析后的 value，而 `MarkdownEditor` 收到的是 `(props: RenderElementProps, originData?) => ReactNode`） | `{ enable?: boolean; render?: (value: any) => React.ReactNode }`                    | -                        | -    |
| fileMapConfig               | 文件地图（`agentic-ui-filemap`）代码块渲染配置                                                                                                                                                            | `FileMapConfig`                                                                     | -                        | -    |
| eleRender                   | 自定义节点渲染回退函数；返回 `undefined` 时回退默认渲染                                                                                                                                                   | `(props: MarkdownRendererEleProps, defaultDom: React.ReactNode) => React.ReactNode` | -                        | -    |
| className                   | 自定义类名                                                                                                                                                                                                | `string`                                                                            | -                        | -    |
| style                       | 自定义样式                                                                                                                                                                                                | `React.CSSProperties`                                                               | -                        | -    |
| prefixCls                   | 类名前缀（透传给 antd `getPrefixCls`）                                                                                                                                                                    | `string`                                                                            | `'agentic-md-editor'`    | -    |

### MarkdownRendererRef

通过 `ref` 暴露的命令式接口。

| 方法 / 字段         | 说明                                       | 类型                     |
| ------------------- | ------------------------------------------ | ------------------------ |
| nativeElement       | 根 DOM 节点                                | `HTMLDivElement \| null` |
| getDisplayedContent | 获取当前已实际渲染（含动画推进）的文本内容 | `() => string`           |

### ContentThrottleOptions

控制流式内容按帧顺序展示的节奏与节流，避免 SSE 一次推送过多导致整段突变；并统一承载逐词淡入开关。

| 属性                      | 说明                                                       | 类型      | 默认值 |
| ------------------------- | ---------------------------------------------------------- | --------- | ------ |
| charsPerFrame             | 每帧最多推进字符数                                         | `number`  | `3`    |
| speed                     | 速度倍率                                                   | `number`  | `1`    |
| flushOnComplete           | 流式结束时是否立即展示剩余内容                             | `boolean` | `true` |
| backgroundInterval        | 标签页不可见时的轮询间隔（毫秒）                           | `number`  | `100`  |
| backgroundBatchMultiplier | 后台每批字符相对前台倍数                                   | `number`  | `10`   |
| enabled                   | 为 `false` 时关闭限流，流式内容即时渲染                    | `boolean` | `true` |
| fade                      | GPT 风格逐词淡入开关；仅 `streaming` 时生效，传 `false` 关闭 | `boolean` | `true` |

### MarkdownToHtmlConfig

控制 Markdown → HTML 转换流水线。

| 属性              | 说明                                                                   | 类型                     | 默认值 |
| ----------------- | ---------------------------------------------------------------------- | ------------------------ | ------ |
| openLinksInNewTab | 是否在新标签页打开链接（与外层 `linkConfig.openInNewTab` 二选一即可）  | `boolean`                | -      |
| paragraphTag      | 自定义段落标签                                                         | `string`                 | `'p'`  |
| markedConfig      | 用户自定义 unified 插件数组，每项为 `Plugin` 或 `[Plugin, ...options]` | `MarkdownRemarkPlugin[]` | -      |

### FileMapConfig

控制 `agentic-ui-filemap` 代码块的预览行为。

| 属性          | 说明                                                          | 类型                                                                                    |
| ------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| onPreview     | 自定义预览（传入则阻止内置灯箱 / 弹窗 / window.open）         | `(file: AttachmentFile) => void`                                                        |
| itemRender    | 自定义媒体条目渲染                                            | `FileMapViewProps['itemRender']`                                                        |
| normalizeFile | 将原始 JSON 条目转为 `AttachmentFile`，返回 `null` 过滤该条目 | `(raw: Record<string, unknown>, defaultFile: AttachmentFile) => AttachmentFile \| null` |

## 内置代码块渲染器

`MarkdownRenderer` 默认根据代码块的 `language` 路由到不同渲染器，业务可直接通过书写带语言标记的代码块触发：

| Language                                                            | 对应渲染器                         | 用途                                                  |
| ------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------- |
| `mermaid`                                                           | `MermaidBlockRenderer`             | Mermaid 流程图 / 时序图                               |
| `chart` / `json-chart`                                              | `ChartBlockRenderer`               | 内置图表（line/bar/pie/area/scatter/radar/funnel 等） |
| `agentic-ui-filemap`                                                | `AgenticUiFileMapBlockRenderer`    | 文件地图 / 附件列表预览                               |
| `agentic-ui-task`                                                   | `AgenticUiTaskBlockRenderer`       | TaskList 任务步骤                                     |
| `agentic-ui-toolusebar` / `agentic-ui-usertoolbar`                  | `AgenticUiToolUseBarBlockRenderer` | ToolUseBar 工具调用                                   |
| `schema` / `apaasify` / `apassify` / `agentar-card`                 | `SchemaBlockRenderer`              | Schema 渲染 / 编辑（多语言别名等价触发）              |
| 其它（不匹配任何上述键时回退；含 `katex`、`ts`、`bash` 等普通代码） | `CodeBlockRenderer`                | 代码高亮、KaTeX 公式                                  |

> 这些渲染器均通过 `MarkdownRenderer` 顶层导出，可在自定义 Markdown 流水线中独立复用。

## 相关 Hook 与工具

| 名称                        | 说明                                                                                                                             |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `useMarkdownToReact`        | 将 Markdown 字符串同步转换为 React 节点（非流式场景）                                                                            |
| `markdownToReactSync`       | `useMarkdownToReact` 的非 Hook 版本                                                                                              |
| `useStreaming`              | 流式 Markdown token 安全缓存核心 Hook，暂缓未闭合语法避免半成品 DOM                                                              |
| `useStreamingMarkdownReact` | 与 `useMarkdownToReact` 是**同一函数**（互为别名）；真正"组合 token 缓存 + Markdown→React"发生在 `MarkdownRenderer` 顶层组件内部 |
| `useContentThrottle`        | 按 `ContentThrottleOptions` 限流推进已展示内容的 Hook                                                                           |

## 注意事项

1. **`isFinished` vs `streaming`**：流式过程中保持 `streaming={true}`；结束时将 `isFinished` 置为 `true` 会让限流器立即 flush 剩余字符并触发收尾。**`isFinished` 仅在 `streaming={true}` 时生效**；不传也不会卡住，限流器会自然按 `charsPerFrame` 推进完。
2. **`throttleOptions.fade` 的语义**：仅在 `streaming={true}` 时生效，默认开启逐词淡入；只有显式传 `throttleOptions={{ fade: false }}` 才关闭。代码块、表格、公式不参与拆词。
3. **`linkConfig.onClick`**：返回 `false` 可阻止默认跳转，便于实现路由内导航或埋点。
4. **`eleRender`**：返回 `undefined` / `null` 都会回退到默认 DOM；只有显式返回 React 节点才会覆盖默认渲染。
