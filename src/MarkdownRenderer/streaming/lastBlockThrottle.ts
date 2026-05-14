const LAST_BLOCK_THROTTLE_CHARS = 20;
const BLOCK_BOUNDARY_TRIGGERS = /[\n`|#>*\-!~]/;
// inline 起始字符出现在行首或空白后时立即重 parse，避免 `<a` / `_em` / `[link`
// 等增量在 < 20 字符时被节流卡住、用户看到半成品 DOM
const INLINE_CONTEXT_TRIGGERS = /(?:^|\s)[$[<_]/;

/**
 * 流式末块：是否应重新 parse（相对上一次已 parse 的源）。
 */
export const shouldReparseLastBlock = (
  prevParsedSource: string | undefined,
  newSource: string,
  streaming: boolean,
): boolean => {
  if (!streaming) return true;
  if (!prevParsedSource) return true;
  if (newSource.length < prevParsedSource.length) return true;
  if (!newSource.startsWith(prevParsedSource)) return true;
  const added = newSource.slice(prevParsedSource.length);
  if (added.length >= LAST_BLOCK_THROTTLE_CHARS) return true;
  if (BLOCK_BOUNDARY_TRIGGERS.test(added)) return true;
  if (INLINE_CONTEXT_TRIGGERS.test(added)) return true;
  return false;
};
