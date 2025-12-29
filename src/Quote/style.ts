import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../hooks/useStyle';

const genQuoteStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      '&-container': {
        width: 'fit-content',
        minWidth: '150px',
        maxWidth: '560px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        padding: '6px 8px',
        gap: '8px',
        borderRadius: 'var(--radius-control-base)',
        cursor: 'pointer',
        font: 'var(--font-text-body-sm)',
      },

      '&-container:hover': {
        /* 圆角-控件-sm */
        borderRadius: 'var(--radius-control-sm)',
        /* gray/gray-控件填充-悬停 */
        /* 样式描述：--gray-a2 */
        background: 'var(--color-gray-control-fill-hover)',
        /* 投影-描边-base */
        boxShadow: 'var(--shadow-border-base)',
      },

      '&-container:hover &-close-button': {
        display: 'flex',
        alignItems: 'center',
      },

      '&-quote-icon': {
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        color: 'var(--color-gray-text-secondary)',
      },

      '&-close-button': {
        fontSize: 14,
        color: 'var(--color-gray-text-default)',
        display: 'none',
      },

      '&-quoteDescription': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        flex: 1,

        color: 'var(--color-gray-text-default)',
        font: 'var(--font-text-body-sm)',
      },

      // 弹出层样式

      '&-popup': {
        position: 'absolute',
        bottom: '30px', // 保持原来的距离
        minWidth: '240px',
        maxWidth: '800px',
        /* 圆角-卡片-base */

        borderRadius: 'var(--radius-card-base)',
        background: 'var(--color-gray-bg-page-light)',
        boxSizing: 'border-box',
        border: '1px solid var(--color-gray-border-light)',
        boxShadow: 'var(--shadow-popover-base)',

        display: 'none', // 默认隐藏
        flexDirection: 'column',
        gap: 4,
        zIndex: 1001,
        minHeight: 'auto',

        fontSize: '12px',
        fontWeight: 'normal',
        lineHeight: '20px',
        letterSpacing: 'normal',
        color: 'var(--color-gray-text-secondary)',
        padding: 4,

        // 扩展hover区域，填补与容器之间的空隙
        '&::before': {
          content: '""',
          position: 'absolute',
          bottom: '-10px',
          left: '0',
          right: '0',
          height: '10px',
          background: 'transparent',
          pointerEvents: 'auto',
        },
      },

      // hover时显示弹框（包括hover到连接区域）
      '&-container:hover &-popup': {
        display: 'flex',
      },

      '&-popup:hover': {
        display: 'flex',
      },

      /* gray/gray-背景-页面-浅 */
      '&-popup-content': {
        padding: '8px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        maxHeight: '70px', // 固定高度
        overflowY: 'auto',
        lineHeight: '20px',
        boxSizing: 'border-box', // 确保 padding 包含在总高度内
        letterSpacing: 'var(--letter-spacing-body-sm, normal)',
        borderRadius: 'var(--radius-card-base)',
        background: 'var(--color-gray-bg-card-white)',
        boxShadow: 'var(--shadow-border-base)',
      },

      '&-popup-header': {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 8px',
        width: 'fit-content',
        maxWidth: '100%',
      },

      '&-popup-header:hover': {
        borderRadius: 'var(--radius-control-base)',
        background: 'var(--color-gray-control-fill-hover)',
      },

      '&-popup-title': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      '&-popup-range': {
        flex: 'none',
      },
    },
  };
};

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('quote', (token) => {
    const quoteToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };
    return [genQuoteStyle(quoteToken)];
  });
}
