---
title: BoxPlotChart 箱线图
atomId: BoxPlotChart
order: 8
group:
  title: 图文输出
  order: 4
---

# BoxPlotChart 箱线图

箱线图用于展示数据分布的统计图表，自动计算最小值、Q1、中位数、Q3、最大值，支持多系列分组和异常值显示。

## 代码演示

<code src="../demos/charts/boxplot/boxplot.tsx" background="var(--main-bg-color)" iframe=540></code>
<code src="../demos/charts/boxplot/boxplot-multi-series.tsx" background="var(--main-bg-color)" title="多系列箱线图" iframe=540></code>
<code src="../demos/charts/boxplot/boxplot-dark.tsx" background="#141414" title="暗黑主题" iframe=520></code>

## API

### BoxPlotChartProps

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| title | 图表标题 | `string` | - | - |
| data | 扁平化数据数组 | `BoxPlotChartDataItem[]` | - | - |
| width | 图表宽度（px），移动端自适应为 100% | `number \| string` | `600` | - |
| height | 图表高度（px），移动端最大约 80% 屏宽（上限 400） | `number \| string` | `400` | - |
| className | 自定义类名 | `string` | - | - |
| classNames | 自定义CSS类名（支持对象格式，为每层DOM设置类名） | `ChartClassNames` | - | - |
| styles | 自定义样式对象 | `ChartStyles` | - | - |
| dataTime | 数据时间 | `string` | - | - |
| theme | 图表与容器主题；`dark` 时容器内嵌 Ant Design 暗色算法，工具栏/筛选与画布一致；暗色下图例色块无白边，与浅色视觉区分 | `'dark' \| 'light'` | `'light'` | - |
| color | 自定义主色，支持 CSS 变量 | `string \| string[]` | - | - |
| showLegend | 是否显示图例 | `boolean` | `true` | - |
| legendPosition | 图例位置 | `'top' \| 'left' \| 'bottom' \| 'right'` | `'bottom'` | - |
| showGrid | 是否显示网格线 | `boolean` | `true` | - |
| xAxisLabel | X 轴标签 | `string` | - | - |
| yAxisLabel | Y 轴标签 | `string` | - | - |
| showOutliers | 是否显示异常点 | `boolean` | `true` | - |
| toolbarExtra | 头部工具条额外按钮 | `React.ReactNode` | - | - |
| renderFilterInToolbar | 是否将过滤器渲染到工具栏 | `boolean` | `false` | - |
| statistic | ChartStatistic组件配置 | `ChartStatisticConfig \| ChartStatisticConfig[]` | - | - |
| loading | 是否显示加载状态 | `boolean` | `false` | - |

### BoxPlotChartDataItem

| 字段 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| label | X 轴标签（必填） | `string` | - | - |
| values | 原始数据值数组（必填） | `number[]` | - | - |
| type | 数据系列（用于分组显示） | `string` | - | - |
| category | 分类（用于筛选） | `string` | - | - |
| filterLabel | 二级筛选标签（可选） | `string` | - | - |

## 说明

### 统计值计算

组件自动从原始数据数组计算以下统计值：

- **最小值（min）**: 非异常值中的最小值
- **Q1（第一四分位数）**: 25% 分位数
- **中位数（median）**: 50% 分位数
- **Q3（第三四分位数）**: 75% 分位数
- **最大值（max）**: 非异常值中的最大值
- **均值（mean）**: 平均值
- **异常值（outliers）**: 超出 1.5 × IQR 范围的值

### 异常值检测

使用 IQR（四分位距）方法检测异常值：

- IQR = Q3 - Q1
- 下界 = Q1 - 1.5 × IQR
- 上界 = Q3 + 1.5 × IQR
- 超出上下界的值被标记为异常值

### 多系列支持

当数据包含 `type` 字段时，组件自动按类型分组显示多个系列，便于对比不同组别的数据分布。

### 筛选功能

当数据包含 `category` 字段时，组件自动显示筛选器，支持按分类切换数据视图。
