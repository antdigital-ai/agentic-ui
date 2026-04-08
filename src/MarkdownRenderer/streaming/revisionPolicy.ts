/**
 * 判断是否应视为「非前缀修订」，从而放弃基于前缀的块级复用。
 * revisionSource 应为单调前缀流（如 displayedContent）；若未传则调用方用 content 自身。
 */
export const shouldResetRevisionProgress = (
  previous: string | undefined,
  next: string,
): boolean => {
  if (previous === undefined || previous === '') return false;
  if (next === previous) return false;
  if (next.startsWith(previous)) return false;
  if (previous.startsWith(next)) return false;
  return true;
};
