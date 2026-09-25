/**
 * WebSearch 分支：loading / 有 data / 无结果 / 错误来源 / TOKEN typewriter。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../I18n';
import { WebSearch } from '../WebSearch';

vi.mock('../MarkdownEditor', () => ({
  MarkdownEditorUpdate: ({ initValue, typewriter }: any) => (
    <div data-testid="md-update" data-typewriter={String(!!typewriter)}>
      {initValue}
    </div>
  ),
}));

vi.mock('../DotAni', () => ({
  DotLoading: () => <span data-testid="dot">...</span>,
}));

vi.mock('../../Components/icons/LoadingSpinnerIcon', () => ({
  LoadingSpinnerIcon: () => <span data-testid="spinner" />,
}));

const locale = {
  networkQuerying: '正在联网查询',
  'webSearch.noResults': '无搜索结果',
  'webSearch.searchFailed': '搜索失败，需要修改',
  taskExecutionFailed: '任务执行失败',
};

const wrap = (ui: React.ReactElement) =>
  render(
    <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
      {ui}
    </I18nContext.Provider>,
  );

describe('WebSearch 分支覆盖', () => {
  it('无 output 未完成显示 loading', () => {
    wrap(<WebSearch info="搜" category="WebSearch" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.getByText('正在联网查询')).toBeInTheDocument();
  });

  it('有 data 时渲染 Markdown 并去掉前导 >', () => {
    wrap(
      <WebSearch
        info="搜"
        category="WebSearch"
        isFinished
        output={{ type: 'END', data: '>result body' }}
      />,
    );
    expect(screen.getByTestId('md-update')).toHaveTextContent('result body');
  });

  it('有 output 无 data 显示无搜索结果', () => {
    wrap(
      <WebSearch
        info="搜"
        category="WebSearch"
        isFinished
        output={{ type: 'END' }}
      />,
    );
    expect(screen.getByText('无搜索结果')).toBeInTheDocument();
  });

  it('TOKEN 未完成时 typewriter=true', () => {
    wrap(
      <WebSearch
        info="搜"
        category="WebSearch"
        output={{ type: 'TOKEN', data: 'chunk' }}
      />,
    );
    expect(screen.getByTestId('md-update')).toHaveAttribute(
      'data-typewriter',
      'true',
    );
  });

  it('output.errorMsg 显示搜索失败', () => {
    wrap(
      <WebSearch
        info="搜"
        category="WebSearch"
        output={{ errorMsg: 'net-down' }}
      />,
    );
    expect(screen.getByText(/搜索失败/)).toBeInTheDocument();
    expect(screen.getByText(/"net-down"/)).toBeInTheDocument();
  });

  it('response.error 作为错误', () => {
    wrap(
      <WebSearch
        info="搜"
        category="WebSearch"
        output={{ response: { error: 'e1' } }}
      />,
    );
    expect(screen.getByText(/"e1"/)).toBeInTheDocument();
  });

  it('locale 缺失时回退默认文案', () => {
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
        <WebSearch info="搜" category="WebSearch" output={{ type: 'END' }} />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('无搜索结果')).toBeInTheDocument();
  });
});
