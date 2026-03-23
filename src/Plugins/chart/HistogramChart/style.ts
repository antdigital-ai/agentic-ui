import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      // 统计数据容器样式
      '&-statistic-container': {
        display: 'flex',
        gap: '16px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      },

      // 直方图容器样式
      '.chart-wrapper': {
        width: '100%',
        height: 'calc(100% - 120px)',
        minHeight: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      },

      // 确保图表不会超出容器边界
      canvas: {
        maxWidth: '100% !important',
        maxHeight: '100% !important',
      },

      // 移动端响应式样式
      '@media (max-width: 768px)': {
        '.chart-wrapper': {
          height: 'calc(100% - 100px)',
          minHeight: 250,
        },

        '.chart-title': {
          fontSize: 14,
          marginBottom: 8,
          textAlign: 'center',
        },

        '.chart-filter': {
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 12,

          '.filter-button': {
            fontSize: 12,
            padding: '6px 12px',
          },
        },
      },

      // 超小屏幕优化 (375px以下)
      '@media (max-width: 375px)': {
        padding: 8,

        '.chart-wrapper': {
          minHeight: 220,
        },
      },
    },
  };
};

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('HistogramChart', (token) => {
    const histogramToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(histogramToken)];
  });
}