import {
  AttachmentFile,
  BubbleList,
  ChatLayout,
  ChatLayoutRef,
  MessageBubbleData,
} from '@ant-design/agentic-ui';
import React, { useEffect, useRef, useState } from 'react';
import {
  CardDescription,
  CardTitle,
  DesignCard,
  DialogFlowWrapper,
} from '../style';

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

// 用于在回答内容中内联展示的文件列表（不挂载到 originData.fileMap）
const mockInlineFileMap = new Map<string, AttachmentFile>([
  [
    'bubble-design-spec.pdf',
    createMockFile(
      'bubble-design-spec.pdf',
      'application/pdf',
      2048576,
      'https://example.com/bubble-design-spec.pdf',
    ),
  ],
  // [
  //   'component-preview.png',
  //   createMockFile(
  // ],
  // [
  //   'api-reference-henchangehnchangmingzichang.json',
  //   createMockFile(
  //     'api-reference-henchangehnchangmingzichang.json',
  //     'application/json',
  //     512000,
  //     'https://example.com/api-reference-henchangehnchangmingzichang.json',
  //   ),
  // ],
  // [
  //   'more-example.docx',
  //   createMockFile(
  //     'more-example.docx',
  //     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  //     8847360,
  //     'https://example.com/more-example.docx',
  //   ),
  // ],
  // [
  //   'more-example.xlsx',
  //   createMockFile(
  //     'more-example.xlsx',
  //     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //     6647360,
  //     'https://example.com/more-example.xlsx',
  //   ),
  // ],
  // [
  //   'more-example.pptx',
  //   createMockFile(
  //     'more-example.pptx',
  //     'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  //     7747360,
  //     'https://example.com/more-example.pptx',
  //   ),
  // ],
]);

// 创建模拟消息的辅助函数
const createMockMessage = (
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
  fileMap: fileMap || new Map(),
});

// 初始消息内容
const INITIAL_MESSAGES = {
  assistant: `### 我是 Ant Design 聊天助手
可以帮你：

- **回答问题** - 解答技术相关疑问
- **代码示例** - 提供组件使用示例  
- **设计建议** - 给出设计方案建议
- **文档说明** - 解释 API 和功能

你想了解什么呢？`,

  user: `帮我规划一条从长沙到重庆的高速路线`,

  assistantResponse: `这个任务会比较复杂，我会尽力完成。在开发过程中，我可能会向您请教一些具体细节或偏好。

让我为您规划从长沙到重庆的高速路线：

**推荐路线：**
1. **长沙 → 常德** (长张高速 G5513)
2. **常德 → 张家界** (长张高速 G5513)
3. **张家界 → 恩施** (张南高速 G5515)
4. **恩施 → 重庆** (沪渝高速 G50)

**总里程：** 约 650 公里
**预计时间：** 7-8 小时（不含休息）

**注意事项：**
- 山区路段较多，注意安全驾驶
- 建议在服务区适当休息
- 关注实时路况信息`,

  bubbleDoc: `## Bubble 组件功能文档

Bubble 组件是一个功能丰富的聊天气泡组件，支持：

- 多种消息类型（文本、文件、图片等）
- 自定义渲染配置
- 左右布局切换
- 文件附件展示

以下是相关的设计文档和示例图片：`,
};

const DialogFlowCard = () => {
  const containerRef = useRef<ChatLayoutRef>(null);
  const [bubbleList, setBubbleList] = useState<MessageBubbleData[]>([]);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 用户和助手元数据
  const userMeta = {
    name: '用户',
    avatar: '',
  };

  const assistantMeta = {
    name: 'LUI Chat',
    avatar:
      'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
  };

  // 模拟消息流效果
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // 第1条：助手欢迎消息
    const timer1 = setTimeout(() => {
      setBubbleList([
        createMockMessage('msg-0', 'assistant', INITIAL_MESSAGES.assistant),
      ]);
    }, 0);

    // 第2条：用户路线规划请求
    const timer2 = setTimeout(() => {
      setBubbleList((prev: MessageBubbleData[]) => [
        ...prev,
        createMockMessage('msg-1', 'user', INITIAL_MESSAGES.user),
      ]);
    }, 2000);

    // 第3条：助手回复路线规划
    const timer3 = setTimeout(() => {
      setBubbleList((prev: MessageBubbleData[]) => [
        ...prev,
        createMockMessage(
          'msg-2',
          'assistant',
          INITIAL_MESSAGES.assistantResponse,
        ),
      ]);
    }, 4000);

    // 第4条：用户消息 "这是第1条消息"
    const timer4 = setTimeout(() => {
      setBubbleList((prev: MessageBubbleData[]) => [
        ...prev,
        createMockMessage('msg-3', 'user', '这是第1条消息'),
      ]);
    }, 6000);

    // 第5条：助手回复 "Bubble 组件功能文档"（包含文件附件）
    const timer5 = setTimeout(() => {
      setBubbleList((prev: MessageBubbleData[]) => [
        ...prev,
        createMockMessage(
          'msg-4',
          'assistant',
          INITIAL_MESSAGES.bubbleDoc,
          mockInlineFileMap,
        ),
      ]);
    }, 8000);

    timers.push(timer1, timer2, timer3, timer4, timer5);

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current);
      }
    };
  }, []);

  return (
    <DesignCard>
      <CardTitle>对话流</CardTitle>
      <CardDescription>
        组织和展示完整对话历史，管理整个对话流的布局和滚动。
      </CardDescription>
      <DialogFlowWrapper
        style={{ marginTop: '42px', height: '400px', position: 'relative' }}
      >
        <ChatLayout
          ref={containerRef}
          // header={{
          //   title: 'LUI Chat',
          //   onLeftCollapse: () => {},
          //   onShare: () => {},
          // }}
        >
          <BubbleList
            pure
            onLike={() => {}}
            onDisLike={() => {}}
            shouldShowVoice={true}
            bubbleList={bubbleList}
            assistantMeta={assistantMeta}
            userMeta={userMeta}
            markdownRenderConfig={{
              tableConfig: {
                pure: true,
              },
            }}
          />
        </ChatLayout>
      </DialogFlowWrapper>
    </DesignCard>
  );
};

export default DialogFlowCard;
