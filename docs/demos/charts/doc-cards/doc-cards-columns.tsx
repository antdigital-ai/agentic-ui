import { DocCards } from '@ant-design/agentic-ui';
import React, { useState } from 'react';

/**
 * cardColumns 控制每行卡片数（取值 1~4，超出 clamp 到 4）。
 *
 * - viewport `< 480px` 由媒体查询强制单列，无需手动适配；
 * - `cardColumns: 1` 通常用作「全宽列表」展示。
 */
const DocCardsColumnsDemo: React.FC = () => {
  const [cardColumns, setCardColumns] = useState(2);

  const columns = [
    { title: '标题', dataIndex: '标题', key: '标题' },
    { title: '链接', dataIndex: '链接', key: '链接' },
    { title: '描述', dataIndex: '描述', key: '描述' },
    { title: '标签', dataIndex: '标签', key: '标签' },
  ];

  const data = Array.from({ length: 8 }).map((_, index) => ({
    标题: `条目 ${index + 1}`,
    链接: `https://example.com/item/${index + 1}`,
    描述: `第 ${index + 1} 张卡片的简要描述，用于演示不同列数下的视觉密度。`,
    标签: ['Tag A', 'Tag B', `优先级 P${(index % 3) + 1}`].join(', '),
  }));

  return (
    <div style={{ padding: 16, background: '#fafafa' }}>
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 13, color: '#666' }}>cardColumns：</span>
        {[1, 2, 3, 4].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setCardColumns(n)}
            style={{
              minWidth: 36,
              minHeight: 32,
              padding: '4px 10px',
              borderRadius: 6,
              border:
                cardColumns === n ? '1px solid #1677ff' : '1px solid #d9d9d9',
              background: cardColumns === n ? '#e6f4ff' : '#fff',
              color: cardColumns === n ? '#1677ff' : '#333',
              cursor: 'pointer',
            }}
          >
            {n}
          </button>
        ))}
        <span style={{ fontSize: 12, color: '#999', marginInlineStart: 8 }}>
          viewport &lt; 480px 自动单列
        </span>
      </div>

      <DocCards
        title={`每行 ${cardColumns} 张卡片`}
        columns={columns}
        data={data}
        cardColumns={cardColumns}
      />
    </div>
  );
};

export default DocCardsColumnsDemo;
