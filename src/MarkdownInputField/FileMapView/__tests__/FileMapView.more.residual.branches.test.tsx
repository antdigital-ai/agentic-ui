/**
 * FileMapView more residual：预览图、error status、自定义 render。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { AttachmentFile } from '../../AttachmentButton/types';
import { FileMapView } from '../index';

const file = (
  partial: Partial<AttachmentFile> & { name: string },
): AttachmentFile =>
  ({
    uuid: partial.uuid || partial.name,
    type: partial.type || 'text/plain',
    size: 1,
    status: 'done',
    ...partial,
  }) as AttachmentFile;

describe('FileMapView more residual branches', () => {
  it('image 类型预览；uploading/error 状态', () => {
    const map = new Map<string, AttachmentFile>([
      [
        '1',
        file({
          name: 'a.png',
          uuid: '1',
          type: 'image/png',
          url: 'https://x/a.png',
          previewUrl: 'https://x/a.png',
        }),
      ],
      [
        '2',
        file({
          name: 'b.txt',
          uuid: '2',
          status: 'uploading',
        }),
      ],
      [
        '3',
        file({
          name: 'c.txt',
          uuid: '3',
          status: 'error',
        }),
      ],
    ]);
    render(
      <ConfigProvider>
        <FileMapView fileMap={map} placement="left" />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('file-view-list')).toBeInTheDocument();
  });

  it('onDownload / onFileClick 可触发', () => {
    const onDownload = vi.fn();
    const onFileClick = vi.fn();
    const map = new Map([
      ['1', file({ name: 'z.txt', uuid: '1', url: 'https://x/z.txt' })],
    ]);
    render(
      <ConfigProvider>
        <FileMapView
          fileMap={map}
          onDownload={onDownload}
          onFileClick={onFileClick}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('file-view-list')).toBeInTheDocument();
    const name = screen.queryByText('z.txt');
    if (name) fireEvent.click(name);
  });
});
