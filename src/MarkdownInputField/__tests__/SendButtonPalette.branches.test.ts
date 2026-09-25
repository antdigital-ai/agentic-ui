/**
 * sendButtonPalette 分支覆盖：颜色解析、叠色、对比度循环与 resolve 合并路径。
 */
import { describe, expect, it } from 'vitest';
import {
  getSendButtonPalette,
  resolveSendButtonDisplayColors,
} from '../SendButton/sendButtonPalette';

const lightToken = {
  colorPrimary: '#1677ff',
  colorBgContainer: '#ffffff',
  colorTextLightSolid: '#ffffff',
  colorTextTertiary: 'rgba(0,0,0,0.45)',
  colorFillTertiary: 'rgba(0,0,0,0.04)',
};

describe('sendButtonPalette 分支覆盖', () => {
  it('getSendButtonPalette：低对比度 token 触发 fill/icon 调优循环', () => {
    const lowContrast = {
      colorPrimary: '#fafafa',
      colorBgContainer: '#ffffff',
      colorTextLightSolid: '#ffffff',
      colorTextTertiary: '#fefefe',
      colorFillTertiary: '#fefefe',
    };
    const p = getSendButtonPalette(lowContrast);
    expect(p.backgroundActive).toBe('#fafafa');
    expect(p.backgroundMuted).toMatch(/^rgb\(/);
    expect(p.iconMuted).toMatch(/^rgb\(/);
  });

  it('getSendButtonPalette：colorTextLightSolid 缺失时使用默认白', () => {
    const { colorTextLightSolid: _, ...withoutSolid } = lightToken;
    const p = getSendButtonPalette(withoutSolid as typeof lightToken);
    expect(p.iconActive).toBe('#ffffff');
  });

  it('getSendButtonPalette：支持 #rgb 短 hex、#rrggbb、rgb() 与 #rrggbbaa', () => {
    const token = {
      colorPrimary: '#abc',
      colorBgContainer: '#112233',
      colorTextLightSolid: 'rgb(255, 255, 255)',
      colorTextTertiary: 'rgba(255, 255, 255, 0.45)',
      colorFillTertiary: '#112233aa',
    };
    const p = getSendButtonPalette(token);
    expect(p.backgroundActive).toBe('#abc');
    expect(p.backgroundMuted).toMatch(/^rgb\(/);
  });

  it('getSendButtonPalette：rgba alpha=1 走不透明分支', () => {
    const token = {
      ...lightToken,
      colorFillTertiary: 'rgba(0, 0, 0, 1)',
      colorTextTertiary: 'rgba(0, 0, 0, 1)',
    };
    const p = getSendButtonPalette(token);
    expect(p.iconMuted).toMatch(/^rgb\(/);
  });

  it('resolveSendButtonDisplayColors：colors 为 undefined 时原样返回 basePalette', () => {
    const base = getSendButtonPalette(lightToken);
    expect(resolveSendButtonDisplayColors(base, undefined, lightToken)).toBe(
      base,
    );
  });

  it('resolveSendButtonDisplayColors：仅 background 时 backgroundActive 取 background 并调优 muted', () => {
    const base = getSendButtonPalette(lightToken);
    const resolved = resolveSendButtonDisplayColors(
      base,
      { background: '#e6f4ff' },
      lightToken,
    );
    expect(resolved.backgroundActive).toBe('#e6f4ff');
    expect(resolved.backgroundMuted).toMatch(/^rgb\(/);
    expect(resolved.backgroundMuted).not.toBe('#e6f4ff');
  });

  it('resolveSendButtonDisplayColors：仅 icon 时 iconActive 取 icon 并调优 muted', () => {
    const base = getSendButtonPalette(lightToken);
    const resolved = resolveSendButtonDisplayColors(
      base,
      { icon: '#0958d9' },
      lightToken,
    );
    expect(resolved.iconActive).toBe('#0958d9');
    expect(resolved.iconMuted).toMatch(/^rgb\(/);
  });

  it('resolveSendButtonDisplayColors：backgroundHover/iconHover 优先于 background/icon', () => {
    const base = getSendButtonPalette(lightToken);
    const resolved = resolveSendButtonDisplayColors(
      base,
      {
        background: '#eeeeee',
        backgroundHover: '#003eb3',
        icon: '#888888',
        iconHover: '#fafafa',
      },
      lightToken,
    );
    expect(resolved.backgroundActive).toBe('#003eb3');
    expect(resolved.iconActive).toBe('#fafafa');
  });

  it('resolveSendButtonDisplayColors：低对比度自定义色触发 tune 循环', () => {
    const base = getSendButtonPalette(lightToken);
    const resolved = resolveSendButtonDisplayColors(
      base,
      {
        background: '#ffffff',
        icon: '#fefefe',
      },
      lightToken,
    );
    expect(resolved.backgroundMuted).toMatch(/^rgb\(/);
    expect(resolved.iconMuted).toMatch(/^rgb\(/);
  });

  it('mixSrgb 在无效背景色时回退原色（通过无效 colorBgContainer）', () => {
    const badToken = {
      ...lightToken,
      colorBgContainer: 'not-a-color',
    };
    const p = getSendButtonPalette(badToken);
    expect(p.backgroundMuted).toBeTruthy();
    expect(p.iconMuted).toBeTruthy();
  });

  it('非法前景色与 hsl 字符串：contrast/mix 回退臂', () => {
    const weird = {
      colorPrimary: 'hsl(200, 50%, 40%)',
      colorBgContainer: '#ffffff',
      colorTextLightSolid: '',
      colorTextTertiary: 'not-a-color',
      colorFillTertiary: 'also-bad',
    };
    const p = getSendButtonPalette(weird);
    expect(p.iconActive).toBe('#ffffff');
    expect(p.backgroundActive).toBe('hsl(200, 50%, 40%)');

    const base = getSendButtonPalette(lightToken);
    const resolved = resolveSendButtonDisplayColors(
      base,
      { background: 'nope', icon: 'nope' },
      { ...lightToken, colorBgContainer: 'bad' },
    );
    expect(resolved.backgroundMuted).toBeTruthy();
    expect(resolved.iconMuted).toBeTruthy();
  });

  it('resolve：仅 backgroundHover / 仅 iconHover 不调优 muted', () => {
    const base = getSendButtonPalette(lightToken);
    const resolved = resolveSendButtonDisplayColors(
      base,
      { backgroundHover: '#111111', iconHover: '#eeeeee' },
      lightToken,
    );
    expect(resolved.backgroundActive).toBe('#111111');
    expect(resolved.iconActive).toBe('#eeeeee');
    expect(resolved.backgroundMuted).toBe(base.backgroundMuted);
    expect(resolved.iconMuted).toBe(base.iconMuted);
  });
});
