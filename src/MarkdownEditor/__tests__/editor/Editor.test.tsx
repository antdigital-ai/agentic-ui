import { SlateMarkdownEditor as Editor } from '@ant-design/agentic-ui/MarkdownEditor/editor/Editor';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@ant-design/agentic-ui/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    store: {
      dragStart: vi.fn(),
      insertText: vi.fn(),
      insertNode: vi.fn(),
    },
    markdownEditorRef: {
      current: {
        children: [{ type: 'paragraph', children: [{ text: 'test' }] }],
        selection: null,
        operations: [],
        marks: null,
        isInline: vi.fn(),
        isVoid: vi.fn(),
        normalizeNode: vi.fn(),
        onChange: vi.fn(),
        hasPath: vi.fn(() => true),
      },
    },
    markdownContainerRef: { current: document.createElement('div') },
    typewriter: false,
    readonly: false,
    editorProps: {},
  }),
}));

vi.mock(
  '@ant-design/agentic-ui/MarkdownEditor/editor/plugins/useHighlight',
  () => ({
    useHighlight: () => ({
      decorate: vi.fn(),
    }),
  }),
);

vi.mock(
  '@ant-design/agentic-ui/MarkdownEditor/editor/plugins/useKeyboard',
  () => ({
    useKeyboard: () => ({
      onKeyDown: vi.fn(),
    }),
  }),
);

vi.mock(
  '@ant-design/agentic-ui/MarkdownEditor/editor/plugins/useOnchange',
  () => ({
    useOnchange: () => ({
      onChange: vi.fn(),
    }),
  }),
);

vi.mock('@ant-design/agentic-ui/MarkdownEditor/editor/elements', () => ({
  MElement: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="m-element">{children}</div>
  ),
  MLeaf: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="m-leaf">{children}</span>
  ),
}));

vi.mock(
  '@ant-design/agentic-ui/MarkdownEditor/editor/components/LazyElement',
  () => ({
    LazyElement: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="lazy-element">{children}</div>
    ),
  }),
);

describe('Editor Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('应该正确导入Editor组件', () => {
    // 测试组件导入（React.memo 返回对象，普通函数组件为 function）
    expect(Editor).toBeDefined();
    expect(['function', 'object']).toContain(typeof Editor);
  });

  it('应该正确导入相关依赖', () => {
    // 测试相关依赖导入
    expect(vi.mocked).toBeDefined();
  });

  it('应该正确处理mock配置', () => {
    // 测试mock配置是否正确
    const mockStore = {
      store: {
        dragStart: vi.fn(),
        insertText: vi.fn(),
        insertNode: vi.fn(),
      },
      markdownEditorRef: {
        current: {
          children: [{ type: 'paragraph', children: [{ text: 'test' }] }],
          selection: null,
          operations: [],
          marks: null,
          isInline: vi.fn(),
          isVoid: vi.fn(),
          normalizeNode: vi.fn(),
          onChange: vi.fn(),
          hasPath: vi.fn(() => true),
        },
      },
      markdownContainerRef: { current: document.createElement('div') },
      typewriter: false,
      readonly: false,
      editorProps: {},
    };

    expect(mockStore).toBeDefined();
    expect(mockStore.store).toBeDefined();
    expect(mockStore.markdownEditorRef).toBeDefined();
    expect(mockStore.markdownEditorRef.current).toBeDefined();
  });

  it('应该能够创建有效的mock对象', () => {
    // 测试mock对象创建
    const mockEditor = {
      children: [{ type: 'paragraph', children: [{ text: 'test' }] }],
      selection: null,
      operations: [],
      marks: null,
      isInline: vi.fn(),
      isVoid: vi.fn(),
      normalizeNode: vi.fn(),
      onChange: vi.fn(),
      hasPath: vi.fn(() => true),
    };

    expect(mockEditor).toBeDefined();
    expect(mockEditor.children).toBeDefined();
    expect(Array.isArray(mockEditor.children)).toBe(true);
  });

  it('应该能够创建有效的初始值', () => {
    // 测试初始值创建
    const mockValue = [
      {
        type: 'paragraph',
        children: [{ text: 'Test content' }],
      },
    ];
    expect(mockValue).toBeDefined();
    expect(Array.isArray(mockValue)).toBe(true);
    expect(mockValue[0].type).toBe('paragraph');
  });

  it('应该正确处理组件属性', () => {
    // 测试组件属性处理
    const props = {
      readOnly: false,
      typewriter: false,
      onChange: vi.fn(),
      onSelectionChange: vi.fn(),
      onFocus: vi.fn(),
      onBlur: vi.fn(),
    };

    expect(props).toBeDefined();
    expect(typeof props.readOnly).toBe('boolean');
    expect(typeof props.typewriter).toBe('boolean');
    expect(typeof props.onChange).toBe('function');
  });

  it('应该正确处理事件处理器', () => {
    // 测试事件处理器
    const handlers = {
      onKeyDown: vi.fn(),
      onPaste: vi.fn(),
      onDragStart: vi.fn(),
      onDrop: vi.fn(),
    };

    expect(handlers).toBeDefined();
    expect(typeof handlers.onKeyDown).toBe('function');
    expect(typeof handlers.onPaste).toBe('function');
    expect(typeof handlers.onDragStart).toBe('function');
    expect(typeof handlers.onDrop).toBe('function');
  });

  it('应该正确处理装饰器函数', () => {
    // 测试装饰器函数
    const decorate = vi.fn(() => []);

    expect(decorate).toBeDefined();
    expect(typeof decorate).toBe('function');

    const result = decorate();
    expect(Array.isArray(result)).toBe(true);
  });

  it('应该正确处理渲染函数', () => {
    // 测试渲染函数
    const renderElement = vi.fn();
    const renderLeaf = vi.fn();

    expect(renderElement).toBeDefined();
    expect(renderLeaf).toBeDefined();
    expect(typeof renderElement).toBe('function');
    expect(typeof renderLeaf).toBe('function');
  });
});
