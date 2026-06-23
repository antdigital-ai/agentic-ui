import { createEditor, Editor } from 'slate';
import { describe, expect, it } from 'vitest';

import { withFootnoteReferenceNormalize } from '../withFootnoteReferenceNormalize';

describe('withFootnoteReferenceNormalize', () => {
  it('converts inline footnoteReference element to fnc text leaf', () => {
    const editor = withFootnoteReferenceNormalize(createEditor());
    editor.children = [
      {
        type: 'paragraph',
        children: [
          { text: 'Hello ' },
          {
            type: 'footnoteReference',
            identifier: '1',
            children: [{ text: '1' }],
          },
          { text: ' world' },
        ],
      },
    ];

    Editor.normalize(editor, { force: true });

    expect(editor.children[0].children).toEqual([
      { text: 'Hello ' },
      { text: '[^1]', identifier: '1', fnc: true },
      { text: ' world' },
    ]);
  });

  it('converts root footnoteReference to paragraph with fnc leaf', () => {
    const editor = withFootnoteReferenceNormalize(createEditor());
    editor.children = [
      {
        type: 'footnoteReference',
        identifier: 'fn',
        children: [{ text: 'fn' }],
      },
    ];

    Editor.normalize(editor, { force: true });

    expect(editor.children).toEqual([
      {
        type: 'paragraph',
        children: [{ text: '[^fn]', identifier: 'fn', fnc: true }],
      },
    ]);
  });
});
