import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { Subject } from 'rxjs';
import { createEditor, Editor, Node, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorStoreContext, type EditorStoreContextType } from '../../store';
import { EditorUtils } from '../../utils/editorUtils';
import { getRemoteMediaType } from '../../utils/media';
import { InsertAutocomplete } from '../InsertAutocomplete';

const controls = vi.hoisted(() => ({
  setState: null as ((update: Record<string, unknown>) => void) | null,
}));

// The public default menu currently only exposes local uploads. Open the
// existing link panel while retaining its real state and Slate mutations.
vi.mock('../../utils/useLocalState', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../utils/useLocalState')>();
  return {
    useLocalState: (initial: Record<string, unknown>) => {
      const result = actual.useLocalState(initial);
      controls.setState = result[1];
      return result;
    },
  };
});
vi.mock('../../utils/media', () => ({ getRemoteMediaType: vi.fn() }));

const paragraph = (text: string) => ({
  type: 'paragraph' as const,
  children: [{ text }],
});

function deferredType() {
  let resolve!: (value: string | null) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<string | null>(
    (resolvePromise, rejectPromise) => {
      resolve = resolvePromise;
      reject = rejectPromise;
    },
  );
  return { promise, resolve, reject };
}

function renderPanel() {
  const editor = withReact(withHistory(createEditor()));
  editor.children = [
    paragraph('before'),
    paragraph('/media'),
    paragraph('after'),
  ];
  Transforms.select(editor, { path: [1, 0], offset: 6 });
  const container = document.createElement('div');
  const context = {
    markdownEditorRef: { current: editor },
    markdownContainerRef: { current: container },
    openInsertCompletion: true,
    keyTask$: new Subject(),
    insertCompletionText$: new Subject<string>(),
    selChange$: new Subject(),
  } as EditorStoreContextType;
  const content = (open: boolean) => (
    <EditorStoreContext.Provider
      value={{ ...context, openInsertCompletion: open }}
    >
      <InsertAutocomplete />
    </EditorStoreContext.Provider>
  );
  const result = render(content(true));
  act(() => {
    controls.setState?.({
      insertLink: true,
      insertUrl: 'https://cdn.example/media',
      filterOptions: [{ key: 'media', label: ['媒体', 'Media'], children: [] }],
    });
  });
  return {
    ...result,
    editor,
    container,
    input: screen.getByRole('textbox'),
    submit: screen.getByRole('button'),
    close: () => result.rerender(content(false)),
  };
}

beforeEach(() => {
  vi.spyOn(EditorUtils, 'focus').mockImplementation(() => {});
  vi.mocked(getRemoteMediaType).mockReset();
});
afterEach(() => vi.restoreAllMocks());

describe('InsertAutocomplete asynchronous media insertion', () => {
  it('uses the detected media type and inserts the complete card at the moved target', async () => {
    const request = deferredType();
    vi.mocked(getRemoteMediaType).mockReturnValue(request.promise);
    const { editor, submit } = renderPanel();
    fireEvent.click(submit);
    act(() =>
      Transforms.insertNodes(editor, paragraph('inserted before'), { at: [0] }),
    );
    await act(async () => request.resolve('video'));
    expect(editor.children[0]).toEqual(paragraph('inserted before'));
    expect(editor.children[1]).toEqual(paragraph('before'));
    expect(editor.children[2]).toMatchObject({
      type: 'card',
      children: [
        { type: 'card-before', children: [{ text: '' }] },
        { type: 'media', mediaType: 'video', url: 'https://cdn.example/media' },
        { type: 'card-after', children: [{ text: '' }] },
      ],
    });
    expect(editor.children[3]).toEqual(paragraph('after'));
    expect(Editor.pathRefs(editor).size).toBe(0);
  });

  it.each(['edit', 'delete'] as const)(
    'does not overwrite a target changed by %s while loading',
    async (change) => {
      const request = deferredType();
      vi.mocked(getRemoteMediaType).mockReturnValue(request.promise);
      const { editor, submit, input } = renderPanel();
      fireEvent.click(submit);
      act(() => {
        if (change === 'edit') {
          Transforms.insertText(editor, ' new text', {
            at: Editor.end(editor, [1]),
          });
        } else {
          Transforms.removeNodes(editor, { at: [1] });
        }
      });
      const beforeResolution = JSON.stringify(editor.children);
      await act(async () => request.resolve('audio'));
      expect(JSON.stringify(editor.children)).toBe(beforeResolution);
      expect(input).toHaveValue('https://cdn.example/media');
      expect(Editor.pathRefs(editor).size).toBe(0);
      if (change === 'delete') {
        fireEvent.click(submit);
        expect(getRemoteMediaType).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(editor.children)).toBe(beforeResolution);
      }
    },
  );

  it('locks duplicate Enter and click submissions before React updates loading state', async () => {
    const request = deferredType();
    vi.mocked(getRemoteMediaType).mockReturnValue(request.promise);
    const { editor, input, submit } = renderPanel();
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.click(submit);
    expect(getRemoteMediaType).toHaveBeenCalledTimes(1);
    expect(Editor.pathRefs(editor).size).toBe(1);
    await act(async () => request.resolve('audio'));
    expect(editor.children.filter((node) => node.type === 'card')).toHaveLength(
      1,
    );
    expect(Editor.pathRefs(editor).size).toBe(0);
  });

  it('retains the original text and URL after failure and permits a retry', async () => {
    const request = deferredType();
    vi.mocked(getRemoteMediaType)
      .mockReturnValueOnce(request.promise)
      .mockResolvedValue('video');
    const { editor, submit, input } = renderPanel();
    fireEvent.click(submit);
    await act(async () => request.reject(new Error('request failed')));
    expect(Node.string(editor.children[1])).toBe('/media');
    expect(input).toHaveValue('https://cdn.example/media');
    expect(Editor.pathRefs(editor).size).toBe(0);
    fireEvent.click(submit);
    await act(async () => {});
    expect(getRemoteMediaType).toHaveBeenCalledTimes(2);
    expect(editor.children[1]).toMatchObject({ type: 'card' });
  });

  it('keeps the moved anchor for a retry after lookup failure', async () => {
    const request = deferredType();
    vi.mocked(getRemoteMediaType)
      .mockReturnValueOnce(request.promise)
      .mockResolvedValue('video');
    const { editor, submit } = renderPanel();
    fireEvent.click(submit);
    act(() =>
      Transforms.insertNodes(editor, paragraph('inserted before'), { at: [0] }),
    );
    await act(async () => request.resolve(null));
    fireEvent.click(submit);
    await act(async () => {});
    expect(editor.children[1]).toEqual(paragraph('before'));
    expect(editor.children[2]).toMatchObject({ type: 'card' });
    expect(editor.children[3]).toEqual(paragraph('after'));
    expect(Editor.pathRefs(editor).size).toBe(0);
  });

  it.each(['close', 'unmount'] as const)(
    'cancels a late result after %s',
    async (action) => {
      const request = deferredType();
      vi.mocked(getRemoteMediaType).mockReturnValue(request.promise);
      const panel = renderPanel();
      fireEvent.click(panel.submit);
      panel[action]();
      expect(Editor.pathRefs(panel.editor).size).toBe(0);
      await act(async () => request.resolve('video'));
      expect(panel.editor.children).toEqual([
        paragraph('before'),
        paragraph('/media'),
        paragraph('after'),
      ]);
    },
  );
});
