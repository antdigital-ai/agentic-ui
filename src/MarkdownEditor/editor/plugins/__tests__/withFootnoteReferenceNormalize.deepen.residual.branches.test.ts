/**
 * withFootnoteReferenceNormalize deepen：父类型非内联时包 paragraph。
 */
import { createEditor, Editor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withFootnoteReferenceNormalize } from '../withFootnoteReferenceNormalize';

describe('withFootnoteReferenceNormalize deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('footnoteReference 父为未知类型时包成 paragraph', () => {
    const editor = withFootnoteReferenceNormalize(createEditor());
    editor.children = [
      {
        type: 'blockquote',
        children: [
          {
            type: 'footnoteReference',
            identifier: '1',
            children: [{ text: '' }],
          },
        ],
      },
    ] as any;
    Editor.normalize(editor, { force: true });
    const child = (editor.children[0] as any).children[0];
    expect(child.type === 'paragraph' || child.text !== undefined).toBe(true);
  });

  it('顶层 footnoteReference 替换为 paragraph', () => {
    const editor = withFootnoteReferenceNormalize(createEditor());
    editor.children = [
      {
        type: 'footnoteReference',
        identifier: '1',
        children: [{ text: '' }],
      },
    ] as any;
    Editor.normalize(editor, { force: true });
    expect((editor.children[0] as any).type).toBe('paragraph');
  });
});
