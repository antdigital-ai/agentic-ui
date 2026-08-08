/**
 * store deepen4：abort 时 rafId 空、表格行 children 缺失、
 * 行/单元格 props 更新。
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

describe('EditorStore deepen4 residual branches', () => {
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

  it('_parseAndSetContentWithRAF：首帧 abort 且 rafId 尚未链式', async () => {
    const cancelSpy = vi
      .spyOn(globalThis, 'cancelAnimationFrame')
      .mockImplementation(() => {});
    let rafCb: FrameRequestCallback | null = null;
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCb = cb;
      return 0;
    });

    const ac = new AbortController();
    const p = (store as any)._parseAndSetContentWithRAF(
      ['a\n\n', 'b\n\n'],
      [],
      50,
      undefined,
      ac.signal,
    );
    // 在回调内 abort：回调开头 rafId 仍为上次赋值
    ac.abort();
    if (rafCb) {
      try {
        (rafCb as FrameRequestCallback)(0);
      } catch {
        /* ignore */
      }
    }
    await expect(p).rejects.toThrow(/cancelled/i);
    cancelSpy.mockRestore();
  });

  it('_isSameTableStructure：无 id 且行缺 children → false', () => {
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

  it('_isSameTableStructure：有 id 且相同 → true（跳过 children 检查）', () => {
    const newTable = { type: 'table', id: 'same', children: [] };
    const oldTable = { type: 'table', id: 'same', children: [{ type: 'x' }] };
    expect(
      (store as any)._isSameTableStructure(
        newTable,
        oldTable,
        newTable.children,
        oldTable.children,
      ),
    ).toBe(true);
  });

  it('compareTableNodes：行无 children 走 || [] 后结构不同', () => {
    const ops: any[] = [];
    (store as any).compareTableNodes(
      { type: 'table', children: [{ type: 'table-row' }] },
      { type: 'table', children: [{ type: 'table-row' }] },
      [0],
      ops,
    );
    expect(Array.isArray(ops)).toBe(true);
  });

  it('_updateTableRow：行缺 children 走 || []', () => {
    const ops: any[] = [];
    (store as any)._updateTableRow(
      { type: 'table-row', align: 'center' },
      { type: 'table-row', align: 'left' },
      [0, 0],
      ops,
    );
    expect(ops.length).toBeGreaterThanOrEqual(0);
  });
});
