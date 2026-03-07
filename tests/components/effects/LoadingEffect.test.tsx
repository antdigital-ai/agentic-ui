import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LoadingEffect } from '../../../src/Components/effects/LoadingEffect';

describe('LoadingEffect', () => {
  it('should render without crashing', () => {
    const { container } = render(<LoadingEffect data-testid="loading" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('should apply custom size', () => {
    const { container } = render(<LoadingEffect size={64} />);
    const div = container.querySelector('div') as HTMLElement;
    expect(div).toHaveStyle({ width: '64px', height: '64px' });
  });

  it('should apply custom className', () => {
    const { container } = render(<LoadingEffect className="custom-loading" />);
    const div = container.querySelector('.custom-loading');
    expect(div).toBeTruthy();
  });

  it('should apply custom style', () => {
    const { container } = render(
      <LoadingEffect style={{ margin: '20px' }} />,
    );
    const div = container.querySelector('div') as HTMLElement;
    expect(div).toHaveStyle({ margin: '20px' });
  });

  it('should render with autoplay and loop disabled', () => {
    const { container } = render(
      <LoadingEffect autoplay={false} loop={false} />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('should render with default props', () => {
    const { container } = render(<LoadingEffect />);
    expect(container.firstChild).toBeTruthy();
  });
});
