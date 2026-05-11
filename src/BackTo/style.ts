import { genStyleHooks, type GenStyleFn } from '../Hooks/useStyle';

const genStyle: GenStyleFn<'BackTo'> = (token) => {
  return {
    [token.componentCls]: {
      // position:relative，在流内正常占位，由父容器负责整体定位。
      // 不使用 position:fixed，避免脱离文档流导致隐藏时 presence 高度塌陷。
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: 32,
      height: 32,
      color: 'var(--color-gray-text-secondary)',
      fontSize: 16,
      background: 'var(--color-gray-bg-card-white)',
      border: 'none',
      boxShadow: 'var(--shadow-control-base)',
      borderRadius: '50%',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',

      ['&-content']: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        overflow: 'hidden',
      },

      ['&:hover']: {
        boxShadow: 'var(--shadow-control-lg)',
      },

      ['&:active']: {
        boxShadow: 'var(--shadow-control-base)',
        transform: 'scale(0.95)',
      },
    },

    // presence wrapper：始终保留在 DOM 中，固定 32×32 尺寸以保持占位空间。
    // 仅通过 opacity + pointer-events 切换显隐，隐藏时内部按钮不可交互但占位不变。
    [`${token.componentCls}-presence`]: {
      width: 32,
      height: 32,
      flexShrink: 0,
      transition: 'opacity 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
      '&[data-state="enter"]': {
        opacity: 1,
      },
      '&[data-state="exit"]': {
        opacity: 0,
        pointerEvents: 'none',
      },
    },
  };
};

export const prefixCls = 'back-to';

const useGenStyle = genStyleHooks('BackTo', genStyle);

export function useStyle(prefixCls?: string) {
  const [wrapSSR, hashId] = useGenStyle(prefixCls ?? 'back-to');
  return { wrapSSR, hashId };
}
