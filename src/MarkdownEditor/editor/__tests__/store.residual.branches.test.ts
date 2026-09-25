/**
 * EditorStore 残留：list 无 children、setMDContent skip、http filePath。
 */
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
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

describe('EditorStore residual branches', () => {
  let store: EditorStore;
  let editor: any;

  beforeEach(() => {
    editor = withMarkdown(withHistory(withReact(createEditor())));
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    store = new EditorStore({ current: editor }, []);
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('setMDContent：相同内容跳过；undefined/空串早退', () => {
    store.setMDContent('hello', [], { useRAF: false });
    expect(() =>
      store.setMDContent('hello', [], { useRAF: false }),
    ).not.toThrow();
    expect(() => store.setMDContent(undefined as any)).not.toThrow();
    expect(() => store.setMDContent('')).not.toThrow();
  });

  it('setMDContent：useRAF true 可调度；取消不抛', () => {
    expect(() =>
      store.setMDContent('# a\n\n## b\n\nbody\n', [], {
        chunkSize: 4,
        useRAF: true,
      }),
    ).not.toThrow();
    vi.advanceTimersByTime(100);
  });

  it('setRuntimeConfig 部分字段；getHtmlContent 空 plugins', () => {
    store.setRuntimeConfig({ plugins: undefined });
    expect(() => store.getHtmlContent()).not.toThrow();
    store.setRuntimeConfig({
      plugins: [],
      parserConfig: {},
    });
    expect(store.plugins).toEqual([]);
  });

  it('insert media/link 路径容错', () => {
    expect(() =>
      (store as any).insertFileOrLink?.('/local/path.png', { name: 'p.png' }),
    ).not.toThrow();
    expect(() =>
      (store as any).insertFileOrLink?.('https://cdn.example/x.png', {
        name: 'x.png',
      }),
    ).not.toThrow();
  });

  it('setMDContent：blockquote / footnote / 空行 chunk', () => {
    expect(() =>
      store.setMDContent('> quote\n\npara\n\n[^1]: note\n', [], {
        useRAF: false,
      }),
    ).not.toThrow();
    const md = '\n\n\n# h\n\n\n';
    expect(() =>
      store.setMDContent(md, [], { useRAF: true, chunkSize: 1 }),
    ).not.toThrow();
    vi.advanceTimersByTime(80);
  });

  it('updateNodeList：空段落过滤与类型替换', () => {
    store.setMDContent('a\n\nb\n', [], { useRAF: false });
    expect(() =>
      (store as any).updateNodeList([
        { type: 'paragraph', children: [{ text: '' }] },
        { type: 'paragraph', children: [{ text: 'keep' }] },
        { type: 'head', level: 2, children: [{ text: 'H' }] },
      ]),
    ).not.toThrow();
  });
});
