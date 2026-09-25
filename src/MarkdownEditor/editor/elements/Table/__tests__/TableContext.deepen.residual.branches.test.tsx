/**
 * TableContext deepen：默认 context 与 TestProvider。
 */
import { cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  TableContextTestProvider,
  TablePropsContext,
  useTableStaticContext,
} from '../TableContext';

function StaticProbe() {
  const value = useTableStaticContext();
  return <div data-testid="static">{String(Boolean(value))}</div>;
}

describe('TableContext deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('TestProvider 与默认 PropsContext 可消费', () => {
    render(
      <TableContextTestProvider>
        <TablePropsContext.Consumer>
          {(v) => <div data-testid="props">{JSON.stringify(v ?? {})}</div>}
        </TablePropsContext.Consumer>
        <StaticProbe />
      </TableContextTestProvider>,
    );
    expect(screen.getByTestId('props')).toBeTruthy();
    expect(screen.getByTestId('static')).toBeTruthy();
  });
});
