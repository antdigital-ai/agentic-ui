import { BrowserItem, Workspace } from '@ant-design/agentic-ui';
import React, { useState } from 'react';

const WorkspaceBrowserDemo: React.FC = () => {
  const [suggestions] = useState([
    { id: '1', label: '搜索市场规模（示例）', count: 2 },
    { id: '2', label: '搜索发行量（示例）', count: 2 },
  ]);

  const resultsMap: Record<string, BrowserItem[]> = {
    '1': [
      {
        id: '1-1',
        title: '市场规模报告（示例）',
        site: 'example.com',
        url: 'https://example.com',
      },
      {
        id: '1-2',
        title: '行业分析（示例）',
        site: 'example.org',
        url: 'https://example.org',
      },
    ],
    '2': [
      {
        id: '2-1',
        title: '发行量统计（示例）',
        site: 'example.com',
        url: 'https://example.com',
      },
      {
        id: '2-2',
        title: '链上数据概览（示例）',
        site: 'example.org',
        url: 'https://example.org',
      },
    ],
  };

  const request = (suggestion: { id: string }) => ({
    items: resultsMap[suggestion.id] || [],
    loading: false,
  });

  return (
    <div style={{ height: 600, width: '100%' }}>
      <Workspace title="文件工作台">
        <Workspace.Browser
          tab={{
            key: 'browser',
            title: '浏览器',
          }}
          suggestions={suggestions}
          request={request}
        />
        <Workspace.File nodes={[]} />
      </Workspace>
    </div>
  );
};

export default WorkspaceBrowserDemo;
