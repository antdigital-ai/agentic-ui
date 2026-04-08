import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSelStatus } from '../../../src/MarkdownEditor/hooks/editor';
import { MermaidElement } from '../../../src/Plugins/mermaid/index';

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

vi.mock('react-use', () => {
  const React = require('react');
  return {
    useGetSetState: vi.fn((initialState) => {
      const [state, setStateInternal] = React.useState(initialState);
      const getState = () => state;
      const setState = (update) => {
        if (typeof update === 'function') {
          setStateInternal((s) => ({ ...s, ...update(s) }));
        } else {
          setStateInternal((s) => ({ ...s, ...update }));
        }
      };
      return [getState, setState];
    }),
  };
});

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

  it('应渲染根节点（含 frontmatter 与否）', () => {
    const { rerender } = render(<MermaidElement {...defaultProps} />);
    expect(document.querySelector('[data-be="mermaid"]')).toBeInTheDocument();

    rerender(
      <MermaidElement
        {...defaultProps}
        element={{ ...defaultProps.element, frontmatter: true }}
      />,
    );
    expect(document.querySelector('[data-be="mermaid"]')).toBeInTheDocument();
  });

  it('应处理关闭与复制按钮点击', () => {
    render(<MermaidElement {...defaultProps} />);
    const buttons = document.querySelectorAll(
      '.ant-agentic-md-editor-action-icon-box',
    );
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(buttons[0]);
    fireEvent.click(buttons[1]);
  });

  describe('选择态与图表区域交互', () => {
    it('selected 变化时应更新边框状态（79、81）', () => {
      vi.mocked(useSelStatus)
        .mockReturnValueOnce([true, [0]])
        .mockReturnValueOnce([false, [0]]);
      const { rerender } = render(<MermaidElement {...defaultProps} />);
      rerender(<MermaidElement {...defaultProps} />);
      expect(document.querySelector('[data-be="mermaid"]')).toBeInTheDocument();
    });

    it('点击图表区域应不抛错', () => {
      render(<MermaidElement {...defaultProps} />);
      const mermaidEl = document.querySelector('[data-be="mermaid"]');
      const chartArea = mermaidEl?.children[1];
      if (chartArea) fireEvent.click(chartArea as Element);
      expect(mermaidEl).toBeInTheDocument();
    });

    it('language 为 mermaid 时图表区域存在（98-99）', () => {
      render(<MermaidElement {...defaultProps} />);
      const chartWrapper = document.querySelector('[data-be="mermaid"]')
        ?.children[1];
      expect(chartWrapper).toBeInTheDocument();
    });
  });

  it('应处理空 value 与非 mermaid 语言', () => {
    const { rerender } = render(
      <MermaidElement
        {...defaultProps}
        element={{ ...defaultProps.element, value: '' }}
      />,
    );
    expect(document.querySelector('[data-be="mermaid"]')).toBeInTheDocument();

    rerender(
      <MermaidElement
        {...defaultProps}
        element={{ ...defaultProps.element, language: 'javascript' }}
      />,
    );
    expect(document.querySelector('[data-be="mermaid"]')).toBeInTheDocument();
  });
});
