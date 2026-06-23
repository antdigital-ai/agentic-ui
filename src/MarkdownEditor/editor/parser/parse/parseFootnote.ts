import { debugInfo } from '../../../../Utils/debugUtils';
import type { CustomLeaf } from '../../../el';
import { extractFootnoteRefIdentifier } from '../../utils/footnoteDisplay';

export interface FootnoteReferenceMdast {
  identifier?: string;
  label?: string;
}

/**
 * remark-gfm `footnoteReference` → Slate 文本叶子（与 `useHighlight` / `FncLeaf` 主路径一致）
 */
export function footnoteReferenceToTextLeaf(
  currentElement: FootnoteReferenceMdast,
): CustomLeaf {
  const identifier =
    currentElement.identifier ?? currentElement.label ?? '';
  const text = identifier ? `[^${identifier}]` : '';
  return {
    text,
    identifier: identifier || undefined,
    fnc: true,
  };
}

/**
 * 处理 MDAST 脚注引用（内联或顶层 handler 共用）
 */
export const handleFootnoteReference = (
  currentElement: FootnoteReferenceMdast,
): CustomLeaf => {
  debugInfo('handleFootnoteReference - 处理脚注引用', {
    identifier: currentElement.identifier,
  });
  const result = footnoteReferenceToTextLeaf(currentElement);
  debugInfo('handleFootnoteReference - 脚注引用处理完成', {
    text: result.text,
    identifier: result.identifier,
  });
  return result;
};

/** 将历史 `footnoteReference` 元素转为文本叶子 */
export function legacyFootnoteReferenceElementToTextLeaf(node: {
  identifier?: string;
  text?: string;
  children?: { text?: string }[];
}): CustomLeaf {
  const fromIdentifier = node.identifier ?? '';
  const fromString =
    extractFootnoteRefIdentifier(
      node.text ??
        node.children?.map((c) => c.text ?? '').join('') ??
        '',
    ) ?? '';
  const identifier = fromIdentifier || fromString;
  return footnoteReferenceToTextLeaf({ identifier });
}
