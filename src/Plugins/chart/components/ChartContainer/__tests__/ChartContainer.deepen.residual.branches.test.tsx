/**
 * ChartContainer deepen：autoDetectTheme 缺省 true。
 */
import '@testing-library/jest-dom';
import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../hooks/useDetectTheme', () => ({
  useDetectTheme: () => 'light',
}));

vi.mock('../../../hooks', () => ({
  useDetectTheme: () => 'light',
}));

import { ChartContainer } from '../index';

describe('ChartContainer deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('省略 autoDetectTheme：默认开启仍渲染', () => {
    const { container } = render(
      <ChartContainer title="t">
        <div>child</div>
      </ChartContainer>,
    );
    expect(container.textContent).toContain('child');
  });
});
