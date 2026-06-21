---
title: MarkdownEditor - 编辑器组件
nav:
  order: 1
atomId: MarkdownEditor
group:
  title: 意图输入
  order: 3
---

# MarkdownEditor

基于 Slate.js 的 Markdown 编辑器组件，支持实时编辑、只读渲染、评论、图片上传、Jinja 模板等能力。

## 何时使用

- 需要一个所见即所得的 Markdown 编辑器
- 需要只读渲染 Markdown 内容（支持轻量 `markdown` 模式和完整 `slate` 模式）
- 需要评论、图片上传、代码高亮、表格编辑等扩展能力

## 代码演示

### 基础用法

```tsx | pure
import { MarkdownEditor } from '@ant-design/agentic-ui';

export default () => {
  return (
    <MarkdownEditor
      initValue={'# Hello World\n\n这是一段示例文本。'}
      height="400px"
      onChange={(value) => console.log('内容变化:', value)}
    />
  );
};
```

### 只读模式

```tsx | pure
import { MarkdownEditor } from '@ant-design/agentic-ui';

export default () => {
  return (
    <MarkdownEditor
      readonly
      initValue={'# 只读模式\n\n用户无法编辑，但可以查看和复制。'}
      height="300px"
    />
  );
};
```

### 轻量只读渲染（renderMode: markdown）

```tsx | pure
import { MarkdownEditor } from '@ant-design/agentic-ui';

export default () => {
  return (
    <MarkdownEditor
      readonly
      renderMode="markdown"
      initValue={'# 轻量渲染\n\n不加载 Slate，首包最小。'}
      height="300px"
    />
  );
};
```

#### Markdown 模式自定义块（plugins.renderer）

`renderMode: 'markdown'` 下，Slate 侧 `plugins[].elements` **不会**生效；请使用 `plugins[].renderer`：

| 能力                | API                                                                    | 说明                                                     |
| ------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------- |
| 自定义 fence        | `createRendererCodeBlockPlugin({ 'insight-card': ({ code }) => ... })` | 按 \`\`\`language 注册渲染器                             |
| 合并多个插件        | `mergeMarkdownRendererPlugins(pluginA, pluginB)`                       | 合并 `rendererComponents` / remark / rehype              |
| 保留默认 DOM 再包装 | `eleRender` prop                                                       | 拦截 `p` / `table` / `img` 等，返回 `undefined` 回退默认 |
| 覆盖整块渲染        | `renderer.rendererComponents.table` 等                                 | 完全替换对应 hast 标签组件                               |

````tsx | pure
import {
  MarkdownEditor,
  createRendererCodeBlockPlugin,
} from '@ant-design/agentic-ui';

const cardPlugin = createRendererCodeBlockPlugin({
  'insight-card': ({ code }) => <MyCard data={JSON.parse(code)} />,
});

export default () => (
  <MarkdownEditor
    readonly
    renderMode="markdown"
    initValue={'```insight-card\n{"topic":"demo"}\n```'}
    plugins={[cardPlugin]}
  />
);
````

**仍仅 Slate 模式支持**：新建划词评论（FloatBar 选区提交）、`initSchemaValue`、`eleItemRender`（请改用 `eleRender` 或 renderer 插件）。

**markdown 模式已支持（只读，纯 DOM + 原生 CSS）**：

| 能力            | API                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------- |
| 评论高亮 + 侧栏 | `comment={{ enable: true, commentList }}`，依赖 `refContent`；`<mark>` + `-comment-*` CSS 类 |
| 文本搜索        | `editorRef.current.store.findByPathAndText([], keyword)`                                     |
| 兼容搜索        | `findByPathAndText(editorRef.current.store.editor, [], keyword)`                             |
| 当前内容        | `editorRef.current.getDisplayedContent()` / `store.getMDContent()`                           |
| 包装默认 DOM    | `eleRender`                                                                                  |

### 自定义工具栏

```tsx | pure
import { MarkdownEditor } from '@ant-design/agentic-ui';
import { Button } from 'antd';

export default () => {
  return (
    <MarkdownEditor
      initValue="# 自定义工具栏"
      toolBar={{
        enable: true,
        hideTools: ['table', 'color'],
        extra: [
          <Button key="save" type="primary" size="small">
            保存
          </Button>,
        ],
      }}
      height="400px"
    />
  );
};
```

### 图片上传

```tsx | pure
import { MarkdownEditor } from '@ant-design/agentic-ui';

export default () => {
  return (
    <MarkdownEditor
      initValue="拖拽图片到编辑器或使用工具栏上传"
      image={{
        upload: async (files) => {
          // 实现图片上传逻辑，返回 URL 数组
          return ['https://example.com/image.png'];
        },
      }}
      height="400px"
    />
  );
};
```

### 评论功能

```tsx | pure
import { MarkdownEditor } from '@ant-design/agentic-ui';
import { useState } from 'react';

export default () => {
  const [comments, setComments] = useState([]);

  return (
    <MarkdownEditor
      readonly
      reportMode
      initValue={'# 评论功能\n\n选中文本即可评论。'}
      comment={{
        enable: true,
        onSubmit: (id, comment) => {
          setComments((prev) => [...prev, comment]);
        },
        onDelete: (id) => {
          setComments((prev) => prev.filter((c) => c.id !== id));
        },
        commentList: comments,
        loadMentions: async (keyword) => {
          return [{ name: 'Alice' }, { name: 'Bob' }].filter((u) =>
            u.name.toLowerCase().includes(keyword.toLowerCase()),
          );
        },
      }}
      height="500px"
    />
  );
};
```

### 流式输出

```tsx | pure
import { MarkdownEditor } from '@ant-design/agentic-ui';

export default () => {
  return (
    <MarkdownEditor
      readonly
      renderMode="markdown"
      streaming
      initValue="正在生成中..."
      height="300px"
    />
  );
};
```

## API

### MarkdownEditorProps

#### 布局与样式

| 属性               | 说明                                                                                 | 类型                  | 默认值   | 版本 |
| ------------------ | ------------------------------------------------------------------------------------ | --------------------- | -------- | ---- |
| className          | 自定义 CSS 类名                                                                      | `string`              | -        | -    |
| style              | 容器自定义样式，支持 CSS 变量自定义表格样式（`--agentic-ui-table-border-radius` 等） | `React.CSSProperties` | -        | -    |
| width              | 编辑器宽度                                                                           | `string \| number`    | `'100%'` | -    |
| height             | 编辑器高度                                                                           | `string \| number`    | `'auto'` | -    |
| contentStyle       | 内容区域自定义样式                                                                   | `React.CSSProperties` | -        | -    |
| editorStyle        | 编辑器区域自定义样式                                                                 | `React.CSSProperties` | -        | -    |
| containerClassName | 容器自定义类名                                                                       | `string`              | -        | -    |
| id                 | 编辑器唯一标识                                                                       | `string`              | -        | -    |

#### 内容与模式

| 属性            | 说明                                                                                                                                                     | 类型                     | 默认值    | 版本 |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | --------- | ---- |
| initValue       | 初始 Markdown 文本内容                                                                                                                                   | `string`                 | -         | -    |
| initSchemaValue | 直接传入 Slate schema，优先级高于 `initValue`                                                                                                            | `Elements[]`             | -         | -    |
| readonly        | 是否只读模式。与 `renderMode` 联用决定渲染方式                                                                                                           | `boolean`                | `false`   | -    |
| renderMode      | 只读渲染模式，默认 `'slate'`。`'slate'`：Slate 文档树（与编辑态一致）；`'markdown'`：轻量 `Markdown → hast → React`，无 Slate 依赖，仅 `readonly` 时生效 | `'slate' \| 'markdown'`  | `'slate'` | -    |
| renderType      | `renderMode` 的别名，同时传入时以 `renderMode` 为准                                                                                                      | `'slate' \| 'markdown'`  | -         | -    |
| toc             | 是否显示目录                                                                                                                                             | `boolean`                | `false`   | -    |
| reportMode      | 是否开启报告模式                                                                                                                                         | `boolean`                | `false`   | -    |
| slideMode       | 是否开启 PPT 模式                                                                                                                                        | `boolean`                | `false`   | -    |
| compact         | 是否启用紧凑模式                                                                                                                                         | `boolean`                | `false`   | -    |
| streaming       | 流式输出模式，同时传入时优先于 `typewriter`                                                                                                              | `boolean`                | -         | -    |
| isFinished      | 流式是否完成（仅 `renderMode: 'markdown'`），未传入时回退到 `!streaming`                                                                                 | `boolean`                | -         | -    |
| ~~typewriter~~  | **已废弃**：`streaming` 的别名，向下兼容，新代码请使用 `streaming`                                                                                       | `boolean`                | -         | -    |
| throttleOptions | 流式限流与展示配置（仅 `renderMode: 'markdown'`），默认 `streaming` 时开启限流；逐词淡入由 `throttleOptions.fade` 控制（默认开启，传 `false` 关闭）      | `ContentThrottleOptions` | -         | -    |
| deps            | MElement 刷新依赖                                                                                                                                        | `string[]`               | -         | -    |
| children        | 子元素                                                                                                                                                   | `React.ReactNode`        | -         | -    |

#### ContentThrottleOptions

| 属性                      | 说明                                        | 类型      | 默认值 |
| ------------------------- | ------------------------------------------- | --------- | ------ |
| charsPerFrame             | 每帧最多推进字符数                          | `number`  | `3`    |
| speed                     | 速度倍率                                    | `number`  | `1`    |
| flushOnComplete           | 流式结束时是否立即展示剩余内容              | `boolean` | `true` |
| backgroundInterval        | 标签页不可见时的轮询间隔（ms）              | `number`  | `100`  |
| backgroundBatchMultiplier | 后台每批字符相对前台倍数                    | `number`  | `10`   |
| enabled                   | 为 `false` 时关闭限流，流式内容即时渲染     | `boolean` | `true` |
| fade                      | GPT 风格逐词淡入开关，仅 `streaming` 时生效 | `boolean` | `true` |

#### 工具栏 (toolBar)

| 属性      | 说明                   | 类型                | 默认值  | 版本 |
| --------- | ---------------------- | ------------------- | ------- | ---- |
| enable    | 是否启用工具栏         | `boolean`           | `false` | -    |
| min       | 是否使用最小化工具栏   | `boolean`           | `false` | -    |
| hideTools | 需要隐藏的工具栏选项   | `ToolsKeyType[]`    | -       | -    |
| extra     | 额外的自定义工具栏项目 | `React.ReactNode[]` | -       | -    |

**ToolsKeyType 可选值：**

格式相关：`'bold'` | `'italic'` | `'strikethrough'` | `'inline-code'` | `'color'` | `'clear'`

标题：`'head'` | `'H1'` | `'H2'` | `'H3'`

列表：`'b-list'`（无序） | `'n-list'`（有序） | `'t-list'`（任务）

块元素：`'quote'` | `'code'` | `'table'` | `'column'` | `'divider'` | `'link'`

对齐：`'align-left'` | `'align-center'` | `'align-right'`

历史：`'undo'` | `'redo'`

#### 浮动工具栏 (floatBar)

| 属性   | 说明               | 类型      | 默认值 | 版本 |
| ------ | ------------------ | --------- | ------ | ---- |
| enable | 是否启用浮动工具栏 | `boolean` | -      | -    |

#### 文本区域 (textAreaProps)

| 属性        | 说明             | 类型      | 默认值 | 版本 |
| ----------- | ---------------- | --------- | ------ | ---- |
| enable      | 是否启用文本区域 | `boolean` | -      | -    |
| placeholder | 占位符文本       | `string`  | -      | -    |

#### 拖拽 (drag)

| 属性   | 说明             | 类型      | 默认值 | 版本 |
| ------ | ---------------- | --------- | ------ | ---- |
| enable | 是否启用拖拽功能 | `boolean` | -      | -    |

#### Markdown 输入 (markdown)

| 属性             | 说明                                                                 | 类型      | 默认值  | 版本 |
| ---------------- | -------------------------------------------------------------------- | --------- | ------- | ---- |
| matchLeaf        | 是否启用叶子节点匹配                                                 | `boolean` | -       | -    |
| matchInputToNode | 是否启用输入到节点匹配（如输入 `- ` 转为列表），需显式传 `true` 开启 | `boolean` | `false` | -    |

#### 图片 (image)

| 属性   | 说明                       | 类型                                                                  | 默认值 | 版本 |
| ------ | -------------------------- | --------------------------------------------------------------------- | ------ | ---- |
| upload | 图片上传函数，返回图片 URL | `(files: File[] \| string[]) => Promise<string[] \| string>`          | -      | -    |
| render | 自定义图片渲染函数         | `(props: ImageProps, defaultDom: React.ReactNode) => React.ReactNode` | -      | -    |

#### 评论 (comment)

| 属性                | 说明                                                                            | 类型                                                                                                                                                                                     | 默认值 | 版本 |
| ------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---- |
| enable              | 是否启用评论功能                                                                | `boolean`                                                                                                                                                                                | -      | -    |
| onSubmit            | 评论提交回调                                                                    | `(id: string \| number, comment: CommentDataType) => void`                                                                                                                               | -      | -    |
| onDelete            | 删除评论回调                                                                    | `(id: string \| number, comment: CommentDataType) => void`                                                                                                                               | -      | -    |
| onEdit              | 编辑评论回调                                                                    | `(id: string \| number, comment: CommentDataType) => void`                                                                                                                               | -      | -    |
| onClick             | 点击评论回调                                                                    | `(id: string \| number, comment: CommentDataType) => void`                                                                                                                               | -      | -    |
| commentList         | 评论列表数据                                                                    | `CommentDataType[]`                                                                                                                                                                      | -      | -    |
| deleteConfirmText   | 删除评论确认文本                                                                | `string`                                                                                                                                                                                 | -      | -    |
| loadMentions        | 加载 @提及用户列表                                                              | `(text: string) => Promise<{ name: string }[]>`                                                                                                                                          | -      | -    |
| mentionsPlaceholder | @提及输入框占位符                                                               | `string`                                                                                                                                                                                 | -      | -    |
| placeholder         | 评论输入框占位符，未提供时回退到顶层的 [`titlePlaceholderContent`](#引用与其他) | `string`                                                                                                                                                                                 | -      | -    |
| editorRender        | 自定义评论编辑器渲染                                                            | `(dom: React.ReactNode) => React.ReactNode`                                                                                                                                              | -      | -    |
| listItemRender      | 自定义评论列表项渲染                                                            | `(defaultDom: { checkbox: ReactNode \| null; mentionsUser: ReactNode \| null; children: any }, comment: { element: Elements; children: ReactNode; attributes: any }) => React.ReactNode` | -      | -    |

#### CommentDataType

| 属性         | 说明         | 类型                                |
| ------------ | ------------ | ----------------------------------- |
| id           | 评论唯一标识 | `string \| number`                  |
| content      | 评论内容     | `string`                            |
| commentType  | 评论类型     | `string`                            |
| refContent   | 引用内容     | `string`                            |
| time         | 评论时间     | `number \| string`                  |
| selection    | Slate 选区   | `Selection`                         |
| path         | 节点路径     | `number[]`                          |
| anchorOffset | 锚点偏移     | `number`                            |
| focusOffset  | 焦点偏移     | `number`                            |
| updateTime   | 更新时间     | `number`                            |
| user         | 评论用户     | `{ name: string; avatar?: string }` |

#### 代码块 (codeProps)

| 属性                            | 说明                                                                                                                                     | 类型                                                                                         | 默认值                              | 版本    |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------- | ------- |
| render                          | 自定义代码块渲染，返回 `undefined` 回退默认渲染，返回 `null` 不渲染                                                                      | `(props: CustomLeaf, defaultDom: React.ReactNode, codeProps?: codeProps) => React.ReactNode` | -                                   | -       |
| Languages                       | 支持的编程语言列表                                                                                                                       | `string[]`                                                                                   | -                                   | -       |
| hideToolBar                     | 是否隐藏代码块工具栏                                                                                                                     | `boolean`                                                                                    | `false`                             | -       |
| alwaysExpandedDeepThink         | 是否始终展开深度思考块                                                                                                                   | `boolean`                                                                                    | `false`                             | -       |
| scrollDeepThinkIntoViewOnExpand | 深度思考块展开时是否将组件滚动到视窗内；传 `true` 默认 `{ behavior: 'smooth', block: 'nearest' }`，也可传 `ScrollIntoViewOptions` 自定义 | `boolean \| ScrollIntoViewOptions`                                                           | `false`                             | 2.32.33 |
| disableHtmlPreview              | 是否禁用 HTML 预览                                                                                                                       | `boolean`                                                                                    | -                                   | -       |
| viewModeLabels                  | 视图模式标签配置                                                                                                                         | `{ preview?: string; code?: string }`                                                        | `{ preview: '预览', code: '代码' }` | -       |
| ...                             | 支持所有 [Ace.EditorOptions](https://ace.c9.io/#nav=api&api=editor)                                                                      | `Partial<Ace.EditorOptions>`                                                                 | -                                   | -       |

#### 表格 (tableConfig)

| 属性         | 说明                         | 类型                                                                                     | 默认值 | 版本 |
| ------------ | ---------------------------- | ---------------------------------------------------------------------------------------- | ------ | ---- |
| minColumn    | 最小列数                     | `number`                                                                                 | -      | -    |
| minRows      | 最小行数                     | `number`                                                                                 | -      | -    |
| pure         | 是否启用纯净模式（无工具栏） | `boolean`                                                                                | -      | -    |
| previewTitle | 预览模式标题                 | `string`                                                                                 | -      | -    |
| actions      | 表格操作配置                 | `{ fullScreen?: 'modal' \| 'drawer'; download?: 'csv'; copy?: 'md' \| 'html' \| 'csv' }` | -      | -    |
| cssVariables | CSS 变量自定义表格样式       | `Record<\`--${string}\`, string>`                                                        | -      | -    |

#### 懒加载 (lazy)

| 属性              | 说明                               | 类型                                                                                                                                                                | 默认值    | 版本 |
| ----------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ---- |
| enable            | 是否启用懒加载，只有进入视口才渲染 | `boolean`                                                                                                                                                           | -         | -    |
| placeholderHeight | 占位高度（px）                     | `number`                                                                                                                                                            | `25`      | -    |
| rootMargin        | IntersectionObserver rootMargin    | `string`                                                                                                                                                            | `'200px'` | -    |
| renderPlaceholder | 自定义占位渲染                     | `(props: { height: number; style: React.CSSProperties; isIntersecting: boolean; elementInfo?: { type: string; index: number; total: number } }) => React.ReactNode` | -         | -    |

#### Jinja 模板 (jinja)

| 属性          | 说明                                 | 类型                                  | 默认值 | 版本 |
| ------------- | ------------------------------------ | ------------------------------------- | ------ | ---- |
| enable        | 总开关：语法高亮 + 模板面板          | `boolean`                             | -      | -    |
| docLink       | 使用说明链接                         | `string`                              | -      | -    |
| templatePanel | 模板面板配置，传 `true` 使用默认配置 | `boolean \| JinjaTemplatePanelConfig` | -      | -    |

**JinjaTemplatePanelConfig**

| 属性            | 说明                         | 类型                                                                                      | 默认值   |
| --------------- | ---------------------------- | ----------------------------------------------------------------------------------------- | -------- |
| enable          | 是否启用，默认 `true`        | `boolean`                                                                                 | `true`   |
| trigger         | 触发符                       | `string`                                                                                  | `'{}'`   |
| items           | 模板列表，静态数组或异步加载 | `JinjaTemplateItem[] \| ((params?: { editor?: Editor }) => Promise<JinjaTemplateItem[]>)` | 内置数据 |
| notFoundContent | 无数据时的内容               | `React.ReactNode`                                                                         | -        |

**JinjaTemplateItem**

| 属性        | 说明             | 类型     |
| ----------- | ---------------- | -------- |
| title       | 模板标题         | `string` |
| description | 模板描述（可选） | `string` |
| template    | 模板内容         | `string` |

#### 粘贴配置 (pasteConfig)

| 属性          | 说明             | 类型       | 默认值  | 版本 |
| ------------- | ---------------- | ---------- | ------- | ---- |
| enabled       | 是否启用粘贴     | `boolean`  | -       | -    |
| allowedTypes  | 允许的粘贴类型   | `string[]` | -       | -    |
| plainTextOnly | 是否仅粘贴纯文本 | `boolean`  | `false` | -    |

#### 链接配置 (linkConfig)

| 属性         | 说明                                      | 类型                                | 默认值 | 版本 |
| ------------ | ----------------------------------------- | ----------------------------------- | ------ | ---- |
| openInNewTab | 是否在新标签页打开链接                    | `boolean`                           | -      | -    |
| onClick      | 链接点击回调，返回 `false` 可阻止默认行为 | `(url?: string) => boolean \| void` | -      | -    |

#### 标签输入 (tagInputProps)

| 属性        | 说明                          | 类型                    | 默认值 | 版本 |
| ----------- | ----------------------------- | ----------------------- | ------ | ---- |
| enable      | 是否启用标签输入              | `boolean`               | -      | -    |
| placeholder | 占位符文本                    | `string`                | -      | -    |
| type        | 弹出方式                      | `'panel' \| 'dropdown'` | -      | -    |
| ...         | 支持 `TagPopupProps` 所有属性 | `TagPopupProps`         | -      | -    |

#### 插入自动补全 (insertAutocompleteProps)

| 属性          | 说明               | 类型                                                                                   | 默认值 | 版本 |
| ------------- | ------------------ | -------------------------------------------------------------------------------------- | ------ | ---- |
| insertOptions | 插入选项数组       | `InsertAutocompleteItem[]`                                                             | -      | -    |
| runInsertTask | 执行插入任务的函数 | `(task: InsertAutocompleteItem, offset: { x: number; y: number }) => Promise<boolean>` | -      | -    |
| getContainer  | 获取容器元素       | `() => HTMLElement`                                                                    | -      | -    |
| optionsRender | 操作选项渲染       | `(options: ItemType[]) => ItemType[]`                                                  | -      | -    |

#### 自定义渲染

| 属性          | 说明                                                                         | 类型                                                                                                           | 默认值 | 版本 |
| ------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------ | ---- |
| eleItemRender | 自定义元素渲染（Slate 模式）                                                 | `(props: RenderElementProps, defaultDom: React.ReactNode) => React.ReactNode`                                  | -      | -    |
| eleRender     | 自定义元素渲染（仅 `renderMode: 'markdown'`），返回 `undefined` 回退默认渲染 | `(props: MarkdownRendererEleProps, defaultDom: React.ReactNode) => React.ReactNode`                            | -      | -    |
| leafRender    | 自定义叶子节点渲染                                                           | `(props: Record<string, any> & { children: React.ReactNode }, defaultDom: React.ReactNode) => React.ReactNode` | -      | -    |

#### 事件回调

| 属性              | 说明                                  | 类型                                                                                          | 默认值 | 版本 |
| ----------------- | ------------------------------------- | --------------------------------------------------------------------------------------------- | ------ | ---- |
| onChange          | 内容变化回调                          | `(value: string, schema: Elements[]) => void`                                                 | -      | -    |
| onSelectionChange | 选区变化回调                          | `(selection: Selection \| null, selectedMarkdown: string, selectedNodes: Elements[]) => void` | -      | -    |
| onFocus           | 聚焦回调                              | `(value: string, schema: Elements[], e: React.FocusEvent<HTMLDivElement, Element>) => void`   | -      | -    |
| onBlur            | 失焦回调                              | `(value: string, schema: Elements[], e: React.MouseEvent<HTMLDivElement, Element>) => void`   | -      | -    |
| onPaste           | 粘贴回调，返回 `false` 可阻止默认粘贴 | `(e: React.ClipboardEvent<HTMLDivElement>) => boolean \| void`                                | -      | -    |

#### 引用与其他

| 属性                    | 说明                                                                                                                                  | 类型                                                                                                                                  | 默认值 | 版本 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---- |
| editorRef               | 编辑器实例引用                                                                                                                        | `React.Ref<MarkdownEditorInstance \| undefined>`                                                                                      | -      | -    |
| rootContainer           | 根容器引用                                                                                                                            | `React.MutableRefObject<HTMLDivElement \| undefined>`                                                                                 | -      | -    |
| plugins                 | 编辑器插件配置                                                                                                                        | `any[]`                                                                                                                               | -      | -    |
| markdownToHtmlOptions   | 自定义 unified 插件数组，每项为 `Plugin` 或 `[Plugin, ...options]`，例如 `[remarkGfm, [remarkMath, { singleDollarTextMath: false }]]` | `MarkdownToHtmlOptions`                                                                                                               | -      | -    |
| fncProps                | 脚注配置                                                                                                                              | `{ render: (...) => React.ReactNode; onOriginUrlClick?: (url?: string) => void; onFootnoteDefinitionChange?: (data: [...]) => void }` | -      | -    |
| anchorProps             | 锚点链接配置                                                                                                                          | `AnchorProps`                                                                                                                         | -      | -    |
| titlePlaceholderContent | 标题占位符内容；同时作为 `comment.placeholder` 未指定时的回退值                                                                       | `string`                                                                                                                              | -      | -    |
| attachment              | 附件配置                                                                                                                              | `Record<string, unknown>`                                                                                                             | -      | -    |
| toolbarConfig           | 工具栏配置（另一种方式）                                                                                                              | `{ show?: boolean; items?: string[] }`                                                                                                | -      | -    |
| fileMapConfig           | FileMapView 配置（仅 `renderMode: 'markdown'`）                                                                                       | `FileMapConfig`                                                                                                                       | -      | -    |
| apaasify                | 低代码渲染配置                                                                                                                        | `{ enable?: boolean; render?: (props: RenderElementProps, originData?: MessageBubbleData) => React.ReactNode }`                       | -      | -    |
| apassify                | `apaasify` 的旧拼写，已废弃，请使用 `apaasify`                                                                                        | `{ enable?: boolean; render?: (...) => React.ReactNode }`                                                                             | -      | -    |

### MarkdownEditorInstance

通过 `editorRef` 获取编辑器实例，支持以下属性和方法：

| 属性/方法            | 说明                                                                | 类型                                                               |
| -------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| store                | 编辑器内部状态管理（含 `getMDContent` / `setMDContent` 等常用方法） | `EditorStore`                                                      |
| markdownContainerRef | Markdown 容器 DOM 引用                                              | `React.MutableRefObject<HTMLDivElement \| null>`                   |
| markdownEditorRef    | Slate 编辑器实例引用                                                | `React.MutableRefObject<BaseEditor & ReactEditor & HistoryEditor>` |
| exportHtml           | 导出为 HTML 文件                                                    | `(filename?: string) => void`                                      |
| range                | 内部使用的选区缓存                                                  | `any`                                                              |
