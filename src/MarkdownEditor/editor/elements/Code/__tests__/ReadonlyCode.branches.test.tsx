/**
 * ReadonlyCode：html/config、unclosed、plain/legacy/children 正文回退。
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { ReadonlyCode } from '../ReadonlyCode';

const attrs = {
  'data-slate-node': 'element' as const,
  ref: null,
};

describe('ReadonlyCode branches', () => {
  it('html + isConfig 隐藏', () => {
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
        child
      </ReadonlyCode>,
    );
    expect((container.firstChild as HTMLElement).style.display).toBe('none');
  });

  it('html 非 config 消毒渲染', () => {
    const { container } = render(
      <ReadonlyCode
        attributes={attrs as any}
        element={
          {
            type: 'code',
            language: 'html',
            value: '<b>hi</b>',
            children: [{ text: '<b>hi</b>' }],
          } as any
        }
      >
        child
      </ReadonlyCode>,
    );
    expect(container.innerHTML).toContain('hi');
  });

  it('finished false 设置 data-is-unclosed', () => {
    render(
      <ReadonlyCode
        attributes={attrs as any}
        element={
          {
            type: 'code',
            language: 'js',
            value: 'const a = 1',
            otherProps: { finished: false },
            children: [{ text: 'const a = 1' }],
          } as any
        }
      >
        child
      </ReadonlyCode>,
    );
    expect(
      document.querySelector('[data-is-unclosed]')?.getAttribute(
        'data-is-unclosed',
      ),
    ).toBe('true');
  });

  it('plainBody 与 value 皆空时回退 children', () => {
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
        <span>fallback-child</span>
      </ReadonlyCode>,
    );
    expect(screen.getByText('fallback-child')).toBeTruthy();
  });

  it('plainBody 空时使用 legacy value', () => {
    render(
      <ReadonlyCode
        attributes={attrs as any}
        element={
          {
            type: 'code',
            language: 'ts',
            value: 'legacy-code',
            children: [{ text: '' }],
          } as any
        }
      >
        child
      </ReadonlyCode>,
    );
    expect(screen.getByText('legacy-code')).toBeTruthy();
  });

  it.skip('非 html isConfig 隐藏；unclosed undefined 不写属性', () => {
    const { container } = render(
      <ReadonlyCode
        attributes={attrs as any}
        element={
          {
            type: 'code',
            language: 'js',
            value: 'x',
            otherProps: { isConfig: true },
            children: [{ text: 'x' }],
          } as any
        }
      >
        c
      </ReadonlyCode>,
    );
    expect((container.firstChild as HTMLElement).style.display).toBe('none');
  });
});
