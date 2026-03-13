---
name: component-ai-label
description: Develop AILabel for AI content watermark or label in @ant-design/agentic-ui. Use when showing AI tag, watermark, or emphasis label. Triggers on AILabel, AI label, watermark, status default emphasis.
---

# AILabel 组件开发

AI 标识/水印标签：默认、水印、强调等状态。

## 源码位置

- 主组件：`src/AILabel/index.tsx`
- 图形与样式：`AIGraphic`、`AIGraphicDisabled`、`src/AILabel/style.ts`
- 类型：`AILabelStatus`（'default' | 'watermark' | 'emphasis'）、`AILabelProps`

## 主要 Props

- `status`、偏移等；继承 `React.HTMLAttributes<HTMLSpanElement>`

## 开发规范

- 使用 token 与 createStyles；与 Bubble、AnswerAlert 等组合时保持视觉一致。

修改 AI 标签时，参考 `src/AILabel/` 与 `AGENTS.md`。
