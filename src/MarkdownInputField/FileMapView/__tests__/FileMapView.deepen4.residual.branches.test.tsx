/**
 * FileMapView deepen4：空 map、自定义 onPreview/onDownload、
 * maxDisplayCount、非图文件。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AttachmentFile } from '../../AttachmentButton/types';
import { FileMapView } from '../index';

const file = (
  partial: Partial<AttachmentFile> & { name?: string },
): AttachmentFile =>
  ({
    uuid: partial.uuid || 'u',
    type: partial.type || 'text/plain',
    size: 1,
    status: 'done',
    name: partial.name || 'a.txt',
    ...partial,
  }) as AttachmentFile;

describe('FileMapView deepen4 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('空 map / undefined 安全', () => {
    expect(() =>
      render(
        <ConfigProvider>
          <FileMapView fileMap={new Map()} />
        </ConfigProvider>,
      ),
    ).not.toThrow();
    cleanup();
    expect(() =>
      render(
        <ConfigProvider>
          <FileMapView />
        </ConfigProvider>,
      ),
    ).not.toThrow();
  });

  it('自定义 onPreview / onDownload / onDelete', () => {
    const onPreview = vi.fn();
    const onDownload = vi.fn();
    const onDelete = vi.fn();
    const map = new Map<string, AttachmentFile>([
      ['1', file({ uuid: '1', name: 'doc.pdf', type: 'application/pdf' })],
    ]);
    render(
      <ConfigProvider>
        <FileMapView
          fileMap={map}
          onPreview={onPreview}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      </ConfigProvider>,
    );
    expect(screen.getByText(/doc\.pdf|pdf/i)).toBeTruthy();
  });

  it('maxDisplayCount 截断并显示查看全部', () => {
    const map = new Map<string, AttachmentFile>();
    for (let i = 0; i < 5; i++) {
      map.set(String(i), file({ uuid: String(i), name: `f${i}.txt` }));
    }
    render(
      <ConfigProvider>
        <FileMapView fileMap={map} maxDisplayCount={2} />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('file-view-list')).toBeInTheDocument();
    expect(screen.getByTestId('file-view-view-all')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('file-view-view-all'));
  });
});
