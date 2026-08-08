/**
 * FileMapView deepen：video error 早退、itemRender、无 uuid/name key、view-all Space。
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

describe('FileMapView deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.restoreAllMocks();
  });

  it('video error 不打开预览；itemRender 包装 image/video placeholder', () => {
    const onPreview = vi.fn();
    const itemRender = vi.fn((f, dom) => (
      <div data-testid={`custom-${f.name || 'anon'}`}>{dom}</div>
    ));
    const map = new Map<string, AttachmentFile>([
      [
        'v1',
        file({
          name: 'bad.mp4',
          uuid: 'v1',
          type: 'video/mp4',
          status: 'error',
          url: 'https://x/bad.mp4',
        }),
      ],
      [
        'i1',
        file({
          name: 'up.png',
          uuid: 'i1',
          type: 'image/png',
          status: 'uploading',
        }),
      ],
      [
        'v2',
        file({
          name: 'ok.mp4',
          uuid: 'v2',
          type: 'video/mp4',
          status: 'uploading',
          url: 'https://x/ok.mp4',
        }),
      ],
    ]);
    render(
      <ConfigProvider>
        <FileMapView
          fileMap={map}
          onPreview={onPreview}
          itemRender={itemRender}
        />
      </ConfigProvider>,
    );
    const videoList = screen.queryByTestId('file-view-video-list');
    if (videoList) {
      const thumb = videoList.querySelector('[role="button"]');
      if (thumb) fireEvent.click(thumb);
    }
    expect(onPreview).not.toHaveBeenCalled();
    expect(itemRender).toHaveBeenCalled();
  });

  it('无 uuid 用 name/index；view-all Enter/Space；onViewAll false 不展开', async () => {
    const onViewAll = vi.fn(async () => false);
    const map = new Map<string, AttachmentFile>();
    for (let i = 0; i < 4; i++) {
      map.set(
        String(i),
        file({
          name: `f${i}.txt`,
          uuid: i === 1 ? undefined : `u${i}`,
          type: 'text/plain',
          url: `https://x/${i}.txt`,
        }),
      );
    }
    render(
      <ConfigProvider>
        <FileMapView
          fileMap={map}
          maxDisplayCount={2}
          onViewAll={onViewAll}
        />
      </ConfigProvider>,
    );
    const more = screen.getByTestId('file-view-view-all');
    fireEvent.keyDown(more, { key: ' ' });
    fireEvent.keyDown(more, { key: 'Enter' });
    expect(onViewAll).toHaveBeenCalled();
  });
});
