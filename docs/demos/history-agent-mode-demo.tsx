import { History, HistoryDataType } from '@ant-design/agentic-ui';
import { message } from 'antd';
import React, { useState } from 'react';

const AgentModeHistoryDemo = () => {
  const [currentSessionId, setCurrentSessionId] = useState('session-1');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [favorites, setFavorites] = useState(new Set(['session-1']));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 模拟历史数据
  const mockHistoryData: HistoryDataType[] = [
    {
      id: '1',
      sessionId: 'session-1',
      sessionTitle: '如何实现 React 组件的懒加载？',

      gmtCreate: Date.now() - 3600000,
      isFavorite: favorites.has('session-1'),
    },
    {
      id: '2',
      sessionId: 'session-2',
      sessionTitle: 'TypeScript 高级类型的使用技巧',
      gmtCreate: Date.now() - 7200000,
      isFavorite: favorites.has('session-2'),
    },
    {
      id: '3',
      sessionId: 'session-3',
      sessionTitle: '前端性能优化的最佳实践',
      description: '这是一个描述',
      icon: '📄',
      gmtCreate: Date.now() - 86400000,
      isFavorite: favorites.has('session-3'),
    },
    {
      id: '4',
      sessionId: 'session-4',
      sessionTitle: 'CSS Grid 布局详解',
      gmtCreate: Date.now() - 172800000,
      isFavorite: favorites.has('session-4'),
    },
    {
      id: '5',
      sessionId: 'session-5',
      sessionTitle: 'JavaScript 异步编程模式',
      gmtCreate: Date.now() - 259200000,
      isFavorite: favorites.has('session-5'),
    },
  ];

  // 模拟请求函数
  const mockRequest = async ({ agentId }: { agentId: string }) => {
    console.log('请求历史数据，agentId:', agentId);
    // 模拟网络延迟
    await new Promise((resolve) => {
      setTimeout(resolve, 500);
    });
    return mockHistoryData;
  };

  // 处理搜索
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    message.info(`搜索关键词: ${keyword}`);
  };

  // 处理收藏
  const handleFavorite = async (sessionId: string, isFavorite: boolean) => {
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    const newFavorites = new Set(favorites);
    if (isFavorite) {
      newFavorites.add(sessionId);
      message.success('已添加到收藏');
    } else {
      newFavorites.delete(sessionId);
      message.info('已取消收藏');
    }
    setFavorites(newFavorites);
  };

  // 处理多选
  const handleSelectionChange = (selectedSessionIds: string[]) => {
    setSelectedIds(selectedSessionIds);
    message.info(`已选择 ${selectedSessionIds.length} 个会话`);
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

  // 处理新对话
  const handleNewChat = async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });
    message.success('创建新对话');
  };

  // 处理选择会话
  const handleSelected = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    message.success(`选择了会话: ${sessionId}`);
  };

  // 处理删除会话
  const handleDeleteItem = async () => {
    message.loading('正在删除...');
    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
    message.success('删除成功');
  };

  return (
    <div style={{ padding: 12 }}>
      <h3>History Agent 模式</h3>
      <p>当前会话ID: {currentSessionId}</p>
      <p>搜索关键词: {searchKeyword}</p>
      <p>收藏数量: {favorites.size}</p>
      <p>选中数量: {selectedIds.length}</p>

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
          onSelected={handleSelected}
          onDeleteItem={handleDeleteItem}
          standalone
          agent={{
            enabled: true,
            onSearch: handleSearch,
            onFavorite: handleFavorite,
            onSelectionChange: handleSelectionChange,
            onLoadMore: handleLoadMore,
            onNewChat: handleNewChat,
          }}
        />
      </div>

      <div style={{ marginTop: '20px', padding: '20px' }}>
        <h4>Props 说明：</h4>
        <ul>
          <li>
            <strong>agent.enabled</strong>: 启用 Agent
            模式，显示搜索、收藏、多选等功能
          </li>
          <li>
            <strong>agent.onSearch</strong>: 搜索回调函数，处理搜索关键词
          </li>
          <li>
            <strong>agent.onFavorite</strong>: 收藏回调函数，处理收藏/取消收藏
          </li>
          <li>
            <strong>agent.onSelectionChange</strong>:
            多选回调函数，处理多选状态变化
          </li>
          <li>
            <strong>agent.onLoadMore</strong>:
            加载更多回调函数，处理加载更多数据
          </li>
          <li>
            <strong>agent.onNewChat</strong>: 新对话回调函数，处理创建新对话
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
            <strong>onSelected</strong>: 选择历史记录项时的回调函数
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

export default AgentModeHistoryDemo;
