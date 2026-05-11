import type { ChatTokenType, GenerateStyle } from '../../../Hooks/useStyle';
import { useEditorStyleRegister } from '../../../Hooks/useStyle';

const SINGLE_COLUMN_BREAKPOINT = 480;

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
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        overflow: 'hidden',
        minHeight: 200,
      },

      '&-quadrant': {
        display: 'flex',
        flexDirection: 'column',
        padding: token.paddingSM,
        minHeight: 80,
        overflow: 'hidden',

        '&--q0': {
          backgroundColor: `${token.colorSuccessBg}`,
          borderInlineEnd: `1px dashed ${token.colorBorderSecondary}`,
          borderBlockEnd: `1px dashed ${token.colorBorderSecondary}`,
        },
        '&--q1': {
          backgroundColor: `${token.colorInfoBg}`,
          borderBlockEnd: `1px dashed ${token.colorBorderSecondary}`,
        },
        '&--q2': {
          backgroundColor: `${token.colorWarningBg}`,
          borderInlineEnd: `1px dashed ${token.colorBorderSecondary}`,
        },
        '&--q3': {
          backgroundColor: `${token.colorFillQuaternary}`,
        },
      },

      '&-quadrant-label': {
        fontSize: token.fontSizeSM,
        fontWeight: token.fontWeightStrong,
        color: token.colorTextSecondary,
        marginBlockEnd: token.paddingXS,
        lineHeight: token.lineHeightSM,
      },

      '&-quadrant-items': {
        display: 'flex',
        flexWrap: 'wrap',
        gap: token.paddingXXS,
        flex: 1,
        alignContent: 'flex-start',
      },

      '&-item': {
        display: 'inline-flex',
        alignItems: 'center',
        padding: `${token.paddingXXS}px ${token.paddingXS}px`,
        borderRadius: token.borderRadiusSM,
        backgroundColor: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        fontSize: token.fontSizeSM,
        color: token.colorText,
        lineHeight: token.lineHeightSM,
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        transition: `border-color ${token.motionDurationMid} ${token.motionEaseOut}, box-shadow ${token.motionDurationMid} ${token.motionEaseOut}`,
      },

      '@media (hover: hover)': {
        [`${token.componentCls}-item:hover`]: {
          borderColor: token.colorPrimaryBorderHover,
          boxShadow: token.boxShadowTertiary,
        },
      },

      '&-empty': {
        padding: token.paddingLG,
        color: token.colorTextDescription,
        textAlign: 'center',
      },

      [`@media (max-width: ${SINGLE_COLUMN_BREAKPOINT}px)`]: {
        '&-grid': {
          gridTemplateColumns: '1fr',
          gridTemplateRows: 'repeat(4, auto)',
        },
        '&-quadrant': {
          '&--q0': {
            borderInlineEnd: 'none',
            borderBlockEnd: `1px dashed ${token.colorBorderSecondary}`,
          },
          '&--q1': {
            borderBlockEnd: `1px dashed ${token.colorBorderSecondary}`,
          },
          '&--q2': {
            borderInlineEnd: 'none',
            borderBlockEnd: `1px dashed ${token.colorBorderSecondary}`,
          },
        },
      },
    },
  };
};

export const useStyle = (prefixCls: string) => {
  return useEditorStyleRegister('QuadrantChart', (token) => {
    const componentToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    } as ChatTokenType;
    return [genStyle(componentToken)];
  });
};
