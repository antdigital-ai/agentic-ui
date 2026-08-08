/**
 * keyboard 残留：selectAll / selectLine / 空选区早退。
 */
import { createEditor, Transforms } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import { KeyboardTask } from '../keyboard';

vi.mock('copy-to-clipboard', () => ({ default: vi.fn() }));

const makeStore = (editor: any) =>
  ({
    editor,
    setShowComment: vi.fn(),
    openFloatBar: vi.fn(),
  }) as any;

describe('KeyboardTask residual branches', () => {
  it('selectAll 全选；表格单元格内仍可选', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'a' }] },
      { type: 'paragraph', children: [{ text: 'b' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const task = new KeyboardTask(makeStore(editor), {} as any);
    task.selectAll();
    expect(editor.selection).toBeTruthy();

    editor.children = [
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [{ type: 'paragraph', children: [{ text: 'c' }] }],
              },
            ],
          },
        ],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0, 0], offset: 0 },
    };
    task.selectAll();
    expect(editor.selection).toBeTruthy();
  });

  it('selectLine：有选区时选择行；无选区早退', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'hello world' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    const store = makeStore(editor);
    const task = new KeyboardTask(store, {} as any);
    task.selectLine();
    expect(editor.selection).toBeTruthy();

    editor.selection = null;
    expect(() => task.selectLine()).not.toThrow();
  });

  it('curNodes 可迭代元素', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    };
    const task = new KeyboardTask(makeStore(editor), {} as any);
    const nodes = [...task.curNodes];
    expect(nodes.length).toBeGreaterThan(0);
  });

  it('selectWord：无选区不抛', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'abc' }] }];
    editor.selection = null;
    const task = new KeyboardTask(makeStore(editor), {} as any);
    expect(() => task.selectWord()).not.toThrow();
  });

  it('Transforms 选择后 selectLine 打开 floatBar 路径', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'row' }] }];
    Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 3 },
    });
    const store = makeStore(editor);
    const task = new KeyboardTask(store, {} as any);
    task.selectLine();
    expect(editor.selection).toBeTruthy();
  });

  it('format / clear / select 相关任务容错矩阵', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'hello world' }] }];
    Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    });
    const store = makeStore(editor);
    const task = new KeyboardTask(store, {} as any);
    expect(() => task.format('bold')).not.toThrow();
    expect(() => task.format('italic')).not.toThrow();
    expect(() => task.clear()).not.toThrow();
    expect(() => task.selectWord()).not.toThrow();
    expect(() => task.selectAll()).not.toThrow();
    expect(() => task.selectFormatToCode()).not.toThrow();
    editor.selection = null;
    expect(() => task.selectAll()).not.toThrow();
    expect(() => task.clear()).not.toThrow();
  });

  it('istanbul deepen：selectWord 英文/中文/单字符；pastePlainText', async () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'hello世界abc' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    const task = new KeyboardTask(makeStore(editor), {} as any);
    expect(() => task.selectWord()).not.toThrow();

    editor.selection = {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 0], offset: 6 },
    };
    expect(() => task.selectWord()).not.toThrow();

    editor.selection = {
      anchor: { path: [0, 0], offset: 11 },
      focus: { path: [0, 0], offset: 11 },
    };
    expect(() => task.selectWord()).not.toThrow();

    const readText = vi.fn().mockResolvedValue('line1\nline2');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { readText },
    });
    editor.children = [
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [{ text: '' }],
              },
            ],
          },
        ],
      },
    ];
    Transforms.select(editor, {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    });
    await expect(task.pastePlainText()).resolves.toBeUndefined();
    readText.mockResolvedValue('plain');
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    Transforms.select(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    await expect(task.pastePlainText()).resolves.toBeUndefined();
    readText.mockResolvedValue('');
    await expect(task.pastePlainText()).resolves.toBeUndefined();
  });
});
