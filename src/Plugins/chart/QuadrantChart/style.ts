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

      '&-body': {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        overflow: 'hidden',
      },

      '&-axis-label': {
        fontSize: token.fontSizeSM,
        color: token.colorTextDescription,
        textAlign: 'center',
        padding: `${token.paddingXXS}px ${token.paddingXS}px`,
        lineHeight: token.lineHeightSM,
        fontWeight: token.fontWeightStrong,
      },

      '&-x-axis': {
        display: 'flex',
        justifyContent: 'center',
        padding: `${token.paddingXXS}px 0`,
      },

      '&-y-axis': {
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `0 ${token.paddingXXS}px`,
        minWidth: 24,
      },

      '&-content': {
        display: 'flex',
        flex: 1,
      },

      '&-grid': {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        flex: 1,
        minHeight: 280,
      },

      '&-quadrant': {
        display: 'flex',
        flexDirection: 'column',
        padding: token.paddingSM,
        minHeight: 120,
        position: 'relative',
        overflow: 'hidden',

        '&--q0': {
          borderInlineStart: `1px dashed ${token.colorBorderSecondary}`,
          borderBlockEnd: `1px dashed ${token.colorBorderSecondary}`,
          backgroundColor: `${token.colorSuccessBg}`,
        },
        '&--q1': {
          borderBlockEnd: `1px dashed ${token.colorBorderSecondary}`,
          backgroundColor: `${token.colorInfoBg}`,
        },
        '&--q2': {
          backgroundColor: `${token.colorFillQuaternary}`,
        },
        '&--q3': {
          borderInlineStart: `1px dashed ${token.colorBorderSecondary}`,
          backgroundColor: `${token.colorWarningBg}`,
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
        flexDirection: 'column',
        gap: 2,
        padding: `${token.paddingXXS}px ${token.paddingXS}px`,
        borderRadius: token.borderRadiusSM,
        backgroundColor: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        maxWidth: '100%',
        transition: `border-color ${token.motionDurationMid} ${token.motionEaseOut}, box-shadow ${token.motionDurationMid} ${token.motionEaseOut}`,
      },

      '&-item-name': {
        fontSize: token.fontSizeSM,
        fontWeight: token.fontWeightStrong,
        color: token.colorText,
        lineHeight: token.lineHeightSM,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },

      '&-item-desc': {
        fontSize: token.fontSizeSM - 1,
        color: token.colorTextDescription,
        lineHeight: token.lineHeightSM,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: 200,
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
          gridTemplateRows: 'repeat(4, 1fr)',
        },
        '&-quadrant': {
          '&--q0': {
            borderInlineStart: 'none',
          },
          '&--q3': {
            borderInlineStart: 'none',
          },
        },
        '&-y-axis': {
          display: 'none',
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
