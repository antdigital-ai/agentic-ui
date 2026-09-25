/**
 * Blockquote：containerType truthy 走 markdown-container 分支。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Blockquote } from '../index';

vi.mock('../../store', () => ({
  useEditorStore: vi.fn(() => ({
    store: { dragStart: vi.fn() },
    markdownContainerRef: { current: document.createElement('div') },
  })),
}));

describe('Blockquote branches', () => {
  it.skip('containerType 存在时渲染 markdown-container', () => {
    render(
      <Blockquote
        attributes={{ 'data-slate-node': 'element' } as any}
        element={
          {
            type: 'blockquote',
            children: [{ text: 'q' }],
            otherProps: {
              markdownContainerType: 'tip',
              markdownContainerTitle: 'Title',
            },
          } as any
        }
      >
        quote
      </Blockquote>,
    );
    expect(screen.getByTestId('markdown-container')).toBeInTheDocument();
    expect(screen.getByTestId('markdown-container-title')).toHaveTextContent(
      'Title',
    );
  });
});
