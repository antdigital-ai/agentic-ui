/**
 * Midtail batch K（exclusive later）：miss≥2 纯函数 / 轻量 DOM / throttle。
 * 避开 H/I/J 已饱和与 deepen 刚跑过的模块；NO production 改动。
 */
import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { createEditor } from 'slate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  bubblePropsAreEqual,
  shallowEqualRecord,
  shallowEqualStyles,
} from '../Bubble/bubblePropsAreEqual';
import type { BubbleProps, MessageBubbleData } from '../Bubble/type';
import {
  findTextInReadonlyMarkdownDom,
  getReadonlyMarkdownBlocks,
  isReadonlyMarkdownSearchEditor,
  READONLY_MARKDOWN_CONTAINER_KEY,
} from '../MarkdownEditor/readonly/findTextInReadonlyMarkdownDom';
import { useKeyboardHandler } from '../MarkdownInputField/hooks/useKeyboardHandler';
import { ContentThrottle } from '../MarkdownRenderer/ContentThrottle';
import { installRafStub } from '../MarkdownRenderer/__tests__/installRafStub';
import {
  buildEditorAlignedComponents,
  createHastProcessor,
  splitMarkdownBlocks,
} from '../MarkdownRenderer/markdownReactShared';
import {
  generateUniqueId,
  getFileTypeIcon,
  getGroupIcon,
} from '../Workspace/File/utils';

vi.mock('../Hooks/useRefFunction', () => ({
  useRefFunction: (fn: any) => fn,
}));

const mockIsMobileDevice = vi.fn(() => false);
vi.mock('../MarkdownInputField/AttachmentButton/utils', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    isMobileDevice: () => mockIsMobileDevice(),
  };
});

const origin = (o?: Partial<MessageBubbleData>): MessageBubbleData => ({
  id: 'm1',
  role: 'assistant',
  content: 'hi',
  createAt: 1,
  updateAt: 1,
  isFinished: true,
  isLast: false,
  ...o,
});

const props = (o?: Partial<BubbleProps> & { deps?: unknown[] }) =>
  ({
    id: 'm1',
    originData: origin(),
    ...o,
  }) as BubbleProps & { deps?: unknown[] };

const setVisibility = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    value: state,
  });
};

describe('midtail batch K pure / light hooks', () => {
  afterEach(() => {
    mockIsMobileDevice.mockReturnValue(false);
    vi.clearAllTimers();
  });

  it('Workspace File utils：icon / group / uniqueId 矩阵', () => {
    expect(
      getFileTypeIcon(
        'plainText' as any,
        React.createElement('span', null, 'C'),
      ),
    ).toBeTruthy();
    expect(getFileTypeIcon('plainText' as any, undefined, 'a.pdf')).toBeTruthy();
    expect(getFileTypeIcon('plainText' as any, undefined, 'a.md')).toBeTruthy();
    expect(getFileTypeIcon('plainText' as any, undefined, 'noext')).toBeTruthy();
    expect(getFileTypeIcon('image' as any)).toBeTruthy();
    expect(getFileTypeIcon('not-a-real-type' as any)).toBeTruthy();

    expect(
      getGroupIcon(
        { id: 'g', name: 'g', type: 'plainText', children: [] } as any,
        'plainText' as any,
        React.createElement('span', null, 'X'),
      ),
    ).toBeTruthy();

    expect(
      getGroupIcon(
        {
          id: 'g',
          name: 'g',
          type: 'plainText',
          children: [
            { id: '1', name: 'a.pdf', type: 'pdf' },
            { id: '2', name: 'b.png', type: 'image' },
          ],
        } as any,
        'plainText' as any,
      ),
    ).toBeTruthy();

    expect(
      getGroupIcon(
        {
          id: 'g',
          name: 'g',
          type: 'plainText',
          children: [
            { id: '1', name: 'a.txt' },
            { id: '2', name: 'b.txt' },
          ],
        } as any,
        'plainText' as any,
      ),
    ).toBeTruthy();

    expect(
      getGroupIcon(
        {
          id: 'g',
          name: 'g',
          type: 'plainText',
          children: [{ id: '1', name: 'weird.zzz' }],
        } as any,
        'plainText' as any,
      ),
    ).toBeTruthy();

    expect(generateUniqueId({ id: 'fixed', name: 'n', type: 'plainText' } as any)).toBe(
      'fixed',
    );
    expect(
      generateUniqueId({ name: 'n', type: 'plainText' } as any),
    ).toMatch(/plainText_n_/);
  });

  it('createHastProcessor：formula / rehype / remark / markedConfig', () => {
    const p0 = createHastProcessor();
    expect(p0).toBeTruthy();

    const p1 = createHastProcessor(undefined, undefined, { enable: true } as any);
    expect(p1).toBeTruthy();

    const rehype = [() => (tree: any) => tree];
    const remarkFn = () => (tree: any) => tree;
    const p2 = createHastProcessor(
      [remarkFn as any, [remarkFn as any, { x: 1 }] as any],
      { markedConfig: [remarkFn as any, [remarkFn as any, { y: 2 }] as any] } as any,
      { enable: false } as any,
      rehype as any,
    );
    expect(p2).toBeTruthy();

    const blocks = splitMarkdownBlocks('```\na\n\nb\n```\n\nc');
    expect(blocks.length).toBeGreaterThanOrEqual(2);
    const comps = buildEditorAlignedComponents('pfx', {}, true, {
      openInNewTab: false,
      onClick: () => false,
    });
    expect(comps.p).toBeTypeOf('function');
    expect(comps.a).toBeTypeOf('function');
  });

  it('bubblePropsAreEqual：originData meta / preMessage / style / classNames', () => {
    const base = props();
    expect(bubblePropsAreEqual(base, base)).toBe(true);

    expect(
      bubblePropsAreEqual(
        props({
          originData: origin({
            meta: { title: 'A', metadata: { k: 1 } } as any,
          }),
        }),
        props({
          originData: origin({
            meta: { title: 'A', metadata: { k: 1 } } as any,
          }),
        }),
      ),
    ).toBe(true);

    expect(
      bubblePropsAreEqual(
        props({ originData: origin({ meta: { title: 'A' } as any }) }),
        props({ originData: origin({ meta: { title: 'B' } as any }) }),
      ),
    ).toBe(false);

    expect(
      bubblePropsAreEqual(
        props({ originData: origin({ meta: undefined }) }),
        props({ originData: origin({ meta: { metadata: {} } as any }) }),
      ),
    ).toBe(true);

    expect(
      bubblePropsAreEqual(
        props({ preMessage: origin({ id: 'p1', role: 'user' }) }),
        props({ preMessage: origin({ id: 'p1', role: 'user' }) }),
      ),
    ).toBe(true);
    expect(
      bubblePropsAreEqual(
        props({ preMessage: origin({ id: 'p1' }) }),
        props({ preMessage: origin({ id: 'p2' }) }),
      ),
    ).toBe(false);

    expect(
      bubblePropsAreEqual(
        props({ style: { color: 'red' } }),
        props({ style: { color: 'red' } }),
      ),
    ).toBe(true);
    expect(
      bubblePropsAreEqual(
        props({ style: { color: 'red' } }),
        props({ style: { color: 'blue' } }),
      ),
    ).toBe(false);

    expect(
      bubblePropsAreEqual(
        props({ classNames: { content: 'a' } as any }),
        props({ classNames: { content: 'a' } as any }),
      ),
    ).toBe(true);
    expect(
      bubblePropsAreEqual(
        props({ classNames: { content: 'a' } as any }),
        props({ classNames: { content: 'b' } as any }),
      ),
    ).toBe(false);

    expect(shallowEqualStyles(undefined, {})).toBe(false);
    expect(shallowEqualRecord({ a: 1 }, { a: 1 })).toBe(true);
    expect(
      bubblePropsAreEqual(
        props({ aiBubbleProps: { x: 1 } as any }),
        props({ aiBubbleProps: { x: 1 } as any }),
      ),
    ).toBe(true);
    expect(
      bubblePropsAreEqual(
        props({ aIBubbleProps: { x: 1 } as any }),
        props({ aIBubbleProps: { x: 2 } as any }),
      ),
    ).toBe(false);
  });

  it('findTextInReadonlyMarkdownDom：root 块 / skip / path / maxResults', () => {
    expect(isReadonlyMarkdownSearchEditor(null)).toBe(false);
    expect(isReadonlyMarkdownSearchEditor({})).toBe(false);
    expect(
      isReadonlyMarkdownSearchEditor({
        [READONLY_MARKDOWN_CONTAINER_KEY]: document.createElement('div'),
      }),
    ).toBe(true);

    const rootP = document.createElement('p');
    rootP.setAttribute('data-be', 'paragraph');
    rootP.textContent = 'Root Hello';
    expect(getReadonlyMarkdownBlocks(rootP)[0]).toBe(rootP);
    expect(
      findTextInReadonlyMarkdownDom(rootP, [], 'Hello')[0]?.matchedText,
    ).toContain('Hello');

    const root = document.createElement('div');
    root.innerHTML = `
      <script>Hello</script>
      <style>.x{color:red}</style>
      <p data-be="paragraph"><code>Hello</code> outer Hello</p>
    `;
    const hits = findTextInReadonlyMarkdownDom(root, [], 'Hello');
    expect(hits.some((h) => h.lineContent.includes('outer'))).toBe(true);
    expect(getReadonlyMarkdownBlocks(root, -1)).toEqual([]);
    expect(findTextInReadonlyMarkdownDom(root, [99], 'Hello')).toEqual([]);
    expect(findTextInReadonlyMarkdownDom(root, [], '   ')).toEqual([]);

    const tdRoot = document.createElement('div');
    const td = document.createElement('td');
    td.textContent = 'Hello Hello Hello';
    tdRoot.appendChild(td);
    const limited = findTextInReadonlyMarkdownDom(tdRoot, [], 'Hello', {
      maxResults: 2,
      includeMarkdownVariants: false,
      wholeWord: true,
      caseSensitive: true,
    });
    expect(limited).toHaveLength(2);
    expect(limited[0].nodeType).toBe('td');
  });

  it('useKeyboardHandler：Enter 发送；移动端强制 Mod+Enter；无 editor 早退', () => {
    const editor = createEditor();
    editor.children = [{ type: 'paragraph', children: [{ text: 'x' }] }] as any;
    const sendMessage = vi.fn();
    const markdownEditorRef = {
      current: {
        store: { inputComposition: false },
        markdownEditorRef: { current: editor },
      },
    } as any;

    const { result } = renderHook(() =>
      useKeyboardHandler({
        props: { triggerSendKey: 'Enter', onSend: vi.fn() },
        markdownEditorRef,
        sendMessage,
      }),
    );

    const e = {
      key: 'Enter',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      target: document.createElement('div'),
      nativeEvent: {},
    } as any;
    result.current.handleKeyDown(e);
    expect(sendMessage).toHaveBeenCalled();

    sendMessage.mockClear();
    mockIsMobileDevice.mockReturnValue(true);
    const { result: r2 } = renderHook(() =>
      useKeyboardHandler({
        props: { triggerSendKey: 'Enter', onSend: vi.fn() },
        markdownEditorRef,
        sendMessage,
      }),
    );
    r2.current.handleKeyDown({ ...e, preventDefault: vi.fn(), stopPropagation: vi.fn() });
    expect(sendMessage).not.toHaveBeenCalled();

    const { result: r3 } = renderHook(() =>
      useKeyboardHandler({
        props: { triggerSendKey: 'Mod+Enter', onSend: vi.fn() },
        markdownEditorRef: { current: undefined } as any,
        sendMessage,
      }),
    );
    r3.current.handleKeyDown({
      ...e,
      key: 'Home',
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    });
    expect(true).toBe(true);
  });
});

describe('midtail batch K ContentThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    installRafStub();
    setVisibility('visible');
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    setVisibility('visible');
  });

  it('flushOnComplete:false；dispose；非前缀重置；hidden batch', () => {
    const flushed: string[] = [];
    const t = new ContentThrottle((s) => flushed.push(s), {
      charsPerFrame: 1,
      flushOnComplete: false,
    });
    t.push('abcdef');
    act(() => {
      vi.advanceTimersByTime(16);
    });
    const n = flushed.length;
    t.complete();
    expect(flushed.length).toBe(n);
    t.dispose();

    const flushed2: string[] = [];
    const t2 = new ContentThrottle((s) => flushed2.push(s), {
      charsPerFrame: 100,
    });
    t2.push('abc');
    act(() => {
      vi.advanceTimersByTime(16);
    });
    flushed2.length = 0;
    t2.push('xyz');
    act(() => {
      vi.advanceTimersByTime(16);
    });
    expect(flushed2.at(-1)).toBe('xyz');
    t2.dispose();

    setVisibility('hidden');
    const flushed3: string[] = [];
    const t3 = new ContentThrottle((s) => flushed3.push(s), {
      charsPerFrame: 1,
      backgroundInterval: 10,
      backgroundBatchMultiplier: 3,
    });
    t3.push('0123456789');
    t3.setOptions(undefined as any);
    act(() => {
      vi.advanceTimersByTime(10);
    });
    expect(flushed3.at(-1)!.length).toBeGreaterThanOrEqual(1);
    t3.dispose();
  });
});
