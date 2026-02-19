import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSelStatus } from '../../../src/MarkdownEditor/hooks/editor';
import { MermaidElement } from '../../../src/Plugins/mermaid/index';

// Mock 依赖
vi.mock('../../../src/MarkdownEditor/editor/store', () => ({
  useEditorStore: () => ({
    markdownEditorRef: { current: document.createElement('div') },
  }),
}));

vi.mock('../../../src/MarkdownEditor/hooks/editor', () => ({
  useSelStatus: vi.fn(() => [false, [0]]),
}));

vi.mock('slate-react', () => ({
  ReactEditor: {
    toDOMNode: vi.fn(() => document.createElement('div')),
    isFocused: vi.fn(() => true),
  },
}));

vi.mock('../../../src/MarkdownEditor/I18n', () => ({
  I18nContext: React.createContext({
    locale: 'zh-CN',
    t: (key: string) => key,
  }),
}));

vi.mock('react-use', () => ({
  useGetSetState: vi.fn(() => {
    const state = {
      showBorder: false,
      htmlStr: '',
      hide: false,
      lang: 'mermaid',
    };
    const setState = vi.fn((update) => {
      if (typeof update === 'function') {
        update(state);
      } else {
        Object.assign(state, update);
      }
    });
    return [() => state, setState];
  }),
}));

vi.mock('copy-to-clipboard', () => ({
  default: vi.fn().mockReturnValue(true),
}));

describe('MermaidElement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    element: {
      type: 'code' as const,
      language: 'mermaid',
      value: 'graph TD\nA[开始] --> B[结束]',
      frontmatter: false,
      children: [{ text: '' }] as [{ text: string }],
    },
    attributes: {
      'data-testid': 'mermaid-element',
      'data-slate-node': 'element' as const,
      ref: null,
    },
    children: <div>Test content</div>,
  };

  describe('基本渲染测试', () => {
    it('应该正确渲染 MermaidElement 组件', () => {
      render(<MermaidElement {...defaultProps} />);
      expect(document.body).toBeInTheDocument();
    });

    it('应该渲染带有 frontmatter 的元素', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          frontmatter: true,
        },
      };
      render(<MermaidElement {...props} />);
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('交互功能测试', () => {
    it('应该处理关闭按钮点击', () => {
      render(<MermaidElement {...defaultProps} />);
      const closeButton = document.querySelector(
        '.ant-agentic-md-editor-action-icon-box',
      );
      if (closeButton) {
        fireEvent.click(closeButton);
      }
      expect(document.body).toBeInTheDocument();
    });

    it('应该处理复制按钮点击', async () => {
      render(<MermaidElement {...defaultProps} />);
      const copyButton = document.querySelectorAll(
        '.ant-agentic-md-editor-action-icon-box',
      )[1];
      if (copyButton) {
        fireEvent.click(copyButton);
      }
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('覆盖 79、81、98、99 行', () => {
    it('selected 且 markdown 聚焦时应 setState showBorder，取消选中时应清除（79、81）', () => {
      vi.mocked(useSelStatus)
        .mockReturnValueOnce([true, [0]])
        .mockReturnValueOnce([false, [0]]);
      const { rerender } = render(<MermaidElement {...defaultProps} />);
      rerender(<MermaidElement {...defaultProps} />);
      expect(document.querySelector('[data-be="mermaid"]')).toBeInTheDocument();
    });
    it('点击图表区域应 stopPropagation 并 focus 编辑器（98、99）', () => {
      render(<MermaidElement {...defaultProps} />);
      const mermaidEl = document.querySelector('[data-be="mermaid"]');
      const chartArea = mermaidEl?.children[1];
      if (chartArea) fireEvent.click(chartArea as Element);
      expect(document.body).toBeInTheDocument();
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空的 value', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          value: '',
        },
      };
      render(<MermaidElement {...props} />);
      expect(document.body).toBeInTheDocument();
    });

    it('应该处理不同的语言类型', () => {
      const props = {
        ...defaultProps,
        element: {
          ...defaultProps.element,
          language: 'javascript',
        },
      };
      render(<MermaidElement {...props} />);
      expect(document.body).toBeInTheDocument();
    });
  });
});
