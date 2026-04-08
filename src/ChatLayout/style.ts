import { MOBILE_BREAKPOINT, MOBILE_PADDING } from '../Constants/mobile';
import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../Hooks/useStyle';

const RADIUS_XL =
  'var(--radius-xl, var(--radius-card-lg, 16px))';
const COLOR_GRAY_BG_ACTIVE =
  'var(--color-gray-bg-active, var(--color-gray-control-fill-active, rgba(20, 22, 28, 0.12)))';
const COLOR_GRAY_BORDER_DEFAULT =
  'var(--color-gray-border-default, var(--color-gray-border-light, rgba(20, 22, 28, 0.12)))';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      position: 'relative',
      borderTopLeftRadius: RADIUS_XL,
      borderTopRightRadius: RADIUS_XL,
      borderBottomLeftRadius: RADIUS_XL,
      borderBottomRightRadius: RADIUS_XL,
      backgroundColor: 'var(--color-gray-bg-page-light)',

      '&-header': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--padding-4x)',
        backgroundColor: 'var(--color-gray-bg-page-light)',
        minHeight: '48px',
        flexShrink: 0,
        zIndex: 10,
        borderTopLeftRadius: RADIUS_XL,
        borderTopRightRadius: RADIUS_XL,

        '&-left': {
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--margin-2x)',

          '&-title': {
            fontSize: 'var(--font-size-lg)',
            fontWeight: 600,
            color: 'var(--color-gray-text-default)',
            margin: 0,
            lineHeight: '1.4',
          },

          '&-collapse-btn': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 'var(--font-size-2xl)',
            height: 'var(--font-size-2xl)',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--color-gray-text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
            padding: 0,

            '&:hover': {
              backgroundColor: 'var(--color-blue-control-fill-hover)',
              color: 'var(--color-gray-text-default)',
            },

            '&:active': {
              backgroundColor: COLOR_GRAY_BG_ACTIVE,
            },
          },
        },

        '&-right': {
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--margin-2x)',

          '&-share-btn': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 8px',
            height: 'var(--font-size-2xl)',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--color-gray-text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',

            '&:hover': {
              backgroundColor: 'var(--color-blue-control-fill-hover)',
              color: 'var(--color-gray-text-default)',
            },

            '&:active': {
              backgroundColor: COLOR_GRAY_BG_ACTIVE,
            },
          },

          '&-collapse-btn': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 'var(--font-size-2xl)',
            height: 'var(--font-size-2xl)',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--color-gray-text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
            padding: 0,

            '&:hover': {
              backgroundColor: 'var(--color-blue-control-fill-hover)',
              color: 'var(--color-gray-text-default)',
            },

            '&:active': {
              backgroundColor: COLOR_GRAY_BG_ACTIVE,
            },
          },
        },
      },

      '&-content': {
        position: 'relative',
        zIndex: 1,
        width: '100%',
        paddingBottom: RADIUS_XL,
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',

        '&-scrollable': {
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingTop: 'var(--padding-2x)',
          paddingLeft: 'var(--padding-2x)',
          paddingRight: 'var(--padding-2x)',
          '&::-webkit-scrollbar': {
            width: '6px',
          },

          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },

          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'var(--color-gray-border-light)',
            borderRadius: '3px',

            '&:hover': {
              backgroundColor: COLOR_GRAY_BORDER_DEFAULT,
            },
          },
          '> div': {
            maxWidth: '800px',
            margin: '0 auto',
          },
        },
      },

      '&-footer': {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingTop: 8,
        paddingBottom: 24,
        gap: 24,
        position: 'absolute',
        bottom: 0,
        zIndex: 100,
        borderBottomLeftRadius: RADIUS_XL,
        borderBottomRightRadius: RADIUS_XL,
      },
      '&-footer-background': {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: 146,
        pointerEvents: 'none',
        overflow: 'hidden',
        borderRadius: 'inherit',
      },
      [`@media (max-width: ${MOBILE_BREAKPOINT})`]: {
        '&-header': {
          padding: `0 ${MOBILE_PADDING}`,
        },
        '&-content': {
          '&-scrollable': {
            paddingTop: MOBILE_PADDING,
            paddingLeft: MOBILE_PADDING,
            paddingRight: MOBILE_PADDING,
          },
        },
        '&-footer': {
          padding: MOBILE_PADDING,
        },
      },
    },
  };
};

/**
 * ChatLayout 样式 Hook
 * @param prefixCls 组件类名前缀
 * @returns 样式对象
 */
export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('ChatLayout', (token) => {
    const chatLayoutToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [resetComponent(chatLayoutToken), genStyle(chatLayoutToken)];
  });
}
