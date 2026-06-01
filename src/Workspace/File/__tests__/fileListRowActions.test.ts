import { describe, expect, it, vi } from 'vitest';
import type { FileNode } from '../../types';
import {
  shouldShowFileDownloadAction,
  shouldShowFilePreviewAction,
} from '../fileListRowActions';

describe('fileListRowActions', () => {
  describe('shouldShowFileDownloadAction', () => {
    it('有 onDownload 时应展示', () => {
      expect(shouldShowFileDownloadAction({ name: 'a.txt' }, vi.fn())).toBe(
        true,
      );
    });

    it('有 url 无 onDownload 时应展示', () => {
      expect(
        shouldShowFileDownloadAction({
          name: 'a.txt',
          url: 'https://example.com/a.txt',
        }),
      ).toBe(true);
    });
  });

  describe('shouldShowFilePreviewAction', () => {
    const onPreview = vi.fn();

    it('有 onPreview 且 url 时应展示（无需 canPreview）', () => {
      const file: FileNode = {
        name: 'readme.md',
        url: 'https://example.com/readme.md',
      };
      expect(shouldShowFilePreviewAction(file, onPreview)).toBe(true);
    });

    it('有 onPreview 且 content 时应展示', () => {
      expect(
        shouldShowFilePreviewAction(
          { name: 'note.txt', content: 'hello' },
          onPreview,
        ),
      ).toBe(true);
    });

    it('无 onPreview 时不展示', () => {
      expect(
        shouldShowFilePreviewAction({
          name: 'a.md',
          url: 'https://example.com/a.md',
        }),
      ).toBe(false);
    });

    it('canPreview 为 false 时不展示', () => {
      expect(
        shouldShowFilePreviewAction(
          {
            name: 'a.md',
            url: 'https://example.com/a.md',
            canPreview: false,
          },
          onPreview,
        ),
      ).toBe(false);
    });

    it('图片需有 url 或 previewUrl', () => {
      expect(
        shouldShowFilePreviewAction(
          { name: 'pic.png', type: 'image' },
          onPreview,
        ),
      ).toBe(false);
      expect(
        shouldShowFilePreviewAction(
          {
            name: 'pic.png',
            type: 'image',
            url: 'https://example.com/pic.png',
          },
          onPreview,
        ),
      ).toBe(true);
    });
  });
});
