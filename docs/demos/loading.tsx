import {
  CreativeRecommendationLoading,
  CreativeSparkLoading,
  Loading,
} from '@ant-design/agentic-ui';
import React from 'react';

const DemoCard = ({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 120,
      }}
    >
      {children}
      {title && (
        <p
          style={{
            marginTop: 12,
            marginBottom: 2,
            fontSize: 12,
            color: '#666',
          }}
        >
          {title}
        </p>
      )}
      {description && (
        <p style={{ marginTop: 2, fontSize: 12, color: '#666' }}>
          {description}
        </p>
      )}
    </div>
  );
};

export default () => {
  const demoSizes = [32, 48, 64, 80];

  return (
    <div style={{ padding: 24 }}>
      <h3>基础用法</h3>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          marginBottom: 24,
        }}
      >
        <DemoCard title="基础用法">
          <Loading
            style={{
              fontSize: 64,
            }}
          />
        </DemoCard>
        <DemoCard title="在文本中使用">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 64,
            }}
          >
            <Loading />
            <span>加载中</span>
          </div>
        </DemoCard>
      </div>

      <h3 style={{ marginTop: 24 }}>不同动画类型</h3>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          marginBottom: 24,
        }}
      >
        <DemoCard title="loading" description="默认">
          <Loading size={48} />
        </DemoCard>
        <DemoCard title="spark" description="创意生成中火花">
          <CreativeSparkLoading size={48} />
        </DemoCard>
        <DemoCard title="recommendation" description="创意推荐闪动">
          <CreativeRecommendationLoading size={48} />
        </DemoCard>
      </div>

      <h3 style={{ marginTop: 24 }}>控制播放行为</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <DemoCard title="自动播放、循环">
          <Loading size={48} />
        </DemoCard>
        <DemoCard title="不循环">
          <Loading size={48} loop={false} />
        </DemoCard>
        <DemoCard title="不自动播放">
          <Loading size={48} autoplay={false} />
        </DemoCard>
      </div>

      <h3 style={{ marginTop: 24 }}>自定义尺寸</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {demoSizes.map((size) => (
          <DemoCard key={size} title={`${size}px`}>
            <Loading size={size} />
          </DemoCard>
        ))}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4>技术栈：</h4>
        <ul>
          <li>
            <strong>Framer Motion</strong>: 使用 motion.svg 和 motion.ellipse
            实现流畅的动画效果
          </li>
          <li>
            <strong>CSS-in-JS</strong>: 使用 Ant Design 的样式系统进行样式管理
          </li>
        </ul>
      </div>
    </div>
  );
};
