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

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| title | 图表标题 | `string` | - | - |
| data | 扁平化数据数组 | `HistogramChartDataItem[]` | - | - |
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
| stacked | 是否堆叠显示 | `boolean` | `true` | - |
| binCount | 自定义分箱数量（不设置则自动计算） | `number` | - | - |
| showFrequency | 是否显示频率而非计数 | `boolean` | `false` | - |
| toolbarExtra | 头部工具条额外按钮 | `React.ReactNode` | - | - |
| renderFilterInToolbar | 是否将过滤器渲染到工具栏 | `boolean` | `false` | - |
| statistic | ChartStatistic组件配置 | `ChartStatisticConfig \| ChartStatisticConfig[]` | - | - |
| loading | 是否显示加载状态 | `boolean` | `false` | - |

### HistogramChartDataItem

| 字段 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| value | 原始数据值（必填） | `number` | - | - |
| type | 数据系列（用于分组显示） | `string` | - | - |
| category | 分类（用于筛选） | `string` | - | - |
| filterLabel | 二级筛选标签（可选） | `string` | - | - |

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
