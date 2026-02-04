import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      height: '100%',
      minHeight: '600px',
      backgroundColor: 'transparent',
      overflow: 'hidden',
      border: 'none',
      boxSizing: 'border-box',
      margin: 2,
      '*': {
        boxSizing: 'border-box',
      },
      // 主体内容区域
      [`${token.componentCls}-body`]: {
        display: 'flex',
        flex: 1,
        boxShadow: 'var(--shadow-card-base)',
        borderRadius: 'var(--radius-modal-base)',
        overflow: 'hidden',
        border: '1px solid rgba(140, 171, 255, 0.12)',
      },

      // 侧边栏基础样式
      [`${token.componentCls}-sidebar-left`]: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-gray-bg-page-light)',
        borderRight: `1px solid var(--color-gray-border-light)`,
        overflow: 'hidden',
        boxSizing: 'border-box',
        padding: '12px',
      },
      [`${token.componentCls}-sidebar-left-collapsed`]: {
        padding: '0 !important',
        width: '0 !important',
        minWidth: '0 !important',
        maxWidth: '0 !important',
        border: 'none !important',
      },

      // 右侧边栏包装器
      [`&-sidebar-wrapper-right`]: {
        display: 'flex',
        alignItems: 'stretch',
        height: '100%',
      },

      // 右侧边栏特殊样式
      [`&-sidebar-right`]: {
        borderRight: 'none',
        height: '100%',
      },

      // 折叠状态样式
      [`&-sidebar-right-collapsed`]: {
        width: '0 !important',
        minWidth: '0 !important',
        maxWidth: '0 !important',
        padding: '0 !important',
        opacity: 0,
        overflow: 'hidden',

        [`${token.componentCls}-sidebar-content`]: {
          display: 'none',
        },
      },

      // 拖拽手柄样式
      [`&-resize-handle`]: {
        width: '6px',
        cursor: 'col-resize',
        backgroundColor: 'transparent',
        position: 'relative',
        zIndex: 10,
        flexShrink: 0,
        marginLeft: '1px',
        marginRight: '1px',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: '6px',
          backgroundColor: 'transparent',
          transform: 'translateX(-50%)',
          transition: 'background-color 0.2s ease',
        },
        '&:hover::before': {
          backgroundColor: 'var(--color-primary-9, #1d7afc)',
        },
      },

      // 侧边栏内容
      [`&-sidebar-content`]: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
      },

      // 主内容区域
      [`&-main`]: {
        flex: 1,
        minWidth: 0,
        backgroundColor: 'var(--color-gray-bg-page-light)',
        borderTopRightRadius: 'var(--radius-modal-base)',
        borderBottomRightRadius: 'var(--radius-modal-base)',
        overflow: 'hidden',
        '&-content': {
          flex: 1,
          height: 'calc(100% - 48px)',
        },
      },
    },
  };
};

export const useAgenticLayoutStyle = (prefixCls: string) => {
  return useEditorStyleRegister('agentic-layout', (token) => {
    const agenticLayoutToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(agenticLayoutToken)];
  });
};
