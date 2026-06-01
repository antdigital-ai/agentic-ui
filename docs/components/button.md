---
title: Button 按钮
atomId: Button
group:
  title: 通用
  order: 1
---

# Button 按钮

按钮组件用于触发操作，提供多种样式和交互方式。当前从 `@ant-design/agentic-ui` 导出 `IconButton`、`SwitchButton`、`ToggleButton` 三个按钮组件，普通按钮请直接使用 Ant Design 的 `Button`。

## BaseButton 基础按钮

提供多种按钮样式，包括主按钮、次按钮、Ghost 按钮、文本按钮和 CTA 按钮。支持不同尺寸和状态（普通、禁用、加载中）。基于 Ant Design 的 `Button` 组件，无需额外引入。

```tsx
import { BaseButtonDemo } from '../demos/button.tsx';
export default () => <BaseButtonDemo />;
```

## IconButton 图标按钮

仅显示图标的按钮，适用于工具栏和操作栏。支持三种样式：主按钮、次按钮和无边框按钮。

```tsx
import { IconButtonDemo } from '../demos/button.tsx';
export default () => <IconButtonDemo />;
```

```tsx | pure
import { IconButton } from '@ant-design/agentic-ui';
```

## SwitchButton 开关按钮

带有切换状态的按钮，可显示激活/未激活状态。支持图标和触发图标的组合显示。

```tsx
import { SwitchButtonDemo } from '../demos/button.tsx';
export default () => <SwitchButtonDemo />;
```

```tsx | pure
import { SwitchButton } from '@ant-design/agentic-ui';
```

## API

> 完整 Props 类型请直接查看源码或 IDE 类型提示：`src/Components/Button/IconButton`、`src/Components/Button/SwitchButton`、`src/Components/Button/ToggleButton`。
