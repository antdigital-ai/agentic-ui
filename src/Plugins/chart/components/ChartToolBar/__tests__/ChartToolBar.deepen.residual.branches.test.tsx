/**
 * ChartToolBar deepen residual：copyMarkdown 分支、styles 对象/数组、无 locale 复制文案。
 */
import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../../../I18n';
import ChartToolBar from '../ChartToolBar';

vi.mock('../style', () => ({
  useStyle: () => ({ wrapSSR: (n: any) => n, hashId: 'ctb' }),
}));

vi.mock('../../../../../Components/Loading', () => ({
  Loading: () => <div data-testid="loading" />,
}));

describe('ChartToolBar deepen residual branches', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
  });

  it('无 title+extra → null', () => {
    const { container } = render(
      <ConfigProvider>
        <ChartToolBar />
      </ConfigProvider>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('onCopyMarkdown 有/无；styles 数组与对象；默认复制文案', () => {
    const onCopy = vi.fn();
    const { rerender } = render(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: null, language: 'zh-CN' } as any}>
          <ChartToolBar
            title="T"
            onCopyMarkdown={onCopy}
            styles={[{ padding: 1 }, { margin: 2 }]}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    const copyBtn = document.querySelector('.ant-chart-toolbar-copy-btn') as HTMLElement;
    expect(copyBtn).toBeTruthy();
    fireEvent.click(copyBtn);
    expect(onCopy).toHaveBeenCalled();

    rerender(
      <ConfigProvider>
        <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' } as any}>
          <ChartToolBar title="T2" styles={{ padding: 4 }} />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByText('T2')).toBeInTheDocument();
    expect(document.querySelector('.ant-chart-toolbar-copy-btn')).toBeNull();
  });

  it('仅 extra 渲染；locale.copyMarkdown 覆盖', () => {
    const onCopy = vi.fn();
    render(
      <ConfigProvider>
        <I18nContext.Provider
          value={
            {
              locale: { copyMarkdown: 'CopyMD' },
              language: 'zh-CN',
            } as any
          }
        >
          <ChartToolBar
            extra={<span data-testid="only-extra">X</span>}
            onCopyMarkdown={onCopy}
          />
        </I18nContext.Provider>
      </ConfigProvider>,
    );
    expect(screen.getByTestId('only-extra')).toBeInTheDocument();
    fireEvent.click(
      document.querySelector('.ant-chart-toolbar-copy-btn') as HTMLElement,
    );
    expect(onCopy).toHaveBeenCalled();
  });
});
