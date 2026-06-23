import {
  BubbleList,
  BubbleMetaData,
  type BubbleProps,
  MessageBubbleData,
} from '@ant-design/agentic-ui';
import { PlusOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { BubbleDemoCard } from './BubbleDemoCard';

function isSessionNoticeRole(
  role: MessageBubbleData['role'] | undefined,
): boolean {
  return role === 'sessionNotice';
}

const createChatMessage = (
  id: string,
  role: 'user' | 'assistant' | 'sessionNotice',
  content: string,
): MessageBubbleData => {
  const base: MessageBubbleData = {
    id,
    role,
    content,
    createAt: Date.now(),
    updateAt: Date.now(),
    isFinished: true,
  };
  if (role === 'assistant' || role === 'user') {
    base.meta = {
      avatar:
        role === 'assistant'
          ? 'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original'
          : 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
      title: role === 'assistant' ? 'AI助手' : '用户',
    } as BubbleMetaData;
  }
  return base;
};

const initialMessages: MessageBubbleData[] = [
  createChatMessage('1', 'assistant', '你好，需要我帮什么？'),
  createChatMessage(
    'notice-1',
    'sessionNotice',
    '以下为会话内居中提示示例（可含 @助理 等文案）',
  ),
  createChatMessage('2', 'user', '继续提问'),
];

export default () => {
  const bubbleListRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<any>();
  const [bubbleList, setBubbleList] =
    useState<MessageBubbleData[]>(initialMessages);

  const bubbleRenderConfig = useMemo(
    () => ({
      titleRender: (props: BubbleProps, defaultDom: React.ReactNode) => {
        if (isSessionNoticeRole(props.originData?.role)) return null;
        return defaultDom;
      },
      avatarRender: (props: BubbleProps, defaultDom: React.ReactNode) => {
        if (isSessionNoticeRole(props.originData?.role)) return null;
        return defaultDom;
      },
      extraRender: (props: BubbleProps, defaultDom: React.ReactNode) => {
        if (isSessionNoticeRole(props.originData?.role)) return null;
        return defaultDom;
      },
      contentRender: (props: BubbleProps, defaultContent: React.ReactNode) => {
        if (!isSessionNoticeRole(props.originData?.role)) {
          return defaultContent;
        }
        const text = String(props.originData?.content ?? '');
        return (
          <div
            data-testid="bubblelist-session-notice-content-wrap"
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '4px 0',
              userSelect: 'none',
              width: '100%',
            }}
          >
            <div
              data-testid="bubblelist-session-notice-pill"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '5px 14px',
                borderRadius: 999,
                fontSize: 12,
                lineHeight: 1.5,
                color: 'rgba(0,0,0,0.45)',
                maxWidth: 'min(560px, 100%)',
                textAlign: 'center',
                border:
                  '1px dashed var(--color-gray-border-light, rgba(0, 0, 0, 0.15))',
                background: 'var(--color-gray-bg-page, rgba(0, 0, 0, 0.04))',
              }}
            >
              {text}
            </div>
          </div>
        );
      },
    }),
    [],
  );

  const assistantMeta: BubbleMetaData = {
    avatar:
      'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
    title: 'AI助手',
  };

  const userMeta: BubbleMetaData = {
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
    title: '用户',
  };

  const addNotice = useCallback(() => {
    const id = `notice-${Date.now()}`;
    setBubbleList((prev) => [
      ...prev,
      createChatMessage(
        id,
        'sessionNotice',
        `插入一条居中提示（${new Date().toLocaleTimeString()}）`,
      ),
    ]);
    message.success('已插入 sessionNotice');
  }, []);

  return (
    <BubbleDemoCard
      title="sessionNotice 会话居中提示"
      description="role 为 sessionNotice 时，通过 bubbleRenderConfig 隐藏头像/标题/footer 并自定义居中内容"
    >
      <div
        data-testid="bubblelist-session-notice-demo-toolbar"
        style={{ padding: 24, paddingBottom: 16 }}
      >
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={addNotice}
          data-testid="bubblelist-session-notice-demo-add"
        >
          插入居中提示
        </Button>
      </div>

      <div data-testid="bubblelist-session-notice-demo-list-wrap">
        <BubbleList
          markdownRenderConfig={{
            tableConfig: {
              pure: true,
            },
          }}
          pure
          bubbleList={bubbleList}
          bubbleListRef={bubbleListRef}
          bubbleRef={bubbleRef}
          bubbleRenderConfig={bubbleRenderConfig}
          assistantMeta={assistantMeta}
          userMeta={userMeta}
          style={{
            height: 400,
            overflow: 'auto',
            borderRadius: '20px',
          }}
        />
      </div>

      <div
        style={{
          padding: 16,
          background: '#f6ffed',
          borderRadius: 8,
          fontSize: 14,
        }}
      >
        <strong>说明：</strong>
        <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
          <li>
            <code>sessionNotice</code> 为 <code>MessageBubbleData.role</code>{' '}
            的合法取值，用于时间轴类说明
          </li>
          <li>
            典型宿主可在此基础上加 <code>@</code> 高亮等；本 demo 用虚线边框 +
            圆角居中展示
          </li>
        </ul>
      </div>
    </BubbleDemoCard>
  );
};
