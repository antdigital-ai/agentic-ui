import { createEditor, Transforms } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import {
  handleCodeBlockAceKeyDown,
  isCodeBlockAceInputTarget,
  setCodeBlockNodes,
} from '../codeBlockBehavior';

describe('codeBlockBehavior', () => {
  it('setCodeBlockNodes 同步 value 与占位 children', () => {
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

    setCodeBlockNodes(editor, [0], { value: 'new' });

    expect(setNodesSpy).toHaveBeenCalledWith(
      editor,
      expect.objectContaining({
        value: 'new',
        children: [{ text: '' }],
      }),
      expect.objectContaining({ at: [0] }),
    );
    setNodesSpy.mockRestore();
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
