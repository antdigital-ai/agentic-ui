# RFC: Slate.js 规范化使用改进

> 状态：草案  
> 作者：Cursor Agent  
> 日期：2026-04-10  
> 影响范围：`src/MarkdownEditor/`、`src/Plugins/`、`src/MarkdownInputField/`

---

## 目录

- [背景与动机](#背景与动机)
- [问题总览](#问题总览)
- [P0：严重 — 直接绕过 Slate 操作模型](#p0严重--直接绕过-slate-操作模型)
  - [1. 直接赋值 `editor.children`](#1-直接赋值-editorchildren)
  - [2. 直接赋值 `editor.selection`](#2-直接赋值-editorselection)
  - [3. 手动调用 `editor.onChange()`](#3-手动调用-editoronchange)
- [P1：高危 — 缺少操作原子性保障](#p1高危--缺少操作原子性保障)
  - [4. 多步 Transforms 未使用 `withoutNormalizing`](#4-多步-transforms-未使用-withoutnormalizing)
  - [5. `_replaceNodeAt` 非原子替换](#5-_replacenodeat-非原子替换)
- [P2：中危 — 不安全的 API 使用](#p2中危--不安全的-api-使用)
  - [6. 字符串拼接比较路径](#6-字符串拼接比较路径)
  - [7. `Editor.start` 当布尔值使用](#7-editorstart-当布尔值使用)
  - [8. `Editor.node` 无防御性检查](#8-editornode-无防御性检查)
  - [9. `ReactEditor.focus` 传入可选值](#9-reacteditorfocus-传入可选值)
- [P3：设计隐患 — DOM 与 Slate 边界模糊](#p3设计隐患--dom-与-slate-边界模糊)
  - [10. 广泛使用 `window.getSelection()`](#10-广泛使用-windowgetselection)
  - [11. 绕过 Slate 拖拽系统](#11-绕过-slate-拖拽系统)
  - [12. 容器级 keydown 监听与 Editable 重复](#12-容器级-keydown-监听与-editable-重复)
- [P3：类型安全 — 粘贴片段缺少校验](#p3类型安全--粘贴片段缺少校验)
  - [13. 剪贴板 JSON 反序列化使用 `any`](#13-剪贴板-json-反序列化使用-any)
- [影响矩阵](#影响矩阵)
- [修复策略](#修复策略)
- [迁移方案](#迁移方案)
- [参考资料](#参考资料)

---

## 背景与动机

项目使用 Slate.js `0.124.x` 作为 MarkdownEditor 的核心编辑引擎。Slate 基于 **不可变操作模型（Operation-based Model）** 驱动编辑器状态，所有文档变更必须通过 `Transforms` API 产生 `Operation`，由 Slate 内部统一调度 normalizer、history 和 onChange 回调。

在代码审计中发现，当前实现有多处 **直接绕过 Slate 操作管线** 的写法，以及一些不符合 Slate 最佳实践的用法。这些问题可能导致：

- 撤销/重做（Undo/Redo）状态丢失或不一致
- Normalizer 不触发，产生非法文档结构
- 协作编辑场景下操作无法正确同步
- 选区（Selection）与文档状态不同步
- 隐蔽的竞态和边界 bug

本 RFC 旨在 **全面列出** 这些问题，按严重程度分级，并提出对应的修复方案。

---

## 问题总览

| 等级 | 问题数 | 概述 |
|------|--------|------|
| **P0 严重** | 3 | 直接赋值 `editor.children` / `editor.selection`，手动调用 `onChange()` |
| **P1 高危** | 2 | 多步 Transforms 缺少 `withoutNormalizing` 包裹 |
| **P2 中危** | 4 | 不安全的 Path 比较、API 返回值误用、缺少 null 检查 |
| **P3 隐患** | 4 | DOM/Slate 边界模糊、类型安全不足 |

---

## P0：严重 — 直接绕过 Slate 操作模型

### 1. 直接赋值 `editor.children`

**Slate 规范**：文档树必须通过 `Transforms`（如 `insertNodes`、`removeNodes`、`setNodes`）修改。直接赋值 `editor.children = ...` 绕过了整个操作管线——不产生 Operation、不触发 Normalizer、不记录 History。

**问题代码**：

| 文件 | 行号 | 场景 |
|------|------|------|
| `editor/store.ts` | 359 | `clearContent()` — 清空编辑器 |
| `editor/store.ts` | 605 | 流式输入首批内容写入 |
| `editor/store.ts` | 924 | `setContent()` — 设置内容 |
| `editor/store.ts` | 977 | `updateNodes` fallback |
| `editor/utils/editorUtils.ts` | 395 | `EditorUtils.reset()` — 重置编辑器 |

**示例**（`store.ts:921-925`）：

```typescript
setContent(nodeList: Node[]) {
  this._editor.current.selection = null;
  this._editor.current.children = nodeList;  // ❌ 直接赋值
  this._editor.current.onChange();            // ❌ 手动触发
}
```

**风险**：
- History 栈与实际文档完全脱节，Undo 后恢复的是脏状态
- Normalizer 不运行，文档可能处于非法结构（如空 children、缺少 text 叶节点）
- 如果后续接入协作编辑（CRDT/OT），这些变更不会产生可同步的 Operation

**推荐修复**：

```typescript
// 方案 A：使用 Transforms 全量替换
Editor.withoutNormalizing(editor, () => {
  const totalChildren = editor.children.length;
  for (let i = totalChildren - 1; i >= 0; i--) {
    Transforms.removeNodes(editor, { at: [i] });
  }
  Transforms.insertNodes(editor, nodeList, { at: [0] });
});

// 方案 B：封装为 replaceAllContent 方法（可抑制 History 记录）
const replaceAllContent = (editor: Editor, nodes: Node[]) => {
  HistoryEditor.withoutSaving(editor, () => {
    Editor.withoutNormalizing(editor, () => {
      // ... 安全替换
    });
  });
};
```

---

### 2. 直接赋值 `editor.selection`

**Slate 规范**：选区变更应通过 `Transforms.select()`、`Transforms.deselect()`、`Transforms.collapse()` 等 API。

**问题代码**：

| 文件 | 行号 | 用法 |
|------|------|------|
| `editor/store.ts` | 358, 604, 923, 976 | `editor.selection = null` |
| `editor/utils/editorUtils.ts` | 394 | `editor.selection = null` |

**风险**：不产生 `set_selection` Operation，订阅选区变化的逻辑（如工具栏高亮）不会被触发。

**推荐修复**：

```typescript
// 清除选区
Transforms.deselect(editor);

// 设置选区
Transforms.select(editor, targetRange);
```

---

### 3. 手动调用 `editor.onChange()`

**Slate 规范**：`onChange` 是 Slate 内部在处理完 Operation 后自动调用的回调。手动调用 `editor.onChange()` 是一种 hack，会导致 React 重渲染但状态可能不一致。

**问题代码**：

| 文件 | 行号 |
|------|------|
| `editor/store.ts` | 365, 606, 925, 978 |
| `editor/utils/editorUtils.ts` | 402 |

**本质原因**：因为使用了 `editor.children = ...` 绕过了操作管线，所以必须手动触发 onChange 来驱动 React 更新。如果改用 Transforms API，这些 `onChange()` 调用就不再需要。

---

## P1：高危 — 缺少操作原子性保障

### 4. 多步 Transforms 未使用 `withoutNormalizing`

**Slate 规范**：当连续执行多个 `Transforms` 操作时，每次操作后 Slate 都会运行 Normalizer。如果中间状态不合法（如 removeNodes 后尚未 insertNodes），Normalizer 可能对中间结构做出"修复"，导致后续操作路径失效。`Editor.withoutNormalizing` 可以将多个操作合并为一个原子批次。

**问题代码**（部分代表性示例）：

| 文件 | 行号范围 | 操作 |
|------|----------|------|
| `editor/store.ts` | 911-913 | `_replaceNodeAt`: `removeNodes` + `insertNodes` |
| `plugins/hotKeyCommands/backspace.ts` | 60-65, 96-118, 120-132 | 循环中多次 `removeNodes` / `insertNodes` |
| `plugins/hotKeyCommands/tab.ts` | 95-96, 223-227, 269-276 | `liftNodes` + `removeNodes` |
| `plugins/hotKeyCommands/enter.ts` | 多处 | 大量连续 Transforms |
| `plugins/handlePaste.ts` | 多处 | 粘贴处理中多次结构变更 |
| `editor/utils/keyboard.ts` | 521-531 | `removeNodes` + `insertNodes` + `focus` |

**对比**：`store.ts` 中的 `executeOperations` 方法（第 1725 行）**正确使用**了 `Editor.withoutNormalizing`，说明项目已有此意识，但未统一推广。

**推荐修复**：

```typescript
// ❌ 当前
Transforms.removeNodes(editor, { at: path });
Transforms.insertNodes(editor, newNode, { at: path, select: true });

// ✅ 推荐
Editor.withoutNormalizing(editor, () => {
  Transforms.removeNodes(editor, { at: path });
  Transforms.insertNodes(editor, newNode, { at: path, select: true });
});
```

---

### 5. `_replaceNodeAt` 非原子替换

**文件**：`editor/store.ts:911-914`

```typescript
private _replaceNodeAt(path: Path, newNode: Node): void {
  Transforms.removeNodes(this._editor.current, { at: path });
  Transforms.insertNodes(this._editor.current, newNode, { at: path });
}
```

这是一个被频繁调用的内部方法，但两步操作没有用 `withoutNormalizing` 包裹。在 `removeNodes` 之后、`insertNodes` 之前，Normalizer 可能会修改文档结构（如合并相邻的空文本节点），导致 `path` 失效。

---

## P2：中危 — 不安全的 API 使用

### 6. 字符串拼接比较路径

**文件**：`plugins/hotKeyCommands/tab.ts:88-94`

```typescript
const anchor = start.path.join(',').startsWith(node[1].join(','))
  ? start
  : Editor.start(this.editor, node[1]);
const focus = end.path.join(',').startsWith(node[1].join(','))
  ? end
  : Editor.end(this.editor, node[1]);
```

**问题**：将路径数组 `join(',')` 后用 `startsWith` 做前缀比较。当路径包含多位数索引时会产生误判：

```
[1, 0].join(',') = "1,0"
[10].join(',')   = "10"
"10".startsWith("1,0") = false  ✅ 碰巧正确
"1,0".startsWith("1")  = true   ❌ 错误：[1,0] 不是 [1] 的子路径
```

**推荐修复**：使用 Slate 内置的 `Path` 工具：

```typescript
import { Path } from 'slate';

const anchor = Path.isDescendant(start.path, node[1]) || Path.equals(start.path, node[1])
  ? start
  : Editor.start(this.editor, node[1]);
```

---

### 7. `Editor.start` 当布尔值使用

**文件**：`plugins/hotKeyCommands/enter.ts:465-470`

```typescript
if (Editor.start(this.editor, Path.next(parent[1]))) {
  Transforms.select(
    this.editor,
    Editor.start(this.editor, Path.next(parent[1])),
  );
}
```

`Editor.start()` **永远返回一个 `Point` 对象**，在 JavaScript 中对象永远为 truthy。这个 `if` 条件永远为 `true`，是一个无效的防御性检查。如果目的是检查路径是否存在，应该使用 `Editor.hasPath()`。

**推荐修复**：

```typescript
const nextPath = Path.next(parent[1]);
if (Editor.hasPath(this.editor, nextPath)) {
  Transforms.select(this.editor, Editor.start(this.editor, nextPath));
}
```

---

### 8. `Editor.node` 无防御性检查

**文件**：`plugins/hotKeyCommands/backspace.ts:273-278`

```typescript
const next = Editor.hasPath(this.editor, Path.next(path));
if (
  Editor.isEditor(parent[0]) &&
  next &&
  Editor?.node(this.editor, Path.next(path))[0].type !== 'hr'
) {
```

虽然使用 `Editor.hasPath` 检查了路径存在，但 `Editor.node()` 在某些边界情况下（如 normalizer 刚刚变更了文档结构）仍可能抛出异常。此外 `Editor?.node` 中的可选链 `?.` 作用在 `Editor` 命名空间上而非返回值上，实际上没有起到任何保护作用。

**推荐修复**：

```typescript
const nextPath = Path.next(path);
if (Editor.isEditor(parent[0]) && Editor.hasPath(this.editor, nextPath)) {
  const [nextNode] = Editor.node(this.editor, nextPath);
  if (nextNode.type !== 'hr') {
    Transforms.delete(this.editor, { at: path });
    return true;
  }
}
```

---

### 9. `ReactEditor.focus` 传入可选值

**文件**：`editor/utils/keyboard.ts:505, 516`

```typescript
ReactEditor.focus(store?.editor);  // store?.editor 可能是 undefined
```

`ReactEditor.focus` 的类型签名要求 `Editor` 参数。当 `store` 为 `undefined` 时，传入 `undefined` 会导致运行时错误。

**推荐修复**：

```typescript
if (store?.editor) {
  ReactEditor.focus(store.editor);
}
```

---

## P3：设计隐患 — DOM 与 Slate 边界模糊

### 10. 广泛使用 `window.getSelection()`

**Slate 规范**：编辑态下，选区应通过 `editor.selection`（Slate 模型层）或 `ReactEditor.toDOMRange` / `ReactEditor.toSlateRange`（双向桥接）来读取。直接访问 `window.getSelection()` 绕过了 Slate 的选区抽象。

**涉及文件**（生产代码，不含测试）：

| 文件 | 使用次数 |
|------|----------|
| `editor/Editor.tsx` | 3 次（309, 492, 500 行） |
| `editor/plugins/useOnchange.ts` | 1 次（90 行） |
| `editor/tools/ToolBar/ReadonlyBaseBar.tsx` | 3 次（54, 120, 219 行） |
| `editor/utils/editorUtils.ts` | 1 次（926 行） |
| `editor/utils/dom.ts` | 1 次（134 行） |

**分析**：
- `ReadonlyBaseBar.tsx` 中的使用是在 **只读模式** 下，此时 Slate 不管理选区，直接读 DOM 是合理的
- `Editor.tsx:492, 500` 在 copy/cut 事件中桥接 DOM → Slate，有一定合理性
- `useOnchange.ts:90` 在编辑态变更回调中直接读 DOM selection 获取 BoundingRect，应考虑先从 Slate selection 出发，通过 `ReactEditor.toDOMRange` 转换

**建议**：引入统一的选区桥接工具函数，收拢 `window.getSelection()` 的调用点，明确区分 "只读模式合理使用" 和 "编辑模式应走 Slate 桥接" 两类场景。

---

### 11. 绕过 Slate 拖拽系统

**文件**：`editor/store.ts:1791-1829`

拖拽功能通过 `window.addEventListener('dragover', ...)` 和 `window.addEventListener('dragend', ...)` 实现，完全绕过了 Slate `Editable` 的 `onDrop` 事件系统。

**影响**：
- `ReactEditor` 无法感知拖拽操作
- 拖拽产生的文档变更可能不会被 Slate 的协作插件捕获
- 难以与其他 Slate 插件组合

**建议**：评估是否可以迁移到 Slate 原生的拖拽事件（`onDrop` / `onDragStart` / `onDragOver`）。如果有特殊需求无法满足，至少在文档中注明这是一个已知的 Slate 绕行。

---

### 12. 容器级 keydown 监听与 Editable 重复

**文件**：`editor/utils/keyboard.ts:565-573`

```typescript
markdownContainerRef?.current?.addEventListener('keydown', keydown);
```

在容器 DOM 元素上直接注册 `keydown` 监听器，与 Slate `Editable` 组件的 `onKeyDown` 形成 **双重事件处理**。

**风险**：
- 事件可能被处理两次
- 两套系统的 `preventDefault` / `stopPropagation` 语义可能冲突
- 增加调试复杂度

**建议**：统一到 Slate `Editable` 的 `onKeyDown` 回调中处理，或明确划分两套系统的职责边界（如：容器级仅处理全局快捷键，Editable 级处理编辑快捷键）。

---

## P3：类型安全 — 粘贴片段缺少校验

### 13. 剪贴板 JSON 反序列化使用 `any`

**文件**：`plugins/handlePaste.ts:21`

```typescript
const fragment = JSON.parse(encoded || '[]').map((node: any) => {
```

从剪贴板反序列化的 JSON 片段没有经过 schema 校验就直接使用，类型被标注为 `any`。恶意或损坏的剪贴板数据可能注入非法节点结构。

**推荐修复**：

```typescript
import { Element, Text } from 'slate';

const isValidSlateNode = (node: unknown): node is Node => {
  if (Element.isElement(node)) return true;
  if (Text.isText(node)) return true;
  return false;
};

const raw = JSON.parse(encoded || '[]');
const fragment = (Array.isArray(raw) ? raw : []).filter(isValidSlateNode);
```

---

## 影响矩阵

| 问题编号 | 严重等级 | 影响范围 | 修复难度 | History 影响 | Normalizer 影响 | 协作影响 |
|---------|---------|---------|---------|-------------|----------------|---------|
| #1 | P0 | `store.ts`, `editorUtils.ts` | 中 | ✅ 丢失 | ✅ 跳过 | ✅ 不同步 |
| #2 | P0 | `store.ts`, `editorUtils.ts` | 低 | ✅ 丢失 | - | ✅ 不同步 |
| #3 | P0 | `store.ts`, `editorUtils.ts` | 低（跟随 #1 修复） | - | - | - |
| #4 | P1 | `backspace.ts`, `tab.ts`, `enter.ts`, `keyboard.ts`, `handlePaste.ts` | 中 | - | ✅ 中间态 | - |
| #5 | P1 | `store.ts` | 低 | - | ✅ 中间态 | - |
| #6 | P2 | `tab.ts` | 低 | - | - | - |
| #7 | P2 | `enter.ts` | 低 | - | - | - |
| #8 | P2 | `backspace.ts` | 低 | - | - | - |
| #9 | P2 | `keyboard.ts` | 低 | - | - | - |
| #10 | P3 | 多文件 | 中 | - | - | - |
| #11 | P3 | `store.ts` | 高 | - | - | ✅ 不同步 |
| #12 | P3 | `keyboard.ts` | 中 | - | - | - |
| #13 | P3 | `handlePaste.ts` | 低 | - | - | - |

---

## 修复策略

### 第一阶段：P0 修复（核心操作模型）

1. **封装 `replaceEditorContent` 工具函数**
   - 使用 `Editor.withoutNormalizing` + `HistoryEditor.withoutSaving` + 逐节点 Transforms 替换
   - 替换 `store.ts` 和 `editorUtils.ts` 中所有 `editor.children = ...` 调用点
   - 统一 `clearContent`、`setContent`、`reset`、流式输入首批写入等场景

2. **替换 `editor.selection = null` 为 `Transforms.deselect()`**

3. **移除手动 `editor.onChange()` 调用**（使用 Transforms 后自动触发）

### 第二阶段：P1 修复（操作原子性）

4. **审查所有多步 Transforms 调用点**，统一添加 `Editor.withoutNormalizing` 包裹
5. **将 `_replaceNodeAt` 改为原子操作**

### 第三阶段：P2 修复（API 误用）

6. **替换字符串路径比较为 `Path.isDescendant`**
7. **修复 `Editor.start` 误用为布尔检查**
8. **增加 `Editor.node` 防御性检查**
9. **增加 `ReactEditor.focus` 前置空检查**

### 第四阶段：P3 修复（架构改进）

10. **收拢 `window.getSelection()` 调用**，明确编辑态/只读态边界
11. **评估拖拽系统迁移可行性**
12. **统一键盘事件处理层**
13. **增加剪贴板数据校验**

---

## 迁移方案

### 向后兼容

所有修复都是 **内部实现变更**，不涉及公共 API 改动，对外部使用者完全透明。

### 测试策略

- 每个修复必须附带对应的单元测试
- P0 修复需增加 History（Undo/Redo）集成测试
- P1 修复需验证 Normalizer 在批操作中的行为
- 回归测试：流式输入、粘贴、拖拽、快捷键等核心场景

### 渐进式迁移

建议按阶段逐步合并，每阶段独立 PR：

1. **PR 1**：`replaceEditorContent` 工具函数 + `store.ts` 中 P0 修复
2. **PR 2**：`editorUtils.ts` P0 修复 + `_replaceNodeAt` P1 修复
3. **PR 3**：hotKeyCommands P1 + P2 修复
4. **PR 4**：P3 架构改进

---

## 参考资料

- [Slate.js Concepts — Operations](https://docs.slatejs.org/concepts/05-operations)
- [Slate.js Concepts — Normalizing](https://docs.slatejs.org/concepts/11-normalizing)
- [Slate.js API — Transforms](https://docs.slatejs.org/api/transforms)
- [Slate.js API — Editor](https://docs.slatejs.org/api/nodes/editor)
- [Slate.js Migration Guide](https://docs.slatejs.org/general/changelog)
