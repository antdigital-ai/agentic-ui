import type { ChatTokenType, GenerateStyle } from '../../hooks/useStyle';
import { useEditorStyleRegister } from '../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    // 加载状态容器（compact模式）
    [`${token.chatCls}-messages-content-loading`]: {
      lineHeight: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      '&-compact': {
        padding: '8px',
      },
      '&-default': {
        padding: '12px',
      },
    },

    // 消息内容容器
    [`${token.chatCls}-messages-content-message`]: {
      lineHeight: '24px',
    },

    // 用户消息文本颜色
    [`${token.chatCls}-messages-content-user-text`]: {
      color: '#343A45',
    },

    // Popover 标题容器
    [`${token.chatCls}-messages-content-popover-title`]: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '1em',
    },

    // Popover 内容容器
    [`${token.chatCls}-messages-content-popover-content`]: {
      width: 400,
      display: 'flex',
      maxHeight: 400,
      overflow: 'auto',
      flexDirection: 'column',
      gap: 12,
    },

    // MarkdownEditor 容器样式
    [`${token.chatCls}-messages-content-markdown-editor`]: {
      padding: 0,
      width: '100%',
    },

    // 文档标签容器
    [`${token.chatCls}-messages-content-doc-tag`]: {
      borderRadius: '20px',
      opacity: 1,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      padding: '10px',
      gap: '10px',
      alignSelf: 'stretch',
      background: '#FBFCFD',
      cursor: 'pointer',
      zIndex: 1,
    },

    // 文档标签图标
    [`${token.chatCls}-messages-content-doc-tag-icon`]: {
      width: 24,
    },

    // 文档名称文本
    [`${token.chatCls}-messages-content-doc-name`]: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 2,
      display: '-webkit-box',
    },
  };
};

export function useMessagesContentStyle() {
  return useEditorStyleRegister('BubbleMessageDisplay', (token) => {
    const chatToken: ChatTokenType = {
      ...token,
      componentCls: token.componentCls || '',
      chatCls: '',
      antCls: '',
    };
    return genStyle(chatToken);
  });
}
