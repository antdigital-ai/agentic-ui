# 流式 Markdown 只读渲染 — 规格摘要

## 修订模型

- **典型流式**（SSE / 打字机）：`contentRevisionSource` 为**单调前缀增长**（同一轮对话内）。此时应保留已封版块对应的 React 子树，仅重算「末块」。
- **非前缀修订**（粘贴替换、重连、用户编辑）：`contentRevisionSource` 不再延续上一前缀。此时允许整文档重算；实现上通过 `revisionGeneration` 使块 key 失效并清空节流状态。
- **重写代价**：非前缀变化会触发 `useStreaming` 全清缓存并整段重扫（O(n × recognizer × pending)），同时 `revisionGeneration` 自增让所有块 key 失效。频繁纠错的 model 输出会落到这条路径，调用方可通过减少 revision 抖动来缓解。

## 可解析串与修订源

- **`content`（可解析串）**：经 token 门控后的 Markdown，可安全送入 `unified`；可能含占位（如不完整链接暂缓）。
- **围栏代码块流式**：`useStreaming` 在 `inFenced` 时将 `completeMarkdown + pending` 作为可见串（围栏正文仍在 pending、不 commit，但须交给下游 parse，否则代码块 UI 冻结至闭合）。
- **`contentRevisionSource`（修订源）**：用于判断「是否仍为同一次前缀流」的字符串，通常为原始 `displayedContent`。**不得**单独用可解析串做 `startsWith` 判断来保留缓存，否则占位符与正文切换会误判为非前缀。

## 块边界

- 按行扫描，在**非代码围栏**内以「连续两个空行」作为块分隔（与 `splitMarkdownBlocks` 一致）。围栏内不切分。
- 围栏识别在两处独立实现：`splitMarkdownBlocks`（一次性切块）与 `streaming/fenceTracker.ts`（按行增量）。新增围栏语法（如 `:::tip` 容器）时**两处都要同步**，否则增量识别与一次性切块不一致会导致末块误切。

## 稳定性

- **封版块**（非最后一个块）：`React.memo` + `useMemo(parse)`；仅当该块源字符串变化时重解析。
- **末块**：独立槽位，列表项 `key` 为 `tail-${revisionGeneration}-${blockCount}`，**不**随末段文本长度变化，避免重组件反复卸载。
- **tail → sealed 晋升**：`MarkdownBlockPiece` 在 sealed 命中 cacheRef 之前会先看 `lastParsedRef.current.source === blockSource`，命中即复用上一次 parse 结果并写入 cacheRef，避免封版瞬间多走一次 `renderMarkdownBlock`。

## 末块节流（可选）

- 在末块内对 `renderMarkdownBlock` 做增量阈值（`LAST_BLOCK_THROTTLE_CHARS = 20`），减少极小增量的重复 parse；跳过时用 ref 保留上一棵子树（仅末块路径）。
- 触发立即 parse 的字符集：`BLOCK_BOUNDARY_TRIGGERS = /[\n\`|#>\*\-!~]/`、`INLINE*CONTEXT_TRIGGERS = /(?:^|\s)[$[<*]/`。inline trigger 的目的是让 `<a`/`\_em`/`[link`/`$math` 等出现时立即进入 token 缓存的 incomplete 判定，避免短增量被节流卡住。

## 性能上限

- `useStreaming` 的 pending 缓冲区由各 recognizer 的正则上限决定：link/image/html 限 1000 字符、emphasis 限 1000、inline-code 限 300。pending 超过上限时正则不再匹配，自然走 `commitCache` 路径——所以"不完整 token 暂缓"对超长行有自我兜底。
