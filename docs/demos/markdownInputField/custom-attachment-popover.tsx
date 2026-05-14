import type {
  AttachmentButtonProps,
  AttachmentFile,
} from '@ant-design/agentic-ui';
import { MarkdownInputField } from '@ant-design/agentic-ui';
import {
  FileImageOutlined,
  InfoCircleOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Divider,
  Modal,
  Popover,
  Space,
  Tooltip,
  message,
} from 'antd';
import React, { useState } from 'react';

type RenderProps = Parameters<NonNullable<AttachmentButtonProps['render']>>[0];

const SimpleTooltipPopover = ({ children, supportedFormat }: RenderProps) => (
  <Tooltip title={`点击上传${supportedFormat?.type || '文件'}`} placement="top">
    {children as React.ReactElement}
  </Tooltip>
);

const CustomContentPopover = ({ children, supportedFormat }: RenderProps) => {
  const content = (
    <div style={{ maxWidth: 200 }}>
      <div style={{ marginBottom: 8, fontWeight: 'bold' }}>
        <FileImageOutlined /> 上传{supportedFormat?.type || '文件'}
      </div>
      <div style={{ fontSize: 12, color: '#666' }}>
        支持格式: {supportedFormat?.extensions?.join(', ')}
      </div>
      <Divider style={{ margin: '8px 0' }} />
      <Button type="link" size="small" icon={<InfoCircleOutlined />}>
        查看上传帮助
      </Button>
    </div>
  );

  return (
    <Popover
      content={content}
      title="文件上传"
      trigger="hover"
      placement="topRight"
    >
      {children as React.ReactElement}
    </Popover>
  );
};

const ModalTriggerPopover = ({ children, supportedFormat }: RenderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsModalOpen(true);
  };

  return (
    <>
      <Tooltip title="点击打开上传向导">
        <div
          onClick={handleClick}
          style={{ display: 'inline-block', cursor: 'pointer' }}
        >
          {children}
        </div>
      </Tooltip>
      <Modal
        title="文件上传向导"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            取消
          </Button>,
          <Button
            key="upload"
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => {
              message.success('上传功能演示');
              setIsModalOpen(false);
            }}
          >
            选择文件上传
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Card size="small">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {supportedFormat?.icon}
              <span style={{ marginLeft: 8 }}>
                支持{supportedFormat?.type || '文件'}格式
              </span>
            </div>
          </Card>
          <div>
            <strong>支持的文件类型:</strong>
            <div style={{ marginTop: 4 }}>
              {supportedFormat?.extensions?.map((ext) => (
                <span
                  key={ext}
                  style={{
                    display: 'inline-block',
                    background: '#f0f0f0',
                    padding: '2px 6px',
                    borderRadius: 3,
                    fontSize: 12,
                    marginRight: 4,
                    marginBottom: 4,
                  }}
                >
                  .{ext}
                </span>
              ))}
            </div>
          </div>
        </Space>
      </Modal>
    </>
  );
};

const ColorfulPopover = ({ children, supportedFormat }: RenderProps) => {
  const extensions = supportedFormat?.extensions ?? [];
  const content = (
    <div
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: 12,
        borderRadius: 8,
        border: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        {supportedFormat?.icon}
        <span style={{ marginLeft: 8, fontWeight: 'bold' }}>
          拖拽或点击上传{supportedFormat?.type}
        </span>
      </div>
      <div style={{ fontSize: 12, opacity: 0.9 }}>
        {extensions.slice(0, 3).join(', ')}
        {extensions.length > 3 && ` 等${extensions.length}种格式`}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="hover"
      placement="top"
      styles={{ body: { padding: 0 } }}
    >
      {children as React.ReactElement}
    </Popover>
  );
};

type DemoCardProps = {
  title: string;
  initialValue: string;
  placeholder: string;
  render?: AttachmentButtonProps['render'];
};

const DemoCard: React.FC<DemoCardProps> = ({
  title,
  initialValue,
  placeholder,
  render,
}) => {
  const [value, setValue] = useState(initialValue);
  const [fileMap, setFileMap] = useState<Map<string, AttachmentFile>>(
    new Map(),
  );

  const handleUpload = async (file: AttachmentFile) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `https://example.com/files/${file.name}`;
  };

  return (
    <Card title={title} size="small">
      <MarkdownInputField
        value={value}
        onChange={setValue}
        attachment={{
          enable: true,
          upload: handleUpload,
          fileMap,
          onFileMapChange: (files) => files && setFileMap(files),
          render,
        }}
        placeholder={placeholder}
      />
    </Card>
  );
};

export default () => (
  <div style={{ padding: 24 }}>
    <h2>自定义附件按钮 Popover 演示</h2>
    <p>
      通过 <code>render</code> 属性，您可以完全自定义附件按钮的交互体验。
    </p>

    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <DemoCard
        title="默认样式"
        initialValue=""
        placeholder="默认的附件按钮样式..."
      />
      <DemoCard
        title="简单 Tooltip 替换"
        initialValue=""
        placeholder="使用简单 Tooltip 的附件按钮..."
        render={SimpleTooltipPopover}
      />
      <DemoCard
        title="自定义 Popover 内容"
        initialValue=""
        placeholder="显示详细信息的附件按钮..."
        render={CustomContentPopover}
      />
      <DemoCard
        title="Modal 上传向导"
        initialValue=""
        placeholder="点击附件按钮打开上传向导..."
        render={ModalTriggerPopover}
      />
      <DemoCard
        title="彩色样式 Popover"
        initialValue=""
        placeholder="彩色样式的附件按钮..."
        render={ColorfulPopover}
      />
    </Space>
  </div>
);
