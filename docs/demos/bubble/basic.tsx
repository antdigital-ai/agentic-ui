import { Bubble, MessageBubbleData } from '@ant-design/agentic-ui';
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
import {
  ASSISTANT_META,
  createAssistantMessage,
  createMockFile,
  createUserMessage,
  PURE_TABLE_CONFIG,
} from './shared';

const mockInlineFileMap = new Map([
  ['bubble-design-spec.pdf', createMockFile('bubble-design-spec.pdf', 'application/pdf', 2048576, 'https://example.com/bubble-design-spec.pdf')],
  ['component-preview.png', createMockFile('component-preview.png', 'image/png', 1048576, 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png')],
  ['component-api-reference.json', createMockFile('component-api-reference.json', 'application/json', 512000, 'https://example.com/component-api-reference.json')],
  ['组件使用说明.docx', createMockFile('组件使用说明.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 8847360, 'https://example.com/component-guide.docx')],
  ['接口测试报告.xlsx', createMockFile('接口测试报告.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 6647360, 'https://example.com/api-test-report.xlsx')],
  ['技术方案演示.pptx', createMockFile('技术方案演示.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 7747360, 'https://example.com/tech-proposal.pptx')],
]);

const defaultMockMessage = createAssistantMessage(
  '1',
  `我是 Ant Design 聊天助手，可以帮你：

- **回答问题** - 解答技术相关疑问
- **代码示例** - 提供组件使用示例  
- **设计建议** - 给出设计方案建议
- **文档说明** - 解释 API 和功能

你想了解什么呢？`,
  {
    createAt: Date.now() - 60000,
    updateAt: Date.now() - 60000,
    extra: { duration: 1200, model: 'gpt-4', tokens: 150 },
    meta: { ...ASSISTANT_META, title: 'Ant Design Assistant' },
  },
);

const mockUserMessage = createUserMessage(
  '2',
  '你好！我想了解 Bubble 组件的基本用法和特性。[https://ant.design/components/bubble-cn](https://ant.design/components/bubble-cn)',
  {
    createAt: Date.now() - 30000,
    updateAt: Date.now() - 30000,
    meta: { avatar: undefined, title: '开发者', description: '前端工程师' },
  },
);

const mockFileMessage = createAssistantMessage(
  '3',
  `## Bubble 组件功能文档

Bubble 组件是一个功能丰富的聊天气泡组件，支持：

- 多种消息类型（文本、文件、图片等）
- 自定义渲染配置
- 左右布局切换
- 文件附件展示

以下是相关的设计文档和示例图片：`,
  {
    createAt: Date.now() - 10000,
    updateAt: Date.now() - 10000,
    extra: { duration: 800, model: 'gpt-4', tokens: 88 },
    meta: { ...ASSISTANT_META, title: 'Ant Design Assistant' },
    fileMap: mockInlineFileMap,
  },
);

const FILE_ACTIONS: { key: string; label: string; icon: React.ReactNode; hasCheck?: boolean }[] = [
  { key: 'copy', label: '复制', icon: <CopyOutlined />, hasCheck: true },
  { key: 'download', label: '下载', icon: <DownloadOutlined /> },
  { key: 'edit', label: '编辑', icon: <EditOutlined /> },
  { key: 'share', label: '分享', icon: <ShareAltOutlined /> },
];

export default () => {
  const bubbleRef = useRef<any>();
  const [mockMessage, setMockMessage] = useState<MessageBubbleData>(() => defaultMockMessage);

  const handleLike = async (bubble: MessageBubbleData) => {
    message.success(`已点赞消息: ${bubble.id}`);
    setMockMessage({ ...mockMessage, feedback: 'thumbsUp' });
  };

  const handleCancelLike = async (bubble: MessageBubbleData) => {
    message.success(`已取消点赞消息: ${bubble.id}`);
    setMockMessage({ ...mockMessage, feedback: undefined });
  };

  const handleDisLike = async (bubble: MessageBubbleData) => {
    message.info(`已点踩消息: ${bubble.id}`);
    setMockMessage({ ...mockMessage, feedback: 'thumbsDown' });
  };

  const handleReply = (content: string) => {
    message.info(`回复内容: ${content}`);
  };

  const handleAvatarClick = () => {
    message.success('点击了头像');
  };

  return (
    <BubbleDemoCard title="Bubble 基础用法演示">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
        <Bubble
          avatar={mockMessage.meta!}
          markdownRenderConfig={PURE_TABLE_CONFIG}
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

        <Bubble
          markdownRenderConfig={PURE_TABLE_CONFIG}
          avatar={mockUserMessage.meta!}
          placement="right"
          bubbleRef={bubbleRef}
          pure
          originData={mockUserMessage}
          onReply={handleReply}
          onAvatarClick={handleAvatarClick}
        />

        <Bubble
          markdownRenderConfig={PURE_TABLE_CONFIG}
          avatar={mockFileMessage.meta!}
          placement="left"
          bubbleRef={bubbleRef}
          pure
          originData={mockFileMessage}
          fileViewConfig={{
            maxDisplayCount: 2,
            renderFileMoreAction: () => (file: any) => (
              <Popover
                placement="bottomRight"
                arrow={false}
                trigger={['hover']}
                content={
                  <div style={{ width: 180, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {FILE_ACTIONS.map((item) => (
                      <div
                        key={item.key}
                        onClick={(e) => { e.stopPropagation(); console.log(item.label, file); }}
                        style={{ height: 36, display: 'flex', alignItems: 'center', padding: '0 12px', borderRadius: 8, cursor: 'pointer' }}
                      >
                        <span style={{ width: 20 }}>{item.icon}</span>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.hasCheck && <CheckOutlined style={{ color: '#2f54eb' }} />}
                      </div>
                    ))}
                    <div
                      onClick={(e) => { e.stopPropagation(); console.log('删除', file); }}
                      style={{ height: 36, display: 'flex', alignItems: 'center', padding: '0 12px', borderRadius: 8, cursor: 'pointer', color: '#ff4d4f' }}
                    >
                      <span style={{ width: 20 }}><DeleteOutlined /></span>
                      <span style={{ flex: 1 }}>删除</span>
                    </div>
                  </div>
                }
              >
                <div style={{ width: 18, height: 18 }} />
              </Popover>
            ),
          }}
          fileViewEvents={({ onPreview, onDownload }) => ({
            onPreview: (file) => { onPreview(file); message.success('预览文件:'); },
            onDownload: (file) => { onDownload(file); message.success('下载文件:'); },
          })}
          onLike={handleLike}
          onDisLike={handleDisLike}
          onReply={handleReply}
          onAvatarClick={handleAvatarClick}
        />
      </div>
    </BubbleDemoCard>
  );
};
