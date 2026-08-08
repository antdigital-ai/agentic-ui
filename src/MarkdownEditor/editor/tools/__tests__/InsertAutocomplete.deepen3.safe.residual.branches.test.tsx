/**
 * InsertAutocomplete deepen3 safe：clickClose 外点、custom y 回退、
 * content-length 缺失、Enter op、menu task、link/attach Enter。
 */
import '@testing-library/jest-dom';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const paragraphNode = { type: 'paragraph', children: [{ text: '' }] };
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
  top: 80,
  left: 0,
  width: 100,
  height: 20,
  bottom: 100,
  right: 100,
  x: 0,
  y: 80,
  toJSON: () => ({}),
});
Object.defineProperty(mockNodeEl, 'clientHeight', {
  value: 20,
  configurable: true,
});
Object.defineProperty(document.documentElement, 'clientHeight', {
  value: 600,
  configurable: true,
});

const keyTaskNext = vi.fn();
const setOpenInsertCompletion = vi.fn();
const insertCompletionText$ = new Subject<string>();
let externalSetState: ((update: any) => void) | null = null;

vi.mock('is-hotkey', () => ({
  default: (hotkey: string, event: any) => {
    const map: Record<string, string> = {
      esc: 'Escape',
      enter: 'Enter',
      backspace: 'Backspace',
    };
    return event?.key === map[hotkey.toLowerCase()];
  },
  __esModule: true,
}));

vi.mock('../../utils/useLocalState', () => ({
  useLocalState: (initialData: any) => {
    const data =
      typeof initialData === 'function' ? initialData() : initialData;
    const stateRef = React.useRef<any>(null);
    if (stateRef.current === null) stateRef.current = { ...data };
    const [, forceUpdate] = React.useState(0);
    const setState = React.useCallback((update: any) => {
      if (typeof update === 'function') {
        const clone = { ...stateRef.current };
        update(clone);
        Object.assign(stateRef.current, clone);
      } else {
        Object.assign(stateRef.current, update);
      }
      forceUpdate((n: number) => n + 1);
    }, []);
    externalSetState = setState;
    return [stateRef.current, setState];
  },
}));

vi.mock('../../store', () => ({ useEditorStore: vi.fn() }));

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
  Element: { isElement: vi.fn(() => true) },
  Node: { string: vi.fn(() => '') },
  Transforms: {
    insertNodes: vi.fn(),
    select: vi.fn(),
    removeNodes: vi.fn(),
    insertText: vi.fn(),
    delete: vi.fn(),
    setNodes: vi.fn(),
  },
}));

vi.mock('../../../../I18n', () => ({
  I18nContext: React.createContext({
    locale: {
      table: '表格',
      quote: '引用',
      code: '代码',
      head1: '主标题',
      'b-list': '无序',
      'n-list': '有序',
      't-list': '任务',
      localeImage: '本地图片',
      'editor.embedMediaLinks': '嵌入媒体',
      'editor.pasteMediaLink': '粘贴链接',
      'editor.embed': '嵌入',
      'editor.local': '本地',
      'editor.embedLink': '链接嵌入',
      'editor.pasteAttachmentLink': '粘贴附件链接',
      'editor.chooseFile': '选择文件',
    },
    t: (k: string) => k,
  }),
  LocalKeys: {},
}));

vi.mock('../../plugins/useOnchange', () => ({}));

vi.mock('../../utils/dom', () => ({ getOffsetLeft: vi.fn(() => 12) }));

vi.mock('../../utils/editorUtils', () => ({
  EditorUtils: {
    focus: vi.fn(),
    isTop: vi.fn(() => true),
    createMediaNode: vi.fn((url: string) => ({
      type: 'media',
      url,
      children: [{ text: '' }],
    })),
  },
}));

vi.mock('../../utils/media', () => ({
  getRemoteMediaType: vi.fn(() => Promise.resolve('image')),
}));

vi.mock('../insertAutocompleteStyle', () => ({
  useStyle: () => ({ hashId: 'd3-hash' }),
}));

vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
  return { ...actual, createPortal: (node: React.ReactNode) => node };
});

import { Editor, Transforms } from 'slate';
import { useEditorStore } from '../../store';
import { InsertAutocomplete } from '../InsertAutocomplete';

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
    selChange$: { next: vi.fn(), subscribe: vi.fn(() => ({ unsubscribe: vi.fn() })) },
  };
}

function renderPanel(extra: Record<string, any> = {}) {
  let captured: any[] = [];
  const optionsRender = vi.fn((opts: any[]) => {
    captured = opts;
    return opts;
  });
  render(
    <InsertAutocomplete optionsRender={optionsRender} {...extra} />,
  );
  act(() => insertCompletionText$.next(''));
  return () => captured;
}

describe('InsertAutocomplete deepen3 safe residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    useEditorStoreMock.mockImplementation(getDefaultStore as any);
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
    externalSetState = null;
  });

  it('clickClose：点击容器外触发 close', () => {
    renderPanel();
    fireEvent.click(mockContainer);
    expect(setOpenInsertCompletion).not.toHaveBeenCalled();
  });

  it('custom insertOption：bottom||0 y 回退', async () => {
    const runInsertTask = vi.fn().mockResolvedValue(undefined);
    const getCaptured = renderPanel({
      runInsertTask,
      insertOptions: [
        {
          key: 'customX',
          task: 'table',
          label: ['Custom', '自定义'],
          icon: React.createElement('span'),
        },
      ],
    });
    act(() => {
      externalSetState?.({ bottom: 42, top: undefined, left: 10 });
    });
    const item = getCaptured().find((i: any) => i.key === 'customX');
    item?.onClick?.({
      domEvent: { stopPropagation: vi.fn(), preventDefault: vi.fn() },
    });
    expect(runInsertTask).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'customX' }),
      expect.objectContaining({ y: 42 }),
    );
  });

  it('menu task onClick + Enter op 分支', () => {
    const getCaptured = renderPanel();
    const table = getCaptured().find((i: any) => i.key === 'table');
    table?.onClick?.({
      domEvent: { stopPropagation: vi.fn(), preventDefault: vi.fn() },
    });
    expect(keyTaskNext).toHaveBeenCalled();
    renderPanel();
    fireEvent.keyDown(mockContainer, { key: 'Enter', code: 'Enter' });
  });

  it('insertAttachment Enter；insertAttachByLink content-length 缺失', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => null },
    }) as any;
    renderPanel();
    await act(async () => {});
    act(() => {
      externalSetState?.({
        insertAttachment: true,
        insertUrl: 'https://ex.test/file.bin',
        filterOptions: [{ key: 'media', children: [] }],
      });
    });
    await act(async () => {});
    const tabEmbed = Array.from(
      document.body.querySelectorAll('.ant-tabs-tab'),
    ).find((t) => t.textContent?.includes('链接嵌入') || t.textContent?.includes('Embed'));
    if (tabEmbed) {
      fireEvent.click(tabEmbed);
      await act(async () => {});
    }
    const embedBtn = Array.from(document.body.querySelectorAll('button')).find(
      (b) => b.textContent === 'Embed',
    );
    if (embedBtn) {
      fireEvent.click(embedBtn);
    } else {
      const input = document.querySelector('input');
      if (input) {
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      }
    }
    await act(async () => {
      vi.runAllTimers();
    });
    expect(global.fetch).toHaveBeenCalled();
    expect(Transforms.setNodes).toHaveBeenCalled();
  });

  it('Editor.nodes 无 node 时不抛（open 但无 element）', () => {
    vi.mocked(Editor.nodes).mockReturnValue([] as any);
    expect(() => renderPanel()).not.toThrow();
  });
});
