---
title: ChatLayout - 对话流容器组件
atomId: ChatLayout
group:
  title: 布局
  order: 2
---

# ChatLayout - 对话流容器组件

该组件提供了一个完整的对话流容器，包含头部区域、内容区域和底部区域。

## 基础用法

含左侧 `History`、头部、消息区与底部任务条，贴近完整产品布局。

<code src="../demos/ChatFlowContainer/index.tsx" iframe=620>完整产品布局 - 侧栏 + 头部 + 消息流 + 任务条</code>

## 无主栏 · 固定高度

无会话侧栏，父级给定高度即可；适合嵌入设置抽屉、弹层或分栏右侧等场景。

<code src="../demos/ChatFlowContainer/no-sidebar.tsx" iframe=640>无主栏 · 固定高度嵌入</code>

## 带 Markdown 输入框

底部使用 `MarkdownInputField`，`scrollBehavior` 为 `auto`。

<code src="../demos/ChatFlowContainer/with-input.tsx" iframe=620>带输入框</code>

## 底部最小高度

通过 `footerHeight` 为多行输入等较高的 `footer` 预留最小高度，避免内容被遮挡。

<code src="../demos/ChatFlowContainer/footer-height.tsx" iframe=640>footerHeight 与多行底部</code>

## 滚动状态监听

使用 `onScrollStateChange` 的 `isPinned` 控制「回到底部」浮动按钮；与流式追加消息配合时常用。

<code src="../demos/ChatFlowContainer/scroll-state.tsx" iframe=680>滚动状态与回到底部</code>

## 关闭底部背景动效

`showFooterBackground={false}`，仅保留底部操作区。

<code src="../demos/ChatFlowContainer/without-footer.tsx" iframe=620>关闭底部背景动效</code>

## API 参考

### ChatLayoutProps

| 属性                 | 说明                                                                                             | 类型                                     | 默认值     | 版本 |
| -------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------- | ---------- | ---- |
| header               | 头部配置对象，详见下方 LayoutHeaderConfig                                                        | `LayoutHeaderConfig`                     | -          | -    |
| children             | 内容区域的自定义内容                                                                             | `ReactNode`                              | -          | -    |
| footer               | 底部区域的自定义内容                                                                             | `ReactNode`                              | -          | -    |
| footerHeight         | 底部区域的最小高度（px），仅在传入 `footer` 时生效；多行输入等高底部建议显式抬高，避免内容被遮挡 | `number`                                 | `48`       | -    |
| onScrollStateChange  | 滚动状态变化回调，便于「回到底部」等交互，参数见 [ChatLayoutScrollState](#chatlayoutscrollstate) | `(state: ChatLayoutScrollState) => void` | -          | -    |
| scrollBehavior       | `'smooth'` 走基于 rAF 的渐进滚动（流式输出场景下更平滑、不会被新增内容打断）；`'auto'` 立即滚动  | `'smooth' \| 'auto'`                     | `'smooth'` | -    |
| showFooterBackground | 是否显示底部背景动效                                                                             | `boolean`                                | `true`     | -    |
| className            | 自定义类名                                                                                       | `string`                                 | -          | -    |
| style                | 自定义样式                                                                                       | `React.CSSProperties`                    | -          | -    |
| classNames           | 自定义各部分类名，详见下方 ChatLayoutClassNames                                                  | `ChatLayoutClassNames`                   | -          | -    |
| styles               | 自定义各部分样式，详见下方 ChatLayoutStyles                                                      | `ChatLayoutStyles`                       | -          | -    |

### ChatLayoutClassNames

用于自定义组件各部分的类名。

| 属性             | 说明             | 类型     | 默认值 | 版本 |
| ---------------- | ---------------- | -------- | ------ | ---- |
| root             | 根容器类名       | `string` | -      | -    |
| content          | 内容区域类名     | `string` | -      | -    |
| scrollable       | 滚动区域类名     | `string` | -      | -    |
| footer           | 底部区域类名     | `string` | -      | -    |
| footerBackground | 底部背景区域类名 | `string` | -      | -    |

### ChatLayoutStyles

用于自定义组件各部分的内联样式。

| 属性             | 说明             | 类型                  | 默认值 | 版本 |
| ---------------- | ---------------- | --------------------- | ------ | ---- |
| root             | 根容器样式       | `React.CSSProperties` | -      | -    |
| content          | 内容区域样式     | `React.CSSProperties` | -      | -    |
| scrollable       | 滚动区域样式     | `React.CSSProperties` | -      | -    |
| footer           | 底部区域样式     | `React.CSSProperties` | -      | -    |
| footerBackground | 底部背景区域样式 | `React.CSSProperties` | -      | -    |

### LayoutHeaderConfig

折叠按钮支持「受控（`leftCollapsed` / `rightCollapsed`）」与「非受控（`leftDefaultCollapsed` / `rightDefaultCollapsed`）」两种模式。

| 属性                  | 说明                                  | 类型                           | 默认值  | 版本 |
| --------------------- | ------------------------------------- | ------------------------------ | ------- | ---- |
| title                 | 头部标题，支持文本或自定义 React 节点 | `ReactNode`                    | -       | -    |
| showShare             | 是否显示分享按钮                      | `boolean`                      | `false` | -    |
| leftCollapsible       | 左侧是否可折叠                        | `boolean`                      | `false` | -    |
| rightCollapsible      | 右侧是否可折叠                        | `boolean`                      | `false` | -    |
| leftCollapsed         | 左侧折叠状态（受控模式）              | `boolean`                      | -       | -    |
| rightCollapsed        | 右侧折叠状态（受控模式）              | `boolean`                      | -       | -    |
| leftDefaultCollapsed  | 左侧默认折叠状态（非受控模式）        | `boolean`                      | `false` | -    |
| rightDefaultCollapsed | 右侧默认折叠状态（非受控模式）        | `boolean`                      | `false` | -    |
| onLeftCollapse        | 左侧折叠按钮点击事件回调              | `(collapsed: boolean) => void` | -       | -    |
| onRightCollapse       | 右侧折叠按钮点击事件回调              | `(collapsed: boolean) => void` | -       | -    |
| onShare               | 分享按钮点击事件回调                  | `() => void`                   | -       | -    |
| leftExtra             | 自定义左侧内容                        | `ReactNode`                    | -       | -    |
| rightExtra            | 自定义右侧内容                        | `ReactNode`                    | -       | -    |
| className             | 自定义类名                            | `string`                       | -       | -    |

### ChatLayoutScrollState

`onScrollStateChange` 的回调参数，描述滚动容器当前的两种相关状态。`isAtBottom` 是几何距离的判定，`isPinned` 反映用户意图——区别在于：用户主动上滑离开底部时 `isAtBottom` 立即为 false，但 `isPinned` 在用户回到底部前都保持 false，可用来稳定地控制「回到底部」浮动按钮的显隐。

| 属性       | 说明                                           | 类型      |
| ---------- | ---------------------------------------------- | --------- |
| isAtBottom | 是否贴近底部（距离底部 ≤ 容差阈值，当前 30px） | `boolean` |
| isPinned   | 是否处于「跟随底部」状态（用户未主动上滑离开） | `boolean` |

### ChatLayoutRef

通过 `ref` 可以访问以下方法和属性：

| 属性/方法       | 说明                                                                             | 类型                                      | 默认值 | 版本 |
| --------------- | -------------------------------------------------------------------------------- | ----------------------------------------- | ------ | ---- |
| scrollContainer | 滚动容器的 DOM 引用                                                              | `HTMLDivElement \| null`                  | -      | -    |
| scrollToBottom  | 手动滚动到底部；`behavior` 默认 `'auto'` 立即滚动，传 `'smooth'` 走 rAF 渐进滚动 | `(behavior?: 'smooth' \| 'auto') => void` | -      | -    |
| isAtBottom      | 当前滚动容器是否贴近底部                                                         | `() => boolean`                           | -      | -    |

## 设计理念

1. 组件需要父容器有明确的高度才能正常显示
2. 内容区域支持自动滚动，建议配合虚拟滚动使用大量数据
3. 所有按钮都支持键盘导航和屏幕阅读器
4. 头部折叠状态由 [`LayoutHeaderConfig`](#layoutheaderconfig) 提供受控（`leftCollapsed` / `rightCollapsed`）与非受控（`leftDefaultCollapsed` / `rightDefaultCollapsed`）两套接口
5. 通过 ref 可以访问滚动容器和手动控制滚动行为
6. 底部背景动效默认开启，可通过 `showFooterBackground` 控制
7. 支持通过 `classNames` 和 `styles` 精细化定制各部分样式
