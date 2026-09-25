/**
 * ReadonlyCode residual：非字符串 value、finished 未设、children 回退。
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { ReadonlyCode } from '../ReadonlyCode';

const attrs = {
  'data-slate-node': 'element' as const,
  ref: null,
};

describe('ReadonlyCode residual branches', () => {
  it('value 非字符串时 legacy 为空，回退 children', () => {
    render(
      <ReadonlyCode
        attributes={attrs as any}
        element={
          {
            type: 'code',
            language: 'js',
            value: 123 as any,
            children: [{ text: '' }],
          } as any
        }
      >
        <span>via-children</span>
      </ReadonlyCode>,
    );
    expect(screen.getByText('via-children')).toBeTruthy();
  });

  it('finished 非 false 时不设 data-is-unclosed', () => {
    const { container } = render(
      <ReadonlyCode
        attributes={attrs as any}
        element={
          {
            type: 'code',
            language: 'ts',
            value: 'ok',
            otherProps: { finished: true },
            children: [{ text: 'ok' }],
          } as any
        }
      >
        x
      </ReadonlyCode>,
    );
    expect(container.querySelector('[data-is-unclosed]')).toBeNull();
  });

  it('html + 非 config：消毒后可见', () => {
    const { container } = render(
      <ReadonlyCode
        attributes={attrs as any}
        element={
          {
            type: 'code',
            language: 'html',
            value: '<em>em</em>',
            otherProps: { isConfig: false },
            children: [{ text: '<em>em</em>' }],
          } as any
        }
      >
        c
      </ReadonlyCode>,
    );
    expect(container.innerHTML).toMatch(/em/);
    expect((container.firstChild as HTMLElement).style.display).not.toBe(
      'none',
    );
  });
});
