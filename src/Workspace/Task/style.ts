import type { ChatTokenType, GenerateStyle } from '../../Hooks/useStyle';
import { useEditorStyleRegister } from '../../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [`${token.componentCls}`]: {
      padding: '0',

      '&-item': {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        margin: '12px 0',
        font: 'var(--font-text-h6-base)',
        color: 'var(--color-gray-text-default)',
      },

      '&-status': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: '2px',
        fontSize: 16,
      },

      '&-content': {
        flex: 1,
        minWidth: 0,
      },

      '&-title': {
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '20px',
        color: 'var(--color-gray-text-default)',
        margin: 0,
        wordBreak: 'break-word',
      },

      '&-description': {
        font: 'var(--font-text-body-xs)',
        color: 'var(--color-gray-text-secondary)',
        marginTop: '4px',
        wordBreak: 'break-word',
      },

      // 为 error 和 pending 状态添加灰色字体
      '&-item-error, &-item-pending': {
        [`${token.componentCls}-title`]: {
          color: 'var(--color-gray-text-secondary)',
        },
      },
    },
  };
};

export function useTaskStyle(prefixCls?: string) {
  return useEditorStyleRegister('WorkspaceTask', (token) => {
    const taskToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(taskToken)];
  });
}
