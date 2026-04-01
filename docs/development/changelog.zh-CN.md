---
nav:
  title: 项目研发
  order: 3
group:
  title: 开发指南
  order: 2
---

# Changelog

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
