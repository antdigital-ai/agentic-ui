/**
 * store.ts 核心 deepen：setMDContent RAF/sync、fence 分片、skip、abort、私有辅助边界。
 */
import { act } from '@testing-library/react';
import { createEditor, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import { ReactEditor } from 'slate-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as parserMdToSchemaModule from '../parser/parserMdToSchema';
import * as parserSlateModule from '../parser/parserSlateNodeToMarkdown';
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

describe('EditorStore core deepen branches', () => {
  let store: EditorStore;
  let editor: any;
  let editorRef: { current: any };

  beforeEach(() => {
    editor = withMarkdown(withHistory(createEditor()));
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    editorRef = { current: editor };
    store = new EditorStore(editorRef, []);
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('findLatest 叶节点无 children 数组时返回当前 index', () => {
    expect((store as any).findLatest({ text: 'leaf-only' }, [3])).toEqual([3]);
  });

  it('_shouldSkipSetContent 比较抛错时不 skip 并继续写入', () => {
    vi.spyOn(parserSlateModule, 'parserSlateNodeToMarkdown').mockImplementation(
      () => {
        throw new Error('compare fail');
      },
    );
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    store.setMDContent('# fresh\n\nbody\n', [], { useRAF: false });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Failed to compare'),
      expect.any(Error),
    );
    expect(editor.children.length).toBeGreaterThan(0);
  });

  it('空串且文档已空时 skip clearContent', () => {
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    const clearSpy = vi.spyOn(store, 'clearContent');
    store.setMDContent('');
    expect(clearSpy).not.toHaveBeenCalled();
  });

  it('undefined md 早退；相同 trim 内容 skip', () => {
    const parserSpy = vi.spyOn(parserMdToSchemaModule, 'parserMdToSchema');
    store.setMDContent(undefined as any);
    expect(parserSpy).not.toHaveBeenCalled();

    editor.children = [{ type: 'paragraph', children: [{ text: 'same' }] }];
    parserSpy.mockClear();
    store.setMDContent('same', [], { useRAF: false });
    expect(parserSpy).not.toHaveBeenCalled();
  });

  it('_splitMarkdown：围栏异 marker 不闭合、短 fence、空 chunk、零宽正则', () => {
    const split = (store as any)._splitMarkdown.bind(store);
    const mixedFence = split('```js\na\n\nb\n~~~\n\nout', '\n\n');
    expect(mixedFence.join('')).toContain('```js');

    expect((store as any)._matchFence('`` x', 0)).toBeNull();
    expect((store as any)._matchFence('   ```\ncode', 0)).not.toBeNull();

    const leadingSep = split('\n\nonly-tail', '\n\n');
    expect(leadingSep.length).toBeGreaterThan(0);

    const zeroWidth = (store as any)._collectSeparatorMatches('aba', /(?=b)/);
    expect(zeroWidth.length).toBeGreaterThan(0);

    expect((store as any)._findLineEnd('no-newline', 0)).toBe(
      'no-newline'.length,
    );
  });

  it('长内容 !useRAF 同步分片；全空白 chunk 不替换', () => {
    editor.children = [{ type: 'paragraph', children: [{ text: 'keep' }] }];
    const long = Array.from({ length: 12 }, (_, i) => `## S${i}\n\nbody ${i}`).join(
      '\n\n',
    );
    store.setMDContent(long, [], { chunkSize: 20, useRAF: false });
    expect(editor.children.length).toBeGreaterThan(0);

    store.setMDContent('   \n\n   \n\n   ', [], {
      chunkSize: 2,
      useRAF: false,
    });
    expect(editor.children.length).toBeGreaterThan(0);
  });

  it('chunks>10 + useRAF：空白 chunk、空 schema、后续 append、进度回调异常', async () => {
    const rafQueue: FrameRequestCallback[] = [];
    vi.stubGlobal(
      'requestAnimationFrame',
      ((cb: FrameRequestCallback) => {
        rafQueue.push(cb);
        return rafQueue.length;
      }) as typeof requestAnimationFrame,
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const parserSpy = vi
      .spyOn(parserMdToSchemaModule, 'parserMdToSchema')
      .mockImplementation((chunk: string) => {
        if (!chunk.trim()) {
          return { schema: [] };
        }
        if (chunk.startsWith('EMPTY')) {
          return { schema: [] };
        }
        return {
          schema: [{ type: 'paragraph', children: [{ text: chunk.slice(0, 12) }] }],
        };
      });

    const insertSpy = vi.spyOn(Transforms, 'insertNodes');
    const onProgress = vi
      .fn()
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {
        throw new Error('progress boom');
      });

    const many = Array.from({ length: 14 }, (_, i) =>
      i === 3 ? '   \n\n' : i === 5 ? 'EMPTY\n\n' : `Block ${i}\n\n`,
    ).join('');

    const promise = store.setMDContent(many, [], {
      chunkSize: 4,
      useRAF: true,
      batchSize: 10,
      onProgress,
    }) as Promise<void>;

    while (rafQueue.length > 0) {
      const batch = rafQueue.splice(0);
      batch.forEach((cb) => cb(0));
    }

    await expect(promise).resolves.toBeUndefined();
    expect(insertSpy.mock.calls.length).toBeGreaterThan(0);
    expect(onProgress).toHaveBeenCalled();

    parserSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it('cancelSetMDContent abort 后 reject；signal.aborted 清理 rafId', async () => {
    const rafQueue: FrameRequestCallback[] = [];
    const cancelSpy = vi.fn();
    vi.stubGlobal(
      'requestAnimationFrame',
      ((cb: FrameRequestCallback) => {
        rafQueue.push(cb);
        return rafQueue.length;
      }) as typeof requestAnimationFrame,
    );
    vi.stubGlobal('cancelAnimationFrame', cancelSpy);

    const many = Array.from({ length: 14 }, (_, i) => `Z${i}\n\n`).join('');
    const promise = store.setMDContent(many, [], {
      chunkSize: 4,
      useRAF: true,
    }) as Promise<void>;

    store.cancelSetMDContent();
    if (rafQueue.length > 0) {
      rafQueue.shift()?.(0);
    }

    await expect(promise).rejects.toThrow(/cancel/i);
    expect(cancelSpy).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it('RAF 中 editor 失效时 reject 并 cancelAnimationFrame', async () => {
    const rafQueue: FrameRequestCallback[] = [];
    const cancelSpy = vi.fn();
    vi.stubGlobal(
      'requestAnimationFrame',
      ((cb: FrameRequestCallback) => {
        rafQueue.push(cb);
        return 1;
      }) as typeof requestAnimationFrame,
    );
    vi.stubGlobal('cancelAnimationFrame', cancelSpy);

    const many = Array.from({ length: 12 }, (_, i) => `E${i}\n\n`).join('');
    const promise = (store as any)._parseAndSetContentWithRAF(
      many.split('\n\n').filter(Boolean),
      [],
      50,
      undefined,
      new AbortController().signal,
    );

    editorRef.current = null as any;
    rafQueue.shift()?.(0);

    await expect(promise).rejects.toThrow(/no longer available/i);
    expect(cancelSpy).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it('单 chunk 解析失败 warn 后继续', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const parserSpy = vi
      .spyOn(parserMdToSchemaModule, 'parserMdToSchema')
      .mockImplementation((chunk: string) => {
        if (chunk === 'bad-chunk') {
          throw new Error('chunk fail');
        }
        return { schema: [{ type: 'paragraph', children: [{ text: 'ok' }] }] };
      });

    const rafQueue: FrameRequestCallback[] = [];
    vi.stubGlobal(
      'requestAnimationFrame',
      ((cb: FrameRequestCallback) => {
        rafQueue.push(cb);
        return rafQueue.length;
      }) as typeof requestAnimationFrame,
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const promise = (store as any)._parseAndSetContentWithRAF(
      ['good', 'bad-chunk', 'good2'],
      [],
      50,
      undefined,
      new AbortController().signal,
    );

    while (rafQueue.length > 0) {
      rafQueue.shift()?.(0);
    }

    await expect(promise).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to parse chunk'),
      expect.any(Error),
    );

    parserSpy.mockRestore();
    warnSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it('focus 空文档插入默认段落；ReactEditor.focus 失败不抛', () => {
    editor.children = [];
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(ReactEditor.focus).mockImplementation(() => {
      throw new Error('focus fail');
    });

    expect(() => store.focus()).not.toThrow();
    act(() => {
      vi.advanceTimersByTime(5);
    });
    expect(editor.children.length).toBeGreaterThan(0);
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('insertLink 非 http 路径使用 query name；head 块后插段落', () => {
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const insertSpy = vi.spyOn(Transforms, 'insertNodes');

    store.insertLink('name=local.pdf');
    expect(insertSpy).toHaveBeenCalledWith(
      editor,
      expect.objectContaining({ text: 'local.pdf' }),
      { select: true },
    );

    editor.children = [
      { type: 'head', level: 1, children: [{ text: 'Title' }] },
    ] as any;
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    insertSpy.mockClear();
    store.insertLink('https://after-head.example');
    expect(insertSpy).toHaveBeenCalledWith(
      editor,
      expect.objectContaining({ type: 'paragraph' }),
      expect.objectContaining({ select: true }),
    );
  });

  it('getHtmlContent 传入 options 时更新配置并返回字符串', () => {
    store.setMDContent('# Title\n\nbody\n', [], { useRAF: false });
    expect(store.getMDContent()).toContain('Title');
    const html = store.getHtmlContent();
    expect(typeof html).toBe('string');
    store.setRuntimeConfig({ markdownToHtmlOptions: { gfm: true } as any });
    expect(typeof store.getHtmlContent()).toBe('string');
  });

  it('setRuntimeConfig plugins undefined 保留已有 plugins', () => {
    const plugins = [{ name: 'keep-me' }] as any;
    store.setRuntimeConfig({ plugins });
    store.setRuntimeConfig({ plugins: undefined });
    expect(store.plugins).toBe(plugins);
  });

  it('短内容 useRAF true 仍走 _setShortContent', () => {
    store.setMDContent('short text', [], { useRAF: true });
    expect(store.getMDContent()).toContain('short');
  });
});
