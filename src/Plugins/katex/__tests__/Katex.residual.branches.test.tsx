/**
 * Katex residual（Plugins/katex）：空公式占位、有公式容器。
 * 测试环境跳过真实 katex 加载，仅覆盖门控与占位。
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Katex } from '../Katex';

describe('Plugins/katex Katex residual branches', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it('空 value 显示 Formula 占位', () => {
    render(
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
  });

  it('有公式时存在 katex-container', () => {
    const { container } = render(
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
    expect(container.querySelector('.katex-container')).toBeTruthy();
  });
});
