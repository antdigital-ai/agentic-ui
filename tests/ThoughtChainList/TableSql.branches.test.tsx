/**
 * TableSql 分支覆盖补充测试
 */
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../src/I18n';

// Mock copy-to-clipboard（源码实际引入路径）
const mockCopy = vi.fn();
vi.mock('copy-to-clipboard', () => ({
  default: (...args: any[]) => mockCopy(...args),
}));

// Mock MarkdownEditor，模拟 editorRef
const mockSetMDContent = vi.fn();
vi.mock('../../src/MarkdownEditor', () => ({
  MarkdownEditor: ({ initValue, editorRef, ...rest }: any) => {
    React.useEffect(() => {
      if (editorRef && typeof editorRef === 'object') {
        editorRef.current = {
          store: {
            setMDContent: mockSetMDContent,
            editor: {
              children: [{ text: 'SELECT 1' }],
            },
          },
        };
      }
    }, [editorRef]);
    return (
      <div data-testid="markdown-editor" data-value={initValue}>
        {initValue}
      </div>
    );
  },
  parserSlateNodeToMarkdown: vi.fn(
    () => '```sql\nSELECT 1\n```\n<!--{}-->\n',
  ),
}));

// Mock ActionIconBox 为可点击的简单按钮（直接 mock 组件路径）
vi.mock('../../src/Components/ActionIconBox', () => ({
  ActionIconBox: ({ onClick, title, children }: any) => (
    <button data-testid={`action-${title}`} onClick={onClick}>
      {children}
    </button>
  ),
}));

// Mock CostMillis
vi.mock('../../src/ThoughtChainList/CostMillis', () => ({
  CostMillis: ({ costMillis }: any) => (
    <span data-testid="cost">{costMillis}ms</span>
  ),
}));

// Mock icons
vi.mock('@ant-design/icons', async (importOriginal) => {
  const original: any = await importOriginal();
  return {
    ...original,
    CloseCircleFilled: () => <span data-testid="icon-close" />,
    EditOutlined: () => <span data-testid="icon-edit" />,
  };
});
vi.mock('@sofa-design/icons', async (importOriginal) => {
  const original: any = await importOriginal();
  return {
    ...original,
    Copy: () => <span data-testid="icon-copy" />,
  };
});

import { TableSql } from '../../src/ThoughtChainList/TableSql';

const locale = {
  executeSQL: '执行 SQL',
  executing: '执行中...',
  queryResults: '查询结果',
  queryFailed: '查询失败',
  copy: 'copy',
  edit: 'edit',
  cancel: 'cancel',
  retry: 'retry',
};

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nContext.Provider value={{ locale: locale as any, language: 'zh-CN' }}>
    {children}
  </I18nContext.Provider>
);

const baseProps = {
  'data-testid': 'table-sql',
  input: { sql: 'SELECT * FROM t' },
  output: {
    type: 'TABLE' as const,
    tableData: { id: [1, 2], name: ['a', 'b'] },
    columns: ['id', 'name'],
  },
  runId: 'run-1',
  isFinished: true,
  costMillis: 200,
};

describe('TableSql 分支覆盖', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ====== 编辑模式 ====== */

  describe('进入编辑模式并操作', () => {
    it('点击编辑按钮进入编辑模式，显示编辑器和取消/重试按钮', () => {
      const onItemChange = vi.fn();

      const { container } = render(
        <Wrapper>
          <TableSql {...baseProps} onItemChange={onItemChange} />
        </Wrapper>,
      );

      // 找到编辑按钮（ActionIconBox title="edit"）
      const editBtn = screen.getByTestId('action-edit');
      fireEvent.click(editBtn);

      // 进入编辑模式后应显示取消和重试按钮
      expect(screen.getByText('cancel')).toBeInTheDocument();
      expect(screen.getByText('retry')).toBeInTheDocument();
    });

    it('点击取消按钮退出编辑模式并重置内容', () => {
      const onItemChange = vi.fn();

      render(
        <Wrapper>
          <TableSql {...baseProps} onItemChange={onItemChange} />
        </Wrapper>,
      );

      // 进入编辑模式
      fireEvent.click(screen.getByTestId('action-edit'));
      expect(screen.getByText('cancel')).toBeInTheDocument();

      // 点击取消
      fireEvent.click(screen.getByText('cancel'));

      // 退出编辑模式后不再显示取消按钮
      expect(screen.queryByText('cancel')).not.toBeInTheDocument();
    });

    it('点击重试按钮，调用 onItemChange 回调', () => {
      const onItemChange = vi.fn();

      render(
        <Wrapper>
          <TableSql {...baseProps} onItemChange={onItemChange} />
        </Wrapper>,
      );

      // 进入编辑模式
      fireEvent.click(screen.getByTestId('action-edit'));

      // 点击重试
      fireEvent.click(screen.getByText('retry'));

      // onItemChange 应被调用
      expect(onItemChange).toHaveBeenCalledWith(
        expect.objectContaining({ runId: 'run-1' }),
        expect.objectContaining({
          feedbackType: 'sql',
          feedbackRunId: 'run-1',
        }),
      );
    });

    it('无 onItemChange 时回退调用 onChangeItem', () => {
      const onChangeItem = vi.fn();

      render(
        <Wrapper>
          <TableSql
            {...baseProps}
            onItemChange={undefined}
            onChangeItem={onChangeItem}
          />
        </Wrapper>,
      );

      // 进入编辑模式
      fireEvent.click(screen.getByTestId('action-edit'));

      // 点击重试
      fireEvent.click(screen.getByText('retry'));

      // onChangeItem 应被调用
      expect(onChangeItem).toHaveBeenCalledWith(
        expect.objectContaining({ runId: 'run-1' }),
        expect.objectContaining({
          feedbackType: 'sql',
          feedbackRunId: 'run-1',
        }),
      );
    });
  });

  /* ====== 复制 SQL ====== */

  describe('复制 SQL 查询', () => {
    it('点击 SQL 区域复制按钮调用 copy', () => {
      render(
        <Wrapper>
          <TableSql {...baseProps} onItemChange={vi.fn()} />
        </Wrapper>,
      );

      // SQL 区域的复制按钮（ActionIconBox title="copy"）
      const copyBtns = screen.getAllByTestId('action-copy');
      fireEvent.click(copyBtns[0]);

      expect(mockCopy).toHaveBeenCalledWith('SELECT * FROM t');
    });

    it('SQL 复制失败时 console.error 被调用', () => {
      mockCopy.mockImplementation(() => {
        throw new Error('fail');
      });
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <Wrapper>
          <TableSql {...baseProps} onItemChange={vi.fn()} />
        </Wrapper>,
      );

      const copyBtns = screen.getAllByTestId('action-copy');
      fireEvent.click(copyBtns[0]);

      expect(spy).toHaveBeenCalledWith('复制失败:', expect.any(Error));
      spy.mockRestore();
    });
  });

  /* ====== 复制查询结果 ====== */

  describe('复制查询结果', () => {
    it('点击查询结果区域复制按钮调用 copy + JSON.stringify', () => {
      render(
        <Wrapper>
          <TableSql {...baseProps} />
        </Wrapper>,
      );

      // 查询结果区域有单独的复制按钮（第二个 action-copy）
      const copyBtns = screen.getAllByTestId('action-copy');
      // 第一个是 SQL 复制，第二个是查询结果复制
      const resultCopyBtn = copyBtns[1];
      fireEvent.click(resultCopyBtn);

      expect(mockCopy).toHaveBeenCalledWith(
        JSON.stringify(baseProps.output.tableData, null, 2),
      );
    });

    it('查询结果复制失败时 console.error 被调用', () => {
      mockCopy.mockImplementation(() => {
        throw new Error('json fail');
      });
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <Wrapper>
          <TableSql {...baseProps} />
        </Wrapper>,
      );

      const copyBtns = screen.getAllByTestId('action-copy');
      fireEvent.click(copyBtns[1]);

      expect(spy).toHaveBeenCalledWith('复制失败:', expect.any(Error));
      spy.mockRestore();
    });
  });

  /* ====== 错误信息 ====== */

  describe('错误状态下复制', () => {
    const errorProps = {
      ...baseProps,
      isFinished: true,
      output: {
        type: 'ERROR' as const,
        errorMsg: 'Syntax error near SELECT',
        tableData: {},
      },
    };

    it('错误状态下点击复制按钮复制 errorMsg', () => {
      render(
        <Wrapper>
          <TableSql {...errorProps} />
        </Wrapper>,
      );

      const copyBtns = screen.getAllByTestId('action-copy');
      // 错误状态下：第一个是 SQL 复制，第二个是错误信息复制
      const errorCopyBtn = copyBtns[1];
      fireEvent.click(errorCopyBtn);

      expect(mockCopy).toHaveBeenCalledWith('Syntax error near SELECT');
    });

    it('错误信息复制失败时 console.error 被调用', () => {
      mockCopy.mockImplementation(() => {
        throw new Error('copy error');
      });
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <Wrapper>
          <TableSql {...errorProps} />
        </Wrapper>,
      );

      const copyBtns = screen.getAllByTestId('action-copy');
      fireEvent.click(copyBtns[1]);

      expect(spy).toHaveBeenCalledWith('复制失败:', expect.any(Error));
      spy.mockRestore();
    });

    it('output.response.errorMsg 也能正确显示', () => {
      render(
        <Wrapper>
          <TableSql
            {...baseProps}
            isFinished={true}
            output={{
              type: 'ERROR' as const,
              tableData: {},
              response: { errorMsg: 'response error' },
            }}
          />
        </Wrapper>,
      );

      expect(screen.getByText('response error')).toBeInTheDocument();
    });
  });
});
