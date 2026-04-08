---
title: ScatterChart 散点图
atomId: ScatterChart
order: 7
group:
  title: 图文输出
  order: 4
---

# ScatterChart 散点图

用于展示二维坐标的离散点分布，支持分类与二级筛选，含响应式优化。

## 代码演示

<code src="../demos/charts/scatter.tsx" background="var(--main-bg-color)" iframe=540></code>
<code src="../demos/charts/scatter-toolbar-filter.tsx" background="var(--main-bg-color)" title="工具栏过滤器" iframe=540></code>
<code src="../demos/charts/scatter-statistic.tsx" background="var(--main-bg-color)" title="统计指标" iframe=540></code>
<code src="../demos/charts/scatter-dark.tsx" background="#141414" title="暗黑主题" iframe=520></code>

## API

### ScatterChartProps

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| data | 扁平化数据数组 | `ScatterChartDataItem[]` | - | - |
| title | 图表标题 | `string` | - | - |
| width | 宽度（px），移动端自适应为 100% | `number \| string` | `800` | - |
| height | 高度（px），移动端最大约 80% 屏宽（上限 400） | `number \| string` | `600` | - |
| className | 自定义类名 | `string` | - | - |
| toolbarExtra | 头部工具条额外按钮 | `React.ReactNode` | - | - |
| renderFilterInToolbar | 是否将过滤器渲染到工具栏（当为 true 时，ChartFilter 会显示在工具栏右侧） | `boolean` | `false` | - |
| dataTime | 数据时间 | `string` | - | - |
| theme | 图表与容器主题；`dark` 时容器内嵌 Ant Design 暗色算法；图例为实心色块并与折线图一致 | `'dark' \| 'light'` | `'light'` | - |
| xUnit | X 轴单位 | `string` | `'月'` | - |
| yUnit | Y 轴单位 | `string` | - | - |
| xAxisLabel | X 轴标签 | `string` | - | - |
| yAxisLabel | Y 轴标签 | `string` | - | - |
| xPosition | X 轴位置 | `'top' \| 'bottom'` | `'bottom'` | - |
| yPosition | Y 轴位置 | `'left' \| 'right'` | `'left'` | - |
| hiddenX | 是否隐藏 X 轴 | `boolean` | `false` | - |
| hiddenY | 是否隐藏 Y 轴 | `boolean` | `false` | - |
| showGrid | 是否显示网格线 | `boolean` | `true` | - |
| color | 自定义主色；数组按序对应各数据序列 | `string \| string[]` | - | - |
| textMaxWidth | 图例文字最大宽度（px），超出截断并加省略号 | `number` | `80` | - |
| statistic | 指标卡配置，单个对象或数组 | `ChartStatisticConfig \| ChartStatisticConfig[]` | - | - |
| xMin | X 轴最小值；不传时从数据自动推算（含 10% 边距） | `number` | - | - |
| xMax | X 轴最大值；不传时从数据自动推算（含 10% 边距） | `number` | - | - |
| yMin | Y 轴最小值；不传时从数据自动推算（含 10% 边距） | `number` | - | - |
| yMax | Y 轴最大值；不传时从数据自动推算（含 10% 边距） | `number` | - | - |

### ChartContainerProps（继承）

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| classNames | 分层类名：`root`、`toolbar`、`statisticContainer`、`filter`、`wrapper`、`chart` | `ChartClassNames` | - | - |
| loading | 加载态 | `boolean` | `false` | - |
| style | 根容器内联样式 | `React.CSSProperties` | - | - |
| styles | 与各层 DOM 对应的内联样式 | `ChartStyles` | - | - |
| variant | 容器描边变体 | `'outline' \| 'borderless'` | - | - |

### ScatterChartDataItem

| 字段 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| category | 分类（用于外层筛选） | `string` | - | - |
| type | 数据序列名称（映射为 dataset） | `string` | - | - |
| x | 横坐标（必填） | `number \| string` | - | - |
| y | 纵坐标（必填） | `number \| string` | - | - |
| filterLabel | 二级筛选标签（可选，支持"全部"） | `string` | - | - |

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

- 移动端会减小点的半径与 hover 半径以提升观感。
- `hiddenX` 和 `hiddenY` 可以控制坐标轴的显示/隐藏，适用于只展示图表本身而不需要坐标轴的场景。
- 坐标轴范围默认根据实际数据自动推算，并附加约 10% 的边距以确保边界点可见。可通过 `xMin`/`xMax`/`yMin`/`yMax` 固定范围，如需 Y 轴固定 0–100 可传 `yMin={0} yMax={100}`。
- 刻度步长（`stepSize`）同样依据范围自动计算，大范围数据（如 x: 1–4892, y: 1000–25000）会自动选用合适的步长，无需手动配置。
