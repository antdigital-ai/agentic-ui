---
nav:
  title: Demo
  order: 5
group:
  title: 通用
  order: 16
---

# Jinja 模板 {#jinja}

在 MarkdownEditor 中使用 Jinja 模板能力：`{}` 触发模板面板、语法高亮（变量、标签、注释）。

## 基础用法 - 模板面板 + 语法高亮 {#jinja-basic}

<code src="../demos/jinja-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

输入 `` `{}` `` 可打开 Jinja 模板面板，选择常用片段快速插入。变量 `{{ }}`、标签 `{% %}`、注释 `{# #}` 会以不同颜色高亮显示。

## 通过插件启用 {#jinja-plugin}

除 `jinja` prop 外，也可使用 `createJinjaPlugin` 或 `jinjaPlugin` 启用：

<code src="../demos/jinja-plugin-demo.tsx" background="var(--main-bg-color)" iframe=540></code>
