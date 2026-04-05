---
nav:
  title: Demo
  order: 5
group:
  title: 通用
  order: 5
---

# 基础交互

> **说明**：本页为 Demo 聚合，与 [Bubble](/components/bubble)、[图表](/demos/chart) 等组件文档中的示例可能重复，以组件文档为准。源码均在 `docs/demos/`。

## 交互组件

### 任务列表

<code src="../demos/task-list.tsx" background="var(--main-bg-color)" iframe=540></code>

### 任务运行

<code src="../demos/task-running.tsx" background="var(--main-bg-color)" iframe=540></code>

### 工具使用栏

<code src="../demos/tool-use-bar-basic.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/tool-use-bar-advanced.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/tool-use-bar-active-keys.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/tool-use-bar-expanded-keys.tsx" background="var(--main-bg-color)" iframe=540></code>

<!-- tool-use-bar.tsx 为最简列表，与 tool-use-bar-basic 重叠，不在此聚合 -->
<!-- tool-use-bar-all 与 tool-use-bar-advanced 均为「多字段工具项」展示，advanced 含动态进度；Props 说明见 components/tool-use-bar.md -->


### 工具使用栏 - 思考模式

主流程见 `tool-use-bar-think.tsx`；`think-simple` / `think-standalone` 为拆解场景，与完整版有重叠。

<code src="../demos/tool-use-bar-think.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/tool-use-bar-think-simple.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/tool-use-bar-think-standalone.tsx" background="var(--main-bg-color)" iframe=540></code>

### 卡片交互

<code src="../demos/card-ime-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/card-selection-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

## 思维链与AI组件

### 思维链

<code src="../demos/ThoughtChainList.tsx"  background="var(--main-bg-color)" iframe=540 ></code>

<!-- ThoughtChainList-debug.tsx 与上文场景重叠，仅作本地调试；需要时在仓库中直接打开该文件 -->

## 气泡组件

### 基础用法

<code src="../demos/bubble/basic.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/bubble/pure.tsx" background="var(--main-bg-color)" iframe=540></code>

### 气泡列表

<code src="../demos/bubble/bubblelist-basic-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/bubble/bubblelist-config-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/bubble/bubblelist-interaction-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/bubble/bubblelist-lazy-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/bubble/bubblelist-performance-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

### 自定义渲染

<code src="../demos/bubble/extra-render.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/bubble/content-render-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/bubble/avatar-render-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

<!-- title-render-demo 与 custom-title-render 均演示标题区定制，API 细节不同 -->

<code src="../demos/bubble/title-render-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/bubble/custom-title-render.tsx" background="var(--main-bg-color)" iframe=540></code>

### 扩展功能

<!-- beforeMessage/afterMessage 与 beforeContent/afterContent 为不同 API，正文共用 docs/demos/bubble/sharedDemoContent.ts -->

<code src="../demos/bubble/beforeMessage-afterMessage-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/bubble/afterContent-beforeContent-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/bubble/preMessageSameRole.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/bubble/classnames-extended-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

### 文件与媒体

<code src="../demos/bubble/file-view.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/bubble/file-loading-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/bubble/message-loading-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/bubble/voice.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/bubble/footnote-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

## 表单与Schema

### 表单

<code src="../demos/form-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/schema-form-basic.tsx" background="var(--main-bg-color)" iframe=540></code>

### Schema 渲染

<code src="../demos/schema-renderer-basic.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/schema-json-editor.tsx" background="var(--main-bg-color)" iframe=540></code>

### Schema 组件

<code src="../demos/sampleSchema.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/weather-card-complete.tsx" background="var(--main-bg-color)" iframe=540></code>

<code src="../demos/seven-days-weather-mustache.tsx" background="var(--main-bg-color)" iframe=540></code>

### 验证器

<code src="../demos/validator-basic.tsx" background="var(--main-bg-color)" iframe=540></code>

## 加载状态

<code src="../demos/loading/index.tsx" background="var(--main-bg-color)" iframe=540></code>
