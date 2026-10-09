import { act, cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BaseMarkdownEditorSlate from '../BaseMarkdownEditorSlate';
import * as editorSelection from '../editor/utils/getEditorDOMSelection';
import type { MarkdownEditorInstance } from '../types';

const settleSelection = () =>
  act(async () => new Promise((resolve) => setTimeout(resolve, 40)));

const mount = (readonly = true) => {
  const editorRef = React.createRef<MarkdownEditorInstance>();
  const onSelectionChange = vi.fn();
  const view = render(
    <BaseMarkdownEditorSlate
      initValue="repeat repeat"
      readonly={readonly}
      editorRef={editorRef}
      onSelectionChange={onSelectionChange}
      toolBar={{ enable: false }}
      floatBar={{ enable: false }}
    />,
  );
  return {
    ...view,
    editorRef,
    editor: editorRef.current!.markdownEditorRef.current,
    onSelectionChange,
    editable: view.container.querySelector('[data-slate-editor]')!,
    text: view.container.querySelector('[data-slate-string]')!.firstChild!,
  };
};

const selectDOM = (text: Node, anchor: number, focus: number) => {
  const selection = text.ownerDocument!.getSelection()!;
  selection.setBaseAndExtent(text, anchor, text, focus);
  return selection;
};

afterEach(() => {
  cleanup();
  document.getSelection()?.removeAllRanges();
  vi.restoreAllMocks();
});

describe('editor DOM selection bridge', () => {
  it('preserves the direction of a backward readonly selection', async () => {
    const { editor, editable, text, onSelectionChange } = mount();
    selectDOM(text, 6, 0);
    fireEvent.mouseUp(editable);
    await settleSelection();
    expect(editor.selection).toEqual({
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 0], offset: 0 },
    });
    expect(Range.isBackward(onSelectionChange.mock.lastCall![0])).toBe(true);
    expect(onSelectionChange.mock.lastCall![1]).toBe('repeat');
  });

  it('publishes the same readonly selection only once across pointer/select events', async () => {
    const { editable, text, onSelectionChange } = mount();
    selectDOM(text, 0, 6);
    fireEvent.mouseUp(editable);
    await settleSelection();
    fireEvent.select(editable);
    fireEvent.mouseUp(editable);
    await settleSelection();
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });

  it('tracks readonly keyboard selection changes from the native document event', async () => {
    const { text, onSelectionChange } = mount();
    selectDOM(text, 0, 6);
    fireEvent(document, new Event('selectionchange'));
    await settleSelection();
    expect(onSelectionChange).toHaveBeenLastCalledWith(
      {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 6 },
      },
      'repeat',
      expect.any(Array),
    );
  });

  it('clears the previous editor selection when the native selection moves elsewhere', async () => {
    const first = mount();
    const second = mount();
    selectDOM(first.text, 0, 6);
    fireEvent.mouseUp(first.editable);
    await settleSelection();
    first.onSelectionChange.mockClear();

    selectDOM(second.text, 7, 13);
    fireEvent(document, new Event('selectionchange'));
    await settleSelection();
    expect(first.editor.selection).toBeNull();
    expect(first.onSelectionChange).toHaveBeenCalledExactlyOnceWith(
      null,
      '',
      [],
    );
    expect(second.onSelectionChange.mock.lastCall![0].anchor.offset).toBe(7);
    expect(document.getSelection()!.toString()).toBe('repeat');
  });

  it('does not deduplicate different ranges containing the same text', async () => {
    const { editable, text, onSelectionChange } = mount();
    selectDOM(text, 0, 6);
    fireEvent.mouseUp(editable);
    await settleSelection();
    selectDOM(text, 7, 13);
    fireEvent.mouseUp(editable);
    await settleSelection();
    expect(onSelectionChange).toHaveBeenCalledTimes(2);
    expect(
      onSelectionChange.mock.calls.map(
        ([selection]) => selection.anchor.offset,
      ),
    ).toEqual([0, 7]);
  });

  it('does not measure readonly DOM ranges when only the selection callback is enabled', async () => {
    const { editable, text, onSelectionChange } = mount();
    const toDOMRange = vi.spyOn(ReactEditor, 'toDOMRange');
    selectDOM(text, 0, 6);
    fireEvent.mouseUp(editable);
    await settleSelection();
    expect(onSelectionChange.mock.lastCall![1]).toBe('repeat');
    expect(toDOMRange).not.toHaveBeenCalled();
  });

  it('queues a native notification only for the readonly editor that owns the selection', async () => {
    const views = Array.from({ length: 10 }, () => mount());
    await settleSelection();
    views.forEach((view) => view.onSelectionChange.mockClear());
    const timer = vi.spyOn(globalThis, 'setTimeout');
    const cancel = vi.spyOn(globalThis, 'clearTimeout');
    selectDOM(views[0].text, 0, 6);
    fireEvent(document, new Event('selectionchange'));
    await settleSelection();
    const canceled = new Set(cancel.mock.calls.map(([id]) => id));
    const uncanceledNotifications = timer.mock.calls.filter(
      ([, delay], index) =>
        delay === 16 && !canceled.has(timer.mock.results[index].value),
    );
    expect(uncanceledNotifications).toHaveLength(1);
    expect(views[0].onSelectionChange).toHaveBeenCalledTimes(1);
    expect(
      views
        .slice(1)
        .every((view) => view.onSelectionChange.mock.calls.length === 0),
    ).toBe(true);
  });

  it('does no native bridge work when readonly selection features are disabled', async () => {
    const { container } = render(
      <BaseMarkdownEditorSlate
        initValue="no selection features"
        readonly
        toolBar={{ enable: false }}
        floatBar={{ enable: false }}
      />,
    );
    const ownership = vi.spyOn(editorSelection, 'getEditorDOMSelection');
    const measure = vi.spyOn(ReactEditor, 'toDOMRange');
    const text = container.querySelector('[data-slate-string]')!.firstChild!;
    selectDOM(text, 0, 6);
    fireEvent(document, new Event('selectionchange'));
    await settleSelection();
    expect(ownership).not.toHaveBeenCalled();
    expect(measure).not.toHaveBeenCalled();
  });

  it('measures an unchanged report selection only once', async () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <BaseMarkdownEditorSlate
        initValue="report text"
        readonly
        reportMode
        onSelectionChange={onSelectionChange}
        toolBar={{ enable: false }}
      />,
    );
    const editable = container.querySelector('[data-slate-editor]')!;
    const text = container.querySelector('[data-slate-string]')!.firstChild!;
    const measure = vi.fn(() => new DOMRect(10, 10, 80, 20));
    const toDOMRange = ReactEditor.toDOMRange;
    vi.spyOn(ReactEditor, 'toDOMRange').mockImplementation((...args) => {
      const range = toDOMRange(...args);
      range.getBoundingClientRect = measure;
      return range;
    });
    selectDOM(text, 0, 6);
    fireEvent.mouseUp(editable);
    await settleSelection();
    fireEvent.select(editable);
    fireEvent.mouseUp(editable);
    await settleSelection();
    expect(measure).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);

    // A new pointer gesture clears the toolbar, even when it selects the same
    // range again. Restore its rectangle without serializing or notifying twice.
    fireEvent.mouseDown(text.parentElement!);
    fireEvent.mouseUp(editable);
    await settleSelection();
    expect(measure).toHaveBeenCalledTimes(2);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });

  it('reserializes a selection when its document content changes', async () => {
    const { editor, editable, onSelectionChange } = mount(false);
    await act(async () => {
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 6 },
      });
    });
    fireEvent.mouseUp(editable);
    await settleSelection();
    const previousCount = onSelectionChange.mock.calls.length;
    await act(async () => {
      Transforms.insertText(editor, 'change', {
        at: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 6 },
        },
      });
      Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 6 },
      });
    });
    fireEvent.mouseUp(editable);
    await settleSelection();
    expect(onSelectionChange.mock.calls.length).toBeGreaterThan(previousCount);
    expect(onSelectionChange.mock.lastCall![1]).toBe('change');
    expect(
      ReactEditor.toDOMPoint(editor, { path: [0, 0], offset: 6 })[0]
        .textContent,
    ).toBe('change repeat');
  });

  it('uses current serialization plugins for the focus callback', () => {
    const editorRef = React.createRef<MarkdownEditorInstance>();
    const onFocus = vi.fn();
    const { container } = render(
      <BaseMarkdownEditorSlate
        initValue="custom text"
        editorRef={editorRef}
        onFocus={onFocus}
        toolBar={{ enable: false }}
        floatBar={{ enable: false }}
      />,
    );
    editorRef.current!.store.setRuntimeConfig({
      plugins: [
        {
          toMarkdown: [
            {
              match: (node) => node.type === 'paragraph',
              convert: () => ({
                type: 'code',
                lang: 'custom',
                value: 'serialized',
              }),
            },
          ],
        },
      ],
    });
    fireEvent.focus(container.querySelector('[data-slate-editor]')!);
    expect(onFocus.mock.lastCall![0]).toBe(
      editorRef.current!.store.getMDContent(),
    );
  });
});
