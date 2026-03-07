import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../src/I18n';
import { WebSearch } from '../../src/ThoughtChainList/WebSearch';

vi.mock('../../src/ThoughtChainList/MarkdownEditor', () => ({
  MarkdownEditorUpdate: ({ initValue }: any) => (
    <div data-testid="markdown-editor">{initValue}</div>
  ),
}));

vi.mock('../../src/Components/icons/LoadingSpinnerIcon', () => ({
  LoadingSpinnerIcon: () => <span data-testid="loading-spinner" />,
}));

vi.mock('../../src/ThoughtChainList/DotAni', () => ({
  DotLoading: () => <span data-testid="dot-loading" />,
}));

const defaultLocale = {
  networkQuerying: '网络查询中',
  taskExecutionFailed: '任务执行失败',
  'webSearch.noResults': '无搜索结果',
  'webSearch.searchFailed': '搜索失败',
};

const renderWithI18n = (ui: React.ReactElement) => {
  return render(
    <I18nContext.Provider value={{ locale: defaultLocale } as any}>
      {ui}
    </I18nContext.Provider>,
  );
};

describe('WebSearch', () => {
  it('should show loading state when no output and not finished', () => {
    renderWithI18n(
      <WebSearch info="test" category="web_search" />,
    );
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByTestId('dot-loading')).toBeInTheDocument();
    expect(screen.getByText('网络查询中')).toBeInTheDocument();
  });

  it('should show output data when available', () => {
    renderWithI18n(
      <WebSearch
        info="test"
        category="web_search"
        output={{ data: '搜索结果内容' }}
        isFinished={true}
      />,
    );
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
    expect(screen.getByText('搜索结果内容')).toBeInTheDocument();
  });

  it('should show no results message when output has no data', () => {
    renderWithI18n(
      <WebSearch
        info="test"
        category="web_search"
        output={{}}
        isFinished={true}
      />,
    );
    expect(screen.getByText('无搜索结果')).toBeInTheDocument();
  });

  it('should show error message', () => {
    renderWithI18n(
      <WebSearch
        info="test"
        category="web_search"
        output={{ errorMsg: 'Network error' }}
        isFinished={true}
      />,
    );
    expect(screen.getByText('"Network error"')).toBeInTheDocument();
    expect(screen.getByText('搜索失败')).toBeInTheDocument();
  });

  it('should show error from response.error', () => {
    renderWithI18n(
      <WebSearch
        info="test"
        category="web_search"
        output={{ response: { error: 'Timeout error' } }}
        isFinished={true}
      />,
    );
    expect(screen.getByText('"Timeout error"')).toBeInTheDocument();
  });

  it('should not show loading when finished without output', () => {
    renderWithI18n(
      <WebSearch
        info="test"
        category="web_search"
        isFinished={true}
      />,
    );
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('should strip leading > from data', () => {
    renderWithI18n(
      <WebSearch
        info="test"
        category="web_search"
        output={{ data: '>quoted content' }}
        isFinished={true}
      />,
    );
    expect(screen.getByText('quoted content')).toBeInTheDocument();
  });
});
