import { describe, expect, it, vi } from 'vitest';
import {
  applyAvatarGroupHover,
  readAvatarGroupHoverConfig,
} from '../avatarGroupHover';

describe('avatarGroupHover 分支覆盖', () => {
  it('readAvatarGroupHoverConfig 使用 CSS 变量', () => {
    const group = document.createElement('div');
    group.style.setProperty('--visual-list-avatar-lift', '-8');
    group.style.setProperty('--visual-list-avatar-scale', '1.2');
    group.style.setProperty('--visual-list-avatar-falloff', '0.5');
    group.style.setProperty(
      '--visual-list-avatar-ease-in',
      'cubic-bezier(0,0,0,1)',
    );
    group.style.setProperty(
      '--visual-list-avatar-ease-out',
      'cubic-bezier(1,0,0,1)',
    );
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (name: string) => group.style.getPropertyValue(name),
    } as CSSStyleDeclaration);

    const cfg = readAvatarGroupHoverConfig(group);
    expect(cfg.lift).toBe(-8);
    expect(cfg.scale).toBe(1.2);
    expect(cfg.falloff).toBe(0.5);
    expect(cfg.easeIn).toContain('cubic-bezier');
  });

  it('readAvatarGroupHoverConfig 缺省回退', () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: () => '',
    } as CSSStyleDeclaration);
    const cfg = readAvatarGroupHoverConfig(document.createElement('div'));
    expect(cfg.lift).toBe(-4);
    expect(cfg.scale).toBe(1.05);
    expect(cfg.easeOut).toContain('cubic-bezier');
  });

  it('applyAvatarGroupHover 无 item 早退', () => {
    const group = document.createElement('div');
    expect(() => applyAvatarGroupHover(group, 0)).not.toThrow();
  });

  it('applyAvatarGroupHover activeIndex null 重置', () => {
    const group = document.createElement('div');
    const item = document.createElement('div');
    item.dataset.visualListItem = '1';
    group.appendChild(item);
    applyAvatarGroupHover(group, 1);
    applyAvatarGroupHover(group, null);
    expect(item.style.getPropertyValue('--visual-list-shift')).toBe('0px');
    expect(item.style.getPropertyValue('--visual-list-scale-active')).toBe('1');
  });

  it('applyAvatarGroupHover 激活项 scale 与邻近 shift', () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (prop: string) => {
        if (prop === '--visual-list-avatar-lift') return '-10';
        if (prop === '--visual-list-avatar-scale') return '1.1';
        if (prop === '--visual-list-avatar-falloff') return '0.5';
        return '';
      },
    } as CSSStyleDeclaration);

    const group = document.createElement('div');
    const items = [0, 1, 2].map(() => {
      const el = document.createElement('div');
      el.dataset.visualListItem = '1';
      group.appendChild(el);
      return el;
    });

    applyAvatarGroupHover(group, 1);
    expect(items[1].style.getPropertyValue('--visual-list-scale-active')).toBe(
      '1.1',
    );
    expect(items[0].style.getPropertyValue('--visual-list-shift')).not.toBe(
      '0px',
    );
    expect(items[2].style.getPropertyValue('--visual-list-shift')).not.toBe(
      '0px',
    );
  });
});
