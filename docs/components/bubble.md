---
title: Bubble 气泡组件
atomId: Bubble
group:
  title: 对话流
  order: 3
---

# Bubble 气泡组件

Bubble 组件是一个功能丰富的聊天消息气泡组件，为现代化对话界面提供完整的解决方案。

## ✨ 核心特性

- 🎨 **灵活定制**：支持全方位的自定义渲染，包括标题、内容、头像、操作区域
- 📱 **响应式设计**：完美适配桌面端和移动端，支持左右布局切换
- 📎 **文件支持**：智能识别和展示多种文件类型，支持预览和下载
- 🚀 **高性能**：支持虚拟滚动和大量消息的流畅展示
- 🎯 **交互丰富**：内置点赞、点踩、回复、复制等常用操作
- 🌈 **主题友好**：支持明暗主题切换和自定义样式配置
- 💡 **Pure 模式**：提供简洁的无边框模式，适合嵌入式场景
- 🔄 **消息连续性优化**：智能隐藏连续消息的重复头像和标题，提升对话体验

## ⚠️ 事件命名变更说明

为了符合组件事件命名规范，以下事件名已更新（旧的事件名仍然支持，但建议使用新的事件名）：

- `onDisLike` → `onDislike`（点踩回调）
- `onCancelLike` → `onLikeCancel`（取消点赞回调，符合 Like 子组件事件命名规范）

> **注意**：旧的事件名仍然支持，以保持向后兼容性。新代码建议使用新的事件名。

## 快速开始

### 基本用法

```tsx
import {
  Bubble,
  SuggestionList,
  MessageBubbleData,
} from '@ant-design/agentic-ui';
import { Card } from 'antd';
// 创建模拟文件的辅助函数
const createMockFile = (
  name: string,
  type: string,
  size: number,
  url: string,
): AttachmentFile => ({
  name,
  type,
  size,
  url,
  lastModified: Date.now(),
  webkitRelativePath: '',
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  bytes: () => Promise.resolve(new Uint8Array(0)),
  text: () => Promise.resolve(''),
  stream: () => new ReadableStream(),
  slice: () => new Blob(),
});
const props = {
  markdownRenderConfig: {
    tableConfig: {
      pure: true,
    },
  },
  time: Date.now(),
  onLike: () => {
    message.success('点赞成功');
  },
  onDislike: () => {
    message.info('点踩成功');
  },
  // 或者使用已废弃的 onDisLike（保持向后兼容）
  // onDisLike: () => {
  //   message.info('点踩成功');
  // },
  onReply: () => {
    message.info('回复成功');
  },
  onAvatarClick: () => {
    message.info('头像点击成功');
  },
  onDoubleClick: () => {
    message.info('双击成功');
  },
};

const items = [
  {
    key: 'qwe',
    icon: '💸',
    text: '关税对消费类基金的影响',
  },
  {
    key: 'asd',
    icon: '📝',
    text: '恒生科技指数基金相关新闻',
  },
  {
    key: 'zxc',
    icon: '📊',
    text: '数据分析与可视化',
  },
];

const message: MessageBubbleData = {
  id: '1',
  content: `生成式 AI 可以用于自动化迄今只有人类能够完成的创造性任务，这样可以为个人和公司节省时间和金钱。如果你能向生成式 AI 描述你的任务，它很可能为你完成任务或者为你提供一个良好的起点。生成式 AI 可以用于自动化迄今只有人类能够完成的创造性任务，这样可以为个人和公司节省时间和金钱。如果你能向生成式 AI 描述你的任务，它很可能为你完成任务或者为你提供一个良好的起点。生成式 AI 可以用于自动化迄今只有人类能够完成的创造性任务，这样可以为个人和公司节省时间和金钱。如果你能向生成式 AI 描述你的任务，它很可能为你完成任务或者为你提供一个良好的起点。生成式 AI 可以用于自动化迄今只有人类能够完成的创造性任务，这样可以为个人和公司节省时间和金钱。如果你能向生成式 AI 描述你的任务，它很可能为你完成任务或者为你提供一个良好的起点。
`,
  createAt: Date.now(),
  updateAt: Date.now(),
  preMessage: {
    id: '2',
    content: `生成式 AI 可以用于自动化迄今只有人类能够完成的创造性任务，这样可以为个人和公司节省时间和金钱。如果你能向生成式 AI 描述你的任务，它很可能为你完成任务或者为你提供一个良好的起点。| 功能 | 描述 |
| -------- | -------- |
| 功能1 | 描述1 |
| 功能2 | 描述2 |
| 功能3 | 描述3 |
| 功能4 | 描述4 |
| 功能5 | 描述5 |`,
    createAt: Date.now(),
    updateAt: Date.now(),
  },
  time: Date.now(),
  meta: {
    avatar:
      'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
    title: 'LUI',
  },
  fileMap: new Map<string, AttachmentFile>([
    [
      'example-document.pdf',
      createMockFile(
        'example-document.pdf',
        'application/pdf',
        2048576,
        'https://example.com/example-document.pdf',
      ),
    ],
    [
      'preview-image.png',
      createMockFile(
        'preview-image.png',
        'image/png',
        1048576,
        'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
      ),
    ],
    [
      'image.png',
      createMockFile(
        'image.png',
        'image/png',
        10485700,
        'https://mdn.alipayobjects.com/huamei_gcee1x/afts/img/A*rhTwTY6FkwIAAAAAAAAAAAAADml6AQ/original',
      ),
    ],
    [
      'code-example.js',
      createMockFile(
        'code-example.js',
        'application/javascript',
        512000,
        'https://example.com/code-example.js',
      ),
    ],
  ]),
};

export default () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}
  >
    <Card title="用户消息">
      <Bubble
        style={{
          flex: 1,
        }}
        {...props}
        originData={message}
        avatar={message.meta}
        placement="right"
        markdownRenderConfig={{
          tableConfig: {
            pure: true,
          },
        }}
        quote={{
          popupDirection: 'right',
          fileName: 'utils/helper.ts',
          lineRange: '12-25',
          quoteDescription: '这是一个工具函数的引用，用于处理数据格式化',
          popupDetail: `export const formatData = (data: any) => {
            if (!data) return null;
            return {
              id: data.id,
              name: data.name,
              createdAt: new Date(data.created_at)
            };`,
        }}
      />
    </Card>
    <Card title="媒体消息">
      <Bubble
        style={{
          flex: 1,
        }}
        pure
        {...props}
        originData={message}
        avatar={message.meta}
        placement="left"
      />
      <div
        style={{
          paddingLeft: 20,
        }}
      >
        <SuggestionList items={items} onItemClick={() => alert('ask')} />
      </div>
    </Card>
  </div>
);
```

### 消息列表

```tsx | pure
import { BubbleList, MessageBubbleData } from '@ant-design/agentic-ui';

const messages: MessageBubbleData[] = [
  // ... 消息数据
];

export default () => (
  <BubbleList
    bubbleList={messages}
    assistantMeta={{ avatar: '...', title: 'AI 助手' }}
    userMeta={{ avatar: '...', title: '用户' }}
  />
);
```

## 🚀 代码演示

### 基础功能展示

展示气泡组件的基础功能，包括消息布局、加载状态、文件附件和交互操作。

<code src="../demos/bubble/basic.tsx">基础用法 - 消息布局与交互</code>

### 消息加载状态演示

演示 Bubble 组件的消息加载状态功能，包括消息生成时的加载效果和交互控制。

<code src="../demos/bubble/message-loading-demo.tsx">消息加载状态</code>

### 文件加载状态演示

演示 Bubble 组件的文件上传加载状态功能，包括文件处理时的加载效果和文件类型支持。

<code src="../demos/bubble/file-loading-demo.tsx">文件上传加载状态</code>

### 标题自定义渲染

专门演示 `titleRender` 功能，展示如何自定义消息标题的显示方式。

<code src="../demos/bubble/title-render-demo.tsx">自定义渲染 - 标题 titleRender</code>

### 内容自定义渲染

专门演示 `contentRender` 功能，展示如何自定义消息内容的显示方式。

<code src="../demos/bubble/content-render-demo.tsx">自定义渲染 - 内容 contentRender</code>

### 头像自定义渲染

专门演示 `avatarRender` 功能，展示如何自定义头像的显示方式。

<code src="../demos/bubble/avatar-render-demo.tsx">自定义渲染 - 头像 avatarRender</code>

### 脚注（Footnote）

展示如何实现脚注弹框及消息底部的脚注汇总功能。

<code src="../demos/bubble/footnote-demo.tsx">脚注引用 - Footnote</code>

### 操作区域定制

展示 `extraRender` 功能，自定义气泡的操作按钮和交互区域。

<code src="../demos/bubble/extra-render.tsx">自定义渲染 - 操作区 extraRender</code>

### 语音播报（TTS）

展示内置的语音播报按钮及倍速选择功能：

<code src="../demos/bubble/voice.tsx">语音播报 - TTS</code>

### 文件附件处理

演示如何处理和展示不同类型的文件附件，支持多种文件格式。

<code src="../demos/bubble/file-view.tsx">文件附件 - 多格式预览</code>

### Pure 简洁模式

展示 Pure 模式的使用，提供无边框的简洁设计，适合嵌入式场景。

<code src="../demos/bubble/pure.tsx">Pure 简洁模式</code>

### 消息连续性优化

演示 `preMessageSameRole` 功能，展示如何通过传入前一条消息来优化连续对话的视觉体验。

<code src="../demos/bubble/preMessageSameRole.tsx">连续消息合并 - preMessageSameRole</code>

### BubbleList 基础用法

演示 BubbleList 组件的基础用法，包括消息列表的创建和管理。

<code src="../demos/bubble/bubblelist-basic-demo.tsx">BubbleList 基础用法</code>

### BubbleList 交互功能

演示 BubbleList 组件的交互功能，包括点赞、点踩、回复等操作。

<code src="../demos/bubble/bubblelist-interaction-demo.tsx">BubbleList 交互 - 点赞回复</code>

### BubbleList 配置选项

演示 BubbleList 组件的配置选项，包括加载状态、只读模式等。

<code src="../demos/bubble/bubblelist-config-demo.tsx">BubbleList 配置 - 加载与只读</code>

### BubbleList 性能优化

演示 BubbleList 组件的性能优化特性，包括虚拟滚动和大数据量处理。

<code src="../demos/bubble/bubblelist-performance-demo.tsx">BubbleList 性能优化</code>

### BubbleList 懒加载

演示 BubbleList 组件的懒加载功能，包含 200 条消息，展示如何通过懒加载提升长列表的渲染性能。只有进入视口的气泡才会被渲染，减少初始 DOM 节点数量。

<code src="../demos/bubble/bubblelist-lazy-demo.tsx">BubbleList 懒加载 - 200条消息</code>

## 📖 API 参考

### Bubble 单个气泡组件

#### 核心属性

| 属性       | 说明                   | 类型                | 默认值   | 废弃版本 |
| ---------- | ---------------------- | ------------------- | -------- | -------- |
| originData | 消息的原始数据         | `MessageBubbleData` | -        | - |
| avatar     | 头像元数据配置         | `BubbleMetaData`    | -        | - |
| placement  | 消息布局位置           | `'left' \| 'right'` | `'left'` | - |
| loading    | 加载状态显示           | `boolean`           | `false`  | - |
| readonly   | 只读模式               | `boolean`           | `false`  | - |
| pure       | 简洁模式（无边框阴影） | `boolean`           | `false`  | - |

#### 样式配置

| 属性      | 说明             | 类型                  | 默认值 |
| --------- | ---------------- | --------------------- | ------ |
| className | 自定义 CSS 类名  | `string`              | -      |
| style     | 自定义内联样式   | `React.CSSProperties` | -      |
| styles    | 详细样式配置对象 | `BubbleStylesConfig`  | -      |

#### 渲染配置

| 属性                 | 说明              | 类型                  | 默认值 |
| -------------------- | ----------------- | --------------------- | ------ |
| bubbleRenderConfig   | 自定义渲染配置    | `BubbleRenderConfig`  | -      |
| markdownRenderConfig | Markdown 渲染配置 | `MarkdownEditorProps` | -      |

#### 交互回调

| 属性          | 说明                                        | 类型                                  | 默认值 | 废弃版本 |
| ------------- | ------------------------------------------- | ------------------------------------- | ------ | -------- |
| onLike        | 点赞回调函数                                | `(bubble: MessageBubbleData) => void` | -      | - |
| onDislike     | 点踩回调函数（符合命名规范）                | `(bubble: MessageBubbleData) => void` | -      | - |
| ~~onDisLike~~     | 已废弃，请使用 `onDislike`              | `(bubble: MessageBubbleData) => void` | -      | 2.29.0 |
| onLikeCancel  | Like 子组件取消事件（符合命名规范）         | `(bubble: MessageBubbleData) => void` | -      | - |
| ~~onCancelLike~~  | 已废弃，请使用 `onLikeCancel`           | `(bubble: MessageBubbleData) => void` | -      | 2.29.0 |
| onReply       | 回复回调函数                                | `(message: string) => void`           | -      | - |
| onAvatarClick | 头像点击回调                                | `() => void`                          | -      | - |
| onDoubleClick | 双击回调函数                                | `() => void`                          | -      | - |
| preMessage    | 前一条消息数据                              | `MessageBubbleData \| undefined`      | -      | - |

### BubbleList 消息列表组件

#### 核心属性

| 属性          | 说明          | 类型                  | 默认值  | 废弃版本 |
| ------------- | ------------- | --------------------- | ------- | -------- |
| bubbleList    | 消息列表数据  | `MessageBubbleData[]` | `[]`    | - |
| assistantMeta | AI 助手元数据 | `BubbleMetaData`      | -       | - |
| userMeta      | 用户元数据    | `BubbleMetaData`      | -       | - |
| ~~loading~~   | 已废弃，请使用 `isLoading` | `boolean` | `false` | 2.29.0 |
| isLoading     | 列表加载状态  | `boolean`             | `false` | - |
| readonly      | 只读模式      | `boolean`             | `false` | - |

#### 引用和样式

| 属性          | 说明            | 类型                               | 默认值 |
| ------------- | --------------- | ---------------------------------- | ------ |
| bubbleListRef | 列表容器引用    | `MutableRefObject<HTMLDivElement>` | -      |
| bubbleRef     | 气泡组件引用    | `MutableRefObject<BubbleImperativeHandle>` | -      |
| className     | 自定义 CSS 类名 | `string`                           | -      |
| style         | 自定义内联样式  | `React.CSSProperties`              | -      |
| styles        | 详细样式配置    | `BubbleListStylesConfig`           | -      |

### 核心数据类型

#### MessageBubbleData

```typescript
interface MessageBubbleData {
  id: string; // 消息唯一标识
  role: 'user' | 'assistant' | 'system' | 'agent' | 'bot'; // 发送者角色
  content: React.ReactNode; // 消息内容
  createAt: number; // 创建时间戳
  updateAt: number; // 更新时间戳
  meta?: BubbleMetaData; // 元数据信息
  extra?: Record<string, any>; // 扩展信息
  fileMap?: Map<string, File>; // 文件附件
  error?: any; // 错误信息
  model?: string; // AI 模型标识
  isFinished?: boolean; // 是否完成生成
}
```

#### BubbleMetaData

```typescript
interface BubbleMetaData {
  avatar?: string; // 头像 URL
  title?: string; // 显示名称
  name?: string; // 名称（别名）
  description?: string; // 描述信息
  backgroundColor?: string; // 背景色
  metadata?: Record<string, unknown>; // 扩展元数据
}
```

> **变更说明**：移除了 `[key: string]: any` 索引签名，新增 `name` 和 `metadata` 属性。如需传递自定义数据，请使用 `metadata` 字段。

#### BubbleRenderConfig

自定义渲染配置，支持以下渲染函数：

```typescript
interface BubbleRenderConfig {
  titleRender?: CustomRenderFunction; // 标题自定义渲染
  contentRender?: CustomRenderFunction; // 内容自定义渲染
  avatarRender?: CustomRenderFunction; // 头像自定义渲染
  extraRender?: CustomRenderFunction; // 操作区域自定义渲染
  beforeMessageRender?: CustomRenderFunction; // 消息前自定义渲染
  afterMessageRender?: CustomRenderFunction; // 消息后自定义渲染
  render?: WholeRenderFunction; // 整体自定义渲染
}

type CustomRenderFunction = (
  props: BubbleProps,
  defaultDom: ReactNode,
) => ReactNode;
```

#### BubbleImperativeHandle

通过 `bubbleRef` 暴露的命令式方法：

```typescript
interface BubbleImperativeHandle {
  /** 更新消息项数据 */
  setMessageItem?: (id: string, data: Partial<MessageBubbleData>) => void;
}
```

#### BubbleSlotStyles（推荐）

简洁版样式配置接口，属性名不带 `bubble` 前缀：

```typescript
interface BubbleSlotStyles {
  root?: React.CSSProperties;        // 气泡根容器
  avatarTitle?: React.CSSProperties;  // 头像标题区域
  container?: React.CSSProperties;    // 主容器
  loadingIcon?: React.CSSProperties;  // 加载图标
  name?: React.CSSProperties;         // 名称区域
  content?: React.CSSProperties;      // 内容
  before?: React.CSSProperties;       // 内容前置区域
  after?: React.CSSProperties;        // 内容后置区域
  title?: React.CSSProperties;        // 标题
  avatar?: React.CSSProperties;       // 头像
  extra?: React.CSSProperties;        // 额外内容
}
```

> **变更说明**：新增 `BubbleSlotStyles` / `BubbleSlotClassNames` 作为推荐的样式接口，属性名更简洁。原 `BubbleStyles` / `BubbleClassNames`（带 `bubble` 前缀）仍可使用，但已标记为 deprecated。

#### AI 气泡属性

| 属性 | 说明 | 类型 | 默认值 | 废弃版本 |
| --- | --- | --- | --- | --- |
| aiBubbleProps | AI 气泡的属性配置 | `BubbleProps` | - | - |
| ~~aIBubbleProps~~ | 已废弃，请使用 `aiBubbleProps` | `BubbleProps` | - | 2.30.0 |

## 🎯 功能特性详解

### 消息连续性优化 (preMessageSameRole)

`preMessageSameRole` 是一个智能的消息连续性优化功能，用于提升连续对话的视觉体验。当连续的消息来自同一角色时，会自动隐藏重复的头像和标题信息，让对话更加简洁流畅。

#### 功能原理

组件会自动比较当前消息与前一条消息的角色：

- 如果角色相同，隐藏头像和标题区域
- 如果角色不同，显示完整的头像和标题信息
- 右侧布局（用户消息）始终隐藏头像和标题

#### 使用示例

```tsx | pure
import { Bubble, MessageBubbleData } from '@ant-design/agentic-ui';

// 连续的用户消息
const userMessages: MessageBubbleData[] = [
  {
    id: '1',
    role: 'user',
    content: '你好，我想了解一下产品功能',
    createAt: Date.now() - 60000,
    updateAt: Date.now() - 60000,
  },
  {
    id: '2',
    role: 'user',
    content: '能详细介绍一下吗？',
    createAt: Date.now() - 30000,
    updateAt: Date.now() - 30000,
  },
];

// 连续的助手消息
const assistantMessages: MessageBubbleData[] = [
  {
    id: '3',
    role: 'assistant',
    content: '当然可以，我们的产品具有以下特点...',
    createAt: Date.now() - 20000,
    updateAt: Date.now() - 20000,
  },
  {
    id: '4',
    role: 'assistant',
    content: `此外，还支持多种高级功能...
| 功能 | 描述 |
| -------- | -------- |
| 功能1 | 描述1 |
| 功能2 | 描述2 |
| 功能3 | 描述3 |
| 功能4 | 描述4 |
| 功能5 | 描述5 |
`,
    createAt: Date.now() - 10000,
    updateAt: Date.now() - 10000,
  },
];

const App = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 第一条用户消息 - 显示头像和标题 */}
      <Bubble
        originData={userMessages[0]}
        avatar={{ name: '用户', avatar: 'user-avatar.jpg' }}
        placement="right"
      />

      {/* 第二条用户消息 - 隐藏头像和标题（preMessageSameRole 生效） */}
      <Bubble
        originData={userMessages[1]}
        avatar={{ name: '用户', avatar: 'user-avatar.jpg' }}
        placement="right"
        preMessage={userMessages[0]} // 传入前一条消息
      />

      {/* 第一条助手消息 - 显示头像和标题 */}
      <Bubble
        originData={assistantMessages[0]}
        avatar={{ name: 'AI助手', avatar: 'ai-avatar.jpg' }}
        placement="left"
      />

      {/* 第二条助手消息 - 隐藏头像和标题（preMessageSameRole 生效） */}
      <Bubble
        originData={assistantMessages[1]}
        avatar={{ name: 'AI助手', avatar: 'ai-avatar.jpg' }}
        placement="left"
        preMessage={assistantMessages[0]} // 传入前一条消息
      />
    </div>
  );
};
```

#### 在消息列表中的应用

```tsx | pure
import { BubbleList } from '@ant-design/agentic-ui';

const messages: MessageBubbleData[] = [
  // 用户消息
  {
    id: '1',
    role: 'user',
    content: '你好',
    createAt: Date.now() - 60000,
    updateAt: Date.now() - 60000,
  },
  {
    id: '2',
    role: 'user',
    content: '我想咨询一个问题',
    createAt: Date.now() - 50000,
    updateAt: Date.now() - 50000,
  },

  // 助手消息
  {
    id: '3',
    role: 'assistant',
    content: '您好！很高兴为您服务',
    createAt: Date.now() - 40000,
    updateAt: Date.now() - 40000,
  },
  {
    id: '4',
    role: 'assistant',
    content: '请详细描述您的问题',
    createAt: Date.now() - 30000,
    updateAt: Date.now() - 30000,
  },

  // 用户消息
  {
    id: '5',
    role: 'user',
    content: `关于产品定价的问题
| 定价 | 描述 |
| -------- | -------- |
| 定价1 | 描述1 |
| 定价2 | 描述2 |
| 定价3 | 描述3 |
| 定价4 | 描述4 |
| 定价5 | 描述5 |
 `,
    createAt: Date.now() - 20000,
    updateAt: Date.now() - 20000,
  },
];

const App = () => (
  <BubbleList
    bubbleList={messages}
    assistantMeta={{ name: 'AI助手', avatar: 'ai-avatar.jpg' }}
    userMeta={{ name: '用户', avatar: 'user-avatar.jpg' }}
  />
);
```

#### 边界情况处理

组件智能处理各种边界情况：

```tsx | pure
// 1. 前一条消息未定义
<Bubble
  originData={currentMessage}
  preMessage={undefined} // 始终显示头像和标题
/>

// 2. 角色未定义的情况
<Bubble
  originData={{ ...currentMessage, role: undefined }}
  preMessage={{ ...prevMessage, role: undefined }}
  // 两个角色都为 undefined 时，视为相同角色，隐藏头像标题
/>

// 3. 右侧布局优先级
<Bubble
  originData={currentMessage}
  placement="right"
  preMessage={prevMessage}
  // 无论 preMessageSameRole 如何，右侧布局都隐藏头像标题
/>
```

#### 视觉效果对比

**启用 preMessageSameRole 前：**

```
👤 用户                    👤 用户
你好                      我想咨询一个问题

🤖 AI助手                  🤖 AI助手
您好！很高兴为您服务       请详细描述您的问题
```

**启用 preMessageSameRole 后：**

```
👤 用户
你好
我想咨询一个问题

🤖 AI助手
您好！很高兴为您服务
请详细描述您的问题
```

#### 配置选项

| 属性         | 类型                             | 说明                         | 默认值      |
| ------------ | -------------------------------- | ---------------------------- | ----------- |
| `preMessage` | `MessageBubbleData \| undefined` | 前一条消息数据，用于角色比较 | `undefined` |

#### 注意事项

- 该功能仅在左侧布局（`placement="left"`）中生效
- 右侧布局（`placement="right"`）始终隐藏头像和标题，不受此功能影响
- 当 `preMessage` 为 `undefined` 时，始终显示头像和标题
- 角色比较使用严格相等（`===`），包括 `undefined` 值的处理

### 自定义渲染系统

Bubble 组件提供了强大的自定义渲染系统，支持在不同阶段进行个性化定制：

#### 快速导航

- **🏷️ [标题自定义渲染](../demos/bubble/title-render-demo.tsx)** - 专门演示 `titleRender` 功能
- **📝 [内容自定义渲染](../demos/bubble/content-render-demo.tsx)** - 专门演示 `contentRender` 功能
- **👤 [头像自定义渲染](../demos/bubble/avatar-render-demo.tsx)** - 专门演示 `avatarRender` 功能

#### 1. 标题自定义 (titleRender)

```tsx | pure
const titleRender = (props, defaultDom) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <Badge dot color="#52c41a" />
    {defaultDom}
    <Tag color="blue">{props.originData?.model}</Tag>
  </div>
);
```

#### 2. 内容自定义 (contentRender)

```tsx | pure
const contentRender = (props, defaultDom) => {
  if (props.loading) {
    return <div>🤖 AI 正在思考...</div>;
  }
  return (
    <div style={{ border: '1px solid #d9d9d9', padding: 16 }}>{defaultDom}</div>
  );
};
```

#### 3. 头像自定义 (avatarRender)

```tsx | pure
const avatarRender = (props) => (
  <div style={{ position: 'relative' }}>
    <Avatar src={props.originData?.meta?.avatar} />
    <Badge dot color="#52c41a" offset={[-8, 8]} />
  </div>
);
```

#### 4. 操作区域自定义 (extraRender)

```tsx | pure
const extraRender = (props, defaultDom) => (
  <div style={{ display: 'flex', gap: 8 }}>
    <Button size="small" icon={<HeartOutlined />}>
      收藏
    </Button>
    <Button size="small" icon={<ShareAltOutlined />}>
      分享
    </Button>
    {defaultDom} {/* 保留默认操作 */}
  </div>
);
```

### beforeMessageRender 和 afterMessageRender 自定义消息前后渲染

`beforeMessageRender` 和 `afterMessageRender` 功能允许您在消息内容的前后添加自定义内容，这些内容会直接插入到 Markdown 内容的前后。

#### 使用示例

```tsx | pure
// 自定义 beforeMessageRender 函数
const customBeforeMessageRender = (props, defaultDom) => {
  const { originData } = props;

  return (
    <div
      style={{
        padding: '8px 12px',
        background: '#f6ffed',
        border: '1px solid #b7eb8f',
        borderRadius: '6px',
        marginBottom: '8px',
        fontSize: '12px',
        color: '#52c41a',
      }}
    >
      🔍 分析结果: 共找到 {originData?.extra?.searchCount || 0} 个相关结果
    </div>
  );
};

// 自定义 afterMessageRender 函数
const customAfterMessageRender = (props, defaultDom) => {
  const { originData } = props;

  return (
    <div
      style={{
        padding: '8px 12px',
        background: '#fff7e6',
        border: '1px solid #ffd591',
        borderRadius: '6px',
        marginTop: '8px',
        fontSize: '12px',
        color: '#fa8c16',
      }}
    >
      📊 生成统计: 耗时 {originData?.extra?.duration || 0}ms，使用{' '}
      {originData?.model || 'unknown'} 模型
    </div>
  );
};

// 使用配置
<Bubble
  originData={messageData}
  bubbleRenderConfig={{
    beforeMessageRender: customBeforeMessageRender, // 消息前渲染
    afterMessageRender: customAfterMessageRender, // 消息后渲染
  }}
/>;
```

#### 参数说明

- `props: BubbleProps<T>` - 当前气泡组件的所有属性，包括消息数据、配置等
- `defaultDom: ReactNode` - 默认为 `null`，可以忽略

#### 注意事项

- `beforeMessageRender` 和 `afterMessageRender` 在所有消息类型中都生效
- 当设置为 `false` 时，不会渲染任何内容
- 这些内容会直接插入到 Markdown 内容的前后，不会影响其他功能

### afterContentRender 和 beforeContentRender 自定义内容前后渲染

`afterContentRender` 和 `beforeContentRender` 功能允许您在消息内容的前后添加自定义内容，这些内容会直接插入到 Markdown 内容的前后。

**注意**: 这两个属性与 `beforeMessageRender` 和 `afterMessageRender` 功能类似，但它们是不同的属性。`beforeMessageRender` 和 `afterMessageRender` 是更新的 API，建议优先使用。

#### 使用示例

```tsx | pure
// 自定义 beforeContentRender 和 afterContentRender 函数
const customBeforeContentRender = (props, defaultDom) => {
  return (
    <div
      style={{
        padding: '8px 12px',
        background: '#f5f5f5',
        borderRadius: '6px',
        marginBottom: '8px',
        fontSize: '12px',
        color: '#666',
      }}
    >
      📝 消息创建时间: 2023-12-21 10:30:56
    </div>
  );
};

const customAfterContentRender = (props, defaultDom) => {
  return (
    <div
      style={{
        padding: '8px 12px',
        background: '#e6f7ff',
        borderRadius: '6px',
        marginTop: '8px',
        fontSize: '12px',
        color: '#1890ff',
      }}
    >
      ✅ 消息状态: {props.originData?.isFinished ? '已完成' : '生成中...'}
    </div>
  );
};

// 使用配置
<Bubble
  originData={messageData}
  bubbleRenderConfig={{
    beforeContentRender: customBeforeContentRender, // 内容前渲染
    afterContentRender: customAfterContentRender, // 内容后渲染
  }}
/>;
```

#### 内容渲染参数说明

- `props: BubbleProps<T>` - 当前气泡组件的所有属性，包括消息数据、配置等
- `defaultDom: ReactNode` - 默认为 `null`，可以忽略

#### 内容渲染注意事项

- `beforeContentRender` 和 `afterContentRender` 只在左侧消息（AI回复）中生效
- 当设置为 `false` 时，不会渲染任何内容
- 这些内容会直接插入到 Markdown 内容的前后，不会影响其他功能
- 支持返回任何有效的 React 节点，包括组件、HTML 元素等

### render 整体自定义渲染

`render` 功能允许您完全自定义整个气泡组件的渲染方式，提供最大的灵活性。

#### 整体渲染示例

```tsx | pure
// 自定义 render 函数
const customRender = (props, domsMap, defaultDom) => {
  const { avatar, title, messageContent, itemDom } = domsMap;
  const { originData, placement, loading } = props;

  // 完全自定义布局
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: placement === 'right' ? 'row-reverse' : 'row',
        gap: '12px',
        padding: '16px',
        background: placement === 'right' ? '#f0f9ff' : '#fafafa',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
      }}
    >
      {/* 头像区域 */}
      <div style={{ flexShrink: 0 }}>{avatar}</div>

      {/* 内容区域 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* 标题区域 */}
        <div style={{ marginBottom: '8px' }}>{title}</div>

        {/* 消息内容 */}
        <div
          style={{
            background: 'white',
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          {messageContent}
        </div>

        {/* 额外信息 */}
        {originData?.extra && (
          <div
            style={{
              marginTop: '8px',
              padding: '8px',
              background: '#f8f9fa',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#6c757d',
            }}
          >
            💡 提示: 这是自定义渲染的消息
          </div>
        )}
      </div>
    </div>
  );
};

// 使用配置
<Bubble
  originData={messageData}
  bubbleRenderConfig={{
    render: customRender, // 自定义整体渲染
  }}
/>;
```

#### 整体渲染参数说明

- `props: BubbleProps<T>` - 当前气泡组件的所有属性，包括消息数据、配置等
- `domsMap: { avatar: ReactNode; title: ReactNode; messageContent: ReactNode; itemDom: ReactNode }` - 各个部分的默认渲染结果
- `defaultDom: ReactNode` - 默认的整体渲染结果

#### 整体渲染注意事项

- `render` 在所有消息类型中都生效
- 当设置 `render: false` 时，会使用默认的渲染逻辑
- 自定义整体渲染会完全替换默认的布局和样式
- 可以通过 `domsMap` 参数获取各个部分的默认渲染结果进行组合

### extraRightRender 自定义右侧额外操作区域

`extraRightRender` 功能允许您自定义右侧消息的额外操作区域，通常用于用户消息的自定义操作。

#### 使用示例

```tsx | pure
// 自定义 extraRightRender 函数
const customExtraRightRender = (props, defaultDom) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {/* 自定义操作按钮 */}
      <Button
        size="small"
        icon={<EditOutlined />}
        onClick={() => handleEdit(props.id)}
      >
        编辑
      </Button>
      <Button
        size="small"
        icon={<DeleteOutlined />}
        danger
        onClick={() => handleDelete(props.id)}
      >
        删除
      </Button>
    </div>
  );
};

// 使用配置
<Bubble
  originData={messageData}
  placement="right"
  bubbleRenderConfig={{
    extraRightRender: customExtraRightRender, // 自定义右侧额外操作
  }}
/>;
```

#### 右侧操作参数说明

- `props: BubbleProps<T>` - 当前气泡组件的所有属性，包括消息数据、配置等
- `defaultDom: ReactNode` - 默认的右侧额外操作区域内容

#### 右侧操作注意事项

- `extraRightRender` 只在右侧消息（用户消息）中生效
- 当设置 `extraRightRender: false` 时，会完全禁用右侧额外操作区域
- 自定义右侧操作区域不会影响左侧消息的额外操作区域

### 文件附件支持

组件内置了强大的文件处理能力：

- **📄 文档类型**：PDF、DOC、TXT、MD 等
- **🖼️ 图片类型**：PNG、JPG、GIF、SVG、WebP 等
- **📊 数据类型**：JSON、CSV、XML、YAML 等
- **🎵 媒体类型**：MP3、MP4、WebM、AVI 等

```tsx | pure
const messageWithFiles: MessageBubbleData = {
  id: '1',
  content: '这里是一些相关文件',
  fileMap: new Map([
    ['report.pdf', pdfFile],
    ['chart.png', imageFile],
  ]),
  // ... 其他属性
};
```

### Pure 模式

为嵌入式场景提供的简洁模式：

```tsx | pure
// 启用 Pure 模式
<Bubble pure originData={message} />

// 对比展示
<div style={{ display: 'flex', gap: 16 }}>
  <Bubble originData={message} />        {/* 标准模式 */}
  <Bubble pure originData={message} />   {/* Pure 模式 */}
</div>
```

**适用场景：**

- 🔸 页面内嵌对话
- 🔸 邮件消息预览
- 🔸 移动端界面
- 🔸 白色背景融合

### 主题和样式定制

支持多层次的样式定制：

```tsx | pure
// 1. 全局样式配置
<Bubble
  styles={{
    bubbleListItemContentStyle: { borderRadius: '12px' },
    bubbleListItemTitleStyle: { fontWeight: 'bold' },
    bubbleListItemAvatarStyle: { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  }}
/>

// 2. 内联样式
<Bubble
  style={{ margin: '16px 0' }}
  className="custom-bubble"
/>

// 3. 通过 CSS 变量
.custom-bubble {
  --bubble-bg-color: #f0f9ff;
  --bubble-border-color: #3b82f6;
}
```

### 交互操作系统

内置丰富的交互功能：

```tsx | pure
<Bubble
  originData={message}
  onLike={async (bubble) => {
    await api.like(bubble.id);
    message.success('点赞成功');
  }}
  onDislike={async (bubble) => {
    await api.dislike(bubble.id);
    message.info('已点踩');
  }}
  // 或者使用已废弃的 onDisLike（保持向后兼容）
  // onDisLike={async (bubble) => {
  //   await api.dislike(bubble.id);
  //   message.info('已点踩');
  // }}
  onLikeCancel={async (bubble) => {
    await api.cancelLike(bubble.id);
    message.info('已取消点赞');
  }}
  // 或者使用已废弃的 onCancelLike（保持向后兼容）
  // onCancelLike={async (bubble) => {
  //   await api.cancelLike(bubble.id);
  //   message.info('已取消点赞');
  // }}
  onReply={(content) => {
    addMessage({ role: 'user', content });
  }}
  onAvatarClick={() => {
    showUserProfile();
  }}
/>
```

### 性能优化特性

- **🚀 虚拟滚动**：支持数万条消息流畅展示
- **⚡ 按需渲染**：只渲染可见区域内容
- **💾 智能缓存**：自动缓存渲染结果
- **📱 移动端优化**：触摸交互体验优化

### 无障碍访问

组件遵循 WCAG 2.1 标准：

- **键盘导航**：支持 Tab、Enter、Space 等键盘操作
- **屏幕阅读器**：提供合适的 ARIA 标签和角色
- **高对比度**：支持高对比度主题
- **语义化结构**：使用语义化的 HTML 标签

## Render 方法优先级说明

当同时配置多个 render 方法时，它们的优先级和执行顺序如下：

1. **render** - 最高优先级，如果设置了 `render`，其他所有 render 方法都会被忽略
2. **titleRender** - 自定义标题渲染
3. **avatarRender** - 自定义头像渲染
4. **contentRender** - 自定义内容渲染
5. **contentBeforeRender** - 内容前渲染
6. **contentAfterRender** - 内容后渲染
7. **beforeMessageRender** - 消息前渲染
8. **afterMessageRender** - 消息后渲染
9. **beforeContentRender** - 内容前渲染（仅左侧消息）
10. **afterContentRender** - 内容后渲染（仅左侧消息）
11. **extraRender** - 额外操作区域渲染（仅左侧消息）
12. **extraRightRender** - 右侧额外操作区域渲染（仅右侧消息）

### 组合使用示例

```tsx | pure
import { Bubble } from '@ant-design/agentic-ui';
import { Button } from 'antd';
import { StarOutlined } from '@ant-design/icons';

const messageData = {
  id: '1',
  content: 'Hello, world!',
  createAt: Date.now(),
  updateAt: Date.now(),
  extra: {
    like: 0,
  },
};

// 组合使用多个 render 方法
const App = () => {
  return (
    <>
      <Bubble
        originData={messageData}
        bubbleRenderConfig={{
          // 自定义标题
          titleRender: (props) => (
            <div style={{ color: '#1890ff', fontWeight: 'bold' }}>
              {props.avatar?.title || 'AI助手'}
            </div>
          ),

          // 自定义头像
          avatarRender: (props) => (
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#52c41a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              🤖
            </div>
          ),
          beforeMessageRender: (props) => (
            <div
              style={{
                padding: '8px',
                background: '#fff7e6',
                borderRadius: '4px',
                marginBottom: '8px',
                fontSize: '12px',
              }}
            >
              <div>💡 消息前提示</div>
            </div>
          ),
          afterMessageRender: (props) => (
            <div
              style={{
                padding: '8px',
                background: '#f6ffed',
                borderRadius: '4px',
                marginTop: '8px',
                fontSize: '12px',
              }}
            >
              <div>💡 消息后提示</div>
            </div>
          ),
          // 内容前添加提示
          contentBeforeRender: (props) => (
            <div
              style={{
                padding: '8px',
                background: '#fff7e6',
                borderRadius: '4px',
                marginBottom: '8px',
                fontSize: '12px',
              }}
            >
              💡 这是 AI 生成的回复
            </div>
          ),

          // 内容后添加统计
          contentAfterRender: (props) => (
            <div
              style={{
                padding: '8px',
                background: '#f6ffed',
                borderRadius: '4px',
                marginTop: '8px',
                fontSize: '12px',
              }}
            >
              📊 生成时间:{' '}
              {new Date(props.originData?.createAt).toLocaleTimeString()}
            </div>
          ),
          // 自定义额外操作
          extraRender: (props, defaultDom) => (
            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <Button
                size="small"
                type="text"
                icon={<StarOutlined />}
                style={{
                  width: 120,
                }}
              >
                收藏
              </Button>
              {defaultDom}
            </div>
          ),
        }}
      />
    </>
  );
};
export default App;
```

通过合理组合这些 render 方法，您可以实现高度自定义的消息气泡组件，满足各种复杂的业务需求。

## 💡 最佳实践

### 性能优化建议

1. **合理使用自定义渲染**

   ```tsx | pure
   // ✅ 推荐：使用 React.memo 优化自定义渲染函数
   const titleRender = React.memo((props, defaultDom) => (
     <div>
       {defaultDom} <Tag>{props.originData?.model}</Tag>
     </div>
   ));
   ```

2. **文件处理优化**

   ```tsx | pure
   // ✅ 推荐：对大文件进行懒加载
   const fileMap = useMemo(
     () => new Map([['large-file.pdf', createFileReference('large-file.pdf')]]),
     [],
   );
   ```

3. **大量消息处理**
   ```tsx | pure
   // ✅ 推荐：使用 BubbleList 的虚拟滚动
   <BubbleList
     bubbleList={messages}
     style={{ height: 500, overflow: 'auto' }}
   />
   ```

### 常见问题解决

**Q: 如何实现消息流式更新？**

```tsx | pure
const [currentMessage, setCurrentMessage] = useState('');

useEffect(() => {
  const stream = new EventSource('/api/chat-stream');
  stream.onmessage = (event) => {
    const chunk = JSON.parse(event.data);
    setCurrentMessage((prev) => prev + chunk.content);
  };
}, []);
```

**Q: 如何自定义消息时间显示？**

```tsx | pure
const titleRender = (props, defaultDom) => (
  <div>
    {defaultDom}
    <span style={{ color: '#999', fontSize: '12px' }}>
      {formatRelativeTime(props.originData?.createAt)}
    </span>
  </div>
);
```

**Q: 如何实现消息分组？**

```tsx | pure
const groupedMessages = useMemo(() => {
  return messages.reduce((groups, message) => {
    const date = format(message.createAt, 'yyyy-MM-dd');
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});
}, [messages]);
```

## 🔗 相关资源

- [MarkdownEditor 组件](/components/markdown-editor) - 配套的 Markdown 编辑器
- [ThoughtChainList 组件](/components/thought-chain-list) - 思维链展示组件
- [TaskList 组件](/components/task-list) - 任务列表组件
- [设计规范文档](/guide/design) - 组件设计原则和规范

---

_Bubble 组件是 @ant-design/agentic-ui 的核心组件之一，持续更新中。如果遇到问题或有改进建议，欢迎提交 [Issue](https://github.com/ant-design/agentic-ui/issues) 或 [PR](https://github.com/ant-design/agentic-ui/pulls)。_
