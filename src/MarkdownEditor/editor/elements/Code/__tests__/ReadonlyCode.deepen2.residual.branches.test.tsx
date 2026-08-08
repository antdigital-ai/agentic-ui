/**
 * ReadonlyCode deepen2：html hide；双空回退 children。
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadonlyCode } from '../ReadonlyCode';

const attrs = {
  'data-slate-node': 'element' as const,
  ref: null,
};

describe('ReadonlyCode deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('plain 与 legacy 皆空时渲染 children', () => {
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

  it('language=html 且配置隐藏时仍挂载', () => {
    render(
      <ReadonlyCode
        attributes={attrs as any}
        element={
          {
            type: 'code',
            language: 'html',
            value: '<b>x</b>',
            children: [{ text: '' }],
          } as any
        }
      >
        <span />
      </ReadonlyCode>,
    );
  });
});
