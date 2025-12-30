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
  - 💄 内容默认使用 ``--font-text-paragraph-lg`` 变量的字号。 [#249](https://github.com/ant-design/agentic-ui/pull/249) [@不见月]
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
