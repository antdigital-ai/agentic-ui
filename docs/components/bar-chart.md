---
title: BarChart 柱状图
atomId: BarChart
order: 2
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
<code src="../demos/charts/bar/bar-chinese-currency.tsx" background="var(--main-bg-color)" title="中文金额（亿元/万元/元）" iframe=540></code>
<code src="../demos/charts/bar/bar-dark.tsx" background="#141414" title="暗黑主题" iframe=520></code>

## API

### BarChartProps

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| title | 图表标题 | `string` | - | - |
| data | 扁平化数据数组 | `BarChartDataItem[]` | - | - |
| width | 图表宽度（px），移动端自适应为 100% | `number \| string` | `600` | - |
| height | 图表高度（px），移动端最大约 80% 屏宽（上限 400） | `number \| string` | `400` | - |
| className | 自定义类名 | `string` | - | - |
| dataTime | 数据时间 | `string` | - | - |
| theme | 图表与容器主题；`dark` 时容器内嵌 Ant Design 暗色算法，工具栏/筛选与画布一致；暗色下图例色块无白边，与浅色视觉区分 | `'dark' \| 'light'` | `'light'` | - |
| color | 自定义主色；正负图取数组前两位为正/负色，一位则单色 | `string \| string[]` | - | - |
| showLegend | 是否显示图例 | `boolean` | `true` | - |
| legendPosition | 图例位置 | `'top' \| 'left' \| 'bottom' \| 'right'` | `'bottom'` | - |
| legendAlign | 图例水平对齐方式 | `'start' \| 'center' \| 'end'` | `'start'` | - |
| showGrid | 是否显示网格线 | `boolean` | `true` | - |
| xPosition | X 轴位置 | `'top' \| 'bottom'` | `'bottom'` | - |
| yPosition | Y 轴位置 | `'left' \| 'right'` | `'left'` | - |
| hiddenX | 是否隐藏 X 轴 | `boolean` | `false` | - |
| hiddenY | 是否隐藏 Y 轴 | `boolean` | `false` | - |
| stacked | 是否堆叠显示多个数据集 | `boolean` | `false` | - |
| indexAxis | 轴向：`'x'` 垂直柱状图，`'y'` 水平条形图 | `'x' \| 'y'` | `'x'` | - |
| maxBarThickness | 柱子最大宽度 | `number` | - | - |
| toolbarExtra | 头部工具条额外按钮 | `React.ReactNode` | - | - |
| renderFilterInToolbar | 是否将过滤器渲染到工具栏（当为 true 时，ChartFilter 会显示在工具栏右侧） | `boolean` | `false` | - |
| chartOptions | 与默认 Chart.js 选项深度合并，用于细调坐标轴、动画等 | `Partial<ChartOptions<'bar'>>` | - | - |
| statistic | ChartStatistic组件配置：object表示单个配置，array表示多个配置 | `ChartStatisticConfig \| ChartStatisticConfig[]` | - | - |
| showDataLabels | 是否显示数据标签（在柱子顶部或右侧显示数值） | `boolean` | `false` | - |
| dataLabelFormatter | 数据标签格式化函数，可自定义显示格式（如添加单位、格式化数字） | `(params: DataLabelFormatterParams) => string` | - | - |

### ChartContainerProps（继承）

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| classNames | 分层类名：`root`、`toolbar`、`statisticContainer`、`filter`、`wrapper`、`chart` | `ChartClassNames` | - | - |
| loading | 加载态 | `boolean` | `false` | - |
| style | 根容器内联样式 | `React.CSSProperties` | - | - |
| styles | 与各层 DOM 对应的内联样式 | `ChartStyles` | - | - |
| variant | 容器描边变体 | `'outline' \| 'borderless'` | - | - |

### BarChartDataItem

| 字段 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| category | 分类（用于外层筛选）（必填） | `string` | - | - |
| type | 数据序列名称（映射为 dataset）（必填） | `string` | - | - |
| x | 横轴值（将作为 labels）（必填） | `number` | - | - |
| y | 纵轴值（必填） | `number` | - | - |
| xtitle | X 轴标题（从数据中提取） | `string` | - | - |
| ytitle | Y 轴标题（从数据中提取） | `string` | - | - |
| filterLabel | 二级筛选标签（可选） | `string` | - | - |

### DataLabelFormatterParams

`dataLabelFormatter` 函数接收的参数对象：

| 字段 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| value | 数据值（堆叠图中为累计总和） | `number` | - | - |
| label | 对应坐标轴的标签（如 X 轴标签："Q1"、"1"等） | `string \| number` | - | - |
| datasetLabel | 数据集名称（如 "手机"、"电脑"等） | `string` | - | - |
| dataIndex | 数据点在数组中的索引 | `number` | - | - |
| datasetIndex | 数据集在数组中的索引 | `number` | - | - |

### ChartStatisticConfig

`ChartStatisticConfig` 继承自 [ChartStatistic](/components/chart-statistic#chartstatisticprops) 组件的所有属性，详细 API 请参考 [ChartStatistic 文档](/components/chart-statistic)。

| 字段 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| title | 指标标题 | `string` | - | - |
| tooltip | 鼠标悬停时显示的提示信息 | `string` | - | - |
| value | 显示的数值 | `number \| string \| null \| undefined` | - | - |
| precision | 数值精度（小数点后位数） | `number` | - | - |
| groupSeparator | 千分位分隔符 | `string` | `','` | - |
| prefix | 数值前缀（如货币符号） | `string` | `''` | - |
| suffix | 数值后缀（如单位） | `string` | `''` | - |
| formatter | 自定义格式化函数，优先级高于其他格式化选项 | `(value: number \| string \| null \| undefined) => React.ReactNode` | - | - |
| className | 自定义类名 | `string` | `''` | - |
| size | 组件尺寸 | `'small' \| 'default' \| 'large'` | `'default'` | - |
| block | 是否使用块级布局（弹性占用空间，多个时平分父容器宽度） | `boolean` | `false` | - |
| extra | 右上角自定义内容（图标、按钮等） | `React.ReactNode` | - | - |

## 说明

- `chartOptions` 类型中的 `ChartOptions` 来自 `chart.js`，用于在默认配置之上做增量合并。
- `stacked` 为 `true` 时，将按 `type` 将数据叠加显示。
- `indexAxis='y'` 时为横向条形图。
- `hiddenX` 和 `hiddenY` 可以控制坐标轴的显示/隐藏，适用于只展示图表本身而不需要坐标轴的场景。
- `maxBarThickness` 用于限制柱子的最大宽度，特别适用于数据较少时避免柱子过宽的问题。建议值：30-80
- `showDataLabels` 开启时，在柱子顶部（垂直图）或右侧（横向图）显示数值标签；堆叠图中只显示累计总和。
- `dataLabelFormatter` 提供完整的上下文信息（数值、轴标签、数据集名称等），可灵活自定义标签显示格式。
- `statistic` 属性支持数组形式，可同时渲染多个静态数据组件，如 `[{title: '总销量', value: 1200}, {title: '增长率', value: '15%'}]`。
