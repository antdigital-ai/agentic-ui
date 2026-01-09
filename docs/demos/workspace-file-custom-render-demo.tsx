import { Workspace } from '@ant-design/agentic-ui';
import type { FileNode, FileRenderContext } from '@ant-design/agentic-ui/Workspace/types';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Space, Tag, Typography } from 'antd';
import React from 'react';

/**
 * 文件卡片自定义渲染演示
 * 展示 disabled、renderName、renderDetails、renderActions 的使用方式
 */
const WorkspaceFileCustomRenderDemo: React.FC = () => {
  // 自定义文件名渲染
  const customRenderName = (ctx: FileRenderContext) => {
    return (
      <Typography.Text
        strong
        style={{ color: '#1890ff' }}
        ellipsis={{ tooltip: ctx.file.name }}
      >
        {ctx.file.name}
      </Typography.Text>
    );
  };

  // 自定义详情行渲染
  const customRenderDetails = (ctx: FileRenderContext) => {
    const { file } = ctx;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#999', fontSize: 12 }}>
          {file.lastModified?.toString()} · 已编辑
        </span>
        <Tag color="blue" style={{ margin: 0 }}>
          自定义标签
        </Tag>
      </div>
    );
  };

  // 自定义操作按钮渲染（完全自定义）
  const customRenderActions = (ctx: FileRenderContext) => {
    return (
      <Space size={4}>
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            console.log('预览:', ctx.file.name);
          }}
        />
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            console.log('编辑:', ctx.file.name);
          }}
        />
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            console.log('删除:', ctx.file.name);
          }}
        />
      </Space>
    );
  };

  // 复用内置按钮 + 追加自定义按钮
  const extendRenderActions = (ctx: FileRenderContext) => {
    const { actions } = ctx;
    return (
      <>
        {actions.preview}
        {actions.download}
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            console.log('编辑:', ctx.file.name);
          }}
        />
      </>
    );
  };

  const nodes: FileNode[] = [
    {
      id: '1',
      name: 'XXXXX企业尽调报告.docx',
      type: 'word',
      size: '2.3MB',
      lastModified: '2025-10-01 12:30',
      url: '/downloads/report.docx',
      // 使用自定义渲染
      renderName: customRenderName,
      renderDetails: customRenderDetails,
    },
    {
      id: '2',
      name: '自定义操作按钮.pdf',
      type: 'pdf',
      size: '1.5MB',
      lastModified: '2025-10-02 14:00',
      url: '/downloads/normal.pdf',
      // 完全自定义操作按钮
      renderActions: customRenderActions,
    },
    {
      id: '5',
      name: '复用内置按钮+追加.docx',
      type: 'word',
      size: '3.2MB',
      lastModified: '2025-10-05 10:00',
      url: '/downloads/extend.docx',
      // 复用内置按钮 + 追加自定义按钮
      renderActions: extendRenderActions,
    },
    {
      id: '3',
      name: '禁用状态的文件.xlsx',
      type: 'excel',
      size: '856KB',
      lastModified: '2025-10-03 09:15',
      url: '/downloads/disabled.xlsx',
      // 禁用状态
      disabled: true,
    },
    {
      id: '4',
      name: '仅自定义详情行.txt',
      type: 'plainText',
      size: '12KB',
      lastModified: '2025-10-04 16:20',
      content: '文件内容...',
      // 仅自定义详情行
      renderDetails: (ctx) => (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          创建于 {ctx.file.lastModified?.toString()} | 版本 v1.2.3
        </Typography.Text>
      ),
    },
  ];

  return (
    <div style={{ height: 500 }}>
      <Workspace title="文件自定义渲染演示">
        <Workspace.File
          nodes={nodes}
          onDownload={(file) => console.log('下载:', file.name)}
          onPreview={(file) => console.log('预览:', file.name)}
        />
      </Workspace>
    </div>
  );
};

export default WorkspaceFileCustomRenderDemo;
