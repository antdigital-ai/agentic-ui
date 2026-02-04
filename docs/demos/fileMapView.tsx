import { AttachmentFile, FileMapView } from '@ant-design/agentic-ui';
import {
  CheckOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { Divider, message, Popover } from 'antd';
import React from 'react';

// 创建模拟文件的辅助函数
const createMockFile = (
  name: string,
  type: string,
  url: string,
  previewUrl?: string,
): AttachmentFile => ({
  name,
  type,
  size: Math.floor(Math.random() * 10000000) + 1024,
  url,
  previewUrl: previewUrl || url,
  status: 'done',
  uuid: `uuid-${name}-${Date.now()}`,
  lastModified: Date.now(),
  webkitRelativePath: '',
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  bytes: () => Promise.resolve(new Uint8Array(0)),
  text: () => Promise.resolve(''),
  stream: () => new ReadableStream(),
  slice: () => new Blob(),
});

// 基础文件列表（混合类型）
const mixedFileMap = new Map<string, AttachmentFile>([
  [
    'image-1',
    createMockFile(
      'design-mockup.jpg',
      'image/jpeg',
      'https://mdn.alipayobjects.com/huamei_ptjqan/afts/img/A*IsRPRJJps0cAAAAAAAAAAAAADkN6AQ/original',
    ),
  ],
  [
    'image-2',
    createMockFile(
      'screenshot.png',
      'image/png',
      'https://mdn.alipayobjects.com/huamei_ptjqan/afts/img/A*jThjRaPDP3kAAAAAAAAAAAAAekN6AQ/original',
    ),
  ],
  [
    'image-3',
    createMockFile(
      'photo.jpg',
      'image/jpeg',
      'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    ),
  ],
  [
    'doc-1',
    createMockFile(
      'project-proposal.pdf',
      'application/pdf',
      'https://example.com/proposal.pdf',
    ),
  ],
  [
    'doc-2',
    createMockFile(
      'requirements-document.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'https://example.com/requirements.docx',
    ),
  ],
  [
    'doc-3',
    createMockFile(
      'presentation-slides.pptx',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'https://example.com/slides.pptx',
    ),
  ],
  [
    'data-1',
    createMockFile(
      'config.json',
      'application/json',
      'https://example.com/config.json',
    ),
  ],
  [
    'data-2',
    createMockFile(
      'settings.yaml',
      'application/x-yaml',
      'https://example.com/settings.yaml',
    ),
  ],
]);

// 纯图片文件列表
const imageOnlyMap = new Map<string, AttachmentFile>([
  [
    'img-1',
    createMockFile(
      'photo-1.jpg',
      'image/jpeg',
      'https://mdn.alipayobjects.com/huamei_ptjqan/afts/img/A*IsRPRJJps0cAAAAAAAAAAAAADkN6AQ/original',
    ),
  ],
  [
    'img-2',
    createMockFile(
      'photo-2.jpg',
      'image/jpeg',
      'https://mdn.alipayobjects.com/huamei_ptjqan/afts/img/A*jThjRaPDP3kAAAAAAAAAAAAAekN6AQ/original',
    ),
  ],
  [
    'img-3',
    createMockFile(
      'photo-3.png',
      'image/png',
      'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    ),
  ],
  [
    'img-4',
    createMockFile(
      'photo-4.jpg',
      'image/jpeg',
      'https://mdn.alipayobjects.com/huamei_ptjqan/afts/img/A*IsRPRJJps0cAAAAAAAAAAAAADkN6AQ/original',
    ),
  ],
]);

// 多文档文件列表（用于测试 maxDisplayCount）
const manyDocsMap = new Map<string, AttachmentFile>([
  [
    'doc-1',
    createMockFile(
      'annual-report-2023.pdf',
      'application/pdf',
      'https://example.com/report.pdf',
    ),
  ],
  [
    'doc-2',
    createMockFile(
      'financial-statement.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'https://example.com/statement.xlsx',
    ),
  ],
  [
    'doc-3',
    createMockFile(
      'meeting-minutes.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'https://example.com/minutes.docx',
    ),
  ],
  [
    'doc-4',
    createMockFile(
      'project-timeline.pptx',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'https://example.com/timeline.pptx',
    ),
  ],
  [
    'doc-5',
    createMockFile(
      'technical-specification.pdf',
      'application/pdf',
      'https://example.com/spec.pdf',
    ),
  ],
  [
    'doc-6',
    createMockFile(
      'user-manual.pdf',
      'application/pdf',
      'https://example.com/manual.pdf',
    ),
  ],
]);

const DemoSection: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <div style={{ marginBottom: 32 }}>
    <h3 style={{ marginBottom: 8, fontSize: 16, fontWeight: 600 }}>{title}</h3>
    {description && (
      <p style={{ marginBottom: 16, color: '#666', fontSize: 14 }}>
        {description}
      </p>
    )}
    <div
      style={{
        padding: 16,
        background: '#fafafa',
        borderRadius: 8,
        border: '1px solid #e8e8e8',
      }}
    >
      {children}
    </div>
  </div>
);

export default () => {
  const handlePreview = (file: AttachmentFile) => {
    message.success(`预览文件: ${file.name}`);
    console.log('预览文件:', file);
  };

  const handleDownload = (file: AttachmentFile) => {
    message.success(`下载文件: ${file.name}`);
    console.log('下载文件:', file);
  };

  const handleViewAll = (files: AttachmentFile[]) => {
    message.info(`共有 ${files.length} 个文件`);
    console.log('查看所有文件:', files);
    return true; // 返回 true 展开所有文件
  };

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
              onClick: () => message.success(`复制: ${file.name}`),
            },
            {
              key: 'download',
              label: '下载',
              icon: <DownloadOutlined />,
              onClick: () => message.success(`下载: ${file.name}`),
            },
            {
              key: 'edit',
              label: '编辑',
              icon: <EditOutlined />,
              onClick: () => message.info(`编辑: ${file.name}`),
            },
            {
              key: 'share',
              label: '分享',
              icon: <ShareAltOutlined />,
              onClick: () => message.info(`分享: ${file.name}`),
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
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{ width: 20, marginRight: 8 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.key === 'copy' && (
                <CheckOutlined style={{ color: '#52c41a' }} />
              )}
            </div>
          ))}
          <Divider style={{ margin: '4px 0' }} />
          <div
            onClick={(e) => {
              e.stopPropagation();
              message.error(`删除: ${file.name}`);
            }}
            style={{
              height: 36,
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              borderRadius: 8,
              cursor: 'pointer',
              color: '#ff4d4f',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fff1f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style={{ width: 20, marginRight: 8 }}>
              <DeleteOutlined />
            </span>
            <span style={{ flex: 1 }}>删除</span>
          </div>
        </div>
      }
    >
      <div
        style={{
          width: 18,
          height: 18,
          cursor: 'pointer',
        }}
      />
    </Popover>
  );

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          marginBottom: 24,
          padding: 16,
          background: '#e6f7ff',
          borderRadius: 8,
          border: '1px solid #91d5ff',
        }}
      >
        <h2 style={{ margin: '0 0 8px 0', fontSize: 18 }}>
          📁 FileMapView 组件示例
        </h2>
        <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
          展示文件预览组件的各种使用场景和配置选项
        </p>
      </div>

      <DemoSection
        title="1. 基础用法 - 混合文件类型"
        description="展示图片和文档混合的文件列表，图片会以网格形式展示，其他文件以列表形式展示"
      >
        <FileMapView fileMap={mixedFileMap} />
      </DemoSection>

      <DemoSection
        title="2. 纯图片展示"
        description="当所有文件都是图片时，会以图片画廊的形式展示，支持点击预览"
      >
        <FileMapView fileMap={imageOnlyMap} />
      </DemoSection>

      <DemoSection
        title="3. 限制显示数量 (maxDisplayCount)"
        description="使用 maxDisplayCount 限制非图片文件的显示数量，超出部分会显示查看所有文件按钮"
      >
        <FileMapView
          fileMap={manyDocsMap}
          maxDisplayCount={3}
          onViewAll={handleViewAll}
        />
      </DemoSection>

      <DemoSection
        title="4. 自定义预览和下载"
        description="通过 onPreview 和 onDownload 回调自定义文件预览和下载行为"
      >
        <FileMapView
          fileMap={mixedFileMap}
          onPreview={handlePreview}
          onDownload={handleDownload}
        />
      </DemoSection>

      <DemoSection
        title="5. 自定义更多操作 (renderMoreAction)"
        description="通过 renderMoreAction 添加自定义的更多操作菜单"
      >
        <FileMapView
          fileMap={mixedFileMap}
          onPreview={handlePreview}
          onDownload={handleDownload}
          renderMoreAction={renderMoreAction}
        />
      </DemoSection>

      <DemoSection
        title="6. 右侧布局 (placement)"
        description="使用 placement='right' 将文件列表显示在右侧"
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <FileMapView fileMap={imageOnlyMap} placement="right" />
        </div>
      </DemoSection>

      <DemoSection
        title="7. 自定义样式"
        description="通过 style 和 className 自定义组件样式"
      >
        <FileMapView
          fileMap={mixedFileMap}
          style={{
            maxWidth: 600,
          }}
          className="custom-file-view"
        />
      </DemoSection>

      <div
        style={{
          marginTop: 32,
          padding: 12,
          background: '#fff7e6',
          borderRadius: 8,
          border: '1px solid #ffd591',
        }}
      >
        <h4 style={{ margin: '0 0 12px 0', fontSize: 16 }}>💡 使用提示</h4>
        <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
          <li>
            <strong>图片文件</strong>:
            会自动识别并以网格布局展示，支持预览组功能
          </li>
          <li>
            <strong>非图片文件</strong>:
            以列表形式展示，显示文件类型图标和文件信息
          </li>
          <li>
            <strong>maxDisplayCount</strong>:
            只对非图片文件生效，图片文件始终全部显示
          </li>
          <li>
            <strong>文件操作</strong>: 支持预览、下载、自定义更多操作等功能
          </li>
          <li>
            <strong>响应式布局</strong>: 自动适配不同屏幕尺寸
          </li>
        </ul>
      </div>

      <div
        style={{
          marginTop: 16,
          padding: 12,
          background: '#f6ffed',
          borderRadius: 8,
          border: '1px solid #b7eb8f',
        }}
      >
        <h4 style={{ margin: '0 0 12px 0', fontSize: 16 }}>
          ✨ 支持的文件类型
        </h4>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
        >
          <div>
            <strong>图片格式:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
              <li>JPEG/JPG</li>
              <li>PNG</li>
              <li>GIF</li>
              <li>WebP</li>
            </ul>
          </div>
          <div>
            <strong>文档格式:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
              <li>PDF</li>
              <li>Word (.doc, .docx)</li>
              <li>PowerPoint (.ppt, .pptx)</li>
              <li>Excel (.xls, .xlsx)</li>
            </ul>
          </div>
          <div>
            <strong>数据格式:</strong>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
              <li>JSON</li>
              <li>YAML/YML</li>
              <li>TXT</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
