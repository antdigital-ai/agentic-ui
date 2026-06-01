import {
  genStyleHooks,
  resetComponent,
  type GenStyleFn,
} from '../../Hooks/useStyle';

const genStyle: GenStyleFn<'BubbleDocInfo'> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      gap: 4,
      flexWrap: 'wrap',
      flexDirection: 'column',
      padding: '4px 20px 4px',
      '&&-compact': {
        padding: '4px 12px 4px',
      },
      '&-label': {
        display: 'flex',
        color: 'rgba(0,0,0,0.85)',
        fontSize: '1em',
        width: '100%',
        gap: 4,
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      '&-list': {
        alignItems: 'center',
        flexDirection: 'column',
        borderRadius: 16,
        display: 'flex',
        flexWrap: 'nowrap',
        gap: 4,
        padding: '0px',
        overflow: 'hidden',
        // 列表入场淡入（替代 framer-motion variants 的 opacity 动画）
        animationName: `${token.componentCls}-listFadeIn`,
        animationDuration: '0.3s',
        animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        animationFillMode: 'both',
        '&-item': {
          display: 'flex',
          gap: 4,
          borderRadius: 8,
          padding: '2px 8px',
          fontSize: 12,
          lineHeight: '14px',
          width: '100%',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'rgba(0,0,0,0.65)',
          // 每项入场淡入，由 inline style 通过 --doc-item-delay 注入
          // 替代 framer-motion 父级 staggerChildren 的效果
          opacity: 0,
          animationName: `${token.componentCls}-listItemFadeIn`,
          animationDuration: '0.25s',
          animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          animationDelay: 'var(--doc-item-delay, 0s)',
          animationFillMode: 'forwards',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.02)',
          },
          '&-title': {
            display: 'flex',
            maxWidth: '100%',
            gap: 4,
            width: '100%',
          },
          '&-icon': {
            borderRadius: 4,
            width: 16,
            height: 16,
          },
        },
      },

      [`@keyframes ${token.componentCls}-listFadeIn`]: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
      [`@keyframes ${token.componentCls}-listItemFadeIn`]: {
        from: { opacity: 0 },
        to: { opacity: 1 },
      },
    },
  };
};

/**
 * Probubble
 * @param prefixCls
 * @returns
 */
const useGenStyle = genStyleHooks('BubbleDocInfo', (token, info) => [
  resetComponent(token),
  genStyle(token, info),
]);

export function useStyle(prefixCls?: string) {
  const [, hashId] = useGenStyle(prefixCls ?? 'DocInfo');
  return { hashId };
}
