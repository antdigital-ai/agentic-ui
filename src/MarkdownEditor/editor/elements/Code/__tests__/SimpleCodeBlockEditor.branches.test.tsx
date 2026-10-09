import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SimpleCodeBlockEditor } from '../SimpleCodeBlockEditor';

const commit = vi.hoisted(() => vi.fn());
const keyDownResult = vi.hoisted(() => ({ current: 'handled' as string }));
vi.mock('slate-react', async () => {
  const actual =
    await vi.importActual<typeof import('slate-react')>('slate-react');
  const { createEditor } = await import('slate');
  const editor = actual.withReact(createEditor());
  editor.children = [{ type: 'code', value: 'x', children: [{ text: '' }] }];
  return { ...actual, useSlateStatic: () => editor };
});
vi.mock('../../../utils/findElementPath', () => ({
  findElementPath: () => [0],
}));
vi.mock('../../../store', () => ({
  useEditorStore: () => ({ readonly: false }),
}));
vi.mock('../../../utils/codeBlockBehavior', async () => ({
  ...(await vi.importActual<typeof import('../../../utils/codeBlockBehavior')>(
    '../../../utils/codeBlockBehavior',
  )),
  handleCodeBlockTextInputKeyDown: () => keyDownResult.current,
  setCodeBlockNodes: commit,
}));

describe('SimpleCodeBlockEditor without Ace', () => {
  beforeEach(() => {
    commit.mockClear();
    keyDownResult.current = 'handled';
  });

  it('commits edited text and consumes handled key events', () => {
    render(
      <SimpleCodeBlockEditor
        element={{ type: 'code', language: 'ts', value: 'const x = 1' } as any}
      />,
    );
    const editor = screen.getByTestId('simple-code-block-editor');
    fireEvent.change(editor, { target: { value: 'next' } });
    fireEvent.keyDown(editor, { key: 'Tab' });
    fireEvent.compositionEnd(editor, { currentTarget: { value: 'final' } });
    expect(commit).toHaveBeenCalledWith(
      expect.anything(),
      [0],
      expect.objectContaining({ value: 'next' }),
    );
    expect(editor).toHaveAttribute('aria-label', 'Code: ts');
  });

  it('无 language 时 aria-label 回退；未 handled 的 keyDown 仅 stopPropagation', () => {
    keyDownResult.current = 'not-handled';
    const stopPropagation = vi.fn();
    render(
      <SimpleCodeBlockEditor element={{ type: 'code', value: 'x' } as any} />,
    );
    const editor = screen.getByTestId('simple-code-block-editor');
    expect(editor).toHaveAttribute('aria-label', 'Code block');
    fireEvent.keyDown(editor, { key: 'a', stopPropagation });
    fireEvent.compositionStart(editor);
    fireEvent.compositionEnd(editor, { currentTarget: { value: 'composed' } });
    expect(commit).toHaveBeenCalled();
  });
});
