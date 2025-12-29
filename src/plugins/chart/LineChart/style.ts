import {
  ChatTokenType,
  GenerateStyle,
  useEditorStyleRegister,
} from '../../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      // 折线图容器样式

      // 统计数据容器样式
      '&-statistic-container': {
        display: 'flex',
        gap: '16px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      },

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
        // 移动端优化
        '.chart-wrapper': {
          height: 'calc(100% - 100px)', // 移动端减少更多空间
          minHeight: 250, // 移动端最小高度
        },

        // 移动端图表标题样式优化
        '.chart-title': {
          fontSize: 14,
          marginBottom: 8,
          textAlign: 'center',
        },

        // 移动端筛选器样式优化
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
  return useEditorStyleRegister('LineChart', (token) => {
    const lineToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [genStyle(lineToken)];
  });
}
