---
nav:
  title: 项目研发
  order: 3
group:
  title: 开发指南
  order: 2
---

# 开发指南与最佳实践

本指南涵盖了 agentic-ui 项目的开发流程、最佳实践、性能优化和常见问题解决方案。

## 📋 目录

- [开发环境设置](#开发环境设置)
- [项目结构说明](#项目结构说明)
- [开发流程](#开发流程)
- [性能优化](#性能优化)
- [测试策略](#测试策略)
- [调试技巧](#调试技巧)
- [常见问题](#常见问题)
- [贡献指南](#贡献指南)

## 📚 相关文档

- [多厂商聊天消息 → BubbleList 适配](./chat-message-bubble-adapters.md) - OpenAI / OpenClaw / Ollama `messages` 与 `BubbleList` 对接说明（[English](./chat-message-bubble-adapters.en-US.md)）
- [Pull Request 提交指南](./pull-request-guide.md) - 了解如何正确提交 PR
- [发布测试版本指南](./release-guide.md) - 学习如何发布和管理测试版本

## 🛠️ 开发环境设置

### 系统要求

- **Node.js**: >= 16.0.0 (推荐使用 LTS 版本)
- **包管理器**: pnpm >= 7.0.0 (推荐) 或 npm >= 8.0.0
- **操作系统**: Windows 10+, macOS 10.15+, 或 Linux

### 环境配置

```bash
# 1. 克隆项目
git clone git@github.com:ant-design/agentic-ui.git
cd agentic-ui

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm start

# 4. 在浏览器中打开 http://localhost:8000
```

### IDE 配置

#### VSCode 推荐插件

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

#### 编辑器设置

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## 📁 项目结构说明

### 核心目录结构

```
agentic-ui/
├── src/                        # 源代码
│   ├── MarkdownEditor/         # 核心编辑器模块
│   │   ├── editor/            # 编辑器核心逻辑
│   │   ├── hooks/             # 编辑器相关 Hooks
│   │   └── utils/             # 编辑器工具函数
│   ├── components/            # 全局组件
│   ├── hooks/                 # 全局 Hooks
│   ├── utils/                 # 工具函数
│   ├── types/                 # TypeScript 类型定义
│   └── plugins/               # 插件系统
├── docs/                      # 文档和示例
│   ├── components/            # 组件文档
│   ├── development/           # 开发文档
│   └── demos/                 # 演示代码
├── tests/                     # 测试文件
└── scripts/                   # 构建脚本
```

### 文件命名规范

- **组件文件**: PascalCase (如 `MarkdownEditor.tsx`)
- **工具函数**: camelCase (如 `parseMarkdown.ts`)
- **类型定义**: PascalCase + `.types.ts` (如 `Editor.types.ts`)
- **样式文件**: camelCase + `.style.ts` (如 `editor.style.ts`)
- **测试文件**: 原文件名 + `.test.tsx` (如 `Editor.test.tsx`)

## 🔄 开发流程

### 功能开发流程

1. **需求分析**
   - 明确功能需求和用户场景
   - 评估技术可行性和复杂度
   - 设计 API 接口和组件结构

2. **分支管理**

   ```bash
   # 创建功能分支
   git checkout -b feature/your-feature-name

   # 开发过程中定期同步主分支
   git fetch origin
   git rebase origin/main
   ```

3. **编码规范**
   - 遵循 TypeScript 最佳实践
   - 使用 ESLint 和 Prettier 保证代码质量
   - 添加必要的注释和文档

4. **测试编写**
   - 单元测试覆盖核心逻辑
   - 集成测试验证组件交互
   - E2E 测试确保用户流程正常

5. **代码审查**
   - 提交 Pull Request
   - 同行代码审查
   - 修改意见和优化建议

### 代码提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 功能开发
git commit -m "feat: add markdown table support"

# Bug 修复
git commit -m "fix: resolve editor crash on empty content"

# 文档更新
git commit -m "docs: update API documentation"

# 性能优化
git commit -m "perf: improve rendering performance for large documents"

# 重构
git commit -m "refactor: extract common editor utilities"

# 测试
git commit -m "test: add unit tests for markdown parser"
```

## ⚡ 性能优化

### 渲染性能优化

#### 1. 组件 Memoization

```tsx | pure
// 使用 React.memo 避免不必要的重新渲染
const MElement = React.memo<ElementProps>(
  ({ element, children, ...props }) => {
    return <div {...props}>{children}</div>;
  },
  (prevProps, nextProps) => {
    // 自定义比较逻辑
    return (
      prevProps.element === nextProps.element &&
      prevProps.children === nextProps.children
    );
  },
);
```

#### 2. 虚拟滚动

```tsx | pure
// 对于大量内容，使用虚拟滚动优化性能
import { FixedSizeList as List } from 'react-window';

const VirtualizedEditor: React.FC = () => {
  const renderItem = ({ index, style }) => (
    <div style={style}>
      <EditorLine index={index} />
    </div>
  );

  return (
    <List height={600} itemCount={itemCount} itemSize={35}>
      {renderItem}
    </List>
  );
};
```

#### 3. 懒加载和代码分割

```tsx | pure
// 插件懒加载
const KatexPlugin = lazy(() => import('../plugins/katex'));
const MermaidPlugin = lazy(() => import('../plugins/mermaid'));

// 在编辑器中按需加载
const Editor: React.FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      {enableKatex && <KatexPlugin />}
      {enableMermaid && <MermaidPlugin />}
    </Suspense>
  );
};
```

### 内存优化

#### 1. 清理事件监听器

```tsx | pure
const useEditorEvents = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 处理键盘事件
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
};
```

#### 2. 避免内存泄漏

```tsx | pure
const useAsyncOperation = () => {
  const [data, setData] = useState(null);
  const abortControllerRef = useRef<AbortController>();

  const fetchData = async () => {
    // 取消之前的请求
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/data', {
        signal: controller.signal,
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Fetch error:', error);
      }
    }
  };

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return { data, fetchData };
};
```

## 🧪 测试策略

### 测试金字塔

```
    E2E Tests (少量)
   ←─────────────────→
  Integration Tests (适量)
 ←─────────────────────────→
Unit Tests (大量)
```

### 单元测试

```tsx | pure
// Editor.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MarkdownEditor } from '../MarkdownEditor';

describe('MarkdownEditor', () => {
  it('should render with initial value', () => {
    render(<MarkdownEditor initValue="# Hello World" />);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should handle text input', () => {
    const onChange = jest.fn();
    render(<MarkdownEditor onChange={onChange} />);

    const editor = screen.getByRole('textbox');
    fireEvent.input(editor, { target: { value: '# Test' } });

    expect(onChange).toHaveBeenCalledWith('# Test', expect.any(Array));
  });
});
```

### 集成测试

```tsx | pure
// EditorIntegration.test.tsx
describe('Editor Integration', () => {
  it('should work with plugins', async () => {
    render(<MarkdownEditor initValue="$$E=mc^2$$" plugins={[katexPlugin]} />);

    await waitFor(() => {
      expect(screen.getByRole('math')).toBeInTheDocument();
    });
  });
});
```

### E2E 测试

```typescript | pure
// e2e/editor.spec.ts
import { test, expect } from '@playwright/test';

test('complete editing workflow', async ({ page }) => {
  await page.goto('/');

  // 输入内容
  await page.fill('[data-testid="editor"]', '# Hello World');

  // 验证预览
  await expect(page.locator('h1')).toContainText('Hello World');

  // 测试工具栏功能
  await page.click('[data-testid="bold-button"]');
  await page.type('[data-testid="editor"]', 'bold text');

  await expect(page.locator('strong')).toContainText('bold text');
});
```

## 🔍 调试技巧

### 浏览器调试

#### 1. React Developer Tools

```tsx | pure
// 在组件中添加调试信息
const Editor: React.FC = () => {
  // React DevTools 中可以看到这个值
  const debugInfo = useMemo(
    () => ({
      nodeCount: editor.children.length,
      selectionPath: editor.selection?.anchor.path,
    }),
    [editor],
  );

  return <div data-debug={JSON.stringify(debugInfo)}>...</div>;
};
```

#### 2. 性能分析

```tsx | pure
// 使用 React Profiler 分析性能
import { Profiler } from 'react';

const onRenderCallback = (id, phase, actualDuration) => {
  console.log('Render info:', { id, phase, actualDuration });
};

<Profiler id="Editor" onRender={onRenderCallback}>
  <MarkdownEditor />
</Profiler>;
```

#### 3. 错误边界

```tsx | pure
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Editor error:', error, errorInfo);
    // 发送错误报告到监控服务
  }

  render() {
    if (this.state.hasError) {
      return <div>编辑器出现错误，请刷新页面重试</div>;
    }

    return this.props.children;
  }
}
```

### 日志系统

```tsx | pure
// utils/logger.ts
export const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data);
    }
  },

  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
    // 生产环境中发送到错误监控服务
  },

  performance: (label: string, fn: () => void) => {
    const start = performance.now();
    fn();
    faq;
    const end = performance.now();
    console.log(`[PERF] ${label}: ${end - start}ms`);
  },
};
```

## ❓ 常见问题

### 开发环境问题

#### Q: 启动项目时出现 "Cannot resolve module" 错误

A: 检查以下几点：

1. 确保已运行 `pnpm install`
2. 删除 `node_modules` 和 `pnpm-lock.yaml`，重新安装
3. 检查 Node.js 版本是否符合要求

```bash
# 清理并重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### Q: TypeScript 类型错误

A: 常见解决方案：

1. 重启 TypeScript 服务：`Ctrl+Shift+P` → "TypeScript: Restart TS Server"
2. 检查类型导入路径是否正确
3. 确保所有依赖的类型包已安装

### 性能问题

#### Q: 大文档编辑时出现卡顿

A: 优化建议：

1. 启用虚拟滚动
2. 减少不必要的重新渲染
3. 使用 `React.memo` 优化组件
4. 考虑分页或懒加载

```tsx | pure
// 示例：优化大文档渲染
const OptimizedEditor = React.memo(() => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 100 });

  return (
    <VirtualList onVisibleRangeChange={setVisibleRange}>
      {/* 只渲染可见范围内的内容 */}
    </VirtualList>
  );
});
```

#### Q: 插件加载慢

A: 优化策略：

1. 使用动态导入 (`React.lazy`)
2. 实现插件预加载机制
3. 缓存插件资源

### 兼容性问题

#### Q: 在某些浏览器中功能异常

A: 检查清单：

1. 浏览器版本支持情况
2. Polyfill 是否正确加载
3. CSS 兼容性问题
4. JavaScript API 兼容性

## 🤝 贡献指南

### 贡献流程

1. **Fork 项目**

   ```bash
   # 在 GitHub 上 Fork 项目，然后克隆你的 Fork
   git clone https://github.com/your-username/agentic-ui.git
   ```

2. **创建分支**

   ```bash
   git checkout -b feature/your-feature
   ```

3. **开发和测试**

   ```bash
   # 开发功能
   pnpm start

   # 运行测试
   pnpm test

   # 代码检查
   pnpm lint
   ```

4. **提交代码**

   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push origin feature/your-feature
   ```

5. **创建 Pull Request**
   - 在 GitHub 上创建 PR
   - 填写详细的描述和变更说明
   - 等待代码审查和合并

### 代码质量要求

- **测试覆盖率**: 新功能需要有相应的测试，保持覆盖率在 80% 以上
- **代码风格**: 遵循项目的 ESLint 和 Prettier 配置
- **文档更新**: 新功能需要更新相应的文档和示例
- **向后兼容**: 避免破坏性变更，如有必要需要提供迁移指南

### 提问和讨论

- **GitHub Issues**: 报告 Bug 和功能请求
- **GitHub Discussions**: 技术讨论和问答
- **Code Review**: 积极参与代码审查，提供建设性意见

---

通过遵循本指南，你可以更高效地参与 agentic-ui 项目的开发。如果遇到任何问题，欢迎在 GitHub 上提出 Issue 或参与 Discussion。
