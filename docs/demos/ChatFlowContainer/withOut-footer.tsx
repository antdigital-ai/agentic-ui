import {
  BackTo,
  BubbleList,
  ChatLayout,
  ChatLayoutRef,
  History,
  HistoryDataType,
  MessageBubbleData,
} from '@ant-design/agentic-ui';
import React, { useEffect, useRef, useState } from 'react';
import {
  assistantMeta,
  createMockMessage,
  INITIAL_MESSAGES,
  mockInlineFileMap,
  RETRY_CONFIG,
  userMeta,
} from './data';
import './style.css';

const StandaloneHistoryDemo = () => {
  const [currentSessionId, setCurrentSessionId] = useState('session-2');

  // 模拟请求函数
  const mockRequest = async ({ agentId }: { agentId: string }) => {
    // 模拟 API 请求
    return [
      {
        id: '1',
        sessionId: 'session-1',
        sessionTitle: '让黄河成为造福人民的幸福河',
        agentId: agentId,
        gmtCreate: 1703123456789, // 2023-12-21 10:30:56
        gmtLastConverse: 1703123456789,
        isFavorite: true,
      },
      {
        id: '2',
        sessionId: 'session-2',
        sessionTitle: '才读昔楚雄，又见今人勇。',
        agentId: agentId,
        gmtCreate: 1703037056789, // 2023-12-20 10:30:56
        gmtLastConverse: 1703037056789,
        isFavorite: false,
      },
      {
        id: '3',
        sessionId: 'session-3',
        sessionTitle:
          '金山银山不如绿水青山，生态环境保护是一个长期任务，要久久为功。',
        agentId: agentId,
        gmtCreate: 1702950656789, // 2023-12-19 10:30:56
        gmtLastConverse: 1702950656789,
      },
      {
        id: '4',
        sessionId: 'session-4',
        sessionTitle: '才读昔楚雄，又见今人勇。',
        agentId: agentId,
        gmtCreate: 1702950656789, // 2023-12-19 10:30:56
        gmtLastConverse: 1702950656789,
      },
      {
        id: '5',
        sessionId: 'session-5',
        sessionTitle: '县县通高速，铺就乡村幸福路',
        agentId: agentId,
        gmtCreate: 1702950656789, // 2023-12-19 10:30:56
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

/**
 * ChatLayout 对话布局组件演示
 *
 * 展示 ChatLayout 组件的完整功能，包括：
 * - 头部区域的标题、折叠按钮和分享按钮
 * - 内容区域的对话消息展示
 * - 底部区域的输入框和发送按钮
 * - 左右侧边栏的折叠功能
 */
const ChatLayoutDemo: React.FC = () => {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
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
    }, 100);
  };

  useEffect(() => {
    handleRetry();
  }, []);
  // ***************** Footer Task Running End ***************** //

  return (
    <div style={{ padding: 8, backgroundColor: 'var(--color-gray-bg-page)' }}>
      <div className="custom-chat-container-demo">
        {/* 左侧边栏 */}
        <div className={`sidebar-left ${leftCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-left-content">
            <StandaloneHistoryDemo />
          </div>
        </div>

        {/* 主对话区域 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            minWidth: 0,
          }}
        >
          <ChatLayout
            ref={containerRef}
            header={{
              title: 'AI 助手',
              onLeftCollapse: handleLeftCollapse,
              onShare: handleShare,
            }}
            footerHeight={0}
            scrollBehavior="auto"
            footer={
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-16px',
                    left: '50%',
                    transform: 'translate(-50%, -100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 16,
                  }}
                >
                  <BackTo.Top
                    tooltip="去顶部"
                    shouldVisible={200}
                    target={() =>
                      containerRef.current?.scrollContainer ?? document.body
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
                      containerRef.current?.scrollContainer ?? document.body
                    }
                    style={{
                      position: 'relative',
                      bottom: 0,
                      insetInlineEnd: 0,
                    }}
                  />
                </div>
              </div>
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
        </div>
      </div>
    </div>
  );
};

export default ChatLayoutDemo;
