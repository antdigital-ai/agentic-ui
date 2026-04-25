import type { ChatTokenType, GenerateStyle } from '../../Hooks/useStyle';
import { useEditorStyleRegister } from '../../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    // 主容器样式
    [`${token.componentCls}`]: {
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-gray-bg-card-white)',
      borderRadius: '8px',
      overflow: 'hidden',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },

    [`${token.componentCls}-container`]: {
      display: 'flex',
      flex: 1,
      gap: '4px',
      background: 'var(--color-gray-bg-page-light)',
      minHeight: 0,
    },

    [`${token.componentCls}-left`]: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minWidth: 0,
    },

    [`${token.componentCls}-right`]: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      padding: '4px',
      borderRadius: '8px',
      background: 'rgba(9, 30, 66, 0.07)',
      overflow: 'auto',
    },

    // HTML编辑器样式
    [`${token.componentCls}-html`]: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '12px',
      background: 'var(--color-gray-bg-page-light)',
      border: '1px solid rgba(9, 30, 66, 0.07)',
      borderRadius: '8px',
    },

    [`${token.componentCls}-html-header`]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    [`${token.componentCls}-html-header h3`]: {
      margin: 0,
      fontSize: 'var(--font-size-base)',
      fontWeight: 600,
      color: 'var(--color-gray-text-default)',
    },

    [`${token.componentCls}-html-header button`]: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '3px 8px',
      fontSize: 'var(--font-size-sm)',
      color: 'var(--color-gray-text-secondary)',
    },

    [`${token.componentCls}-html-content`]: {
      flex: 1,
      minHeight: 0,
      position: 'relative',
    },

    [`${token.componentCls}-html-content .ace_editor`]: {
      height: '100% !important',
      fontSize: 'var(--font-size-base)',
    },

    // JSON编辑器样式
    [`${token.componentCls}-json`]: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '12px',
      background: 'var(--color-gray-bg-page-light)',
      border: '1px solid rgba(9, 30, 66, 0.07)',
      borderRadius: '8px',
    },

    [`${token.componentCls}-json-header`]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    [`${token.componentCls}-json-header h3`]: {
      margin: 0,
      fontSize: 'var(--font-size-base)',
      fontWeight: 600,
      color: 'var(--color-gray-text-default)',
    },

    [`${token.componentCls}-json-header button`]: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '3px 8px',
      fontSize: 'var(--font-size-sm)',
      color: 'var(--color-gray-text-secondary)',
    },

    [`${token.componentCls}-json-content`]: {
      flex: 1,
      minHeight: 0,
      position: 'relative',
    },

    [`${token.componentCls}-json-content .ace_editor`]: {
      height: '100% !important',
      fontSize: 'var(--font-size-base)',
    },

    // 预览区域样式
    [`${token.componentCls}-preview`]: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      border: '1px solid rgba(9, 30, 66, 0.07)',
      borderRadius: '8px',
      background: 'var(--color-gray-bg-card-white)',
      boxShadow: '0px 1.5px 2px -1px rgba(0, 19, 41, 0.07)',
    },

    [`${token.componentCls}-preview-header`]: {
      padding: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    [`${token.componentCls}-preview-header h3`]: {
      margin: 0,
      fontSize: 'var(--font-size-base)',
      fontWeight: 600,
      color: 'var(--color-gray-text-default)',
    },

    [`${token.componentCls}-error`]: {
      background: 'var(--color-red-bg-page-light)',
      border: '1px solid var(--color-red-border-light)',
      borderRadius: '4px',
      padding: '8px 12px',
      fontSize: 'var(--font-size-sm)',
      color: 'var(--color-red-text-default)',
      maxWidth: '300px',
      wordBreak: 'break-word',
    },

    [`${token.componentCls}-preview-content`]: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      flex: 1,
      padding: '16px',
      overflow: 'auto',
      background: 'var(--color-gray-bg-card-white)',
      borderRadius: '0 0 8px 8px',
    },

    [`${token.componentCls}-preview-content-empty`]: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      alignItems: 'center',
    },

    [`${token.componentCls}-preview-content-empty p`]: {
      fontSize: 'var(--font-size-base)',
      textAlign: 'center',
      color: 'var(--color-gray-text-light)',
    },

    [`${token.componentCls}-fallback`]: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: 'var(--color-gray-text-secondary)',
      textAlign: 'center',
    },

    [`${token.componentCls}-fallback p`]: {
      margin: '4px 0',
      fontSize: 'var(--font-size-base)',
    },

    // 响应式设计
    '@media (max-width: 768px)': {
      [`${token.componentCls}-container`]: {
        flexDirection: 'column',
      },

      [`${token.componentCls}-left`]: {
        borderRight: 'none',
        borderBottom: '1px solid var(--color-gray-border-light)',
      },

      [`${token.componentCls}-html, ${token.componentCls}-json`]: {
        minHeight: '200px',
      },
    },

    // 滚动条样式
    [`${token.componentCls}-preview-content::-webkit-scrollbar`]: {
      width: '6px',
    },

    [`${token.componentCls}-preview-content::-webkit-scrollbar-track`]: {
      background: 'var(--color-gray-control-fill-secondary)',
      borderRadius: '3px',
    },

    [`${token.componentCls}-preview-content::-webkit-scrollbar-thumb`]: {
      background: 'var(--color-gray-text-light)',
      borderRadius: '3px',
    },

    [`${token.componentCls}-preview-content::-webkit-scrollbar-thumb:hover`]: {
      background: 'var(--color-gray-text-secondary)',
    },

    // 编辑器主题适配
    [`${token.componentCls} .ace_editor`]: {
      borderRadius: '8px',
      background: 'rgba(9, 30, 66, 0.03)',
      color: 'var(--color-gray-text-default)',
    },

    [`${token.componentCls} .ace_editor.ace_dark`]: {
      background: 'var(--color-gray-bg-page-dark)',
      color: 'var(--color-gray-text-light)',
    },

    // 加载状态
    [`${token.componentCls}-loading`]: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: 'var(--color-gray-text-secondary)',
    },

    [`${token.componentCls}-loading::after`]: {
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

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('SchemaEditor', (token) => {
    const schemaEditorToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(schemaEditorToken)];
  });
}
