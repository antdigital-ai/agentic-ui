/**
 * ReadonlyLinkCard deepen2：无 contentCls；children 为数组。
 */
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadonlyLinkCard } from '../ReadonlyLinkCard';

const attrs = { 'data-slate-node': 'element' } as any;

describe('ReadonlyLinkCard deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 contentCls', () => {
    const { container } = render(
      <ReadonlyLinkCard
        element={
          {
            type: 'link-card',
            url: 'https://example.com',
            title: 't2',
            finished: true,
            collaborators: [],
            updateTime: '',
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        <span key="icon">ICON2</span>
        <span key="body">body2</span>
      </ReadonlyLinkCard>,
    );
    expect(container.textContent).toContain('ICON2');
    expect(screen.getByText('t2')).toBeTruthy();
  });
});
