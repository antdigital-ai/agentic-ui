---
title: FileAttachment 文件附件
atomId: FileAttachment
order: 11
group:
  title: 图文输出
  order: 4
---

# 文件附件

文件附件是 Bubble 组件的内置功能，用于在对话气泡中展示和处理多种类型的文件，支持图片预览、文档展示和文件下载。

> 💡 文件附件功能通过 `Bubble` 组件的 `fileMap` 属性使用，无需单独引入。如需独立使用文件列表组件，请参考 [FileMapView](./FileMapView.md)。

## ✨ 功能特点

- 📁 **多格式支持**：支持图片、PDF、Word、JSON 等多种文件格式
- 🖼️ **图片预览**：图片文件自动展示缩略图
- 📄 **智能识别**：根据文件类型自动匹配图标和展示方式
- ⬇️ **文件下载**：支持文件预览和下载操作
- 🎨 **灵活布局**：根据文件数量和类型自动调整布局

## 代码演示

### 基础用法

演示如何处理和展示不同类型的文件附件，支持多种文件格式。

<code src="../demos/bubble/file-view.tsx" background="var(--main-bg-color)" iframe=540></code>

## API 参考

### AttachmentFile

文件附件数据结构：

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| name | 文件名（必填） | `string` | - | - |
| type | 文件 MIME 类型（必填） | `string` | - | - |
| size | 文件大小（字节）（必填） | `number` | - | - |
| url | 文件下载/预览地址（必填） | `string` | - | - |
| lastModified | 最后修改时间戳 | `number` | - | - |
| webkitRelativePath | 相对路径 | `string` | - | - |
| previewUrl | 预览图地址 | `string` | - | - |
| status | 文件状态 | `'uploading' \| 'done' \| 'error'` | - | - |
| uuid | 文件唯一标识 | `string` | - | - |

### MessageBubbleData.fileMap

在消息数据中通过 `fileMap` 属性传入文件附件：

```typescript
interface MessageBubbleData {
  // ... 其他属性
  fileMap?: Map<string, AttachmentFile>;
}
```

### fileViewConfig

文件视图配置（在 Bubble 组件中使用）：

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| maxDisplayCount | 最多展示的非图片文件数量 | `number` | - | - |
| showMoreButton | 是否显示"查看更多"按钮 | `boolean` | `false` | - |
| renderFileMoreAction | 自定义文件更多操作渲染 | `(file: AttachmentFile) => React.ReactNode` | - | - |

### fileViewEvents

文件视图事件配置：

| 事件       | 说明             | 类型                                                       |
| ---------- | ---------------- | ---------------------------------------------------------- |
| onPreview  | 文件预览回调     | `(file: AttachmentFile) => void`                           |
| onDownload | 文件下载回调     | `(file: AttachmentFile) => void`                           |
| onViewAll  | 查看所有文件回调 | `(files: AttachmentFile[]) => boolean \| Promise<boolean>` |

## 使用说明

### 基本用法

在 Bubble 组件中通过 `fileMap` 属性传入文件：

```tsx | pure
import {
  Bubble,
  MessageBubbleData,
  AttachmentFile,
} from '@ant-design/agentic-ui';

// 创建文件对象
const createFile = (
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
});

// 消息数据
const message: MessageBubbleData = {
  id: '1',
  role: 'assistant',
  content: '这里是相关文件：',
  fileMap: new Map([
    [
      'report.pdf',
      createFile(
        'report.pdf',
        'application/pdf',
        1024 * 1024,
        'https://example.com/report.pdf',
      ),
    ],
    [
      'image.png',
      createFile(
        'image.png',
        'image/png',
        512 * 1024,
        'https://example.com/image.png',
      ),
    ],
  ]),
};

<Bubble originData={message} />;
```

### 支持的文件类型

#### 图片格式

| 格式 | MIME 类型       |
| ---- | --------------- |
| JPEG | `image/jpeg`    |
| PNG  | `image/png`     |
| GIF  | `image/gif`     |
| WebP | `image/webp`    |
| SVG  | `image/svg+xml` |

#### 文档格式

| 格式       | MIME 类型                                                                |
| ---------- | ------------------------------------------------------------------------ |
| PDF        | `application/pdf`                                                        |
| Word       | `application/msword`, `application/vnd.openxmlformats-officedocument...` |
| PowerPoint | `application/vnd.ms-powerpoint`, `application/vnd.openxmlformats-...`    |
| Excel      | `application/vnd.ms-excel`, `application/vnd.openxmlformats-...`         |

#### 数据格式

| 格式 | MIME 类型            |
| ---- | -------------------- |
| JSON | `application/json`   |
| YAML | `application/x-yaml` |
| TXT  | `text/plain`         |
| MD   | `text/markdown`      |

### 限制显示数量

当文件较多时，可以限制初始显示数量：

```tsx | pure
<Bubble
  originData={message}
  fileViewConfig={{
    maxDisplayCount: 3,
  }}
  fileViewEvents={({ onViewAll }) => ({
    onViewAll: (files) => {
      console.log(`共有 ${files.length} 个文件`);
      return true; // 返回 true 展开所有文件
    },
  })}
/>
```

### 自定义更多操作

```tsx | pure
import { Popover, Button } from 'antd';
import {
  MoreOutlined,
  ShareAltOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

<Bubble
  originData={message}
  fileViewConfig={{
    renderFileMoreAction: (file) => (
      <Popover
        trigger="click"
        content={
          <div>
            <Button type="text" icon={<ShareAltOutlined />}>
              分享
            </Button>
            <Button type="text" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </div>
        }
      >
        <Button type="text" icon={<MoreOutlined />} />
      </Popover>
    ),
  }}
/>;
```

## 使用场景

- **文档分享**：AI 生成报告、文档后展示下载
- **图片展示**：展示 AI 生成的图片或相关图片资料
- **数据导出**：提供 JSON、CSV 等数据文件下载
- **混合内容**：同时展示多种类型的文件附件

## 最佳实践

1. **预览优化**：为图片提供压缩后的 `previewUrl`，提升加载速度
2. **类型标注**：确保 `type` 字段使用正确的 MIME 类型
3. **数量控制**：大量文件时使用 `maxDisplayCount` 限制初始显示
4. **错误处理**：处理文件加载失败的情况，提供友好提示

## 相关组件

- [Bubble 气泡组件](./bubble.md) - 消息气泡容器
- [FileMapView 文件预览](./FileMapView.md) - 独立的文件列表组件
- [Workspace 工作空间](./workspace.md) - 文件管理工作区
