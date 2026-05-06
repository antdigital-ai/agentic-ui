import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      position: 'fixed',
      bottom: 48,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: 32,
      height: 32,
      insetInlineEnd: 24,
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

    // presence wrapper：始终挂载在 DOM（通过 position:fixed 完全脱离文档流），
    // 只用 opacity + pointer-events 切换显隐，避免挂载/卸载导致文档流重排跳动。
    // inset:0 配合子元素的 position:fixed 不影响定位；wrapper 本身零尺寸不占空间。
    [`${token.componentCls}-presence`]: {
      position: 'fixed',
      // 零宽高使 wrapper 本身不占视口任何空间，子按钮用独立 fixed 坐标定位
      width: 0,
      height: 0,
      overflow: 'visible',
      // 优先级足够高，确保在其他 fixed 元素上层
      zIndex: 1000,
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

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('back-to', (token) => {
    const backToToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };
    return [genStyle(backToToken)];
  });
}
