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

const defaultLocale = {
  deepThinkingInProgress: '正在深度思考中',
  taskExecutionFailed: '任务执行失败',
};

const renderWithI18n = (ui: React.ReactElement) => {
  return render(
    <I18nContext.Provider value={{ locale: defaultLocale } as any}>
      {ui}
    </I18nContext.Provider>,
  );
};

describe('DeepThink', () => {
  it('should show loading state when no output and not finished', () => {
    renderWithI18n(
      <DeepThink info="test" category="thinking" />,
    );
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByTestId('dot-loading')).toBeInTheDocument();
    expect(screen.getByText('正在深度思考中')).toBeInTheDocument();
  });

  it('should show output content when available', () => {
    renderWithI18n(
      <DeepThink
        info="test"
        category="thinking"
        output={{ data: '思考结果' }}
        isFinished={true}
      />,
    );
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
    expect(screen.getByText('思考结果')).toBeInTheDocument();
  });

  it('should show error message', () => {
    renderWithI18n(
      <DeepThink
        info="test"
        category="thinking"
        output={{ errorMsg: 'Think error' }}
        isFinished={true}
      />,
    );
    expect(screen.getByText('"Think error"')).toBeInTheDocument();
    expect(screen.getByText('任务执行失败')).toBeInTheDocument();
  });

  it('should show error from response.error', () => {
    renderWithI18n(
      <DeepThink
        info="test"
        category="thinking"
        output={{ response: { error: 'Response error' } }}
        isFinished={true}
      />,
    );
    expect(screen.getByText('"Response error"')).toBeInTheDocument();
  });

  it('should show error from response.errorMsg', () => {
    renderWithI18n(
      <DeepThink
        info="test"
        category="thinking"
        output={{ response: { errorMsg: 'Another error' } }}
        isFinished={true}
      />,
    );
    expect(screen.getByText('"Another error"')).toBeInTheDocument();
  });

  it('should not show loading when finished without output', () => {
    renderWithI18n(
      <DeepThink
        info="test"
        category="thinking"
        isFinished={true}
      />,
    );
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('should pass data-testid prop', () => {
    renderWithI18n(
      <DeepThink
        info="test"
        category="thinking"
        data-testid="deep-think-container"
      />,
    );
    expect(screen.getByTestId('deep-think-container')).toBeInTheDocument();
  });

  it('should render empty string when no output data', () => {
    renderWithI18n(
      <DeepThink
        info="test"
        category="thinking"
        output={{}}
        isFinished={true}
      />,
    );
    expect(screen.getByTestId('markdown-editor')).toBeInTheDocument();
  });
});
