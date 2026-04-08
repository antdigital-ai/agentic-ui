---
name: component-chat-boot-page
description: Develop ChatBootPage subcomponents (Title, CaseReply, ButtonTab, ButtonTabGroup) for chat entry or onboarding in @ant-design/agentic-ui. Use when building start page, welcome tabs, or case reply UI. Triggers on ChatBootPage, boot page, Title, CaseReply, ButtonTab, ButtonTabGroup.
---

# ChatBootPage 组件开发

聊天启动页相关子组件：标题、案例回复、按钮 Tab 与 Tab 组，用于对话入口或引导页。

## 源码位置

- 导出：`src/ChatBootPage/index.ts`
- 子组件：`Title.tsx`、`CaseReply.tsx`、`ButtonTab.tsx`、`ButtonTabGroup.tsx`
- 样式：各组件对应 `*Style.ts` 与 `style.ts`

## 主要导出

```ts
Title, CaseReply, ButtonTab, ButtonTabGroup
TitleProps, CaseReplyProps, ButtonTabProps, ButtonTabGroupProps, ButtonTabItem
```

## 开发规范

- 使用 token 与 createStyles，支持 `classNames`/`styles`。
- 与 WelcomeMessage、ChatLayout 等组合时保持视觉与交互一致。

修改启动页或引导组件时，参考 `src/ChatBootPage/` 与 `AGENTS.md`。
