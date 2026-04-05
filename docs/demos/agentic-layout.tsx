import {
  AgenticLayout,
  AttachmentFile,
  BackTo,
  BubbleList,
  BubbleMetaData,
  ChatLayout,
  ChatLayoutRef,
  History,
  HistoryDataType,
  MessageBubbleData,
  TASK_RUNNING_STATUS,
  TASK_STATUS,
  TaskRunning,
  Workspace,
} from '@ant-design/agentic-ui';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Flex } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

// 用户和助手的元数据配置
const assistantMeta: BubbleMetaData = {
  avatar:
    'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
  title: 'AI助手',
};

const userMeta: BubbleMetaData = {
  avatar:
    'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
  title: '用户',
};

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
  meta: {
    avatar: role === 'assistant' ? assistantMeta.avatar : userMeta.avatar,
    title: role === 'assistant' ? assistantMeta.title : userMeta.title,
  } as BubbleMetaData,
  fileMap: fileMap || new Map(),
});

const INITIAL_MESSAGES = {
  assistant: `### Ant Design 聊天助手
可协助解答问题、提供示例与文档说明。`,

  user: `请简要说明 AgenticLayout 里聊天区与侧栏如何配合。`,

  bubbleDoc: `## 附件示例
下方为内联文件：`,
};

// 重试任务配置
const RETRY_CONFIG = {
  MESSAGE_COUNT: 2,
  MAX_RETRY: 6, // 设置偶数
  INTERVAL: 2000,
};

const StandaloneHistoryDemo = () => {
  const [currentSessionId, setCurrentSessionId] = useState('session-2');

  const mockRequest = async ({ agentId }: { agentId: string }) => {
    return [
      {
        id: '1',
        sessionId: 'session-1',
        sessionTitle: '布局示例会话 A',
        agentId,
        gmtCreate: 1703123456789,
        gmtLastConverse: 1703123456789,
        isFavorite: true,
      },
      {
        id: '2',
        sessionId: 'session-2',
        sessionTitle: '布局示例会话 B',
        agentId,
        gmtCreate: 1703037056789,
        gmtLastConverse: 1703037056789,
        isFavorite: false,
      },
      {
        id: '3',
        sessionId: 'session-3',
        sessionTitle: '布局示例会话 C',
        agentId,
        gmtCreate: 1702950656789,
        gmtLastConverse: 1702950656789,
      },
    ] as HistoryDataType[];
  };

  const handleSelected = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    console.log('选择会话:', sessionId);
  };

  // 处理加载更多
  const handleLoadMore = async () => {
    // 模拟加载更多
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
  };

  return (
    <History
      agentId="test-agent"
      sessionId={currentSessionId}
      request={mockRequest}
      onClick={handleSelected}
      standalone
      type="chat"
      agent={{
        enabled: true,
        onSearch: () => {},
        onNewChat: () => {},
        onLoadMore: handleLoadMore,
        onFavorite: async () => {
          await new Promise((resolve) => {
            setTimeout(resolve, 1000);
          });
        },
      }}
    />
  );
};

const defaultValue = `<!-- {"MarkdownType": "report", "id": "demo-doc", "section_ids": "[1, 2, 3, 4, 5]"} -->
  # Markdown 全功能技术文档优化版

  ## 1. 基础文本格式增强

  ### 1.1 文本样式扩展
  \`\`\`markdown
  普通文本
  **粗体文本**
  *斜体文本*
  ~~删除线文本~~
  ==高亮文本==
  \`行内代码\`
  H~2~O 下标
  x^2^ 上标
  > 引用文本
  [超链接](https://example.com)
  👉 特殊符号支持
  \`\`\`
  `;

const WorkspaceDemo = () => {
  const [mdContent, setMdContent] = useState('');
  const [htmlContent, setHtmlContent] = useState<string>('');

  const sampleHtml = `<!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>报告示例</title>
  </head>
  <body>
    <h1>模型推理报告</h1>
    <p>这是一个使用 iframe 渲染的 HTML 预览示例。</p>
    <h2>步骤</h2>
    <ol>
      <li>准备数据</li>
      <li>运行分析</li>
      <li>生成结果</li>
    </ol>
  </body>
  </html>`;

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      setMdContent(defaultValue);
      setHtmlContent(sampleHtml);
    } else {
      const list = defaultValue.split('');
      const run = async () => {
        let md = '';
        const processItem = async (item: string) => {
          md += item;
          await new Promise((resolve) => {
            setTimeout(() => {
              setMdContent(md);
              resolve(true);
            }, 10);
          });
        };

        for (let i = 0; i < list.length; i++) {
          await processItem(list[i]);
        }
      };
      run();

      const timer = setTimeout(() => {
        setHtmlContent(sampleHtml);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);
  return (
    <Workspace onTabChange={(key: string) => console.log('切换到标签页:', key)}>
      {/* 实时监控标签页 - Markdown 内容 */}
      <Workspace.Realtime
        tab={{
          key: 'realtime',
          title: '实时跟随',
        }}
        data={{
          type: 'md',
          content: mdContent,
          title: '深度思考',
        }}
      />

      {/* 任务执行标签页 */}
      <Workspace.Task
        tab={{
          key: 'tasks',
          title: <div>任务列表</div>,
        }}
        data={{
          items: [
            {
              key: '1',
              title: '创建全面的 Tesla 股票分析任务列表',
              status: 'success',
            },
            {
              key: '2',
              title: '下载指定的Bilibili视频分集并确保唯一文件名',
              content: (
                <div>
                  任务已停止
                  <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                </div>
              ),
              status: 'error',
            },

            {
              key: '3',
              title: '提取下载的视频帧',
              status: 'pending',
            },
            {
              key: '4',
              title: '对提取的视频帧进行文字识别',
              status: 'pending',
            },
            {
              key: '5',
              title: '筛选掉OCR识别结果为乱码的图片',
              status: 'pending',
            },
            {
              key: '6',
              title: '报告结果并将Word文档发送给用户',
              status: 'pending',
            },
          ],
        }}
      />

      {/* 文件管理标签页（列表里包含 .html，预览时将自动用 HtmlPreview 渲染） */}
      <Workspace.File
        tab={{
          key: 'files',
          count: 6,
        }}
        nodes={[
          {
            id: '1',
            name: '项目计划.txt',
            size: '2.5MB',
            lastModified: '2025-08-11 10:00:00',
            url: '/docs/project-plan.txt',
            displayType: 'txt',
          },
          {
            id: '2',
            name: '数据分析.xlsx',
            type: 'excel',
            size: '1.8MB',
            lastModified: '2025-08-11 10:00:00',
            url: '/docs/data-analysis.xlsx',
          },
          {
            id: '3',
            name: '技术文档.pdf',
            type: 'pdf',
            size: '3.2MB',
            lastModified: '2025-08-11 10:00:00',
            url: '/docs/technical-doc.pdf',
          },
          {
            id: '4',
            name: '系统架构图.png',
            type: 'image',
            size: '0.5MB',
            lastModified: '2025-08-11 10:00:00',
            url: '/images/architecture.png',
          },
          {
            id: '5',
            name: '接口文档.md',
            type: 'markdown',
            size: '0.3MB',
            lastModified: '2025-08-11 10:00:00',
            url: '/docs/api.md',
          },
          {
            id: '6',
            name: '配置说明.html',
            type: 'code',
            size: '0.1MB',
            lastModified: '2025-08-11 10:00:00',
            content: htmlContent,
          },
        ]}
      />
    </Workspace>
  );
};

const App = () => {
  const [leftCollapsed, setLeftCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1200;
    }
    return true;
  });
  const [rightCollapsed, setRightCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1200;
    }
    return true;
  });
  const [bubbleList, setBubbleList] = useState<MessageBubbleData[]>(() => {
    const messages: MessageBubbleData[] = [];

    for (let i = 0; i < RETRY_CONFIG.MESSAGE_COUNT; i++) {
      const role = i % 2 === 0 ? 'assistant' : 'user';
      const content =
        i === 0 ? INITIAL_MESSAGES.assistant : INITIAL_MESSAGES.user;
      messages.push(createMockMessage(`msg-${i}`, role, content, new Map()));
    }

    return messages;
  });

  const containerRef = useRef<ChatLayoutRef>(null);

  // 使用 useRef 管理重试状态，避免全局污染
  const isRetryingRef = useRef(false);
  const retryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 组件卸载时清理定时器，防止内存泄漏
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) {
        clearInterval(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      isRetryingRef.current = false;
    };
  }, []);

  // ***************** Header ***************** //
  const handleLeftCollapse = () => {
    setLeftCollapsed(!leftCollapsed);
    console.log('左侧边栏折叠状态:', !leftCollapsed);
  };

  const handleShare = () => {
    console.log('分享对话');
    // 这里可以添加分享逻辑
  };
  // ***************** Header End ***************** //

  // ***************** Footer Task Running ***************** //
  // 空函数，用于满足类型要求
  const noop = () => {};

  const handleCreateNewTask = () => {
    console.log('创建新任务');
  };

  const handleRetry = () => {
    console.log('重试任务');

    // 防止重复执行
    if (isRetryingRef.current) return;
    isRetryingRef.current = true;

    let retryCount = 0;

    retryTimerRef.current = setInterval(() => {
      let content = `这是第 ${retryCount + RETRY_CONFIG.MESSAGE_COUNT + 1} 条消息`;
      let fileMap = new Map();
      if (retryCount === RETRY_CONFIG.MAX_RETRY - 1) {
        content = INITIAL_MESSAGES.bubbleDoc;
        fileMap = mockInlineFileMap;
      } else {
        content = `这是第 ${retryCount + RETRY_CONFIG.MESSAGE_COUNT + 1} 条消息`;
      }
      setBubbleList((prev) => {
        const newMessage = createMockMessage(
          `msg-${Date.now()}`,
          prev.length % 2 === 0 ? 'user' : 'assistant',
          content,
          fileMap,
        );
        return [...prev, newMessage];
      });

      retryCount += 1;
      if (retryCount >= RETRY_CONFIG.MAX_RETRY) {
        if (retryTimerRef.current) {
          clearInterval(retryTimerRef.current);
          retryTimerRef.current = null;
        }
        isRetryingRef.current = false;
      }
    }, RETRY_CONFIG.INTERVAL);
  };

  const handleViewResult = () => {
    console.log('查看任务结果');
  };
  useEffect(() => {
    handleRetry();
  }, []);
  // ****
  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--color-gray-bg-page)',
        padding: 6,
      }}
    >
      <AgenticLayout
        style={{
          minHeight: 450,
          maxHeight: 'calc(100vh - 16px)',
          height: 'calc(100vh - 16px)',
          width: 'calc(100vw - 24px)',
        }}
        header={{
          title: 'AI 助手',
          leftCollapsed: leftCollapsed,
          onLeftCollapse: handleLeftCollapse,
          onShare: handleShare,
          rightCollapsed: rightCollapsed,
          onRightCollapse: setRightCollapsed,
        }}
        left={<StandaloneHistoryDemo />}
        center={
          <ChatLayout
            ref={containerRef}
            footer={
              <Flex vertical align="center" justify="center" gap={24}>
                <Flex gap={8} align="center" justify="center">
                  <BackTo.Top
                    tooltip="去顶部"
                    shouldVisible={200}
                    target={() =>
                      containerRef.current?.scrollContainer as HTMLElement
                    }
                    style={{
                      position: 'relative',
                      bottom: 0,
                      insetInlineEnd: 0,
                    }}
                  />
                  <BackTo.Bottom
                    tooltip="去底部"
                    shouldVisible={200}
                    target={() =>
                      containerRef.current?.scrollContainer as HTMLElement
                    }
                    style={{
                      position: 'relative',
                      bottom: 0,
                      insetInlineEnd: 0,
                    }}
                  />
                </Flex>
                <TaskRunning
                  title={`任务已完成, 耗时03分00秒`}
                  taskStatus={TASK_STATUS.SUCCESS}
                  taskRunningStatus={TASK_RUNNING_STATUS.COMPLETE}
                  onPause={noop}
                  onResume={noop}
                  onStop={noop}
                  onCreateNewTask={handleCreateNewTask}
                  onReplay={handleRetry}
                  onViewResult={handleViewResult}
                />
              </Flex>
            }
          >
            <BubbleList
              pure
              onLike={() => {}}
              onDisLike={() => {}}
              shouldShowVoice={true}
              markdownRenderConfig={{
                tableConfig: {
                  pure: true,
                },
              }}
              bubbleList={bubbleList}
              assistantMeta={assistantMeta}
              userMeta={userMeta}
            />
          </ChatLayout>
        }
        right={<WorkspaceDemo />}
      />
    </div>
  );
};

export default App;
