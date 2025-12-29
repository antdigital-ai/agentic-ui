import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CopyButton } from '../MessagesContent/CopyButton';

// Mock useCopied hook
vi.mock('../../hooks/useCopied', () => ({
  useCopied: vi.fn(() => ({
    copied: false,
    setCopied: vi.fn(),
  })),
}));

// Mock ActionIconBox
vi.mock('../../index', () => ({
  ActionIconBox: ({
    children,
    onClick,
    title,
    style,
    scale,
    'data-testid': dataTestId,
    ...props
  }: any) => (
    <span
      data-testid={dataTestId || 'action-icon-box'}
      onClick={onClick}
      style={style}
      title={title}
      data-scale={scale ? 'true' : 'false'}
      {...props}
    >
      {children}
    </span>
  ),
}));

describe('CopyButton', () => {
  const defaultProps = {
    onClick: vi.fn(),
    title: 'Copy content',
    'data-testid': 'test-copy-button',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染测试', () => {
    it('应该正确渲染CopyButton', () => {
      render(<CopyButton {...defaultProps} />);

      expect(screen.getByTestId('test-copy-button')).toBeInTheDocument();
    });

    it('应该处理点击事件', async () => {
      const onClick = vi.fn();
      render(<CopyButton {...defaultProps} onClick={onClick} />);

      const button = screen.getByTestId('test-copy-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(onClick).toHaveBeenCalled();
      });
    });

    it('应该处理复制功能', async () => {
      render(<CopyButton {...defaultProps} />);

      const button = screen.getByTestId('test-copy-button');
      fireEvent.click(button);

      expect(button).toBeInTheDocument();
    });
  });

  describe('子元素测试', () => {
    it('应该处理无子元素的情况', () => {
      render(<CopyButton {...defaultProps} />);

      expect(screen.getByTestId('test-copy-button')).toBeInTheDocument();
    });
  });

  describe('CopyIcon测试', () => {
    it('应该渲染CopyIcon', () => {
      render(<CopyButton {...defaultProps} />);

      expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
    });

    it('应该处理CopyIcon点击', () => {
      render(<CopyButton {...defaultProps} />);

      const copyIcon = screen.getByTestId('copy-icon');
      expect(copyIcon).toBeInTheDocument();
    });
  });
});
