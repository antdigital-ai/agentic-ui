import RadarChart, {
  RadarChartDataItem,
} from '@ant-design/agentic-ui/Plugins/chart/RadarChart';
import React from 'react';

// 实际使用示例：动态数据雷达图
const DynamicRadarChartExample: React.FC = () => {
  // 雷达图扁平化数据（固定数据）
  const data: RadarChartDataItem[] = [
    {
      category: '年龄',
      x: '技术',
      type: '当前能力',
      y: 75,
      filterLabel: '全球',
    },
    {
      category: '年龄',
      x: '设计',
      type: '当前能力',
      y: 60,
      filterLabel: '全球',
    },
    {
      category: '年龄',
      x: '产品',
      type: '当前能力',
      y: 80,
      filterLabel: '全球',
    },
    {
      category: '年龄',
      x: '运营',
      type: '当前能力',
      y: 65,
      filterLabel: '全球',
    },
    {
      category: '年龄',
      x: '市场',
      type: '当前能力',
      y: 70,
      filterLabel: '全球',
    },
    {
      category: '年龄',
      x: '销售',
      type: '当前能力',
      y: 55,
      filterLabel: '全球',
    },
    {
      category: '年龄',
      x: '技术',
      type: '目标能力',
      y: 90,
      filterLabel: '全球',
    },
    {
      category: '年龄',
      x: '设计',
      type: '目标能力',
      y: 85,
      filterLabel: '全球',
    },
    {
      category: '年龄',
      x: '产品',
      type: '目标能力',
      y: 95,
      filterLabel: '全球',
    },
    {
      category: '年龄',
      x: '运营',
      type: '目标能力',
      y: 80,
      filterLabel: '全球',
    },
    {
      category: '年龄',
      x: '市场',
      type: '目标能力',
      y: 85,
      filterLabel: '全球',
    },
    {
      category: '年龄',
      x: '销售',
      type: '目标能力',
      y: 75,
      filterLabel: '全球',
    },
    {
      category: '性别',
      x: '创新',
      type: '现状评估',
      y: 65,
      filterLabel: '全球',
    },
    {
      category: '性别',
      x: '执行',
      type: '现状评估',
      y: 80,
      filterLabel: '全球',
    },
    {
      category: '性别',
      x: '沟通',
      type: '现状评估',
      y: 70,
      filterLabel: '全球',
    },
    {
      category: '性别',
      x: '学习',
      type: '现状评估',
      y: 85,
      filterLabel: '全球',
    },
    {
      category: '性别',
      x: '团队',
      type: '现状评估',
      y: 75,
      filterLabel: '全球',
    },
    {
      category: '性别',
      x: '领导',
      type: '现状评估',
      y: 60,
      filterLabel: '全球',
    },
    {
      category: '性别',
      x: '创新',
      type: '期望水平',
      y: 85,
      filterLabel: '全球',
    },
    {
      category: '性别',
      x: '执行',
      type: '期望水平',
      y: 90,
      filterLabel: '全球',
    },
    {
      category: '性别',
      x: '沟通',
      type: '期望水平',
      y: 80,
      filterLabel: '全球',
    },
    {
      category: '性别',
      x: '学习',
      type: '期望水平',
      y: 95,
      filterLabel: '全球',
    },
    {
      category: '性别',
      x: '团队',
      type: '期望水平',
      y: 85,
      filterLabel: '全球',
    },
    {
      category: '性别',
      x: '领导',
      type: '期望水平',
      y: 80,
      filterLabel: '全球',
    },

    {
      category: '年龄',
      x: '技术',
      type: '当前能力',
      y: 65,
      filterLabel: '美国',
    },
    {
      category: '年龄',
      x: '设计',
      type: '当前能力',
      y: 55,
      filterLabel: '美国',
    },
    {
      category: '年龄',
      x: '产品',
      type: '当前能力',
      y: 70,
      filterLabel: '美国',
    },
    {
      category: '年龄',
      x: '运营',
      type: '当前能力',
      y: 58,
      filterLabel: '美国',
    },
    {
      category: '年龄',
      x: '市场',
      type: '当前能力',
      y: 62,
      filterLabel: '美国',
    },
    {
      category: '年龄',
      x: '销售',
      type: '当前能力',
      y: 48,
      filterLabel: '美国',
    },
    {
      category: '年龄',
      x: '技术',
      type: '目标能力',
      y: 85,
      filterLabel: '美国',
    },
    {
      category: '年龄',
      x: '设计',
      type: '目标能力',
      y: 78,
      filterLabel: '美国',
    },
    {
      category: '年龄',
      x: '产品',
      type: '目标能力',
      y: 88,
      filterLabel: '美国',
    },
    {
      category: '年龄',
      x: '运营',
      type: '目标能力',
      y: 75,
      filterLabel: '美国',
    },
    {
      category: '年龄',
      x: '市场',
      type: '目标能力',
      y: 82,
      filterLabel: '美国',
    },
    {
      category: '年龄',
      x: '销售',
      type: '目标能力',
      y: 72,
      filterLabel: '美国',
    },
    {
      category: '性别',
      x: '创新',
      type: '现状评估',
      y: 58,
      filterLabel: '美国',
    },
    {
      category: '性别',
      x: '执行',
      type: '现状评估',
      y: 72,
      filterLabel: '美国',
    },
    {
      category: '性别',
      x: '沟通',
      type: '现状评估',
      y: 63,
      filterLabel: '美国',
    },
    {
      category: '性别',
      x: '学习',
      type: '现状评估',
      y: 78,
      filterLabel: '美国',
    },
    {
      category: '性别',
      x: '团队',
      type: '现状评估',
      y: 68,
      filterLabel: '美国',
    },
    {
      category: '性别',
      x: '领导',
      type: '现状评估',
      y: 52,
      filterLabel: '美国',
    },
    {
      category: '性别',
      x: '创新',
      type: '期望水平',
      y: 78,
      filterLabel: '美国',
    },
    {
      category: '性别',
      x: '执行',
      type: '期望水平',
      y: 85,
      filterLabel: '美国',
    },
    {
      category: '性别',
      x: '沟通',
      type: '期望水平',
      y: 75,
      filterLabel: '美国',
    },
    {
      category: '性别',
      x: '学习',
      type: '期望水平',
      y: 90,
      filterLabel: '美国',
    },
    {
      category: '性别',
      x: '团队',
      type: '期望水平',
      y: 80,
      filterLabel: '美国',
    },
    {
      category: '性别',
      x: '领导',
      type: '期望水平',
      y: 75,
      filterLabel: '美国',
    },
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>
        动态雷达图使用示例
      </h2>

      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#666',
          }}
        >
          💡 固定数据：使用预设的扁平化数据，包含 filterLabel 字段支持二级筛选。
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <RadarChart
          title="2025年第一季度短视频用户分布分析"
          data={data}
          width={700}
          height={500}
        />
      </div>

      {/* 数据格式说明 */}
      <div
        style={{
          marginTop: '20px',
          backgroundColor: '#f0f8ff',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #e8e8e8',
        }}
      >
        <h4 style={{ marginTop: 0, color: '#333' }}>
          扁平化数据格式示例（含二级筛选）：
        </h4>
        <pre
          style={{
            backgroundColor: '#fff',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '11px',
            margin: 0,
            overflow: 'auto',
          }}
        >
          {`// 扁平化数据格式：包含 filterLabel 字段
[
  { 
    category: "年龄", 
    x: "技术", 
    type: "当前能力", 
    y: 75, 
    filterLabel: "全球" 
  },
  { 
    category: "年龄", 
    x: "设计", 
    type: "当前能力", 
    y: 60, 
    filterLabel: "全球" 
  },
  { 
    category: "年龄", 
    x: "技术", 
    type: "当前能力", 
    y: 65, 
    filterLabel: "美国" 
  }
  // ... 更多数据
]`}
        </pre>
      </div>

      {/* 默认颜色说明 */}
      <div
        style={{
          marginTop: '20px',
          backgroundColor: '#fafafa',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #e8e8e8',
        }}
      >
        <h4 style={{ marginTop: 0, color: '#333' }}>默认颜色序列：</h4>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: '#388BFF',
                borderRadius: '50%',
              }}
            ></div>
            <span style={{ fontSize: '12px', color: '#666' }}>
              第一个：#388BFF
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: '#917EF7',
                borderRadius: '50%',
              }}
            ></div>
            <span style={{ fontSize: '12px', color: '#666' }}>
              第二个：#917EF7
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: '#2AD8FC',
                borderRadius: '50%',
              }}
            ></div>
            <span style={{ fontSize: '12px', color: '#666' }}>
              第三个：#2AD8FC
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// export { DynamicRadarChartExample, TeamSkillsAssessmentExample };
export default DynamicRadarChartExample;
