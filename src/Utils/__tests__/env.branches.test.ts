import { afterEach, describe, expect, it, vi } from 'vitest';
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

describe('env 分支覆盖', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('isBrowser 在 jsdom 为 true', () => {
    expect(isBrowser()).toBe(true);
  });

  it('isBrowser window undefined 返回 false', () => {
    const desc = Object.getOwnPropertyDescriptor(globalThis, 'window');
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      writable: true,
      value: undefined,
    });
    try {
      expect(isBrowser()).toBe(false);
    } finally {
      if (desc) Object.defineProperty(globalThis, 'window', desc);
      else Reflect.deleteProperty(globalThis, 'window');
    }
  });

  it('isBrowser document undefined 返回 false', () => {
    const desc = Object.getOwnPropertyDescriptor(globalThis, 'document');
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      writable: true,
      value: undefined,
    });
    try {
      expect(isBrowser()).toBe(false);
    } finally {
      if (desc) Object.defineProperty(globalThis, 'document', desc);
      else Reflect.deleteProperty(globalThis, 'document');
    }
  });

  it('isTest NODE_ENV=test', () => {
    expect(isTest()).toBe(true);
  });

  it('getDeviceBrand iPhone UA', () => {
    expect(getDeviceBrand('Mozilla/5.0 (iPhone; CPU iPhone OS)')).toBe('iphone');
  });

  it('getDeviceBrand 华为 UA', () => {
    expect(getDeviceBrand('HUAWEI P40')).toBe('华为');
  });

  it('getDeviceBrand Build 兜底', () => {
    expect(getDeviceBrand('Linux; CustomDevice Build/ABC123')).toBe(
      'CustomDevice',
    );
  });

  it('getDeviceBrand 未命中返回 false', () => {
    expect(getDeviceBrand('UnknownBrowser/1.0')).toBe(false);
  });

  it('getDeviceBrand 无 navigator 无 ua 返回 false', () => {
    vi.stubGlobal('navigator', undefined);
    expect(getDeviceBrand()).toBe(false);
  });

  it('isVivoDevice / isOppoDevice', () => {
    expect(isVivoDevice('vivo X90')).toBe(true);
    expect(isOppoDevice('OPPO A5')).toBe(true);
    expect(isVivoOrOppoDevice('OPPO A5')).toBe(true);
  });

  it('isMobileDevice 移动 UA', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; Mobile)',
      maxTouchPoints: 1,
    });
    vi.stubGlobal('window', { innerWidth: 375, ontouchstart: true });
    expect(isMobileDevice()).toBe(true);
  });

  it('isMobileDevice 桌面 UA 小屏+触摸', () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
      maxTouchPoints: 2,
    });
    vi.stubGlobal('window', { innerWidth: 600, ontouchstart: true });
    expect(isMobileDevice()).toBe(true);
  });

  it('isMobileDevice SSR navigator undefined', () => {
    vi.stubGlobal('navigator', undefined);
    expect(isMobileDevice()).toBe(false);
  });

  it('isWeChat 微信 UA', () => {
    expect(isWeChat('MicroMessenger/8.0')).toBe(true);
    expect(isWeChat('Chrome/120')).toBe(false);
  });

  it('isWeChat 无 navigator 无 ua', () => {
    vi.stubGlobal('navigator', undefined);
    expect(isWeChat()).toBe(false);
  });
});

describe('env istanbul residual：isBrowser / isTest', () => {
  it('isBrowser 与 isTest 真值臂', () => {
    // typeof window !== 'undefined' && typeof document !== 'undefined'
    expect(isBrowser()).toBe(true);
    expect(isTest()).toBe(true);
  });
});
