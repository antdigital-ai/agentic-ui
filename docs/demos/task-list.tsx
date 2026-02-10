import { TaskList, ToolUseBar } from '@ant-design/agentic-ui';
import React, { useState } from 'react';

type TaskStatus = 'success' | 'pending';

export default () => {
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [items] = useState([
    {
      key: '1',
      title: '收集并分析竞品产品数据',
      content: [
        <div key="1">获取目标竞品的用户评价数据</div>,
        <div key="2">抓取竞品官网的功能特性列表</div>,
        <div key="3">整理各竞品的定价策略信息</div>,
        <div key="4">对比产品功能矩阵</div>,
        <div key="5">汇总市场份额数据</div>,
        <div key="6">生成竞品分析摘要报告</div>,
      ],
      status: 'success' as TaskStatus,
    },
    {
      key: '2',
      title: '调用分析工具生成可视化图表',
      content: [
        <ToolUseBar
          key="1"
          activeKeys={activeKeys}
          onActiveKeysChange={(keys) => {
            setActiveKeys(keys);
          }}
          tools={[
            {
              id: '1',
              toolName: 'chart_generator',
              toolTarget: '生成功能对比雷达图',
              time: '3',
            },
            {
              id: '2',
              toolName: 'data_visualizer',
              toolTarget: '绘制市场份额饼图',
              time: '2',
            },
            {
              id: '3',
              toolName: 'report_builder',
              toolTarget: '编排分析报告布局',
              time: '4',
            },
          ]}
        />,
      ],
      status: 'loading' as TaskStatus,
    },
    {
      key: '3',
      title: '撰写竞品分析报告文档',
      content: [
        <div key="1">整合数据分析结论</div>,
        <div key="2">插入可视化图表</div>,
        <div key="3" style={{ color: '#1890ff' }}>
          编辑文件 竞品分析报告-v2.md
        </div>,
      ],
      status: 'pending' as TaskStatus,
    },
    {
      key: '4',
      title: '获取实时市场数据失败',
      content: [
        <div key="1">
          API 调用超时：第三方数据源 MarketAPI 响应超时（30s）
        </div>,
      ],
      status: 'error' as TaskStatus,
    },
  ]);

  return (
    <div style={{ padding: 24 }}>
      <h3>竞品分析任务流程示例</h3>
      <TaskList items={items} />
    </div>
  );
};
