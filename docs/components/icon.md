---
title: Icon 图标
atomId: Icon
group:
  title: 通用
  order: 3
---

# Icon 图标

`@ant-design/agentic-ui` 本身不直接导出图标，所有图标统一来自姊妹包 `@sofa-design/icons`。本页用于浏览与预览全部可用图标。

## 图标列表

<code src="../demos/icon.tsx" background="var(--main-bg-color)" iframe="540"></code>

## 使用方式

按需引入对应图标组件，每个图标都是一个 React 组件，支持原生 SVG 属性（`width`、`height`、`fill`、`className`、`style` 等）：

```tsx
import { Plus } from '@sofa-design/icons';

export default () => <Plus />;
```

也可以通过 `style` 或 `width` / `height` 控制尺寸与颜色：

```tsx | pure
import { Plus } from '@sofa-design/icons';

export default () => (
  <Plus
    style={{ fontSize: 24, color: 'var(--color-primary-control-fill-primary)' }}
  />
);
```
