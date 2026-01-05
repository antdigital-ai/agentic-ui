import React, { useEffect, useState } from 'react';
import { BrowserItem, Workspace } from '@ant-design/agentic-ui';
import { QuestionCircleOutlined } from '@ant-design/icons';
import {
  CardDescription,
  CardTitle,
  DesignCard,
  WorkspaceWrapper,
} from '../style';

const WorkspaceCard: React.FC = () => {
  const [mdContent, setMdContent] = useState('');

  // 模拟建议列表
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

  // 搜索结果映射
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

  // 请求处理函数
  const request = (suggestion: { id: string }) => ({
    items: resultsMap[suggestion.id] || [],
    loading: false,
  });

  // 模拟实时内容更新
  useEffect(() => {
    const defaultValue = `# 深度思考

## 问题分析

当前需要分析稳定币市场的发展趋势，主要关注以下几个方面：

1. **市场规模**：2025年稳定币市场的整体规模
2. **主要币种**：USDT、USDC、BUSD 等主流稳定币的发行量
3. **监管政策**：全球主要司法管辖区的监管动态
4. **市场波动**：最近3个月的市场波动性数据

## 执行策略

### 第一步：数据收集
- 搜索权威报告和数据分析
- 收集官方发行量数据
- 整理监管政策文件

### 第二步：数据分析
- 对比不同稳定币的发行趋势
- 分析监管政策对市场的影响
- 评估市场波动性指标

### 第三步：结论输出
- 生成综合分析报告
- 提供数据可视化图表
- 给出市场趋势预测`;

    if (process.env.NODE_ENV === 'test') {
      setMdContent(defaultValue);
    } else {
      const list = defaultValue.split('');
      const run = async () => {
        let currentMd = '';
        for (const item of list) {
          currentMd += item;
          const mdSnapshot = currentMd; // Capture current value
          await new Promise<void>((resolve) => {
            setTimeout(() => {
              setMdContent(mdSnapshot);
              resolve();
            }, 10);
          });
        }
      };
      run();
    }
  }, []);

  return (
    <DesignCard>
      <CardTitle>工作空间</CardTitle>
      <CardDescription>
        作为对话的辅助功能，工作空间用于预览和编辑 AI
        进程或产出的内容，例如文档、代码、图表等详情。
      </CardDescription>
      <WorkspaceWrapper
        style={{ marginTop: '24px', height: '420px', overflow: 'hidden' }}
      >
        <Workspace
          title="开发工作空间"
          onTabChange={(key: string) => console.log('切换到标签页:', key)}
          onClose={() => console.log('关闭工作空间')}
        >
          {/* 实时监控标签页 - Markdown 内容 */}
          <Workspace.Realtime
            tab={{
              key: 'realtime',
              title: '实时跟随',
            }}
            data={{
              type: 'md',
              content: mdContent,
              title: '深度思考',
            }}
          />

          {/* 任务执行标签页 */}
          <Workspace.Task
            tab={{
              key: 'tasks',
              title: <div>任务列表</div>,
            }}
            data={{
              items: [
                {
                  key: '1',
                  title: '创建全面的 Tesla 股票分析任务列表',
                  status: 'success',
                },
                {
                  key: '2',
                  title: '下载指定的Bilibili视频分集并确保唯一文件名',
                  content: (
                    <div>
                      任务已停止
                      <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                    </div>
                  ),
                  status: 'error',
                },
                {
                  key: '3',
                  title: '提取下载的视频帧',
                  status: 'loading',
                },
                {
                  key: '4',
                  title: '对提取的视频帧进行文字识别',
                  status: 'pending',
                },
                {
                  key: '5',
                  title: '筛选掉OCR识别结果为乱码的图片',
                  status: 'pending',
                },
                {
                  key: '6',
                  title: '报告结果并将Word文档发送给用户',
                  status: 'pending',
                },
              ],
            }}
          />

          {/* 浏览器标签页 */}
          <Workspace.Browser
            tab={{
              key: 'browser',
              title: '浏览器',
            }}
            suggestions={suggestions}
            request={request}
          />

          {/* 文件管理标签页 */}
          <Workspace.File
            tab={{
              key: 'files',
              count: 6,
            }}
            nodes={[
              {
                id: '1',
                name: '项目计划.txt',
                size: '2.5MB',
                lastModified: '2025-08-11 10:00:00',
                url: '/docs/project-plan.txt',
                displayType: 'txt',
              },
              {
                id: '2',
                name: '数据分析.xlsx',
                type: 'excel',
                size: '1.8MB',
                lastModified: '2025-08-11 10:00:00',
                url: '/docs/data-analysis.xlsx',
              },
              {
                id: '3',
                name: '技术文档.pdf',
                type: 'pdf',
                size: '3.2MB',
                lastModified: '2025-08-11 10:00:00',
                url: '/docs/technical-doc.pdf',
              },
              {
                id: '4',
                name: '系统架构图.png',
                type: 'image',
                size: '0.5MB',
                lastModified: '2025-08-11 10:00:00',
                url: '/images/architecture.png',
              },
              {
                id: '5',
                name: '接口文档.md',
                type: 'markdown',
                size: '0.3MB',
                lastModified: '2025-08-11 10:00:00',
                url: '/docs/api.md',
              },
              {
                id: '6',
                name: '配置说明.html',
                type: 'code',
                size: '0.1MB',
                lastModified: '2025-08-11 10:00:00',
                content:
                  '<!DOCTYPE html><html><body><h1>Hello</h1></body></html>',
              },
            ]}
          />
        </Workspace>
      </WorkspaceWrapper>
    </DesignCard>
  );
};

export default WorkspaceCard;
