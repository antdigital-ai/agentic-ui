---
title: AILabel AI 标签
atomId: AILabel
group:
  title: 入口
  order: 1
---

# AILabel AI 标签

AILabel 是一个用于明确标识 AI 生成内容的组件，在原有**非 AI 对话界面**中，通过视觉标记、水印或标签，清晰区分人工创建与 AI 生成的内容，增强透明度并帮助用户识别内容来源，确保合规性。

## 代码演示

<code src="../demos/ai-label.tsx" background="var(--main-bg-color)" iframe=540></code>

## API

### AILabelProps

| 参数      | 说明                                                       | 类型                                                         | 默认值      | 版本 |
| --------- | ---------------------------------------------------------- | ------------------------------------------------------------ | ----------- | ---- |
| status    | 标签状态，控制标签的视觉样式                               | `'default' \| 'emphasis' \| 'watermark'`                     | `'default'` | -    |
| offset    | 标签偏移量，格式为 [水平偏移, 垂直偏移]                    | `[number, number]`                                           | -           | -    |
| tooltip   | 提示框配置，鼠标悬停时显示提示信息                         | [TooltipProps](https://ant.design/components/tooltip-cn#api) | -           | -    |
| className | 自定义根元素的 CSS 类名                                    | `string`                                                     | -           | -    |
| style     | 自定义标签点（dot）的样式，会与 offset 计算的样式合并      | `React.CSSProperties`                                        | -           | -    |
| rootStyle | 自定义根容器元素的样式                                     | `React.CSSProperties`                                        | -           | -    |
| children  | 子元素，当存在时标签会以绝对定位的方式显示在子元素的右上角 | `React.ReactNode`                                            | -           | -    |

## 使用示例

### 不同状态对比

```tsx
import { AILabel } from '@ant-design/agentic-ui';
import { Space } from 'antd';

export default () => {
  return (
    <Space size={24}>
      <AILabel status="default" offset={[0, -8]} />
      <AILabel
        status="watermark"
        offset={[0, -8]}
        tooltip={{ title: '水印状态的 AI 标签' }}
      />
      <AILabel
        status="emphasis"
        offset={[0, -8]}
        tooltip={{ title: '强调状态的 AI 标签' }}
      />
    </Space>
  );
};
```

### 带子元素

当存在子元素时，标签会自动定位到子元素的右上角。

```tsx
import { AILabel } from '@ant-design/agentic-ui';

export default () => {
  return (
    <AILabel
      status="emphasis"
      tooltip={{
        title: '此内容由AI生成',
      }}
    >
      <div
        style={{
          padding: '16px',
          background: '#f5f5f5',
          borderRadius: '4px',
        }}
      >
        这是一段 AI 生成的内容
      </div>
    </AILabel>
  );
};
```

### 自定义偏移量

通过 `offset` 属性精确控制标签的位置。

```tsx
import { AILabel } from '@ant-design/agentic-ui';

export default () => {
  return (
    <div style={{ fontSize: 13, lineHeight: '180%', position: 'relative' }}>
      这是一段文本内容
      <AILabel
        status="emphasis"
        offset={[-10, -12]}
        tooltip={{
          title: 'AI 生成内容',
          placement: 'top',
        }}
      />
    </div>
  );
};
```

## 类型说明

### status 类型

- **default**: 默认状态，标准 AI 标签样式，使用基础样式显示
- **watermark**: 水印状态，半透明样式，带有模糊效果，用于合规性标识，当 Tooltip 未打开时显示禁用图标
- **emphasis**: 强调状态，突出显示 AI 标签，带有渐变背景和边框，适用于需要强调 AI 内容的场景

### offset 参数

控制标签的位置偏移，格式为 `[水平偏移, 垂直偏移]`：

- **第一个值（水平偏移）**：单位 px，负值表示向左偏移，正值表示向右偏移
- **第二个值（垂直偏移）**：单位 px，负值表示向上偏移，正值表示向下偏移

**注意**：当存在 `children` 时，标签会自动定位到子元素的右上角，此时 `offset` 用于微调位置。

### tooltip 参数

配置 Tooltip 提示框的属性，支持所有 Ant Design Tooltip 组件的属性。常用配置：

- `title`: 提示内容
- `placement`: 提示框位置
- `trigger`: 触发方式
