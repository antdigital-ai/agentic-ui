/**
 * renderHelpers 单元测试 - 覆盖 useSendActionsNode 等
 */

import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AttachmentFile } from '../../../src/MarkdownInputField/AttachmentButton/types';
import {
  useAttachmentList,
  useSendActionsNode,
} from '../../../src/MarkdownInputField/utils/renderHelpers';

const mockFile = new File(['content'], 'test.png', { type: 'image/png' });
const capturedProps = vi.hoisted(() => ({
  attachmentListProps: undefined as any,
}));

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

vi.mock(
  '../../../src/MarkdownInputField/AttachmentButton/AttachmentFileList',
  () => ({
    AttachmentFileList: (props: any) => {
      capturedProps.attachmentListProps = props;
      return <div data-testid="attachment-file-list-mock" />;
    },
  }),
);

describe('renderHelpers', () => {
  beforeEach(() => {
    capturedProps.attachmentListProps = undefined;
  });

  describe('useAttachmentList', () => {
    function AttachmentListHost({
      attachment,
      fileMap,
      handleFileRemoval = vi.fn(),
      handleFileRetry = vi.fn(),
      updateAttachmentFiles = vi.fn(),
    }: {
      attachment?: {
        enable?: boolean;
        onPreview?: (file: AttachmentFile) => void | Promise<void>;
      };
      fileMap?: Map<string, AttachmentFile>;
      handleFileRemoval?: (file: AttachmentFile) => Promise<void>;
      handleFileRetry?: (file: AttachmentFile) => Promise<void>;
      updateAttachmentFiles?: (nextFileMap?: Map<string, AttachmentFile>) => void;
    }) {
      const node = useAttachmentList({
        attachment: attachment as any,
        fileMap,
        handleFileRemoval,
        handleFileRetry,
        updateAttachmentFiles,
      });
      return <>{node}</>;
    }

    it('当 attachment.enable 为 false 时不渲染 AttachmentFileList', () => {
      render(<AttachmentListHost attachment={{ enable: false }} />);
      expect(
        screen.queryByTestId('attachment-file-list-mock'),
      ).not.toBeInTheDocument();
    });

    it('应透传 attachment.onPreview，并吞掉异步错误避免冒泡', async () => {
      const onPreview = vi.fn().mockRejectedValue(new Error('preview failed'));
      const file = new File(['content'], 'preview.txt', {
        type: 'text/plain',
      }) as AttachmentFile;
      file.status = 'done';

      render(
        <AttachmentListHost
          attachment={{ enable: true, onPreview }}
          fileMap={new Map()}
        />,
      );

      expect(screen.getByTestId('attachment-file-list-mock')).toBeInTheDocument();
      expect(typeof capturedProps.attachmentListProps?.onPreview).toBe('function');

      expect(() => capturedProps.attachmentListProps.onPreview(file)).not.toThrow();
      await Promise.resolve();

      expect(onPreview).toHaveBeenCalledWith(file);
    });

    it('onClearFileMap 应调用 updateAttachmentFiles(undefined)', () => {
      const updateAttachmentFiles = vi.fn();
      render(
        <AttachmentListHost
          attachment={{ enable: true }}
          fileMap={new Map()}
          updateAttachmentFiles={updateAttachmentFiles}
        />,
      );

      capturedProps.attachmentListProps.onClearFileMap();
      expect(updateAttachmentFiles).toHaveBeenCalledWith(undefined);
    });
  });

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
