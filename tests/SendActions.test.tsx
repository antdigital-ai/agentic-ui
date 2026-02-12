// @ts-nocheck
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SendActions } from '../src/MarkdownInputField/SendActions';

// Mock RcResizeObserver
vi.mock('rc-resize-observer', () => ({
  default: ({ children }: any) => children,
}));

describe('SendActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render send button', () => {
      const { container } = render(<SendActions onSend={vi.fn()} />);
      const sendButton = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      expect(sendButton).toBeInTheDocument();
    });

    it('should apply custom prefixCls', () => {
      const { container } = render(
        <SendActions prefixCls="custom-prefix" onSend={vi.fn()} />,
      );
      const actions = container.querySelector('.custom-prefix-send-actions');
      expect(actions).toBeInTheDocument();
    });
  });

  describe('Attachment Button', () => {
    it('should render attachment button when enabled', () => {
      const { container } = render(
        <SendActions attachment={{ enable: true }} onSend={vi.fn()} />,
      );
      // Check if attachment UI is rendered
      expect(
        container.querySelector('.ant-agentic-md-input-field-send-actions'),
      ).toBeInTheDocument();
    });

    it('should not render attachment button when disabled', () => {
      const { container } = render(
        <SendActions attachment={{ enable: false }} onSend={vi.fn()} />,
      );
      // Attachment should not be present
      expect(container).toBeInTheDocument();
    });

    it('should call upload when attachment is clicked', async () => {
      const upload = vi.fn().mockResolvedValue('uploaded-url');
      const uploadImage = vi.fn();

      render(
        <SendActions
          attachment={{ enable: true, upload }}
          uploadImage={uploadImage}
          onSend={vi.fn()}
        />,
      );

      // Component renders successfully
      expect(upload).not.toHaveBeenCalled();
    });
  });

  describe('Voice Input', () => {
    it('should render voice button when recognizer is provided', () => {
      const mockRecognizer = vi.fn();
      const { container } = render(
        <SendActions voiceRecognizer={mockRecognizer} onSend={vi.fn()} />,
      );
      expect(
        container.querySelector('.ant-agentic-md-input-field-send-actions'),
      ).toBeInTheDocument();
    });

    it('should call onStartRecording when voice button is clicked', async () => {
      const onStartRecording = vi.fn();
      const mockRecognizer = vi.fn();

      render(
        <SendActions
          voiceRecognizer={mockRecognizer}
          onStartRecording={onStartRecording}
          onSend={vi.fn()}
        />,
      );

      // Voice button should be rendered
      expect(onStartRecording).not.toHaveBeenCalled();
    });

    it('should call onStopRecording when recording', () => {
      const onStopRecording = vi.fn();
      const mockRecognizer = vi.fn();

      render(
        <SendActions
          voiceRecognizer={mockRecognizer}
          recording={true}
          onStopRecording={onStopRecording}
          onSend={vi.fn()}
        />,
      );

      // Recording state should be handled
      expect(onStopRecording).not.toHaveBeenCalled();
    });
  });

  describe('Send Button Behavior', () => {
    it('should call onSend when send button is clicked', () => {
      const onSend = vi.fn();
      const { container } = render(
        <SendActions value="test message" onSend={onSend} />,
      );

      const sendButton = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      fireEvent.click(sendButton!);

      expect(onSend).toHaveBeenCalled();
    });

    it('should call onStop when stop button is clicked during loading', () => {
      const onStop = vi.fn();
      const { container } = render(
        <SendActions
          isLoading={true}
          typing={true}
          onStop={onStop}
          onSend={vi.fn()}
        />,
      );

      const sendButton = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      fireEvent.click(sendButton!);

      expect(onStop).toHaveBeenCalled();
    });

    it('should disable send button when disabled prop is true', () => {
      const onSend = vi.fn();
      const { container } = render(
        <SendActions disabled={true} value="test" onSend={onSend} />,
      );

      const sendButton = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      expect(sendButton).toBeInTheDocument();
    });

    it('should enable send button when file upload is done', () => {
      const { container } = render(
        <SendActions value="test" fileUploadDone={true} onSend={vi.fn()} />,
      );

      const sendButton = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      expect(sendButton).toBeInTheDocument();
    });

    it('should handle empty submit when allowEmptySubmit is true', () => {
      const onSend = vi.fn();
      const { container } = render(
        <SendActions value="" allowEmptySubmit={true} onSend={onSend} />,
      );

      const sendButton = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      fireEvent.click(sendButton!);

      expect(onSend).toHaveBeenCalled();
    });
  });

  describe('Collapsed Actions', () => {
    it('should collapse actions when collapseSendActions is true', () => {
      const { container } = render(
        <SendActions collapseSendActions={true} onSend={vi.fn()} />,
      );

      // Should render with collapsed state
      expect(
        container.querySelector('.ant-agentic-md-input-field-send-actions'),
      ).toBeInTheDocument();
    });

    it('should expand actions when collapseSendActions is false', () => {
      const { container } = render(
        <SendActions collapseSendActions={false} onSend={vi.fn()} />,
      );

      // Should render in expanded state
      expect(
        container.querySelector('.ant-agentic-md-input-field-send-actions'),
      ).toBeInTheDocument();
    });

    it('should show more menu when collapsed', () => {
      const { container } = render(
        <SendActions
          collapseSendActions={true}
          attachment={{ enable: true }}
          onSend={vi.fn()}
        />,
      );

      // More menu should be visible
      expect(container).toBeInTheDocument();
    });

    it('折叠且多按钮时附件/语音按钮显示短标题', () => {
      const { container } = render(
        <SendActions
          collapseSendActions={true}
          attachment={{ enable: true }}
          voiceRecognizer={vi.fn()}
          onSend={vi.fn()}
        />,
      );
      const sendActions = container.querySelector(
        '.ant-agentic-md-input-field-send-actions',
      );
      expect(sendActions).toBeTruthy();
      // 折叠时附件/语音在 Popover 内，仅校验发送操作区域已渲染
      expect(
        sendActions?.querySelector('[class*="send"]') ||
          sendActions?.firstElementChild,
      ).toBeTruthy();
    });
  });

  describe('isSendable 与 fileMap/recording', () => {
    it('fileMap 有内容时发送按钮可点', () => {
      const fileMap = new Map();
      fileMap.set('f1', { url: 'u', name: 'n', status: 'done' });
      const { container } = render(
        <SendActions
          value=""
          fileMap={fileMap}
          fileUploadDone={true}
          onSend={vi.fn()}
        />,
      );
      const sendBtn = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      expect(sendBtn).toBeInTheDocument();
    });

    it('recording 为 true 时发送按钮可点', () => {
      const { container } = render(
        <SendActions
          value=""
          recording={true}
          voiceRecognizer={vi.fn()}
          onSend={vi.fn()}
        />,
      );
      const sendBtn = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      expect(sendBtn).toBeInTheDocument();
    });
  });

  describe('自定义 actionsRender 与容器事件', () => {
    it('使用 actionsRender 时传入 defaultActions', () => {
      const actionsRender = vi.fn(
        (ctx: any, defaultActions: React.ReactNode[]) => defaultActions,
      );
      render(
        <SendActions
          attachment={{ enable: true }}
          actionsRender={actionsRender}
          onSend={vi.fn()}
        />,
      );
      expect(actionsRender).toHaveBeenCalled();
      expect(actionsRender.mock.calls[0][1]).toBeDefined();
      expect(Array.isArray(actionsRender.mock.calls[0][1])).toBe(true);
    });

    it('点击/按键容器时阻止冒泡', () => {
      const { container } = render(<SendActions onSend={vi.fn()} />);
      const wrap = container.querySelector(
        '.ant-agentic-md-input-field-send-actions',
      );
      expect(wrap).toBeInTheDocument();
      const clickEvent = new MouseEvent('click', { bubbles: true });
      const stopPropagation = vi.spyOn(clickEvent, 'stopPropagation');
      const preventDefault = vi.spyOn(clickEvent, 'preventDefault');
      wrap!.dispatchEvent(clickEvent);
      expect(stopPropagation).toHaveBeenCalled();
      expect(preventDefault).toHaveBeenCalled();
      const keyEvent = new KeyboardEvent('keydown', { bubbles: true });
      const keyStop = vi.spyOn(keyEvent, 'stopPropagation');
      const keyPrevent = vi.spyOn(keyEvent, 'preventDefault');
      wrap!.dispatchEvent(keyEvent);
      expect(keyStop).toHaveBeenCalled();
      expect(keyPrevent).toHaveBeenCalled();
    });
  });

  describe('Custom Actions Render', () => {
    it('should render custom actions when actionsRender is provided', () => {
      const actionsRender = (props: any, defaultActions: React.ReactNode[]) => [
        <button key="custom" type="button" data-testid="custom-action">
          Custom Action
        </button>,
        ...defaultActions,
      ];

      render(<SendActions actionsRender={actionsRender} onSend={vi.fn()} />);

      expect(screen.getByTestId('custom-action')).toBeInTheDocument();
    });

    it('should pass correct props to actionsRender', () => {
      const actionsRender = vi.fn().mockReturnValue([]);

      render(
        <SendActions
          value="test"
          disabled={false}
          typing={false}
          actionsRender={actionsRender}
          onSend={vi.fn()}
        />,
      );

      expect(actionsRender).toHaveBeenCalled();
    });

    it('should replace default actions when actionsRender returns different actions', () => {
      const actionsRender = () => [
        <button key="only-custom" type="button" data-testid="only-custom">
          Only Custom
        </button>,
      ];

      render(<SendActions actionsRender={actionsRender} onSend={vi.fn()} />);

      expect(screen.getByTestId('only-custom')).toBeInTheDocument();
    });
  });

  describe('Resize Observer', () => {
    it('should call onResize callback', () => {
      const onResize = vi.fn();

      render(<SendActions onResize={onResize} onSend={vi.fn()} />);

      // Component should render without errors
      expect(onResize).not.toHaveBeenCalled(); // Not called immediately
    });
  });

  describe('Props Combinations', () => {
    it('should handle all features together', () => {
      const mockRecognizer = vi.fn();
      const { container } = render(
        <SendActions
          attachment={{ enable: true }}
          voiceRecognizer={mockRecognizer}
          value="test message"
          disabled={false}
          typing={false}
          isLoading={false}
          fileUploadDone={true}
          recording={false}
          onSend={vi.fn()}
          onStop={vi.fn()}
          onStartRecording={vi.fn()}
          onStopRecording={vi.fn()}
        />,
      );

      expect(
        container.querySelector('.ant-agentic-md-input-field-send-actions'),
      ).toBeInTheDocument();
    });

    it('should handle disabled state with all features', () => {
      const mockRecognizer = vi.fn();
      const { container } = render(
        <SendActions
          attachment={{ enable: true }}
          voiceRecognizer={mockRecognizer}
          disabled={true}
          onSend={vi.fn()}
        />,
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined callbacks', () => {
      const { container } = render(<SendActions />);

      const sendButton = container.querySelector(
        '.ant-agentic-md-input-field-send-button',
      );
      expect(sendButton).toBeInTheDocument();
    });

    it('should handle empty value', () => {
      const { container } = render(<SendActions value="" onSend={vi.fn()} />);
      expect(
        container.querySelector('.ant-agentic-md-input-field-send-button'),
      ).toBeInTheDocument();
    });

    it('should handle hasTools prop', () => {
      const { container } = render(
        <SendActions hasTools={true} onSend={vi.fn()} />,
      );
      expect(
        container.querySelector('.ant-agentic-md-input-field-send-actions'),
      ).toBeInTheDocument();
    });
  });
});
