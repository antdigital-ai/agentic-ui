import { ActionIconBox, Workspace } from '@ant-design/agentic-ui';
import { DownloadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  Copy,
  Expand,
  MousePointerClick,
  SwitchToWindow,
} from '@sofa-design/icons';
import { message, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import { defaultValue } from './shared/defaultValue';

const Demo = () => {
  const [mdContent, setMdContent] = useState('');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [htmlStatus, setHtmlStatus] = useState<'loading' | 'done' | 'error'>(
    'loading',
  );

  const sampleHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>报告示例</title>
</head>
<body>
  <h1>模型推理报告</h1>
  <p>这是一个使用 iframe 渲染的 HTML 预览示例。</p>
  <h2>步骤</h2>
  <ol>
    <li>准备数据</li>
    <li>运行分析</li>
    <li>生成结果</li>
  </ol>
</body>
</html>`;

  const segmentedContent = (
    <Space size={8}>
      <div
        style={{
          height: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '4px 6px',
          borderRadius: '200px',
          background: 'rgba(0, 16, 32, 0.0627)',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            fontWeight: 500,
            lineHeight: '7px',
            color: 'rgba(84, 93, 109, 0.8)',
          }}
        >
          {sampleHtml.split('\n').length}
        </div>
      </div>
      <ActionIconBox
        title="复制"
        onClick={() => {
          console.log('复制');
          message.success('复制');
        }}
      >
        <Copy />
      </ActionIconBox>
      <ActionIconBox
        title="下载"
        onClick={() => {
          console.log('下载');
          message.success('下载');
        }}
      >
        <DownloadOutlined />
      </ActionIconBox>
      <ActionIconBox
        title="切换"
        onClick={() => {
          console.log('切换');
          message.success('切换');
        }}
      >
        <SwitchToWindow />
      </ActionIconBox>
      <ActionIconBox
        title="全屏"
        onClick={() => {
          console.log('全屏');
          message.success('全屏');
        }}
      >
        <Expand />
      </ActionIconBox>
    </Space>
  );

  const handleBack = () => {
    console.log('返回');
    message.success(`返回`);
    return true;
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      setMdContent(defaultValue);
      setHtmlContent(sampleHtml);
      setHtmlStatus('done');
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

      setHtmlStatus('loading');
      const timer = setTimeout(() => {
        setHtmlContent(sampleHtml);
        setHtmlStatus('done');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);
  return (
    <div style={{ height: 600, width: '100%' }}>
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

        {/* 实时监控标签页 - HTML 预览（内容区域渲染 HtmlPreview）*/}
        <Workspace.Realtime
          tab={{
            key: 'realtimeHtml',
            title: '实时跟随（HTML）',
            icon: <MousePointerClick />,
          }}
          data={{
            type: 'html',
            content: htmlContent,
            title: '创建 HTML 文件',
            subTitle: 'report.html',
            defaultViewMode: 'preview',
            labels: { preview: '预览', code: '代码' },
            iframeProps: { sandbox: 'allow-scripts' },
            status: htmlStatus,
            segmentedExtra: segmentedContent,
            onBack: handleBack,
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

        {/* 文件管理标签页（列表里包含 .html，预览时将自动用 HtmlPreview 渲染） */}
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
              content: htmlContent,
            },
          ]}
        />
      </Workspace>
    </div>
  );
};

export default Demo;
