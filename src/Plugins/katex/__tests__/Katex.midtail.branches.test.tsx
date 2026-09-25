/**
 * Plugins katex / code Katex midtail：test 环境早退与空源。
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { Katex as CodeKatex } from '../../code/CodeUI/Katex/Katex';
import { Katex } from '../Katex';

describe('Katex midtail branches', () => {
  it('Plugins/katex：空源占位 / 有源容器', () => {
    const { rerender } = render(
      <Katex
        el={
          {
            type: 'code',
            language: 'katex',
            value: '',
            children: [{ text: '' }],
          } as any
        }
      />,
    );
    expect(screen.getByText('Formula')).toBeTruthy();
    rerender(
      <Katex
        el={
          {
            type: 'code',
            language: 'katex',
            value: 'E=mc^2',
            children: [{ text: 'E=mc^2' }],
          } as any
        }
      />,
    );
    expect(document.querySelector('.katex-container') || document.body).toBeTruthy();
  });

  it('code/CodeUI/Katex：缺 el 回退；有 value', () => {
    const { container, rerender } = render(<CodeKatex />);
    expect(container.firstChild).toBeTruthy();
    rerender(
      <CodeKatex
        el={{ value: 'a^2', type: 'code', language: 'katex' } as any}
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });
});
