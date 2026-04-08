---
title: ActionItemBox 操作项盒子
atomId: ActionItemBox
group:
  title: 通用
  order: 2
---

# ActionItemBox 操作项盒子

用于展示带有图标、标题和描述的可操作项目，常用于技能列表、快捷操作等场景。

## 代码演示

```tsx
import { ActionItemBox } from '@ant-design/agentic-ui';

export default () => (
  <div
    style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 300 }}
  >
    <ActionItemBox
      title="快捷操作"
      description="点击执行快捷操作"
      icon="🚀"
      onClick={() => console.log('click')}
    />
    <ActionItemBox
      title="禁用状态"
      description="此项不可点击"
      icon="🚫"
      disabled
      onClick={() => console.log('click')}
    />
    <ActionItemBox
      title="紧凑模式"
      icon="📦"
      compact
      onClick={() => console.log('click')}
    />
  </div>
);
```

## API

### ActionItemBoxProps

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| title | 标题内容 | `React.ReactNode` | - | - |
| description | 描述内容 | `React.ReactNode` | - | - |
| icon | 图标 | `string` | - | - |
| onClick | 点击回调函数 | `() => void` | - | - |
| size | 尺寸 | `'small' \| 'large' \| 'default'` | `'default'` | - |
| iconSize | 图标尺寸 | `number` | `24` | - |
| disabled | 是否禁用 | `boolean` | `false` | - |
| compact | 是否紧凑模式 | `boolean` | `false` | - |
| standalone | 是否独立显示（影响样式） | `boolean` | `false` | - |
| hoverBg | 是否显示悬停背景 | `boolean` | `true` | - |
| index | 索引 | `number` | - | - |
| style | 自定义样式 | `React.CSSProperties` | - | - |
| onInit | 初始化回调函数 | `() => void` | - | - |
