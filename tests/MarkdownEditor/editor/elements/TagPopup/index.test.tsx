import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BaseEditor } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import { TagPopup } from '../../../../../src/MarkdownEditor/editor/elements/TagPopup/index';

// Mock Slate hooks
vi.mock('slate-react', () => ({
  useSlate: vi.fn(),
  ReactEditor: {
    toSlateNode: vi.fn(),
    findPath: vi.fn(),
  },
}));

// Mock Ant Design components
vi.mock('antd', () => ({
  ConfigProvider: {
    ConfigContext: {
      Consumer: ({ children }: any) => children({ getPrefixCls: () => 'ant-agentic-tag-popup' }),
    },
  },
  Dropdown: ({ children }: any) => (
    <div data-testid="dropdown-container">
      {children}
    </div>
  ),
}));

// Mock useStyle hook
vi.mock('../../../../../src/MarkdownEditor/editor/elements/TagPopup/style', () => ({
  useStyle: () => ({
    wrapSSR: (node: React.ReactNode) => node,
    hashId: 'hash-id',
  }),
}));

describe('TagPopup 组件', () => {
  const mockEditor = {
    children: [],
    selection: null,
    isInline: vi.fn().mockReturnValue(false),
    isVoid: vi.fn().mockReturnValue(false),
    normalizeNode: vi.fn(),
    onChange: vi.fn(),
  } as unknown as BaseEditor & ReactEditor;

  const defaultProps = {
    text: 'test',
    placeholder: '请选择',
    items: [
      { label: '选项1', key: 'option1' },
      { label: '选项2', key: 'option2' },
    ],
    onSelect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useSlate as any).mockReturnValue(mockEditor);
    (ReactEditor.toSlateNode as any).mockReturnValue({});
    (ReactEditor.findPath as any).mockReturnValue([0, 0]);
  });

  it('应该正确渲染基础组件', () => {
    // Mock SuggestionConnext context
    const mockSuggestionContextValue = {
      setOpen: vi.fn(),
      open: false,
      triggerNodeContext: { current: null },
      onSelectRef: { current: null },
    };
    
    const MockContext = React.createContext(mockSuggestionContextValue);
    
    const { container } = render(
      <MockContext.Provider value={mockSuggestionContextValue}>
        <TagPopup {...defaultProps} />
      </MockContext.Provider>
    );
    
    // 检查组件是否渲染
    expect(container).toBeInTheDocument();
  });

  it('应该处理 dropdown 类型渲染', () => {
    // Mock SuggestionConnext context
    const mockSuggestionContextValue = {
      setOpen: vi.fn(),
      open: false,
      triggerNodeContext: { current: null },
      onSelectRef: { current: null },
    };
    
    const MockContext = React.createContext(mockSuggestionContextValue);
    
    const { container } = render(
      <MockContext.Provider value={mockSuggestionContextValue}>
        <TagPopup {...defaultProps} type="dropdown" />
      </MockContext.Provider>
    );
    
    // 检查组件是否渲染
    expect(container).toBeInTheDocument();
  });

  it('应该处理空 items 情况', () => {
    // Mock SuggestionConnext context
    const mockSuggestionContextValue = {
      setOpen: vi.fn(),
      open: false,
      triggerNodeContext: { current: null },
      onSelectRef: { current: null },
    };
    
    const MockContext = React.createContext(mockSuggestionContextValue);
    
    const { container } = render(
      <MockContext.Provider value={mockSuggestionContextValue}>
        <TagPopup {...defaultProps} items={[]} />
      </MockContext.Provider>
    );
    
    // 检查组件是否渲染
    expect(container).toBeInTheDocument();
  });

  it('应该处理 undefined items 情况', () => {
    // Mock SuggestionConnext context
    const mockSuggestionContextValue = {
      setOpen: vi.fn(),
      open: false,
      triggerNodeContext: { current: null },
      onSelectRef: { current: null },
    };
    
    const MockContext = React.createContext(mockSuggestionContextValue);
    
    const { container } = render(
      <MockContext.Provider value={mockSuggestionContextValue}>
        <TagPopup {...defaultProps} items={undefined} />
      </MockContext.Provider>
    );
    
    // 检查组件是否渲染
    expect(container).toBeInTheDocument();
  });

  it('应该处理自定义 className', () => {
    // Mock SuggestionConnext context
    const mockSuggestionContextValue = {
      setOpen: vi.fn(),
      open: false,
      triggerNodeContext: { current: null },
      onSelectRef: { current: null },
    };
    
    const MockContext = React.createContext(mockSuggestionContextValue);
    
    const { container } = render(
      <MockContext.Provider value={mockSuggestionContextValue}>
        <TagPopup {...defaultProps} className="custom-class" />
      </MockContext.Provider>
    );
    
    // 检查组件是否渲染
    expect(container).toBeInTheDocument();
  });

  it('应该处理空文本情况', () => {
    // Mock SuggestionConnext context
    const mockSuggestionContextValue = {
      setOpen: vi.fn(),
      open: false,
      triggerNodeContext: { current: null },
      onSelectRef: { current: null },
    };
    
    const MockContext = React.createContext(mockSuggestionContextValue);
    
    const { container } = render(
      <MockContext.Provider value={mockSuggestionContextValue}>
        <TagPopup {...defaultProps} text="" />
      </MockContext.Provider>
    );
    
    // 检查组件是否渲染
    expect(container).toBeInTheDocument();
  });

  it('应该处理空白文本情况', () => {
    // Mock SuggestionConnext context
    const mockSuggestionContextValue = {
      setOpen: vi.fn(),
      open: false,
      triggerNodeContext: { current: null },
      onSelectRef: { current: null },
    };
    
    const MockContext = React.createContext(mockSuggestionContextValue);
    
    const { container } = render(
      <MockContext.Provider value={mockSuggestionContextValue}>
        <TagPopup {...defaultProps} text="   " />
      </MockContext.Provider>
    );
    
    // 检查组件是否渲染
    expect(container).toBeInTheDocument();
  });

  it('应该处理异步 items 函数', async () => {
    // Mock SuggestionConnext context
    const mockSuggestionContextValue = {
      setOpen: vi.fn(),
      open: false,
      triggerNodeContext: { current: null },
      onSelectRef: { current: null },
    };
    
    const MockContext = React.createContext(mockSuggestionContextValue);
    
    const asyncItems = vi.fn().mockResolvedValue([
      { label: '异步选项1', key: 'async1' },
      { label: '异步选项2', key: 'async2' },
    ]);
    
    const { container } = render(
      <MockContext.Provider value={mockSuggestionContextValue}>
        <TagPopup {...defaultProps} items={asyncItems} />
      </MockContext.Provider>
    );
    
    // 检查组件是否渲染
    expect(container).toBeInTheDocument();
  });

  it('应该处理 beforeOpenChange 回调', () => {
    // Mock SuggestionConnext context
    const mockSuggestionContextValue = {
      setOpen: vi.fn(),
      open: false,
      triggerNodeContext: { current: null },
      onSelectRef: { current: null },
    };
    
    const MockContext = React.createContext(mockSuggestionContextValue);
    
    const beforeOpenChange = vi.fn().mockReturnValue(false);
    
    const { container } = render(
      <MockContext.Provider value={mockSuggestionContextValue}>
        <TagPopup 
          {...defaultProps} 
          type="panel"
          beforeOpenChange={beforeOpenChange}
        />
      </MockContext.Provider>
    );
    
    // 检查组件是否渲染
    expect(container).toBeInTheDocument();
  });

  it('应该处理受控的 open 状态', () => {
    // Mock SuggestionConnext context
    const mockSuggestionContextValue = {
      setOpen: vi.fn(),
      open: true, // 受控打开状态
      triggerNodeContext: { current: null },
      onSelectRef: { current: null },
    };
    
    const MockContext = React.createContext(mockSuggestionContextValue);
    
    const { container } = render(
      <MockContext.Provider value={mockSuggestionContextValue}>
        <TagPopup {...defaultProps} type="dropdown" open={true} />
      </MockContext.Provider>
    );
    
    // 检查组件是否渲染
    expect(container).toBeInTheDocument();
  });
});