import {
  AttachmentFile,
  Bubble,
  MessageBubbleData,
} from '@ant-design/agentic-ui';
import {
  CheckOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { message, Popover } from 'antd';
import React, { useRef, useState } from 'react';
import { BubbleDemoCard } from './BubbleDemoCard';

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

const defaultMockMessage: MessageBubbleData = {
  id: '1',
  role: 'assistant',
  content: `Ant Design 聊天助手：可回答问题、提供示例与文档说明。`,
  createAt: Date.now() - 60000, // 1分钟前
  updateAt: Date.now() - 60000,
  isFinished: true,
  extra: {
    duration: 1200, // 生成耗时
    model: 'gpt-4',
    tokens: 150,
  },
  meta: {
    avatar:
      'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
    title: 'Ant Design Assistant',
    description: 'AI 助手',
  },
};

const mockUserMessage: MessageBubbleData = {
  id: '2',
  role: 'user',
  content:
    '你好，想了解 Bubble 的基本用法。[Bubble](https://ant.design/components/bubble-cn)',
  createAt: Date.now() - 30000, // 30秒前
  updateAt: Date.now() - 30000,
  isFinished: true,
  meta: {
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    title: '开发者',
    description: '前端工程师',
  },
};

const mockInlineFileMap = new Map<string, AttachmentFile>([
  [
    'demo-spec.pdf',
    createMockFile(
      'demo-spec.pdf',
      'application/pdf',
      2048576,
      'https://example.com/demo-spec.pdf',
    ),
  ],
  [
    'preview.png',
    createMockFile(
      'preview.png',
      'image/png',
      1048576,
      'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    ),
  ],
]);

const mockFileMessage: MessageBubbleData = {
  id: '3',
  role: 'assistant',
  content: `## 附件示例
以下为内联文件列表：`,
  createAt: Date.now() - 10000, // 10秒前
  updateAt: Date.now() - 10000,
  isFinished: true,
  extra: {
    duration: 800,
    model: 'gpt-4',
    tokens: 88,
  },
  meta: {
    avatar:
      'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
    title: 'Ant Design Assistant',
    description: 'AI 助手',
  },
  fileMap: mockInlineFileMap,
};

export default () => {
  const bubbleRef = useRef<any>();
  const [mockMessage, setMockMessage] = useState<MessageBubbleData>(
    () => defaultMockMessage,
  );

  // 处理点赞/点踩事件
  const handleLike = async (bubble: MessageBubbleData) => {
    message.success(`已点赞消息: ${bubble.id}`);
    console.log('点赞消息:', bubble);
    setMockMessage({
      ...mockMessage,
      feedback: 'thumbsUp',
    });
  };

  const handleCancelLike = async (bubble: MessageBubbleData) => {
    message.success(`已取消点赞消息: ${bubble.id}`);
    console.log('取消点赞消息:', bubble);
    setMockMessage({
      ...mockMessage,
      feedback: undefined,
    });
    console.log('取消点赞消息:', bubble);
  };

  const handleDisLike = async (bubble: MessageBubbleData) => {
    message.info(`已点踩消息: ${bubble.id}`);
    console.log('点踩消息:', bubble);
    setMockMessage({
      ...mockMessage,
      feedback: 'thumbsDown',
    });
  };

  // 处理回复事件
  const handleReply = (content: string) => {
    message.info(`回复内容: ${content}`);
    console.log('回复内容:', content);
  };

  // 处理头像点击事件
  const handleAvatarClick = () => {
    message.success('👤 点击了头像！可以查看用户资料或切换用户');
    console.log('头像被点击了');
  };

  return (
    <BubbleDemoCard
      title="🎯 Bubble 基础用法演示"
      description="💡 点击消息下方的操作按钮可以体验交互功能"
    >
      {/* 消息列表 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: 24,
        }}
      >
        {/* Assistant message */}
        <Bubble
          avatar={mockMessage.meta!}
          markdownRenderConfig={{
            tableConfig: {
              pure: true,
            },
          }}
          placement="left"
          bubbleRef={bubbleRef}
          pure
          originData={mockMessage}
          onLike={handleLike}
          onCancelLike={handleCancelLike}
          onDisLike={handleDisLike}
          onReply={handleReply}
          onAvatarClick={handleAvatarClick}
        />

        {/* User message */}
        <Bubble
          markdownRenderConfig={{
            tableConfig: {
              pure: true,
            },
          }}
          avatar={mockUserMessage.meta!}
          placement="right"
          bubbleRef={bubbleRef}
          pure
          originData={mockUserMessage}
          onReply={handleReply}
          onAvatarClick={handleAvatarClick}
        />

        {/* Message with files */}
        <Bubble
          markdownRenderConfig={{
            tableConfig: {
              pure: true,
            },
          }}
          avatar={mockFileMessage.meta!}
          placement="left"
          bubbleRef={bubbleRef}
          pure
          originData={mockFileMessage}
          fileViewConfig={{
            maxDisplayCount: 2,
            // className: 'custom-file-view',
            // customSlot: <>123</>,
            renderFileMoreAction: () => (file: any) => (
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
                        {item.key === 'copy' ? (
                          <CheckOutlined style={{ color: '#2f54eb' }} />
                        ) : null}
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
                <div
                  style={{
                    width: 18,
                    height: 18,
                  }}
                />
              </Popover>
            ),
          }}
          fileViewEvents={({ onPreview, onDownload }) => ({
            onPreview: (file) => {
              onPreview(file);
              console.log('预览文件:', file);
              message.success('预览文件:');
            },
            onDownload: (file) => {
              onDownload(file);
              console.log('下载文件:', file);
              message.success('下载文件:');
            },
            // onViewAll: (files) => {
            //   onViewAll(files);
            //   console.log('查看所有文件:', files);
            //   message.success('查看所有文件:');
            // },
          })}
          onLike={handleLike}
          onDisLike={handleDisLike}
          onReply={handleReply}
          onAvatarClick={handleAvatarClick}
        />
      </div>

      {/* 功能说明 */}
      <div
        style={{
          marginTop: 16,
          padding: 16,
          backgroundColor: '#e6f7ff',
          borderRadius: 8,
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        <h4 style={{ margin: '0 0 12px 0' }}>🚀 基础功能演示</h4>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>消息布局：</strong>支持左右两种布局，适配不同角色
          </li>
          <li>
            <strong>丰富内容：</strong>支持 Markdown 格式、文件附件展示
          </li>
          <li>
            <strong>交互操作：</strong>点赞、点踩、回复等操作反馈
          </li>
          <li>
            <strong>头像点击：</strong>点击头像可以查看用户资料或切换用户
          </li>
          <li>
            <strong>文件支持：</strong>自动识别并展示不同类型的文件
          </li>
          <li>
            <strong>元数据：</strong>头像、标题、描述等信息展示
          </li>
        </ul>
      </div>
    </BubbleDemoCard>
  );
};
