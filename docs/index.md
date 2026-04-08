---
title: 面向智能体的 UI 组件库
description: 基于 React 与 Ant Design，提供多步推理可视化、工具调用展示、任务执行协同等 Agentic UI 能力
keywords:
  - Agentic UI
  - 智能体
  - React
  - Ant Design
  - 组件库
---

```tsx
/**
 * inline: true
 */
import HomePage from '../home/demo-components/HomePage/index';

export default () => {
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: 142,
        overflowX: 'hidden',
        backgroundColor: '#fff',
      }}
    >
      <HomePage />
    </div>
  );
};
```
