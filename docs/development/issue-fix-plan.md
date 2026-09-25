# Open Issue 修复计划 {#open-issue-fix-plan}

> 盘点时间：2026-09-25  
> 数据源：[antdigital-ai/agentic-ui open issues](https://github.com/antdigital-ai/agentic-ui/issues?q=is%3Aissue%20state%3Aopen)  
> 当前范围：11 个开放 issue

## 目标 {#goals}

- 优先消除影响输入正确性、流式渲染正确性和内容复制的缺陷。
- 将兼容性升级与常规缺陷拆分，避免 Ant Design 6 迁移阻塞补丁发布。
- 对咨询、反馈和信息不足的 issue 先完成分流，不把它们计入缺陷修复吞吐。
- 每个代码修复都包含回归测试、文档或 changelog，并通过相关组件测试、`pnpm tsc` 和 lint。

## Issue 分流 {#issue-triage}

| 优先级 | Issue                                                                                                                     | 分类                            | 当前判断                                                             | 下一步                                  |
| ------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------- | --------------------------------------- |
| P0     | [#722 MarkdownEditor readonly 流式渲染松散列表时列表项被反复追加](https://github.com/antdigital-ai/agentic-ui/issues/722) | Bug / MarkdownEditor            | 可稳定复现，严重破坏输出正确性，issue 已提供根因、补丁方向和测试     | 立即修复并发布 patch                    |
| P0     | [#721 MarkdownInputField 中文 IME 删除后残留首字符](https://github.com/antdigital-ai/agentic-ui/issues/721)               | Bug / MarkdownInputField / i18n | 影响中日韩输入正确性；需先在真实浏览器确认事件顺序                   | 完成最小复现后修复                      |
| P1     | [#682 MarkdownInputField 支持关闭或配置 Suggestion Dropdown](https://github.com/antdigital-ai/agentic-ui/issues/682)      | Bug + API enhancement           | 未使用建议能力时仍创建 Dropdown，并产生 ShadowRoot warning           | 设计最小向后兼容 API 后修复             |
| P1     | [#201 apaasify 自定义组件内容无法复制](https://github.com/antdigital-ai/agentic-ui/issues/201)                            | Bug / MarkdownEditor            | 描述指向复制事件被编辑器拦截，但缺最小复现和环境信息                 | 补复现，确认宿主与自定义节点边界后修复  |
| P1     | [#649 Support Ant Design 6](https://github.com/antdigital-ai/agentic-ui/issues/649)                                       | Compatibility / breaking-risk   | `antd` 当前是直接依赖 `^5.29.3`，升级涉及依赖模型、样式与 token 兼容 | 建立独立兼容性专项                      |
| P2     | [#397 首页底部栏被显示内容挡住](https://github.com/antdigital-ai/agentic-ui/issues/397)                                   | Docs site bug                   | issue 正文为空，无法确认视口、页面和复现条件                         | 请求截图、URL、浏览器和视口；复现后排期 |
| P2     | [#330 ProxySandbox 支持 coding agent 生成代码渲染](https://github.com/antdigital-ai/agentic-ui/issues/330)                | Feature request                 | 需求范围不清，可能涉及执行安全、构建协议和依赖安装                   | 先产出 RFC，不进入补丁队列              |
| P3     | [#668 与 Ant Design X 如何选择](https://github.com/antdigital-ai/agentic-ui/issues/668)                                   | Documentation / question        | 产品定位问题，不是代码缺陷                                           | 增加对比文档并答复后关闭                |
| P3     | [#213 与 ant-design-x 的区别](https://github.com/antdigital-ai/agentic-ui/issues/213)                                     | Documentation / duplicate       | 与 #668 重复                                                         | 合并到 #668，答复后关闭                 |
| P3     | [#59 所见即所得体验反馈](https://github.com/antdigital-ai/agentic-ui/issues/59)                                           | Product feedback                | 缺少具体缺陷、期望行为和复现                                         | 说明现有模式，征集具体场景后关闭或拆分  |
| P3     | [#245 正向反馈](https://github.com/antdigital-ai/agentic-ui/issues/245)                                                   | Feedback                        | 无待办事项                                                           | 致谢并关闭                              |

## 修复批次 {#delivery-batches}

### 批次 1：正确性回归 {#batch-1-correctness}

#### #722 MarkdownEditor 流式松散列表重复

建议实现：

1. 在 Markdown 多块解析返回前合并相邻同类型列表，使 schema 与 Slate normalize 后的树结构一致。
2. 合并节点时组合各分块 hash，确保任一分块变化都会触发深比较。
3. 收紧 store 的 hash 快速路径：仅在 hash 与子节点结构均一致时跳过比较，作为 normalize 改写节点后的兜底。
4. 保持单块解析路径不变，避免破坏现有 links 路径计算。

验收标准：

- readonly + Slate 模式下，有序和无序松散列表在逐字符及小 chunk 流式更新时均不重复。
- 流式结束后的 DOM 与一次性解析结果一致。
- 覆盖列表后跟标题、表格、引用的场景，避免后续节点反复删除和插入。
- 新增 issue 提供的两个回归用例，并运行 MarkdownEditor、MarkdownRenderer 全量相关测试。

#### #721 MarkdownInputField IME 删除残留

建议实现：

1. 使用 Playwright 在 Windows 微软拼音和至少一个 Chromium composition 事件序列上记录 `beforeinput`、`input`、`change`、`composition*` 的顺序。
2. 检查 MarkdownInputField、BaseMarkdownEditor 和受控值同步链路，避免 composition 期间把中间值回写成稳定值。
3. 以 `nativeEvent.isComposing` 和显式 composition 状态共同保护变更同步；处理“组合文本被删空后 compositionend 才到达”的边界。
4. 确保 Enter 发送保护逻辑不回退。

验收标准：

- 未确认的 `nihao` 逐字删除后值和 DOM 都为空。
- 选择候选词、取消组合、组合后立即发送、受控/非受控模式均正常。
- 至少覆盖 Chromium；手工验证 Windows 与 macOS 的一种系统输入法。

### 批次 2：输入与复制集成 {#batch-2-integration}

#### #682 Suggestion Dropdown 配置

建议实现：

1. 默认在 suggestion/tag 能力无数据或显式禁用时不挂载 Dropdown。
2. 增加语义清晰的公开配置，例如 `suggestionProps`，至少支持 `enabled`、`getPopupContainer` 和必要的 Dropdown 透传项。
3. 保持现有 `tagInputProps` 行为兼容，不改变已有菜单的默认交互。

验收标准：

- `enabled: false` 时不产生 popup DOM，也不触发 ShadowRoot warning。
- Shadow DOM 中可将 popup 放入与 trigger 相同的 root。
- API 类型、中文/英文文档、demo 和单元测试同步更新。

#### #201 apaasify 自定义组件复制

建议实现：

1. 建立含可选择文本、嵌套交互控件和自定义 `onCopy` 的 apaasify 最小用例。
2. 定位 Slate/MarkdownEditor 的 selection、copy handler 或 `preventDefault` 是否错误处理 React 自定义节点。
3. 仅在存在有效 Slate selection 且确需序列化编辑器片段时拦截 copy；原生 DOM selection 交给浏览器。

验收标准：

- 自定义组件中的选中文本可通过快捷键和上下文菜单复制。
- 普通 Markdown、代码块、卡片和编辑模式的既有复制行为不回退。
- 若问题来自业务自定义组件，补充集成约束文档并关闭 issue，不修改核心代码。

### 批次 3：Ant Design 6 兼容专项 {#batch-3-antd-6}

该项独立于补丁批次推进：

1. 先审计 Ant Design 6、`@ant-design/icons`、`@ant-design/cssinjs`、Pro Components 与最低 React 版本的兼容矩阵。
2. 评估将 `antd` 从直接 dependency 调整为 peer dependency，并在 devDependencies 中保留测试版本；避免消费者同时安装两个 antd 主版本。
3. 建立 antd 5/6 双矩阵 CI，覆盖 ConfigProvider、token、弹层、表单、上传、Tooltip/Dropdown 等高风险组件。
4. 修复废弃 API 和样式差异，补充安装与兼容性文档。
5. 若无法在同一主版本兼容 antd 5/6，形成明确的下一主版本迁移方案，不用强制 resolution 作为正式解法。

验收标准：

- 安装时不产生 antd 主版本冲突，也不强制打包两份 antd。
- 核心聊天、输入、Markdown、Workspace 和弹层组件在 antd 5/6 矩阵中通过。
- 构建、类型检查、SSR 冒烟和文档站均通过。

## Triage 与维护动作 {#maintenance-actions}

- 为所有开放 issue 补充 `bug`、`enhancement`、`documentation`、`needs-reproduction`、`compatibility` 等标签。
- #397、#201 设置 `needs-reproduction`，7 天无补充时发一次提醒，14 天后按信息不足关闭；后续可随时重开。
- #213 标为 #668 的重复项；#245 作为反馈关闭。
- #59 若没有可验证的体验目标，则转为 discussion 或拆成具体功能 issue。
- #330 在明确威胁模型、代码来源、依赖安装、网络权限、资源限制和浏览器隔离前，不承诺实现时间。

## 建议里程碑 {#milestones}

| 里程碑        | 内容                              | 预计工作量 | 发布策略                               |
| ------------- | --------------------------------- | ---------- | -------------------------------------- |
| Patch A       | #722                              | 1–2 人日   | 完成后立即发布 patch                   |
| Patch B       | #721、#682                        | 3–5 人日   | 同一输入组件批次发布                   |
| Patch C       | #201（确认属于核心库后）          | 1–3 人日   | 独立 patch                             |
| Compatibility | #649                              | 1–2 周     | minor 或下一 major，取决于依赖模型变更 |
| Docs/Triage   | #668、#213、#397、#330、#59、#245 | 1–2 人日   | 不阻塞代码发布                         |

工作量是基于当前 issue 信息的初估；#721、#201、#397 在拿到真实浏览器复现后重新估算。

## 完成定义 {#definition-of-done}

每个代码 issue 关闭前必须满足：

- 有失败优先的回归测试，修复后通过。
- 相关组件测试、`pnpm tsc`、`pnpm run lint` 通过。
- 公共 API 变化同步中英文文档和类型导出。
- 用户可感知变更同步中英文 changelog，并链接原 issue/PR。
- UI 或浏览器事件问题附带复现说明；必要时提供截图或录屏。
- PR 描述记录兼容性影响、风险和回滚方式。
