/**
 * FileMapView residual：空 map、placement、maxDisplayCount、自定义回调。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
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

describe('FileMapView residual branches', () => {
  it('undefined / 空 fileMap 不抛', () => {
    expect(() =>
      render(
        <ConfigProvider>
          <FileMapView />
        </ConfigProvider>,
      ),
    ).not.toThrow();
    expect(() =>
      render(
        <ConfigProvider>
          <FileMapView fileMap={new Map()} />
        </ConfigProvider>,
      ),
    ).not.toThrow();
  });

  it('普通文件列表 + placement + maxDisplayCount', () => {
    const map = new Map<string, AttachmentFile>([
      ['1', file({ name: 'a.txt', uuid: '1' })],
      ['2', file({ name: 'b.txt', uuid: '2' })],
      ['3', file({ name: 'c.txt', uuid: '3' })],
    ]);
    render(
      <ConfigProvider>
        <FileMapView
          fileMap={map}
          placement="right"
          maxDisplayCount={2}
          className="fm"
          style={{ gap: 4 }}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('file-view-list')).toBeInTheDocument();
    expect(screen.getByTestId('file-view-file-list')).toBeInTheDocument();
    expect(
      screen.getAllByTestId('file-meta-placeholder').length,
    ).toBeGreaterThan(0);
  });

  it('onFileClick / disableDefaultFileClick / onPreview', () => {
    const onFileClick = vi.fn();
    const onPreview = vi.fn();
    const map = new Map([
      [
        '1',
        file({
          name: 'doc.pdf',
          uuid: '1',
          url: 'https://x/a.pdf',
          status: 'done',
        }),
      ],
    ]);
    render(
      <ConfigProvider>
        <FileMapView
          fileMap={map}
          onFileClick={onFileClick}
          disableDefaultFileClick
          onPreview={onPreview}
          onDownload={vi.fn()}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('file-view-list')).toBeInTheDocument();
  });

  it('itemRender 自定义媒体', () => {
    const map = new Map([
      [
        '1',
        file({
          name: 'pic.png',
          uuid: '1',
          type: 'image/png',
          url: 'https://x/a.png',
        }),
      ],
    ]);
    render(
      <ConfigProvider>
        <FileMapView
          fileMap={map}
          itemRender={() => <div data-testid="custom-item">custom</div>}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('custom-item')).toBeInTheDocument();
  });
});
