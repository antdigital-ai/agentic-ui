import { describe, expect, it } from 'vitest';
import {
  isImageFile,
  isMediaFile,
  isVideoFile,
  kbToSize,
} from '../../../src/MarkdownInputField/AttachmentButton/utils';

describe('AttachmentButton Utils', () => {
  describe('kbToSize', () => {
    it('应该正确转换字节级别（B）', () => {
      expect(kbToSize(0.001)).toBe('1.02 B');
      expect(kbToSize(0.1)).toBe('102.4 B');
      expect(kbToSize(0.5)).toBe('512 B');
      expect(kbToSize(0.98)).toBe('1003.52 B');
    });

    it('应该正确转换KB级别', () => {
      expect(kbToSize(1)).toBe('1 KB');
      expect(kbToSize(512)).toBe('512 KB');
      expect(kbToSize(1023)).toBe('1023 KB');
    });

    it('应该正确转换MB级别', () => {
      expect(kbToSize(1024)).toBe('1 MB');
      expect(kbToSize(1536)).toBe('1.5 MB');
      expect(kbToSize(2048)).toBe('2 MB');
      expect(kbToSize(10240)).toBe('10 MB');
    });

    it('应该正确转换GB级别', () => {
      expect(kbToSize(1048576)).toBe('1 GB');
      expect(kbToSize(1572864)).toBe('1.5 GB');
      expect(kbToSize(10485760)).toBe('10 GB');
    });

    it('应该正确转换TB级别', () => {
      expect(kbToSize(1073741824)).toBe('1 TB');
      expect(kbToSize(10737418240)).toBe('10 TB');
    });

    it('应该正确处理小数', () => {
      expect(kbToSize(0.1)).toBe('102.4 B');
      expect(kbToSize(1.5)).toBe('1.5 KB');
      expect(kbToSize(1536.5)).toBe('1.5 MB');
    });

    it('应该正确处理边界值', () => {
      expect(kbToSize(1023.99)).toBe('1023.99 KB');
      expect(kbToSize(1048575.99)).toBe('1024 MB');
      expect(kbToSize(1073741823.99)).toBe('1024 GB');
    });

    it('应该处理0值', () => {
      expect(kbToSize(0)).toBe('0 B');
    });

    it('应该处理极小值', () => {
      expect(kbToSize(0.0001)).toBe('0.1 B');
      expect(kbToSize(0.0009765625)).toBe('1 B');
    });
  });

  describe('isImageFile', () => {
    it('应该正确识别图片文件', () => {
      const pngFile = new File([''], 'image.png', { type: 'image/png' });
      const jpegFile = new File([''], 'image.jpg', { type: 'image/jpeg' });
      const gifFile = new File([''], 'image.gif', { type: 'image/gif' });
      const webpFile = new File([''], 'image.webp', { type: 'image/webp' });

      expect(isImageFile(pngFile)).toBe(true);
      expect(isImageFile(jpegFile)).toBe(true);
      expect(isImageFile(gifFile)).toBe(true);
      expect(isImageFile(webpFile)).toBe(true);
    });

    it('应该正确识别非图片文件', () => {
      const pdfFile = new File([''], 'document.pdf', {
        type: 'application/pdf',
      });
      const textFile = new File([''], 'document.txt', { type: 'text/plain' });
      const zipFile = new File([''], 'archive.zip', {
        type: 'application/zip',
      });

      expect(isImageFile(pdfFile)).toBe(false);
      expect(isImageFile(textFile)).toBe(false);
      expect(isImageFile(zipFile)).toBe(false);
    });

    it('应该处理空类型', () => {
      const emptyTypeFile = new File([''], 'file', { type: '' });
      expect(isImageFile(emptyTypeFile)).toBe(false);
    });

    it('应该处理未知类型', () => {
      const unknownFile = new File([''], 'file', {
        type: 'application/unknown',
      });
      expect(isImageFile(unknownFile)).toBe(false);
    });
  });

  describe('isVideoFile', () => {
    it('应该正确识别视频文件', () => {
      const mp4File = new File([''], 'video.mp4', { type: 'video/mp4' });
      const webmFile = new File([''], 'video.webm', { type: 'video/webm' });
      const movFile = new File([''], 'clip.mov', { type: 'video/quicktime' });

      expect(isVideoFile(mp4File)).toBe(true);
      expect(isVideoFile(webmFile)).toBe(true);
      expect(isVideoFile(movFile)).toBe(true);
    });

    it('应该根据扩展名识别视频', () => {
      const mp4ByName = new File([''], 'demo.mp4', { type: '' });
      const webmByName = new File([''], 'tutorial.webm', { type: 'application/octet-stream' });

      expect(isVideoFile(mp4ByName)).toBe(true);
      expect(isVideoFile(webmByName)).toBe(true);
    });

    it('应该根据 URL 识别 AttachmentFile 中的视频', () => {
      const fileWithVideoUrl = new File([''], 'file', { type: '' }) as File & {
        url?: string;
        previewUrl?: string;
      };
      fileWithVideoUrl.previewUrl = 'https://example.com/demo.mp4';

      expect(isVideoFile(fileWithVideoUrl)).toBe(true);
    });

    it('应该正确识别非视频文件', () => {
      const pdfFile = new File([''], 'doc.pdf', { type: 'application/pdf' });
      const imageFile = new File([''], 'img.png', { type: 'image/png' });

      expect(isVideoFile(pdfFile)).toBe(false);
      expect(isVideoFile(imageFile)).toBe(false);
    });
  });

  describe('isMediaFile', () => {
    it('应该识别图片和视频为媒体文件', () => {
      const pngFile = new File([''], 'img.png', { type: 'image/png' });
      const mp4File = new File([''], 'video.mp4', { type: 'video/mp4' });

      expect(isMediaFile(pngFile)).toBe(true);
      expect(isMediaFile(mp4File)).toBe(true);
    });

    it('应该识别非媒体文件', () => {
      const pdfFile = new File([''], 'doc.pdf', { type: 'application/pdf' });
      expect(isMediaFile(pdfFile)).toBe(false);
    });
  });
});
