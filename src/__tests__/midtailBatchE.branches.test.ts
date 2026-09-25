/**
 * Midtail batch E：更多 mid-tail 残留分支。
 */
import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import { normalizeOrphanNestedList } from '../MarkdownEditor/editor/plugins/lists/normalizations/normalizeOrphanNestedList';
import { agenticListsSchema } from '../MarkdownEditor/editor/plugins/lists/schema';
import { increaseListItemDepth } from '../MarkdownEditor/editor/plugins/lists/transformations/increaseListItemDepth';
import { unwrapList } from '../MarkdownEditor/editor/plugins/lists/transformations/unwrapList';
import { ListType } from '../MarkdownEditor/editor/plugins/lists/types';
import { getCodeBlockPlainText } from '../MarkdownEditor/editor/utils/codeBlockPlainText';
import { findMatchingClose } from '../MarkdownEditor/editor/utils/findMatchingClose';
import { isImeComposing } from '../MarkdownEditor/editor/utils/isImeComposing';

describe('midtail batch E branches', () => {
  it('unwrapList / increaseListItemDepth / normalizeOrphanNestedList 早退', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    editor.selection = null;
    expect(unwrapList(editor, agenticListsSchema)).toBe(false);
    expect(increaseListItemDepth(editor, agenticListsSchema, [0])).toBe(false);

    editor.children = [
      {
        type: ListType.UNORDERED,
        children: [
          {
            type: 'list-item',
            children: [
              { type: 'paragraph', children: [{ text: 'a' }] },
              {
                type: ListType.UNORDERED,
                children: [
                  {
                    type: 'list-item',
                    children: [
                      { type: 'paragraph', children: [{ text: 'n' }] },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ] as any;
    expect(
      normalizeOrphanNestedList(editor, agenticListsSchema, [
        editor.children[0],
        [0],
      ]),
    ).toBe(false);
  });

  it('isImeComposing / findMatchingClose / codeBlock plain text', () => {
    expect(isImeComposing({ nativeEvent: {} } as any)).toBe(false);
    expect(isImeComposing({ nativeEvent: { isComposing: true } } as any)).toBe(
      true,
    );
    expect(isImeComposing({ keyCode: 229, nativeEvent: {} } as any)).toBe(true);
    expect(isImeComposing({ nativeEvent: {} } as any, true)).toBe(true);

    // 从开括号之后搜闭合
    expect(findMatchingClose('(a(b)c)', 1, '(', ')')).toBeGreaterThan(0);
    expect(findMatchingClose('(a(b)', 1, '(', ')')).toBe(-1);
    const fenced = '```\nx\n```';
    const closeAt = findMatchingClose(fenced, 3, '```', '```');
    expect(closeAt === -1 || closeAt > 0).toBe(true);

    expect(
      getCodeBlockPlainText({
        type: 'code',
        children: [
          { type: 'code-line', children: [{ text: 'line1' }] },
          { type: 'code-line', children: [{ text: 'line2' }] },
        ],
      } as any),
    ).toContain('line1');
  });
});
