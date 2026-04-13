import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AILabel } from '../../src/AILabel';

vi.mock('framer-motion', () => ({
  motion: {
    sup: ({ children, className, style, ...props }: React.ComponentProps<'sup'>) => (
      <sup className={className} style={style} {...props}>
        {children}
      </sup>
    ),
  },
}));

const renderWithAntd = (ui: React.ReactElement) =>
  render(<ConfigProvider>{ui}</ConfigProvider>);

describe('AILabel', () => {
  it('renders label dot with svg icon', () => {
    const { container } = renderWithAntd(<AILabel />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('sup')).toBeInTheDocument();
  });

  it('renders different statuses', () => {
    const { container } = renderWithAntd(
      <>
        <AILabel status="default" />
        <AILabel status="emphasis" />
        <AILabel status="watermark" />
      </>,
    );
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(3);
  });

  it('renders children', () => {
    renderWithAntd(
      <AILabel>
        <span>Test Content</span>
      </AILabel>,
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies offset and custom style', () => {
    const { container } = renderWithAntd(
      <AILabel
        offset={[10, -5]}
        style={{ color: 'red' }}
        rootStyle={{ margin: '20px' }}
        className="test-class"
      />,
    );
    const root = container.querySelector('.test-class');
    expect(root).toBeInTheDocument();
    expect(root).toHaveStyle({ margin: '20px' });
    const dot = container.querySelector('sup');
    expect(dot).toHaveStyle({ color: 'rgb(255, 0, 0)' });
  });

  it('renders with tooltip config', () => {
    const { container } = renderWithAntd(
      <AILabel tooltip={{ title: 'Test Tooltip' }} />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
