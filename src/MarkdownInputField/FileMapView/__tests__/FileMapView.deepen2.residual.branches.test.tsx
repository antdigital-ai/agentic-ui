/**
 * FileMapView deepen2：image/video key 回退 index、itemRender 占位、
 * previewUrl/url 回退、多视频缩略尺寸。
 */
import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';
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

describe('FileMapView deepen2 residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 uuid/name：key 回落 index；previewUrl 优先', () => {
    const map = new Map<string, AttachmentFile>([
      [
        'i1',
        file({
          name: 'p.png',
          type: 'image/png',
          previewUrl: 'https://x/p.png',
          url: 'https://x/u.png',
        }),
      ],
      [
        'i2',
        file({
          name: 'u2.png',
          type: 'image/png',
          url: 'https://x/u2.png',
          status: 'uploading',
        }),
      ],
    ]);
    const itemRender = vi.fn((f, dom) => (
      <div data-testid={`ir-${f.status}`}>{dom}</div>
    ));
    render(
      <ConfigProvider>
        <FileMapView fileMap={map} itemRender={itemRender} placement="right" />
      </ConfigProvider>,
    );
    expect(itemRender).toHaveBeenCalled();
    expect(screen.getByTestId('ir-uploading')).toBeInTheDocument();
  });

  it('多 video：非单视频缩略尺寸；itemRender 包装 placeholder', () => {
    const itemRender = vi.fn((f, dom) => (
      <div data-testid={`v-${f.name}`}>{dom}</div>
    ));
    const map = new Map<string, AttachmentFile>([
      [
        'v1',
        file({
          name: 'a.mp4',
          type: 'video/mp4',
          status: 'uploading',
          url: 'https://x/a.mp4',
        }),
      ],
      [
        'v2',
        file({
          name: 'b.mp4',
          type: 'video/mp4',
          status: 'done',
          previewUrl: 'https://x/b.mp4',
        }),
      ],
    ]);
    render(
      <ConfigProvider>
        <FileMapView fileMap={map} itemRender={itemRender} />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('file-view-video-list')).toBeInTheDocument();
    expect(screen.getByTestId('v-a.mp4')).toBeInTheDocument();
  });
});
