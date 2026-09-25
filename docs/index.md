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
        // 保持正常文档流：内容撑开页面高度，dumi 底部 footer 不再被遮挡（#397）
        width: '100vw',
        marginLeft: 'calc(50% - 50vw)',
        paddingTop: 142,
        overflow: 'hidden',
      }}
    >
      <HomePage />
    </div>
  );
};
```
