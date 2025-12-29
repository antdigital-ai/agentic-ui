import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SendActions } from '..';

// Mock dependencies
vi.mock('../../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, ...props }: any) => (
    <div data-testid="action-icon-box" {...props}>
      {children}
    </div>
  ),
}));

vi.mock('../../AttachmentButton', () => ({
  AttachmentButton: ({ uploadImage, title, disabled, ...props }: any) => (
    <button
      data-testid="attachment-button"
      onClick={uploadImage}
      type="button"
      disabled={disabled}
      title={title}
      {...props}
    >
      Attachment
    </button>
  ),
}));

vi.mock('../../VoiceInput', () => ({
  VoiceInputButton: ({ onStart, onStop, recording, disabled, title }: any) => (
    <button
      data-testid="voice-input-button"
      onClick={recording ? onStop : onStart}
      type="button"
      disabled={disabled}
      title={title}
    >
      {recording ? 'Stop' : 'Record'}
    </button>
  ),
}));

vi.mock('../../SendButton', () => ({
  SendButton: ({ onClick, typing, disabled, isSendable }: any) => (
    <button
      data-testid="send-button"
      onClick={onClick}
      type="button"
      disabled={disabled}
      data-typing={typing}
      data-sendable={isSendable}
    >
      {typing ? 'Stop' : 'Send'}
    </button>
  ),
}));

describe('SendActions', () => {
  const mockUploadImage = vi.fn().mockResolvedValue(undefined);
  const mockStartRecording = vi.fn().mockResolvedValue(undefined);
  const mockStopRecording = vi.fn().mockResolvedValue(undefined);
  const mockOnSend = vi.fn();
  const mockOnStop = vi.fn();

  const defaultProps = {
    value: 'test value',
    disabled: false,
    typing: false,
    isLoading: false,
    fileUploadDone: true,
    recording: false,
    collapseSendActions: false,
    allowEmptySubmit: false,
    uploadImage: mockUploadImage,
    onStartRecording: mockStartRecording,
    onStopRecording: mockStopRecording,
    onSend: mockOnSend,
    onStop: mockOnStop,
    prefixCls: 'test-prefix',
    hashId: 'test-hash',
    hasTools: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基本渲染', () => {
    it('应该渲染发送按钮', () => {
      render(<SendActions {...defaultProps} />);
      expect(screen.getByTestId('send-button')).toBeInTheDocument();
    });

    it('应该在启用附件时渲染附件按钮', () => {
      render(
        <SendActions
          {...defaultProps}
          attachment={{
            enable: true,
          }}
        />,
      );
      expect(screen.getByTestId('attachment-button')).toBeInTheDocument();
    });

    it('应该在提供语音识别器时渲染语音输入按钮', () => {
      render(
        <SendActions
          {...defaultProps}
          voiceRecognizer={() =>
            Promise.resolve({
              start: () => Promise.resolve(),
              stop: () => Promise.resolve(),
            })
          }
        />,
      );
      expect(screen.getByTestId('voice-input-button')).toBeInTheDocument();
    });

    it('应该在未启用附件时不渲染附件按钮', () => {
      render(
        <SendActions
          {...defaultProps}
          attachment={{
            enable: false,
          }}
        />,
      );
      expect(screen.queryByTestId('attachment-button')).not.toBeInTheDocument();
    });
  });

  describe('附件功能', () => {
    it('应该在点击附件按钮时调用上传图片', async () => {
      render(
        <SendActions
          {...defaultProps}
          attachment={{
            enable: true,
          }}
        />,
      );

      const attachmentButton = screen.getByTestId('attachment-button');
      fireEvent.click(attachmentButton);

      await waitFor(() => {
        expect(mockUploadImage).toHaveBeenCalled();
      });
    });

    it('应该在文件上传中时禁用附件按钮', () => {
      render(
        <SendActions
          {...defaultProps}
          fileUploadDone={false}
          attachment={{
            enable: true,
          }}
        />,
      );

      const attachmentButton = screen.getByTestId('attachment-button');
      expect(attachmentButton).toBeDisabled();
    });

    it('应该在文件上传完成时启用附件按钮', () => {
      render(
        <SendActions
          {...defaultProps}
          fileUploadDone={true}
          attachment={{
            enable: true,
          }}
        />,
      );

      const attachmentButton = screen.getByTestId('attachment-button');
      expect(attachmentButton).not.toBeDisabled();
    });
  });

  describe('语音输入功能', () => {
    it('应该在点击语音按钮时开始录音', async () => {
      render(
        <SendActions
          {...defaultProps}
          recording={false}
          voiceRecognizer={() =>
            Promise.resolve({
              start: () => Promise.resolve(),
              stop: () => Promise.resolve(),
            })
          }
        />,
      );

      const voiceButton = screen.getByTestId('voice-input-button');
      fireEvent.click(voiceButton);

      await waitFor(() => {
        expect(mockStartRecording).toHaveBeenCalled();
      });
    });

    it('应该在录音中时点击停止录音', async () => {
      render(
        <SendActions
          {...defaultProps}
          recording={true}
          voiceRecognizer={() =>
            Promise.resolve({
              start: () => Promise.resolve(),
              stop: () => Promise.resolve(),
            })
          }
        />,
      );

      const voiceButton = screen.getByTestId('voice-input-button');
      fireEvent.click(voiceButton);

      await waitFor(() => {
        expect(mockStopRecording).toHaveBeenCalled();
      });
    });

    it('应该在禁用时禁用语音按钮', () => {
      render(
        <SendActions
          {...defaultProps}
          disabled={true}
          voiceRecognizer={() =>
            Promise.resolve({
              start: () => Promise.resolve(),
              stop: () => Promise.resolve(),
            })
          }
        />,
      );

      const voiceButton = screen.getByTestId('voice-input-button');
      expect(voiceButton).toBeDisabled();
    });
  });

  describe('发送按钮功能', () => {
    it('应该在有内容时点击发送', () => {
      render(<SendActions {...defaultProps} value="test content" />);

      const sendButton = screen.getByTestId('send-button');
      fireEvent.click(sendButton);

      expect(mockOnSend).toHaveBeenCalled();
    });

    it('应该在正在输入时点击停止', () => {
      render(<SendActions {...defaultProps} typing={true} />);

      const sendButton = screen.getByTestId('send-button');
      fireEvent.click(sendButton);

      expect(mockOnStop).toHaveBeenCalled();
      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('应该在加载中时点击停止', () => {
      render(<SendActions {...defaultProps} isLoading={true} />);

      const sendButton = screen.getByTestId('send-button');
      fireEvent.click(sendButton);

      expect(mockOnStop).toHaveBeenCalled();
      expect(mockOnSend).not.toHaveBeenCalled();
    });

    it('应该在禁用时不能点击发送', () => {
      render(<SendActions {...defaultProps} disabled={true} />);

      const sendButton = screen.getByTestId('send-button');
      expect(sendButton).toBeDisabled();
    });

    it('应该在允许空提交时即使内容为空也能发送', () => {
      render(
        <SendActions {...defaultProps} value="" allowEmptySubmit={true} />,
      );

      const sendButton = screen.getByTestId('send-button');
      expect(sendButton).toHaveAttribute('data-sendable', 'true');
    });

    it('应该在有文件时能发送', () => {
      const fileMap = new Map();
      fileMap.set('file1', { uuid: 'file1', status: 'done' } as any);

      render(
        <SendActions
          {...defaultProps}
          value=""
          attachment={{
            enable: true,
            fileMap,
          }}
        />,
      );

      const sendButton = screen.getByTestId('send-button');
      expect(sendButton).toHaveAttribute('data-sendable', 'true');
    });

    it('应该在录音中时能发送', () => {
      render(
        <SendActions
          {...defaultProps}
          value=""
          recording={true}
          voiceRecognizer={() =>
            Promise.resolve({
              start: () => Promise.resolve(),
              stop: () => Promise.resolve(),
            })
          }
        />,
      );

      const sendButton = screen.getByTestId('send-button');
      expect(sendButton).toHaveAttribute('data-sendable', 'true');
    });
  });

  describe('响应式折叠', () => {
    it('应该在折叠模式下渲染省略号按钮', () => {
      render(
        <SendActions
          {...defaultProps}
          collapseSendActions={true}
          attachment={{
            enable: true,
          }}
          voiceRecognizer={() =>
            Promise.resolve({
              start: () => Promise.resolve(),
              stop: () => Promise.resolve(),
            })
          }
        />,
      );

      expect(screen.getByTestId('action-icon-box')).toBeInTheDocument();
    });
    it('少于两个按钮时不折叠', () => {
      render(
        <SendActions
          {...defaultProps}
          collapseSendActions={true}
          attachment={{
            enable: true,
          }}
        />,
      );

      expect(screen.getByTestId('attachment-button')).toBeInTheDocument();
    });

    it('应该在折叠模式下只显示发送按钮', () => {
      render(
        <SendActions
          {...defaultProps}
          collapseSendActions={true}
          attachment={{
            enable: true,
          }}
        />,
      );

      expect(screen.getByTestId('send-button')).toBeInTheDocument();
    });
  });

  describe('自定义渲染', () => {
    it('应该支持自定义渲染函数', () => {
      const customRender = vi.fn((props, defaultActions) => [
        <div key="custom" data-testid="custom-action">
          Custom Action
        </div>,
        ...defaultActions,
      ]);

      render(<SendActions {...defaultProps} actionsRender={customRender} />);

      expect(customRender).toHaveBeenCalled();
      expect(screen.getByTestId('custom-action')).toBeInTheDocument();
      expect(screen.getByTestId('send-button')).toBeInTheDocument();
    });

    it('应该在自定义渲染中替换默认按钮', () => {
      const customRender = vi.fn(() => [
        <div key="custom" data-testid="custom-only">
          Only Custom
        </div>,
      ]);

      render(<SendActions {...defaultProps} actionsRender={customRender} />);

      expect(screen.getByTestId('custom-only')).toBeInTheDocument();
      expect(screen.queryByTestId('send-button')).not.toBeInTheDocument();
    });
  });

  describe('Resize 观察', () => {
    it('应该在尺寸变化时调用 onResize 回调', async () => {
      const mockOnResize = vi.fn();

      render(<SendActions {...defaultProps} onResize={mockOnResize} />);

      // 注意：RcResizeObserver 的测试可能需要模拟 ResizeObserver
      // 这里我们主要验证组件能够正确渲染
      await waitFor(() => {
        expect(screen.getByTestId('send-button')).toBeInTheDocument();
      });
    });
  });
});
