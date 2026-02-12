import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getDeviceBrand,
  isImageFile,
  isMobileDevice,
  isOppoDevice,
  isVivoDevice,
  isVivoOrOppoDevice,
  isWeChat,
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

  describe('getDeviceBrand', () => {
    it('navigator 未定义且未传 ua 时返回 false', () => {
      const origNavigator = global.navigator;
      vi.stubGlobal('navigator', undefined);
      expect(getDeviceBrand()).toBe(false);
      vi.stubGlobal('navigator', origNavigator);
    });

    it('传入 ua 匹配 UA_MATCH_LIST 时返回品牌名', () => {
      expect(getDeviceBrand('Mozilla/5.0 iPhone')).toBe('iphone');
      expect(getDeviceBrand('Mozilla/5.0 (Linux; vivo V1981A')).toBe('vivo');
      expect(getDeviceBrand('Mozilla/5.0 OPPO PBCM00')).toBe('oppo');
    });

    it('ua 匹配 Build 正则时返回 Build 中品牌', () => {
      expect(getDeviceBrand('Mozilla/5.0; SomeBrand Build/123')).toBe(
        'SomeBrand',
      );
    });

    it('无匹配时返回 false', () => {
      expect(getDeviceBrand('Mozilla/5.0 UnknownDevice/1.0')).toBe(false);
    });
  });

  describe('isVivoDevice', () => {
    it('ua 为 vivo 时返回 true', () => {
      expect(isVivoDevice('Mozilla/5.0 vivo V1981A')).toBe(true);
    });
    it('ua 非 vivo 时返回 false', () => {
      expect(isVivoDevice('Mozilla/5.0 iPhone')).toBe(false);
    });
  });

  describe('isOppoDevice', () => {
    it('ua 为 oppo 时返回 true', () => {
      expect(isOppoDevice('Mozilla/5.0 OPPO PBCM00')).toBe(true);
    });
    it('ua 非 oppo 时返回 false', () => {
      expect(isOppoDevice('Mozilla/5.0 iPhone')).toBe(false);
    });
  });

  describe('isVivoOrOppoDevice', () => {
    it('vivo 或 oppo 时返回 true', () => {
      expect(isVivoOrOppoDevice('Mozilla/5.0 vivo')).toBe(true);
      expect(isVivoOrOppoDevice('Mozilla/5.0 OPPO')).toBe(true);
    });
    it('非 vivo/oppo 时返回 false', () => {
      expect(isVivoOrOppoDevice('Mozilla/5.0 iPhone')).toBe(false);
    });
  });

  describe('isMobileDevice', () => {
    const origNavigator = global.navigator;
    const origWindow = global.window;

    afterEach(() => {
      vi.stubGlobal('navigator', origNavigator);
      vi.stubGlobal('window', origWindow);
    });

    it('navigator 未定义时返回 false', () => {
      vi.stubGlobal('navigator', undefined);
      expect(isMobileDevice()).toBe(false);
    });

    it('ua 匹配移动端正则时返回 true', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 Android',
        maxTouchPoints: 0,
      });
      vi.stubGlobal('window', { innerWidth: 800 });
      expect(isMobileDevice()).toBe(true);
    });

    it('触摸屏且小屏时返回 true', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 Windows NT 10.0',
        maxTouchPoints: 1,
      });
      vi.stubGlobal('window', { innerWidth: 400 });
      expect(isMobileDevice()).toBe(true);
    });
  });

  describe('isWeChat', () => {
    it('navigator 未定义且未传 ua 时返回 false', () => {
      const orig = global.navigator;
      vi.stubGlobal('navigator', undefined);
      expect(isWeChat()).toBe(false);
      vi.stubGlobal('navigator', orig);
    });
    it('ua 含 MicroMessenger 时返回 true', () => {
      expect(isWeChat('Mozilla/5.0 MicroMessenger')).toBe(true);
    });
    it('ua 不含 MicroMessenger 时返回 false', () => {
      expect(isWeChat('Mozilla/5.0 Chrome')).toBe(false);
    });
  });
});
