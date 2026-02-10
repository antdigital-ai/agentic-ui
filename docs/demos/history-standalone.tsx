import { History, HistoryDataType } from '@ant-design/agentic-ui';
import { message } from 'antd';
import React, { useState } from 'react';

const StandaloneHistoryDemo = () => {
  const [currentSessionId, setCurrentSessionId] = useState('session-2');

  // 模拟请求函数
  const mockRequest = async ({ agentId }: { agentId: string }) => {
    return [
      {
        id: '1',
        sessionId: 'session-1',
        sessionTitle: '帮我用 Python 写一个 Web 爬虫',
        agentId: agentId,
        gmtCreate: Date.now() - 1800000, // 30分钟前
        gmtLastConverse: Date.now() - 1800000,
        isFavorite: true,
      },
      {
        id: '2',
        sessionId: 'session-2',
        sessionTitle: '解释 React useEffect 的清理机制',
        agentId: agentId,
        gmtCreate: Date.now() - 7200000, // 2小时前
        gmtLastConverse: Date.now() - 7200000,
        isFavorite: false,
      },
      {
        id: '3',
        sessionId: 'session-3',
        sessionTitle:
          '设计一个高并发的消息推送系统架构，需要支持百万级用户同时在线',
        agentId: agentId,
        gmtCreate: Date.now() - 86400000, // 1天前
        gmtLastConverse: Date.now() - 86400000,
      },
      {
        id: '4',
        sessionId: 'session-4',
        sessionTitle: 'TypeScript 泛型在实际项目中的应用',
        agentId: agentId,
        gmtCreate: Date.now() - 86400000,
        gmtLastConverse: Date.now() - 86400000,
      },
      {
        id: '5',
        sessionId: 'session-5',
        sessionTitle: '帮我优化这段 SQL 查询的执行效率',
        agentId: agentId,
        gmtCreate: Date.now() - 172800000, // 2天前
        gmtLastConverse: Date.now() - 172800000,
      },
      {
        id: '6',
        sessionId: 'session-6',
        sessionTitle: '生成一份 Q3 季度销售数据分析报告',
        agentId: agentId,
        gmtCreate: Date.now() - 259200000, // 3天前
        gmtLastConverse: Date.now() - 259200000,
      },
      {
        id: '7',
        sessionId: 'session-7',
        sessionTitle: '如何用 Docker Compose 部署微服务',
        agentId: agentId,
        gmtCreate: Date.now() - 345600000, // 4天前
        gmtLastConverse: Date.now() - 345600000,
      },
    ] as HistoryDataType[];
  };

  const handleSelected = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    console.log('选择会话:', sessionId);
  };

  // 处理加载更多
  const handleLoadMore = async () => {
    message.loading('正在加载更多数据...');

    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });

    message.success('加载完成');
  };

  return (
    <div style={{ padding: 12 }}>
      <h3>History 独立模式</h3>
      <p>当前会话ID: {currentSessionId}</p>

      <div
        style={{
          padding: '20px',
          width: 348,
          margin: '0 auto',
          borderRadius: '16px',
          height: 400,
          border: '1px solid var(--color-gray-border-light)',
        }}
      >
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
      </div>
    </div>
  );
};

export default StandaloneHistoryDemo;
