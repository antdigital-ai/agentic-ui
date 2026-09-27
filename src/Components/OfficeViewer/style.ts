import { genStyleHooks, type GenStyleFn } from '../../Hooks/useStyle';

/** 侧栏宽度 = 卡片宽 + 左右内边距 */
const RAIL_WIDTH = 152;
const RAIL_ITEM_GAP = 12;

/** 预览区域内边距 */
const HOST_PADDING = 8;

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
      transition: 'width 0.25s ease, padding 0.25s ease',

      '&-collapsed': {
        width: 0,
        paddingInline: 0,
        borderInlineEnd: 'none',
        overflow: 'hidden',
      },
    },

    // 侧栏展开/收起手柄（骑在分界线上）
    '&-rail-toggle': {
      flexShrink: 0,
      width: 16,
      height: 48,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      padding: 0,
      border: `1px solid ${token.colorBorderSecondary}`,
      borderInlineStart: 'none',
      borderRadius: `${token.borderRadius}px 0 0 ${token.borderRadius}px`,
      background: token.colorBgContainer,
      color: token.colorTextSecondary,
      cursor: 'pointer',
      zIndex: 1,

      '&:hover': {
        color: token.colorPrimary,
        borderColor: token.colorPrimaryBorder,
      },
    },

    // 每个 slide 一张白色卡片，由 hook 直接插入（包裹 div + canvas）
    '&-rail-card': {
      width: '100%',
      background: token.colorBgContainer,
      borderRadius: token.borderRadiusLG,
      border: `1px solid ${token.colorBorderSecondary}`,
      boxShadow: `${token.boxShadowTertiary}, 0 4px 12px rgba(0, 0, 0, 0.1)`,
      transition:
        'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
    },

    '&-rail-card-active': {
      borderColor: token.colorPrimary,
      boxShadow: `0 0 0 2px ${token.colorPrimaryBorder}, 0 4px 12px rgba(0, 0, 0, 0.1)`,
    },

    '&-rail-canvas': {
      width: '100%',
      display: 'block',
      borderRadius: `${token.borderRadiusLG - 1}px ${token.borderRadiusLG - 1}px 0 0`,
    },

    '&-main-canvas': {
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
      borderRadius: token.borderRadiusLG,
      background: token.colorBgContainer,
    },

    '&-host': {
      flex: 1,
      minWidth: 0,
      // 不设 height: 100%：高度交给 flex 交叉轴 stretch（自动扣除 margin），
      // 避免「100% + margin」把 margin box 撑出容器、底部留白被裁掉。
      // 也不用 padding 留白：viewer 的 fitPage 以 clientWidth/Height 计算缩放，
      // padding 会被计入导致画布超出内容区撑出滚动条
      margin: HOST_PADDING,
      overflow: 'auto',
      background: token.colorBgContainer,
    },

    // PPTX 单页模式：画布在 host 内水平垂直居中（fitPage 后小于可用宽高时）
    '&-host-center': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
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
