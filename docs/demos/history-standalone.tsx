import { History, HistoryDataType } from '@ant-design/agentic-ui';
import { message } from 'antd';
import React, { useState } from 'react';

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
      {
        id: '6',
        sessionId: 'session-6',
        sessionTitle: '请为我生成一个关于AI的报告',
        agentId: agentId,
        gmtCreate: 1702950656789, // 2023-12-19 10:30:56
        gmtLastConverse: 1702950656789,
      },
      {
        id: '7',
        sessionId: 'session-7',
        sessionTitle: '请帮我规划一条重庆两日游路线',
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
    message.loading('正在加载更多数据...');

    // 模拟加载更多
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

      <div style={{ marginTop: '20px' }}>
        <h4>Props 说明：</h4>
        <ul>
          <li>
            <strong>standalone</strong>: 设置为 true
            时，直接显示菜单列表而不是下拉菜单
          </li>
          <li>
            <strong>agentId</strong>: 代理ID，用于获取历史记录
          </li>
          <li>
            <strong>sessionId</strong>: 当前会话ID，变更时会触发数据重新获取
          </li>
          <li>
            <strong>request</strong>: 请求函数，用于获取历史数据
          </li>
          <li>
            <strong>onClick</strong>: 选择历史记录项时的回调函数
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StandaloneHistoryDemo;
