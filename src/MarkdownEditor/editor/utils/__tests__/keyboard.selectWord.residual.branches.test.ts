/**
 * keyboard residual：selectWord 中英边界、selectFormatToCode、无选区。
 */
import { createEditor } from 'slate';
import { describe, expect, it, vi } from 'vitest';
import { KeyboardTask } from '../keyboard';

vi.mock('copy-to-clipboard', () => ({ default: vi.fn() }));

const makeStore = (editor: any) =>
  ({
    editor,
    setShowComment: vi.fn(),
    openFloatBar: vi.fn(),
  }) as any;

describe('KeyboardTask selectWord / format residual', () => {
  it('selectWord：英文单词边界', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'hello world' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    const task = new KeyboardTask(makeStore(editor), {} as any);
    task.selectWord();
    expect(editor.selection?.anchor.offset).toBe(0);
    expect(editor.selection?.focus.offset).toBe(5);
  });

  it('selectWord：中文边界；单字符扩展', () => {
    const editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: '你好世界' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    };
    const task = new KeyboardTask(makeStore(editor), {} as any);
    task.selectWord();
    expect(editor.selection).toBeTruthy();

    editor.children = [{ type: 'paragraph', children: [{ text: '!!!' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(() => task.selectWord()).not.toThrow();
  });

  it('selectFormatToCode：有/无选区', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'code' }] }];
    editor.selection = null;
    const task = new KeyboardTask(makeStore(editor), {} as any);
    expect(() => task.selectFormatToCode()).not.toThrow();
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    };
    expect(() => task.selectFormatToCode()).not.toThrow();
  });
});
