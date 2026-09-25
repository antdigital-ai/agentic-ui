import {
  AttachmentFile,
  BubbleList,
  ChatLayout,
  ChatLayoutRef,
  MessageBubbleData,
} from '@ant-design/agentic-ui';
import React, { useEffect, useRef, useState } from 'react';
import { useSiteI18n } from '../../../i18n';
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

const DialogFlowCard = () => {
  const { messages } = useSiteI18n();
  const containerRef = useRef<ChatLayoutRef>(null);
  const [bubbleList, setBubbleList] = useState<MessageBubbleData[]>([]);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoMessages = messages.support.dialogFlowDemo;

  // 用户和助手元数据
  const userMeta = {
    name: demoMessages.userName,
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
        createMockMessage('msg-0', 'assistant', demoMessages.assistantGreeting),
      ]);
    }, 0);

    // 第2条：用户路线规划请求
    const timer2 = setTimeout(() => {
      setBubbleList((prev: MessageBubbleData[]) => [
        ...prev,
        createMockMessage('msg-1', 'user', demoMessages.userRouteRequest),
      ]);
    }, 2000);

    // 第3条：助手回复路线规划
    const timer3 = setTimeout(() => {
      setBubbleList((prev: MessageBubbleData[]) => [
        ...prev,
        createMockMessage('msg-2', 'assistant', demoMessages.routeResponse),
      ]);
    }, 4000);

    // 第4条：用户消息 "这是第1条消息"
    const timer4 = setTimeout(() => {
      setBubbleList((prev: MessageBubbleData[]) => [
        ...prev,
        createMockMessage('msg-3', 'user', demoMessages.followUp),
      ]);
    }, 6000);

    // 第5条：助手回复 "Bubble 组件功能文档"（包含文件附件）
    const timer5 = setTimeout(() => {
      setBubbleList((prev: MessageBubbleData[]) => [
        ...prev,
        createMockMessage(
          'msg-4',
          'assistant',
          demoMessages.bubbleDoc,
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
  }, [demoMessages]);

  return (
    <DesignCard>
      <CardTitle>{messages.support.dialogFlow.title}</CardTitle>
      <CardDescription>
        {messages.support.dialogFlow.description}
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
