---
name: component-markdown-input-field
description: Develop MarkdownInputField and attachments, voice, send actions in @ant-design/agentic-ui. Use when building chat input, file upload, voice input, send button, or suggestion bar. Triggers on MarkdownInputField, input field, attachment, voice input, send button.
---

# MarkdownInputField 组件开发

多模态输入框：Markdown 输入、附件、语音、发送按钮与建议条等。

## 源码位置

- 主组件：`src/MarkdownInputField/MarkdownInputField.tsx`
- 附件：`src/MarkdownInputField/AttachmentButton/`、`AttachmentFileList/`
- 语音：`src/MarkdownInputField/VoiceInput/`
- 发送与建议：`SendButton`、`Suggestion`、`QuickActions`、`SkillModeBar` 等
- 类型与工具：见各子目录 `types`、`utils`

## 主要能力

- Markdown 输入与编辑器联动
- 附件上传、列表展示、类型限制
- 语音输入与状态
- 发送按钮、快捷操作、技能模式条

## 开发规范

- 使用 token 与 `createStyles`，支持 `classNames`/`styles`。
- 事件使用 `on` 前缀（如 `onSend`、`onFileSelect`）。
- 与 Bubble、ChatLayout 等配合时保持交互一致。

修改或扩展输入框、附件、语音、发送逻辑时，参考 `src/MarkdownInputField/` 与 `AGENTS.md`。
