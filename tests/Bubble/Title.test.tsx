import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { BubbleTitle } from '../../src/Bubble/Title';

describe('BubbleTitle', () => {
  it('should render title text and not render time when absent', () => {
    render(<BubbleTitle title="AI Assistant" />);
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    expect(screen.queryByTestId('bubble-time')).not.toBeInTheDocument();
  });

  it('should render time element when time is provided', () => {
    render(<BubbleTitle title="User" time={new Date('2023-12-21')} />);
    expect(screen.getByTestId('bubble-time')).toBeInTheDocument();
  });

  it('should apply left/right placement flex direction', () => {
    const { rerender } = render(
      <BubbleTitle title="Test" placement="left" />,
    );
    expect(screen.getByTestId('bubble-title')).toHaveStyle({ flexDirection: 'row' });

    rerender(<BubbleTitle title="Test" placement="right" />);
    expect(screen.getByTestId('bubble-title')).toHaveStyle({ flexDirection: 'row-reverse' });
  });

  it('should render quote content', () => {
    render(
      <BubbleTitle
        title="Test"
        quote={<div data-testid="quote">Quote</div>}
      />,
    );
    expect(screen.getByTestId('quote')).toBeInTheDocument();
  });

  it('should apply className, style, bubbleNameClassName', () => {
    render(
      <BubbleTitle
        title="Name"
        className="custom-title"
        style={{ margin: '10px' }}
        bubbleNameClassName="name-cls"
      />,
    );
    const titleEl = screen.getByTestId('bubble-title');
    expect(titleEl.className).toContain('custom-title');
    expect(titleEl).toHaveStyle({ margin: '10px' });
    expect(screen.getByText('Name')).toHaveClass('name-cls');
  });

  it('should accept ReactNode as title', () => {
    render(
      <BubbleTitle title={<strong data-testid="strong">Bold</strong>} />,
    );
    expect(screen.getByTestId('strong')).toBeInTheDocument();
  });
});
