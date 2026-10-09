# MarkdownInputField 重构待办

> 本文用于记录 `src/MarkdownInputField` 的架构 review 结论与后续重构计划。
> 仅作为内部跟进 issue 使用，不发布到组件文档。
>
> Review 时间：2026-05-01
> Review 范围：`src/MarkdownInputField/` 全量（22 个子目录、~6500 行）
> Review 形式：架构层（模块边界、职责划分、循环依赖、API 一致性、可维护性）

---

## 概览

| 维度           | 数据                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------- |
| 主组件         | `MarkdownInputField.tsx` 548 行                                                              |
| Props 接口     | `MarkdownInputFieldProps` 531 行 / 30+ 顶层字段                                              |
| 子目录         | 22 个                                                                                        |
| 单体最大       | `BeforeToolContainer.tsx` 476、`AttachmentButton/index.tsx` 447、`FileMapView/index.tsx` 461 |
| 拆分出的 hooks | 6 个（State / Refs / Layout / Styles / Actions / Handlers）                                  |

---

## P0 / 高优先级（强烈建议尽快做）

### #1 主组件 + Props 是「上帝接口」，没有真正的关注点分离

**现状**

- `MarkdownInputFieldProps` 把 编辑器 / 附件 / 语音 / 技能模式 / 放大 / 提示词优化 / 顶部操作区 / 发送按钮 / Tag / Suggestion / 粘贴 / UI / 回调 / ref 全部塞在同一个扁平接口里（30+ 字段）。
- 主组件 `MarkdownInputField.tsx` 548 行只是把这堆东西串起来。
- `actionsRender`、`toolsRender`、`quickActionRender`、`beforeToolsRender`、`operationBtnRender` 五个 render prop 概念高度重叠但定位模糊，文档不解释「什么时候用哪个」。
- `actionsRender(props, defaultActions)` 的 `props` 类型是 `MarkdownInputFieldProps & MarkdownInputFieldProps['attachment'] & {...}`，把「组件 props 全集 + 附件配置 + 状态」全暴露给外部消费者。

**影响**

- 横向耦合极严重：每加一个能力需要在 props / 主组件 / Actions hook / Styles hook / renderHelpers 五处都改。
- 当前设计再加 1~2 个能力，主组件会突破 700 行。

**建议**

1. 拆成 core props（value / onChange / onSend / disabled / typing / placeholder / triggerSendKey）+ feature configs（`attachment`、`voice`、`skill`、`enlarge`、`refine`、`top`）+ slots（`slots: { before?, tools?, actions?, quickActions?, top? }`），向外只暴露 `slots` 一个 render-props 入口。
2. 给 `actionsRender` 等明确「传给你的是稳定的派生状态（value/isHover/isLoading/fileUploadStatus），不是组件全部 props」，砍掉 `MarkdownInputFieldProps & ...attachment & ...` 这种类型怪物。

---

### #2 hooks 拆分是「按代码行数」而非「按职责」

**现状**

```
useMarkdownInputFieldState        // 4 个独立状态混在一个 hook
useMarkdownInputFieldLayout       // 暴露 set***Padding，但 padding 计算又在 useStyles 里
useMarkdownInputFieldStyles       // 接收 layout 4 个值 + actions 4 个值 + props 4 个值
useMarkdownInputFieldActions      // 实际只是几个布尔运算 + 计数
useMarkdownInputFieldHandlers     // 接收 14 个参数
useMarkdownInputFieldRefs         // 同时管 ref + useImperativeHandle + 外部 value 同步 effect
```

**影响**

- 每个 hook 把状态吐出来，主组件再当胶水把它们粘回去。
- 调用链更长、参数表更难读、调试更难。
- `useSendActionsNode` 的 useMemo 依赖数组有 **27 个**项，已经失去性能优化意义。

**建议**

- `useMarkdownInputFieldActions` 直接内联，5 行布尔运算不值得一个 hook。
- `Layout` + `Styles` 合并成 `useInputFieldGeometry`，对外只暴露最终结果（`rightPadding` / `minHeight` / `enlargedStyle` / `collapseSendActions`），不暴露中间 setter。
- `setRightPadding`、`setTopRightPadding`、`setQuickRightOffset` 由 geometry hook 内部消化（QuickActions/SendActions 通过 props 把 `onResize` 回调透给 geometry hook，hook 内部接住），不要透出到主组件。

---

### #3 类型定义重复发明轮子，多处 `as any`

**现状**

`SendActions/index.tsx`、`QuickActions/index.tsx`、`FileUploadManager/index.tsx`、`renderHelpers.ts`、`AttachmentButton/index.tsx` 里都重复定义了：

```ts
fileUploadStatus?: 'uploading' | 'done' | 'error';
fileUploadSummary?: { totalCount, doneCount, uploadingCount, errorCount };
attachment?: { enable?: boolean; ... } & AttachmentButtonProps;
```

并且多处 `as any`：

- `MarkdownInputField.tsx`：`onFileMapChange: setFileMap as any`、`quickActionRender={props.quickActionRender as any}`
- `AttachmentButton/index.tsx`：`UploadProps.locale: any`
- `Suggestion/index.tsx`：`useState(() => ...)` 推导出 selectedItems 没有类型
- `actionsRender` 的 `props: any`

**建议**

- 把 `FileUploadStatus`、`FileUploadSummary`、`AttachmentFile`、`AttachmentConfig` 集中到 `types/` 一个文件，模块只引用，不重新定义。
- 删除所有 `as any`（10+ 处），它们都掩盖了真实的类型不匹配。

---

### #4 状态分散、受控/非受控逻辑不一致

**现状**

- `value`、`fileMap` 用 `useMergedState` 走受控/非受控双轨；
- `isEnlarged` 全内部 state，外部无法控制（`enlargeable` 没有 `defaultEnlarged`/`enlarged`/`onEnlargeChange`）；
- `skillMode.open` 是受控的，但内部还要用 `useSkillModeState` 自己加一套「防止重复回调」的 ref（`skipNextCallbackRef`）来对抗自身设计——典型的受控状态被内部「再受控一次」反模式；
- `recording` 在 hook 内部，没有 `onRecordingChange`；
- `value` 与 `setMDContent` 同步逻辑分散在 3 处：`useMarkdownInputFieldRefs` 的 effect、`useImperativeHandle` 里的 Proxy、主组件 `onChange` 里。

**建议**

- 所有「既能受控又能非受控」的状态走同一套规范：`{ value, defaultValue, onChange }` 或 `{ open, defaultOpen, onOpenChange }`，逐个补齐 `enlargeable` / `recording` / `skillMode`。
- `useSkillModeState` 的 `skipNextCallbackRef` 是个红旗，正确做法是：受控就不维护内部 ref，外部传什么 `open` 就显示什么；`handleCloseClick` 只调用 `onSkillModeOpenChange(false)`，不要绕过 effect。

---

## P1 / 中优先级

### #5 交叉依赖 / 循环引用风险

**现状**

```
hooks/useMarkdownInputFieldHandlers.ts
  ├── 依赖 ../AttachmentButton（upLoadFileToServer）
  ├── 依赖 ../AttachmentButton/utils（isMobileDevice）
  ├── 依赖 ../FilePaste
  └── 依赖 ../AttachmentButton/types

utils/renderHelpers.ts
  ├── 依赖 ../SendActions
  ├── 依赖 ../AttachmentButton/AttachmentFileList
  └── 依赖 ../AttachmentButton/types

FileUploadManager/index.tsx
  └── 强依赖 ../AttachmentButton（upLoadFileToServer）
```

- `AttachmentButton` 同时是 **UI 按钮组件** 和 **`upLoadFileToServer` 上传业务函数** 的导出源，被四处导入，破坏了「UI 模块就该只导出 UI」的边界。
- `hooks/`（应该是基础设施）反向依赖 `AttachmentButton`、`FilePaste`（应该是业务模块），构成「基础设施依赖业务」反向依赖。
- `useFileUploadManager` 实际是个业务 hook，被放在 `FileUploadManager/index.tsx` 而不是 `hooks/`，目录划分不一致。

**建议**

- 把 `upLoadFileToServer` 从 `AttachmentButton/index.tsx` 抽到 `utils/uploadFile.ts`，按钮和上传函数分家。
- 所有跨模块共享的 hooks（`useFileUploadManager`、`useVoiceInputManager`）统一搬到 `hooks/` 下。
- 用 ESLint `import/no-cycle` + `import/no-internal-modules` 做防御。

---

### #6 `Suggestion` 越界包裹根节点

**现状**

```text
<Suggestion tagInputProps={{ enable: true, type: 'dropdown', ...tagInputProps }}>
  <div ref={inputRef} ...>
    ...
    <BaseMarkdownEditor tagInputProps={{ enable: true, type: 'dropdown', ...tagInputProps }}>
```

- `tagInputProps` 同时传给 `Suggestion` 和 `BaseMarkdownEditor` 两遍，两份 state 不同步。
- `Suggestion` 用 antd `<Dropdown trigger={['click']}>` 把整个输入框包成一个「点击触发的下拉锚点」，与编辑器自身焦点逻辑冲突。
- `Suggestion` 暴露 `SuggestionConnext`（拼写错误：`Co**nn**ext`）给编辑器内部 TagPopup 通信——跨包反向通信，把 `MarkdownEditor` 耦合到 `MarkdownInputField/Suggestion` 上。

**建议**

- 重新评估 `Suggestion` 是否必须包裹根节点，能否改成只包 `BaseMarkdownEditor`。
- `tagInputProps` 只传一份。
- `SuggestionConnext` → `SuggestionContext`，并在文档里明确「这是跨包契约，破坏属于 breaking」。

---

### #7 Refs hook 三个职责揉在一起，且包含运行时陷阱

**现状**

`useMarkdownInputFieldRefs` 同时干三件事：

1. 创建 4 个 ref；
2. 用 effect 同步外部 `value` → 编辑器（带焦点 + lastEditorValueRef 双重门禁）；
3. `useImperativeHandle` 用 Proxy 包 `editor.store`。

陷阱：

- `useImperativeHandle` 的依赖数组只有 `[props.setValue]`，`markdownEditorRef.current` 在挂载之后才有值时，外部拿到的是「editor 不存在」分支返回的占位对象。
- `...editor` 是浅展开 —— 如果用户依赖 `editor.markdownEditorRef.current`（Slate editor），它是稳定 ref，没问题；但 `editor.store` 上挂的方法是定义在原型/对象字面量上的，能否被 spread 出来取决于 store 的实现。

**建议**

- 拆成 `useMarkdownInputRefs`（纯 ref 创建）+ `useExternalValueSync`（外部 value→editor）+ `useEditorImperativeHandle`（暴露 ref）三个职责清晰的 hook。
- `useImperativeHandle` 不要返回「占位对象」，要么 `return undefined`，要么强制要求 ref 只在挂载后访问，并在文档里写清楚。

---

### #8 Mobile 检测与 SSR / 测试分支散落各处

**现状**

- `useMarkdownInputFieldLayout`、`BorderBeamAnimation`：硬编码 `if (process.env.NODE_ENV === 'test') return;`。
- `SendButton`：`if (typeof window === 'undefined' || ...) return null` —— SSR 防御散落在十几个文件里。
- `isMobileDevice`、`getDeviceBrand`、品牌识别表（280 行）在 `AttachmentButton/utils.ts`，和「附件按钮」几乎没关系。

**建议**

- 抽 `src/Utils/env.ts`：`isBrowser` / `isTest` / `isMobileDevice` / `getDeviceBrand` 全集中。
- 测试环境跳过 ResizeObserver 的逻辑放到测试 setup 里 mock `globalThis.ResizeObserver`，源码不再 `if test`。

---

### #9 渲染层 / 样式层硬编码 magic number 太多

**现状**

- 主组件：`borderRadius = 16`、`enlargeable?.height ?? 980`、`tabIndex={1}`。
- `useMarkdownInputFieldStyles`：`base = 114`、`extra = 90`、`140`、`90`、`106`、`52`、`280`、`980`，无注释。
- `useMarkdownInputFieldLayout`：`window.innerWidth < 460`、`clientWidth < 481`、`rightPadding = 64`，两个断点（460/481）紧挨着。
- `style.ts`：硬编码 `boxShadow`、`var(--color-...)` 与 token 系统并存，绕过了 `@ant-design/cssinjs` 的 token 系统，与 `AGENTS.md` 里「使用 Token 系统」相悖。

**建议**

- 把 magic number 集中到 `constants.ts` 并加注释来源。
- 460/481 两个断点统一成 1 个常量。
- token vs CSS variable 二选一，按 `AGENTS.md` 应该用 token。

---

### #10 `BeforeToolContainer` 像独立组件被错误归位

**现状**

476 行的 `BeforeToolContainer`：

- 自己实现了拖拽排序、Popover 溢出、横向滚动、阈值判定（`PAN_THRESHOLD`）；
- 内部还拆出 `DraggablePopupItem` 子组件 + `React.memo`；
- 导出名为 `ActionItemContainer`（**不叫 BeforeToolContainer**），命名和文件名不一致；
- 跟 `MarkdownInputField` 几乎没有耦合，只是被作为 `beforeToolsRender` 的「建议实现」使用。

**建议**

- 移到 `src/Components/`，命名统一为 `OverflowActionBar` 或保留 `ActionItemContainer`，文件名同步。
- `MarkdownInputField` 通过 `beforeToolsRender` 自由消费，不再耦合。

---

### #11 useMemo 依赖膨胀，性能优化已失效

**现状**

- `useSendActionsNode` 的 useMemo：**27 个依赖**。
- `defaultActions` 的 useMemo：18 个依赖，里面又含 `attachment`（对象字面量在主组件每次构造），等价于不缓存。
- `useBeforeTools` 的 useMemo 依赖 `props`（整个 `MarkdownInputFieldProps` 对象），每次都失效。

**建议**

- 这种「由很多外部状态合成的 React node」要么不要 memo，要么把内层组件拆出去，让 `React.memo` + props 比较代替手写 useMemo。
- `useBeforeTools` 接收 `props` 全集是反模式，改为只接收必要字段。

---

### #12 错误处理与可观测性

**现状**

- `sendMessage` 里 `catch (error) { console.error('Send message failed:', error); throw error; }` —— 既 log 又 throw，外部 onClick 是同步包装，会进入未捕获 promise 拒绝。
- `handleFileRemoval`、`handleFileRetry`、`uploadImage` 大量 `console.error`，没有走统一错误回调。
- `useVoiceInputManager` 的 `startRecording` catch 里直接吞错。
- `Suggestion` 异步加载 items 失败完全没处理。
- `RefinePromptButton` 异步失败也只是 `setRefineStatus('idle')`，没有任何反馈。

**建议**

- 暴露统一的 `onError?: (info: { type: 'send' | 'upload' | 'voice' | 'refine' | 'suggestion'; error: unknown; ... }) => void`，所有 catch 走这个口子。
- 移除 `console.error`，改为通过回调或 throw 给调用方决定。

---

## P2 / 各模块小问题（top 收录）

### `SendButton`

- `useEffect(() => { props.onInit?.() }, [])` 用 `eslint-disable` 静默掉依赖告警，可改成 `useMountEffect`。
- SSR 检测放在所有 hook 之后才 `return null`，目前安全但只要后续在 if 后面加 hook 就崩。

### `AttachmentButton`

- `upLoadFileToServer`（业务）+ UI 按钮 + Popover 三合一文件 447 行，应当拆分（见 #5）。
- `processFile` 链路里直接 mutate 同一个 `file` 对象的 `status`/`url`/`errorMessage`，无 immutability。
- `notifyChange = (m) => onFileMapChange?.(new Map(m))` 是为对抗「调用方直接传 setState」的 workaround，应该写在文档而非源码。
- `WAIT_TIME_MS = 16` `await waitTime(16)` 没有注释来源。
- `${maxSize}` 模板替换走 `replace`，应该统一走 `compileTemplate`。

### `FileUploadManager`

- 与 `AttachmentButton` 的 `upLoadFileToServer` 重复实现了一份单文件上传逻辑（在 `handleFileRetry` 里复刻），违反 DRY。
- `getAcceptValue` 把「微信 > vivo/oppo > 移动 > 默认」判断写死，没有 prop 可覆盖；微信/vivo/oppo 三个分支都返回 `'*'`，可合并。
- `MOBILE_DEFAULT_ACCEPT` ~250 字符常量需要命名 + 注释来源。

### `VoiceInputManager`

- `pendingRef` 和 `recording` 状态分管「瞬时锁」和「UI 状态」，但 `stopRecording` 在 `recording=false` 直接 return —— 如果 `start` 还在 `await voiceRecognizer({...})` 里、`recording` 还没 true，外部的 `stopRecording` 就停不掉，会泄漏 recognizer。
- `updateCurrentSentence` 依赖「`sentenceStartIndexRef.current` 一直是有效 index」，用户在录音中手动编辑文本时 index 错位 → 幻觉文本。
- `onError` 里直接 `setRecording(false)` 没有把 error 透给外部。

### `SkillModeBar`

- 见 #4 的 `skipNextCallbackRef` 反模式。
- `<SkillModeBar />` → `<SkillModeBarInner />` 的拆分可合并（hooks 写在 early return 之前即可）。

### `Suggestion`

- `SuggestionConnext` 拼写错误（导出 API，改名是 breaking）。
- `useEffect(() => { loadingData() }, [open])` 依赖只有 `[open]`，`items` 函数变了不重新加载。
- `selectedItems` 初值通过 `useState(() => items.map(...))` 计算，但没有 effect 监听 `items` 静态数组变化。

### `QuickActions`

- `onResize?.(e.offsetWidth, rightOffset)` 通过 `getComputedStyle` 读 `right` 像素值再回传给父组件做 padding 计算，强耦合反模式。

### `BorderBeamAnimation`

- 自己装一遍 ResizeObserver，与 `Layout` 重复，可共享 `useElementSize`。
- `React.useId` 用对了，渐变 ID 不会冲突。✅

### `RefinePromptButton`

- `isBrowserEnv()` 自己又封了一遍，复用统一的 `isBrowser`。

### `TopOperatingArea`

- `targetRef ? () => targetRef.current || window : undefined` inline 函数每次 render 新建，BackTo 子组件可能因此每次都 reattach 监听器（待确认）。

### `Enlargement`

- 标题 `'放大' / '缩小'` 中文硬编码，没走 i18n。

### `FilePaste`

- `processEntry` 的 `dirReader.readEntries` 在条目超过 100 时只返回前 100 个（浏览器 API 限制），这里没有循环调用 readEntries 直到为空，会丢文件。

---

## 跨模块 API 一致性问题

| 类别            | 不一致                                                                                                                                                                                 |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defaultXxx`    | `enlargeable`、`isFocused`、`isEnlarged`、`recording` 都没提供受控+非受控，违反 `AGENTS.md` Props 命名规范                                                                             |
| `enable` 字段   | `attachment.enable`、`refinePrompt.enable`、`enlargeable.enable`、`skillMode.enable`、`voiceRecognizer`（直接传函数判 enable）—— 五种「开关」各不相同                                  |
| render 函数签名 | `actionsRender(props, defaultActions)` vs `toolsRender(props)` vs `quickActionRender(props)` vs `beforeToolsRender(props)` —— 有的有 default 有的没有                                  |
| i18n 落地       | `Enlargement` 硬编码 `'放大' / '缩小'`；`AttachmentButton/utils.ts` 设备品牌名用中文；`SendActions` fallback 用中文 `'文件上传'`；`SkillModeBar` `aria-label="技能模式"` 硬编码        |
| prefixCls       | `getPrefixCls('agentic-md-input-field')` vs `getPrefixCls('agentic-skill-mode')` vs `getPrefixCls('agentic-md-editor-attachment-button')`（附件其实属于 input-field 但用 editor 前缀） |

---

## 优先级建议

如果只能挑 5 件事做：

1. **#1 拆 Props，分 Slot**：不做的话每加一个能力都是一次主组件改动。
2. **#2 合并 hooks**：让 Layout / Styles / Actions 三个变成 1 个 `useInputFieldGeometry`，主组件可瘦到 ~300 行。
3. **#3 + #5 抽 `upLoadFileToServer` 出 AttachmentButton；类型集中到 `types/`；删除所有 `as any`**：解决依赖反向 + 类型安全。
4. **#4 修复 `useSkillModeState` 的「自反 callback 防抖」反模式 + 统一受控/非受控规范**：`skipNextCallbackRef` 是设计 smell，必须修。
5. **#12 建立统一的 `onError` 通道 + 删除 `console.error`**：提升可观测性。

---

## 值得保留的设计 ✅

- `useMarkdownInputFieldRefs` 里 `lastEditorValueRef` + 焦点检查的双重门禁，注释非常详细，是处理过真实 bug 的好设计。
- `BorderBeamAnimation` 用 `React.useId` 解决多实例冲突。
- `SkillModeBar` 把 hooks 全部塞到 inner 组件、外层做 early return 来稳定 hooks 顺序，思路是对的（虽然实现可合并）。
- `SendButton` 的 `resolveSendDisabled` 单独抽函数，独立可测。
- `useFileUploadManager` 的 `fileUploadSummary` 数据结构（`totalCount`/`doneCount`/`uploadingCount`/`errorCount`）设计完整，外部可做精细 UI。
- 测试覆盖良好：`__tests__/` 8 个独立测试文件 + `AttachmentButton/__tests__/` + `hooks/__tests__/`。

---

## 跟进建议

- 推荐拆成 4~5 个 PR 提交，避免一次性大重构：
  - PR 1（low risk）：#5 类型集中 + 删除 `as any` + 抽 `src/Utils/env.ts`
  - PR 2（low risk）：#10 搬走 `BeforeToolContainer` + #9 magic number 常量化
  - PR 3（medium）：#3 抽 `upLoadFileToServer` + 解开 `hooks ↔ AttachmentButton` 反向依赖
  - PR 4（high）：#2 合并 hooks → `useInputFieldGeometry`
  - PR 5（breaking 候选）：#1 拆 Props、分 Slot；#4 受控/非受控统一；#12 `onError` 通道
- breaking change 的项（#1 / #4 部分 / #6 `SuggestionConnext` 改名）走下一个大版本。
