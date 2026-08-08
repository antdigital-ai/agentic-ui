/**
 * unwrapList / decreaseListItemDepth residual：早退与 Location 形态。
 */
import { createEditor } from 'slate';
import { describe, expect, it } from 'vitest';
import { agenticListsSchema } from '../../schema';
import { decreaseListItemDepth } from '../decreaseListItemDepth';
import { unwrapList } from '../unwrapList';

describe('lists transformations residual branches', () => {
  it('unwrapList：at=null / selection=null 返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    editor.selection = null;
    expect(unwrapList(editor, agenticListsSchema, null)).toBe(false);
    expect(unwrapList(editor, agenticListsSchema)).toBe(false);
  });

  it('unwrapList：Point / Path / Range 形态；无 list-item 返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(
      unwrapList(editor, agenticListsSchema, {
        path: [0, 0],
        offset: 0,
      }),
    ).toBe(false);
    expect(unwrapList(editor, agenticListsSchema, [0, 0])).toBe(false);
    expect(unwrapList(editor, agenticListsSchema, editor.selection)).toBe(
      false,
    );
  });

  it('decreaseListItemDepth：无 parentList 返回 false', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    expect(decreaseListItemDepth(editor, agenticListsSchema, [0])).toBe(false);
  });
});
