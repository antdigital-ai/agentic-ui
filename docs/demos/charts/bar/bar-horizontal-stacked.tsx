import BarChart, {
  BarChartDataItem,
} from '@ant-design/agentic-ui/Plugins/chart/BarChart';
import { Button } from 'antd';
import React, { useState } from 'react';

const HorizontalStackedBarChartExample: React.FC = () => {
  // 扁平化数据结构 - 条形堆叠图（横向堆叠柱状图）
  const [data, setData] = useState<BarChartDataItem[]>([
    // 部门人员构成 - 全球
    {
      category: '部门人员构成',
      type: '正式员工',
      x: 1,
      y: 45,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '全球',
    },
    {
      category: '部门人员构成',
      type: '正式员工',
      x: 2,
      y: 68,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '全球',
    },
    {
      category: '部门人员构成',
      type: '正式员工',
      x: 3,
      y: 52,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '全球',
    },
    {
      category: '部门人员构成',
      type: '正式员工',
      x: 4,
      y: 38,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '全球',
    },
    {
      category: '部门人员构成',
      type: '正式员工',
      x: 5,
      y: 28,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '全球',
    },

    {
      category: '部门人员构成',
      type: '实习生',
      x: 1,
      y: 12,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '全球',
    },
    {
      category: '部门人员构成',
      type: '实习生',
      x: 2,
      y: 18,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '全球',
    },
    {
      category: '部门人员构成',
      type: '实习生',
      x: 3,
      y: 15,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '全球',
    },
    {
      category: '部门人员构成',
      type: '实习生',
      x: 4,
      y: 8,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '全球',
    },
    {
      category: '部门人员构成',
      type: '实习生',
      x: 5,
      y: 6,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '全球',
    },

    {
      category: '部门人员构成',
      type: '外包人员',
      x: 1,
      y: 8,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '全球',
    },
    {
      category: '部门人员构成',
      type: '外包人员',
      x: 2,
      y: 22,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '全球',
    },
    {
      category: '部门人员构成',
      type: '外包人员',
      x: 3,
      y: 16,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '全球',
    },
    {
      category: '部门人员构成',
      type: '外包人员',
      x: 4,
      y: 12,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '全球',
    },
    {
      category: '部门人员构成',
      type: '外包人员',
      x: 5,
      y: 5,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '全球',
    },

    // 产品线销售额构成 - 全球
    {
      category: '产品线销售额构成',
      type: '企业版',
      x: 1,
      y: 85000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '全球',
    },
    {
      category: '产品线销售额构成',
      type: '企业版',
      x: 2,
      y: 125000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '全球',
    },
    {
      category: '产品线销售额构成',
      type: '企业版',
      x: 3,
      y: 95000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '全球',
    },
    {
      category: '产品线销售额构成',
      type: '企业版',
      x: 4,
      y: 68000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '全球',
    },

    {
      category: '产品线销售额构成',
      type: '专业版',
      x: 1,
      y: 52000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '全球',
    },
    {
      category: '产品线销售额构成',
      type: '专业版',
      x: 2,
      y: 78000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '全球',
    },
    {
      category: '产品线销售额构成',
      type: '专业版',
      x: 3,
      y: 62000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '全球',
    },
    {
      category: '产品线销售额构成',
      type: '专业版',
      x: 4,
      y: 45000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '全球',
    },

    {
      category: '产品线销售额构成',
      type: '个人版',
      x: 1,
      y: 28000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '全球',
    },
    {
      category: '产品线销售额构成',
      type: '个人版',
      x: 2,
      y: 38000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '全球',
    },
    {
      category: '产品线销售额构成',
      type: '个人版',
      x: 3,
      y: 32000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '全球',
    },
    {
      category: '产品线销售额构成',
      type: '个人版',
      x: 4,
      y: 22000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '全球',
    },

    // 美国数据（带filterLabel）
    {
      category: '部门人员构成',
      type: '正式员工',
      x: 1,
      y: 55,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '美国',
    },
    {
      category: '部门人员构成',
      type: '正式员工',
      x: 2,
      y: 78,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '美国',
    },
    {
      category: '部门人员构成',
      type: '正式员工',
      x: 3,
      y: 62,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '美国',
    },
    {
      category: '部门人员构成',
      type: '正式员工',
      x: 4,
      y: 48,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '美国',
    },
    {
      category: '部门人员构成',
      type: '正式员工',
      x: 5,
      y: 38,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '美国',
    },

    {
      category: '部门人员构成',
      type: '实习生',
      x: 1,
      y: 18,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '美国',
    },
    {
      category: '部门人员构成',
      type: '实习生',
      x: 2,
      y: 24,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '美国',
    },
    {
      category: '部门人员构成',
      type: '实习生',
      x: 3,
      y: 20,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '美国',
    },
    {
      category: '部门人员构成',
      type: '实习生',
      x: 4,
      y: 12,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '美国',
    },
    {
      category: '部门人员构成',
      type: '实习生',
      x: 5,
      y: 10,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '美国',
    },

    {
      category: '部门人员构成',
      type: '外包人员',
      x: 1,
      y: 12,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '美国',
    },
    {
      category: '部门人员构成',
      type: '外包人员',
      x: 2,
      y: 28,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '美国',
    },
    {
      category: '部门人员构成',
      type: '外包人员',
      x: 3,
      y: 22,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '美国',
    },
    {
      category: '部门人员构成',
      type: '外包人员',
      x: 4,
      y: 18,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '美国',
    },
    {
      category: '部门人员构成',
      type: '外包人员',
      x: 5,
      y: 8,
      xtitle: '人数',
      ytitle: '部门',
      filterLabel: '美国',
    },

    {
      category: '产品线销售额构成',
      type: '企业版',
      x: 1,
      y: 105000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '美国',
    },
    {
      category: '产品线销售额构成',
      type: '企业版',
      x: 2,
      y: 145000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '美国',
    },
    {
      category: '产品线销售额构成',
      type: '企业版',
      x: 3,
      y: 115000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '美国',
    },
    {
      category: '产品线销售额构成',
      type: '企业版',
      x: 4,
      y: 88000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '美国',
    },

    {
      category: '产品线销售额构成',
      type: '专业版',
      x: 1,
      y: 68000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '美国',
    },
    {
      category: '产品线销售额构成',
      type: '专业版',
      x: 2,
      y: 95000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '美国',
    },
    {
      category: '产品线销售额构成',
      type: '专业版',
      x: 3,
      y: 78000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '美国',
    },
    {
      category: '产品线销售额构成',
      type: '专业版',
      x: 4,
      y: 58000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '美国',
    },

    {
      category: '产品线销售额构成',
      type: '个人版',
      x: 1,
      y: 38000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '美国',
    },
    {
      category: '产品线销售额构成',
      type: '个人版',
      x: 2,
      y: 48000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '美国',
    },
    {
      category: '产品线销售额构成',
      type: '个人版',
      x: 3,
      y: 42000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '美国',
    },
    {
      category: '产品线销售额构成',
      type: '个人版',
      x: 4,
      y: 32000,
      xtitle: '销售额',
      ytitle: '地区',
      filterLabel: '美国',
    },
  ]);

  const handleRandomize = () => {
    setData((prev) =>
      prev.map((item) => ({
        ...item,
        y:
          item.category === '部门人员构成'
            ? Math.floor(Math.random() * 80) + 5 // 人数范围 5-85
            : Math.floor(Math.random() * 120000) + 20000, // 销售额范围 20000-140000
      })),
    );
  };

  return (
    <div style={{ padding: 12 }}>
      <h3 style={{ margin: '0 0 12px' }}>条形堆叠图（横向堆叠柱状图）</h3>
      <div
        style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}
      >
        <Button type="primary" onClick={handleRandomize}>
          随机更新数据
        </Button>

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
          💡 结合条形图（横向）和堆叠特性，适合展示多维度分类数据的构成对比。
        </div>
      </div>

      <BarChart
        title="条形堆叠图（横向堆叠柱状图）"
        data={data}
        width={700}
        height={500}
        indexAxis="y"
        stacked={true}
      />

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
        <h4 style={{ marginTop: 0, color: '#333' }}>扁平化数据格式示例：</h4>
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
          {`// 扁平化数据格式：同时设置 indexAxis="y" 和 stacked={true}
[
  {
    category: "部门人员构成",
    type: "正式员工",
    x: 1,
    y: 45,
    xtitle: "人数",
    ytitle: "部门",
    filterLabel: "全球"
  },
  {
    category: "部门人员构成",
    type: "实习生",
    x: 1,
    y: 12,
    xtitle: "人数",
    ytitle: "部门",
    filterLabel: "全球"
  },
  {
    category: "产品线销售额构成",
    type: "企业版",
    x: 1,
    y: 85000,
    xtitle: "销售额",
    ytitle: "地区",
    filterLabel: "全球"
  },
  // ... 更多数据
]

// 关键配置：
// - indexAxis="y": 横向显示
// - stacked={true}: 堆叠显示
// - 支持二级筛选（filterLabel）`}
        </pre>
      </div>

      {/* 使用场景说明 */}
      <div
        style={{
          marginTop: '15px',
          backgroundColor: '#fffbe6',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #ffe58f',
        }}
      >
        <h4 style={{ marginTop: 0, color: '#333' }}>💡 适用场景：</h4>
        <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
          <li>
            部门人员结构对比：展示不同部门的正式员工、实习生、外包人员构成
          </li>
          <li>
            产品销售额构成：对比不同地区各产品线（企业版、专业版、个人版）的销售额
          </li>
          <li>
            项目资源分配：展示各项目在人力、资金、设备等维度的资源分配情况
          </li>
          <li>
            成本结构分析：对比不同部门或产品的成本构成（人力、运营、设备等）
          </li>
        </ul>
      </div>
    </div>
  );
};

export default HorizontalStackedBarChartExample;
