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

| 属性                  | 类型                                             | 默认值     | 说明                                                                                                               |
| --------------------- | ------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| title                 | `string`                                         | -          | 图表标题                                                                                                           |
| data                  | `BoxPlotChartDataItem[]`                         | -          | 扁平化数据数组                                                                                                     |
| width                 | `number \| string`                               | `600`      | 图表宽度（px），移动端自适应为 100%                                                                                |
| height                | `number \| string`                               | `400`      | 图表高度（px），移动端最大约 80% 屏宽（上限 400）                                                                  |
| className             | `string`                                         | -          | 自定义类名                                                                                                         |
| classNames            | `ChartClassNames`                                | -          | 自定义CSS类名（支持对象格式，为每层DOM设置类名）                                                                   |
| styles                | `ChartStyles`                                    | -          | 自定义样式对象                                                                                                     |
| dataTime              | `string`                                         | -          | 数据时间                                                                                                           |
| theme                 | `'dark' \| 'light'`                              | `'light'`  | 图表与容器主题；`dark` 时容器内嵌 Ant Design 暗色算法，工具栏/筛选与画布一致；暗色下图例色块无白边，与浅色视觉区分 |
| color                 | `string \| string[]`                             | -          | 自定义主色，支持 CSS 变量                                                                                          |
| showLegend            | `boolean`                                        | `true`     | 是否显示图例                                                                                                       |
| legendPosition        | `'top' \| 'left' \| 'bottom' \| 'right'`         | `'bottom'` | 图例位置                                                                                                           |
| showGrid              | `boolean`                                        | `true`     | 是否显示网格线                                                                                                     |
| xAxisLabel            | `string`                                         | -          | X 轴标签                                                                                                           |
| yAxisLabel            | `string`                                         | -          | Y 轴标签                                                                                                           |
| showOutliers          | `boolean`                                        | `true`     | 是否显示异常点                                                                                                     |
| toolbarExtra          | `React.ReactNode`                                | -          | 头部工具条额外按钮                                                                                                 |
| renderFilterInToolbar | `boolean`                                        | `false`    | 是否将过滤器渲染到工具栏                                                                                           |
| statistic             | `ChartStatisticConfig \| ChartStatisticConfig[]` | -          | ChartStatistic组件配置                                                                                             |
| loading               | `boolean`                                        | `false`    | 是否显示加载状态                                                                                                   |

### BoxPlotChartDataItem

| 字段        | 类型       | 必填 | 说明                     |
| ----------- | ---------- | ---- | ------------------------ |
| label       | `string`   | 是   | X 轴标签                 |
| values      | `number[]` | 是   | 原始数据值数组           |
| type        | `string`   | 否   | 数据系列（用于分组显示） |
| category    | `string`   | 否   | 分类（用于筛选）         |
| filterLabel | `string`   | 否   | 二级筛选标签（可选）     |

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
