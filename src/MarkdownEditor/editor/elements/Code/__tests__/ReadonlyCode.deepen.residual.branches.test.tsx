/**
 * ReadonlyCode deepen：plain 空走 legacy；legacy 空走 children；html config 隐藏。
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadonlyCode } from '../ReadonlyCode';

const attrs = {
  'data-slate-node': 'element' as const,
  ref: null,
};

describe('ReadonlyCode deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('plainBody 空且 legacy 有值时显示 legacy', () => {
    render(
      <ReadonlyCode
        attributes={attrs as any}
        element={
          {
            type: 'code',
            language: 'js',
            value: 'legacy-body',
            children: [{ text: '' }],
          } as any
        }
      >
        <span>ignored</span>
      </ReadonlyCode>,
    );
    expect(screen.getByText('legacy-body')).toBeTruthy();
  });

  it('plain 与 legacy 皆空时回退 children', () => {
    render(
      <ReadonlyCode
        attributes={attrs as any}
        element={
          {
            type: 'code',
            language: 'js',
            value: '',
            children: [{ text: '' }],
          } as any
        }
      >
        <span>child-fallback</span>
      </ReadonlyCode>,
    );
    expect(screen.getByText('child-fallback')).toBeTruthy();
  });

  it('html + isConfig 隐藏容器', () => {
    const { container } = render(
      <ReadonlyCode
        attributes={attrs as any}
        element={
          {
            type: 'code',
            language: 'html',
            value: '<b>x</b>',
            otherProps: { isConfig: true },
            children: [{ text: '<b>x</b>' }],
          } as any
        }
      >
        c
      </ReadonlyCode>,
    );
    expect((container.firstChild as HTMLElement).style.display).toBe('none');
  });
});
