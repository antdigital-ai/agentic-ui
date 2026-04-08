import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../src/I18n';
import { DeepThink } from '../../src/ThoughtChainList/DeepThink';

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
  deepThinkingInProgress: '正在深度思考中',
  taskExecutionFailed: '任务执行失败',
};

const wrap = (ui: React.ReactElement) =>
  render(
    <I18nContext.Provider value={{ locale } as any}>
      {ui}
    </I18nContext.Provider>,
  );

describe('DeepThink', () => {
  it('should show loading when no output and not finished', () => {
    wrap(<DeepThink info="q" category="thinking" />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByText('正在深度思考中')).toBeInTheDocument();
  });

  it('should show output content via MarkdownEditor', () => {
    wrap(
      <DeepThink
        info="q"
        category="thinking"
        output={{ data: '结果' }}
        isFinished
      />,
    );
    expect(screen.getByText('结果')).toBeInTheDocument();
  });

  it('should show error from errorMsg/response.error/response.errorMsg', () => {
    wrap(
      <DeepThink
        info="q"
        category="thinking"
        output={{ errorMsg: 'Fail' }}
        isFinished
      />,
    );
    expect(screen.getByText('"Fail"')).toBeInTheDocument();
    expect(screen.getByText('任务执行失败')).toBeInTheDocument();
  });

  it('should not show loading when finished', () => {
    wrap(<DeepThink info="q" category="thinking" isFinished />);
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('should pass data-testid prop', () => {
    wrap(
      <DeepThink info="q" category="thinking" data-testid="deep-think" />,
    );
    expect(screen.getByTestId('deep-think')).toBeInTheDocument();
  });
});
