---
nav:
  title: 项目研发
  order: 3
group:
  title: 开发指南
  order: 2
---

# Changelog

## v2.29.26

- Bubble
  - 🛠 重构 Bubble 组件，集成 `useMergedLocale` 以实现统一的国际化处理。 ([6647b12b](https://github.com/ant-design/agentic-ui/commit/6647b12b))

## v2.29.25

- MarkdownInputField
  - 🌐 上传状态国际化支持，优化 "上传中..." 和 "上传失败" 文本的多语言显示。 [#301](https://github.com/ant-design/agentic-ui/pull/301) [@陈帅]

- I18n
  - 🌐 国际化完善，修复 `cnLabels` 中的翻译错误，新增 17 个缺失的 i18n 键，并更新 9 个组件以使用国际化。 [#299](https://github.com/ant-design/agentic-ui/pull/299) [@陈帅]

📚 API 文档更新，完善设计问题说明。 [#298](https://github.com/ant-design/agentic-ui/pull/298) [@陈帅]

## v2.29.24

- Bubble
  - 🐞 修复样式类名前缀，在 `useMessagesContentStyle` 中为类名添加点号以确保正确应用样式。 ([2f496852](https://github.com/ant-design/agentic-ui/commit/2f496852))

- MarkdownPreview
  - 🛠 简化渲染逻辑，根据 `placement` 和额外内容优化 Popover 行为。 ([d9cf641c](https://github.com/ant-design/agentic-ui/commit/d9cf641c))

- Workspace
  - 🛠 更新 demo 文件引用，移除过时的 demo。 ([fc4ffb27](https://github.com/ant-design/agentic-ui/commit/fc4ffb27))

✅ 测试优化，更新多个测试文件的类型断言和 mock 实现，提升类型安全性和一致性。 ([4d5634b1](https://github.com/ant-design/agentic-ui/commit/4d5634b1))

## v2.29.23

- MarkdownEditor
  - 🌐 编辑器操作栏标题支持国际化，标题、小标题、正文等支持多语言。 [#296](https://github.com/ant-design/agentic-ui/pull/296) [@shuyan]

- MarkdownEditor
  - 🐞 修复 Markdown 内容为空时的初始化问题，确保 `initValue` 为空或 `undefined` 时也能正常渲染。 [#294](https://github.com/ant-design/agentic-ui/pull/294) [@陈帅]

## v2.29.22

- Bubble
  - 🛠 重构类名命名以改进样式封装，优化 BubbleMessageDisplay 的样式隔离。 ([e734568c](https://github.com/ant-design/agentic-ui/commit/e734568c))

## v2.29.21

- Bubble
  - 🆕 添加 `wrapSSR` 支持，改进 BubbleMessageDisplay 的渲染能力。 ([8dd08a01](https://github.com/ant-design/agentic-ui/commit/8dd08a01))

## v2.29.20

- Bubble
  - 💄 更新 MessagesContent 样式，优化 `padding` 和 `gap` 值以保持一致性。 ([4578a647](https://github.com/ant-design/agentic-ui/commit/4578a647))
  - 🆕 增强气泡消息处理，支持 `preMessage` 和重试 UI。 ([8b56ebe3](https://github.com/ant-design/agentic-ui/commit/8b56ebe3))

✅ MarkdownEditor: 添加只读模式下的脚注渲染测试用例。 ([2ca9faee](https://github.com/ant-design/agentic-ui/commit/2ca9faee))

## v2.29.19

- MarkdownEditor
  - 🐞 默认禁用 `setMDContent` 中的 RAF 优化，防止浏览器原生弹窗阻塞主线程时 Markdown 渲染停止。 [#293](https://github.com/ant-design/agentic-ui/pull/293) [@陈帅]

- ChatLayout
  - 💄 优化底部动画背景铺满整个容器。 [#292](https://github.com/ant-design/agentic-ui/pull/292) [@不见月]

## v2.29.18

- MarkdownEditor
  - 🐞 修复粘贴处理逻辑，更新 `onPaste` 处理器返回布尔值并增强粘贴处理。 ([af8cff63](https://github.com/ant-design/agentic-ui/commit/af8cff63))

## v2.29.17

- Workspace
  - 🆕 支持卡片自定义渲染。 [#291](https://github.com/ant-design/agentic-ui/pull/291) [@shuyan]

- MarkdownEditor
  - 🆕 增强快捷输入提示，支持代码块和分割线的快捷输入。 [#289](https://github.com/ant-design/agentic-ui/pull/289) [@222]
  - 🐞 优化按键匹配与空格触发逻辑。 [#288](https://github.com/ant-design/agentic-ui/pull/288) [@陈帅]
  - 🆕 支持双井号（##）标题输入。 [#284](https://github.com/ant-design/agentic-ui/pull/284) [@陈帅]

✅ 提升测试用例覆盖率。 [#287](https://github.com/ant-design/agentic-ui/pull/287) [@222]

## v2.29.16

- Workspace
  - 🆕 支持文件和网页反向定位，点击工作空间的文件、网页可以反向定位到对话中的位置。 [#286](https://github.com/ant-design/agentic-ui/pull/286) [@shuyan]
  - 🆕 任务名称支持 ReactNode，支持自定义 `title`。 [#279](https://github.com/ant-design/agentic-ui/pull/279) [@shuyan]

📚 设计指南完善，添加 Figma 设计系统指南。 [#285](https://github.com/ant-design/agentic-ui/pull/285) [@陈帅]

📚 添加 AGENTS.md 文件，完善项目文档。 [#283](https://github.com/ant-design/agentic-ui/pull/283) [@陈帅]

📚 添加 Markdown 输入快捷键文档。 [#282](https://github.com/ant-design/agentic-ui/pull/282) [@陈帅]

📚 完善组件库规范说明。 [#281](https://github.com/ant-design/agentic-ui/pull/281) [@陈帅]

📚 为按钮文档添加 `atomId` 说明。 [#280](https://github.com/ant-design/agentic-ui/pull/280) [@遇见同学]

## v2.29.15

📦 添加 guidelines 目录到 package 文件列表。 ([895d20fc](https://github.com/ant-design/agentic-ui/commit/895d20fc))

## v2.29.14

🆕 Sofa 图标页面上线。 [#278](https://github.com/ant-design/agentic-ui/pull/278) [@陈帅]

🛠 ParseMd 代码结构优化。 [#277](https://github.com/ant-design/agentic-ui/pull/277) [@陈帅]

## v2.29.12

- MarkdownInputField
  - 💄 动效优化，将光条调整到左侧，优化视线引导效果。 [#276](https://github.com/ant-design/agentic-ui/pull/276) [@不见月]

- ChatFlowContainer
  - 🛠 更新滚动元素的动画持续时间。 [#275](https://github.com/ant-design/agentic-ui/pull/275) [@不见月]

⚡️ Elements 样式性能优化。 [#274](https://github.com/ant-design/agentic-ui/pull/274) [@陈帅]

## v2.29.9

- TagPopup
  - 🐞 修复连续选择下拉选项时抛出 'path' is null 错误。 [#269](https://github.com/ant-design/agentic-ui/pull/269) [@222]

## v2.29.7

🆕 FooterBackgroundLottie: 添加 Lottie 动画配置文件。 ([a77e7f6a](https://github.com/ant-design/agentic-ui/commit/a77e7f6a))

## v2.29.4

- Workspace
  - 🆕 支持标题右侧自定义。 [@shuyan] ([619309d4](https://github.com/ant-design/agentic-ui/commit/619309d4))
  - 💄 优化样式。 [@shuyan] ([619309d4](https://github.com/ant-design/agentic-ui/commit/619309d4))
  - 🌐 补充国际化。 [@shuyan] ([619309d4](https://github.com/ant-design/agentic-ui/commit/619309d4))
  - ✅ 补充测试用例。 [@shuyan] ([619309d4](https://github.com/ant-design/agentic-ui/commit/619309d4))
  - 🆕 增加文件卡片自定义渲染能力。 [#263](https://github.com/ant-design/agentic-ui/pull/263) ([7be1d6a2](https://github.com/ant-design/agentic-ui/commit/7be1d6a2))

- MarkdownInputField
  - 🐞 修复样式问题。 [#267](https://github.com/ant-design/agentic-ui/pull/267) ([189d19c9](https://github.com/ant-design/agentic-ui/commit/189d19c9))

- ToolUseBar
  - 💄 优化调用工具组件样式。 [#264](https://github.com/ant-design/agentic-ui/pull/264) ([8ca40d7b](https://github.com/ant-design/agentic-ui/commit/8ca40d7b))

- ChatLayout
  - 💄 调整 `ant-chat-item-extra` 样式，优化间距和对齐方式。 ([24334255](https://github.com/ant-design/agentic-ui/commit/24334255))
  - 🆕 增强样式适配能力，优化对话流 demo。 [#258](https://github.com/ant-design/agentic-ui/pull/258) ([a54a5934](https://github.com/ant-design/agentic-ui/commit/a54a5934))

🆕 禁用单个波浪号功能。 [#265](https://github.com/ant-design/agentic-ui/pull/265) ([57d65ef2](https://github.com/ant-design/agentic-ui/commit/57d65ef2))

📚 API 文档更新。 [#259](https://github.com/ant-design/agentic-ui/pull/259) ([66f9ec17](https://github.com/ant-design/agentic-ui/commit/66f9ec17))

## v2.29.3

- MarkdownInputField
  - 🆕 为输入框添加流光边框动画效果。 [@qixian]
  - 🆕 新增组件，支持占位符和发送功能。 [@qixian]
  - 🆕 支持通过 `sendButtonProps` 自定义发送按钮颜色。 [#241](https://github.com/ant-design/agentic-ui/pull/241) [@Chiaki枫烨]
  - 💄 优化禁用和加载状态样式。 [@qixian]
  - 💄 优化工具渲染支持及圆角样式。 [@qixian]

- Bubble
  - 🐞 修复 `useEffect` 依赖问题。 [@qixian]
  - 💄 优化内容字体样式。 [#246](https://github.com/ant-design/agentic-ui/pull/246) [@不见月]
  - 💄 优化 Loading 和操作图标展示效果。 [#237](https://github.com/ant-design/agentic-ui/pull/237) [@不见月]

- MarkdownEditor
  - 💄 内容默认使用 `--font-text-paragraph-lg` 变量的字号。 [#249](https://github.com/ant-design/agentic-ui/pull/249) [@不见月]
  - 🆕 新增 `disableHtmlPreview` 和 `viewModeLabels` 属性。 [@qixian]

🆕 AppWrapper: 新增 `AppWrapper` 组件以利用 `useAppData` 并在挂载时记录应用数据。 [@qixian]

🆕 BubbleList: 新增懒加载支持以提升性能。 [@qixian]

🆕 CodeRenderer: 支持 HTML 代码中的 JavaScript 检测。 [@qixian]

🆕 ChatLayout: 切换对话记录时自动滚动到底部。 [#247](https://github.com/ant-design/agentic-ui/pull/247) [@不见月]

🆕 QuickLink: 新增视口内链接预加载功能。 [@qixian]

🐞 SendButton: 修复 `fillOpacity` 动画警告。 [#236](https://github.com/ant-design/agentic-ui/pull/236) [@Chiaki枫烨]

💄 ToolUseBar: 样式优化。 [#235](https://github.com/ant-design/agentic-ui/pull/235) [@不见月]

💄 Workspace: 优化内容和头部边距。 [#238](https://github.com/ant-design/agentic-ui/pull/238) [@shuyan]

## v2.29.1

🐞 EditorStore: 优化节点替换逻辑，考虑 `finished` 状态。 [@陈帅]

🐞 TagPopup: 修复节点路径获取错误及依赖检查。 [@qixian]

🆕 ChatLayout: 新增多个对话流操作按钮动画。 [#234](https://github.com/ant-design/agentic-ui/pull/234) [@不见月]

## v2.29.0

🛠 Bubble: 优化消息内容样式和结构。 [@qixian]

🛠 MarkdownEditor: 优化样式处理、节点对比逻辑及拖拽功能。 [@qixian]

🆕 Dumirc: 增加 Google Tag Manager 脚本。 [@qixian]

## v2.28.11

🆕 AI Label: 新增 `AILabel` 组件。 [#229](https://github.com/ant-design/agentic-ui/pull/229) [@不见月]

🆕 Loading: 增强 `Loading` 组件。 [#230](https://github.com/ant-design/agentic-ui/pull/230) [@不见月]

💄 RealtimeFollow: 修改实时跟随图标大小和边距。 [#232](https://github.com/ant-design/agentic-ui/pull/232) [@ranranup]

## v2.28.10

⚡️ MarkdownEditor: 优化节点对比和解析逻辑，提升渲染性能。 [@qixian]

🛠 MarkdownToSlateParser: 优化 HTML 注释处理。 [@qixian]

💄 Workspace: 优化下载按钮展示逻辑。 [#228](https://github.com/ant-design/agentic-ui/pull/228) [@ranranup]

💄 Reset CSS: 移除废弃颜色变量。 [@qixian]

⚡️ useIntersectionOnce: 使用 `useLayoutEffect` 替代 `useEffect` 以优化检测。 [@qixian]

## v2.28.9

🆕 Bubble: 支持自定义用户和 AI 气泡属性。 [@qixian]

🐞 ChartRender: 简化运行时加载条件。 [@qixian]

🛠 MarkdownInputField: 移除 `enlargeable` 属性并重构组件结构。 [@qixian]

🐞 QuickActions: 修复 resize 事件中的异常问题。 [@qixian]

🆕 Mermaid: 新增流程图支持。 [@qixian]

## v2.28.8

🆕 Lottie: 新增多个机器人动画。 [#225](https://github.com/ant-design/agentic-ui/pull/225) [@不见月]

🐞 SchemaEditorBridgeManager: 修复严格模式下 `stopBridge` 报错问题。 [#226](https://github.com/ant-design/agentic-ui/pull/226) [@hei-f]

🐞 Mermaid: 增强错误处理和渲染逻辑。 [@qixian]

## v2.28.7

🐞 Bubble: 修复内容处理逻辑，稳定 `originData` 引用。 [#220](https://github.com/ant-design/agentic-ui/pull/220) [@hei-f]

💄 ChatLayout: 修改 footer 样式为 `minHeight`。 [@qixian]

🆕 Workspace: 增加 `Browser` 组件支持。 [#222](https://github.com/ant-design/agentic-ui/pull/222) [@ranranup]

## v2.28.6

🐞 ThinkBlock: 更新默认展开状态。 [@qixian]

## v2.28.5

- ThinkBlock
  - 🛠 优化 `useEffect` 依赖。 [@qixian]
  - 🛠 优化展开状态处理。 [@qixian]

## v2.28.4

🛠 CodeRenderer: 增强属性处理。 [@qixian]

## v2.28.3

🛠 ThinkBlock: 增加 Context 支持。 [@qixian]

## v2.28.2

🆕 MarkdownEditor: 新增 `CommentLeaf` 和 `FncLeaf` 组件。 [@qixian]

## v2.28.1

- ThinkBlock
  - 🛠 优化状态管理。 [@qixian]

🛠 SimpleTable: 清理组件并优化图表动画时长。 [@qixian]

## v2.28.0

🆕 Utils: 增加调试信息记录功能。 [@qixian]

## v2.27.10

🐞 Bubble: 移除 `AIBubble` 中的 `Loader` 组件。 [@qixian]

💄 ThinkBlock: 调整 `marginTop` 样式为 8px。 [@qixian]

## v2.27.9

🐞 ThinkBlock: 修复消息上下文获取逻辑。 [@qixian]

## v2.27.8

🐞 Bubble: 修复初始内容获取逻辑。 [@qixian]

## v2.27.7

🆕 Utils: 添加 `debugInfo` 工具函数。 [@qixian]

🆕 MediaErrorLink: 新增组件处理媒体加载失败。 [@陈帅]

## v2.27.6

🐞 Bubble: 调整内容获取顺序。 [@qixian]
