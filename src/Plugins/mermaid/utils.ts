import type { MermaidApi } from './types';

let mermaidLoader: Promise<MermaidApi> | null = null;

const COLOR_DARKNESS_THRESHOLD = 145;
const DEFAULT_LIGHT_BACKGROUND = '#ffffff';
const DEFAULT_DARK_BACKGROUND = '#141414';
const DEFAULT_LIGHT_TEXT_COLOR = '#1f1f1f';
const DEFAULT_DARK_TEXT_COLOR = '#f5f5f5';
const DEFAULT_LIGHT_SECONDARY_TEXT_COLOR = '#595959';
const DEFAULT_DARK_SECONDARY_TEXT_COLOR = '#bfbfbf';
const DEFAULT_LIGHT_BORDER_COLOR = '#d9d9d9';
const DEFAULT_DARK_BORDER_COLOR = '#434343';
const DEFAULT_PRIMARY_COLOR = '#1677ff';
const DEFAULT_FONT_FAMILY = 'Inter, -apple-system, Segoe UI, sans-serif';

export interface MermaidThemeToken {
  colorBgContainer?: string;
  colorBgElevated?: string;
  colorText?: string;
  colorTextSecondary?: string;
  colorBorder?: string;
  colorPrimary?: string;
  fontFamily?: string;
}

export interface MermaidThemeConfig {
  cacheKey: string;
  darkMode: boolean;
  themeVariables: Record<string, string>;
}

const parseColorToRgb = (
  color: string,
): { r: number; g: number; b: number } | null => {
  const normalizedColor = color.trim().toLowerCase();

  const shortHexMatch = normalizedColor.match(/^#([0-9a-f]{3})$/i);
  if (shortHexMatch) {
    const [r, g, b] = shortHexMatch[1].split('').map((char) => {
      return Number.parseInt(char + char, 16);
    });
    return { r, g, b };
  }

  const hexMatch = normalizedColor.match(/^#([0-9a-f]{6})$/i);
  if (hexMatch) {
    return {
      r: Number.parseInt(hexMatch[1].slice(0, 2), 16),
      g: Number.parseInt(hexMatch[1].slice(2, 4), 16),
      b: Number.parseInt(hexMatch[1].slice(4, 6), 16),
    };
  }

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

const isDarkBackground = (color?: string): boolean => {
  if (!color) {
    return false;
  }

  const rgbColor = parseColorToRgb(color);
  if (!rgbColor) {
    return false;
  }

  const brightness =
    (rgbColor.r * 299 + rgbColor.g * 587 + rgbColor.b * 114) / 1000;
  return brightness < COLOR_DARKNESS_THRESHOLD;
};

const isLightTextColor = (color?: string): boolean => {
  if (!color) {
    return false;
  }

  const rgbColor = parseColorToRgb(color);
  if (!rgbColor) {
    return false;
  }

  const brightness =
    (rgbColor.r * 299 + rgbColor.g * 587 + rgbColor.b * 114) / 1000;
  return brightness >= COLOR_DARKNESS_THRESHOLD;
};

const inferDarkMode = (token: MermaidThemeToken): boolean => {
  if (isDarkBackground(token.colorBgContainer)) {
    return true;
  }

  // Fallback for CSS variables / unresolved background colors.
  return isLightTextColor(token.colorText);
};

export const createMermaidThemeConfig = (
  token: MermaidThemeToken = {},
): MermaidThemeConfig => {
  const darkMode = inferDarkMode(token);
  const background = token.colorBgContainer
    ? token.colorBgContainer
    : darkMode
      ? DEFAULT_DARK_BACKGROUND
      : DEFAULT_LIGHT_BACKGROUND;
  const elevatedBackground =
    token.colorBgElevated || (darkMode ? '#1f1f1f' : '#fafafa');
  const textColor = token.colorText
    ? token.colorText
    : darkMode
      ? DEFAULT_DARK_TEXT_COLOR
      : DEFAULT_LIGHT_TEXT_COLOR;
  const secondaryTextColor = token.colorTextSecondary
    ? token.colorTextSecondary
    : darkMode
      ? DEFAULT_DARK_SECONDARY_TEXT_COLOR
      : DEFAULT_LIGHT_SECONDARY_TEXT_COLOR;
  const borderColor = token.colorBorder
    ? token.colorBorder
    : darkMode
      ? DEFAULT_DARK_BORDER_COLOR
      : DEFAULT_LIGHT_BORDER_COLOR;
  const primaryColor = token.colorPrimary || DEFAULT_PRIMARY_COLOR;
  const fontFamily = token.fontFamily || DEFAULT_FONT_FAMILY;

  const themeVariables: Record<string, string> = {
    primaryColor,
    primaryTextColor: textColor,
    primaryBorderColor: borderColor,
    lineColor: borderColor,
    mainBkg: background,
    secondBkg: elevatedBackground,
    tertiaryColor: elevatedBackground,
    background,
    textColor,
    fontFamily,
    clusterBkg: elevatedBackground,
    clusterBorder: borderColor,
    edgeLabelBackground: background,
    edgeLabelTextColor: secondaryTextColor,
    nodeBkg: background,
    nodeBorder: borderColor,
    defaultLinkColor: borderColor,
    titleColor: textColor,
    actorBkg: elevatedBackground,
    actorBorder: borderColor,
    actorTextColor: textColor,
    actorLineColor: borderColor,
    signalColor: secondaryTextColor,
    signalTextColor: textColor,
    labelBoxBkgColor: background,
    labelBoxBorderColor: borderColor,
    labelTextColor: textColor,
    loopTextColor: textColor,
    noteBkg: elevatedBackground,
    noteBorderColor: borderColor,
    noteTextColor: textColor,
    activationBorderColor: borderColor,
    activationBkgColor: elevatedBackground,
    sequenceNumberColor: textColor,
  };

  const cacheKey = [
    darkMode ? 'dark' : 'light',
    background,
    elevatedBackground,
    textColor,
    secondaryTextColor,
    borderColor,
    primaryColor,
    fontFamily,
  ].join('|');

  return {
    cacheKey,
    darkMode,
    themeVariables,
  };
};

export const applyMermaidTheme = (
  api: MermaidApi,
  themeConfig?: MermaidThemeConfig,
): void => {
  if (!api?.initialize) {
    return;
  }

  if (!themeConfig) {
    api.initialize({ startOnLoad: false });
    return;
  }

  api.initialize({
    startOnLoad: false,
    theme: 'base',
    darkMode: themeConfig.darkMode,
    themeVariables: themeConfig.themeVariables,
  });
};

/**
 * 加载 Mermaid 库
 * 使用单例模式确保只加载一次，并初始化配置
 */
export const loadMermaid = async (): Promise<MermaidApi> => {
  if (typeof window === 'undefined') {
    throw new Error('Mermaid 仅在浏览器环境中可用');
  }

  if (!mermaidLoader) {
    // 使用 webpack 魔法注释确保正确代码分割和解析
    // webpackChunkName 指定 chunk 名称，webpackMode 指定加载模式
    mermaidLoader = import(
      /* webpackChunkName: "mermaid" */
      /* webpackMode: "lazy" */
      'mermaid'
    )
      .then((module) => {
        const api = module.default;
        applyMermaidTheme(api);
        return api;
      })
      .catch((error) => {
        mermaidLoader = null;
        throw error;
      });
  }

  return mermaidLoader;
};

/**
 * 渲染 SVG 到容器
 */
export const renderSvgToContainer = (
  svg: string,
  container: HTMLDivElement,
): void => {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.setAttribute('data-mermaid-wrapper', 'true');
  wrapper.style.display = 'flex';
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
  const svgElement = svgDoc.querySelector('svg');

  if (svgElement) {
    const existingStyle = svgElement.getAttribute('style') || '';
    const newStyle =
      `${existingStyle}; max-width: 100%; height: auto; overflow: hidden;`.trim();
    svgElement.setAttribute('style', newStyle);
    svgElement.setAttribute('data-mermaid-svg', 'true');
    svgElement.setAttribute(
      'class',
      (svgElement.getAttribute('class') || '') + ' mermaid-isolated',
    );

    const allElements = svgElement.querySelectorAll('*');
    allElements.forEach((el) => {
      if (el instanceof SVGElement) {
        el.setAttribute('data-mermaid-internal', 'true');
      }
    });

    wrapper.appendChild(svgElement);
  } else {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = svg;
    const extractedSvg = tempDiv.querySelector('svg');
    if (extractedSvg) {
      extractedSvg.setAttribute(
        'style',
        'max-width: 100%; height: auto; overflow: hidden;',
      );
      extractedSvg.setAttribute('data-mermaid-svg', 'true');
      wrapper.appendChild(extractedSvg);
    } else {
      wrapper.innerHTML = svg;
    }
  }

  container.appendChild(wrapper);
};

/**
 * 清理 Mermaid 生成的临时元素
 */
export const cleanupTempElement = (id: string): void => {
  const tempElement = document.querySelector('#d' + id);
  if (tempElement) {
    tempElement.classList.add('hidden');
    try {
      if (tempElement.parentNode) {
        tempElement.parentNode.removeChild(tempElement);
      }
    } catch (e) {
      // 忽略移除失败
    }
  }
};
