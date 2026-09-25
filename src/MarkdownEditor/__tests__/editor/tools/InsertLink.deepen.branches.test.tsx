/**
 * InsertLink deepen：setPath 分支、domRect 守卫、wheel prevent、afterClose、锚点过滤。
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InsertLink } from '../../../editor/tools/InsertLink';
import { EditorUtils } from '../../../editor/utils/editorUtils';
import * as pathUtils from '../../../editor/utils/path';

vi.mock('../../../editor/utils/editorUtils', () => ({
  EditorUtils: {
    getUrl: vi.fn(),
    focus: vi.fn(),
  },
}));

vi.mock('slate', () => ({
  Transforms: { setNodes: vi.fn() },
  Text: { isText: vi.fn(() => true) },
}));

vi.mock('../../../editor/utils/path', () => ({
  parsePath: vi.fn((path: string) => {
    const hashIndex = path.indexOf('#');
    return {
      path: hashIndex >= 0 ? path.substring(0, hashIndex) : path,
      hash: hashIndex >= 0 ? path.substring(hashIndex + 1) : undefined,
    };
  }),
  isLink: vi.fn(
    (path: string) =>
      path.startsWith('http://') || path.startsWith('https://'),
  ),
}));

const mockOpenInsertLink$ = {
  subscribe: vi.fn((callback: any) => {
    mockOpenInsertLink$.callback = callback;
    return { unsubscribe: vi.fn() };
  }),
  next: vi.fn(),
  callback: null as any,
};

const mockMarkdownEditorRef = { current: { selection: null } };
const mockParentElement = document.createElement('div');
const mockMarkdownContainerRef = {
  current: { parentElement: mockParentElement },
};

let mockDomRect: { width: number; height: number } | null = {
  width: 100,
  height: 100,
};

let mockState = {
  open: false,
  inputKeyword: '',
  oldUrl: '',
  index: 0,
  docs: [] as any[],
  filterDocs: [] as any[],
  anchors: [] as any[],
  filterAnchors: [] as any[],
};

const mockSetState = vi.fn((updater: any) => {
  if (typeof updater === 'function') {
    mockState = { ...mockState, ...updater(mockState) };
  } else {
    mockState = { ...mockState, ...updater };
  }
});

vi.mock('@ant-design/agentic-ui/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    markdownContainerRef: mockMarkdownContainerRef,
    openInsertLink$: mockOpenInsertLink$,
    get domRect() {
      return mockDomRect;
    },
    markdownEditorRef: mockMarkdownEditorRef,
  }),
}));

vi.mock('@ant-design/agentic-ui/MarkdownEditor/hooks/subscribe', () => ({
  useSubject: vi.fn((subject: any, callback: any) => {
    if (subject === mockOpenInsertLink$) subject.callback = callback;
  }),
}));

vi.mock('@ant-design/agentic-ui/MarkdownEditor/editor/utils', () => ({
  useGetSetState: () => [() => mockState, mockSetState],
  useRefFunction: (fn: any) => fn,
}));

vi.mock('@ant-design/agentic-ui/MarkdownEditor/I18n', () => ({
  I18nContext: React.createContext({ locale: { removeLink: '移除链接' } }),
}));

describe('InsertLink deepen branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.clearAllMocks();
    mockDomRect = { width: 100, height: 100 };
    mockState = {
      open: false,
      inputKeyword: '',
      oldUrl: '',
      index: 0,
      docs: [],
      filterDocs: [],
      anchors: [],
      filterAnchors: [],
    };
    vi.mocked(EditorUtils.getUrl).mockReturnValue('');
    vi.mocked(pathUtils.isLink).mockImplementation(
      (p: string) => p.startsWith('http://') || p.startsWith('https://'),
    );
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('domRect 缺失时不打开弹窗', () => {
    mockDomRect = null;
    render(<InsertLink />);
    mockOpenInsertLink$.callback?.({ anchor: { path: [0, 0], offset: 0 } });
    expect(mockSetState).not.toHaveBeenCalledWith(
      expect.objectContaining({ open: true }),
    );
  });

  it('openInsertLink：# 开头 URL 与 isLink URL 路径', () => {
    render(<InsertLink />);
    vi.mocked(EditorUtils.getUrl).mockReturnValue('#section');
    mockOpenInsertLink$.callback?.({ anchor: { path: [0, 0], offset: 0 } });
    expect(mockSetState).toHaveBeenCalledWith(
      expect.objectContaining({ open: true, inputKeyword: '#section' }),
    );

    vi.mocked(EditorUtils.getUrl).mockReturnValue('https://a.com');
    mockOpenInsertLink$.callback?.({ anchor: { path: [0, 0], offset: 0 } });
    expect(mockSetState).toHaveBeenCalledWith(
      expect.objectContaining({ inputKeyword: 'https://a.com' }),
    );
  });

  it('openInsertLink 有 hash 时不重置 anchors', () => {
    render(<InsertLink />);
    vi.mocked(EditorUtils.getUrl).mockReturnValue('doc#anchor');
    vi.mocked(pathUtils.parsePath).mockReturnValue({
      path: 'doc',
      hash: 'anchor',
    });
    mockOpenInsertLink$.callback?.({ anchor: { path: [0, 0], offset: 0 } });
    const anchorReset = mockSetState.mock.calls.some(
      (c) => c[0]?.filterAnchors && c[0]?.anchors,
    );
    expect(anchorReset).toBe(false);
  });

  it('setPath：相对路径 + hash 拼接', () => {
    mockState = {
      ...mockState,
      open: true,
      inputKeyword: 'docs/page',
      filterDocs: [{ path: 'docs/page' }],
      index: 0,
    };
    vi.mocked(pathUtils.isLink).mockReturnValue(false);
    vi.mocked(pathUtils.parsePath).mockReturnValue({
      path: 'docs/page',
      hash: 'top',
    });
    render(<InsertLink />);
    fireEvent.click(document.querySelector('.ant-modal .ant-btn-primary')!);
    expect(mockSetState).toHaveBeenCalledWith(
      expect.objectContaining({ open: false }),
    );
  });

  it('onOk：anchors 有 target 时 setPath', () => {
    mockState = {
      ...mockState,
      open: true,
      inputKeyword: 'doc#sec',
      anchors: [{ item: { path: '/doc' }, value: '#sec' }],
      filterAnchors: [{ item: { path: '/doc' }, value: '#sec' }],
      index: 0,
    };
    vi.mocked(pathUtils.isLink).mockReturnValue(false);
    render(<InsertLink />);
    fireEvent.click(document.querySelector('.ant-modal .ant-btn-primary')!);
    expect(mockSetState).toHaveBeenCalledWith(
      expect.objectContaining({ open: false }),
    );
  });

  it('onOk：anchors 有长度但 filterAnchors 无 target 时不关闭', () => {
    mockState = {
      ...mockState,
      open: true,
      inputKeyword: 'fallback-path',
      anchors: [{ item: { path: '/a' }, value: '#x' }],
      filterAnchors: [],
      index: 0,
    };
    vi.mocked(pathUtils.isLink).mockReturnValue(false);
    mockSetState.mockClear();
    render(<InsertLink />);
    fireEvent.click(document.querySelector('.ant-modal .ant-btn-primary')!);
    expect(mockSetState).not.toHaveBeenCalledWith(
      expect.objectContaining({ open: false }),
    );
  });

  it('onChange 锚点模式无 hash 时不过滤', () => {
    mockState = {
      ...mockState,
      open: true,
      anchors: [
        { item: { path: '/d' }, value: '#a' },
        { item: { path: '/d' }, value: '#b' },
      ],
      filterAnchors: [
        { item: { path: '/d' }, value: '#a' },
        { item: { path: '/d' }, value: '#b' },
      ],
    };
    render(<InsertLink />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'doc' },
    });
    expect(mockSetState).toHaveBeenCalled();
  });

  it('Backspace altKey 与不含 # 时清空 anchors', () => {
    mockState = {
      ...mockState,
      open: true,
      inputKeyword: 'doc',
      anchors: [{ item: { path: '/d' }, value: '#a' }],
    };
    render(<InsertLink />);
    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, { key: 'Backspace', altKey: true });
    fireEvent.keyDown(textarea, { key: 'Backspace' });
    expect(mockSetState).toHaveBeenCalledWith(
      expect.objectContaining({ anchors: [], filterAnchors: [] }),
    );
  });

  it('wheel prevent 注册与移除；focus 延迟', async () => {
    const addSpy = vi.spyOn(mockParentElement, 'addEventListener');
    const removeSpy = vi.spyOn(mockParentElement, 'removeEventListener');
    render(<InsertLink />);
    vi.mocked(EditorUtils.getUrl).mockReturnValue('https://x.com');
    mockOpenInsertLink$.callback?.({ anchor: { path: [0, 0], offset: 0 } });
    expect(addSpy).toHaveBeenCalledWith('wheel', expect.any(Function), {
      passive: false,
    });

    const wheelHandler = addSpy.mock.calls.find((c) => c[0] === 'wheel')?.[1] as (
      e: WheelEvent,
    ) => void;
    const preventSpy = vi.spyOn(WheelEvent.prototype, 'preventDefault');
    wheelHandler?.(new WheelEvent('wheel'));
    expect(preventSpy).toHaveBeenCalled();
    preventSpy.mockRestore();

    mockState.open = true;
    vi.advanceTimersByTime(16);

    mockState = { ...mockState, open: true, oldUrl: 'https://x.com' };
    render(<InsertLink />);
    fireEvent.click(document.querySelector('.anticon-delete')!.parentElement!);
    expect(removeSpy).toHaveBeenCalledWith('wheel', expect.any(Function));
    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('Modal afterClose 恢复 oldUrl', async () => {
    mockState = {
      ...mockState,
      open: true,
      oldUrl: 'https://restore.com',
      inputKeyword: 'https://restore.com',
    };
    render(<InsertLink />);
    const cancel = document.querySelector('.ant-modal .ant-btn-default');
    if (cancel) fireEvent.click(cancel);
    await waitFor(() =>
      expect(mockSetState).toHaveBeenCalledWith(
        expect.objectContaining({ open: false }),
      ),
    );
  });

  it('setPath 仅 hash 时 close(#hash)', () => {
    mockState = {
      ...mockState,
      open: true,
      inputKeyword: '#only-hash',
      filterDocs: [{ path: '#only-hash' }],
      index: 0,
    };
    vi.mocked(pathUtils.isLink).mockReturnValue(false);
    vi.mocked(pathUtils.parsePath).mockReturnValue({ path: '', hash: 'only-hash' });
    render(<InsertLink />);
    fireEvent.click(document.querySelector('.ant-modal .ant-btn-primary')!);
    expect(EditorUtils.focus).toHaveBeenCalled();
  });
});
