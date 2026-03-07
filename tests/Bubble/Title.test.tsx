import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { BubbleTitle } from '../../src/Bubble/Title';

describe('BubbleTitle', () => {
  it('should render with title text', () => {
    render(<BubbleTitle title="AI Assistant" />);
    const titleEl = screen.getByTestId('bubble-title');
    expect(titleEl).toBeInTheDocument();
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });

  it('should render with time', () => {
    render(<BubbleTitle title="User" time={new Date('2023-12-21')} />);
    const timeEl = screen.getByTestId('bubble-time');
    expect(timeEl).toBeInTheDocument();
  });

  it('should not render time when not provided', () => {
    render(<BubbleTitle title="User" />);
    expect(screen.queryByTestId('bubble-time')).not.toBeInTheDocument();
  });

  it('should not render title span when title is falsy', () => {
    const { container } = render(<BubbleTitle title="" />);
    const titleEl = screen.getByTestId('bubble-title');
    expect(titleEl).toBeInTheDocument();
    expect(titleEl.querySelector('span')).toBeFalsy();
  });

  it('should apply left placement flex direction', () => {
    render(<BubbleTitle title="Test" placement="left" />);
    const titleEl = screen.getByTestId('bubble-title');
    expect(titleEl).toHaveStyle({ flexDirection: 'row' });
  });

  it('should apply right placement flex direction', () => {
    render(<BubbleTitle title="Test" placement="right" />);
    const titleEl = screen.getByTestId('bubble-title');
    expect(titleEl).toHaveStyle({ flexDirection: 'row-reverse' });
  });

  it('should render quote content', () => {
    render(
      <BubbleTitle
        title="Test"
        quote={<div data-testid="quote-content">Quote text</div>}
      />,
    );
    expect(screen.getByTestId('quote-content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<BubbleTitle title="Test" className="custom-title" />);
    const titleEl = screen.getByTestId('bubble-title');
    expect(titleEl.className).toContain('custom-title');
  });

  it('should apply custom style', () => {
    render(<BubbleTitle title="Test" style={{ margin: '10px' }} />);
    const titleEl = screen.getByTestId('bubble-title');
    expect(titleEl).toHaveStyle({ margin: '10px' });
  });

  it('should apply bubbleNameClassName to name span', () => {
    render(
      <BubbleTitle title="Name" bubbleNameClassName="name-class" />,
    );
    const nameSpan = screen.getByText('Name');
    expect(nameSpan).toHaveClass('name-class');
  });

  it('should render with React node title', () => {
    render(
      <BubbleTitle
        title={<strong data-testid="strong-title">Bold Title</strong>}
      />,
    );
    expect(screen.getByTestId('strong-title')).toBeInTheDocument();
  });

  it('should render with timestamp number', () => {
    render(<BubbleTitle title="Test" time={1703145600000} />);
    const timeEl = screen.getByTestId('bubble-time');
    expect(timeEl).toBeInTheDocument();
  });
});
