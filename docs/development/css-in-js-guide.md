---
nav:
  title: 项目研发
  order: 3
group:
  title: 开发指南
  order: 6
---

# CSS-in-JS 方案指南

> **方案简介**：`agentic-ui` 项目采用 `@ant-design/cssinjs` 作为 CSS-in-JS 解决方案，提供类型安全、主题定制、动态样式等现代化样式管理能力。

<!--
  CSS-in-JS方案说明：
  - 基于@ant-design/cssinjs实现
  - 提供完整的类型安全
  - 支持主题定制和动态样式
  - 与Ant Design生态深度集成
  - 提供优秀的开发体验
-->

## 目录

- [方案概述](#方案概述)
- [@ant-design/cssinjs 介绍](#ant-designcssinjs-介绍)
- [基础用法](#基础用法)
- [高级特性](#高级特性)
- [最佳实践](#最佳实践)
- [性能优化](#性能优化)
- [常见问题](#常见问题)

## 方案概述

<!--
  方案概述说明：
  - 为什么选择CSS-in-JS
  - 与Ant Design的集成优势
  - 项目中的具体应用场景
  - 技术选型的考虑因素
-->

### 为什么选择 CSS-in-JS

| 优势         | 说明                                | 项目中的应用                   |
| ------------ | ----------------------------------- | ------------------------------ |
| **类型安全** | TypeScript 支持，编译时检查样式属性 | 避免样式拼写错误，提高开发效率 |
| **主题定制** | 动态主题切换，支持暗色模式          | 编辑器主题、组件主题统一管理   |
| **组件封装** | 样式与组件逻辑紧密绑定              | 组件样式隔离，避免全局污染     |
| **动态样式** | 基于 props 和状态动态生成样式       | 响应式设计，交互状态样式       |
| **开发体验** | 热重载、智能提示、调试工具          | 提升开发效率，减少调试时间     |

### 技术选型对比

| 方案                    | 优点                                     | 缺点                       | 适用场景           |
| ----------------------- | ---------------------------------------- | -------------------------- | ------------------ |
| **@ant-design/cssinjs** | 与Ant Design深度集成、类型安全、主题支持 | 学习成本、包体积           | 企业级应用、组件库 |
| **styled-components**   | 生态成熟、语法简洁                       | 类型支持有限、主题集成复杂 | 通用项目           |
| **emotion**             | 性能优秀、功能丰富                       | 配置复杂、学习曲线陡峭     | 高性能应用         |
| **CSS Modules**         | 简单易用、零配置                         | 功能有限、动态样式困难     | 简单项目           |

### 项目中的应用场景

```tsx | pure
// 1. 组件样式定义
const useStyles = createStyles({
  container: {
    padding: '16px',
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadius,
  },
  button: {
    marginLeft: '8px',
    '&:hover': {
      backgroundColor: token.colorPrimaryHover,
    },
  },
});

// 2. 主题定制
const useThemeStyles = createStyles(({ token, css }) => ({
  editor: {
    border: `1px solid ${token.colorBorder}`,
    backgroundColor: token.colorBgContainer,
    color: token.colorText,
  },
}));

// 3. 响应式设计
const useResponsiveStyles = createStyles(({ token, css }) => ({
  layout: {
    display: 'flex',
    [css.mediaQuery('md')]: {
      flexDirection: 'column',
    },
  },
}));
```

## @ant-design/cssinjs 介绍

<!--
  @ant-design/cssinjs介绍说明：
  - 核心特性和优势
  - 与Ant Design的集成
  - 项目中的具体使用方式
  - 配置和定制方法
-->

### 核心特性

#### 1. 类型安全

```tsx | pure
import { createStyles } from '@ant-design/cssinjs';

// 完整的TypeScript支持
const useStyles = createStyles(({ token, css }) => ({
  container: {
    // 智能提示和类型检查
    padding: token.padding, // ✅ 正确
    backgroundColor: token.colorBgContainer, // ✅ 正确
    // padding: 'invalid-value', // ❌ 类型错误
  },
}));
```

#### 2. 主题集成

```tsx | pure
// 自动获取Ant Design主题token
const useStyles = createStyles(({ token }) => ({
  button: {
    backgroundColor: token.colorPrimary,
    color: token.colorTextLightSolid,
    borderColor: token.colorPrimary,
    '&:hover': {
      backgroundColor: token.colorPrimaryHover,
      borderColor: token.colorPrimaryHover,
    },
    '&:active': {
      backgroundColor: token.colorPrimaryActive,
      borderColor: token.colorPrimaryActive,
    },
  },
}));
```

#### 3. 动态样式

```tsx | pure
// 基于props和状态生成样式
const useStyles = createStyles(({ token, css }) => ({
  card: ({
    isActive,
    size,
  }: {
    isActive: boolean;
    size: 'small' | 'large';
  }) => ({
    border: `1px solid ${isActive ? token.colorPrimary : token.colorBorder}`,
    padding: size === 'large' ? '24px' : '16px',
    backgroundColor: isActive ? token.colorPrimaryBg : token.colorBgContainer,
  }),
}));
```

### 与 Ant Design 集成

```tsx | pure
// 1. 使用Ant Design的token系统
const useStyles = createStyles(({ token }) => ({
  // 颜色系统
  primary: { color: token.colorPrimary },
  success: { color: token.colorSuccess },
  warning: { color: token.colorWarning },
  error: { color: token.colorError },

  // 间距系统
  spacing: {
    margin: token.margin,
    padding: token.padding,
    gap: token.marginXS,
  },

  // 字体系统
  typography: {
    fontSize: token.fontSize,
    fontWeight: token.fontWeightStrong,
    lineHeight: token.lineHeight,
  },

  // 圆角系统
  borderRadius: {
    borderRadius: token.borderRadius,
    borderTopLeftRadius: token.borderRadiusLG,
  },
}));
```

## 基础用法

<!--
  基础用法说明：
  - 创建样式的基本方法
  - 在组件中使用样式
  - 常见的样式模式
  - 错误处理和调试
-->

### 创建样式

#### 1. 基本样式定义

```tsx | pure
import { createStyles } from '@ant-design/cssinjs';

const useStyles = createStyles({
  // 静态样式
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    backgroundColor: '#fff',
    border: '1px solid #d9d9d9',
    borderRadius: '6px',
  },

  // 嵌套样式
  header: {
    display: 'flex',
    alignItems: 'center',

    '.title': {
      fontSize: '16px',
      fontWeight: 'bold',
      marginRight: '8px',
    },

    '.subtitle': {
      fontSize: '13px',
      color: '#666',
    },
  },
});
```

#### 2. 使用主题token

```tsx | pure
const useStyles = createStyles(({ token }) => ({
  card: {
    backgroundColor: token.colorBgContainer,
    border: `1px solid ${token.colorBorder}`,
    borderRadius: token.borderRadius,
    boxShadow: token.boxShadow,

    '&:hover': {
      boxShadow: token.boxShadowSecondary,
    },
  },

  button: {
    backgroundColor: token.colorPrimary,
    color: token.colorTextLightSolid,
    border: `1px solid ${token.colorPrimary}`,
    borderRadius: token.borderRadius,
    padding: `${token.paddingXS}px ${token.padding}px`,

    '&:hover': {
      backgroundColor: token.colorPrimaryHover,
      borderColor: token.colorPrimaryHover,
    },

    '&:active': {
      backgroundColor: token.colorPrimaryActive,
      borderColor: token.colorPrimaryActive,
    },
  },
}));
```

#### 3. 动态样式

```tsx | pure
const useStyles = createStyles(({ token, css }) => ({
  // 基于props的样式
  item: ({ active, disabled }: { active: boolean; disabled: boolean }) => ({
    padding: '12px 16px',
    backgroundColor: active ? token.colorPrimaryBg : token.colorBgContainer,
    color: disabled ? token.colorTextDisabled : token.colorText,
    cursor: disabled ? 'not-allowed' : 'pointer',
    borderBottom: `1px solid ${token.colorBorderSecondary}`,

    '&:hover': !disabled && {
      backgroundColor: active
        ? token.colorPrimaryBgHover
        : token.colorBgTextHover,
    },
  }),

  // 基于状态的样式
  status: ({ status }: { status: 'success' | 'error' | 'warning' }) => ({
    padding: '4px 8px',
    borderRadius: token.borderRadiusSM,
    fontSize: token.fontSizeSM,

    ...(status === 'success' && {
      backgroundColor: token.colorSuccessBg,
      color: token.colorSuccess,
      border: `1px solid ${token.colorSuccessBorder}`,
    }),

    ...(status === 'error' && {
      backgroundColor: token.colorErrorBg,
      color: token.colorError,
      border: `1px solid ${token.colorErrorBorder}`,
    }),

    ...(status === 'warning' && {
      backgroundColor: token.colorWarningBg,
      color: token.colorWarning,
      border: `1px solid ${token.colorWarningBorder}`,
    }),
  }),
}));
```

### 在组件中使用

#### 1. 基本使用

```tsx | pure
import React from 'react';
import { createStyles } from '@ant-design/cssinjs';

const useStyles = createStyles(({ token }) => ({
  container: {
    padding: token.padding,
    backgroundColor: token.colorBgContainer,
  },
  title: {
    fontSize: token.fontSizeLG,
    fontWeight: token.fontWeightStrong,
    marginBottom: token.margin,
  },
}));

const MyComponent: React.FC = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>标题</h1>
      <p>内容</p>
    </div>
  );
};

export default MyComponent;
```

#### 2. 动态样式使用

```tsx | pure
import React, { useState } from 'react';
import { createStyles } from '@ant-design/cssinjs';

const useStyles = createStyles(({ token }) => ({
  button: ({
    primary,
    size,
  }: {
    primary: boolean;
    size: 'small' | 'large';
  }) => ({
    backgroundColor: primary ? token.colorPrimary : token.colorBgContainer,
    color: primary ? token.colorTextLightSolid : token.colorText,
    border: `1px solid ${primary ? token.colorPrimary : token.colorBorder}`,
    borderRadius: token.borderRadius,
    padding: size === 'large' ? '12px 24px' : '8px 16px',
    fontSize: size === 'large' ? token.fontSizeLG : token.fontSize,
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: primary
        ? token.colorPrimaryHover
        : token.colorBgTextHover,
      borderColor: primary ? token.colorPrimaryHover : token.colorBorder,
    },
  }),
}));

const DynamicButton: React.FC<{
  primary?: boolean;
  size?: 'small' | 'large';
  children: React.ReactNode;
}> = ({ primary = false, size = 'small', children }) => {
  const { styles } = useStyles({ primary, size });

  return <button className={styles.button}>{children}</button>;
};

export default DynamicButton;
```

#### 3. 组合样式

```tsx | pure
import React from 'react';
import { createStyles } from '@ant-design/cssinjs';
import { cx } from '@ant-design/cssinjs';

const useStyles = createStyles(({ token }) => ({
  base: {
    padding: token.padding,
    border: `1px solid ${token.colorBorder}`,
    borderRadius: token.borderRadius,
  },
  primary: {
    backgroundColor: token.colorPrimary,
    color: token.colorTextLightSolid,
    borderColor: token.colorPrimary,
  },
  secondary: {
    backgroundColor: token.colorBgContainer,
    color: token.colorText,
    borderColor: token.colorBorder,
  },
  large: {
    padding: token.paddingLG,
    fontSize: token.fontSizeLG,
  },
  small: {
    padding: token.paddingXS,
    fontSize: token.fontSizeSM,
  },
}));

const Button: React.FC<{
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'large';
  className?: string;
  children: React.ReactNode;
}> = ({ variant = 'secondary', size = 'small', className, children }) => {
  const { styles } = useStyles();

  return (
    <button
      className={cx(styles.base, styles[variant], styles[size], className)}
    >
      {children}
    </button>
  );
};

export default Button;
```

## 高级特性

<!--
  高级特性说明：
  - 响应式设计
  - 动画和过渡
  - 全局样式
  - 主题切换
  - 性能优化
-->

### 响应式设计

```tsx | pure
import { createStyles } from '@ant-design/cssinjs';

const useStyles = createStyles(({ token, css }) => ({
  layout: {
    display: 'flex',
    flexDirection: 'row',
    gap: token.margin,

    // 移动端适配
    [css.mediaQuery('sm')]: {
      flexDirection: 'column',
      gap: token.marginXS,
    },

    // 平板适配
    [css.mediaQuery('md')]: {
      flexDirection: 'row',
      gap: token.marginSM,
    },

    // 桌面端适配
    [css.mediaQuery('lg')]: {
      flexDirection: 'row',
      gap: token.margin,
    },
  },

  sidebar: {
    width: '200px',
    backgroundColor: token.colorBgContainer,
    borderRight: `1px solid ${token.colorBorder}`,

    [css.mediaQuery('sm')]: {
      width: '100%',
      borderRight: 'none',
      borderBottom: `1px solid ${token.colorBorder}`,
    },
  },

  content: {
    flex: 1,
    padding: token.padding,

    [css.mediaQuery('sm')]: {
      padding: token.paddingXS,
    },
  },
}));
```

### 动画和过渡

```tsx | pure
import { createStyles } from '@ant-design/cssinjs';

const useStyles = createStyles(({ token, css }) => ({
  // 基础动画
  fadeIn: css`
    animation: fadeIn 0.3s ease-in-out;

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,

  // 悬停动画
  card: {
    backgroundColor: token.colorBgContainer,
    border: `1px solid ${token.colorBorder}`,
    borderRadius: token.borderRadius,
    padding: token.padding,
    transition: 'all 0.2s ease-in-out',

    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: token.boxShadowSecondary,
      borderColor: token.colorPrimary,
    },
  },

  // 加载动画
  loading: css`
    animation: spin 1s linear infinite;

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `,

  // 滑动动画
  slideIn: ({
    direction,
  }: {
    direction: 'left' | 'right' | 'up' | 'down';
  }) => css`
    animation: slideIn 0.3s ease-out;

    @keyframes slideIn {
      from {
        transform: ${direction === 'left'
          ? 'translateX(-100%)'
          : direction === 'right'
            ? 'translateX(100%)'
            : direction === 'up'
              ? 'translateY(-100%)'
              : 'translateY(100%)'};
        opacity: 0;
      }
      to {
        transform: translate(0, 0);
        opacity: 1;
      }
    }
  `,
}));
```

### 全局样式

```tsx | pure
import { createGlobalStyle } from '@ant-design/cssinjs';

// 全局样式定义
const GlobalStyle = createGlobalStyle(({ token }) => ({
  // 重置样式
  '*': {
    boxSizing: 'border-box',
  },

  body: {
    margin: 0,
    padding: 0,
    fontFamily: token.fontFamily,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    color: token.colorText,
    backgroundColor: token.colorBgContainer,
  },

  // 滚动条样式
  '::-webkit-scrollbar': {
    width: '6px',
    height: '6px',
  },

  '::-webkit-scrollbar-track': {
    backgroundColor: token.colorBgContainer,
  },

  '::-webkit-scrollbar-thumb': {
    backgroundColor: token.colorBorder,
    borderRadius: '3px',

    '&:hover': {
      backgroundColor: token.colorBorderSecondary,
    },
  },

  // 链接样式
  a: {
    color: token.colorPrimary,
    textDecoration: 'none',

    '&:hover': {
      color: token.colorPrimaryHover,
      textDecoration: 'underline',
    },
  },

  // 代码样式
  code: {
    backgroundColor: token.colorBgTextHover,
    padding: '2px 4px',
    borderRadius: token.borderRadiusSM,
    fontSize: token.fontSizeSM,
    fontFamily: token.fontFamilyCode,
  },

  pre: {
    backgroundColor: token.colorBgTextHover,
    padding: token.padding,
    borderRadius: token.borderRadius,
    overflow: 'auto',

    code: {
      backgroundColor: 'transparent',
      padding: 0,
    },
  },
}));

// 在应用根组件中使用
const App: React.FC = () => {
  return (
    <>
      <GlobalStyle />
      {/* 其他组件 */}
    </>
  );
};
```

### 主题切换

```tsx | pure
import React, { useState } from 'react';
import { createStyles, ThemeProvider } from '@ant-design/cssinjs';
import { theme } from 'antd';

const useStyles = createStyles(({ token }) => ({
  container: {
    backgroundColor: token.colorBgContainer,
    color: token.colorText,
    minHeight: '100vh',
    transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
  },

  header: {
    backgroundColor: token.colorBgElevated,
    borderBottom: `1px solid ${token.colorBorder}`,
    padding: token.padding,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  toggleButton: {
    backgroundColor: token.colorPrimary,
    color: token.colorTextLightSolid,
    border: 'none',
    borderRadius: token.borderRadius,
    padding: `${token.paddingXS}px ${token.padding}px`,
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: token.colorPrimaryHover,
    },
  },
}));

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const { styles } = useStyles();

  const { defaultAlgorithm, darkAlgorithm } = theme;

  return (
    <ThemeProvider
      theme={{
        algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>主题切换示例</h1>
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setIsDark(!isDark)}
          >
            {isDark ? '切换到亮色' : '切换到暗色'}
          </button>
        </header>
        <main>
          <p>这是一个主题切换的示例，点击按钮可以切换明暗主题。</p>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default ThemeToggle;
```

## 最佳实践

<!--
  最佳实践说明：
  - 样式组织原则
  - 命名规范
  - 性能优化
  - 可维护性
  - 团队协作
-->

### 样式组织原则

#### 1. 组件样式结构

```tsx | pure
// 推荐的样式文件结构
const useStyles = createStyles(({ token, css }) => ({
  // 1. 容器样式
  container: {
    // 布局相关
    display: 'flex',
    flexDirection: 'column',
    gap: token.margin,

    // 尺寸相关
    width: '100%',
    minHeight: '200px',

    // 外观相关
    backgroundColor: token.colorBgContainer,
    border: `1px solid ${token.colorBorder}`,
    borderRadius: token.borderRadius,
  },

  // 2. 子元素样式
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: token.padding,
    borderBottom: `1px solid ${token.colorBorderSecondary}`,
  },

  content: {
    flex: 1,
    padding: token.padding,
    overflow: 'auto',
  },

  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: token.marginXS,
    padding: token.padding,
    borderTop: `1px solid ${token.colorBorderSecondary}`,
  },

  // 3. 状态样式
  loading: {
    opacity: 0.6,
    pointerEvents: 'none',
  },

  error: {
    borderColor: token.colorError,
    backgroundColor: token.colorErrorBg,
  },

  // 4. 响应式样式
  [css.mediaQuery('sm')]: {
    container: {
      minHeight: '150px',
    },
  },
}));
```

#### 2. 样式复用

```tsx | pure
// 创建可复用的样式组合
const useCommonStyles = createStyles(({ token }) => ({
  // 基础按钮样式
  button: {
    padding: `${token.paddingXS}px ${token.padding}px`,
    borderRadius: token.borderRadius,
    border: `1px solid ${token.colorBorder}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',

    '&:hover': {
      borderColor: token.colorPrimary,
    },

    '&:active': {
      transform: 'scale(0.98)',
    },
  },

  // 主要按钮
  buttonPrimary: {
    backgroundColor: token.colorPrimary,
    color: token.colorTextLightSolid,
    borderColor: token.colorPrimary,

    '&:hover': {
      backgroundColor: token.colorPrimaryHover,
      borderColor: token.colorPrimaryHover,
    },
  },

  // 次要按钮
  buttonSecondary: {
    backgroundColor: token.colorBgContainer,
    color: token.colorText,

    '&:hover': {
      backgroundColor: token.colorBgTextHover,
    },
  },

  // 危险按钮
  buttonDanger: {
    backgroundColor: token.colorError,
    color: token.colorTextLightSolid,
    borderColor: token.colorError,

    '&:hover': {
      backgroundColor: token.colorErrorHover,
      borderColor: token.colorErrorHover,
    },
  },
}));

// 在组件中使用
const Button: React.FC<{
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}> = ({ variant = 'secondary', children }) => {
  const { styles } = useCommonStyles();

  return (
    <button
      className={cx(
        styles.button,
        styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
      )}
    >
      {children}
    </button>
  );
};
```

### 命名规范

#### 1. 样式类名命名

```tsx | pure
const useStyles = createStyles(({ token }) => ({
  // 使用BEM命名法
  card: {
    // 基础样式
  },

  // 元素
  card__header: {
    // 头部样式
  },

  card__content: {
    // 内容样式
  },

  card__footer: {
    // 底部样式
  },

  // 修饰符
  card--primary: {
    // 主要样式变体
  },

  card--large: {
    // 大尺寸变体
  },

  card--loading: {
    // 加载状态
  },
}));
```

#### 2. 变量命名

```tsx | pure
const useStyles = createStyles(({ token }) => ({
  // 使用语义化命名
  primaryButton: {
    backgroundColor: token.colorPrimary,
  },

  // 避免使用具体数值
  spacingLarge: {
    padding: token.paddingLG,
  },

  // 使用状态描述
  isActive: {
    backgroundColor: token.colorPrimaryBg,
  },

  isDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}));
```

### 性能优化

#### 1. 样式缓存

```tsx | pure
// 使用useMemo缓存样式计算
const useStyles = createStyles(({ token, css }) => ({
  // 静态样式直接定义
  container: {
    padding: token.padding,
    backgroundColor: token.colorBgContainer,
  },

  // 动态样式使用函数
  item: ({ index, total }: { index: number; total: number }) => ({
    marginBottom: index === total - 1 ? 0 : token.marginXS,
    borderBottom:
      index === total - 1 ? 'none' : `1px solid ${token.colorBorder}`,
  }),
}));

const List: React.FC<{ items: string[] }> = ({ items }) => {
  const { styles } = useStyles();

  return (
    <div className={styles.container}>
      {items.map((item, index) => (
        <div
          key={index}
          className={styles.item({ index, total: items.length })}
        >
          {item}
        </div>
      ))}
    </div>
  );
};
```

#### 2. 条件样式优化

```tsx | pure
// 避免在渲染时计算样式
const useStyles = createStyles(({ token }) => ({
  // 预定义所有状态样式
  button: {
    padding: `${token.paddingXS}px ${token.padding}px`,
    borderRadius: token.borderRadius,
    border: `1px solid ${token.colorBorder}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
  },

  buttonPrimary: {
    backgroundColor: token.colorPrimary,
    color: token.colorTextLightSolid,
    borderColor: token.colorPrimary,
  },

  buttonSecondary: {
    backgroundColor: token.colorBgContainer,
    color: token.colorText,
  },

  buttonDanger: {
    backgroundColor: token.colorError,
    color: token.colorTextLightSolid,
    borderColor: token.colorError,
  },

  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}));

// 使用cx组合样式
const Button: React.FC<{
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ variant = 'secondary', disabled = false, children }) => {
  const { styles } = useStyles();

  return (
    <button
      className={cx(
        styles.button,
        styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
        disabled && styles.buttonDisabled,
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

## 性能优化

<!--
  性能优化说明：
  - 样式计算优化
  - 渲染性能优化
  - 包体积优化
  - 运行时优化
-->

### 样式计算优化

```tsx | pure
// 1. 使用静态样式
const useStyles = createStyles(({ token }) => ({
  // 静态样式，编译时确定
  static: {
    padding: token.padding,
    margin: token.margin,
    backgroundColor: token.colorBgContainer,
  },
}));

// 2. 避免动态计算
// ❌ 不推荐
const useStyles = createStyles(({ token }) => ({
  dynamic: ({ size }: { size: number }) => ({
    padding: `${size}px`, // 每次都会重新计算
  }),
}));

// ✅ 推荐
const useStyles = createStyles(({ token }) => ({
  small: { padding: token.paddingXS },
  medium: { padding: token.padding },
  large: { padding: token.paddingLG },
}));
```

### 渲染性能优化

```tsx | pure
// 1. 使用React.memo避免不必要的重新渲染
const StyledComponent = React.memo<{ active: boolean }>(({ active }) => {
  const { styles } = useStyles();

  return (
    <div className={cx(styles.container, active && styles.active)}>内容</div>
  );
});

// 2. 使用useCallback缓存事件处理器
const Button = React.memo<{ onClick: () => void }>(({ onClick }) => {
  const { styles } = useStyles();

  return (
    <button className={styles.button} onClick={onClick}>
      点击
    </button>
  );
});

const ParentComponent: React.FC = () => {
  const handleClick = useCallback(() => {
    console.log('按钮被点击');
  }, []);

  return <Button onClick={handleClick} />;
};
```

### 包体积优化

```tsx | pure
// 1. 按需导入
import { createStyles } from '@ant-design/cssinjs';
// 而不是
// import * as antdStyle from '@ant-design/cssinjs';

// 2. 避免重复的样式定义
// 创建共享样式文件
// shared/styles.ts
export const useSharedStyles = createStyles(({ token }) => ({
  // 共享样式
  button: {
    padding: `${token.paddingXS}px ${token.padding}px`,
    borderRadius: token.borderRadius,
    border: `1px solid ${token.colorBorder}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
  },

  card: {
    backgroundColor: token.colorBgContainer,
    border: `1px solid ${token.colorBorder}`,
    borderRadius: token.borderRadius,
    padding: token.padding,
    boxShadow: token.boxShadow,
  },
}));

// 在组件中使用
import { useSharedStyles } from '../shared/styles';

// 3. 树摇优化
// 确保未使用的样式能被打包工具移除
export const useOptimizedStyles = createStyles(({ token }) => ({
  // 只定义实际使用的样式
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

// 4. 样式合并优化
const useStyles = createStyles(({ token }) => ({
  // 合并相关样式，减少CSS规则数量
  layout: {
    display: 'flex',
    flexDirection: 'column',
    gap: token.margin,
    padding: token.padding,
    backgroundColor: token.colorBgContainer,
    border: `1px solid ${token.colorBorder}`,
    borderRadius: token.borderRadius,
  },
}));
```

## 常见问题

<!--
  常见问题说明：
  - 样式冲突解决
  - 调试技巧
  - 兼容性问题
  - 性能问题排查
-->

### 样式冲突解决

```tsx | pure
// 1. 使用CSS Modules避免冲突
const useStyles = createStyles(({ token, css }) => ({
  // 自动生成唯一类名
  button: css`
    padding: ${token.padding}px;
    background-color: ${token.colorPrimary};
  `,
}));

// 2. 使用更具体的选择器
const useStyles = createStyles(({ token }) => ({
  container: {
    // 使用更具体的选择器
    '& .ant-button': {
      marginRight: token.marginXS,
    },

    '& .ant-input': {
      borderColor: token.colorPrimary,
    },
  },
}));
```

### 调试技巧

```tsx | pure
// 1. 使用开发工具调试
const useStyles = createStyles(({ token }) => ({
  debug: {
    // 添加调试边框
    border: '2px solid red',
    outline: '1px solid blue',

    // 添加调试信息
    '&::before': {
      content: '"DEBUG"',
      position: 'absolute',
      top: '-20px',
      left: '0',
      fontSize: '12px',
      color: 'red',
    },
  },
}));

// 2. 使用CSS变量调试
const useStyles = createStyles(({ token }) => ({
  debug: {
    // 使用CSS变量便于调试
    '--debug-color': 'red',
    '--debug-border': '2px solid var(--debug-color)',
    border: 'var(--debug-border)',
  },
}));
```

### 兼容性问题

```tsx | pure
// 1. 浏览器兼容性处理
const useStyles = createStyles(({ token, css }) => ({
  flexbox: {
    display: 'flex',
    // 添加浏览器前缀
    display: css`
      display: -webkit-flex;
      display: -ms-flexbox;
      display: flex;
    `,
  },

  // 2. 降级处理
  gradient: {
    backgroundColor: token.colorPrimary, // 降级背景色
    background: css`
      background: linear-gradient(
        45deg,
        ${token.colorPrimary},
        ${token.colorPrimaryHover}
      );
      background: -webkit-linear-gradient(
        45deg,
        ${token.colorPrimary},
        ${token.colorPrimaryHover}
      );
    `,
  },
}));
```

### 性能问题排查

```tsx | pure
// 1. 性能监控
const useStyles = createStyles(({ token }) => ({
  // 添加性能监控
  monitored: {
    // 使用CSS变量监控重绘
    '--render-count': '0',

    '&:hover': {
      '--render-count': 'calc(var(--render-count) + 1)',
    },
  },
}));

// 2. 样式计算优化
const useStyles = createStyles(({ token }) => ({
  // 避免复杂的计算
  optimized: {
    // 使用预计算的值
    padding: token.padding, // ✅ 预计算
    // padding: `${token.padding * 2}px`, // ❌ 运行时计算
  },
}));
```

## 总结

<!--
  总结说明：
  - CSS-in-JS方案的优势
  - 在项目中的应用效果
  - 团队协作建议
  - 未来发展方向
-->

### 方案优势总结

1. **类型安全**：完整的TypeScript支持，编译时检查样式属性
2. **主题集成**：与Ant Design深度集成，支持动态主题切换
3. **组件封装**：样式与组件逻辑紧密绑定，提高可维护性
4. **开发体验**：热重载、智能提示、调试工具支持
5. **性能优化**：样式缓存、按需加载、渲染优化

### 项目应用效果

- **开发效率提升**：类型安全减少调试时间，热重载提高开发速度
- **代码质量改善**：统一的样式规范，减少样式冲突
- **维护成本降低**：组件化样式管理，便于重构和扩展
- **用户体验优化**：主题切换、响应式设计、动画效果

### 团队协作建议

1. **制定规范**：建立统一的样式命名和组织规范
2. **代码审查**：在PR中检查样式代码质量和性能
3. **文档维护**：及时更新样式文档和最佳实践
4. **培训分享**：定期进行CSS-in-JS技术分享和培训

### 未来发展方向

1. **性能优化**：持续优化样式计算和渲染性能
2. **工具完善**：开发更多调试和优化工具
3. **生态扩展**：与更多UI库和框架集成
4. **标准推进**：参与CSS-in-JS相关标准制定

CSS-in-JS方案为`agentic-ui`项目提供了现代化、类型安全、高性能的样式解决方案，是项目技术栈的重要组成部分。
