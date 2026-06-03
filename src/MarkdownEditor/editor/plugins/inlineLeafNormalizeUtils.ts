import type { CustomLeaf } from '../../el';

export const MARK_DECORATION_KEYS = [
  'mark',
  'markColor',
  'markBg',
  'markLabel',
] as const;

/** 无有效正文：空串或仅空白（与 remove_text 清理逻辑一致） */
export const isOrphanInlineDecorationText = (text: string): boolean =>
  text.length === 0 || text.trim() === '';

export const hasOrphanMarkDecoration = (leaf: CustomLeaf): boolean =>
  !!leaf.mark && isOrphanInlineDecorationText(leaf.text ?? '');

export type CodeTagTextLeaf = CustomLeaf & { text: string };

export const hasOrphanTagDecoration = (leaf: CustomLeaf): leaf is CodeTagTextLeaf =>
  !!(leaf.tag && leaf.code) &&
  isOrphanInlineDecorationText((leaf as CodeTagTextLeaf).text ?? '');

const PLAIN_TEXT_AFTER_TAG = ' ';

/** 空 tag 叶节点归一为普通文本（保留单空格，与 delete 路径一致） */
export const getOrphanTagStripProps = (
  _leaf: CodeTagTextLeaf,
): Partial<CodeTagTextLeaf> => ({
  tag: false,
  code: false,
  text: PLAIN_TEXT_AFTER_TAG,
  triggerText: undefined,
});
