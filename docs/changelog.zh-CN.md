## v2.29.3

AppWrapper:
  - 🆕 add AppWrapper component to utilize useAppData and log app data on mount  [@qixian.cs]

BorderBeamAnimation:
  - 🆕 add animated border beam effect to MarkdownInputField  [@qixian.cs]

Bubble & MarkdownPreview:
  - 🐞 update dependencies in useEffect hooks  [@qixian.cs]

BubbleList:
  - 🆕 enhance lazy loading with shouldLazyLoad functionality  [@qixian.cs]
  - 🆕 add lazy loading support for improved performance  [@qixian.cs]

CodeRenderer & CodeToolbar:
  - 🆕 implement JavaScript detection in HTML code  [@qixian.cs]

MarkdownEditor:
  - 🧹 内容默认使用 --font-text-paragraph-lg 变量的字号 [#249](https://github.com/ant-design/agentic-ui/pull/249) [@不见月]
  - 🆕 add disableHtmlPreview and viewModeLabels properties  [@qixian.cs]

MarkdownInputField:
  - 🆕 add MarkdownInputField component with placeholder and send functionality  [@qixian.cs]
  - 🆕 Support customizing send button colors via sendButtonProps [#241](https://github.com/ant-design/agentic-ui/pull/241) [@Chiaki枫烨]

Other:
  - 📄 Add end-to-end tests for MarkdownInputField functionality [#250](https://github.com/ant-design/agentic-ui/pull/250) [@陈帅]
  - ✅ add end-to-end test for MarkdownInputField placeholder behavior with whitespace input  [@陈帅]
  - ✅ add end-to-end tests for MarkdownInputField functionality including input, delete, copy, cut, paste, and style verification  [@qixian]
  - 💄 refine MarkdownInputField styles by consolidating disabled and loading states for improved UX  [@qixian]
  - ✅ add end-to-end tests for MarkdownInputField copy functionality  [@qixian]
  - 💄 enhance MarkdownInputField styles for tool rendering support and adjust border radius  [@qixian]
  - 💄 调整字体大小，更新 Markdown 编辑器样式  [@qixian.cs]
  - 🛠 remove obsolete test files for various components  [@qixian.cs]
  - 💄 update Bubble content font [#246](https://github.com/ant-design/agentic-ui/pull/246) [@不见月]
  - 📄 fea(ChatLayout)t: 切换对话记录时，自动滚动到对话底部 [#247](https://github.com/ant-design/agentic-ui/pull/247) [@不见月]
  - ✅ specify file patterns in test coverage script for vitest  [@qixian.cs]
  - ✅ specify file patterns in test coverage script for vitest  [@qixian.cs]
  - 📄  添加 MarkdownInputField 标签弹出选择器的端到端测试  [@qixian.cs]
  - 🐞 update test script to specify file patterns for vitest  [@qixian.cs]
  - 🆕 add quicklink for prefetching in-viewport links and update dependencies  [@qixian.cs]
  - 🛠 remove e2e directory from test exclusion list in vitest configuration  [@qixian.cs]
  - 🛠 remove invisible characters from import statements in chart test files  [@qixian.cs]
  - 🛠 streamline className handling in chart components  [@陈帅]
  - 🛠 enhance className and style handling in chart components  [@陈帅]
  - 🛠 standardize event naming in Bubble components  [@陈帅]
  - 🛠 update event naming conventions in Bubble and Workspace components  [@陈帅]
  - 🛠 standardize dislike and like cancel callbacks across Bubble components  [@陈帅]
  - 🛠 optimize component structure and performance across multiple files  [@陈帅]
  - 📄 Ui test addition [#244](https://github.com/ant-design/agentic-ui/pull/244) [@陈帅]
  - 🆕 add AGENTS.md documentation for project guidelines and standards  [@陈帅]
  - 📄 Markdown syntax documentation [#243](https://github.com/ant-design/agentic-ui/pull/243) [@陈帅]
  - 🆕 Loading & Bubble action icons 展示效果优化 [#237](https://github.com/ant-design/agentic-ui/pull/237) [@不见月]
  - 📄 更新组件分组并为 FileAttachment 和 Footnote 组件添加新文档 [#242](https://github.com/ant-design/agentic-ui/pull/242) [@不见月]
  - 📄 update snapshot  [@qixian.cs]

SchemaEditorBridgeManager, tests:
  - 🐞 update imports and enhance mock implementations  [@qixian]

SendButton:
  - 🐞 resolve fillOpacity animation warning by disabling initial animation [#236](https://github.com/ant-design/agentic-ui/pull/236) [@Chiaki枫烨]

ToolUseBar:
  - 🧹 样式优化 [#235](https://github.com/ant-design/agentic-ui/pull/235) [@不见月]

demos:
  - 🛠 update snapshots for MarkdownInputField and quote-with-input demos  [@qixian.cs]

package.json & vitest.config.ts:
  - 🐞 restore E2E test command and exclude specific directories from testing  [@qixian.cs]

tests:
  - 🛠 optimize LineChart test setup and increase timeout  [@qixian.cs]
  - 🐞 enhance mock implementations for Lottie components  [@qixian.cs]

工作空间:
  - 💄 优化内容和头部边距 [#238](https://github.com/ant-design/agentic-ui/pull/238) [@shuyan]

## v2.29.1

BubbleList, Schema.bubble, QuickActions:
  - ✅ enhance isLast property tests and improve async handling  [@qixian.cs]

EditorStore:
  - 🐞 enhance node replacement logic to consider 'finished' state  [@陈帅]

MarkdownEditor, Bubble:
  - 🛠 enhance dependency management and memoization  [@qixian.cs]

Other:
  - 🧹 更新浏览器插件 sdk [#233](https://github.com/ant-design/agentic-ui/pull/233) [@hei-f]
  - 🆕 新增多个对话流操作按钮动画 [#234](https://github.com/ant-design/agentic-ui/pull/234) [@不见月]
  - 🛠 clean up imports and remove unnecessary whitespace  [@陈帅]

TagPopup:
  - 🐞 handle errors in node path retrieval and improve dependency checks  [@qixian.cs]

## v2.29.0

Bubble:
  - 🛠 enhance message content styling and structure  [@qixian.cs]

MarkdownEditor:
  - 🛠 enhance element prop comparison logic  [@qixian.cs]
  - 🛠 simplify style handling in editor component  [@qixian.cs]
  - 🛠 streamline styles and improve component structure  [@qixian.cs]
  - 🛠 optimize content setting and drag-and-drop functionality  [@qixian.cs]

demos:
  - 🆕 add table example to markdown editor demo  [@qixian.cs]

dumirc:
  - 🛠 rename scripts to headScripts for clarity  [@qixian.cs]
  - 🆕 add Google Tag Manager script for enhanced tracking  [@qixian.cs]

## v2.28.11

MarkdownEditor:
  - 🛠 optimize Card and Chart components by removing unused imports  [@qixian.cs]
  - ✅ add comprehensive tests for parserMarkdownToSlateNode  [@qixian]

Other:
  - 🆕 新增 AI Label [#229](https://github.com/ant-design/agentic-ui/pull/229) [@不见月]
  - 🆕 增强 Loading 组件 [#230](https://github.com/ant-design/agentic-ui/pull/230) [@不见月]
  - 📄 修改实时跟随图标大小和边距 [#232](https://github.com/ant-design/agentic-ui/pull/232) [@ranranup]

demos:
  - 🐞 update loading component structure in bubble demo snapshot  [@qixian]

useStyle:
  - 🛠 simplify CSS variable handling in useEditorStyleRegister  [@qixian.cs]

## v2.28.10

MarkdownEditor:
  - 🛠 enhance block merging logic in Markdown parser  [@qixian.cs]
  - 🛠 optimize node comparison with hash checks and improve diff generation  [@qixian.cs]
  - 🛠 implement hash-based node updates and optimize rendering  [@qixian.cs]
  - 🛠 update parsing logic and remove unused cache  [@qixian.cs]

MarkdownToSlateParser:
  - 🛠 streamline HTML comment handling and clean up otherProps  [@qixian.cs]

Other:
  - 📄 优化工作空间下载按钮的展示逻辑 [#228](https://github.com/ant-design/agentic-ui/pull/228) [@ranranup]

demos:
  - 🐞 add translate="no" attribute to various demo snapshots  [@qixian.cs]

reset-ant.css:
  - 🛠 remove deprecated color variables and streamline CSS structure  [@qixian.cs]

useIntersectionOnce:
  - 🛠 replace useEffect with useLayoutEffect for immediate intersection checks  [@qixian]

## v2.28.9

Bubble:
  - 🆕 enhance Bubble component with customizable user and AI bubble props  [@qixian]

ChartRender:
  - 🐞 simplify runtime loading condition  [@qixian]

MarkdownInputField:
  - 🛠 remove deprecated enlargeable prop  [@qixian]
  - 🆕 refactor component structure and enhance functionality  [@qixian]

Other:
  - 📄 Enhance QuickActions component to handle undefined window and null element cases during resize events  [@qixian.cs]
  - 📄 Refactor QuickActions component to filter out falsy values in JSX rendering  [@qixian.cs]
  - 📄 Remove ChartErrorBoundaryExample component and add unit tests for FunnelChart, RadarChart, and ScatterChart components  [@qixian.cs]
  - 📄 Refactor MarkdownEditor components to improve debug information and enhance readability  [@qixian.cs]

mermaid:
  - 🆕 add Mermaid flowchart support and improve rendering logic  [@qixian.cs]

## v2.28.8

AgenticLayout:
  - ✅ add comprehensive and edge case test coverage [#227](https://github.com/ant-design/agentic-ui/pull/227) [@222]

Other:
  - 🆕 新增 CostMillis、TableSql 和 TitleInfo 组件的单元测试，覆盖基本渲染、国际化支持及边界情况  [@qixian]
  - 🆕 enhance tests for DazingLottie and ThinkingLottie components, add edge cases for file paste functionality  [@qixian]
  - 📄 新增 DazingLottie 和 ThinkingLottie 组件的单元测试，覆盖默认属性、定制属性及样式合并等场景，确保组件功能正常。  [@qixian]
  - 🆕 新增多个机器人动画 [#225](https://github.com/ant-design/agentic-ui/pull/225) [@不见月]
  - 📄 新增 LLM 语义地图文档，提供项目结构与语义索引，便于理解与检索  [@陈帅]
  - 📄 Refactor code structure for improved readability and maintainability  [@qixian]

RealtimeFollow:
  - ✅ 增强组件测试覆盖，处理多种状态和内容情况  [@qixian]

SchemaEditorBridgeManager:
  - 🐞 解决严格模式下 stopBridge 报错问题 [#226](https://github.com/ant-design/agentic-ui/pull/226) [@hei-f]

mermaid:
  - 🆕 enhance MermaidRendererImpl and useMermaidRender for improved error handling and rendering logic  [@qixian.cs]

proxySandbox:
  - ✅ add comprehensive tests for sandbox functionality and security checks  [@qixian]

rootContainer:
  - 🛠 移除不必要的主题变量插入，优化组件结构  [@qixian]

## v2.28.7

Bubble:
  - 🐞 只处理字符串 content & 稳定 originData 引用 & 更新测试用例 [#220](https://github.com/ant-design/agentic-ui/pull/220) [@hei-f]

ChatLayout:
  - 🐞 修改 footer 样式为 minHeight 以提高布局灵活性  [@qixian]

Other:
  - 📄 根据 ai 提示建议修改工作空间浏览器组件 [#224](https://github.com/ant-design/agentic-ui/pull/224) [@ranranup]
  - 📄 workspace 增加 browser [#222](https://github.com/ant-design/agentic-ui/pull/222) [@ranranup]
  - 🐞 unit test [#221](https://github.com/ant-design/agentic-ui/pull/221) [@bigang.ybg]

## v2.28.6

Other:
  - 🐞 update default expanded state in ThinkBlock component  [@qixian]

## v2.28.5

Other:
  - 🛠 simplify useEffect dependencies in ThinkBlock component  [@qixian]
  - 🛠 improve ThinkBlock component's expanded state handling  [@qixian]

## v2.28.4

Other:
  - ✅ update ThinkBlock tests to use container for text content assertions  [@qixian]
  - 🛠 enhance CodeRenderer and ThinkBlock components for improved prop handling  [@qixian]
  - 🛠 update ThinkBlock component to improve expanded state handling  [@qixian]

## v2.28.3

Other:
  - 🛠 enhance ThinkBlock component with context support  [@qixian]

## v2.28.2

Other:
  - 🛠 enhance MarkdownEditor with new CommentLeaf and FncLeaf components  [@qixian]

## v2.28.1

Other:
  - 🛠 enhance ThinkBlock component state management  [@qixian]
  - 🛠 clean up SimpleTable component and improve chart animation duration  [@qixian]
  - 🛠 remove unnecessary useRef and useEffect hooks from multiple components  [@qixian]

## v2.28.0

Other:
  - 🆕 增加调试信息记录功能  [@qixian]

## v2.27.10

Other:
  - 🐞 移除 AIBubble 组件中的 Loader 组件  [@qixian]
  - 🐞 调整 ThinkBlock 组件的 marginTop 样式，从 16px 修改为 8px  [@qixian]
  - 🐞 AgenticLayout & ChatLayout [#218](https://github.com/ant-design/agentic-ui/pull/218) [@bigang.ybg]

## v2.27.9

Other:
  - 🐞 修复 ThinkBlock 组件中的消息上下文获取逻辑，确保正确判断加载状态  [@qixian]
  - 📄 Refactor event handlers in various components to simplify function definitions and improve readability  [@qixian]

## v2.27.8

Other:
  - 🐞 修复 Bubble 组件初始内容获取逻辑，简化为仅使用 originData.content  [@qixian]

## v2.27.7

Other:
  - 🆕 添加调试工具函数 debugInfo，用于输出调试信息  [@qixian]
  - ✅ enhance linkConfig tests for Image and Media components, adding error handling and async behavior  [@陈帅]
  - 🛠 clean up Image component and modularize Mermaid plugin  [@陈帅]
  - 🆕 add MediaErrorLink component for handling media load failures  [@陈帅]
  - ✅ enhance linkConfig tests for Image and Media components, adding error handling and async behavior  [@陈帅]

## v2.27.6

Other:
  - 🐞 adjust content retrieval order in Bubble component  [@qixian]

