---
nav:
  title: 项目研发
  order: 3
group:
  title: 开发指南
  order: 2
---

# Changelog

## v2.33.0

- MarkdownEditor / Plugins.chart
  - 🆕 新增 `chartType: "docCards"` 支持「Markdown 表格 → 卡片栅格」展示，与现有图表共用同一套「HTML 注释 + GFM 表格」数据契约。表头按 `名称`/`标题`、`地址`/`链接`/`URL`、`简介`/`描述`、`亮点`/`标签` 别名解析为 `title` / `url` / `description` / `tags`，支持「逻辑名 + 中英文括号单位」的宽松匹配；`cardColumns` 控制每行卡片数（取值 `1`~`4`，默认 `2`，超出自动 clamp），`fieldMap` 可显式覆盖字段映射。
  - 🐞 **安全**：`isSafeHref` 显式拒绝 protocol-relative URL（`//evil.com`）。原实现以 `startsWith('/')` 放行站内绝对路径时会同时放行 `//host`，等价于绕过协议白名单。
  - 🛠 **包体积**：抽出 `src/Utils/columnMatching.ts` 零依赖共享模块，承载 `columnKeyMatchesConfiguredField` / `resolveChartAxisFieldToColumnKey` / `DOC_CARDS_FIELD_ALIASES` / `resolveDocCardsFields` 等纯字符串工具。`DocCards/utils.ts` 不再 import `parseTable`，消费侧 `import { DocCards }` 不再被传递性带入完整 markdown 解析栈（remark / rehype / sanitize / katex 等）。`parseTable.ts` 与 `DocCards/utils.ts` 仍 re-export 原符号保持向后兼容。
  - 💄 站内链接（`/foo`、`./foo`、`../foo`、`#anchor`）不再强制 `target="_blank"`，避免锚点跳转开新 tab；外部链接（http(s)/mailto/tel）仍开新 tab 并带 `rel="noopener noreferrer"`。
  - 🌐 标签胶囊容器 `aria-label` 改为 `docCardsTags`（中文「标签列表」/英文「Tags」）专用 i18n 键，原先用 `docCards` 会被屏幕阅读器误读为「卡片列表」。
  - 🆕 `@ant-design/agentic-ui` 主入口同步导出 `DocCards` 组件与 `resolveDocCardsFields` / `splitDocCardsTags` / `isDocCardsSafeHref` / `formatDocCardsDisplayUrl` / `DocCardsDefaultFieldAliases` 等工具，方便消费侧复用。
  - 💄 卡片链接展示 hostname + path（`https://tailwindcss.com/docs` → `tailwindcss.com/docs`），`href` 与 `title` attribute 仍是原始 URL；超长 URL 单行省略。
  - 💄 移动端适配：`< 480px` viewport 强制单列；卡片 `:hover` 用 `@media (hover: hover)` 包裹避免 first-tap 残留；链接最小触摸高度 24px（WCAG 2.5.5 AA）；标签胶囊用 padding 而非固定 height，避免在手机端被压扁。
  - ⚡️ `gridTemplateColumns` 用 `useMemo` 缓存；header 节点抽到 `useMemo`；`cardColumns` 走 `repeat(N, minmax(0, 1fr))` 精确控制最多 N 列，避免 `auto-fit` 在宽容器塞超过用户期望的列数。
  - 🛠 `parseTable`：`docCards` 在解析阶段做主标题列校验，命中失败整表降级为普通 Markdown 表格，避免输出空白卡片栅格；不影响其它 `chartType` 行为。

- 🐞 修复 React Hooks 依赖项导致的死循环与过度渲染问题
  - SchemaRenderer：`schema || {}` 每次渲染产生新引用导致 `useMemo([safeSchema])` 失效，改用模块级常量 `EMPTY_SCHEMA`
  - SchemaForm：`schema?.component || {}` 每次渲染产生新引用导致 `useMemo([properties])` 失效，改用模块级常量 `EMPTY_COMPONENT`
  - ButtonTabGroup：默认参数 `items = []` 导致 `useEffect([items])` 每次渲染触发，改用模块级常量 `EMPTY_ITEMS`
  - useChartDataFilter：`Array.isArray(data) ? data : []` 导致 `useMemo([safeData])` 失效，改用模块级常量 `EMPTY_DATA`
  - TagPopup：`props || {}` 解构出的 `items` 引用不稳定，移除多余的 `|| {}` 回退
  - I18n：`antdContext?.locale`（对象引用）作为依赖导致 effect 过度触发，改为 `antdContext?.locale?.locale`（字符串）
  - AgenticLayout：`currentRightWidth` 同时作为依赖和 `setCurrentRightWidth` 的目标导致 resize listener 反复重建，改用 ref 持有
  - BaseMarkdownEditorSlate：`isEditorFocused` 同时作为依赖和 setter 目标导致 mousedown listener 反复重建，改用 ref + `useRefFunction`
  - Workspace：受控模式下 `setInternalActiveTab` 无条件执行导致 effect 二次触发，增加 `currentKey !== internalActiveTab` 守卫
  - ActionItemContainer：`props.children` 作为依赖导致 effect 每次父渲染都触发，改用 `useMemo` 提取 `childrenKeys`
  - keyboard：空依赖 `[]` 但使用了 `props.readonly`/`store`/`keydown`，补全依赖
  - ThoughtChainList/MarkdownEditor：`useEffect` 缺少 `props.plugins` 和 `props.initValue` 依赖，补全
  - AceEditorWrapper：`onChange` 闭包捕获初始值导致后续变化不生效，改用 `onChangeRef` 模式
  - BubbleExtra：`useEffect` 缺少 `props.onRenderExtraNull` 依赖，补全
  - FileComponent：`useEffect` 缺少 `previewFile` 依赖，补全
  - Editor：`ref.current` 作为依赖不可靠，移除并加 eslint-disable 注释
  - useAutoScroll：无依赖 `useEffect` 同步 ref 改为 `useLayoutEffect`
- 🛠 SchemaRenderer / SchemaForm：`EMPTY_COMPONENT` 补充 `ComponentConfig` 类型标注
- 🛠 BaseMarkdownEditorSlate：`setEditorFocused` 由 `useCallback` 改为 `useRefFunction`，移除多余的 `isEditorFocused` state
- 📖 开发指南新增「React Hooks 依赖陷阱」章节，记录 7 类常见模式及修复方案

## v2.32.0

- MarkdownInputField
  - 💥 **Breaking change**：`actionsRender` / `toolsRender` / `quickActionRender` / `beforeToolsRender` 入参类型由「上帝接口」`MarkdownInputFieldProps & MarkdownInputFieldProps['attachment'] & {...}` 收敛为稳定派生类型 `SlotRenderState`（`actionsRender` 用 `ActionsSlotState` 含 `collapseSendActions`）。新入参字段：`value` / `isHover` / `isLoading` / `fileMap` / `onFileMapChange` / `fileUploadStatus` / `fileUploadSummary` / `attachment` / `disabled` / `typing`。**迁移**：将 `props.upload` 等附件字段访问改为 `state.attachment?.upload`；其他字段改名 `props` → `state` 即可。
  - 🛠 `MarkdownInputFieldProps['attachment']` 由内联结构 `{ enable?: boolean } & AttachmentButtonProps` 改为命名类型 `AttachmentConfig`，行为完全等价。
  - 🆕 新增对外类型导出：`SlotRenderState`、`ActionsSlotState`，便于在自定义 slot 实现中获得类型提示。

## v2.31.5

- 🛠 将部分导出类型从值导出改为类型导出，优化打包体积。
- 🛠 移除未使用的 locale key 和修复 lint 错误。
- ✅ 移除测试中不再使用的动画 mock 文件。
- 🛠 清理 MarkdownEditor 工具函数并优化导入路径。

## v2.31.4

- 🐞 修正任务进行中状态的文本显示逻辑。
- ⚡️ 优化 tree-shaking — 消除反向 barrel 引用、具名导出第三方 SDK、补充 sideEffects。
- 🐞 修复暗色主题下代码块的样式问题。
- 🛠 移除已废弃的 theme 国际化 key（代码块主题切换按钮已移除）。

## v2.31.3

- ✅ 添加 rehypeSanitizeUserHtml 插件的单元测试。
- 🛠 代码块主题跟随全局主题，移除独立月亮图标切换。
- 🐞 添加 rehypeSanitizeUserHtml 插件，过滤用户输入中的危险 HTML 防止页面布局错乱。
- 🛠 将硬编码颜色值替换为 CSS 变量。

## v2.31.2

- ⚡️ 减包体与首屏 - Lottie 直引、只读 markdown 拆组件、Renderer 懒加载。

## v2.31.1

- 🛠 使用 token 变量替换硬编码颜色值以支持主题切换。

## v2.31.0

- 📖 添加 MarkdownInputField 组件 demo。
- 📖 添加 Loading 组件 demo。
- 💄 为 Loading 组件添加暗色主题支持。
- 🛠 移除 prepublishOnly 中的 test 步骤。
- 💄 合并下载和复制按钮样式，使用统一样式。
- 💄 为表格和图表工具栏复制按钮添加暗色主题支持。

## v2.30.35

- 🛠 修复 eqeqeq 规则错误和未使用的 import。
- 🐞 修复 FileTree 和 FilePreview 组件的多个问题。
- 🛠 移除 Paragraph 中的 MutationObserver，改用 composition 事件监听。
- 🐞 修复动线生成动画的多个问题。
- ⚡️ 优化 useDetectTheme 为单例模式，避免重复 MutationObserver。
- 🐞 图表组件支持 html[data-theme="dark"] 自动切换暗色主题。
- ✅ 将 Robot 组件测试改为异步并添加 Lottie 加载等待逻辑。

## v2.30.33

- 🆕 为 ChartContainer 添加自动主题检测功能。
- ✅ 修复 onLoadChildren 重试用例的异步时序。
- 🆕 添加 ThreeThinkingLottie 按需加载动画组件并移除用户消息多余间距。

## v2.30.32

- 🆕 为多个组件添加 data-testid 属性以支持自动化测试。
- 🛠 调整 BubbleList 代码格式与缩进。

## v2.30.31

- 🐞 移除 MarkdownEditor 内容区 margin 变量覆盖。[#513](https://github.com/ant-design/agentic-ui/pull/513)
- 🐞 无 onClick 时不再阻止 ActionIconBox 事件冒泡。
- 🆕 为 Workspace 添加 FileTree 组件，支持懒加载子节点。[#510](https://github.com/ant-design/agentic-ui/pull/510)
- 🐞 修复 Bubble useMemo/useEffect 依赖缺失与性能问题。
- 🐞 提升 ToolUseBarThink light 变体在 success 后的样式优先级。[#511](https://github.com/ant-design/agentic-ui/pull/511)
- 💄 优化 TaskList 缓动曲线，demo 改为自动循环播放。
- 💄 降低 TaskList simple 模式 demo 动效速度。
- 💄 TaskList simple 模式 demo 支持动态变化演示。
- 💄 移除 TaskList progress 元素，文字变化时添加模糊渐入动效。
- 💄 TaskList Simple 模式展开收起添加 CSS 过渡动画。
- 🐞 TaskList Simple 模式去背景色、始终显示最后任务、清理冗余。
- 🐞 修复 MarkdownInputField 发送按钮按主题实色保障对比度。[#509](https://github.com/ant-design/agentic-ui/pull/509)
- ⚡️ 移除 ToolUseBarThink framer-motion，全 CSS 动画 + 性能优化。
- 🐞 修复 MarkdownInputField tools 栏固定高度与内边距冲突导致的纵向错位。[#508](https://github.com/ant-design/agentic-ui/pull/508)
- 🆕 支持 thinking 标签作为思考块的别名。
- ⚡️ 流式渲染性能与正确性全面改进。
- 🛠 移除文件中的 BOM 字符。

## v2.30.30

- 🛠 抽取 MarkdownEditor 样式清理函数并支持自定义属性。
- 📖 更新 bubble 示例为文件理解场景。

## v2.30.29

- 🛠 无重大变更。

## v2.30.28

- 🛠 无重大变更。

## v2.30.27

- 🐞 修正 Bubble 代码块选择器并改进 SendButton 无障碍。[#507](https://github.com/ant-design/agentic-ui/pull/507)
- 🐞 流式 JSON 代码块避免 Ace 反复 setValue 闪动。[#504](https://github.com/ant-design/agentic-ui/pull/504)
- 💄 内置 Agentic UI 业务层 CSS 覆盖。[#506](https://github.com/ant-design/agentic-ui/pull/506)
- 🐞 规范化 redacted_thinking 别名使嵌套 JSON 保持在思考块内。[#505](https://github.com/ant-design/agentic-ui/pull/505)
- 🐞 附件列表文件大小与错误文案单行省略显示。[#503](https://github.com/ant-design/agentic-ui/pull/503)
- ⚡️ 减少 ThoughtChainList 流式更新时深度思考相关重渲染。[#501](https://github.com/ant-design/agentic-ui/pull/501)
- ✅ 默认套件排除大体积目录，用例约 5000 条。[#500](https://github.com/ant-design/agentic-ui/pull/500)
- ✅ 减少 ace 和 elements 测试中的重复 mocks。[#498](https://github.com/ant-design/agentic-ui/pull/498)
- 🐞 图表 x/y 与表头带单位列名宽松匹配并补充 RFC。[#499](https://github.com/ant-design/agentic-ui/pull/499)

## v2.30.26

- 🐞 修复 MarkdownEditor IME 与根级双空段、initSchema 同步问题。

## v2.30.25

- 🐞 改进加载指示器并增强 Markdown 渲染。
- 🆕 增强 Bubble Markdown 渲染，支持稳定的 fncProps 和缓存改进。
- 🐞 懒加载行避免 display:contents 导致 LazyElement 永不显示。[#494](https://github.com/ant-design/agentic-ui/pull/494)
- 🐞 段落可见性依据 Slate 子节点而非 React children。[#493](https://github.com/ant-design/agentic-ui/pull/493)
- 🛠 移除 todo.md 文件。
- 🐞 停止修改 list items 使流式更新不重新渲染所有气泡。[#492](https://github.com/ant-design/agentic-ui/pull/492)
- 🐞 修正 Mermaid SVG 尺寸与适配画布缩放冲突导致图表过小。[#487](https://github.com/ant-design/agentic-ui/pull/487)
- 🛠 移除 todo.md 并更新 clean-code 规则不再要求该文件。[#491](https://github.com/ant-design/agentic-ui/pull/491)
- 🐞 空 initValue 不再重复追加段落以恢复占位符。[#490](https://github.com/ant-design/agentic-ui/pull/490)
- 📖 rerender 演示支持左侧 Markdown 手动编辑。[#488](https://github.com/ant-design/agentic-ui/pull/488)
- 📖 优化 MarkdownInputField demos。[#486](https://github.com/ant-design/agentic-ui/pull/486)
- 📖 格式化组件文档中的 Props 表格。
- 🐞 修复 MarkdownEditor 稀疏 children 导致 Slate renderLeaf 读取 undefined。[#485](https://github.com/ant-design/agentic-ui/pull/485)
- 🛠 移除文档 BOM 头并优化 MarkdownInputField 导入顺序。

## v2.30.24

- 🐞 修复 MarkdownEditor 空 markdown 内容处理及 Node 方法安全调用。
- 🐞 增强 MarkdownEditor sanitize normalizer 对抗无效 Slate trees。[#484](https://github.com/ant-design/agentic-ui/pull/484)

## v2.30.23

- 🐞 规范化时剔除 MarkdownEditor 非法子节点避免 Node.string 崩溃。[#483](https://github.com/ant-design/agentic-ui/pull/483)

## v2.30.22

- 🛠 恢复 demo 检查与报告脚本。[#482](https://github.com/ant-design/agentic-ui/pull/482)
- 📖 优化 MarkdownInputField 文档 Demo 布局并修复示例问题。
- 🆕 支持 Bubble OpenAI/OpenClaw/Ollama 消息格式适配器。[#481](https://github.com/ant-design/agentic-ui/pull/481)
- 🐞 修复 MarkdownEditor 空段落退格误触全选清空。[#479](https://github.com/ant-design/agentic-ui/pull/479)
- 🐞 流式段落动画默认开启与 E2E/单测稳定化。[#478](https://github.com/ant-design/agentic-ui/pull/478)
- 🐞 流式文本更新结束时 ChatLayout 自动滚动到底部。[#480](https://github.com/ant-design/agentic-ui/pull/480)
- 🐞 修复 MarkdownRenderer 流动画失效并新增流式闪烁光标。[#477](https://github.com/ant-design/agentic-ui/pull/477)
- ✅ 添加 MarkdownEditor 过期选区处理回归用例。[#476](https://github.com/ant-design/agentic-ui/pull/476)
- ✅ 补充 MarkdownEditor 无效选区路径回归用例。[#475](https://github.com/ant-design/agentic-ui/pull/475)
- ✅ 添加 Mermaid 工具栏交互回归用例。[#471](https://github.com/ant-design/agentic-ui/pull/471)
- 🛠 Slate.js 规范化使用改进 (P0-P3 全部修复 + 覆盖率达标)。[#474](https://github.com/ant-design/agentic-ui/pull/474)
- 🐞 修复 MarkdownEditor isElement 崩溃读取 undefined.children。[#472](https://github.com/ant-design/agentic-ui/pull/472)
- 🆕 SendButton 文件上传中禁用发送按钮，支持 sendButtonProps.disabled 外部控制。[#470](https://github.com/ant-design/agentic-ui/pull/470)
- ✅ 添加 attachment preview 透传回归用例。[#467](https://github.com/ant-design/agentic-ui/pull/467)
- ✅ 补充 MarkdownInputField attachment onPreview 透传与容错回归用例。[#468](https://github.com/ant-design/agentic-ui/pull/468)
- ✅ 补充 AttachmentFileListItem 重试的单测。[#465](https://github.com/ant-design/agentic-ui/pull/465)
- 🐞 修复不规范 Demo 代码的 Lint 错误。[#466](https://github.com/ant-design/agentic-ui/pull/466)

## v2.30.22

- Workspace
  - 📖 补充 `Workspace.FileTree` 懒加载文件树文档演示 `workspace-file-tree-demo`。
  - 🐞 `FileTree`：空目录或加载失败时不再将目录误标为叶子；`onLoadChildren` 失败时 `Promise` 正确 reject 以符合 rc-tree 重试；`toDataNode` 对未传 `isLeaf` 的节点按「无子项则文件」处理；`resetKey` 不再清空已懒加载状态。
  - 🛠 `FileTreeProps` 懒加载回调命名为 `onLoadChildren`，与事件回调 `on` 前缀规范一致。
  - 🛠 `resetKey` 仅注入**当前激活**的 `Workspace.File` / `Workspace.FileTree` 子项，非激活页不再随切换递增，减少隐藏面板的无效更新。
  - ⚡️ 标签栏构建时预计算 Segmented 选项、首个 `Realtime` 索引，避免 O(n²) 的 `findIndex` 重复扫描。
  - 🛠 `FileTree` 中 `onLoadChildren` 经 `useRefFunction` 归一，减轻 Tree `loadData` 对回调引用变化的敏感抖动。
  - 🛠 新增导出类型 `WorkspacePanelType`；`TabItem.componentType` 收窄为该联合类型（文档补充 `TabItem` 说明）。
- MarkdownRenderer
  - 🐞 修复流式 Markdown 未传 `streamingParagraphAnimation` 时段落不应用淡入动画的问题；未传时默认开启，仅 `streamingParagraphAnimation: false` 关闭。[#478](https://github.com/antdigital-ai/agentic-ui/pull/478)
- MarkdownEditor
  - 🛠 `streamingParagraphAnimation` 与 MarkdownRenderer 语义对齐（默认开启，显式 `false` 关闭）。[#478](https://github.com/antdigital-ai/agentic-ui/pull/478)
- Bubble
  - 📖 文档与流式演示补充 `markdownRenderConfig.streamingParagraphAnimation: false` 迁移示例（与旧版「未传即无段落动画」行为一致）。[#478](https://github.com/antdigital-ai/agentic-ui/pull/478)
  - 🆕 新增 `useOpenAIMessageBubbleData` Hook 与 `mapOpenAIMessagesToMessageBubbleData`，支持将 OpenAI Chat Completions 风格的 `messages` 转为 `MessageBubbleData[]`，便于接入 `BubbleList` 与 SSE 流式内容。
  - 🆕 新增 `useOpenClawMessageBubbleData`、`mapOpenClawMessagesToMessageBubbleData` 与 `normalizeOpenClawMessagesToOpenAI`，支持 OpenClaw 会话 / transcript 风格（`timestamp`、`toolResult` 等）。
  - 🆕 新增 `useOllamaMessageBubbleData`、`mapOllamaMessagesToMessageBubbleData` 与 `normalizeOllamaMessagesToOpenAI`，支持 Ollama `/api/chat` 的 `messages`（`images`、`tool_calls`、`thinking` 等）。

## v2.30.15

- MarkdownInputField
  - 🆕 新增 `onUploadError` 回调及 `removeFileOnUploadError` 配置，支持自定义上传失败处理逻辑。[#434](https://github.com/ant-design/agentic-ui/pull/434)
  - 🆕 支持文件大小拦截与上传错误处理。[#437](https://github.com/ant-design/agentic-ui/pull/437)
  - 🆕 点击编辑框任意区域自动聚焦编辑器。[#435](https://github.com/ant-design/agentic-ui/pull/435)
  - 🐞 统一 attachment 文件大小配置，删除 `SupportedFormat.maxSize` 字段。[#429](https://github.com/ant-design/agentic-ui/pull/429)
- 🐞 修复 `data-is-unclosed` 属性与 CSS 选择器逻辑。[#438](https://github.com/ant-design/agentic-ui/pull/438)

## v2.30.14

- Bubble
  - 🆕 将 markdown filemap 图片提取到气泡框外渲染。[#430](https://github.com/ant-design/agentic-ui/pull/430)
- MarkdownInputField
  - 🐞 修复代码块在 MarkdownInputField 中无法编辑的问题。[#425](https://github.com/ant-design/agentic-ui/pull/425)
  - 💄 代码块默认高度设为 120px。[#428](https://github.com/ant-design/agentic-ui/pull/428)
  - 🐞 修复 attachment 占位符拉伸全宽的问题。[#427](https://github.com/ant-design/agentic-ui/pull/427)
- Workspace / Browser
  - 🐞 修复定位和链接点击时触发页面跳转的问题。[#431](https://github.com/ant-design/agentic-ui/pull/431)
- DonutChart
  - 🐞 修复饼图/环形图图例颜色与扇区颜色不一致的问题。[#432](https://github.com/ant-design/agentic-ui/pull/432)
- Plugins / CodeBlock
  - 💄 代码块字号从 0.8em 调整为 1em，提升可读性。
- Parser
  - 🆕 支持 `::warning` 双冒号容器指令语法。[#426](https://github.com/ant-design/agentic-ui/pull/426)

## v2.30.13

- FileMapView
  - 🆕 图片/视频支持 `onPreview` 拦截与 `itemRender` 自定义渲染，通过 `markdownRenderConfig.fileMapConfig` 透传。[#423](https://github.com/ant-design/agentic-ui/pull/423)
- FileMapConfig
  - 🆕 新增 `normalizeFile` 回调，支持自定义文件数据格式转换。[#424](https://github.com/ant-design/agentic-ui/pull/424)
- MarkdownInputField
  - 🆕 新增 `onExceedMaxCount` 回调，文件数量超限时以 error 状态展示。[#419](https://github.com/ant-design/agentic-ui/pull/419)
- MarkdownRenderer
  - 🐞 修复流式渲染时代码块抖动（销毁重建）问题。[#422](https://github.com/ant-design/agentic-ui/pull/422)
- Chart / Histogram
  - 🐞 修复科学记数法解析及支持预分箱数据。[#421](https://github.com/ant-design/agentic-ui/pull/421)
- Chart / ScatterChart
  - 🐞 坐标轴范围改为从数据自动计算，支持手动传入 `xMin`/`xMax`/`yMin`/`yMax`。[#420](https://github.com/ant-design/agentic-ui/pull/420)
- 🐞 修复 E2E 全量失败（`usePrefersColor` 崩溃）及 `toBeInTheDocument` TS 类型报错。[#417](https://github.com/ant-design/agentic-ui/pull/417)

## v2.30.12

- MarkdownEditor / Plugins / CodeBlock
  - 🆕 代码块工具栏新增「本地预览」按钮：`html` 与 `markdown` 语言的代码块可点击按钮在新标签页打开本地预览。HTML 代码直接以 Blob URL 渲染（允许执行 JavaScript），Markdown 代码先转换为 HTML 再打开。
- MarkdownEditor
  - 🆕 新增 `agentic-ui-filemap` 围栏代码块，渲染为文件列表。[#416](https://github.com/ant-design/agentic-ui/pull/416)
- History
  - 🆕 分组项目少于 3 个时不展示分组标题，仍平铺显示条目。[#411](https://github.com/ant-design/agentic-ui/pull/411)
- Bubble
  - 🐞 修复文档站暗色主题和用户气泡样式可见性问题。[#413](https://github.com/ant-design/agentic-ui/pull/413)
- 🐞 修复消息列表差一点点无法贴底的问题（`useAutoScroll`）。[#409](https://github.com/ant-design/agentic-ui/pull/409)
- 🐞 聊天加载状态增加顶部外边距。[#410](https://github.com/ant-design/agentic-ui/pull/410)

## v2.30.11

- MarkdownRenderer
  - 🆕 支持 `eleRender` 自定义元素渲染（markdown 渲染模式）。[#405](https://github.com/ant-design/agentic-ui/pull/405)
- MarkdownInputField
  - 🐞 修复移动端输入时占位符不消失的兼容性问题。[#401](https://github.com/ant-design/agentic-ui/pull/401)
- Workspace
  - 🐞 文件项空详情隐藏，Browser 链接支持 `onOpen` 回调。[#406](https://github.com/ant-design/agentic-ui/pull/406)
  - 🛠 使用 `token.antCls` 替换样式文件中写死的 `ant-` 类名前缀。[#404](https://github.com/ant-design/agentic-ui/pull/404)
- 🐞 提供 CSS 变量默认值，自动加载根样式。[#403](https://github.com/ant-design/agentic-ui/pull/403)
- 🐞 修复表格流式渲染，等待首行完整后再开始渲染。[#400](https://github.com/ant-design/agentic-ui/pull/400)

## v2.30.10

- Mermaid
  - 🐞 仅在代码块闭合时渲染 Mermaid 图表。[#399](https://github.com/ant-design/agentic-ui/pull/399)
- 💄 调整表格默认列宽从 120px 至 40px。

## v2.30.9

- MarkdownEditor
  - 🛠 简化 directive 处理逻辑，移除未使用的 subpath 类型。

## v2.30.8

- FileMapView
  - 🐞 无 `size` 或为 0 时不展示文件大小。[#393](https://github.com/ant-design/agentic-ui/pull/393) [#394](https://github.com/ant-design/agentic-ui/pull/394)
- MarkdownEditor
  - 🐞 `blockquote` 改用块级布局替代 flex。[#396](https://github.com/ant-design/agentic-ui/pull/396)
- Parser
  - 🆕 仅支持 `:::` 容器指令语法，忽略行内 `:foo` 形式。[#395](https://github.com/ant-design/agentic-ui/pull/395)

## v2.30.7

- 📖 新增 Bubble 流式 Markdown 演示页面。

## v2.30.6

- MarkdownRenderer
  - 🆕 增强流式渲染功能，支持末段淡入动画与字符队列配置。

## v2.30.5

- MarkdownRenderer
  - 🐞 优化流式消息的 key 稳定性与动画逻辑。

## v2.30.4

- MarkdownRenderer
  - 🆕 流式渲染仅对末尾 50 字做动画，新增 `animateTailChars` 配置。

## v2.30.3

- Chart
  - 🆕 新增箱线图（BoxPlot）和直方图（Histogram）组件。
  - 🆕 原子图表支持暗黑主题。[#390](https://github.com/ant-design/agentic-ui/pull/390)
  - 🆕 图表组件改为 `forwardRef` 导出，支持引用传递。
  - 🆕 Markdown 表格支持一键复制功能。
- MarkdownRenderer
  - 🆕 优化流式场景下的块内容稳定性，避免重复卸载和挂载。

## v2.30.2

- Chart
  - 🆕 支持解析亿元/万元/元等中文货币字符串。[#388](https://github.com/ant-design/agentic-ui/pull/388)
- MarkdownEditor
  - 🐞 修复时间冒号在围栏代码块内被转义的问题。[#383](https://github.com/ant-design/agentic-ui/pull/383)
  - 💄 `ToolBarItem` 仅在存在 `title` 时渲染 Tooltip，缓解 `findDOMNode` 弃用警告。
- SchemaEditor
  - 🐞 恢复复制空内容提示与成功/失败反馈。

## v2.30.1

- MarkdownEditor
  - 🛠 重构可编辑表格实现，优化列宽计算、行列命令与单元格选区。[#376](https://github.com/ant-design/agentic-ui/pull/376)
  - 🆕 支持 `agentic-ui-task` 与 `agentic-ui-toolusebar` 围栏代码块，分别渲染为 TaskList 与 ToolUseBar；旧标识 `agentic-ui-usertoolbar` 仍可读入并规范为新标识。[#378](https://github.com/ant-design/agentic-ui/pull/378) [#380](https://github.com/ant-design/agentic-ui/pull/380)
  - 💄 `agentic-ui-task` 嵌入块默认 `variant` 为 `simple`；需完整任务链样式时在 JSON 根级将 `variant` 设为 `default`。
  - 🆕 只读模式下 `renderMode` / `renderType` 为 `markdown` 时走 MarkdownRenderer；`markdownRenderConfig` 支持 `renderType` 别名。
  - 🐞 修复 Chart 在 Slate 占位层下画布不可见的问题。[#381](https://github.com/ant-design/agentic-ui/pull/381)
- MarkdownRenderer
  - 🆕 流式场景下使用 Markdown Renderer 替代 Slate 渲染。[#369](https://github.com/ant-design/agentic-ui/pull/369)
  - 💄 流式文字淡入动画增加 blur 过渡。
- Bubble
  - 🛠 思考中状态改为轻量 DOM 结构，仅保留 dots 动效。[#377](https://github.com/ant-design/agentic-ui/pull/377)
  - 🐞 修复 `extraShowOnHover` 未传入时默认值为 `true` 的处理逻辑。
- BubbleMessageDisplay
  - 🐞 修复 `EXCEPTION` 状态下空、`undefined` 或 `null` 内容的展示逻辑。[#376](https://github.com/ant-design/agentic-ui/pull/376)
- MarkdownInputField
  - 🌐 优化文件上传相关文案的清晰度。
- 📖 移除 `rfc-streaming-markdown-renderer.md` 文档。[#370](https://github.com/ant-design/agentic-ui/pull/370)
- ✅ 补充 agentic-ui 嵌入与思考 DOM 演示快照，并更新相关演示快照。
- 🛠 修复测试与 Chart 错误日志。

## v2.29.60

- MarkdownRenderer
  - 🆕 流式场景下使用 Markdown Renderer 替代 Slate 渲染（预发布，正式发布于 v2.30.1）。[#369](https://github.com/ant-design/agentic-ui/pull/369)
- 🛠 修复测试与 Chart 错误日志。

## v2.29.58

- Bubble
  - 💄 `extra` 在 Popover 模式下移除 padding。[#367](https://github.com/ant-design/agentic-ui/pull/367)
- MarkdownPreview
  - 🛠 优化代码格式与错误处理。
- FileUploadManager
  - 🛠 优化错误处理逻辑。
- ✅ 补充 Markdown directive 与 parseTable 回归测试覆盖率。[#366](https://github.com/ant-design/agentic-ui/pull/366)

## v2.29.57

- MarkdownEditor
  - 🐞 修复 `textDirective` 渲染失败，支持语雀文档。[#365](https://github.com/ant-design/agentic-ui/pull/365)
- 🛠 优化 `myRemark.stringify` 错误处理，提升健壮性。
- 🐞 修复 TypeScript 类型错误。
- 🐞 更新 card-selection-demo 快照，修复段落元素的结构和属性。

## v2.29.56

- MarkdownEditor
  - 🐞 为 remark-rehype 添加 `textDirective`/`leafDirective` 处理器，修复 unknown node 错误。[#364](https://github.com/ant-design/agentic-ui/pull/364)
- Bubble
  - 🆕 新增 `extraShowOnHover` 配置，默认关闭，开启后 `extra` 仅在 hover 时展示。
  - 💄 `extra` 改为 hover 时展示，不再常驻显示。[#362](https://github.com/ant-design/agentic-ui/pull/362)
- 🛠 移除所有 message 提示调用。[#363](https://github.com/ant-design/agentic-ui/pull/363)
- ✅ 补充 PureBubbleList、AttachmentFileList、AttachmentButtonPopover 回归测试。[#355](https://github.com/ant-design/agentic-ui/pull/355) [#356](https://github.com/ant-design/agentic-ui/pull/356) [#359](https://github.com/ant-design/agentic-ui/pull/359)

## v2.29.55

- MarkdownInputField
  - 🆕 发送按钮支持可发送状态。[#361](https://github.com/ant-design/agentic-ui/pull/361)
- Blockquote
  - 🆕 添加 `data-testid` 属性以支持测试。
  - 🐞 修复 `className` 兼容性问题，将 attributes 转为 `React.HTMLAttributes`。

## v2.29.54

- MarkdownEditor
  - 🆕 支持 markdown-it-container 风格的 `:::` 自定义容器语法（info/warning/success/error/tip 等）。[#360](https://github.com/ant-design/agentic-ui/pull/360)
- MarkdownInputField
  - 🆕 Demo 增加 `data-testid` 属性以支持 E2E 测试。

## v2.29.53

- MarkdownInputField
  - 🆕 新增 E2E 测试 ID 支持并导出 `testIds` 常量。
  - 🆕 文件上传的图片支持 svg 和 webp 格式。[#358](https://github.com/ant-design/agentic-ui/pull/358)
- ChartStatistic
  - 🆕 支持 Semantic 样式与 `subtitle` 展示。
- ToolUseBarThink
  - 🌐 增加国际化支持，容器添加 `flex-direction: column`。[#357](https://github.com/ant-design/agentic-ui/pull/357)
- ✅ 补充 RealtimeFollow、FileMapView、AttachmentFileIcon、BeforeToolContainer、Enlargement 等测试覆盖率。

## v2.29.31

- MarkdownEditor
  - 🐞 修复 `list-item` 下 `Node.leaf` 报错，改用 `Editor.leaf` 解析叶子节点。
  - 🛠 优化 `matchInputToNode` 功能与键盘处理逻辑。
  - 🛠 优化 `classname` 规范与使用。 [#315](https://github.com/ant-design/agentic-ui/pull/315) [@陈帅]

✅ 增强 MarkdownEditor 和 Bubble 组件的测试覆盖率。 [#307](https://github.com/ant-design/agentic-ui/pull/307) [@222]

## v2.29.30

- MarkdownEditor
  - 🛠 使用 `React.memo` 优化 `SlateMarkdownEditor` 渲染性能。
  - 🛠 统一 `classname` 前缀为 `agentic-md-editor-*`。 [#311](https://github.com/ant-design/agentic-ui/pull/311) [@陈帅]

- LinkCard
  - 🛠 按 BEM 规范整理 `class` 命名。 [#312](https://github.com/ant-design/agentic-ui/pull/312) [@陈帅]

- Chart
  - 🛠 优化 ProForm 配置表单类名，使用 `agentic-chart-config-form` 前缀并添加 BEM 结构。 [#313](https://github.com/ant-design/agentic-ui/pull/313) [@陈帅]

- ChartRender
  - 🛠 优化表格与描述列表的 BEM 类名。 [#314](https://github.com/ant-design/agentic-ui/pull/314) [@陈帅]

- AceEditor
  - 🛠 移除 `effect` 中的未使用依赖。

## v2.29.29

- MarkdownEditor
  - 🆕 新增 Jinja 模板能力，支持 `jinja` 配置、`{}` 触发模板面板、语法高亮、`createJinjaPlugin`。 [#309](https://github.com/ant-design/agentic-ui/pull/309) [#310](https://github.com/ant-design/agentic-ui/pull/310) [@陈帅]

## v2.29.28

- Workspace
  - 🆕 支持视频文件预览播放。 [#308](https://github.com/ant-design/agentic-ui/pull/308) [@陈帅]

- SchemaEditorBridgeManager
  - 🆕 增加 `getContentById` 方法以支持内容获取。 [#306](https://github.com/ant-design/agentic-ui/pull/306) [@222]

📚 演示数据与内容更新。 [#305](https://github.com/ant-design/agentic-ui/pull/305) [@陈帅]

## v2.29.27

- Bubble
  - 🛠 重构 locale 处理逻辑，优化国际化支持。 ([e1927ec6](https://github.com/ant-design/agentic-ui/commit/e1927ec6))

📚 补充 changelog v2.29.8-v2.29.26 版本更新记录。 [#303](https://github.com/ant-design/agentic-ui/pull/303) [@陈帅]

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
