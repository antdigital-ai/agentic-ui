---
name: component-markdown-editor
description: Develop MarkdownEditor and BaseMarkdownEditor in @ant-design/agentic-ui for rich text and streaming markdown. Use when building editor, toolbar, slate, plugins, table, code block, or markdown parse/serialize. Triggers on markdown editor, BaseMarkdownEditor, slate, toolbar, plugin, table editor.
---

# MarkdownEditor 组件开发

基于 Slate 的 Markdown 编辑器，支持流式输入、工具栏、插件与多种块级/行内元素。

## 源码位置

- 入口：`src/MarkdownEditor/index.tsx`
- 基类：`src/MarkdownEditor/BaseMarkdownEditor.tsx`
- 编辑器核心：`src/MarkdownEditor/editor/`
- 元素：`src/MarkdownEditor/editor/elements/`（Table、Code、Image、Card 等）
- 解析/序列化：`src/MarkdownEditor/editor/parser/`
- 插件：`src/MarkdownEditor/plugins/`、`src/Plugins/`（chart、code、mermaid、katex 等）
- 类型：`src/MarkdownEditor/types.ts`

## 主要能力

- 流式编辑、只读模式、`editorRef`
- `plugins`、`markdownRenderConfig`、`toolbar` 配置
- 表格、代码块、公式、图表等通过插件或内置元素支持
- Jinja 模板插件：`createJinjaPlugin`、`jinjaPlugin`

## 开发规范

- 新增元素或插件时，遵循现有 `elements/` 与 `plugins/` 结构。
- 样式使用 `createStyles` 与 token；类型完整，避免 `any`。
- 参考 `AGENTS.md` 的 Props 命名（如 `defaultValue`、`onChange`）与 API 文档规范。

开发或修改编辑器、工具栏、插件、表格时，优先查阅 `src/MarkdownEditor/` 与 `AGENTS.md`。
