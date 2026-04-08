import type { MessageBubbleData } from '@ant-design/agentic-ui';
import { Bubble } from '@ant-design/agentic-ui';
import React, { useRef } from 'react';
import {
  ASSISTANT_META,
  createMockFile,
  PURE_TABLE_CONFIG,
  USER_AVATAR,
} from './shared';

export default () => {
  const bubbleRef = useRef<any>();

  const mockMessage: MessageBubbleData = {
    id: '1',
    role: 'assistant',
    content: '这里是一些不同类型的文件：',
    createAt: 1703123456789,
    updateAt: 1703123456789,
    meta: ASSISTANT_META,
    fileMap: new Map([
      [
        'document.pdf',
        createMockFile(
          'document.pdf',
          'application/pdf',
          1024 * 1024,
          'https://example.com/document.pdf',
        ),
      ],
      [
        'image.png',
        createMockFile('image.png', 'image/png', 512 * 1024, USER_AVATAR),
      ],
      [
        'data.json',
        createMockFile(
          'data.json',
          'application/json',
          256 * 1024,
          'https://example.com/data.json',
        ),
      ],
    ]),
  };

  const mockImageMessage: MessageBubbleData = {
    id: '2',
    role: 'assistant',
    content: '这是一张图片：',
    createAt: 1703123456789,
    updateAt: 1703123456789,
    meta: ASSISTANT_META,
    fileMap: new Map([
      [
        'screenshot.png',
        createMockFile('screenshot.png', 'image/png', 1024 * 1024, USER_AVATAR),
      ],
    ]),
  };

  const mockUserVideoMessage: MessageBubbleData = {
    id: '3',
    role: 'user',
    content: '这个视频讲了什么',
    createAt: 1703123456789,
    updateAt: 1703123456789,
    meta: { avatar: USER_AVATAR, title: '用户' },
    fileMap: new Map([
      [
        'demo.mp4',
        createMockFile(
          'demo.mp4',
          'video/mp4',
          8 * 1024 * 1024,
          'https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/90LVRoQeGdkAAAAAAAAAAAAAK4eUAQBr',
        ),
      ],
    ]),
  };

  const messages = [
    { data: mockMessage, placement: 'left' as const },
    { data: mockImageMessage, placement: 'left' as const },
    { data: mockUserVideoMessage, placement: 'right' as const },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {messages.map(({ data, placement }) => (
        <Bubble
          key={data.id}
          avatar={data.meta!}
          markdownRenderConfig={PURE_TABLE_CONFIG}
          placement={placement}
          bubbleRef={bubbleRef}
          pure
          originData={data}
        />
      ))}
    </div>
  );
};
