import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { message } from 'antd';
import copy from 'copy-to-clipboard';
import React, { createContext } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CodeNode } from '../../../../src/MarkdownEditor/el';
import {
  CodeToolbar,
  CodeToolbarProps,
} from '../../../../src/Plugins/code/components/CodeToolbar';

// 使用 vi.hoisted() 定义变量，使其与 vi.mock 一起被提升
const { mockEditorStore } = vi.hoisted(() => {
  return {
    mockEditorStore: {
      editorProps: {
        codeProps: {
          disableHtmlPreview: false,
        },
      },
    },
  };
});

vi.mock('../../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => mockEditorStore,
  EditorStore: class EditorStore {},
  EditorStoreContext: createContext(mockEditorStore),
}));

// Mock 依赖
vi.mock('copy-to-clipboard');
vi.mock('antd', () => ({
  message: {
    success: vi.fn(),
  },
  Segmented: ({ options, value, onChange }: any) => (
    <div data-testid="segmented">
      {options?.map((option: any, index: number) => (
        <button
          key={index}
          type="button"
          data-testid={`segmented-option-${index}`}
          onClick={() => onChange?.(option.value)}
          style={{
            backgroundColor: value === option.value ? '#1890ff' : 'transparent',
            color: value === option.value ? 'white' : 'black',
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../../../../src/Plugins/code/components/LanguageSelector', () => ({
  LanguageSelector: ({ element, setLanguage }: any) => (
    <div data-testid="language-selector">
      <span data-testid="current-language">
        {element?.language || 'plain text'}
      </span>
      <button
        type="button"
        data-testid="change-language"
        onClick={() => setLanguage?.('javascript')}
      >
        切换语言
      </button>
    </div>
  ),
}));

vi.mock('../../../../src/Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, title, onClick, 'data-testid': testId }: any) => (
    <button
      type="button"
      data-testid={testId || 'action-icon'}
      title={title}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

describe('CodeToolbar', () => {
  const defaultElement: CodeNode = {
    type: 'code',
    language: 'javascript',
    value: 'console.log("Hello World");',
    children: [{ text: 'console.log("Hello World");' }],
  };

  const defaultProps: CodeToolbarProps = {
    element: defaultElement,
    readonly: false,
    onCloseClick: vi.fn(),
    languageSelectorProps: {
      element: defaultElement,
      setLanguage: vi.fn(),
    },
    isSelected: false,
    onSelectionChange: vi.fn(),
    theme: 'github',
    setTheme: vi.fn(),
    isExpanded: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // 重置 mockEditorStore 的配置
    mockEditorStore.editorProps.codeProps.disableHtmlPreview = false;
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染工具栏', () => {
      render(<CodeToolbar {...defaultProps} isSelected={true} />);

      expect(screen.getByTestId('code-toolbar')).toBeInTheDocument();
    });

    it('应该在非选中状态下仍然显示工具栏（常驻模式）', () => {
      render(<CodeToolbar {...defaultProps} isSelected={false} />);

      expect(screen.getByTestId('code-toolbar')).toBeInTheDocument();
    });
  });

  describe('只读模式测试', () => {
    it('应该在只读模式下显示语言信息', () => {
      render(
        <CodeToolbar {...defaultProps} readonly={true} isSelected={true} />,
      );

      expect(screen.queryByTestId('language-selector')).not.toBeInTheDocument();
      expect(screen.getByText('javascript')).toBeInTheDocument();
    });
  });

  describe('交互功能测试', () => {
    it('应该正确处理复制功能', async () => {
      const mockCopy = copy as any;
      mockCopy.mockReturnValue(true);

      render(<CodeToolbar {...defaultProps} isSelected={true} />);

      const copyButton = screen.getByTitle('复制');
      fireEvent.click(copyButton);

      expect(mockCopy).toHaveBeenCalledWith('console.log("Hello World");');
      expect(message.success).toHaveBeenCalledWith('复制成功');
    });
  });

  describe('特殊代码类型测试', () => {
    it('应该为 HTML 代码显示视图模式切换器', () => {
      const htmlElement = { ...defaultElement, language: 'html' };
      render(
        <CodeToolbar
          {...defaultProps}
          element={htmlElement}
          isSelected={true}
        />,
      );

      expect(screen.getByTestId('segmented')).toBeInTheDocument();
      expect(screen.getByText('预览')).toBeInTheDocument();
      expect(screen.getByText('代码')).toBeInTheDocument();
    });

    it('应该为 katex 公式显示关闭按钮', () => {
      const katexElement = { ...defaultElement, katex: true };
      render(
        <CodeToolbar
          {...defaultProps}
          element={katexElement}
          isSelected={true}
        />,
      );

      expect(screen.getByTitle('关闭')).toBeInTheDocument();
    });

    it('应该为 mermaid 显示关闭按钮', () => {
      const mermaidElement = { ...defaultElement, language: 'mermaid' };
      render(
        <CodeToolbar
          {...defaultProps}
          element={mermaidElement}
          isSelected={true}
        />,
      );

      expect(screen.getByTitle('关闭')).toBeInTheDocument();
    });
  });

  describe('语言显示测试', () => {
    it('应该为 katex 公式显示 Formula 标签', () => {
      const katexElement = { ...defaultElement, katex: true };
      render(
        <CodeToolbar
          {...defaultProps}
          element={katexElement}
          readonly={true}
          isSelected={true}
        />,
      );

      expect(screen.getByText('Formula')).toBeInTheDocument();
    });

    it('应该为 HTML 渲染器显示 Html Renderer 标签', () => {
      const htmlElement = { ...defaultElement, language: 'html', render: true };
      render(
        <CodeToolbar
          {...defaultProps}
          element={htmlElement}
          readonly={true}
          isSelected={true}
        />,
      );

      expect(screen.getByText('Html Renderer')).toBeInTheDocument();
    });

    it('应该为没有语言的代码显示 plain text', () => {
      const elementWithoutLanguage = { ...defaultElement, language: undefined };
      render(
        <CodeToolbar
          {...defaultProps}
          element={elementWithoutLanguage}
          readonly={true}
          isSelected={true}
        />,
      );

      expect(screen.getByText('plain text')).toBeInTheDocument();
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空的代码值', () => {
      const emptyElement = { ...defaultElement, value: '' };
      const mockCopy = copy as any;
      mockCopy.mockReturnValue(true);

      render(
        <CodeToolbar
          {...defaultProps}
          element={emptyElement}
          isSelected={true}
        />,
      );

      const copyButton = screen.getByTitle('复制');
      fireEvent.click(copyButton);

      expect(mockCopy).toHaveBeenCalledWith('');
    });

    it('应该处理未定义的代码值', () => {
      const undefinedElement = { ...defaultElement, value: undefined as any };
      const mockCopy = copy as any;
      mockCopy.mockReturnValue(true);

      render(
        <CodeToolbar
          {...defaultProps}
          element={undefinedElement}
          isSelected={true}
        />,
      );

      const copyButton = screen.getByTitle('复制');
      fireEvent.click(copyButton);

      expect(mockCopy).toHaveBeenCalledWith('');
    });
  });

  describe('disableHtmlPreview 功能测试', () => {
    it('当 disableHtmlPreview 为 false 时，HTML 代码块应该显示预览/代码切换按钮', () => {
      mockEditorStore.editorProps.codeProps.disableHtmlPreview = false;
      const htmlElement = { ...defaultElement, language: 'html' };
      render(
        <CodeToolbar
          {...defaultProps}
          element={htmlElement}
          isSelected={true}
        />,
      );

      expect(screen.getByTestId('segmented')).toBeInTheDocument();
      expect(screen.getByText('预览')).toBeInTheDocument();
      expect(screen.getByText('代码')).toBeInTheDocument();
    });

    it('当 disableHtmlPreview 为 true 时，HTML 代码块不应该显示预览/代码切换按钮', () => {
      mockEditorStore.editorProps.codeProps.disableHtmlPreview = true;
      const htmlElement = { ...defaultElement, language: 'html' };
      render(
        <CodeToolbar
          {...defaultProps}
          element={htmlElement}
          isSelected={true}
        />,
      );

      // 不应该显示预览/代码切换按钮
      expect(screen.queryByTestId('segmented')).not.toBeInTheDocument();
    });

    it('当 disableHtmlPreview 为 true 时，Markdown 代码块仍然显示预览/代码切换按钮', () => {
      mockEditorStore.editorProps.codeProps.disableHtmlPreview = true;
      const markdownElement = { ...defaultElement, language: 'markdown' };
      render(
        <CodeToolbar
          {...defaultProps}
          element={markdownElement}
          isSelected={true}
        />,
      );

      // Markdown 代码块应该仍然显示切换按钮
      expect(screen.getByTestId('segmented')).toBeInTheDocument();
      expect(screen.getByText('预览')).toBeInTheDocument();
      expect(screen.getByText('代码')).toBeInTheDocument();
    });

    it('当 disableHtmlPreview 为 true 时，非 HTML/Markdown 代码块不受影响', () => {
      mockEditorStore.editorProps.codeProps.disableHtmlPreview = true;
      render(<CodeToolbar {...defaultProps} isSelected={true} />);

      // JavaScript 代码块不应该显示切换按钮（这是正常行为）
      expect(screen.queryByTestId('segmented')).not.toBeInTheDocument();
    });

    it('当 disableHtmlPreview 未设置时，HTML 代码块应该显示预览/代码切换按钮', () => {
      mockEditorStore.editorProps.codeProps.disableHtmlPreview = undefined;
      const htmlElement = { ...defaultElement, language: 'html' };
      render(
        <CodeToolbar
          {...defaultProps}
          element={htmlElement}
          isSelected={true}
        />,
      );

      // 默认情况下应该显示切换按钮
      expect(screen.getByTestId('segmented')).toBeInTheDocument();
      expect(screen.getByText('预览')).toBeInTheDocument();
      expect(screen.getByText('代码')).toBeInTheDocument();
    });
  });

  describe('JavaScript 自动检测功能测试', () => {
    beforeEach(() => {
      // 重置 mockEditorStore 的配置
      mockEditorStore.editorProps.codeProps.disableHtmlPreview = false;
    });

    it('当 HTML 代码包含 <script> 标签时，应该隐藏预览/代码切换按钮', () => {
      const htmlElement = {
        ...defaultElement,
        language: 'html',
        value: '<script>alert("xss")</script><div>Content</div>',
      };
      render(
        <CodeToolbar
          {...defaultProps}
          element={htmlElement}
          isSelected={true}
        />,
      );

      // 不应该显示预览/代码切换按钮
      expect(screen.queryByTestId('segmented')).not.toBeInTheDocument();
    });

    it('当 HTML 代码包含事件处理器时，应该隐藏预览/代码切换按钮', () => {
      const htmlElement = {
        ...defaultElement,
        language: 'html',
        value: '<div onclick="alert(\'xss\')">Click me</div>',
      };
      render(
        <CodeToolbar
          {...defaultProps}
          element={htmlElement}
          isSelected={true}
        />,
      );

      // 不应该显示预览/代码切换按钮
      expect(screen.queryByTestId('segmented')).not.toBeInTheDocument();
    });

    it('当 HTML 代码包含 onerror 事件处理器时，应该隐藏预览/代码切换按钮', () => {
      const htmlElement = {
        ...defaultElement,
        language: 'html',
        value: '<img src="x" onerror="alert(\'xss\')">',
      };
      render(
        <CodeToolbar
          {...defaultProps}
          element={htmlElement}
          isSelected={true}
        />,
      );

      // 不应该显示预览/代码切换按钮
      expect(screen.queryByTestId('segmented')).not.toBeInTheDocument();
    });

    it('当 HTML 代码包含 javascript: URL 时，应该隐藏预览/代码切换按钮', () => {
      const htmlElement = {
        ...defaultElement,
        language: 'html',
        value: '<a href="javascript:alert(\'xss\')">Link</a>',
      };
      render(
        <CodeToolbar
          {...defaultProps}
          element={htmlElement}
          isSelected={true}
        />,
      );

      // 不应该显示预览/代码切换按钮
      expect(screen.queryByTestId('segmented')).not.toBeInTheDocument();
    });

    it('当 HTML 代码包含 eval() 调用时，应该隐藏预览/代码切换按钮', () => {
      const htmlElement = {
        ...defaultElement,
        language: 'html',
        value: '<div>eval("alert(\'xss\')")</div>',
      };
      render(
        <CodeToolbar
          {...defaultProps}
          element={htmlElement}
          isSelected={true}
        />,
      );

      // 不应该显示预览/代码切换按钮
      expect(screen.queryByTestId('segmented')).not.toBeInTheDocument();
    });

    it('当 HTML 代码不包含 JavaScript 时，应该显示预览/代码切换按钮', () => {
      const htmlElement = {
        ...defaultElement,
        language: 'html',
        value: '<div><h1>Hello World</h1><p>Safe content</p></div>',
      };
      render(
        <CodeToolbar
          {...defaultProps}
          element={htmlElement}
          isSelected={true}
        />,
      );

      // 应该显示预览/代码切换按钮
      expect(screen.getByTestId('segmented')).toBeInTheDocument();
      expect(screen.getByText('预览')).toBeInTheDocument();
      expect(screen.getByText('代码')).toBeInTheDocument();
    });

    it('当 HTML 代码包含纯 CSS 时，应该显示预览/代码切换按钮', () => {
      const htmlElement = {
        ...defaultElement,
        language: 'html',
        value: '<style>.test { color: red; }</style><div class="test">Content</div>',
      };
      render(
        <CodeToolbar
          {...defaultProps}
          element={htmlElement}
          isSelected={true}
        />,
      );

      // 应该显示预览/代码切换按钮
      expect(screen.getByTestId('segmented')).toBeInTheDocument();
      expect(screen.getByText('预览')).toBeInTheDocument();
      expect(screen.getByText('代码')).toBeInTheDocument();
    });

    it('当非 HTML 代码包含 JavaScript 时，不应该隐藏切换按钮（因为不是 HTML）', () => {
      const jsElement = {
        ...defaultElement,
        language: 'javascript',
        value: 'function test() { alert("xss"); }',
      };
      render(
        <CodeToolbar
          {...defaultProps}
          element={jsElement}
          isSelected={true}
        />,
      );

      // JavaScript 代码块不应该显示切换按钮（这是正常行为，因为只有 HTML/Markdown 才显示）
      expect(screen.queryByTestId('segmented')).not.toBeInTheDocument();
    });

    it('当 HTML 代码包含多种 JavaScript 模式时，应该隐藏预览/代码切换按钮', () => {
      const htmlElement = {
        ...defaultElement,
        language: 'html',
        value: '<script>alert("xss")</script><div onclick="test()">Click</div><a href="javascript:void(0)">Link</a>',
      };
      render(
        <CodeToolbar
          {...defaultProps}
          element={htmlElement}
          isSelected={true}
        />,
      );

      // 不应该显示预览/代码切换按钮
      expect(screen.queryByTestId('segmented')).not.toBeInTheDocument();
    });
  });
});
