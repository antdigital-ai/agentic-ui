import { vi } from 'vitest';

// 共享的 EditorStore mock
export const mockEditorStore: Record<string, any> = {
  markdownEditorRef: { current: { focus: vi.fn() } },
  markdownContainerRef: { current: document.createElement('div') },
  readonly: false,
  store: {
    dragStart: vi.fn(),
    isLatestNode: vi.fn().mockReturnValue(false),
  },
  typewriter: false,
  editorProps: {
    titlePlaceholderContent: '请输入内容...',
  },
  setDomRect: vi.fn(),
  refreshFloatBar: false,
  setShowComment: vi.fn(),
  rootContainer: { current: undefined },
  domRect: null,
};

// 共享的 Slate React mock
export const mockSlateReact: Record<string, any> = {
  ReactEditor: {
    findPath: vi.fn().mockReturnValue([0, 0]),
  },
  useSlate: () => ({
    children: [],
  }),
};

// 共享的 Editor Utils mock
export const mockEditorUtils: Record<string, any> = {
  EditorUtils: {
    isDirtLeaf: vi.fn().mockReturnValue(false),
  },
};

// 共享的 DOM Utils mock
export const mockDomUtils: Record<string, any> = {
  slugify: vi.fn().mockReturnValue('test-slug'),
};

// 共享的 Slate mock
export const mockSlate: Record<string, any> = {
  Editor: {
    nodes: (editor: any) => {
      if (editor.selection?.focus?.path?.[0] === 1) {
        return [[{ type: 'code', children: [], language: 'javascript' }, [1]]];
      }
      return [[{ type: 'paragraph', children: [], level: 1 }, [0]]];
    },
    parent: () => [{ type: 'paragraph', children: [] }, [0]],
  },
  Element: {
    isElement: () => true,
  },
  Node: {
    string: () => '',
  },
  Text: {
    isText: () => true,
  },
  Transforms: {
    insertText: vi.fn(),
    select: vi.fn(),
  },
};

// 共享的 Chart.js mock
export const mockChartJs: Record<string, any> = {
  Chart: vi.fn().mockImplementation(() => ({
    render: vi.fn(),
    destroy: vi.fn(),
  })),
};

// 共享的 KaTeX mock
export const mockKatex: Record<string, any> = {
  renderToString: vi.fn().mockReturnValue('<span>rendered-katex</span>'),
  render: vi.fn(),
};

// 共享的 Copy to Clipboard mock
export const mockCopyToClipboard: (...args: any[]) => any = vi.fn().mockReturnValue(true);

// 共享的 Day.js mock
export const mockDayjs: Record<string, any> = {
  default: vi.fn().mockImplementation(() => ({
    format: vi.fn().mockReturnValue('2024-01-01'),
    toDate: vi.fn().mockReturnValue(new Date('2024-01-01')),
  })),
};

// 共享的 Mermaid mock
export const mockMermaid: Record<string, any> = {
  render: vi.fn().mockResolvedValue({ svg: '<svg>mermaid</svg>' }),
  initialize: vi.fn(),
  getConfig: vi.fn().mockReturnValue({}),
  setConfig: vi.fn(),
};

// 共享的 Resize Observer mock
export const mockResizeObserver: Record<string, any> = {
  ResizeObserver: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
};

// 设置全局 mock 的函数
export const setupGlobalMocks = () => {
  // 设置 ResizeObserver
  global.ResizeObserver = mockResizeObserver.ResizeObserver;

  // 设置 IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // 设置 matchMedia
  global.matchMedia = vi.fn().mockImplementation(() => ({
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  }));
};
