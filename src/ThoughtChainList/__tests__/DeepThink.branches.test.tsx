/**
 * DeepThink 分支：loading / TOKEN 输出 / 错误消息多来源 / isFinished。
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../I18n';
import { DeepThink } from '../DeepThink';

vi.mock('../MarkdownEditor', () => ({
  MarkdownEditorUpdate: ({ initValue, typewriter, isFinished }: any) => (
    <div
      data-testid="md-update"
      data-typewriter={String(!!typewriter)}
      data-finished={String(!!isFinished)}
    >
      {initValue}
    </div>
  ),
}));

vi.mock('../DotAni', () => ({
  DotLoading: () => <span data-testid="dot">...</span>,
}));

vi.mock('../../Components/icons/LoadingSpinnerIcon', () => ({
  LoadingSpinnerIcon: () => <span data-testid="spinner" />,
}));

const locale = {
  deepThinkingInProgress: '正在深度思考中',
  taskExecutionFailed: '任务执行失败，需要修改',
};

const wrap = (ui: React.ReactElement) =>
  render(
    <I18nContext.Provider value={{ locale, language: 'zh-CN' }}>
      {ui}
    </I18nContext.Provider>,
  );

describe('DeepThink 分支覆盖', () => {
  it('无 output 且未完成时显示 loading', () => {
    wrap(<DeepThink info="思考" category="DeepThink" data-testid="dt" />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
    expect(screen.getByText('正在深度思考中')).toBeInTheDocument();
  });

  it('isFinished 且无 output 时不显示 loading', () => {
    wrap(
      <DeepThink
        info="思考"
        category="DeepThink"
        isFinished
        data-testid="dt"
      />,
    );
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
  });

  it('TOKEN 输出开启 typewriter', () => {
    wrap(
      <DeepThink
        info="思考"
        category="DeepThink"
        output={{ type: 'TOKEN', data: 'partial' }}
        data-testid="dt"
      />,
    );
    const md = screen.getByTestId('md-update');
    expect(md).toHaveAttribute('data-typewriter', 'true');
    expect(md).toHaveTextContent('partial');
  });

  it('非 TOKEN 输出关闭 typewriter 且 isFinished', () => {
    wrap(
      <DeepThink
        info="思考"
        category="DeepThink"
        output={{ type: 'END', data: 'final' }}
        data-testid="dt"
      />,
    );
    const md = screen.getByTestId('md-update');
    expect(md).toHaveAttribute('data-typewriter', 'false');
    expect(md).toHaveAttribute('data-finished', 'true');
  });

  it('output.errorMsg 优先展示错误', () => {
    wrap(
      <DeepThink
        info="思考"
        category="DeepThink"
        output={{ type: 'ERROR', errorMsg: 'top-error' }}
        data-testid="dt"
      />,
    );
    expect(screen.getByText(/任务执行失败/)).toBeInTheDocument();
    expect(screen.getByText(/"top-error"/)).toBeInTheDocument();
  });

  it('response.error 作为错误来源', () => {
    wrap(
      <DeepThink
        info="思考"
        category="DeepThink"
        output={{ response: { error: 'resp-error' } }}
        data-testid="dt"
      />,
    );
    expect(screen.getByText(/"resp-error"/)).toBeInTheDocument();
  });

  it('response.errorMsg 作为错误来源', () => {
    wrap(
      <DeepThink
        info="思考"
        category="DeepThink"
        output={{ response: { errorMsg: 'resp-msg' } }}
        data-testid="dt"
      />,
    );
    expect(screen.getByText(/"resp-msg"/)).toBeInTheDocument();
  });

  it('locale 缺失时使用默认 loading 文案', () => {
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
        <DeepThink info="思考" category="DeepThink" />
      </I18nContext.Provider>,
    );
    expect(screen.getByText('正在深度思考中')).toBeInTheDocument();
  });
});
