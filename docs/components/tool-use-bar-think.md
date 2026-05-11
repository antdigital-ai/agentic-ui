---
title: ToolUseBarThink 深度思考
atomId: ToolUseBarThink
group:
  title: 对话流
  order: 3
---

# ToolUseBarThink 深度思考

`ToolUseBarThink` 是一个独立的「深度思考」展示组件，用于在 Agent 对话流中呈现长链路思考过程（thinking）。它与 [ToolUseBar](./tool-use-bar) 同属工具调用展示族，但拥有独立的样式与交互：

- 默认展开收起 + Loading 浮动展开按钮
- 内容超长（默认 200px 高度）时支持二级展开 / 收起
- 提供 `light` 轻量模式，与文本流内嵌呈现

## 何时使用

- 智能体执行较长推理 / 思考过程，需要对外呈现思考摘要或流式 `thinkContent`
- 思考过程为「展示用」，与具体工具调用解耦时（不需要 `ToolUseBar` 的工具列表概念）
- 希望在对话流中以一个独立卡片单独展示「正在思考 / 思考完成」状态

## 代码演示

<code src="../demos/tool-use-bar-think-playground.tsx">API Playground - 状态 / 受控 / 流式 / 自定义样式</code>

<code src="../demos/tool-use-bar-think-standalone.tsx">深度思考 - 流式与多状态对比</code>

<code src="../demos/tool-use-bar-think-simple.tsx">深度思考 - 简化用法</code>

## API

### ToolUseBarThinkProps

| 属性                     | 说明                               | 类型                                  | 默认值              | 版本 |
| ------------------------ | ---------------------------------- | ------------------------------------- | ------------------- | ---- |
| toolName                 | 工具/思考名称                      | `React.ReactNode`                     | -                   | -    |
| toolTarget               | 工具目标 / 思考主题                | `React.ReactNode`                     | -                   | -    |
| time                     | 时间信息（如耗时）                 | `React.ReactNode`                     | -                   | -    |
| icon                     | 自定义图标（默认 Brain 图标）      | `React.ReactNode`                     | -                   | -    |
| thinkContent             | 思考内容（支持流式追加）           | `React.ReactNode`                     | -                   | -    |
| status                   | 组件状态                           | `'loading' \| 'success' \| 'error'`   | -                   | -    |
| light                    | 轻量 / 行内模式                    | `boolean`                             | `false`             | -    |
| expanded                 | 受控的展开状态                     | `boolean`                             | -                   | -    |
| defaultExpanded          | 默认展开状态                       | `boolean`                             | `false`             | -    |
| onExpandedChange         | 展开状态变化回调                   | `(expanded: boolean) => void`         | -                   | -    |
| floatingExpanded         | Loading 状态下浮动展开按钮的受控值 | `boolean`                             | -                   | -    |
| defaultFloatingExpanded  | 浮动展开按钮的默认值               | `boolean`                             | `false`             | -    |
| onFloatingExpandedChange | 浮动展开状态变化回调               | `(floatingExpanded: boolean) => void` | -                   | -    |
| testId                   | 测试 ID                            | `string`                              | `'ToolUseBarThink'` | -    |
| classNames               | Semantic 类名（按区域控制）        | `ToolUseBarThinkClassNames`           | -                   | -    |
| styles                   | Semantic 样式（按区域控制）        | `ToolUseBarThinkStyles`               | -                   | -    |

### ToolUseBarThinkClassNames

按区域提供 `classNames`，可只覆盖局部：

| 字段           | 说明                         |
| -------------- | ---------------------------- |
| root           | 根节点                       |
| bar            | 顶部条                       |
| header         | 头部容器                     |
| imageWrapper   | 图标容器（非 light 模式）    |
| name           | 名称区域                     |
| target         | 目标 / 主题区域              |
| time           | 时间区域                     |
| expand         | 顶部展开按钮                 |
| container      | 思考内容容器                 |
| content        | 思考内容文本                 |
| floatingExpand | Loading 状态下的浮动展开按钮 |

### ToolUseBarThinkStyles

`styles` 与 `classNames` 字段一一对应，类型为 `React.CSSProperties`，用法相同。

## 行为说明

1. **Loading 自动展开**：当 `status === 'loading'` 时，组件会自动将 `expanded` 置为 `true`，便于用户实时看到流式输出的思考内容。
2. **二级展开**：当 `thinkContent` 高度超过 200px 时，会在底部显示「展开 / 收起」按钮，避免长思考占据过多版面。
3. **浮动展开按钮**：仅在 `status === 'loading'` 且非 `light` 模式下展示；用于在收起状态下也能临时窥视实时内容。`floatingExpanded` / `defaultFloatingExpanded` 控制其状态。
4. **Light 模式**：`light={true}` 时使用更紧凑的样式（无独立图标容器、悬浮时切换 chevron），适合行内嵌入。
5. **可控 / 非可控**：`expanded` / `floatingExpanded` 同时支持受控与非受控，未传值时使用 `defaultExpanded` / `defaultFloatingExpanded` 作为初始值。

## 与 ToolUseBar 的关系

| 维度     | ToolUseBar                   | ToolUseBarThink              |
| -------- | ---------------------------- | ---------------------------- |
| 数据形态 | `tools: ToolCall[]` 列表     | 单条思考                     |
| 主要场景 | 工具调用列表（多条、多状态） | 单条深度思考 / 推理过程      |
| 默认展示 | 多条工具的状态条             | 单卡片 + 思考内容            |
| 是否互斥 | 否                           | 否；两者可在同一对话流中共存 |
