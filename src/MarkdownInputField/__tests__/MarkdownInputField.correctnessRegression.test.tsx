import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MarkdownEditorInstance } from '../../MarkdownEditor';
import * as env from '../../Utils/env';
import { MarkdownInputField } from '../MarkdownInputField';
import type { MarkdownInputFieldProps } from '../types/MarkdownInputFieldProps';

afterEach(() => vi.restoreAllMocks());

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
}

function ControlledField({
  onChange,
  initialValue = '',
  ...props
}: MarkdownInputFieldProps & { initialValue?: string }) {
  const [value, setValue] = React.useState(initialValue);
  return (
    <MarkdownInputField
      {...props}
      value={value}
      onChange={(next) => {
        onChange?.(next);
        setValue(next);
      }}
    />
  );
}

async function waitForDebouncedChanges() {
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 350);
    });
  });
}

describe('MarkdownInputField correctness regressions', () => {
  it('applies focused controlled resets and draft changes through the real editor', async () => {
    const inputRef = React.createRef<MarkdownEditorInstance>();
    const { rerender } = render(
      <MarkdownInputField value="old draft" inputRef={inputRef} />,
    );
    await waitFor(() =>
      expect(inputRef.current?.store.getMDContent()).toBe('old draft'),
    );
    vi.spyOn(ReactEditor, 'isFocused').mockReturnValue(true);
    rerender(<MarkdownInputField value="new draft" inputRef={inputRef} />);
    expect(inputRef.current?.store.getMDContent()).toBe('new draft');
    expect(inputRef.current?.markdownEditorRef.current.selection).toEqual({
      anchor: { path: [0, 0], offset: 9 },
      focus: { path: [0, 0], offset: 9 },
    });
    rerender(<MarkdownInputField value="" inputRef={inputRef} />);
    expect(inputRef.current?.store.getMDContent()).toBe('');
  });

  it('keeps a valid Slate and DOM selection after replacing a truly focused document', async () => {
    const inputRef = React.createRef<MarkdownEditorInstance>();
    const { rerender } = render(
      <MarkdownInputField value="old draft" inputRef={inputRef} />,
    );
    await waitFor(() =>
      expect(inputRef.current?.store.getMDContent()).toBe('old draft'),
    );
    const editor = inputRef.current!.markdownEditorRef.current;
    await act(async () => {
      Transforms.select(editor, Editor.end(editor, []));
      ReactEditor.focus(editor);
    });
    await waitFor(() => expect(ReactEditor.isFocused(editor)).toBe(true));
    expect(window.getSelection()?.rangeCount).toBe(1);

    rerender(<MarkdownInputField value="next draft" inputRef={inputRef} />);
    await waitFor(() =>
      expect(inputRef.current?.store.getMDContent()).toBe('next draft'),
    );
    expect(editor.selection).toEqual({
      anchor: { path: [0, 0], offset: 10 },
      focus: { path: [0, 0], offset: 10 },
    });
    expect(ReactEditor.toDOMRange(editor, editor.selection!)).toBeTruthy();
    rerender(<MarkdownInputField value="" inputRef={inputRef} />);
    await waitFor(() =>
      expect(inputRef.current?.store.getMDContent()).toBe(''),
    );
    expect(editor.selection).toEqual({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    expect(ReactEditor.toDOMRange(editor, editor.selection!)).toBeTruthy();
  });

  it('flushes a deferred external draft through the native IME fallback and preserves its callback', async () => {
    vi.spyOn(env, 'isWeChat').mockReturnValue(true);
    const inputRef = React.createRef<MarkdownEditorInstance>();
    const onCompositionActiveChange = vi.fn();
    const { container, rerender } = render(
      <MarkdownInputField
        value="old draft"
        inputRef={inputRef}
        markdownProps={{ onCompositionActiveChange }}
      />,
    );
    await waitFor(() =>
      expect(inputRef.current?.store.getMDContent()).toBe('old draft'),
    );
    const editable = container.querySelector('[data-slate-editor="true"]')!;
    fireEvent.compositionStart(editable);
    expect(inputRef.current?.store.inputComposition).toBe(true);
    rerender(
      <MarkdownInputField
        value="external draft"
        inputRef={inputRef}
        markdownProps={{ onCompositionActiveChange }}
      />,
    );
    expect(inputRef.current?.store.getMDContent()).toBe('old draft');
    // WeChat can finish IME with only a native input, without compositionend.
    fireEvent.input(editable, { isComposing: false });
    await waitFor(() =>
      expect(inputRef.current?.store.getMDContent()).toBe('external draft'),
    );
    expect(onCompositionActiveChange.mock.calls).toEqual([[true], [false]]);
  });

  it('notifies once per real editor change and once when maxLength truncates it', async () => {
    const inputRef = React.createRef<MarkdownEditorInstance>();
    const onChange = vi.fn();
    render(
      <ControlledField inputRef={inputRef} onChange={onChange} maxLength={5} />,
    );
    await waitFor(() =>
      expect(inputRef.current?.markdownEditorRef.current).toBeTruthy(),
    );
    await act(async () => {
      const editor = inputRef.current!.markdownEditorRef.current;
      Transforms.insertText(editor, '1234567', { at: Editor.end(editor, []) });
    });
    await waitFor(() => expect(onChange).toHaveBeenCalledWith('12345'));
    await waitForDebouncedChanges();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(inputRef.current?.store.getMDContent()).toBe('12345');
  });

  it('notifies once for a followup draft fill and once for successful send clearing', async () => {
    const onChange = vi.fn();
    const onSend = vi.fn().mockResolvedValue(undefined);
    render(
      <ControlledField
        onChange={onChange}
        onSend={onSend}
        followups={{
          items: [
            { text: 'filled draft', fillOnly: true },
            { text: 'submitted followup' },
          ],
        }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'filled draft' }));
    await waitForDebouncedChanges();
    expect(onChange.mock.calls).toEqual([['filled draft']]);
    onChange.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'submitted followup' }));
    await waitFor(() =>
      expect(onSend).toHaveBeenCalledExactlyOnceWith('submitted followup'),
    );
    await waitForDebouncedChanges();
    expect(onChange.mock.calls).toEqual([['']]);
  });

  it('notifies once for typing and for QuickActions refinement', async () => {
    const inputRef = React.createRef<MarkdownEditorInstance>();
    const onChange = vi.fn();
    render(
      <ControlledField
        inputRef={inputRef}
        onChange={onChange}
        refinePrompt={{ enable: true, onRefine: async () => 'refined' }}
      />,
    );
    await waitFor(() =>
      expect(inputRef.current?.markdownEditorRef.current).toBeTruthy(),
    );
    await act(async () => {
      const editor = inputRef.current!.markdownEditorRef.current;
      Transforms.insertText(editor, 'typed', { at: Editor.end(editor, []) });
    });
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledExactlyOnceWith('typed'),
    );
    onChange.mockClear();
    fireEvent.click(screen.getByTestId('refine-prompt-button'));
    await waitForDebouncedChanges();
    expect(onChange).toHaveBeenCalledExactlyOnceWith('refined');
  });

  it('keeps the draft after a failed followup and releases the shared send lock', async () => {
    const inputRef = React.createRef<MarkdownEditorInstance>();
    const error = new Error('send failed');
    const onSend = vi
      .fn()
      .mockRejectedValueOnce(error)
      .mockResolvedValue(undefined);
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    render(
      <ControlledField
        inputRef={inputRef}
        initialValue="draft"
        onSend={onSend}
        followups={{ items: [{ text: 'followup' }] }}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'followup' }));
    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith('Send message failed:', error),
    );
    expect(inputRef.current?.store.getMDContent()).toBe('draft');
    fireEvent.click(screen.getByRole('button', { name: 'followup' }));
    await waitFor(() => expect(onSend).toHaveBeenCalledTimes(2));
  });

  it.each([
    { disabled: true },
    { typing: true },
    { sendButtonProps: { disabled: true } },
  ] satisfies MarkdownInputFieldProps[])(
    'blocks both followup actions while unavailable: %o',
    (props) => {
      const onSend = vi.fn();
      const onChange = vi.fn();
      render(
        <MarkdownInputField
          {...props}
          onSend={onSend}
          onChange={onChange}
          followups={{
            items: [
              { text: 'send followup' },
              { text: 'fill followup', fillOnly: true },
            ],
          }}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: 'send followup' }));
      fireEvent.click(screen.getByRole('button', { name: 'fill followup' }));
      expect(onSend).not.toHaveBeenCalled();
      expect(onChange).not.toHaveBeenCalled();
    },
  );

  it('shares the in-flight send lock between followups and Enter, then permits another send', async () => {
    const first = deferred();
    const onSend = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockResolvedValue(undefined);
    const { container } = render(
      <ControlledField
        onSend={onSend}
        initialValue="draft"
        followups={{ items: [{ text: 'followup' }] }}
      />,
    );
    const followup = screen.getByRole('button', { name: 'followup' });
    fireEvent.click(followup);
    fireEvent.click(followup);
    fireEvent.keyDown(
      container.querySelector('[data-testid="markdown-input-field"]')!,
      { key: 'Enter' },
    );
    expect(onSend).toHaveBeenCalledTimes(1);
    await act(async () => {
      first.resolve();
      await first.promise;
    });
    fireEvent.click(followup);
    await waitFor(() => expect(onSend).toHaveBeenCalledTimes(2));
  });
});
