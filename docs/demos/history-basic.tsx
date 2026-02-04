import { History, HistoryDataType } from '@ant-design/agentic-ui';
import React, { useState } from 'react';

const BasicHistoryDemo = () => {
  const [currentSessionId, setCurrentSessionId] = useState('session-1');

  // 模拟请求函数
  const mockRequest = async ({ agentId }: { agentId: string }) => {
    // 模拟 API 请求
    return [
      {
        id: '1',
        sessionId: 'session-1',
        sessionTitle: '关于项目架构的讨论',
        agentId: agentId,
        gmtCreate: 1703123456789, // 2023-12-21 10:30:56
        gmtLastConverse: 1703123456789,
      },
      {
        id: '2',
        sessionId: 'session-2',
        sessionTitle: '代码优化建议',
        agentId: agentId,
        gmtCreate: 1703037056789, // 2023-12-20 10:30:56
        gmtLastConverse: 1703037056789,
      },
      {
        id: '3',
        sessionId: 'session-3',
        sessionTitle: '前端性能优化讨论',
        agentId: agentId,
        gmtCreate: 1702950656789, // 2023-12-19 10:30:56
        gmtLastConverse: 1702950656789,
      },
      {
        id: '4',
        sessionId: 'session-4',
        sessionTitle: '数据库设计讨论',
        agentId: agentId,
        gmtCreate: 1702518656789, // 2023-12-14 10:30:56
        gmtLastConverse: 1702518656789,
      },
    ] as HistoryDataType[];
  };

  const handleSelected = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    console.log('选择会话:', sessionId);
  };

  const handleDeleteItem = async (sessionId: string) => {
    console.log('删除会话:', sessionId);
    // 这里可以调用删除 API
  };

  return (
    <div style={{ padding: 12 }}>
      <h3>History 基础用法</h3>
      <p>当前会话ID: {currentSessionId}</p>

      <h4>Props 说明：</h4>
      <ul>
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
          <strong>onSelected</strong>: 选择历史记录项时的回调函数
        </li>
        <li>
          <strong>onDeleteItem</strong>: 删除历史记录项时的回调函数
        </li>
      </ul>

      <div
        style={{
          width: 48,
          height: 48,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '16px',
          border: '1px solid var(--color-gray-border-light)',
        }}
      >
        <History
          agentId="test-agent"
          sessionId={currentSessionId}
          request={mockRequest}
          onClick={handleSelected}
          onDeleteItem={handleDeleteItem}
        />
      </div>
    </div>
  );
};

export default BasicHistoryDemo;
