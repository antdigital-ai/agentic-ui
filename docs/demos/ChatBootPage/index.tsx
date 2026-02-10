import {
  BubbleList,
  ButtonTabGroup,
  ButtonTabItem,
  CaseReply,
  ChatLayout,
  ChatLayoutRef,
  History,
  HistoryDataType,
  MarkdownEditorInstance,
  MarkdownInputField,
  MessageBubbleData,
  Title,
} from '@ant-design/agentic-ui';
import { RefreshCcw } from '@sofa-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import { assistantMeta, userMeta } from './data';
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
        sessionTitle: '新能源汽车板块近期走势分析',
        agentId: agentId,
        gmtCreate: 1703123456789,
        gmtLastConverse: 1703123456789,
        isFavorite: true,
      },
      {
        id: '2',
        sessionId: 'session-2',
        sessionTitle: '半导体ETF定投策略咨询',
        agentId: agentId,
        gmtCreate: 1703037056789,
        gmtLastConverse: 1703037056789,
        isFavorite: false,
      },
      {
        id: '3',
        sessionId: 'session-3',
        sessionTitle:
          '对比分析沪深300和中证500指数基金的长期收益与风险表现',
        agentId: agentId,
        gmtCreate: 1702950656789,
        gmtLastConverse: 1702950656789,
      },
      {
        id: '4',
        sessionId: 'session-4',
        sessionTitle: '可转债投资入门指南',
        agentId: agentId,
        gmtCreate: 1702950656789,
        gmtLastConverse: 1702950656789,
      },
      {
        id: '5',
        sessionId: 'session-5',
        sessionTitle: '港股通标的筛选与估值分析',
        agentId: agentId,
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
  const [bubbleList, setBubbleList] = useState<MessageBubbleData[]>([]);
  const [activeTab, setActiveTab] = useState('1');

  const containerRef = useRef<ChatLayoutRef>(null);
  const inputRef = useRef<MarkdownEditorInstance | undefined>(undefined);

  // ButtonTabGroup 的配置项
  const tabItems: ButtonTabItem[] = [
    {
      key: '1',
      label: '全部',
      icon: <RefreshCcw />,
      onIconClick: () => {
        console.log('刷新最近对话');
        // 这里可以添加刷新逻辑
        alert('刷新最近对话！');
      },
    },
    {
      key: '2',
      label: '咨询小助手',
    },
    {
      key: '3',
      label: '证券观察助手',
    },
    {
      key: '4',
      label: '智能投顾助手',
    },
    {
      key: '5',
      label: '理财师助手',
    },
  ];

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

  // ***************** Input ***************** //
  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const timestamp = Date.now();

    // 创建用户消息
    const userMessage: MessageBubbleData = {
      id: `user-${timestamp}`,
      role: 'user',
      content: text,
      originContent: text,
      createAt: timestamp,
      updateAt: timestamp,
    };

    // 添加用户消息到列表
    setBubbleList((prev) => [...prev, userMessage]);

    // 清空输入框
    inputRef.current?.store?.setMDContent('');

    console.log('发送内容:', text);
  };

  // ***************** CaseReply Click ***************** //
  const handleCaseReplyClick = (description: string) => {
    const timestamp = Date.now();

    // 创建用户消息
    const userMessage: MessageBubbleData = {
      id: `user-${timestamp}`,
      role: 'user',
      content: description,
      originContent: description,
      createAt: timestamp,
      updateAt: timestamp,
    };

    // 创建 AI 回复消息
    const assistantMessage: MessageBubbleData = {
      id: `assistant-${timestamp + 1}`,
      role: 'assistant',
      content: `关于"${description}"的分析结果：\n\n根据最新数据显示，恒生科技指数基金近期表现稳定，技术升级进展顺利。建议投资者关注以下几个方面：\n\n1. **技术创新动态**：关注核心科技企业的研发投入和技术突破\n2. **市场估值水平**：当前估值处于合理区间，具有一定投资价值\n3. **政策环境**：持续关注相关政策导向和监管动态\n4. **风险控制**：建议分散投资，控制单一标的比重\n\n*以上内容仅供参考，不构成投资建议*`,
      originContent: `关于"${description}"的分析结果：\n\n根据最新数据显示，恒生科技指数基金近期表现稳定，技术升级进展顺利。建议投资者关注以下几个方面：\n\n1. **技术创新动态**：关注核心科技企业的研发投入和技术突破\n2. **市场估值水平**：当前估值处于合理区间，具有一定投资价值\n3. **政策环境**：持续关注相关政策导向和监管动态\n4. **风险控制**：建议分散投资，控制单一标的比重\n\n*以上内容仅供参考，不构成投资建议*`,
      createAt: timestamp + 1000,
      updateAt: timestamp + 1000,
    };

    // 先添加用户消息
    setBubbleList((prev) => [...prev, userMessage]);

    // 延迟添加 AI 回复，模拟真实场景
    setTimeout(() => {
      setBubbleList((prev) => [...prev, assistantMessage]);
    }, 800);

    console.log('CaseReply 被点击:', description);
  };

  return (
    <div
      style={{ padding: 8, backgroundColor: 'var(--color-gray-bg-page-dark)' }}
    >
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
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent:
                  bubbleList.length === 0 ? 'center' : 'flex-start',
                alignItems: 'center',
              }}
            >
              {bubbleList.length > 0 && (
                <BubbleList
                  style={{
                    paddingBottom: '60px',
                    flex: 1,
                    width: '100%',
                  }}
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
              )}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                {bubbleList.length === 0 && (
                  <Title
                    title={
                      <>
                        <span>欢迎使用 </span>
                        <span
                          style={{
                            background:
                              'linear-gradient(270deg, #D3CEFF 0%, #8D83FF 24%, #1D3052 55%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            color: 'transparent',
                          }}
                        >
                          Agentar{' '}
                        </span>
                      </>
                    }
                    subtitle="您的 AI 金融分析助理"
                  />
                )}
                <MarkdownInputField
                  inputRef={inputRef}
                  placeholder="请输入内容..."
                  onSend={handleSend}
                  style={{
                    height: '120px',
                    width: '100%',
                    maxWidth: '800px',
                  }}
                />
                {bubbleList.length === 0 && (
                  <>
                    <div
                      style={{
                        marginTop: '128px',
                      }}
                    >
                      <ButtonTabGroup
                        items={tabItems}
                        activeKey={activeTab}
                        onChange={(key) => {
                          setActiveTab(key);
                          console.log('切换到:', key);
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '24px',
                        marginTop: '16px',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        width: '1000px',
                      }}
                    >
                      {[
                        {
                          coverBackground: 'rgba(132, 220, 24, 0.15)',
                          quoteIconColor: 'rgb(132, 220, 24)',
                          quote:
                            '恒生科技指数基金正处于技术升级与估值重塑的关键阶段。短期波动不改长期新经济代表性地位，但投资者需关注创新驱动能否持续转化。',
                          title: '搜热门资讯',
                          description: '恒生科技指数基金近有什么相关新闻',
                        },
                        {
                          coverBackground: 'rgba(24, 144, 255, 0.15)',
                          quoteIconColor: 'rgb(24, 144, 255)',
                          quote:
                            '了解基金投资的基础知识，帮助您更好地进行资产配置和风险管理。',
                          title: '学投资知识',
                          description: '基金投资入门指南',
                        },
                      ].map((item, index) => (
                        <CaseReply
                          key={index}
                          coverBackground={item.coverBackground}
                          quoteIconColor={item.quoteIconColor}
                          quote={item.quote}
                          title={item.title}
                          description={item.description}
                          buttonBar={
                            <button
                              type="button"
                              style={{
                                backgroundColor: '#000000',
                                color: '#ffffff',
                                borderRadius: '36px',
                                padding: '8px 16px',
                                cursor: 'pointer',
                                border: 'none',
                                fontSize: '14px',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('按钮被点击');
                              }}
                            >
                              查看回放
                            </button>
                          }
                          onClick={() => handleCaseReplyClick(item.description)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </ChatLayout>
        </div>
      </div>
    </div>
  );
};

export default ChatLayoutDemo;
