import type { ChatTokenType, GenerateStyle } from '../../Hooks/useStyle';
import { useEditorStyleRegister } from '../../Hooks/useStyle';

const THINKING_DOT_SIZE = 4;
const THINKING_DOT_GAP = 4;
const THINKING_DOT_ANIMATION = 'agenticBubbleThinkingDotPulse';
const THINKING_DOT_ANIMATION_DURATION = '1.2s';
const THINKING_LOADING_MARGIN_TOP = 'var(--padding-2x)';
const THINKING_LOADING_PADDING = {
  paddingLeft: 'var(--padding-5x)',
  paddingRight: 'var(--padding-5x)',
  paddingTop: 'var(--padding-1x)',
  paddingBottom: 'var(--padding-2x)',
};

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    // 加载状态容器（compact模式）
    [`${token.componentCls}-messages-content-loading`]: {
      lineHeight: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--padding-2x)',
      marginTop: THINKING_LOADING_MARGIN_TOP,
      ...THINKING_LOADING_PADDING,
      color: 'rgb(102, 111, 141)',
      [`&-dots`]: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: THINKING_DOT_GAP,
        lineHeight: 1,
      },
      [`&-dot`]: {
        width: THINKING_DOT_SIZE,
        height: THINKING_DOT_SIZE,
        borderRadius: '50%',
        backgroundColor: 'currentColor',
        opacity: 0.35,
        animationName: THINKING_DOT_ANIMATION,
        animationDuration: THINKING_DOT_ANIMATION_DURATION,
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: 'infinite',
      },
      [`&-dot:nth-of-type(2)`]: {
        animationDelay: '0.2s',
      },
      [`&-dot:nth-of-type(3)`]: {
        animationDelay: '0.4s',
      },
      '&-compact': {
        ...THINKING_LOADING_PADDING,
      },
      '&-default': {
        ...THINKING_LOADING_PADDING,
      },
    },

    // 消息内容容器
    [`${token.componentCls}-messages-content-message`]: {
      lineHeight: '24px',
    },

    // 用户消息文本颜色
    [`${token.componentCls}-messages-content-user-text`]: {
      color: '#343A45',
    },

    // Popover 标题容器
    [`${token.componentCls}-messages-content-popover-title`]: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '1em',
    },

    // Popover 内容容器
    [`${token.componentCls}-messages-content-popover-content`]: {
      width: 400,
      display: 'flex',
      maxHeight: 400,
      overflow: 'auto',
      flexDirection: 'column',
      gap: 'var(--padding-3x)',
    },

    // MarkdownEditor 容器样式
    [`${token.componentCls}-messages-content-markdown-editor`]: {
      padding: 0,
      width: '100%',
    },

    // 重新生成按钮容器
    [`div[data-messages-content-retry]`]: {
      gap: 4,
      display: 'flex',
      cursor: 'pointer',
      alignItems: 'center',
    },

    // 文档标签容器
    [`${token.componentCls}-messages-content-doc-tag`]: {
      borderRadius: 'var(--padding-5x)',
      opacity: 1,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      padding: 'var(--padding-2x) var(--padding-3x)',
      gap: 'var(--padding-2x)',
      alignSelf: 'stretch',
      background: '#FBFCFD',
      cursor: 'pointer',
      zIndex: 1,
    },

    // 文档标签图标
    [`${token.componentCls}-messages-content-doc-tag-icon`]: {
      width: 24,
    },

    // 文档名称文本
    [`${token.componentCls}-messages-content-doc-name`]: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 2,
      display: '-webkit-box',
    },

    [`@keyframes ${THINKING_DOT_ANIMATION}`]: {
      '0%, 80%, 100%': {
        transform: 'scale(0.6)',
        opacity: 0.35,
      },
      '40%': {
        transform: 'scale(1)',
        opacity: 1,
      },
    },
  };
};

export function useMessagesContentStyle(componentCls: string) {
  return useEditorStyleRegister('BubbleMessageDisplay', (token) => {
    const chatToken: ChatTokenType = {
      ...token,
      componentCls: `.${componentCls}`,
    };
    return genStyle(chatToken);
  });
}
