/**
 * Katex deepen residual：非 test 路径加载 katex、render 成功/空码、延迟 300ms。
 */
import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const renderFn = vi.fn((code: string, el: HTMLElement) => {
  el.innerHTML = `<span>${code}</span>`;
});

vi.mock('../loadKatex', () => ({
  loadKatex: vi.fn(async () => ({
    default: { render: renderFn },
  })),
}));

import { Katex } from '../Katex';

describe('Plugins/katex Katex deepen residual branches', () => {
  const prevEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderFn.mockClear();
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    cleanup();
    process.env.NODE_ENV = prevEnv;
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('加载 katex 后空公式显示占位；有公式 render', async () => {
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

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByText('Formula')).toBeTruthy();

    rerender(
      <Katex
        el={
          {
            type: 'code',
            language: 'katex',
            value: 'x^2',
            children: [{ text: 'x^2' }],
          } as any
        }
      />,
    );

    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(350);
    });
    expect(document.querySelector('.katex-container')).toBeTruthy();
  });

  it('loadKatex 失败仍设置 loaded 并显示占位', async () => {
    const { loadKatex } = await import('../loadKatex');
    vi.mocked(loadKatex).mockRejectedValueOnce(new Error('fail'));
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
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByText('Formula')).toBeTruthy();
  });
});
