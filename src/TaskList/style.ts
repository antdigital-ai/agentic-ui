import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  const { componentCls } = token;

  return {
    [componentCls]: {
      '&-thoughtChainItem': {
        marginBottom: 4,
        display: 'flex',
        '.ai-paas-spin-dot-item': {
          color: 'var(--color-primary-control-fill-primary)',
        },
      },

      '&-left': {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '8px 0 0',
        gap: 4,
      },

      '&-right': {
        padding: '8px 0',
      },

      '&-content-left': {
        flex: 1,
        flexShrink: 0,
        width: 16,
        display: 'flex',
        justifyContent: 'center',
      },

      '&-dash-line': {
        width: 1,
        boxSizing: 'border-box',
        height: '100%',
        borderLeft: '1px dashed var(--color-gray-text-disabled)',
      },

      '&-status': {
        display: 'flex',
        height: 22,
        alignItems: 'center',
        color: 'var(--color-gray-text-disabled)',
        svg: {
          width: 16,
          height: 16,
        },
      },

      '&-status-idle': {
        height: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },

      '&-top': {
        display: 'flex',
        marginBottom: 4,
        gap: 4,
        cursor: 'pointer',

        [`${componentCls}-titleContainer`]: {
          paddingTop: 8,
          display: 'flex',
          alignItems: 'center',
        },

        [`${componentCls}-title`]: {
          font: 'var(--font-text-h6-base)',
          marginLeft: 12,
          textAlign: 'justify',

          color: 'var(--color-gray-text-default)',
        },

        [`${componentCls}-loading`]: {
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },

        [`${componentCls}-arrowContainer`]: {
          height: 20,
          lineHeight: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },

        [`${componentCls}-arrow`]: {
          flexShrink: 0,
          width: 16,
          height: 16,
          transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
        },
      },

      '&-body': {
        display: 'flex',

        [`${componentCls}-content`]: {
          font: 'var(--font-text-paragraph-sm)',
          marginLeft: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          letterSpacing: 'var(--letter-spacing-paragraph-sm, normal)',
          color: 'var(--color-gray-text-secondary)',
        },
      },

      // Simple variant - wrapper
      '&-simple-wrapper': {
        borderRadius: 'var(--radius-control-base, 8px)',
        background: 'var(--color-gray-bg-page-dark, #f5f5f5)',
        boxShadow: 'var(--shadow-control-base, none)',
        overflow: 'hidden',
      },

      // Simple variant - bar
      '&-simple': {
        display: 'flex',
        alignItems: 'center',
        height: 36,
        padding: '0 12px',
        gap: 8,
        cursor: 'pointer',
        userSelect: 'none' as const,
        transition: 'background 0.2s ease',

        '&:hover': {
          background: 'var(--color-gray-control-fill-active, rgba(0,0,0,0.04))',
        },

        [`${componentCls}-simple-status`]: {
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,

          [`${componentCls}-status`]: {
            height: 'auto',
            svg: {
              width: 14,
              height: 14,
            },
          },
        },

        [`${componentCls}-simple-text`]: {
          flex: 1,
          minWidth: 0,
          font: 'var(--font-text-paragraph-base, 14px)',
          letterSpacing: 'var(--letter-spacing-paragraph-base, normal)',
          color: 'var(--color-gray-text-default, rgba(0,3,9,0.85))',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },

        [`${componentCls}-simple-progress`]: {
          flexShrink: 0,
          font: 'var(--font-text-paragraph-sm, 12px)',
          color: 'var(--color-gray-text-secondary, rgba(0,3,9,0.45))',
        },

        [`${componentCls}-simple-arrow`]: {
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      },

      // Simple variant - expanded content
      '&-simple-content': {
        overflow: 'hidden',
      },

      '&-simple-list': {
        padding: '4px 12px 8px',
      },
    },
  };
};

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('task-list', (token) => {
    const taskListToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };
    return [genStyle(taskListToken)];
  });
}
