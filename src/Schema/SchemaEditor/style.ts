import { genStyleHooks, type GenStyleFn } from '../../Hooks/useStyle';

const SUBTLE_BORDER = '1px solid var(--color-gray-border-light)';

/**
 * 生成代码编辑器面板的通用样式（HTML / JSON 共用）
 */
const genEditorPanelStyle = (cls: string) => ({
  [cls]: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    padding: '12px',
    background: 'var(--color-gray-bg-page-light)',
    border: SUBTLE_BORDER,
    borderRadius: '8px',
  },

  [`${cls}-header`]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  [`${cls}-header h3`]: {
    margin: 0,
    fontSize: 'var(--font-size-base)',
    fontWeight: 600,
    color: 'var(--color-gray-text-default)',
  },

  [`${cls}-header button`]: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 8px',
    fontSize: 'var(--font-size-sm)',
    color: 'var(--color-gray-text-secondary)',
  },

  [`${cls}-content`]: {
    flex: 1,
    minHeight: 0,
    position: 'relative' as const,
  },

  [`${cls}-content .ace_editor`]: {
    height: '100% !important',
    fontSize: 'var(--font-size-base)',
  },
});

const genStyle: GenStyleFn<'SchemaEditor'> = (token) => {
  const componentCls = token.componentCls;

  return {
    [componentCls]: {
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-gray-bg-card-white)',
      borderRadius: '8px',
      overflow: 'hidden',
      fontFamily: 'inherit',
    },

    [`${componentCls}-container`]: {
      display: 'flex',
      flex: 1,
      gap: '4px',
      background: 'var(--color-gray-bg-page-light)',
      minHeight: 0,
    },

    [`${componentCls}-left`]: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minWidth: 0,
    },

    [`${componentCls}-right`]: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      padding: '4px',
      borderRadius: '8px',
      background: 'var(--color-gray-control-fill-secondary)',
      overflow: 'auto',
    },

    // HTML / JSON 编辑器（共用 mixin）
    ...genEditorPanelStyle(`${componentCls}-html`),
    ...genEditorPanelStyle(`${componentCls}-json`),

    // 预览区域样式
    [`${componentCls}-preview`]: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      border: SUBTLE_BORDER,
      borderRadius: '8px',
      background: 'var(--color-gray-bg-card-white)',
      boxShadow: 'var(--shadow-border-base)',
    },

    [`${componentCls}-preview-header`]: {
      padding: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    [`${componentCls}-preview-header h3`]: {
      margin: 0,
      fontSize: 'var(--font-size-base)',
      fontWeight: 600,
      color: 'var(--color-gray-text-default)',
    },

    [`${componentCls}-error`]: {
      background: 'var(--color-red-bg-page-light)',
      border: '1px solid var(--color-red-border-light)',
      borderRadius: '4px',
      padding: '8px 12px',
      fontSize: 'var(--font-size-sm)',
      color: 'var(--color-red-text-default)',
      maxWidth: '300px',
      wordBreak: 'break-word',
    },

    [`${componentCls}-preview-content`]: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      flex: 1,
      padding: '16px',
      overflow: 'auto',
      background: 'var(--color-gray-bg-card-white)',
      borderRadius: '0 0 8px 8px',
    },

    [`${componentCls}-preview-content-empty`]: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      alignItems: 'center',
    },

    [`${componentCls}-preview-content-empty p`]: {
      fontSize: 'var(--font-size-base)',
      textAlign: 'center',
      color: 'var(--color-gray-text-light)',
    },

    [`${componentCls}-fallback`]: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: 'var(--color-gray-text-secondary)',
      textAlign: 'center',
    },

    [`${componentCls}-fallback p`]: {
      margin: '4px 0',
      fontSize: 'var(--font-size-base)',
    },

    // 响应式设计
    '@media (max-width: 768px)': {
      [`${componentCls}-container`]: {
        flexDirection: 'column',
      },

      [`${componentCls}-left`]: {
        borderRight: 'none',
        borderBottom: '1px solid var(--color-gray-border-light)',
      },

      [`${componentCls}-html, ${componentCls}-json`]: {
        minHeight: '200px',
      },
    },

    // 滚动条样式
    [`${componentCls}-preview-content::-webkit-scrollbar`]: {
      width: '6px',
    },

    [`${componentCls}-preview-content::-webkit-scrollbar-track`]: {
      background: 'var(--color-gray-control-fill-secondary)',
      borderRadius: '3px',
    },

    [`${componentCls}-preview-content::-webkit-scrollbar-thumb`]: {
      background: 'var(--color-gray-text-light)',
      borderRadius: '3px',
    },

    [`${componentCls}-preview-content::-webkit-scrollbar-thumb:hover`]: {
      background: 'var(--color-gray-text-secondary)',
    },

    // 编辑器主题适配
    [`${componentCls} .ace_editor`]: {
      borderRadius: '8px',
      background: 'var(--color-gray-bg-page-light)',
      color: 'var(--color-gray-text-default)',
    },

    [`${componentCls} .ace_editor.ace_dark`]: {
      background: 'var(--color-gray-bg-page-dark)',
      color: 'var(--color-gray-text-light)',
    },

    // 加载状态
    [`${componentCls}-loading`]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: 'var(--color-gray-text-secondary)',
    },

    [`${componentCls}-loading::after`]: {
      content: "''",
      width: '20px',
      height: '20px',
      border: '2px solid var(--color-gray-border-light)',
      borderTop: '2px solid var(--color-primary-control-fill-primary)',
      borderRadius: '50%',
      animationName: 'spin',
      animationDuration: '1s',
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite',
      marginLeft: '8px',
    },
  };
};

const useGenStyle = genStyleHooks('SchemaEditor', genStyle);

export function useStyle(prefixCls?: string) {
  const [, hashId] = useGenStyle(prefixCls ?? 'SchemaEditor');
  return { hashId };
}
