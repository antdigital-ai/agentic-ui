import {
  MOBILE_BREAKPOINT,
  MOBILE_PADDING,
} from '../../../../Constants/mobile';
import {
  ChatTokenType,
  CSSInterpolation,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../../../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      width: '100%',
      overflow: 'auto',
      '--table-border-radius': '8px',
      '--table-border-color': '#E7E9E8',
      '--table-header-bg': '#f7f7f9',
      '--table-odd-row-bg': 'rgba(35,35,38,.04)',
      '--table-hover-bg': 'rgba(0, 0, 0, 0.04)',
      '--table-cell-min-width': '120px',
      '&-container': {
        display: 'flex',
        gap: 1,
        maxWidth: '100%',
        minWidth: 0,
        outline: 'none',
        position: 'relative',
        marginBottom: 12,
      },
      '&-editor-table': {
        marginTop: '1em',
      },
      '&:hover &-readonly-table-actions': {
        opacity: 1,
        transform: 'translateX(50%)',
        top: -24,
      },
      '&-readonly-table-actions': {
        opacity: 0,
        position: 'absolute',
        top: -44,
        right: '50%',
        zIndex: 1000,
        backgroundColor: 'var(--color-gray-bg-page-light)',
        borderRadius: 'var(--radius-control-base)',
        padding: '4px 8px',
        boxShadow: 'var(--shadow-control-base)',
        border: 'none',
        transform: 'translateX(50%)',
        transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
      },
      table: {
        borderCollapse: 'separate',
        borderSpacing: 0,
        width: '100%',
        tableLayout: 'fixed',
        margin: '16px 0',
        position: 'relative',
        fontVariant: 'tabular-nums',
        borderRadius: 'var(--table-border-radius)',
        border: '1px solid var(--table-border-color)',

        [`&${token.componentCls}-readonly-pure`]: {
          border: 'none',
          borderRadius: 'none',
          'tr:not(.config-tr) td:not(.config-td)': {
            borderLeft: 'none',
          },
          'tr:not(.config-tr):last-child td:not(.config-td)': {
            borderBottom: '1px solid var(--table-border-color)',
          },
          'tr:not(.config-tr):first-child th:first-child:not(.config-td):not([colspan]):not([rowspan]), tr:not(.config-tr):first-child td:first-child:not(.config-td):not([colspan]):not([rowspan])':
            {
              borderTopLeftRadius: 'unset',
            },
          'tr:not(.config-tr):first-child th:last-child:not(.config-td):not([colspan]):not([rowspan]), tr:not(.config-tr):first-child td:last-child:not(.config-td):not([colspan]):not([rowspan])':
            {
              borderTopRightRadius: 'unset',
            },
          'tr:not(.config-tr):last-child td:first-child:not(.config-td):not([colspan]):not([rowspan]), tr:not(.config-tr):last-child th:first-child:not(.config-td):not([colspan]):not([rowspan])':
            {
              borderBottomLeftRadius: 'unset',
            },
          'tr:not(.config-tr):last-child td:last-child:not(.config-td):not([colspan]):not([rowspan]), tr:not(.config-tr):last-child th:last-child:not(.config-td):not([colspan]):not([rowspan])':
            {
              borderBottomRightRadius: 'unset',
            },
        },

        'th.config-th,td.config-td': {
          borderBottom: '1px solid var(--table-border-color)',
          borderLeft: '1px solid var(--table-border-color)',
        },
        'tr td.config-td:first-child': {
          borderLeft: 'none',
        },

        'th:not(.config-td)': {
          backgroundColor: 'var(--table-header-bg)',
          borderBottom: '1px solid var(--table-border-color)',
          textWrap: 'nowrap',
          verticalAlign: 'top',
          padding: '16px 12px',
          textAlign: 'left',
          lineHeight: '24px',
          fontSize: '1em',
          fontWeight: 600,
          borderTop: 'none',
          minWidth: 'var(--table-cell-min-width)',
          width: 'var(--table-cell-min-width)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          zIndex: 1,
          background: 'inherit',
        },
        'td:not(.config-td)': {
          verticalAlign: 'top',
          padding: '16px 12px',
          textAlign: 'left',
          position: 'relative',
          lineHeight: '24px',
          fontSize: '1em',
          minWidth: 'var(--table-cell-min-width)',
          width: 'var(--table-cell-min-width)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          zIndex: 1,
          background: 'inherit',
          'div[data-be="paragraph"]': {
            margin: 0,
            textWrap: 'auto',
          },
        },
        'tr:not(.config-tr)': {
          background: 'inherit',

          '&:first-child td:not(.config-td)': {
            borderTop: 'none',
          },
          'td:not(.config-td)': {
            borderBottom: '1px solid var(--table-border-color)',
            borderLeft: '1px solid var(--table-border-color)',

            '&:first-child': {
              fontSize: '1em',
              lineHeight: '24px',
              fontWeight: 600,
            },
          },
          'td:first-child:not(.config-td)': {
            borderLeft: 'none',
          },
          '&:last-child td:not(.config-td)': {
            borderBottom: 'none',
          },
        },
        'tbody tr:not(.config-tr):hover': {
          background:
            'linear-gradient(var(--table-hover-bg), var(--table-hover-bg)), linear-gradient(white, white)',
        },
        // 表格圆角处理 - 重新设计逻辑
        // 1. 先为所有单元格重置圆角
        'th:not(.config-td), td:not(.config-td)': {
          borderRadius: '0',
        },

        // 2. 为表格四个角的单元格设置圆角（仅当它们不是合并单元格时）
        'tr:not(.config-tr):first-child th:first-child:not(.config-td):not([colspan]):not([rowspan]), tr:not(.config-tr):first-child td:first-child:not(.config-td):not([colspan]):not([rowspan])':
          {
            borderTopLeftRadius: 'var(--table-border-radius)',
          },
        'tr:not(.config-tr):first-child th:last-child:not(.config-td):not([colspan]):not([rowspan]), tr:not(.config-tr):first-child td:last-child:not(.config-td):not([colspan]):not([rowspan])':
          {
            borderTopRightRadius: 'var(--table-border-radius)',
          },
        'tr:not(.config-tr):last-child td:first-child:not(.config-td):not([colspan]):not([rowspan]), tr:not(.config-tr):last-child th:first-child:not(.config-td):not([colspan]):not([rowspan])':
          {
            borderBottomLeftRadius: 'var(--table-border-radius)',
          },
        'tr:not(.config-tr):last-child td:last-child:not(.config-td):not([colspan]):not([rowspan]), tr:not(.config-tr):last-child th:last-child:not(.config-td):not([colspan]):not([rowspan])':
          {
            borderBottomRightRadius: 'var(--table-border-radius)',
          },

        // 3. 处理合并单元格的圆角
        // 左上角 - 第一行第一列的合并单元格
        'tr:not(.config-tr):first-child th:not(.config-td)[colspan]:first-child, tr:not(.config-tr):first-child td:not(.config-td)[colspan]:first-child,tr:not(.config-tr):first-child th:not(.config-td)[rowspan]:first-child, tr:not(.config-tr):first-child td:not(.config-td)[rowspan]:first-child':
          {
            borderTopLeftRadius: 'var(--table-border-radius)',
          },

        // 右上角 - 第一行最后一列的合并单元格
        'tr:not(.config-tr):first-child th:not(.config-td)[colspan]:last-child, tr:not(.config-tr):first-child td:not(.config-td)[colspan]:last-child,tr:not(.config-tr):first-child th:not(.config-td)[rowspan]:last-child, tr:not(.config-tr):first-child td:not(.config-td)[rowspan]:last-child':
          {
            borderTopRightRadius: 'var(--table-border-radius)',
          },

        // 左下角 - 最后一行第一列的合并单元格
        'tr:not(.config-tr):last-child td:not(.config-td)[colspan]:first-child, tr:not(.config-tr):last-child th:not(.config-td)[colspan]:first-child,tr:not(.config-tr):last-child td:not(.config-td)[rowspan]:first-child, tr:not(.config-tr):last-child th:not(.config-td)[rowspan]:first-child':
          {
            borderBottomLeftRadius: 'var(--table-border-radius)',
          },

        // 右下角 - 最后一行最后一列的合并单元格
        'tr:not(.config-tr):last-child td:not(.config-td)[colspan]:last-child, tr:not(.config-tr):last-child th:not(.config-td)[colspan]:last-child,tr:not(.config-tr):last-child td:not(.config-td)[rowspan]:last-child, tr:not(.config-tr):last-child th:not(.config-td)[rowspan]:last-child':
          {
            borderBottomRightRadius: 'var(--table-border-radius)',
          },

        // 4. 特殊处理：如果合并单元格跨越整个表格宽度
        'tr:not(.config-tr):first-child:last-child th:not(.config-td)[colspan]:first-child:last-child, tr:not(.config-tr):first-child:last-child td:not(.config-td)[colspan]:first-child:last-child':
          {
            borderRadius: 'var(--table-border-radius)',
          },

        // 5. 特殊处理：如果合并单元格跨越整个表格高度
        'th:not(.config-td)[rowspan]:first-child:last-child, td:not(.config-td)[rowspan]:first-child:last-child':
          {
            borderTopLeftRadius: 'var(--table-border-radius)',
            borderBottomLeftRadius: 'var(--table-border-radius)',
          },
        [`@media (max-width: ${MOBILE_BREAKPOINT})`]: {
          'th:not(.config-td), td:not(.config-td)': {
            padding: `${MOBILE_PADDING}`,
          },
        },
      },
      'table.htCore': {
        boxSizing: 'content-box',
        '*': {
          boxSizing: 'content-box',
        },
      },
    },
  } as unknown as Record<string, CSSInterpolation>;
};

/**
 * BubbleChat
 * @param prefixCls
 * @returns
 */
export function useTableStyle(
  prefixCls: string,
  propsToken: Partial<ChatTokenType>,
) {
  return useEditorStyleRegister('md-editor-table', (token) => {
    const editorToken = {
      ...token,
      ...propsToken,
      componentCls: `.${prefixCls}`,
    };

    return [resetComponent(editorToken), genStyle(editorToken)];
  });
}
