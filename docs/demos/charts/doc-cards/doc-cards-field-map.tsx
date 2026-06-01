import { DocCards } from '@ant-design/agentic-ui';
import { Tag } from 'antd';
import React from 'react';

/**
 * 表头不在默认别名表中（`Project` / `Repo` / `Note` / `Topics`）时，
 * 通过 `fieldMap` 显式把语义字段映射到自定义列名。
 *
 * 同时演示：`toolbar` 槽位放右侧操作（如刷新、查看更多），与 title 同行。
 */
const DocCardsFieldMapDemo: React.FC = () => {
  const columns = [
    { title: 'Project', dataIndex: 'Project', key: 'Project' },
    { title: 'Repo', dataIndex: 'Repo', key: 'Repo' },
    { title: 'Note', dataIndex: 'Note', key: 'Note' },
    { title: 'Topics', dataIndex: 'Topics', key: 'Topics' },
  ];

  const data = [
    {
      Project: 'ant-design',
      Repo: 'https://github.com/ant-design/ant-design',
      Note: '企业级 UI 组件库',
      Topics: 'React, UI, antd',
    },
    {
      Project: 'agentic-ui',
      Repo: 'https://github.com/ant-design/agentic-ui',
      Note: '面向智能体的 UI 组件',
      Topics: 'Agentic, Chat, AI',
    },
    {
      Project: 'pro-components',
      Repo: 'https://github.com/ant-design/pro-components',
      Note: '基于 antd 的中后台开箱即用组件',
      Topics: 'ProComponents, Form, Table',
    },
    {
      Project: 'ant-design-icons',
      Repo: 'https://github.com/ant-design/ant-design-icons',
      Note: 'antd 官方图标库',
      Topics: 'Icons, SVG',
    },
  ];

  return (
    <div style={{ padding: 16, background: '#fafafa' }}>
      <DocCards
        title="开源仓库"
        toolbar={
          <>
            <Tag color="blue">readonly</Tag>
            <Tag color="green">{data.length} repos</Tag>
          </>
        }
        columns={columns}
        data={data}
        fieldMap={{
          title: 'Project',
          url: 'Repo',
          description: 'Note',
          tags: 'Topics',
        }}
        cardColumns={2}
      />
    </div>
  );
};

export default DocCardsFieldMapDemo;
