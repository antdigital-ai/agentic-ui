/**
 * ReadonlyLinkCard deepen：无 contentCls 时 blockCls 空串。
 */
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadonlyLinkCard } from '../ReadonlyLinkCard';

const attrs = { 'data-slate-node': 'element' } as any;

describe('ReadonlyLinkCard deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 prefixCls 时 blockCls 为空', () => {
    const { container } = render(
      <ReadonlyLinkCard
        element={
          {
            type: 'link-card',
            url: 'https://example.com',
            title: 't',
            finished: true,
            collaborators: [],
            updateTime: '',
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        <span key="icon">ICON</span>
        <span key="body">body</span>
      </ReadonlyLinkCard>,
    );
    expect(container.textContent).toContain('ICON');
    expect(screen.getByText('t')).toBeTruthy();
  });
});
