---
title: ChatLayout 聊天布局
atomId: ChatLayout
group:
  title: 布局
  order: 3
---

# ChatLayout 聊天布局

`ChatLayout` 提供了一个标准的聊天界面布局，包含头部、可滚动的消息区域和底部的输入/操作区域。它内置了自动滚动到底部的功能。

## 代码演示

```tsx
import { ChatLayout, BubbleList } from '@ant-design/agentic-ui';

export default () => (
  <ChatLayout
    header={{
      title: "智能助手",
      onShare: () => console.log('share')
    }}
    footer={
      <div style={{ padding: 16, borderTop: '1px solid #eee' }}>
        输入框区域
      </div>
    }
  >
    <div style={{ padding: 16 }}>
      <p>消息内容...</p>
      <p>消息内容...</p>
      <p>消息内容...</p>
    </div>
  </ChatLayout>
);
```

## API

### ChatLayoutProps

| 参数           | 说明                                                                       | 类型                  | 默认值     |
| -------------- | -------------------------------------------------------------------------- | --------------------- | ---------- |
| header         | 头部配置（详见 [LayoutHeader](/components/layout-header)）                 | `LayoutHeaderConfig`  | -          |
| footer         | 底部内容（通常放置输入框）                                                 | `ReactNode`           | -          |
| footerHeight   | 底部区域的最小高度（用于预留空间）                                         | `number`              | `90`       |
| scrollBehavior | 滚动行为                                                                   | `'auto' \| 'smooth'`  | `'smooth'` |
| className      | 自定义类名                                                                 | `string`              | -          |
| style          | 自定义样式                                                                 | `React.CSSProperties` | -          |
| children       | 聊天内容区域                                                               | `ReactNode`           | -          |

### ChatLayoutRef

组件暴露的 Ref 对象，用于控制滚动行为。

| 属性            | 说明                 | 类型               |
| --------------- | -------------------- | ------------------ |
| scrollContainer | 滚动容器的 DOM 元素  | `HTMLDivElement`   |
| scrollToBottom  | 滚动到底部的方法     | `() => void`       |

```tsx | pure
const chatRef = useRef<ChatLayoutRef>(null);

// 滚动到底部
chatRef.current?.scrollToBottom();
```

## 特性

- **自动滚动**: 内置 `useAutoScroll` hook，支持在新内容添加时自动滚动到底部。
- **布局结构**: 标准的 Header-Content-Footer 结构，Content 区域自适应高度并可滚动。
- **头部集成**: 直接集成 `LayoutHeader`，配置方便。
