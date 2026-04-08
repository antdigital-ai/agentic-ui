import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleAvatar } from '../../src/Bubble/Avatar';

describe('BubbleAvatar', () => {
  it('should render image avatar for http/https/path URLs', () => {
    render(<BubbleAvatar avatar="https://example.com/avatar.png" />);
    expect(document.querySelector('img[alt="avatar"]')).toBeTruthy();
  });

  it('should render base64 avatar via src attribute directly', () => {
    render(<BubbleAvatar avatar="data:image/png;base64,abc123" />);
    expect(screen.getByTestId('bubble-avatar')).toBeInTheDocument();
  });

  it('should render text avatar (first 2 chars uppercased) for non-URL strings', () => {
    render(<BubbleAvatar avatar="John" />);
    expect(screen.getByTestId('bubble-avatar').textContent).toContain('JO');
  });

  it('should render emoji directly without Avatar wrapper', () => {
    const { container } = render(<BubbleAvatar avatar="😊" prefixCls="test" />);
    expect(container.querySelector('.test-emoji')!.textContent).toBe('😊');
  });

  it('should set cursor:default when no onClick, normal cursor with onClick', () => {
    const { rerender } = render(<BubbleAvatar avatar="AB" />);
    expect(screen.getByTestId('bubble-avatar')).toHaveStyle({ cursor: 'default' });

    const onClick = vi.fn();
    rerender(<BubbleAvatar avatar="AB" onClick={onClick} />);
    expect(screen.getByTestId('bubble-avatar').style.cursor).not.toBe('default');
  });

  it('should fire onClick callback', () => {
    const onClick = vi.fn();
    render(<BubbleAvatar avatar="AB" onClick={onClick} />);
    screen.getByTestId('bubble-avatar').click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should apply className and shape', () => {
    render(<BubbleAvatar avatar="AB" className="my-avatar" shape="square" />);
    expect(screen.getByTestId('bubble-avatar').className).toContain('my-avatar');
  });
});
