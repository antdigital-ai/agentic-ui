import { Node } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorStore } from '../../editor/store';
import { createMarkdownSlateEditor } from '../../editor/utils/createMarkdownSlateEditor';

describe('EditorStore pending content replacement', () => {
  let frames: Map<number, FrameRequestCallback>;
  let nextFrameId: number;

  const runNextFrame = () => {
    const frame = frames.entries().next().value;
    if (!frame) return;
    const [id, callback] = frame;
    frames.delete(id);
    callback(0);
  };

  const runAllFrames = () => {
    while (frames.size) runNextFrame();
  };

  const createStore = (initial = '') => {
    const editor = createMarkdownSlateEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: initial }] }];
    return new EditorStore({ current: editor });
  };

  const loadContent = (store: EditorStore, prefix = 'old') =>
    store.setMDContent(
      Array.from({ length: 12 }, (_, index) => `${prefix} ${index}`).join(
        '\n\n',
      ),
      undefined,
      { useRAF: true, chunkSize: 1, batchSize: 10 },
    );

  beforeEach(() => {
    frames = new Map();
    nextFrameId = 0;
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      const id = ++nextFrameId;
      frames.set(id, callback);
      return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('cancels a load when the still-empty document is explicitly cleared', async () => {
    const store = createStore();
    const cancelled = expect(loadContent(store)).rejects.toThrow(
      'Operation was cancelled',
    );

    store.setMDContent('');
    runAllFrames();

    await cancelled;
    expect(Node.string(store.editor)).toBe('');
  });

  it.each(['setMDContent', 'clearContent'] as const)(
    '%s prevents remaining frames from restoring partially loaded content',
    async (method) => {
      const store = createStore('initial');
      const cancelled = expect(loadContent(store)).rejects.toThrow(
        'Operation was cancelled',
      );
      runNextFrame();
      expect(Node.string(store.editor)).toContain('old 0');

      if (method === 'setMDContent') store.setMDContent('');
      else store.clearContent();
      runAllFrames();

      await cancelled;
      expect(Node.string(store.editor)).toBe('');
    },
  );

  it('cancels pending content even when a replacement matches the visible document', async () => {
    const store = createStore('initial');
    const cancelled = expect(loadContent(store)).rejects.toThrow(
      'Operation was cancelled',
    );

    store.setMDContent('initial');
    runAllFrames();

    await cancelled;
    expect(Node.string(store.editor)).toBe('initial');
  });

  it('an older cancelled frame cannot disable cancellation of the newer load', async () => {
    const store = createStore();
    const firstCancelled = expect(loadContent(store, 'first')).rejects.toThrow(
      'Operation was cancelled',
    );
    const secondCancelled = expect(
      loadContent(store, 'second'),
    ).rejects.toThrow('Operation was cancelled');

    runNextFrame();
    await firstCancelled;
    store.clearContent();
    runAllFrames();

    await secondCancelled;
    expect(Node.string(store.editor)).toBe('');
  });

  it('undefined leaves the current loading operation unchanged', async () => {
    const store = createStore();
    const pending = loadContent(store);

    store.setMDContent(undefined);
    runAllFrames();

    await pending;
    expect(Node.string(store.editor)).toContain('old 11');
  });
});
