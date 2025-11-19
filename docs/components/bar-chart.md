---
title: BarChart 柱状图
atomId: BarChart
group:
  title: 图文输出
  order: 4
---

# BarChart 柱状图

支持垂直/水平、堆叠、多序列以及筛选，含响应式与主题配置。

## 代码演示

<code src="../demos/charts/bar/bar.tsx" background="var(--main-bg-color)" iframe=540></code>
<code src="../demos/charts/bar/bar-stacked.tsx" background="var(--main-bg-color)" title="堆叠柱状图" iframe=540></code>
<code src="../demos/charts/bar/bar-negative.tsx" background="var(--main-bg-color)" title="正负柱状图" iframe=540></code>
<code src="../demos/charts/bar/bar-horizontal.tsx" background="var(--main-bg-color)" title="条形图（横向）" iframe=540></code>
<code src="../demos/charts/bar/bar-horizontal-stacked.tsx" background="var(--main-bg-color)" title="条形堆叠图（横向堆叠）" iframe=540></code>
<code src="../demos/charts/bar/bar-with-labels.tsx" background="var(--main-bg-color)" title="带数据标签" iframe=540></code>
<code src="../demos/charts/bar/bar-max-thickness.tsx" background="var(--main-bg-color)" title="柱子最大宽度控制" iframe=540></code>
<code src="../demos/charts/bar/bar-with-statistic.tsx" background="var(--main-bg-color)" title="指标统计" iframe=540></code>

## API

### BarChartProps

| 属性                  | 类型                                             | 默认值     | 说明                                                                     |
| --------------------- | ------------------------------------------------ | ---------- | ------------------------------------------------------------------------ |
| title                 | `string`                                         | -          | 图表标题                                                                 |
| data                  | `BarChartDataItem[]`                             | -          | 扁平化数据数组                                                           |
| width                 | `number \| string`                               | `600`      | 图表宽度（px），移动端自适应为 100%                                      |
| height                | `number \| string`                               | `400`      | 图表高度（px），移动端最大约 80% 屏宽（上限 400）                        |
| className             | `string`                                         | -          | 自定义类名                                                               |
| dataTime              | `string`                                         | -          | 数据时间                                                                 |
| theme                 | `'dark' \| 'light'`                              | `'light'`  | 主题风格                                                                 |
| color                 | `string \| string[]`                             | -          | 自定义主色；正负图取数组前两位为正/负色，一位则单色                      |
| showLegend            | `boolean`                                        | `true`     | 是否显示图例                                                             |
| legendPosition        | `'top' \| 'left' \| 'bottom' \| 'right'`         | `'bottom'` | 图例位置                                                                 |
| legendAlign           | `'start' \| 'center' \| 'end'`                   | `'start'`  | 图例水平对齐方式                                                         |
| showGrid              | `boolean`                                        | `true`     | 是否显示网格线                                                           |
| xPosition             | `'top' \| 'bottom'`                              | `'bottom'` | X 轴位置                                                                 |
| yPosition             | `'left' \| 'right'`                              | `'left'`   | Y 轴位置                                                                 |
| hiddenX               | `boolean`                                        | `false`    | 是否隐藏 X 轴                                                            |
| hiddenY               | `boolean`                                        | `false`    | 是否隐藏 Y 轴                                                            |
| stacked               | `boolean`                                        | `false`    | 是否堆叠显示多个数据集                                                   |
| indexAxis             | `'x' \| 'y'`                                     | `'x'`      | 轴向：`'x'` 垂直柱状图，`'y'` 水平条形图                                 |
| maxBarThickness       | `number`                                         | -          | 柱子最大宽度                   |
| toolbarExtra          | `React.ReactNode`                                | -          | 头部工具条额外按钮                                                       |
| renderFilterInToolbar | `boolean`                                        | `false`    | 是否将过滤器渲染到工具栏（当为 true 时，ChartFilter 会显示在工具栏右侧） |
| statistic             | `ChartStatisticConfig \| ChartStatisticConfig[]` | -          | ChartStatistic组件配置：object表示单个配置，array表示多个配置            |
| showDataLabels        | `boolean`                                        | `false`    | 是否显示数据标签（在柱子顶部或右侧显示数值）                             |
| dataLabelFormatter    | `(params: DataLabelFormatterParams) => string`   | -          | 数据标签格式化函数，可自定义显示格式（如添加单位、格式化数字）           |

### BarChartDataItem

| 字段        | 类型     | 必填 | 说明                           |
| ----------- | -------- | ---- | ------------------------------ |
| category    | `string` | 是   | 分类（用于外层筛选）           |
| type        | `string` | 是   | 数据序列名称（映射为 dataset） |
| x           | `number` | 是   | 横轴值（将作为 labels）        |
| y           | `number` | 是   | 纵轴值                         |
| xtitle      | `string` | 否   | X 轴标题（从数据中提取）       |
| ytitle      | `string` | 否   | Y 轴标题（从数据中提取）       |
| filterLabel | `string` | 否   | 二级筛选标签（可选）           |

### DataLabelFormatterParams

`dataLabelFormatter` 函数接收的参数对象：

| 字段         | 类型               | 说明                                         |
| ------------ | ------------------ | -------------------------------------------- |
| value        | `number`           | 数据值（堆叠图中为累计总和）                 |
| label        | `string \| number` | 对应坐标轴的标签（如 X 轴标签："Q1"、"1"等） |
| datasetLabel | `string`           | 数据集名称（如 "手机"、"电脑"等）            |
| dataIndex    | `number`           | 数据点在数组中的索引                         |
| datasetIndex | `number`           | 数据集在数组中的索引                         |

### ChartStatisticConfig

`ChartStatisticConfig` 继承自 [ChartStatistic](/components/chart-statistic#chartstatisticprops) 组件的所有属性，详细 API 请参考 [ChartStatistic 文档](/components/chart-statistic)。

| 字段           | 类型                                                                | 默认值      | 说明                                                   |
| -------------- | ------------------------------------------------------------------- | ----------- | ------------------------------------------------------ |
| title          | `string`                                                            | -           | 指标标题                                               |
| tooltip        | `string`                                                            | -           | 鼠标悬停时显示的提示信息                               |
| value          | `number \| string \| null \| undefined`                             | -           | 显示的数值                                             |
| precision      | `number`                                                            | -           | 数值精度（小数点后位数）                               |
| groupSeparator | `string`                                                            | `','`       | 千分位分隔符                                           |
| prefix         | `string`                                                            | `''`        | 数值前缀（如货币符号）                                 |
| suffix         | `string`                                                            | `''`        | 数值后缀（如单位）                                     |
| formatter      | `(value: number \| string \| null \| undefined) => React.ReactNode` | -           | 自定义格式化函数，优先级高于其他格式化选项             |
| className      | `string`                                                            | `''`        | 自定义类名                                             |
| size           | `'small' \| 'default' \| 'large'`                                   | `'default'` | 组件尺寸                                               |
| block          | `boolean`                                                           | `false`     | 是否使用块级布局（弹性占用空间，多个时平分父容器宽度） |
| extra          | `React.ReactNode`                                                   | -           | 右上角自定义内容（图标、按钮等）                       |

## 说明

- `stacked` 为 `true` 时，将按 `type` 将数据叠加显示。
- `indexAxis='y'` 时为横向条形图。
- `hiddenX` 和 `hiddenY` 可以控制坐标轴的显示/隐藏，适用于只展示图表本身而不需要坐标轴的场景。
- `maxBarThickness` 用于限制柱子的最大宽度，特别适用于数据较少时避免柱子过宽的问题。建议值：30-80
- `showDataLabels` 开启时，在柱子顶部（垂直图）或右侧（横向图）显示数值标签；堆叠图中只显示累计总和。
- `dataLabelFormatter` 提供完整的上下文信息（数值、轴标签、数据集名称等），可灵活自定义标签显示格式。
- `statistic` 属性支持数组形式，可同时渲染多个静态数据组件，如 `[{title: '总销量', value: 1200}, {title: '增长率', value: '15%'}]`。
