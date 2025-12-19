import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
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

        [`${token.componentCls}-titleContainer`]: {
          paddingTop: 8,
          display: 'flex',
          alignItems: 'center',
        },

        [`${token.componentCls}-title`]: {
          font: 'var(--font-text-h6-base)',
          marginLeft: 12,
          textAlign: 'justify',

          color: 'var(--color-gray-text-default)',
        },

        [`${token.componentCls}-loading`]: {
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },

        [`${token.componentCls}-arrowContainer`]: {
          height: 20,
          lineHeight: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },

        [`${token.componentCls}-arrow`]: {
          flexShrink: 0,
          width: 16,
          height: 16,
          transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
        },
      },

      '&-body': {
        display: 'flex',

        [`${token.componentCls}-content`]: {
          font: 'var(--font-text-paragraph-sm)',
          marginLeft: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          letterSpacing: 'var(--letter-spacing-paragraph-sm, normal)',
          color: 'var(--color-gray-text-secondary)',
        },
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
