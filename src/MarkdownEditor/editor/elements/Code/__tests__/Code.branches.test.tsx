/**
 * Code：language === html 分支。
 */
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { Code } from '../index';

const attrs = { 'data-slate-node': 'element' as const, ref: null };

describe('Code branches', () => {
  it('language 为 html 时渲染 sanitized html', () => {
    const { container } = render(
      <Code
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
        <span />
      </Code>,
    );
    expect(container.querySelector('b')).toBeTruthy();
  });
});
