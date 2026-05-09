/**
 * renderHelpers 单元测试 - 覆盖 useAttachmentList
 *
 * NOTE: 原 useSendActionsNode 已被内联到 MarkdownInputField.tsx，
 * 其行为由 MarkdownInputField 集成测试覆盖。
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AttachmentFile } from '../../AttachmentButton/types';
import { useAttachmentList } from '../../utils/renderHelpers';

const capturedProps = vi.hoisted(() => ({
  attachmentListProps: undefined as any,
}));

vi.mock('../../AttachmentButton/AttachmentFileList', () => ({
  AttachmentFileList: (props: any) => {
    capturedProps.attachmentListProps = props;
    return <div data-testid="attachment-file-list-mock" />;
  },
}));

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
      updateAttachmentFiles?: (
        nextFileMap?: Map<string, AttachmentFile>,
      ) => void;
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

      expect(
        screen.getByTestId('attachment-file-list-mock'),
      ).toBeInTheDocument();
      expect(typeof capturedProps.attachmentListProps?.onPreview).toBe(
        'function',
      );

      expect(() =>
        capturedProps.attachmentListProps.onPreview(file),
      ).not.toThrow();
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
});
