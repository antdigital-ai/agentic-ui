import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { DotLoading } from '../../src/ThoughtChainList/DotAni';

describe('DotLoading', () => {
  it('should render with data-testid', () => {
    render(<DotLoading />);
    const el = screen.getByTestId('dot-loading');
    expect(el).toBeInTheDocument();
  });

  it('should have progressbar role', () => {
    render(<DotLoading />);
    const el = screen.getByRole('progressbar');
    expect(el).toBeInTheDocument();
  });

  it('should have aria-label', () => {
    render(<DotLoading />);
    const el = screen.getByTestId('dot-loading');
    expect(el).toHaveAttribute('aria-label', 'Loading');
  });

  it('should have the loader class', () => {
    render(<DotLoading />);
    const el = screen.getByTestId('dot-loading');
    expect(el.className).toContain('agentic-md-editor-loader');
  });
});
