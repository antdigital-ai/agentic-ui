import { Bubble } from '@ant-design/agentic-ui';
import {
  HeartOutlined,
  ShareAltOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { Button, Space, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import {
  createAssistantMessage,
  createUserMessage,
  PURE_TABLE_CONFIG,
} from './shared';

const mockMessages = [
  createAssistantMessage(
    '1',
    '你好！我是AI助手，请问有什么可以帮助你的吗？',
    { createAt: 1703123396789, updateAt: 1703123396789 },
  ),
  createUserMessage('2', '帮我写一首关于春天的诗', {
    createAt: 1703123426789,
    updateAt: 1703123426789,
  }),
  createAssistantMessage(
    '3',
    `# 春日吟

春风轻抚绿柳梢，  
花开满园香气飘。  
燕子归来筑新巢，  
万物复苏生机昭。

**春天的特色：**
- 🌸 樱花盛开
- 🌱 万物复苏  
- 🐦 鸟语花香
- ☀️ 阳光明媚

这首诗描绘了春天的美好景象，表达了对新生活的向往和希望。`,
    { createAt: 1703123456789, updateAt: 1703123456789 },
  ),
];

export default function ExtraRenderDemo() {
  const bubbleRef = useRef<any>();
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [customMode, setCustomMode] = useState<
    'default' | 'custom' | 'disabled'
  >('default');

  const handleLike = (messageId: string) => {
    setLikes((prev) => ({ ...prev, [messageId]: !prev[messageId] }));
  };

  const handleFavorite = (messageId: string) => {
    setFavorites((prev) => ({ ...prev, [messageId]: !prev[messageId] }));
  };

  const handleShare = (msg: any) => {
    navigator.clipboard.writeText(msg.content);
    alert('内容已复制到剪贴板！');
  };

  const customExtraRender = (props: any, defaultDom: React.ReactNode) => {
    const messageId = props.id;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 0',
          borderTop: '1px solid #f0f0f0',
          marginTop: 8,
        }}
      >
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<HeartOutlined />}
            style={{ color: likes[messageId] ? '#ff4d4f' : '#8c8c8c' }}
            onClick={() => handleLike(messageId)}
          >
            {likes[messageId] ? '已点赞' : '点赞'}
          </Button>

          <Button
            type="text"
            size="small"
            icon={<StarOutlined />}
            style={{ color: favorites[messageId] ? '#faad14' : '#8c8c8c' }}
            onClick={() => handleFavorite(messageId)}
          >
            {favorites[messageId] ? '已收藏' : '收藏'}
          </Button>

          <Button
            type="text"
            size="small"
            icon={<ShareAltOutlined />}
            onClick={() => handleShare(props.originData)}
          >
            分享
          </Button>
        </Space>

        <div style={{ marginLeft: 'auto' }}>{defaultDom}</div>

        <div style={{ display: 'flex', gap: 4 }}>
          {likes[messageId] && <Tag color="red">已点赞</Tag>}
          {favorites[messageId] && <Tag color="orange">已收藏</Tag>}
        </div>
      </div>
    );
  };

  const getBubbleRenderConfig = () => {
    switch (customMode) {
      case 'custom':
        return { extraRender: customExtraRender };
      case 'disabled':
        return { extraRender: false as const };
      default:
        return {};
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2>Bubble extraRender 自定义功能演示</h2>
        <p>
          此演示展示如何使用 <code>extraRender</code>{' '}
          功能自定义气泡消息的额外操作区域。
        </p>

        <Space style={{ marginBottom: 16 }}>
          <span>操作模式：</span>
          {(['default', 'custom', 'disabled'] as const).map((mode) => (
            <Button
              key={mode}
              type={customMode === mode ? 'primary' : 'default'}
              onClick={() => setCustomMode(mode)}
            >
              {mode === 'default'
                ? '默认模式'
                : mode === 'custom'
                  ? '自定义模式'
                  : '禁用额外操作'}
            </Button>
          ))}
        </Space>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {mockMessages.map((msg) => (
          <Bubble
            key={msg.id}
            avatar={msg.meta!}
            markdownRenderConfig={PURE_TABLE_CONFIG}
            originData={msg}
            placement={msg.role === 'user' ? 'right' : 'left'}
            bubbleRef={bubbleRef}
            pure
            bubbleRenderConfig={getBubbleRenderConfig()}
            onLike={async (data) => console.log('点赞:', data)}
            onDisLike={async (data) => console.log('点踩:', data)}
            onReply={(content) => console.log('回复:', content)}
          />
        ))}
      </div>
    </div>
  );
}
