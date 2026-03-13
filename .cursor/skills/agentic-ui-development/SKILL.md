---
name: agentic-ui-development
description: Guides development workflow, design system, scripts, and component inventory for @ant-design/agentic-ui. Use when onboarding, adding new components, running build/test/docs, or asking about project structure, conventions, or component list. Triggers on agentic-ui, development workflow, 开发流程, 组件清单, 设计系统, 新组件, build, test, docs, AGENTS.md.
---

# Agentic UI 项目开发

@ant-design/agentic-ui 整体开发流程、规范与组件清单。具体组件实现见各 `component-xxx` Skill。

## 规范入口

- **编码与仓库规范**：仓库根目录 [AGENTS.md](../../AGENTS.md)（命名、TypeScript、样式、测试、Git/PR、Changelog）。
- **组件级约定**：各 `.cursor/skills/component-xxx/SKILL.md` 与 AGENTS.md 一致。

## 常用命令

| 用途     | 命令 |
| -------- | ---- |
| 文档站点 | `pnpm start`（http://localhost:8000） |
| 构建     | `pnpm run build` |
| 单元测试 | `pnpm test`，覆盖率 `pnpm run test:coverage` |
| E2E     | `pnpm run test:e2e`，调试 `pnpm run test:e2e:debug` |
| 检查     | `pnpm run lint`、`pnpm tsc` |
| 格式化   | `pnpm run prettier` |

## 项目与组件结构

- **源码**：`src/`，单组件目录含 `ComponentName.tsx`、`style.ts`、`types.ts`、`index.tsx`，子组件/`hooks`/`utils` 按需。
- **导出入口**：`src/index.ts` 按功能分区导出；新增组件需在此处与对应组件 `index` 中声明。
- **文档**：`docs/`，Dumi 配置 `.dumirc.ts`。
- **测试**：`tests/`（Vitest）、`e2e/`（Playwright）。
- **脚本**：`scripts/`（如 `checkDemoFiles.js`、`bumpVersion.js`、`generateDemoReport.js`）。

## 组件清单（与 src/index.ts 对应）

- 布局：AgenticLayout、Workspace、ChatLayout、ChatBootPage
- 聊天气泡：Bubble（AIBubble、UserBubble、List）
- 思维链/工具：ThoughtChainList、ToolUseBar、ToolUseBarThink
- 任务/运行：AgentRunBar、TaskList
- 历史：History
- 编辑器/输入：MarkdownEditor、MarkdownInputField
- Schema：SchemaForm、SchemaEditor、SchemaRenderer、validator
- 插件：Plugins（chart、code、formatter、mermaid）
- 基础 UI：AILabel、AnswerAlert、BackTo、Quote、WelcomeMessage
- 通用子组件：ActionIconBox、ActionItemBox、Button、GradientText、LayoutHeader、Loading、Robot、SuggestionList、TextAnimate、TypingAnimation、VisualList、lotties

## 新组件/新功能时

1. 遵循 AGENTS.md 的命名、Props/事件、Ref、样式（createStyles + token）、文件组织。
2. 在 `src/index.ts` 增加导出；如有新组件 Skill，在 `.cursor/skills/README.md` 中补充一览。
3. 补全类型、测试（覆盖率 ≥80%）与文档/Changelog（中英文）。

开发或排查时优先查 AGENTS.md 与对应 component-xxx Skill，再改源码与入口。
