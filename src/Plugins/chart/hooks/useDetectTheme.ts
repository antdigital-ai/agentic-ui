import { useSyncExternalStore } from 'react';

/**
 * 主题检测配置选项
 */
export interface DetectThemeOptions {
  /**
   * 用于检测主题的 CSS 变量名
   * @default '--color-gray-bg-page'
   */
  cssVariable?: string;
  /**
   * 亮度阈值，低于此值认为是暗色主题
   * @default 145
   */
  darknessThreshold?: number;
  /**
   * 是否监听主题变化
   * @default true
   */
  observeChanges?: boolean;
}

/**
 * 解析颜色值为 RGB
 */
const parseColorToRgb = (
  color: string,
): { r: number; g: number; b: number } | null => {
  const normalizedColor = color.trim().toLowerCase();

  // 短十六进制格式 #rgb
  const shortHexMatch = normalizedColor.match(/^#([0-9a-f]{3})$/i);
  if (shortHexMatch) {
    const [r, g, b] = shortHexMatch[1].split('').map((char) => {
      return Number.parseInt(char + char, 16);
    });
    return { r, g, b };
  }

  // 标准十六进制格式 #rrggbb
  const hexMatch = normalizedColor.match(/^#([0-9a-f]{6})$/i);
  if (hexMatch) {
    return {
      r: Number.parseInt(hexMatch[1].slice(0, 2), 16),
      g: Number.parseInt(hexMatch[1].slice(2, 4), 16),
      b: Number.parseInt(hexMatch[1].slice(4, 6), 16),
    };
  }

  // rgb/rgba 格式
  const rgbMatch = normalizedColor.match(
    /^rgba?\((\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})(?:[\s,]+[\d.]+)?\)$/i,
  );
  if (rgbMatch) {
    return {
      r: Number.parseInt(rgbMatch[1], 10),
      g: Number.parseInt(rgbMatch[2], 10),
      b: Number.parseInt(rgbMatch[3], 10),
    };
  }

  return null;
};

/**
 * 计算颜色的亮度
 * 使用加权公式：Y = 0.299*R + 0.587*G + 0.114*B
 */
const calculateBrightness = (color: string): number | null => {
  const rgb = parseColorToRgb(color);
  if (!rgb) return null;
  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
};

/**
 * 检测背景色是否为暗色
 */
const isDarkBackground = (color: string, threshold: number = 145): boolean => {
  const brightness = calculateBrightness(color);
  if (brightness === null) return false;
  return brightness < threshold;
};

/**
 * 检测 HTML 元素的 data-theme 属性是否为 dark
 */
const checkDataTheme = (): boolean => {
  if (typeof document === 'undefined') return false;
  const htmlElement = document.documentElement;
  return htmlElement.getAttribute('data-theme') === 'dark';
};

/**
 * 获取 CSS 变量的计算值
 */
const getCSSVariableValue = (variableName: string): string | null => {
  if (typeof window === 'undefined') return null;
  const computedStyle = window.getComputedStyle(document.documentElement);
  const value = computedStyle.getPropertyValue(variableName).trim();
  return value || null;
};

/**
 * 根据多种方式检测当前主题
 */
const detectTheme = (
  cssVariable: string,
  darknessThreshold: number,
): 'light' | 'dark' => {
  // 1. 首先检查 html[data-theme='dark']
  if (checkDataTheme()) {
    return 'dark';
  }

  // 2. 检查 CSS 变量的亮度
  const cssValue = getCSSVariableValue(cssVariable);
  if (cssValue && isDarkBackground(cssValue, darknessThreshold)) {
    return 'dark';
  }

  // 3. 检查背景色 CSS 变量
  const bgColor = getCSSVariableValue('--color-gray-bg-page');
  if (bgColor && isDarkBackground(bgColor, darknessThreshold)) {
    return 'dark';
  }

  return 'light';
};

// --- 单例主题检测：所有 hook 实例共享一个 MutationObserver + matchMedia 监听 ---

let listeners: Array<() => void> = [];
let currentTheme: 'light' | 'dark' = 'light';
let observerRef: MutationObserver | null = null;
let mediaQueryRef: MediaQueryList | null = null;
let refCount = 0;

const DEFAULT_CSS_VARIABLE = '--color-gray-bg-page';
const DEFAULT_DARKNESS_THRESHOLD = 145;

function subscribeTheme(listener: () => void): () => void {
  listeners.push(listener);
  refCount++;

  // 第一个订阅者时初始化全局监听器
  if (refCount === 1 && typeof window !== 'undefined') {
    currentTheme = detectTheme(
      DEFAULT_CSS_VARIABLE,
      DEFAULT_DARKNESS_THRESHOLD,
    );

    const updateTheme = () => {
      const next = detectTheme(
        DEFAULT_CSS_VARIABLE,
        DEFAULT_DARKNESS_THRESHOLD,
      );
      if (next !== currentTheme) {
        currentTheme = next;
        listeners.forEach((fn) => fn());
      }
    };

    const htmlElement = document.documentElement;
    observerRef = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-theme'
        ) {
          updateTheme();
          break;
        }
      }
    });

    observerRef.observe(htmlElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class', 'style'],
    });

    mediaQueryRef = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQueryRef.addEventListener('change', updateTheme);
  }

  return () => {
    listeners = listeners.filter((fn) => fn !== listener);
    refCount--;

    // 最后一个订阅者取消时清理全局监听器
    if (refCount === 0) {
      observerRef?.disconnect();
      observerRef = null;
      if (mediaQueryRef) {
        mediaQueryRef.removeEventListener('change', () => {});
        mediaQueryRef = null;
      }
    }
  };
}

function getSnapshot(): 'light' | 'dark' {
  return currentTheme;
}

function getServerSnapshot(): 'light' | 'dark' {
  return 'light';
}

/**
 * 自动检测当前主题的 Hook（单例模式）
 *
 * 所有 hook 实例共享同一个 MutationObserver 和 matchMedia 监听器，
 * 避免页面上多个图表时创建重复的 DOM 监听。
 *
 * 检测策略（按优先级）：
 * 1. 检查 `html[data-theme='dark']` 属性
 * 2. 检查指定 CSS 变量的亮度值
 * 3. 检查 `--color-gray-bg-page` 的亮度值
 *
 * @param options 检测配置选项（observeChanges 为 false 时跳过监听）
 * @returns 检测到的主题 'light' | 'dark'
 *
 * @example
 * ```tsx
 * const theme = useDetectTheme();
 * // theme: 'light' | 'dark'
 *
 * // 禁用监听（仅检测一次）
 * const theme = useDetectTheme({ observeChanges: false });
 * ```
 */
export const useDetectTheme = (
  options: DetectThemeOptions = {},
): 'light' | 'dark' => {
  const { observeChanges = true } = options;

  // 当 observeChanges 为 false 时，只做一次性检测，不订阅变更
  const liveTheme = useSyncExternalStore(
    subscribeTheme,
    getSnapshot,
    getServerSnapshot,
  );

  if (!observeChanges) {
    return detectTheme(
      options.cssVariable ?? DEFAULT_CSS_VARIABLE,
      options.darknessThreshold ?? DEFAULT_DARKNESS_THRESHOLD,
    );
  }

  return liveTheme;
};

export default useDetectTheme;
