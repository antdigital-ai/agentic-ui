import type { ChatTokenType, GenerateStyle } from '../../../Hooks/useStyle';
import { useEditorStyleRegister } from '../../../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
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
      },

      '&-title': {
        fontSize: token.fontSizeLG,
        fontWeight: token.fontWeightStrong,
        color: token.colorTextHeading,
        margin: 0,
      },

      '&-toolbar': {
        marginInlineStart: 'auto',
        display: 'flex',
        gap: token.paddingXS,
        alignItems: 'center',
      },

      '&-grid': {
        display: 'grid',
        gap: token.padding,
        width: '100%',
      },

      '&-item': {
        display: 'flex',
        flexDirection: 'column',
        gap: token.paddingXS,
        padding: token.padding,
        backgroundColor: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        transition: `border-color ${token.motionDurationMid} ${token.motionEaseOut}, box-shadow ${token.motionDurationMid} ${token.motionEaseOut}`,

        '&:hover': {
          borderColor: token.colorPrimaryBorderHover,
          boxShadow: token.boxShadowTertiary,
        },
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
        wordBreak: 'break-all',
      },

      '&-item-link': {
        color: token.colorLink,
        textDecoration: 'none',

        '&:hover': {
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
        padding: `0 ${token.paddingXS}px`,
        height: token.controlHeightXS,
        borderRadius: token.borderRadiusSM,
        backgroundColor: token.colorFillSecondary,
        color: token.colorTextSecondary,
        fontSize: token.fontSizeSM,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      },

      '&-empty': {
        padding: token.paddingLG,
        color: token.colorTextDescription,
        textAlign: 'center',
      },
    },
  };
};

export const useStyle = (prefixCls: string) => {
  return useEditorStyleRegister('DocCards', (token) => {
    const componentToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    } as ChatTokenType;
    return [genStyle(componentToken)];
  });
};
