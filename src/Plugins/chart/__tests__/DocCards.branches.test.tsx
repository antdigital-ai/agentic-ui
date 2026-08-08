/**
 * DocCards 组件分支：空态、header、卡片列数 clamp、安全/危险链接、tags。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { I18nContext } from '../../../I18n';
import { DocCards } from '../DocCards';

const cols = [
  { title: '标题', dataIndex: 'title', key: 'title' },
  { title: '链接', dataIndex: 'url', key: 'url' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: '标签', dataIndex: 'tags', key: 'tags' },
];

describe('DocCards 分支覆盖', () => {
  it('无法解析 title 列时渲染空态', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider
          value={{ locale: { docCards: '卡片列表' }, language: 'zh-CN' }}
        >
          <DocCards
            columns={[{ title: 'x', dataIndex: 'x', key: 'x' }]}
            data={[{ x: 1 }]}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByText('卡片列表')).toBeInTheDocument();
  });

  it('空态 locale 缺失用默认文案', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
          <DocCards columns={[{ dataIndex: 'z' }]} data={[{ z: 1 }]} />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('doc-cards-empty')).toHaveTextContent('卡片列表');
  });

  it('渲染卡片：安全外链、tags、title/toolbar', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
          <DocCards
            title="文档"
            toolbar={<span>tb</span>}
            cardColumns={8}
            columns={cols}
            data={[
              {
                title: 'A',
                url: 'https://example.com/path',
                description: 'desc',
                tags: 't1, t2, t1',
              },
              {
                title: 'B',
                url: 'javascript:alert(1)',
                description: '',
                tags: '',
              },
              {
                title: 'C',
                url: '/internal',
                description: null,
                tags: null,
              },
            ]}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByText('文档')).toBeInTheDocument();
    expect(screen.getByText('tb')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('t1')).toBeInTheDocument();
    expect(screen.getByText('t2')).toBeInTheDocument();
    const safe = screen.getByRole('link', { name: /example.com/i });
    expect(safe).toHaveAttribute('href', 'https://example.com/path');
    expect(safe).toHaveAttribute('target', '_blank');
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /javascript/i })).toBeNull();
  });

  it('cardColumns 非法值回退为 1', () => {
    const { container } = render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
          <DocCards
            cardColumns={0 as any}
            columns={cols}
            data={[{ title: 'T', url: '#a' }]}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    const grid = container.querySelector('[style*="grid-template-columns"]');
    expect(grid?.getAttribute('style') || '').toMatch(/repeat\(1/);
  });

  it('无 title/toolbar 不渲染 header', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
          <DocCards columns={cols} data={[{ title: 'Only' }]} />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByText('Only')).toBeInTheDocument();
  });

  it('空 data；自定义 title', () => {
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
          <DocCards title="Docs" columns={cols} data={[]} />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByText('Docs')).toBeTruthy();
    expect(screen.getByTestId('doc-cards-header')).toBeTruthy();
  });

  it('单列 cardColumns=1 网格', () => {
    const { container } = render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
          <DocCards
            cardColumns={1}
            columns={cols}
            data={[{ title: 'One', url: '#1' }]}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByText('One')).toBeInTheDocument();
    const grid = container.querySelector('[style*="grid-template-columns"]');
    expect(grid?.getAttribute('style') || '').toMatch(/repeat\(1/);
  });
});
