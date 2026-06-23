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

/**
 * 占位 Tag（`${placeholder:…}`）解析后 `text` 常为单空格，不能按 trim 判 orphan。
 */
export const hasOrphanTagDecoration = (
  leaf: CustomLeaf,
): leaf is CodeTagTextLeaf => {
  if (!(leaf.tag && leaf.code)) {
    return false;
  }
  const text = (leaf as CodeTagTextLeaf).text ?? '';
  if (leaf.placeholder) {
    return text.length === 0;
  }
  return isOrphanInlineDecorationText(text);
};

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
