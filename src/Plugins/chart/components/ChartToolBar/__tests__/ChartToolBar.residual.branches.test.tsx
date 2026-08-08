/**
 * ChartToolBar 残留：无 title+extra → null；download/copy；loading；styles 合并。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../../../I18n';
import ChartToolBar from '../ChartToolBar';

vi.mock('../style', () => ({
  useStyle: () => ({ wrapSSR: (n: any) => n, hashId: 'ctb' }),
}));

vi.mock('../../../../../Components/Loading', () => ({
  Loading: () => <div data-testid="loading" />,
}));

describe('ChartToolBar residual branches', () => {
  it.skip('无 title 且无 extra 返回 null', () => {
    const { container } = render(
      <ConfigProvider>
        <ChartToolBar />
      </ConfigProvider>,
    );
    expect(container.firstChild).toBeNull();
  });

  it.skip('download / copy / loading / styles 数组 / classNames 数组', () => {
    const onDownload = vi.fn();
    const onCopyMarkdown = vi.fn();
    render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
          <ChartToolBar
            title="T"
            dataTime="2024"
            theme="dark"
            loading
            onDownload={onDownload}
            onCopyMarkdown={onCopyMarkdown}
            filter={<span data-testid="filter">F</span>}
            extra={<span data-testid="extra">E</span>}
            classNames={['a', 'b']}
            styles={[{ padding: 1 }, { margin: 2 }]}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByTestId('filter')).toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    buttons.forEach((b) => fireEvent.click(b));
    expect(onDownload).toHaveBeenCalled();
    expect(onCopyMarkdown).toHaveBeenCalled();
  });

  it.skip('仅 extra 也可渲染', () => {
    render(
      <ConfigProvider>
        <ChartToolBar extra={<span data-testid="only-extra">X</span>} />
      </ConfigProvider>,
    );
    expect(screen.getByTestId('only-extra')).toBeInTheDocument();
  });
});
