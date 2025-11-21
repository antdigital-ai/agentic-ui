import { Button, Result } from 'antd';
import React from 'react';
import ChartContainer from './ChartContainer';

// 模拟一个会出错的图表组件
const ErrorChart: React.FC = () => {
  throw new Error('模拟图表渲染错误');
  return <div>这个组件永远不会渲染</div>;
};

// 正常的图表组件
const NormalChart: React.FC = () => {
  return (
    <div
      style={{
        height: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div>正常的图表内容</div>
    </div>
  );
};

/**
 * 错误边界使用示例 - 使用 antd Result 组件的简洁版本
 */
export const ChartErrorBoundaryExample: React.FC = () => {
  return (
    <div style={{ padding: '12px' }}>
      <h2>图表错误边界示例（antd Result 简洁版）</h2>

      {/* 基础错误边界使用 - 使用 antd Result 组件 */}
      <div style={{ marginBottom: '32px' }}>
        <h3>1. 基础错误边界（antd Result 组件）</h3>
        <ChartContainer baseClassName="error-demo-chart">
          <ErrorChart />
        </ChartContainer>
      </div>

      {/* 自定义错误UI */}
      <div style={{ marginBottom: '32px' }}>
        <h3>2. 自定义错误UI</h3>
        <ChartContainer
          baseClassName="custom-error-chart"
          errorBoundary={{
            enabled: true,
            fallback: (
              <Result
                status="warning"
                title="自定义错误提示"
                subTitle="这是一个自定义的错误界面"
                extra={<Button type="primary">返回</Button>}
              />
            ),
            onError: (error: Error, errorInfo: React.ErrorInfo) => {
              console.error('自定义错误处理:', error, errorInfo);
            },
          }}
        >
          <ErrorChart />
        </ChartContainer>
      </div>

      {/* 显示错误详情 */}
      <div style={{ marginBottom: '32px' }}>
        <h3>3. 显示错误详情（开发模式）</h3>
        <ChartContainer
          baseClassName="debug-error-chart"
          errorBoundary={{
            enabled: true,
            onError: (error: Error, errorInfo: React.ErrorInfo) => {
              console.error('调试模式错误:', error, errorInfo);
            },
          }}
        >
          <ErrorChart />
        </ChartContainer>
      </div>

      {/* 正常图表 */}
      <div style={{ marginBottom: '32px' }}>
        <h3>4. 正常工作的图表</h3>
        <ChartContainer baseClassName="normal-chart">
          <NormalChart />
        </ChartContainer>
      </div>

      {/* 禁用错误边界的说明 */}
      <div style={{ marginBottom: '32px' }}>
        <h3>5. 禁用错误边界</h3>
        <p style={{ color: '#ff4d4f', fontSize: '14px', marginBottom: '16px' }}>
          注意：禁用错误边界可能导致整个应用崩溃，一般不推荐
        </p>
        <ChartContainer
          baseClassName="no-boundary-chart"
          errorBoundary={{ enabled: false }}
        >
          <NormalChart />
        </ChartContainer>
      </div>
    </div>
  );
};

export default ChartErrorBoundaryExample;
