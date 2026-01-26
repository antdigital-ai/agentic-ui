# AGENTS.md

## 项目背景

**Agentic UI** (`@ant-design/agentic-ui`) 是一个面向智能体的 UI 组件库，旨在提供多步推理可视化、工具调用展示、任务执行协同等 Agentic UI 能力。

- **核心目标**: 从“回答一句话”到“完成一件事”——让智能体真正成为用户的协作伙伴。
- **技术栈**: React, TypeScript, Ant Design, Dumi (文档), Father (构建), Vitest (测试)。
- **设计理念**: 过程透明化（可见思考与工具调用）、主动协作、端到端任务协同。

## 安装和设置

### 开发环境要求

- **Node.js**: >= 16.0.0 (推荐 LTS)
- **包管理器**: pnpm >= 7.0.0 (推荐)
- **操作系统**: Windows 10+, macOS 10.15+, Linux

### 安装依赖

```bash
# 克隆项目
git clone git@github.com:ant-design/agentic-ui.git
cd agentic-ui

# 安装依赖
pnpm install
```

### 常用开发命令

```bash
pnpm start          # 启动文档站点 (http://localhost:8000)
pnpm run build      # 构建项目
pnpm test           # 运行单元测试
pnpm run lint       # 运行代码检查 (ESLint + StyleLint)
pnpm run prettier   # 格式化代码
```

## 开发流程

1.  **需求分析**: 明确功能需求，设计 API 和组件结构。
2.  **分支创建**: 从 `main` 分支创建功能分支 (`feature/your-feature`)。
3.  **编码**: 遵循代码规范和 TypeScript 最佳实践。
4.  **测试**: 编写单元测试和集成测试，确保覆盖率。
5.  **提交**: 使用 Conventional Commits 规范提交代码。
6.  **PR**: 提交 Pull Request 并进行代码审查。

## 代码风格与组件规范

### 命名规范

-   **组件**: PascalCase (如 `MarkdownEditor.tsx`, `HistoryItem.tsx`)
-   **文件夹**: kebab-case (如 `markdown-editor`, `history-item`)
-   **Hooks**: camelCase, 以 `use` 开头 (如 `useEditor.ts`)
-   **工具函数**: camelCase (如 `parseMarkdown.ts`)
-   **样式文件**: `style.ts`
-   **类名**: BEM 命名法 (Block: `.history-item`, Element: `.history-item__title`, Modifier: `.history-item--selected`)

### 文件组织结构

```bash
ComponentName/
├── components/          # 子组件
├── hooks/              # 自定义 Hook
├── types/              # 类型定义
├── utils/              # 工具函数
├── __tests__/          # 测试文件 (ComponentName.test.tsx)
├── index.tsx           # 主组件入口
├── style.ts            # 样式文件 (CSS-in-JS)
└── README.md           # 组件文档
```

### API 设计规范

-   **Props**: 使用 Interface 定义，命名为 `ComponentProps`。
-   **事件回调**: 使用 `on` 前缀 (如 `onSelect`, `onChange`)。
-   **配置属性**: 使用 `Config` 后缀 (如 `toolbarConfig`)。
-   **类型定义**: 避免 `any`，提供完整的 TypeScript 类型定义。

## 样式规范 (CSS-in-JS)

项目使用 `@ant-design/cssinjs` 作为样式解决方案。

### 核心原则

-   **类型安全**: 利用 TypeScript 检查样式属性。
-   **Token 系统**: 使用 Ant Design 的 Token 系统 (`token.padding`, `token.colorPrimary`)。
-   **动态样式**: 基于 Props 和状态生成样式。
-   **避免冲突**: 使用 `hashId` 和 `prefixCls` 确保样式隔离。

### 样式定义示例

```tsx
import { createStyles } from '@ant-design/cssinjs';

const useStyles = createStyles(({ token }) => ({
  container: {
    padding: token.paddingSM,
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadius,
    border: `1px solid ${token.colorBorder}`,
  },
  // 子元素
  title: {
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
  },
  // 状态样式
  '&:hover': {
     borderColor: token.colorPrimary,
  }
}));
```

## 测试指南

### 测试策略

-   **单元测试**: 覆盖核心逻辑和组件渲染 (Vitest + React Testing Library)。
-   **集成测试**: 验证组件交互和插件系统。
-   **E2E 测试**: 确保用户完整流程正常 (Playwright)。

### 测试要求

-   测试文件放置在组件目录下的 `__tests__` 文件夹中。
-   命名格式: `ComponentName.test.tsx`。
-   分支、函数、行覆盖率要求 ≥ 80%。
-   新功能必须包含相应的测试用例。

## Pull Request 规范

### Commit Message 格式

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```text
<type>(<scope>): <description>

[body]

[footer]
```

**Type**:
- `feat`: 新功能
- `fix`: 修复 Bug
- `docs`: 文档变更
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具变动

### PR 检查清单

- [ ] 代码通过 Lint 检查 (`pnpm lint`)
- [ ] 所有测试通过 (`pnpm test`)
- [ ] 类型检查通过 (`pnpm tsc`)
- [ ] 代码已格式化 (`pnpm prettier`)
- [ ] 相关文档已更新
- [ ] 包含新的测试用例

### PR 提交注意

-   **标题**: 英文，简练描述变更。
-   **描述**: 详细说明变更目的、内容和类型。
-   **截图**: UI 变更需提供截图或 GIF。
-   **标注**: AI 辅助开发请在 PR 末尾标注 `> Submitted by Cursor`。

## 性能优化

-   **Memoization**: 合理使用 `React.memo`, `useMemo`, `useCallback` 避免不必要的渲染。
-   **虚拟滚动**: 长列表使用虚拟滚动 (`react-window` 等)。
-   **懒加载**: 大型组件或插件使用 `React.lazy` 和 `Suspense`。
-   **样式优化**: 避免在渲染时进行复杂的样式计算，使用静态样式或缓存。

## 贡献与帮助

-   详细开发指南请参考 `docs/development/` 目录下的文档。
-   遇到问题请查阅 GitHub Issues 或 Discussions。
