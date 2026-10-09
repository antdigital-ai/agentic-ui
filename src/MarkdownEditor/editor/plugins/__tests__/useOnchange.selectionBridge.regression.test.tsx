import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { createEditor, Editor, Transforms } from 'slate';
import { Editable, ReactEditor, Slate, withReact } from 'slate-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  EditorStore,
  EditorStoreContext,
  type EditorStoreContextType,
} from '../../store';
import { createEditorSelChangeSubject } from '../../utils/editorSelChange';
import { useOnchange } from '../useOnchange';

function mountBridge(texts = ['first paragraph', 'second paragraph']) {
  const editor = withReact(createEditor());
  const markdownEditorRef = { current: editor };
  const selChange$ = createEditorSelChangeSubject();
  const listener = vi.fn();
  const subscription = selChange$.subscribe(listener);
  const context = {
    markdownEditorRef,
    store: new EditorStore(
      markdownEditorRef as EditorStoreContextType['markdownEditorRef'],
    ),
    selChange$,
    readonly: false,
    setDomRect: vi.fn(),
  } as unknown as EditorStoreContextType;
  const hook = renderHook(
    ({ tracking }) =>
      useOnchange(undefined, { selectionTrackingEnabled: tracking }),
    {
      initialProps: { tracking: true },
      wrapper: ({ children }) => (
        <EditorStoreContext.Provider value={context}>
          <Slate
            editor={editor}
            initialValue={[
              ...texts.map((text) => ({
                type: 'paragraph' as const,
                children: [{ text }],
              })),
            ]}
          >
            {children}
            <Editable />
          </Slate>
        </EditorStoreContext.Provider>
      ),
    },
  );
  const notify = () =>
    hook.result.current(editor.children, [...editor.operations]);
  const select = (block: number, offset = 0) => {
    Transforms.select(editor, { path: [block, 0], offset });
    notify();
  };
  return {
    ...hook,
    editor,
    markdownEditorRef,
    listener,
    subscription,
    select,
    notify,
    setDomRect: context.setDomRect,
  };
}

describe('deferred Slate selection bridge', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('coalesces rapid selection changes into the current selection', async () => {
    const bridge = mountBridge();
    for (let offset = 0; offset < 20; offset++) {
      await act(async () => bridge.select(0, offset % 10));
    }
    expect(bridge.listener).not.toHaveBeenCalled();
    await act(() => vi.runOnlyPendingTimersAsync());
    expect(bridge.listener).toHaveBeenCalledTimes(1);
    expect(bridge.listener.mock.calls[0][0].sel).toEqual(
      bridge.editor.selection,
    );
    bridge.subscription.unsubscribe();
  });

  it('does not publish after unmounting the bridge', async () => {
    const bridge = mountBridge();
    await act(async () => bridge.select(1));
    bridge.unmount();
    await act(() => vi.runOnlyPendingTimersAsync());
    expect(bridge.listener).not.toHaveBeenCalled();
    bridge.subscription.unsubscribe();
  });

  it('resolves current paths after a sibling is removed before dispatch', async () => {
    const bridge = mountBridge();
    await act(async () => bridge.select(1));
    await act(async () => Transforms.removeNodes(bridge.editor, { at: [0] }));
    await act(() => vi.runOnlyPendingTimersAsync());
    const payload = bridge.listener.mock.calls.at(-1)?.[0];
    expect(payload.sel).toEqual(bridge.editor.selection);
    expect(payload.node).toEqual(Editor.node(bridge.editor, [0]));
    bridge.subscription.unsubscribe();
  });

  it('drops pending selection work when tracking is disabled', async () => {
    const bridge = mountBridge();
    await act(async () => bridge.select(0));
    bridge.rerender({ tracking: false });
    await act(() => vi.runOnlyPendingTimersAsync());
    expect(bridge.listener).not.toHaveBeenCalled();
    bridge.subscription.unsubscribe();
  });

  it('does not publish a previous editor selection after replacing its ref', async () => {
    const bridge = mountBridge();
    await act(async () => bridge.select(0));
    bridge.markdownEditorRef.current = withReact(createEditor());
    await act(() => vi.runOnlyPendingTimersAsync());
    expect(bridge.listener).not.toHaveBeenCalled();
    bridge.subscription.unsubscribe();
  });

  it('publishes null after deselection instead of marking the first paragraph selected', async () => {
    const bridge = mountBridge();
    await act(async () => bridge.select(1));
    await act(async () => {
      Transforms.deselect(bridge.editor);
      bridge.notify();
    });
    await act(() => vi.runOnlyPendingTimersAsync());
    expect(bridge.listener).toHaveBeenCalledExactlyOnceWith(null);
    bridge.subscription.unsubscribe();
  });

  it('remeasures matching text at a different Slate selection', async () => {
    const bridge = mountBridge(['same text', 'same text']);
    const rects = [new DOMRect(1, 2, 30, 10), new DOMRect(1, 80, 30, 10)];
    const measure = vi
      .spyOn(window.Range.prototype, 'getBoundingClientRect')
      .mockReturnValueOnce(rects[0])
      .mockReturnValueOnce(rects[1]);
    try {
      for (const block of [0, 1]) {
        await act(async () => {
          const range = {
            anchor: { path: [block, 0], offset: 0 },
            focus: { path: [block, 0], offset: 4 },
          };
          const [text] = ReactEditor.toDOMPoint(bridge.editor, range.anchor);
          const domRange = document.createRange();
          domRange.setStart(text, 0);
          domRange.setEnd(text, 4);
          document.getSelection()!.removeAllRanges();
          document.getSelection()!.addRange(domRange);
          Transforms.select(bridge.editor, range);
          bridge.notify();
        });
      }
      expect(bridge.setDomRect).toHaveBeenLastCalledWith(rects[1]);
      expect(measure).toHaveBeenCalledTimes(2);
    } finally {
      measure.mockRestore();
      bridge.subscription.unsubscribe();
      document.getSelection()?.removeAllRanges();
    }
  });

  it('does not measure a browser selection outside this editor', async () => {
    const bridge = mountBridge();
    const outside = document.createElement('span');
    outside.textContent = 'outside selection';
    document.body.append(outside);
    const measure = vi.spyOn(window.Range.prototype, 'getBoundingClientRect');
    try {
      await act(async () => {
        const domRange = document.createRange();
        domRange.selectNodeContents(outside);
        document.getSelection()!.removeAllRanges();
        document.getSelection()!.addRange(domRange);
        Transforms.select(bridge.editor, {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 5 },
        });
        bridge.notify();
      });
      expect(measure).not.toHaveBeenCalled();
      expect(bridge.setDomRect).toHaveBeenLastCalledWith(null);
    } finally {
      measure.mockRestore();
      bridge.subscription.unsubscribe();
      document.getSelection()?.removeAllRanges();
      outside.remove();
    }
  });
});
