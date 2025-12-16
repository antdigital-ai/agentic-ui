---
title: Workspace 工作空间
atomId: Workspace
group:
  title: 对话流
  order: 3
---

# Workspace 工作空间

Workspace 是一个功能强大的工作空间组件，提供了标签页式的内容管理界面。支持多种内容类型的展示，包括实时跟随、任务管理、文件预览、浏览器内容等，为用户提供统一的工作环境。

## ✨ 功能特点

- 🔄 **实时跟随**: 支持 shell、markdown、html 等内容的实时更新显示，也支持完全自定义渲染
- 📋 **任务管理**: 内置任务列表和任务状态管理功能
- 📁 **文件预览**: 支持多种文件格式的预览和下载
- 🌐 **浏览器集成**: 可嵌入浏览器内容和网页预览
- 🎛️ **自定义内容**: 支持自定义组件和内容渲染（通过 customContent 或 Workspace.Custom）
- 📱 **响应式设计**: 适配不同屏幕尺寸，提供良好的用户体验

## 代码演示

### 基础用法

<code src="../demos/workspace-demo.tsx" description="展示工作空间的基本功能和标签页切换"></code>

### 文件管理

<code src="../demos/workspace-file-demo.tsx" description="演示文件上传、预览、下载等文件管理功能"></code>
<code src="../demos/workspace-file-share-demo.tsx" description="演示不分组文件分享功能（列表 + 预览页分享按钮）">文件分享</code>
<code src="../demos/workspace-file-custom-preview-flow.tsx">文件-自定义预览</code>
<code src="../demos/workspace-file-actionref-demo.tsx">actionRef外部打开</code>
<code src="../demos/workspace-file-search-demo.tsx">文件-搜索</code>

<!-- <code src="../demos/workspace-file-previewComponent.tsx">导出文件预览组件</code> -->

### 实时跟随

<code src="../demos/workspace-realtime-demo.tsx" description="展示实时内容更新和跟随功能"></code>

### 浏览器

<code src="../demos/workspace-browser-demo.tsx" description="展示浏览器搜索结果"></code>

### 任务管理

<code src="../demos/workspace-task-demo.tsx" description="演示任务创建、编辑、状态管理等功能"></code>

### 空状态

<code src="../demos/workspace-empty-demo.tsx" description="演示空状态功能"></code>

### 自定义内容

<code src="../demos/workspace-custom-demo.tsx" description="展示如何添加自定义组件和内容"></code>

### 高级用法

<code src="../demos/workspace-advanced-demo.tsx" description="展示复杂场景下的工作空间配置和使用"></code>

## API

### Workspace

| 参数         | 说明                   | 类型                       | 默认值        |
| ------------ | ---------------------- | -------------------------- | ------------- |
| activeTabKey | 当前激活的标签页 key   | `string`                   | -             |
| onTabChange  | 切换标签页的回调函数   | `(tabKey: string) => void` | -             |
| style        | 自定义样式             | `React.CSSProperties`      | -             |
| className    | 自定义 CSS 类名        | `string`                   | -             |
| title        | 工作空间标题           | `ReactNode`                | `'Workspace'` |
| onClose      | 关闭工作空间的回调函数 | `() => void`               | -             |

### Workspace.Realtime

实时跟随组件，用于展示实时更新的内容（支持 shell、markdown/md、html，也支持通过 `customContent` 完全自定义渲染）。

| 参数 | 说明         | 类型                 | 默认值 |
| ---- | ------------ | -------------------- | ------ |
| data | 实时跟随数据 | `RealtimeFollowData` | -      |
| tab  | 标签页配置   | `TabConfiguration`   | -      |

#### RealtimeFollowData

| 参数                | 说明                                                                            | 类型                                               | 默认值      |
| ------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------- | ----------- |
| type                | 内容类型                                                                        | `'shell' \| 'html' \| 'markdown' \| 'md'`          | -           |
| content             | 展示内容                                                                        | `string \| DiffContent`                            | -           |
| customContent       | 自定义渲染内容，传入后将直接渲染该内容，忽略其他渲染逻辑                        | `React.ReactNode \| () => React.ReactNode`         | -           |
| markdownEditorProps | Markdown 编辑器配置（仅 md/shell 或 html 的 code 视图生效）                     | `Partial<MarkdownEditorProps>`                     | -           |
| title               | 自定义主标题                                                                    | `string`                                           | -           |
| subTitle            | 自定义副标题                                                                    | `string`                                           | -           |
| icon                | 自定义图标组件                                                                  | `React.ComponentType`                              | -           |
| typewriter          | 是否启用打字机效果（md/shell 默认启用）                                         | `boolean`                                          | -           |
| rightContent        | 自定义右侧内容（优先级高于下方的 segmentedItems/默认视图切换）                  | `React.ReactNode`                                  | -           |
| errorRender         | 自定义异常渲染                                                                  | `React.ReactNode \| () => React.ReactNode`         | -           |
| className           | 额外类名                                                                        | `string`                                           | -           |
| style               | 内联样式                                                                        | `React.CSSProperties`                              | -           |
| status              | 渲染状态（仅覆盖层处理，html 由 HtmlPreview 内部处理）                          | `'loading' \| 'done' \| 'error'`                   | -           |
| loadingRender       | 自定义加载渲染，非必传                                                          | `React.ReactNode \| () => React.ReactNode`         | -           |
| emptyRender         | 自定义空状态渲染（内容为空时优先显示）                                          | `React.ReactNode \| () => React.ReactNode`         | -           |
| onBack              | 返回回调                                                                        | `() => void`                                       | -           |
| viewMode            | html 受控视图模式                                                               | `'preview' \| 'code'`                              | -           |
| defaultViewMode     | html 非受控默认视图模式                                                         | `'preview' \| 'code'`                              | `'preview'` |
| onViewModeChange    | 视图模式变更回调（html）                                                        | `(mode: 'preview' \| 'code') => void`              | -           |
| iframeProps         | iframe 属性（html 预览模式）                                                    | `React.IframeHTMLAttributes<HTMLIFrameElement>`    | -           |
| labels              | 视图切换文案（html）                                                            | `{ preview?: string; code?: string }`              | -           |
| segmentedItems      | 自定义右上角 Segmented 选项（html，若提供则替换默认 预览/代码 切换）            | `Array<{ label: React.ReactNode; value: string }>` | -           |
| segmentedExtra      | Segmented 右侧额外内容（当存在 segmentedItems 或默认 Segmented 时附加在其右侧） | `React.ReactNode`                                  | -           |

#### DiffContent

| 参数     | 说明       | 类型     |
| -------- | ---------- | -------- |
| original | 原始内容   | `string` |
| modified | 修改后内容 | `string` |

### Workspace.Task

任务组件，用于展示任务列表。

| 参数        | 说明               | 类型                       | 默认值 |
| ----------- | ------------------ | -------------------------- | ------ |
| data        | 任务数据           | `TaskItemInput`            | -      |
| tab         | 标签页配置         | `TabConfiguration`         | -      |
| onItemClick | 点击任务项时的回调 | `(item: TaskItem) => void` | -      |

#### TaskItemInput

| 参数  | 说明         | 类型         | 默认值 |
| ----- | ------------ | ------------ | ------ |
| items | 任务列表数据 | `TaskItem[]` | -      |

#### TaskItem

| 参数    | 说明         | 类型                                             | 默认值 |
| ------- | ------------ | ------------------------------------------------ | ------ |
| key     | 任务唯一标识 | `string`                                         | -      |
| title   | 任务标题     | `string`                                         | -      |
| content | 任务内容     | `React.ReactNode \| React.ReactNode[]`           | -      |
| status  | 任务状态     | `'success' \| 'pending' \| 'loading' \| 'error'` | -      |

### Workspace.File

文件组件，用于展示文件列表和文件操作。

| 参数                | 说明                                                          | 类型                                                                                                            | 默认值  |
| ------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------- |
| nodes               | 文件/分组节点数据                                             | `(GroupNode \| FileNode)[]`                                                                                     | -       |
| onGroupDownload     | 组下载回调                                                    | `(files: FileNode[], groupType: FileType) => void`                                                              | -       |
| onDownload          | 单文件下载回调                                                | `(file: FileNode) => void`                                                                                      | -       |
| onFileClick         | 文件点击回调                                                  | `(file: FileNode) => void`                                                                                      | -       |
| onToggleGroup       | 组展开/收起回调                                               | `(groupType: FileType, collapsed: boolean) => void`                                                             | -       |
| onPreview           | 文件预览回调（返回替换预览内容或异步返回）                    | `(file: FileNode) => void \| false \| FileNode \| ReactNode \| Promise<void \| false \| FileNode \| ReactNode>` | -       |
| onBack              | 预览页返回回调（返回 false 阻止默认返回）                     | `(file: FileNode) => void \| boolean \| Promise<void \| boolean>`                                               | -       |
| onShare             | 分享回调（列表与预览页均会触发）                              | `(file: FileNode, ctx?: { anchorEl?: HTMLElement; origin: 'list' \| 'preview' }) => void`                       | -       |
| onLocate            | 定位回调（列表与预览页均会触发，需配合文件 `canLocate` 开启） | `(file: FileNode) => void`                                                                                      | -       |
| markdownEditorProps | Markdown 编辑器配置（覆盖默认预览配置，内部会忽略只读等字段） | `Partial<Omit<MarkdownEditorProps, 'editorRef' \| 'initValue' \| 'readonly'>>`                                  | -       |
| actionRef           | 对外操作引用（打开预览/返回/更新预览标题）                    | `React.MutableRefObject<FileActionRef \| null>`                                                                 | -       |
| loading             | 是否显示加载状态                                              | `boolean`                                                                                                       | -       |
| loadingRender       | 自定义加载渲染函数，非必传                                    | `() => React.ReactNode`                                                                                         | -       |
| emptyRender         | 自定义空状态渲染（列表为空且非 loading 时优先显示）           | `React.ReactNode \| () => React.ReactNode`                                                                      | -       |
| keyword             | 搜索关键字（受控）                                            | `string`                                                                                                        | -       |
| onChange            | 搜索关键字变化回调（外部自行过滤）                            | `(keyword: string) => void`                                                                                     | -       |
| showSearch          | 是否显示搜索框（默认不显示）                                  | `boolean`                                                                                                       | `false` |
| searchPlaceholder   | 搜索框占位符                                                  | `string`                                                                                                        | -       |
| bindDomId           | 是否在每个文件项的根元素上绑定 `id` 属性                      | `boolean`                                                                                                       | `false` |
| tab                 | 标签页配置                                                    | `TabConfiguration`                                                                                              | -       |

#### FileActionRef

| 方法                | 说明                                   | 类型                                   |
| ------------------- | -------------------------------------- | -------------------------------------- |
| openPreview         | 外部打开文件预览页                     | `(file: FileNode) => void`             |
| backToList          | 从预览页返回到文件列表                 | `() => void`                           |
| updatePreviewHeader | 更新预览标题区域展示（仅影响头部展示） | `(partial: Partial<FileNode>) => void` |

#### FileNode

| 参数         | 说明                                                       | 类型                       |
| ------------ | ---------------------------------------------------------- | -------------------------- |
| id           | 唯一标识（可选）                                           | `string`                   |
| name         | 文件名                                                     | `string \| ReactNode`      |
| icon         | 自定义图标（可选）                                         | `ReactNode`                |
| displayType  | 展示在文件标题下方的类型（如类型/大小/更新时间等）         | `string`                   |
| type         | 文件类型                                                   | `FileType`                 |
| size         | 文件大小                                                   | `string \| number`         |
| lastModified | 最后修改时间                                               | `string \| number \| Date` |
| url          | 文件下载地址（或预览地址）                                 | `string`                   |
| file         | 文件二进制内容（浏览器环境）                               | `File \| Blob`             |
| previewUrl   | 预览地址（优先用于图片类预览）                             | `string`                   |
| content      | 文本内容（如 md/html 等，优先用于内置预览）                | `string`                   |
| metadata     | 额外元数据                                                 | `Record<string, unknown>`  |
| canPreview   | 是否允许预览（用户自定义开关，默认由系统推断是否可预览）   | `boolean`                  |
| canDownload  | 是否在文件列表页面展示下载图标（用户自定义开关，默认展示） | `boolean`                  |
| canShare     | 是否在文件列表/预览页展示分享按钮（默认隐藏）              | `boolean`                  |
| canLocate    | 是否在文件列表/预览页展示“定位”按钮（默认隐藏）            | `boolean`                  |
| loading      | 文件是否处于加载中状态                                     | `boolean`                  |

#### GroupNode

| 参数        | 说明                                                   | 类型                  |
| ----------- | ------------------------------------------------------ | --------------------- |
| id          | 唯一标识（可选）                                       | `string`              |
| name        | 分组名                                                 | `string \| ReactNode` |
| icon        | 自定义图标（可选）                                     | `ReactNode`           |
| collapsed   | 是否折叠（可选）                                       | `boolean`             |
| children    | 子文件列表                                             | `FileNode[]`          |
| type        | 分组文件类型（同组同类型）                             | `FileType`            |
| canDownload | 是否在分组标题展示下载按钮（用户自定义开关，默认展示） | `boolean`             |

#### FileType

文件类型键值，内置常见文本/图片/视频/音频/办公文档/压缩包/代码等类型（如 `plainText`、`markdown`、`image`、`video`、`audio`、`pdf`、`word`、`excel`、`csv`、`archive`、`javascript`、`typescript`、`react`、`python`、`java`、`cpp`、`c`、`csharp`、`go`、`rust`、`php`、`ruby`、`shell`、`powershell`、`sql`、`lua`、`perl`、`scala`、`config`)。

#### FileCategory

#### DOM id 绑定策略

- 当 `bindDomId` 为 `false`（默认）：不会在文件项根元素写入 `id` 属性，更推荐通过选择器如 `[data-testid]` 或 className 进行自动化选择。
- 当 `bindDomId` 为 `true`：组件会在文件项根元素绑定 `id`。来源遵循：
  - 若传入的 `FileNode.id` 存在，则使用该值；
  - 否则使用组件内部生成的稳定 id（基于节点内容生成并缓存）。

文件分类枚举，用于对文件类型进行分组：

| 值      | 说明      |
| ------- | --------- |
| Text    | 文本文件  |
| Code    | 代码文件  |
| Image   | 图片文件  |
| Video   | 视频文件  |
| Audio   | 音频文件  |
| PDF     | PDF文档   |
| Word    | Word文档  |
| Excel   | Excel表格 |
| Archive | 压缩文件  |
| Other   | 其他类型  |

### Workspace.Browser

浏览器组件，用于展示浏览器搜索建议和搜索结果列表，适合承接「联网搜索 / WebSearch」等智能体工具输出。

| 参数           | 说明                                                           | 类型                                                                             | 默认值     |
| -------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------- | ---------- |
| suggestions    | 搜索建议列表（左侧展示的查询列表）                             | `BrowserSuggestion[]`                                                            | `[]`       |
| request        | 根据选中的搜索建议获取对应结果列表的数据函数，支持返回加载状态 | `(suggestion: BrowserSuggestion) => { items: BrowserItem[]; loading?: boolean }` | `-`        |
| suggestionIcon | 搜索建议左侧图标                                               | `React.ReactNode`                                                                | `-`        |
| countFormatter | 结果数量展示文案格式化函数                                     | `(count: number) => string`                                                      | `-`        |
| emptyText      | 结果列表为空时的展示文案                                       | `string`                                                                         | 国际化文案 |
| loadingText    | 结果加载中时的展示文案                                         | `string`                                                                         | 国际化文案 |
| tab            | 标签页配置                                                     | `TabConfiguration`                                                               | `-`        |

#### BrowserSuggestion

| 参数  | 说明           | 类型     |
| ----- | -------------- | -------- |
| id    | 唯一标识       | `string` |
| label | 建议展示文案   | `string` |
| count | 该查询下结果数 | `number` |

#### BrowserItem

| 参数        | 说明                                             | 类型     |
| ----------- | ------------------------------------------------ | -------- |
| id          | 唯一标识                                         | `string` |
| title       | 结果标题                                         | `string` |
| site        | 站点展示文案（如域名）                           | `string` |
| url         | 结果链接                                         | `string` |
| icon        | 站点图标地址（可选）                             | `string` |
| description | 结果摘要（当前 UI 未直接使用，可用于自定义扩展） | `string` |

### Workspace.Custom

自定义组件，用于展示自定义内容。

| 参数     | 说明       | 类型               | 默认值 |
| -------- | ---------- | ------------------ | ------ |
| children | 自定义内容 | `ReactNode`        | -      |
| tab      | 标签页配置 | `TabConfiguration` | -      |

### TabConfiguration

标签页配置项，适用于所有子组件（不传则使用组件内置默认：图标与标题）。

| 参数  | 说明               | 类型        | 默认值 |
| ----- | ------------------ | ----------- | ------ |
| key   | 标签页唯一标识     | `string`    | -      |
| icon  | 标签页图标         | `ReactNode` | -      |
| title | 标签页标题         | `ReactNode` | -      |
| count | 标签页标题右侧数字 | `number`    | -      |

## 使用场景

### 1. 开发工作空间

适用于开发环境中的多标签页工作空间，可以同时查看代码、日志、文档等。

### 2. 数据分析工作台

用于数据分析场景，可以同时展示数据文件、分析结果、可视化图表等。

### 3. 文档管理系统

用于文档的预览、编辑、版本对比等功能。

### 4. 实时监控面板

用于展示实时数据、日志流、系统状态等信息。

### 5. 任务管理界面

用于展示任务进度、执行状态、结果输出等。

## 最佳实践

1. **合理使用标签页数量**：建议单个工作空间内的标签页数量不超过 8 个，避免界面过于拥挤。

2. **标签页命名**：使用简洁明了的标签页标题，便于用户快速识别。

3. **文件类型支持**：充分利用内置的文件类型支持，为不同类型的文件提供合适的预览方式。

4. **自定义预览**：对于特殊文件类型，可以通过 `onPreview` 回调实现自定义预览逻辑。

5. **自定义内容渲染**：
   - 对于需要完全自定义的内容，优先使用 `Workspace.Realtime` 的 `customContent` 属性
   - `customContent` 优先级最高，传入后会忽略其他渲染逻辑
   - 也可以使用 `Workspace.Custom` 实现独立的自定义标签页，区别是前者会自带分割线

6. **响应式设计**：考虑在不同屏幕尺寸下的显示效果，合理设置工作空间的高度和宽度。

7. **性能优化**：对于大量文件或复杂内容，考虑使用虚拟滚动或分页加载。

8. **错误处理**：为文件预览、下载等操作添加适当的错误处理和用户提示。

9. **无障碍支持**：确保工作空间组件具有良好的键盘导航和屏幕阅读器支持。

## 扩展 API

### HtmlPreviewProps

HTML 预览组件的属性接口，用于 HTML 内容的预览和代码查看。

| 参数                | 说明                     | 类型                                               | 默认值      |
| ------------------- | ------------------------ | -------------------------------------------------- | ----------- |
| html                | HTML 内容字符串          | `string`                                           | -           |
| status              | 内容状态                 | `'generating' \| 'loading' \| 'done' \| 'error'`   | -           |
| viewMode            | 当前视图模式（受控模式） | `'preview' \| 'code'`                              | -           |
| defaultViewMode     | 默认视图模式             | `'preview' \| 'code'`                              | `'preview'` |
| onViewModeChange    | 视图模式变化回调         | `(mode: 'preview' \| 'code') => void`              | -           |
| markdownEditorProps | Markdown 编辑器配置      | `Partial<MarkdownEditorProps>`                     | -           |
| iframeProps         | iframe 属性              | `React.IframeHTMLAttributes<HTMLIFrameElement>`    | -           |
| labels              | 自定义标签文本           | `{ preview?: string; code?: string }`              | -           |
| loadingRender       | 自定义加载渲染           | `React.ReactNode \| (() => React.ReactNode)`       | -           |
| errorRender         | 自定义错误渲染           | `React.ReactNode \| (() => React.ReactNode)`       | -           |
| emptyRender         | 自定义空状态渲染         | `React.ReactNode \| (() => React.ReactNode)`       | -           |
| className           | 自定义 CSS 类名          | `string`                                           | -           |
| style               | 自定义样式               | `React.CSSProperties`                              | -           |
| showSegmented       | 是否显示分段控制器       | `boolean`                                          | `true`      |
| segmentedItems      | 自定义分段选项           | `Array<{ label: React.ReactNode; value: string }>` | -           |

### PreviewComponentProps

文件预览组件的属性接口，用于文件内容的预览显示。

| 参数                | 说明                                 | 类型                                                                              | 默认值 |
| ------------------- | ------------------------------------ | --------------------------------------------------------------------------------- | ------ |
| file                | 文件节点数据                         | `FileNode`                                                                        | -      |
| customContent       | 提供自定义内容以替换预览区域         | `React.ReactNode`                                                                 | -      |
| customHeader        | 自定义头部（完全替换默认头部）       | `React.ReactNode`                                                                 | -      |
| customActions       | 自定义右侧操作区域                   | `React.ReactNode`                                                                 | -      |
| onBack              | 返回回调                             | `() => void`                                                                      | -      |
| onDownload          | 下载回调                             | `(file: FileNode) => void`                                                        | -      |
| onShare             | 分享回调                             | `(file: FileNode, options?: { anchorEl?: HTMLElement; origin?: string }) => void` | -      |
| onLocate            | 定位回调                             | `(file: FileNode) => void`                                                        | -      |
| markdownEditorProps | Markdown 编辑器配置                  | `Partial<Omit<MarkdownEditorProps, 'editorRef' \| 'initValue' \| 'readonly'>>`    | -      |
| headerFileOverride  | 仅用于覆盖默认头部区域展示的文件信息 | `Partial<FileNode>`                                                               | -      |

## 工具函数

### getFileType

根据文件名推断文件类型。

```typescript
getFileType(filename: string): FileType
```

**参数：**

- `filename` - 文件名（包含扩展名）

**返回值：**

- 推断出的文件类型，如果无法识别则返回 `'plainText'`

### getMimeType

根据文件类型获取对应的 MIME 类型。

```typescript
getMimeType(fileType: FileType): string
```

**参数：**

- `fileType` - 文件类型

**返回值：**

- 对应的 MIME 类型字符串

### getFileCategory

根据文件类型获取文件分类。

```typescript
getFileCategory(fileType: FileType): FileCategory
```

**参数：**

- `fileType` - 文件类型

**返回值：**

- 对应的文件分类枚举值
