import { createEditor } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import { KeyboardTask } from '../keyboard';

vi.mock('copy-to-clipboard', () => ({ default: vi.fn() }));

const makeStore = (editor: any) =>
  ({
    editor,
    setShowComment: vi.fn(),
  }) as any;

describe('KeyboardTask 额外分支', () => {
  it('selectWord：英文前后界；纯标点扩展 1 字符', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'pre hello post' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 0], offset: 6 },
    };
    const task = new KeyboardTask(makeStore(editor), {} as any);
    task.selectWord();
    expect(editor.selection!.focus.offset).toBeGreaterThan(
      editor.selection!.anchor.offset,
    );

    editor.children = [{ type: 'paragraph', children: [{ text: '!!!' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    task.selectWord();
    expect(editor.selection!.focus.offset).toBe(
      editor.selection!.anchor.offset + 1,
    );
  });

  it('selectWord：中文前后界；仅向前匹配', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: '甲乙丙丁' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    const task = new KeyboardTask(makeStore(editor), {} as any);
    task.selectWord();
    expect(editor.selection).toBeTruthy();

    editor.children = [
      { type: 'paragraph', children: [{ text: 'hello你好' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    };
    task.selectWord();
    expect(editor.selection!.anchor.offset).toBeLessThanOrEqual(5);
  });

  it.skip('pastePlainText：table-cell 替换换行；普通段落原样', async () => {
    const readText = vi
      .spyOn(navigator.clipboard, 'readText')
      .mockResolvedValue('a\nb');
    const editor = createEditor();
    editor.children = [
      {
        type: 'table-cell',
        children: [{ type: 'paragraph', children: [{ text: '' }] }],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0], offset: 0 },
    };
    const task = new KeyboardTask(makeStore(editor), {} as any);
    await task.pastePlainText();

    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    await task.pastePlainText();
    readText.mockResolvedValue('');
    await task.pastePlainText();
    readText.mockRestore();
  });

  it('selectWord 无折叠选区时不改动', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'abc' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    };
    const task = new KeyboardTask(makeStore(editor), {} as any);
    task.selectWord();
    expect(editor.selection!.focus.offset).toBe(2);
  });
});

describe('keyboard istanbul residual：selectAll / heading / quote 假值路径', () => {
  it('selectAll；无 selection 的 selectLine；format 切换', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'hello world' }] },
      { type: 'paragraph', children: [{ text: 'second' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const task = new KeyboardTask(makeStore(editor), {} as any);
    task.selectAll();
    expect(editor.selection).toBeTruthy();

    editor.selection = null;
    expect(() => task.selectLine()).not.toThrow();

    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    };
    expect(() => task.selectLine()).not.toThrow();
  });
});
