import { QuadrantChart } from '@ant-design/agentic-ui';
import { Tag } from 'antd';
import React from 'react';

/**
 * `toolbar` 与 `title` 同行排布，适合放状态标签、筛选提示等。
 */
const QuadrantToolbarDemo: React.FC = () => {
  const columns = [
    { title: '象限', dataIndex: '象限', key: '象限' },
    { title: '条目', dataIndex: '条目', key: '条目' },
  ];

  const data = [
    {
      象限: '明星（高增长·高份额）',
      条目: '核心产品线，加大投入',
    },
    {
      象限: '问题（高增长·低份额）',
      条目: '试点业务，评估是否加码',
    },
    {
      象限: '现金牛（低增长·高份额）',
      条目: '成熟业务，维持利润',
    },
    {
      象限: '瘦狗（低增长·低份额）',
      条目: '收缩或淘汰',
    },
  ];

  return (
    <div style={{ padding: 16, background: '#fafafa' }}>
      <QuadrantChart
        title="业务组合（示意）"
        toolbar={
          <>
            <Tag color="blue">strategy</Tag>
            <Tag color="default">4 quadrants</Tag>
          </>
        }
        columns={columns}
        data={data}
      />
    </div>
  );
};

export default QuadrantToolbarDemo;
