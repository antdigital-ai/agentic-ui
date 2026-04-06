---
title: LineChart 折线图
atomId: LineChart
order: 5
group:
  title: 图文输出
  order: 4
---

# LineChart 折线图

支持多序列、筛选、图例与网格线配置，含移动端响应式优化。

## 代码演示

<code src="../demos/charts/line.tsx" background="var(--main-bg-color)" iframe=540></code>
<code src="../demos/charts/line-toolbar-filter.tsx" background="var(--main-bg-color)" title="工具栏过滤器" iframe=540></code>
<code src="../demos/charts/line-statistic.tsx" background="var(--main-bg-color)" title="统计指标" iframe=540></code>
<code src="../demos/charts/line-dark.tsx" background="#141414" title="暗黑主题" iframe=520></code>

## API

### LineChartProps

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| title | 图表标题 | `string` | - | - |
| data | 扁平化数据数组 | `LineChartDataItem[]` | - | - |
| width | 图表宽度（px），移动端自适应为 100% | `number \| string` | `600` | - |
| height | 图表高度（px），移动端最大约 80% 屏宽（上限 400） | `number \| string` | `400` | - |
| className | 自定义类名 | `string` | - | - |
| dataTime | 数据时间 | `string` | - | - |
| theme | 图表与容器主题；`dark` 时容器内嵌 Ant Design 暗色算法，工具栏/筛选与画布一致；暗色下图例色块无白边，与浅色视觉区分 | `'dark' \| 'light'` | `'light'` | - |
| color | 自定义主色；数组按序对应各数据序列 | `string \| string[]` | - | - |
| showLegend | 是否显示图例 | `boolean` | `true` | - |
| legendPosition | 图例位置 | `'top' \| 'left' \| 'bottom' \| 'right'` | `'bottom'` | - |
| legendAlign | 图例水平对齐方式 | `'start' \| 'center' \| 'end'` | `'start'` | - |
| showGrid | 是否显示网格线 | `boolean` | `true` | - |
| xPosition | X 轴位置 | `'top' \| 'bottom'` | `'bottom'` | - |
| yPosition | Y 轴位置 | `'left' \| 'right'` | `'left'` | - |
| hiddenX | 是否隐藏 X 轴 | `boolean` | `false` | - |
| hiddenY | 是否隐藏 Y 轴 | `boolean` | `false` | - |
| toolbarExtra | 头部工具条额外按钮 | `React.ReactNode` | - | - |
| renderFilterInToolbar | 是否将过滤器渲染到工具栏（当为 true 时，ChartFilter 会显示在工具栏右侧） | `boolean` | `false` | - |
| statistic | ChartStatistic组件配置：object表示单个配置，array表示多个配置 | `ChartStatisticConfig \| ChartStatisticConfig[]` | - | - |

### ChartContainerProps（继承）

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| classNames | 分层类名：`root`、`toolbar`、`statisticContainer`、`filter`、`wrapper`、`chart` | `ChartClassNames` | - | - |
| loading | 加载态 | `boolean` | `false` | - |
| style | 根容器内联样式 | `React.CSSProperties` | - | - |
| styles | 与各层 DOM 对应的内联样式 | `ChartStyles` | - | - |
| variant | 容器描边变体 | `'outline' \| 'borderless'` | - | - |

### LineChartDataItem

| 字段 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| category | 分类（用于外层筛选）（必填） | `string` | - | - |
| type | 数据序列名称（映射为 dataset）（必填） | `string` | - | - |
| x | 横轴值（将自动排序并作为 labels）（必填） | `number` | - | - |
| y | 纵轴值（必填） | `number` | - | - |
| xtitle | X 轴标题（从数据中提取） | `string` | - | - |
| ytitle | Y 轴标题（从数据中提取） | `string` | - | - |
| filterLabel | 二级筛选标签（可选） | `string` | - | - |

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

- 自动按 `x` 升序生成横轴，按 `type` 组装数据集并分配调色板。
- `hiddenX` 和 `hiddenY` 可以控制坐标轴的显示/隐藏，适用于只展示图表本身而不需要坐标轴的场景。
- `statistic` 属性支持数组形式，可同时渲染多个静态数据组件，如 `[{title: '总访问量', value: 8650}, {title: '今日新增', value: 234}]`。
