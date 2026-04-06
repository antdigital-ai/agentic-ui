---
title: AnswerAlert 应答中断提示
atomId: AnswerAlert
group:
  title: 对话流
  order: 3
---

# AnswerAlert 应答中断提示

AnswerAlert 是一个用于展示系统状态和用户提示的组件，特别适用于 AI 对话场景中的应答中断、错误提示、成功反馈等场景。

## 代码演示

<code src="../demos/answer-alert.tsx" background="var(--main-bg-color)" iframe=540></code>

## API

### AnswerAlertProps

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| className | 自定义类名 | `string` | - | - |
| style | 自定义样式 | `React.CSSProperties` | - | - |
| message | 提示内容 | `React.ReactNode` | - | - |
| description | 辅助性文字介绍 | `React.ReactNode` | - | - |
| icon | 自定义图标，`showIcon` 为 true 时有效 | `React.ReactNode` | - | - |
| showIcon | 是否显示辅助图标 | `boolean` | `false` | - |
| type | 指定指示器的样式 | `'success' \| 'error' \| 'warning' \| 'info' \| 'gray'` | - | - |
| action | 自定义操作项 | `React.ReactNode` | - | - |
| closable | 可关闭配置 | `boolean` | `false` | - |
| onClose | 关闭时触发的回调函数 | `(e: React.MouseEvent<HTMLButtonElement>) => void` | - | - |

## 类型说明

### type 类型

- `success`: 成功提示，绿色主题，用于表示操作成功或完成状态
- `error`: 错误提示，红色主题，用于表示错误或失败状态
- `warning`: 警告提示，黄色主题，用于表示需要注意的警告信息
- `info`: 信息提示，蓝色主题，用于表示一般信息或提示
- `gray`: 中性提示，灰色主题，用于表示加载中或中性状态

## 使用示例

### 基础用法

```tsx
import { AnswerAlert } from '@ant-design/agentic-ui';
import { Space } from 'antd';

export default () => {
  return (
    <Space direction="vertical" size={16}>
      <AnswerAlert message="这是一条提示信息" />
      <AnswerAlert message="操作成功" type="success" showIcon closable />
      <AnswerAlert message="出现错误" type="error" showIcon closable />
      <AnswerAlert message="警告信息" type="warning" showIcon closable />
      <AnswerAlert message="提示信息" type="info" showIcon closable />
      <AnswerAlert message="加载中..." type="gray" showIcon closable />
    </Space>
  );
};
```

### 带描述的提示

```tsx
import { AnswerAlert } from '@ant-design/agentic-ui';
import { Button, Space } from 'antd';
import { AiAgentManagement } from '@sofa-design/icons';

export default () => {
  return (
    <AnswerAlert
      message="LUI Chat 已停止，你的额度不足，无法继续。"
      icon={<AiAgentManagement />}
      showIcon
      description={
        <Space direction="vertical" variant="solid">
          每日额度将在每天 08:00 更新
          <Button color="default" variant="solid">
            继续对话
          </Button>
        </Space>
      }
    />
  );
};
```

### 可关闭的提示

```tsx
import React from 'react';
import { AnswerAlert } from '@ant-design/agentic-ui';

export default () => {
  const handleClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log('提示已关闭', e);
  };

  return (
    <AnswerAlert
      message="这是一条可关闭的提示"
      closable
      onClose={handleClose}
      type="info"
      showIcon
    />
  );
};
```

### 自定义操作按钮

```tsx
import { AnswerAlert } from '@ant-design/agentic-ui';
import { Button, Space } from 'antd';

export default () => {
  const action = (
    <Space>
      <Button type="link" size="small">
        不再提示
      </Button>
    </Space>
  );

  return (
    <AnswerAlert
      message="系统维护通知"
      description="系统将于今晚 22:00-24:00 进行维护，期间可能影响正常使用。"
      type="warning"
      showIcon
      action={action}
    />
  );
};
```

### 自定义图标

```tsx
import { AnswerAlert } from '@ant-design/agentic-ui';
import { SmileOutlined } from '@ant-design/icons';

export default () => {
  return (
    <AnswerAlert
      message="自定义图标提示"
      description="使用自定义图标来增强视觉效果"
      icon={<SmileOutlined />}
      showIcon
      type="info"
    />
  );
};
```

### 复杂内容描述

```tsx
import { AnswerAlert } from '@ant-design/agentic-ui';
import { Button, Space, Typography } from 'antd';

const { Text, Link } = Typography;

export default () => {
  return (
    <AnswerAlert
      message="额度不足提醒"
      description={
        <Space direction="vertical" size={8}>
          <Text>您的每日额度已用完，无法继续对话。</Text>
          <Text type="secondary">
            每日额度将在每天 08:00 更新，或您可以
            <Link>升级套餐</Link>
            获得更多额度。
          </Text>
        </Space>
      }
      type="error"
      showIcon
      closable
    />
  );
};
```

## 常见问题

### Q: 可以自定义提示的样式吗？

A: 可以通过 `className` 和 `style` 属性来自定义样式，也可以通过 CSS 变量来调整主题色彩。

### Q: 如何在提示中添加链接或按钮？

A: 可以在 `message`、`description` 或 `action` 属性中使用 JSX 元素，包括链接、按钮等交互组件。
