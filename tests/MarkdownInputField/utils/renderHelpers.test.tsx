/**
 * renderHelpers 单元测试 - 覆盖 useSendActionsNode 等
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useSendActionsNode } from '../../../src/MarkdownInputField/utils/renderHelpers';

const mockFile = new File(['content'], 'test.png', { type: 'image/png' });

vi.mock('../../../src/MarkdownInputField/SendActions', () => ({
  SendActions: (props: any) => (
      <div data-testid="send-actions-mock">
        {props.attachment?.upload && (
          <button
            data-testid="trigger-upload"
            type="button"
            onClick={() => props.attachment.upload(mockFile)}
          >
            Trigger upload
          </button>
        )}
      </div>
    ),
}));

describe('renderHelpers', () => {
  describe('useSendActionsNode', () => {
    it('当 attachment.upload 存在时，传入的 upload 包装被调用时应以 (file, 0) 调用原始 upload', () => {
      const upload = vi.fn().mockResolvedValue('https://example.com/u');

      function TestHostWithUpload() {
        const [fileMap, setFileMap] = useState(new Map());
        const node = useSendActionsNode({
          props: {
            attachment: { enable: true, upload },
            voiceRecognizer: undefined,
            value: '',
            disabled: false,
            typing: false,
            allowEmptySubmit: false,
            actionsRender: undefined,
            toolsRender: undefined,
            sendButtonProps: undefined,
            triggerSendKey: undefined,
          },
          fileMap,
          setFileMap,
          supportedFormat: {} as any,
          fileUploadDone: true,
          recording: false,
          isLoading: false,
          collapseSendActions: false,
          uploadImage: vi.fn(),
          startRecording: vi.fn(),
          stopRecording: vi.fn(),
          sendMessage: vi.fn(),
          setIsLoading: vi.fn(),
          setRightPadding: vi.fn(),
          baseCls: 'test',
          hashId: 'h',
        });
        return node;
      }

      render(<TestHostWithUpload />);

      const trigger = screen.getByTestId('trigger-upload');
      fireEvent.click(trigger);

      expect(upload).toHaveBeenCalledWith(mockFile, 0);
    });

    it('当 attachment.upload 不存在时不应渲染 trigger 按钮', () => {
      function TestHostNoUpload() {
        const [fileMap, setFileMap] = useState(new Map());
        const node = useSendActionsNode({
          props: {
            attachment: { enable: true },
            voiceRecognizer: undefined,
            value: '',
            disabled: false,
            typing: false,
            allowEmptySubmit: false,
            actionsRender: undefined,
            toolsRender: undefined,
            sendButtonProps: undefined,
            triggerSendKey: undefined,
          },
          fileMap,
          setFileMap,
          supportedFormat: {} as any,
          fileUploadDone: true,
          recording: false,
          isLoading: false,
          collapseSendActions: false,
          uploadImage: vi.fn(),
          startRecording: vi.fn(),
          stopRecording: vi.fn(),
          sendMessage: vi.fn(),
          setIsLoading: vi.fn(),
          setRightPadding: vi.fn(),
          baseCls: 'test',
          hashId: 'h',
        });
        return node;
      }

      render(<TestHostNoUpload />);
      expect(screen.queryByTestId('trigger-upload')).not.toBeInTheDocument();
      expect(screen.getByTestId('send-actions-mock')).toBeInTheDocument();
    });
  });
});
