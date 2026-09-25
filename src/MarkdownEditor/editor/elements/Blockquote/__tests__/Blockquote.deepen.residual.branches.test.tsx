/**
 * Blockquote deepen：containerType 有/无 title；普通 blockquote。
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../store', () => ({
  useEditorStore: () => ({
    store: { dragStart: vi.fn() },
    markdownContainerRef: { current: document.createElement('div') },
  }),
}));

import { Blockquote } from '../index';

describe('Blockquote deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('containerType + title 渲染标题', () => {
    render(
      <Blockquote
        attributes={{ 'data-slate-node': 'element' } as any}
        element={
          {
            type: 'blockquote',
            children: [{ text: 'q' }],
            otherProps: {
              markdownContainerType: 'tip',
              markdownContainerTitle: '标题',
            },
          } as any
        }
      >
        quote
      </Blockquote>,
    );
    expect(screen.getByTestId('markdown-container')).toBeTruthy();
    expect(screen.getByTestId('markdown-container-title').textContent).toBe(
      '标题',
    );
  });

  it('containerType 无 title 时不渲染标题节点', () => {
    render(
      <Blockquote
        attributes={{ 'data-slate-node': 'element' } as any}
        element={
          {
            type: 'blockquote',
            children: [{ text: 'q' }],
            otherProps: { markdownContainerType: 'warning' },
          } as any
        }
      >
        quote
      </Blockquote>,
    );
    expect(screen.getByTestId('markdown-container')).toBeTruthy();
    expect(screen.queryByTestId('markdown-container-title')).toBeNull();
  });

  it('无 containerType 渲染原生 blockquote', () => {
    render(
      <Blockquote
        attributes={{ 'data-slate-node': 'element' } as any}
        element={{ type: 'blockquote', children: [{ text: 'q' }] } as any}
      >
        plain
      </Blockquote>,
    );
    expect(screen.getByTestId('blockquote')).toBeTruthy();
  });
});
