import { DocCards } from '@ant-design/agentic-ui';
import React from 'react';

/**
 * 直接使用 DocCards 组件（不走 Markdown 注释路径）。
 *
 * 真实业务里通常优先走 `chartType: "docCards"` 的注释 + GFM 表格写法，
 * 让 LLM / Markdown 内容直接产出卡片栅格。这里展示的是当你拿到结构化数据
 * 想绕过 Markdown 直接复用 UI 的最小用法。
 */
const DocCardsBasicDemo: React.FC = () => {
  // 与 ChartRender 透传给 DocCards 的契约一致：columns 描述表头，data 是行
  const columns = [
    { title: '名称', dataIndex: '名称', key: '名称' },
    { title: '地址', dataIndex: '地址', key: '地址' },
    { title: '简介', dataIndex: '简介', key: '简介' },
    { title: '亮点', dataIndex: '亮点', key: '亮点' },
  ];

  const data = [
    {
      名称: 'Tailwind CSS Docs',
      地址: 'https://tailwindcss.com/docs',
      简介: '结构清晰、搜索与导航强，支持深链与暗色模式',
      亮点: '交互式示例, 深链, 暗色模式',
    },
    {
      名称: 'MDN Web Docs',
      地址: 'https://developer.mozilla.org',
      简介: '权威 Web 平台参考',
      亮点: '多语言, 可折叠, 示例可编辑',
    },
    {
      名称: 'React 官网',
      地址: 'https://react.dev',
      简介: 'React 最新文档与 RFC，配套交互式 Sandpack',
      亮点: '流程图, Hooks 速查, 暗色主题',
    },
    {
      名称: 'Next.js Docs',
      地址: 'https://nextjs.org/docs',
      简介: 'App Router 与渲染策略一站说明',
      亮点: '双语, App Router 全量, 示例多',
    },
  ];

  return (
    <div style={{ padding: 16, background: '#fafafa' }}>
      <DocCards
        title="推荐文档站"
        columns={columns}
        data={data}
        cardColumns={2}
      />
    </div>
  );
};

export default DocCardsBasicDemo;
