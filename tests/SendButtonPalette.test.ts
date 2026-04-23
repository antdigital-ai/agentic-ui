import { describe, expect, it } from 'vitest';
import {
  getSendButtonPalette,
  resolveSendButtonDisplayColors,
} from '../src/MarkdownInputField/SendButton/sendButtonPalette';

const lightToken = {
  colorPrimary: '#1677ff',
  colorBgContainer: '#ffffff',
  colorTextLightSolid: '#ffffff',
  colorTextTertiary: 'rgba(0,0,0,0.45)',
  colorFillTertiary: 'rgba(0,0,0,0.04)',
};

const darkToken = {
  colorPrimary: '#1668dc',
  colorBgContainer: '#141414',
  colorTextLightSolid: '#ffffff',
  colorTextTertiary: 'rgba(255,255,255,0.45)',
  colorFillTertiary: 'rgba(255,255,255,0.12)',
};

describe('getSendButtonPalette', () => {
  it('returns opaque hex/rgb fills for light container', () => {
    const p = getSendButtonPalette(lightToken);
    expect(p.backgroundActive).toBe('#1677ff');
    expect(p.iconActive).toBe('#ffffff');
    expect(p.backgroundMuted).toMatch(/^rgb\(/);
    expect(p.iconMuted).toMatch(/^rgb\(/);
    expect(p.backgroundMuted).not.toContain('rgba(0,0,0,0.04)');
  });

  it('returns distinct muted colors for dark container', () => {
    const p = getSendButtonPalette(darkToken);
    expect(p.backgroundActive).toBe('#1668dc');
    expect(p.iconActive).toBe('#ffffff');
    expect(p.backgroundMuted).not.toBe(p.backgroundActive);
    expect(p.iconMuted).not.toBe(p.iconActive);
  });
});

describe('resolveSendButtonDisplayColors', () => {
  it('uses custom active colors and tunes muted from custom background/icon', () => {
    const base = getSendButtonPalette(lightToken);
    const resolved = resolveSendButtonDisplayColors(
      base,
      {
        background: '#e6f4ff',
        backgroundHover: '#0958d9',
        icon: '#0958d9',
        iconHover: '#ffffff',
      },
      {
        ...lightToken,
        colorPrimary: lightToken.colorPrimary,
        colorBgContainer: lightToken.colorBgContainer,
        colorTextLightSolid: lightToken.colorTextLightSolid,
        colorTextTertiary: lightToken.colorTextTertiary,
        colorFillTertiary: lightToken.colorFillTertiary,
      },
    );
    expect(resolved.backgroundActive).toBe('#0958d9');
    expect(resolved.iconActive).toBe('#ffffff');
    expect(resolved.backgroundMuted).toMatch(/^rgb\(/);
    expect(resolved.iconMuted).toMatch(/^rgb\(/);
  });
});
