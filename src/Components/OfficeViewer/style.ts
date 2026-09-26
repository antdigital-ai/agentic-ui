import { genStyleHooks, type GenStyleFn } from '../../Hooks/useStyle';

const genStyle: GenStyleFn<'OfficeViewer'> = (token) => ({
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
      overflow: 'auto',
    },

    '&-status': {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: token.marginSM,
      padding: token.paddingMD,
      background: token.colorBgContainer,
      fontSize: token.fontSize,
      color: token.colorTextDescription,
      textAlign: 'center',
      zIndex: 1,
    },

    '&-error': {
      color: token.colorError,
      fontFamily: 'monospace',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      maxWidth: '100%',
      fontSize: token.fontSizeSM,
    },

    '&-hint': {
      color: token.colorTextSecondary,
      fontSize: token.fontSizeSM,
      maxWidth: 420,
      lineHeight: 1.6,
    },

    '&-code': {
      display: 'inline-block',
      padding: `${token.paddingXXS}px ${token.paddingXS}px`,
      marginTop: token.marginXS,
      background: token.colorFillTertiary,
      borderRadius: token.borderRadiusSM,
      fontFamily: 'monospace',
      fontSize: token.fontSizeSM,
      color: token.colorText,
    },
  },
});

const useGenStyle = genStyleHooks('OfficeViewer', genStyle);

export const useOfficeViewerStyle = (prefixCls: string) => {
  const [, hashId] = useGenStyle(prefixCls);
  return { hashId };
};
