import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../../../hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [`${token.componentCls}-container`]: {
      // 雷达图容器样式
      [`${token.componentCls}-chart-wrapper`]: {
        width: '100%',
        height: 'calc(100% - 120px)', // 减去头部和筛选器的高度
        minHeight: '300px', // 最小高度
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden', // 防止内容溢出
      },

      // 统计数据容器样式
      [`${token.componentCls}-statistic-container`]: {
        display: 'flex',
        gap: '16px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      },

      // 确保图表不会超出容器边界
      canvas: {
        maxWidth: '100% !important',
        maxHeight: '100% !important',
      },

      // 移动端响应式样式
      '@media (max-width: 768px)': {
        // 移动端优化
        [`${token.componentCls}-chart-wrapper`]: {
          height: 'calc(100% - 100px)', // 移动端减少更多空间
          minHeight: '250px', // 移动端最小高度
        },

        // 移动端图表标题样式优化
        [`${token.componentCls}-chart-title`]: {
          fontSize: '14px',
          marginBottom: '8px',
          textAlign: 'center',
        },

        // 移动端筛选器样式优化
        [`${token.componentCls}-chart-filter`]: {
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '12px',

          [`${token.componentCls}-filter-button`]: {
            fontSize: '12px',
            padding: '6px 12px',
          },
        },

        // 雷达图特定的移动端优化
        [`${token.componentCls}-chart-legend`]: {
          // 移动端图例样式
          flexDirection: 'column',
          alignItems: 'center',

          [`${token.componentCls}-legend-item`]: {
            margin: '2px 8px',
            fontSize: '10px',
          },
        },

        // 优化雷达图的坐标轴标签
        [`${token.componentCls}-radar-axis-labels`]: {
          fontSize: '10px',
        },
      },

      // 超小屏幕优化 (375px以下)
      '@media (max-width: 375px)': {
        padding: '8px',

        [`${token.componentCls}-chart-wrapper`]: {
          minHeight: '220px',
        },

        // 雷达图在小屏幕上的特殊优化
        [`${token.componentCls}-radar-point-labels`]: {
          fontSize: '9px',
        },
      },
    },
  };
};

/**
 * RadarChart Style
 * @param prefixCls
 * @returns
 */
export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('RadarChart', (token) => {
    const radarChartToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };

    return [resetComponent(radarChartToken), genStyle(radarChartToken)];
  });
}
