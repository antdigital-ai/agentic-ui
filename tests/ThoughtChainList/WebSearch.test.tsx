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

const locale = {
  networkQuerying: '网络查询中',
  taskExecutionFailed: '任务执行失败',
  'webSearch.noResults': '无搜索结果',
  'webSearch.searchFailed': '搜索失败',
};

const wrap = (ui: React.ReactElement) =>
  render(
    <I18nContext.Provider value={{ locale } as any}>
      {ui}
    </I18nContext.Provider>,
  );

describe('WebSearch', () => {
  it('should show loading state when no output and not finished', () => {
    wrap(<WebSearch info="q" category="web_search" />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('网络查询中')).toBeInTheDocument();
  });

  it('should show output data via MarkdownEditor', () => {
    wrap(
      <WebSearch
        info="q"
        category="web_search"
        output={{ data: '>内容' }}
        isFinished={true}
      />,
    );
    expect(screen.getByText('内容')).toBeInTheDocument();
  });

  it('should show no-results when output has no data', () => {
    wrap(
      <WebSearch info="q" category="web_search" output={{}} isFinished />,
    );
    expect(screen.getByText('无搜索结果')).toBeInTheDocument();
  });

  it('should show error message from errorMsg or response.error', () => {
    wrap(
      <WebSearch
        info="q"
        category="web_search"
        output={{ errorMsg: 'Network error' }}
        isFinished
      />,
    );
    expect(screen.getByText('"Network error"')).toBeInTheDocument();
  });

  it('should not show loading when finished without output', () => {
    wrap(<WebSearch info="q" category="web_search" isFinished />);
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });
});
