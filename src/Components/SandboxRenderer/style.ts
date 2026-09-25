import { genStyleHooks, type GenStyleFn } from '../../Hooks/useStyle';

const genStyle: GenStyleFn<'SandboxRenderer'> = (token) => ({
  [token.componentCls]: {
    position: 'relative',
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: token.borderRadius,
    border: `1px solid ${token.colorBorderSecondary}`,
    background: token.colorBgContainer,
    overflow: 'hidden',

    '&-host': {
      width: '100%',
      height: '100%',
    },

    '&-status': {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: token.marginXXS,
      padding: token.paddingSM,
      background: token.colorBgContainer,
      fontSize: token.fontSizeSM,
      color: token.colorTextDescription,
    },

    '&-error': {
      color: token.colorError,
      fontFamily: 'monospace',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
      textAlign: 'center',
      maxWidth: '100%',
    },
  },
});

const useGenStyle = genStyleHooks('SandboxRenderer', genStyle);

export const useSandboxRendererStyle = (prefixCls: string) => {
  const [, hashId] = useGenStyle(prefixCls);
  return { hashId };
};
