/**
 * store deepen12 safe：RAF abort reject、_isSameTableStructure、setMDContent 空。
 */
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { withMarkdown } from '../plugins/withMarkdown';
import { EditorStore } from '../store';

vi.mock('slate-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('slate-react')>();
  return {
    ...actual,
    ReactEditor: {
      ...actual.ReactEditor,
      focus: vi.fn(),
      deselect: vi.fn(),
      isFocused: vi.fn(() => false),
    },
    withReact: (editor: any) => editor,
  };
});

describe('EditorStore deepen12 safe residual branches', () => {
  let store: EditorStore;
  let editor: any;
  let editorRef: { current: any };

  beforeEach(() => {
    editor = withMarkdown(withHistory(createEditor()));
    editor.children = [{ type: 'paragraph', children: [{ text: 'hello' }] }];
    editorRef = { current: editor };
    store = new EditorStore(editorRef, []);
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('_parseAndSetContentWithRAF abort → reject cancelled', async () => {
    const ac = new AbortController();
    const p = (store as any)._parseAndSetContentWithRAF(
      ['x'],
      [],
      10,
      undefined,
      ac.signal,
    );
    ac.abort();
    await expect(p).rejects.toThrow(/cancelled/i);
  });

  it('setMDContent 空字符串', () => {
    expect(() => store.setMDContent('')).not.toThrow();
  });

  it('_isSameTableStructure：行缺 children → false', () => {
    const newTable = {
      type: 'table',
      children: [{ type: 'table-row', children: [{ type: 'table-cell' }] }],
    };
    const oldTable = {
      type: 'table',
      children: [{ type: 'table-row' }],
    };
    expect(
      (store as any)._isSameTableStructure(
        newTable,
        oldTable,
        newTable.children,
        oldTable.children,
      ),
    ).toBe(false);
  });
});
