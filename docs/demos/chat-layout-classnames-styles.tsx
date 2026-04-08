import { ChatLayout } from '@ant-design/agentic-ui';
import { Tag } from 'antd';
import React from 'react';

const MessageList = ({ count }: { count: number }) => (
  <div style={{ padding: 16 }}>
    {Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        style={{
          padding: '10px 14px',
          marginBottom: 8,
          background: i % 2 === 0 ? '#f0f5ff' : '#fff7e6',
          borderRadius: 8,
          fontSize: 14,
        }}
      >
        会话片段 {i + 1}（占位文案，便于观察 content 区背景与滚动）
      </div>
    ))}
  </div>
);

const ClassNamesStylesDemo = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    {/* styles 自定义各区域内联样式 */}
    <div>
      <Tag color="blue" style={{ marginBottom: 8 }}>
        styles — 自定义各区域内联样式
      </Tag>
      <div style={{ height: 300 }}>
        <ChatLayout
          header={{ title: '自定义 styles' }}
          styles={{
            root: { border: '2px solid #1677ff', borderRadius: 16 },
            content: { background: '#f6ffed' },
            scrollable: { padding: 8 },
            footer: { background: '#e6f4ff' },
          }}
          footer={
            <div
              style={{
                padding: 12,
                textAlign: 'center',
                fontSize: 13,
                color: '#1677ff',
              }}
            >
              通过 styles.footer 定制底部样式
            </div>
          }
        >
          <MessageList count={4} />
        </ChatLayout>
      </div>
    </div>

    {/* classNames 自定义各区域类名 */}
    <div>
      <Tag color="purple" style={{ marginBottom: 8 }}>
        classNames — 为各区域附加自定义类名
      </Tag>
      <style>{`
        .demo-root { box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .demo-content { background: linear-gradient(135deg, #fafafa 0%, #f0f5ff 100%); }
        .demo-footer { background: #fff7e6; border-top: 2px dashed #ffa940; }
      `}</style>
      <div style={{ height: 300 }}>
        <ChatLayout
          header={{ title: '自定义 classNames' }}
          classNames={{
            root: 'demo-root',
            content: 'demo-content',
            footer: 'demo-footer',
          }}
          footer={
            <div
              style={{
                padding: 12,
                textAlign: 'center',
                fontSize: 13,
                color: '#d46b08',
              }}
            >
              通过 classNames.footer 附加自定义类名
            </div>
          }
        >
          <MessageList count={4} />
        </ChatLayout>
      </div>
    </div>

    {/* className + style 根容器直接控制 */}
    <div>
      <Tag color="green" style={{ marginBottom: 8 }}>
        className + style — 根容器样式
      </Tag>
      <div style={{ height: 260 }}>
        <ChatLayout
          className="demo-root"
          style={{ border: '2px dashed #52c41a', borderRadius: 12 }}
          header={{ title: '根容器 className & style' }}
        >
          <MessageList count={3} />
        </ChatLayout>
      </div>
    </div>
  </div>
);

export default ClassNamesStylesDemo;
