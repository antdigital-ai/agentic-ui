---
name: component-plugins
description: Develop chart, code, mermaid, katex, formatter plugins for MarkdownEditor in @ant-design/agentic-ui. Use when adding or customizing chart/code/mermaid/formula rendering or code format. Triggers on plugin, chart, mermaid, code highlight, katex, formatter, LineChart, BarChart, Mermaid, CodeBlock.
---

# Markdown 插件开发

为 MarkdownEditor 提供图表、代码高亮、Mermaid、公式与格式化等插件能力。

## 源码位置

- 图表：`src/Plugins/chart/`（LineChart、BarChart、AreaChart、DonutChart、RadarChart、ScatterChart、FunnelChart 等）
- 代码：`src/Plugins/code/`（CodeBlock 等）
- Mermaid：`src/Plugins/mermaid/`
- KaTeX：`src/Plugins/katex/`
- 格式化：`src/Plugins/formatter/`
- 默认插件注册：`src/Plugins/defaultPlugins` 等

## 主要能力

- 图表：Chart.js 等，支持多种图表类型与配置
- 代码：ACE 等，语言高亮与主题
- Mermaid：流程图、时序图等
- KaTeX：数学公式
- Formatter：代码格式化

## 开发规范

- 插件接口与 MarkdownEditor 的 `plugins` 约定一致；样式使用 token。
- 新增插件时在 defaultPlugins 或文档中注册，并补充类型。

修改或新增插件时，参考 `src/Plugins/` 与 `AGENTS.md`。
