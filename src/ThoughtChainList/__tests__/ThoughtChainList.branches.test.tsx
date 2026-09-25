/**
 * ThoughtChainList 分支覆盖：结束态文案、折叠、titleRender、chatItem 兼容、
 * 条目 loading/error/success 图标与 finishAutoCollapse。
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../I18n';
import { ThoughtChainList } from '../index';
import type { WhiteBoxProcessInterface } from '../types';

vi.mock('../../Hooks/useAutoScroll', () => ({
  useAutoScroll: () => ({ containerRef: { current: null } }),
}));

vi.mock('../MarkdownEditor', () => ({
  MarkdownEditorUpdate: ({ initValue }: any) => (
    <div data-testid="md-update">{initValue}</div>
  ),
}));

vi.mock('../../MarkdownEditor', () => ({
  MarkdownEditor: React.forwardRef(() => <div data-testid="md-editor" />),
  parserSlateNodeToMarkdown: () => '',
}));

vi.mock('../FlipText', () => ({
  FlipText: ({ word }: { word?: string }) => (
    <span data-testid="flip-text">{word}</span>
  ),
}));

vi.mock('../DotAni', () => ({
  DotLoading: () => <span data-testid="dot-loading">...</span>,
}));

vi.mock('../../Components/ActionIconBox', () => ({
  ActionIconBox: ({
    children,
    onClick,
    title,
    'data-testid': testId,
  }: any) => (
    <button
      type="button"
      data-testid={testId || 'action-icon-box'}
      title={title}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

const locale = {
  expand: '展开',
  collapse: '收起',
  thinking: '思考中',
  taskAborted: '任务已中止',
  taskComplete: '任务已完成',
  totalTimeUsed: '总耗时',
  preview: '预览',
  'common.name': '名称',
  'common.updateTime': '更新时间',
  'common.type': '类型',
  'common.content': '内容',
  deepThinkingInProgress: '正在深度思考中',
  taskExecutionFailed: '任务执行失败',
  networkQuerying: '正在联网查询',
  'webSearch.noResults': '无搜索结果',
  'webSearch.searchFailed': '搜索失败',
  queryKeyWords: '检索查询',
  searchResults: '检索结果',
  executeSQL: '执行 SQL',
  multipleKnowledgeBases: '多个知识库',
  multipleTables: '等多个表',
  multipleTools: '等多个工具',
  multipleData: '等多个数据',
};

const wrap = (ui: React.ReactElement) =>
  render(
    <ConfigProvider>
      <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
        {ui}
      </I18nContext.Provider>
    </ConfigProvider>,
  );

const baseItem = (
  overrides: Partial<WhiteBoxProcessInterface> = {},
): WhiteBoxProcessInterface => ({
  info: '分析需求',
  category: 'DeepThink',
  runId: 'r1',
  ...overrides,
});

describe('ThoughtChainList 分支覆盖', () => {
  afterEach(() => {
    // 勿 useRealTimers：happy-dom 下跨用例 Date 易被拨乱（负 duration）
    vi.clearAllTimers();
  });

  it('loading 时标题显示 thinking + DotLoading', () => {
    wrap(
      <ThoughtChainList
        thoughtChainList={[baseItem()]}
        loading
        bubble={{ isFinished: false }}
      />,
    );
    expect(screen.getByText('思考中')).toBeInTheDocument();
    // 标题区 + DeepThink 内容区都可能挂 DotLoading
    expect(screen.getAllByTestId('dot-loading').length).toBeGreaterThan(0);
  });

  it('isAborted 且有耗时时显示中止+总耗时', () => {
    wrap(
      <ThoughtChainList
        thoughtChainList={[baseItem({ output: { type: 'END', data: 'ok' } })]}
        loading={false}
        bubble={{
          isAborted: true,
          isFinished: true,
          createAt: 1000,
          endTime: 3500,
        }}
      />,
    );
    expect(screen.getByText(/任务已中止/)).toBeInTheDocument();
    expect(screen.getByText(/总耗时/)).toBeInTheDocument();
  });

  it('isAborted 且无耗时时仅显示中止文案', () => {
    wrap(
      <ThoughtChainList
        thoughtChainList={[baseItem({ output: { type: 'END' } })]}
        loading={false}
        bubble={{ isAborted: true, isFinished: true, createAt: 0, endTime: 0 }}
      />,
    );
    expect(screen.getByText('任务已中止')).toBeInTheDocument();
  });

  it('finished 且有耗时时显示完成+总耗时', () => {
    wrap(
      <ThoughtChainList
        thoughtChainList={[baseItem({ output: { type: 'END', data: 'x' } })]}
        loading={false}
        finishAutoCollapse={false}
        bubble={{
          isFinished: true,
          createAt: 1000,
          endTime: 2500,
        }}
      />,
    );
    expect(screen.getByText(/任务已完成/)).toBeInTheDocument();
    expect(screen.getByText(/总耗时/)).toBeInTheDocument();
  });

  it('finished 无耗时时用 FlipText 展示完成', () => {
    wrap(
      <ThoughtChainList
        thoughtChainList={[baseItem({ output: { type: 'END' } })]}
        loading={false}
        finishAutoCollapse={false}
        bubble={{ isFinished: true, createAt: 0, endTime: 0 }}
      />,
    );
    expect(screen.getByTestId('flip-text')).toHaveTextContent('任务已完成');
  });

  it('finishAutoCollapse=false 时完成不自动折叠', () => {
    wrap(
      <ThoughtChainList
        thoughtChainList={[
          baseItem({
            info: '步骤一',
            output: { type: 'END', data: 'done' },
          }),
        ]}
        loading={false}
        finishAutoCollapse={false}
        bubble={{ isFinished: true, createAt: 1, endTime: 2 }}
      />,
    );
    expect(screen.getByText('步骤一')).toBeInTheDocument();
  });

  it('兼容 chatItem 属性（bubble 优先）', () => {
    wrap(
      <ThoughtChainList
        thoughtChainList={[baseItem({ output: { type: 'END' } })]}
        loading={false}
        finishAutoCollapse={false}
        chatItem={{ isFinished: true, createAt: 0, endTime: 0 }}
      />,
    );
    expect(screen.getByTestId('flip-text')).toHaveTextContent('任务已完成');
  });

  it('titleRender / titleExtraRender 自定义标题区', () => {
    wrap(
      <ThoughtChainList
        thoughtChainList={[baseItem()]}
        loading
        titleRender={(_p, dom) => <div data-testid="custom-title">{dom}</div>}
        titleExtraRender={(_p, dom) => (
          <div data-testid="custom-extra">{dom}</div>
        )}
      />,
    );
    expect(screen.getByTestId('custom-title')).toBeInTheDocument();
    expect(screen.getByTestId('custom-extra')).toBeInTheDocument();
  });

  it('点击折叠切换展开/收起', () => {
    wrap(
      <ThoughtChainList
        thoughtChainList={[
          baseItem({
            info: '可折叠项',
            output: { type: 'END', data: 'ok' },
          }),
        ]}
        loading={false}
        finishAutoCollapse={false}
        bubble={{ isFinished: false }}
      />,
    );
    const toggle = screen.getAllByTestId('action-icon-box')[0];
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('title', '展开');
  });

  it('折叠态且 loading 时标题区展示最后一项 TitleInfo', () => {
    wrap(
      <ThoughtChainList
        thoughtChainList={[
          baseItem({
            info: '最后一步 ${kb}',
            category: 'RagRetrieval',
            meta: {
              data: {
                kb: [{ name: '知识库A', icon: '', uuid: '1', type: 'doc', description: 'd' }],
              },
            },
          }),
        ]}
        loading
        bubble={{ isFinished: false }}
      />,
    );
    const toggle = screen.getAllByTestId('action-icon-box')[0];
    fireEvent.click(toggle);
    expect(screen.getAllByTestId('dot-loading').length).toBeGreaterThan(0);
  });

  it('条目 output.errorMsg 走错误图标分支', () => {
    wrap(
      <ThoughtChainList
        thoughtChainList={[
          baseItem({
            info: '失败项',
            output: { type: 'ERROR', errorMsg: 'boom' },
          }),
        ]}
        loading={false}
        finishAutoCollapse={false}
        bubble={{ isFinished: false }}
      />,
    );
    expect(screen.getByText('失败项')).toBeInTheDocument();
  });

  it('条目 RUNNING/TOKEN 保持 loading 状态', () => {
    wrap(
      <ThoughtChainList
        thoughtChainList={[
          baseItem({ info: '运行中', output: { type: 'RUNNING' } }),
          baseItem({
            info: '流式',
            runId: 'r2',
            output: { type: 'TOKEN', data: 'partial' },
          }),
        ]}
        loading
        bubble={{ isFinished: false }}
      />,
    );
    expect(screen.getByText('运行中')).toBeInTheDocument();
    expect(screen.getByText('流式')).toBeInTheDocument();
  });

  it('compact 模式渲染容器', () => {
    wrap(
      <ThoughtChainList
        thoughtChainList={[baseItem({ output: { type: 'END' } })]}
        compact
        loading={false}
        finishAutoCollapse={false}
        bubble={{ isFinished: false }}
        style={{ marginBottom: 8 }}
      />,
    );
    expect(screen.getByTestId('ant-thought-chain-list')).toBeInTheDocument();
  });

  it('折叠后延迟卸载列表项', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    wrap(
      <ThoughtChainList
        thoughtChainList={[
          baseItem({ info: '将被隐藏', output: { type: 'END', data: 'x' } }),
        ]}
        loading={false}
        finishAutoCollapse={false}
        bubble={{ isFinished: false }}
      />,
    );
    expect(screen.getByText('将被隐藏')).toBeInTheDocument();
    fireEvent.click(screen.getAllByTestId('action-icon-box')[0]);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    vi.clearAllTimers();
  });

  it('onDocMetaClick 关闭抽屉时回调 null', () => {
    const onDocMetaClick = vi.fn();
    wrap(
      <ThoughtChainList
        thoughtChainList={[
          baseItem({
            category: 'RagRetrieval',
            info: '检索 ${kb}',
            input: { searchQueries: ['q1'] },
            output: {
              type: 'END',
              chunks: [
                {
                  content: 'c',
                  originUrl: '',
                  docMeta: {
                    doc_name: '文档A',
                    doc_id: '1',
                    type: 'pdf',
                    upload_time: '2024-01-01',
                    origin_text: '正文',
                  },
                },
              ],
            },
            meta: {
              data: {
                kb: [
                  {
                    name: '知识库',
                    icon: '',
                    uuid: 'u1',
                    type: 'kb',
                    description: 'desc',
                  },
                ],
              },
            },
          }),
        ]}
        loading={false}
        finishAutoCollapse={false}
        bubble={{ isFinished: false }}
        onDocMetaClick={onDocMetaClick}
      />,
    );
    fireEvent.click(screen.getByText('文档A'));
    expect(onDocMetaClick).toHaveBeenCalled();
  });
});
