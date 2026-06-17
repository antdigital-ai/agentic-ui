import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getDeviceBrand,
  isBrowser,
  isMobileDevice,
  isOppoDevice,
  isTest,
  isVivoDevice,
  isVivoOrOppoDevice,
  isWeChat,
} from '../env';

describe('env utils', () => {
  const originalNavigator = global.navigator;
  const originalWindow = global.window;

  beforeEach(() => {
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (Linux; Android 10; V1981A) AppleWebKit/537.36 Chrome/91.0 Mobile Safari/537.36',
      maxTouchPoints: 5,
    });
    vi.stubGlobal('window', {
      document: global.document,
      innerWidth: 390,
      ontouchstart: true,
    });
    vi.stubGlobal('document', global.document ?? { body: {} });
  });

  afterEach(() => {
    vi.stubGlobal('navigator', originalNavigator);
    vi.stubGlobal('window', originalWindow);
    vi.unstubAllGlobals();
  });

  describe('isBrowser', () => {
    it('浏览器环境应返回 true', () => {
      expect(isBrowser()).toBe(true);
    });
  });

  describe('isTest', () => {
    it('测试环境应返回 true', () => {
      expect(isTest()).toBe(process.env.NODE_ENV === 'test');
    });
  });

  describe('getDeviceBrand', () => {
    it('应识别 vivo UA', () => {
      expect(getDeviceBrand()).toBe('vivo');
    });

    it('应识别 iPhone UA', () => {
      expect(
        getDeviceBrand(
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
        ),
      ).toBe('iphone');
    });

    it('应识别 OPPO UA', () => {
      expect(getDeviceBrand('Mozilla/5.0 OPPO PCAM10')).toBe('oppo');
    });

    it('未命中时应尝试 Build 兜底或返回 false', () => {
      expect(getDeviceBrand('Custom; Pixel Build/ABC123')).toBe('Pixel');
      expect(getDeviceBrand('UnknownBrowser/1.0')).toBe(false);
    });

    it('无 navigator 且无 UA 时返回 false', () => {
      vi.stubGlobal('navigator', undefined);
      expect(getDeviceBrand()).toBe(false);
    });
  });

  describe('device helpers', () => {
    it('isVivoDevice / isOppoDevice / isVivoOrOppoDevice', () => {
      expect(isVivoDevice()).toBe(true);
      expect(isOppoDevice()).toBe(false);
      expect(isVivoOrOppoDevice()).toBe(true);
      expect(isOppoDevice('Mozilla/5.0 OPPO')).toBe(true);
    });
  });

  describe('isMobileDevice', () => {
    it('移动 UA 应识别为移动设备', () => {
      expect(isMobileDevice()).toBe(true);
    });

    it('桌面 UA 且无触摸时应返回 false', () => {
      vi.stubGlobal('navigator', {
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0',
        maxTouchPoints: 0,
      });
      vi.stubGlobal('window', {
        document: global.document,
        innerWidth: 1440,
      });
      expect(isMobileDevice()).toBe(false);
    });

    it('无 navigator 时应返回 false', () => {
      vi.stubGlobal('navigator', undefined);
      expect(isMobileDevice()).toBe(false);
    });
  });

  describe('isWeChat', () => {
    it('应识别微信内置浏览器', () => {
      expect(isWeChat('Mozilla/5.0 MicroMessenger/8.0')).toBe(true);
      expect(isWeChat('Mozilla/5.0 Chrome/120.0')).toBe(false);
    });

    it('无 navigator 且无 UA 时返回 false', () => {
      vi.stubGlobal('navigator', undefined);
      expect(isWeChat()).toBe(false);
    });
  });
});
