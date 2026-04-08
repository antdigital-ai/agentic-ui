# 流式 Markdown 只读渲染 — 规格摘要

## 修订模型

- **典型流式**（SSE / 打字机）：`contentRevisionSource` 为**单调前缀增长**（同一轮对话内）。此时应保留已封版块对应的 React 子树，仅重算「末块」。
- **非前缀修订**（粘贴替换、重连、用户编辑）：`contentRevisionSource` 不再延续上一前缀。此时允许整文档重算；实现上通过 `revisionGeneration` 使块 key 失效并清空节流状态。

## 可解析串与修订源

- **`content`（可解析串）**：经 token 门控后的 Markdown，可安全送入 `unified`；可能含占位（如不完整链接暂缓）。
- **`contentRevisionSource`（修订源）**：用于判断「是否仍为同一次前缀流」的字符串，通常为原始 `displayedContent`。**不得**单独用可解析串做 `startsWith` 判断来保留缓存，否则占位符与正文切换会误判为非前缀。

## 块边界

- 按行扫描，在**非代码围栏**内以「连续两个空行」作为块分隔（与 `splitMarkdownBlocks` 一致）。围栏内不切分。

## 稳定性

- **封版块**（非最后一个块）：`React.memo` + `useMemo(parse)`；仅当该块源字符串变化时重解析。
- **末块**：独立槽位，列表项 `key` 为 `tail-${revisionGeneration}-${blockCount}`，**不**随末段文本长度变化，避免重组件反复卸载。

## 末块节流（可选）

- 在末块内对 `renderMarkdownBlock` 做增量阈值，减少极小增量的重复 parse；跳过时用 ref 保留上一棵子树（仅末块路径）。
