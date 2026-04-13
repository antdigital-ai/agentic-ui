---
title: ChatLayout - 对话流容器组件
atomId: ChatLayout
group:
  title: 布局
  order: 2
---

# 对话流容器组件

该组件提供了一个完整的对话流容器，包含头部区域、内容区域和底部区域。

## 基础用法

<code src="../demos/ChatFlowContainer/index.tsx" iframe=620>对话流容器 - 头部 + 内容 + 底部</code>

## API 参考

### ChatLayoutProps

| 属性                 | 说明                                             | 类型                 | 默认值   | 版本 |
| -------------------- | ------------------------------------------------ | -------------------- | -------- | ---- |
| header               | 头部配置对象，详见下方 LayoutHeaderConfig        | `LayoutHeaderConfig`   | -        | -    |
| children             | 内容区域的自定义内容                             | `ReactNode`            | -        | -    |
| footer               | 底部区域的自定义内容                             | `ReactNode`            | -        | -    |
| footerHeight         | 底部区域的最小高度（单位：px）                   | `number`               | `48`     | -    |
| scrollBehavior       | 滚动行为，`smooth` 为平滑滚动，`auto` 为立即滚动 | `'smooth' \| 'auto'`   | `'smooth'` | -  |
| showFooterBackground | 是否显示底部背景动效                             | `boolean`              | `true`   | -    |
| className            | 自定义类名                                       | `string`               | -        | -    |
| style                | 自定义样式                                       | `React.CSSProperties`  | -        | -    |
| classNames           | 自定义各部分类名，详见下方 ChatLayoutClassNames  | `ChatLayoutClassNames` | -        | -    |
| styles               | 自定义各部分样式，详见下方 ChatLayoutStyles      | `ChatLayoutStyles`     | -        | -    |

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

| 属性             | 说明             | 类型                | 默认值 | 版本 |
| ---------------- | ---------------- | ------------------- | ------ | ---- |
| root             | 根容器样式       | `React.CSSProperties` | -    | -    |
| content          | 内容区域样式     | `React.CSSProperties` | -    | -    |
| scrollable       | 滚动区域样式     | `React.CSSProperties` | -    | -    |
| footer           | 底部区域样式     | `React.CSSProperties` | -    | -    |
| footerBackground | 底部背景区域样式 | `React.CSSProperties` | -    | -    |

### LayoutHeaderConfig

| 属性                  | 说明                           | 类型                         | 默认值 | 版本 |
| --------------------- | ------------------------------ | ---------------------------- | ------ | ---- |
| title                 | 头部标题文本                   | `string`                     | -      | -    |
| showShare             | 是否显示分享按钮               | `boolean`                    | `true` | -    |
| leftCollapsible       | 左侧是否可折叠                 | `boolean`                    | `true` | -    |
| rightCollapsible      | 右侧是否可折叠                 | `boolean`                    | `false` | -   |
| leftCollapsed         | 左侧折叠状态（受控模式）       | `boolean`                    | -      | -    |
| rightCollapsed        | 右侧折叠状态（受控模式）       | `boolean`                    | -      | -    |
| leftDefaultCollapsed  | 左侧默认折叠状态（非受控模式） | `boolean`                    | `false` | -   |
| rightDefaultCollapsed | 右侧默认折叠状态（非受控模式） | `boolean`                    | `false` | -   |
| onLeftCollapse        | 左侧折叠按钮点击事件回调       | `(collapsed: boolean) => void` | -    | -    |
| onRightCollapse       | 右侧折叠按钮点击事件回调       | `(collapsed: boolean) => void` | -    | -    |
| onShare               | 分享按钮点击事件回调           | `() => void`                 | -      | -    |
| leftExtra             | 自定义左侧额外内容             | `ReactNode`                  | -      | -    |
| rightExtra            | 自定义右侧额外内容             | `ReactNode`                  | -      | -    |
| className             | 自定义类名                     | `string`                     | -      | -    |

### ChatLayoutRef

通过 `ref` 可以访问以下方法和属性：

| 属性/方法       | 说明                             | 类型                   | 默认值 | 版本 |
| --------------- | -------------------------------- | ---------------------- | ------ | ---- |
| scrollContainer | 滚动容器的 DOM 引用              | `HTMLDivElement \| null` | -    | -    |
| scrollToBottom  | 手动滚动到底部的方法（立即滚动） | `() => void`           | -      | -    |

## 设计理念

1. 组件需要父容器有明确的高度才能正常显示
2. 内容区域支持自动滚动，建议配合虚拟滚动使用大量数据
3. 所有按钮都支持键盘导航和屏幕阅读器
4. 支持受控和非受控两种模式，灵活适应不同使用场景
5. 通过 ref 可以访问滚动容器和手动控制滚动行为
6. 底部背景动效默认开启，可通过 `showFooterBackground` 控制
7. 支持通过 `classNames` 和 `styles` 精细化定制各部分样式
