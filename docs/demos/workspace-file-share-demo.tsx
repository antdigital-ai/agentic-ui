import { Workspace } from '@ant-design/agentic-ui';
import type { FileNode } from '@ant-design/agentic-ui/Workspace/types';
import { Input, Popover, message } from 'antd';
import React, { useMemo, useRef, useState } from 'react';

const WorkspaceFileShareDemo: React.FC = () => {
  const nodes = useMemo<FileNode[]>(
    () => [
      {
        id: 'file-1',
        name: '项目需求.md',
        size: '28KB',
        lastModified: '2025-08-01 13:20:00',
        content: '# 需求文档\n\n这里是需求正文...',
        type: 'markdown',
        canShare: true,
      },
      {
        id: 'file-2',
        name: '产品说明书.pdf',
        size: '3.2MB',
        lastModified: '2025-08-01 11:20:00',
        url: '/downloads/product-manual.pdf',
        type: 'pdf',
        canShare: true,
      },
      {
        id: 'file-3',
        name: 'README.md',
        size: '15KB',
        lastModified: '2025-08-01 13:15:00',
        url: '/downloads/readme.md',
        type: 'markdown',
        canShare: true,
      },
      {
        id: 'file-4',
        name: '产品展示.jpg',
        size: '1.5MB',
        lastModified: '2025-08-01 09:30:00',
        url: `https://t15.baidu.com/it/u=1723601087,48527874&fm=224&app=112&f=JPEG?w=500&h=500`,
        type: 'image',
        canShare: true,
      },

      {
        id: 'file-5',
        name: '教程.webm',
        size: '12.1MB',
        lastModified: '2025-08-01 15:20:00',
        url: '/downloads/tutorial.webm',
        type: 'video',
        canShare: true,
      },
    ],
    [],
  );

  const [shareOpen, setShareOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [anchorPos, setAnchorPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownload = (file: FileNode) => {
    console.log('下载单个文件:', file);
    message.success(`准备下载：${file.name}`);
  };

  const handleShare = (file: FileNode, ctx?: { anchorEl?: HTMLElement }) => {
    const url = file.url || file.previewUrl || window.location.href;
    setShareUrl(url);
    if (ctx?.anchorEl && containerRef.current) {
      const btnRect = ctx.anchorEl.getBoundingClientRect();
      const contRect = containerRef.current.getBoundingClientRect();
      setAnchorPos({
        top: btnRect.bottom - contRect.top,
        left: btnRect.left - contRect.left,
      });
    } else {
      setAnchorPos({ top: 40, left: 200 });
    }
    setShareOpen(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      message.success('已复制分享链接到剪贴板');
      setShareOpen(false);
    } catch (e) {
      message.error('复制失败');
    }
  };

  const SharePopover = (
    <div style={{ maxWidth: 460, padding: 0 }}>
      <div style={{ fontWeight: 600, marginBottom: 12 }}>分享给他人</div>
      <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 12 }}>
        分享链接有权限管控，对方需要账号登录后才能查看。
      </div>
      <Input.Search
        readOnly
        value={shareUrl}
        enterButton="复制链接"
        onSearch={handleCopy}
        style={{ width: '100%' }}
      />
    </div>
  );

  return (
    <div style={{ padding: '12px' }}>
      <h2>文件分享</h2>

      <div
        ref={containerRef}
        style={{
          position: 'relative',
          maxWidth: '600px',
        }}
      >
        {/* 锚点：位于被点击分享按钮右下方 */}
        <Popover
          open={shareOpen}
          onOpenChange={(open) => setShareOpen(open)}
          placement="bottomLeft"
          content={SharePopover}
          destroyTooltipOnHide
        >
          <span
            style={{
              position: 'absolute',
              top: anchorPos?.top ?? -9999,
              left: anchorPos?.left ?? -9999,
              width: 0,
              height: 0,
            }}
          />
        </Popover>

        <Workspace title="文件管理">
          <Workspace.File
            tab={{
              key: 'filesDefaultShare',
              title: '文件',
              count: nodes.length,
            }}
            nodes={nodes}
            onDownload={handleDownload}
          />
          <Workspace.File
            tab={{
              key: 'filesCustomShare',
              title: '文件-自定义分享',
              count: nodes.length,
            }}
            nodes={nodes}
            onDownload={handleDownload}
            onShare={handleShare}
          />
        </Workspace>
      </div>
    </div>
  );
};

export default WorkspaceFileShareDemo;
