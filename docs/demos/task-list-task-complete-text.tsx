import type { TaskItem } from '@ant-design/agentic-ui';
import { TaskList } from '@ant-design/agentic-ui';
import React from 'react';

const items: TaskItem[] = [
  {
    key: '1',
    title: '收集竞品数据',
    content: '抓取目标竞品的功能与定价信息',
    status: 'success',
  },
  {
    key: '2',
    title: '生成可视化图表',
    content: '绘制功能对比雷达图与市场份额饼图',
    status: 'success',
  },
  {
    key: '3',
    title: '撰写分析报告',
    content: '整合数据结论并插入图表',
    status: 'success',
  },
];

/**
 * Simple 模式 - 自定义任务全部完成时的摘要文案
 *
 * - `taskCompleteText` 接收 `React.ReactNode`，可直接传字符串/JSX
 * - 也可传函数 `({ items }) => ReactNode`，基于当前任务列表动态生成
 */
export default () => {
  return (
    <div
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        maxWidth: 480,
      }}
    >
      {/* 1. 直接传字符串 */}
      <TaskList
        items={items}
        variant="simple"
        open
        taskCompleteText="竞品分析报告已生成"
      />

      {/* 2. 传函数，基于 items 动态生成 */}
      <TaskList
        items={items}
        variant="simple"
        open
        taskCompleteText={({ items }) => `共完成 ${items.length} 项任务 🎉`}
      />

      {/* 3. 传 JSX，组合图标和强调样式 */}
      <TaskList
        items={items}
        variant="simple"
        open
        taskCompleteText={
          <span>
            报告生成完毕 · <a onClick={(e) => e.preventDefault()}>查看详情</a>
          </span>
        }
      />
    </div>
  );
};
