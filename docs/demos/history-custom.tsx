import { History, HistoryDataType } from '@ant-design/agentic-ui';
import dayjs from 'dayjs';
import React, { useState } from 'react';

const CustomHistoryDemo = () => {
  const [currentSessionId, setCurrentSessionId] = useState('session-1');

  // 模拟请求函数
  const mockRequest = async ({ agentId }: { agentId: string }) => {
    // 模拟 API 请求
    return [
      {
        id: '1',
        sessionId: 'session-1',
        sessionTitle: '重要会议记录',
        agentId: agentId,
        gmtCreate: 1718332800000, // 2024-04-15
        gmtLastConverse: 1718332800000,
      },
      {
        id: '2',
        sessionId: 'session-2',
        sessionTitle: '项目讨论',
        agentId: agentId,
        gmtCreate: 1718246400000, // 2024-04-14
        gmtLastConverse: 1718246400000,
      },
      {
        id: '3',
        sessionId: 'session-3',
        sessionTitle: '技术分享',
        agentId: agentId,
        gmtCreate: 1718160000000, // 2024-04-13
        gmtLastConverse: 1718160000000,
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

  // 自定义日期格式化函数
  const customDateFormatter = (date: number | string | Date) => {
    const dateObj = new Date(date);
    const today = new Date('2023-12-21');
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateObj.toDateString() === today.toDateString()) {
      return '今天';
    } else if (dateObj.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      return dayjs(date).format('MM月DD日');
    }
  };

  // 自定义分组函数
  const customGroupBy = (item: HistoryDataType) => {
    const date = new Date(item.gmtCreate as number);
    const today = new Date('2023-12-21');
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === yesterday.toDateString()) {
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

      <div style={{ marginTop: '20px', padding: '20px' }}>
        <h4>Props 说明：</h4>
        <ul>
          <li>
            <strong>customDateFormatter</strong>:
            自定义日期格式化函数，用于显示分组标题
          </li>
          <li>
            <strong>groupBy</strong>:
            自定义分组函数，用于将历史记录按自定义规则分组
          </li>
          <li>
            <strong>sessionSort</strong>: 自定义排序函数，用于对历史记录进行排序
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
            <strong>onClick</strong>: 点击历史记录项时的回调函数
          </li>
          <li>
            <strong>onDeleteItem</strong>: 删除历史记录项时的回调函数
          </li>
          <li>
            <strong>standalone</strong>: 设置为 true 时，直接显示菜单列表
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CustomHistoryDemo;
