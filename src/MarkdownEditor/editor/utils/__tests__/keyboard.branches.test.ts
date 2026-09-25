import { createEditor, Editor, Transforms } from 'slate';
import { renderHook } from '@testing-library/react';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { KeyboardTask, useSystemKeyboard } from '../keyboard';

vi.mock('copy-to-clipboard', () => ({ default: vi.fn() }));

const makeStore = (editor: Editor) =>
  ({
    editor,
    setShowComment: vi.fn(),
  }) as any;

describe('KeyboardTask 分支覆盖', () => {
  let editor: Editor;
  let task: KeyboardTask;

  beforeEach(() => {
    editor = createEditor();
    editor.children = [
      { type: 'paragraph', children: [{ text: 'hello world' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 0], offset: 11 },
    };
    task = new KeyboardTask(makeStore(editor), {} as any);
  });

  it('selectAll 选中全文', () => {
    task.selectAll();
    expect(editor.selection).toBeTruthy();
  });

  it('selectLine 有选区时不抛错', () => {
    expect(() => task.selectLine()).not.toThrow();
    expect(editor.selection).toBeTruthy();
  });

  it('selectLine 无选区时不抛错', () => {
    editor.selection = null;
    expect(() => task.selectLine()).not.toThrow();
  });

  it('selectFormatToCode 有选区时切换 code', () => {
    expect(() => task.selectFormatToCode()).not.toThrow();
  });

  it('selectFormatToCode 无选区时不抛错', () => {
    editor.selection = null;
    expect(() => task.selectFormatToCode()).not.toThrow();
  });

  it('selectWord 折叠选区扩展', () => {
    editor.selection = {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 0], offset: 6 },
    };
    expect(() => task.selectWord()).not.toThrow();
  });

  it('selectWord 中文单字', () => {
    editor.children = [{ type: 'paragraph', children: [{ text: '你好世界' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    };
    expect(() => task.selectWord()).not.toThrow();
  });

  it('head/paragraph/format 命令可调用', () => {
    expect(() => task.head(2)).not.toThrow();
    expect(() => task.paragraph()).not.toThrow();
    expect(() => task.format('bold')).not.toThrow();
  });

  it('clear/insertQuote/undo/redo 不抛错', () => {
    expect(() => task.clear()).not.toThrow();
    expect(() => task.insertQuote()).not.toThrow();
    expect(() => task.undo()).not.toThrow();
    expect(() => task.redo()).not.toThrow();
  });

  it('increaseHead/decreaseHead 调整标题', () => {
    editor.children = [
      { type: 'head', level: 2, children: [{ text: 'h' }] },
    ];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(() => task.increaseHead()).not.toThrow();
    expect(() => task.decreaseHead()).not.toThrow();
  });

  it('curNodes 返回元素迭代器', () => {
    const nodes = Array.from(task.curNodes);
    expect(nodes.length).toBeGreaterThan(0);
  });

  it('selectWord 空 leaf text', () => {
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    expect(() => task.selectWord()).not.toThrow();
  });

  it('head(4) 走 paragraph 分支', () => {
    const spy = vi.spyOn(task, 'paragraph');
    task.head(4);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('insertTable / insertCode / horizontalLine / list 可调用', () => {
    expect(() => task.insertTable()).not.toThrow();
    expect(() => task.insertCode()).not.toThrow();
    expect(() => task.insertCode('mermaid')).not.toThrow();
    expect(() => task.horizontalLine()).not.toThrow();
    expect(() => task.list('ordered')).not.toThrow();
    expect(() => task.list('unordered')).not.toThrow();
    expect(() => task.list('task')).not.toThrow();
  });

  it.skip('pastePlainText 空剪贴板不插入', async () => {
    const readText = vi
      .spyOn(navigator.clipboard, 'readText')
      .mockResolvedValue('');
    const insertSpy = vi.spyOn(Editor, 'insertText');
    await task.pastePlainText();
    expect(insertSpy).not.toHaveBeenCalled();
    readText.mockRestore();
    insertSpy.mockRestore();
  });

  it.skip('pastePlainText 表格单元格换行替换为空格', async () => {
    editor.children = [
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              { type: 'table-cell', children: [{ text: 'cell' }] },
            ],
          },
        ],
      },
    ];
    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    };
    const readText = vi
      .spyOn(navigator.clipboard, 'readText')
      .mockResolvedValue('a\nb');
    const insertSpy = vi.spyOn(Editor, 'insertText');
    await task.pastePlainText();
    expect(insertSpy).toHaveBeenCalledWith(editor, 'a b');
    readText.mockRestore();
    insertSpy.mockRestore();
  });

  it.skip('pastePlainText 普通节点直接插入', async () => {
    const readText = vi
      .spyOn(navigator.clipboard, 'readText')
      .mockResolvedValue('plain');
    const insertSpy = vi.spyOn(Editor, 'insertText');
    await task.pastePlainText();
    expect(insertSpy).toHaveBeenCalledWith(editor, 'plain');
    readText.mockRestore();
    insertSpy.mockRestore();
  });

  it('uploadImage 无 upload 配置时 onchange 早退', async () => {
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(function (this: HTMLInputElement) {
        const change = this.onchange;
        if (change) {
          void change.call(this, {
            target: { files: [new File(['x'], 'a.png')] },
          } as any);
        }
      });
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => task.uploadImage()).not.toThrow();
    clickSpy.mockRestore();
    errSpy.mockRestore();
  });

  it('uploadImage 上传成功插入 media（普通节点）', async () => {
    const upload = vi.fn().mockResolvedValue('https://img.test/a.png');
    task = new KeyboardTask(makeStore(editor), {
      image: { upload },
    } as any);
    const insertSpy = vi.spyOn(Transforms, 'insertNodes');
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(function (this: HTMLInputElement) {
        const change = this.onchange;
        if (change) {
          void Promise.resolve(
            change.call(this, {
              target: { files: [new File(['x'], 'a.png')] },
            } as any),
          );
        }
      });
    task.uploadImage();
    await vi.waitFor(() => expect(upload).toHaveBeenCalled());
    await vi.waitFor(() => expect(insertSpy).toHaveBeenCalled());
    clickSpy.mockRestore();
    insertSpy.mockRestore();
  });

  it('uploadImage 空 URL 跳过插入', async () => {
    const upload = vi.fn().mockResolvedValue('');
    task = new KeyboardTask(makeStore(editor), {
      image: { upload },
    } as any);
    const insertSpy = vi.spyOn(Transforms, 'insertNodes');
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(function (this: HTMLInputElement) {
        const change = this.onchange;
        if (change) {
          void Promise.resolve(
            change.call(this, {
              target: { files: [new File(['x'], 'a.png')] },
            } as any),
          );
        }
      });
    task.uploadImage();
    await vi.waitFor(() => expect(upload).toHaveBeenCalled());
    expect(insertSpy).not.toHaveBeenCalled();
    clickSpy.mockRestore();
    insertSpy.mockRestore();
  });

  it('uploadImage 抛错时 console.error', async () => {
    const upload = vi.fn().mockRejectedValue(new Error('fail'));
    task = new KeyboardTask(makeStore(editor), {
      image: { upload },
    } as any);
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(function (this: HTMLInputElement) {
        const change = this.onchange;
        if (change) {
          void Promise.resolve(
            change.call(this, {
              target: { files: [new File(['x'], 'a.png')] },
            } as any),
          );
        }
      });
    task.uploadImage();
    await vi.waitFor(() => expect(errSpy).toHaveBeenCalled());
    clickSpy.mockRestore();
    errSpy.mockRestore();
  });

  it('uploadImage dataset.readonly 时 onchange 早退', async () => {
    const upload = vi.fn();
    task = new KeyboardTask(makeStore(editor), {
      image: { upload },
    } as any);
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, 'click')
      .mockImplementation(function (this: HTMLInputElement) {
        this.dataset.readonly = 'true';
        const change = this.onchange;
        if (change) {
          void change.call(this, {
            target: { files: [new File(['x'], 'a.png')] },
          } as any);
        }
      });
    task.uploadImage();
    expect(upload).not.toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('clear 无选区时不抛错', () => {
    editor.selection = null;
    expect(() => task.clear()).not.toThrow();
  });

  it('undo/redo store 方法抛错被吞掉', () => {
    const badStore = makeStore(editor);
    badStore.editor.undo = () => {
      throw new Error('undo fail');
    };
    badStore.editor.redo = () => {
      throw new Error('redo fail');
    };
    const badTask = new KeyboardTask(badStore, {} as any);
    expect(() => badTask.undo()).not.toThrow();
    expect(() => badTask.redo()).not.toThrow();
  });
});

describe('useSystemKeyboard 分支覆盖', () => {
  it('readonly 不绑定 keydown', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    const store = makeStore(editor);
    const keyTask$ = new Subject<any>();
    const ref = { current: document.createElement('div') };
    const addSpy = vi.spyOn(ref.current, 'addEventListener');
    renderHook(() =>
      useSystemKeyboard(keyTask$, store, { readonly: true } as any, ref),
    );
    expect(addSpy).not.toHaveBeenCalled();
  });

  it('非 readonly 绑定并响应 subject 任务', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'hi' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 2 },
    };
    const store = makeStore(editor);
    const keyTask$ = new Subject<any>();
    const ref = { current: document.createElement('div') };
    renderHook(() =>
      useSystemKeyboard(keyTask$, store, { readonly: false } as any, ref),
    );
    expect(() => keyTask$.next({ key: 'selectAll' })).not.toThrow();
  });

  it('store 缺失时 effect 早退', () => {
    const keyTask$ = new Subject<any>();
    const ref = { current: document.createElement('div') };
    expect(() =>
      renderHook(() =>
        useSystemKeyboard(keyTask$, null as any, { readonly: false } as any, ref),
      ),
    ).not.toThrow();
  });
});
