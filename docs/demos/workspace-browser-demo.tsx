import { Workspace } from '@ant-design/agentic-ui';
import React, { useState } from 'react';

const WorkspaceBrowserDemo: React.FC = () => {
  const [suggestions] = useState([
    {
      id: '1',
      label: '搜索2025年稳定币市场规模数据',
      count: 3,
    },
    {
      id: '2',
      label: '搜索USDT USDC BUSD 最新发行量',
      count: 3,
    },
    {
      id: '3',
      label: '搜索全球主要司法管辖区稳定币监管政策动态 2025',
      count: 3,
    },
    {
      id: '4',
      label: '搜索最近3个月稳定币市场波动性数据',
      count: 3,
    },
  ]);

  const resultsMap: Record<string, BrowserItem[]> = {
    '1': [
      {
        id: '1-1',
        title: '2025年稳定币市场规模预测报告',
        site: 'www.report.com',
        url: 'https://www.report.com',
      },
      {
        id: '1-2',
        title: '全球稳定币市场分析',
        site: 'www.analysis.com',
        url: 'https://www.analysis.com',
      },
      {
        id: '1-3',
        title: '稳定币发展趋势',
        site: 'www.trend.com',
        url: 'https://www.trend.com',
      },
    ],
    '2': [
      {
        id: '2-1',
        title: 'USDT 和USDC 的总量达到了2050 亿美元— 2025 年稳定币发生了什么',
        site: 'www.binance.com',
        url: 'https://www.binance.com',
        icon: 'https://bin.bnbstatic.com/static/images/common/favicon.ico',
      },
      {
        id: '2-2',
        title: '全球usdt的总量有多少？ 2025年最新数据别被FUD带偏了-多特软件站',
        site: 'm.duote.com',
        url: 'https://m.duote.com',
        icon: 'https://www.duote.com/favicon.ico',
      },
      {
        id: '2-3',
        title: '全球USDT目前发行的总量:2025年最新数据解析',
        site: 'www.duote.com',
        url: 'https://www.duote.com',
        icon: 'https://www.duote.com/favicon.ico',
      },
    ],
    '3': [
      {
        id: '3-1',
        title: '2025年全球稳定币监管政策概览',
        site: 'www.policy.com',
        url: 'https://www.policy.com',
      },
      {
        id: '3-2',
        title: '主要司法管辖区稳定币法规',
        site: 'www.law.com',
        url: 'https://www.law.com',
      },
      {
        id: '3-3',
        title: '监管动态更新',
        site: 'www.news.com',
        url: 'https://www.news.com',
      },
    ],
    '4': [
      {
        id: '4-1',
        title: '近3个月稳定币波动性分析',
        site: 'www.volatility.com',
        url: 'https://www.volatility.com',
      },
      {
        id: '4-2',
        title: '市场数据报告',
        site: 'www.marketdata.com',
        url: 'https://www.marketdata.com',
      },
      {
        id: '4-3',
        title: '稳定币价格走势',
        site: 'www.price.com',
        url: 'https://www.price.com',
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
