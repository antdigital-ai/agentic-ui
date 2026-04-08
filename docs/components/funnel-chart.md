---
title: FunnelChart 漏斗图
atomId: FunnelChart
order: 4
group:
  title: 图文输出
  order: 4
---

# FunnelChart 漏斗图

支持阶段排序、居中对称显示、内置筛选与主题配置，风格与其他图表一致。

## 代码演示

### 基础用法

<code src="../demos/charts/funnel.tsx" background="var(--main-bg-color)" iframe=540></code>
<code src="../demos/charts/funnel-toolbar-filter.tsx" background="var(--main-bg-color)" title="工具栏过滤器" iframe=540></code>
<code src="../demos/charts/funnel-statistic.tsx" background="var(--main-bg-color)" title="统计指标" iframe=540></code>

### 最小宽度控制

<code src="../demos/charts/funnelWithMinWidthBottom.tsx" background="var(--main-bg-color)" iframe=800></code>

### 暗黑主题

<code src="../demos/charts/funnel-dark.tsx" background="#141414" title="暗黑主题" iframe=480></code>

## API

### FunnelChartProps

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| title | 图表标题 | `string` | - | - |
| data | 扁平化数据数组（x 为阶段，y 为数值） | `FunnelChartDataItem[]` | - | - |
| color | 自定义主色 | `string` | - | - |
| width | 图表宽度（px），移动端自适应为 100% | `number \| string` | `600` | - |
| height | 图表高度（px），移动端最大约 80% 屏宽（上限 400） | `number \| string` | `400` | - |
| className | 自定义类名 | `string` | - | - |
| dataTime | 数据时间 | `string` | - | - |
| theme | 图表与容器主题；`dark` 时容器内嵌 Ant Design 暗色算法，工具栏/筛选与画布一致；暗色下图例色块无白边，与浅色视觉区分 | `'dark' \| 'light'` | `'light'` | - |
| showLegend | 是否显示图例 | `boolean` | `true` | - |
| legendPosition | 图例位置 | `'top' \| 'left' \| 'bottom' \| 'right'` | `'bottom'` | - |
| legendAlign | 图例水平对齐方式 | `'start' \| 'center' \| 'end'` | `'start'` | - |
| showPercent | 是否显示百分比（相对第一层） | `boolean` | `true` | - |
| bottomLayerMinWidth | 最底层的最小宽度占比（0-1），相对于最大层的宽度。用于避免数据跨度过大时底层过窄难以交互。非法值（≤0 或 >1）视为不限制 | `number` | `0` | - |
| toolbarExtra | 头部工具条额外按钮 | `React.ReactNode` | - | - |
| typeNames | 类型名称配置，用于图例和数据集标签 | `{ rate?: string; name: string }` | - | - |
| statistic | 统计数据组件配置 | `StatisticConfigType` | - | - |
| renderFilterInToolbar | 是否将过滤器渲染到工具栏（当为 true 时，ChartFilter 会显示在工具栏右侧） | `boolean` | `false` | - |

### ChartContainerProps（继承）

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| classNames | 分层类名：`root`、`toolbar`、`statisticContainer`、`filter`、`wrapper`、`chart` | `ChartClassNames` | - | - |
| loading | 加载态 | `boolean` | `false` | - |
| style | 根容器内联样式 | `React.CSSProperties` | - | - |
| styles | 与各层 DOM 对应的内联样式 | `ChartStyles` | - | - |
| variant | 容器描边变体 | `'outline' \| 'borderless'` | - | - |

### FunnelChartDataItem

| 字段 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| category | 分类（用于外层筛选） | `string` | - | - |
| type | 数据序列名称（默认单序列） | `string` | - | - |
| x | 阶段名（将作为 labels）（必填） | `number \| string` | - | - |
| y | 数值（必填） | `number \| string` | - | - |
| filterLabel | 二级筛选标签（可选） | `string` | - | - |
| ratio | 与下一层的转化率（0-100 或 '80%'），最后一层可为 0；用于绘制两层之间的梯形与文本 | `number \| string` | - | - |

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

- 漏斗采用对称浮动条（Floating Bar）实现，自动按数值降序排列阶段。
- Tooltip 默认显示相对第一层的百分比，可通过 `showPercent` 关闭。
- 当数据跨度过大时（如第一层 10000，最后一层 10），可使用 `bottomLayerMinWidth` 参数保证底层最小宽度，便于用户交互。例如设置 `bottomLayerMinWidth={0.1}` 表示最底层宽度至少为最大层的 10%。
- 使用 `bottomLayerMinWidth` 时，视觉宽度会被调整，但 Tooltip 和标签仍显示真实数据值，**_请根据实际情况合理使用_**。
