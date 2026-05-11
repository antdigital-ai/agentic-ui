import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { resolveQuadrantFields } from '../../../Utils/columnMatching';
import { QuadrantChart } from '../QuadrantChart';
import { groupByQuadrant } from '../QuadrantChart/utils';

const buildColumns = (titles: string[]) =>
  titles.map((t) => ({ title: t, dataIndex: t, key: t }));

describe('QuadrantChart utils', () => {
  describe('resolveQuadrantFields', () => {
    it('按默认别名命中中文表头', () => {
      const fields = resolveQuadrantFields(['名称', '象限', '描述']);
      expect(fields).toEqual({ name: '名称', quadrant: '象限', description: '描述' });
    });

    it('命中英文表头', () => {
      const fields = resolveQuadrantFields(['name', 'quadrant', 'description']);
      expect(fields).toEqual({ name: 'name', quadrant: 'quadrant', description: 'description' });
    });

    it('支持 category/分类 等别名', () => {
      const fields = resolveQuadrantFields(['标题', '分类']);
      expect(fields?.name).toBe('标题');
      expect(fields?.quadrant).toBe('分类');
    });

    it('fieldMap 覆盖优先级高于默认别名', () => {
      const fields = resolveQuadrantFields(
        ['Foo', 'Bar', '名称'],
        { name: 'Foo', quadrant: 'Bar' },
      );
      expect(fields?.name).toBe('Foo');
      expect(fields?.quadrant).toBe('Bar');
    });

    it('无法解析名称列时返回 null', () => {
      expect(resolveQuadrantFields(['col1', '象限'])).toBeNull();
    });

    it('无法解析象限列时返回 null', () => {
      expect(resolveQuadrantFields(['名称', 'col2'])).toBeNull();
    });

    it('无描述列时仅返回 name 和 quadrant', () => {
      const fields = resolveQuadrantFields(['名称', '象限']);
      expect(fields).toEqual({ name: '名称', quadrant: '象限' });
    });
  });

  describe('groupByQuadrant', () => {
    const data = [
      { name: 'A', q: '重要且紧急' },
      { name: 'B', q: '重要不紧急' },
      { name: 'C', q: '重要且紧急' },
      { name: 'D', q: '不重要但紧急' },
      { name: 'E', q: '不重要不紧急' },
    ];

    it('按象限列分组，保持首次出现顺序', () => {
      const result = groupByQuadrant(data, 'name', 'q', undefined);
      expect(result).toHaveLength(4);
      expect(result[0].label).toBe('重要且紧急');
      expect(result[0].items.map((i) => i.name)).toEqual(['A', 'C']);
      expect(result[1].label).toBe('重要不紧急');
      expect(result[1].items.map((i) => i.name)).toEqual(['B']);
      expect(result[2].label).toBe('不重要但紧急');
      expect(result[3].label).toBe('不重要不紧急');
    });

    it('不足 4 个象限时补空占位', () => {
      const twoGroups = [
        { name: 'A', q: '组1' },
        { name: 'B', q: '组2' },
      ];
      const result = groupByQuadrant(twoGroups, 'name', 'q', undefined);
      expect(result).toHaveLength(4);
      expect(result[2].label).toBe('Q3');
      expect(result[2].items).toHaveLength(0);
      expect(result[3].label).toBe('Q4');
    });

    it('超过 4 个象限值时忽略多余的', () => {
      const manyGroups = [
        { name: 'A', q: 'G1' },
        { name: 'B', q: 'G2' },
        { name: 'C', q: 'G3' },
        { name: 'D', q: 'G4' },
        { name: 'E', q: 'G5' },
      ];
      const result = groupByQuadrant(manyGroups, 'name', 'q', undefined);
      expect(result).toHaveLength(4);
      const allNames = result.flatMap((g) => g.items.map((i) => i.name));
      expect(allNames).not.toContain('E');
    });

    it('跳过空名称和空象限', () => {
      const messyData = [
        { name: '', q: '组1' },
        { name: 'B', q: '' },
        { name: 'C', q: '组1' },
      ];
      const result = groupByQuadrant(messyData, 'name', 'q', undefined);
      expect(result[0].items).toHaveLength(1);
      expect(result[0].items[0].name).toBe('C');
    });

    it('含描述列时正确解析', () => {
      const withDesc = [{ name: 'A', q: '组1', desc: '说明文字' }];
      const result = groupByQuadrant(withDesc, 'name', 'q', 'desc');
      expect(result[0].items[0].description).toBe('说明文字');
    });
  });
});

describe('QuadrantChart 组件渲染', () => {
  const sampleColumns = buildColumns(['名称', '象限', '描述']);
  const sampleData = [
    { 名称: '修复线上bug', 象限: '重要且紧急', 描述: '影响用户' },
    { 名称: '技术改进', 象限: '重要不紧急', 描述: '长期价值' },
    { 名称: '回复邮件', 象限: '不重要但紧急', 描述: '日常事务' },
    { 名称: '整理桌面', 象限: '不重要不紧急', 描述: '可以延后' },
    { 名称: '处理客户投诉', 象限: '重要且紧急', 描述: '优先处理' },
  ];

  it('渲染标题和四个象限区域', () => {
    render(
      <QuadrantChart
        title="优先级矩阵"
        columns={sampleColumns}
        data={sampleData}
      />,
    );

    expect(screen.getByText('优先级矩阵')).toBeInTheDocument();
    expect(screen.getByText('重要且紧急')).toBeInTheDocument();
    expect(screen.getByText('重要不紧急')).toBeInTheDocument();
    expect(screen.getByText('不重要但紧急')).toBeInTheDocument();
    expect(screen.getByText('不重要不紧急')).toBeInTheDocument();
  });

  it('条目正确分布到象限中', () => {
    render(
      <QuadrantChart
        columns={sampleColumns}
        data={sampleData}
      />,
    );

    expect(screen.getByText('修复线上bug')).toBeInTheDocument();
    expect(screen.getByText('处理客户投诉')).toBeInTheDocument();
    expect(screen.getByText('技术改进')).toBeInTheDocument();
    expect(screen.getByText('回复邮件')).toBeInTheDocument();
    expect(screen.getByText('整理桌面')).toBeInTheDocument();
  });

  it('描述文字正确渲染', () => {
    render(
      <QuadrantChart columns={sampleColumns} data={sampleData} />,
    );

    expect(screen.getByText('影响用户')).toBeInTheDocument();
    expect(screen.getByText('长期价值')).toBeInTheDocument();
  });

  it('无法解析字段时仅渲染空状态', () => {
    const cols = buildColumns(['col1', 'col2']);
    const data = [{ col1: 'a', col2: 'b' }];
    render(
      <QuadrantChart title="测试" columns={cols} data={data} />,
    );
    expect(screen.getByText('四象限图')).toBeInTheDocument();
  });

  it('描述列缺失时不渲染描述且不报错', () => {
    const cols = buildColumns(['名称', '象限']);
    const data = [{ 名称: 'A', 象限: '组1' }];
    const { container } = render(
      <QuadrantChart columns={cols} data={data} />,
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(container.querySelectorAll('[class*="-item-desc"]')).toHaveLength(0);
  });

  it('toolbar 与 title 在同一 header 行渲染', () => {
    const cols = buildColumns(['名称', '象限']);
    const data = [{ 名称: 'a', 象限: '组1' }];
    render(
      <QuadrantChart
        title="标题"
        toolbar={<button type="button">tool</button>}
        columns={cols}
        data={data}
      />,
    );
    expect(screen.getByText('标题')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'tool' })).toBeInTheDocument();
  });

  it('gridcell 有正确的 aria-label', () => {
    const cols = buildColumns(['名称', '象限']);
    const data = [
      { 名称: 'A', 象限: '高高' },
      { 名称: 'B', 象限: '低高' },
      { 名称: 'C', 象限: '高低' },
      { 名称: 'D', 象限: '低低' },
    ];
    render(
      <QuadrantChart columns={cols} data={data} />,
    );
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(4);
    const labels = cells.map((c) => c.getAttribute('aria-label'));
    expect(labels).toContain('高高');
    expect(labels).toContain('低高');
    expect(labels).toContain('高低');
    expect(labels).toContain('低低');
  });

  it('不足 4 个象限时补空占位', () => {
    const cols = buildColumns(['名称', '象限']);
    const data = [{ 名称: 'A', 象限: '唯一组' }];
    render(
      <QuadrantChart columns={cols} data={data} />,
    );
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(4);
    expect(screen.getByText('唯一组')).toBeInTheDocument();
  });
});
