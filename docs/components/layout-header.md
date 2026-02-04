---
title: LayoutHeader 布局头部
atomId: LayoutHeader
group:
  title: 布局
  order: 2
---

# LayoutHeader 布局头部

`LayoutHeader` 是一个通用的布局头部组件，通常与 `AgenticLayout` 或 `ChatLayout` 配合使用，提供标题显示、侧边栏折叠控制和分享功能。

## 代码演示

```tsx
import { LayoutHeader } from '@ant-design/agentic-ui';

export default () => (
  <LayoutHeader
    title="AI 助手"
    onLeftCollapse={() => console.log('左侧折叠')}
    onRightCollapse={() => console.log('右侧折叠')}
    onShare={() => console.log('分享')}
  />
);
```

## API

### LayoutHeaderProps (LayoutHeaderConfig)

| 参数                  | 说明                           | 类型                           | 默认值  |
| --------------------- | ------------------------------ | ------------------------------ | ------- |
| title                 | 标题文本                       | `string`                       | -       |
| showShare             | 是否显示分享按钮               | `boolean`                      | `true`  |
| leftCollapsible       | 左侧是否可折叠                 | `boolean`                      | `true`  |
| rightCollapsible      | 右侧是否可折叠                 | `boolean`                      | `true`  |
| leftCollapsed         | 左侧折叠状态（受控）           | `boolean`                      | -       |
| rightCollapsed        | 右侧折叠状态（受控）           | `boolean`                      | -       |
| leftDefaultCollapsed  | 左侧默认折叠状态（非受控）     | `boolean`                      | `false` |
| rightDefaultCollapsed | 右侧默认折叠状态（非受控）     | `boolean`                      | `false` |
| onLeftCollapse        | 左侧折叠按钮点击事件           | `(collapsed: boolean) => void` | -       |
| onRightCollapse       | 右侧折叠按钮点击事件           | `(collapsed: boolean) => void` | -       |
| onShare               | 分享按钮点击事件               | `() => void`                   | -       |
| leftExtra             | 自定义左侧内容（标题左侧）     | `ReactNode`                    | -       |
| rightExtra            | 自定义右侧内容（分享按钮右侧） | `ReactNode`                    | -       |
| className             | 自定义类名                     | `string`                       | -       |

## 模式说明

`LayoutHeader` 使用 `rc-util` 的 `useMergedState` 来管理折叠状态，同时支持受控和非受控模式。

- **受控模式**: 提供 `leftCollapsed` / `rightCollapsed` 和对应的 `onChange` 回调。
- **非受控模式**: 提供 `leftDefaultCollapsed` / `rightDefaultCollapsed` 作为初始值，组件内部维护状态。

这使得 `LayoutHeader` 既可以独立使用，也可以轻松集成到如 `AgenticLayout` 这样的复杂布局组件中。
