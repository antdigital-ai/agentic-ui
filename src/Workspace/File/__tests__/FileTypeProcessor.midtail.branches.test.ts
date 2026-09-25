/**
 * FileTypeProcessor mid-tail：MIME / 扩展名 / URL / 预览能力与模式。
 */
import { describe, expect, it, vi } from 'vitest';
import { FileCategory } from '../../types';
import {
  FileTypeProcessor,
  getMimeType,
  isArchiveFile,
  isAudioFile,
  isImageFile,
  isPdfFile,
  isTextFile,
  isVideoFile,
} from '../FileTypeProcessor';
import { PreviewCapability } from '../DataSourceStrategy';

const mockDs = (previewCapability: PreviewCapability, mimeType?: string) => ({
  processFile: vi.fn(() => ({
    previewCapability,
    mimeType,
    source: 'url' as const,
  })),
  cleanupResult: vi.fn(),
});

describe('FileTypeProcessor midtail branches', () => {
  it('infer：显式 type / MIME / 扩展名 / URL / 默认', () => {
    const proc = new FileTypeProcessor(mockDs(PreviewCapability.FULL) as any);

    expect(proc.inferFileType({ id: '1', name: 'a', type: 'pdf' } as any).fileType).toBe(
      'pdf',
    );

    expect(
      proc.inferFileType({
        id: '2',
        name: 'x',
        file: { type: 'image/png' } as File,
      } as any).fileType,
    ).toBe('image');

    expect(
      proc.inferFileType({ id: '3', name: 'notes.md' } as any).fileType,
    ).toBe('markdown');

    expect(
      proc.inferFileType({
        id: '4',
        name: 'noext',
        url: 'https://cdn.example.com/clip.mp4?token=1',
      } as any).fileType,
    ).toBe('video');

    expect(
      proc.inferFileType({ id: '5', name: 'unknown' } as any).fileType,
    ).toBe('plainText');
  });

  it('processFile：BASIC 仅图片可预览；NONE 不可；FULL 多类型模式', () => {
    const basic = new FileTypeProcessor(
      mockDs(PreviewCapability.BASIC) as any,
    );
    const img = basic.processFile({
      id: 'i',
      name: 'a.png',
      type: 'image',
    } as any);
    expect(img.canPreview).toBe(true);
    expect(img.previewMode).toBe('modal');

    const txt = basic.processFile({
      id: 't',
      name: 'a.txt',
      type: 'plainText',
    } as any);
    expect(txt.canPreview).toBe(false);
    expect(txt.previewMode).toBe('none');

    const none = new FileTypeProcessor(mockDs(PreviewCapability.NONE) as any);
    expect(
      none.processFile({ id: 'p', name: 'a.pdf', type: 'pdf' } as any)
        .previewMode,
    ).toBe('none');

    const full = new FileTypeProcessor(mockDs(PreviewCapability.FULL) as any);
    expect(
      full.processFile({ id: 'c', name: 'a.ts', type: 'typescript' } as any)
        .previewMode,
    ).toBe('inline');
    expect(
      full.processFile({ id: 'v', name: 'a.mp4', type: 'video' } as any)
        .previewMode,
    ).toBe('inline');
    expect(
      full.processFile({ id: 'a', name: 'a.mp3', type: 'audio' } as any)
        .previewMode,
    ).toBe('inline');
    expect(
      full.processFile({ id: 'p', name: 'a.pdf', type: 'pdf' } as any)
        .previewMode,
    ).toBe('inline');

    const result = full.processFile({
      id: 'z',
      name: 'z.zip',
      type: 'archive',
    } as any);
    expect(result.previewMode === 'external' || result.previewMode === 'none').toBe(
      true,
    );
    full.cleanupResult(result);
  });

  it('便捷判断与 getMimeType 回退', () => {
    expect(isImageFile({ id: '1', name: 'a.png' } as any)).toBe(true);
    expect(isVideoFile({ id: '2', name: 'a.mp4' } as any)).toBe(true);
    expect(isPdfFile({ id: '3', name: 'a.pdf' } as any)).toBe(true);
    expect(isTextFile({ id: '4', name: 'a.txt' } as any)).toBe(true);
    expect(isAudioFile({ id: '5', name: 'a.mp3' } as any)).toBe(true);
    expect(isArchiveFile({ id: '6', name: 'a.zip' } as any)).toBe(true);
    expect(typeof getMimeType({ id: '7', name: 'a.bin' } as any)).toBe(
      'string',
    );
    expect(FileCategory.Image).toBeTruthy();
  });

  it('processFile NONE 能力不可预览', () => {
    const none = new FileTypeProcessor(mockDs(PreviewCapability.NONE) as any);
    const result = none.processFile({
      id: 'n',
      name: 'a.bin',
      type: 'other',
    } as any);
    expect(result.canPreview).toBe(false);
    none.cleanupResult(result);
  });
});
