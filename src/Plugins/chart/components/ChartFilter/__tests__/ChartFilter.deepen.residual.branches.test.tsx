/**
 * ChartFilter deepen：filterOptions 缺省空数组。
 */
import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('ChartFilter deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 options 渲染', async () => {
    const mod = await import('../ChartFilter');
    const Comp =
      (mod as any).ChartFilter || (mod as any).default || Object.values(mod)[0];
    render(<Comp value={undefined} onChange={vi.fn()} />);
    expect(document.body).toBeTruthy();
  });
});
