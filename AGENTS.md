# AGENTS.md

> Agentic UI 项目开发指南 - 为 AI 编程助手提供项目上下文和开发规范

## 📑 目录

- [项目背景](#项目背景)
- [快速开始](#快速开始)
- [代码规范](#代码规范)
  - [基本编码规范](#基本编码规范)
  - [命名规范](#命名规范)
  - [TypeScript 规范](#typescript-规范)
  - [样式规范](#样式规范)
  - [代码格式化](#代码格式化)
- [开发指南](#开发指南)
  - [测试指南](#测试指南)
  - [演示代码规范](#演示代码规范)
  - [国际化规范](#国际化规范)
  - [组件开发模板](#组件开发模板)
- [文档和 Changelog](#文档和-changelog-规范)
- [Git 和 Pull Request](#git-和-pull-request-规范)
- [质量保证](#质量保证)
- [工具链和环境](#工具链和环境)
- [常见问题和故障排查](#常见问题和故障排查)

---

## 项目背景

这是 [ant-design/agentic-ui](https://github.com/ant-design/agentic-ui) 的源代码仓库，发布为 npm 包 `@ant-design/agentic-ui`，是一个面向智能体的 UI 组件库。

### 核心特性

- 使用 TypeScript 和 React 开发
- 兼容 React 16.9+ 版本（peerDependencies: `>=16.9.0`）
- 基于 Ant Design 和 `@ant-design/cssinjs` 构建
- 提供多步推理可视化、工具调用展示、任务执行协同等 Agentic UI 能力
- 支持国际化（i18n）
- 使用 Dumi 构建文档站点
- 使用 Father 构建产物
- 使用 Vitest + React Testing Library 进行单元测试
- 使用 Playwright 进行 E2E 测试

### 设计理念

- **过程透明化**：可见思考与工具调用，让用户理解智能体的推理过程
- **主动协作**：智能体主动发起交互，与用户协同完成任务
- **端到端任务协同**：从"回答一句话"到"完成一件事"，让智能体成为用户的协作伙伴

---

## 快速开始

### 开发环境要求

- **Node.js**: >= 18.17.0（推荐 22 LTS）
- **包管理器**: 仓库锁定 **pnpm 9.15.9**（与 `pnpm-lock.yaml` lockfile v9 一致；**勿用全局 pnpm 10+**，其在 Node 18 上会报 `requires at least Node.js v22.13`）
- **操作系统**: Windows 10+, macOS 10.15+, Linux
- **浏览器兼容性**: 现代浏览器（Chrome 80+、Edge、Firefox、Safari）

### 安装依赖

```bash
# 克隆项目
git clone git@github.com:ant-design/agentic-ui.git
cd agentic-ui

# 使用 Corepack 启用 package.json 中锁定的 pnpm 版本（Node 16.9+ 自带 Corepack）
corepack enable
pnpm install
```

若未使用 Corepack，可显式激活同一版本：

```bash
corepack enable
corepack prepare pnpm@9.15.9 --activate
pnpm install
```

### 常用开发命令

```bash
pnpm start              # 启动文档站点（http://localhost:8000）
pnpm run build          # 构建项目
pnpm test               # 运行单元测试（默认跳过 e2e、大体积 chart/Workspace 目录、branches/coverage 等补洞套件，见 vitest.config.ts）
pnpm run test:full      # 全量 Vitest（`--mode full`；与 `test:coverage:full` 同一套 exclude，不含覆盖率）
pnpm run test:coverage  # 生成覆盖率（默认同上精简集）
pnpm run test:coverage:full  # 全量测试 + 覆盖率（`--mode full`；Codecov workflow / 发布前）
pnpm run test:e2e       # 运行 E2E 测试
pnpm run lint           # 代码检查（ESLint + Stylelint）
pnpm run prettier       # 代码格式化
pnpm tsc                # TypeScript 类型检查
```

### 项目结构

```
agentic-ui/
├── src/                    # 组件源代码
│   ├── ComponentName/      # 单个组件目录（如 Bubble、MarkdownEditor、ThoughtChainList 等）
│   │   ├── ComponentName.tsx   # 主组件实现（部分组件）
│   │   ├── SubComponent.tsx    # 子组件（如 AIBubble.tsx、UserBubble.tsx）
│   │   ├── style.ts            # 样式文件（CSS-in-JS）
│   │   ├── types.ts            # 类型定义
│   │   ├── hooks/              # 组件专属 hooks
│   │   ├── utils/              # 工具函数
│   │   ├── plugins/            # 插件（如 MarkdownEditor）
│   │   ├── components/         # 子组件目录（如 Bubble/List、Bubble/MessagesContent）
│   │   ├── __tests__/          # 测试文件
│   │   └── index.tsx           # 导出入口
│   ├── Components/           # 通用组件
│   ├── Hooks/                # 共享 Hooks
│   ├── Utils/                # 工具函数库
│   ├── I18n/                 # 国际化
│   ├── Types/                # 共享类型定义
│   ├── Constants/            # 常量定义
│   └── index.ts              # 组件总入口
├── docs/                    # 文档
│   ├── components/           # 组件 API 文档
│   │   ├── bubble.md
│   │   ├── markdown-editor.md
│   │   └── ...
│   └── development/          # 开发相关文档
│       ├── changelog.zh-CN.md
│       └── changelog.en-US.md
├── tests/                   # 测试文件
├── e2e/                     # E2E 测试
├── scripts/                 # 构建和工具脚本
├── .dumirc.ts               # Dumi 配置
├── .fatherrc.ts             # Father 构建配置
├── vitest.config.ts         # Vitest 配置
├── playwright.config.ts     # Playwright 配置
├── package.json
└── tsconfig.json
```

---

## 代码规范

### 基本编码规范

- ✅ 使用 TypeScript 和 React 书写
- ✅ 使用函数式组件和 Hooks，**避免类组件**
- ✅ 使用 `forwardRef` 实现组件 ref 传递
- ✅ 使用提前返回（early returns）提高代码可读性
- ✅ 避免引入新依赖，严控打包体积
- ✅ 兼容现代浏览器
- ✅ 保持向下兼容，避免 breaking change
- ✅ 组件名使用大驼峰（PascalCase），如 `MarkdownEditor`、`Bubble`
- ✅ 属性名使用小驼峰（camelCase），如 `onClick`、`defaultValue`
- ✅ 合理使用 `React.memo`、`useMemo` 和 `useCallback` 优化性能
- ✅ 使用 `clsx` 处理类名拼接
- ✅ 支持 Semantic 样式系统（`classNames` 和 `styles` 属性）

#### Props 命名

| 用途       | 命名规则                        | 示例                          |
| ---------- | ------------------------------- | ----------------------------- |
| 初始化属性 | `default` + `PropName`          | `defaultValue`、`defaultOpen` |
| 强制渲染   | `forceRender`                   | `forceRender`                 |
| 子组件渲染 | `SubComponentName` + `Render`   | `titleRender`、`footerRender` |
| 数据源     | `dataSource`                    | `dataSource`                  |
| 面板开启   | 使用 `open`，避免使用 `visible` | `open`、`defaultOpen`         |
| 显示相关   | `show` + `PropName`             | `showSearch`、`showHeader`    |
| 功能性     | `PropName` + `able`             | `disabled`、`readable`        |
| 禁用       | `disabled`                      | `disabled`                    |
| 额外内容   | `extra`                         | `extra`                       |
| 图标       | `icon`                          | `icon`、`prefixIcon`          |
| 触发器     | `trigger`                       | `trigger`                     |
| 配置属性   | `Config` 后缀                   | `toolbarConfig`               |

#### 事件命名

| 类型       | 命名规则                                | 示例                  |
| ---------- | --------------------------------------- | --------------------- |
| 触发事件   | `on` + `EventName`                      | `onClick`、`onChange` |
| 子组件事件 | `on` + `SubComponentName` + `EventName` | `onPanelChange`       |
| 前置事件   | `before` + `EventName`                  | `beforeUpload`        |
| 后置事件   | `after` + `EventName`                   | `afterClose`          |

#### 组件引用（Ref）

组件应提供 `ref` 属性，结构如下：

```tsx
interface ComponentRef {
  nativeElement: HTMLElement;
  focus: VoidFunction;
  blur: VoidFunction;
  // 其他方法...
}
```

### 命名规范

- **组件**: PascalCase（如 `MarkdownEditor.tsx`、`HistoryItem.tsx`）
- **文件夹**: PascalCase 或 kebab-case（与组件一致，如 `MarkdownEditor`、`markdown-editor`）
- **Hooks**: camelCase，以 `use` 开头（如 `useAutoScroll.ts`、`useClickAway.ts`）
  - 复杂 Hook 可使用目录结构，如 `useStyle/index.tsx`、`useDebounceFn/index.ts`
- **工具函数**: camelCase（如 `parseMarkdown.ts`、`debugUtils.ts`）
- **样式文件**: `style.ts`
- **类型文件**: `types.ts` 或 `type.ts`
- **类名**: BEM 命名法
  - Block: `.history-item`
  - Element: `.history-item__title` 或 `prefix-item`（与 prefixCls 拼接）
  - Modifier: `.history-item--selected` 或 `prefix-item--active`
  - 避免过长复合名，如 `item-min-plus-icon` 应简化为 `item--more`
- **className 工具**: 统一使用 `import classNames from 'clsx'`。若组件存在 `classNames` 属性，使用 `import classNames from 'clsx'` 避免变量遮蔽
- **前缀变量**: 组件内获取的类名前缀统一命名为 `prefixCls`，与 Ant Design 保持一致

### 文件组织结构

```
ComponentName/
├── components/          # 子组件
├── hooks/              # 自定义 Hook
├── plugins/            # 插件（如有）
├── utils/              # 工具函数
├── __tests__/          # 测试文件（ComponentName.test.tsx）
├── ComponentName.tsx    # 主组件实现
├── index.tsx           # 导出入口
├── style.ts            # 样式文件（CSS-in-JS）
├── types.ts            # 类型定义
└── README.md           # 组件文档（可选）
```

### API 设计规范

- **Props**: 使用 Interface 定义，命名为 `ComponentNameProps`
- **事件回调**: 使用 `on` 前缀（如 `onSelect`、`onChange`）
- **配置属性**: 使用 `Config` 后缀（如 `toolbarConfig`）
- **类型定义**: 避免 `any`，提供完整的 TypeScript 类型定义

### API 文档规范

#### API 表格格式

| Property      | Description                | Type                                  | Default  | Version |
| ------------- | -------------------------- | ------------------------------------- | -------- | ------- |
| disabled      | 是否禁用                   | `boolean`                             | `false`  | -       |
| defaultValue  | 默认值                     | `string`                              | -        | -       |
| style         | 自定义样式                 | `React.CSSProperties`                 | -        | -       |
| classNames    | 自定义类名                 | `ComponentClassNamesType`             | -        | -       |
| styles        | 自定义内联样式             | `ComponentStylesType`                 | -        | -       |
| placement     | 消息布局位置               | `'left' \| 'right'`                   | `'left'` | -       |
| ~~onDisLike~~ | 已废弃，请使用 `onDislike` | `(bubble: MessageBubbleData) => void` | -        | 2.29.0  |

#### API 文档要求

- ✅ **表格列顺序**：Property → Description → Type → Default → Version
- ✅ **类型格式**：使用反引号包裹，如 `` `boolean` ``、`` `React.CSSProperties` ``
- ✅ **联合类型**：使用 `|` 分隔，如 `` `'left' \| 'right'` ``
- ✅ **字符串默认值**：使用反引号包裹，如 `` `'left' ``
- ✅ **布尔默认值**：直接使用 `` `true` `` 或 `` `false` ``
- ✅ **数字默认值**：直接使用数字，如 `0`、`100`
- ✅ **函数类型**：使用箭头函数表达式，如 `` `(e: Event) => void` ``
- ✅ **无默认值**：使用 `-`
- ✅ **废弃属性**：使用删除线标记，如 `~~onDisLike~~`，并在描述中说明替代方案
- ✅ **版本列**：新增属性标注可用版本号，废弃属性标注废弃版本，无版本限制使用 `-`
- ✅ **描述格式**：首字母大写，结尾无句号
- ✅ **API 排序**：按字母顺序排列
- ✅ **分组展示**：相关属性可分组展示（如"核心属性"、"样式配置"、"交互回调"等）

---

## TypeScript 规范

### 基本原则

- ✅ 所有组件和函数必须提供准确的类型定义
- ✅ 避免使用 `any` 类型，尽可能精确地定义类型
- ✅ 使用接口（interface）而非类型别名（type）定义对象结构
- ✅ 导出所有公共接口类型，方便用户使用
- ✅ 严格遵循 TypeScript 类型设计原则，确保类型安全
- ✅ 确保编译无任何类型错误或警告

### 组件类型定义

```tsx
// ✅ 正确：使用 interface 定义 Props
interface ButtonProps {
  type?: 'primary' | 'default' | 'dashed';
  onClick?: (e: React.MouseEvent) => void;
}

// ❌ 错误：避免使用 type 定义对象结构
type ButtonProps = {
  type?: 'primary' | 'default';
};

// ✅ 正确：组件 Props 接口命名
interface ComponentNameProps {
  // ...
}

// ✅ 正确：使用 ForwardRefRenderFunction 定义 ref
const Component = React.forwardRef<ComponentRef, ComponentProps>(
  (props, ref) => {
    // ...
  },
);
```

### 类型使用最佳实践

- ✅ 适当使用泛型增强类型灵活性
- ✅ 使用交叉类型（&）合并多个类型
- ✅ 使用字面量联合类型定义有限的选项集合
- ✅ 避免使用 `enum`，优先使用联合类型和 `as const`
- ✅ 尽可能依赖 TypeScript 的类型推断
- ✅ 只在必要时使用类型断言（`as`）

```tsx
// ✅ 推荐：使用联合类型和 as const
const ButtonTypes = ['primary', 'default', 'dashed'] as const;
type ButtonType = (typeof ButtonTypes)[number];

// ❌ 不推荐：使用 enum
enum ButtonType {
  Primary = 'primary',
  Default = 'default',
}
```

---

## 样式规范

### 样式架构

项目使用 `@ant-design/cssinjs` 作为样式解决方案：

- 基于 `@ant-design/cssinjs` 实现 CSS-in-JS
- 支持动态样式和主题切换
- 样式独立注入，避免 CSS 污染
- 与 Ant Design Token 系统兼容

### 核心原则

- **类型安全**: 利用 TypeScript 检查样式属性
- **Token 系统**: 使用 Ant Design 的 Token 系统（`token.padding`、`token.colorPrimary`）
- **动态样式**: 基于 Props 和状态生成样式
- **避免冲突**: 使用 `hashId` 和 `prefixCls` 确保样式隔离

### 样式定义示例

项目通过 `genStyleHooks` + 组件级 `ComponentToken` 注册样式，与 antd 上游
`theme/util/genStyleUtils` 同源（仅 `hashId` 固定为空，避免与宿主 antd
主题哈希叠加）：

```tsx
import {
  genStyleHooks,
  resetComponent,
  type GenStyleFn,
} from '../Hooks/useStyle';

// 可选：声明组件级 ComponentToken，扩展进 AgenticComponentTokenMap
declare module '../Hooks/useStyle' {
  interface AgenticComponentTokenMap {
    ComponentName?: ComponentNameToken;
  }
}

export interface ComponentNameToken {
  /** 容器边框色（示例） */
  componentNameBorder: string;
}

const genStyle: GenStyleFn<'ComponentName'> = (token) => ({
  [token.componentCls]: {
    '&-container': {
      padding: token.paddingSM,
      backgroundColor: token.colorBgContainer,
      borderRadius: token.borderRadius,
      border: `1px solid ${token.componentNameBorder}`,
    },
    '&-title': {
      fontSize: token.fontSizeLG,
      fontWeight: token.fontWeightStrong,
    },
    '&:hover': {
      borderColor: token.colorPrimary,
    },
  },
});

const useGenStyle = genStyleHooks(
  'ComponentName',
  (token, info) => [resetComponent(token), genStyle(token, info)],
  () => ({
    componentNameBorder: 'var(--color-gray-border-light)',
  }),
);

export function useStyle(prefixCls?: string) {
  const [, hashId] = useGenStyle(prefixCls ?? 'component-name');
  return { hashId };
}
```

> 极少数动态 styleFn 场景（如气泡按 `bubbleNameClassName` 动态切 cache）可继续
> 使用 `useEditorStyleRegister` 兼容入口，其底层同样接入 `@ant-design/cssinjs`
> 的 `useStyleRegister`。

在组件中使用：

```tsx
import { useStyle } from './style';

const Component = () => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('component-name');
  const { hashId } = useStyle(prefixCls);

  return <div className={classNames(prefixCls, hashId)}>{/* 子内容 */}</div>;
};
```

### Token 使用

- 避免硬编码颜色、尺寸、间距等值
- 组件样式应基于全局 Token 和组件级 Token
- 自定义样式应尽可能使用现有的 Token

### 响应式和主题支持

- ✅ 组件应支持不同屏幕尺寸
- ✅ 与 Ant Design 暗色模式兼容
- ✅ 支持 RTL（从右到左）布局
- ✅ 使用 CSS 逻辑属性（如 `margin-inline-start`）替代方向性属性

---

## 代码格式化

### 工具配置

| 工具      | 用途         | 配置文件         |
| --------- | ------------ | ---------------- |
| ESLint    | 代码质量检查 | `.eslintrc.js`   |
| Stylelint | 样式检查     | `.stylelintrc`   |
| Prettier  | 代码格式化   | `.prettierrc.js` |

### 格式化规范

- **缩进**: 2 空格
- **行宽**: 80 字符（可在 .prettierrc 中调整）
- **引号**: JavaScript 使用单引号
- **尾随逗号**: 强制添加（`all`）

### 格式化命令

```bash
# 代码格式化
pnpm run prettier

# 代码检查
pnpm run lint
```

### 导入顺序

使用 `prettier-plugin-organize-imports` 插件自动排序导入：

```typescript
// 1. React 导入
import React, { forwardRef, useState } from 'react';
// 2. 第三方库导入
import clsx from 'clsx';
// 3. Ant Design 内部导入
import { Button } from 'antd';
// 4. 相对路径导入
import { helperFunction } from './utils';
// 5. 类型导入
import type { RefType } from './types';
```

---

## 开发指南

### 测试指南

#### 测试框架和工具

- 使用 **Vitest** 和 **React Testing Library** 编写单元测试
- 使用 **Playwright** 进行 E2E 测试
- 测试覆盖率要求 **≥ 80%**
- 测试文件放在组件目录下的 `__tests__` 目录或 `tests/` 目录

#### 测试文件类型

| 测试类型   | 文件名                              | 用途                 |
| ---------- | ----------------------------------- | -------------------- |
| 主测试     | `ComponentName.test.tsx`            | 组件功能测试         |
| 分支测试   | `ComponentName.branches.test.tsx`   | 分支覆盖测试（补洞） |
| 场景测试   | `ComponentName.scenarios.test.tsx`  | 场景测试             |
| 回归测试   | `ComponentName.regression.test.tsx` | 回归测试             |
| 属性测试   | `ComponentName.props.test.tsx`      | 属性测试             |
| 渲染测试   | `ComponentName.render.test.tsx`     | 渲染测试             |
| 高级测试   | `ComponentName.advanced.test.tsx`   | 高级功能测试         |
| 基础测试   | `ComponentName.basic.test.tsx`      | 基础功能测试         |
| SSR 测试   | `ComponentName.ssr.test.tsx`        | SSR 测试             |
| 懒加载测试 | `ComponentName.lazy.test.tsx`       | 懒加载测试           |
| E2E 测试   | `e2e/*.spec.ts`                     | 端到端流程测试       |

#### 运行测试

```bash
# 运行单元测试（默认精简集，见 vitest.config.ts 的 exclude）
pnpm test

# 全量 Vitest（`--mode full`；含 targeted-coverage、comprehensive、benchmark 等）
pnpm run test:full

# 运行测试并生成覆盖率（默认精简集）
pnpm run test:coverage

# 全量测试 + 覆盖率（与 codecov workflow 一致）
pnpm run test:coverage:full

# 与 CI 一致：开启覆盖率阈值（见 vitest.config.ts）
COVERAGE_ENFORCE=1 pnpm run test:coverage:full

# 运行 E2E 测试
pnpm run test:e2e

# E2E 调试模式
pnpm run test:e2e:debug
```

#### 测试最佳实践

- ✅ 测试用户行为而非实现细节
- ✅ 使用有意义的测试描述（`describe` 和 `it`）
- ✅ 每个测试用例应该独立，不依赖其他测试
- ✅ 测试边界情况和错误处理
- ✅ 新功能必须包含对应的测试用例

### 演示代码规范

#### Demo 基本要求

- ✅ Demo 代码尽可能简洁
- ✅ 避免冗余代码，方便用户复制到项目直接使用
- ✅ 每个 demo 聚焦展示一个功能点
- ✅ 提供中英文两个版本的说明（如适用）
- ✅ 遵循展示优先原则，确保视觉效果良好

#### TSX 代码规范

```tsx
// ✅ 正确的导入顺序
import React, { useState } from 'react';
import { MarkdownEditor } from '@ant-design/agentic-ui';

// ✅ 使用函数式组件和 Hooks
const Demo: React.FC = () => {
  const [content, setContent] = useState('');

  return <MarkdownEditor value={content} onChange={setContent} />;
};

export default Demo;
```

### 国际化规范

- 国际化配置文件在 `src/I18n/` 目录
- 新增或修改配置时需同步更新相关语言文件
- 使用 `useMergedLocale` 等 hook 统一处理国际化

### 组件开发模板

#### 主组件模板（使用 React.memo）

````tsx
import React, { memo, useContext } from 'react';
import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import { useStyle } from './style';
import type { ComponentNameProps } from './types';

/**
 * ComponentName 组件 - 组件描述
 *
 * @component
 * @description 组件功能描述
 * @param {ComponentNameProps} props - 组件属性
 * @param {string} [props.className] - 自定义CSS类名
 * @param {React.CSSProperties} [props.style] - 自定义样式
 *
 * @example
 * ```tsx
 * <ComponentName
 *   className="custom-class"
 *   style={{ margin: '16px' }}
 * />
 * ```
 *
 * @returns {React.ReactElement} 渲染的组件
 */
const ComponentNameComponent: React.FC<ComponentNameProps> = (props) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('component-name');
  const { hashId } = useStyle(prefixCls);

  return (
    <div
      className={classNames(prefixCls, hashId, props.className)}
      style={props.style}
    >
      {/* 子内容 */}
    </div>
  );
};

ComponentNameComponent.displayName = 'ComponentName';

// 使用 React.memo 优化性能，避免不必要的重新渲染
export const ComponentName = memo(ComponentNameComponent);
````

#### 主组件模板（使用 forwardRef）

```tsx
import React, { forwardRef, useContext } from 'react';
import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import { useStyle } from './style';
import type { ComponentNameProps, ComponentNameRef } from './types';

const InternalComponent = React.forwardRef<
  ComponentNameRef,
  ComponentNameProps
>((props, ref) => {
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('component-name');
  const { hashId } = useStyle(prefixCls);

  return (
    <div
      ref={ref}
      className={classNames(prefixCls, hashId, props.className)}
      style={props.style}
    >
      {/* 子内容 */}
    </div>
  );
});

InternalComponent.displayName = 'ComponentName';

export default InternalComponent;
```

#### 导出入口模板（index.tsx）

```tsx
export { ComponentName } from './ComponentName';
export type { ComponentNameProps, ComponentNameRef } from './types';
```

---

## 文档和 Changelog 规范

### 基本要求

- ✅ 提供中英文两个版本（`changelog.zh-CN.md`、`changelog.en-US.md`）
- ✅ 新的属性需要声明可用的版本号
- ✅ 属性命名符合 API 命名规则

### 文档锚点 ID 规范

- 所有中文标题（H1-H6）建议手动指定英文锚点
- 格式: `## 中文标题 {#english-anchor-id}`
- 锚点 ID 需简洁、有意义

### Changelog 规范

#### 核心原则

1. **文件位置**: 在 `docs/development/changelog.zh-CN.md` 和 `docs/development/changelog.en-US.md` 书写
2. **开发者视角**: 描述"对开发者的影响"，而非"具体的解决代码"
3. **双语输出**: 同时提供中文版和英文版
4. **PR 链接**: 尽量给出原始 PR 链接，社区提交的加上提交者链接
5. **版本排序**: 版本号从新到旧排列

#### 格式规范

- **版本号格式**: 使用二级标题，格式为 `## v<major>.<minor>.<patch>`，如 `## v2.30.22`
- **组件名格式**: 使用 `-` 开头的列表项，如 `- Workspace`、`- Bubble`
- **变更项格式**: 在组件名下使用缩进的列表项，每条以 Emoji 开头
- **属性名**: 使用反引号 `` ` `` 包裹，如 `` `onLoadChildren` ``
- **PR 链接格式**: `[#<pr_number>](https://github.com/ant-design/agentic-ui/pull/<pr_number>)`
- **提交者格式**: `[@<用户名>]`，如 `[@陈帅]`、`[@qixian]`
- **Commit 链接格式**: `([<commit_hash>](https://github.com/ant-design/agentic-ui/commit/<commit_hash>))`

#### Emoji 规范

| Emoji | 用途             |
| ----- | ---------------- |
| 🐞    | 修复 Bug         |
| 💄    | 样式更新         |
| 🆕    | 新增特性/属性    |
| 🌐    | 国际化改动       |
| 📖 📝 | 文档改进         |
| ✅    | 测试相关         |
| 🛠    | 重构或工具链优化 |
| ⚡️    | 性能提升         |
| 📦    | 打包/发布相关    |

#### Changelog 示例

```markdown
## v2.30.22

- Workspace
  - 📖 补充 `Workspace.FileTree` 懒加载文件树文档演示 `workspace-file-tree-demo`。
  - 🐞 `FileTree`：空目录或加载失败时不再将目录误标为叶子；`onLoadChildren` 失败时 `Promise` 正确 reject 以符合 rc-tree 重试。
  - 🛠 `FileTreeProps` 懒加载回调命名为 `onLoadChildren`，与事件回调 `on` 前缀规范一致。
  - ⚡️ 标签栏构建时预计算 Segmented 选项、首个 `Realtime` 索引，避免 O(n²) 的 `findIndex` 重复扫描。

- Bubble
  - 🆕 新增 `useOpenAIMessageBubbleData` Hook 与 `mapOpenAIMessagesToMessageBubbleData`，支持将 OpenAI Chat Completions 风格的 `messages` 转为 `MessageBubbleData[]`。
  - 🆕 新增 `useOpenClawMessageBubbleData`、`mapOpenClawMessagesToMessageBubbleData` 与 `normalizeOpenClawMessagesToOpenAI`，支持 OpenClaw 会话 / transcript 风格。
  - 🆕 新增 `useOllamaMessageBubbleData`、`mapOllamaMessagesToMessageBubbleData` 与 `normalizeOllamaMessagesToOpenAI`，支持 Ollama `/api/chat` 的 `messages`。

- MarkdownRenderer
  - 🐞 修复流式 Markdown 未传 `streamingParagraphAnimation` 时段落不应用淡入动画的问题；未传时默认开启，仅 `streamingParagraphAnimation: false` 关闭。[#478](https://github.com/antdigital-ai/agentic-ui/pull/478)

## v2.30.15

- MarkdownInputField
  - 🆕 新增 `onUploadError` 回调及 `removeFileOnUploadError` 配置，支持自定义上传失败处理逻辑。[#434](https://github.com/ant-design/agentic-ui/pull/434)
  - 🆕 支持文件大小拦截与上传错误处理。[#437](https://github.com/ant-design/agentic-ui/pull/437)
  - 🐞 统一 attachment 文件大小配置，删除 `SupportedFormat.maxSize` 字段。[#429](https://github.com/ant-design/agentic-ui/pull/429)

- 🐞 修复 `data-is-unclosed` 属性与 CSS 选择器逻辑。[#438](https://github.com/ant-design/agentic-ui/pull/438)
```

#### 书写建议

- **简洁明了**: 每条变更描述应简洁，避免冗长
- **具体明确**: 说明变更的具体内容和影响
- **组件归类**: 将变更按组件归类，便于查阅
- **PR 关联**: 尽量关联 PR 链接，便于追溯
- **提交者标注**: 社区贡献的 PR 应标注提交者

---

## Git 和 Pull Request 规范

### 分支管理

1. 从 `main` 创建新的功能分支
2. 在新分支上进行开发
3. 提交 Pull Request 到目标分支
4. 等待 Code Review 和 CI 通过
5. 合并到目标分支

### 分支命名规范

| 类型     | 格式                              | 示例                        |
| -------- | --------------------------------- | --------------------------- |
| 功能开发 | `feat/description`                | `feat/add-dark-mode`        |
| 问题修复 | `fix/issue-number-or-description` | `fix/button-style-issue`    |
| 文档更新 | `docs/what-is-changed`            | `docs/update-api-docs`      |
| 代码重构 | `refactor/what-is-changed`        | `refactor/button-component` |
| 样式修改 | `style/what-is-changed`           | `style/fix-button-padding`  |

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

- [ ] 代码通过 Lint 检查（`pnpm run lint`）
- [ ] 所有测试通过（PR 前建议 `pnpm run test:full`；日常可用 `pnpm test`）
- [ ] 类型检查通过（`pnpm tsc`）
- [ ] 代码已格式化（`pnpm run prettier`）
- [ ] 相关文档已更新
- [ ] 包含新的测试用例（如适用）

### PR 提交注意

- **标题**: 英文，简练描述变更
- **描述**: 详细说明变更目的、内容和类型
- **截图**: UI 变更需提供截图或 GIF
- **标注**: AI 辅助开发请在 PR 末尾标注 `> Submitted by Cursor`

---

## 质量保证

### 代码质量要求

- ✅ 确保代码运行正常，无控制台错误
- ✅ 适配常见浏览器
- ✅ 避免过时 API，及时更新到新推荐用法
- ✅ 测试覆盖率达到 ≥ 80%
- ✅ 通过所有 ESLint、Stylelint 和 TypeScript 检查

### 性能要求

- ✅ 避免不必要的重新渲染
- ✅ 合理使用 `React.memo`、`useMemo` 和 `useCallback`
- ✅ 样式计算应当高效，避免重复计算
- ✅ 支持 Tree Shaking

### 兼容性要求

- ✅ 支持 React 16.9+ 版本
- ✅ 兼容 Chrome 80+ 浏览器
- ✅ 保持向下兼容，避免 breaking change
- ✅ 支持 TypeScript 5.0+

---

## 工具链和环境

### 开发工具

- **编辑器**: 推荐 VS Code 或其他支持 TypeScript 的编辑器
- **代码检查**: ESLint (@umijs/lint) + Stylelint
- **格式化**: Prettier
- **类型检查**: TypeScript 5.9+ 严格模式
- **Git hooks**: Husky + lint-staged

### 构建工具

| 工具       | 用途             |
| ---------- | ---------------- |
| Father     | 组件编译（dist） |
| Dumi       | 文档站点构建     |
| Vitest     | 单元测试         |
| Playwright | E2E 测试         |

### 相关配置文件

| 配置文件               | 说明            |
| ---------------------- | --------------- |
| `package.json`         | 项目配置和脚本  |
| `tsconfig.json`        | TypeScript 配置 |
| `.eslintrc.js`         | ESLint 配置     |
| `.stylelintrc`         | Stylelint 配置  |
| `.prettierrc.js`       | Prettier 配置   |
| `vitest.config.ts`     | Vitest 配置     |
| `playwright.config.ts` | Playwright 配置 |
| `.dumirc.ts`           | Dumi 配置       |
| `.fatherrc.ts`         | Father 配置     |

---

## 常见问题和故障排查

### 开发相关问题

#### 启动开发服务器失败

```bash
# 确认 Node.js 版本
node -v  # 应该 >= 18.17

# 尝试清理并重新安装
rm -rf node_modules pnpm-lock.yaml
corepack enable
pnpm install
```

#### `pnpm i` 提示 requires at least Node.js v22.13

全局或 Corepack 误用了 **pnpm 10+**。本仓库锁定 **pnpm 9.15.9**，在 Node 18 上可用：

```bash
corepack enable
corepack prepare pnpm@9.15.9 --activate
pnpm -v   # 应为 9.15.9
pnpm install
```

#### JSON 报 `Unexpected token ﻿`（UTF-8 BOM）

部分编辑器会以「UTF-8 with BOM」保存文件。清理：

```bash
pnpm run strip:bom          # 写回移除 BOM
pnpm run strip:bom:check    # 仅检查（有 BOM 时 exit 1）
```

#### 样式不生效

- 确保 `useStyle` hook 正确调用
- 检查 `hashId` 和 `cssVarCls` 是否正确应用到类名
- 确认 `@ant-design/cssinjs` 已正确配置

#### TypeScript 类型错误

```bash
# 运行 TypeScript 类型检查
pnpm tsc
```

### 测试相关问题

#### 测试失败

```bash
# 运行特定组件的测试
pnpm test -- src/MarkdownEditor
```

#### E2E 测试问题

```bash
# 调试模式运行
pnpm run test:e2e:debug
```

### 构建相关问题

```bash
# 完整构建
pnpm run build
```

---

## 贡献与帮助

- 详细开发指南请参考 `docs/development/` 目录下的文档
- 遇到问题请查阅 GitHub Issues 或 Discussions
