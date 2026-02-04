---
nav:
  title: 项目研发
  order: 1
group:
  title: 开发指南
  order: 1
---

# 组件开发规范

> 基于 `agentic-ui` 项目的实际开发经验，定义完整的组件开发规范。

## 目录

- [命名规范](#命名规范)
- [文件组织](#文件组织)
- [样式开发](#样式开发)
- [API设计](#api设计)
- [功能开发](#功能开发)
- [测试规范](#测试规范)
- [代码质量](#代码质量)
- [开发检查列表](#开发检查列表)

## 命名规范

### 组件命名

- 使用 PascalCase
- 语义化命名，避免通用名称
- 相关组件使用统一前缀

```tsx | pure
// ✅ 正确
export const HistoryItem = () => {};
export const HistoryActionsBox = () => {};

// ❌ 错误
export const Item = () => {}; // 过于通用
export const ActionsBox = () => {}; // 可能重名
```

### 文件夹命名

- 使用 kebab-case
- 模块根目录使用 PascalCase
- 功能目录使用小写复数

```bash
src/
├── History/                    # 模块根目录
│   ├── components/             # 组件目录
│   ├── hooks/                  # Hook目录
│   ├── types/                  # 类型定义
│   ├── utils/                  # 工具函数
│   ├── __tests__/              # 测试目录
│   └── index.tsx               # 主入口
```

### className 命名

- 遵循 BEM 方法论
- Block: `.history-item`
- Element: `.history-item__title`
- Modifier: `.history-item--selected`

## 文件组织

### 标准结构

```bash
ComponentName/
├── components/          # 子组件
├── hooks/              # 自定义Hook
├── types/              # 类型定义
├── utils/              # 工具函数
├── __tests__/          # 测试文件
├── index.tsx           # 主组件
├── style.ts            # 样式文件
└── README.md           # 组件文档
```

### 文件命名

- 组件文件：`ComponentName.tsx`
- 样式文件：`style.ts`
- 测试文件：`ComponentName.test.tsx`
- 类型文件：`types.ts`

## 样式开发

### 使用 @ant-design/theme-token

```tsx | pure
import { createStyles } from '@ant-design/theme-token';

export const useStyles = createStyles(({ token }) => ({
  container: {
    display: 'flex',
    gap: token.paddingSM,
  },
  item: {
    padding: token.paddingSM,
    borderRadius: token.borderRadius,
    '&:hover': {
      backgroundColor: token.colorBgTextHover,
    },
  },
}));
```

### 使用项目自定义样式

```tsx | pure
import { useEditorStyleRegister, ChatTokenType } from '../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => ({
  [token.componentCls]: {
    width: '100%',
    '&-item': {
      display: 'flex',
      padding: token.paddingSM,
    },
  },
});

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('ComponentName', (token: ChatTokenType) => {
    const componentToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };
    return [genStyle(componentToken)];
  });
}
```

### 使用项目自定义样式系统

项目使用自定义的样式系统，基于 `useEditorStyleRegister` 和 Token 设计理念。

#### 样式文件结构

```tsx | pure
import {
  ChatTokenType,
  GenerateStyle,
  resetComponent,
  useEditorStyleRegister,
} from '../Hooks/useStyle';

const genStyle: GenerateStyle<ChatTokenType> = (token) => {
  return {
    [token.componentCls]: {
      // 根容器样式
      display: 'flex',
      flexDirection: 'column',
      padding: token.paddingSM,

      // 子元素样式
      [`${token.componentCls}-header`]: {
        fontSize: '15px',
        fontWeight: 600,
        color: '#343a45',
        marginBottom: token.marginSM,
      },

      [`${token.componentCls}-content`]: {
        padding: token.paddingXS,
        borderRadius: token.borderRadius,
      },

      // 主题变体样式
      '&-dark': {
        [`${token.componentCls}-header`]: {
          color: '#fff',
        },
        [`${token.componentCls}-content`]: {
          backgroundColor: '#1a1a1a',
        },
      },

      // 状态样式
      '&-loading': {
        opacity: 0.6,
        pointerEvents: 'none',
      },

      // 响应式样式
      '@media (max-width: 768px)': {
        [`${token.componentCls}-header`]: {
          fontSize: '14px',
        },
      },
    },
  };
};

export function useStyle(prefixCls?: string) {
  return useEditorStyleRegister('ComponentName', (token) => {
    const componentToken = {
      ...token,
      componentCls: `.${prefixCls}`,
    };
    return [resetComponent(componentToken), genStyle(componentToken)];
  });
}
```

#### 组件中使用样式

```tsx | pure
import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import React, { useContext } from 'react';
import { useStyle } from './style';

interface ComponentProps {
  className?: string;
  theme?: 'light' | 'dark';
  loading?: boolean;
  children?: React.ReactNode;
}

const Component: React.FC<ComponentProps> = ({
  className,
  theme = 'light',
  loading = false,
  children,
}) => {
  // 使用 ConfigProvider 获取统一的 prefixCls
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('component-name');

  // 注册样式并获取 wrapSSR 和 hashId
  const { wrapSSR, hashId } = useStyle(prefixCls);

  return wrapSSR(
    <div
      className={classNames(
        prefixCls,
        `${prefixCls}-${theme}`,
        {
          [`${prefixCls}-loading`]: loading,
        },
        hashId,
        className,
      )}
    >
      <div className={classNames(`${prefixCls}-header`, hashId)}>组件标题</div>
      <div className={classNames(`${prefixCls}-content`, hashId)}>
        {children}
      </div>
    </div>,
  );
};
```

#### 样式系统核心概念

##### Token 系统

- `token.paddingSM`、`token.marginSM` 等设计变量
- `token.borderRadius`、`token.colorBgTextHover` 等主题变量
- `token.componentCls` 组件类名前缀

##### 选择器命名规范

- 根选择器：`[token.componentCls]`
- 子元素：`[${token.componentCls}-element]`
- 状态修饰符：`&-state`（如 `&-dark`、`&-loading`）
- 伪类：`&:hover`、`&:focus` 等

##### 样式组织

- 根容器样式在最外层
- 子元素样式使用模板字符串
- 主题变体使用 `&-theme` 格式
- 响应式样式使用标准媒体查询

##### 类名管理

- 使用 `classNames` 工具函数组合类名
- `prefixCls` 作为基础前缀
- `hashId` 确保样式隔离
- 条件类名使用对象语法

```tsx | pure
const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
const prefixCls = getPrefixCls('component-name');
const { wrapSSR, hashId } = useStyle(prefixCls);

return wrapSSR(
  <div
    className={classNames(
      prefixCls,
      `${prefixCls}-${theme}`,
      hashId,
      className,
    )}
  >
    <div className={classNames(`${prefixCls}-header`, hashId)}>标题内容</div>
  </div>,
);
```

#### 3. 样式开发检查列表

- [ ] 正确定义 `GenerateStyle` 函数
- [ ] 使用 `ConfigProvider.ConfigContext` 获取 `prefixCls`
- [ ] 使用 `classNames` 工具函数管理类名
- [ ] 添加 `wrapSSR` 包装组件
- [ ] 验证主题切换功能正常
- [ ] 验证响应式样式工作正常
- [ ] 检查编译错误并修复

## API设计

### Props 命名规范

```tsx | pure
interface ComponentProps {
  // 数据属性
  data: DataType;
  selectedIds: string[];

  // 事件回调 - 使用on前缀
  onSelect: (id: string) => void;
  onDelete?: (id: string) => Promise<void>;

  // 配置属性 - 使用Config后缀
  config?: ComponentConfig;

  // 样式属性
  className?: string;
  style?: React.CSSProperties;
}
```

### 事件回调命名

```tsx | pure
// 标准事件
onClick: (event: React.MouseEvent) => void;
onChange: (value: string) => void;

// 自定义事件
onSelectionChange: (selectedIds: string[]) => void;
onLoadMore: () => Promise<void>;
```

## 功能开发

### 组件开发流程

```tsx | pure
// 1. 定义类型
interface ComponentProps {
  // 类型定义
}

// 2. 编写JSDoc
/**
 * ComponentName 组件
 * @param {ComponentProps} props - 组件属性
 * @returns {React.ReactElement} 组件
 */

// 3. 实现组件
export const ComponentName: React.FC<ComponentProps> = (props) => {
  const [state, setState] = useState(initialState);

  const handleEvent = useCallback(() => {
    // 事件处理
  }, [dependencies]);

  return <div>{/* 组件内容 */}</div>;
};
```

### Hook 开发规范

```tsx | pure
export const useComponent = (props: ComponentProps) => {
  // 状态定义
  const [state, setState] = useState(initialState);

  // 数据获取
  const { data, loading } = useQuery({
    queryKey: ['key'],
    queryFn: () => props.request(),
  });

  // 事件处理
  const handleEvent = useCallback(() => {
    // 处理逻辑
  }, [dependencies]);

  // 返回值
  return {
    state,
    data,
    loading,
    handleEvent,
  };
};
```

## 测试规范

### 测试文件结构

```tsx | pure
// ComponentName.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from '../index';

describe('ComponentName', () => {
  const mockProps = {
    // 测试数据
  };

  describe('渲染测试', () => {
    it('应该正确渲染', () => {
      render(<ComponentName {...mockProps} />);
      expect(screen.getByTestId('component')).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该处理点击事件', () => {
      const onSelect = jest.fn();
      render(<ComponentName {...mockProps} onSelect={onSelect} />);

      fireEvent.click(screen.getByTestId('button'));
      expect(onSelect).toHaveBeenCalled();
    });
  });
});
```

### 测试覆盖率要求

- 分支覆盖率：≥ 80%
- 函数覆盖率：≥ 80%
- 行覆盖率：≥ 80%

## 代码质量

### TypeScript 规范

- 提供完整的类型定义
- 避免使用 `any` 类型
- 使用接口定义数据结构
- 提供泛型支持

### 性能优化

```tsx | pure
// 使用 React.memo
export const Component = React.memo<ComponentProps>((props) => {
  // 组件实现
});

// 使用 useCallback
const handleEvent = useCallback(() => {
  // 事件处理
}, [dependencies]);

// 使用 useMemo
const expensiveValue = useMemo(() => {
  return computeValue(data);
}, [data]);
```

### 错误处理

```tsx | pure
// 异步操作错误处理
const handleAsync = async () => {
  try {
    setLoading(true);
    await asyncOperation();
  } catch (error) {
    console.error('操作失败:', error);
    message.error('操作失败');
  } finally {
    setLoading(false);
  }
};
```

## Demo 开发规范

### Demo 文件组织

```bash
docs/demos/
├── component-name/
│   ├── basic.tsx              # 基础用法
│   ├── advanced.tsx           # 高级用法
│   └── custom.tsx             # 自定义用法
```

### Demo 内容要求

- 完整的组件代码
- 清晰的交互示例
- 详细的API说明
- 使用 `@ant-design/agentic-ui` 组件

## 开发检查列表

### ✅ 命名规范检查

- [ ] 组件使用 PascalCase 命名
- [ ] 组件名称语义化，避免通用名称
- [ ] 相关组件使用统一前缀
- [ ] 文件夹使用 kebab-case 命名
- [ ] className 遵循 BEM 规范

### ✅ 文件组织检查

- [ ] 创建标准的文件夹结构
- [ ] 组件文件命名为 `ComponentName.tsx`
- [ ] 样式文件命名为 `style.ts`
- [ ] 测试文件命名为 `ComponentName.test.tsx`
- [ ] 类型文件命名为 `types.ts`

### ✅ 样式开发检查

- [ ] 使用 `@ant-design/theme-token` 或项目自定义样式
- [ ] 样式函数使用 `GenerateStyle` 类型
- [ ] 使用 `useEditorStyleRegister` 注册样式
- [ ] 样式变量使用 token 系统
- [ ] 支持主题切换和响应式设计

#### ✅ .less 到 style.ts 迁移检查

- [ ] 创建对应的 `style.ts` 文件
- [ ] 将 Less 样式转换为 CSS-in-JS 格式
- [ ] 更新组件中的样式引用（移除 `.less` 引用）
- [ ] 使用 `ConfigProvider.ConfigContext` 获取 `prefixCls`
- [ ] 使用 `classNames` 工具函数管理类名
- [ ] 添加 `wrapSSR` 包装组件
- [ ] 确保主题切换功能正常（`&-dark` 格式）
- [ ] 验证响应式样式工作正常
- [ ] 删除原有的 `.less` 文件
- [ ] 检查编译错误并修复
- [ ] 样式选择器使用正确格式（`${token.componentCls}-element`）
- [ ] 媒体查询放在根级别而不是嵌套在选择器内

### ✅ API设计检查

- [ ] Props 接口定义完整
- [ ] 事件回调使用 `on` 前缀
- [ ] 配置对象使用 `Config` 后缀
- [ ] 所有属性都有类型定义
- [ ] 可选属性使用 `?` 标记

### ✅ 功能开发检查

- [ ] 组件有完整的 JSDoc 注释
- [ ] 使用 `React.FC` 定义组件类型
- [ ] 状态管理使用 `useState`
- [ ] 事件处理使用 `useCallback`
- [ ] 数据获取使用 `useQuery` 或类似方案

### ✅ Hook开发检查

- [ ] Hook 使用 `use` 前缀命名
- [ ] 返回组件需要的所有状态和方法
- [ ] 使用 `useCallback` 优化事件处理
- [ ] 使用 `useMemo` 优化计算
- [ ] 提供完整的类型定义

### ✅ 测试规范检查

- [ ] 创建测试文件 `ComponentName.test.tsx`
- [ ] 测试文件放在 `__tests__` 目录
- [ ] 包含渲染测试和交互测试
- [ ] 使用 `@testing-library/react` 进行测试
- [ ] 测试覆盖率达到 80% 以上

### ✅ 代码质量检查

- [ ] 所有代码都有 TypeScript 类型
- [ ] 避免使用 `any` 类型
- [ ] 使用 `React.memo` 优化渲染
- [ ] 实现错误边界和异常处理
- [ ] 代码通过 ESLint 检查

### ✅ Demo开发检查

- [ ] Demo 文件放在 `docs/demos` 目录
- [ ] Demo 文件名以 `demo-` 开头
- [ ] 包含完整的组件使用示例
- [ ] 使用 `@ant-design/agentic-ui` 组件
- [ ] 提供详细的 API 说明

### ✅ 文档检查

- [ ] 组件有 README.md 文档
- [ ] API 文档完整且准确
- [ ] 提供使用示例
- [ ] 说明组件的功能和限制
- [ ] 文档通过拼写检查

### ✅ 最终检查

- [ ] 所有检查项都已完成
- [ ] 代码可以正常运行
- [ ] 测试全部通过
- [ ] 文档完整准确
- [ ] 提交代码前进行最终审查

---

**注意**：完成所有检查项后，组件开发才算完成。如有特殊情况，请在团队中讨论后决定。
