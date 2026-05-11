import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { resolveQuadrantFields } from '../../../Utils/columnMatching';
import { QuadrantChart } from '../QuadrantChart';
import {
  classifyIntoQuadrants,
  computeMedian,
} from '../QuadrantChart/utils';

const buildColumns = (titles: string[]) =>
  titles.map((t) => ({ title: t, dataIndex: t, key: t }));

describe('QuadrantChart utils', () => {
  describe('resolveQuadrantFields', () => {
    it('按默认别名命中中文表头', () => {
      const fields = resolveQuadrantFields(['名称', '紧急度', '重要度', '描述']);
      expect(fields).toEqual({ name: '名称', description: '描述' });
    });

    it('命中英文表头', () => {
      const fields = resolveQuadrantFields(['name', 'x', 'y', 'description']);
      expect(fields).toEqual({ name: 'name', description: 'description' });
    });

    it('支持「逻辑名 + 括号单位」的宽松匹配', () => {
      const fields = resolveQuadrantFields(['名称（项目）', '描述（中文）']);
      expect(fields?.name).toBe('名称（项目）');
      expect(fields?.description).toBe('描述（中文）');
    });

    it('fieldMap 覆盖优先级高于默认别名', () => {
      const fields = resolveQuadrantFields(
        ['Foo', '名称', '简介'],
        { name: 'Foo' },
      );
      expect(fields?.name).toBe('Foo');
    });

    it('无法解析名称列时返回 null', () => {
      expect(resolveQuadrantFields(['col1', 'col2'])).toBeNull();
    });

    it('无描述列时仅返回 name', () => {
      const fields = resolveQuadrantFields(['名称', '数值A', '数值B']);
      expect(fields).toEqual({ name: '名称' });
    });
  });

  describe('classifyIntoQuadrants', () => {
    const data = [
      { name: 'A', x: 80, y: 90 },
      { name: 'B', x: 20, y: 85 },
      { name: 'C', x: 75, y: 30 },
      { name: 'D', x: 15, y: 20 },
    ];

    it('按阈值 50 正确分配到四个象限', () => {
      const result = classifyIntoQuadrants(data, 'x', 'y', 'name', undefined, 50, 50);
      expect(result[0].map((i) => i.name)).toEqual(['A']);
      expect(result[1].map((i) => i.name)).toEqual(['B']);
      expect(result[2].map((i) => i.name)).toEqual(['D']);
      expect(result[3].map((i) => i.name)).toEqual(['C']);
    });

    it('边界值（等于阈值）归入高侧象限', () => {
      const borderData = [{ name: 'E', x: 50, y: 50 }];
      const result = classifyIntoQuadrants(borderData, 'x', 'y', 'name', undefined, 50, 50);
      expect(result[0].map((i) => i.name)).toEqual(['E']);
    });

    it('跳过非数值的行', () => {
      const mixedData = [
        { name: 'A', x: 80, y: 90 },
        { name: 'B', x: 'invalid', y: 85 },
        { name: 'C', x: 75, y: null },
      ];
      const result = classifyIntoQuadrants(mixedData, 'x', 'y', 'name', undefined, 50, 50);
      const total = result.reduce((sum, q) => sum + q.length, 0);
      expect(total).toBe(1);
    });

    it('跳过空名称的行', () => {
      const emptyNameData = [
        { name: '', x: 80, y: 90 },
        { name: '  ', x: 20, y: 85 },
        { name: 'C', x: 75, y: 30 },
      ];
      const result = classifyIntoQuadrants(emptyNameData, 'x', 'y', 'name', undefined, 50, 50);
      const total = result.reduce((sum, q) => sum + q.length, 0);
      expect(total).toBe(1);
    });

    it('含描述列时正确解析', () => {
      const withDesc = [{ name: 'A', x: 80, y: 90, desc: '高优先级' }];
      const result = classifyIntoQuadrants(withDesc, 'x', 'y', 'name', 'desc', 50, 50);
      expect(result[0][0].description).toBe('高优先级');
    });
  });

  describe('computeMedian', () => {
    it('奇数个值返回中间值', () => {
      const data = [{ v: 10 }, { v: 20 }, { v: 30 }];
      expect(computeMedian(data, 'v')).toBe(20);
    });

    it('偶数个值返回中间两数平均值', () => {
      const data = [{ v: 10 }, { v: 20 }, { v: 30 }, { v: 40 }];
      expect(computeMedian(data, 'v')).toBe(25);
    });

    it('空数据返回 50 作为默认值', () => {
      expect(computeMedian([], 'v')).toBe(50);
    });

    it('忽略非数值', () => {
      const data = [{ v: 10 }, { v: 'abc' }, { v: 30 }];
      expect(computeMedian(data, 'v')).toBe(20);
    });
  });
});

describe('QuadrantChart 组件渲染', () => {
  const sampleColumns = buildColumns(['名称', '紧急度', '重要度', '描述']);
  const sampleData = [
    { 名称: '优化数据库', 紧急度: 80, 重要度: 90, 描述: '紧急且重要' },
    { 名称: '学习新技术', 紧急度: 20, 重要度: 85, 描述: '不紧急但重要' },
    { 名称: '回复邮件', 紧急度: 75, 重要度: 30, 描述: '紧急不重要' },
    { 名称: '整理桌面', 紧急度: 15, 重要度: 20, 描述: '不紧急不重要' },
  ];

  it('渲染标题和四个象限区域', () => {
    render(
      <QuadrantChart
        title="优先级矩阵"
        columns={sampleColumns}
        data={sampleData}
        x="紧急度"
        y="重要度"
      />,
    );

    expect(screen.getByText('优先级矩阵')).toBeInTheDocument();
    expect(screen.getByText('优化数据库')).toBeInTheDocument();
    expect(screen.getByText('学习新技术')).toBeInTheDocument();
    expect(screen.getByText('回复邮件')).toBeInTheDocument();
    expect(screen.getByText('整理桌面')).toBeInTheDocument();
  });

  it('自定义象限标签正确渲染', () => {
    const labels = ['重要且紧急', '重要不紧急', '不重要不紧急', '不重要但紧急'];
    render(
      <QuadrantChart
        title="测试"
        columns={sampleColumns}
        data={sampleData}
        x="紧急度"
        y="重要度"
        quadrantLabels={labels}
      />,
    );

    expect(screen.getByText('重要且紧急')).toBeInTheDocument();
    expect(screen.getByText('重要不紧急')).toBeInTheDocument();
    expect(screen.getByText('不重要不紧急')).toBeInTheDocument();
    expect(screen.getByText('不重要但紧急')).toBeInTheDocument();
  });

  it('显示轴标签', () => {
    render(
      <QuadrantChart
        columns={sampleColumns}
        data={sampleData}
        x="紧急度"
        y="重要度"
        xAxisLabel="紧急程度 →"
        yAxisLabel="重要程度 →"
      />,
    );

    expect(screen.getByText('紧急程度 →')).toBeInTheDocument();
    expect(screen.getByText('重要程度 →')).toBeInTheDocument();
  });

  it('无法解析名称列时仅渲染空状态', () => {
    const cols = buildColumns(['col1', 'col2']);
    const data = [{ col1: 80, col2: 90 }];
    render(
      <QuadrantChart
        title="测试"
        columns={cols}
        data={data}
        x="col1"
        y="col2"
      />,
    );
    expect(screen.getByText('四象限图')).toBeInTheDocument();
  });

  it('缺少 x/y 时渲染空状态', () => {
    render(
      <QuadrantChart
        title="测试"
        columns={sampleColumns}
        data={sampleData}
      />,
    );
    expect(screen.getByText('四象限图')).toBeInTheDocument();
  });

  it('描述列缺失时不渲染描述且不报错', () => {
    const cols = buildColumns(['名称', '紧急度', '重要度']);
    const data = [{ 名称: 'A', 紧急度: 80, 重要度: 90 }];
    const { container } = render(
      <QuadrantChart columns={cols} data={data} x="紧急度" y="重要度" />,
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(container.querySelectorAll('[class*="-item-desc"]')).toHaveLength(0);
  });

  it('toolbar 与 title 在同一 header 行渲染', () => {
    const cols = buildColumns(['名称', '紧急度', '重要度']);
    const data = [{ 名称: 'a', 紧急度: 80, 重要度: 90 }];
    render(
      <QuadrantChart
        title="标题"
        toolbar={<button type="button">tool</button>}
        columns={cols}
        data={data}
        x="紧急度"
        y="重要度"
      />,
    );
    expect(screen.getByText('标题')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'tool' })).toBeInTheDocument();
  });

  it('自定义阈值正确分组', () => {
    const cols = buildColumns(['名称', '紧急度', '重要度']);
    const data = [
      { 名称: 'A', 紧急度: 30, 重要度: 70 },
      { 名称: 'B', 紧急度: 70, 重要度: 70 },
    ];
    render(
      <QuadrantChart
        columns={cols}
        data={data}
        x="紧急度"
        y="重要度"
        xThreshold={50}
        yThreshold={50}
      />,
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('gridcell 有正确的 aria-label', () => {
    const cols = buildColumns(['名称', '紧急度', '重要度']);
    const data = [{ 名称: 'A', 紧急度: 80, 重要度: 90 }];
    render(
      <QuadrantChart
        columns={cols}
        data={data}
        x="紧急度"
        y="重要度"
        quadrantLabels={['高高', '低高', '低低', '高低']}
      />,
    );
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(4);
    const labels = cells.map((c) => c.getAttribute('aria-label'));
    expect(labels).toContain('高高');
    expect(labels).toContain('低高');
    expect(labels).toContain('低低');
    expect(labels).toContain('高低');
  });
});
