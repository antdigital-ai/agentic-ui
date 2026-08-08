/**
 * AttachmentButton utils deepen：视频扩展名 / url 扩展名 / isMediaFile。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isMediaFile,
  isVideoFile,
} from '../utils';

describe('AttachmentButton utils deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('无 video MIME 时靠文件名扩展名识别', () => {
    const file = new File(['x'], 'clip.mp4', { type: '' });
    expect(isVideoFile(file)).toBe(true);
    expect(isMediaFile(file)).toBe(true);
  });

  it('靠 previewUrl / url 扩展名识别视频', () => {
    const byPreview = Object.assign(new File(['x'], 'a.bin', { type: '' }), {
      previewUrl: 'https://cdn.example/v.webm?sig=1',
    });
    expect(isVideoFile(byPreview)).toBe(true);
    const byUrl = Object.assign(new File(['x'], 'b.bin', { type: '' }), {
      url: 'https://cdn.example/v.mov',
    });
    expect(isVideoFile(byUrl)).toBe(true);
  });

  it('非媒体文件 isMediaFile 为 false', () => {
    const file = new File(['x'], 'note.txt', { type: 'text/plain' });
    expect(isVideoFile(file)).toBe(false);
    expect(isMediaFile(file)).toBe(false);
  });
});
