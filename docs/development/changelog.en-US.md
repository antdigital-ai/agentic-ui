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
  - 🆕 New `chartType: "docCards"` renders a Markdown table as a card grid (one row → one card), reusing the existing `<!-- {chartType: ...} --> + GFM table` data contract. Header columns are matched by aliases (`名称`/`标题`/`name`/`title`, `地址`/`链接`/`URL`, `简介`/`描述`/`description`, `亮点`/`标签`/`tags`) with the same `logical name + (unit)` loose matching used by chart `x`/`y`. `cardColumns` controls the per-row card count (`1`–`4`, default `2`, values out of range are clamped); `fieldMap` overrides the alias resolution.
  - 🐞 **Security**: `isSafeHref` now explicitly rejects protocol-relative URLs (`//evil.com`). The previous `startsWith('/')` allowance for site-internal absolute paths inadvertently let `//host` through, bypassing the protocol allowlist.
  - 🛠 **Bundle**: Extracted `src/Utils/columnMatching.ts` as a zero-dependency shared module hosting `columnKeyMatchesConfiguredField` / `resolveChartAxisFieldToColumnKey` / `DOC_CARDS_FIELD_ALIASES` / `resolveDocCardsFields`. `DocCards/utils.ts` no longer imports from `parseTable`, so `import { DocCards }` no longer transitively pulls the full Markdown parser stack (remark / rehype / sanitize / katex). `parseTable.ts` and `DocCards/utils.ts` still re-export the same symbols for backward compatibility.
  - 💄 In-page links (`/foo`, `./foo`, `../foo`, `#anchor`) no longer force `target="_blank"`, so anchor jumps stay in the current tab; external links (http(s)/mailto/tel) still open in a new tab with `rel="noopener noreferrer"`.
  - 🌐 The tag pill container `aria-label` now uses a dedicated `docCardsTags` key (English "Tags"); previously it reused `docCards` which read as "Card List" to screen readers.
  - 🆕 The `@ant-design/agentic-ui` entry now exports the `DocCards` component along with `resolveDocCardsFields` / `splitDocCardsTags` / `isDocCardsSafeHref` / `formatDocCardsDisplayUrl` / `DocCardsDefaultFieldAliases` for downstream reuse.
  - 💄 Card links render as `host + path` (e.g. `https://tailwindcss.com/docs` → `tailwindcss.com/docs`); `href` and the `title` tooltip keep the original URL. Overlong URLs are truncated to a single line with ellipsis.
  - 💄 Mobile / touch readiness: viewport `< 480px` is forced to a single column; card `:hover` is wrapped in `@media (hover: hover)` so it no longer "sticks" after first tap on touch devices; link min touch height is 24px (WCAG 2.5.5 AA); tag pills use `padding` instead of a fixed height so they don't get squashed.
  - ⚡️ `gridTemplateColumns` and the header node are memoized; `cardColumns` uses `repeat(N, minmax(0, 1fr))` so the column count strictly matches user intent (instead of `auto-fit` over-packing a wide container).
  - 🛠 `parseTable`: `docCards` now validates that a primary title column is resolvable; if not, the whole table downgrades to a plain Markdown table to avoid rendering an empty card grid. Behavior of other `chartType`s is unchanged.

- 🐞 Fix React Hooks dependency issues causing infinite loops and excessive re-renders
  - SchemaRenderer: `schema || {}` creates a new reference each render, invalidating `useMemo([safeSchema])`. Fixed with module-level constant `EMPTY_SCHEMA`
  - SchemaForm: `schema?.component || {}` creates a new reference each render, invalidating `useMemo([properties])`. Fixed with module-level constant `EMPTY_COMPONENT`
  - ButtonTabGroup: default param `items = []` causes `useEffect([items])` to fire every render. Fixed with module-level constant `EMPTY_ITEMS`
  - useChartDataFilter: `Array.isArray(data) ? data : []` invalidates `useMemo([safeData])`. Fixed with module-level constant `EMPTY_DATA`
  - TagPopup: `props || {}` destructured `items` has unstable reference. Removed unnecessary `|| {}` fallback
  - I18n: `antdContext?.locale` (object reference) as dependency causes excessive effect firing. Changed to `antdContext?.locale?.locale` (string)
  - AgenticLayout: `currentRightWidth` as both dependency and `setCurrentRightWidth` target causes resize listener to rebuild repeatedly. Fixed with ref
  - BaseMarkdownEditorSlate: `isEditorFocused` as both dependency and setter target causes mousedown listener to rebuild repeatedly. Fixed with ref + `useRefFunction`
  - Workspace: uncontrolled `setInternalActiveTab` in else-if branch causes double effect firing. Added `currentKey !== internalActiveTab` guard
  - ActionItemContainer: `props.children` as dependency causes effect to fire on every parent render. Fixed with `useMemo` extracting `childrenKeys`
  - keyboard: empty deps `[]` but uses `props.readonly`/`store`/`keydown`. Added missing dependencies
  - ThoughtChainList/MarkdownEditor: `useEffect` missing `props.plugins` and `props.initValue` dependencies. Added
  - AceEditorWrapper: `onChange` closure captures initial value, later changes ignored. Fixed with `onChangeRef` pattern
  - BubbleExtra: `useEffect` missing `props.onRenderExtraNull` dependency. Added
  - FileComponent: `useEffect` missing `previewFile` dependency. Added
  - Editor: `ref.current` as dependency is unreliable. Removed and added eslint-disable comment
  - useAutoScroll: no-deps `useEffect` for ref sync changed to `useLayoutEffect`
- 🛠 SchemaRenderer / SchemaForm: add `ComponentConfig` type annotation to `EMPTY_COMPONENT`
- 🛠 BaseMarkdownEditorSlate: change `setEditorFocused` from `useCallback` to `useRefFunction`, remove redundant `isEditorFocused` state
- 📖 Add "React Hooks Dependency Pitfalls" section to development guide, documenting 7 common patterns and fixes

## v2.32.0

- MarkdownInputField
  - 💥 **Breaking change**: `actionsRender` / `toolsRender` / `quickActionRender` / `beforeToolsRender` arg type narrowed from the god-object `MarkdownInputFieldProps & MarkdownInputFieldProps['attachment'] & {...}` to the stable derived type `SlotRenderState` (`actionsRender` uses `ActionsSlotState` which adds `collapseSendActions`). New arg fields: `value` / `isHover` / `isLoading` / `fileMap` / `onFileMapChange` / `fileUploadStatus` / `fileUploadSummary` / `attachment` / `disabled` / `typing`. **Migration**: change `props.upload` and other attachment fields to `state.attachment?.upload`; rename `props` to `state` for the rest.
  - 🛠 `MarkdownInputFieldProps['attachment']` switched from the inline shape `{ enable?: boolean } & AttachmentButtonProps` to the named type `AttachmentConfig`. Behaviour is identical.
  - 🆕 New public type exports: `SlotRenderState`, `ActionsSlotState`, for typing custom slot implementations.

## v2.31.5

- 🛠 Change some exported types from value exports to type exports, optimize bundle size.
- 🛠 Remove unused locale keys and fix lint errors.
- ✅ Remove animation mock files no longer used in tests.
- 🛠 Clean up MarkdownEditor utility functions and optimize import paths.

## v2.31.4

- 🐞 Fix text display logic for tasks in progress.
- ⚡️ Optimize tree-shaking — eliminate reverse barrel references, named exports for third-party SDKs, add sideEffects.
- 🐞 Fix code block styles in dark theme.
- 🛠 Remove deprecated theme i18n key (code block theme toggle button removed).

## v2.31.3

- ✅ Add unit tests for rehypeSanitizeUserHtml plugin.
- 🛠 Code block theme follows global theme, remove independent moon icon toggle.
- 🐞 Add rehypeSanitizeUserHtml plugin to filter dangerous HTML from user input and prevent layout issues.
- 🛠 Replace hardcoded color values with CSS variables.

## v2.31.2

- ⚡️ Reduce bundle size and improve first screen — direct Lottie imports, split readonly markdown components, lazy load Renderer.

## v2.31.1

- 🛠 Replace hardcoded color values with token variables to support theme switching.

## v2.31.0

- 📖 Add MarkdownInputField component demo.
- 📖 Add Loading component demo.
- 💄 Add dark theme support for Loading component.
- 🛠 Remove test step from prepublishOnly.
- 💄 Merge download and copy button styles, use unified styles.
- 💄 Add dark theme support for table and chart toolbar copy buttons.

## v2.30.35

- 🛠 Fix eqeqeq rule errors and unused imports.
- 🐞 Fix multiple issues in FileTree and FilePreview components.
- 🛠 Remove MutationObserver from Paragraph, use composition event listener instead.
- 🐞 Fix multiple issues in animation generation.
- ⚡️ Optimize useDetectTheme to singleton mode, avoid duplicate MutationObserver.
- 🐞 Chart components support html[data-theme="dark"] for automatic dark theme switching.
- ✅ Change Robot component tests to async and add Lottie loading wait logic.

## v2.30.33

- 🆕 Add automatic theme detection for ChartContainer.
- ✅ Fix async timing in onLoadChildren retry test cases.
- 🆕 Add ThreeThinkingLottie on-demand loading animation component and remove extra spacing in user messages.

## v2.30.32

- 🆕 Add data-testid attributes to multiple components for automated testing support.
- 🛠 Adjust BubbleList code formatting and indentation.

## v2.30.31

- 🐞 Remove MarkdownEditor content area margin variable override. [#513](https://github.com/ant-design/agentic-ui/pull/513)
- 🐞 ActionIconBox no longer prevents event bubbling when there is no onClick.
- 🆕 Add FileTree component to Workspace with lazy-loaded children support. [#510](https://github.com/ant-design/agentic-ui/pull/510)
- 🐞 Fix Bubble useMemo/useEffect dependency issues and performance problems.
- 🐞 Increase ToolUseBarThink light variant style priority after success. [#511](https://github.com/ant-design/agentic-ui/pull/511)
- 💄 Optimize TaskList easing curves, change demo to auto-loop playback.
- 💄 Reduce TaskList simple mode demo animation speed.
- 💄 TaskList simple mode demo supports dynamic change demonstration.
- 💄 Remove TaskList progress element, add blur fade-in animation when text changes.
- 💄 Add CSS transition animation for TaskList Simple mode expand/collapse.
- 🐞 TaskList Simple mode removes background color, always shows last task, cleans up redundancy.
- 🐞 Fix MarkdownInputField send button solid color by theme to ensure contrast. [#509](https://github.com/ant-design/agentic-ui/pull/509)
- ⚡️ Remove ToolUseBarThink framer-motion, full CSS animations + performance optimization.
- 🐞 Fix MarkdownInputField tools bar fixed height and padding conflict causing vertical misalignment. [#508](https://github.com/ant-design/agentic-ui/pull/508)
- 🆕 Support thinking tag as an alias for think block.
- ⚡️ Comprehensive improvements to streaming rendering performance and correctness.
- 🛠 Remove BOM characters from files.

## v2.30.30

- 🛠 Extract MarkdownEditor style cleanup function and support custom properties.
- 📖 Update bubble examples to file understanding scenarios.

## v2.30.29

- 🛠 No major changes.

## v2.30.28

- 🛠 No major changes.

## v2.30.27

- 🐞 Fix Bubble code block selector and improve SendButton accessibility. [#507](https://github.com/ant-design/agentic-ui/pull/507)
- 🐞 Streaming JSON code blocks avoid Ace repeated setValue flickering. [#504](https://github.com/ant-design/agentic-ui/pull/504)
- 💄 Built-in Agentic UI business layer CSS overrides. [#506](https://github.com/ant-design/agentic-ui/pull/506)
- 🐞 Normalize redacted_thinking alias so nested JSON stays in think block. [#505](https://github.com/ant-design/agentic-ui/pull/505)
- 🐞 Attachment list file size and error text single-line ellipsis display. [#503](https://github.com/ant-design/agentic-ui/pull/503)
- ⚡️ Reduce ThoughtChainList deep thinking related re-renders during streaming updates. [#501](https://github.com/ant-design/agentic-ui/pull/501)
- ✅ Default suite excludes large directories, approximately 5000 test cases. [#500](https://github.com/ant-design/agentic-ui/pull/500)
- ✅ Reduce duplicate mocks in ace and elements tests. [#498](https://github.com/ant-design/agentic-ui/pull/498)
- 🐞 Chart x/y and header with unit column names loose matching and supplement RFC. [#499](https://github.com/ant-design/agentic-ui/pull/499)

## v2.30.26

- 🐞 Fix MarkdownEditor IME and root-level double empty paragraph, initSchema sync issues.

## v2.30.25

- 🐞 Improve loading indicators and enhance Markdown rendering.
- 🆕 Enhance Bubble Markdown rendering with stable fncProps and caching improvements.
- 🐞 Lazy load rows to avoid display:contents causing LazyElement to never display. [#494](https://github.com/ant-design/agentic-ui/pull/494)
- 🐞 Paragraph visibility based on Slate children rather than React children. [#493](https://github.com/ant-design/agentic-ui/pull/493)
- 🛠 Remove todo.md file.
- 🐞 Stop mutating list items so streaming updates do not rerender all bubbles. [#492](https://github.com/ant-design/agentic-ui/pull/492)
- 🐞 Fix Mermaid SVG size and adapt canvas scaling conflict causing charts to be too small. [#487](https://github.com/ant-design/agentic-ui/pull/487)
- 🛠 Remove todo.md and update clean-code rule to no longer require that file. [#491](https://github.com/ant-design/agentic-ui/pull/491)
- 🐞 Empty initValue no longer repeatedly appends paragraphs to restore placeholder. [#490](https://github.com/ant-design/agentic-ui/pull/490)
- 📖 rerender demo supports left-side Markdown manual editing. [#488](https://github.com/ant-design/agentic-ui/pull/488)
- 📖 Optimize MarkdownInputField demos. [#486](https://github.com/ant-design/agentic-ui/pull/486)
- 📖 Format Props tables in component documentation.
- 🐞 Fix MarkdownEditor sparse children causing Slate renderLeaf to read undefined. [#485](https://github.com/ant-design/agentic-ui/pull/485)
- 🛠 Remove document BOM header and optimize MarkdownInputField import order.

## v2.30.24

- 🐞 Fix MarkdownEditor empty markdown content handling and Node method safe calls.
- 🐞 Harden MarkdownEditor sanitize normalizer against invalid Slate trees. [#484](https://github.com/ant-design/agentic-ui/pull/484)

## v2.30.23

- 🐞 Remove illegal children during MarkdownEditor normalization to avoid Node.string crash. [#483](https://github.com/ant-design/agentic-ui/pull/483)

## v2.30.22

- 🛠 Restore demo check and report scripts. [#482](https://github.com/ant-design/agentic-ui/pull/482)
- 📖 Optimize MarkdownInputField documentation Demo layout and fix example issues.
- 🆕 Support Bubble OpenAI/OpenClaw/Ollama message format adapters. [#481](https://github.com/ant-design/agentic-ui/pull/481)
- 🐞 Fix MarkdownEditor empty paragraph backspace accidentally triggering select-all clear. [#479](https://github.com/ant-design/agentic-ui/pull/479)
- 🐞 Streaming paragraph animation enabled by default and E2E/unit test stabilization. [#478](https://github.com/ant-design/agentic-ui/pull/478)
- 🐞 ChatLayout auto-scroll to bottom when streaming text update ends. [#480](https://github.com/ant-design/agentic-ui/pull/480)
- 🐞 Fix MarkdownRenderer animation failure and add streaming blinking cursor. [#477](https://github.com/ant-design/agentic-ui/pull/477)
- ✅ Add MarkdownEditor stale selection handling regression coverage. [#476](https://github.com/ant-design/agentic-ui/pull/476)
- ✅ Add MarkdownEditor invalid selection path regression coverage. [#475](https://github.com/ant-design/agentic-ui/pull/475)
- ✅ Add Mermaid toolbar interaction regression coverage. [#471](https://github.com/ant-design/agentic-ui/pull/471)
- 🛠 Slate.js normalized usage improvements (P0-P3 all fixed + coverage met). [#474](https://github.com/ant-design/agentic-ui/pull/474)
- 🐞 Fix MarkdownEditor isElement crash reading undefined.children. [#472](https://github.com/ant-design/agentic-ui/pull/472)
- 🆕 SendButton disabled during file upload, support sendButtonProps.disabled external control. [#470](https://github.com/ant-design/agentic-ui/pull/470)
- ✅ Add attachment preview passthrough regression coverage. [#467](https://github.com/ant-design/agentic-ui/pull/467)
- ✅ Add MarkdownInputField attachment onPreview passthrough and error handling regression coverage. [#468](https://github.com/ant-design/agentic-ui/pull/468)
- ✅ Add AttachmentFileListItem retry unit tests. [#465](https://github.com/ant-design/agentic-ui/pull/465)
- 🐞 Fix Lint errors in non-compliant Demo code. [#466](https://github.com/ant-design/agentic-ui/pull/466)

## v2.30.22

- Workspace
  - 📖 Add `Workspace.FileTree` lazy file tree doc demo `workspace-file-tree-demo`.
  - 🐞 `FileTree`: empty dirs / failed loads no longer force `isLeaf`; `onLoadChildren` rejection propagates for rc-tree retry; `toDataNode` defaults missing `isLeaf` with no children to a file; `resetKey` no longer wipes lazy-loaded state.
  - 🛠 Rename lazy-load callback on `FileTreeProps` to `onLoadChildren` (aligns with `on` prefix for callbacks).
  - 🛠 `resetKey` is only passed to the **active** `Workspace.File` / `Workspace.FileTree` tab, avoiding redundant updates in hidden panes.
  - ⚡️ Precompute `Segmented` options and the first `Realtime` index in one pass, avoiding repeated O(n) `findIndex` scans in the options reducer.
  - 🛠 Stabilize `onLoadChildren` in `FileTree` via `useRefFunction` to keep Tree `loadData` from churning on parent re-renders.
  - 🛠 Export `WorkspacePanelType` and narrow `TabItem.componentType` to that union; docs add a `TabItem` blurb.
- MarkdownRenderer
  - 🐞 Fix missing paragraph fade-in when `streamingParagraphAnimation` is omitted in streaming markdown mode; default is now on, set `streamingParagraphAnimation: false` to disable. [#478](https://github.com/antdigital-ai/agentic-ui/pull/478)
- MarkdownEditor
  - 🛠 Align `streamingParagraphAnimation` semantics with MarkdownRenderer (on by default, pass `false` to disable). [#478](https://github.com/antdigital-ai/agentic-ui/pull/478)
- Bubble
  - 📖 Docs and streaming demo add `markdownRenderConfig.streamingParagraphAnimation: false` migration example (matches legacy “omit means no paragraph animation”). [#478](https://github.com/antdigital-ai/agentic-ui/pull/478)
  - 🆕 Add `useOpenAIMessageBubbleData` hook and `mapOpenAIMessagesToMessageBubbleData` to convert OpenAI Chat Completions-style `messages` into `MessageBubbleData[]` for `BubbleList` and SSE streaming.
  - 🆕 Add `useOpenClawMessageBubbleData`, `mapOpenClawMessagesToMessageBubbleData`, and `normalizeOpenClawMessagesToOpenAI` for OpenClaw session/transcript-style messages (`timestamp`, `toolResult`, etc.).
  - 🆕 Add `useOllamaMessageBubbleData`, `mapOllamaMessagesToMessageBubbleData`, and `normalizeOllamaMessagesToOpenAI` for Ollama `/api/chat` `messages` (`images`, `tool_calls`, `thinking`, etc.).

## v2.30.15

- MarkdownInputField
  - 🆕 Add `onUploadError` callback and `removeFileOnUploadError` option for custom upload failure handling. [#434](https://github.com/ant-design/agentic-ui/pull/434)
  - 🆕 Support file size interception and attachment upload error handling. [#437](https://github.com/ant-design/agentic-ui/pull/437)
  - 🆕 Clicking anywhere in the input area automatically focuses the editor. [#435](https://github.com/ant-design/agentic-ui/pull/435)
  - 🐞 Unify attachment file size configuration, remove `SupportedFormat.maxSize` field. [#429](https://github.com/ant-design/agentic-ui/pull/429)
- 🐞 Fix `data-is-unclosed` attribute and CSS selector logic. [#438](https://github.com/ant-design/agentic-ui/pull/438)

## v2.30.14

- Bubble
  - 🆕 Extract markdown filemap images to render outside the bubble. [#430](https://github.com/ant-design/agentic-ui/pull/430)
- MarkdownInputField
  - 🐞 Fix code blocks being uneditable inside MarkdownInputField. [#425](https://github.com/ant-design/agentic-ui/pull/425)
  - 💄 Set default code block height to 120px. [#428](https://github.com/ant-design/agentic-ui/pull/428)
  - 🐞 Prevent attachment placeholder from stretching full width. [#427](https://github.com/ant-design/agentic-ui/pull/427)
- Workspace / Browser
  - 🐞 Fix page navigation triggered on location and link clicks. [#431](https://github.com/ant-design/agentic-ui/pull/431)
- DonutChart
  - 🐞 Fix inconsistent legend and sector colors in pie/donut charts. [#432](https://github.com/ant-design/agentic-ui/pull/432)
- Plugins / CodeBlock
  - 💄 Update code block font size from 0.8em to 1em for improved readability.
- Parser
  - 🆕 Support `::warning` double-colon container directive syntax. [#426](https://github.com/ant-design/agentic-ui/pull/426)

## v2.30.13

- FileMapView
  - 🆕 Support `onPreview` interception and `itemRender` custom rendering for images/videos, passed through `markdownRenderConfig.fileMapConfig`. [#423](https://github.com/ant-design/agentic-ui/pull/423)
- FileMapConfig
  - 🆕 Add `normalizeFile` callback for custom file data format conversion. [#424](https://github.com/ant-design/agentic-ui/pull/424)
- MarkdownInputField
  - 🆕 Add `onExceedMaxCount` callback, display files in error state when count exceeds limit. [#419](https://github.com/ant-design/agentic-ui/pull/419)
- MarkdownRenderer
  - 🐞 Fix code block flickering (unmount/remount) during streaming rendering. [#422](https://github.com/ant-design/agentic-ui/pull/422)
- Chart / Histogram
  - 🐞 Fix scientific notation parsing and support pre-binned data. [#421](https://github.com/ant-design/agentic-ui/pull/421)
- Chart / ScatterChart
  - 🐞 Auto-calculate axis range from data; support manual `xMin`/`xMax`/`yMin`/`yMax`. [#420](https://github.com/ant-design/agentic-ui/pull/420)
- 🐞 Fix E2E full failure (`usePrefersColor` crash) and `toBeInTheDocument` TypeScript error. [#417](https://github.com/ant-design/agentic-ui/pull/417)

## v2.30.12

- MarkdownEditor / Plugins / CodeBlock
  - 🆕 Added "Local Preview" button to the code block toolbar: `html` and `markdown` code blocks now have a button to open a local preview in a new tab. HTML code is rendered directly via a Blob URL (JavaScript is allowed to run); Markdown code is converted to HTML first.
- MarkdownEditor
  - 🆕 Add `agentic-ui-filemap` fenced code block, rendered as a file list. [#416](https://github.com/ant-design/agentic-ui/pull/416)
- History
  - 🆕 Do not display group title when group has fewer than 3 items; display items as a flat list instead. [#411](https://github.com/ant-design/agentic-ui/pull/411)
- Bubble
  - 🐞 Fix dark theme and user bubble style visibility issues. [#413](https://github.com/ant-design/agentic-ui/pull/413)
- 🐞 Fix message list not reaching the bottom by a small margin (`useAutoScroll`). [#409](https://github.com/ant-design/agentic-ui/pull/409)
- 🐞 Add top margin for chat loading state. [#410](https://github.com/ant-design/agentic-ui/pull/410)

## v2.30.11

- MarkdownRenderer
  - 🆕 Support `eleRender` for custom element rendering (markdown render mode). [#405](https://github.com/ant-design/agentic-ui/pull/405)
- MarkdownInputField
  - 🐞 Fix placeholder not disappearing on mobile input. [#401](https://github.com/ant-design/agentic-ui/pull/401)
- Workspace
  - 🐞 Hide empty file detail panels; Browser links support `onOpen` callback. [#406](https://github.com/ant-design/agentic-ui/pull/406)
  - 🛠 Replace hard-coded `ant-` class prefix with `token.antCls` in styles. [#404](https://github.com/ant-design/agentic-ui/pull/404)
- 🐞 Provide default CSS variable values and auto-load root styles. [#403](https://github.com/ant-design/agentic-ui/pull/403)
- 🐞 Delay streaming table rendering until first row is complete. [#400](https://github.com/ant-design/agentic-ui/pull/400)

## v2.30.10

- Mermaid
  - 🐞 Only render Mermaid diagram when code block is closed. [#399](https://github.com/ant-design/agentic-ui/pull/399)
- 💄 Adjust default table column width from 120px to 40px.

## v2.30.9

- MarkdownEditor
  - 🛠 Simplify directive handling and remove unused subpath type.

## v2.30.8

- FileMapView
  - 🐞 Hide file size when `size` is absent or 0. [#393](https://github.com/ant-design/agentic-ui/pull/393) [#394](https://github.com/ant-design/agentic-ui/pull/394)
- MarkdownEditor
  - 🐞 Use block layout for `blockquote` instead of flex. [#396](https://github.com/ant-design/agentic-ui/pull/396)
- Parser
  - 🆕 Only `:::` block container directives are supported; inline `:foo` forms are ignored. [#395](https://github.com/ant-design/agentic-ui/pull/395)

## v2.30.7

- 📖 Add Bubble streaming Markdown demo page.

## v2.30.6

- MarkdownRenderer
  - 🆕 Enhance streaming rendering with tail fade-in animation and character queue configuration.

## v2.30.5

- MarkdownRenderer
  - 🐞 Improve key stability and animation logic for streaming messages.

## v2.30.4

- MarkdownRenderer
  - 🆕 Animate only the trailing 50 characters during streaming; add `animateTailChars` config.

## v2.30.3

- Chart
  - 🆕 Add BoxPlot and Histogram chart components.
  - 🆕 Atomic charts support dark theme. [#390](https://github.com/ant-design/agentic-ui/pull/390)
  - 🆕 Export chart components with `forwardRef` to support ref forwarding.
  - 🆕 Add copy Markdown table feature.
- MarkdownRenderer
  - 🆕 Improve block content stability in streaming scenarios, avoid repeated unmount and remount.

## v2.30.2

- Chart
  - 🆕 Parse Chinese currency strings (亿元/万元/元) for charts. [#388](https://github.com/ant-design/agentic-ui/pull/388)
- MarkdownEditor
  - 🐞 Skip time-colon escape inside fenced code blocks. [#383](https://github.com/ant-design/agentic-ui/pull/383)
  - 💄 Only render Tooltip in `ToolBarItem` when `title` is present, mitigating `findDOMNode` deprecation warning.
- SchemaEditor
  - 🐞 Restore empty content copy hint and success/failure feedback.

## v2.30.1

- MarkdownEditor
  - 🛠 Rebuild editable table implementation; improve column width handling, row/column commands, and cell selection. [#376](https://github.com/ant-design/agentic-ui/pull/376)
  - 🆕 Support fenced `agentic-ui-task` and `agentic-ui-toolusebar` code blocks rendering TaskList and ToolUseBar; legacy `agentic-ui-usertoolbar` remains readable and normalizes to the new identifier. [#378](https://github.com/ant-design/agentic-ui/pull/378) [#380](https://github.com/ant-design/agentic-ui/pull/380)
  - 💄 Fenced `agentic-ui-task` defaults `variant` to `simple`; set root-level `variant` to `default` for the full task-chain layout.
  - 🆕 In readonly mode, `renderMode` / `renderType` `markdown` uses MarkdownRenderer; `markdownRenderConfig` accepts `renderType` alias.
  - 🐞 Fix Chart canvas not visible under the Slate placeholder overlay. [#381](https://github.com/ant-design/agentic-ui/pull/381)
- MarkdownRenderer
  - 🆕 Use Markdown Renderer instead of Slate for streaming scenarios. [#369](https://github.com/ant-design/agentic-ui/pull/369)
  - 💄 Add blur transition to streaming text fade-in animation.
- Bubble
  - 🛠 Optimize thinking state with lightweight DOM loading and dots-only animation. [#377](https://github.com/ant-design/agentic-ui/pull/377)
  - 🐞 Fix `extraShowOnHover` handling to default to `true` when not provided.
- BubbleMessageDisplay
  - 🐞 Fix empty, `undefined`, or `null` content rendering when `answerStatus` is `EXCEPTION`. [#376](https://github.com/ant-design/agentic-ui/pull/376)
- MarkdownInputField
  - 🌐 Improve clarity of file upload related messages.
- 📖 Remove `rfc-streaming-markdown-renderer.md` documentation. [#370](https://github.com/ant-design/agentic-ui/pull/370)
- ✅ Add snapshots for agentic-ui embed and thinking DOM demos; update related demo snapshots.
- 🛠 Fix test and Chart error logging.

## v2.29.60

- MarkdownRenderer
  - 🆕 Use Markdown Renderer instead of Slate for streaming scenarios (pre-release; formally shipped in v2.30.1). [#369](https://github.com/ant-design/agentic-ui/pull/369)
- 🛠 Fix test and Chart error logging.

## v2.29.58

- Bubble
  - 💄 Remove padding from `extra` in Popover mode. [#367](https://github.com/ant-design/agentic-ui/pull/367)
- MarkdownPreview
  - 🛠 Improve code formatting and error handling.
- FileUploadManager
  - 🛠 Improve error handling.
- ✅ Add Markdown directive and parseTable regression test coverage. [#366](https://github.com/ant-design/agentic-ui/pull/366)

## v2.29.57

- MarkdownEditor
  - 🐞 Fix `textDirective` rendering failure, support Yuque documents. [#365](https://github.com/ant-design/agentic-ui/pull/365)
- 🛠 Add error handling to `myRemark.stringify` for improved robustness.
- 🐞 Fix TypeScript type errors.
- 🐞 Update card-selection-demo snapshot, fix paragraph element structure and attributes.

## v2.29.56

- MarkdownEditor
  - 🐞 Add `textDirective`/`leafDirective` processors for remark-rehype, fix unknown node error. [#364](https://github.com/ant-design/agentic-ui/pull/364)
- Bubble
  - 🆕 Add `extraShowOnHover` prop, default off, when enabled `extra` only shows on hover.
  - 💄 Change `extra` to show on hover instead of always visible. [#362](https://github.com/ant-design/agentic-ui/pull/362)
- 🛠 Remove all message prompt calls. [#363](https://github.com/ant-design/agentic-ui/pull/363)
- ✅ Add regression tests for PureBubbleList, AttachmentFileList, AttachmentButtonPopover. [#355](https://github.com/ant-design/agentic-ui/pull/355) [#356](https://github.com/ant-design/agentic-ui/pull/356) [#359](https://github.com/ant-design/agentic-ui/pull/359)

## v2.29.55

- MarkdownInputField
  - 🆕 Send button supports sendable state. [#361](https://github.com/ant-design/agentic-ui/pull/361)
- Blockquote
  - 🆕 Add `data-testid` attributes for improved testing support.
  - 🐞 Fix `className` compatibility by casting attributes to `React.HTMLAttributes`.

## v2.29.54

- MarkdownEditor
  - 🆕 Add markdown-it-container style `:::` custom container syntax (info/warning/success/error/tip). [#360](https://github.com/ant-design/agentic-ui/pull/360)
- MarkdownInputField
  - 🆕 Add `data-testid` attributes to demos for E2E testing support.

## v2.29.53

- MarkdownInputField
  - 🆕 Add E2E test ID support and export `testIds` constant.
  - 🆕 Image upload supports svg and webp formats. [#358](https://github.com/ant-design/agentic-ui/pull/358)
- ChartStatistic
  - 🆕 Support Semantic styles and `subtitle` display.
- ToolUseBarThink
  - 🌐 Add internationalization support, add `flex-direction: column` to container. [#357](https://github.com/ant-design/agentic-ui/pull/357)
- ✅ Improve test coverage for RealtimeFollow, FileMapView, AttachmentFileIcon, BeforeToolContainer, Enlargement.

## v2.29.31

- MarkdownEditor
  - 🐞 Fix `Node.leaf` error under `list-item`, use `Editor.leaf` to parse leaf nodes.
  - 🛠 Enhance `matchInputToNode` functionality and keyboard handling logic.
  - 🛠 Optimize `classname` specification and usage. [#315](https://github.com/ant-design/agentic-ui/pull/315) [@陈帅]

✅ Enhance test coverage for MarkdownEditor and Bubble components. [#307](https://github.com/ant-design/agentic-ui/pull/307) [@222]

## v2.29.30

- MarkdownEditor
  - 🛠 Optimize `SlateMarkdownEditor` rendering performance with `React.memo`.
  - 🛠 Unify `classname` prefix to `agentic-md-editor-*`. [#311](https://github.com/ant-design/agentic-ui/pull/311) [@陈帅]

- LinkCard
  - 🛠 Reorganize `class` naming per BEM specification. [#312](https://github.com/ant-design/agentic-ui/pull/312) [@陈帅]

- Chart
  - 🛠 Optimize ProForm config form class names with `agentic-chart-config-form` prefix and BEM structure. [#313](https://github.com/ant-design/agentic-ui/pull/313) [@陈帅]

- ChartRender
  - 🛠 Optimize BEM class names for table and description list. [#314](https://github.com/ant-design/agentic-ui/pull/314) [@陈帅]

- AceEditor
  - 🛠 Remove unused dependency from `effect` hook.

## v2.29.29

- MarkdownEditor
  - 🆕 Add Jinja template support with `jinja` config, `{}` trigger for template panel, syntax highlighting, and `createJinjaPlugin`. [#309](https://github.com/ant-design/agentic-ui/pull/309) [#310](https://github.com/ant-design/agentic-ui/pull/310) [@陈帅]

## v2.29.28

- Workspace
  - 🆕 Support video file preview and playback. [#308](https://github.com/ant-design/agentic-ui/pull/308) [@陈帅]

- SchemaEditorBridgeManager
  - 🆕 Add `getContentById` method for content retrieval. [#306](https://github.com/ant-design/agentic-ui/pull/306) [@222]

📚 Update demo data and content. [#305](https://github.com/ant-design/agentic-ui/pull/305) [@陈帅]

## v2.29.27

- Bubble
  - 🛠 Refactor locale handling for improved internationalization support. ([e1927ec6](https://github.com/ant-design/agentic-ui/commit/e1927ec6))

📚 Supplement changelog entries for v2.29.8-v2.29.26. [#303](https://github.com/ant-design/agentic-ui/pull/303) [@陈帅]

## v2.29.26

- Bubble
  - 🛠 Refactor Bubble component to integrate `useMergedLocale` for consistent locale handling across components. ([6647b12b](https://github.com/ant-design/agentic-ui/commit/6647b12b))

## v2.29.25

- MarkdownInputField
  - 🌐 Internationalize upload status, optimize "Uploading..." and "Upload failed" text multilingual display. [#301](https://github.com/ant-design/agentic-ui/pull/301) [@陈帅]

- I18n
  - 🌐 Improve internationalization, fix translation errors in `cnLabels`, add 17 missing i18n keys, and update 9 components to use internationalization. [#299](https://github.com/ant-design/agentic-ui/pull/299) [@陈帅]

📚 API documentation update, improve design issues documentation. [#298](https://github.com/ant-design/agentic-ui/pull/298) [@陈帅]

## v2.29.24

- Bubble
  - 🐞 Fix style class name prefix, prepend dot to class name in `useMessagesContentStyle` for correct styling. ([2f496852](https://github.com/ant-design/agentic-ui/commit/2f496852))

- MarkdownPreview
  - 🛠 Simplify rendering logic and enhance Popover behavior based on `placement` and extra content. ([d9cf641c](https://github.com/ant-design/agentic-ui/commit/d9cf641c))

- Workspace
  - 🛠 Update demo file reference and remove obsolete demo. ([fc4ffb27](https://github.com/ant-design/agentic-ui/commit/fc4ffb27))

✅ Test optimization, update type assertions and mock implementations in various test files for better type safety and consistency. ([4d5634b1](https://github.com/ant-design/agentic-ui/commit/4d5634b1))

## v2.29.23

- MarkdownEditor
  - 🌐 Support internationalization for editor toolbar titles, headings, subheadings, and body text. [#296](https://github.com/ant-design/agentic-ui/pull/296) [@shuyan]

- MarkdownEditor
  - 🐞 Fix initialization issue when Markdown content is empty, ensure proper rendering when `initValue` is empty or `undefined`. [#294](https://github.com/ant-design/agentic-ui/pull/294) [@陈帅]

## v2.29.22

- Bubble
  - 🛠 Refactor class naming for improved style encapsulation in BubbleMessageDisplay. ([e734568c](https://github.com/ant-design/agentic-ui/commit/e734568c))

## v2.29.21

- Bubble
  - 🆕 Add `wrapSSR` support for improved rendering in BubbleMessageDisplay. ([8dd08a01](https://github.com/ant-design/agentic-ui/commit/8dd08a01))

## v2.29.20

- Bubble
  - 💄 Update MessagesContent styles, optimize `padding` and `gap` values for consistency. ([4578a647](https://github.com/ant-design/agentic-ui/commit/4578a647))
  - 🆕 Enhance bubble message handling with `preMessage` support and retry UI. ([8b56ebe3](https://github.com/ant-design/agentic-ui/commit/8b56ebe3))

✅ MarkdownEditor: Add tests for footnote rendering in readonly mode. ([2ca9faee](https://github.com/ant-design/agentic-ui/commit/2ca9faee))

## v2.29.19

- MarkdownEditor
  - 🐞 Disable RAF by default in `setMDContent` to prevent rendering stop on browser alerts. [#293](https://github.com/ant-design/agentic-ui/pull/293) [@陈帅]

- ChatLayout
  - 💄 Optimize bottom animation background to fill the entire container. [#292](https://github.com/ant-design/agentic-ui/pull/292) [@不见月]

## v2.29.18

- MarkdownEditor
  - 🐞 Fix paste handling logic, update `onPaste` handler to return boolean and enhance paste handling. ([af8cff63](https://github.com/ant-design/agentic-ui/commit/af8cff63))

## v2.29.17

- Workspace
  - 🆕 Support card custom rendering. [#291](https://github.com/ant-design/agentic-ui/pull/291) [@shuyan]

- MarkdownEditor
  - 🆕 Enhance quick input tips for code and horizontal rule blocks. [#289](https://github.com/ant-design/agentic-ui/pull/289) [@222]
  - 🐞 Optimize key matching and space trigger logic. [#288](https://github.com/ant-design/agentic-ui/pull/288) [@陈帅]
  - 🆕 Support double hash (##) heading input. [#284](https://github.com/ant-design/agentic-ui/pull/284) [@陈帅]

✅ Improve test case coverage. [#287](https://github.com/ant-design/agentic-ui/pull/287) [@222]

## v2.29.16

- Workspace
  - 🆕 Support file and web page reverse location, click files or web pages in workspace to locate corresponding position in conversation. [#286](https://github.com/ant-design/agentic-ui/pull/286) [@shuyan]
  - 🆕 Task name supports ReactNode, support custom `title`. [#279](https://github.com/ant-design/agentic-ui/pull/279) [@shuyan]

📚 Design guidelines improvement, add Figma design system guidelines. [#285](https://github.com/ant-design/agentic-ui/pull/285) [@陈帅]

📚 Add AGENTS.md file to improve project documentation. [#283](https://github.com/ant-design/agentic-ui/pull/283) [@陈帅]

📚 Add Markdown input shortcuts documentation. [#282](https://github.com/ant-design/agentic-ui/pull/282) [@陈帅]

📚 Improve component library specification documentation. [#281](https://github.com/ant-design/agentic-ui/pull/281) [@陈帅]

📚 Add `atomId` documentation for button. [#280](https://github.com/ant-design/agentic-ui/pull/280) [@遇见同学]

## v2.29.15

📦 Add guidelines directory to package files. ([895d20fc](https://github.com/ant-design/agentic-ui/commit/895d20fc))

## v2.29.14

🆕 Sofa icon page launched. [#278](https://github.com/ant-design/agentic-ui/pull/278) [@陈帅]

🛠 ParseMd code structure optimization. [#277](https://github.com/ant-design/agentic-ui/pull/277) [@陈帅]

## v2.29.12

- MarkdownInputField
  - 💄 Animation optimization, adjust beam to left side for better visual guidance. [#276](https://github.com/ant-design/agentic-ui/pull/276) [@不见月]

- ChatFlowContainer
  - 🛠 Update animation duration for scroll elements. [#275](https://github.com/ant-design/agentic-ui/pull/275) [@不见月]

⚡️ Elements style performance optimization. [#274](https://github.com/ant-design/agentic-ui/pull/274) [@陈帅]

## v2.29.9

- TagPopup
  - 🐞 Fix 'path' is null error when selecting dropdown options consecutively. [#269](https://github.com/ant-design/agentic-ui/pull/269) [@222]

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
