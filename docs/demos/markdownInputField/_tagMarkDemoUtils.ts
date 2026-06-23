export const TAG_MARK_MENTION_ITEMS = [
  { label: '客服助理', description: '解答产品问题' },
  { label: '代码助手', description: '编写与审查代码' },
] as const;

export const TAG_MARK_SKILL_ITEMS = [
  { label: 'summarize', description: '总结当前对话' },
  { label: 'compact', description: '压缩上下文（演示）' },
] as const;

export const tagMarkPanelStyle: import('react').CSSProperties = {
  background: 'var(--color-gray-bg-card-white, #fff)',
  border: '1px solid var(--color-gray-border-light, #e8e8e8)',
  borderRadius: 8,
  boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
  left: 0,
  maxHeight: 220,
  overflow: 'auto',
  position: 'absolute',
  right: 0,
  top: '100%',
  zIndex: 20,
};

export const tagMarkIconBtnStyle: import('react').CSSProperties = {
  alignItems: 'center',
  borderRadius: 6,
  cursor: 'pointer',
  display: 'inline-flex',
  height: 28,
  justifyContent: 'center',
  width: 28,
};

export function detectActiveTriggerQuery(
  text: string,
  char: '@' | '/',
): string | null {
  const lastIndex = text.lastIndexOf(char);
  if (lastIndex < 0) return null;
  const before = lastIndex > 0 ? text[lastIndex - 1] : '';
  const after = text.slice(lastIndex + 1);
  if (before && !/[\s\u00a0\n]/.test(before)) return null;
  if (/[\s\u00a0\n]/.test(after)) return null;
  return after;
}

export function replaceTrailingTriggerSegment(
  current: string,
  triggerChar: '@' | '/',
  replacement: string,
): string {
  const lastIndex = current.lastIndexOf(triggerChar);
  if (lastIndex < 0) return replacement;
  return current.slice(0, lastIndex) + replacement;
}

/** @ 助理：插入带 label 的 mark 高亮 */
export function buildMentionMarkMarkdown(label: string): string {
  const name = label.trim();
  if (!name) return '';
  return `<mark label="@">@${name}</mark>\u00a0`;
}

/** / 技能：插入 slash mark（与 ChatInputField 演示一致） */
export function buildSkillSlashMarkMarkdown(commandBody: string): string {
  const body = commandBody.trim();
  if (!body) return '';
  return `<mark>/${body}</mark>\u00a0`;
}
