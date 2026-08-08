/**
 * FileMapView deepen3：image/video key 回退、itemRender 占位、
 * 键盘 Enter/Space、file item key、view-all Space。
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
    uuid: partial.uuid,
    type: partial.type || 'text/plain',
    size: 1,
    status: 'done',
    name: partial.name,
    ...partial,
  }) as AttachmentFile;

describe('FileMapView deepen3 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('image：空 name 无 uuid 用 index；placeholder 无 itemRender', () => {
    const map = new Map<string, AttachmentFile>([
      [
        'a',
        file({
          type: 'image/png',
          status: 'uploading',
          name: 'x.png',
          uuid: undefined,
        }),
      ],
      [
        'b',
        file({
          type: 'image/png',
          status: 'done',
          name: '',
          uuid: undefined,
          url: 'https://x/b.png',
        }),
      ],
    ]);
    render(
      <ConfigProvider>
        <FileMapView fileMap={map} />
      </ConfigProvider>,
    );
    expect(document.querySelector('[class*="image"]')).toBeTruthy();
  });

  it('image：itemRender 包装 placeholder', () => {
    const itemRender = vi.fn((f, dom) => (
      <div data-testid="img-ph">{dom}</div>
    ));
    const map = new Map<string, AttachmentFile>([
      [
        'a',
        file({
          name: 'p.png',
          type: 'image/png',
          status: 'uploading',
        }),
      ],
    ]);
    render(
      <ConfigProvider>
        <FileMapView fileMap={map} itemRender={itemRender} />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('img-ph')).toBeInTheDocument();
  });

  it('video：itemRender 包装 placeholder；Enter/Space 触发预览', () => {
    const onPreview = vi.fn();
    const itemRender = vi.fn((f, dom) => (
      <div data-testid={`vph-${f.name}`}>{dom}</div>
    ));
    const map = new Map<string, AttachmentFile>([
      [
        'v1',
        file({
          name: 'up.mp4',
          type: 'video/mp4',
          status: 'uploading',
          url: 'https://x/up.mp4',
        }),
      ],
      [
        'v2',
        file({
          name: 'ok.mp4',
          type: 'video/mp4',
          status: 'done',
          previewUrl: 'https://x/ok.mp4',
        }),
      ],
    ]);
    render(
      <ConfigProvider>
        <FileMapView
          fileMap={map}
          itemRender={itemRender}
          onPreview={onPreview}
        />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('vph-up.mp4')).toBeInTheDocument();
    const thumbs = screen
      .getByTestId('file-view-video-list')
      .querySelectorAll('[role="button"]');
    const playable = Array.from(thumbs).find((el) =>
      el.className.includes('video-thumb'),
    );
    if (playable) {
      fireEvent.keyDown(playable, { key: 'Enter' });
      fireEvent.keyDown(playable, { key: ' ' });
    }
    expect(onPreview).toHaveBeenCalled();
  });

  it('普通文件 key 回退；view-all Space', async () => {
    const map = new Map<string, AttachmentFile>();
    for (let i = 0; i < 4; i++) {
      map.set(
        String(i),
        file({
          name: i === 0 ? '' : `f${i}.txt`,
          uuid: undefined,
          type: 'text/plain',
          url: `https://x/${i}.txt`,
        }),
      );
    }
    render(
      <ConfigProvider>
        <FileMapView fileMap={map} maxDisplayCount={2} />
      </ConfigProvider>,
    );
    const more = screen.getByTestId('file-view-view-all');
    expect(more).toBeInTheDocument();
    fireEvent.keyDown(more, { key: ' ' });
    expect(screen.queryByTestId('file-view-view-all')).not.toBeInTheDocument();
  });
});
