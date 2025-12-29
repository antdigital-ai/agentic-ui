import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      maxWidth: '322px',
      background: '#fdfdfd',
      borderRadius: 'var(--radius-card-base)',
      boxShadow: 'inset 0 0 1px 0 rgba(0, 0, 0, 0.15)',
      position: 'relative',
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.3s ease-in-out',

      '&:hover': {
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.08)',
        transform: 'scale(1.02)',
      },

      '&:active': {
        transform: 'scale(0.95)',
      },

      // cover 区域
      '&-cover': {
        WebkitMaskImage:
          '-webkit-linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
        maskImage:
          'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
        width: '100%',
        height: 166,
        display: 'flex',
        justifyContent: 'center',
      },

      // coverContent 白色子卡片
      '&-cover-content': {
        width: '80%',
        marginTop: '32px',
        height: 144,
        borderRadius: 'var(--radius-modal-base)',
        boxShadow:
          '0px 0px 1px 0px rgba(71, 98, 234, 0.05), 0px 6px 16px 0px rgba(71, 98, 234, 0.12)',
        background: '#ffffff',
        padding: '16px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'rotate(0deg) translateY(0)',
      },

      // coverContent 悬停状态
      '&-cover-content-hovered': {
        transform: 'rotate(8deg) translateY(16px)',
      },

      // 引号图标
      '&-quote-icon': {
        width: '24px',
        height: '24px',
        marginBottom: '8px',

        '& svg': {
          width: '24px',
          height: '24px',
        },
      },

      // 引用文字
      '&-quote-text': {
        fontSize: '15px',
        fontWeight: 400,
        lineHeight: '20px',
        color: 'var(--color-gray-text-light)',
        maxHeight: '80px',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 4,
        WebkitBoxOrient: 'vertical',
        textOverflow: 'ellipsis',
      },

      // 底部内容区域
      '&-bottom': {
        position: 'relative',
        height: 80,
        padding: '16px 20px 20px',
      },

      // 标题
      '&-title': {
        fontSize: '16px',
        fontWeight: 600,
        lineHeight: '26px',
        color: 'var(--color-gray-text-default)',
        marginTop: 0,
        marginBottom: '4px',
      },

      // 描述
      '&-description': {
        fontSize: '13px',
        fontWeight: 400,
        lineHeight: '22px',
        color: 'var(--color-gray-text-secondary)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },

      // buttonBar 按钮区域
      '&-button-bar': {
        position: 'absolute',
        textAlign: 'right',
        bottom: '8px',
        left: '16px',
        right: '16px',
        marginBottom: 0,
        background: 'linear-gradient(to right, #ffffff00 0%, #ffffff 40%)',
        borderRadius: '4px',
        padding: '8px',
        width: 'auto',
        opacity: 0,
        transform: 'translateY(10px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: 'none',

        // buttonBar 内的按钮样式
        '& button': {
          backgroundColor: '#000000',
          color: '#ffffff',
          borderRadius: '36px',
          padding: '8px 16px',
          cursor: 'pointer',
          border: 'none',
          fontSize: '14px',
          transition: 'all 0.2s ease-in-out',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',

          '&:hover': {
            backgroundColor: '#333333',
            transform: 'translateY(-2px)',
          },

          '&:active': {
            transform: 'translateY(0)',
          },
        },
      },

      // 箭头图标
      '&-arrow-icon': {
        width: '18px',
        height: '18px',
        borderRadius: '200px',
        background: '#FFFFFF',
        color: 'var(--color-primary-text-secondary)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        transform: 'translateX(0)',

        '& svg': {
          width: '12px',
          height: '12px',
        },
      },

      // 按钮悬停时箭头动画
      '&-button-bar button:hover &-arrow-icon': {
        transform: 'translateX(4px)',
      },

      // buttonBar 显示状态
      '&-button-bar-visible': {
        opacity: 1,
        transform: 'translateY(0)',
        pointerEvents: 'auto',
      },
    },
  };
};

/**
 * CaseReply 组件样式
 */
export const useStyle = (prefixCls?: string) => {
  return useEditorStyleRegister('ChatBootCaseReply', (token) => {
    const caseReplyToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(caseReplyToken)];
  });
};
