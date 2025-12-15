/**
 * @fileoverview 代码插件主文件测试
 * 测试 CodeElement 组件
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock CodeElement 组件及相关依赖
const mockEditorStore = {
  readonly: true,
};

// Mock useEditorStore
vi.mock('../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => mockEditorStore,
}));

// Mock CodeRenderer 组件
vi.mock('../../../src/Plugins/code/components', () => ({
  CodeRenderer: () => <div data-testid="code-renderer">Code Renderer</div>,
}));

// Mock BaseMarkdownEditor 组件
vi.mock('../../../src/MarkdownEditor', () => ({
  BaseMarkdownEditor: ({ initValue }: any) => (
    <div data-testid="base-markdown-editor">{initValue}</div>
  ),
}));

// 由于 CodeElement 组件在主文件中，我们需要动态导入它
let CodeElement: any;

describe('code plugin index', () => {
  // 在所有测试之前导入 CodeElement 组件
  beforeAll(async () => {
    const module = await import('../../../src/Plugins/code/index');
    CodeElement = module.CodeElement;
  });

  describe('CodeElement', () => {
    const baseProps: any = {
      element: {
        type: 'code',
        language: 'javascript',
        value: 'console.log("Hello");',
        children: [{ text: '' }],
      },
      attributes: {},
      children: <span>test</span>,
    };

    it('当element为空时应该返回null', async () => {
      const props = {
        ...baseProps,
        element: null,
      };
      const { container } = render(<CodeElement {...props} />);
      expect(container.firstChild).toBeNull();
    });

    it('在只读模式下，当element没有value时应该返回null', async () => {
      mockEditorStore.readonly = true;
      const props = {
        ...baseProps,
        element: {
          ...baseProps.element,
          value: '',
        },
      };
      const { container } = render(<CodeElement {...props} />);
      expect(container.firstChild).toBeNull();
    });

    it('在只读模式下，当language为csv时应该渲染BaseMarkdownEditor', async () => {
      mockEditorStore.readonly = true;
      const csvData = 'Name,Age\nJohn,25\nJane,30';
      const props = {
        ...baseProps,
        element: {
          ...baseProps.element,
          language: 'csv',
          value: csvData,
        },
      };
      
      render(<CodeElement {...props} />);
      expect(screen.getByTestId('base-markdown-editor')).toBeInTheDocument();
    });

    it('在非只读模式下应该渲染CodeRenderer', async () => {
      mockEditorStore.readonly = false;
      render(<CodeElement {...baseProps} />);
      expect(screen.getByTestId('code-renderer')).toBeInTheDocument();
    });

    it('在只读模式下，非csv语言应该渲染CodeRenderer', async () => {
      mockEditorStore.readonly = true;
      const props = {
        ...baseProps,
        element: {
          ...baseProps.element,
          language: 'javascript',
        },
      };
      render(<CodeElement {...props} />);
      expect(screen.getByTestId('code-renderer')).toBeInTheDocument();
    });

    it('在只读模式下，有value的空代码块应该渲染CodeRenderer', async () => {
      mockEditorStore.readonly = true;
      const props = {
        ...baseProps,
        element: {
          ...baseProps.element,
          language: 'javascript',
          value: 'console.log("test");',
        },
      };
      render(<CodeElement {...props} />);
      expect(screen.getByTestId('code-renderer')).toBeInTheDocument();
    });
  });
});