---
nav:
  title: Demo
  order: 5
group:
  title: 通用
  order: 7
---

# 原子图表

## 饼图

<code src="../demos/charts/donut/donut-single.tsx" background="var(--main-bg-color)"  title="单值饼图" iframe=450></code>
<code src="../demos/charts/donut/donut-single-categorized.tsx" background="var(--main-bg-color)"  title="带分类的单值饼图" iframe=540></code>
<code src="../demos/charts/donut/donut-multi.tsx" background="var(--main-bg-color)"  title="多值饼图" iframe=540></code>
<code src="../demos/charts/donut/donut-multi-categorized.tsx" background="var(--main-bg-color)"  title="带分类的多值饼图" iframe=400></code>

<code src="../demos/charts/donut/donut-statistic.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/charts/donut/donut-toolbar-filter.tsx" background="var(--main-bg-color)" iframe=540></code>

## 折线图

<code src="../demos/charts/line.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/charts/line-statistic.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/charts/line-toolbar-filter.tsx" background="var(--main-bg-color)" iframe=540></code>

## 面积图

<code src="../demos/charts/area.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/charts/area-statistic.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/charts/area-toolbar-filter.tsx" background="var(--main-bg-color)" iframe=540></code>

## 雷达图

<code src="../demos/charts/radar.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/charts/radar-statistic.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/charts/radar-toolbar-filter.tsx" background="var(--main-bg-color)" iframe=540></code>

## 散点图

<code src="../demos/charts/scatter.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/charts/scatter-statistic.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/charts/scatter-toolbar-filter.tsx" background="var(--main-bg-color)" iframe=540></code>

## 柱状图

<code src="../demos/charts/bar/bar.tsx" background="var(--main-bg-color)" iframe=540></code>

### 堆叠柱状图

<code src="../demos/charts/bar/bar-stacked.tsx" background="var(--main-bg-color)" iframe=540></code>

### 正负柱状图

<code src="../demos/charts/bar/bar-negative.tsx" background="var(--main-bg-color)" iframe=540></code>

### 条形图（横向）

<code src="../demos/charts/bar/bar-horizontal.tsx" background="var(--main-bg-color)" iframe=540></code>

### 条形堆叠图（横向堆叠）

<code src="../demos/charts/bar/bar-horizontal-stacked.tsx" background="var(--main-bg-color)" iframe=540></code>

### 柱状图扩展

<code src="../demos/charts/bar/bar-with-labels.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/charts/bar/bar-with-statistic.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/charts/bar/bar-chinese-currency.tsx" background="var(--main-bg-color)" title="中文金额（亿元/万元/元）" iframe=540></code>

<code src="../demos/charts/bar/bar-max-thickness.tsx" background="var(--main-bg-color)" iframe=540></code>

## 漏斗图

<code src="../demos/charts/funnel.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/charts/funnel-statistic.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/charts/funnel-toolbar-filter.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/charts/funnelWithMinWidthBottom.tsx" background="var(--main-bg-color)" iframe=540></code>

## 指标卡

用于显示单个关键指标数据的卡片组件，支持自定义格式化、主题切换、尺寸调整和弹性布局等功能。

<code src="../demos/charts/chartStatic.tsx" background="var(--main-bg-color)" iframe=540></code>

## 带指标卡的图表

<code src="../demos/charts/chartWithStatic.tsx" background="var(--main-bg-color)" iframe=1000></code>

## 卡片列表 (docCards)

将一行 Markdown 表格映射为一张卡片，默认桌面 2 列、`< 480px` viewport 强制单列。
与现有图表共用同一套「HTML 注释（含 `chartType`）+ GFM 表格」数据契约，
表头按「`名称`/`标题`、`地址`/`链接`/`URL`、`简介`/`描述`、`亮点`/`标签`」别名解析为
`title` / `url` / `description` / `tags`，可通过 `fieldMap` 覆盖。

`cardColumns` 控制每行卡片数（取值 `1`~`4`，默认 `2`，超出 clamp 到 `4`）。
若注释中无法定位主标题列，整表会降级为普通 Markdown 表格渲染。

### Markdown 注释驱动（首选用法）

写一行 HTML 注释 + 一张 GFM 表格即可输出卡片栅格，与现有 chart 完全一致。
适合从 LLM 输出 / 文档站直接产出。

<code src="../demos/markdown-doc-cards.tsx" background="var(--main-bg-color)" title="Markdown 注释驱动" iframe=720></code>

### DocCards 组件直接使用

当上游已是结构化数据、想绕过 Markdown 直接复用 UI 时，可直接 `import { DocCards }`。

<code src="../demos/charts/doc-cards/doc-cards-basic.tsx" background="var(--main-bg-color)" title="组件基础用法" iframe=520></code>

### 列数控制 (cardColumns)

桌面端按 `cardColumns` 精确控制最多 N 列；`< 480px` viewport 强制单列。

<code src="../demos/charts/doc-cards/doc-cards-columns.tsx" background="var(--main-bg-color)" title="cardColumns 切换" iframe=720></code>

### fieldMap 覆盖 + toolbar 槽位

表头不在默认别名表时，用 `fieldMap` 显式映射；`toolbar` 槽位用于放右上角操作。

<code src="../demos/charts/doc-cards/doc-cards-field-map.tsx" background="var(--main-bg-color)" title="fieldMap + toolbar" iframe=520></code>

### 流式追加（模拟 LLM 边产边渲染）

数据增量到达时按行追加；与 chart 一样基于 dataSource 走，无额外接入。

<code src="../demos/charts/doc-cards/doc-cards-streaming.tsx" background="var(--main-bg-color)" title="流式追加" iframe=620></code>

### 容错与降级

仅缺 `亮点` / `简介` 时仍正常出卡片；解析阶段无主标题列则整表降级为普通 Markdown 表格。

<code src="../demos/charts/doc-cards/doc-cards-fallback.tsx" background="var(--main-bg-color)" title="容错与降级" iframe=560></code>

## Mermaid 图表

<code src="../demos/charts/mermaid.tsx" background="var(--main-bg-color)" iframe=540></code>

## 暗黑主题

各图表设置 `theme="dark"` 后，内部 Ant Design 控件由 `ChartContainer` 自动套用暗色算法；文档 iframe 使用 `background="#141414"` 作为页面底色。

<code src="../demos/charts/area-dark.tsx" background="#141414" title="面积图" iframe=480></code>
<code src="../demos/charts/line-dark.tsx" background="#141414" title="折线图" iframe=480></code>
<code src="../demos/charts/bar/bar-dark.tsx" background="#141414" title="柱状图" iframe=480></code>
<code src="../demos/charts/radar-dark.tsx" background="#141414" title="雷达图" iframe=480></code>
<code src="../demos/charts/scatter-dark.tsx" background="#141414" title="散点图" iframe=480></code>
<code src="../demos/charts/funnel-dark.tsx" background="#141414" title="漏斗图" iframe=440></code>
<code src="../demos/charts/donut-dark.tsx" background="#141414" title="环形图" iframe=480></code>
<code src="../demos/charts/chart-statistic-dark.tsx" background="#141414" title="指标卡" iframe=320></code>
<code src="../demos/charts/boxplot/boxplot-dark.tsx" background="#141414" title="箱线图" iframe=520></code>
<code src="../demos/charts/histogram/histogram-dark.tsx" background="#141414" title="直方图" iframe=520></code>
