import type { ChatTokenType, GenerateStyle } from '../Hooks/useStyle';
import { useEditorStyleRegister } from '../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      height: '100%',
      borderRadius: 'var(--radius-modal-base)',
      background: 'var(--color-gray-bg-card-white)',
      border: '1px solid rgba(140, 171, 255, 0.12)',
      boxShadow: 'var(--shadow-card-base)',
      'svg.sofa-icons-icon > g': {
        clipPath: 'none!important',
      },

      // 纯净模式样式
      [`&${token.componentCls}-pure`]: {
        borderRadius: '0',
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        height: '100%',
      },

      [`${token.componentCls}-header`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        margin: 'var(--margin-3x) var(--margin-4x)',
      },

      [`${token.componentCls}-title`]: {
        font: 'var(--font-text-h5-base)',
        color: 'var(--color-gray-text-default)',
        letterSpacing: 'var(--letter-spacing-h5-base, normal)',
      },
      [`${token.componentCls}-header-right`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 'var(--gap-2x)',
        [`${token.componentCls}-close`]: {
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
        },
      },

      [`${token.componentCls}-tabs`]: {
        margin: 'var(--margin-3x)',
      },

      // 分割线样式
      [`${token.componentCls}-segmented`]: {
        '.ant-segmented-group': {
          height: '32px',
        },

        '&.ant-segmented:not(.chaos-segmented) .ant-segmented-item .ant-segmented-item-label':
          {
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          },

        '.ant-segmented-item': {
          '&:has(.ant-segmented-item-label:empty)': {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '0 0 auto !important',
            height: '100%',
            width: '8px',
            padding: '4px 0',
            margin: '0 2px',
            cursor: 'default',
            pointerEvents: 'none',
            backgroundColor: 'transparent !important',

            '.ant-segmented-item-label': {
              padding: '0',
              height: '100%',
              width: '1px',
              backgroundColor: 'var(--color-gray-border-light)',
            },

            '&:hover': {
              backgroundColor: 'transparent !important',
            },
          },
        },

        '.ant-segmented-item-disabled': {
          '&:has(.ant-segmented-item-label:empty)': {
            opacity: '1 !important',
          },
        },
      },

      [`${token.componentCls}-tab-item`]: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
      },

      [`${token.componentCls}-tab-title`]: {
        fontSize: 'var(--font-size-base)',
        fontWeight: 500,
      },

      [`${token.componentCls}-tab-count`]: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '20px',
        height: '20px',
        padding: '4px 6px',
        marginLeft: '4px',
        color: 'var(--color-gray-text-secondary)',
        font: 'var(--font-text-number-xs)',
        letterSpacing: 'var(--letter-spacing-number-xs, normal)',
        backgroundColor: 'var(--color-gray-control-fill-active)',
        borderRadius: '200px',
        boxSizing: 'border-box',
      },

      [`${token.componentCls}-content`]: {
        height: 'calc(100% - 95px)',
        padding: '0 12px 16px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflowX: 'hidden',
        overflowY: 'auto',
        borderRadius: 'var(--radius-card-base)',
      },
    },
  };
};

export function useWorkspaceStyle(prefixCls?: string) {
  return useEditorStyleRegister('Workspace', (token) => {
    const workspaceToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(workspaceToken)];
  });
}
