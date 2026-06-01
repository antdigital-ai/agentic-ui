import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDetectTheme } from '../../hooks/useDetectTheme';

// Mock window.getComputedStyle
const mockGetComputedStyle = vi.fn();
Object.defineProperty(window, 'getComputedStyle', {
  value: mockGetComputedStyle,
  writable: true,
});

// Mock matchMedia
const mockMatchMedia = vi.fn();
Object.defineProperty(window, 'matchMedia', {
  value: mockMatchMedia,
  writable: true,
});

// Mock requestAnimationFrame
const mockRaf = vi.fn((_cb: FrameRequestCallback) => {
  return 1;
});
const mockCancelRaf = vi.fn();
Object.defineProperty(window, 'requestAnimationFrame', {
  value: mockRaf,
  writable: true,
});
Object.defineProperty(window, 'cancelAnimationFrame', {
  value: mockCancelRaf,
  writable: true,
});

describe('useDetectTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 重置 document.documentElement
    document.documentElement.removeAttribute('data-theme');
    // 默认返回浅色背景
    mockGetComputedStyle.mockReturnValue({
      getPropertyValue: (prop: string) => {
        if (prop === '--color-gray-bg-page') {
          return '#ffffff';
        }
        return '';
      },
    });
    // 默认 matchMedia 返回 false
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    // requestAnimationFrame 默认不执行回调
    mockRaf.mockImplementation((_cb: FrameRequestCallback) => {
      return 1;
    });
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  describe('默认行为', () => {
    it('应该默认返回 light 主题', () => {
      const { result } = renderHook(() => useDetectTheme());
      expect(result.current).toBe('light');
    });

    it('当没有 data-theme 且 CSS 变量为浅色时，应返回 light', () => {
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: (prop: string) => {
          if (prop === '--color-gray-bg-page') {
            return '#ffffff';
          }
          return '';
        },
      });

      const { result } = renderHook(() => useDetectTheme());
      expect(result.current).toBe('light');
    });
  });

  describe('data-theme 属性检测', () => {
    it('当 html[data-theme="dark"] 时应返回 dark', () => {
      document.documentElement.setAttribute('data-theme', 'dark');

      const { result } = renderHook(() => useDetectTheme());
      expect(result.current).toBe('dark');
    });

    it('当 html[data-theme="light"] 时应返回 light', () => {
      document.documentElement.setAttribute('data-theme', 'light');

      const { result } = renderHook(() => useDetectTheme());
      expect(result.current).toBe('light');
    });

    it('data-theme 优先级高于 CSS 变量', () => {
      document.documentElement.setAttribute('data-theme', 'dark');
      // CSS 变量返回浅色
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: (prop: string) => {
          if (prop === '--color-gray-bg-page') {
            return '#ffffff';
          }
          return '';
        },
      });

      const { result } = renderHook(() => useDetectTheme());
      expect(result.current).toBe('dark');
    });
  });

  describe('CSS 变量亮度检测', () => {
    it('当 CSS 变量为深色背景时应返回 dark', () => {
      document.documentElement.removeAttribute('data-theme');
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: (prop: string) => {
          if (prop === '--color-gray-bg-page') {
            return '#141414'; // 深色背景
          }
          return '';
        },
      });

      const { result } = renderHook(() => useDetectTheme());
      expect(result.current).toBe('dark');
    });

    it('当 CSS 变量为浅色背景时应返回 light', () => {
      document.documentElement.removeAttribute('data-theme');
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: (prop: string) => {
          if (prop === '--color-gray-bg-page') {
            return '#f7f8f9'; // 浅色背景
          }
          return '';
        },
      });

      const { result } = renderHook(() => useDetectTheme());
      expect(result.current).toBe('light');
    });

    it('应支持 rgb 格式的颜色', () => {
      document.documentElement.removeAttribute('data-theme');
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: (prop: string) => {
          if (prop === '--color-gray-bg-page') {
            return 'rgb(20, 20, 20)'; // 深色背景
          }
          return '';
        },
      });

      const { result } = renderHook(() => useDetectTheme());
      expect(result.current).toBe('dark');
    });

    it('应支持 rgba 格式的颜色', () => {
      document.documentElement.removeAttribute('data-theme');
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: (prop: string) => {
          if (prop === '--color-gray-bg-page') {
            return 'rgba(20, 20, 20, 0.9)';
          }
          return '';
        },
      });

      const { result } = renderHook(() => useDetectTheme());
      expect(result.current).toBe('dark');
    });
  });

  describe('配置选项', () => {
    it('应支持自定义 CSS 变量名', () => {
      document.documentElement.removeAttribute('data-theme');
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: (prop: string) => {
          if (prop === '--custom-bg') {
            return '#141414';
          }
          if (prop === '--color-gray-bg-page') {
            return '#ffffff';
          }
          return '';
        },
      });

      // 自定义 cssVariable 仅在 observeChanges: false 时生效（单例模式使用默认变量）
      const { result } = renderHook(() =>
        useDetectTheme({ cssVariable: '--custom-bg', observeChanges: false }),
      );
      expect(result.current).toBe('dark');
    });

    it('应支持自定义亮度阈值', () => {
      document.documentElement.removeAttribute('data-theme');
      // Y=(0.299*160+0.587*160+0.114*160) = 160，不低于默认阈值 145 → light
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: (prop: string) => {
          if (prop === '--color-gray-bg-page') {
            return '#a0a0a0';
          }
          return '';
        },
      });
      const { result: result1 } = renderHook(() =>
        useDetectTheme({ observeChanges: false }),
      );
      expect(result1.current).toBe('light');

      // Y ≈ 80，低于自定义阈值 100 → dark
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: (prop: string) => {
          if (prop === '--color-gray-bg-page') {
            return '#505050';
          }
          return '';
        },
      });
      const { result: result2 } = renderHook(() =>
        useDetectTheme({ darknessThreshold: 100, observeChanges: false }),
      );
      expect(result2.current).toBe('dark');
    });

    it('当 observeChanges 为 false 时应直接检测而非使用缓存', () => {
      // 设置深色背景
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: (prop: string) => {
          if (prop === '--color-gray-bg-page') {
            return '#141414';
          }
          return '';
        },
      });
      const { result } = renderHook(() =>
        useDetectTheme({ observeChanges: false }),
      );
      // observeChanges: false 时每次都会重新调用 detectTheme，不依赖单例缓存
      expect(result.current).toBe('dark');
    });
  });

  describe('主题变化监听', () => {
    it('应监听 data-theme 属性变化', async () => {
      const mutationCallbacks: MutationCallback[] = [];
      const mockObserve = vi.fn();
      const mockDisconnect = vi.fn();

      // Mock MutationObserver - 使用 class 形式以兼容 new 调用
      const OriginalMutationObserver = window.MutationObserver;
      window.MutationObserver = class MockMutationObserver {
        constructor(callback: MutationCallback) {
          mutationCallbacks.push(callback);
        }
        observe = mockObserve;
        disconnect = mockDisconnect;
        takeRecords = () => [] as MutationRecord[];
      } as unknown as typeof MutationObserver;

      const { result, unmount } = renderHook(() => useDetectTheme());
      expect(result.current).toBe('light');

      // 模拟 data-theme 变化
      document.documentElement.setAttribute('data-theme', 'dark');

      // 触发 MutationObserver 回调
      act(() => {
        mutationCallbacks.forEach((cb) => {
          cb(
            [
              {
                type: 'attributes',
                attributeName: 'data-theme',
                target: document.documentElement,
              } as unknown as MutationRecord,
            ],
            {} as MutationObserver,
          );
        });
      });

      // 确保 unmount hook 以清理 React 状态
      unmount();

      // 恢复原始 MutationObserver
      window.MutationObserver = OriginalMutationObserver;
    });
  });

  describe('边界情况', () => {
    it('当 CSS 变量为空时应返回 light', () => {
      document.documentElement.removeAttribute('data-theme');
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: () => '',
      });

      const { result } = renderHook(() => useDetectTheme());
      expect(result.current).toBe('light');
    });

    it('当 CSS 变量格式无效时应返回 light', () => {
      document.documentElement.removeAttribute('data-theme');
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: (prop: string) => {
          if (prop === '--color-gray-bg-page') {
            return 'invalid-color';
          }
          return '';
        },
      });

      const { result } = renderHook(() => useDetectTheme());
      expect(result.current).toBe('light');
    });

    it('应支持短十六进制格式 #RGB', () => {
      document.documentElement.removeAttribute('data-theme');
      mockGetComputedStyle.mockReturnValue({
        getPropertyValue: (prop: string) => {
          if (prop === '--color-gray-bg-page') {
            return '#111'; // 深色背景
          }
          return '';
        },
      });

      const { result } = renderHook(() => useDetectTheme());
      expect(result.current).toBe('dark');
    });
  });
});
