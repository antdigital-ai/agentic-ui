import { genStyleHooks, type GenStyleFn } from '../../../../Hooks/useStyle';

const genStyle: GenStyleFn<'ChartContainer'> = (token) => {
  return {
    [token.componentCls]: {
      // 图表容器基础样式
      position: 'relative',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      // 响应式边框样式
      borderRadius: '6px',
      padding: '12px',
      minWidth: '300px',

      // 浅色主题边框
      '&&-light-theme': {
        border: '1px solid var(--color-gray-border-light)',
        backgroundColor: 'var(--color-gray-bg-card-white)',
      },

      // 深色主题：略浅于纯黑页面底，与雷达等图表的「卡片」层次一致
      '&&-dark-theme': {
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: 'var(--color-gray-bg-page-dark)',
      },

      // 移动端适配
      '&&-mobile': {
        borderRadius: '6px',
        padding: '12px',
        margin: '0 auto',
        maxWidth: '100%',
        minWidth: '225px',
      },

      // 桌面端适配
      '&&-desktop': {
        borderRadius: '8px',
        padding: '16px',
        margin: 'initial',
        maxWidth: 'none',
      },

      '&&-borderless': {
        border: 'none!important',
        padding: 0,
      },

      // 错误边界容器样式（简化版，使用 antd Result 组件）
      '&&-error-boundary': {
        // antd Result 组件已经有完善的样式，这里只需要基础容器样式
        minHeight: '200px',
      },

      // 统计数据容器样式
      '&-statistic-container': {
        display: 'flex',
        gap: '16px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      },

      // 图表包装器样式
      '&-wrapper': {
        position: 'relative',
        width: '100%',
        height: '100%',
      },
    },
  };
};

/**
 * 样式钩子
 * @param baseClassName 基础类名
 * @returns 样式相关对象
 */
const useGenStyle = genStyleHooks('ChartContainer', genStyle);

export const useStyle = (baseClassName: string) => {
  const [, hashId] = useGenStyle(baseClassName);
  return { hashId };
};
