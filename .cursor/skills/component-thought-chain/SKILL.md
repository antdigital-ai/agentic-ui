---
name: component-thought-chain
description: Develop ThoughtChainList and thought-chain visualization in @ant-design/agentic-ui. Use when showing reasoning steps, thinking process, tool calls timeline, or collapsible thought chain. Triggers on thought chain, thinking, reasoning, ThoughtChainList, step list.
---

# ThoughtChainList 组件开发

思维链列表的展示与交互，用于呈现 AI 推理步骤、思考过程或工具调用时间线。

## 源码位置

- 主组件：`src/ThoughtChainList/index.tsx`
- 列表项：`src/ThoughtChainList/ThoughtChainListItem.tsx`
- 样式：`src/ThoughtChainList/style.ts`
- 类型：`src/ThoughtChainList/types.ts`

## 主要能力

- 思维链条目展示（thought / action 等类型）
- 折叠/展开、加载状态、耗时等
- 与 MarkdownEditor、Drawer 等配合
- 国际化通过 `I18nContext`

## 开发规范

- 使用 Ant Design token 与 `createStyles`，禁止硬编码颜色与间距。
- Props 使用 `onToggle`、`onClick` 等 `on` 前缀。
- 类型定义见 `ThoughtChainListProps`、`WhiteBoxProcessInterface`、`DocMeta` 等。

开发或修改思维链展示时，参考 `src/ThoughtChainList/` 与项目 `AGENTS.md`。
