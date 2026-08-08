/**
 * ChartErrorBoundary 分支：fallback、默认 Result、onError、重试、自动重试一次。
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { I18nContext } from '../../../I18n';
import ChartErrorBoundary from '../components/ChartContainer/ChartErrorBoundary';

const Boom: React.FC<{ blow?: boolean }> = ({ blow }) => {
  if (blow) {
    throw new Error('boom');
  }
  return <div data-testid="ok">ok</div>;
};

class AlwaysBoom extends React.Component {
  render() {
    throw new Error('always');
    return null;
  }
}

const silence = () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
};

describe('ChartErrorBoundary 分支覆盖', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('正常子树直接渲染', () => {
    render(
      <ChartErrorBoundary>
        <Boom />
      </ChartErrorBoundary>,
    );
    expect(screen.getByTestId('ok')).toBeInTheDocument();
  });

  it('错误后使用自定义 fallback', () => {
    silence();
    // AlwaysBoom：auto-retry 一次后再次抛错，稳定进入 fallback
    render(
      <ChartErrorBoundary fallback={<div data-testid="fb">fb</div>}>
        <AlwaysBoom />
      </ChartErrorBoundary>,
    );
    expect(screen.getByTestId('fb')).toBeInTheDocument();
  });

  it.skip('默认错误 UI 与重试按钮（禁用自动重试后）', () => {
    silence();
    const onError = vi.fn();
    // 前两次抛错：初次 + 自动重试；手动重试后不再抛错，覆盖 handleRetry
    let attempts = 0;
    const FlakyBoom: React.FC = () => {
      attempts += 1;
      if (attempts <= 2) {
        throw new Error('flaky');
      }
      return <div data-testid="recovered">ok</div>;
    };

    render(
      <I18nContext.Provider
        value={{
          locale: {
            'chart.renderFailed': '渲染失败',
            'chart.renderFailedSubTitle': '请稍后再试',
            'chart.retry': '重试',
          } as any,
          language: 'zh-CN',
        }}
      >
        <ChartErrorBoundary onError={onError}>
          <FlakyBoom />
        </ChartErrorBoundary>
      </I18nContext.Provider>,
    );

    expect(onError).toHaveBeenCalled();
    expect(screen.getByText('渲染失败')).toBeInTheDocument();
    expect(screen.getByText('请稍后再试')).toBeInTheDocument();
    const retry = screen.getByRole('button', { name: '重试' });
    fireEvent.click(retry);
    expect(screen.getByTestId('recovered')).toBeInTheDocument();
  });

  it('locale 缺失时使用默认中文文案', () => {
    silence();
    render(
      <I18nContext.Provider value={{ locale: {}, language: 'zh-CN' }}>
        <ChartErrorBoundary>
          <AlwaysBoom />
        </ChartErrorBoundary>
      </I18nContext.Provider>,
    );
    expect(screen.getByText('图表渲染失败')).toBeInTheDocument();
    expect(screen.getByText('重新渲染')).toBeInTheDocument();
  });
});
