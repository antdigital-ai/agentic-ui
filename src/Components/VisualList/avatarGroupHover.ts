const ITEM_SELECTOR = '[data-visual-list-item]';

export interface AvatarGroupHoverConfig {
  lift: number;
  scale: number;
  falloff: number;
  easeIn: string;
  easeOut: string;
}

export function readAvatarGroupHoverConfig(
  group: HTMLElement,
): AvatarGroupHoverConfig {
  const style = getComputedStyle(group);
  return {
    lift: parseFloat(style.getPropertyValue('--visual-list-avatar-lift')) || -4,
    scale:
      parseFloat(style.getPropertyValue('--visual-list-avatar-scale')) || 1.05,
    falloff:
      parseFloat(style.getPropertyValue('--visual-list-avatar-falloff')) ||
      0.45,
    easeIn:
      style.getPropertyValue('--visual-list-avatar-ease-in').trim() ||
      'cubic-bezier(0.22, 1, 0.36, 1)',
    easeOut:
      style.getPropertyValue('--visual-list-avatar-ease-out').trim() ||
      'cubic-bezier(0.34, 3.85, 0.64, 1)',
  };
}

function getGroupItems(group: HTMLElement): HTMLElement[] {
  return Array.from(group.querySelectorAll<HTMLElement>(ITEM_SELECTOR));
}

export function applyAvatarGroupHover(
  group: HTMLElement,
  activeIndex: number | null,
): void {
  const items = getGroupItems(group);
  if (items.length === 0) {
    return;
  }

  const { lift, scale, falloff, easeIn, easeOut } =
    readAvatarGroupHoverConfig(group);

  items.forEach((el, index) => {
    el.style.transitionTimingFunction =
      activeIndex === null ? easeOut : easeIn;

    if (activeIndex === null) {
      el.style.setProperty('--visual-list-shift', '0px');
      el.style.setProperty('--visual-list-scale-active', '1');
      return;
    }

    const distance = Math.abs(index - activeIndex);
    const shift = lift * falloff ** distance;
    el.style.setProperty('--visual-list-shift', `${shift.toFixed(3)}px`);
    el.style.setProperty(
      '--visual-list-scale-active',
      String(index === activeIndex ? scale : 1),
    );
  });
}
