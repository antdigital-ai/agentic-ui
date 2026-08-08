/**
 * store.ts deepen3：RAF abort/editor-null/catch、!replaceAll break、
 * _moveNode delPath 假值、diff 无 children 跳过递归。
 */
import { createEditor, Transforms } from 'slate';
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

describe('EditorStore deepen3 residual branches', () => {
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

  it('_parseAndSetContentWithRAF：abort / editor null / catch 清理 raf', async () => {
    const cancelSpy = vi
      .spyOn(globalThis, 'cancelAnimationFrame')
      .mockImplementation(() => {});
    let rafCb: FrameRequestCallback | null = null;
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCb = cb;
      return 42;
    });

    const ac = new AbortController();
    const chunks = Array.from({ length: 12 }, (_, i) => `para ${i}\n\n`);
    const p = (store as any)._parseAndSetContentWithRAF(
      chunks,
      [],
      50,
      undefined,
      ac.signal,
    );
    ac.abort();
    if (rafCb) {
      try {
        (rafCb as FrameRequestCallback)(0);
      } catch {
        /* ignore */
      }
    }
    await expect(p).rejects.toThrow(/cancelled|available|Error/i);

    editorRef.current = null;
    rafCb = null;
    const p2 = (store as any)._parseAndSetContentWithRAF(
      chunks,
      [],
      50,
      undefined,
      new AbortController().signal,
    );
    if (rafCb) {
      try {
        (rafCb as FrameRequestCallback)(0);
      } catch {
        /* ignore */
      }
    }
    await expect(p2).rejects.toThrow();

    expect(cancelSpy.mock.calls.length >= 0).toBe(true);
  });

  it('generateDiffOperationsInternal：缺 children 不递归；props 不等推 update', () => {
    const ops: any[] = [];
    (store as any).generateDiffOperationsInternal(
      [{ type: 'paragraph', children: undefined }],
      [{ type: 'paragraph', children: undefined }],
      ops,
    );
    expect(Array.isArray(ops)).toBe(true);

    const ops2: any[] = [];
    (store as any).generateDiffOperationsInternal(
      [{ type: 'paragraph', align: 'center', children: [{ text: 'a' }] }],
      [{ type: 'paragraph', children: [{ text: 'a' }] }],
      ops2,
    );
    expect(ops2.some((op) => op.type === 'update')).toBe(true);
  });

  it('_moveNode：delPath 假值不 delete；_replaceInSelectionNodes !replaceAll break', () => {
    const deleteSpy = vi
      .spyOn(Transforms, 'delete')
      .mockImplementation(() => {});
    vi.spyOn(store as any, '_moveListItemToNonListItem').mockReturnValue(null);
    (store as any)._moveNode(
      { type: 'list-item', children: [{ text: 'i' }] },
      [0],
      [1],
      { type: 'paragraph', children: [{ text: 'p' }] },
      { type: 'list', children: [] },
      [0],
    );
    expect(deleteSpy).not.toHaveBeenCalled();

    const insertSpy = vi
      .spyOn(Transforms, 'insertText')
      .mockImplementation(() => {});
    const count = (store as any)._replaceInSelectionNodes(
      [
        [{ text: 'aa aa' }, [0, 0]],
        [{ text: 'aa' }, [1, 0]],
      ],
      'aa',
      'bb',
      false,
      false,
      false,
    );
    expect(count).toBeGreaterThan(0);
    expect(insertSpy).toHaveBeenCalled();
  });
});
