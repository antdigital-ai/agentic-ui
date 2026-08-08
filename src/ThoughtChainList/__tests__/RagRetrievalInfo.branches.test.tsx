/**
 * RagRetrievalInfo 分支：查询词、chunks 去重点击、空 chunks、locale 回退。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../I18n';
import { RagRetrievalInfo } from '../RagRetrievalInfo';

vi.mock('../CostMillis', () => ({
  CostMillis: ({ costMillis }: any) => (
    <span data-testid="cost">{costMillis}</span>
  ),
}));

const locale = {
  queryKeyWords: '检索查询',
  searchResults: '检索结果',
};

describe('RagRetrievalInfo 分支覆盖', () => {
  it('渲染 searchQueries 标签', () => {
    render(
      <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
        <RagRetrievalInfo
          info="检索"
          category="RagRetrieval"
          onMetaClick={vi.fn()}
          input={{ searchQueries: ['alpha', 'beta'] }}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('检索查询')).toBeInTheDocument();
    expect(screen.getByText('alpha')).toBeInTheDocument();
    expect(screen.getByText('beta')).toBeInTheDocument();
  });

  it('无 searchQueries 时不崩溃', () => {
    render(
      <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
        <RagRetrievalInfo
          info="检索"
          category="RagRetrieval"
          onMetaClick={vi.fn()}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('检索查询')).toBeInTheDocument();
  });

  it('chunks 为空数组不渲染结果区', () => {
    render(
      <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
        <RagRetrievalInfo
          info="检索"
          category="RagRetrieval"
          onMetaClick={vi.fn()}
          output={{ chunks: [] }}
        />
      </I18nContext.Provider>,
    );
    expect(screen.queryByText('检索结果')).not.toBeInTheDocument();
  });

  it('chunks 按 doc_name 去重并点击回调', () => {
    const onMetaClick = vi.fn();
    const meta = {
      doc_name: '手册',
      doc_id: '1',
      type: 'pdf',
      answer: '答',
    };
    render(
      <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
        <RagRetrievalInfo
          info="检索"
          category="RagRetrieval"
          onMetaClick={onMetaClick}
          costMillis={120}
          output={{
            chunks: [
              { content: 'a', originUrl: '', docMeta: meta },
              { content: 'b', originUrl: '', docMeta: meta },
            ],
          }}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('检索结果')).toBeInTheDocument();
    expect(screen.getByTestId('cost')).toHaveTextContent('120');
    fireEvent.click(screen.getByText('手册'));
    expect(onMetaClick).toHaveBeenCalledWith(meta);
  });

  it('doc_name 缺失时展示 answer', () => {
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
        <RagRetrievalInfo
          info="检索"
          category="RagRetrieval"
          onMetaClick={vi.fn()}
          output={{
            chunks: [
              {
                content: 'c',
                originUrl: '',
                docMeta: { answer: '兜底答案' },
              },
            ],
          }}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('兜底答案')).toBeInTheDocument();
    expect(screen.getByText('检索查询')).toBeInTheDocument();
  });
});
