import { AnswerAlert, Bubble, MessageBubbleData } from '@ant-design/agentic-ui';
import React from 'react';

// Mock data for the demo
const mockMessage: MessageBubbleData = {
  id: '1',
  role: 'assistant',
  content: `本 Demo 展示 **AnswerAlert** 与 **Bubble** 组合：上方为助手气泡正文，下方为结果提示条。

- **状态**：成功 / 警告 / 错误 等如何与对话内容并存
- **交互**：关闭、跳转等由业务自行绑定

以下为气泡内 Markdown 占位，可替换为你的真实回复。`,
  createAt: Date.now() - 60000, // 1分钟前
  updateAt: Date.now() - 60000,
  isFinished: true,
  extra: {
    duration: 1200, // 生成耗时
    model: 'gpt-4',
    tokens: 150,
  },
  meta: {
    avatar:
      'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
    title: '示例助手',
    description: 'AI 助手',
  },
};

const AnsweringIndicatorDemo = () => {
  return (
    <div
      style={{
        padding: 24,
      }}
    >
      <Bubble
        pure
        avatar={mockMessage.meta}
        placement="left"
        markdownRenderConfig={{
          tableConfig: {
            pure: true,
          },
        }}
        bubbleRenderConfig={{
          extraRender(props, defaultDoms) {
            return (
              <>
                <AnswerAlert
                  message="LUI chat 已完成当前任务"
                  type="success"
                  showIcon
                  style={{
                    width: 'fit-content',
                    marginLeft: 'var(--padding-5x)',
                    marginBottom: 4,
                  }}
                />
                {defaultDoms}
              </>
            );
          },
        }}
        originData={mockMessage}
      />
    </div>
  );
};

export default AnsweringIndicatorDemo;
