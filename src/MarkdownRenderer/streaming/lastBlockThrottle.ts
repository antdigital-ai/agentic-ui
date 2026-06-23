import { endsInsideGfmTable } from './gfmTableLine';
import { endsInsideUnclosedFence } from './fenceTracker';

const LAST_BLOCK_THROTTLE_CHARS = 20;
const BLOCK_BOUNDARY_TRIGGERS = /[\n`|#>*\-!~]/;
const TABLE_STREAMING_BOUNDARY_TRIGGERS = /[\n#>*!~]/;
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
  // 围栏代码块内增量多为字母数字，不会触发边界符；须每帧重 parse 否则 code 子树冻结
  if (endsInsideUnclosedFence(newSource)) return true;
  const added = newSource.slice(prevParsedSource.length);
  if (added.length >= LAST_BLOCK_THROTTLE_CHARS) return true;
  // 表格流式：`|` / `-` 每个字符都触发 reparse 会导致整表卸载重挂；仅换行等边界符立即重算
  if (endsInsideGfmTable(newSource)) {
    if (TABLE_STREAMING_BOUNDARY_TRIGGERS.test(added)) return true;
    if (INLINE_CONTEXT_TRIGGERS.test(added)) return true;
    return false;
  }
  if (BLOCK_BOUNDARY_TRIGGERS.test(added)) return true;
  if (INLINE_CONTEXT_TRIGGERS.test(added)) return true;
  return false;
};
