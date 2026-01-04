import React from 'react';
import { BarChart } from '@ant-design/agentic-ui';
import { CardContent } from '../style';
import TabPreview from './TabPreview';

const SchemaTab: React.FC = () => {
  // 从 codeExample 解析数据，移除注释后解析
  const codeExample = `[
    { "category": "访客数据", "type": "本周访客", "x": 1, "y": 120, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "本周访客", "x": 2, "y": 132, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "本周访客", "x": 3, "y": 101, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "本周访客", "x": 4, "y": 134, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "本周访客", "x": 5, "y": 90, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "本周访客", "x": 6, "y": 230, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "本周访客", "x": 7, "y": 210, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "上周访客", "x": 1, "y": 220, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "上周访客", "x": 2, "y": 182, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "上周访客", "x": 3, "y": 191, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "上周访客", "x": 4, "y": 234, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "上周访客", "x": 5, "y": 290, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "上周访客", "x": 6, "y": 330, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "访客数据", "type": "上周访客", "x": 7, "y": 310, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "全球" },
    { "category": "销售数据", "type": "本年销售额", "x": 1, "y": 85000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "全球" },
    { "category": "销售数据", "type": "本年销售额", "x": 2, "y": 92000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "全球" },
    { "category": "销售数据", "type": "本年销售额", "x": 3, "y": 88000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "全球" },
    { "category": "销售数据", "type": "本年销售额", "x": 4, "y": 105000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "全球" },
    { "category": "销售数据", "type": "去年销售额", "x": 1, "y": 72000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "全球" },
    { "category": "销售数据", "type": "去年销售额", "x": 2, "y": 78000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "全球" },
    { "category": "销售数据", "type": "去年销售额", "x": 3, "y": 81000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "全球" },
    { "category": "销售数据", "type": "去年销售额", "x": 4, "y": 89000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "全球" },
    { "category": "访客数据", "type": "本周访客", "x": 1, "y": 180, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "本周访客", "x": 2, "y": 195, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "本周访客", "x": 3, "y": 160, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "本周访客", "x": 4, "y": 210, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "本周访客", "x": 5, "y": 140, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "本周访客", "x": 6, "y": 280, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "本周访客", "x": 7, "y": 260, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "上周访客", "x": 1, "y": 280, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "上周访客", "x": 2, "y": 240, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "上周访客", "x": 3, "y": 220, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "上周访客", "x": 4, "y": 290, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "上周访客", "x": 5, "y": 350, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "上周访客", "x": 6, "y": 390, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "访客数据", "type": "上周访客", "x": 7, "y": 370, "xtitle": "日期", "ytitle": "访客数", "filterLabel": "美国" },
    { "category": "销售数据", "type": "本年销售额", "x": 1, "y": 95000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "美国" },
    { "category": "销售数据", "type": "本年销售额", "x": 2, "y": 102000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "美国" },
    { "category": "销售数据", "type": "本年销售额", "x": 3, "y": 98000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "美国" },
    { "category": "销售数据", "type": "本年销售额", "x": 4, "y": 115000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "美国" },
    { "category": "销售数据", "type": "去年销售额", "x": 1, "y": 82000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "美国" },
    { "category": "销售数据", "type": "去年销售额", "x": 2, "y": 88000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "美国" },
    { "category": "销售数据", "type": "去年销售额", "x": 3, "y": 91000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "美国" },
    { "category": "销售数据", "type": "去年销售额", "x": 4, "y": 99000, "xtitle": "季度", "ytitle": "销售额", "filterLabel": "美国" }
  ]`;

  const data = JSON.parse(codeExample);

  const contentExample = (
    <div>
      <CardContent>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <BarChart
              title="动态柱状图使用示例"
              data={data}
              width={'100%'}
              height={500}
            />
          </div>
        </div>
      </CardContent>
    </div>
  );

  return (
    <TabPreview codeExample={codeExample} contentExample={contentExample} />
  );
};

export default SchemaTab;
