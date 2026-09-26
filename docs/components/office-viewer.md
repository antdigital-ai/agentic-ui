---
title: OfficeViewer Office 文档预览
atomId: OfficeViewer
group:
  title: 通用
  order: 7
---

# OfficeViewer Office 文档预览 {#officeviewer}

`OfficeViewer` 基于 optional peer 依赖 [`@silurus/ooxml`](https://www.npmjs.com/package/@silurus/ooxml)（[office-open-xml-viewer](https://github.com/yukiyokotani/office-open-xml-viewer)）在浏览器 Canvas 中预览 **docx / xlsx / pptx**。未安装该依赖时组件展示降级提示，不影响主包体积。

## 何时使用 {#when-to-use}

- Workspace 文件树或对话附件中需要内联预览 Office 三件套
- 希望按需引入 WASM 解析器（默认 CDN，可 `wasmUrl` 覆盖）而不打进主包

## 安装依赖 {#install}

```bash
pnpm add @silurus/ooxml
```

`@silurus/ooxml` 为 **optional peerDependency**，仅在使用本组件时安装。

## 代码演示 {#demo}

<code src="../demos/office-viewer-basic.tsx">基础用法 - 预置三件套样例预览</code>

<code src="../demos/office-viewer-wasm-url.tsx">自定义 wasmUrl - xlsx 样例预览</code>

## API

### OfficeViewerProps

| 属性                    | 说明                                                                  | 类型                                    | 默认值   | 版本 |
| ----------------------- | --------------------------------------------------------------------- | --------------------------------------- | -------- | ---- |
| className               | 自定义类名                                                            | `string`                                | -        | -    |
| enableSlideRail         | PPTX 是否启用左侧缩略图侧栏；关闭后 PPTX 走连续滚动视图              | `boolean`                               | `true`   | -    || file                    | 文件源：URL、`File`/`Blob` 或 `ArrayBuffer`                           | `File \| Blob \| string \| ArrayBuffer` | -        | -    |
| fileName                | 用于扩展名推断的文件名（`file` 为 ArrayBuffer 时建议传入）            | `string`                                | -        | -    |
| fileType                | 显式指定格式；缺省按 `fileName` / URL / File.name 推断                | `'docx' \| 'xlsx' \| 'pptx'`            | -        | -    |
| height                  | 容器高度                                                              | `number \| string`                      | `480`    | -    |
| loadingRender           | 自定义加载中内容                                                      | `React.ReactNode`                       | -        | -    |
| missingDependencyRender | 未安装 `@silurus/ooxml` 时的自定义降级内容                            | `React.ReactNode`                       | -        | -    |
| onError                 | 加载或渲染失败回调                                                    | `(error: Error) => void`                | -        | -    |
| onLoad                  | 文档加载完成回调                                                      | `() => void`                            | -        | -    |
| style                   | 自定义内联样式                                                        | `React.CSSProperties`                   | -        | -    |
| wasmUrl                 | WASM 解析器地址；未传时按格式指向 jsDelivr 上的 `@silurus/ooxml` 资产 | `string \| URL`                         | CDN 默认 | -    |

## 注意事项 {#notes}

1. 仅支持 **Office Open XML**（`.docx` / `.xlsx` / `.pptx`）；旧版 `.doc` / `.xls` / `.ppt` 不可预览。
2. Workspace `File` 预览已接入：点击符合扩展名的文件时自动走 `OfficeViewer`；未安装 peer 时显示安装提示。
3. PPTX 默认展示左侧缩略图侧栏，点击缩略图跳转对应页；侧栏可通过分界处的手柄按钮展开/收起（收起后主区自动铺满）；`enableSlideRail: false` 时退化为连续滚动视图。
3. 生产环境建议将 `*_parser_bg.wasm` 托管到自有 CDN，再通过 `wasmUrl` 传入。
4. 数学公式、ChartEx 等可选引擎需自行从 `@silurus/ooxml/math` 等入口引入并传入上游选项（本组件默认不捆绑）。
