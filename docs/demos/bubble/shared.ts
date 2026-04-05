import type { AttachmentFile, BubbleMetaData, MessageBubbleData } from '@ant-design/agentic-ui';

export const ASSISTANT_AVATAR =
  'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original';

export const USER_AVATAR =
  'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png';

export const ASSISTANT_META: BubbleMetaData = {
  avatar: ASSISTANT_AVATAR,
  title: 'AI Assistant',
  description: 'AI 助手',
};

export const USER_META: BubbleMetaData = {
  avatar: USER_AVATAR,
  title: '用户',
  description: '前端工程师',
};

export const PURE_TABLE_CONFIG = {
  tableConfig: { pure: true },
} as const;

export const createMockFile = (
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

export const createAssistantMessage = (
  id: string,
  content: string,
  overrides?: Partial<MessageBubbleData>,
): MessageBubbleData => ({
  id,
  role: 'assistant',
  content,
  createAt: Date.now(),
  updateAt: Date.now(),
  isFinished: true,
  meta: ASSISTANT_META,
  ...overrides,
});

export const createUserMessage = (
  id: string,
  content: string,
  overrides?: Partial<MessageBubbleData>,
): MessageBubbleData => ({
  id,
  role: 'user',
  content,
  createAt: Date.now(),
  updateAt: Date.now(),
  isFinished: true,
  meta: USER_META,
  ...overrides,
});
