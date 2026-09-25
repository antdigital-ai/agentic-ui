/**
 * ToolCall 分支：loading、错误、输入参数展示、编辑模式入口。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../I18n';
import { ToolCall } from '../ToolCall';

vi.mock('../../MarkdownEditor', () => ({
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
  parserSlateNodeToMarkdown: () => 'md',
}));

vi.mock('../DotAni', () => ({
  DotLoading: () => <span data-testid="dot">...</span>,
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
  apiCalling: '正在调用 API',
  taskExecutionFailed: '任务执行失败',
  inputParameters: '输入参数',
  outputResults: '输出结果',
  copy: '复制',
  edit: '编辑',
  cancel: '取消',
  save: '保存',
};

const wrap = (ui: React.ReactElement) =>
  render(
    <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
      {ui}
    </I18nContext.Provider>,
  );

describe('ToolCall 分支覆盖', () => {
  it('无 output 未完成显示 loading', () => {
    wrap(
      <ToolCall
        info="调用"
        category="ToolCall"
        data-testid="tc"
        input={{ inputArgs: { requestBody: { a: 1 } } }}
      />,
    );
    expect(screen.getByTestId('dot')).toBeInTheDocument();
  });

  it('isFinished 无 output 不显示 loading', () => {
    wrap(
      <ToolCall
        info="调用"
        category="ToolCall"
        isFinished
        data-testid="tc"
        input={{ inputArgs: { requestBody: { a: 1 } } }}
      />,
    );
    expect(screen.queryByTestId('dot')).not.toBeInTheDocument();
  });

  it('成功输出展示 response 与耗时', () => {
    wrap(
      <ToolCall
        info="调用"
        category="ToolCall"
        isFinished
        costMillis={88}
        data-testid="tc"
        input={{
          inputArgs: {
            requestBody: { q: 1 },
            parameters: { id: 'x' },
            params: { page: 1 },
          },
        }}
        output={{ type: 'END', response: { ok: true } }}
      />,
    );
    expect(screen.getByTestId('cost')).toHaveTextContent('88');
  });

  it('output.errorMsg 显示错误', () => {
    wrap(
      <ToolCall
        info="调用"
        category="ToolCall"
        isFinished
        data-testid="tc"
        output={{ errorMsg: 'tool-fail' }}
      />,
    );
    // ToolCall 直接渲染 errorMsg，不用 JSON.stringify
    expect(screen.getByText('tool-fail')).toBeInTheDocument();
  });

  it('response.error 作为错误来源', () => {
    wrap(
      <ToolCall
        info="调用"
        category="ToolCall"
        isFinished
        data-testid="tc"
        output={{ response: { error: 'r-err' } }}
      />,
    );
    expect(screen.getByText('r-err')).toBeInTheDocument();
  });

  it('response.errorMsg 作为错误来源', () => {
    wrap(
      <ToolCall
        info="调用"
        category="ToolCall"
        isFinished
        data-testid="tc"
        output={{ response: { errorMsg: 'r-msg' } }}
      />,
    );
    expect(screen.getByText('r-msg')).toBeInTheDocument();
  });

  it.skip('点击编辑进入编辑态', () => {
    wrap(
      <ToolCall
        info="调用"
        category="ToolCall"
        isFinished
        data-testid="tc"
        input={{ inputArgs: { requestBody: { a: 1 } } }}
        output={{ type: 'END', response: { ok: 1 } }}
        onItemChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTitle('编辑'));
    expect(screen.getByTestId('md-editor')).toBeInTheDocument();
    expect(screen.getByText('取消')).toBeInTheDocument();
  });
});
