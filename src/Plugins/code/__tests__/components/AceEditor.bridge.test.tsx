import { act, cleanup, fireEvent, render } from '@testing-library/react';
import type { Ace } from 'ace-builds';
import React from 'react';
import { createEditor, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorStoreTestProvider } from '../../../../MarkdownEditor/editor/__tests__/helpers/editorStoreTestContext';
import { withCodeBlockPlugin } from '../../../../MarkdownEditor/editor/plugins/withCodeBlockPlugin';
import { EditorStore } from '../../../../MarkdownEditor/editor/store';
import type { CodeNode } from '../../../../MarkdownEditor/el';
import { AceEditor } from '../../components/AceEditor';

const aceFactory = vi.hoisted(() => ({
  edit: vi.fn(),
}));
vi.mock('../../loadAceEditor', () => ({
  loadAceEditor: async () => ({ default: aceFactory }),
  loadAceTheme: async () => {},
}));
vi.mock('../../../../MarkdownEditor/editor/utils/ace', () => ({
  modeMap: new Map(),
  getAceLangs: async () => new Set(['text']),
}));

function makeAce(host: HTMLElement, value: string) {
  const handlers = new Map<string, (() => void)[]>();
  const textarea = document.createElement('textarea');
  textarea.setAttribute('aria-label', 'Ace code');
  host.append(textarea);
  const session = {
    setMode: vi.fn(),
    insert: vi.fn(),
    getDocument: () => ({ getLength: () => 1, getLine: () => value }),
  };
  return {
    value,
    textarea,
    setTheme: vi.fn(),
    getSession: () => session,
    session,
    commands: { addCommand: vi.fn() },
    selection: { on: vi.fn(), clearSelection: vi.fn() },
    on: (event: string, handler: () => void) => {
      handlers.set(event, [...(handlers.get(event) || []), handler]);
    },
    emit(event: string) {
      handlers.get(event)?.forEach((handler) => handler());
    },
    getValue() {
      return this.value;
    },
    setValue(next: string) {
      this.value = next;
      this.emit('change');
    },
    clearSelection: vi.fn(),
    destroy: vi.fn(() => textarea.remove()),
  };
}

async function renderAce(value = '') {
  const editor = withCodeBlockPlugin(withReact(withHistory(createEditor())));
  const store = new EditorStore({ current: editor });
  const element: CodeNode = {
    type: 'code',
    value,
    language: 'text',
    children: [{ text: '' }],
  };
  editor.children = [
    element,
    { type: 'paragraph', children: [{ text: 'after' }] },
  ];
  const onUpdate = vi.fn();
  let ace: ReturnType<typeof makeAce>;
  aceFactory.edit.mockImplementation(
    (host: HTMLElement, options: Ace.EditorOptions) => {
      ace = makeAce(host, String(options.value || ''));
      return ace;
    },
  );
  function Host({
    readonly = false,
    node = element,
  }: {
    readonly?: boolean;
    node?: CodeNode;
  }) {
    return (
      <EditorStoreTestProvider value={{ readonly, store }}>
        <Code node={node} />
      </EditorStoreTestProvider>
    );
  }
  function Code({ node }: { node: CodeNode }) {
    const { dom } = AceEditor({
      element: node,
      onUpdate,
      onShowBorderChange: () => {},
      onHideChange: () => {},
      theme: 'github',
    });
    return <div ref={dom} />;
  }
  const view = render(<Host />);
  await act(async () => {});
  return { ...view, editor, store, onUpdate, ace: ace!, Host };
}

beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'development');
  vi.useFakeTimers();
  aceFactory.edit.mockClear();
});
afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe('Ace and Slate bridge', () => {
  it('uses current Ace text for Backspace while the Slate update is still debounced', async () => {
    const { editor, ace } = await renderAce();
    ace.value = 'const value = 1';
    ace.emit('change');
    fireEvent.keyDown(ace.textarea, { key: 'Backspace' });
    expect(editor.children[0]).toMatchObject({ type: 'code', value: '' });
  });

  it('keeps IME keyboard and intermediate text inside Ace until composition ends', async () => {
    const { editor, ace, onUpdate } = await renderAce();
    fireEvent.compositionStart(ace.textarea);
    fireEvent.keyDown(ace.textarea, { key: 'Backspace', isComposing: true });
    ace.value = 'ni';
    ace.emit('change');
    await act(async () => vi.advanceTimersByTime(120));
    expect(editor.children[0]).toMatchObject({ type: 'code' });
    expect(onUpdate).not.toHaveBeenCalled();
    ace.value = '你';
    fireEvent.compositionEnd(ace.textarea);
    await act(async () => vi.advanceTimersByTime(120));
    expect(onUpdate).toHaveBeenCalledExactlyOnceWith({ value: '你' });
  });

  it('preserves an accepted pending draft when readonly replaces the Ace instance', async () => {
    const { editor, ace, onUpdate, rerender, Host } = await renderAce();
    ace.value = 'queued';
    ace.emit('change');
    rerender(<Host readonly />);
    fireEvent.keyDown(ace.textarea, { key: 'Backspace' });
    await act(async () => vi.advanceTimersByTime(120));
    expect(onUpdate).not.toHaveBeenCalled();
    expect(editor.children[0]).toMatchObject({ type: 'code', value: 'queued' });
    expect(ace.destroy).toHaveBeenCalledTimes(1);
    expect(aceFactory.edit.mock.results.at(-1)?.value.getValue()).toBe(
      'queued',
    );
  });

  it('cancels pending changes on unmount', async () => {
    const { ace, onUpdate, unmount } = await renderAce();
    ace.value = 'queued';
    ace.emit('change');
    unmount();
    await act(async () => vi.advanceTimersByTime(120));
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('does not commit a delayed update after the Slate code node was removed', async () => {
    const { editor, ace, onUpdate } = await renderAce('initial');
    ace.value = 'queued';
    ace.emit('change');
    Transforms.removeNodes(editor, { at: [0] });
    await act(async () => vi.advanceTimersByTime(120));
    expect(onUpdate).not.toHaveBeenCalled();
    expect(editor.children[0]).toMatchObject({ type: 'paragraph' });
  });

  it('ignores keyboard and queued changes after the same Slate node changes type', async () => {
    const { editor, ace, onUpdate } = await renderAce();
    ace.value = 'queued';
    ace.emit('change');
    Transforms.setNodes(editor, { type: 'paragraph' }, { at: [0] });
    fireEvent.keyDown(ace.textarea, { key: 'Enter', ctrlKey: true });
    await act(async () => vi.advanceTimersByTime(120));
    expect(onUpdate).not.toHaveBeenCalled();
    expect(editor.children).toHaveLength(2);
    expect(editor.children[0]).toMatchObject({ type: 'paragraph' });
  });

  it('cancels a pending draft when the document replaces its code before readonly', async () => {
    const { editor, ace, onUpdate, rerender, Host } =
      await renderAce('initial');
    ace.value = 'queued';
    ace.emit('change');
    Transforms.removeNodes(editor, { at: [0] });
    Transforms.insertNodes(
      editor,
      {
        type: 'code',
        value: 'fresh',
        children: [{ text: '' }],
      },
      { at: [0] },
    );
    rerender(<Host readonly />);
    await act(async () => vi.advanceTimersByTime(120));
    expect(onUpdate).not.toHaveBeenCalled();
    expect(editor.children[0]).toMatchObject({ type: 'code', value: 'fresh' });
  });

  it('does not overwrite a newer external value when readonly flushes pending input', async () => {
    const { editor, ace, rerender, Host } = await renderAce('initial');
    ace.value = 'queued';
    ace.emit('change');
    Transforms.setNodes(editor, { value: 'external' }, { at: [0] });
    rerender(<Host readonly />);
    expect(editor.children[0]).toMatchObject({
      type: 'code',
      value: 'external',
    });
  });

  it('ignores a queued change when the same Slate node receives an external value before React rerenders', async () => {
    const { editor, ace, onUpdate } = await renderAce('initial');
    ace.value = 'queued';
    ace.emit('change');
    Transforms.setNodes(editor, { value: 'external' }, { at: [0] });
    await act(async () => vi.advanceTimersByTime(120));
    expect(onUpdate).not.toHaveBeenCalled();
    expect(editor.children[0]).toMatchObject({ value: 'external' });
  });

  it('does not echo a programmatic Ace setValue into Slate onUpdate', async () => {
    const { editor, ace, onUpdate, rerender, Host } =
      await renderAce('initial');
    Transforms.setNodes(editor, { value: 'external' }, { at: [0] });
    rerender(<Host node={editor.children[0] as CodeNode} />);
    await act(async () => vi.advanceTimersByTime(120));
    expect(ace.getValue()).toBe('external');
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('cancels pending input when the Slate editor instance is replaced even with shared nodes', async () => {
    const { editor, store, ace, onUpdate, rerender, Host } =
      await renderAce('initial');
    ace.value = 'queued';
    ace.emit('change');
    const replacement = withCodeBlockPlugin(
      withReact(withHistory(createEditor())),
    );
    replacement.children = editor.children;
    store._editor.current = replacement;
    rerender(<Host readonly />);
    await act(async () => vi.advanceTimersByTime(120));
    expect(onUpdate).not.toHaveBeenCalled();
    expect(replacement.children[0]).toMatchObject({ value: 'initial' });
  });
});
