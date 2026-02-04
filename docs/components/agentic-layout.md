---
title: AgenticLayout 智能体布局组件
atomId: AgenticLayout
group:
  title: 布局
  order: 1
---

# AgenticLayout 智能体布局组件

`AgenticLayout` 是一个专为智能体应用设计的三栏布局组件，支持左中右三个区域的灵活配置。

## 基本用法

<code src="../demos/agentic-layout.tsx" iframe=620></code>

## API

### AgenticLayoutProps

| 参数       | 说明                                                                       | 类型                  | 默认值    |
| ---------- | -------------------------------------------------------------------------- | --------------------- | --------- |
| left       | 左侧内容                                                                   | `ReactNode`           | -         |
| center     | 中间内容                                                                   | `ReactNode`           | -         |
| right      | 右侧内容                                                                   | `ReactNode`           | -         |
| header     | 头部配置，包含折叠控制等（详见 [LayoutHeader](/components/layout-header)） | `LayoutHeaderConfig`  | -         |
| style      | 自定义样式                                                                 | `React.CSSProperties` | -         |
| className  | 自定义类名                                                                 | `string`              | -         |
| leftWidth  | 左侧宽度                                                                   | `number`              | `256`     |
| rightWidth | 右侧宽度                                                                   | `number`              | `256`     |
| minHeight  | 最小高度                                                                   | `string \| number`    | `'600px'` |

## 受控与非受控

`AgenticLayout` 的折叠状态通过 `header` 属性进行配置，支持受控和非受控两种模式。详细配置请参考 [LayoutHeader](/components/layout-header) 文档。

### 受控模式

通过 `header` 属性传入 `leftCollapsed` 或 `rightCollapsed`：

```tsx | pure
const [leftCollapsed, setLeftCollapsed] = useState(false);
const [rightCollapsed, setRightCollapsed] = useState(false);

<AgenticLayout
  left={<History />}
  center={<ChatLayout />}
  right={<Workspace />}
  header={{
    leftCollapsed: leftCollapsed,
    rightCollapsed: rightCollapsed,
    onLeftCollapse: setLeftCollapsed,
    onRightCollapse: setRightCollapsed,
  }}
/>;
```

### 非受控模式

通过 `header` 属性传入 `leftDefaultCollapsed` 或 `rightDefaultCollapsed`：

```tsx | pure
<AgenticLayout
  left={<History />}
  center={<ChatLayout />}
  right={<Workspace />}
  header={{
    leftDefaultCollapsed: false,
    rightDefaultCollapsed: false,
    onLeftCollapse: (collapsed) => console.log('左侧折叠:', collapsed),
    onRightCollapse: (collapsed) => console.log('右侧折叠:', collapsed),
  }}
/>
```

## 特性

- **三栏布局**: 支持左中右三个区域的灵活配置
- **折叠功能**: 左右侧栏支持独立折叠控制（通过 `header` 配置）
- **受控/非受控**: 支持受控和非受控两种模式
- **响应式设计**: 中间区域自适应剩余宽度
- **主题集成**: 集成 Ant Design 主题系统
- **动画效果**: 平滑的折叠展开动画
- **可拖拽右侧栏**: 右侧栏支持拖拽调整宽度

## 使用场景

- 智能体对话界面
- 多面板工作台
- 需要侧边栏的复杂布局

## 注意事项

- `center` 属性是必需的
- 左右侧栏是可选的，可以根据需要配置
- 折叠状态的控制逻辑位于 `header` 属性中
