import type { BubbleProps } from '../type';

/** Keep legacy fields available while giving documented short slots priority. */
export const normalizeBubbleStyles = (
  styles: BubbleProps['styles'],
): BubbleProps['styles'] => {
  if (!styles) return styles;
  if (!STYLE_SLOTS.some((key) => styles[key] !== undefined)) return styles;
  return {
    ...styles,
    bubbleStyle: styles.root ?? styles.bubbleStyle,
    bubbleAvatarTitleStyle: styles.avatarTitle ?? styles.bubbleAvatarTitleStyle,
    bubbleContainerStyle: styles.container ?? styles.bubbleContainerStyle,
    bubbleLoadingIconStyle: styles.loadingIcon ?? styles.bubbleLoadingIconStyle,
    bubbleNameStyle: styles.name ?? styles.bubbleNameStyle,
    bubbleListItemContentStyle:
      styles.content ?? styles.bubbleListItemContentStyle,
    bubbleListItemBeforeStyle:
      styles.before ?? styles.bubbleListItemBeforeStyle,
    bubbleListItemAfterStyle: styles.after ?? styles.bubbleListItemAfterStyle,
    bubbleListItemTitleStyle: styles.title ?? styles.bubbleListItemTitleStyle,
    bubbleListItemAvatarStyle:
      styles.avatar ?? styles.bubbleListItemAvatarStyle,
    bubbleListItemExtraStyle: styles.extra ?? styles.bubbleListItemExtraStyle,
  };
};

export const normalizeBubbleClassNames = (
  classNames: BubbleProps['classNames'],
): BubbleProps['classNames'] => {
  if (!classNames) return classNames;
  if (!STYLE_SLOTS.some((key) => classNames[key] !== undefined)) {
    return classNames;
  }
  return {
    ...classNames,
    bubbleClassName: classNames.root ?? classNames.bubbleClassName,
    bubbleAvatarTitleClassName:
      classNames.avatarTitle ?? classNames.bubbleAvatarTitleClassName,
    bubbleContainerClassName:
      classNames.container ?? classNames.bubbleContainerClassName,
    bubbleLoadingIconClassName:
      classNames.loadingIcon ?? classNames.bubbleLoadingIconClassName,
    bubbleNameClassName: classNames.name ?? classNames.bubbleNameClassName,
    bubbleListItemContentClassName:
      classNames.content ?? classNames.bubbleListItemContentClassName,
    bubbleListItemBeforeClassName:
      classNames.before ?? classNames.bubbleListItemBeforeClassName,
    bubbleListItemAfterClassName:
      classNames.after ?? classNames.bubbleListItemAfterClassName,
    bubbleListItemTitleClassName:
      classNames.title ?? classNames.bubbleListItemTitleClassName,
    bubbleListItemAvatarClassName:
      classNames.avatar ?? classNames.bubbleListItemAvatarClassName,
    bubbleListItemExtraClassName:
      classNames.extra ?? classNames.bubbleListItemExtraClassName,
  };
};

const STYLE_SLOTS = [
  'root',
  'avatarTitle',
  'container',
  'loadingIcon',
  'name',
  'content',
  'before',
  'after',
  'title',
  'avatar',
  'extra',
] as const;
