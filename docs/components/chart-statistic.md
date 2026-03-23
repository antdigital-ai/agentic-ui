---
title: ChartStatistic 指标卡
atomId: ChartStatistic
order: 8
group:
  title: 图文输出
  order: 4
---

# ChartStatistic 指标卡

用于显示单个关键指标数据的卡片组件，支持自定义格式化、主题切换、尺寸调整和弹性布局等功能。常与面积图、折线图、柱状图等图表的 `statistic` 属性搭配使用。

## 何时使用

- 需要突出显示关键业务指标时
- 构建数据仪表盘或概览页面
- 需要配合图表组件展示汇总数据
- 需要统一的数值展示格式和样式

## 代码演示

<code src="../demos/charts/chartStatic.tsx" background="var(--main-bg-color)" iframe=540></code>
<code src="../demos/charts/chart-statistic-dark.tsx" background="#141414" iframe=320></code>

## API

### ChartStatisticProps

| 属性           | 类型                                                                | 默认值      | 说明                                                   |
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
| theme          | `'light' \| 'dark'`                                                 | `'light'`   | 主题风格                                               |
| size           | `'small' \| 'default' \| 'large'`                                   | `'default'` | 组件尺寸                                               |
| block          | `boolean`                                                           | `false`     | 是否使用块级布局（弹性占用空间，多个时平分父容器宽度） |
| extra          | `React.ReactNode`                                                   | -           | 右上角自定义内容（图标、按钮等）                       |

## 特性说明

### 数值格式化

组件提供了灵活的数值格式化能力：

1. **自动处理异常值**：`null`、`undefined`、空字符串、无效数字都会显示为 `--`
2. **精度控制**：通过 `precision` 属性控制小数点后位数
3. **千分位分隔**：支持自定义千分位分隔符，默认为逗号
4. **前缀后缀**：支持添加货币符号、单位等
5. **自定义格式化**：通过 `formatter` 函数完全自定义显示内容和样式

### 主题支持

- **Light 主题**：适用于浅色背景，文字颜色为深色
- **Dark 主题**：适用于深色背景，文字颜色为浅色，支持悬停状态

### 尺寸规格

| 尺寸    | 标题字号 | 数值字号 | 使用场景     |
| ------- | -------- | -------- | ------------ |
| small   | 12px     | 20px     | 紧凑型布局   |
| default | 13px     | 24px     | 常规使用     |
| large   | 13px     | 30px     | 重要指标突出 |

### 布局模式

- **普通模式**：固定最小宽度 160px，内容居左对齐
- **Block 模式**：弹性布局，自动占用可用空间
  - 单个使用时占满父容器
  - 多个使用时平分父容器宽度
  - 内容左对齐，适合指标卡场景
