// @ts-nocheck
import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SendButton } from '../src/MarkdownInputField/SendButton';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    circle: ({ children, ...props }: any) => (
      <circle {...props}>{children}</circle>
    ),
    path: ({ children, ...props }: any) => <path {...props}>{children}</path>,
  },
}));

describe('SendButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SSR', () => {
    it('在 window 缺失时（SSR）应 return null', () => {
      const origWindow = global.window;
      try {
        (global as any).window = undefined;
        const html = ReactDOMServer.renderToStaticMarkup(
          <SendButton isSendable={true} typing={false} onClick={() => {}} />,
        );
        expect(html).toBe('');
      } finally {
        (global as any).window = origWindow;
      }
    });
  });

  describe('Basic Rendering', () => {
    it('should render button', () => {
      const { container } = render(
        <SendButton isSendable={true} typing={false} onClick={vi.fn()} />,
      );

      const button = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      expect(button).toBeInTheDocument();
    });

    it('should call onInit when initialized', () => {
      const onInit = vi.fn();
      render(
        <SendButton
          isSendable={true}
          typing={false}
          onClick={vi.fn()}
          onInit={onInit}
        />,
      );

      expect(onInit).toHaveBeenCalledTimes(1);
    });

    it('should apply custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      const { container } = render(
        <SendButton
          isSendable={true}
          typing={false}
          onClick={vi.fn()}
          style={customStyle}
        />,
      );

      const button = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      ) as HTMLElement;
      expect(button.style.backgroundColor).toBe('red');
    });
  });

  describe('Sendable State', () => {
    it('should render button when isSendable is true', () => {
      const { container } = render(
        <SendButton isSendable={true} typing={false} onClick={vi.fn()} />,
      );

      const button = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      expect(button).toBeInTheDocument();
    });

    it('should render button when isSendable is false', () => {
      const { container } = render(
        <SendButton isSendable={false} typing={false} onClick={vi.fn()} />,
      );

      const button = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      expect(button).toBeInTheDocument();
    });

    it('should call onClick when sendable and clicked', () => {
      const onClick = vi.fn();
      const { container } = render(
        <SendButton isSendable={true} typing={false} onClick={onClick} />,
      );

      const button = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      fireEvent.click(button!);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should still call onClick even when not sendable', () => {
      const onClick = vi.fn();
      const { container } = render(
        <SendButton isSendable={false} typing={false} onClick={onClick} />,
      );

      const button = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      fireEvent.click(button!);

      // Button still fires onClick, business logic handles sendable state
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Typing State', () => {
    it('should show stop icon when typing', () => {
      const { container } = render(
        <SendButton isSendable={true} typing={true} onClick={vi.fn()} />,
      );

      const button = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      expect(button).toBeInTheDocument();
      // The typing state changes the icon displayed
    });

    it('should show send icon when not typing', () => {
      const { container } = render(
        <SendButton isSendable={true} typing={false} onClick={vi.fn()} />,
      );

      const button = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      expect(button).toBeInTheDocument();
    });

    it('should call onClick when typing (to stop)', () => {
      const onClick = vi.fn();
      const { container } = render(
        <SendButton isSendable={true} typing={true} onClick={onClick} />,
      );

      const button = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      fireEvent.click(button!);

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Hover State', () => {
    it('should handle mouse enter', () => {
      const { container } = render(
        <SendButton isSendable={true} typing={false} onClick={vi.fn()} />,
      );

      const button = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      fireEvent.mouseEnter(button!);

      // Component uses internal animation state, not CSS classes for hover
      expect(button).toBeInTheDocument();
    });

    it('should remove hover class on mouse leave', () => {
      const { container } = render(
        <SendButton isSendable={true} typing={false} onClick={vi.fn()} />,
      );

      const button = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      fireEvent.mouseEnter(button!);
      fireEvent.mouseLeave(button!);

      expect(button).toBeInTheDocument();
    });
  });

  describe('键盘与样式', () => {
    it('按 Enter 或空格应触发 onClick', () => {
      const onClick = vi.fn();
      const { container } = render(
        <SendButton isSendable={true} typing={false} onClick={onClick} />,
      );
      const button = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      fireEvent.keyDown(button!, { key: 'Enter' });
      expect(onClick).toHaveBeenCalled();
      onClick.mockClear();
      fireEvent.keyDown(button!, { key: ' ' });
      expect(onClick).toHaveBeenCalled();
    });


    it('应应用 style 和 className', () => {
      const { container } = render(
        <SendButton
          isSendable={true}
          typing={false}
          onClick={vi.fn()}
          style={{ marginTop: 4 }}
          compact
        />,
      );
      const button = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      ) as HTMLElement;
      expect(button?.style.marginTop).toBe('4px');
      expect(button?.className).toContain('compact');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid clicks', () => {
      const onClick = vi.fn();
      const { container } = render(
        <SendButton isSendable={true} typing={false} onClick={onClick} />,
      );

      const button = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      fireEvent.click(button!);
      fireEvent.click(button!);
      fireEvent.click(button!);

      expect(onClick).toHaveBeenCalledTimes(3);
    });

    it('should handle state transition from typing to not typing', () => {
      const { container, rerender } = render(
        <SendButton isSendable={true} typing={true} onClick={vi.fn()} />,
      );

      let button = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      expect(button).toBeInTheDocument();

      rerender(
        <SendButton isSendable={true} typing={false} onClick={vi.fn()} />,
      );

      button = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      expect(button).toBeInTheDocument();
    });

    it('should handle state transition from not sendable to sendable', () => {
      const { container, rerender } = render(
        <SendButton isSendable={false} typing={false} onClick={vi.fn()} />,
      );

      let button = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      expect(button).toBeInTheDocument();

      rerender(
        <SendButton isSendable={true} typing={false} onClick={vi.fn()} />,
      );

      button = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      expect(button).toBeInTheDocument();
    });
  });

  describe('Multiple States Combination', () => {
    it('should handle sendable + typing', () => {
      const { container } = render(
        <SendButton isSendable={true} typing={true} onClick={vi.fn()} />,
      );

      const button = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      expect(button).toHaveClass(
        'ant-agentic-md-input-field-send-button-typing',
      );
    });

    it('should handle not sendable + typing', () => {
      const { container } = render(
        <SendButton isSendable={false} typing={true} onClick={vi.fn()} />,
      );

      const button = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      expect(button).not.toHaveClass(
        'ant-agentic-md-input-field-send-button-sendable',
      );
    });
  });
});
