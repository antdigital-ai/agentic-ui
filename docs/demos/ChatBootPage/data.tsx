import {
  AttachmentFile,
  BubbleMetaData,
  MessageBubbleData,
} from '@ant-design/agentic-ui';

// 用户和助手的元数据配置
export const assistantMeta: BubbleMetaData = {
  avatar:
    'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
  title: 'AI助手',
};

export const userMeta: BubbleMetaData = {
  avatar:
    'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
  title: '用户',
};

// 创建模拟文件的辅助函数
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

// 用于在回答内容中内联展示的文件列表（不挂载到 originData.fileMap）
export const mockInlineFileMap = new Map<string, AttachmentFile>([
  [
    'bubble-design-spec.pdf',
    createMockFile(
      'bubble-design-spec.pdf',
      'application/pdf',
      2048576,
      'https://example.com/bubble-design-spec.pdf',
    ),
  ],
  [
    'component-preview.png',
    createMockFile(
      'component-preview.png',
      'image/png',
      1048576,
      'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    ),
  ],
  [
    'api-reference.json',
    createMockFile(
      'api-reference.json',
      'application/json',
      512000,
      'https://example.com/api-reference.json',
    ),
  ],
  [
    '投资分析报告.docx',
    createMockFile(
      '投资分析报告.docx',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      8847360,
      'https://example.com/investment-report.docx',
    ),
  ],
  [
    '市场数据汇总.xlsx',
    createMockFile(
      '市场数据汇总.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      6647360,
      'https://example.com/market-data.xlsx',
    ),
  ],
  [
    '季度路演材料.pptx',
    createMockFile(
      '季度路演材料.pptx',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      7747360,
      'https://example.com/quarterly-roadshow.pptx',
    ),
  ],
]);

// 创建模拟消息的辅助函数
export const createMockMessage = (
  id: string,
  role: 'user' | 'assistant',
  content: string,
  fileMap?: MessageBubbleData['fileMap'],
): MessageBubbleData => ({
  id,
  role,
  content,
  createAt: Date.now(),
  updateAt: Date.now(),
  isFinished: true,
  meta: {
    avatar: role === 'assistant' ? assistantMeta.avatar : userMeta.avatar,
    title: role === 'assistant' ? assistantMeta.title : userMeta.title,
  } as BubbleMetaData,
  fileMap: fileMap || new Map(),
});

// 初始消息内容模板
export const INITIAL_MESSAGES = {
  assistant: `### 我是 Ant Design 聊天助手
可以帮你：

- **回答问题** - 解答技术相关疑问
- **代码示例** - 提供组件使用示例  
- **设计建议** - 给出设计方案建议
- **文档说明** - 解释 API 和功能

你想了解什么呢？`,

  user: `请帮我分析一下当前 A 股市场中新能源板块的投资机会，重点关注光伏和锂电池两个细分赛道。我想了解：1) 目前的估值水平是否合理；2) 未来 6-12 个月的行业催化剂有哪些；3) 推荐的配置策略和标的筛选逻辑。`,

  bubbleDoc: `## Bubble 组件功能文档

Bubble 组件是一个功能丰富的聊天气泡组件，支持：

- 多种消息类型（文本、文件、图片等）
- 自定义渲染配置
- 左右布局切换
- 文件附件展示

以下是相关的设计文档和示例图片：`,
};

// 重试任务配置
export const RETRY_CONFIG = {
  MESSAGE_COUNT: 2,
  MAX_RETRY: 6, // 设置偶数
  INTERVAL: 2000,
};

export default () => null;
