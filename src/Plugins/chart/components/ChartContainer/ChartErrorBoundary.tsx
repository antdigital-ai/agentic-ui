import { Button, Result } from 'antd';
import React, { ErrorInfo, ReactNode } from 'react';
import { I18nContext } from '../../../../I18n';

export interface ChartErrorBoundaryProps {
  /** 子元素 */
  children: ReactNode;
  /** 错误时的回退UI */
  fallback?: ReactNode;
  /** 错误回调函数 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export interface ChartErrorBoundaryState {
  hasError: boolean;
  /** 用于重试时销毁并重建 children */
  retryKey: number;
}

/**
 * ChartErrorBoundary 组件 - 图表错误边界组件
 *
 * 该组件用于捕获图表组件渲染过程中的JavaScript错误，
 * 防止错误传播到整个应用程序，并提供友好的错误提示界面。
 *
 * @component
 * @description 图表错误边界组件，用于错误处理和恢复
 * @param {ChartErrorBoundaryProps} props - 组件属性
 * @param {ReactNode} props.children - 子元素
 * @param {ReactNode} [props.fallback] - 错误时的回退UI
 * @param {function} [props.onError] - 错误回调函数
 * @param {boolean} [props.showError=false] - 是否显示错误详情
 * @param {string} [props.className] - 自定义CSS类名
 *
 * @example
 * ```tsx
 * <ChartErrorBoundary
 *   fallback={<div>图表加载失败</div>}
 *   onError={(error, errorInfo) => console.error('Chart error:', error)}
 *   showError={process.env.NODE_ENV === 'development'}
 * >
 *   <MyChart />
 * </ChartErrorBoundary>
 * ```
 *
 * @returns {React.ReactElement} 渲染的错误边界组件
 */
class ChartErrorBoundary extends React.Component<
  ChartErrorBoundaryProps,
  ChartErrorBoundaryState
> {
  static contextType = I18nContext;
  declare context: React.ContextType<typeof I18nContext>;

  constructor(props: ChartErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryKey: 0,
    };
  }

  /** 重试：清除错误状态并递增 key，使 children 销毁后重建 */
  handleRetry = (): void => {
    this.setState((prev) => ({
      hasError: false,
      retryKey: prev.retryKey + 1,
    }));
  };

  static getDerivedStateFromError(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _error: Error,
  ): Partial<ChartErrorBoundaryState> {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 调用错误回调函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 在开发环境下打印错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error('ChartErrorBoundary caught an error:', error);
    }
  }

  render(): ReactNode {
    const { hasError } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // 如果有自定义的fallback，使用自定义的
      if (fallback) {
        return fallback;
      }

      // 使用 antd Result 组件的简洁错误 UI，带重试按钮
      const locale = this.context?.locale;
      return (
        <Result
          status="error"
          title={locale?.['chart.renderFailed'] || '图表渲染失败'}
          subTitle={
            locale?.['chart.renderFailedSubTitle'] ||
            '图表组件遇到了一个错误，请稍后重试'
          }
          extra={
            <Button type="primary" onClick={this.handleRetry}>
              {(locale as unknown as Record<string, string>)?.['chart.retry'] ||
                '重新渲染'}
            </Button>
          }
        />
      );
    }

    return (
      <React.Fragment key={this.state.retryKey}>{children}</React.Fragment>
    );
  }
}

export default ChartErrorBoundary;
