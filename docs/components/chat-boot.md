---
title: ChatBootPage - 对话启动页
atomId: ChatBootPage
group:
  title: 入口
  order: 1
---

# 对话启动组件

对话启动相关组件，包含标题、推荐卡片、按钮标签组等，用于构建对话界面的初始状态。

## 基础用法

<code src="../demos/ChatBootPage/index.tsx" iframe=800>完整对话启动页 - 侧边栏 + 欢迎页 + 推荐卡片</code>

## 组件概览

### Title - 标题组件

用于展示对话界面的欢迎标题和副标题。

```tsx
import { Title } from '@ant-design/agentic-ui';

export default () => {
  return <Title title="欢迎使用 AI 助手" subtitle="您的智能对话伙伴" />;
};
```

### CaseReply - 推荐卡片

展示推荐的对话案例，支持点击快速开始对话。

```tsx
import { CaseReply } from '@ant-design/agentic-ui';

export default () => {
  return (
    <CaseReply
      coverBackground="rgba(132, 220, 24, 0.15)"
      quoteIconColor="rgb(132, 220, 24)"
      quote="这是一段引用文字"
      title="搜热门资讯"
      description="了解最新动态"
      onClick={() => console.log('卡片被点击')}
    />
  );
};
```

### ButtonTabGroup - 按钮标签组

可切换的按钮标签组，支持选中状态和图标点击。

```tsx
import { ButtonTabGroup } from '@ant-design/agentic-ui';
import { RefreshCcw } from '@sofa-design/icons';
import { useState } from 'react';

export default () => {
  const [activeKey, setActiveKey] = useState('all');

  return (
    <ButtonTabGroup
      items={[
        { key: 'all', label: '全部' },
        {
          key: 'recent',
          label: '最近',
          icon: <RefreshCcw />,
          onIconClick: () => console.log('刷新'),
        },
      ]}
      activeKey={activeKey}
      onChange={(key) => setActiveKey(key)}
    />
  );
};
```

## API 参考

### TitleProps

| 属性      | 说明           | 类型                | 默认值 | 版本 |
| --------- | -------------- | ------------------- | ------ | ---- |
| title     | 主标题内容     | `ReactNode`         | -      | -    |
| subtitle  | 副标题内容     | `ReactNode`         | -      | -    |
| style     | 自定义样式     | `React.CSSProperties` | -    | -    |
| className | 自定义类名     | `string`            | -      | -    |
| prefixCls | 自定义前缀类名 | `string`            | -      | -    |

### CaseReplyProps

| 属性            | 说明                          | 类型                | 默认值                     | 版本 |
| --------------- | ----------------------------- | ------------------- | -------------------------- | ---- |
| coverBackground | cover 区域背景色（rgba 格式） | `string`            | `'rgba(132, 220, 24, 0.15)'` | -  |
| quoteIconColor  | 引号图标的颜色（rgb 格式）    | `string`            | `'rgb(132, 220, 24)'`      | -    |
| quote           | 引用文字内容                  | `ReactNode`         | -                          | -    |
| title           | 卡片标题                      | `ReactNode`         | -                          | -    |
| description     | 描述文字（单行显示）          | `ReactNode`         | -                          | -    |
| buttonBar       | 按钮区域内容（悬停时显示）    | `ReactNode`         | -                          | -    |
| onClick         | 卡片点击事件                  | `() => void`        | -                          | -    |
| style           | 自定义样式                    | `React.CSSProperties` | -                        | -    |
| className       | 自定义类名                    | `string`            | -                          | -    |
| prefixCls       | 自定义前缀类名                | `string`            | -                          | -    |

### ButtonTabProps

| 属性        | 说明           | 类型       | 默认值 | 版本 |
| ----------- | -------------- | ---------- | ------ | ---- |
| children    | 按钮文本内容   | `ReactNode` | -     | -    |
| selected    | 是否选中       | `boolean`  | `false` | -   |
| onClick     | 按钮点击回调   | `() => void` | -    | -    |
| onIconClick | 图标点击回调   | `() => void` | -    | -    |
| icon        | 按钮图标       | `ReactNode` | -     | -    |
| className   | 自定义类名     | `string`   | -      | -    |
| prefixCls   | 自定义前缀类名 | `string`   | -      | -    |

### ButtonTabGroupProps

| 属性             | 说明                             | 类型                    | 默认值 | 版本 |
| ---------------- | -------------------------------- | ----------------------- | ------ | ---- |
| items            | Tab 配置项数组                   | `ButtonTabItem[]`       | `[]`   | -    |
| activeKey        | 当前选中的 Tab key（受控模式）   | `string`                | -      | -    |
| defaultActiveKey | 默认选中的 Tab key（非受控模式） | `string`                | -      | -    |
| onChange         | Tab 切换时的回调函数             | `(key: string) => void` | -      | -    |
| className        | 自定义类名                       | `string`                | -      | -    |
| prefixCls        | 自定义前缀类名                   | `string`                | -      | -    |

### ButtonTabItem

| 属性        | 说明                                              | 类型       | 默认值 | 版本 |
| ----------- | ------------------------------------------------- | ---------- | ------ | ---- |
| key         | Tab 的唯一标识                                    | `string`   | -      | -    |
| label       | Tab 显示的文本                                    | `ReactNode` | -     | -    |
| icon        | Tab 的图标（显示在右侧，带分隔线）                | `ReactNode` | -     | -    |
| onIconClick | 图标点击回调（独立于 Tab 点击，支持如刷新等操作） | `() => void` | -    | -    |
| disabled    | 是否禁用该选项                                    | `boolean`  | `false` | -   |

## 使用场景

### Title 使用场景

- 对话界面的欢迎标题
- 突出显示 AI 助手名称
- 提供简短的功能说明

### CaseReply 使用场景

- 展示推荐对话话题
- 快速开始常见对话
- 引导用户使用功能

### ButtonTabGroup 使用场景

- 内容分类筛选（如"全部"、"最近"）
- 助手类型切换（如不同功能的助手）
- 视图模式切换

## 设计特点

### Title

- 支持自定义主标题和副标题
- 可使用渐变色突出品牌特色
- 居中显示，适合欢迎界面

### CaseReply

- 卡片式设计，视觉层次清晰
- 支持自定义颜色主题
- 悬停显示操作按钮
- 点击卡片快速发起对话

### ButtonTabGroup

- 胶囊式按钮设计
- 双色状态：未选中白色，选中黑色
- 支持图标，可独立响应点击
- 图标与文本间带分隔线
- 响应式 hover 效果
