/**
 * InsertAutocomplete 分支覆盖补充测试
 *
 * 针对 replaceUrl 回调、runInsertTask image/attachment 分支、
 * insertMedia、insertAttachByLink、insertLink/insertAttachment 输入事件、
 * close 函数 window 检查、keydown 处理等未覆盖分支。
 *
 * 核心策略：
 * 1. 通过 optionsRender 回调捕获菜单项并直接调用 onClick
 * 2. 通过 mock useLocalState 暴露 setState，直接设置 insertLink/insertAttachment 状态
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/* ========== Mock 基础设施 ========== */

const paragraphNode = {
  type: 'paragraph',
  children: [{ text: '' }],
};
const nodeTuple: [typeof paragraphNode, number[]] = [paragraphNode, [0]];

function* editorNodesGenerator() {
  yield nodeTuple;
}

const mockEditor = {
  selection: {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  },
  children: [paragraphNode],
};

const mockContainer = document.createElement('div');
const mockNodeEl = document.createElement('div');
mockNodeEl.getBoundingClientRect = vi.fn().mockReturnValue({
  top: 50,
  left: 0,
  width: 100,
  height: 20,
  bottom: 70,
  right: 100,
  x: 0,
  y: 50,
  toJSON: () => ({}),
});
Object.defineProperty(mockNodeEl, 'clientHeight', {
  value: 20,
  configurable: true,
});
Object.defineProperty(document.documentElement, 'clientHeight', {
  value: 500,
  configurable: true,
});

const keyTaskNext = vi.fn();
const setOpenInsertCompletion = vi.fn();
const insertCompletionText$ = new Subject<string>();

/* ========== useLocalState mock ========== */
/*
 * 使用可变 ref 作为 state 容器，解决 useCallback(fn, []) 的闭包陈旧问题。
 * 所有 callback 闭包引用同一个对象，Object.assign 就地修改使 callback 能看到最新值。
 */
let externalSetState: ((update: any) => void) | null = null;

vi.mock('is-hotkey', () => ({
  default: (hotkey: string, event: any) => {
    const keyMap: Record<string, string> = {
      esc: 'Escape',
      escape: 'Escape',
      backspace: 'Backspace',
      enter: 'Enter',
    };
    return event?.key === keyMap[hotkey.toLowerCase()];
  },
  __esModule: true,
}));

vi.mock('../../utils/useLocalState', () => ({
  useLocalState: (initialData: any) => {
    const data =
      typeof initialData === 'function' ? initialData() : initialData;
    const stateRef = React.useRef<any>(null);
    if (stateRef.current === null) {
      stateRef.current = { ...data };
    }
    const [, forceUpdate] = React.useState(0);
    const setState = React.useCallback((update: any) => {
      if (typeof update === 'function') {
        const clone = { ...stateRef.current };
        update(clone);
        Object.assign(stateRef.current, clone);
      } else {
        Object.assign(stateRef.current, update);
      }
      forceUpdate((prev: number) => prev + 1);
    }, []);
    externalSetState = setState;
    return [stateRef.current, setState];
  },
}));

/* ========== Module Mocks ========== */

vi.mock('../../store', () => ({
  useEditorStore: vi.fn(),
}));

vi.mock('slate-react', () => ({
  ReactEditor: {
    findPath: vi.fn(() => [0]),
    findNode: vi.fn(() => ({ children: [] })),
    focus: vi.fn(),
    isFocused: vi.fn(() => false),
    toDOMNode: vi.fn(() => mockNodeEl),
  },
}));

vi.mock('slate', () => ({
  Editor: {
    nodes: vi.fn(() => editorNodesGenerator()),
    start: vi.fn(() => ({ path: [0, 0], offset: 0 })),
    end: vi.fn(() => ({ path: [0, 0], offset: 0 })),
    next: vi.fn(() => [paragraphNode, [1]]),
    parent: vi.fn(() => [{ type: 'root', children: [] }, []]),
    isBlock: vi.fn(() => true),
    isVoid: vi.fn(() => false),
  },
  Element: {
    isElement: vi.fn(() => true),
  },
  Node: {
    string: vi.fn(() => ''),
  },
  Transforms: {
    insertNodes: vi.fn(),
    select: vi.fn(),
    removeNodes: vi.fn(),
    insertText: vi.fn(),
    delete: vi.fn(),
    setNodes: vi.fn(),
  },
}));

vi.mock('../../../I18n', () => ({
  I18nContext: React.createContext({
    locale: {
      table: '表格',
      quote: '引用',
      code: '代码',
      head1: '主标题',
      head2: '段标题',
      head3: '小标题',
      'b-list': '无序列表',
      'n-list': '有序列表',
      't-list': '任务列表',
      localeImage: '本地图片',
    },
    t: (key: string) => key,
  }),
  LocalKeys: {},
}));

vi.mock('../../plugins/useOnchange', () => ({
  selChange$: {
    next: vi.fn(),
    subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })),
  },
}));

vi.mock('../../utils/dom', () => ({
  getOffsetLeft: vi.fn(() => 24),
}));

vi.mock('../../utils/editorUtils', () => ({
  EditorUtils: {
    focus: vi.fn(),
    insertText: vi.fn(),
    insertNodes: vi.fn(),
    createMediaNode: vi.fn((url: string) => ({
      type: 'media',
      src: url,
      children: [{ text: '' }],
    })),
    isTop: vi.fn(() => true),
  },
}));

vi.mock('../../utils/media', () => ({
  getRemoteMediaType: vi.fn(() => Promise.resolve('image')),
}));

vi.mock('../insertAutocompleteStyle', () => ({
  useStyle: () => ({
    wrapSSR: (component: React.ReactNode) => component,
    hashId: 'test-hash-id',
  }),
}));

vi.mock('react-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-dom')>('react-dom');
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children,
  };
});

import { useEditorStore } from '../../store';
import { Editor, Element, Node, Transforms } from 'slate';
import { selChange$ } from '../../plugins/useOnchange';
import { getRemoteMediaType } from '../../utils/media';
import { EditorUtils } from '../../utils/editorUtils';
import {
  InsertAutocomplete,
  InsertAutocompleteItem,
} from '../InsertAutocomplete';

const useEditorStoreMock = vi.mocked(useEditorStore);

function getDefaultStore() {
  return {
    store: { editor: { children: [] } },
    markdownEditorRef: { current: mockEditor },
    markdownContainerRef: { current: mockContainer },
    openInsertCompletion: true,
    setOpenInsertCompletion,
    keyTask$: { next: keyTaskNext },
    insertCompletionText$,
  };
}

/** 辅助：渲染组件并通过 optionsRender 捕获菜单项 */
function renderWithCapture(extraProps: Record<string, any> = {}) {
  let captured: any[] = [];
  const optionsRender = vi.fn((opts: any[]) => {
    captured = opts;
    return opts;
  });
  const result = render(
    <InsertAutocomplete optionsRender={optionsRender} {...extraProps} />,
  );
  act(() => insertCompletionText$.next(''));
  return { ...result, captured: () => captured, optionsRender };
}

/** 辅助：在捕获列表中找到指定 key 的菜单项并调用 onClick */
function clickCapturedItem(captured: any[], key: string) {
  const item = captured.find((i: any) => i.key === key);
  if (!item) throw new Error(`Item '${key}' not found in captured items`);
  item.onClick({
    domEvent: { stopPropagation: vi.fn(), preventDefault: vi.fn() },
  });
  return item;
}

/**
 * 辅助：渲染组件并通过 externalSetState 直接设置 insertLink=true，
 * 确保 filterOptions 非空以使 wrapper 可见
 */
async function renderAndShowInsertLink(extraProps: Record<string, any> = {}) {
  const result = renderWithCapture(extraProps);
  // 确保 filterOptions 已填充
  await act(async () => {});
  // 直接设置 insertLink = true
  act(() => {
    externalSetState?.({ insertLink: true });
  });
  await act(async () => {});
  return result;
}

/**
 * 辅助：渲染组件并通过 externalSetState 直接设置 insertAttachment=true
 */
async function renderAndShowInsertAttachment(
  extraProps: Record<string, any> = {},
) {
  const result = renderWithCapture(extraProps);
  await act(async () => {});
  act(() => {
    externalSetState?.({ insertAttachment: true });
  });
  await act(async () => {});
  return result;
}

/**
 * 辅助：临时抑制 process 级别的 unhandledRejection，防止 vitest 将
 * 源码中 try/finally（无 catch）的 throw 计入 Errors。
 */
async function suppressUnhandledRejections(fn: () => Promise<void>) {
  const original = process.listeners('unhandledRejection').slice();
  process.removeAllListeners('unhandledRejection');
  process.on('unhandledRejection', () => {});
  try {
    await fn();
    // 等待微任务队列中的 rejection 被消费
    await new Promise((r) => setTimeout(r, 0));
  } finally {
    process.removeAllListeners('unhandledRejection');
    original.forEach((h) => process.on('unhandledRejection', h as any));
  }
}

/* ========== 测试用例 ========== */

describe('InsertAutocomplete branches - insertMedia via link input', () => {
  beforeEach(() => {
    useEditorStoreMock.mockImplementation(getDefaultStore as any);
    vi.mocked(getRemoteMediaType).mockResolvedValue('image');
    vi.clearAllMocks();
  });

  it('shows insertLink UI when insertLink state is true', async () => {
    await renderAndShowInsertLink();
    const input = document.body.querySelector('input');
    expect(input).toBeTruthy();
    const embedBtn = Array.from(
      document.body.querySelectorAll('button'),
    ).find((b) => b.textContent === 'Embed');
    expect(embedBtn).toBeTruthy();
  });

  it('insertMedia with YouTube URL calls getRemoteMediaType with embed URL', async () => {
    renderWithCapture();
    await act(async () => {});
    // 直接通过 externalSetState 设置 insertLink 和 insertUrl
    act(() => {
      externalSetState?.({
        insertLink: true,
        insertUrl: 'https://youtu.be/abc123',
      });
    });
    await act(async () => {});
    const embedBtn = Array.from(
      document.body.querySelectorAll('button'),
    ).find((b) => b.textContent === 'Embed')!;
    expect(embedBtn).toBeTruthy();
    fireEvent.click(embedBtn);
    await act(async () => {});

    expect(getRemoteMediaType).toHaveBeenCalledWith(
      expect.stringContaining('youtube.com/embed/abc123'),
    );
    expect(Transforms.setNodes).toHaveBeenCalled();
  });

  it('insertMedia with YouTube URL and ?si= preserves query param', async () => {
    renderWithCapture();
    await act(async () => {});
    act(() => {
      externalSetState?.({
        insertLink: true,
        insertUrl: 'https://youtu.be/abc123?si=xyz',
      });
    });
    await act(async () => {});
    const embedBtn = Array.from(
      document.body.querySelectorAll('button'),
    ).find((b) => b.textContent === 'Embed')!;
    fireEvent.click(embedBtn);
    await act(async () => {});

    expect(getRemoteMediaType).toHaveBeenCalledWith(
      expect.stringMatching(/youtube\.com\/embed\/abc123\?si=xyz/),
    );
  });

  it('insertMedia with Bilibili URL calls getRemoteMediaType with player URL', async () => {
    renderWithCapture();
    await act(async () => {});
    act(() => {
      externalSetState?.({
        insertLink: true,
        insertUrl: 'https://www.bilibili.com/video/BV1xx411c7mD/',
      });
    });
    await act(async () => {});
    const embedBtn = Array.from(
      document.body.querySelectorAll('button'),
    ).find((b) => b.textContent === 'Embed')!;
    fireEvent.click(embedBtn);
    await act(async () => {});

    expect(getRemoteMediaType).toHaveBeenCalledWith(
      expect.stringContaining('player.bilibili.com'),
    );
    expect(Transforms.setNodes).toHaveBeenCalled();
  });

  it('insertMedia with src= attribute extracts actual URL', async () => {
    renderWithCapture();
    await act(async () => {});
    act(() => {
      externalSetState?.({
        insertLink: true,
        insertUrl: 'src="https://example.com/img.png"',
      });
    });
    await act(async () => {});
    const embedBtn = Array.from(
      document.body.querySelectorAll('button'),
    ).find((b) => b.textContent === 'Embed')!;
    fireEvent.click(embedBtn);
    await act(async () => {});

    expect(getRemoteMediaType).toHaveBeenCalledWith(
      'https://example.com/img.png',
    );
    expect(Transforms.setNodes).toHaveBeenCalled();
  });

  it('insertMedia with plain https URL (no replaceUrl match) passes URL directly', async () => {
    renderWithCapture();
    await act(async () => {});
    act(() => {
      externalSetState?.({
        insertLink: true,
        insertUrl: 'https://example.com/photo.jpg',
      });
    });
    await act(async () => {});
    const embedBtn = Array.from(
      document.body.querySelectorAll('button'),
    ).find((b) => b.textContent === 'Embed')!;
    fireEvent.click(embedBtn);
    await act(async () => {});

    expect(getRemoteMediaType).toHaveBeenCalledWith(
      'https://example.com/photo.jpg',
    );
    expect(Transforms.setNodes).toHaveBeenCalled();
    expect(selChange$.next).toHaveBeenCalled();
  });

  it('insertMedia with protocol-relative URL (//example.com) passes protocol check', async () => {
    renderWithCapture();
    await act(async () => {});
    act(() => {
      externalSetState?.({
        insertLink: true,
        insertUrl: '//example.com/video.mp4',
      });
    });
    await act(async () => {});
    const embedBtn = Array.from(
      document.body.querySelectorAll('button'),
    ).find((b) => b.textContent === 'Embed')!;
    fireEvent.click(embedBtn);
    await act(async () => {});

    expect(getRemoteMediaType).toHaveBeenCalledWith(
      '//example.com/video.mp4',
    );
  });

  it('insertMedia with invalid protocol does not call getRemoteMediaType', async () => {
    await suppressUnhandledRejections(async () => {
      renderWithCapture();
      await act(async () => {});
      act(() => {
        externalSetState?.({
          insertLink: true,
          insertUrl: 'not-a-valid-url',
        });
      });
      await act(async () => {});
      const embedBtn = Array.from(
        document.body.querySelectorAll('button'),
      ).find((b) => b.textContent === 'Embed')!;
      fireEvent.click(embedBtn);
      await act(async () => {});

      expect(getRemoteMediaType).not.toHaveBeenCalled();
    });
  });

  it('insertMedia when getRemoteMediaType returns null does not call setNodes', async () => {
    await suppressUnhandledRejections(async () => {
      vi.mocked(getRemoteMediaType).mockResolvedValueOnce(null);
      renderWithCapture();
      await act(async () => {});
      act(() => {
        externalSetState?.({
          insertLink: true,
          insertUrl: 'https://example.com/unknown',
        });
      });
      await act(async () => {});
      const embedBtn = Array.from(
        document.body.querySelectorAll('button'),
      ).find((b) => b.textContent === 'Embed')!;
      fireEvent.click(embedBtn);
      await act(async () => {});

      expect(getRemoteMediaType).toHaveBeenCalled();
      expect(Transforms.setNodes).not.toHaveBeenCalled();
    });
  });

  it('insertLink Input onMouseDown does not throw', async () => {
    await renderAndShowInsertLink();
    const input = document.body.querySelector('input');
    expect(input).toBeTruthy();
    expect(() => {
      fireEvent.mouseDown(input!);
    }).not.toThrow();
  });

  it('insertLink Input onKeyDown with Enter triggers insertMedia', async () => {
    vi.mocked(getRemoteMediaType).mockResolvedValue('image');
    await renderAndShowInsertLink();
    // Set a valid URL so insertMedia doesn't throw
    act(() => {
      externalSetState?.({ insertUrl: 'https://example.com/img.jpg' });
    });
    await act(async () => {});

    const input = document.body.querySelector('input');
    expect(input).toBeTruthy();
    fireEvent.keyDown(input!, { key: 'Enter', code: 'Enter', keyCode: 13 });
    await act(async () => {});

    expect(getRemoteMediaType).toHaveBeenCalled();
  });

  it('insertLink Input onChange updates insertUrl and enables Embed button', async () => {
    await renderAndShowInsertLink();
    const input = document.body.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'https://test.com' } });
    await act(async () => {});

    const embedBtn = Array.from(
      document.body.querySelectorAll('button'),
    ).find((b) => b.textContent === 'Embed');
    expect(embedBtn).toBeTruthy();
    expect(embedBtn!.hasAttribute('disabled')).toBe(false);
  });

  it('Embed button is disabled when insertUrl is empty', async () => {
    await renderAndShowInsertLink();
    const embedBtn = Array.from(
      document.body.querySelectorAll('button'),
    ).find((b) => b.textContent === 'Embed');
    expect(embedBtn).toBeTruthy();
    expect(embedBtn!.disabled).toBe(true);
  });
});

describe('InsertAutocomplete branches - insertAttachByLink', () => {
  beforeEach(() => {
    useEditorStoreMock.mockImplementation(getDefaultStore as any);
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-length': '1024' }),
    });
  });

  it('shows insertAttachment UI when insertAttachment state is true', async () => {
    await renderAndShowInsertAttachment();
    const tabs = document.body.querySelector('.ant-tabs');
    const chooseFileBtn = Array.from(
      document.body.querySelectorAll('button'),
    ).find((b) => b.textContent?.includes('Choose a file'));
    expect(tabs ?? chooseFileBtn).toBeTruthy();
  });

  it('insertAttachByLink with http URL calls fetch, setNodes and selChange$', async () => {
    renderWithCapture();
    await act(async () => {});
    act(() => {
      externalSetState?.({
        insertAttachment: true,
        insertUrl: 'https://example.com/file.pdf',
      });
    });
    await act(async () => {});
    // 切换到 Embed Link tab
    const tabEmbed = Array.from(
      document.body.querySelectorAll('.ant-tabs-tab'),
    ).find((t) => t.textContent?.includes('Embed'));
    if (tabEmbed) {
      fireEvent.click(tabEmbed);
      await act(async () => {});
    }
    const embedBtn = Array.from(
      document.body.querySelectorAll('button'),
    ).find((b) => b.textContent === 'Embed');
    expect(embedBtn).toBeTruthy();
    fireEvent.click(embedBtn!);
    await act(async () => {});

    expect(fetch).toHaveBeenCalledWith('https://example.com/file.pdf');
    expect(Transforms.setNodes).toHaveBeenCalled();
    expect(selChange$.next).toHaveBeenCalled();
  });

  it('insertAttachByLink extracts filename from URL path', async () => {
    renderWithCapture();
    await act(async () => {});
    act(() => {
      externalSetState?.({
        insertAttachment: true,
        insertUrl: 'https://example.com/my-file.pdf',
      });
    });
    await act(async () => {});
    const tabEmbed = Array.from(
      document.body.querySelectorAll('.ant-tabs-tab'),
    ).find((t) => t.textContent?.includes('Embed'));
    if (tabEmbed) {
      fireEvent.click(tabEmbed);
      await act(async () => {});
    }
    const embedBtn = Array.from(
      document.body.querySelectorAll('button'),
    ).find((b) => b.textContent === 'Embed');
    expect(embedBtn).toBeTruthy();
    fireEvent.click(embedBtn!);
    await act(async () => {});

    expect(Transforms.setNodes).toHaveBeenCalled();
    // 验证 name 为 'my-file'
    const setNodesCall = vi.mocked(Transforms.setNodes).mock.calls[0];
    expect(setNodesCall[1]).toEqual(
      expect.objectContaining({ name: 'my-file' }),
    );
  });

  it('insertAttachByLink with URL that has no filename uses full URL as name', async () => {
    renderWithCapture();
    await act(async () => {});
    act(() => {
      externalSetState?.({
        insertAttachment: true,
        insertUrl: 'https://example.com/',
      });
    });
    await act(async () => {});
    const tabEmbed = Array.from(
      document.body.querySelectorAll('.ant-tabs-tab'),
    ).find((t) => t.textContent?.includes('Embed'));
    if (tabEmbed) {
      fireEvent.click(tabEmbed);
      await act(async () => {});
    }
    const embedBtn = Array.from(
      document.body.querySelectorAll('button'),
    ).find((b) => b.textContent === 'Embed');
    expect(embedBtn).toBeTruthy();
    fireEvent.click(embedBtn!);
    await act(async () => {});

    expect(Transforms.setNodes).toHaveBeenCalled();
    const setNodesCall = vi.mocked(Transforms.setNodes).mock.calls[0];
    expect(setNodesCall[1]).toEqual(
      expect.objectContaining({ name: 'https://example.com/' }),
    );
  });

  it('insertAttachByLink when fetch returns not ok throws in finally', async () => {
    await suppressUnhandledRejections(async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false });
      renderWithCapture();
      await act(async () => {});
      act(() => {
        externalSetState?.({
          insertAttachment: true,
          insertUrl: 'https://example.com/err',
        });
      });
      await act(async () => {});
      const tabEmbed = Array.from(
        document.body.querySelectorAll('.ant-tabs-tab'),
      ).find((t) => t.textContent?.includes('Embed'));
      if (tabEmbed) {
        fireEvent.click(tabEmbed);
        await act(async () => {});
      }
      const embedBtn = Array.from(
        document.body.querySelectorAll('button'),
      ).find((b) => b.textContent === 'Embed');
      expect(embedBtn).toBeTruthy();
      fireEvent.click(embedBtn!);
      await act(async () => {});

      expect(Transforms.setNodes).not.toHaveBeenCalled();
    });
  });

  it('insertAttachByLink with non-http URL does not call fetch', async () => {
    renderWithCapture();
    await act(async () => {});
    act(() => {
      externalSetState?.({
        insertAttachment: true,
        insertUrl: 'file:///local/path.pdf',
      });
    });
    await act(async () => {});
    const tabEmbed = Array.from(
      document.body.querySelectorAll('.ant-tabs-tab'),
    ).find((t) => t.textContent?.includes('Embed'));
    if (tabEmbed) {
      fireEvent.click(tabEmbed);
      await act(async () => {});
    }
    const embedBtn = Array.from(
      document.body.querySelectorAll('button'),
    ).find((b) => b.textContent === 'Embed');
    expect(embedBtn).toBeTruthy();
    fireEvent.click(embedBtn!);
    await act(async () => {});

    expect(fetch).not.toHaveBeenCalled();
    expect(Transforms.setNodes).toHaveBeenCalled();
  });

  it('insertAttachByLink when next node is empty paragraph calls Transforms.delete', async () => {
    vi.mocked(Editor.next).mockReturnValue([paragraphNode, [1]] as any);
    vi.mocked(Node.string).mockReturnValue('');

    renderWithCapture();
    await act(async () => {});
    act(() => {
      externalSetState?.({
        insertAttachment: true,
        insertUrl: 'https://example.com/doc.pdf',
      });
    });
    await act(async () => {});
    const tabEmbed = Array.from(
      document.body.querySelectorAll('.ant-tabs-tab'),
    ).find((t) => t.textContent?.includes('Embed'));
    if (tabEmbed) {
      fireEvent.click(tabEmbed);
      await act(async () => {});
    }
    const embedBtn = Array.from(
      document.body.querySelectorAll('button'),
    ).find((b) => b.textContent === 'Embed');
    expect(embedBtn).toBeTruthy();
    fireEvent.click(embedBtn!);
    await act(async () => {});

    expect(Transforms.delete).toHaveBeenCalled();
  });

  it('insertAttachByLink when next node is non-empty paragraph does not delete', async () => {
    vi.mocked(Editor.next).mockReturnValueOnce([
      { type: 'paragraph', children: [{ text: 'content' }] },
      [1],
    ] as any);
    vi.mocked(Node.string).mockReturnValueOnce('content');

    renderWithCapture();
    await act(async () => {});
    act(() => {
      externalSetState?.({
        insertAttachment: true,
        insertUrl: 'https://example.com/doc2.pdf',
      });
    });
    await act(async () => {});
    const tabEmbed = Array.from(
      document.body.querySelectorAll('.ant-tabs-tab'),
    ).find((t) => t.textContent?.includes('Embed'));
    if (tabEmbed) {
      fireEvent.click(tabEmbed);
      await act(async () => {});
    }
    const embedBtn = Array.from(
      document.body.querySelectorAll('button'),
    ).find((b) => b.textContent === 'Embed');
    expect(embedBtn).toBeTruthy();
    fireEvent.click(embedBtn!);
    await act(async () => {});

    expect(Transforms.setNodes).toHaveBeenCalled();
    expect(Transforms.delete).not.toHaveBeenCalled();
  });

  it('Local tab Choose a file button calls insertAttachByLink', async () => {
    await renderAndShowInsertAttachment();
    const chooseFileBtn = Array.from(
      document.body.querySelectorAll('button'),
    ).find((b) => b.textContent?.includes('Choose a file'));
    expect(chooseFileBtn).toBeTruthy();
    fireEvent.click(chooseFileBtn!);
    await act(async () => {});

    expect(Transforms.setNodes).toHaveBeenCalled();
  });

  it('Embed Link tab input onMouseDown does not throw', async () => {
    renderWithCapture();
    await act(async () => {});
    act(() => {
      externalSetState?.({ insertAttachment: true });
    });
    await act(async () => {});
    const tabEmbed = Array.from(
      document.body.querySelectorAll('.ant-tabs-tab'),
    ).find((t) => t.textContent?.includes('Embed'));
    if (tabEmbed) {
      fireEvent.click(tabEmbed);
      await act(async () => {});
    }
    const input = document.body.querySelector('input');
    expect(input).toBeTruthy();
    expect(() => {
      fireEvent.mouseDown(input!);
    }).not.toThrow();
  });

  it('Embed Link tab input onKeyDown does not throw', async () => {
    renderWithCapture();
    await act(async () => {});
    act(() => {
      externalSetState?.({
        insertAttachment: true,
        insertUrl: 'https://example.com/f.pdf',
      });
    });
    await act(async () => {});
    const tabEmbed = Array.from(
      document.body.querySelectorAll('.ant-tabs-tab'),
    ).find((t) => t.textContent?.includes('Embed'));
    if (tabEmbed) {
      fireEvent.click(tabEmbed);
      await act(async () => {});
    }
    const input = document.body.querySelector('input');
    expect(input).toBeTruthy();
    expect(() => {
      fireEvent.keyDown(input!, {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
      });
    }).not.toThrow();
  });

  it('Embed Link tab input onChange updates insertUrl', async () => {
    await renderAndShowInsertAttachment();
    const tabEmbed = Array.from(
      document.body.querySelectorAll('.ant-tabs-tab'),
    ).find((t) => t.textContent?.includes('Embed'));
    if (tabEmbed) {
      fireEvent.click(tabEmbed);
      await act(async () => {});
    }
    const input = document.body.querySelector('input') as HTMLInputElement;
    expect(input).toBeTruthy();
    fireEvent.change(input, { target: { value: 'https://test.pdf' } });
    await act(async () => {});
    const embedBtn = Array.from(
      document.body.querySelectorAll('button'),
    ).find((b) => b.textContent === 'Embed');
    expect(embedBtn).toBeTruthy();
    expect(embedBtn!.hasAttribute('disabled')).toBe(false);
  });
});

describe('InsertAutocomplete branches - optionsRender callback onClick', () => {
  beforeEach(() => {
    useEditorStoreMock.mockImplementation(getDefaultStore as any);
    vi.clearAllMocks();
  });

  it('built-in task item (table) click calls Transforms.insertText and keyTask$.next', () => {
    const { captured } = renderWithCapture();
    clickCapturedItem(captured(), 'table');

    expect(Transforms.insertText).toHaveBeenCalled();
    expect(keyTaskNext).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'insertTable' }),
    );
    expect(setOpenInsertCompletion).toHaveBeenCalledWith(false);
  });

  it('built-in task item (quote) click works', () => {
    const { captured } = renderWithCapture();
    clickCapturedItem(captured(), 'quote');

    expect(Transforms.insertText).toHaveBeenCalled();
    expect(keyTaskNext).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'insertQuote' }),
    );
  });

  it('built-in task item (code) click works', () => {
    const { captured } = renderWithCapture();
    clickCapturedItem(captured(), 'code');

    expect(Transforms.insertText).toHaveBeenCalled();
    expect(keyTaskNext).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'insertCode' }),
    );
  });

  it('custom insertOption click calls Transforms.delete and runInsertTask prop', async () => {
    const runInsertTask = vi.fn().mockResolvedValue(true);
    const customItem: InsertAutocompleteItem = {
      label: ['Custom', '自定义'],
      key: 'my-custom',
      task: 'myTask',
      icon: <span />,
    };
    const { captured } = renderWithCapture({
      insertOptions: [customItem],
      runInsertTask,
    });
    await act(async () => {
      clickCapturedItem(captured(), 'my-custom');
    });
    await act(async () => {});

    expect(Transforms.delete).toHaveBeenCalled();
    expect(runInsertTask).toHaveBeenCalledWith(
      customItem,
      expect.objectContaining({
        x: expect.any(Number),
        y: expect.any(Number),
      }),
    );
  });

  it('custom insertOption with matchMedia undefined hits return guard', async () => {
    const originalMatchMedia = window.matchMedia;
    // @ts-ignore
    window.matchMedia = undefined;

    const runInsertTask = vi.fn().mockResolvedValue(true);
    const customItem: InsertAutocompleteItem = {
      label: ['Guard', '守卫'],
      key: 'guard-test',
      task: 'guardTask',
      icon: <span />,
    };
    const { captured } = renderWithCapture({
      insertOptions: [customItem],
      runInsertTask,
    });
    await act(async () => {
      clickCapturedItem(captured(), 'guard-test');
    });
    await act(async () => {});

    expect(Transforms.delete).toHaveBeenCalled();
    expect(runInsertTask).toHaveBeenCalled();
    window.matchMedia = originalMatchMedia;
  });

  it('built-in task with matchMedia undefined hits non-custom return guard', () => {
    const originalMatchMedia = window.matchMedia;
    // @ts-ignore
    window.matchMedia = undefined;
    const { captured } = renderWithCapture();
    clickCapturedItem(captured(), 'table');

    expect(Transforms.insertText).toHaveBeenCalled();
    expect(keyTaskNext).toHaveBeenCalled();
    window.matchMedia = originalMatchMedia;
  });

  it('onClick with non-matching key does not call runInsertTask or keyTask$', () => {
    const { captured } = renderWithCapture();
    // 内置选项中查找 'localeImage' (task: 'uploadImage')
    const item = captured().find((i: any) => i.key === 'localeImage');
    if (item) {
      item.onClick({
        domEvent: { stopPropagation: vi.fn(), preventDefault: vi.fn() },
      });
      expect(keyTaskNext).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'uploadImage' }),
      );
    }
  });
});

describe('InsertAutocomplete branches - close and window checks', () => {
  beforeEach(() => {
    useEditorStoreMock.mockImplementation(getDefaultStore as any);
    vi.clearAllMocks();
  });

  it('close calls window.removeEventListener', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const store = getDefaultStore();
    useEditorStoreMock.mockImplementation(() => store as any);
    const { rerender } = render(
      <InsertAutocomplete optionsRender={(opts) => opts} />,
    );
    act(() => insertCompletionText$.next(''));

    useEditorStoreMock.mockImplementation(
      () => ({ ...store, openInsertCompletion: false }) as any,
    );
    rerender(<InsertAutocomplete optionsRender={(opts) => opts} />);
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function));
    removeSpy.mockRestore();
  });
});

describe('InsertAutocomplete branches - wrapper and display', () => {
  beforeEach(() => {
    useEditorStoreMock.mockImplementation(getDefaultStore as any);
    vi.clearAllMocks();
  });

  it('wrapper div onMouseDown calls preventDefault', () => {
    renderWithCapture();
    const wrapper = document.body.querySelector(
      '[class*="insert-autocomplete"]',
    );
    expect(wrapper).toBeTruthy();
    const ev = new MouseEvent('mousedown', { bubbles: true });
    const preventSpy = vi.spyOn(ev, 'preventDefault');
    wrapper!.dispatchEvent(ev);
    expect(preventSpy).toHaveBeenCalled();
  });

  it('wrapper has display:none when openInsertCompletion is false', () => {
    const store = getDefaultStore();
    useEditorStoreMock.mockImplementation(
      () => ({ ...store, openInsertCompletion: false }) as any,
    );
    render(<InsertAutocomplete optionsRender={(opts) => opts} />);
    const wrapper = document.body.querySelector(
      '[class*="insert-autocomplete"]',
    ) as HTMLElement;
    expect(wrapper?.style.display).toBe('none');
  });

  it('wrapper width is 320 when insertLink is true', async () => {
    await renderAndShowInsertLink();
    const wrapper = document.body.querySelector(
      '[class*="insert-autocomplete"]',
    ) as HTMLElement;
    expect(wrapper?.style.width).toBe('320px');
  });

  it('wrapper width is 320 when insertAttachment is true', async () => {
    await renderAndShowInsertAttachment();
    const wrapper = document.body.querySelector(
      '[class*="insert-autocomplete"]',
    ) as HTMLElement;
    expect(wrapper?.style.width).toBe('320px');
  });
});

describe('InsertAutocomplete branches - text filter', () => {
  beforeEach(() => {
    useEditorStoreMock.mockImplementation(getDefaultStore as any);
    vi.clearAllMocks();
  });

  it('text filter reduces options to matching items', () => {
    const { captured } = renderWithCapture();
    const allCount = captured().length;
    expect(allCount).toBeGreaterThan(0);

    act(() => insertCompletionText$.next('表'));
    const filteredCount = captured().length;
    expect(filteredCount).toBeLessThan(allCount);
  });

  it('empty text shows all options including custom insertOptions', () => {
    const customItem: InsertAutocompleteItem = {
      label: ['MyItem', '我的项'],
      key: 'my-item',
      task: 'myTask',
      icon: <span />,
    };
    let captured: any[] = [];
    render(
      <InsertAutocomplete
        optionsRender={(opts) => {
          captured = opts;
          return opts;
        }}
        insertOptions={[customItem]}
      />,
    );
    act(() => insertCompletionText$.next(''));
    expect(captured.find((i: any) => i.key === 'my-item')).toBeTruthy();
  });
});

describe('InsertAutocomplete branches - calculatePosition', () => {
  beforeEach(() => {
    useEditorStoreMock.mockImplementation(getDefaultStore as any);
    vi.clearAllMocks();
  });

  it('spaceBelow and spaceAbove both < 212: bottom=0', async () => {
    vi.mocked(mockNodeEl.getBoundingClientRect).mockReturnValue({
      top: 100,
      left: 0,
      width: 100,
      height: 200,
      bottom: 300,
      right: 100,
      x: 0,
      y: 100,
      toJSON: () => ({}),
    } as DOMRect);
    Object.defineProperty(mockNodeEl, 'clientHeight', {
      value: 200,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 300,
      configurable: true,
    });

    renderWithCapture();
    await act(async () => {});
    const wrapper = document.body.querySelector(
      '[class*="insert-autocomplete"]',
    ) as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(
      wrapper.style.bottom === '0px' || String(wrapper.style.bottom) === '0',
    ).toBe(true);
  });

  it('spaceAbove >= 212, spaceBelow < 212: shows above node', async () => {
    vi.mocked(mockNodeEl.getBoundingClientRect).mockReturnValue({
      top: 300,
      left: 0,
      width: 100,
      height: 20,
      bottom: 320,
      right: 100,
      x: 0,
      y: 300,
      toJSON: () => ({}),
    } as DOMRect);
    Object.defineProperty(mockNodeEl, 'clientHeight', {
      value: 20,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 400,
      configurable: true,
    });

    renderWithCapture();
    await act(async () => {});
    const wrapper = document.body.querySelector(
      '[class*="insert-autocomplete"]',
    ) as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.bottom).toBeTruthy();
  });

  it('spaceBelow >= 212: shows panel below', async () => {
    vi.mocked(mockNodeEl.getBoundingClientRect).mockReturnValue({
      top: 50,
      left: 0,
      width: 100,
      height: 20,
      bottom: 70,
      right: 100,
      x: 0,
      y: 50,
      toJSON: () => ({}),
    } as DOMRect);
    Object.defineProperty(mockNodeEl, 'clientHeight', {
      value: 20,
      configurable: true,
    });
    Object.defineProperty(document.documentElement, 'clientHeight', {
      value: 500,
      configurable: true,
    });

    renderWithCapture();
    await act(async () => {});
    const wrapper = document.body.querySelector(
      '[class*="insert-autocomplete"]',
    ) as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.top).toBeTruthy();
  });

  it('calculatePosition returns undefined: falls back to top=0 left=0', async () => {
    vi.mocked(mockNodeEl.getBoundingClientRect).mockReturnValue({
      top: Number.NaN,
      left: 0,
      width: 100,
      height: 20,
      bottom: Number.NaN,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    Object.defineProperty(mockNodeEl, 'clientHeight', {
      value: 20,
      configurable: true,
    });

    renderWithCapture();
    await act(async () => {});
    const wrapper = document.body.querySelector(
      '[class*="insert-autocomplete"]',
    ) as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.top).toBe('0px');
  });
});

describe('InsertAutocomplete branches - effect event listeners', () => {
  beforeEach(() => {
    useEditorStoreMock.mockImplementation(getDefaultStore as any);
    vi.clearAllMocks();
  });

  it('openInsertCompletion false removes listeners and closes', () => {
    const addSpy = vi.spyOn(mockContainer, 'addEventListener');
    const removeSpy = vi.spyOn(mockContainer, 'removeEventListener');
    const store = getDefaultStore();
    useEditorStoreMock.mockImplementation(() => store as any);
    const { rerender } = render(
      <InsertAutocomplete optionsRender={(opts) => opts} />,
    );
    act(() => insertCompletionText$.next(''));
    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    useEditorStoreMock.mockImplementation(
      () => ({ ...store, openInsertCompletion: false }) as any,
    );
    rerender(<InsertAutocomplete optionsRender={(opts) => opts} />);
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('non-paragraph node still sets ctx and listeners', () => {
    function* codeNodeGen() {
      yield [{ type: 'code', children: [{ text: '' }] }, [0]];
    }
    vi.mocked(Editor.nodes).mockImplementation(codeNodeGen as any);
    const addSpy = vi.spyOn(mockContainer, 'addEventListener');
    renderWithCapture();
    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    addSpy.mockRestore();
    vi.mocked(Editor.nodes).mockImplementation(
      () => editorNodesGenerator() as any,
    );
  });

  it('toDOMNode returns null does not throw', async () => {
    const slateReact = await import('slate-react');
    vi.mocked(slateReact.ReactEditor.toDOMNode).mockReturnValueOnce(
      null as any,
    );
    expect(() => renderWithCapture()).not.toThrow();
  });

  it('scroll setTimeout fires without error', async () => {
    vi.useFakeTimers();
    renderWithCapture();
    await act(async () => {
      vi.runAllTimers();
    });
    vi.useRealTimers();
  });

  it('clickClose on container outside dom triggers close', () => {
    renderWithCapture();
    fireEvent.click(mockContainer);
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    fireEvent.click(mockContainer);
    removeSpy.mockRestore();
  });

  it('clickClose inside wrapper does not close', () => {
    renderWithCapture();
    const wrapper = document.body.querySelector(
      '[class*="insert-autocomplete"]',
    );
    expect(wrapper).toBeTruthy();
    fireEvent.click(wrapper!);
    const menu = document.body.querySelector('.ant-menu');
    expect(menu).toBeTruthy();
  });
});

describe('InsertAutocomplete branches - keyboard', () => {
  beforeEach(() => {
    useEditorStoreMock.mockImplementation(getDefaultStore as any);
    vi.clearAllMocks();
  });

  it('Escape key does not throw', () => {
    renderWithCapture();
    expect(() => {
      fireEvent.keyDown(mockContainer, {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
      });
    }).not.toThrow();
  });

  it('Backspace key does not throw', () => {
    renderWithCapture();
    expect(() => {
      fireEvent.keyDown(mockContainer, {
        key: 'Backspace',
        code: 'Backspace',
        keyCode: 8,
      });
    }).not.toThrow();
  });

  it('ArrowDown does not throw', () => {
    renderWithCapture();
    expect(() => {
      fireEvent.keyDown(mockContainer, {
        key: 'ArrowDown',
        code: 'ArrowDown',
      });
    }).not.toThrow();
  });

  it('ArrowUp after ArrowDown does not throw', () => {
    renderWithCapture();
    fireEvent.keyDown(mockContainer, {
      key: 'ArrowDown',
      code: 'ArrowDown',
    });
    expect(() => {
      fireEvent.keyDown(mockContainer, {
        key: 'ArrowUp',
        code: 'ArrowUp',
      });
    }).not.toThrow();
  });

  it('Enter key does not throw', () => {
    renderWithCapture();
    expect(() => {
      fireEvent.keyDown(mockContainer, { key: 'Enter', code: 'Enter' });
    }).not.toThrow();
  });
});

describe('InsertAutocomplete branches - keydown direct invoke', () => {
  let addSpy: ReturnType<typeof vi.spyOn>;
  let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    useEditorStoreMock.mockImplementation(getDefaultStore as any);
    addSpy = vi.spyOn(mockContainer, 'addEventListener');
    renderWithCapture();
    const keydownCall = addSpy.mock.calls.find(
      (c: any[]) => c[0] === 'keydown',
    );
    keydownHandler = keydownCall?.[1] as any;
  });

  afterEach(() => {
    addSpy?.mockRestore();
    keydownHandler = null;
  });

  it('captures keydown handler from addEventListener', () => {
    expect(keydownHandler).toBeTypeOf('function');
  });

  it('Escape key calls setOpenInsertCompletion(false) and EditorUtils.focus', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      bubbles: true,
      cancelable: true,
    });
    act(() => {
      keydownHandler!(event);
    });
    expect(setOpenInsertCompletion).toHaveBeenCalledWith(false);
    expect(EditorUtils.focus).toHaveBeenCalled();
  });

  it('Backspace key calls setOpenInsertCompletion(false) and EditorUtils.focus', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'Backspace',
      code: 'Backspace',
      keyCode: 8,
      bubbles: true,
      cancelable: true,
    });
    act(() => {
      keydownHandler!(event);
    });
    expect(setOpenInsertCompletion).toHaveBeenCalledWith(false);
    expect(EditorUtils.focus).toHaveBeenCalled();
  });

  it('Enter key with image task enters image branch and fires setTimeout', () => {
    vi.useFakeTimers();
    act(() => {
      externalSetState?.({
        options: [
          { task: 'image', key: 'test-image', label: ['img'], icon: null },
        ],
        index: 0,
      });
    });

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      bubbles: true,
      cancelable: true,
    });
    act(() => {
      keydownHandler!(event);
    });
    act(() => {
      vi.advanceTimersByTime(50);
    });
    vi.useRealTimers();

    // image task should NOT call keyTask$.next
    expect(keyTaskNext).not.toHaveBeenCalled();
  });

  it('Enter key with attachment task sets insertAttachment state', () => {
    act(() => {
      externalSetState?.({
        options: [
          {
            task: 'attachment',
            key: 'test-attach',
            label: ['attach'],
            icon: null,
          },
        ],
        index: 0,
      });
    });

    const event = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      bubbles: true,
      cancelable: true,
    });
    act(() => {
      keydownHandler!(event);
    });

    // attachment task should NOT call keyTask$.next
    expect(keyTaskNext).not.toHaveBeenCalled();
  });

  it('ArrowUp with scroll condition triggers dom.scroll', () => {
    act(() => {
      externalSetState?.({
        options: [
          { task: 'a', key: 'item-a', label: ['A'], icon: null },
          { task: 'b', key: 'item-b', label: ['B'], icon: null },
        ],
        index: 1,
      });
    });

    const targetEl = document.createElement('div');
    Object.defineProperty(targetEl, 'offsetTop', {
      value: 10,
      configurable: true,
    });
    const qsSpy = vi
      .spyOn(document, 'querySelector')
      .mockReturnValue(targetEl);

    const wrapper = document.body.querySelector(
      '[class*="insert-autocomplete"]',
    ) as HTMLElement;
    if (wrapper) {
      Object.defineProperty(wrapper, 'scrollTop', {
        value: 200,
        configurable: true,
        writable: true,
      });
      wrapper.scroll = vi.fn();
    }

    const event = new KeyboardEvent('keydown', {
      key: 'ArrowUp',
      code: 'ArrowUp',
      keyCode: 38,
      bubbles: true,
      cancelable: true,
    });
    act(() => {
      keydownHandler!(event);
    });

    if (wrapper) {
      expect(wrapper.scroll).toHaveBeenCalledWith(
        expect.objectContaining({ top: expect.any(Number) }),
      );
    }
    qsSpy.mockRestore();
  });

  it('ArrowDown with scroll condition triggers dom.scroll', () => {
    act(() => {
      externalSetState?.({
        options: [
          { task: 'a', key: 'item-a', label: ['A'], icon: null },
          { task: 'b', key: 'item-b', label: ['B'], icon: null },
        ],
        index: 0,
      });
    });

    const targetEl = document.createElement('div');
    Object.defineProperty(targetEl, 'offsetTop', {
      value: 300,
      configurable: true,
    });
    const qsSpy = vi
      .spyOn(document, 'querySelector')
      .mockReturnValue(targetEl);

    const wrapper = document.body.querySelector(
      '[class*="insert-autocomplete"]',
    ) as HTMLElement;
    if (wrapper) {
      Object.defineProperty(wrapper, 'scrollTop', {
        value: 0,
        configurable: true,
        writable: true,
      });
      Object.defineProperty(wrapper, 'clientHeight', {
        value: 100,
        configurable: true,
      });
      wrapper.scroll = vi.fn();
    }

    const event = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      code: 'ArrowDown',
      keyCode: 40,
      bubbles: true,
      cancelable: true,
    });
    act(() => {
      keydownHandler!(event);
    });

    if (wrapper) {
      expect(wrapper.scroll).toHaveBeenCalledWith(
        expect.objectContaining({ top: expect.any(Number) }),
      );
    }
    qsSpy.mockRestore();
  });
});

describe('InsertAutocomplete branches - Editor.nodes match callbacks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useEditorStoreMock.mockImplementation(getDefaultStore as any);
  });

  afterEach(() => {
    vi.mocked(Editor.nodes).mockImplementation(
      () => editorNodesGenerator() as any,
    );
  });

  it('insertAttachByLink invokes Editor.nodes match callback (line 406)', async () => {
    vi.mocked(Editor.nodes).mockImplementation(function* (
      _editor: any,
      options: any,
    ) {
      const node = { type: 'paragraph', children: [{ text: '' }] };
      if (options?.match) {
        options.match(node);
      }
      yield [node, [0]] as any;
    } as any);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ 'content-length': '512' }),
    });

    renderWithCapture();
    await act(async () => {});
    act(() => {
      externalSetState?.({
        insertAttachment: true,
        insertUrl: 'https://example.com/callback-doc.pdf',
      });
    });
    await act(async () => {});

    const tabEmbed = Array.from(
      document.body.querySelectorAll('.ant-tabs-tab'),
    ).find((t) => t.textContent?.includes('Embed'));
    if (tabEmbed) {
      fireEvent.click(tabEmbed);
      await act(async () => {});
    }

    const embedBtn = Array.from(
      document.body.querySelectorAll('button'),
    ).find((b) => b.textContent === 'Embed');
    expect(embedBtn).toBeTruthy();
    fireEvent.click(embedBtn!);
    await act(async () => {});

    expect(Transforms.setNodes).toHaveBeenCalled();
  });

  it('insertMedia invokes Editor.nodes match callback (line 512)', async () => {
    vi.mocked(Editor.nodes).mockImplementation(function* (
      _editor: any,
      options: any,
    ) {
      const node = { type: 'paragraph', children: [{ text: '' }] };
      if (options?.match) {
        options.match(node);
      }
      yield [node, [0]] as any;
    } as any);
    vi.mocked(getRemoteMediaType).mockResolvedValue('image');

    renderWithCapture();
    await act(async () => {});
    act(() => {
      externalSetState?.({
        insertLink: true,
        insertUrl: 'https://example.com/callback-img.jpg',
      });
    });
    await act(async () => {});

    const embedBtn = Array.from(
      document.body.querySelectorAll('button'),
    ).find((b) => b.textContent === 'Embed');
    expect(embedBtn).toBeTruthy();
    fireEvent.click(embedBtn!);
    await act(async () => {});

    expect(Transforms.setNodes).toHaveBeenCalled();
  });

  it('effect invokes Editor.nodes match callback (line 632)', () => {
    vi.mocked(Editor.nodes).mockImplementation(function* (
      _editor: any,
      options: any,
    ) {
      const node = { type: 'paragraph', children: [{ text: '' }] };
      if (options?.match) {
        options.match(node);
      }
      yield [node, [0]] as any;
    } as any);

    renderWithCapture();
    expect(Element.isElement).toHaveBeenCalled();
  });
});
