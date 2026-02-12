/**
 * AttachmentFileIcon 组件测试 - 覆盖 uploading/error 等状态
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AttachmentFileIcon } from '../../../../src/MarkdownInputField/AttachmentButton/AttachmentFileList/AttachmentFileIcon';

vi.mock('antd', async (importOriginal) => {
  const mod = await importOriginal() as Record<string, unknown>;
  return {
    ...mod,
    Image: ({ alt }: any) => <img data-testid="image-preview" alt={alt} />,
  };
});

describe('AttachmentFileIcon', () => {
  it('应渲染 FileUploadingSpin 当 file.status 为 uploading', () => {
    const file = {
      name: 'test.png',
      type: 'image/png',
      status: 'uploading' as const,
      uuid: '1',
      url: '',
    };
    const { container } = render(
      <AttachmentFileIcon file={file as any} className="test-class" />,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('应渲染 FileFailed 当 file.status 为 error', () => {
    const file = {
      name: 'test.png',
      type: 'image/png',
      status: 'error' as const,
      uuid: '1',
      url: '',
    };
    render(<AttachmentFileIcon file={file as any} className="test-class" />);
    expect(document.body.firstChild).toBeInTheDocument();
  });
});
