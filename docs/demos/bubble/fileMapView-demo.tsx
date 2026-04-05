import type { AttachmentFile, MessageBubbleData } from '@ant-design/agentic-ui';
import { BubbleList } from '@ant-design/agentic-ui';
import React from 'react';

const createMockFile = (
  name: string,
  type: string,
  size: number,
  url: string,
): AttachmentFile =>
  ({
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
  }) as AttachmentFile;

const IMAGE_URL =
  'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png';
const IMAGE_URL_2 =
  'https://mdn.alipayobjects.com/huamei_ptjqan/afts/img/A*IsRPRJJps0cAAAAAAAAAAAAADkN6AQ/original';
const assistantMeta = {
  avatar:
    'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
  title: 'AI 助手',
};

const userMeta = {
  avatar:
    'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
  title: '用户',
};

const VIDEO_URL =
  'https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/90LVRoQeGdkAAAAAAAAAAAAAK4eUAQBr';

const messages: MessageBubbleData[] = [
  {
    id: '1',
    role: 'assistant',
    content: '单张图片：',
    createAt: Date.now() - 60000,
    updateAt: Date.now() - 60000,
    meta: assistantMeta,
    fileMap: new Map([
      [
        'img-1',
        createMockFile('photo.jpg', 'image/jpeg', 512 * 1024, IMAGE_URL),
      ],
    ]),
  },
  {
    id: '2',
    role: 'user',
    content: '两张图片：',
    createAt: Date.now() - 50000,
    updateAt: Date.now() - 50000,
    meta: userMeta,
    fileMap: new Map([
      [
        'img-1',
        createMockFile('photo1.jpg', 'image/jpeg', 512 * 1024, IMAGE_URL),
      ],
      [
        'img-2',
        createMockFile('photo2.jpg', 'image/jpeg', 512 * 1024, IMAGE_URL_2),
      ],
    ]),
  },
  {
    id: '3',
    role: 'assistant',
    content: '混合（图 + 视频 + 文档）：',
    createAt: Date.now() - 20000,
    updateAt: Date.now() - 20000,
    meta: assistantMeta,
    fileMap: new Map([
      [
        'img-1',
        createMockFile('thumb.jpg', 'image/jpeg', 512 * 1024, IMAGE_URL),
      ],
      [
        'video-1',
        createMockFile('demo.mp4', 'video/mp4', 8 * 1024 * 1024, VIDEO_URL),
      ],
      [
        'doc-1',
        createMockFile(
          'report.pdf',
          'application/pdf',
          1024 * 1024,
          'https://example.com/report.pdf',
        ),
      ],
    ]),
  },
];

export default () => (
  <BubbleList
    bubbleList={messages}
    assistantMeta={assistantMeta}
    userMeta={userMeta}
    pure
    markdownRenderConfig={{
      tableConfig: {
        pure: true,
      },
    }}
  />
);
