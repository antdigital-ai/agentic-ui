/**
 * CodeUI Katex residual：el 缺省回退、空/有公式占位。
 * 测试环境跳过真实 katex 加载（katexRef 仍为空），仅覆盖加载门控与占位渲染。
 */
import { render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Katex } from '../Katex';

describe('Plugins/code CodeUI Katex residual branches', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  it('el 未传时仍渲染 Formula 占位', () => {
    render(<Katex />);
    expect(screen.getByText('Formula')).toBeTruthy();
  });

  it('有 value 时存在 katex-container', () => {
    const { container } = render(
      <Katex
        el={
          {
            type: 'code',
            language: 'katex',
            value: 'a+b',
            children: [{ text: 'a+b' }],
          } as any
        }
      />,
    );
    expect(container.querySelector('.katex-container')).toBeTruthy();
  });
});
