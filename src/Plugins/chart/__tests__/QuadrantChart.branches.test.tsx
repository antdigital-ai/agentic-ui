/**
 * QuadrantChart 组件分支：空数据、仅标题/工具栏、网格渲染、locale 回退。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { I18nContext } from '../../../I18n';
import { QuadrantChart } from '../QuadrantChart/QuadrantChart';

const cols = [
  { title: '象限', dataIndex: 'q', key: 'q' },
  { title: '内容', dataIndex: 'c', key: 'c' },
];

describe('QuadrantChart 分支覆盖', () => {
  it('空 data 渲染 empty', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider
          value={{ locale: { quadrantChart: '四象限图' }, language: 'zh-CN' }}
        >
          <QuadrantChart columns={cols} data={[]} title="T" />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('quadrant-chart-empty')).toHaveTextContent(
      '四象限图',
    );
    expect(screen.getByTestId('quadrant-chart-title')).toHaveTextContent('T');
  });

  it('空 columns 渲染 empty，locale 缺失用默认文案', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
          <QuadrantChart columns={[]} data={[{ q: 'a', c: 'b' }]} />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('quadrant-chart-empty')).toHaveTextContent(
      '四象限图',
    );
  });

  it('仅 toolbar 时渲染 header 无 title', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
          <QuadrantChart
            columns={cols}
            data={[]}
            toolbar={<button type="button">tb</button>}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('quadrant-chart-toolbar')).toBeInTheDocument();
    expect(screen.queryByTestId('quadrant-chart-title')).not.toBeInTheDocument();
  });

  it('无 title/toolbar 时不渲染 header', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
          <QuadrantChart columns={cols} data={[]} />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.queryByTestId('quadrant-chart-header')).not.toBeInTheDocument();
  });

  it('有数据时渲染 4 象限网格', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider
          value={{ locale: { quadrantChart: 'QChart' }, language: 'zh-CN' }}
        >
          <QuadrantChart
            className="extra"
            style={{ padding: 4 }}
            columns={cols}
            data={[
              { q: '重要紧急', c: 'A, B' },
              { q: '重要不紧急', c: 'C' },
            ]}
            title="矩阵"
            toolbar={<span>bar</span>}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('quadrant-chart-grid')).toHaveAttribute(
      'aria-label',
      'QChart',
    );
    expect(screen.getByText('重要紧急')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});
