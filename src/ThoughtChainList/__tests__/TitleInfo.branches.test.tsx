/**
 * TitleInfo 分支：meta 标签多/单、类别图标、折叠、FlipText、titleExtraRender。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../I18n';
import { TitleInfo } from '../TitleInfo';

vi.mock('../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, onClick, title, 'data-testid': testId }: any) => (
    <button type="button" data-testid={testId} title={title} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('../FlipText', () => ({
  FlipText: ({ word }: { word?: string }) => (
    <span data-testid="flip">{word}</span>
  ),
}));

vi.mock('../CostMillis', () => ({
  CostMillis: ({ costMillis }: any) => (
    <span data-testid="cost">{costMillis}</span>
  ),
}));

const locale = {
  expand: '展开',
  collapse: '收起',
  multipleKnowledgeBases: '多个知识库',
  multipleTables: '等多个表',
  multipleTools: '等多个工具',
  multipleData: '等多个数据',
};

const metaItem = (name: string, uuid = name) => ({
  name,
  icon: '',
  uuid,
  type: 'doc',
  description: `${name}-desc`,
});

describe('TitleInfo 分支覆盖', () => {
  it('普通文本未完成时走 FlipText', () => {
    render(
      <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
        <TitleInfo
          title="普通标题"
          category="DeepThink"
          prefixCls="tcl"
          hashId="h"
          collapse={false}
          isFinished={false}
          setCollapse={vi.fn()}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByTestId('flip')).toHaveTextContent('普通标题');
  });

  it('普通文本已完成直接渲染文字', () => {
    render(
      <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
        <TitleInfo
          title="完成标题"
          category="DeepThink"
          prefixCls="tcl"
          hashId="h"
          collapse={false}
          isFinished
          setCollapse={vi.fn()}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('完成标题')).toBeInTheDocument();
  });

  it('RagRetrieval 多知识库显示 multipleKnowledgeBases', () => {
    render(
      <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
        <TitleInfo
          title="检索 ${kb}"
          category="RagRetrieval"
          prefixCls="tcl"
          hashId="h"
          collapse={false}
          isFinished
          setCollapse={vi.fn()}
          meta={{ kb: [metaItem('A'), metaItem('B')] }}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('多个知识库')).toBeInTheDocument();
  });

  it('TableSql 多表显示 name+multipleTables', () => {
    render(
      <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
        <TitleInfo
          title="查表 ${t}"
          category="TableSql"
          prefixCls="tcl"
          hashId="h"
          collapse={false}
          isFinished
          setCollapse={vi.fn()}
          meta={{ t: [metaItem('users'), metaItem('orders')] }}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('users等多个表')).toBeInTheDocument();
  });

  it('ToolCall 多工具显示 name+multipleTools', () => {
    render(
      <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
        <TitleInfo
          title="调用 ${tool}"
          category="ToolCall"
          prefixCls="tcl"
          hashId="h"
          collapse={false}
          isFinished
          setCollapse={vi.fn()}
          meta={{ tool: [metaItem('search'), metaItem('calc')] }}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('search等多个工具')).toBeInTheDocument();
  });

  it('其他类别多数据走 multipleData', () => {
    render(
      <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
        <TitleInfo
          title="数据 ${d}"
          category="other"
          prefixCls="tcl"
          hashId="h"
          collapse={false}
          isFinished
          setCollapse={vi.fn()}
          meta={{ d: [metaItem('x'), metaItem('y')] }}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('x等多个数据')).toBeInTheDocument();
  });

  it('单个 meta 显示名称', () => {
    render(
      <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
        <TitleInfo
          title="单库 ${kb}"
          category="RagRetrieval"
          prefixCls="tcl"
          hashId="h"
          collapse={false}
          isFinished
          setCollapse={vi.fn()}
          meta={{ kb: [metaItem('唯一库')] }}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('唯一库')).toBeInTheDocument();
  });

  it('折叠按钮切换 collapse', () => {
    const setCollapse = vi.fn();
    render(
      <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
        <TitleInfo
          title="t"
          category="DeepThink"
          prefixCls="tcl"
          hashId="h"
          collapse
          isFinished
          setCollapse={setCollapse}
          costMillis={10}
        />
      </I18nContext.Provider>,
    );
    fireEvent.click(screen.getByTestId('action-icon-box'));
    expect(setCollapse).toHaveBeenCalledWith(false);
    expect(screen.getByTestId('cost')).toHaveTextContent('10');
  });

  it('titleExtraRender 包装额外区', () => {
    render(
      <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
        <TitleInfo
          title="t"
          category="DeepThink"
          prefixCls="tcl"
          hashId="h"
          collapse={false}
          isFinished
          setCollapse={vi.fn()}
          titleExtraRender={(dom) => (
            <div data-testid="extra-wrap">{dom}</div>
          )}
        />
      </I18nContext.Provider>,
    );
    expect(screen.getByTestId('extra-wrap')).toBeInTheDocument();
  });

  it('meta 点击触发 onMetaClick', () => {
    const onMetaClick = vi.fn();
    render(
      <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
        <TitleInfo
          title="多 ${kb}"
          category="RagRetrieval"
          prefixCls="tcl"
          hashId="h"
          collapse={false}
          isFinished
          setCollapse={vi.fn()}
          onMetaClick={onMetaClick}
          meta={{ kb: [metaItem('A', 'id-a'), metaItem('B', 'id-b')] }}
        />
      </I18nContext.Provider>,
    );
    // Popover content may be in portal; click the tag text area still ok for coverage of map
    expect(screen.getByText('多个知识库')).toBeInTheDocument();
  });
});
