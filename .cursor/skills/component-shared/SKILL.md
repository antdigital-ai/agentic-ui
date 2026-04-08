---
name: component-shared
description: Develop shared UI components (ActionIconBox, ActionItemBox, Button, GradientText, LayoutHeader, Loading, Robot, SuggestionList, TextAnimate, TypingAnimation, VisualList, lotties) in @ant-design/agentic-ui. Use when building buttons, headers, loading, robot avatar, suggestions, or animations. Triggers on ActionIconBox, Button, LayoutHeader, Loading, Robot, SuggestionList, TextAnimate, TypingAnimation, lotties.
---

# 通用子组件开发

项目内共享的 UI 组件：按钮、头部、加载、机器人头像、建议列表、动画等。

## 源码位置

- 入口：`src/index.ts` 中「基础 UI 组件」「通用子组件」导出
- 目录：`src/Components/`（ActionIconBox、ActionItemBox、Button、GradientText、LayoutHeader、Loading、Robot、SuggestionList、TextAnimate、TypingAnimation、VisualList）
- 动效：`src/Components/lotties/`、`src/Components/effects/`
- 按钮变体：`IconButton`、`ToggleButton`、`SwitchButton` 见 `Components/Button/`

## 主要能力

- **Button**：图标/切换/开关等变体
- **LayoutHeader**：布局头部，供 AgenticLayout、ChatLayout 使用
- **Loading / Robot**：加载态与机器人头像
- **SuggestionList**：建议列表，常与输入框配合
- **TextAnimate / TypingAnimation**：文字与打字机动画
- **ActionIconBox / ActionItemBox**：操作图标与操作项容器

## 开发规范

- 使用 token 与 createStyles；事件使用 `on` 前缀。
- 与各业务组件（Bubble、ChatLayout 等）组合时保持 API 与风格一致。

修改通用组件时，参考 `src/Components/` 与 `AGENTS.md`。
