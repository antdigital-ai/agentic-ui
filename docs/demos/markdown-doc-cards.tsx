import { MarkdownEditor } from '@ant-design/agentic-ui';
import React from 'react';

const defaultValue = `## 优秀开发者文档站

<!-- {"chartType": "docCards", "title": "推荐文档站", "cardColumns": 2} -->

| 名称              | 地址                          | 简介                                       | 亮点                          |
| :---------------- | :---------------------------- | :----------------------------------------- | :---------------------------- |
| Tailwind CSS Docs | https://tailwindcss.com/docs  | 结构清晰、搜索与导航强，支持深链与暗色模式 | 交互式示例, 深链, 暗色模式    |
| MDN Web Docs      | https://developer.mozilla.org | 权威 Web 平台参考                          | 多语言, 可折叠, 示例可编辑    |
| React 官网        | https://react.dev             | React 最新文档与 RFC，配套交互式 Sandpack  | 流程图, Hooks 速查, 暗色主题  |
| Next.js Docs      | https://nextjs.org/docs       | App Router 与渲染策略一站说明              | 双语, App Router 全量, 示例多 |

---

## 单列全宽列表（cardColumns = 1）

<!-- {"chartType": "docCards", "title": "技术博客", "cardColumns": 1} -->

| 标题             | URL                              | 描述                                     | 标签              |
| :--------------- | :------------------------------- | :--------------------------------------- | :---------------- |
| Vercel 工程师博客 | https://vercel.com/blog          | 边缘函数与运行时实践经验，多有最佳实践 | 边缘, Serverless |
| Cloudflare Blog  | https://blog.cloudflare.com      | 网络与安全的工程深度文章                | Workers, 网络     |

---

## fieldMap 显式覆盖（无默认别名时仍能识别）

<!-- {"chartType": "docCards", "title": "自定义字段映射", "fieldMap": {"title": "Project", "url": "Repo", "description": "Note", "tags": "Topics"}} -->

| Project       | Repo                                       | Note                       | Topics             |
| :------------ | :----------------------------------------- | :------------------------- | :----------------- |
| ant-design    | https://github.com/ant-design/ant-design   | 企业级 UI 组件库            | React, UI, antd    |
| agentic-ui    | https://github.com/ant-design/agentic-ui   | 面向智能体的 UI 组件        | Agentic, Chat, AI  |
`;

export default () => {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        flexDirection: 'column',
        gap: '16px',
        overflow: 'auto',
      }}
    >
      <MarkdownEditor
        readonly
        style={{ border: '1px solid #eee' }}
        toc={false}
        width={'calc(99vw - 16px)'}
        initValue={defaultValue}
      />
    </div>
  );
};
