/**
 * sendButtonPalette deepen：parseOpaqueRgb 的 rgb() 臂。
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getSendButtonPalette } from '../sendButtonPalette';

describe('sendButtonPalette deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('token 使用 rgb() 不透明色时仍生成色板', () => {
    const palette = getSendButtonPalette({
      colorPrimary: 'rgb(22, 119, 255)',
      colorBgContainer: 'rgb(255, 255, 255)',
      colorTextLightSolid: 'rgb(255, 255, 255)',
      colorTextTertiary: 'rgb(140, 140, 140)',
      colorFillTertiary: 'rgb(245, 245, 245)',
    });
    expect(palette.backgroundActive).toBe('rgb(22, 119, 255)');
    expect(palette.iconActive).toBe('rgb(255, 255, 255)');
    expect(palette.backgroundMuted).toMatch(/^rgb\(/);
  });
});
