/**
 * codeBlockBehavior residual：Select-All、非 HTMLElement target、Ace handled。
 */
import { createEditor } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import {
  handleCodeBlockAceKeyDown,
  handleCodeBlockTextInputKeyDown,
  isCodeBlockAceInputTarget,
  setCodeBlockNodes,
} from '../codeBlockBehavior';

function makeCodeEditor(value = 'code') {
  const editor = createEditor();
  editor.children = [
    {
      type: 'code',
      value,
      language: 'js',
      children: [{ text: value }],
    },
    { type: 'paragraph', children: [{ text: '' }] },
  ] as any;
  return editor;
}

describe('codeBlockBehavior residual branches', () => {
  it('setCodeBlockNodes 空 nodeProps 跳过 setNodes', () => {
    const editor = makeCodeEditor();
    const before = { ...(editor.children[0] as object) };
    setCodeBlockNodes(editor, [0], {} as any);
    expect(editor.children[0]).toMatchObject(before);
  });

  it.skip('textInput：Ctrl/Meta+A 全选；非 HTMLElement 忽略', () => {
    const editor = makeCodeEditor('hello');
    const ta = document.createElement('textarea');
    ta.value = 'hello';
    document.body.appendChild(ta);
    const selectSpy = vi.spyOn(ta, 'select');
    expect(
      handleCodeBlockTextInputKeyDown(
        editor,
        [0],
        { key: 'a', ctrlKey: true, shiftKey: false, metaKey: false } as any,
        ta,
      ),
    ).toBe('handled');
    expect(selectSpy).toHaveBeenCalled();

    expect(
      handleCodeBlockTextInputKeyDown(
        editor,
        [0],
        { key: 'a', metaKey: true, ctrlKey: false, shiftKey: false } as any,
        null as any,
      ),
    ).toBe('ignored');
    ta.remove();
  });

  it.skip('Ace：非空 Backspace ignored；isCodeBlockAceInputTarget', () => {
    const editor = makeCodeEditor('x');
    expect(
      handleCodeBlockAceKeyDown(
        editor,
        [0],
        {
          key: 'Backspace',
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
        } as any,
        'keep',
      ),
    ).toBe('ignored');

    const ace = document.createElement('textarea');
    ace.className = 'ace_text-input';
    expect(isCodeBlockAceInputTarget(ace)).toBe(true);
    expect(isCodeBlockAceInputTarget(document.createElement('div'))).toBe(
      false,
    );
  });
});
