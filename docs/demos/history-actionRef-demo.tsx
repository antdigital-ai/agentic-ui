import { History } from '@ant-design/agentic-ui';
import { Button, Space } from 'antd';
import React, { useRef } from 'react';

// 模拟历史记录数据
const mockHistoryData = [
  {
    id: '1',
    sessionId: 'session-1',
    sessionTitle: '关于 React Hooks 的讨论',
    gmtCreate: 1703039856789, // 1天前
  },
  {
    id: '2',
    sessionId: 'session-2',
    sessionTitle: 'TypeScript 类型系统详解',
    gmtCreate: 1702953456789, // 2天前
  },
  {
    id: '3',
    sessionId: 'session-3',
    sessionTitle: '前端性能优化实践',
    gmtCreate: 1702867056789, // 3天前
  },
];

// 模拟请求函数
const mockRequest = async ({ agentId }: { agentId: string }) => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log(`请求历史记录，agentId: ${agentId}`);
  return mockHistoryData;
};

const HistoryActionRefDemo: React.FC = () => {
  const historyActionRef = useRef<{ reload: () => void } | null>(null);

  const handleRefreshHistory = () => {
    console.log('手动刷新历史记录');
    historyActionRef.current?.reload();
  };

  const handleAddNewSession = () => {
    console.log('添加新会话');
    // 这里可以添加新会话的逻辑
    // 添加完成后刷新历史记录
    setTimeout(() => {
      historyActionRef.current?.reload();
    }, 1000);
  };

  return (
    <div style={{ padding: 12 }}>
      <h2>History 组件 actionRef 示例</h2>

      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleRefreshHistory}>
          刷新历史记录
        </Button>
        <Button onClick={handleAddNewSession}>添加新会话</Button>
      </Space>

      <div
        style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 16 }}
      >
        <History
          agentId="demo-agent"
          sessionId="current-session"
          request={mockRequest}
          actionRef={historyActionRef}
          standalone
          onClick={(sessionId, item) => {
            console.log('点击历史记录:', sessionId, item);
          }}
        />
      </div>

      <div style={{ marginTop: 16, fontSize: 14, color: '#666' }}>
        <p>说明：</p>
        <ul>
          <li>点击&quot;刷新历史记录&quot;按钮可以手动触发数据重新加载</li>
          <li>
            点击&quot;添加新会话&quot;按钮模拟添加新会话后自动刷新历史记录
          </li>
          <li>打开浏览器控制台可以看到相关的日志输出</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '20px' }}>
        <h4>Props 说明：</h4>
        <ul>
          <li>
            <strong>actionRef</strong>: 组件引用，用于调用组件内部方法
          </li>
          <li>
            <strong>actionRef.current.reload()</strong>: 手动刷新历史记录数据
          </li>
          <li>
            <strong>agentId</strong>: 代理ID，用于获取历史记录
          </li>
          <li>
            <strong>sessionId</strong>: 当前会话ID
          </li>
          <li>
            <strong>request</strong>: 请求函数，用于获取历史数据
          </li>
          <li>
            <strong>standalone</strong>: 设置为 true 时，直接显示菜单列表
          </li>
          <li>
            <strong>onClick</strong>: 点击历史记录项时的回调函数
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HistoryActionRefDemo;
