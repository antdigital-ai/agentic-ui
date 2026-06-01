/**
 * 发送按钮默认色板：用 Ant Design token 的实色保证相对 colorBgContainer 的对比度，
 * 随亮色 / 暗色主题切换。半透明 token 先与 colorBgContainer 叠算再比对比度、再混合。
 */

export interface SendButtonPaletteToken {
  colorPrimary: string;
  colorBgContainer: string;
  colorTextLightSolid: string;
  colorTextTertiary: string;
  colorFillTertiary: string;
  colorText?: string;
}

const SHORT_HEX = /^#([0-9a-f]{3})$/i;
const LONG_HEX6 = /^#([0-9a-f]{6})$/i;
const LONG_HEX8 = /^#([0-9a-f]{8})$/i;
const RGBA =
  /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*[,/]\s*([\d.]+))?\s*\)/i;

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

type Rgb = { r: number; g: number; b: number };

const compositeOn = (
  fr: number,
  fg: number,
  fb: number,
  a: number,
  br: number,
  bg: number,
  bb: number,
): Rgb => {
  const u = clamp(a, 0, 1);
  return {
    r: Math.round(fr * u + br * (1 - u)),
    g: Math.round(fg * u + bg * (1 - u)),
    b: Math.round(fb * u + bb * (1 - u)),
  };
};

/**
 * 不透明色：#rgb #rrggbb、rgb(,,) 无 alpha
 */
const parseOpaqueRgb = (color: string): Rgb | null => {
  const t = color.trim();
  const shortM = t.match(SHORT_HEX);
  if (shortM) {
    const [a, b, c] = shortM[1].split('');
    return {
      r: parseInt(a + a, 16),
      g: parseInt(b + b, 16),
      b: parseInt(c + c, 16),
    };
  }
  const long6 = t.match(LONG_HEX6);
  if (long6) {
    return {
      r: parseInt(long6[1].slice(0, 2), 16),
      g: parseInt(long6[1].slice(2, 4), 16),
      b: parseInt(long6[1].slice(4, 6), 16),
    };
  }
  const m = t.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/i);
  if (m) {
    return { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) };
  }
  return null;
};

/**
 * 任意色值在 `onBackground` 上呈现的有效 sRGB（含 rgba / 8 位 hex 叠色）
 */
const toRgbOnBackground = (color: string, onBackground: string): Rgb | null => {
  const t = color.trim();
  const bg = parseOpaqueRgb(onBackground);
  if (!bg) {
    return null;
  }
  const long8 = t.match(LONG_HEX8);
  if (long8) {
    const r = parseInt(long8[1].slice(0, 2), 16);
    const g = parseInt(long8[1].slice(2, 4), 16);
    const b = parseInt(long8[1].slice(4, 6), 16);
    const a = parseInt(long8[1].slice(6, 8), 16) / 255;
    return compositeOn(r, g, b, a, bg.r, bg.g, bg.b);
  }
  const rgbaM = t.match(RGBA);
  if (rgbaM) {
    const r = Number(rgbaM[1]);
    const g = Number(rgbaM[2]);
    const b = Number(rgbaM[3]);
    const a = rgbaM[4] === undefined ? 1 : Number(rgbaM[4]);
    if (a >= 1 - 1e-6) {
      return { r, g, b };
    }
    return compositeOn(r, g, b, a, bg.r, bg.g, bg.b);
  }
  return parseOpaqueRgb(t);
};

const toRgbString = (rgb: Rgb) => `rgb(${rgb.r},${rgb.g},${rgb.b})`;

const relativeLuminance = (r: number, g: number, b: number) => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

const contrastRatio = (c1: string, c2: string): number | null => {
  const a = toRgbOnBackground(c1, c2);
  const b = toRgbOnBackground(c2, c2);
  if (!a || !b) {
    return null;
  }
  const l1 = relativeLuminance(a.r, a.g, a.b);
  const l2 = relativeLuminance(b.r, b.g, b.b);
  const L1 = Math.max(l1, l2);
  const L2 = Math.min(l1, l2);
  return (L1 + 0.05) / (L2 + 0.05);
};

/**
 * 线性 sRGB 混合两色（先相对 `mixBase` 还原为实色），输出不透明 rgb()
 */
const mixSrgb = (
  fg: string,
  bg: string,
  t: number,
  mixBase: string,
): string => {
  const a = toRgbOnBackground(fg, mixBase);
  const b = toRgbOnBackground(bg, mixBase);
  if (!a || !b) {
    return fg;
  }
  const u = clamp(t, 0, 1);
  const m = (x: number, y: number) => Math.round(x * u + y * (1 - u));
  return toRgbString({
    r: m(a.r, b.r),
    g: m(a.g, b.g),
    b: m(a.b, b.b),
  });
};

const MIN_MUTED_ICON_CONTRAST = 2.4;
const MIN_MUTED_FILL_CONTRAST = 1.4;

const DEFAULT_LIGHT_SOLID = '#ffffff';

/**
 * 基于当前主题 token 生成默认可发送 / 未激活填充与图标色
 */
export function getSendButtonPalette(token: SendButtonPaletteToken) {
  const { colorBgContainer, colorPrimary, colorTextLightSolid } = token;
  const textTertiary = token.colorTextTertiary;
  const fillTertiary = token.colorFillTertiary;

  const lightSolid = colorTextLightSolid || DEFAULT_LIGHT_SOLID;

  let fillMuted: string = fillTertiary;
  let cFill = contrastRatio(fillMuted, colorBgContainer);
  for (
    let i = 0;
    i < 6 && cFill !== null && cFill < MIN_MUTED_FILL_CONTRAST;
    i += 1
  ) {
    fillMuted = mixSrgb(
      colorPrimary,
      colorBgContainer,
      0.1 + i * 0.06,
      colorBgContainer,
    );
    cFill = contrastRatio(fillMuted, colorBgContainer);
  }
  if (cFill === null) {
    fillMuted = mixSrgb(colorPrimary, colorBgContainer, 0.1, colorBgContainer);
  }

  let iconMuted: string = textTertiary;
  let cIcon = contrastRatio(iconMuted, colorBgContainer);
  for (
    let j = 0;
    j < 6 && cIcon !== null && cIcon < MIN_MUTED_ICON_CONTRAST;
    j += 1
  ) {
    const mixT = 0.55 - j * 0.08;
    iconMuted = mixSrgb(
      colorPrimary,
      colorBgContainer,
      Math.max(0, mixT),
      colorBgContainer,
    );
    cIcon = contrastRatio(iconMuted, colorBgContainer);
  }
  if (cIcon === null) {
    iconMuted = mixSrgb(colorPrimary, colorBgContainer, 0.45, colorBgContainer);
  }

  const fillFinal = toRgbOnBackground(fillMuted, colorBgContainer);
  const iconFinal = toRgbOnBackground(iconMuted, colorBgContainer);

  return {
    backgroundActive: colorPrimary,
    backgroundMuted: fillFinal ? toRgbString(fillFinal) : fillMuted,
    iconActive: lightSolid,
    iconMuted: iconFinal ? toRgbString(iconFinal) : iconMuted,
  } as const;
}

export type SendButtonResolvedColors = {
  backgroundActive: string;
  backgroundMuted: string;
  iconActive: string;
  iconMuted: string;
};

const tuneFillTowardContainer = (
  source: string,
  colorBgContainer: string,
  hintPrimary: string,
) => {
  let fill = mixSrgb(source, colorBgContainer, 0.1, colorBgContainer);
  let c = contrastRatio(fill, colorBgContainer);
  for (let i = 0; i < 6 && c !== null && c < MIN_MUTED_FILL_CONTRAST; i += 1) {
    fill = mixSrgb(
      i % 2 === 0 ? hintPrimary : source,
      colorBgContainer,
      0.12 + i * 0.05,
      colorBgContainer,
    );
    c = contrastRatio(fill, colorBgContainer);
  }
  const rgb = toRgbOnBackground(fill, colorBgContainer);
  return rgb ? toRgbString(rgb) : fill;
};

const tuneIconTowardContainer = (
  source: string,
  colorBgContainer: string,
  hintPrimary: string,
) => {
  let icon = mixSrgb(source, colorBgContainer, 0.4, colorBgContainer);
  let c = contrastRatio(icon, colorBgContainer);
  for (let j = 0; j < 6 && c !== null && c < MIN_MUTED_ICON_CONTRAST; j += 1) {
    icon = mixSrgb(
      j % 2 === 0 ? hintPrimary : source,
      colorBgContainer,
      0.5 - j * 0.07,
      colorBgContainer,
    );
    c = contrastRatio(icon, colorBgContainer);
  }
  const rgb = toRgbOnBackground(icon, colorBgContainer);
  return rgb ? toRgbString(rgb) : icon;
};

/**
 * 合并默认色板与用户 `colors`；与原先 background/backgroundHover、icon/iconHover 语义一致
 */
export function resolveSendButtonDisplayColors(
  basePalette: SendButtonResolvedColors,
  colors:
    | {
        icon?: string;
        iconHover?: string;
        background?: string;
        backgroundHover?: string;
      }
    | undefined,
  token: SendButtonPaletteToken,
): SendButtonResolvedColors {
  if (!colors) {
    return basePalette;
  }

  const { colorBgContainer, colorPrimary } = token;

  const backgroundActive =
    colors.backgroundHover ?? colors.background ?? basePalette.backgroundActive;
  const iconActive = colors.iconHover ?? colors.icon ?? basePalette.iconActive;

  return {
    backgroundActive,
    backgroundMuted: colors.background
      ? tuneFillTowardContainer(
          colors.background,
          colorBgContainer,
          colorPrimary,
        )
      : basePalette.backgroundMuted,
    iconActive,
    iconMuted: colors.icon
      ? tuneIconTowardContainer(colors.icon, colorBgContainer, colorPrimary)
      : basePalette.iconMuted,
  };
}
