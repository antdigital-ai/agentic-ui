/**
 * Loading deepen：nested pattern 且 spinning=false 时不渲染 loadingElement。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Loading } from '../Loading';

describe('Loading deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('嵌套模式 spinning=false 不渲染 indicator', () => {
    render(
      <Loading spinning={false}>
        <div data-testid="child">c</div>
      </Loading>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(
      document.querySelector('[data-testid$="-nested-pattern"]'),
    ).toBeTruthy();
  });
});
