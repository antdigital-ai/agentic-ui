---
title: DonutChart 环形图
atomId: DonutChart
order: 3
group:
  title: 图文输出
  order: 4
---

# DonutChart 环形图

支持单值/多值、自动分类、中心文本、筛选与工具栏，移动端优化良好。

## 代码演示

<code src="../demos/charts/donut/donut-single.tsx" background="var(--main-bg-color)" title="单值" iframe=450></code>
<code src="../demos/charts/donut/donut-single-categorized.tsx" background="var(--main-bg-color)" title="单值-带分类" iframe=540></code>
<code src="../demos/charts/donut/donut-multi.tsx" background="var(--main-bg-color)" title="多值" iframe=540></code>
<code src="../demos/charts/donut/donut-multi-categorized.tsx" background="var(--main-bg-color)" title="多值-带分类" iframe=540></code>
<code src="../demos/charts/donut/donut-toolbar-filter.tsx" background="var(--main-bg-color)" title="工具栏过滤器" iframe=540></code>
<code src="../demos/charts/donut/donut-statistic.tsx" background="var(--main-bg-color)" title="统计指标" iframe=540></code>
<code src="../demos/charts/donut/donut-large-data.tsx" background="var(--main-bg-color)" title="多值-大数据量" iframe=560></code>
<code src="../demos/charts/donut-dark.tsx" background="#141414" title="暗黑主题" iframe=520></code>

## API

### DonutChartProps

| 属性                  | 类型                                             | 默认值                   | 说明                                                                     |
| --------------------- | ------------------------------------------------ | ------------------------ | ------------------------------------------------------------------------ |
| data                  | `DonutChartData[]`                               | -                        | 数据源                                                                   |
| configs               | `DonutChartConfig[]`                             | `[{ showLegend: true }]` | 配置列表（可多视图）                                                     |
| width                 | `number`                                         | `200`                    | 宽度（px），移动端自适应                                                 |
| height                | `number`                                         | `200`                    | 高度（px），移动端自适应，移动端有最大尺寸限制                           |
| className             | `string`                                         | -                        | 自定义类名                                                               |
| theme                 | `'light' \| 'dark'`                              | `'light'`                | 根容器主题，与 `configs[].theme` 配合；`dark` 时容器内嵌 Ant Design 暗色算法，工具栏/筛选与画布一致 |
| title                 | `string`                                         | -                        | 标题（同时用于工具栏）                                                   |
| showToolbar           | `boolean`                                        | `true`                   | 是否显示下载/全屏等工具按钮                                              |
| onDownload            | `() => void`                                     | -                        | 点击下载回调（未传时使用内置下载）                                       |
| dataTime              | `string`                                         | -                        | 数据时间                                                                 |
| filterList            | `string[]`                                       | -                        | 筛选项列表（不传不显示筛选器）                                           |
| selectedFilter        | `string`                                         | -                        | 外部受控的当前筛选值                                                     |
| onFilterChange        | `(value: string) => void`                        | -                        | 筛选变化回调                                                             |
| enableAutoCategory    | `boolean`                                        | `true`                   | 是否启用自动分类（依据 `category`）                                      |
| singleMode            | `boolean`                                        | `false`                  | 是否启用单值模式：每条数据一个独立环形图并自动着色                       |
| toolbarExtra          | `React.ReactNode`                                | -                        | 头部工具条额外按钮                                                       |
| renderFilterInToolbar | `boolean`                                        | `false`                  | 是否将过滤器渲染到工具栏（当为 true 时，ChartFilter 会显示在工具栏右侧） |
| statistic             | `ChartStatisticConfig \| ChartStatisticConfig[]` | -                        | ChartStatistic组件配置：object表示单个配置，array表示多个配置            |

### ChartContainerProps（继承）

| 属性       | 类型                        | 默认值  | 说明                                                                 |
| ---------- | --------------------------- | ------- | -------------------------------------------------------------------- |
| classNames | `ChartClassNames`           | -       | 分层类名：`root`、`toolbar`、`statisticContainer`、`filter`、`wrapper`、`chart` |
| loading    | `boolean`                   | `false` | 加载态                                                               |
| style      | `React.CSSProperties`       | -       | 根容器内联样式                                                       |
| styles     | `ChartStyles`               | -       | 与各层 DOM 对应的内联样式                                             |
| variant    | `'outline' \| 'borderless'` | -       | 容器描边变体                                                         |

### DonutChartData

| 字段        | 类型     | 必填 | 说明                           |
| ----------- | -------- | ---- | ------------------------------ |
| category    | `string` | 否   | 分类（用于可选自动分类与筛选） |
| label       | `string` | 是   | 标签（将用于图例与中心文字）   |
| value       | `number` | 是   | 数值（可自动计算百分比）       |
| filterLabel | `string` | 否   | 二级筛选标签（可选）           |

### DonutChartConfig

| 字段            | 类型                                     | 默认值                      | 说明                                                                                    |
| --------------- | ---------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------- |
| lastModified    | `string`                                 | -                           | 最近更新时间（展示用）                                                                  |
| theme           | `'light' \| 'dark'`                      | `'light'`                   | 单视图主题，与根级 `theme` 配合控制画布与图例配色                                                |
| cutout          | `string \| number`                       | -                           | 中心空心占比（如 `'60%'`）                                                              |
| chartStyle      | `'pie' \| 'donut'`                       | `'donut'`                   | 图表样式：饼图或环形图                                                                  |
| showLegend      | `boolean`                                | `true`                      | 是否显示图例                                                                            |
| showTooltip     | `boolean`                                | `true`                      | 是否显示 tooltip                                                                        |
| legendPosition  | `'top' \| 'left' \| 'bottom' \| 'right'` | `'right'（移动端自动底部）` | 图例位置                                                                                |
| backgroundColor | `string[]`                               | 内置色板                    | 每项对应一个扇区颜色                                                                    |
| borderColor     | `string`                                 | -                           | 边框颜色                                                                                |
| showDataLabels  | `boolean`                                | `false`                     | 是否展示数据标签与指示线：开启后扇区外显示数值/占比及连接线，tooltip 中也会展示原始数值 |

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

- 移动端字体与布局会自动缩放优化，避免中心文本溢出。
- 开启 `singleMode` 时，每条 `data` 将渲染独立的小环形图，便于对比多个单值。
- `statistic` 属性支持数组形式，可同时渲染多个静态数据组件，如 `[{title: '总用户数', value: 15420}, {title: '活跃用户', value: 8963}]`。

### 数据标签与指示线（showDataLabels）

- **默认**：不展示扇区上的数值、占比及指示线，仅通过 tooltip 展示占比（如「男性 (30%)」）。
- **开启**：在 `configs` 中设置 `showDataLabels: true` 后：
  - 扇区外展示「类别: 占比%」文案，并用平滑指示线连接扇区与文案；
  - 仅对**占比 ≥ 2%** 的扇区展示标签与指示线，并在密集场景自动做防重叠稀疏；
  - tooltip 中会同时展示原始数值（如「男性: 30 (30%)」）；
  - 小屏下指示线更短，桌面略长，以减少溢出。
- **适用场景**：多分类、大数据量时需「不悬浮即可见」数值与占比，可开启；单值或少量分类建议保持默认。

### 图例分页

- 当图例项超过 **12 条**时，自动启用分页，底部显示「< 1/4 >」形式的分页控件。
- 小屏下图例区域为 flex 布局：列表可滚动，分页固定在底部始终可见。
