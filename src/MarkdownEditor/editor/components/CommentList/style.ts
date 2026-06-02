import { genStyleHooks, type GenStyleFn } from '../../../../Hooks/useStyle';
const genStyle: GenStyleFn<'CommentList'> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      right: 0,
      top: 0,
      width: 300,
      padding: 16,
      paddingRight: 24,
      boxSizing: 'border-box',
      gap: 8,
      borderLeft: '1px solid rgba(0,0,0,0.04)',
      maxWidth: '300px',
      backgroundColor: 'var(--color-gray-bg-card-white)',
      height: '100vh',
      // 列表整体入场：从右侧 100% 滑入并淡入
      // 替代 framer-motion 的 `initial={translateX(100%)} animate={translateX(0)}`
      animationName: `${token.componentCls}-slideInRight`,
      animationDuration: '0.3s',
      animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      animationFillMode: 'both',
      '&-item': {
        padding: '12px',
        border: '1px solid rgba(0,0,0,0.04)',
        borderRadius: 8,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        // 单条入场：从下方 50px 上滑并淡入；
        // stagger 延迟通过 inline `--comment-item-delay` 注入，
        // 替代 framer-motion 父级 `staggerChildren: 0.07, delayChildren: 0.2`。
        opacity: 0,
        animationName: `${token.componentCls}-slideInUp`,
        animationDuration: '0.3s',
        animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        animationDelay: 'var(--comment-item-delay, 0s)',
        animationFillMode: 'forwards',
        transition: 'transform 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          backgroundColor: 'var(--color-gray-bg-page-light)',
          // 替代 framer-motion 的 `whileHover={{scale: 1.04}}`
          transform: 'scale(1.04)',
        },
        '&-header': {
          display: 'flex',
          gap: 8,
          justifyContent: 'space-between',
          '&-title': {
            display: 'flex',
            gap: 8,
            flex: 1,
            alignItems: 'flex-end',
          },
          '&-name': {
            display: 'flex',
            gap: 4,
            alignItems: 'center',
          },
          '&-time': {
            color: 'var(--color-gray-text-disabled)',
            fontSize: '12px',
          },
          '&-action': {
            display: 'flex',
            gap: 8,
            '& &-item': {
              cursor: 'pointer',
              '&:hover': {
                color: token.colorPrimary,
              },
            },
          },
        },
      },

      [`@keyframes ${token.componentCls}-slideInRight`]: {
        from: { transform: 'translateX(100%)', opacity: 0 },
        to: { transform: 'translateX(0)', opacity: 1 },
      },
      [`@keyframes ${token.componentCls}-slideInUp`]: {
        from: { transform: 'translateY(50px)', opacity: 0 },
        to: { transform: 'translateY(0)', opacity: 1 },
      },
    },
  };
};

/**
 * BubbleChat
 * @param prefixCls
 * @returns
 */
const useGenStyle = genStyleHooks('CommentList', genStyle);

export function useStyle(prefixCls?: string) {
  const [, hashId] = useGenStyle(prefixCls ?? 'editor-content-column');
  return { hashId };
}
