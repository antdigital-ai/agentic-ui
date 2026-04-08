---
name: component-welcome-message
description: Develop WelcomeMessage for chat welcome or onboarding in @ant-design/agentic-ui. Use when building welcome title, description, typing or text animation. Triggers on WelcomeMessage, welcome, onboarding, typing animation, title description.
---

# WelcomeMessage 组件开发

欢迎/引导消息：标题、描述及打字机/文字动画等。

## 源码位置

- 主组件：`src/WelcomeMessage/index.tsx`
- 依赖：`TextAnimate`、`TypingAnimation`（来自 `Components/`）
- 类型：`WelcomeMessageTitleAnimateProps`、`WelcomeMessageDescriptionAnimateProps` 等
- 样式：`src/WelcomeMessage/style.ts`

## 主要能力

- 标题与描述的动画配置（duration、delay、variants 等）
- 与 ChatBootPage、ChatLayout 组合作为首屏内容

## 开发规范

- 使用 token 与 createStyles；动画参数与 TextAnimate/TypingAnimation 对齐。

修改欢迎消息时，参考 `src/WelcomeMessage/` 与 `AGENTS.md`。
