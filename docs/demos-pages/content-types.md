---
nav:
  title: Demo
  order: 5
group:
  title: 通用
  order: 10
---

# 内容类型

<code src="../demos/markdown-editor-readonly-compare.tsx"></code>

## 基础内容类型

### 表格

<code src="../demos/test-table.tsx" background="var(--main-bg-color)"  iframe=540></code>

### 图片

<code src="../demos/image.tsx" background="var(--main-bg-color)" iframe=540></code>

### 图片错误处理

<code src="../demos/image-error-handling.tsx" background="var(--main-bg-color)" iframe=540></code>

### 视频

<code src="../demos/video-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

### 脚注

<code src="../demos/footnoteReference.tsx" background="var(--main-bg-color)" iframe=540></code>

## 图表与可视化

### 图表列表

<code src="../demos/chart-list.tsx" background="var(--main-bg-color)" iframe=540></code>

### 图表性能优化

<code src="../demos/max-chart.tsx" background="var(--main-bg-color)"  iframe=540></code>

## 文件与媒体

### HTML 运行

<code src="../demos/htmlrun.tsx"  background="var(--main-bg-color)" iframe=540 ></code>

### html 混排

<code src="../demos/dance-effect.tsx"  background="var(--main-bg-color)" iframe=540 ></code>

## 特殊功能

### 引用展示

<code src="../demos/FncTooltip.tsx" background="var(--main-bg-color)" iframe=540></code>

### 目录测试

<code src="../demos/toc-simple-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

### 列表代码

<code src="../demos/li-code.tsx" background="var(--main-bg-color)" iframe=540></code>

### 表格行

<code src="../demos/table_line.tsx" background="var(--main-bg-color)" iframe=540></code>

## AI 辅助功能

### 思考过程展示

支持两种方式展示 AI 的思考过程：使用 `<think>` 标签格式或代码块格式。

两种格式都会被渲染为相同的思考块组件，在只读模式下显示为美观的思考块 UI。

<code src="../demos/ThinkTagDemo.tsx" background="var(--main-bg-color)" iframe=540></code>

### 思考块自定义渲染

<code src="../demos/eleItemRender-think-block-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

### HTML 标签解析

展示编辑器如何处理各种 HTML 标签：

- **标准 HTML 元素**（div, p, ul, li, img, video 等）→ 正常解析
- **`<think>` 标签** → 转换为特殊思考块 UI
- **非标准标签**（answer, custom 等）→ 当作普通文本
- **HTML 注释** → 提取配置属性

<code src="../demos/HtmlParsing-demo.tsx" background="var(--main-bg-color)" iframe=640></code>
