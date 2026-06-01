import { genStyleHooks, type GenStyleFn } from '../../../Hooks/useStyle';

/** 强制单列布局的 viewport 阈值（手机竖屏 / 窄侧栏） */
const SINGLE_COLUMN_BREAKPOINT = 480;

const genStyle: GenStyleFn<'DocCards'> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      flexDirection: 'column',
      gap: token.paddingSM,
      width: '100%',

      '&-header': {
        display: 'flex',
        alignItems: 'center',
        gap: token.paddingSM,
        padding: `${token.paddingXS}px 0`,
        flexWrap: 'wrap',
      },

      '&-title': {
        fontSize: token.fontSizeLG,
        fontWeight: token.fontWeightStrong,
        color: token.colorTextHeading,
        margin: 0,
        lineHeight: token.lineHeightHeading4,
      },

      '&-toolbar': {
        marginInlineStart: 'auto',
        display: 'flex',
        gap: token.paddingXS,
        alignItems: 'center',
        flexWrap: 'wrap',
      },

      '&-grid': {
        display: 'grid',
        gap: token.padding,
        width: '100%',
        // cardColumns 通过 inline style 注入；窄屏由媒体查询强制单列
      },

      '&-item': {
        display: 'flex',
        flexDirection: 'column',
        gap: token.paddingXS,
        padding: token.padding,
        backgroundColor: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        // 仅在指针设备上启用 hover 过渡，避免 touch 设备 first-tap 残留 hover 态
        transition: `border-color ${token.motionDurationMid} ${token.motionEaseOut}, box-shadow ${token.motionDurationMid} ${token.motionEaseOut}`,
        // 防止子元素溢出导致整张卡片在 grid 里被撑宽
        minWidth: 0,
      },

      '&-item-title': {
        fontSize: token.fontSizeLG,
        fontWeight: token.fontWeightStrong,
        color: token.colorTextHeading,
        lineHeight: token.lineHeightHeading4,
        margin: 0,
        wordBreak: 'break-word',
      },

      '&-item-url': {
        fontSize: token.fontSizeSM,
        color: token.colorTextDescription,
        lineHeight: token.lineHeightSM,
        // 单行 + 省略，原 URL 通过 title attribute 浮窗展示
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },

      '&-item-link': {
        color: token.colorLink,
        textDecoration: 'none',
        // 触摸目标至少 24px 高，达到 WCAG 2.2 AA Target Size (Minimum) 2.5.8 (24×24 px)
        display: 'inline-block',
        minHeight: 24,
        lineHeight: '24px',
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        verticalAlign: 'bottom',
        '&:active': {
          color: token.colorLinkActive,
        },
      },

      // 仅在指针设备上启用 hover 态，避免移动端 first-tap 残留
      '@media (hover: hover)': {
        [`${token.componentCls}-item:hover`]: {
          borderColor: token.colorPrimaryBorderHover,
          boxShadow: token.boxShadowTertiary,
        },
        [`${token.componentCls}-item-link:hover`]: {
          color: token.colorLinkHover,
          textDecoration: 'underline',
        },
      },

      '&-item-desc': {
        fontSize: token.fontSize,
        color: token.colorText,
        lineHeight: token.lineHeight,
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      },

      '&-item-tags': {
        display: 'flex',
        flexWrap: 'wrap',
        gap: token.paddingXXS,
        marginTop: 'auto',
      },

      '&-tag': {
        display: 'inline-flex',
        alignItems: 'center',
        // 用 padding 控制实际高度，避免在手机端因 fontSize × line-height 超出固定 height 被截
        padding: `${token.paddingXXS}px ${token.paddingXS}px`,
        borderRadius: token.borderRadiusSM,
        backgroundColor: token.colorFillSecondary,
        color: token.colorTextSecondary,
        fontSize: token.fontSizeSM,
        lineHeight: token.lineHeightSM,
        whiteSpace: 'nowrap',
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },

      '&-empty': {
        padding: token.paddingLG,
        color: token.colorTextDescription,
        textAlign: 'center',
      },

      // 窄屏（手机竖屏 / 窄侧栏）强制单列，避免 < 480px 仍勉强塞两列导致文字被挤断
      [`@media (max-width: ${SINGLE_COLUMN_BREAKPOINT}px)`]: {
        '&-grid': {
          gridTemplateColumns: '1fr !important',
        },
        '&-header': {
          gap: token.paddingXS,
        },
        '&-item': {
          padding: token.paddingSM,
        },
      },
    },
  };
};

const useGenStyle = genStyleHooks('DocCards', genStyle);

export const useStyle = (prefixCls: string) => {
  const [, hashId] = useGenStyle(prefixCls);
  return { hashId };
};
