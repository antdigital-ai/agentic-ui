---
title: AreaChart 面积图
atomId: AreaChart
order: 1
group:
  title: 图文输出
  order: 4
---

# AreaChart 面积图

用于渲染分类型、多序列的面积图，支持筛选、图例、主题与响应式。

## 代码演示

<code src="../demos/charts/area.tsx" background="var(--main-bg-color)" iframe=540></code>
<code src="../demos/charts/area-toolbar-filter.tsx" background="var(--main-bg-color)" title="工具栏过滤器" iframe=540></code>
<code src="../demos/charts/area-statistic.tsx" background="var(--main-bg-color)" title="统计指标" iframe=540></code>
<code src="../demos/charts/area-dark.tsx" background="#141414" title="暗黑主题" iframe=520></code>

## API

### AreaChartProps

| 属性                  | 类型                                             | 默认值     | 说明                                                                                                               |
| --------------------- | ------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------ |
| title                 | `string`                                         | -          | 图表标题                                                                                                           |
| data                  | `AreaChartDataItem[]`                            | -          | 扁平化数据数组                                                                                                     |
| width                 | `number \| string`                               | `600`      | 图表宽度（px），移动端自适应为 100%                                                                                |
| height                | `number \| string`                               | `400`      | 图表高度（px），移动端最大约 80% 屏宽（上限 400）                                                                  |
| className             | `string`                                         | -          | 自定义类名                                                                                                         |
| dataTime              | `string`                                         | -          | 数据时间                                                                                                           |
| theme                 | `'dark' \| 'light'`                              | `'light'`  | 图表与容器主题；`dark` 时容器内嵌 Ant Design 暗色算法，工具栏/筛选与画布一致；暗色下图例色块无白边，与浅色视觉区分 |
| color                 | `string \| string[]`                             | -          | 自定义主色；数组按序对应各数据序列                                                                                 |
| showLegend            | `boolean`                                        | `true`     | 是否显示图例                                                                                                       |
| legendPosition        | `'top' \| 'left' \| 'bottom' \| 'right'`         | `'bottom'` | 图例位置                                                                                                           |
| legendAlign           | `'start' \| 'center' \| 'end'`                   | `'start'`  | 图例水平对齐方式                                                                                                   |
| showGrid              | `boolean`                                        | `true`     | 是否显示网格线                                                                                                     |
| xPosition             | `'top' \| 'bottom'`                              | `'bottom'` | X 轴位置                                                                                                           |
| yPosition             | `'left' \| 'right'`                              | `'left'`   | Y 轴位置                                                                                                           |
| hiddenX               | `boolean`                                        | `false`    | 是否隐藏 X 轴                                                                                                      |
| hiddenY               | `boolean`                                        | `false`    | 是否隐藏 Y 轴                                                                                                      |
| toolbarExtra          | `React.ReactNode`                                | -          | 头部工具条额外按钮                                                                                                 |
| renderFilterInToolbar | `boolean`                                        | `false`    | 是否将过滤器渲染到工具栏（当为 true 时，ChartFilter 会显示在工具栏右侧）                                           |
| statistic             | `ChartStatisticConfig \| ChartStatisticConfig[]` | -          | ChartStatistic组件配置：object表示单个配置，array表示多个配置                                                      |

### ChartContainerProps（继承）

| 属性       | 类型                        | 默认值  | 说明                                                                            |
| ---------- | --------------------------- | ------- | ------------------------------------------------------------------------------- |
| classNames | `ChartClassNames`           | -       | 分层类名：`root`、`toolbar`、`statisticContainer`、`filter`、`wrapper`、`chart` |
| loading    | `boolean`                   | `false` | 加载态                                                                          |
| style      | `React.CSSProperties`       | -       | 根容器内联样式                                                                  |
| styles     | `ChartStyles`               | -       | 与各层 DOM 对应的内联样式                                                       |
| variant    | `'outline' \| 'borderless'` | -       | 容器描边变体                                                                    |

### AreaChartDataItem

| 字段        | 类型     | 必填 | 说明                                 |
| ----------- | -------- | ---- | ------------------------------------ |
| category    | `string` | 是   | 分类（用于外层筛选）                 |
| type        | `string` | 是   | 数据序列名称（会映射为一个 dataset） |
| x           | `number` | 是   | 横轴值（将自动排序并作为 labels）    |
| y           | `number` | 是   | 纵轴值                               |
| xtitle      | `string` | 否   | X 轴标题（从数据中提取）             |
| ytitle      | `string` | 否   | Y 轴标题（从数据中提取）             |
| filterLabel | `string` | 否   | 二级筛选标签（可选）                 |

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

- 移动端自动启用响应式：宽度 100%，高度不超过 400px。
- 当 `filterLabel` 存在时，组件会在分类基础上增加二级筛选。
- 不同 `type` 自动分配调色板并以填充形式展示面积。
- `hiddenX` 和 `hiddenY` 可以控制坐标轴的显示/隐藏，适用于只展示图表本身而不需要坐标轴的场景。
- `statistic` 属性支持数组形式，可同时渲染多个统计数据组件，如 `[{title: '点赞数', value: 380}, {title: '点踩数', value: 126}]`。
