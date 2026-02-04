---
title: Footnote 脚注
atomId: Footnote
group:
  title: 图文输出
  order: 4
---

# 脚注

脚注是 Bubble 组件的内置功能，用于在 Markdown 内容中添加引用标记和补充说明，支持弹框预览和来源汇总展示。

> 💡 脚注功能通过 `Bubble` 组件的 `markdownRenderConfig.fncProps` 配置使用，无需单独引入。

## ✨ 功能特点

- 📝 **标准语法**：支持 Markdown 脚注语法 `[^标识]`
- 💬 **弹框预览**：鼠标悬停显示脚注详情弹框
- 🔗 **链接支持**：脚注内容支持纯文本或外部链接
- 📋 **来源汇总**：在消息底部统一展示脚注来源列表
- 🎨 **自定义渲染**：支持自定义脚注弹框的渲染方式

## 代码演示

### 基础用法

展示如何实现脚注弹框及消息底部的脚注汇总功能。

<code src="../demos/bubble/footnote-demo.tsx" background="var(--main-bg-color)" iframe=540></code>

## API 参考

### FootnoteProps

脚注配置通过 `markdownRenderConfig.fncProps` 传入：

| 属性                       | 说明                   | 类型                                                                             | 默认值 |
| -------------------------- | ---------------------- | -------------------------------------------------------------------------------- | ------ |
| render                     | 自定义脚注引用渲染函数 | `(props: { identifier?: string }, children: React.ReactNode) => React.ReactNode` | -      |
| onFootnoteDefinitionChange | 脚注定义变化回调       | `(list: FootnoteDefinition[]) => void`                                           | -      |

### FootnoteDefinition

脚注定义数据结构：

| 属性        | 说明           | 类型     |
| ----------- | -------------- | -------- |
| id          | 脚注唯一标识   | `string` |
| placeholder | 脚注占位符标识 | `string` |
| origin_text | 原始文本内容   | `string` |
| url         | 链接地址       | `string` |
| origin_url  | 原始链接地址   | `string` |

## 使用说明

### Markdown 脚注语法

在正文中使用 `[^标识]` 引用脚注，在文末使用 `[^标识]: 说明内容` 定义脚注：

```markdown
这是一段包含脚注引用的文本[^1]，还可以引用多个脚注[^2][^3]。

[^1]: 这是第一个脚注的说明内容。

[^2]: [Ant Design 官网](https://ant.design)

[^3]: [](https://developer.mozilla.org/zh-CN/)
```

### 脚注类型

1. **纯文本脚注**：`[^1]: 脚注说明文字`
2. **带标题链接**：`[^2]: [标题文字](https://example.com)`
3. **纯链接**：`[^3]: [](https://example.com)` - 标题自动从 URL 提取

### 自定义脚注渲染

通过 `render` 函数自定义脚注引用的显示方式，实现自定义的 Popover 弹框效果：

```tsx | pure
import {
  Bubble,
  MessageBubbleData,
  useRefFunction,
} from '@ant-design/agentic-ui';
import { Popover } from 'antd';
import React, { useState } from 'react';

// 脚注定义类型
interface FootnoteDefinition {
  id: string;
  placeholder: string;
  origin_text: string;
  url: string;
  origin_url: string;
}

export default () => {
  // 存储脚注定义列表
  const [footnoteList, setFootnoteList] = useState<FootnoteDefinition[]>([]);

  // 消息数据
  const message: MessageBubbleData = {
    id: '1',
    role: 'assistant',
    content: `这是包含脚注的内容[^1]，以及另一个脚注[^2]。

[^1]: 第一个脚注说明
[^2]: [参考链接](https://ant.design)`,
    createAt: Date.now(),
    updateAt: Date.now(),
    meta: {
      avatar:
        'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
      title: 'AI Assistant',
    },
  };

  // 使用 useRefFunction 确保回调函数引用稳定
  const renderFootnote = useRefFunction(
    (props: { identifier?: string }, children: React.ReactNode) => {
      const { identifier } = props;
      const footnoteData = footnoteList.find(
        (item) => item.placeholder === identifier,
      );

      if (!footnoteData) return children;

      // 解析链接信息
      const href = footnoteData.url;
      let hostText = '链接';
      try {
        hostText = href ? new URL(href).hostname.replace(/^www\./, '') : '链接';
      } catch {
        hostText = '链接';
      }

      return (
        <Popover
          styles={{
            body: {
              padding: 12,
              borderRadius: 8,
            },
          }}
          content={
            <div style={{ maxWidth: 280 }}>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                {footnoteData.origin_text || hostText}
              </div>
              {href && (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 12, color: '#1677ff' }}
                >
                  {hostText} ↗
                </a>
              )}
            </div>
          }
        >
          {children}
        </Popover>
      );
    },
  );

  return (
    <Bubble
      originData={message}
      avatar={message.meta!}
      pure
      markdownRenderConfig={{
        fncProps: {
          render: renderFootnote,
          onFootnoteDefinitionChange: (list) => {
            setFootnoteList(list);
          },
        },
      }}
    />
  );
};
```

### 脚注来源汇总

使用 `bubbleRenderConfig.afterMessageRender` 在消息底部展示脚注来源：

```tsx | pure
import { Bubble, VisualList } from '@ant-design/agentic-ui';

const afterMessageRender = (props) => {
  const { originData } = props;
  if (!originData?.extra?.showRefs) return null;

  return (
    <div style={{ padding: 16 }}>
      <VisualList
        data={footnoteItems}
        shape="circle"
        description={`${footnoteItems.length} 个网页`}
      />
    </div>
  );
};

<Bubble originData={message} bubbleRenderConfig={{ afterMessageRender }} />;
```

## 使用场景

- **知识问答**：为 AI 回答添加来源引用
- **文档生成**：补充术语解释和参考资料
- **学术内容**：标注数据来源和引文
- **新闻资讯**：提供原始报道链接

## 最佳实践

1. **保持简洁**：脚注内容应简明扼要，避免过长
2. **有效链接**：确保脚注中的链接可访问
3. **合理数量**：单条消息的脚注数量建议不超过 10 个
4. **清晰标识**：使用有意义的脚注标识符

## 相关组件

- [Bubble 气泡组件](./bubble.md) - 消息气泡容器
- [VisualList 视觉列表](./VisualList.md) - 来源列表展示
