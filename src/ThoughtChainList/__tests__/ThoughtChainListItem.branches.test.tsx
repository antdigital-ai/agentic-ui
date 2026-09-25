/**
 * ThoughtChainListItem 分支：各类别详情、折叠延迟、contentRender、无 category。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../I18n';
import { ThoughtChainListItem } from '../ThoughtChainListItem';

vi.mock('../DeepThink', () => ({
  DeepThink: () => <div data-testid="deep-think">DeepThink</div>,
}));
vi.mock('../ToolCall', () => ({
  ToolCall: () => <div data-testid="tool-call">ToolCall</div>,
}));
vi.mock('../TableSql', () => ({
  TableSql: () => <div data-testid="table-sql">TableSql</div>,
}));
vi.mock('../WebSearch', () => ({
  WebSearch: () => <div data-testid="web-search">WebSearch</div>,
}));
vi.mock('../RagRetrievalInfo', () => ({
  RagRetrievalInfo: () => <div data-testid="rag">Rag</div>,
}));
vi.mock('../TitleInfo', () => ({
  TitleInfo: ({
    title,
    setCollapse,
    collapse,
    titleExtraRender,
  }: any) => (
    <div data-testid="title-info">
      <span>{title}</span>
      <button
        type="button"
        data-testid="toggle"
        onClick={() => setCollapse?.(!collapse)}
      >
        toggle
      </button>
      {titleExtraRender?.(<span>extra</span>)}
    </div>
  ),
}));

const locale = { expand: '展开', collapse: '收起' };

const renderItem = (overrides: Record<string, any> = {}) => {
  const setDocMeta = vi.fn();
  const result = render(
    <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
      <ThoughtChainListItem
        index={0}
        prefixCls="tcl"
        hashId="h"
        setDocMeta={setDocMeta}
        thoughtChainListItem={{
          info: '标题',
          category: 'DeepThink',
          icon: <span data-testid="icon">i</span>,
          output: { type: 'END', data: 'ok' },
          ...overrides.item,
        }}
        {...overrides.props}
      />
    </I18nContext.Provider>,
  );
  return { ...result, setDocMeta };
};

describe('ThoughtChainListItem 分支覆盖', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('DeepThink 类别渲染详情', () => {
    renderItem();
    expect(screen.getByTestId('deep-think')).toBeInTheDocument();
  });

  it('ToolCall 类别', () => {
    renderItem({ item: { category: 'ToolCall' } });
    expect(screen.getByTestId('tool-call')).toBeInTheDocument();
  });

  it('TableSql 类别', () => {
    renderItem({ item: { category: 'TableSql' } });
    expect(screen.getByTestId('table-sql')).toBeInTheDocument();
  });

  it('WebSearch 类别', () => {
    renderItem({ item: { category: 'WebSearch' } });
    expect(screen.getByTestId('web-search')).toBeInTheDocument();
  });

  it('RagRetrieval 类别', () => {
    renderItem({ item: { category: 'RagRetrieval' } });
    expect(screen.getByTestId('rag')).toBeInTheDocument();
  });

  it('未知类别详情为 null', () => {
    renderItem({ item: { category: 'other' } });
    expect(screen.queryByTestId('deep-think')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tool-call')).not.toBeInTheDocument();
  });

  it('无 output 时图标 loading 类', () => {
    const { container } = renderItem({
      item: { output: undefined, icon: <span>x</span> },
    });
    expect(
      container.querySelector('.tcl-content-list-item-icon-loading'),
    ).toBeTruthy();
  });

  it('contentRender 替换默认内容', () => {
    renderItem({
      props: {
        contentRender: () => <div data-testid="custom-content">custom</div>,
      },
    });
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    expect(screen.queryByTestId('deep-think')).not.toBeInTheDocument();
  });

  it('titleExtraRender 透传', () => {
    renderItem({
      props: {
        titleExtraRender: (_item: any, dom: any) => (
          <div data-testid="title-extra">{dom}</div>
        ),
      },
    });
    expect(screen.getByTestId('title-extra')).toBeInTheDocument();
  });

  it('折叠后延迟卸载详情', () => {
    renderItem();
    expect(screen.getByTestId('deep-think')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('toggle'));
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByTestId('deep-think')).not.toBeInTheDocument();
  });

  it('bubble.isFinished 标记完成', () => {
    renderItem({
      props: { bubble: { isFinished: true }, isFinished: false },
      item: { category: 'DeepThink' },
    });
    expect(screen.getByTestId('deep-think')).toBeInTheDocument();
  });

  it('默认 markdownRenderProps 回退', () => {
    renderItem({ props: { markdownRenderProps: undefined } });
    expect(screen.getByTestId('deep-think')).toBeInTheDocument();
  });
});
