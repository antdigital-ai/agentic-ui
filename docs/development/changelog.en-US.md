---
nav:
  title: 项目研发
  order: 3
group:
  title: 开发指南
  order: 2
---

# Changelog

## v2.29.7

🆕 FooterBackgroundLottie: Add Lottie animation configuration file. ([a77e7f6a](https://github.com/ant-design/agentic-ui/commit/a77e7f6a))

## v2.29.4

- Workspace
  - 🆕 Support customizing title right side. [@shuyan] ([619309d4](https://github.com/ant-design/agentic-ui/commit/619309d4))
  - 💄 Optimize styles. [@shuyan] ([619309d4](https://github.com/ant-design/agentic-ui/commit/619309d4))
  - 🌐 Add internationalization. [@shuyan] ([619309d4](https://github.com/ant-design/agentic-ui/commit/619309d4))
  - ✅ Add test cases. [@shuyan] ([619309d4](https://github.com/ant-design/agentic-ui/commit/619309d4))
  - 🆕 Add file card custom rendering capability. [#263](https://github.com/ant-design/agentic-ui/pull/263) ([7be1d6a2](https://github.com/ant-design/agentic-ui/commit/7be1d6a2))

- MarkdownInputField
  - 🐞 Fix style issues. [#267](https://github.com/ant-design/agentic-ui/pull/267) ([189d19c9](https://github.com/ant-design/agentic-ui/commit/189d19c9))

- ToolUseBar
  - 💄 Optimize tool call component styles. [#264](https://github.com/ant-design/agentic-ui/pull/264) ([8ca40d7b](https://github.com/ant-design/agentic-ui/commit/8ca40d7b))

- ChatLayout
  - 💄 Adjust `ant-chat-item-extra` styles, optimize spacing and alignment. ([24334255](https://github.com/ant-design/agentic-ui/commit/24334255))
  - 🆕 Enhance style adaptation capabilities, optimize conversation flow demo. [#258](https://github.com/ant-design/agentic-ui/pull/258) ([a54a5934](https://github.com/ant-design/agentic-ui/commit/a54a5934))

🆕 Disable single tilde feature. [#265](https://github.com/ant-design/agentic-ui/pull/265) ([57d65ef2](https://github.com/ant-design/agentic-ui/commit/57d65ef2))

📚 API documentation update. [#259](https://github.com/ant-design/agentic-ui/pull/259) ([66f9ec17](https://github.com/ant-design/agentic-ui/commit/66f9ec17))

## v2.29.3

- MarkdownInputField
  - 🆕 Add animated border beam effect. [@qixian]
  - 🆕 Add new component with placeholder and send functionality. [@qixian]
  - 🆕 Support customizing send button colors via `sendButtonProps`. [#241](https://github.com/ant-design/agentic-ui/pull/241) [@Chiaki枫烨]
  - 💄 Optimize disabled and loading styles. [@qixian]
  - 💄 Optimize styles for tool rendering and border radius. [@qixian]

- Bubble
  - 🐞 Fix `useEffect` dependency issues. [@qixian]
  - 💄 Optimize content font style. [#246](https://github.com/ant-design/agentic-ui/pull/246) [@不见月]
  - 💄 Optimize Loading and action icon display effects. [#237](https://github.com/ant-design/agentic-ui/pull/237) [@不见月]

- MarkdownEditor
  - 💄 Default content font size now uses `--font-text-paragraph-lg` variable. [#249](https://github.com/ant-design/agentic-ui/pull/249) [@不见月]
  - 🆕 Add `disableHtmlPreview` and `viewModeLabels` properties. [@qixian]

🆕 AppWrapper: Add `AppWrapper` component to utilize `useAppData` and log app data on mount. [@qixian]

🆕 BubbleList: Add lazy loading support to improve performance. [@qixian]

🆕 CodeRenderer: Support JavaScript detection in HTML code. [@qixian]

🆕 ChatLayout: Auto-scroll to bottom when switching conversation records. [#247](https://github.com/ant-design/agentic-ui/pull/247) [@不见月]

🆕 QuickLink: Add viewport link prefetching. [@qixian]

🐞 SendButton: Fix `fillOpacity` animation warning. [#236](https://github.com/ant-design/agentic-ui/pull/236) [@Chiaki枫烨]

💄 ToolUseBar: Style optimizations. [#235](https://github.com/ant-design/agentic-ui/pull/235) [@不见月]

💄 Workspace: Optimize content and header margins. [#238](https://github.com/ant-design/agentic-ui/pull/238) [@shuyan]

## v2.29.1

🐞 EditorStore: Optimize node replacement logic to consider `finished` state. [@陈帅]

🐞 TagPopup: Fix node path retrieval errors and dependency checks. [@qixian]

🆕 ChatLayout: Add animations for flow action buttons. [#234](https://github.com/ant-design/agentic-ui/pull/234) [@不见月]

## v2.29.0

🛠 Bubble: Optimize message content styling and structure. [@qixian]

🛠 MarkdownEditor: Optimize style handling, node comparison logic, and drag-and-drop functionality. [@qixian]

🆕 Dumirc: Add Google Tag Manager script. [@qixian]

## v2.28.11

🆕 AI Label: Add `AILabel` component. [#229](https://github.com/ant-design/agentic-ui/pull/229) [@不见月]

🆕 Loading: Enhance `Loading` component. [#230](https://github.com/ant-design/agentic-ui/pull/230) [@不见月]

💄 RealtimeFollow: Adjust icon size and margins. [#232](https://github.com/ant-design/agentic-ui/pull/232) [@ranranup]

## v2.28.10

⚡️ MarkdownEditor: Optimize node comparison and parsing logic to improve rendering performance. [@qixian]

🛠 MarkdownToSlateParser: Optimize HTML comment handling. [@qixian]

💄 Workspace: Optimize download button display logic. [#228](https://github.com/ant-design/agentic-ui/pull/228) [@ranranup]

💄 Reset CSS: Remove deprecated color variables. [@qixian]

⚡️ useIntersectionOnce: Use `useLayoutEffect` instead of `useEffect` for optimized detection. [@qixian]

## v2.28.9

🆕 Bubble: Support customizable user and AI bubble properties. [@qixian]

🐞 ChartRender: Simplify runtime loading condition. [@qixian]

🛠 MarkdownInputField: Remove `enlargeable` prop and refactor component structure. [@qixian]

🐞 QuickActions: Fix exception in resize events. [@qixian]

🆕 Mermaid: Add flowchart support. [@qixian]

## v2.28.8

🆕 Lottie: Add multiple robot animations. [#225](https://github.com/ant-design/agentic-ui/pull/225) [@不见月]

🐞 SchemaEditorBridgeManager: Fix `stopBridge` error in strict mode. [#226](https://github.com/ant-design/agentic-ui/pull/226) [@hei-f]

🐞 Mermaid: Enhance error handling and rendering logic. [@qixian]

## v2.28.7

🐞 Bubble: Fix content handling logic and stabilize `originData` reference. [#220](https://github.com/ant-design/agentic-ui/pull/220) [@hei-f]

💄 ChatLayout: Change footer style to `minHeight`. [@qixian]

🆕 Workspace: Add `Browser` component support. [#222](https://github.com/ant-design/agentic-ui/pull/222) [@ranranup]

## v2.28.6

🐞 ThinkBlock: Update default expanded state. [@qixian]

## v2.28.5

- ThinkBlock
  - 🛠 Optimize `useEffect` dependencies. [@qixian]
  - 🛠 Optimize expanded state handling. [@qixian]

## v2.28.4

🛠 CodeRenderer: Enhance props handling. [@qixian]

## v2.28.3

🛠 ThinkBlock: Add Context support. [@qixian]

## v2.28.2

🆕 MarkdownEditor: Add `CommentLeaf` and `FncLeaf` components. [@qixian]

## v2.28.1

- ThinkBlock
  - 🛠 Optimize state management. [@qixian]

🛠 SimpleTable: Clean up component and optimize chart animation duration. [@qixian]

## v2.28.0

🆕 Utils: Add debug info logging functionality. [@qixian]

## v2.27.10

🐞 Bubble: Remove `Loader` component from `AIBubble`. [@qixian]

💄 ThinkBlock: Adjust `marginTop` style to 8px. [@qixian]

## v2.27.9

🐞 ThinkBlock: Fix message context retrieval logic. [@qixian]

## v2.27.8

🐞 Bubble: Fix initial content retrieval logic. [@qixian]

## v2.27.7

🆕 Utils: Add `debugInfo` utility function. [@qixian]

🆕 MediaErrorLink: Add component to handle media load failures. [@陈帅]

## v2.27.6

🐞 Bubble: Adjust content retrieval order. [@qixian]
