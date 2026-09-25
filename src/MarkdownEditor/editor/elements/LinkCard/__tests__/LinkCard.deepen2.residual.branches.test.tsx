/**
 * LinkCard deepen2：完成态无 prefix 渲染。
 */
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LinkCard } from '../index';

const attrs = { 'data-slate-node': 'element' } as any;

describe('LinkCard deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 prefix 渲染', () => {
    const { container } = render(
      <LinkCard
        element={
          {
            type: 'link-card',
            finished: true,
            title: 'T2',
            url: 'https://t2.test',
            collaborators: [],
            updateTime: '',
            children: [{ text: '' }],
          } as any
        }
        attributes={attrs}
      >
        <span key="icon">ICON</span>
        <span key="body">body</span>
      </LinkCard>,
    );
    expect(container.querySelector('[data-be="link-card"]')).toBeTruthy();
    expect(screen.getByText('ICON')).toBeTruthy();
  });
});
