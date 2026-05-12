import { genStyleHooks, resetComponent, type GenStyleFn } from '../../../../Hooks/useStyle';

const genStyle: GenStyleFn<'ToolBar'> = (token) => {
  return {
    [token.componentCls]: {
      borderTopLeftRadius: '0.5em',
      borderTopRightRadius: '0.5em',
      borderBottom: '1px solid rgb(229 231 235 / 0.8)',
      overflow: 'hidden',
      height: '42px',
      fontSize: '1.05em',
      color: 'rgb(107 114 128 / 80%)',
      backdropFilter: 'blur(8px)',
      boxSizing: 'border-box',
      backgroundColor: 'rgb(255 255 255)',
      padding: '6px 4px',
      '&-item': {
        display: 'flex',
        height: '32px',
        fontSize: '1.05em',
        borderRadius: '4px',
        lineHeight: '32px',
        padding: '0 6px',
        boxSizing: 'border-box',
        alignItems: 'center',
        gap: '2px',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: 'rgb(229 231 235 / 0.65)',
        },
      },
      '&-item--more': {
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
const useGenStyle = genStyleHooks('ToolBar', (token, info) => [
  resetComponent(token),
  genStyle(token, info),
]);

export function useStyle(prefixCls?: string) {
  // 与 ToolBar 组件内 `getPrefixCls('agentic-md-editor-toolbar')` 对齐
  const [wrapSSR, hashId] = useGenStyle(
    prefixCls ?? 'agentic-md-editor-toolbar',
  );
  return { wrapSSR, hashId };
}
