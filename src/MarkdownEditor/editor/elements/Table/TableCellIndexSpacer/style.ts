import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../../../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      contentEditable: false,
      cursor: 'pointer',
      backgroundColor: 'var(--color-gray-control-fill-secondary)',
      '&:hover': {
        backgroundColor: 'var(--color-gray-control-fill-secondary-hover)',
      },
    },
    [`${token.componentCls}-action-buttons`]: {
      position: 'absolute',
      top: '-28px',
      right: '50%',
      transform: 'translateX(50%)',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      opacity: 0,
      transition: 'opacity 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
    },
    [`${token.componentCls}-action-buttons-visible`]: {
      opacity: 1,
    },
    [`${token.componentCls}-action-button`]: {
      padding: '2px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      border: '1px solid var(--table-border-color)',
      width: '20px',
      height: '20px',
      cursor: 'pointer',
      backgroundPosition: '50%',
      backgroundRepeat: 'no-repeat',
      transition:
        'color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1), background-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
      borderRadius: '4px',
      background: 'var(--color-gray-bg-card-white)',
      boxShadow: 'var(--shadow-border-base)',
      color: 'var(--color-gray-text-secondary)',
      '&:hover': {
        backgroundColor: '#FFF',
        boxShadow: 'var(--shadow-control-lg)',
      },
    },
    [`${token.componentCls}-delete-icon`]: {
      '&:hover': {
        color: '#ff4d4f',
      },
    },
    [`${token.componentCls}-insert-column-before`]: {
      '&:hover': {
        color: '#52c41a',
      },
    },
    [`${token.componentCls}-insert-column-after`]: {
      '&:hover': {
        color: '#52c41a',
      },
    },
  };
};

/**
 * TableCellIndexSpacer 样式 hook
 * @param prefixCls 组件前缀类名
 * @returns 样式相关的对象
 */
export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister(
    'md-editor-table-cell-index-spacer',
    (token) => {
      const editorToken = {
        ...token,
        componentCls: `.${prefixCls}`,
      };

      return [resetComponent(editorToken), genStyle(editorToken)];
    },
  );
}
