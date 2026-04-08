import type { AttachmentFile } from '@ant-design/agentic-ui';
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

/**
 * 自定义附件按钮 Popover 演示
 */
const CustomAttachmentPopoverDemo: React.FC = () => {
  const [value, setValue] = useState('尝试点击不同样式的附件按钮来上传文件...');
  const [fileMap, setFileMap] = useState<Map<string, AttachmentFile>>(
    new Map(),
  );

  // 模拟文件上传
  const handleUpload = async (file: AttachmentFile) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `https://example.com/files/${file.name}`;
  };

  // 处理文件映射变化
  const handleFileMapChange = (files?: Map<string, AttachmentFile>) => {
    if (files) {
      setFileMap(files);
    }
  };

  // 示例1：简单的 Tooltip 替换
  const SimpleTooltipPopover = ({ children, supportedFormat }: any) => (
    <Tooltip
      title={`点击上传${supportedFormat?.type || '文件'}`}
      placement="top"
    >
      {children}
    </Tooltip>
  );

  // 示例2：自定义 Popover 内容
  const CustomContentPopover = ({ children, supportedFormat }: any) => {
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
        {children}
      </Popover>
    );
  };

  // 示例3：点击触发 Modal 的 Popover
  const ModalTriggerPopover = ({ children, supportedFormat }: any) => {
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
            <Button
              key="cancel"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsModalOpen(false);
              }}
            >
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
                {supportedFormat?.extensions?.map((ext: string) => (
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

  // 示例4：彩色样式的 Popover
  const ColorfulPopover = ({ children, supportedFormat }: any) => {
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
          {supportedFormat?.extensions?.slice(0, 3).join(', ')}
          {supportedFormat?.extensions?.length > 3 &&
            ` 等${supportedFormat.extensions.length}种格式`}
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
        {children}
      </Popover>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>自定义附件按钮 Popover 演示</h2>
      <p>
        通过 <code>render</code> 属性，您可以完全自定义附件按钮的交互体验。
      </p>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 默认样式 */}
        <Card title="默认样式" size="small">
          <MarkdownInputField
            value={value}
            onChange={setValue}
            attachment={{
              enable: true,
              upload: handleUpload,
              fileMap: fileMap,
              onFileMapChange: handleFileMapChange,
            }}
            placeholder="默认的附件按钮样式..."
          />
        </Card>

        {/* 简单 Tooltip */}
        <Card title="简单 Tooltip 替换" size="small">
          <MarkdownInputField
            value={value}
            onChange={setValue}
            attachment={{
              enable: true,
              upload: handleUpload,
              fileMap: fileMap,
              onFileMapChange: handleFileMapChange,
              render: SimpleTooltipPopover,
            }}
            placeholder="使用简单 Tooltip 的附件按钮..."
          />
        </Card>

        {/* 自定义内容 */}
        <Card title="自定义 Popover 内容" size="small">
          <MarkdownInputField
            value={value}
            onChange={setValue}
            attachment={{
              enable: true,
              upload: handleUpload,
              fileMap: fileMap,
              onFileMapChange: handleFileMapChange,
              render: CustomContentPopover,
            }}
            placeholder="显示详细信息的附件按钮..."
          />
        </Card>

        {/* Modal 触发器 */}
        <Card title="Modal 上传向导" size="small">
          <MarkdownInputField
            value={value}
            onChange={setValue}
            attachment={{
              enable: true,
              upload: handleUpload,
              fileMap: fileMap,
              onFileMapChange: handleFileMapChange,
              render: ModalTriggerPopover,
            }}
            placeholder="点击附件按钮打开上传向导..."
          />
        </Card>

        {/* 彩色样式 */}
        <Card title="彩色样式 Popover" size="small">
          <MarkdownInputField
            value={value}
            onChange={setValue}
            attachment={{
              enable: true,
              upload: handleUpload,
              fileMap: fileMap,
              onFileMapChange: handleFileMapChange,
              render: ColorfulPopover,
            }}
            placeholder="彩色样式的附件按钮..."
          />
        </Card>
      </Space>
    </div>
  );
};

export default CustomAttachmentPopoverDemo;
