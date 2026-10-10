import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BubbleAvatar } from '../Avatar';

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
    expect(screen.getByTestId('bubble-avatar')).toHaveStyle({
      cursor: 'default',
    });

    const onClick = vi.fn();
    rerender(<BubbleAvatar avatar="AB" onClick={onClick} />);
    expect(screen.getByTestId('bubble-avatar').style.cursor).not.toBe(
      'default',
    );
  });

  it('should fire onClick callback', () => {
    const onClick = vi.fn();
    render(<BubbleAvatar avatar="AB" onClick={onClick} />);
    screen.getByTestId('bubble-avatar').click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should apply className and shape', () => {
    render(<BubbleAvatar avatar="AB" className="my-avatar" shape="square" />);
    expect(screen.getByTestId('bubble-avatar').className).toContain(
      'my-avatar',
    );
  });

  it.each(['😊', 'AB', 'https://example.com/avatar.png'])(
    'supports keyboard activation without an extra wrapper for %s',
    (avatar) => {
      const onClick = vi.fn();
      const onKeyDown = vi.fn();
      const { container } = render(
        <BubbleAvatar
          avatar={avatar}
          onClick={onClick}
          onKeyDown={onKeyDown}
          aria-label="Open user"
        />,
      );
      const control = screen.getByRole('button', { name: 'Open user' });
      expect(container.firstElementChild).toBe(control);
      expect(control).toHaveAttribute('tabindex', '0');
      fireEvent.keyDown(control, { key: 'Enter' });
      fireEvent.keyDown(control, { key: ' ' });
      fireEvent.keyDown(control, { key: 'ArrowDown' });
      expect(onClick).toHaveBeenCalledTimes(2);
      expect(onKeyDown).toHaveBeenCalledTimes(3);
    },
  );

  it('preserves emoji semantic class names, styles and clicks on its existing node', () => {
    const onClick = vi.fn();
    const { container } = render(
      <BubbleAvatar
        avatar="😊"
        className="custom-avatar"
        style={{ color: 'red' }}
        onClick={onClick}
      />,
    );
    const avatar = screen.getByTestId('bubble-avatar');
    expect(avatar).toHaveClass('custom-avatar');
    expect(avatar).toHaveStyle({ color: 'red' });
    expect(container.querySelectorAll('*')).toHaveLength(1);
    fireEvent.click(avatar);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('allows callers to intercept keyboard activation and keeps decorative avatars out of the tab order', () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <BubbleAvatar
        avatar="😊"
        onClick={onClick}
        onKeyDown={(event) => event.preventDefault()}
      />,
    );
    fireEvent.keyDown(screen.getByTestId('bubble-avatar'), { key: 'Enter' });
    expect(onClick).not.toHaveBeenCalled();
    rerender(<BubbleAvatar avatar="😊" />);
    expect(screen.getByTestId('bubble-avatar')).not.toHaveAttribute('role');
    expect(screen.getByTestId('bubble-avatar')).not.toHaveAttribute('tabindex');
  });

  it('uses the title as a fallback instead of displaying undefined initials', () => {
    const { rerender } = render(<BubbleAvatar title="Assistant" />);
    expect(screen.getByTestId('bubble-avatar')).toHaveTextContent('AS');
    rerender(<BubbleAvatar />);
    expect(screen.getByTestId('bubble-avatar')).not.toHaveTextContent('UN');
  });

  it.each(['😊', 'AB', 'https://example.com/avatar.png'])(
    'applies the configured background while allowing style overrides for %s',
    (avatar) => {
      const { rerender } = render(
        <BubbleAvatar avatar={avatar} background="red" />,
      );
      const node = screen.getByTestId('bubble-avatar');
      expect(node.style.backgroundColor).toBe('red');
      expect(node).not.toHaveAttribute('background');
      rerender(
        <BubbleAvatar
          avatar={avatar}
          background="red"
          style={{ backgroundColor: 'blue' }}
        />,
      );
      expect(node.style.backgroundColor).toBe('blue');
    },
  );

  it('ignores repeated keyboard activation and preserves a custom tab order', () => {
    const onClick = vi.fn();
    render(<BubbleAvatar avatar="😊" onClick={onClick} tabIndex={3} />);
    const avatar = screen.getByTestId('bubble-avatar');
    expect(avatar).toHaveAttribute('tabindex', '3');
    fireEvent.keyDown(avatar, { key: 'Enter', repeat: true });
    fireEvent.keyDown(avatar, { key: ' ', repeat: true });
    expect(onClick).not.toHaveBeenCalled();
  });
});
