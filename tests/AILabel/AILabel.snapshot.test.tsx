import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AILabel } from '../../src/AILabel';

// Mock framer-motion to ensure snapshot consistency
vi.mock('framer-motion', () => ({
  motion: {
    sup: ({ children, className, style, ...props }: React.ComponentProps<'sup'>) => (
      <sup className={className} style={style} {...props}>
        {children}
      </sup>
    ),
  },
}));

describe('AILabel Snapshot', () => {
  it('renders correctly with default props', () => {
    const { container } = render(<AILabel />);
    expect(container).toMatchSnapshot();
  });

  it('renders correctly with different statuses', () => {
    const { container } = render(
      <>
        <AILabel status="default" />
        <AILabel status="emphasis" />
        <AILabel status="watermark" />
      </>
    );
    expect(container).toMatchSnapshot();
  });

  it('renders correctly with children', () => {
    const { container } = render(
      <AILabel>
        <span>Test Content</span>
      </AILabel>
    );
    expect(container).toMatchSnapshot();
  });

  it('renders correctly with offset and custom style', () => {
    const { container } = render(
      <AILabel 
        offset={[10, -5]} 
        style={{ color: 'red' }} 
        rootStyle={{ margin: '20px' }} 
        className="test-class"
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('renders correctly with tooltip', () => {
    const { container } = render(
      <AILabel 
        tooltip={{ title: 'Test Tooltip' }}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
