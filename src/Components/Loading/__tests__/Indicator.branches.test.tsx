/**
 * Indicator：ValidElement indicator 分支。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import Indicator from '../Indicator';

describe('Indicator branches', () => {
  it('indicator 为有效 ReactElement 时 clone 并合并 style', () => {
    render(
      <Indicator
        indicator={<span data-testid="custom" style={{ opacity: 0.5 }} />}
        style={{ color: 'red' }}
      />,
    );
    const el = screen.getByTestId('custom');
    expect(el).toHaveStyle({ opacity: '0.5', color: 'red' });
  });
});
