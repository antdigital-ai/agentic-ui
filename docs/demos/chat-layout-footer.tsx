import { ChatLayout } from '@ant-design/agentic-ui';
import { Button, Segmented, Tag } from 'antd';
import React, { useState } from 'react';

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
        消息 {i + 1}
      </div>
    ))}
  </div>
);

const FooterApiDemo = () => {
  const [footerHeight, setFooterHeight] = useState<number>(60);
  const [showBg, setShowBg] = useState(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 1. footerHeight 控制底部最小高度 */}
      <div>
        <Tag color="blue" style={{ marginBottom: 8 }}>
          footerHeight — 底部区域最小高度
        </Tag>
        <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#666' }}>footerHeight:</span>
          <Segmented
            options={[48, 80, 120]}
            value={footerHeight}
            onChange={(v) => setFooterHeight(v as number)}
          />
          <span style={{ fontSize: 13, color: '#999' }}>当前: {footerHeight}px</span>
        </div>
        <div style={{ height: 320 }}>
          <ChatLayout
            header={{ title: '底部高度演示' }}
            footerHeight={footerHeight}
            footer={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  padding: 12,
                  background: '#fafafa',
                  borderTop: '1px solid #f0f0f0',
                  color: '#999',
                  fontSize: 13,
                }}
              >
                底部区域高度: {footerHeight}px
              </div>
            }
          >
            <MessageList count={4} />
          </ChatLayout>
        </div>
      </div>

      {/* 2. showFooterBackground — 底部渐变背景遮罩 */}
      <div>
        <Tag color="purple" style={{ marginBottom: 8 }}>
          showFooterBackground — 底部渐变背景
        </Tag>
        <div style={{ marginBottom: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#666' }}>showFooterBackground:</span>
          <Button
            size="small"
            type={showBg ? 'primary' : 'default'}
            onClick={() => setShowBg((v) => !v)}
          >
            {showBg ? '已开启（点击关闭）' : '已关闭（点击开启）'}
          </Button>
        </div>
        <div style={{ height: 320 }}>
          <ChatLayout
            header={{ title: '渐变背景演示' }}
            showFooterBackground={showBg}
            footer={
              <div
                style={{
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Button type="primary" style={{ width: '100%', maxWidth: 400 }}>
                  发送消息
                </Button>
              </div>
            }
          >
            <MessageList count={6} />
          </ChatLayout>
        </div>
      </div>

      {/* 3. 无 footer */}
      <div>
        <Tag color="green" style={{ marginBottom: 8 }}>
          不传 footer — 无底部区域
        </Tag>
        <div style={{ height: 200 }}>
          <ChatLayout header={{ title: '无底部区域' }}>
            <MessageList count={3} />
          </ChatLayout>
        </div>
      </div>
    </div>
  );
};

export default FooterApiDemo;
