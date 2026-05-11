import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { QuadrantChart } from '../QuadrantChart';
import { parseQuadrantsFromRows, splitItems } from '../QuadrantChart/utils';

const buildColumns = (titles: string[]) =>
  titles.map((t) => ({ title: t, dataIndex: t, key: t }));

describe('QuadrantChart utils', () => {
  describe('splitItems', () => {
    it('按逗号、分号、竖线等分隔符拆分', () => {
      expect(splitItems('A, B; C | D')).toEqual(['A', 'B', 'C', 'D']);
    });

    it('支持全角分隔符', () => {
      expect(splitItems('A，B、C；D')).toEqual(['A', 'B', 'C', 'D']);
    });

    it('忽略空白和连续分隔符', () => {
      expect(splitItems('  A , , B  ')).toEqual(['A', 'B']);
    });

    it('空值返回空数组', () => {
      expect(splitItems('')).toEqual([]);
      expect(splitItems(null)).toEqual([]);
      expect(splitItems(undefined)).toEqual([]);
    });
  });

  describe('parseQuadrantsFromRows', () => {
    const cols = buildColumns(['象限', '内容']);

    it('前 4 行按顺序解析为 4 个象限', () => {
      const data = [
        { 象限: '重要且紧急', 内容: '修复bug, 处理投诉' },
        { 象限: '重要不紧急', 内容: '技术改进' },
        { 象限: '不重要但紧急', 内容: '回复邮件' },
        { 象限: '不重要不紧急', 内容: '整理桌面' },
      ];
      const result = parseQuadrantsFromRows(data, cols);
      expect(result).toHaveLength(4);
      expect(result[0].label).toBe('重要且紧急');
      expect(result[0].items).toEqual(['修复bug', '处理投诉']);
      expect(result[1].label).toBe('重要不紧急');
      expect(result[3].label).toBe('不重要不紧急');
    });

    it('不足 4 行时补空占位', () => {
      const data = [
        { 象限: '组1', 内容: 'A' },
        { 象限: '组2', 内容: 'B' },
      ];
      const result = parseQuadrantsFromRows(data, cols);
      expect(result).toHaveLength(4);
      expect(result[2].label).toBe('Q3');
      expect(result[2].items).toEqual([]);
      expect(result[3].label).toBe('Q4');
    });

    it('超过 4 行时只取前 4 行', () => {
      const data = Array.from({ length: 6 }, (_, i) => ({
        象限: `组${i + 1}`,
        内容: `内容${i + 1}`,
      }));
      const result = parseQuadrantsFromRows(data, cols);
      expect(result).toHaveLength(4);
      expect(result[3].label).toBe('组4');
    });

    it('第 1 列为空时用默认标签', () => {
      const data = [{ 象限: '', 内容: 'A' }];
      const result = parseQuadrantsFromRows(data, cols);
      expect(result[0].label).toBe('Q1');
    });

    it('只有 1 列时条目为空', () => {
      const singleCol = buildColumns(['象限']);
      const data = [{ 象限: '标签' }];
      const result = parseQuadrantsFromRows(data, singleCol);
      expect(result[0].label).toBe('标签');
      expect(result[0].items).toEqual([]);
    });
  });
});

describe('QuadrantChart 组件渲染', () => {
  const cols = buildColumns(['象限', '内容']);
  const sampleData = [
    { 象限: '重要且紧急', 内容: '修复bug, 处理投诉' },
    { 象限: '重要不紧急', 内容: '技术改进, 学习新技术' },
    { 象限: '不重要但紧急', 内容: '回复邮件' },
    { 象限: '不重要不紧急', 内容: '整理桌面' },
  ];

  it('根节点有 data-testid="quadrant-chart"', () => {
    render(<QuadrantChart columns={cols} data={sampleData} />);
    expect(screen.getByTestId('quadrant-chart')).toBeInTheDocument();
  });

  it('渲染标题并带 testid', () => {
    render(
      <QuadrantChart title="优先级矩阵" columns={cols} data={sampleData} />,
    );
    const titleEl = screen.getByTestId('quadrant-chart-title');
    expect(titleEl).toHaveTextContent('优先级矩阵');
  });

  it('四个象限各有独立 testid', () => {
    render(<QuadrantChart columns={cols} data={sampleData} />);
    expect(screen.getByTestId('quadrant-chart-q0')).toBeInTheDocument();
    expect(screen.getByTestId('quadrant-chart-q1')).toBeInTheDocument();
    expect(screen.getByTestId('quadrant-chart-q2')).toBeInTheDocument();
    expect(screen.getByTestId('quadrant-chart-q3')).toBeInTheDocument();
  });

  it('象限标签有独立 testid 且文本正确', () => {
    render(<QuadrantChart columns={cols} data={sampleData} />);
    expect(screen.getByTestId('quadrant-chart-q0-label')).toHaveTextContent('重要且紧急');
    expect(screen.getByTestId('quadrant-chart-q1-label')).toHaveTextContent('重要不紧急');
    expect(screen.getByTestId('quadrant-chart-q2-label')).toHaveTextContent('不重要但紧急');
    expect(screen.getByTestId('quadrant-chart-q3-label')).toHaveTextContent('不重要不紧急');
  });

  it('条目容器有 testid，条目正确拆分', () => {
    render(<QuadrantChart columns={cols} data={sampleData} />);
    const q0Items = screen.getByTestId('quadrant-chart-q0-items');
    expect(q0Items).toBeInTheDocument();
    expect(screen.getByText('修复bug')).toBeInTheDocument();
    expect(screen.getByText('处理投诉')).toBeInTheDocument();
    expect(screen.getByText('技术改进')).toBeInTheDocument();
    expect(screen.getByText('学习新技术')).toBeInTheDocument();
  });

  it('空数据时渲染空状态并带 testid', () => {
    render(<QuadrantChart title="测试" columns={cols} data={[]} />);
    const empty = screen.getByTestId('quadrant-chart-empty');
    expect(empty).toHaveTextContent('四象限图');
  });

  it('空列时渲染空状态', () => {
    render(<QuadrantChart title="测试" columns={[]} data={sampleData} />);
    expect(screen.getByTestId('quadrant-chart-empty')).toBeInTheDocument();
  });

  it('toolbar 带 testid', () => {
    render(
      <QuadrantChart
        title="标题"
        toolbar={<button type="button">tool</button>}
        columns={cols}
        data={sampleData}
      />,
    );
    expect(screen.getByTestId('quadrant-chart-header')).toBeInTheDocument();
    expect(screen.getByTestId('quadrant-chart-toolbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'tool' })).toBeInTheDocument();
  });

  it('grid 容器带 testid', () => {
    render(<QuadrantChart columns={cols} data={sampleData} />);
    expect(screen.getByTestId('quadrant-chart-grid')).toBeInTheDocument();
  });

  it('gridcell 有正确的 aria-label', () => {
    render(<QuadrantChart columns={cols} data={sampleData} />);
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(4);
    expect(cells[0].getAttribute('aria-label')).toBe('重要且紧急');
    expect(cells[1].getAttribute('aria-label')).toBe('重要不紧急');
  });

  it('不足 4 行时补空象限且 testid 齐全', () => {
    const data = [{ 象限: '唯一组', 内容: 'A' }];
    render(<QuadrantChart columns={cols} data={data} />);
    expect(screen.getByTestId('quadrant-chart-q0')).toBeInTheDocument();
    expect(screen.getByTestId('quadrant-chart-q1')).toBeInTheDocument();
    expect(screen.getByTestId('quadrant-chart-q2')).toBeInTheDocument();
    expect(screen.getByTestId('quadrant-chart-q3')).toBeInTheDocument();
    expect(screen.getByTestId('quadrant-chart-q0-label')).toHaveTextContent('唯一组');
  });
});
