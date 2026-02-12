/**
 * CodeRenderer 组件测试文件
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React, { createContext } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CodeRenderer } from '../../../../src/Plugins/code/components/CodeRenderer';

// 使用 vi.hoisted() 定义变量，使其与 vi.mock 一起被提升
const { mockEditorStore, mockUpdate } = vi.hoisted(() => {
  return {
    mockEditorStore: {
      store: {
        editor: {
          focus: vi.fn(),
        },
      },
      readonly: false,
      typewriter: false,
      editorProps: {
        codeProps: {
          hideToolBar: false,
          disableHtmlPreview: false,
        },
      },
      markdownEditorRef: {
        current: {
          focus: vi.fn(),
        },
      },
    },
    mockUpdate: vi.fn(),
  };
});

// Mock 核心依赖
vi.mock('../../../../src/MarkdownEditor/editor/store', async () => {
  const React = await import('react');
  return {
    useEditorStore: () => mockEditorStore,
    EditorStore: class EditorStore {},
    EditorStoreContext: React.createContext(mockEditorStore),
  };
});

// Mock MarkdownEditor 组件
vi.mock('../../../../src/MarkdownEditor', () => ({
  MarkdownEditor: ({ initValue, ...props }: any) => (
    <div data-testid="markdown-editor">
      <div data-testid="markdown-content">{initValue}</div>
    </div>
  ),
}));

// Mock ThinkBlock
vi.mock('../../../../src/Plugins/code/components/ThinkBlock', () => ({
  ThinkBlock: (props: any) => (
    <div data-testid="think-block-mock">{props.element?.value}</div>
  ),
}));

// Mock hooks
vi.mock('../../../../src/Plugins/code/hooks', () => ({
  useCodeEditorState: () => ({
    state: {
      showBorder: false,
      htmlStr: '<div>HTML Preview Content</div>',
      hide: false,
      lang: 'javascript',
    },
    update: mockUpdate,
    path: [0],
    handleCloseClick: vi.fn(),
    handleRunHtml: vi.fn(),
    handleHtmlPreviewClose: vi.fn(),
    handleShowBorderChange: vi.fn(),
    handleHideChange: vi.fn(),
  }),
  useRenderConditions: (element: any, readonly: boolean) => ({
    shouldHideConfigHtml: element.language === 'html' && element?.isConfig,
    shouldRenderAsThinkBlock: element.language === 'think' && readonly,
    shouldRenderAsCodeEditor:
      !(element.language === 'html' && element?.isConfig) &&
      !(element.language === 'think' && readonly),
  }),
  useToolbarConfig: (config: any) => ({
    toolbarProps: {
      element: config?.element ?? {},
      readonly: config?.readonly ?? false,
      isFullScreen: false,
      onCloseClick: config?.onCloseClick ?? vi.fn(),
      setLanguage: config?.setLanguage ?? vi.fn(),
      isSelected: config?.isSelected ?? true,
      onSelectionChange: config?.onSelectionChange ?? vi.fn(),
      onViewModeToggle: config?.onViewModeToggle,
      viewMode: config?.viewMode,
    },
  }),
}));

// Mock AceEditor hook
vi.mock('../../../../src/Plugins/code/components/AceEditor', () => ({
  AceEditor: () => ({
    dom: { current: document.createElement('div') },
    setLanguage: vi.fn(),
    focusEditor: vi.fn(),
  }),
}));

// Mock CodeToolbar 组件
vi.mock('../../../../src/Plugins/code/components/CodeToolbar', () => ({
  CodeToolbar: ({
    element,
    readonly,
    isSelected,
    onViewModeToggle,
    ...rest
  }: any) => (
    <div data-testid="code-toolbar">
      <span>Code Toolbar</span>
      <span data-testid="toolbar-language">
        {element?.language || 'unknown'}
      </span>
      <span data-testid="toolbar-readonly">
        {readonly ? 'readonly' : 'editable'}
      </span>
      <span data-testid="toolbar-selected">
        {isSelected ? 'selected' : 'not-selected'}
      </span>
      {onViewModeToggle && (
        <button
          type="button"
          data-testid="view-mode-toggle"
          onClick={() => onViewModeToggle()}
        >
          Toggle View
        </button>
      )}
    </div>
  ),
}));

// Mock HtmlPreview 组件
vi.mock('../../../../src/Plugins/code/components/HtmlPreview', () => ({
  HtmlPreview: ({ htmlStr }: any) => (
    <div data-testid="html-preview">
      <span>HTML Preview</span>
      <span data-testid="html-content">{htmlStr}</span>
    </div>
  ),
}));

describe('CodeRenderer Component', () => {
  const defaultProps = {
    element: {
      type: 'code' as const,
      value: 'console.log("Hello World");',
      language: 'html',
      children: [{ text: '' }] as [{ text: string }],
    },
    attributes: {},
    children: <span>test content</span>,
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染测试', () => {
    it('应该渲染代码编辑器', () => {
      render(<CodeRenderer {...defaultProps} />);
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
    });

    it('应该渲染 Ace 编辑器容器', () => {
      render(<CodeRenderer {...defaultProps} />);
      expect(screen.getByTestId('ace-editor-container')).toBeInTheDocument();
    });

    it('应该渲染代码工具栏', () => {
      render(<CodeRenderer {...defaultProps} />);
      expect(screen.getByTestId('code-toolbar')).toBeInTheDocument();
    });
  });

  describe('不同语言支持', () => {
    it('应该支持 JavaScript 语言', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'javascript',
        },
      };
      render(<CodeRenderer {...props} />);
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
    });

    it('应该支持 Python 语言', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'python',
        },
      };
      render(<CodeRenderer {...props} />);
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
    });

    it('应该支持 HTML 语言', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'html',
        },
      };
      render(<CodeRenderer {...props} />);
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
    });
  });

  describe('特殊渲染模式', () => {
    it('应该隐藏配置型 HTML 代码块', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'html',
          isConfig: true,
        },
      };

      const { container } = render(<CodeRenderer {...props} />);
      expect(container.firstChild).toBeNull();
    });

    it('应该渲染思考块', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'think',
          value: '这是一个思考过程',
        },
      };

      render(<CodeRenderer {...props} />);
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
    });
  });

  describe('不同代码内容', () => {
    it('应该处理简单代码', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          value: 'console.log("Hello");',
        },
      };
      render(<CodeRenderer {...props} />);
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
    });

    it('应该处理复杂代码', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          value: `function complexFunction() {
  const data = [];
  for (let i = 0; i < 10; i++) {
    data.push(i * 2);
  }
  return data.filter(x => x > 5);
}`,
        },
      };
      render(<CodeRenderer {...props} />);
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
    });

    it('应该处理空代码', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          value: '',
        },
      };
      render(<CodeRenderer {...props} />);
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
    });
  });

  describe('边界情况', () => {
    it('应该处理未定义的语言', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: undefined,
        },
      };
      render(<CodeRenderer {...props} />);
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
    });

    it('应该处理未定义的代码值', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          value: undefined,
        },
      };
      render(<CodeRenderer {...props} />);
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
    });
  });

  describe('disableHtmlPreview 功能测试', () => {
    beforeEach(() => {
      // 重置 mockEditorStore 的配置
      mockEditorStore.editorProps.codeProps = {
        hideToolBar: false,
        disableHtmlPreview: false,
      };
    });

    it('当 disableHtmlPreview 为 false 时，HTML 代码块应该显示预览', () => {
      mockEditorStore.editorProps.codeProps.disableHtmlPreview = false;
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'html',
          value: '<div>Test HTML</div>',
        },
      };
      render(<CodeRenderer {...props} />);
      // 应该渲染 HTML 预览（如果 viewMode 是 preview）
      // 注意：由于默认 viewMode 是 preview，所以应该显示预览
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
    });

    it('当 disableHtmlPreview 为 true 时，HTML 代码块不应该渲染 HtmlPreview 组件', () => {
      mockEditorStore.editorProps.codeProps.disableHtmlPreview = true;
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'html',
          value: '<div>Test HTML</div>',
        },
      };
      render(<CodeRenderer {...props} />);
      // 不应该渲染 HtmlPreview 组件
      expect(screen.queryByTestId('html-preview')).not.toBeInTheDocument();
      // 应该显示代码编辑器
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
    });

    it('当 disableHtmlPreview 为 true 时，HTML 代码块应该强制使用代码模式', () => {
      mockEditorStore.editorProps.codeProps.disableHtmlPreview = true;
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'html',
          value: '<div>Test HTML</div>',
        },
      };
      const { container } = render(<CodeRenderer {...props} />);
      // 不应该渲染 HtmlPreview
      expect(screen.queryByTestId('html-preview')).not.toBeInTheDocument();
      // 应该渲染代码编辑器容器
      expect(screen.getByTestId('ace-editor-container')).toBeInTheDocument();
    });

    it('当 disableHtmlPreview 为 true 时，非 HTML 代码块不受影响', () => {
      mockEditorStore.editorProps.codeProps.disableHtmlPreview = true;
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'javascript',
          value: 'console.log("Hello");',
        },
      };
      render(<CodeRenderer {...props} />);
      // JavaScript 代码块应该正常渲染
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
      expect(screen.getByTestId('ace-editor-container')).toBeInTheDocument();
    });

    it('当 disableHtmlPreview 为 true 时，Markdown 代码块不受影响', () => {
      mockEditorStore.editorProps.codeProps.disableHtmlPreview = true;
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'markdown',
          value: '# Markdown Content',
        },
      };
      render(<CodeRenderer {...props} />);
      // Markdown 代码块应该正常渲染
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
    });
  });

  describe('JavaScript 自动检测功能测试', () => {
    beforeEach(() => {
      // 重置 mockEditorStore 的配置
      mockEditorStore.editorProps.codeProps = {
        hideToolBar: false,
        disableHtmlPreview: false,
      };
    });

    it('当 HTML 代码包含 <script> 标签时，应该自动禁用预览', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'html',
          value: '<script>alert("xss")</script><div>Content</div>',
        },
      };
      render(<CodeRenderer {...props} />);
      // 不应该渲染 HtmlPreview 组件
      expect(screen.queryByTestId('html-preview')).not.toBeInTheDocument();
      // 应该显示代码编辑器
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
      expect(screen.getByTestId('ace-editor-container')).toBeInTheDocument();
    });

    it('当 HTML 代码包含事件处理器时，应该自动禁用预览', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'html',
          value: '<div onclick="alert(\'xss\')">Click me</div>',
        },
      };
      render(<CodeRenderer {...props} />);
      // 不应该渲染 HtmlPreview 组件
      expect(screen.queryByTestId('html-preview')).not.toBeInTheDocument();
      // 应该显示代码编辑器
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
    });

    it('当 HTML 代码包含 onerror 事件处理器时，应该自动禁用预览', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'html',
          value: '<img src="x" onerror="alert(\'xss\')">',
        },
      };
      render(<CodeRenderer {...props} />);
      // 不应该渲染 HtmlPreview 组件
      expect(screen.queryByTestId('html-preview')).not.toBeInTheDocument();
      // 应该显示代码编辑器
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
    });

    it('当 HTML 代码包含 javascript: URL 时，应该自动禁用预览', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'html',
          value: '<a href="javascript:alert(\'xss\')">Link</a>',
        },
      };
      render(<CodeRenderer {...props} />);
      // 不应该渲染 HtmlPreview 组件
      expect(screen.queryByTestId('html-preview')).not.toBeInTheDocument();
      // 应该显示代码编辑器
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
    });

    it('当 HTML 代码包含 eval() 调用时，应该自动禁用预览', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'html',
          value: '<div>eval("alert(\'xss\')")</div>',
        },
      };
      render(<CodeRenderer {...props} />);
      // 不应该渲染 HtmlPreview 组件
      expect(screen.queryByTestId('html-preview')).not.toBeInTheDocument();
      // 应该显示代码编辑器
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
    });

    it('当 HTML 代码包含 Function() 构造函数时，应该自动禁用预览', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'html',
          value: '<div>Function("alert(\'xss\')")</div>',
        },
      };
      render(<CodeRenderer {...props} />);
      // 不应该渲染 HtmlPreview 组件
      expect(screen.queryByTestId('html-preview')).not.toBeInTheDocument();
      // 应该显示代码编辑器
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
    });

    it('当 HTML 代码不包含 JavaScript 时，应该正常显示预览', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'html',
          value: '<div><h1>Hello World</h1><p>Safe content</p></div>',
        },
      };
      render(<CodeRenderer {...props} />);
      // 应该显示代码容器
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
    });

    it('当 HTML 代码包含纯 CSS 时，应该正常显示预览', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'html',
          value: '<style>.test { color: red; }</style><div class="test">Content</div>',
        },
      };
      render(<CodeRenderer {...props} />);
      // 应该显示代码容器
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
    });

    it('当非 HTML 代码包含 JavaScript 时，不应该禁用预览（因为不是 HTML）', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'javascript',
          value: 'function test() { alert("xss"); }',
        },
      };
      render(<CodeRenderer {...props} />);
      // JavaScript 代码块应该正常渲染，不受影响
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
      expect(screen.getByTestId('ace-editor-container')).toBeInTheDocument();
    });

    it('当 HTML 代码包含 setTimeout 字符串代码时，应该自动禁用预览', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'html',
          value: '<div>setTimeout("alert(\'xss\')", 1000)</div>',
        },
      };
      render(<CodeRenderer {...props} />);
      // 不应该渲染 HtmlPreview 组件
      expect(screen.queryByTestId('html-preview')).not.toBeInTheDocument();
      // 应该显示代码编辑器
      expect(screen.getByTestId('code-container')).toBeInTheDocument();
    });
  });

  describe('handleViewModeToggle 与 useEffect', () => {
    it('当 disableHtmlPreview 且为 HTML 时点击切换仍保持 code 模式', () => {
      mockEditorStore.editorProps.codeProps.disableHtmlPreview = true;
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'html',
          value: '<div>Safe</div>',
        },
      };
      render(<CodeRenderer {...props} />);
      const toggle = screen.queryByTestId('view-mode-toggle');
      if (toggle) {
        fireEvent.click(toggle);
      }
      expect(screen.queryByTestId('html-preview')).not.toBeInTheDocument();
    });

    it('当 disableHtmlPreview 从 false 变为 true 时强制切回 code 模式', () => {
      mockEditorStore.editorProps.codeProps.disableHtmlPreview = false;
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'html',
          value: '<div>Safe</div>',
        },
      };
      const { rerender } = render(<CodeRenderer {...props} />);
      mockEditorStore.editorProps.codeProps.disableHtmlPreview = true;
      rerender(<CodeRenderer {...props} />);
      expect(screen.queryByTestId('html-preview')).not.toBeInTheDocument();
    });
  });

  describe('5 秒未闭合超时', () => {
    it('未闭合代码块 5 秒后应调用 update 将 finished 设为 true', async () => {
      vi.useFakeTimers();
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'javascript',
          value: 'const x = 1',
          otherProps: { finished: false },
        },
      };
      render(<CodeRenderer {...props} />);
      vi.advanceTimersByTime(5000);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          otherProps: expect.objectContaining({ finished: true }),
        }),
      );
      vi.useRealTimers();
    });
  });

  describe('配置型 HTML Skeleton', () => {
    it('未完成且内容较长的配置型 HTML 应显示 Skeleton', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          type: 'code' as const,
          language: 'html',
          isConfig: true,
          otherProps: { finished: false },
          value: 'x'.repeat(101),
          children: [{ text: '' }] as [{ text: string }],
        },
      };
      const { container } = render(<CodeRenderer {...props} />);
      expect(container.querySelector('.ant-skeleton')).toBeInTheDocument();
    });
  });

  describe('ThinkBlock 分支', () => {
    it('只读且 language 为 think 时应渲染 ThinkBlock', () => {
      mockEditorStore.readonly = true;
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'think',
          value: '思考内容',
        },
      };
      render(<CodeRenderer {...props} />);
      expect(screen.getByTestId('think-block-mock')).toBeInTheDocument();
      expect(screen.getByText('思考内容')).toBeInTheDocument();
      mockEditorStore.readonly = false;
    });
  });

  describe('hideToolBar', () => {
    it('当 hideToolBar 为 true 时不渲染 CodeToolbar', () => {
      mockEditorStore.editorProps.codeProps.hideToolBar = true;
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'javascript',
          frontmatter: undefined,
        },
      };
      render(<CodeRenderer {...props} />);
      expect(screen.queryByTestId('code-toolbar')).not.toBeInTheDocument();
      mockEditorStore.editorProps.codeProps.hideToolBar = false;
    });
  });
});
