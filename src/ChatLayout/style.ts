import { MOBILE_BREAKPOINT, MOBILE_PADDING } from '../Constants/mobile';
import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      position: 'relative',
      borderTopLeftRadius: 'var(--radius-xl)',
      borderTopRightRadius: 'var(--radius-xl)',
      borderBottomLeftRadius: 'var(--radius-xl)',
      borderBottomRightRadius: 'var(--radius-xl)',
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
        borderTopLeftRadius: 'var(--radius-xl)',
        borderTopRightRadius: 'var(--radius-xl)',

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
              backgroundColor: 'var(--color-gray-bg-active)',
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
              backgroundColor: 'var(--color-gray-bg-active)',
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
              backgroundColor: 'var(--color-gray-bg-active)',
            },
          },
        },
      },

      '&-content': {
        width: '100%',

        paddingBottom: 'var(--radius-xl)',
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',

        '&-scrollable': {
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingTop: 'var(--padding-2x)',
          paddingLeft: 'var(--padding-2x)',
          paddingRight: 'var(--padding-2x)',
          paddingBottom: '144px', // 内容底部与输入框操作区域距离24px，不遮挡内容
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
              backgroundColor: 'var(--color-gray-border-default)',
            },
          },
          '> div': {
            maxWidth: '800px',
            margin: '0 auto',
          },
        },
      },

      '&-footer': {
        padding: 'var(--padding-4x)',
        background:
          'linear-gradient(to bottom, #fff0 20%, var(--color-gray-bg-card-white) 70%)',
        width: '100%',
        position: 'absolute',
        bottom: 0,
        zIndex: 100,
        borderBottomLeftRadius: 'var(--radius-xl)',
        borderBottomRightRadius: 'var(--radius-xl)',
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
            paddingBottom: '144px',
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
