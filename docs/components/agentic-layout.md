---
title: AgenticLayout 智能体布局组件
atomId: AgenticLayout
group:
  title: 布局
  order: 1
---

# AgenticLayout 智能体布局组件

`AgenticLayout` 是一个专为智能体应用设计的三栏布局组件，支持左中右三个区域的灵活配置，内置左右侧栏折叠、右侧栏拖拽调整宽度等能力。

## 代码演示

### 基础用法

最简用法：只传 `center`，即可获得一个带圆角阴影的内容容器。

<code src="../demos/agentic-layout-basic.tsx" iframe=460>基础用法</code>

### 三栏布局与侧边栏宽度

通过 `left`、`center`、`right` 填充三栏内容，`leftWidth` 和 `rightWidth` 控制侧边栏宽度。

<code src="../demos/agentic-layout-sidebar.tsx" iframe=560>三栏布局 + leftWidth / rightWidth</code>

### 受控折叠

通过 `header.leftCollapsed` / `header.rightCollapsed` 与对应回调受控管理折叠状态，可在外部完全控制折叠逻辑（例如根据窗口宽度自动折叠）。

<code src="../demos/agentic-layout-collapse.tsx" iframe=520>受控折叠</code>

### 非受控折叠

使用 `header.leftDefaultCollapsed` / `header.rightDefaultCollapsed` 设置初始值，折叠状态由组件内部自动管理，无需外部 state。

<code src="../demos/agentic-layout-uncontrolled.tsx" iframe=480>非受控折叠</code>

### header 扩展内容

`header.title` 支持 ReactNode，`header.showShare` 开启分享按钮，`header.leftExtra` / `header.rightExtra` 在头部左右区域插入自定义内容。

<code src="../demos/agentic-layout-header-extra.tsx" iframe=1020>header 扩展内容</code>

### minHeight、style 与右侧栏拖拽

`minHeight` 控制组件最小高度，`className` / `style` 自定义根容器样式，右侧栏内置拖拽手柄可动态调整宽度。

<code src="../demos/agentic-layout-style.tsx" iframe=1100>minHeight、style 与拖拽调整宽度</code>

### 完整示例

结合 `History`、`ChatLayout`、`BubbleList`、`Workspace` 等组件，构成完整的智能体对话工作台界面。

<code src="../demos/agentic-layout.tsx" iframe=620>完整工作台示例</code>

## API

### AgenticLayoutProps

| 参数       | 说明                                                                                   | 类型                  | 默认值    |
| ---------- | -------------------------------------------------------------------------------------- | --------------------- | --------- |
| center     | 中间内容区域（必填）                                                                   | `ReactNode`           | -         |
| left       | 左侧边栏内容                                                                           | `ReactNode`           | -         |
| right      | 右侧边栏内容                                                                           | `ReactNode`           | -         |
| header     | 头部配置，包含折叠控制等（详见 [LayoutHeader](/components/layout-header)）             | `LayoutHeaderConfig`  | -         |
| leftWidth  | 左侧边栏宽度（px）                                                                     | `number`              | `256`     |
| rightWidth | 右侧边栏初始宽度（px），可通过拖拽调整，最小 400px，最大窗口宽度的 70%               | `number`              | `540`     |
| minHeight  | 组件最小高度                                                                           | `string \| number`    | `'600px'` |
| className  | 根容器自定义类名                                                                       | `string`              | -         |
| style      | 根容器自定义样式                                                                       | `React.CSSProperties` | -         |

### header 配置（LayoutHeaderConfig）

| 参数                  | 说明                                                         | 类型                           | 默认值  |
| --------------------- | ------------------------------------------------------------ | ------------------------------ | ------- |
| title                 | 标题，支持文本或自定义 ReactNode                             | `ReactNode`                    | -       |
| showShare             | 是否显示分享按钮                                             | `boolean`                      | `false` |
| leftCollapsible       | 是否显示左侧折叠按钮（传入 `left` 时自动为 `true`）         | `boolean`                      | -       |
| rightCollapsible      | 是否显示右侧折叠按钮（传入 `right` 时自动为 `true`）        | `boolean`                      | -       |
| leftCollapsed         | 左侧折叠状态（受控）                                         | `boolean`                      | -       |
| rightCollapsed        | 右侧折叠状态（受控）                                         | `boolean`                      | -       |
| leftDefaultCollapsed  | 左侧默认折叠状态（非受控）                                   | `boolean`                      | `false` |
| rightDefaultCollapsed | 右侧默认折叠状态（非受控）                                   | `boolean`                      | `false` |
| onLeftCollapse        | 左侧折叠按钮点击回调                                         | `(collapsed: boolean) => void` | -       |
| onRightCollapse       | 右侧折叠按钮点击回调                                         | `(collapsed: boolean) => void` | -       |
| onShare               | 分享按钮点击回调                                             | `() => void`                   | -       |
| leftExtra             | 标题右侧自定义内容（折叠按钮和分隔线之后）                  | `ReactNode`                    | -       |
| rightExtra            | 右侧操作区自定义内容（折叠按钮之后）                         | `ReactNode`                    | -       |
| className             | 头部自定义类名                                               | `string`                       | -       |

## 折叠状态说明

`AgenticLayout` 的折叠状态通过 `header` 属性统一管理，支持受控和非受控两种模式：

- **受控模式**：提供 `header.leftCollapsed` / `header.rightCollapsed` 和对应回调，折叠状态完全由外部控制，适合需要根据外部条件（如窗口宽度）自动折叠的场景。
- **非受控模式**：提供 `header.leftDefaultCollapsed` / `header.rightDefaultCollapsed` 作为初始值，后续状态由组件内部维护，适合折叠操作仅由用户手动触发的场景。

> 当同时传入受控值（`leftCollapsed`）和默认值（`leftDefaultCollapsed`）时，受控值优先。

## 右侧栏拖拽调整宽度

当传入 `right` 内容时，右侧栏左边缘会出现拖拽手柄（鼠标悬停高亮）。拖动手柄可调整右侧栏宽度，范围限制在 **400px ~ 窗口宽度的 70%** 之间。`rightWidth` prop 变更时会重置当前宽度。

## 注意事项

- `center` 属性是必填的，左右侧栏为可选
- 传入 `left` / `right` 内容时，对应折叠按钮会自动显示（无需手动设置 `leftCollapsible` / `rightCollapsible`）
- 建议在外层容器设置明确的高度，避免布局塌陷
