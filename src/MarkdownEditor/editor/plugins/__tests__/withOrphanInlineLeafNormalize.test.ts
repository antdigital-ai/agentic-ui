import { createEditor, Editor } from 'slate';
import { describe, expect, it } from 'vitest';

import { withOrphanInlineLeafNormalize } from '../withOrphanInlineLeafNormalize';

describe('withOrphanInlineLeafNormalize', () => {
  it('clears mark decorations when text is empty', () => {
    const editor = withOrphanInlineLeafNormalize(createEditor());
    editor.children = [
      {
        type: 'paragraph',
        children: [{ text: '', mark: true, markLabel: '@' }],
      },
    ];

    Editor.normalize(editor, { force: true });

    expect(editor.children[0].children).toEqual([{ text: '' }]);
  });

  it('clears mark decorations when text is whitespace only', () => {
    const editor = withOrphanInlineLeafNormalize(createEditor());
    editor.children = [
      {
        type: 'paragraph',
        children: [
          { text: '   ', mark: true, markColor: '#00f', markBg: '#eee' },
        ],
      },
    ];

    Editor.normalize(editor, { force: true });

    expect(editor.children[0].children).toEqual([{ text: '   ' }]);
  });

  it('keeps placeholder tag when text is a single space', () => {
    const editor = withOrphanInlineLeafNormalize(createEditor());
    editor.children = [
      {
        type: 'paragraph',
        children: [
          {
            text: ' ',
            tag: true,
            code: true,
            placeholder: '任务名称',
          },
        ],
      },
    ];

    Editor.normalize(editor, { force: true });

    expect(editor.children[0].children[0]).toMatchObject({
      text: ' ',
      tag: true,
      code: true,
      placeholder: '任务名称',
    });
  });

  it('strips tag decoration when text is empty', () => {
    const editor = withOrphanInlineLeafNormalize(createEditor());
    editor.children = [
      {
        type: 'paragraph',
        children: [
          {
            text: '',
            tag: true,
            code: true,
            triggerText: '[markdown]',
          },
        ],
      },
    ];

    Editor.normalize(editor, { force: true });

    expect(editor.children[0].children).toEqual([{ text: ' ' }]);
  });
});
