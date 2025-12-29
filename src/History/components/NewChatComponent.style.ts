import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../hooks/useStyle';

const genNewChatStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [`${token.componentCls}-new-chat`]: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      padding: '5px 12px',
      borderRadius: 'var(--radius-control-base)',
      background: 'var(--color-primary-control-fill-secondary)',
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: '22px',
      letterSpacing: 'normal',
      color: 'var(--color-primary-text-secondary)',
      boxShadow: 'var(--shadow-border-base)',

      '&:hover': {
        background: 'var(--color-primary-control-fill-secondary-hover)',
      },
    },
  };
};

export const useNewChatStyle = (prefixCls: string) => {
  return useEditorStyleRegister('HistoryNewChat', (token) => {
    const componentCls = `.${prefixCls}`;
    const chatToken: ChatTokenType = {
      ...token,
      componentCls,
    };

    return [genNewChatStyle(chatToken)];
  });
};
