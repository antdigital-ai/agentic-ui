---
nav:
  title: 组件
  order: 1
atomId: FileMapView
group:
  title: 图文输出
  order: 4
---

# FileMapView - 文件预览组件

FileMapView 是一个强大的文件预览组件,支持多种文件类型的展示和预览功能,提供友好的文件列表视图。

## 功能特性

- 📁 **多文件支持**: 支持同时展示多个文件
- 🖼️ **图片预览**: 支持图片文件的缩略图展示
- 📄 **多格式支持**: 支持 PDF、Word、PPT、JSON、YAML 等多种文件格式
- 🎨 **智能布局**: 根据文件数量自动调整展示布局
- 📱 **响应式设计**: 适配不同屏幕尺寸
- 🔧 **类型安全**: 完整的 TypeScript 类型支持

## 基本用法

<code src="../demos/fileMapView.tsx" background="var(--main-bg-color)" iframe=540 ></code>

## API 参考

### Props

| 属性               | 类型                                                             | 默认值  | 说明                                                                                  |
| ------------------ | ---------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| `fileMap`          | `Map<string, AttachmentFile>`                                    | -       | 文件映射对象                                                                          |
| `maxDisplayCount`  | `number`                                                         | -       | 最多展示的非图片文件数量，传入则开启溢出控制并在超出时显示"查看所有文件"按钮          |
| `showMoreButton`   | `boolean`                                                        | `false` | 是否显示"查看更多"按钮                                                                |
| `onPreview`        | `(file: AttachmentFile) => void`                                 | -       | 预览文件回调                                                                          |
| `onDownload`       | `(file: AttachmentFile) => void`                                 | -       | 下载文件回调                                                                          |
| `onViewAll`        | `(files: AttachmentFile[]) => boolean \| Promise<boolean>`       | -       | 点击"查看所有文件"回调，返回 `true` 时组件内部展开所有文件，返回 `false` 时由外部处理 |
| `renderMoreAction` | `(file: AttachmentFile) => React.ReactNode`                      | -       | 自定义更多操作 DOM（传入则展示该 DOM，不传则不展示更多按钮）                          |
| `customSlot`       | `React.ReactNode \| ((file: AttachmentFile) => React.ReactNode)` | -       | 自定义悬浮动作区 slot（传入则覆盖默认『预览/下载/更多』动作区）                       |
| `style`            | `React.CSSProperties`                                            | -       | 自定义根容器样式（可覆盖布局，如 flexDirection、gap、wrap 等）                        |
| `className`        | `string`                                                         | -       | 自定义根容器类名                                                                      |
| `placement`        | `'left' \| 'right'`                                              | `left`  | 文件列表位置                                                                          |

### AttachmentFile

| 属性           | 类型     | 说明           |
| -------------- | -------- | -------------- |
| `name`         | `string` | 文件名         |
| `url`          | `string` | 文件下载链接   |
| `type`         | `string` | 文件 MIME 类型 |
| `status`       | `string` | 文件状态       |
| `previewUrl`   | `string` | 文件预览链接   |
| `size`         | `number` | 文件大小(字节) |
| `uuid`         | `string` | 文件唯一标识符 |
| `lastModified` | `number` | 最后修改时间戳 |

## 支持的文件类型

### 图片格式

- JPEG/JPG
- PNG
- GIF
- WebP

### 文档格式

- PDF (application/pdf)
- Word (application/msword, .docx)
- PowerPoint (application/vnd.ms-powerpoint, .pptx)

### 数据格式

- JSON (application/json)
- YAML/YML (application/x-yaml)
- TXT (text/plain)

## 使用示例

### 基本示例

```tsx | pure
import { FileMapView, AttachmentFile } from '@ant-design/agentic-ui';

const fileMap = new Map<string, AttachmentFile>();
fileMap.set('file-1', {
  name: 'example.jpg',
  url: 'https://example.com/file.jpg',
  type: 'image/jpeg',
  status: 'done',
  previewUrl: 'https://example.com/preview.jpg',
  size: 1024,
  uuid: 'uuid-1',
  lastModified: Date.now(),
});

export default () => {
  return <FileMapView fileMap={fileMap} />;
};
```

### 限制显示数量

使用 `maxDisplayCount` 限制非图片文件的显示数量，超出部分会显示"查看所有文件"按钮：

```tsx | pure
import { FileMapView, AttachmentFile } from '@ant-design/agentic-ui';
import { message } from 'antd';

const fileMap = new Map<string, AttachmentFile>();

// 添加多个文件
[
  'document1.pdf',
  'document2.pdf',
  'data.json',
  'report.docx',
  'slides.pptx',
].forEach((name, index) => {
  fileMap.set(`file-${index}`, {
    name,
    url: `https://example.com/${name}`,
    type: getFileType(name),
    status: 'done',
    previewUrl: `https://example.com/preview-${name}`,
    size: 1024 * (index + 1),
    uuid: `uuid-${index}`,
    lastModified: Date.now(),
  });
});

export default () => {
  return (
    <FileMapView
      fileMap={fileMap}
      maxDisplayCount={2}
      onViewAll={(files) => {
        message.info(`共有 ${files.length} 个文件`);
        return true; // 返回 true 展开所有文件
      }}
    />
  );
};
```

### 自定义预览和下载

```tsx | pure
import { FileMapView, AttachmentFile } from '@ant-design/agentic-ui';
import { message } from 'antd';

export default () => {
  const handlePreview = (file: AttachmentFile) => {
    message.success(`预览文件: ${file.name}`);
    window.open(file.previewUrl || file.url, '_blank');
  };

  const handleDownload = (file: AttachmentFile) => {
    message.success(`下载文件: ${file.name}`);
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <FileMapView
      fileMap={fileMap}
      onPreview={handlePreview}
      onDownload={handleDownload}
    />
  );
};
```

### 自定义更多操作

使用 `renderMoreAction` 添加自定义的更多操作按钮：

```tsx | pure
import { FileMapView, AttachmentFile } from '@ant-design/agentic-ui';
import { Popover } from 'antd';
import {
  CopyOutlined,
  DownloadOutlined,
  EditOutlined,
  ShareAltOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

export default () => {
  const renderMoreAction = (file: AttachmentFile) => (
    <Popover
      placement="bottomRight"
      arrow={false}
      trigger={['hover']}
      content={
        <div
          style={{
            width: 180,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {[
            {
              key: 'copy',
              label: '复制',
              icon: <CopyOutlined />,
              onClick: () => console.log('复制', file),
            },
            {
              key: 'download',
              label: '下载',
              icon: <DownloadOutlined />,
              onClick: () => console.log('下载', file),
            },
            {
              key: 'edit',
              label: '编辑',
              icon: <EditOutlined />,
              onClick: () => console.log('编辑', file),
            },
            {
              key: 'share',
              label: '分享',
              icon: <ShareAltOutlined />,
              onClick: () => console.log('分享', file),
            },
          ].map((item) => (
            <div
              key={item.key}
              onClick={(e) => {
                e.stopPropagation();
                item.onClick();
              }}
              style={{
                height: 36,
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              <span style={{ width: 20 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
            </div>
          ))}
          <div
            onClick={(e) => {
              e.stopPropagation();
              console.log('删除', file);
            }}
            style={{
              height: 36,
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              borderRadius: 8,
              cursor: 'pointer',
              color: '#ff4d4f',
            }}
          >
            <span style={{ width: 20 }}>
              <DeleteOutlined />
            </span>
            <span style={{ flex: 1 }}>删除</span>
          </div>
        </div>
      }
    >
      <div style={{ width: 18, height: 18 }} />
    </Popover>
  );

  return <FileMapView fileMap={fileMap} renderMoreAction={renderMoreAction} />;
};
```

### 自定义悬浮动作区

使用 `customSlot` 完全自定义文件项的悬浮动作区：

```tsx | pure
import { FileMapView, AttachmentFile } from '@ant-design/agentic-ui';
import { Button, Space } from 'antd';

export default () => {
  const customSlot = (file: AttachmentFile) => (
    <Space>
      <Button
        size="small"
        type="primary"
        onClick={() => console.log('打开', file)}
      >
        打开
      </Button>
      <Button size="small" onClick={() => console.log('分享', file)}>
        分享
      </Button>
    </Space>
  );

  return <FileMapView fileMap={fileMap} customSlot={customSlot} />;
};
```

### 右侧布局

使用 `placement` 属性控制文件列表的位置：

```tsx | pure
import { FileMapView, AttachmentFile } from '@ant-design/agentic-ui';

export default () => {
  return <FileMapView fileMap={fileMap} placement="right" />;
};
```

### 自定义样式

使用 `style` 和 `className` 自定义组件样式：

```tsx | pure
import { FileMapView, AttachmentFile } from '@ant-design/agentic-ui';

export default () => {
  return (
    <FileMapView
      fileMap={fileMap}
      style={{
        width: '100%',
        maxWidth: 600,
        gap: 8,
      }}
      className="custom-file-view"
    />
  );
};
```

### 完整示例（结合 Bubble 组件）

在 Bubble 组件中使用 FileMapView：

```tsx | pure
import { Bubble, MessageBubbleData, AttachmentFile } from '@ant-design/agentic-ui';
import { message } from 'antd';

const mockFileMessage: MessageBubbleData = {
  id: '1',
  role: 'assistant',
  content: '以下是相关的设计文档和示例图片：',
  fileMap: mockFileMap,
  // ... 其他属性
};

export default () => {
  return (
    <Bubble
      originData={mockFileMessage}
      placement="left"
      fileViewConfig={{
        maxDisplayCount: 2,
        renderFileMoreAction: (file) => (
          // 自定义更多操作
        ),
      }}
      fileViewEvents={({ onPreview, onDownload, onViewAll }) => ({
        onPreview: (file) => {
          onPreview(file);
          message.success('预览文件');
        },
        onDownload: (file) => {
          onDownload(file);
          message.success('下载文件');
        },
        onViewAll: (files) => {
          message.info(`共有 ${files.length} 个文件`);
        },
      })}
    />
  );
};
```

## 布局特性

FileMapView 会根据文件数量和类型自动调整布局:

- **图片文件**: 使用网格布局展示,支持图片预览组
- **非图片文件**: 使用列表布局展示
- **混合文件**: 图片在上方网格展示,其他文件在下方列表展示
- **溢出控制**: 当非图片文件超过 `maxDisplayCount` 时,显示"查看所有文件"按钮

## 高级用法

### 文件事件处理

FileMapView 支持多种文件操作事件,可以通过回调函数自定义处理逻辑:

```tsx | pure
const handlePreview = (file: AttachmentFile) => {
  // 根据文件类型执行不同的预览逻辑
  if (file.type.startsWith('image/')) {
    // 图片预览
    window.open(file.previewUrl, '_blank');
  } else if (file.type === 'application/pdf') {
    // PDF 预览
    window.open(file.url, '_blank');
  } else {
    // 其他文件类型
    message.info('该文件类型暂不支持预览');
  }
};

const handleDownload = (file: AttachmentFile) => {
  // 自定义下载逻辑
  fetch(file.url)
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
};

const handleViewAll = async (files: AttachmentFile[]) => {
  // 可以打开一个模态框显示所有文件
  Modal.info({
    title: '所有文件',
    content: (
      <ul>
        {files.map((file) => (
          <li key={file.uuid}>{file.name}</li>
        ))}
      </ul>
    ),
  });

  // 返回 false 表示由外部处理,不展开组件内部的文件列表
  return false;
};
```

### 动态文件管理

```tsx | pure
import { FileMapView, AttachmentFile } from '@ant-design/agentic-ui';
import { useState } from 'react';
import { Button, message } from 'antd';

export default () => {
  const [fileMap, setFileMap] = useState(new Map<string, AttachmentFile>());

  const addFile = (file: AttachmentFile) => {
    setFileMap((prev) => {
      const newMap = new Map(prev);
      newMap.set(file.uuid, file);
      return newMap;
    });
  };

  const removeFile = (uuid: string) => {
    setFileMap((prev) => {
      const newMap = new Map(prev);
      newMap.delete(uuid);
      return newMap;
    });
  };

  return (
    <div>
      <FileMapView
        fileMap={fileMap}
        renderMoreAction={(file) => (
          <Button
            size="small"
            danger
            onClick={() => {
              removeFile(file.uuid);
              message.success('文件已删除');
            }}
          >
            删除
          </Button>
        )}
      />
    </div>
  );
};
```

### 文件权限控制

根据用户权限显示不同的操作按钮:

```tsx | pure
import { FileMapView, AttachmentFile } from '@ant-design/agentic-ui';

const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
  GUEST: 'guest',
};

export default () => {
  const currentUserRole = UserRole.USER;

  const canDownload = currentUserRole !== UserRole.GUEST;
  const canDelete = currentUserRole === UserRole.ADMIN;

  return (
    <FileMapView
      fileMap={fileMap}
      onPreview={(file) => {
        // 所有用户都可以预览
        window.open(file.previewUrl, '_blank');
      }}
      onDownload={
        canDownload
          ? (file) => {
              // 只有非游客可以下载
              downloadFile(file);
            }
          : undefined
      }
      renderMoreAction={
        canDelete
          ? (file) => (
              // 只有管理员可以看到删除按钮
              <Button danger onClick={() => deleteFile(file)}>
                删除
              </Button>
            )
          : undefined
      }
    />
  );
};
```

### 文件加载状态

处理文件加载和错误状态:

```tsx | pure
import { FileMapView, AttachmentFile } from '@ant-design/agentic-ui';
import { Spin, Alert } from 'antd';
import { useState, useEffect } from 'react';

export default () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileMap, setFileMap] = useState(new Map<string, AttachmentFile>());

  useEffect(() => {
    fetchFiles()
      .then((files) => {
        const map = new Map();
        files.forEach((file) => map.set(file.uuid, file));
        setFileMap(map);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Spin tip="加载文件中..." />;
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return <FileMapView fileMap={fileMap} />;
};
```

## 注意事项

### 性能优化

1. **文件大小**: 建议合理控制预览图片的大小,避免影响加载性能
2. **懒加载**: 对于大量文件,建议使用 `maxDisplayCount` 限制初始显示数量
3. **图片优化**: 使用 `previewUrl` 提供压缩后的预览图,而不是原图
4. **内存管理**: 及时清理不再使用的文件 Map,避免内存泄漏

### 类型安全

1. **文件类型**: 确保 `type` 字段使用正确的 MIME 类型
2. **必填字段**: `name`、`url`、`uuid` 是必需的字段
3. **类型检查**: 使用 TypeScript 确保类型正确

### 用户体验

1. **预览链接**: `previewUrl` 应该指向可访问的资源地址
2. **错误处理**: 提供友好的错误提示和降级方案
3. **加载状态**: 显示文件加载状态,避免用户等待
4. **操作反馈**: 文件操作后提供明确的反馈信息

### 安全性

1. **URL 验证**: 验证文件 URL 的合法性,防止 XSS 攻击
2. **文件类型**: 限制可预览和下载的文件类型
3. **权限控制**: 根据用户权限控制文件操作
4. **跨域处理**: 处理跨域文件访问问题

### 兼容性

1. **浏览器支持**: 确保在目标浏览器中正常工作
2. **移动端适配**: 在移动设备上测试文件预览和下载功能
3. **文件大小限制**: 考虑浏览器和设备的文件大小限制

## 常见问题

### 如何自定义文件图标?

FileMapView 会根据文件类型自动显示对应的图标。如果需要自定义,可以通过 CSS 覆盖默认样式。

### 图片预览不显示怎么办?

1. 检查 `previewUrl` 或 `url` 是否正确
2. 确认图片资源可访问
3. 检查是否有跨域问题
4. 验证 `type` 字段是否为图片类型

### 如何限制文件类型?

在传入 `fileMap` 之前过滤文件:

```tsx | pure
const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
const filteredMap = new Map(
  Array.from(fileMap).filter(([_, file]) => allowedTypes.includes(file.type)),
);
```

### 如何实现文件上传?

FileMapView 是纯展示组件,不包含上传功能。可以配合 Upload 组件使用:

```tsx | pure
import { Upload } from 'antd';
import { FileMapView, AttachmentFile } from '@ant-design/agentic-ui';

const [fileMap, setFileMap] = useState(new Map());

const handleUpload = (file) => {
  // 上传文件后添加到 fileMap
  const newFile: AttachmentFile = {
    name: file.name,
    url: file.url,
    type: file.type,
    // ... 其他属性
  };
  setFileMap((prev) => new Map(prev).set(newFile.uuid, newFile));
};
```

## 相关组件

- [Workspace](./workspace.md) - 工作区组件
- [Bubble](./bubble.md) - 气泡组件

## 更新日志

### v1.0.0

- 初始版本发布
- 支持多种文件格式预览
- 支持智能布局
- 支持响应式设计
