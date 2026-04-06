---
title: Robot 机器人形象
atomId: Robot
group:
  title: 入口
  order: 1
---

# Robot 机器人形象

机器人形象组件，提供多种动画状态的机器人图标，支持自定义大小、状态和图标。

## 代码演示

<code src="../demos/robot.tsx">基础用法</code>

## API

### Robot

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| status | 机器人状态 | `'default' \| 'running' | `'default'` | - |
| size | 机器人大小（像素） | `number` | `42` | - |
| className | 自定义类名 | `string` | - | - |
| style | 自定义样式 | `React.CSSProperties` | - | - |
| icon | 自定义图标 | `React.ReactNode` | - | - |

### 通用 API

所有Lottie动画组件通用的 API。

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| autoplay | 是否自动播放动画 | `boolean` | `true` | - |
| loop | 是否循环播放动画 | `boolean` | `true` | - |
| className | 动画容器类名 | `string` | - | - |
| style | 动画容器样式 | `React.CSSProperties` | - | - |
| size | 动画尺寸 | `number` | `32` | - |
