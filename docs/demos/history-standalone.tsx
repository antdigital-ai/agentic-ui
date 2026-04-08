import { History, HistoryDataType } from '@ant-design/agentic-ui';
import { message } from 'antd';
import React, { useState } from 'react';

const StandaloneHistoryDemo = () => {
  const [currentSessionId, setCurrentSessionId] = useState('session-2');

  const mockRequest = async ({ agentId }: { agentId: string }) => {
    const now = Date.now();
    return [
      {
        id: '1',
        sessionId: 'session-1',
        sessionTitle: 'Python 爬虫入门',
        agentId,
        gmtCreate: now - 1800000,
        gmtLastConverse: now - 1800000,
        isFavorite: true,
      },
      {
        id: '2',
        sessionId: 'session-2',
        sessionTitle: 'useEffect 清理函数',
        agentId,
        gmtCreate: now - 7200000,
        gmtLastConverse: now - 7200000,
        isFavorite: false,
      },
      {
        id: '3',
        sessionId: 'session-3',
        sessionTitle: '高并发推送架构',
        agentId,
        gmtCreate: now - 86400000,
        gmtLastConverse: now - 86400000,
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
