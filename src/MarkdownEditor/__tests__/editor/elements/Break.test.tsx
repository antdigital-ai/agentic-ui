import { Break } from '@ant-design/agentic-ui/MarkdownEditor/editor/elements/Break';
import { ReadonlyBreak } from '@ant-design/agentic-ui/MarkdownEditor/editor/elements/Break/ReadonlyBreak';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

describe('Break Component', () => {
  const mockAttributes = {
    'data-slate-node': 'element',
    'data-slate-inline': true,
    'data-slate-void': true,
    ref: null,
  } as any;

  const mockChildren = (<span>Test content</span>) as any;

  it('应该正确渲染Break组件', () => {
    render(<Break attributes={mockAttributes} children={mockChildren} element={{ type: 'break', children: [] } as any} />);

    const breakElement = screen.getByText('Test content').parentElement;
    expect(breakElement).toBeInTheDocument();
    expect(breakElement).toHaveAttribute('contentEditable', 'false');
    expect(breakElement).toHaveAttribute('data-slate-node', 'element');
  });

  it('应该包含br标签', () => {
    render(<Break attributes={mockAttributes} children={mockChildren} element={{ type: 'break', children: [] } as any} />);

    const brElement = screen
      .getByText('Test content')
      .parentElement?.querySelector('br');
    expect(brElement).toBeInTheDocument();
  });

  it('应该正确传递attributes属性', () => {
    const customAttributes = {
      ...mockAttributes,
      'data-testid': 'break-element',
      className: 'custom-class',
    };

    render(<Break attributes={customAttributes} children={mockChildren} element={{ type: 'break', children: [] } as any} />);

    const breakElement = screen.getByText('Test content').parentElement;
    expect(breakElement).toHaveAttribute('data-testid', 'break-element');
    expect(breakElement).toHaveClass('custom-class');
  });

  it('应该渲染children内容', () => {
    const customChildren = <div data-testid="child-content">Child content</div>;

    render(<Break attributes={mockAttributes} children={customChildren} element={{ type: 'break', children: [] } as any} />);

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('应该处理空的children', () => {
    render(<Break attributes={mockAttributes} children={null} element={{ type: 'break', children: [] } as any} />);

    const breakElement = document.querySelector(
      'span[contenteditable="false"]',
    );
    expect(breakElement).toBeInTheDocument();
    expect(breakElement).toHaveAttribute('contentEditable', 'false');
  });

  it('ReadonlyBreak 渲染 br (33)', () => {
    render(
      <ReadonlyBreak
        attributes={mockAttributes}
        children={<span>ro</span>}
        element={{ type: 'break', children: [] } as any}
      />,
    );
    expect(screen.getByText('ro').parentElement?.querySelector('br')).toBeInTheDocument();
  });
});
