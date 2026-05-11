---
title: MarkdownRenderer
atomId: MarkdownRenderer
nav:
  order: 2
group:
  title: 内容呈现
  order: 4
---

# MarkdownRenderer 流式 Markdown 渲染器

`MarkdownRenderer` 是一个轻量级的只读 Markdown 渲染组件，专为 LLM 的**流式输出**场景设计。相比 `MarkdownEditor` 的只读模式，它没有 Slate 依赖，渲染体积更小、首屏更快，并内置打字机 / 淡入动画与丰富的代码块扩展（图表 / 思维链 / 工具调用 / 文件预览 / Mermaid / 公式）。

## 何时使用

- 需要在聊天 / Agent 场景中渲染 LLM 的 Markdown 输出
- 内容是**流式**追加的（`streaming` + 持续更新 `content`），需要末段淡入动画
- 需要将代码块语言扩展为图表、Mermaid、文件树、工具调用、Schema 等业务渲染器
- 不需要编辑能力，希望尽可能轻量

> 如需可编辑能力（评论、富文本编辑、表格 inline 编辑等），请使用 [MarkdownEditor](./api)。

## 代码演示

<code src="../demos/markdown-renderer-playground.tsx">API Playground - 串联调试核心 API</code>

<code src="../demos/markdown-renderer-streaming.tsx">流式 Markdown - 末段淡入</code>

### 静态 Markdown

```tsx
import { MarkdownRenderer } from '@ant-design/agentic-ui';

export default () => (
  <MarkdownRenderer
    content={`# Hello\n\n这是 **Markdown** 内容。\n\n- 支持列表\n- 支持 \`代码\`\n\n\`\`\`ts\nconst answer = 42;\n\`\`\``}
  />
);
```

### 流式渲染

```tsx
import { MarkdownRenderer } from '@ant-design/agentic-ui';
import { useEffect, useState } from 'react';

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
      streamingParagraphAnimation
    />
  );
};
```

### 自定义代码块渲染

````tsx
import { MarkdownRenderer } from '@ant-design/agentic-ui';

export default () => (
  <MarkdownRenderer
    content={'```mermaid\ngraph TD;\nA-->B;\n```'}
    plugins={[
      {
        elements: {
          code: ({ node, ...rest }) => {
            const language = node?.language;
            if (language === 'mermaid') return <pre>自定义 mermaid 渲染</pre>;
            return undefined;
          },
        },
      },
    ]}
  />
);
````

## API

### MarkdownRendererProps

| 属性                        | 说明                                                    | 类型                                                                                | 默认值                   | 版本 |
| --------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------ | ---- |
| content                     | Markdown 文本内容                                       | `string`                                                                            | -                        | -    |
| streaming                   | 是否处于流式输出过程中                                  | `boolean`                                                                           | `false`                  | -    |
| isFinished                  | 流式输出是否已结束（用于触发收尾刷新）                  | `boolean`                                                                           | `false`                  | -    |
| streamingParagraphAnimation | 末段淡入动画开关；未传时默认开启，仅 `false` 关闭       | `boolean`                                                                           | `true`                   | -    |
| queueOptions                | 流式打字机字符队列配置                                  | `CharacterQueueOptions`                                                             | -                        | -    |
| plugins                     | 编辑器/渲染器插件，用于扩展元素渲染                     | `MarkdownEditorPlugin[]`                                                            | -                        | -    |
| remarkPlugins               | 自定义 remark 插件                                      | `MarkdownRemarkPlugin[]`                                                            | -                        | -    |
| htmlConfig                  | Markdown → HTML 配置                                    | `MarkdownToHtmlConfig`                                                              | -                        | -    |
| codeProps                   | 代码块配置（透传给 MarkdownEditor 的同名属性）          | `MarkdownEditorProps['codeProps']`                                                  | -                        | -    |
| fncProps                    | 脚注配置（透传给 MarkdownEditor 的同名属性）            | `MarkdownEditorProps['fncProps']`                                                   | -                        | -    |
| linkConfig                  | 链接行为配置                                            | `{ openInNewTab?: boolean; onClick?: (url?: string) => boolean \| void }`           | `{ openInNewTab: true }` | -    |
| apaasify                    | Apaas 数据双向绑定配置                                  | `{ enable?: boolean; render?: (value: any) => React.ReactNode }`                    | -                        | -    |
| fileMapConfig               | 文件地图（`agentic-ui-filemap`）代码块渲染配置          | `FileMapConfig`                                                                     | -                        | -    |
| eleRender                   | 自定义节点渲染回退函数；返回 `undefined` 时回退默认渲染 | `(props: MarkdownRendererEleProps, defaultDom: React.ReactNode) => React.ReactNode` | -                        | -    |
| className                   | 自定义类名                                              | `string`                                                                            | -                        | -    |
| style                       | 自定义样式                                              | `React.CSSProperties`                                                               | -                        | -    |
| prefixCls                   | 类名前缀                                                | `string`                                                                            | -                        | -    |

### MarkdownRendererRef

通过 `ref` 暴露的命令式接口。

| 方法 / 字段         | 说明                                       | 类型                     |
| ------------------- | ------------------------------------------ | ------------------------ |
| nativeElement       | 根 DOM 节点                                | `HTMLDivElement \| null` |
| getDisplayedContent | 获取当前已实际渲染（含动画推进）的文本内容 | `() => string`           |

### CharacterQueueOptions

控制流式打字机字符队列的节奏与节流。

| 属性                      | 说明                                         | 类型      | 默认值  |
| ------------------------- | -------------------------------------------- | --------- | ------- |
| charsPerFrame             | 每帧推进的字符数                             | `number`  | `3`     |
| animate                   | 流式时是否启用打字机推进；非流式默认合并展示 | `boolean` | `false` |
| animateTailChars          | 仅对末尾 N 字做动画，前面内容立即展示        | `number`  | -       |
| speed                     | 速度因子                                     | `number`  | `1.0`   |
| flushOnComplete           | 完成时是否立即 flush 全部内容                | `boolean` | -       |
| backgroundInterval        | 后台批处理间隔（毫秒）                       | `number`  | `100`   |
| backgroundBatchMultiplier | 后台批处理乘数                               | `number`  | `10`    |

### FileMapConfig

控制 `agentic-ui-filemap` 代码块的预览行为。

| 属性          | 说明                                                          | 类型                                                                                    |
| ------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| onPreview     | 自定义预览（传入则阻止内置灯箱 / 弹窗 / window.open）         | `(file: AttachmentFile) => void`                                                        |
| itemRender    | 自定义媒体条目渲染                                            | `FileMapViewProps['itemRender']`                                                        |
| normalizeFile | 将原始 JSON 条目转为 `AttachmentFile`，返回 `null` 过滤该条目 | `(raw: Record<string, unknown>, defaultFile: AttachmentFile) => AttachmentFile \| null` |

## 内置代码块渲染器

`MarkdownRenderer` 默认根据代码块的 `language` 路由到不同渲染器，业务可直接通过书写带语言标记的代码块触发：

| Language                              | 对应渲染器                         | 用途                                                  |
| ------------------------------------- | ---------------------------------- | ----------------------------------------------------- |
| `mermaid`                             | `MermaidBlockRenderer`             | Mermaid 流程图 / 时序图                               |
| `chart`、`chart:line`、`chart:bar` 等 | `ChartBlockRenderer`               | 内置图表（line/bar/pie/area/scatter/radar/funnel 等） |
| `agentic-ui-filemap`                  | `AgenticUiFileMapBlockRenderer`    | 文件地图 / 附件列表预览                               |
| `agentic-ui-task`                     | `AgenticUiTaskBlockRenderer`       | TaskList 任务步骤                                     |
| `agentic-ui-tool-use-bar`             | `AgenticUiToolUseBarBlockRenderer` | ToolUseBar 工具调用                                   |
| `schema`                              | `SchemaBlockRenderer`              | Schema 渲染 / 编辑                                    |
| 其它（含 `katex`）                    | `CodeBlockRenderer`                | 代码高亮、KaTeX 公式                                  |

> 这些渲染器均通过 `MarkdownRenderer` 顶层导出，可在自定义 Markdown 流水线中独立复用。

## 相关 Hook 与工具

| 名称                        | 说明                                                             |
| --------------------------- | ---------------------------------------------------------------- |
| `useMarkdownToReact`        | 将 Markdown 字符串同步转换为 React 节点（非流式场景）            |
| `markdownToReactSync`       | `useMarkdownToReact` 的非 Hook 版本                              |
| `useStreaming`              | 流式 Markdown 推进核心 Hook，按 `CharacterQueueOptions` 控制节奏 |
| `useStreamingMarkdownReact` | 组合 `useStreaming` + `useMarkdownToReact` 的高阶 Hook           |
| `CharacterQueue`            | 字符级队列实现，可单独用于受控的字符推进                         |
| `AnimationText`             | 末段淡入动画包装组件，用于自定义渲染器                           |

## 注意事项

1. **`isFinished` vs `streaming`**：流式过程中保持 `streaming={true}`，结束时一定要将 `isFinished` 置为 `true`，否则末段动画无法收尾。
2. **`streamingParagraphAnimation` 的语义**：未传时默认开启；只有显式传 `false` 才关闭。
3. **`linkConfig.onClick`**：返回 `false` 可阻止默认跳转，便于实现路由内导航或埋点。
4. **`eleRender`**：返回 `undefined` / `null` 都会回退到默认 DOM；只有显式返回 React 节点才会覆盖默认渲染。
