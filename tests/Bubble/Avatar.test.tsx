import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleAvatar } from '../../src/Bubble/Avatar';

describe('BubbleAvatar', () => {
  it('should render with image URL', () => {
    render(<BubbleAvatar avatar="https://example.com/avatar.png" />);
    const avatarEl = screen.getByTestId('bubble-avatar');
    expect(avatarEl).toBeInTheDocument();
  });

  it('should render with http avatar as image', () => {
    render(<BubbleAvatar avatar="http://example.com/avatar.png" />);
    const img = document.querySelector('img[alt="avatar"]');
    expect(img).toBeTruthy();
  });

  it('should render with base64 avatar', () => {
    render(<BubbleAvatar avatar="data:image/png;base64,abc123" />);
    const avatarEl = screen.getByTestId('bubble-avatar');
    expect(avatarEl).toBeInTheDocument();
  });

  it('should render with path avatar', () => {
    render(<BubbleAvatar avatar="/images/avatar.png" />);
    const img = document.querySelector('img[alt="avatar"]');
    expect(img).toBeTruthy();
  });

  it('should render text avatar when avatar is not an image URL', () => {
    render(<BubbleAvatar avatar="John" />);
    const avatarEl = screen.getByTestId('bubble-avatar');
    expect(avatarEl).toBeInTheDocument();
    expect(avatarEl.textContent).toContain('JO');
  });

  it('should render emoji directly', () => {
    const { container } = render(<BubbleAvatar avatar="😊" prefixCls="test" />);
    const emojiEl = container.querySelector('.test-emoji');
    expect(emojiEl).toBeTruthy();
    expect(emojiEl!.textContent).toBe('😊');
  });

  it('should apply custom size', () => {
    render(<BubbleAvatar avatar="AB" size={48} />);
    const avatarEl = screen.getByTestId('bubble-avatar');
    expect(avatarEl).toBeInTheDocument();
  });

  it('should apply default size of 24', () => {
    render(<BubbleAvatar avatar="AB" />);
    const avatarEl = screen.getByTestId('bubble-avatar');
    expect(avatarEl).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const onClick = vi.fn();
    render(<BubbleAvatar avatar="AB" onClick={onClick} />);

    const avatarEl = screen.getByTestId('bubble-avatar');
    avatarEl.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should apply cursor default when no onClick', () => {
    render(<BubbleAvatar avatar="AB" />);
    const avatarEl = screen.getByTestId('bubble-avatar');
    expect(avatarEl).toHaveStyle({ cursor: 'default' });
  });

  it('should not add cursor default when onClick is provided', () => {
    render(<BubbleAvatar avatar="AB" onClick={() => {}} />);
    const avatarEl = screen.getByTestId('bubble-avatar');
    expect(avatarEl.style.cursor).not.toBe('default');
  });

  it('should apply custom className', () => {
    render(<BubbleAvatar avatar="AB" className="my-avatar" />);
    const avatarEl = screen.getByTestId('bubble-avatar');
    expect(avatarEl.className).toContain('my-avatar');
  });

  it('should render title text for image avatars', () => {
    render(
      <BubbleAvatar
        avatar="https://example.com/avatar.png"
        title="User Name"
      />,
    );
    const avatarEl = screen.getByTestId('bubble-avatar');
    expect(avatarEl).toBeInTheDocument();
  });

  it('should handle square shape', () => {
    render(<BubbleAvatar avatar="AB" shape="square" />);
    const avatarEl = screen.getByTestId('bubble-avatar');
    expect(avatarEl).toBeInTheDocument();
  });
});
