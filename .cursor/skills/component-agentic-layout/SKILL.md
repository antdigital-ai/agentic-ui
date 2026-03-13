---
name: component-agentic-layout
description: Develop AgenticLayout (left-center-right layout with header) in @ant-design/agentic-ui. Use when building app shell, sidebar layout, or three-column layout. Triggers on AgenticLayout, layout, left center right, header, sidebar.
---

# AgenticLayout 组件开发

智能体应用主布局：左-中-右三栏 + 头部，用于应用外壳与侧栏布局。修改布局或头部时，按本技能内的 API 与规范直接实现，无需再查源码。

## 组件 API（自包含）

### AgenticLayoutProps

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `left` | 左侧内容 | ReactNode | - |
| `center` | 中间内容（必填） | ReactNode | - |
| `right` | 右侧内容 | ReactNode | - |
| `header` | 头部配置，见下 | LayoutHeaderConfig | - |
| `style` | 自定义样式，会透传到根节点（可含 `minHeight` 等） | React.CSSProperties | - |
| `className` | 自定义类名，与根节点 `prefixCls`、`hashId` 一起拼接 | string | - |
| `leftWidth` | 左侧宽度（px） | number | 256 |
| `rightWidth` | 右侧宽度（px），可被用户拖拽改变，会受最小/最大限制 | number | 540 |
| `minHeight` | 最小高度（类型已声明，实现上可用 `style.minHeight` 覆盖样式默认值） | string \| number | - |
| `children` | 子元素（兼容用，内容建议用 `center`） | ReactNode | - |

说明：根节点最小高度由样式固定为 600px；需自定义时传 `style={{ minHeight: '...' }}`。当前未从 props 的 `minHeight` 读到根节点，与类型保持一致即可。

### LayoutHeaderConfig（头部配置）

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `title` | 标题，支持文本或 React 节点 | ReactNode | `'AI 助手'` |
| `showShare` | 是否显示分享按钮 | boolean | false |
| `leftCollapsible` | 左侧是否可折叠（未传时由 AgenticLayout 按是否有 `left` 推断） | boolean | - |
| `rightCollapsible` | 右侧是否可折叠（未传时由 AgenticLayout 按是否有 `right` 推断） | boolean | - |
| `leftCollapsed` | 左侧折叠状态（受控） | boolean | - |
| `rightCollapsed` | 右侧折叠状态（受控） | boolean | - |
| `leftDefaultCollapsed` | 左侧默认折叠（非受控） | boolean | false |
| `rightDefaultCollapsed` | 右侧默认折叠（非受控） | boolean | false |
| `onLeftCollapse` | 左侧折叠回调 | (collapsed: boolean) => void | - |
| `onRightCollapse` | 右侧折叠回调 | (collapsed: boolean) => void | - |
| `onShare` | 分享点击 | () => void | - |
| `leftExtra` | 头部左侧额外内容，渲染在标题同侧 | ReactNode | - |
| `rightExtra` | 头部右侧额外内容，渲染在分享/折叠按钮同侧 | ReactNode | - |
| `className` | 头部根节点自定义类名 | string | - |

折叠状态：有 `leftCollapsed`/`rightCollapsed` 时为受控；否则用 `leftDefaultCollapsed`/`rightDefaultCollapsed` 作初始值，由内部 `useMergedState` + `onLeftCollapse`/`onRightCollapse` 更新。LayoutHeader 内部用 I18n 的 `locale['chatFlow.collapseLeft']`、`locale['chatFlow.collapseRight']`、`locale['chatFlow.share']` 等做文案与 aria-label。

### 导出（库入口）

- **AgenticLayout**：`export { AgenticLayout }`，类型 `export interface AgenticLayoutProps`
- **LayoutHeader**：`export { LayoutHeader }`，类型 `export type { LayoutHeaderConfig, LayoutHeaderProps }`（LayoutHeaderProps 与 LayoutHeaderConfig 相同）

从 `@ant-design/agentic-ui` 可解构：`AgenticLayout`、`AgenticLayoutProps`、`LayoutHeader`、`LayoutHeaderConfig`、`LayoutHeaderProps`。

## DOM 与类名结构（BEM）

### AgenticLayout

- 根：`prefixCls`（默认 `ant-agentic-layout`）
- 主体：`${prefixCls}-body`（flex 容器）
- 左侧栏：`${prefixCls}-sidebar`、`${prefixCls}-sidebar-left`，折叠时加 `${prefixCls}-sidebar-left-collapsed`
- 中间区：`${prefixCls}-main`，内容包裹在 `${prefixCls}-main-content`；头部渲染在 main 内、content 前；main-content 高度为 `calc(100% - 48px)` 以预留头部
- 右侧栏容器：`${prefixCls}-sidebar-wrapper-right`，内为拖拽手柄 + 右侧栏
- 拖拽手柄：`${prefixCls}-resize-handle`、`${prefixCls}-resize-handle-right`（宽度 6px，hover 时高亮）
- 右侧栏：`${prefixCls}-sidebar`、`${prefixCls}-sidebar-right`，折叠时加 `${prefixCls}-sidebar-right-collapsed`
- 侧栏内容区：`${prefixCls}-sidebar-content`

样式通过 `useAgenticLayoutStyle(prefixCls)` 注册，使用项目内 `useEditorStyleRegister` 与 token（如 `componentCls`）。根节点在样式中设 `minHeight: 600px`。

### LayoutHeader（头部子组件）

- 根：`prefixCls`（默认 `ant-layout-header`）
- 左侧区域：`${prefixCls}-left`（含折叠按钮、分隔线、标题、leftExtra）
- 标题：`${prefixCls}-left-title`
- 左侧分隔线：`${prefixCls}-left-separator`（在折叠按钮与标题之间）
- 右侧区域：`${prefixCls}-right`（含分享按钮、折叠按钮、rightExtra）
- 分享按钮：`${prefixCls}-right-share-btn`

样式通过 `useLayoutHeaderStyle(prefixCls)` 注册；头部高度 48px（minHeight），与 main-content 的 48px 对应。

## 行为与常量

- **右侧栏**：可拖拽调整宽度。最小宽度 `MIN_RIGHT_WIDTH = 400`（px），最大宽度 `window.innerWidth * 0.7`；`rightWidth` 变化会同步到内部 state；折叠时宽度为 0。
- **左侧栏**：宽度由 `leftWidth` 控制，默认 `DEFAULT_LEFT_WIDTH = 256`（px），无拖拽；折叠时宽度为 0。
- **右侧默认宽度**：`DEFAULT_RIGHT_WIDTH = 540`（px）。
- **头部**：使用 `LayoutHeader`（来自 `Components/LayoutHeader`），传入 `header` 并补充 `leftCollapsible`/`rightCollapsible`（未传时由是否有 `left`/`right` 决定）。头部高度 48px；拖拽手柄宽度 6px。
- **根节点**：样式里 `minHeight: 600px`，无 `prefixCls`/`classNames`/`styles` 等 Semantic 透传，仅 `style`、`className`。

## 开发规范（与 AGENTS 一致）

- 使用 Ant Design Token 与 `useAgenticLayoutStyle`，支持主题与响应式；样式用 `createStyles`/token，避免硬编码颜色与尺寸。
- 类名用 `clsx` 拼接；支持 `classNames`/`styles` 时按项目 Semantic 规范命名。
- Props/事件命名：配置用 `Config` 后缀，事件用 `on` 前缀；布尔用 `showXxx`、`xxxCollapsible`、`xxxCollapsed`。
- 组件为函数式 + Hooks；用 `React.memo` 包装导出组件；保持向下兼容，不破坏已有 props。
- 与 ChatLayout、Workspace 等组合时保持结构清晰，避免嵌套过深。

按上述 API、DOM 结构和规范修改布局或头部即可，无需依赖源码路径。
