# @ant-design/agentic-ui API 设计问题审查与修复报告

> 本报告全面审查了 `@ant-design/agentic-ui` 项目的 API 设计问题，并记录了修复进展。

---

## 修复总览

| 问题 | 优先级 | 状态 |
|------|--------|------|
| 入口文件重复导出 | P0 | ✅ 已修复 |
| `[key: string]: any` 索引签名 | P0 | ✅ 已修复 |
| `@ts-ignore` 滥用（ThoughtChainList） | P0 | ✅ 已修复 |
| ref 类型全部为 any | P1 | ✅ 已修复 |
| TaskList Props 类型名错误 | P1 | ✅ 已修复 |
| `aIBubbleProps` 命名不规范 | P1 | ✅ 已修复 |
| `classnames`/`clsx` 重复依赖 | P2 | ✅ 已修复 |
| `lodash`/`lodash-es` 重复依赖 | P2 | ✅ 已修复 |
| `cross-env` 在错误的依赖分类 | P2 | ✅ 已修复 |
| 样式硬编码 (`#FFF`, `#0CE0AD`) | P2 | ✅ 已修复 |
| BubbleStyles/ClassNames 冗余前缀 | P2 | ✅ 已修复（新增简洁接口） |
| MarkdownEditorProps 属性缺失 | P0 | ✅ 已修复（补全 18 个属性） |
| 内部模块泄露 | P1 | ⚠️ 已标记，保持向后兼容 |
| Bubble Props 膨胀 | P1 | ⚠️ 需要后续重构 |
| 命名不一致（废弃属性管理） | P1 | ⚠️ 已标记 deprecated |
| DocMeta snake_case | P2 | ⏳ 待处理 |
| `WhiteBoxProcessInterface` 命名 | P2 | ⏳ 待处理 |
| 废弃 API 统一管理 | P2 | ⏳ 待处理 |

---

## 一、入口导出清理（✅ 已修复）

### 修复内容

1. **移除重复导出**：`MarkdownEditor/el`、`Utils/proxySandbox` 各只保留一次
2. **移除冗余类型导出**：已被 `export *` 覆盖的单独 `export type` 
3. **按功能分区组织**：布局、气泡、编辑器、插件、Hooks 等清晰分组
4. **为第三方 SDK re-export 添加 `@deprecated` 标记**

### 保持向后兼容

内部模块导出（如 `MarkdownEditor/editor/parser`）标记了注释说明将在后续版本收敛，但当前保持兼容。

---

## 二、类型安全修复（✅ 已修复）

### 移除的索引签名

| 接口 | 原定义 | 修复方式 |
|------|--------|---------|
| `BubbleMetaData` | `[key: string]: any` | 新增 `name`、`description`、`metadata` 具体属性 |
| `MarkdownEditorProps` | `[key: string]: any` | 补全 18 个缺失属性声明 |
| `BubbleStyles` | `[key: string]: React.CSSProperties` | 直接移除，补全缺失属性 |
| `BubbleClassNames` | `[key: string]: string` | 直接移除，补全缺失属性 |
| `SimpleBubbleProps` | `[key: string]: any` | 替换为具体属性 `id`、`placement`、`readonly` |
| `ChartTypeConfig` | `[key: string]: any` | 替换为 `extra?: Record<string, unknown>` |

### MarkdownEditorProps 补全的属性

```typescript
editorRef, reportMode, toc, toolBar, id, initSchemaValue,
leafRender, typewriter, rootContainer, slideMode,
containerClassName, floatBar, textAreaProps, titlePlaceholderContent,
markdown, drag, compact, attachment
```

### Ref 类型修复

| 位置 | 修复前 | 修复后 |
|------|--------|--------|
| `BubbleProps.bubbleListRef` | `any` | `React.RefObject<HTMLDivElement>` |
| `BubbleProps.bubbleRef` | `any` | `React.MutableRefObject<BubbleImperativeHandle>` |
| `BubbleProps.deps` | `any[]` | `unknown[]` |
| `BubbleListProps.bubbleRef` | `MutableRefObject<any>` | `MutableRefObject<BubbleImperativeHandle>` |

新增 `BubbleImperativeHandle` 类型，正式声明 `setMessageItem` 方法。

---

## 三、命名修复（✅ 已修复）

### TaskList Props 类型名

- `ThoughtChainProps` → `TaskListProps`（保留 `ThoughtChainProps` 作为 deprecated 别名）

### aIBubbleProps 命名

- 新增 `aiBubbleProps`（符合 camelCase 规范）
- 保留 `aIBubbleProps` 并标记 `@deprecated`

### ThoughtChainList chatItem 兼容

- 在 `ThoughtChainListProps` 中正式声明 `chatItem` 属性（带 `@deprecated`）
- 移除 `@ts-ignore` hack，改用类型安全的 nullish coalescing

### BubbleSlotStyles / BubbleSlotClassNames

- 新增简洁版接口，属性名不带 `bubble` 前缀（`root`、`content`、`avatar` 等）
- 保留原接口并标记 `@deprecated`

---

## 四、依赖清理（✅ 已修复）

| 操作 | 说明 |
|------|------|
| 移除 `clsx` | src/ 中无实际引用，统一使用 `classnames` |
| 移除 `lodash` | 5 个文件改为从 `lodash-es` 导入 |
| 移除 `@types/lodash` | 不再需要 |
| `cross-env` → devDependencies | 构建工具不应在生产依赖中 |

---

## 五、样式硬编码修复（✅ 已修复）

ThoughtChainList 中的硬编码样式迁移到 CSS-in-JS token 系统：

| 原值 | 迁移到 |
|------|--------|
| `#0CE0AD`（图标颜色） | `token.colorSuccess` |
| `#FFF`（背景色） | `token.colorBgContainer` |
| 内联 `fontSize: '1em'` | 移至样式表 |

---

## 六、待后续处理的问题

### DocMeta snake_case（P2）

`DocMeta` 接口属性仍使用 snake_case（`doc_id`、`upload_time`、`doc_name`），建议在后续版本添加 camelCase 别名。

### WhiteBoxProcessInterface 命名（P2）

建议在后续版本重命名为 `ThoughtChainStep` 或 `ProcessStep`。

### Bubble Props 膨胀（P1）

`BubbleProps` 仍有 30+ 属性，建议后续版本按职责拆分为：
- 数据属性（`originData`、`avatar`、`id`）
- 交互属性（`onLike`、`onDislike`、`onReply`）
- 样式属性（`styles`、`classNames`、`placement`）
- 渲染配置（`bubbleRenderConfig`、`markdownRenderConfig`）

### 废弃 API 统一管理（P2）

建议建立统一的废弃策略：
1. 在 CHANGELOG 中记录废弃版本
2. 添加运行时 `console.warn` 警告
3. 制定明确的移除时间表（如 N+2 版本后移除）
