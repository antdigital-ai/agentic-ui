import { genStyleHooks, type GenStyleFn } from '../Hooks/useStyle';

const genStyle: GenStyleFn<'TaskList'> = (token) => {
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

      '&-status-success': {
        color: 'var(--color-green-control-fill-primary)',
      },

      '&-status-loading': {
        color: 'var(--color-primary-control-fill-primary)',
      },

      '&-status-error': {
        color: 'var(--color-red-control-fill-primary)',
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
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },

      '&-body': {
        overflow: 'hidden',
        height: 'auto',
        opacity: 1,
        transition:
          'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease',

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

      '&-body-collapsed': {
        opacity: 0,
      },

      // Simple variant - wrapper
      '&-simple-wrapper': {
        width: 'fit-content',
        maxWidth: '100%',
        borderRadius: 'var(--radius-control-base, 8px)',
        overflow: 'hidden',
      },

      // Simple variant - bar
      '&-simple': {
        display: 'flex',
        alignItems: 'center',
        height: 36,
        padding: '0 4px',
        gap: 8,
        cursor: 'pointer',
        userSelect: 'none' as const,
        borderRadius: 'var(--radius-control-base, 8px)',
        transition: 'background 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

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

        [`${componentCls}-simple-arrow`]: {
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },

        [`${componentCls}-simple-count`]: {
          flexShrink: 0,
          font: 'var(--font-text-paragraph-sm, 12px)',
          color: 'var(--color-gray-text-secondary, rgba(0,3,9,0.45))',
          letterSpacing: 'var(--letter-spacing-paragraph-sm, normal)',
          lineHeight: 1,
        },
      },

      // Simple variant - content area
      '&-simple-content': {
        display: 'grid',
        gridTemplateRows: '0fr',
        opacity: 0,
        transition:
          'grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

        '& > *': {
          overflow: 'hidden',
        },

        '&-expanded': {
          gridTemplateRows: '1fr',
          opacity: 1,
        },
      },

      '&-simple-list': {
        padding: '4px 4px 8px',

        // 在 simple 模式下，子项 icon 和文字与摘要栏对齐
        [`${componentCls}-thoughtChainItem`]: {
          [`${componentCls}-left`]: {
            padding: '4px 0 0',
          },
          [`${componentCls}-right`]: {
            padding: '4px 0',
          },
          [`${componentCls}-top ${componentCls}-title`]: {
            marginLeft: 8,
          },
        },
        [`${componentCls}-body ${componentCls}-content`]: {
          marginLeft: 8,
        },
      },
    },
  };
};

const useGenStyle = genStyleHooks('TaskList', genStyle);

export function useStyle(prefixCls?: string) {
  const [, hashId] = useGenStyle(prefixCls ?? 'task-list');
  return { hashId };
}
