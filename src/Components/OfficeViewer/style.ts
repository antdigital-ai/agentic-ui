import { genStyleHooks, type GenStyleFn } from '../../Hooks/useStyle';

/** 侧栏宽度 = 卡片宽 + 左右内边距 */
const RAIL_WIDTH = 152;
const RAIL_ITEM_GAP = 12;

const genStyle: GenStyleFn<'OfficeViewer'> = (token) => ({
  [token.componentCls]: {
    position: 'relative',
    display: 'flex',
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: token.borderRadius,
    border: `1px solid ${token.colorBorderSecondary}`,
    background: token.colorBgLayout,
    overflow: 'hidden',

    '&-rail': {
      flexShrink: 0,
      width: RAIL_WIDTH,
      height: '100%',
      overflow: 'auto',
      padding: token.paddingSM,
      background: token.colorBgLayout,
      borderInlineEnd: `1px solid ${token.colorBorderSecondary}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: RAIL_ITEM_GAP,
    },

    // 每个 slide 一张白色卡片，由 hook 直接插入（包裹 div + canvas + 页码）
    '&-rail-card': {
      width: '100%',
      background: token.colorBgContainer,
      borderRadius: token.borderRadiusLG,
      border: `1px solid ${token.colorBorderSecondary}`,
      boxShadow: token.boxShadowTertiary,
      overflow: 'hidden',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    },

    '&-rail-card-active': {
      borderColor: token.colorPrimary,
      boxShadow: `0 0 0 2px ${token.colorPrimaryBorder}`,
    },

    '&-rail-canvas': {
      width: '100%',
      display: 'block',
    },

    '&-host': {
      flex: 1,
      minWidth: 0,
      height: '100%',
      overflow: 'auto',
      background: token.colorBgContainer,
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
