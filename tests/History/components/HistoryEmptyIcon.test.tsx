import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { HistoryEmptyIcon } from '../../../src/History/components/HistoryEmptyIcon';

describe('HistoryEmptyIcon', () => {
  it('应渲染空状态 SVG 图标', () => {
    const { container } = render(<HistoryEmptyIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox');
  });

  it('应透传 SVG 属性', () => {
    render(<HistoryEmptyIcon data-testid="empty-icon" width="100" />);
    expect(screen.getByTestId('empty-icon')).toHaveAttribute('width', '100');
  });
});
