# @ant-design/agentic-ui API 设计问题审查报告

> 本报告全面审查了 `@ant-design/agentic-ui` 项目的 API 设计、命名规范、类型安全、架构组织等方面的问题，并给出改进建议。

---

## 一、入口导出混乱（`src/index.ts`）

### 问题描述

`src/index.ts` 文件存在严重的导出管理问题，共计 ~150 行导出语句，存在以下具体问题：

### 1.1 重复导出

同一模块被多次 `export *`，造成潜在命名冲突和维护困难：

```
// 重复导出 1：MarkdownEditor/el 被导出了两次
export * from './MarkdownEditor/el';        // 第 46 行
export * from './MarkdownEditor/el';        // 第 119 行

// 重复导出 2：proxySandbox 被导出了两次
export * from './Utils/proxySandbox';       // 第 110 行
export * from './Utils/proxySandbox';       // 第 134 行

// 重复导出 3：Bubble/type 的类型在顶层 export * 后又单独 export type
export * from './Bubble/type';              // 第 9 行
export type { BubbleClassNames, ... } from './Bubble/type';  // 第 75~83 行
export type { CustomConfig as BubbleCustomConfig } from './Bubble/type'; // 第 86 行
```

### 1.2 内部模块泄露

大量内部实现细节被暴露到公共 API，违反封装原则：

```
export * from './MarkdownEditor/editor/components/index';
export * from './MarkdownEditor/editor/elements/Table/Table';
export * from './MarkdownEditor/editor/elements/Table/TableContext';
export * from './MarkdownEditor/editor/parser/json-parse';
export * from './MarkdownEditor/editor/parser/parserMarkdownToSlateNode';
export * from './MarkdownEditor/editor/parser/parserSlateNodeToMarkdown';
export * from './MarkdownEditor/editor/store';
export * from './MarkdownEditor/editor/utils';
export * from './MarkdownEditor/editor/utils/docx/index';
export * from './MarkdownEditor/editor/utils/markdownToHtml';
export * from './MarkdownEditor/editor/utils/htmlToMarkdown';
export * from './MarkdownEditor/utils/native-table/native-table-editor';
```

内部 parser、store、editor utils 等不应该作为公共 API 暴露。

### 1.3 第三方库直接 re-export

```typescript
export type { RenderElementProps } from 'slate-react';
export * from '@schema-element-editor/host-sdk';
```

将第三方库类型/实现直接 re-export 会导致：
- 版本锁定，升级困难
- 用户对内部依赖产生耦合
- API 表面积不可控

### 1.4 导出无组织结构

导出语句缺乏逻辑分组，相同组件的导出散布在文件各处。例如 Bubble 相关导出分散在第 7~9 行、第 74~87 行。

### 建议

- 每个组件只通过 `ComponentName/index.ts` 导出公共 API
- `src/index.ts` 只引用各组件的 index，不深入引用内部模块
- 第三方类型使用自定义包装类型，不直接 re-export
- 对导出进行逻辑分组并添加注释

---

## 二、命名不一致

### 2.1 回调命名风格混乱

同一个概念在不同组件中有不同命名风格：

| 问题 | 旧命名 | 新命名 | 涉及组件 |
|------|--------|--------|---------|
| 大小写不一致 | `onDisLike` | `onDislike` | Bubble, BubbleList, BubbleExtra |
| 大小写不一致 | `onCancelLike` | `onLikeCancel` | Bubble, BubbleList, BubbleExtra |
| 命名不规范 | `onDeleteItem` | `onDelete`（建议） | History |
| 命名不规范 | `onSelected` | `onClick` | History |
| 命名不规范 | `onToggleGroup` | `onGroupToggle` | Workspace FileProps |

**核心问题**：旧的废弃属性和新属性同时存在于接口定义中，这不是临时过渡——两个版本的 props 会无限期共存，增加了维护负担和使用者的困惑。

### 2.2 Props 命名前缀不统一

`BubbleStyles` 和 `BubbleClassNames` 的每个属性都带有 `bubble` 前缀：

```typescript
interface BubbleStyles {
  bubbleStyle?: React.CSSProperties;
  bubbleAvatarTitleStyle?: React.CSSProperties;
  bubbleContainerStyle?: React.CSSProperties;
  bubbleListItemContentStyle?: React.CSSProperties;
  // ...
}
```

既然已经在 `BubbleStyles` 接口之下，每个属性再带 `bubble` 前缀是冗余的。应该改为：

```typescript
interface BubbleStyles {
  root?: React.CSSProperties;
  avatarTitle?: React.CSSProperties;
  container?: React.CSSProperties;
  content?: React.CSSProperties;
  // ...
}
```

### 2.3 Loading 属性命名不一致

存在 `loading` 和 `isLoading` 两种命名并存：

| 组件 | 旧属性 | 新属性 |
|------|--------|--------|
| ThoughtChainList | `loading` | `isLoading` |
| BubbleList | `loading` | `isLoading` |
| History | `loading` | `isLoading` |
| FileProps | `loading` | `isLoading` |

**问题**：`isLoading` 不符合 Ant Design 的 API 惯例。Ant Design 生态中统一使用 `loading`（如 `Button.loading`、`Table.loading`、`Spin.spinning`），使用 `isLoading` 反而造成了风格不一致。

### 2.4 组件命名与导出不一致

- `TaskList` 组件的 Props 类型名为 `ThoughtChainProps`，而非 `TaskListProps`
- `AgentRunBar` 文件夹的组件导出名为 `TaskRunning`，不是 `AgentRunBar`
- `ChatBootPage`（应为 `ChatBootstrap` 或 `ChatInitPage`？）

### 2.5 文件夹命名规范不一致

AGENTS.md 规定文件夹使用 kebab-case，但实际全部使用 PascalCase：

```
AgenticLayout/   # 应为 agentic-layout/
AgentRunBar/     # 应为 agent-run-bar/
AILabel/         # 应为 ai-label/
AnswerAlert/     # 应为 answer-alert/
```

---

## 三、类型安全问题

### 3.1 过度使用 `any`

类型定义文件中存在大量 `any` 类型：

```typescript
// src/MarkdownEditor/types.ts（14 处 any）
plugins?: any[];
[key: string]: any;  // 索引签名

// src/Types/message.ts
error?: any;
[key: string]: any;  // BubbleMetaData 索引签名

// src/Bubble/type.ts
bubbleListRef?: any;   // 应使用 React.RefObject<HTMLDivElement>
bubbleRef?: any;        // 同上
deps?: any[];           // 应使用 unknown[] 或具体类型

// src/ThoughtChainList/types.ts
// 6 处 any 使用
```

### 3.2 `@ts-ignore` 滥用

项目中存在 35+ 处 `@ts-ignore`，说明类型系统没有被正确维护：

```typescript
// src/ThoughtChainList/index.tsx 第383行
//@ts-ignore
bubble = props.chatItem,  // 应该在类型定义中处理兼容性
```

### 3.3 索引签名滥用

多个接口使用了 `[key: string]: any`，完全消除了类型检查的意义：

```typescript
// BubbleMetaData
export interface BubbleMetaData {
  avatar?: string;
  backgroundColor?: string;
  title?: string;
  [key: string]: any;  // 任何属性都可以塞进来
}

// MarkdownEditorProps
export type MarkdownEditorProps = {
  // ...具体属性...
  [key: string]: any;  // 使整个类型检查失效
};

// BubbleStyles / BubbleClassNames
export interface BubbleStyles {
  [key: string]: React.CSSProperties | undefined;
  // ...
}
```

### 3.4 `SimpleBubbleProps` 使用 `[key: string]: any`

```typescript
export interface SimpleBubbleProps<T = Record<string, any>> {
  originData?: T & MessageBubbleData;
  [key: string]: any;  // 完全失去类型安全
}
```

---

## 四、API 设计不合理

### 4.1 Bubble 组件 Props 过度膨胀

`BubbleProps` 接口包含 30+ 个属性，职责过重：

```typescript
export interface BubbleProps<T> extends BubbleItemStyleProps {
  time?: number;
  avatar?: BubbleMetaData;
  pure?: boolean;
  bubbleRenderConfig?: BubbleRenderConfig<T>;
  onAvatarClick?: () => void;
  onDoubleClick?: () => void;
  placement?: 'left' | 'right';
  originData?: T & MessageBubbleData;
  id?: string;
  bubbleListRef?: any;
  readonly?: boolean;
  markdownRenderConfig?: MarkdownEditorProps;
  customConfig?: CustomConfig;
  deps?: any[];
  onDisLike?: ...;
  onDislike?: ...;
  onLike?: ...;
  onCancelLike?: ...;
  onLikeCancel?: ...;
  onReply?: ...;
  docListProps?: ...;
  bubbleRef?: any;
  shouldShowCopy?: ...;
  shouldShowVoice?: ...;
  useSpeech?: ...;
  preMessage?: ...;
  renderFileMoreAction?: ...;
  fileViewEvents?: ...;
  fileViewConfig?: ...;
  userBubbleProps?: BubbleProps;  // 递归引用自身！
  aIBubbleProps?: BubbleProps;    // 递归引用自身！
}
```

**问题**：
- 混合了数据属性、行为属性、样式属性、渲染配置
- `customConfig` 和 `bubbleRenderConfig.customConfig` 重复
- `userBubbleProps` / `aIBubbleProps` 递归引用自身类型，设计有问题
- `aIBubbleProps` 命名不规范（应为 `aiBubbleProps`）

### 4.2 renderFileMoreAction 类型过度灵活

```typescript
renderFileMoreAction?:
  | React.ReactNode
  | ((file: AttachmentFile) => React.ReactNode)
  | (() => React.ReactNode)
  | (() => (file: AttachmentFile) => React.ReactNode);
```

四种不同的签名形式只会带来维护噩梦和运行时类型判断的复杂性。应统一为一种。

### 4.3 ThoughtChainList 存在兼容性 hack

```typescript
// src/ThoughtChainList/index.tsx 第383行
//@ts-ignore
bubble = props.chatItem,
```

通过 `@ts-ignore` 访问未在类型中定义的 `chatItem` 属性，是典型的兼容性 hack。应在接口中正式声明或使用适配层。

### 4.4 BubbleRenderConfig 语义混淆

```typescript
export interface BubbleRenderConfig<T> {
  contentAfterRender?: ...;    // "content 后面的内容"
  afterMessageRender?: ...;    // "content 后面的内容"
  contentBeforeRender?: ...;   // "content 前面的内容"
  beforeMessageRender?: ...;   // "content 前面的内容"
}
```

`contentAfterRender` 和 `afterMessageRender` 是什么关系？`contentBeforeRender` 和 `beforeMessageRender` 是什么关系？语义不清。

### 4.5 HistoryProps.agent 深度嵌套

```typescript
export interface HistoryProps {
  agent?: {
    enabled?: boolean;
    onSearch?: (keyword: string) => void;
    onFavorite?: (sessionId: string, isFavorite: boolean) => void;
    onSelectionChange?: (selectedIds: string[]) => void;
    onLoadMore?: () => void;
    loadingMore?: boolean;
    onNewChat?: () => void;
    runningId?: string[];
    searchOptions?: {
      placeholder?: string;
      text?: string;
      trigger?: 'change' | 'enter';
    };
  };
}
```

`agent` 对象承担了过多职责（搜索、收藏、选择、加载更多、新建对话、运行状态），应该拆分为独立的配置子类型。而且 `HistoryActionsBoxProps` 中又重复定义了一个类似的 `agent` 接口。

### 4.6 MarkdownEditorProps 使用 `type` 而非 `interface`

```typescript
export type MarkdownEditorProps = {
  // ...50+ 个属性
  [key: string]: any;
};
```

使用 `type` + 索引签名使得该类型完全开放，失去了 `interface` 的可扩展性和严格性。更关键的是 `[key: string]: any` 使整个类型检查名存实亡。

### 4.7 DocMeta 使用 snake_case

```typescript
export interface DocMeta {
  type?: string;
  doc_id?: string;
  upload_time?: string;
  doc_name?: string;
  origin_text?: string;
  answer?: string;
}
```

TypeScript 项目中应使用 camelCase。如果是后端返回的数据结构，应该有一个转换层，而不是直接暴露在组件 API 中。

### 4.8 `WhiteBoxProcessInterface` 命名不当

`WhiteBoxProcessInterface` 既不是 interface 的传统含义（TypeScript interface），也不清晰表达其业务含义。建议改为 `ThoughtChainStep` 或 `ProcessStep` 等更具描述性的名称。

### 4.9 TaskList Props 类型名错误

```typescript
// 文件: src/TaskList/index.tsx
type ThoughtChainProps = {
  items: TaskItem[];
  className?: string;
  expandedKeys?: string[];
  onExpandedKeysChange?: (expandedKeys: string[]) => void;
};

export const TaskList = memo(({ items, className, expandedKeys, onExpandedKeysChange }: ThoughtChainProps) => {
```

`TaskList` 组件的 Props 类型名为 `ThoughtChainProps`——完全是错误的名称，应该叫 `TaskListProps`。

---

## 五、架构和组织问题

### 5.1 `Components/` 文件夹职责不清

`src/Components/` 包含了大量不同类型的子组件：

```
Components/
├── ActionIconBox/
├── ActionItemBox/
├── Button/
├── effects/
├── GradientText/
├── icons/
├── ImageList.tsx
├── LayoutHeader/
├── Loading/
├── lotties/
├── Robot/
├── SuggestionList/
├── TextAnimate/
├── TypingAnimation/
├── VisualList/
```

这些组件之间没有明确的组织逻辑。`Robot` 是一个完整的业务组件，不应和 `Loading`、`icons` 等基础组件放在一起。

### 5.2 样式常量硬编码

```typescript
// ThoughtChainList/index.tsx 第519-524行
style={{
  backgroundColor: '#FFF',
  position: 'relative',
  borderRadius: '6px 12px 12px 12px',
  zIndex: 9,
}}

// ThoughtChainList/ThoughtChainTitle 中
style={{
  width: 15,
  height: 15,
  color: '#0CE0AD',
}}
```

颜色值和尺寸硬编码在组件中，没有使用 Ant Design Token 系统。这违反了项目自身的样式规范（使用 `token.colorPrimary` 等）。

### 5.3 `classnames` vs `clsx` 混用

项目同时依赖了 `classnames` 和 `clsx` 两个功能相同的库：

```json
"classnames": "^2.5.1",
"clsx": "^2.1.1",
```

应统一使用其中一个。

### 5.4 `lodash` vs `lodash-es` 双重依赖

```json
"lodash": "^4.17.23",
"lodash-es": "^4.17.23",
```

同时依赖 `lodash` 和 `lodash-es` 会导致 bundle 中包含两份代码。应统一使用 `lodash-es`。

### 5.5 `cross-env` 放在 `dependencies` 而非 `devDependencies`

`cross-env` 是开发/构建工具，不应该被打包到生产依赖中。

---

## 六、废弃 API 管理问题

### 6.1 废弃属性缺乏迁移路径

项目中有 30+ 个 `@deprecated` 标记，但：

1. 没有统一的废弃版本记录
2. 没有自动化的运行时警告（`console.warn`）
3. 新旧属性同时存在，没有明确的移除时间表
4. 部分废弃注释不规范（如 `apassify` → `apaasify` 拼写修复式的废弃）

### 6.2 `apaasify` / `apassify` 命名混乱

```typescript
// MarkdownEditorProps
apaasify?: { ... };   // "正确"的版本
apassify?: { ... };   // "兼容旧版本"——但两者都是难以理解的命名
```

这两个名称对用户来说都是不可读的。应提供一个有意义的英文名称。

---

## 七、Ref 和 Imperative Handle 问题

### 7.1 Ref 类型使用 `any`

```typescript
// BubbleProps
bubbleListRef?: any;
bubbleRef?: any;

// BubbleListProps
bubbleRef?: MutableRefObject<any | undefined>;
```

所有 ref 类型都是 `any`，失去了类型检查。应该：

```typescript
bubbleListRef?: React.RefObject<HTMLDivElement>;
bubbleRef?: React.RefObject<BubbleInstance>;
```

### 7.2 `inputRef` 命名不清晰

```typescript
// MarkdownInputFieldProps
inputRef?: React.MutableRefObject<MarkdownEditorInstance | undefined>;
```

`inputRef` 返回的是 `MarkdownEditorInstance`，而不是 input 元素。命名不够精确，应改为 `editorRef`。

---

## 八、总结：优先级排序

### P0（阻塞性问题，应立即修复）

1. **入口文件重复导出** — 可能导致命名冲突和 tree-shaking 失败
2. **`[key: string]: any` 索引签名** — 使整个 Props 类型检查失效
3. **`@ts-ignore` 滥用** — 隐藏了实际的类型错误

### P1（重要问题，应在近期版本修复）

4. **内部模块泄露** — 暴露了不稳定的内部 API，增加破坏性变更风险
5. **Bubble Props 膨胀** — 30+ 属性使组件难以使用和维护
6. **命名不一致**（`onDisLike`/`onDislike`、`loading`/`isLoading`）— 用户认知负担
7. **TaskList Props 类型名错误** — `ThoughtChainProps` 应为 `TaskListProps`
8. **ref 类型全部为 any** — 完全失去类型安全

### P2（改进项，可在后续版本逐步处理）

9. **BubbleStyles 属性冗余前缀** — `bubbleStyle` → `root`
10. **snake_case 属性名**（`DocMeta`）— 应转换为 camelCase
11. **`WhiteBoxProcessInterface` 命名** — 改为更具描述性的名称
12. **`classnames`/`clsx` 和 `lodash`/`lodash-es` 重复依赖** — 统一使用
13. **样式硬编码** — 迁移到 Token 系统
14. **废弃 API 管理** — 建立统一的废弃策略和迁移指南
15. **`cross-env` 依赖分类** — 移动到 devDependencies
16. **文件夹命名规范** — 统一为 kebab-case（如果要做的话需一次性迁移）
