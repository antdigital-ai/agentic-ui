import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CopyButton,
  CopyIcon,
} from '../@ant-design/agentic-ui/Bubble/MessagesContent/CopyButton';

// Mock useCopied hook
vi.mock('../@ant-design/agentic-ui/Hooks/useCopied', () => ({
  useCopied: vi.fn(() => ({
    copied: false,
    setCopied: vi.fn(),
  })),
}));

// Mock ActionIconBox
vi.mock('../@ant-design/agentic-ui/index', () => ({
  ActionIconBox: ({
    children,
    onClick,
    title,
    'data-testid': dataTestId,
    ...props
  }: any) => (
    <span
      data-testid={dataTestId || 'action-icon-box'}
      onClick={onClick}
      title={title}
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
  });

  describe('子元素测试', () => {
    it('应该处理无子元素的情况', () => {
      render(<CopyButton {...defaultProps} />);

      // 应该渲染默认的 CopyIcon
      expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
    });

    it('应该渲染自定义子元素', () => {
      render(
        <CopyButton {...defaultProps}>
          <span data-testid="custom-content">Custom Copy</span>
        </CopyButton>,
      );

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
      expect(screen.queryByTestId('copy-icon')).not.toBeInTheDocument();
    });
  });

  describe('CopyIcon测试', () => {
    it('应该正确渲染CopyIcon', () => {
      render(<CopyIcon data-testid="copy-icon" />);

      expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
    });

    it('应该应用传入的props到CopyIcon', () => {
      render(<CopyIcon data-testid="copy-icon" className="custom-class" />);

      const icon = screen.getByTestId('copy-icon');
      expect(icon).toHaveClass('custom-class');
    });
  });

  describe('错误处理测试', () => {
    it('应该处理onClick正常执行', async () => {
      const onClick = vi.fn();

      render(<CopyButton {...defaultProps} onClick={onClick} />);

      const button = screen.getByTestId('test-copy-button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(onClick).toHaveBeenCalled();
      });
    });
  });
});
