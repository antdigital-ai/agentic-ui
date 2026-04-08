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

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| data | 扁平化数据数组 | `RadarChartDataItem[]` | - | - |
| title | 图表标题 | `string` | - | - |
| width | 宽度（px），移动端自适应为 100% | `number \| string` | `600` | - |
| height | 高度（px），移动端按正方形比例，最大约 400 | `number \| string` | `400` | - |
| className | 自定义类名 | `string` | - | - |
| toolbarExtra | 头部工具条额外按钮 | `React.ReactNode` | - | - |
| renderFilterInToolbar | 是否将过滤器渲染到工具栏（当为 true 时，ChartFilter 会显示在工具栏右侧） | `boolean` | `false` | - |
| dataTime | 数据时间 | `string` | - | - |
| theme | 图表与容器主题；`dark` 时容器内嵌 Ant Design 暗色算法；暗色下图例色块无白边 | `'dark' \| 'light'` | `'light'` | - |
| color | 自定义主色；数组按序对应各数据序列 | `string \| string[]` | - | - |
| textMaxWidth | 图例文字最大宽度（px），超出截断并加省略号 | `number` | `80` | - |
| statistic | 指标卡配置，单个对象或数组 | `ChartStatisticConfig \| ChartStatisticConfig[]` | - | - |

### ChartContainerProps（继承）

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| classNames | 分层类名：`root`、`toolbar`、`statisticContainer`、`filter`、`wrapper`、`chart` | `ChartClassNames` | - | - |
| loading | 加载态 | `boolean` | `false` | - |
| style | 根容器内联样式 | `React.CSSProperties` | - | - |
| styles | 与各层 DOM 对应的内联样式 | `ChartStyles` | - | - |
| variant | 容器描边变体 | `'outline' \| 'borderless'` | - | - |

### RadarChartDataItem

| 字段 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| category | 分类（用于外层筛选） | `string` | - | - |
| label | 指标名称（将作为雷达图各轴标签）（必填） | `string` | - | - |
| type | 数据序列名称（映射为 dataset） | `string` | - | - |
| score | 指标分值（必填） | `number \| string` | - | - |
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

- 内置色板自动为不同 `type` 分配颜色并填充区域。
- 图例在移动端自动放置到底部、字体缩放优化。
