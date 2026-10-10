# 流式 Markdown 只读渲染 — 规格摘要

## 修订模型

- **典型流式**（SSE / 打字机）：`contentRevisionSource` 为**单调前缀增长**（同一轮对话内）。此时应保留已封版块对应的 React 子树，仅重算「末块」。
- **非前缀修订**（粘贴替换、重连、用户编辑）：`contentRevisionSource` 不再延续上一前缀。此时允许整文档重算；实现上通过 `revisionGeneration` 使块 key 失效并清空节流状态。
- **重写代价**：非前缀变化会触发 `useStreaming` 全清缓存并重新处理整段；普通文本与围栏正文按片段处理，未完成 token 按字符识别。同时 `revisionGeneration` 自增让所有块 key 失效，频繁纠错的 model 输出仍需要重新解析历史块。

## 可解析串与修订源

- **`content`（可解析串）**：经 token 门控后的 Markdown，可安全送入 `unified`；可能含占位（如不完整链接暂缓）。
- **围栏代码块流式**：`useStreaming` 在 `inFenced` 时将 `completeMarkdown + pending` 作为可见串（围栏正文仍在 pending、不 commit，但须交给下游 parse，否则代码块 UI 冻结至闭合）。
- **`contentRevisionSource`（修订源）**：用于判断「是否仍为同一次前缀流」的字符串，`MarkdownRenderer` 使用未限流的原始 `content`。**不得**单独用可解析串做 `startsWith` 判断来保留缓存，否则占位符与正文切换会误判为非前缀。

## 块边界

- 按行扫描，在**非代码围栏**内以空行作为块分隔；列表、引用、脚注等按 `splitMarkdownBlocks` 的规则保留连续性。围栏内不切分。
- 围栏识别在两处独立实现：`splitMarkdownBlocks`（一次性切块）与 `streaming/fenceTracker.ts`（按行增量）。新增围栏语法（如 `:::tip` 容器）时**两处都要同步**，否则增量识别与一次性切块不一致会导致末块误切。
- `splitStreamingMarkdownBlocks` 保留已完成的前缀，仅扫描最后两个块；保留前一块是因为未完成的列表、表格、脚注标记仍可能改变边界。围栏补齐修复只改动尾部时也可复用前缀。指令规范化、Jinja 占位符、think 标签会改变原文或在行内拆块，保守回退到全文切分。

## 稳定性

- **封版块**（非最后一个块）：`React.memo` + `useMemo(parse)`；仅当该块源字符串或处理器变化时重解析。每个位置只保留最近一次解析结果，流式回滚后重新分支不会积累全部历史源码对应的 React 树。
- **末块**：独立槽位，列表项 `key` 为 `b-${revisionGeneration}-${index}`，**不**随末段文本长度或 tail/sealed 状态变化，避免重组件反复卸载。
- **tail → sealed 晋升**：`MarkdownBlockPiece` 复用相同源码的最近一次解析结果，仅压缩 token 节点，避免封版瞬间多走一次 `renderMarkdownBlock`。解析缓存只在提交后发布，未提交的并发渲染不会覆盖当前文档缓存。
- **块元素复用**：源码、tail/sealed 状态和处理器等依赖未变化时，直接复用该位置的 React 元素；追加一个尾字不再为全部历史块重新创建元素。真正变化的配置仍通过 Context 刷新缓存块行为。
- **处理器配置**：浅相等的 `htmlConfig` 和公式配置保持处理器实例；空插件数组归一化为无插件。非空插件配置变化仍会使解析缓存失效。
- **脚注定义**：保留已提交的 remark AST 边界及完整定义容器，只重新解析尾部。新出现或失效的全局定义可能影响前文引用，必须全文回退；正文修订、尾部过长及上下文占比过高同样回退。未变定义保留节点身份，避免刷新其他引用预览。
- **复杂块配置**：代码与表格分别订阅运行时配置。未变的图表数据转换及 Schema 初始值保持引用稳定，实际正文、尺寸与自定义回调变化仍即时生效。

## 展示节流

- `ContentThrottle` 统一控制源正文的展示节奏，`throttleOptions.enabled: false` 即时推进，`isFinished` 立即释放剩余正文。
- 正文修订时完整比较已展示前缀，边界字符碰巧相同也会正确重置进度；清空正文同时取消待执行帧。
- 末块跟随已展示正文更新，相同 source 复用已有子树；不再叠加字符数量阈值，避免短尾永远停留在旧正文。
- 内置标签使用稳定组件类型，并通过 Context 获取最新回调与配置。缓存块无需重新解析即可更新链接和脚注行为，同时保留音视频实例及自定义组件状态。

## 逐词淡入（展示层）

- 与块缓存正交：`rehypeStreamingTokens` 在最终 hast 上把可见文本拆成 `.stream-token` span；CSS `agenticMdBlurFadeIn` 仅对新节点播放。
- 仅活动末块保留动画 span；封版时复用 React 树，去除内部标记的动画 span 并合并相邻文本节点。段落、链接、格式和自定义代码组件保持原有类型与 key，不重新解析封版块。
- 开关：`throttleOptions.fade`（默认开启，仅 `streaming`）；代码块 / 表格 / KaTeX 跳过拆词。
- processor 实例在流式会话内保持稳定，避免 chart / 代码块因 plugin 引用变化而卸载重挂。

## 性能上限

- 渐进渲染只在初次加载或文档修订代变化时重新从首批开始。同一文档追加正文或结束流式时保留已挂载块，避免后部图表、代码和媒体重复挂载。

- `useStreaming` 的 pending 缓冲区由各 recognizer 的正则上限决定：link/image/html 限 1000 字符、emphasis 限 1000、inline-code 限 300。pending 超过上限时正则不再匹配，自然走 `commitCache` 路径——所以"不完整 token 暂缓"对超长行有自我兜底。
