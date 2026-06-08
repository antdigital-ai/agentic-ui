import { describe, expect, it } from 'vitest';
import {
  applyAvatarGroupHover,
  readAvatarGroupHoverConfig,
} from '../avatarGroupHover';

function createGroup(): HTMLUListElement {
  const ul = document.createElement('ul');
  ul.style.setProperty('--visual-list-avatar-lift', '-4');
  ul.style.setProperty('--visual-list-avatar-scale', '1.05');
  ul.style.setProperty('--visual-list-avatar-falloff', '0.45');
  ul.style.setProperty('--visual-list-avatar-ease-in', 'ease-in-test');
  ul.style.setProperty('--visual-list-avatar-ease-out', 'ease-out-test');

  for (let i = 0; i < 3; i += 1) {
    const li = document.createElement('li');
    li.setAttribute('data-visual-list-item', '');
    ul.appendChild(li);
  }

  document.body.appendChild(ul);
  return ul;
}

describe('avatarGroupHover', () => {
  it('reads hover config from group CSS variables', () => {
    const group = createGroup();
    const config = readAvatarGroupHoverConfig(group);
    expect(config.lift).toBe(-4);
    expect(config.scale).toBe(1.05);
    expect(config.falloff).toBe(0.45);
    expect(config.easeIn).toBe('ease-in-test');
    expect(config.easeOut).toBe('ease-out-test');
    group.remove();
  });

  it('applies falloff shift and active scale on hover', () => {
    const group = createGroup();
    const items = group.querySelectorAll('[data-visual-list-item]');

    applyAvatarGroupHover(group, 1);

    expect(items[0].style.getPropertyValue('--visual-list-shift')).toBe(
      '-1.800px',
    );
    expect(items[1].style.getPropertyValue('--visual-list-shift')).toBe(
      '-4.000px',
    );
    expect(items[2].style.getPropertyValue('--visual-list-shift')).toBe(
      '-1.800px',
    );
    expect(
      items[1].style.getPropertyValue('--visual-list-scale-active'),
    ).toBe('1.05');
    expect(
      items[0].style.getPropertyValue('--visual-list-scale-active'),
    ).toBe('1');
    group.remove();
  });

  it('resets variables on mouse leave', () => {
    const group = createGroup();
    const item = group.querySelector('[data-visual-list-item]') as HTMLElement;

    applyAvatarGroupHover(group, 0);
    applyAvatarGroupHover(group, null);

    expect(item.style.getPropertyValue('--visual-list-shift')).toBe('0px');
    expect(item.style.getPropertyValue('--visual-list-scale-active')).toBe(
      '1',
    );
    expect(item.style.transitionTimingFunction).toBe('ease-out-test');
    group.remove();
  });
});
