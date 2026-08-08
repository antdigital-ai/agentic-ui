/**
 * codeBlockBehavior 分支覆盖。
 */
import { createEditor } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import {
  handleCodeBlockAceKeyDown,
  handleCodeBlockTextInputKeyDown,
  isCodeBlockAceInputTarget,
  isCodeBlockElement,
  removeEmptyCodeBlock,
  setCodeBlockNodes,
} from '../codeBlockBehavior';

function makeCodeEditor(value = 'code') {
  const editor = createEditor();
  editor.children = [
    {
      type: 'code',
      value,
      language: 'js',
      children: [{ text: '' }],
    },
    { type: 'paragraph', children: [{ text: '' }] },
  ] as any;
  return editor;
}

describe('codeBlockBehavior branches', () => {
  it('isCodeBlockElement', () => {
    expect(isCodeBlockElement(null)).toBe(false);
    expect(isCodeBlockElement({ text: 'x' } as any)).toBe(false);
    expect(isCodeBlockElement({ type: 'code', children: [] } as any)).toBe(
      true,
    );
  });

  it('setCodeBlockNodes：仅 rest / 含 value / 无 placeholder path', () => {
    const editor = makeCodeEditor();
    setCodeBlockNodes(editor, [0], { language: 'ts' });
    expect((editor.children[0] as any).language).toBe('ts');

    setCodeBlockNodes(editor, [0], { value: 'new' });
    expect((editor.children[0] as any).value).toBe('new');
    expect((editor.children[0] as any).children[0].text).toBe('');

    const empty = createEditor();
    empty.children = [
      { type: 'code', value: 'x', children: [] },
    ] as any;
    setCodeBlockNodes(empty, [0], { value: 'y' });
    expect((empty.children[0] as any).value).toBe('y');
  });

  it('removeEmptyCodeBlock 插入段落', () => {
    const editor = makeCodeEditor();
    removeEmptyCodeBlock(editor, [0]);
    expect((editor.children[0] as any).type).toBe('paragraph');
  });

  it('handleCodeBlockAceKeyDown：Backspace 空块 / Mod+Enter / ignored', () => {
    const editor = makeCodeEditor('');
    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();
    expect(
      handleCodeBlockAceKeyDown(
        editor,
        [0],
        {
          key: 'Backspace',
          preventDefault,
          stopPropagation,
        } as any,
        '   ',
      ),
    ).toBe('handled');

    const editor2 = makeCodeEditor('x');
    expect(
      handleCodeBlockAceKeyDown(
        editor2,
        [0],
        {
          key: 'Enter',
          metaKey: true,
          ctrlKey: false,
          shiftKey: false,
          preventDefault,
          stopPropagation,
        } as any,
        'x',
      ),
    ).toBe('handled');

    expect(
      handleCodeBlockAceKeyDown(
        editor2,
        [0],
        {
          key: 'Enter',
          metaKey: true,
          shiftKey: true,
          preventDefault,
          stopPropagation,
        } as any,
        'x',
      ),
    ).toBe('ignored');

    expect(
      handleCodeBlockAceKeyDown(
        editor2,
        [0],
        { key: 'a', preventDefault, stopPropagation } as any,
        'x',
      ),
    ).toBe('ignored');
  });

  it('handleCodeBlockTextInputKeyDown：select-all 与透传', () => {
    const editor = makeCodeEditor('ab');
    const textarea = document.createElement('textarea');
    textarea.value = 'ab';
    const setSelectionRange = vi.spyOn(textarea, 'setSelectionRange');
    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();

    expect(
      handleCodeBlockTextInputKeyDown(
        editor,
        [0],
        {
          key: 'a',
          metaKey: true,
          ctrlKey: false,
          shiftKey: false,
          preventDefault,
          stopPropagation,
        } as any,
        textarea,
      ),
    ).toBe('handled');
    expect(setSelectionRange).toHaveBeenCalledWith(0, 2);

    expect(
      handleCodeBlockTextInputKeyDown(
        editor,
        [0],
        {
          key: 'A',
          ctrlKey: true,
          metaKey: false,
          shiftKey: false,
          preventDefault,
          stopPropagation,
        } as any,
        textarea,
      ),
    ).toBe('handled');

    expect(
      handleCodeBlockTextInputKeyDown(
        editor,
        [0],
        { key: 'b', preventDefault, stopPropagation } as any,
        textarea,
      ),
    ).toBe('ignored');
  });

  it('isCodeBlockAceInputTarget', () => {
    expect(isCodeBlockAceInputTarget(null)).toBe(false);
    expect(isCodeBlockAceInputTarget(document.createTextNode('x'))).toBe(
      false,
    );
    const wrap = document.createElement('div');
    wrap.setAttribute('data-be', 'code');
    const ta = document.createElement('textarea');
    wrap.appendChild(ta);
    document.body.appendChild(wrap);
    expect(isCodeBlockAceInputTarget(ta)).toBe(true);
    document.body.removeChild(wrap);
  });

  it('setCodeBlockNodes：空 data 不 setNodes；ctrl+Enter 跳出', () => {
    const editor = makeCodeEditor('body');
    setCodeBlockNodes(editor, [0], {});
    expect((editor.children[0] as any).value).toBe('body');

    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();
    expect(
      handleCodeBlockAceKeyDown(
        editor,
        [0],
        {
          key: 'Enter',
          ctrlKey: true,
          metaKey: false,
          shiftKey: false,
          preventDefault,
          stopPropagation,
        } as any,
        'body',
      ),
    ).toBe('handled');
    expect((editor.children[1] as any).type).toBe('paragraph');
  });
});
