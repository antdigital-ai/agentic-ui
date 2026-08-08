/**
 * QuickActions：省略 isHover 使用默认 false。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { QuickActions } from '../index';

describe('QuickActions branches', () => {
  it.skip('省略 isHover 时 quickActionRender 收到 isHover=false', () => {
    render(
      <QuickActions
        quickActionRender={({ isHover }) => (
          <span data-testid="hover">{String(isHover)}</span>
        )}
      />,
    );
    expect(screen.getByTestId('hover')).toHaveTextContent('false');
  });
});
