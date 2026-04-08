import { BrowserItem, Workspace } from '@ant-design/agentic-ui';
import { QuestionCircleOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { defaultValue } from './shared/defaultValue';

const Demo = () => {
  const [mdContent, setMdContent] = useState('');
  const [suggestions] = useState([
    { id: '1', label: '搜索 LLM 技术趋势', count: 2 },
    { id: '2', label: '搜索模型能力对比', count: 2 },
  ]);

  const resultsMap: Record<string, BrowserItem[]> = {
    '1': [
      {
        id: '1-1',
        title: 'LLM 趋势摘要（示例）',
        site: 'arxiv.org',
        url: 'https://arxiv.org',
      },
      {
        id: '1-2',
        title: '多模态模型概览（示例）',
        site: 'huggingface.co',
        url: 'https://huggingface.co',
      },
    ],
    '2': [
      {
        id: '2-1',
        title: '模型评测榜单（示例）',
        site: 'lmsys.org',
        url: 'https://lmsys.org',
        icon: 'https://lmsys.org/favicon.ico',
      },
      {
        id: '2-2',
        title: '代码能力对比（示例）',
        site: 'evalplus.github.io',
        url: 'https://evalplus.github.io',
      },
    ],
  };

  const request = (suggestion: { id: string }) => ({
    items: resultsMap[suggestion.id] || [],
    loading: false,
  });

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      setMdContent(defaultValue);
    } else {
      let md = '';
      const list = defaultValue.split('');
      const run = async () => {
        for await (const item of list) {
          md += item;
          const snapshot = md;
          await new Promise((resolve) => {
            setTimeout(() => {
              setMdContent(snapshot);
              resolve(true);
            }, 10);
          });
        }
      };
      run();
    }
  }, []);

  return (
    <div style={{ height: 600, width: '100%' }}>
      <Workspace
        title="Workspace 示例"
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
            title: '实时 Markdown',
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
                title: '拉取评测数据',
                status: 'success',
              },
              {
                key: '2',
                title: '解析 PDF',
                content: (
                  <div>
                    解析失败（示例）
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </div>
                ),
                status: 'error',
              },
              {
                key: '3',
                title: '生成摘要',
                status: 'loading',
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
            count: 3,
          }}
          nodes={[
            {
              id: '1',
              name: 'notes.md',
              size: '12KB',
              lastModified: '2025-02-10 09:30:00',
              url: '/docs/notes.md',
              displayType: 'txt',
            },
            {
              id: '2',
              name: 'data.xlsx',
              type: 'excel',
              size: '1.2MB',
              lastModified: '2025-02-10 09:15:00',
              url: '/docs/data.xlsx',
            },
            {
              id: '3',
              name: 'readme.pdf',
              type: 'pdf',
              size: '800KB',
              lastModified: '2025-02-09 16:00:00',
              url: '/docs/readme.pdf',
            },
          ]}
        />
      </Workspace>
    </div>
  );
};

export default Demo;
