import type { ChatTokenType, GenerateStyle } from '../../Hooks/useStyle';
import { useEditorStyleRegister } from '../../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    // 加载状态容器（compact模式）
    [`${token.componentCls}-messages-content-loading`]: {
      lineHeight: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--padding-2x)',
      padding: 'var(--padding-3x)',
      '&-compact': {
        padding: 'var(--padding-2x)',
      },
      '&-default': {
        padding: 'var(--padding-3x)',
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
  };
};

export function useMessagesContentStyle(componentCls: string) {
  return useEditorStyleRegister('BubbleMessageDisplay', (token) => {
    const chatToken: ChatTokenType = {
      ...token,
      componentCls: componentCls || '',
    };
    return genStyle(chatToken);
  });
}
