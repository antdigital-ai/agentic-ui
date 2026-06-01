import { DocCards, MarkdownEditor } from '@ant-design/agentic-ui';
import React from 'react';

/**
 * 容错与降级：
 *
 * - 仅缺 `亮点` / `简介` 列时仍正常渲染卡片，不抛错；
 * - 解析阶段无法定位「主标题」列时，整表降级为普通 Markdown 表格。
 */
const DocCardsFallbackDemo: React.FC = () => {
  const partialColumns = [
    { title: '名称', dataIndex: '名称', key: '名称' },
    { title: '简介', dataIndex: '简介', key: '简介' },
  ];
  const partialData = [
    { 名称: '只有标题与简介', 简介: '没有 URL 与标签也能渲染' },
    { 名称: '另一条', 简介: '此卡片同样仅显示主标题与描述' },
  ];

  // 注意：注释里 chartType=docCards，但表头无 名称/标题/name/title，
  // parseTable 阶段会校验失败并降级为普通 Markdown 表格。
  const downgradedMarkdown = `## 解析阶段无主标题列 → 整表降级为普通表格

<!-- {"chartType": "docCards"} -->

| col1 | col2 |
| :--- | :--- |
| a    | b    |
| c    | d    |
`;

  return (
    <div
      style={{
        padding: 16,
        background: '#fafafa',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <DocCards
        title="仅有部分语义列时仍能渲染"
        columns={partialColumns}
        data={partialData}
        cardColumns={2}
      />

      <MarkdownEditor
        readonly
        toc={false}
        style={{ border: '1px solid #eee', borderRadius: 8 }}
        initValue={downgradedMarkdown}
      />
    </div>
  );
};

export default DocCardsFallbackDemo;
