import type { AttachmentFile, MessageBubbleData } from '@ant-design/agentic-ui';
import { Bubble } from '@ant-design/agentic-ui';
import React, { useRef } from 'react';

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
  lastModified: 1703123456789, // 2023-12-21 10:30:56
  webkitRelativePath: '',
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  bytes: () => Promise.resolve(new Uint8Array(0)),
  text: () => Promise.resolve(''),
  stream: () => new ReadableStream(),
  slice: () => new Blob(),
});

export default () => {
  const bubbleRef = useRef<any>();
  const deps: any[] = [];

  // Mock message with different types of files
  const mockMessage: MessageBubbleData = {
    id: '1',
    role: 'assistant',
    content: '这里是一些不同类型的文件：',
    createAt: 1703123456789, // 2023-12-21 10:30:56
    updateAt: 1703123456789,
    meta: {
      avatar:
        'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
      title: 'Ant Design',
    },
    fileMap: new Map([
      [
        'document.pdf',
        createMockFile(
          'document.pdf',
          'application/pdf',
          1024 * 1024, // 1MB
          'https://example.com/document.pdf',
        ),
      ],
      [
        'image.png',
        createMockFile(
          'image.png',
          'image/png',
          512 * 1024, // 512KB
          'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
        ),
      ],
      [
        'data.json',
        createMockFile(
          'data.json',
          'application/json',
          256 * 1024, // 256KB
          'https://example.com/data.json',
        ),
      ],
    ]),
  };

  // Mock message with a single image
  const mockImageMessage: MessageBubbleData = {
    id: '2',
    role: 'assistant',
    content: '这是一张图片：',
    createAt: 1703123456789, // 2023-12-21 10:30:56
    updateAt: 1703123456789,
    meta: {
      avatar:
        'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
      title: 'Ant Design',
    },
    fileMap: new Map([
      [
        'screenshot.png',
        createMockFile(
          'screenshot.png',
          'image/png',
          1024 * 1024, // 1MB
          'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
        ),
      ],
    ]),
  };

  // 用户消息：上传的视频
  const mockUserVideoMessage: MessageBubbleData = {
    id: '3',
    role: 'user',
    content: '这个视频讲了什么',
    createAt: 1703123456789,
    updateAt: 1703123456789,
    meta: {
      avatar:
        'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
      title: '用户',
    },
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Message with multiple files */}
      <Bubble
        avatar={mockMessage.meta!}
        markdownRenderConfig={{
          tableConfig: {
            pure: true,
          },
        }}
        placement="left"
        deps={deps}
        bubbleRef={bubbleRef}
        pure
        originData={mockMessage}
      />

      {/* Message with a single image */}
      <Bubble
        avatar={mockImageMessage.meta!}
        placement="left"
        deps={deps}
        markdownRenderConfig={{
          tableConfig: {
            pure: true,
          },
        }}
        bubbleRef={bubbleRef}
        pure
        originData={mockImageMessage}
      />

      {/* 用户消息：带视频附件 */}
      <Bubble
        avatar={mockUserVideoMessage.meta!}
        placement="right"
        deps={deps}
        markdownRenderConfig={{
          tableConfig: {
            pure: true,
          },
        }}
        bubbleRef={bubbleRef}
        pure
        originData={mockUserVideoMessage}
      />
    </div>
  );
};
