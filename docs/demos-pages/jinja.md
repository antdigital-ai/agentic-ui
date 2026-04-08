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

## 编程设置 Schema {#jinja-set-schema}

通过 `editorRef` 获取编辑器实例，调用 `store.setContent(schema)` 可编程写入含 Jinja 变量标签的 Slate Schema（如 `if/else` 条件模板）：

<code src="../demos/jinja-set-schema-demo.tsx" background="var(--main-bg-color)" iframe=620></code>
