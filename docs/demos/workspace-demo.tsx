import { BrowserItem, Workspace } from '@ant-design/agentic-ui';
import { QuestionCircleOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { defaultValue } from './shared/defaultValue';

const Demo = () => {
  const [mdContent, setMdContent] = useState('');
  const [suggestions] = useState([
    {
      id: '1',
      label: '搜索 2025 年大语言模型技术趋势报告',
      count: 3,
    },
    {
      id: '2',
      label: '搜索 GPT-4o Claude Gemini 模型能力对比',
      count: 3,
    },
    {
      id: '3',
      label: '搜索 AI Agent 框架选型与最佳实践',
      count: 3,
    },
    {
      id: '4',
      label: '搜索 RAG 检索增强生成技术最新进展',
      count: 3,
    },
  ]);

  const resultsMap: Record<string, BrowserItem[]> = {
    '1': [
      {
        id: '1-1',
        title: '2025 年大语言模型技术趋势白皮书',
        site: 'arxiv.org',
        url: 'https://arxiv.org',
      },
      {
        id: '1-2',
        title: 'State of AI Report 2025 — AI 行业全景分析',
        site: 'www.stateof.ai',
        url: 'https://www.stateof.ai',
      },
      {
        id: '1-3',
        title: 'LLM 发展路线图：从预训练到多模态',
        site: 'huggingface.co',
        url: 'https://huggingface.co',
      },
    ],
    '2': [
      {
        id: '2-1',
        title: 'GPT-4o vs Claude 3.5 vs Gemini 2.0 全面基准测试',
        site: 'lmsys.org',
        url: 'https://lmsys.org',
        icon: 'https://lmsys.org/favicon.ico',
      },
      {
        id: '2-2',
        title: '主流大模型在代码生成任务上的性能对比评测',
        site: 'evalplus.github.io',
        url: 'https://evalplus.github.io',
      },
      {
        id: '2-3',
        title: '企业级 LLM 选型指南：成本、延迟与质量的平衡',
        site: 'www.anthropic.com',
        url: 'https://www.anthropic.com',
      },
    ],
    '3': [
      {
        id: '3-1',
        title: 'LangChain vs CrewAI vs AutoGen：多智能体框架深度对比',
        site: 'blog.langchain.dev',
        url: 'https://blog.langchain.dev',
      },
      {
        id: '3-2',
        title: 'Building Production AI Agents — 实战经验总结',
        site: 'docs.anthropic.com',
        url: 'https://docs.anthropic.com',
      },
      {
        id: '3-3',
        title: 'AI Agent 设计模式与架构最佳实践',
        site: 'www.deeplearning.ai',
        url: 'https://www.deeplearning.ai',
      },
    ],
    '4': [
      {
        id: '4-1',
        title: 'RAG 技术演进：从基础检索到 Agentic RAG',
        site: 'arxiv.org',
        url: 'https://arxiv.org',
      },
      {
        id: '4-2',
        title: '向量数据库选型对比：Milvus、Pinecone、Weaviate',
        site: 'benchmark.vectorview.ai',
        url: 'https://benchmark.vectorview.ai',
      },
      {
        id: '4-3',
        title: '企业知识库 RAG 方案落地实践',
        site: 'www.llamaindex.ai',
        url: 'https://www.llamaindex.ai',
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
          await new Promise((resolve) => {
            setTimeout(() => {
              setMdContent(md);
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
        title="AI 研究助手工作台"
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
            title: '深度分析报告',
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
                title: '收集各大模型的基准测试数据',
                status: 'success',
              },
              {
                key: '2',
                title: '下载并解析目标论文 PDF 全文',
                content: (
                  <div>
                    PDF 解析失败：文件格式不支持
                    <QuestionCircleOutlined style={{ marginLeft: 4 }} />
                  </div>
                ),
                status: 'error',
              },
              {
                key: '3',
                title: '对比分析各框架的核心特性差异',
                status: 'loading',
              },
              {
                key: '4',
                title: '生成技术选型建议矩阵',
                status: 'pending',
              },
              {
                key: '5',
                title: '撰写最终分析报告文档',
                status: 'pending',
              },
              {
                key: '6',
                title: '导出报告并通知相关人员',
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
              name: 'AI技术选型分析报告.md',
              size: '45KB',
              lastModified: '2025-02-10 09:30:00',
              url: '/docs/ai-tech-report.md',
              displayType: 'txt',
            },
            {
              id: '2',
              name: '模型评测数据汇总.xlsx',
              type: 'excel',
              size: '1.2MB',
              lastModified: '2025-02-10 09:15:00',
              url: '/docs/benchmark-data.xlsx',
            },
            {
              id: '3',
              name: 'LLM技术白皮书-2025.pdf',
              type: 'pdf',
              size: '3.8MB',
              lastModified: '2025-02-09 16:00:00',
              url: '/docs/llm-whitepaper.pdf',
            },
            {
              id: '4',
              name: '框架架构对比图.png',
              type: 'image',
              size: '680KB',
              lastModified: '2025-02-09 14:30:00',
              url: '/images/framework-comparison.png',
            },
            {
              id: '5',
              name: 'RAG实践笔记.md',
              type: 'markdown',
              size: '28KB',
              lastModified: '2025-02-08 11:00:00',
              url: '/docs/rag-notes.md',
            },
            {
              id: '6',
              name: 'API接口文档.html',
              type: 'code',
              size: '15KB',
              lastModified: '2025-02-08 09:00:00',
              content:
                '<!DOCTYPE html><html><body><h1>API Reference</h1><p>AI Agent API Documentation</p></body></html>',
            },
          ]}
        />
      </Workspace>
    </div>
  );
};

export default Demo;
