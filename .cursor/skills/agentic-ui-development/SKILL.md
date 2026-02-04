---
name: agentic-ui-development
description: Develop @ant-design/agentic-ui components for AI chat interfaces. Use when creating thought chain visualization, tool call displays, markdown editors, bubble components, workspace panels, or any agentic UI development. Triggers on keywords like bubble, thought chain, tool use, markdown editor, workspace, chat layout, agentic.
---

# Agentic UI Development Skill

面向智能体的 UI 组件库开发技能，提供智能化的组件推荐、代码生成和设计系统支持。

## Quick Start

```bash
pnpm install    # 安装依赖
pnpm start      # 启动文档站点 (http://localhost:8000)
pnpm test       # 运行单元测试
pnpm run build  # 构建项目
```

## Quick Reference - Search Commands

```bash
# 搜索组件
python .cursor/skills/agentic-ui-development/scripts/search.py "chat bubble"

# 按域搜索
python .cursor/skills/agentic-ui-development/scripts/search.py "chart" --domain plugin
python .cursor/skills/agentic-ui-development/scripts/search.py "scroll" --domain hook
python .cursor/skills/agentic-ui-development/scripts/search.py "color" --domain token

# 获取推荐方案
python .cursor/skills/agentic-ui-development/scripts/search.py "ai assistant" --recommend

# 生成完整设计系统 (推荐)
# -p 是 --project-name 的简写，用于指定项目名称
python .cursor/skills/agentic-ui-development/scripts/search.py "ai chat" --design-system --project-name "My App"

# 持久化设计系统 (Master + Overrides 模式)
python .cursor/skills/agentic-ui-development/scripts/search.py "ai chat" --design-system --persist --project-name "My App" --page "chat"
```

## Skill Activation

当用户请求以下任务时自动激活：

| 触发关键词 | 组件/功能 |
|------------|-----------|
| `bubble`, `chat`, `message` | 对话气泡组件 |
| `thought chain`, `thinking`, `reasoning` | 思维链可视化 |
| `tool use`, `tool call`, `api call` | 工具调用展示 |
| `markdown`, `editor`, `rich text` | Markdown 编辑器 |
| `input`, `multimodal`, `voice` | 多模态输入框 |
| `workspace`, `file`, `browser` | 工作区面板 |
| `task`, `progress`, `step` | 任务列表 |
| `history`, `conversation` | 会话历史 |
| `layout`, `agentic` | 布局框架 |
| `agent`, `run`, `control` | 智能体运行控制 |
| `button`, `icon`, `action` | 按钮组件 |
| `animation`, `typing`, `gradient` | 动画效果 |
| `i18n`, `locale`, `language` | 国际化 |

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│  1. USER REQUEST                                                │
│     "创建一个带思维链的 AI 对话气泡"                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. DESIGN SYSTEM GENERATION (--design-system)                  │
│     • BM25 search across 4 domains (component, plugin, hook,    │
│       token)                                                    │
│     • Apply reasoning rules from reasoning-rules.json           │
│     • Generate complete recommendation with anti-patterns       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. COMPONENT SEARCH (Multi-domain)                             │
│     • Component matching (37 components)                        │
│     • Props API lookup                                          │
│     • Style token recommendations                               │
│     • Related hooks & utilities                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. CODE GENERATION                                             │
│     • Apply component template                                  │
│     • Use design tokens (not hardcoded values)                  │
│     • Include TypeScript types                                  │
│     • Add proper event handlers                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. PRE-DELIVERY CHECKLIST                                      │
│     [ ] Uses Ant Design tokens (no hardcoded colors)            │
│     [ ] TypeScript types complete (no `any`)                    │
│     [ ] Event handlers use `on` prefix                          │
│     [ ] CSS-in-JS with createStyles                             │
│     [ ] Tests included (≥80% coverage)                          │
└─────────────────────────────────────────────────────────────────┘
```

## Design System Generation (NEW)

### Generate Complete Recommendation

使用 `--design-system` 生成完整的组件推荐方案：

```bash
python .cursor/skills/agentic-ui-development/scripts/search.py "ai chat assistant" --design-system --project-name "My AI App"
```

输出包含：
- 推荐组件列表
- 推荐 Hooks
- 推荐插件
- 关键设计令牌
- 样式优先级
- 反模式警告
- 交付前检查清单

### Persist with Master + Overrides Pattern

持久化设计系统到文件，支持分层覆盖：

```bash
# 创建 MASTER.md
python .cursor/skills/agentic-ui-development/scripts/search.py "ai chat" --design-system --persist --project-name "My App"

# 同时创建页面覆盖文件
python .cursor/skills/agentic-ui-development/scripts/search.py "ai chat" --design-system --persist --project-name "My App" --page "chat"
```

生成文件结构：
```
design-system/my-app/
├── MASTER.md       # 全局设计规则 (Source of Truth)
└── pages/
    └── chat.md     # 页面特定覆盖规则
```

**分层检索逻辑：**
1. 构建页面时，先检查 `design-system/<project>/pages/[page].md`
2. 如果页面文件存在，其规则**覆盖** Master 文件
3. 如果不存在，严格使用 `design-system/<project>/MASTER.md`

## Component Categories

### 🤖 AI Core Components

| Component | Purpose | Source |
|-----------|---------|--------|
| `Bubble` | 对话气泡 (AI/User) | `src/Bubble/` |
| `ThoughtChainList` | 思维链可视化 | `src/ThoughtChainList/` |
| `ToolUseBar` | 工具调用展示 | `src/ToolUseBar/` |
| `TaskList` | 任务状态列表 | `src/TaskList/` |
| `AnswerAlert` | 结果状态提示 | `src/AnswerAlert/` |
| `AgentRunBar` | 智能体运行控制 | `src/AgentRunBar/` |

### ✍️ Editor Components

| Component | Purpose | Source |
|-----------|---------|--------|
| `MarkdownEditor` | 流式 Markdown 编辑器 | `src/MarkdownEditor/` |
| `MarkdownInputField` | 多模态输入框 | `src/MarkdownInputField/` |
| `SchemaForm` | JSON Schema 表单 | `src/Schema/` |

### 📐 Layout Components

| Component | Purpose | Source |
|-----------|---------|--------|
| `AgenticLayout` | 智能体应用布局 | `src/AgenticLayout/` |
| `ChatLayout` | 对话界面布局 | `src/ChatLayout/` |
| `ChatBootPage` | 对话启动页 | `src/ChatBootPage/` |
| `Workspace` | 多标签工作台 | `src/Workspace/` |

### 🎨 Utility Components

| Component | Purpose | Source |
|-----------|---------|--------|
| `History` | 会话历史 | `src/History/` |
| `WelcomeMessage` | 欢迎引导 | `src/WelcomeMessage/` |
| `SuggestionList` | 建议列表 | `src/Components/SuggestionList/` |
| `Loading` | 加载状态 | `src/Components/Loading/` |
| `Robot` | 机器人头像 | `src/Components/Robot/` |
| `GradientText` | 渐变文字效果 | `src/Components/GradientText/` |
| `TextAnimate` | 文字动画 | `src/Components/TextAnimate/` |
| `TypingAnimation` | 打字机动画 | `src/Components/TypingAnimation/` |
| `I18n` | 国际化支持 | `src/I18n/` |

### 🔘 Button Components

| Component | Purpose | Source |
|-----------|---------|--------|
| `IconButton` | 图标按钮 | `src/Components/Button/IconButton/` |
| `SwitchButton` | 切换按钮 | `src/Components/Button/SwitchButton/` |
| `ToggleButton` | 激活按钮 | `src/Components/Button/ToggleButton/` |
| `ActionIconBox` | 操作图标盒 | `src/Components/ActionIconBox/` |
| `ActionItemBox` | 操作项容器 | `src/Components/ActionItemBox/` |

### 🔌 Plugin System

| Plugin | Purpose | Source |
|--------|---------|--------|
| `chart` | 图表渲染 (Chart.js) | `src/Plugins/chart/` |
| `code` | 代码高亮 (ACE) | `src/Plugins/code/` |
| `katex` | 数学公式 | `src/Plugins/katex/` |
| `mermaid` | 图表渲染 | `src/Plugins/mermaid/` |
| `formatter` | 代码格式化 | `src/Plugins/formatter/` |

## Design System Rules

### ✅ DO (Best Practices)

```tsx
// 1. Use Ant Design tokens
const useStyles = createStyles(({ token }) => ({
  container: {
    padding: token.padding,           // ✅ Not '16px'
    color: token.colorText,           // ✅ Not '#000'
    borderRadius: token.borderRadius, // ✅ Not '6px'
  },
}));

// 2. Complete TypeScript types
interface MyComponentProps {
  onSelect?: (item: Item) => void;  // ✅ on prefix
  config?: MyConfig;                 // ✅ Config suffix
}

// 3. CSS-in-JS pattern
import { createStyles } from '@ant-design/cssinjs';
```

### ❌ DON'T (Anti-Patterns)

```tsx
// 1. Hardcoded values
padding: '16px',           // ❌ Use token.padding
color: '#1890ff',          // ❌ Use token.colorPrimary
backgroundColor: 'white',  // ❌ Use token.colorBgContainer

// 2. Any types
props: any                 // ❌ Define proper interface

// 3. Inline styles
style={{ padding: 16 }}    // ❌ Use createStyles

// 4. Wrong event naming
handleClick               // ❌ Use onClick
```

## File Structure Pattern

```
ComponentName/
├── components/     # 子组件
├── hooks/          # 自定义 Hook (useXxx.ts)
├── types/          # 类型定义
├── __tests__/      # 测试文件 (ComponentName.test.tsx)
├── index.tsx       # 主组件入口
└── style.ts        # CSS-in-JS 样式
```

## Pre-Delivery Checklist

Before completing any component task:

```
[ ] Uses @ant-design/cssinjs createStyles
[ ] All colors from token system
[ ] TypeScript types complete (no `any`)
[ ] Event handlers with `on` prefix
[ ] BEM class naming (.component__element--modifier)
[ ] Unit tests included
[ ] Proper error boundaries
[ ] Accessibility (aria-* attributes)
[ ] Performance (React.memo, useMemo, useCallback)
```

## Search Command Reference

### Available Domains

| Domain | Content | Example Keywords |
|--------|---------|------------------|
| `component` | 37 个 UI 组件 | bubble, chat, layout, editor, thought, task, workspace |
| `plugin` | 5 个 Markdown 插件 | chart, code, katex, mermaid, formatter |
| `hook` | 12 个 React Hooks | scroll, size, speech, click, language, intersection |
| `token` | 51 个设计令牌 | color, padding, font, border, shadow, motion |

### Command Options

```bash
# 基本搜索
python .cursor/skills/agentic-ui-development/scripts/search.py "query"

# 指定域搜索
python .cursor/skills/agentic-ui-development/scripts/search.py "query" --domain component

# 获取推荐方案
python .cursor/skills/agentic-ui-development/scripts/search.py "query" --recommend

# 生成设计系统 (--project-name 可简写为 -p)
python .cursor/skills/agentic-ui-development/scripts/search.py "query" --design-system --project-name "Project"

# 持久化设计系统
python .cursor/skills/agentic-ui-development/scripts/search.py "query" --design-system --persist --project-name "Project" --page "page"

# 输出格式 (--format 可简写为 -f)
python .cursor/skills/agentic-ui-development/scripts/search.py "query" --format json      # JSON
python .cursor/skills/agentic-ui-development/scripts/search.py "query" --format markdown  # Markdown
python .cursor/skills/agentic-ui-development/scripts/search.py "query" --format ascii     # ASCII (default)

# 限制结果数量 (--limit 可简写为 -n)
python .cursor/skills/agentic-ui-development/scripts/search.py "query" --limit 3
```

### Example: Design System Output

```
+------------------------------------------------------------------------------------------+
|  TARGET: MY AI APP - AGENTIC UI RECOMMENDATION
+------------------------------------------------------------------------------------------+
|
|  QUERY: ai chat assistant
|  RULE MATCHED: ai-assistant
|
|  RECOMMENDED COMPONENTS:
|     Bubble.AIBubble, ThoughtChainList, ToolUseBar, WelcomeMessage
|
|  RECOMMENDED HOOKS:
|     useAutoScroll, useSpeechSynthesis
|
|  RECOMMENDED PLUGINS:
|     N/A
|
|  KEY TOKENS:
|     colorPrimary, colorSuccess, motionDurationMid
|
|  STYLE PRIORITY:
|     modern, glassmorphism, dark-mode
|
|  ANTI-PATTERNS (AVOID):
|     ❌ No thought chain for AI
|     ❌ Missing streaming support
|     ❌ No tool call visibility
|
|  PRE-DELIVERY CHECKLIST:
|     [ ] Uses @ant-design/cssinjs createStyles
|     [ ] All colors from token system
|     [ ] TypeScript types complete (no any)
|     [ ] Event handlers with 'on' prefix
|     [ ] BEM class naming
|     [ ] Unit tests included (≥80% coverage)
|     [ ] Proper error boundaries
|
+------------------------------------------------------------------------------------------+
```

## Data Files

| File | Content |
|------|---------|
| `data/components.csv` | 37 个组件数据 |
| `data/plugins.csv` | 5 个插件数据 |
| `data/hooks.csv` | 12 个 Hooks 数据 |
| `data/tokens.csv` | 51 个设计令牌 |
| `data/reasoning-rules.json` | 15 条推理规则 |

## Design Tokens (Quick Reference)

使用 Ant Design Token 系统，禁止硬编码值。

### Color Tokens

| Token | Description |
|-------|-------------|
| `colorPrimary` | 主色 |
| `colorSuccess` | 成功色 |
| `colorWarning` | 警告色 |
| `colorError` | 错误色 |
| `colorText` | 主文本 |
| `colorTextSecondary` | 次要文本 |
| `colorBgContainer` | 容器背景 |
| `colorBorder` | 边框色 |

### Spacing Tokens

| Token | Value |
|-------|-------|
| `paddingXS` | 8px |
| `paddingSM` | 12px |
| `padding` | 16px |
| `paddingLG` | 24px |

### Usage

```tsx
const useStyles = createStyles(({ token }) => ({
  container: {
    padding: token.padding,        // DO: token
    color: token.colorText,        // DO: token
    // padding: '16px',            // DON'T: hardcode
  },
}));
```

## Plugins (Quick Reference)

| Plugin | Purpose | Usage |
|--------|---------|-------|
| `chart` | 图表渲染 | `<LineChart data={...} />` |
| `code` | 代码高亮 | `<CodeBlock code={...} language="ts" />` |
| `katex` | 数学公式 | `<Katex formula="E=mc^2" />` |
| `mermaid` | 图表渲染 | `<Mermaid chart={...} />` |

```tsx
<MarkdownEditor plugins={['code', 'katex', 'mermaid', 'chart']} />
```

---

## Component API Examples

### Bubble

```tsx
import { Bubble } from '@ant-design/agentic-ui';

<Bubble.AIBubble
  content="分析完成"
  thoughtChain={[
    { type: 'thought', content: '分析需求' },
    { type: 'action', content: '执行查询' },
  ]}
  status="success"
  streaming={true}
/>

<Bubble.UserBubble content="请分析数据" avatar={{ src: '/avatar.png' }} />
```

### ThoughtChainList

```tsx
import { ThoughtChainList } from '@ant-design/agentic-ui';

<ThoughtChainList
  items={[
    { type: 'thought', title: '分析', status: 'completed' },
    { type: 'action', title: '执行', status: 'loading', costMillis: 234 },
  ]}
  collapsed={false}
  onToggle={(collapsed) => {}}
/>
```

### ToolUseBar

```tsx
import { ToolUseBar } from '@ant-design/agentic-ui';

<ToolUseBar
  name="搜索工具"
  status="success"
  params={{ query: 'React' }}
  result={{ items: [...], count: 10 }}
  costMillis={1234}
/>
```

### MarkdownEditor

```tsx
import { MarkdownEditor } from '@ant-design/agentic-ui';

<MarkdownEditor
  value={markdown}
  onChange={setMarkdown}
  plugins={['code', 'katex', 'mermaid']}
  toolbar={{ bold: true, italic: true, code: true }}
/>
```

### Workspace

```tsx
import Workspace from '@ant-design/agentic-ui';

<Workspace
  activeKey="file"
  tabs={[
    { key: 'browser', title: '浏览器', content: <BrowserPreview /> },
    { key: 'file', title: '文件', content: <FileViewer /> },
  ]}
  onTabChange={(key) => {}}
/>
```

---

## Code Templates

### Component Template

```tsx
import React from 'react';
import { createStyles } from '@ant-design/cssinjs';

export interface {{ComponentName}}Props {
  className?: string;
  children?: React.ReactNode;
  onSelect?: (value: string) => void;
}

const useStyles = createStyles(({ token }) => ({
  container: {
    padding: token.padding,
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadius,
  },
}));

export const {{ComponentName}}: React.FC<{{ComponentName}}Props> = ({
  className, children, onSelect,
}) => {
  const { styles, cx } = useStyles();
  return <div className={cx(styles.container, className)}>{children}</div>;
};
```

### Hook Template

```tsx
import { useState, useCallback } from 'react';

export const use{{HookName}} = (defaultValue = '') => {
  const [value, setValue] = useState(defaultValue);
  const reset = useCallback(() => setValue(defaultValue), [defaultValue]);
  return { value, setValue, reset };
};
```

### Test Template

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

describe('{{ComponentName}}', () => {
  it('should render', () => {
    render(<{{ComponentName}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle click', async () => {
    const onClick = vi.fn();
    render(<{{ComponentName}} onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

### Test Commands

```bash
pnpm test             # 单元测试
pnpm test:coverage    # 带覆盖率 (>=80%)
pnpm test:e2e         # E2E 测试
```

---

## Commit Convention

```
<type>(<scope>): <description>

Types: feat | fix | docs | style | refactor | perf | test | chore
Scopes: bubble | editor | workspace | history | plugin | core
```

**Examples:**
- `feat(bubble): add streaming text animation`
- `fix(editor): resolve cursor position issue`
- `test(thought-chain): add unit tests for ToolCall`
