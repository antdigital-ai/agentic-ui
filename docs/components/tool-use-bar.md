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

const fullThinkContent = `好的，我现在需要帮用户汇总谷歌I/O 2025大会的重要信息。首先，我得仔细看看用户提供的搜索结果，找出相关的信息点。
      用户给了19个网页的结果，我需要逐一浏览，提取关键内容。
      首先，大会的时间和地点。网页1、2、5、10、12、16都提到了时间，大部分说是在5月20日至21日举行，地点是加州山景城的Shoreline Amphitheatre。网页3和12提到具体日程，主题演讲在凌晨1点开始，开发者主题演讲在4：30 am。不过要注意时区转换，比如网页5提到北京时间是5月21日凌晨，这可能对国内用户来说需要换算时间。
      接下来是大会的主要内容和亮点。AI肯定是重点，多个网页提到Gemini的更新，比如网页3、9、10、11、13、18. Gemini 2 5 Pro模型会被详细介绍，可能还有订阅服务的变化。网页18还提到250美元的UItra会员，这可能和Gemini Advanced有关。
      此外，Project Astra作为下一代AI助手，网页3、10、13都有提到，可能涉及移动和可穿戴设备。
      需要整合这些信息，分时间地点、核心内容、硬件动态、其他产品、合作与竞争几个部分。注意引用多个网页，避免重复引用同一个网页。比如AI部分可以引用网页3、9、10、11、13、18，智能眼镜引用4、6、7、8、19等。确保每个点都有对应的引用，并且正确标注。需要整合这些信息，分时间地点、核心内容、硬件动态、其他产品、合作与竞争几个部分。注意引用多个网页，避免重复引用同一个网页。比如AI部分可以引用网页3、9、10、11、13、18，智能眼镜引用4、6、7、8、19等。确保每个点都有对应的引用，并且正确标注。需要整合这些信息，分时间地点、核心内容、硬件动态、其他产品、合作与竞争几个部分。注意引用多个网页，避免重复引用同一个网页。比如AI部分可以引用网页3、9、10、11、13、18，智能眼镜引用4、6、7、8、19等。确保每个点都有对应的引用，并且正确标注。`;

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

<code src="../demos/tool-use-bar-basic.tsx">基础用法</code>

<code src="../demos/tool-use-bar-active-keys.tsx">activeKeys 功能演示</code>

<code src="../demos/tool-use-bar-expanded-keys.tsx">expandedKeys 功能演示</code>

<code src="../demos/tool-use-bar-think-standalone.tsx">ToolUseBarThink 独立组件</code>

<code src="../demos/tool-use-bar-think-simple.tsx">ToolUseBarThink 简单示例</code>

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
| testId               | string                                                  | -      | 测试 ID                                                      |
| style                | React.CSSProperties                                     | -      | 自定义样式                                                   |

### ToolCall

| 属性           | 类型                                        | 默认值 | 说明                               |
| -------------- | ------------------------------------------- | ------ | ---------------------------------- |
| id             | string                                      | -      | 工具唯一标识                       |
| toolName       | React.ReactNode                             | -      | 工具名称                           |
| toolTarget     | React.ReactNode                             | -      | 工具目标                           |
| time           | React.ReactNode                             | -      | 时间信息                           |
| icon           | React.ReactNode                             | -      | 自定义图标                         |
| status         | 'idle' \| 'loading' \| 'success' \| 'error' | -      | 工具状态                           |
| errorMessage   | string                                      | -      | 错误信息，仅在 error 状态下有效    |
| content        | React.ReactNode                             | -      | 工具详细内容，展开后显示           |
| type           | 'summary' \| 'normal' \| string             | -      | 工具类型，'summary' 为特殊的总结项 |
| testId         | string                                      | -      | 测试 ID                            |

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
