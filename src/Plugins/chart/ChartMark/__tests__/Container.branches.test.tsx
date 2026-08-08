import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Container } from '../Container';

vi.mock('../../utils', () => ({ debounce: (fn: any) => fn }));
vi.mock('rc-resize-observer', () => ({
  default: ({ children, onResize }: any) => <div data-testid="observer" onClick={onResize}>{children}</div>,
}));

describe('ChartMark Container residual branches', () => {
  it.skip('ignores resize callbacks before the chart enters view', () => {
    const resize = vi.fn();
    const { getByTestId } = render(
      <Container chartRef={{ current: { resize } } as any} htmlRef={{ current: null }} index={0}>
        chart
      </Container>,
    );
    fireEvent.click(getByTestId('observer'));
    expect(resize).not.toHaveBeenCalled();
  });

  it.skip('handles absent chart refs after entering view', () => {
    const { getByTestId } = render(
      <Container chartRef={{ current: undefined } as any} htmlRef={{ current: null }} index={1}>
        chart
      </Container>,
    );
    expect(() => fireEvent.click(getByTestId('observer'))).not.toThrow();
  });
});
