---
title: Button 按钮
atomId: Button
group:
  title: 通用
  order: 1
---

# Button 按钮

按钮组件用于触发操作，提供多种样式和交互方式。

## BaseButton 基础按钮

提供多种按钮样式，包括主按钮、次按钮、Ghost 按钮、文本按钮和 CTA 按钮。支持不同尺寸和状态（普通、禁用、加载中）。

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

## SwitchButton开关按钮

带有切换状态的按钮，可显示激活/未激活状态。支持图标和触发图标的组合显示。

```tsx
import { SwitchButtonDemo } from '../demos/button.tsx';
export default () => <SwitchButtonDemo />;
```
