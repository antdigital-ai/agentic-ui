---
title: RadarChart 雷达图
atomId: RadarChart
order: 6
group:
  title: 图文输出
  order: 4
---

# RadarChart 雷达图

用于展示多指标对比的雷达图，支持分类与二级筛选，移动端自适应。

## 代码演示

<code src="../demos/charts/radar.tsx" background="var(--main-bg-color)" iframe=540></code>
<code src="../demos/charts/radar-toolbar-filter.tsx" background="var(--main-bg-color)" title="工具栏过滤器" iframe=540></code>
<code src="../demos/charts/radar-statistic.tsx" background="var(--main-bg-color)" title="统计指标" iframe=540></code>
<code src="../demos/charts/radar-dark.tsx" background="#141414" title="暗黑主题" iframe=520></code>

## API

### RadarChartProps

| 属性                  | 类型                                             | 默认值    | 说明                                                                        |
| --------------------- | ------------------------------------------------ | --------- | --------------------------------------------------------------------------- |
| data                  | `RadarChartDataItem[]`                           | -         | 扁平化数据数组                                                              |
| title                 | `string`                                         | -         | 图表标题                                                                    |
| width                 | `number \| string`                               | `600`     | 宽度（px），移动端自适应为 100%                                             |
| height                | `number \| string`                               | `400`     | 高度（px），移动端按正方形比例，最大约 400                                  |
| className             | `string`                                         | -         | 自定义类名                                                                  |
| toolbarExtra          | `React.ReactNode`                                | -         | 头部工具条额外按钮                                                          |
| renderFilterInToolbar | `boolean`                                        | `false`   | 是否将过滤器渲染到工具栏（当为 true 时，ChartFilter 会显示在工具栏右侧）    |
| dataTime              | `string`                                         | -         | 数据时间                                                                    |
| theme                 | `'dark' \| 'light'`                              | `'light'` | 图表与容器主题；`dark` 时容器内嵌 Ant Design 暗色算法；暗色下图例色块无白边 |
| color                 | `string \| string[]`                             | -         | 自定义主色；数组按序对应各数据序列                                          |
| textMaxWidth          | `number`                                         | `80`      | 图例文字最大宽度（px），超出截断并加省略号                                  |
| statistic             | `ChartStatisticConfig \| ChartStatisticConfig[]` | -         | 指标卡配置，单个对象或数组                                                  |

### ChartContainerProps（继承）

| 属性       | 类型                        | 默认值  | 说明                                                                            |
| ---------- | --------------------------- | ------- | ------------------------------------------------------------------------------- |
| classNames | `ChartClassNames`           | -       | 分层类名：`root`、`toolbar`、`statisticContainer`、`filter`、`wrapper`、`chart` |
| loading    | `boolean`                   | `false` | 加载态                                                                          |
| style      | `React.CSSProperties`       | -       | 根容器内联样式                                                                  |
| styles     | `ChartStyles`               | -       | 与各层 DOM 对应的内联样式                                                       |
| variant    | `'outline' \| 'borderless'` | -       | 容器描边变体                                                                    |

### RadarChartDataItem

| 字段        | 类型               | 必填 | 说明                             |
| ----------- | ------------------ | ---- | -------------------------------- |
| category    | `string`           | 否   | 分类（用于外层筛选）             |
| label       | `string`           | 是   | 指标名称（将作为雷达图各轴标签） |
| type        | `string`           | 否   | 数据序列名称（映射为 dataset）   |
| score       | `number \| string` | 是   | 指标分值                         |
| filterLabel | `string`           | 否   | 二级筛选标签（可选）             |

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

- 内置色板自动为不同 `type` 分配颜色并填充区域。
- 图例在移动端自动放置到底部、字体缩放优化。
