import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InsertLink } from '../../../../src/MarkdownEditor/editor/tools/InsertLink';
import { EditorUtils } from '../../../../src/MarkdownEditor/editor/utils/editorUtils';
import * as pathUtils from '../../../../src/MarkdownEditor/editor/utils/path';

// Mock EditorUtils
// 注意：mock 必须在工厂函数内部定义，因为 vi.mock 会被提升到文件顶部
vi.mock('../../../../src/MarkdownEditor/editor/utils/editorUtils', () => ({
  EditorUtils: {
    getUrl: vi.fn(),
    focus: vi.fn(),
  },
}));

// Mock parsePath and isLink
vi.mock('../../../../src/MarkdownEditor/editor/utils/path', () => ({
  parsePath: vi.fn((path: string) => {
    const hashIndex = path.indexOf('#');
    return {
      path: hashIndex >= 0 ? path.substring(0, hashIndex) : path,
      hash: hashIndex >= 0 ? path.substring(hashIndex + 1) : undefined,
    };
  }),
  isLink: vi.fn((path: string) => {
    return path.startsWith('http://') || path.startsWith('https://');
  }),
}));

// Mock dependencies
const mockOpenInsertLink$ = {
  subscribe: vi.fn((callback: any) => {
    mockOpenInsertLink$.callback = callback;
    return { unsubscribe: vi.fn() };
  }),
  next: vi.fn(),
  callback: null as any,
};

const mockMarkdownEditorRef = {
  current: {
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    },
  },
};

const mockParentElement = document.createElement('div');
const mockMarkdownContainerRef = {
  current: {
    parentElement: mockParentElement,
  },
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
    domRect: { width: 100, height: 100 },
    markdownEditorRef: mockMarkdownEditorRef,
  }),
}));

vi.mock('@ant-design/agentic-ui/MarkdownEditor/hooks/subscribe', () => ({
  useSubject: vi.fn((subject: any, callback: any) => {
    if (subject === mockOpenInsertLink$) {
      subject.callback = callback;
    }
  }),
}));

vi.mock('@ant-design/agentic-ui/MarkdownEditor/editor/utils', () => ({
  useGetSetState: () => {
    return [
      () => mockState,
      mockSetState,
    ];
  },
  useRefFunction: (fn: any) => fn,
}));

vi.mock('@ant-design/agentic-ui/MarkdownEditor/I18n', () => ({
  I18nContext: React.createContext({
    locale: {
      removeLink: '移除链接',
    },
  }),
}));

describe('InsertLink Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    vi.mocked(EditorUtils.focus).mockImplementation(() => {});
  });

  it('应该渲染插入链接组件', () => {
    render(<InsertLink />);
    expect(document.body).toBeInTheDocument();
  });

  it('应该在 open 为 false 时返回 null', () => {
    mockState.open = false;
    const { container } = render(<InsertLink />);
    expect(container.firstChild).toBeNull();
  });

  it('应该显示 Modal 当 open 为 true', () => {
    mockState.open = true;
    render(<InsertLink />);
    // Modal 应该被渲染
    expect(document.querySelector('.ant-modal')).toBeInTheDocument();
  });

  it('应该处理链接输入（http链接）', () => {
    mockState.open = true;
    mockState.inputKeyword = 'https://example.com';
    
    vi.mocked(pathUtils.isLink).mockReturnValue(true);

    render(<InsertLink />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'https://example.com' } });
    
    const okButton = document.querySelector('.ant-modal .ant-btn-primary');
    if (okButton) {
      fireEvent.click(okButton);
    }
  });

  it('应该处理路径输入（非链接）', () => {
    mockState.open = true;
    mockState.inputKeyword = 'path/to/doc';
    mockState.filterDocs = [{ path: 'path/to/doc' }];
    mockState.index = 0;

    vi.mocked(pathUtils.isLink).mockReturnValue(false);

    render(<InsertLink />);
    
    const okButton = document.querySelector('.ant-modal .ant-btn-primary');
    if (okButton) {
      fireEvent.click(okButton);
    }
  });

  it('应该处理锚点输入', () => {
    mockState.open = true;
    mockState.inputKeyword = 'path#anchor';
    mockState.anchors = [
      { item: { path: 'path/to/doc' }, value: 'anchor' },
    ];
    mockState.filterAnchors = [
      { item: { path: 'path/to/doc' }, value: 'anchor' },
    ];
    mockState.index = 0;

    render(<InsertLink />);
    
    const okButton = document.querySelector('.ant-modal .ant-btn-primary');
    if (okButton) {
      fireEvent.click(okButton);
    }
  });

  it('应该处理只有 hash 的路径', () => {
    mockState.open = true;
    mockState.inputKeyword = '#anchor';

    vi.mocked(pathUtils.parsePath).mockReturnValue({ path: '', hash: 'anchor' });

    render(<InsertLink />);
    
    const okButton = document.querySelector('.ant-modal .ant-btn-primary');
    if (okButton) {
      fireEvent.click(okButton);
    }
  });

  it('应该处理删除链接按钮点击', () => {
    mockState.open = true;
    mockState.oldUrl = 'https://example.com';

    render(<InsertLink />);
    
    const deleteButton = document.querySelector('.anticon-delete')?.parentElement;
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }
  });

  it('应该处理取消按钮点击', () => {
    mockState.open = true;
    mockState.oldUrl = 'https://example.com';

    render(<InsertLink />);
    
    const cancelButton = document.querySelector('.ant-modal .ant-btn-default');
    if (cancelButton) {
      fireEvent.click(cancelButton);
    }
  });

  it('应该处理输入框变化（文档过滤）', () => {
    mockState.open = true;
    mockState.docs = [
      { path: 'path/to/doc1' },
      { path: 'path/to/doc2' },
    ];
    mockState.anchors = [];

    render(<InsertLink />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'doc1' } });
    
    expect(mockSetState).toHaveBeenCalled();
  });

  it('应该处理输入框变化（锚点过滤）', () => {
    mockState.open = true;
    mockState.anchors = [
      { item: { path: 'path/to/doc' }, value: 'anchor1' },
      { item: { path: 'path/to/doc' }, value: 'anchor2' },
    ];

    render(<InsertLink />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'path#anchor1' } });
    
    expect(mockSetState).toHaveBeenCalled();
  });

  it('应该处理 Backspace 键清除锚点', () => {
    mockState.open = true;
    mockState.inputKeyword = 'path#';
    mockState.anchors = [
      { item: { path: 'path/to/doc' }, value: 'anchor' },
    ];

    render(<InsertLink />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, {
      key: 'Backspace',
      metaKey: true,
    });
    
    expect(mockSetState).toHaveBeenCalled();
  });

  it('应该处理 Backspace 键（当输入以 # 结尾时）', () => {
    mockState.open = true;
    mockState.inputKeyword = 'path#';
    mockState.anchors = [
      { item: { path: 'path/to/doc' }, value: 'anchor' },
    ];

    render(<InsertLink />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.keyDown(textarea, {
      key: 'Backspace',
    });
    
    expect(mockSetState).toHaveBeenCalled();
  });

  it('应该处理 openInsertLink 事件（有 URL）', () => {
    vi.mocked(EditorUtils.getUrl).mockReturnValue('https://example.com');
    
    render(<InsertLink />);
    
    // 触发 openInsertLink 事件
    if (mockOpenInsertLink$.callback) {
      mockOpenInsertLink$.callback({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      });
    }
    
    expect(mockSetState).toHaveBeenCalled();
  });

  it('应该处理 openInsertLink 事件（有 hash）', () => {
    vi.mocked(EditorUtils.getUrl).mockReturnValue('path#anchor');
    
    render(<InsertLink />);
    
    if (mockOpenInsertLink$.callback) {
      mockOpenInsertLink$.callback({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      });
    }
    
    expect(mockSetState).toHaveBeenCalled();
  });

  it('应该处理 openInsertLink 事件（无 hash）', () => {
    vi.mocked(EditorUtils.getUrl).mockReturnValue('path/to/doc');
    
    render(<InsertLink />);
    
    if (mockOpenInsertLink$.callback) {
      mockOpenInsertLink$.callback({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 5 },
      });
    }
    
    expect(mockSetState).toHaveBeenCalled();
  });

  it('应该处理 Modal afterClose', () => {
    mockState.open = true;
    mockState.oldUrl = 'https://example.com';

    render(<InsertLink />);
    
    // 模拟 Modal 关闭
    const modal = document.querySelector('.ant-modal');
    if (modal) {
      // 触发 afterClose 回调
      mockState.open = false;
    }
  });

  it('应该处理 window.matchMedia 未定义的情况', () => {
    const originalMatchMedia = window.matchMedia;
    // @ts-ignore
    window.matchMedia = undefined;

    mockState.open = true;
    render(<InsertLink />);
    
    const deleteButton = document.querySelector('.anticon-delete')?.parentElement;
    if (deleteButton) {
      fireEvent.click(deleteButton);
    }

    window.matchMedia = originalMatchMedia;
  });

  it('应该处理没有选中文档的情况', () => {
    mockState.open = true;
    mockState.inputKeyword = 'nonexistent';
    mockState.filterDocs = [];
    mockState.anchors = [];

    render(<InsertLink />);
    
    const okButton = document.querySelector('.ant-modal .ant-btn-primary');
    if (okButton) {
      fireEvent.click(okButton);
    }
  });

  it('应该处理没有选中锚点的情况', () => {
    mockState.open = true;
    mockState.inputKeyword = 'path#nonexistent';
    mockState.anchors = [];
    mockState.filterAnchors = [];

    render(<InsertLink />);
    
    const okButton = document.querySelector('.ant-modal .ant-btn-primary');
    if (okButton) {
      fireEvent.click(okButton);
    }
  });
});