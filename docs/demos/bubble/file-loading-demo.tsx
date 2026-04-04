import type { MessageBubbleData } from '@ant-design/agentic-ui';
import { Bubble } from '@ant-design/agentic-ui';
import { Button, message, Space, Switch } from 'antd';
import React, { useRef, useState } from 'react';
import {
  ASSISTANT_META,
  createAssistantMessage,
  createMockFile,
  createUserMessage,
  PURE_TABLE_CONFIG,
  USER_META,
} from './shared';

const mockFileMessage = createAssistantMessage(
  '2',
  `## 文件上传加载状态演示

当文件正在上传或处理时，Bubble 组件会显示加载状态。

支持的文件类型：
- 图片文件 (PNG, JPG, GIF, SVG)
- 文档文件 (PDF, DOC, TXT, MD)
- 代码文件 (JS, TS, PY, JAVA)
- 其他格式文件

文件上传完成后，用户可以预览和下载文件。`,
  {
    createAt: Date.now() - 30000,
    updateAt: Date.now() - 30000,
    extra: { duration: 800, model: 'gpt-4', tokens: 88 },
    fileMap: new Map([
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
          'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
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
  },
);

const mockUserMsg = createUserMessage(
  '3',
  '请展示一下文件上传加载状态的效果',
  { createAt: Date.now() - 10000, updateAt: Date.now() - 10000 },
);

export default () => {
  const bubbleRef = useRef<any>();
  const [isFileLoading, setIsFileLoading] = useState(false);

  const handleLike = async (bubble: MessageBubbleData) => {
    message.success(`已点赞消息: ${bubble.id}`);
  };

  const handleDisLike = async (bubble: MessageBubbleData) => {
    message.info(`已点踩消息: ${bubble.id}`);
  };

  const handleReply = (content: string) => {
    message.info(`回复内容: ${content}`);
  };

  const handleSimulateUpload = () => {
    setIsFileLoading(true);
    setTimeout(() => {
      setIsFileLoading(false);
      message.success('文件上传完成！');
    }, 4000);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h3>文件加载状态控制</h3>
        <Space>
          <span>文件加载状态：</span>
          <Switch
            checked={isFileLoading}
            onChange={setIsFileLoading}
            checkedChildren="上传中"
            unCheckedChildren="已完成"
          />
          <Button type="primary" onClick={handleSimulateUpload}>
            模拟上传过程
          </Button>
        </Space>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Bubble
          avatar={ASSISTANT_META}
          placement="left"
          bubbleRef={bubbleRef}
          pure
          markdownRenderConfig={PURE_TABLE_CONFIG}
          originData={{
            ...mockFileMessage,
            typing: isFileLoading,
            content: isFileLoading
              ? '正在处理文件，请稍候...'
              : mockFileMessage.content,
            isFinished: !isFileLoading,
          }}
          onLike={handleLike}
          onDisLike={handleDisLike}
          onReply={handleReply}
        />

        <Bubble
          markdownRenderConfig={PURE_TABLE_CONFIG}
          avatar={USER_META}
          placement="right"
          bubbleRef={bubbleRef}
          pure
          originData={mockUserMsg}
          onReply={handleReply}
        />
      </div>
    </div>
  );
};
