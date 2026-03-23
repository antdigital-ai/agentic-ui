import { ChartStatistic } from '@ant-design/agentic-ui';
import { InfoCircleFilled } from '@ant-design/icons';
import { Card, Divider } from 'antd';
import React from 'react';

const ChartStatisticDemo: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '24px', color: '#333' }}>
        ChartStatistic 指标卡组件示例
      </h2>

      {/* 基础使用 */}
      <div style={{ marginBottom: '32px' }}>
        <h3>基础使用</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Card variant="borderless">
            <ChartStatistic
              title="总销售额"
              subtitle="2026-03-17"
              value={1234567.89}
              precision={2}
              prefix="¥"
            />
          </Card>
          <Card variant="borderless">
            <ChartStatistic title="用户数量" value={8520} suffix="人" />
          </Card>
          <Card variant="borderless">
            <ChartStatistic
              title="转化率"
              value={15.67}
              suffix="%"
              precision={2}
            />
          </Card>
        </div>
      </div>

      {/* 不同尺寸 */}
      <div style={{ marginBottom: '32px' }}>
        <h3>不同尺寸</h3>
        <div
          style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          <ChartStatistic
            title="小尺寸"
            value={1234}
            suffix="次"
            size="small"
          />
          <ChartStatistic
            title="默认尺寸"
            value={5678}
            suffix="次"
            size="default"
          />
          <ChartStatistic
            title="大尺寸"
            value={9999}
            suffix="次"
            size="large"
          />
        </div>
      </div>

      {/* Block 模式和自定义格式化 */}
      <div style={{ marginBottom: '32px' }}>
        <h3>Block 模式和自定义格式化</h3>
        <div
          style={{
            display: 'flex',
            gap: '16px',
            padding: '16px',
            borderRadius: '8px',
            background:
              'linear-gradient(0deg, #FDFEFF, #FDFEFF), linear-gradient(270deg, #F6F5FF 0%, #FFFFFF 31%)',
            boxShadow:
              '0px 1px 1px 0px rgba(9, 30, 66, 0.02),0px 0px 1px 0px rgba(9, 30, 66, 0.14)',
            marginBottom: '16px',
          }}
        >
          <ChartStatistic
            title="总收入"
            value={1234567}
            prefix="¥"
            precision={2}
            block
          />
          <ChartStatistic title="总订单" value={8520} suffix="单" block />
          <ChartStatistic
            title="完成率"
            value={92.5}
            suffix="%"
            precision={1}
            block
          />
        </div>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <ChartStatistic
            title="大数值简化"
            value={2500000}
            formatter={(value) => {
              if (typeof value === 'number' && value > 1000000) {
                return `${(value / 1000000).toFixed(1)}M`;
              }
              return value;
            }}
          />
          <ChartStatistic
            title="自定义样式"
            value={85}
            formatter={(value) => (
              <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                {value}% ✓
              </span>
            )}
          />
        </div>
      </div>

      {/* 右上角自定义内容 */}
      <div style={{ marginBottom: '32px' }}>
        <h3>右上角自定义内容</h3>
        <div
          style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'space-between',
            padding: '16px',
            borderRadius: '8px',
            background:
              'linear-gradient(0deg, #FDFEFF, #FDFEFF), linear-gradient(270deg, #F6F5FF 0%, #FFFFFF 31%)',
            boxShadow:
              '0px 1px 1px 0px rgba(9, 30, 66, 0.02),0px 0px 1px 0px rgba(9, 30, 66, 0.14)',
            marginBottom: '16px',
          }}
        >
          <ChartStatistic
            title="总应用数"
            value={380}
            block
            tooltip="总应用数tips"
            extra={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: '#8590A2',
                }}
              >
                <InfoCircleFilled style={{ color: '#8590A2' }} />
                数据截止昨日
              </div>
            }
          />
          <Divider
            type="vertical"
            style={{ height: '64px', color: 'rgba(9, 30, 66, 0.06)' }}
          />
          <ChartStatistic
            title="已发布应用数"
            value={726}
            suffix="个"
            block
            tooltip="已发布应用数tips"
            extra={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: '#8590A2',
                }}
              >
                <InfoCircleFilled style={{ color: '#8590A2' }} />
                数据截止昨日
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ChartStatisticDemo;
