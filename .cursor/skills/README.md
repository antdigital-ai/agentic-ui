# Agentic UI 项目 Skills 使用说明

本目录包含项目级与各组件级 Skills，供 Cursor 在编码时自动或按需选用。

## 如何让 Cursor 用到这些 Skills

### 1. 自动触发（推荐）

在对话里**直接写出和组件/功能相关的词**，Cursor 会根据各 Skill 的 `description` 自动匹配并加载对应 Skill。

| 你想做的事 | 在对话里可以这样写（会触发对应 Skill）                |
| ---------- | ----------------------------------------------------- |
| 改聊天气泡 | 「改一下 Bubble 的样式」「AIBubble 支持 xxx」         |
| 改思维链   | 「ThoughtChainList 加一个展开动画」「思维链展示优化」 |
| 改工具调用 | 「ToolUseBar 显示耗时」「工具调用条样式」             |
| 改编辑器   | 「MarkdownEditor 加个插件」「表格编辑逻辑」           |
| 改输入框   | 「MarkdownInputField 附件上传」「语音输入」           |
| 改工作区   | 「Workspace 多开一个 tab」「浏览器预览」              |
| 改布局     | 「AgenticLayout 左侧宽度」「ChatLayout 底部固定」     |
| 改任务列表 | 「TaskList 展开逻辑」「TaskItem 状态」                |
| 改历史     | 「History 列表拉取」「会话历史搜索」                  |
| 改 Schema  | 「SchemaForm 校验」「SchemaEditor」                   |
| 改欢迎页   | 「WelcomeMessage 动画」「ChatBootPage 标题」          |
| 改插件     | 「chart 插件」「mermaid 渲染」                        |
| 改通用组件 | 「Button / Loading / Robot 组件」                     |
| 使用/接入组件库 | 「怎么用 agentic-ui」「在项目里集成聊天界面」「ConfigProvider 配 locale」 |

只要你的问题里出现**组件名、能力名或相关英文关键词**，通常就会命中对应 Skill。

### 2. 显式 @ 引用（可选）

在 Cursor 输入框里用 `@` 引用本仓库下的文件或文件夹，也会把相关上下文（包括该路径对应的 Skill 逻辑）带进对话，例如：

- `@.cursor/skills/component-bubble/SKILL.md` — 明确带入 Bubble 的 Skill
- `@src/Bubble/` — 带入 Bubble 源码，常会配合 component-bubble 的规范

适合：你希望**强制**按某个组件的规范来改、或一次只讨论一个组件时使用。

### 3. 一次用多个组件

同一句里提多个组件或功能，Cursor 可能同时加载多个 Skills，例如：

- 「把 Bubble 和 ThoughtChainList 的间距统一一下」
- 「ChatLayout 里 History 和 MarkdownInputField 的联动」

这样会同时用到多个组件 Skill，便于做跨组件修改。

## 本仓库 Skills 一览

| Skill 目录                         | 主要触发词                                                               | 用途简述                                   |
| ---------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------ |
| **agentic-ui-development**         | agentic, bubble, thought chain, markdown editor, workspace, chat layout… | 整体开发流程、设计系统、搜索脚本、组件清单 |
| **agentic-ui-usage**              | 使用 agentic-ui, 集成, 引入, 安装, chat UI, 智能体界面, import, ConfigProvider, locale | 组件库使用者：安装、引入、布局与聊天场景、API 查阅 |
| **component-bubble**               | bubble, AIBubble, UserBubble, message list                               | 聊天气泡                                   |
| **component-thought-chain**        | thought chain, ThoughtChainList, thinking, reasoning                     | 思维链列表                                 |
| **component-tool-use**             | tool use, ToolUseBar, ToolUseBarThink, API call                          | 工具调用条                                 |
| **component-markdown-editor**      | markdown editor, BaseMarkdownEditor, slate, toolbar, plugin, table       | Markdown 编辑器                            |
| **component-markdown-input-field** | MarkdownInputField, attachment, voice input, send button                 | 多模态输入框                               |
| **component-workspace**            | workspace, browser tab, file tab, task tab                               | 工作区与多 Tab                             |
| **component-agentic-layout**       | AgenticLayout, layout, left center right, header                         | 三栏主布局                                 |
| **component-chat-layout**          | ChatLayout, chat layout, header content footer                           | 聊天布局                                   |
| **component-chat-boot-page**       | ChatBootPage, Title, CaseReply, ButtonTab                                | 启动页                                     |
| **component-task-list**            | TaskList, task list, TaskItem, TaskStatus                                | 任务/步骤列表                              |
| **component-agent-run-bar**        | AgentRunBar, run bar, play pause stop                                    | 运行控制条                                 |
| **component-history**              | History, history list, session list                                      | 会话历史                                   |
| **component-schema**               | SchemaForm, SchemaEditor, SchemaRenderer, validator                      | Schema 表单/编辑/渲染                      |
| **component-welcome-message**      | WelcomeMessage, welcome, onboarding                                      | 欢迎/引导消息                              |
| **component-ai-label**             | AILabel, AI label, watermark                                             | AI 标签/水印                               |
| **component-answer-alert**         | AnswerAlert, alert, success error warning                                | 结果/状态提示条                            |
| **component-quote-backto**         | Quote, BackTo, quote block, back link                                    | 引用块与返回链接                           |
| **component-plugins**              | plugin, chart, mermaid, code, katex                                      | 图表/代码/公式等插件                       |
| **component-shared**               | ActionIconBox, Button, LayoutHeader, Loading, Robot                      | 通用按钮、头部、加载、动画等               |
| **markdown-syntax-guide**          | 表格, 视频, 图表, 语法, 怎么写                                           | Markdown 扩展语法说明                      |
| **gh-create-pr**                   | 提 PR, 新建 PR, create pull request                                      | 用 gh 创建/更新 PR                         |

## 项目规范从哪里看

- **编码与仓库规范**：仓库根目录的 [AGENTS.md](../../AGENTS.md)（命名、TypeScript、样式、测试、Git/PR、Changelog 等）。
- **组件级约定**：各 `component-xxx/SKILL.md` 里会写源码路径、主要 API、和 AGENTS.md 一致的开发约定。

日常用法建议：**在对话里自然写出你要改的组件名或功能**，让 Cursor 自动选 Skill；需要严格按某一组件规范改时，再用 `@` 引用对应 Skill 或源码目录。
