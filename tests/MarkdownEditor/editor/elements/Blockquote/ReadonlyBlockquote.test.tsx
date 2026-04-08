import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { ReadonlyBlockquote } from '../../../../../src/MarkdownEditor/editor/elements/Blockquote/ReadonlyBlockquote';

describe('ReadonlyBlockquote', () => {
  const base = {
    attributes: {} as any,
    children: <span>inner</span>,
  };

  it('markdownContainerType 时渲染 markdown-container 与标题 (46-58)', () => {
    const { container } = render(
      <ReadonlyBlockquote
        {...base}
        element={
          {
            type: 'blockquote',
            children: [],
            otherProps: {
              markdownContainerType: 'info',
              markdownContainerTitle: '提示',
            },
          } as any
        }
      />,
    );
    const div = container.querySelector('.markdown-container.info');
    expect(div).toBeInTheDocument();
    expect(screen.getByText('提示')).toBeInTheDocument();
    expect(screen.getByText('inner')).toBeInTheDocument();
  });

  it('无 containerType 时渲染 blockquote (64)', () => {
    render(
      <ReadonlyBlockquote
        {...base}
        element={{ type: 'blockquote', children: [] } as any}
      />,
    );
    expect(document.querySelector('blockquote[data-be="blockquote"]')).toBeInTheDocument();
  });
});
