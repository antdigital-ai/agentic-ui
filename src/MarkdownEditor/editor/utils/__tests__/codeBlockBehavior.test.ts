import { createEditor, Transforms } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import {
  handleCodeBlockAceKeyDown,
  insertParagraphAfterCodeBlock,
  isCodeBlockAceInputTarget,
  removeEmptyCodeBlock,
  setCodeBlockNodes,
} from '../codeBlockBehavior';

describe('codeBlockBehavior', () => {
  it('setCodeBlockNodes 更新 value 并重置占位 text leaf', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'code',
        value: 'old',
        language: 'js',
        children: [{ text: 'old' }],
      },
    ];
    const setNodesSpy = vi.spyOn(Transforms, 'setNodes');

    const removeNodesSpy = vi.spyOn(Transforms, 'removeNodes');
    const insertNodesSpy = vi.spyOn(Transforms, 'insertNodes');

    setCodeBlockNodes(editor, [0], { value: 'new' });

    expect(setNodesSpy).toHaveBeenCalledWith(
      editor,
      { value: 'new' },
      expect.objectContaining({ at: [0] }),
    );
    expect(removeNodesSpy).toHaveBeenCalledWith(
      editor,
      expect.objectContaining({ at: [0, 0] }),
    );
    expect(insertNodesSpy).toHaveBeenCalledWith(
      editor,
      { text: '' },
      expect.objectContaining({ at: [0, 0] }),
    );
    expect((editor.children[0] as { value: string }).value).toBe('new');
    expect(editor.children[0].children[0].text).toBe('');

    setNodesSpy.mockRestore();
    removeNodesSpy.mockRestore();
    insertNodesSpy.mockRestore();
  });

  it('removeEmptyCodeBlock 与 insertParagraphAfterCodeBlock 每次插入独立段落', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'code', value: '', children: [{ text: '' }] },
      { type: 'code', value: 'b', children: [{ text: '' }] },
    ];

    removeEmptyCodeBlock(editor, [0]);
    insertParagraphAfterCodeBlock(editor, [1]);

    const p0 = editor.children[0];
    const p1 = editor.children[2];
    expect(p0).toMatchObject({ type: 'paragraph' });
    expect(p1).toMatchObject({ type: 'paragraph' });
    expect(p0).not.toBe(p1);

    p0.children[0].text = 'typed-a';
    expect(p1.children[0].text).toBe('');
  });

  it('handleCodeBlockAceKeyDown 空块 Backspace 删除 code', () => {
    const editor = createEditor();
    editor.children = [
      {
        type: 'code',
        value: '',
        children: [{ text: '' }],
      },
    ];
    const event = new KeyboardEvent('keydown', { key: 'Backspace' });
    const preventSpy = vi.spyOn(event, 'preventDefault');

    expect(
      handleCodeBlockAceKeyDown(editor, [0], event, ''),
    ).toBe('handled');
    expect(preventSpy).toHaveBeenCalled();
    expect(editor.children[0]).toEqual(
      expect.objectContaining({ type: 'paragraph' }),
    );
  });

  it('isCodeBlockAceInputTarget 识别 textarea', () => {
    const root = document.createElement('div');
    root.setAttribute('data-be', 'code');
    const textarea = document.createElement('textarea');
    root.appendChild(textarea);
    document.body.appendChild(root);
    expect(isCodeBlockAceInputTarget(textarea)).toBe(true);
    root.remove();
  });
});
