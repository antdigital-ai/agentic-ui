import {
  genStyleHooks,
  resetComponent,
  type GenStyleFn,
} from '../../../../Hooks/useStyle';

const genStyle: GenStyleFn<'FloatBar'> = (token) => {
  return {
    [token.componentCls]: {
      position: 'absolute',
      zIndex: 121,
      border: '1px solid rgb(229 231 235 / 0.8)',
      overflow: 'hidden',
      height: '28px',
      borderRadius: '12px',
      backgroundColor: 'rgb(255 255 255)',
      fontSize: '1.05em',
      color: 'rgb(107 114 128 / 80%)',
      padding: '4px 0',
      userSelect: 'none',
      '&-item': {
        display: 'flex',
        height: '48px',
        alignItems: 'center',
        gap: '8px',
        borderRadius: '4px',
        lineHeight: '32px',
        fontSize: '1.05em',
        justifyContent: 'center',
        padding: '0 8px',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'rgb(229 231 235 / 0.65)',
        },
      },
      '&&-item--more': {
        color: '#1677ff',
      },
    },
  };
};

/**
 * BubbleChat
 * @param prefixCls
 * @returns
 */
const useGenStyle = genStyleHooks('FloatBar', (token, info) => [
  resetComponent(token),
  genStyle(token, info),
]);

export function useStyle(prefixCls?: string) {
  // 与 FloatBar 组件内 `getPrefixCls('agentic-md-editor-float-bar')` 对齐
  const [, hashId] = useGenStyle(prefixCls ?? 'agentic-md-editor-float-bar');
  return { hashId };
}
