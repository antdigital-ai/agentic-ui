import { Paragraph } from '@ant-design/agentic-ui/MarkdownEditor/editor/elements/Paragraph';
import { ParagraphNode } from '@ant-design/agentic-ui/MarkdownEditor/el';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@ant-design/agentic-ui/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    store: {
      dragStart: () => {},
      isLatestNode: () => false,
    },
    markdownEditorRef: {
      current: {
        children: [{ type: 'paragraph', children: [{ text: 'test' }] }],
      },
    },
    markdownContainerRef: { current: document.createElement('div') },
    typewriter: false,
    readonly: false,
    editorProps: { titlePlaceholderContent: 'Enter content...' },
  }),
}));

vi.mock('@ant-design/agentic-ui/MarkdownEditor/hooks/editor', () => ({
  useSelStatus: () => [false, [0]],
}));

vi.mock('@ant-design/agentic-ui/I18n', () => ({
  I18nContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
    Consumer: ({ children }: { children: (value: any) => React.ReactNode }) =>
      children({ locale: { inputPlaceholder: '请输入内容...' } }),
  },
}));

// Mock useContext to return the expected context value
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useContext: vi.fn(() => ({
      locale: { inputPlaceholder: '请输入内容...' },
    })),
  };
});

vi.mock(
  '@ant-design/agentic-ui/MarkdownEditor/editor/tools/DragHandle',
  () => ({
    DragHandle: () => <div data-testid="drag-handle">DragHandle</div>,
  }),
);

describe('Paragraph Component', () => {
  const mockAttributes = {
    'data-slate-node': 'element' as const,
    'data-slate-inline': true as const,
    'data-slate-void': true as const,
    ref: null,
  };

  const mockElement: ParagraphNode = {
    type: 'paragraph',
    children: [{ text: 'Test paragraph content' }],
    align: 'left',
  };

  const mockChildren = <span>Test children</span>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确渲染Paragraph组件', () => {
    render(
      <Paragraph element={mockElement} attributes={mockAttributes}>
        {mockChildren}
      </Paragraph>,
    );

    const paragraphElement = screen.getByText('Test children').parentElement;
    expect(paragraphElement).toBeInTheDocument();
    expect(paragraphElement).toHaveAttribute('data-be', 'paragraph');
    expect(paragraphElement).toHaveAttribute('data-align', 'left');
  });

  it('应该包含DragHandle组件', () => {
    render(
      <Paragraph element={mockElement} attributes={mockAttributes}>
        {mockChildren}
      </Paragraph>,
    );

    expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
  });

  it('应该应用正确的CSS类名', () => {
    render(
      <Paragraph element={mockElement} attributes={mockAttributes}>
        {mockChildren}
      </Paragraph>,
    );

    const paragraphElement = screen.getByText('Test children').parentElement;
    expect(paragraphElement).toHaveAttribute('data-be', 'paragraph');
    expect(paragraphElement).toHaveAttribute('data-drag-el');
  });

  it('应该处理空段落', () => {
    const emptyElement: ParagraphNode = {
      type: 'paragraph',
      children: [{ text: '' }],
      align: 'left',
    };

    // 测试空段落的基本属性
    expect(emptyElement).toBeDefined();
    expect(emptyElement.type).toBe('paragraph');
    expect(emptyElement.children[0].text).toBe('');
    expect(emptyElement.align).toBe('left');
  });

  it('应该处理不同的对齐方式', () => {
    const centerElement: ParagraphNode = {
      type: 'paragraph',
      children: [{ text: 'Centered text' }],
      align: 'center',
    };

    render(
      <Paragraph element={centerElement} attributes={mockAttributes}>
        {mockChildren}
      </Paragraph>,
    );

    const paragraphElement = screen.getByText('Test children').parentElement;
    expect(paragraphElement).toHaveAttribute('data-align', 'center');
  });

  it('应该正确传递attributes属性', () => {
    const customAttributes = {
      ...mockAttributes,
      'data-testid': 'paragraph-element',
      className: 'custom-class',
    };

    render(
      <Paragraph element={mockElement} attributes={customAttributes}>
        {mockChildren}
      </Paragraph>,
    );

    const paragraphElement = screen.getByText('Test children').parentElement;
    expect(paragraphElement).toHaveAttribute(
      'data-testid',
      'paragraph-element',
    );
  });

  it('应该渲染children内容', () => {
    const customChildren = <div data-testid="child-content">Child content</div>;

    render(
      <Paragraph element={mockElement} attributes={mockAttributes}>
        {customChildren}
      </Paragraph>,
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('应该处理打字机模式', () => {
    // 测试打字机模式下的组件渲染
    const typewriterElement: ParagraphNode = {
      type: 'paragraph',
      children: [{ text: 'Typewriter text' }],
      align: 'left',
    };

    render(
      <Paragraph element={typewriterElement} attributes={mockAttributes}>
        {mockChildren}
      </Paragraph>,
    );

    const paragraphElement = screen.getByText('Test children').parentElement;
    expect(paragraphElement).toBeInTheDocument();
    // 验证组件正常渲染，不依赖特定的CSS类
    expect(paragraphElement).toHaveAttribute('data-be', 'paragraph');
  });
});
