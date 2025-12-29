import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      display: 'flex',
      flexDirection: 'column',

      '&-toolbar-wrapper': {
        marginBottom: 16,
        [`@media (max-width: 768px)`]: {
          marginBottom: 12,
        },
      },

      '&-content': {
        display: 'grid',
        gap: 16,
        gridTemplateColumns:
          'repeat(auto-fit, minmax(var(--donut-item-min-width, 200px), 1fr))',
        [`@media (max-width: 480px)`]: {
          gap: 8,
        },
      },

      '&-toolbar': {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 8,
        [`@media (max-width: 768px)`]: {
          flexDirection: 'column',
          gap: 8,
          marginBottom: 6,
        },
      },

      '&-chart-wrapper': {
        [`@media (max-width: 768px)`]: {
          marginBottom: 12,
        },
      },

      '&-row': {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        [`@media (max-width: 768px)`]: {
          flexDirection: 'column',
          alignItems: 'stretch',
        },
      },

      '&-chart': {
        width: 'var(--donut-chart-width, 200px)',
        height: 'var(--donut-chart-height, 200px)',
        [`@media (max-width: 768px)`]: {
          alignSelf: 'center',
          marginBottom: 8,
        },
      },

      '&-single': {
        width: '100%',
        height: 'var(--donut-chart-height, 200px)',
        [`@media (max-width: 768px)`]: {
          height: 'var(--donut-chart-height, 180px)',
        },
      },

      '&-legend': {
        marginLeft: 12,
        [`@media (max-width: 768px)`]: {
          marginLeft: 0,
          marginTop: 8,
          maxHeight: '120px',
          overflowY: 'auto',
        },
      },

      '&-legend-item': {
        display: 'flex',
        alignItems: 'center',
        fontSize: 12,
        padding: '4px 0',
        [`@media (max-width: 768px)`]: {
          fontSize: 11,
          marginBottom: 4,
          padding: '4px 0',
          minHeight: '24px',
        },
      },

      '&-legend-color': {
        display: 'inline-block',
        width: 12,
        height: 12,
        borderRadius: 4,
        background: 'var(--donut-legend-color, #ccc)',
        marginRight: 6,
        flexShrink: 0,
        [`@media (max-width: 768px)`]: {
          width: 10,
          height: 10,
          borderRadius: 4,
          marginRight: 4,
        },
      },

      '&-legend-label': {
        flex: 1,
        color: '#767E8B',
        fontSize: 13,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        [`@media (max-width: 768px)`]: {
          fontSize: 11,
          flex: '0 1 auto',
          minWidth: '60px',
        },
      },

      '&-legend-value': {
        color: '#343A45',
        fontSize: 13,
        fontWeight: 500,
        marginLeft: 15,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        [`@media (max-width: 768px)`]: {
          fontSize: 11,
          fontWeight: 400,
          marginLeft: 8,
        },
      },

      '&-legend-percent': {
        marginLeft: 8,
        fontSize: 12,
        color: '#343A45',
        [`@media (max-width: 768px)`]: {
          marginLeft: 0,
          fontSize: 10,
          marginTop: 1,
        },
      },

      '&-statistic-container': {
        display: 'flex',
        gap: '16px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      },

      // 响应式网格调整
      [`@media (max-width: 768px)`]: {
        gap: 12,
        gridTemplateColumns: '1fr',
      },

      [`@media (max-width: 480px)`]: {
        gap: 8,
      },
    },
  };
};

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('DonutChart', (token) => {
    const donutToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(donutToken)];
  });
}
