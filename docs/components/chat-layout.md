---
title: ChatLayout 聊天布局
atomId: ChatLayout
group:
  title: 布局
  order: 3
---

# ChatLayout 聊天布局

`ChatLayout` 提供了一个标准的聊天界面布局，包含头部、可滚动的消息区域和底部的输入/操作区域。内置自动滚动到底部功能，并通过 `ref` 暴露滚动容器和滚动方法。

## 代码演示

### API Playground

通过控制面板调试 `header` / `footer` / `footerHeight` / `showFooterBackground` / `scrollBehavior` / 命令式 ref（`scrollToBottom` / `isAtBottom`）/ `onScrollStateChange` 等核心 API。

<code src="../demos/chat-layout-playground.tsx" iframe=820>API Playground - 全部核心 props</code>

### 基础用法

最简单的用法：配置 `header`、`children`（消息列表）和 `footer`（输入区域），通过 `ref` 调用 `scrollToBottom`。

<code src="../demos/chat-layout-basic.tsx" iframe=520>基础用法</code>

### header 配置详解

`header` 属性接受 `LayoutHeaderConfig`，支持标题、分享按钮、左右侧折叠按钮、受控/非受控模式及自定义扩展内容。

<code src="../demos/chat-layout-header.tsx">header API 演示</code>

### footer 与背景渐变

`footer` 放置输入框等底部操作区，`footerHeight` 控制最小高度，`showFooterBackground` 开关底部渐变遮罩。

<code src="../demos/chat-layout-footer.tsx">footer API 演示</code>

### 滚动控制

通过 `scrollBehavior` 切换滚动动画，使用 `ref` 上的 `scrollToBottom` 方法或直接操作 `scrollContainer` DOM 元素实现精细滚动控制。

<code src="../demos/chat-layout-scroll.tsx">滚动 API 演示</code>

### classNames 与 styles 自定义样式

通过 `classNames` / `styles` 对根容器、内容区、滚动区、底部区等各区域进行精细的样式定制。

<code src="../demos/chat-layout-classnames-styles.tsx">样式定制演示</code>

### 滚动状态监听

通过 `onScrollStateChange` 监听滚动状态（`isAtBottom` / `isPinned`），实现"回到底部"浮动按钮等交互。用户上滑离开底部时显示按钮，点击后平滑滚动回底部。

<code src="../demos/chat-layout-scroll-state.tsx" iframe=600>滚动状态监听</code>

### 完整对话场景

模拟真实聊天场景：输入框 + 发送按钮 + 自动回复，展示 ChatLayout 与 BubbleList 配合使用的典型模式。

<code src="../demos/chat-layout-chat-scenario.tsx" iframe=600>完整对话场景</code>

### 无头部模式

不传 `header` 时，ChatLayout 仅包含内容区和底部区，适用于嵌入式面板、侧边栏等不需要顶部标题栏的场景。

<code src="../demos/chat-layout-no-header.tsx">无头部模式</code>

### 动态底部高度

footer 实际高度可随内容变化（如多行输入框），ChatLayout 自动检测并调整内容区底部留白，无需手动同步 `footerHeight`。

<code src="../demos/chat-layout-dynamic-footer.tsx">动态底部高度</code>

### 空状态与新对话

对话列表为空时展示欢迎页和快捷提问，发送消息后切换为 BubbleList 列表，演示空状态到有内容状态的过渡。

<code src="../demos/chat-layout-empty.tsx" iframe=600>空状态与新对话</code>

## API

### ChatLayoutProps

| 属性                 | 说明                                                       | 类型                                                                                                                                                                    | 默认值     | 版本 |
| -------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---- |
| header               | 头部配置（详见 [LayoutHeader](/components/layout-header)） | `LayoutHeaderConfig`                                                                                                                                                    | -          | -    |
| children             | 聊天内容区域（通常放置 `BubbleList`）                      | `ReactNode`                                                                                                                                                             | -          | -    |
| footer               | 底部内容（通常放置输入框）                                 | `ReactNode`                                                                                                                                                             | -          | -    |
| footerHeight         | 底部区域最小高度（px），用于为 footer 预留空间             | `number`                                                                                                                                                                | `48`       | -    |
| scrollBehavior       | 滚动动画行为                                               | `'auto' \| 'smooth'`                                                                                                                                                    | `'smooth'` | -    |
| showFooterBackground | 是否在底部显示渐变背景遮罩                                 | `boolean`                                                                                                                                                               | `true`     | -    |
| onScrollStateChange  | 滚动状态变化回调                                           | `(state: ChatLayoutScrollState) => void`                                                                                                                                | -          | -    |
| className            | 根容器自定义类名                                           | `string`                                                                                                                                                                | -          | -    |
| style                | 根容器自定义样式                                           | `React.CSSProperties`                                                                                                                                                   | -          | -    |
| classNames           | 各区域自定义类名                                           | `{ root?: string; content?: string; scrollable?: string; footer?: string; footerBackground?: string }`                                                                  | -          | -    |
| styles               | 各区域自定义内联样式                                       | `{ root?: React.CSSProperties; content?: React.CSSProperties; scrollable?: React.CSSProperties; footer?: React.CSSProperties; footerBackground?: React.CSSProperties }` | -          | -    |

### ChatLayoutRef

通过 `ref` 获取组件实例，用于控制滚动行为或访问底层 DOM。

| 属性            | 说明                | 类型                     | 默认值 | 版本 |
| --------------- | ------------------- | ------------------------ | ------ | ---- |
| scrollContainer | 滚动容器的 DOM 元素 | `HTMLDivElement \| null` | -      | -    |
| scrollToBottom  | 滚动到底部          | `() => void`             | -      | -    |
| isAtBottom      | 当前是否贴底        | `() => boolean`          | -      | -    |

### ChatLayoutScrollState

`onScrollStateChange` 回调接收的滚动状态对象。

| 属性       | 说明                                         | 类型      | 默认值 | 版本 |
| ---------- | -------------------------------------------- | --------- | ------ | ---- |
| isAtBottom | 是否贴近底部（距离底部 ≤ 容差阈值）          | `boolean` | -      | -    |
| isPinned   | 是否处于"跟随底部"状态（用户未主动上滑离开） | `boolean` | -      | -    |

```tsx | pure
import { useRef } from 'react';
import { ChatLayout, ChatLayoutRef } from '@ant-design/agentic-ui';

const chatRef = useRef<ChatLayoutRef>(null);

// 滚动到底部
chatRef.current?.scrollToBottom();

// 访问滚动容器 DOM
const el = chatRef.current?.scrollContainer;
console.log(el?.scrollTop, el?.scrollHeight);
```

### LayoutHeaderConfig（header 属性）

| 属性                  | 说明                             | 类型                           | 默认值  | 版本 |
| --------------------- | -------------------------------- | ------------------------------ | ------- | ---- |
| title                 | 标题，支持文本或自定义 ReactNode | `ReactNode`                    | -       | -    |
| showShare             | 是否显示分享按钮                 | `boolean`                      | `false` | -    |
| leftCollapsible       | 左侧是否显示折叠按钮             | `boolean`                      | `false` | -    |
| rightCollapsible      | 右侧是否显示折叠按钮             | `boolean`                      | `false` | -    |
| leftCollapsed         | 左侧折叠状态（受控）             | `boolean`                      | -       | -    |
| rightCollapsed        | 右侧折叠状态（受控）             | `boolean`                      | -       | -    |
| leftDefaultCollapsed  | 左侧默认折叠状态（非受控）       | `boolean`                      | `false` | -    |
| rightDefaultCollapsed | 右侧默认折叠状态（非受控）       | `boolean`                      | `false` | -    |
| onLeftCollapse        | 左侧折叠按钮点击回调             | `(collapsed: boolean) => void` | -       | -    |
| onRightCollapse       | 右侧折叠按钮点击回调             | `(collapsed: boolean) => void` | -       | -    |
| onShare               | 分享按钮点击回调                 | `() => void`                   | -       | -    |
| leftExtra             | 标题右侧自定义内容               | `ReactNode`                    | -       | -    |
| rightExtra            | 右侧操作区自定义内容             | `ReactNode`                    | -       | -    |
| className             | 头部自定义类名                   | `string`                       | -       | -    |

## 特性

- **自动滚动**：内置 `useAutoScroll` hook，新内容添加时自动滚动到底部，滚动容器内手动上划后停止跟随。
- **布局结构**：标准 Header-Content-Footer 结构，内容区自适应高度并独立可滚动。
- **底部遮罩**：`showFooterBackground` 开启时，底部渐变背景让内容和输入框之间的衔接更自然。
- **Ref 控制**：通过 `ref.scrollToBottom()` 精确触发滚动，或通过 `ref.scrollContainer` 直接操作 DOM。
- **语义样式**：支持 `classNames` / `styles` 对内部各层级区域进行独立样式定制。
