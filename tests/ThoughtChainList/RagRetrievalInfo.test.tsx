/**
 * RagRetrievalInfo 组件测试用例
 */

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../src/I18n';
import { RagRetrievalInfo } from '../../src/ThoughtChainList/RagRetrievalInfo';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nContext.Provider value={{ locale: {} as any, language: 'zh-CN' }}>
    {children}
  </I18nContext.Provider>
);

describe('RagRetrievalInfo', () => {
  it('应渲染检索查询和结果', () => {
    render(
      <TestWrapper>
        <RagRetrievalInfo
          category="RagRetrieval"
          onMetaClick={vi.fn()}
          input={{ searchQueries: ['关键词'] }}
          output={{
            chunks: [
              {
                docMeta: {
                  doc_name: '文档1',
                  doc_id: '1',
                  type: 'doc',
                  origin_text: '内容',
                  answer: '答案1',
                },
                content: '',
                originUrl: '',
              },
            ],
          }}
        />
      </TestWrapper>,
    );

    expect(screen.getByText('关键词')).toBeInTheDocument();
    expect(screen.getByText('文档1')).toBeInTheDocument();
  });

  it('点击检索结果块时应调用 onMetaClick 并传入 docMeta', () => {
    const onMetaClick = vi.fn();

    render(
      <TestWrapper>
        <RagRetrievalInfo
          category="RagRetrieval"
          onMetaClick={onMetaClick}
          input={{ searchQueries: ['q'] }}
          output={{
            chunks: [
              {
                docMeta: {
                  doc_name: 'DocA',
                  doc_id: 'id-a',
                  type: 'doc',
                  origin_text: 'text',
                  answer: 'Answer A',
                },
                content: '',
                originUrl: '',
              },
            ],
          }}
        />
      </TestWrapper>,
    );

    const chunkBlock = screen.getByText('DocA');
    const clickableDiv = chunkBlock.closest('div');
    fireEvent.click(clickableDiv ?? chunkBlock);

    expect(onMetaClick).toHaveBeenCalledTimes(1);
    expect(onMetaClick).toHaveBeenCalledWith(
      expect.objectContaining({
        doc_name: 'DocA',
        doc_id: 'id-a',
        type: 'doc',
        origin_text: 'text',
        answer: 'Answer A',
      }),
    );
  });

  it('点击多个检索结果块时每次应调用 onMetaClick 并传入对应 docMeta', () => {
    const onMetaClick = vi.fn();

    render(
      <TestWrapper>
        <RagRetrievalInfo
          category="RagRetrieval"
          onMetaClick={onMetaClick}
          input={{ searchQueries: ['q1', 'q2'] }}
          output={{
            chunks: [
              {
                docMeta: {
                  doc_name: '文档A',
                  doc_id: 'id-a',
                  type: 'doc',
                  origin_text: 't1',
                  answer: '答案A',
                },
                content: '',
                originUrl: '',
              },
              {
                docMeta: {
                  doc_name: '文档B',
                  doc_id: 'id-b',
                  type: 'doc',
                  origin_text: 't2',
                  answer: '答案B',
                },
                content: '',
                originUrl: '',
              },
            ],
          }}
        />
      </TestWrapper>,
    );

    const docA = screen.getByText('文档A');
    fireEvent.click(docA.closest('div') ?? docA);
    expect(onMetaClick).toHaveBeenLastCalledWith(
      expect.objectContaining({ doc_name: '文档A', doc_id: 'id-a' }),
    );

    const docB = screen.getByText('文档B');
    fireEvent.click(docB.closest('div') ?? docB);
    expect(onMetaClick).toHaveBeenLastCalledWith(
      expect.objectContaining({ doc_name: '文档B', doc_id: 'id-b' }),
    );
    expect(onMetaClick).toHaveBeenCalledTimes(2);
  });

  it('onMetaClick 为 undefined 时点击检索块不报错', () => {
    render(
      <TestWrapper>
        <RagRetrievalInfo
          category="RagRetrieval"
          onMetaClick={undefined as any}
          input={{ searchQueries: ['q'] }}
          output={{
            chunks: [
              {
                docMeta: {
                  doc_name: 'DocX',
                  doc_id: 'id-x',
                  type: 'doc',
                  origin_text: 'text',
                  answer: 'Answer X',
                },
                content: '',
                originUrl: '',
              },
            ],
          }}
        />
      </TestWrapper>,
    );

    const block = screen.getByText('DocX');
    expect(() => fireEvent.click(block.closest('div') ?? block)).not.toThrow();
  });
});
