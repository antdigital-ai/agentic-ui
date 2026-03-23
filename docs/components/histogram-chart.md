---
title: HistogramChart 直方图
atomId: HistogramChart
order: 9
group:
  title: 图文输出
  order: 4
---

# HistogramChart 直方图

直方图用于展示数据分布频率，自动使用 Sturges 规则计算分箱数量，支持多系列堆叠和频率显示。

## 代码演示

<code src="../demos/charts/histogram/histogram.tsx" background="var(--main-bg-color)" iframe=540></code>
<code src="../demos/charts/histogram/histogram-multi-series.tsx" background="var(--main-bg-color)" title="多系列直方图" iframe=540></code>
<code src="../demos/charts/histogram/histogram-frequency.tsx" background="var(--main-bg-color)" title="频率直方图" iframe=540></code>
<code src="../demos/charts/histogram/histogram-custom-bins.tsx" background="var(--main-bg-color)" title="自定义分箱数量" iframe=540></code>
<code src="../demos/charts/histogram/histogram-with-filter.tsx" background="var(--main-bg-color)" title="带筛选的直方图" iframe=540></code>
<code src="../demos/charts/histogram/histogram-dark.tsx" background="#141414" title="暗黑主题" iframe=520></code>

## API

### HistogramChartProps

| 属性                  | 类型                                             | 默认值     | 说明                                                                                                               |
| --------------------- | ------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| title                 | `string`                                         | -          | 图表标题                                                                                                           |
| data                  | `HistogramChartDataItem[]`                       | -          | 扁平化数据数组                                                                                                     |
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
| stacked               | `boolean`                                        | `true`     | 是否堆叠显示                                                                                                       |
| binCount              | `number`                                         | -          | 自定义分箱数量（不设置则自动计算）                                                                                 |
| showFrequency         | `boolean`                                        | `false`    | 是否显示频率而非计数                                                                                               |
| toolbarExtra          | `React.ReactNode`                                | -          | 头部工具条额外按钮                                                                                                 |
| renderFilterInToolbar | `boolean`                                        | `false`    | 是否将过滤器渲染到工具栏                                                                                           |
| statistic             | `ChartStatisticConfig \| ChartStatisticConfig[]` | -          | ChartStatistic组件配置                                                                                             |
| loading               | `boolean`                                        | `false`    | 是否显示加载状态                                                                                                   |

### HistogramChartDataItem

| 字段        | 类型     | 必填 | 说明                     |
| ----------- | -------- | ---- | ------------------------ |
| value       | `number` | 是   | 原始数据值               |
| type        | `string` | 否   | 数据系列（用于分组显示） |
| category    | `string` | 否   | 分类（用于筛选）         |
| filterLabel | `string` | 否   | 二级筛选标签（可选）     |

## 说明

### 自动分箱

组件默认使用 **Sturges 规则** 自动计算分箱数量：

```
k = ceil(log2(n) + 1)
```

其中 `n` 为数据点数量。这是一种适用于正态分布数据的简单规则。

### 自定义分箱

通过 `binCount` 属性可以手动指定分箱数量，适用于：

- 需要固定分箱数量的场景
- 对分箱精度有特定要求的场景
- 需要对比不同数据集时保持一致的分箱

### 频率模式

默认显示计数（每个分箱中的数据点数量），设置 `showFrequency={true}` 可切换为显示频率（占比），便于：

- 比较不同样本量的数据分布
- 查看数据的相对分布而非绝对数量

### 多系列支持

当数据包含 `type` 字段时，组件自动按类型分组显示多个系列：

- `stacked={true}`（默认）：堆叠显示，便于查看总体分布
- `stacked={false}`：并排显示，便于对比各组分布

### 筛选功能

当数据包含 `category` 字段时，组件自动显示筛选器，支持按分类切换数据视图。
