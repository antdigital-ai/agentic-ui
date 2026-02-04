import {
  CreativeRecommendationLoading,
  CreativeSparkLoading,
  Loading,
} from '@ant-design/agentic-ui';
import { Button, Space } from 'antd';
import React from 'react';
import { ChatContainer } from '../components/chat-container';
import { ComponentContainer } from '../components/componentContainer';
import { FailIcon } from './FailIcon';

const Title = ({
  index,
  children,
}: {
  index?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        width: 'max-content',
        padding: '8px 12px',
        zIndex: 5,
        borderRadius: '12px',
        background: '#ffffff',
        boxShadow:
          '0px 0px 1px 0px rgba(10, 48, 104, 0.15), 0px 1.5px 4px -1px rgba(10, 48, 104, 0.04)',
      }}
    >
      {index && (
        <span
          style={{
            fontFamily: 'Rubik',
            fontSize: 13,
            fontWeight: 500,
            lineHeight: '13px',
            letterSpacing: '0.04em',
            color: '#343A45',
          }}
        >
          {index}
        </span>
      )}
      {children}
    </div>
  );
};

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
  return (
    <Space
      direction="vertical"
      size={16}
      style={{ width: '100%', padding: 24, paddingTop: 0 }}
    >
      <h3>基本用法</h3>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          width: '100%',
        }}
      >
        <Loading size={16} />
        <Loading tip="生成中…" indicator={<CreativeSparkLoading />} size={20} />
        <Loading percent={52} size={16} />
      </div>

      <h3 style={{ marginTop: 24 }}>自定义动画类型</h3>
      <div
        style={{
          display: 'flex',
          gap: 8,
          width: '100%',
          paddingBlock: 16,
          marginInline: -24,
        }}
      >
        <DemoCard title="loading" description="默认">
          <Loading size={42} />
        </DemoCard>
        <DemoCard title="spark" description="创意生成中火花">
          <Loading indicator={<CreativeSparkLoading />} size={42} />
        </DemoCard>
        <DemoCard title="recommendation" description="创意推荐闪动">
          <Loading indicator={<CreativeRecommendationLoading />} size={42} />
        </DemoCard>
      </div>

      <h3 style={{ marginTop: 24 }}>自定义大小</h3>
      <div
        style={{
          display: 'flex',
          gap: 83,
          alignItems: 'center',
          width: '100%',
          paddingBlock: 16,
          paddingInline: 12,
        }}
      >
        <Loading size={60} />
        <Loading size={42} />
        <Loading size={24} />
      </div>

      <h3 style={{ marginTop: 24 }}>卡片加载</h3>
      <ComponentContainer
        description="卡片加载"
        containerStyle={{ padding: 0, background: 'transparent' }}
      >
        <ChatContainer>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              width: '100%',
              paddingBlock: 16,
              paddingInline: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <img
                src="https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original"
                alt="avatar"
                width={20}
                height={20}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: 'var(--color-gray-text-default)',
                  font: 'var(--font-text-h6-base)',
                  letterSpacing: 'var(--letter-spacing-h6-base, normal)',
                }}
              >
                <span>LUI Chat</span>
                <Loading indicator={<CreativeSparkLoading />} size={16} />
              </div>
            </div>
            <div
              style={{
                color: 'rgba(0, 1, 3, 0.88)',
                font: 'var(--font-text-paragraph-lg)',
                letterSpacing: 'var(--letter-spacing-paragraph-lg, normal)',
              }}
            >
              通过对过去一年的销售数据分析，我们发现整体销售额呈现稳步增长趋势，尤其是在第四季度表现突出。促销活动对提升销量有显著效果，客户复购率较去年提高了15%。但部分地区仍存在销售下滑，需要进一步调研其原因并制定针对性的市场策略。
            </div>
            <Loading
              tip="生成中…"
              indicator={<CreativeSparkLoading />}
              size={32}
            >
              <div style={{ height: 224 }} />
            </Loading>
          </div>
        </ChatContainer>
      </ComponentContainer>

      <ComponentContainer
        description="服务卡片整块加载等待动画"
        containerStyle={{ padding: 0, background: 'transparent' }}
      >
        <ChatContainer>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              width: '100%',
              paddingBlock: 16,
              paddingInline: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                flex: 1,
              }}
            >
              <Title index="01.">通用</Title>
              <Loading
                tip="生成中…"
                indicator={<CreativeSparkLoading />}
                size={32}
              >
                <div style={{ height: 224 }} />
              </Loading>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                flex: 1,
              }}
            >
              <Title index="02.">带进度</Title>
              <Loading size={28} percent={60}>
                <div style={{ height: 224 }} />
              </Loading>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                flex: 1,
              }}
            >
              <Title index="03.">加载失败</Title>
              <Loading
                tip={
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div
                      style={{
                        color: 'rgba(84, 93, 109, 0.8)',
                        fontFamily: 'PingFang SC',
                        fontSize: 15,
                        fontWeight: 500,
                        lineHeight: '100%',
                        letterSpacing: '0.04em',
                      }}
                    >
                      卡片加载失败
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        color: 'rgba(80, 92, 113, 0.47)',
                        fontFamily: 'PingFang SC',
                        fontSize: 13,
                        fontWeight: 'normal',
                        lineHeight: '18px',
                        letterSpacing: 'normal',
                      }}
                    >
                      接口获取数据为空，请检查入参后重试
                    </div>
                    <Button style={{ marginTop: 12 }}>重新生成</Button>
                  </div>
                }
                indicator={<FailIcon />}
                size={64}
                styles={{
                  root: {
                    background: '#F8F9FA',
                  },
                }}
              >
                <div style={{ height: 224 }} />
              </Loading>
            </div>
          </div>
        </ChatContainer>
      </ComponentContainer>
    </Space>
  );
};
