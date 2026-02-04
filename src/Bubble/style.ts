import {
  ChatTokenType,
  CSSInterpolation,
  resetComponent,
  useEditorStyleRegister,
} from '../Hooks/useStyle';
import { BubbleProps } from './type';

const genStyle = (
  token: ChatTokenType,
  classNames?: BubbleProps['classNames'],
) => {
  return {
    [token.componentCls]: {
      '&-bubble': {
        position: 'relative',
        maxWidth: '100vw',
        cursor: 'pointer',

        '&&-compact': {
          padding: 'var(--padding-0-5x)',
        },
        '&:hover': {
          [`${token.componentCls}-bubble-title-time`]: {
            visibility: 'visible',
          },
        },
      },

      '.agentic-md-editor-code': {
        borderRadius: '12px !important',
        overflow: 'auto',
        padding: 'var(--padding-3x)',
      },
      '&-bubble-avatar': {
        width: 40,
        height: 40,
      },
      '&-bubble-avatar-title': {
        lineHeight: '20px',
        textAlign: 'justify',
        letterSpacing: 'normal',
        color: 'var(--color-gray-text-default)',
        fontSize: '1em',
        display: 'flex',
        gap: 'var(--margin-1x)',
        '&-pure': {
          paddingLeft: '20px',
        },
        '&-quote': {
          marginBottom: '0px',
          flexDirection: 'column',
        },
        [`span.${classNames?.bubbleNameClassName}`]: {
          fontWeight: 600,
          fontSize: '1em',
          color: 'var(--color-gray-text-default)',
          display: 'flex',
          alignItems: 'center',
        },
      },
      '&-bubble-avatar-emoji': {
        fontSize: 24,
        textAlign: 'center',
        lineHeight: '36px',
      },
      '&-bubble-container': {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        '&-pure': {
          gap: 8,
        },
        '&-right': {
          alignItems: 'flex-end',
        },
        '&-left': {
          alignItems: 'flex-start',
        },
      },
      '&-bubble-content': {
        fontSize: '1em',
        minHeight: '2em',
        maxWidth: 'min(860px,100%)',
        justifyContent: 'center',
        gap: 0,
        lineHeight: '22px',
        padding: 0,
        backdropFilter: 'blur(10px)',
        color: 'var(--color-gray-text-secondary)',
        width: 'max-content',
        borderRadius: '12px',
        background: 'var(--color-gray-bg-card-white)',
        boxShadow: 'var(--shadow-control-base)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 0,
        '&&-compact': {
          minHeight: '38px',
          padding: '0px',
        },
        '&&-pure': {
          width: '100%',
          boxShadow: 'none !important',
          background: 'transparent',
          backgroundColor: 'transparent',
          color: 'var(--color-gray-text-default)',
        },
        '&-standalone': {
          maxWidth: 'min(860px,100%)',
        },
        '*': {
          whiteSpace: 'pre-wrap',
          textWrap: 'wrap',
          wordWrap: 'break-word',
        },
        video: {
          borderRadius: '12px',
          overflow: 'auto',
        },
        [`div['data-be=code']`]: {
          borderRadius: '12px',
          overflow: 'auto',
        },
        [`div[data-be="paragraph"]`]: {
          color: 'var(--color-gray-text-default)',
          font: 'var(--font-text-paragraph-lg)',
          letterSpacing: 'var(--letter-spacing-paragraph-lg, normal)',
        },
        img: {
          borderRadius: '12px',
          overflow: 'auto',
        },
      },
      '&-bubble-after': {
        width: 'max-content',
        minWidth: '0px',
        display: 'flex',
        maxWidth: 'min(860px,100%)',
        '&-left': {
          justifyContent: 'flex-start',
          maxWidth: 'min(860px,100%)',
        },
        '&-right': {
          justifyContent: 'flex-end',
          maxWidth: 'min(860px,100%)',
        },
      },
      '&-bubble-before': {
        width: 'max-content',
        minWidth: '0px',
        maxWidth: 'min(860px,100%)',
      },
      '&-bubble-content-right': {
        maxWidth: '75%',
        borderRadius: '16px 16px 2px 16px',
        background: 'var(--color-primary-control-fill-secondary-active)',
        color: 'var(--color-gray-text-default)',
        boxShadow: 'none',
        '&&-pure': {
          background: 'var(--color-primary-control-fill-primary)',
        },
      },

      // 用户消息特定样式
      '&-bubble-user': {
        marginBlockStart: -20, // title line height
        '&-avatar-title-user': {
          flexDirection: 'row-reverse', // 用户消息头像和标题顺序相反
          justifyContent: 'flex-end',
        },
        '&-container-user': {
          alignItems: 'flex-end',
          maxWidth: 'max(668px,75%)',
        },
        '&-content-user': {
          background: 'var(--color-primary-bg-card-light)',
          color: 'var(--color-gray-text-default)',
          borderRadius: '12px 12px 2px 12px',
          maxWidth: '668px',
          '&&-pure': {
            background: 'var(--color-primary-control-fill-primary)',
          },
        },
        '&-before-user': {
          justifyContent: 'flex-end',
        },
        '&-after-user': {
          justifyContent: 'flex-end',
        },
      },

      // AI消息特定样式
      '&-bubble-ai': {
        '&-avatar-title-ai': {
          flexDirection: 'row', // AI消息头像和标题正常顺序
          justifyContent: 'flex-start',
        },
        '&-container-ai': {
          alignItems: 'flex-start',
        },
        '&-content-ai': {
          background: 'var(--color-gray-bg-card-white)',
          color: 'var(--color-gray-text-secondary)',
          borderRadius: '12px',
          '&&-pure': {
            boxShadow: 'none',
            backgroundColor: 'transparent',
            color: 'var(--color-gray-text-default)',
          },
        },
        '&-before-ai': {
          justifyContent: 'flex-start',
        },
        '&-after-ai': {
          justifyContent: 'flex-start',
        },
      },
    },
  };
};

/**
 * Probubble
 * @param prefixCls
 * @returns
 */
export function useStyle(
  prefixCls?: string,
  classNames?: BubbleProps['classNames'],
) {
  return useEditorStyleRegister('ListItem', (token) => {
    const proChatToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [
      resetComponent(proChatToken),
      genStyle(proChatToken, classNames),
    ] as CSSInterpolation[];
  });
}
