---
title: ActionIconBox 操作图标盒子
atomId: ActionIconBox
group:
  title: 通用
  order: 2
---

# ActionIconBox 操作图标盒子

该组件提供可点击的图标操作按钮，支持加载状态、工具提示、键盘导航等功能。主要用于编辑器工具栏中的各种操作按钮。

## 代码演示

```tsx
import { ActionIconBox } from '@ant-design/agentic-ui';
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons';

export default () => (
  <div style={{ display: 'flex', gap: 16 }}>
    <ActionIconBox
      title="保存"
      onClick={() => new Promise((resolve) => setTimeout(resolve, 1000))}
    >
      <SaveOutlined />
    </ActionIconBox>
    <ActionIconBox
      title="删除"
      type="danger"
      onClick={() => console.log('delete')}
    >
      <DeleteOutlined />
    </ActionIconBox>
  </div>
);
```

## API

### ActionIconBoxProps

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| children | 图标内容 | `React.ReactNode \| ((isHovered: boolean) => React.ReactNode)` | - |
| title | 按钮标题和工具提示文本 | `React.ReactNode` | - |
| showTitle | 是否显示标题文本 | `boolean` | `false` |
| onClick | 点击回调函数 | `(e: any) => void` | - |
| isLoading | 加载状态 | `boolean` | `false` |
| loading | **已废弃**，请使用 `isLoading` | `boolean` | `false` |
| type | 按钮类型 | `'danger' \| 'primary'` | - |
| active | 是否处于激活状态 | `boolean` | `false` |
| disabled | 是否禁用（虽然 Props 定义中未显式包含，但部分逻辑支持） | `boolean` | - |
| tooltipProps | 工具提示配置 | `TooltipProps` | - |
| className | 自定义 CSS 类名 | `string` | - |
| style | 自定义样式 | `React.CSSProperties` | - |
| iconStyle | 图标样式 | `React.CSSProperties` | - |
| borderLess | 是否无边框样式 | `boolean` | `false` |
| noPadding | 是否无内边距 | `boolean` | `false` |
| transform | 是否启用变换效果 | `boolean` | `false` |
| theme | 主题 | `'light' \| 'dark'` | `'light'` |
| onInit | 初始化回调函数 | `() => void` | - |
| onLoadingChange | 加载状态变更回调 | `(loading: boolean) => void` | - |
