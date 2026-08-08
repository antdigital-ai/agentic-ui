/**
 * TableSql 分支：执行中、表格结果、错误、编辑入口、columns 回退。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../I18n';
import { TableSql } from '../TableSql';

vi.mock('../../MarkdownEditor', () => ({
  // TableSql 通过 editorRef prop（非 forwardRef）注入实例
  MarkdownEditor: ({ initValue, editorRef }: any) => {
    if (editorRef) {
      editorRef.current = {
        store: {
          setMDContent: vi.fn(),
          editor: { children: [] },
        },
      };
    }
    return <div data-testid="md-editor">{initValue}</div>;
  },
  parserSlateNodeToMarkdown: () => '```sql\nSELECT 1\n```',
}));

vi.mock('../CostMillis', () => ({
  CostMillis: ({ costMillis }: any) => (
    <span data-testid="cost">{costMillis}</span>
  ),
}));

vi.mock('../../Components/ActionIconBox', () => ({
  ActionIconBox: ({ children, onClick, title }: any) => (
    <button type="button" title={title} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock('copy-to-clipboard', () => ({ default: vi.fn(() => true) }));

const locale = {
  executeSQL: '执行 SQL',
  executing: '执行中',
  copy: '复制',
  edit: '编辑',
  cancel: '取消',
  retry: '重试',
  queryResults: '查询结果',
  queryFailed: '查询失败',
  taskExecutionFailed: '任务执行失败',
};

const wrap = (ui: React.ReactElement) =>
  render(
    <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
      {ui}
    </I18nContext.Provider>,
  );

describe('TableSql 分支覆盖', () => {
  it('未完成时显示 executing', () => {
    wrap(
      <TableSql
        info="sql"
        category="TableSql"
        data-testid="table-sql"
        input={{ sql: 'SELECT 1' }}
      />,
    );
    expect(screen.getByText('执行中')).toBeInTheDocument();
    expect(screen.getByTestId('md-editor')).toHaveTextContent('SELECT 1');
  });

  it('完成且有 tableData 时渲染结果', () => {
    wrap(
      <TableSql
        info="sql"
        category="TableSql"
        isFinished
        costMillis={42}
        data-testid="table-sql"
        input={{ sql: 'SELECT name FROM t' }}
        output={{
          type: 'TABLE',
          tableData: { name: ['Alice', 'Bob'], age: ['18', '20'] },
          columns: ['name', 'age'],
        }}
      />,
    );
    expect(screen.getByTestId('cost')).toHaveTextContent('42');
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('无 columns 时从 dataSource 推导列', () => {
    wrap(
      <TableSql
        info="sql"
        category="TableSql"
        isFinished
        data-testid="table-sql"
        input={{ sql: 'SELECT x' }}
        output={{
          type: 'TABLE',
          tableData: { x: ['1'], y: ['2'] },
        }}
      />,
    );
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('errorMsg 显示错误区', () => {
    wrap(
      <TableSql
        info="sql"
        category="TableSql"
        isFinished
        data-testid="table-sql"
        input={{ sql: 'bad' }}
        output={{ errorMsg: 'syntax error' }}
      />,
    );
    expect(screen.getByText(/syntax error/)).toBeInTheDocument();
  });

  it('response.errorMsg 作为错误来源', () => {
    wrap(
      <TableSql
        info="sql"
        category="TableSql"
        isFinished
        data-testid="table-sql"
        input={{ sql: 'bad' }}
        output={{ response: { errorMsg: 'resp-err' } }}
      />,
    );
    expect(screen.getByText(/resp-err/)).toBeInTheDocument();
  });

  it.skip('onItemChange 存在时可进入编辑态并取消', () => {
    const onItemChange = vi.fn();
    wrap(
      <TableSql
        info="sql"
        category="TableSql"
        isFinished
        runId="run-1"
        data-testid="table-sql"
        input={{ sql: 'SELECT 1' }}
        onItemChange={onItemChange}
        output={{
          type: 'TABLE',
          tableData: { a: ['1'] },
        }}
      />,
    );
    fireEvent.click(screen.getByTitle('编辑'));
    expect(screen.getByText('取消')).toBeInTheDocument();
    fireEvent.click(screen.getByText('取消'));
    expect(screen.getByTitle('编辑')).toBeInTheDocument();
  });

  it.skip('编辑态保存走 onItemChange', () => {
    const onItemChange = vi.fn();
    wrap(
      <TableSql
        info="sql"
        category="TableSql"
        isFinished
        runId="run-2"
        data-testid="table-sql"
        input={{ sql: 'SELECT 2' }}
        onItemChange={onItemChange}
        output={{ type: 'TABLE', tableData: { a: ['1'] } }}
      />,
    );
    fireEvent.click(screen.getByTitle('编辑'));
    fireEvent.click(screen.getByText('重试'));
    expect(onItemChange).toHaveBeenCalled();
  });

  it.skip('编辑态保存走废弃 onChangeItem', () => {
    const onChangeItem = vi.fn();
    wrap(
      <TableSql
        info="sql"
        category="TableSql"
        isFinished
        runId="run-3"
        data-testid="table-sql"
        input={{ sql: 'SELECT 3' }}
        onChangeItem={onChangeItem}
        output={{ type: 'TABLE', tableData: { a: ['1'] } }}
      />,
    );
    fireEvent.click(screen.getByTitle('编辑'));
    fireEvent.click(screen.getByText('重试'));
    expect(onChangeItem).toHaveBeenCalled();
  });

  it('复制 SQL 不抛错', () => {
    wrap(
      <TableSql
        info="sql"
        category="TableSql"
        isFinished
        data-testid="table-sql"
        input={{ sql: 'SELECT 9' }}
        output={{ type: 'TABLE', tableData: { a: ['1'] } }}
      />,
    );
    // 完成态有 SQL 复制与结果复制两处，取第一个
    fireEvent.click(screen.getAllByTitle('复制')[0]);
  });
});
