---
title: BackTo 回到顶部/底部
atomId: BackTo
group:
  title: 入口
  order: 1
---

# BackTo 回到顶部/底部

BackTo 是一个用于快速滚动到页面顶部或底部的浮动按钮组件，适用于长内容页面的导航场景。

## 代码演示

<code src="../demos/back-to.tsx" background="var(--main-bg-color)" iframe=540></code>

## API

以下 API 为 BackTo.Top、BackTo.Bottom 通用的 API。

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| className | 自定义类名 | `string` | - | - |
| style | 自定义样式 | `CSSProperties` | - | - |
| target | 滚动容器的目标元素 | `() => HTMLElement \| Window` | `() => window` | - |
| duration | 滚动到顶部/底部的持续时间（毫秒） | `number` | `450` | - |
| shouldVisible | 按钮是否显示 | `number \| ((scrollTop: number, container: HTMLElement \| Window) => boolean)` | `400` | - |
| tooltip | 气泡卡片的内容 | `ReactNode` \| [TooltipProps](https://ant.design/components/tooltip-cn#api) | - | - |
| onClick | 点击按钮时的回调函数 | `(e: React.MouseEvent<HTMLButtonElement>, container: HTMLElement \| Window) => void` | - | - |

## 类型说明

### shouldVisible 参数

- **数字类型**：当滚动距离大于等于该数值时显示按钮
- **函数类型**：自定义显示逻辑，接收当前滚动位置和容器元素，返回是否显示按钮

### target 参数

指定滚动的目标容器，可以是：

- `HTMLElement`：具体的 DOM 元素（如 div、section 等可滚动的容器）
- `Window`：窗口对象（默认，表示整个页面滚动）

**注意**：target 参数是一个函数，返回实际的滚动容器元素。这样可以确保在组件渲染时动态获取最新的容器引用。

## 使用示例

### 基础用法

```tsx
import { BackTo } from '@ant-design/agentic-ui';
import { useRef } from 'react';

export default () => {
  const targetRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={targetRef}
        style={{ maxHeight: '300px', padding: '20px', overflow: 'scroll' }}
      >
        <h1>长内容页面</h1>
        <p>向下滚动查看回到顶部按钮</p>
        <div style={{ height: '2000px' }} />
      </div>
      {/* 回到顶部按钮 */}
      <BackTo.Top
        target={() => targetRef.current}
        style={{ position: 'absolute' }}
      />
    </div>
  );
};
```

### 自定义显示条件

```tsx
import { BackTo } from '@ant-design/agentic-ui';
import { useRef } from 'react';

export default () => {
  const targetRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={targetRef}
        style={{ maxHeight: '300px', padding: '20px', overflow: 'scroll' }}
      >
        <h1>长内容页面</h1>
        <p>滚动超过 200px 时显示回到顶部按钮</p>
        <p>距离底部超过 200px 时显示回到底部按钮</p>
        <div style={{ height: '2000px' }} />
      </div>
      {/* 回到顶部按钮 */}
      <BackTo.Top
        target={() => targetRef.current}
        shouldVisible={200}
        style={{ position: 'absolute', insetInlineEnd: 64 }}
      />
      <BackTo.Bottom
        target={() => targetRef.current}
        shouldVisible={200}
        style={{ position: 'absolute' }}
      />
    </div>
  );
};
```
