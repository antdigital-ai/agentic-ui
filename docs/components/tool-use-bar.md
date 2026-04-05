---
title: ToolUseBar 工具使用栏
atomId: ToolUseBar
group:
  title: 对话流
  order: 3
---

# ToolUseBar 组件

ToolUseBar 是一个用于显示工具调用列表的组件，支持工具状态显示和交互功能。

## 代码演示

### 轻量思考

```tsx
import { ToolUseBarThink } from '@ant-design/agentic-ui';
import { useState, useEffect } from 'react';

const fullThinkContent = `（示例）根据检索结果整理要点：时间地点、核心结论、待确认项。以下为流式输出占位正文。`;

export default () => {
  const [thinkContent, setThinkContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < fullThinkContent.length) {
      const timer = setTimeout(() => {
        // 每次添加一定数量的字符，模拟思考流
        const chunkSize = Math.floor(Math.random() * 10) + 5; // 每次添加5-15个字符
        setThinkContent(fullThinkContent.slice(0, currentIndex + chunkSize));
        setCurrentIndex(currentIndex + chunkSize);
      }, 100); // 每100ms添加一次

      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  return (
    <ToolUseBarThink
      light
      toolName="轻量思考"
      thinkContent={thinkContent}
      isThinkLoading={currentIndex < fullThinkContent.length}
    />
  );
};
```

<code src="../demos/tool-use-bar-basic.tsx">基础用法 - 多状态工具列表</code>

<code src="../demos/tool-use-bar-active-keys.tsx">受控激活 - activeKeys</code>

<code src="../demos/tool-use-bar-expanded-keys.tsx">受控展开 - expandedKeys</code>

<code src="../demos/tool-use-bar-think-standalone.tsx">深度思考 - ToolUseBarThink</code>

<code src="../demos/tool-use-bar-think-simple.tsx">深度思考 - 多状态对比</code>

## API

### ToolUseBarProps

| 属性                 | 类型                                                    | 默认值 | 说明                                                         |
| -------------------- | ------------------------------------------------------- | ------ | ------------------------------------------------------------ |
| tools                | ToolCall[]                                              | -      | 工具列表                                                     |
| onToolClick          | (id: string) => void                                    | -      | 工具点击回调                                                 |
| className            | string                                                  | -      | 自定义类名                                                   |
| activeKeys           | string[]                                                | []     | 激活的工具 ID 数组                                           |
| defaultActiveKeys    | string[]                                                | []     | 默认激活的工具 ID 数组                                       |
| onActiveKeysChange   | (activeKeys: string[]) => void                          | -      | 激活状态变化回调                                             |
| expandedKeys         | string[]                                                | []     | 展开的工具 ID 数组                                           |
| defaultExpandedKeys  | string[]                                                | []     | 默认展开的工具 ID 数组                                       |
| onExpandedKeysChange | (expandedKeys: string[], removedKeys: string[]) => void | -      | 展开状态变化回调，`removedKeys` 为本次操作中被收起的工具项ID |
| light                | boolean                                                 | false  | 启用亮色/轻量模式                                            |
| disableAnimation     | boolean                                                 | false  | 关闭动画，在性能较弱设备上可减少卡顿                         |
| testId               | string                                                  | -      | 测试 ID                                                      |
| style                | React.CSSProperties                                     | -      | 自定义样式                                                   |

### ToolCall

| 属性         | 类型                                        | 默认值 | 说明                               |
| ------------ | ------------------------------------------- | ------ | ---------------------------------- |
| id           | string                                      | -      | 工具唯一标识                       |
| toolName     | React.ReactNode                             | -      | 工具名称                           |
| toolTarget   | React.ReactNode                             | -      | 工具目标                           |
| time         | React.ReactNode                             | -      | 时间信息                           |
| icon         | React.ReactNode                             | -      | 自定义图标                         |
| status       | 'idle' \| 'loading' \| 'success' \| 'error' | -      | 工具状态                           |
| errorMessage | string                                      | -      | 错误信息，仅在 error 状态下有效    |
| content      | React.ReactNode                             | -      | 工具详细内容，展开后显示           |
| type         | 'summary' \| 'normal' \| string             | -      | 工具类型，'summary' 为特殊的总结项 |
| testId       | string                                      | -      | 测试 ID                            |

## 状态样式

组件会根据工具状态显示不同的样式：

- `idle`: 空闲状态
- `loading`: 加载状态（带有旋转动画）
- `success`: 成功状态
- `error`: 错误状态
- `active`: 激活状态（通过 activeKeys 控制）

## ToolUseBarThink 独立组件

ToolUseBarThink 是一个专门为 Think 功能设计的独立组件，拥有独特的样式和功能。

### ToolUseBarThinkProps

| 属性             | 类型                                        | 默认值 | 说明                    |
| ---------------- | ------------------------------------------- | ------ | ----------------------- |
| id               | string                                      | -      | 组件唯一标识            |
| toolName         | React.ReactNode                             | -      | 工具名称                |
| toolTarget       | React.ReactNode                             | -      | 工具目标                |
| time             | React.ReactNode                             | -      | 工具执行时间            |
| icon             | React.ReactNode                             | -      | 自定义图标              |
| thinkContent     | React.ReactNode                             | -      | Think 模块完整内容      |
| isThinkLoading   | boolean                                     | false  | Think 模块 loading 状态 |
| status           | 'idle' \| 'loading' \| 'success' \| 'error' | 'idle' | 组件状态                |
| onClick          | (id: string) => void                        | -      | 点击回调                |
| isActive         | boolean                                     | false  | 是否激活                |
| onActiveChange   | (id: string, active: boolean) => void       | -      | 激活状态变化回调        |
| isExpanded       | boolean                                     | -      | 是否展开                |
| onExpandedChange | (id: string, expanded: boolean) => void     | -      | 展开状态变化回调        |
| defaultExpanded  | boolean                                     | false  | 默认展开状态            |
| testId           | string                                      | -      | 测试 ID                 |
| light            | boolean                                     | false  | 启用亮色/轻量模式       |

### ToolUseBarThink 特性

- **独立组件**: 专门为 Think 功能设计的独立组件
- **专用样式**: 拥有独特的蓝色主题样式
- **Loading 状态**: 显示 8 行占位符，支持展开收起
- **完整内容**: 支持显示 thinkContent 完整内容
- **状态管理**: 支持激活状态和展开状态管理
- **自定义图标**: 默认使用 ThinkIcon，支持自定义

## 注意事项

1. `activeKeys` 数组中的 ID 必须与 `tools` 中的 `id` 匹配
2. 如果不提供 `onActiveKeysChange`，`activeKeys` 将不会生效
3. 组件支持多选激活，可以同时激活多个工具项
4. 点击已激活的工具项会取消激活状态
5. `expandedKeys` 数组中的 ID 必须与 `tools` 中的 `id` 匹配
6. 如果不提供 `onExpandedKeysChange`，展开状态将使用内部状态管理
7. 只有包含 `content` 或 `errorMessage` 的工具项才会显示展开按钮
8. 支持受控和非受控两种展开模式
