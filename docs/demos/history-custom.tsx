import { History, HistoryDataType } from '@ant-design/agentic-ui';
import dayjs from 'dayjs';
import React, { useState } from 'react';

const CustomHistoryDemo = () => {
  const [currentSessionId, setCurrentSessionId] = useState('session-1');

  const now = new Date();
  const today = now.getTime();
  const yesterday = today - 86400000;
  const threeDaysAgo = today - 259200000;

  // 模拟请求函数
  const mockRequest = async ({ agentId }: { agentId: string }) => {
    return [
      {
        id: '1',
        sessionId: 'session-1',
        sessionTitle: '重构用户权限管理模块',
        agentId: agentId,
        gmtCreate: today - 3600000,
        gmtLastConverse: today - 3600000,
      },
      {
        id: '2',
        sessionId: 'session-2',
        sessionTitle: '排查生产环境内存泄漏问题',
        agentId: agentId,
        gmtCreate: yesterday,
        gmtLastConverse: yesterday,
      },
      {
        id: '3',
        sessionId: 'session-3',
        sessionTitle: '编写单元测试覆盖核心业务逻辑',
        agentId: agentId,
        gmtCreate: threeDaysAgo,
        gmtLastConverse: threeDaysAgo,
      },
    ] as HistoryDataType[];
  };

  const handleSelected = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    console.log('选择会话:', sessionId);
  };

  const handleDeleteItem = async (sessionId: string) => {
    console.log('删除会话:', sessionId);
  };

  // 自定义日期格式化函数
  const customDateFormatter = (date: number | string | Date) => {
    const dateObj = new Date(date);
    const todayDate = new Date();
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    if (dateObj.toDateString() === todayDate.toDateString()) {
      return '今天';
    } else if (dateObj.toDateString() === yesterdayDate.toDateString()) {
      return '昨天';
    } else {
      return dayjs(date).format('MM月DD日');
    }
  };

  // 自定义分组函数
  const customGroupBy = (item: HistoryDataType) => {
    const date = new Date(item.gmtCreate as number);
    const todayDate = new Date();
    const yesterdayDate = new Date(todayDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    if (date.toDateString() === todayDate.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterdayDate.toDateString()) {
      return '昨天';
    } else {
      return '更早';
    }
  };

  // 自定义排序函数
  const customSort = (a: HistoryDataType, b: HistoryDataType) => {
    return (b.gmtCreate as number) - (a.gmtCreate as number);
  };

  return (
    <div style={{ padding: 12 }}>
      <h3>History 自定义配置</h3>
      <p>当前会话ID: {currentSessionId}</p>

      <div
        style={{
          padding: '20px',
          width: 348,
          margin: '0 auto',
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
          customDateFormatter={customDateFormatter}
          groupBy={customGroupBy}
          sessionSort={customSort}
          standalone
        />
      </div>
    </div>
  );
};

export default CustomHistoryDemo;
