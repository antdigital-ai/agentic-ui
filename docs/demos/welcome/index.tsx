import {
  GradientText,
  MarkdownInputField,
  WelcomeMessage,
} from '@ant-design/agentic-ui';
import { Space } from 'antd';
import React from 'react';
import { ChatContainer } from '../components/chat-container';
import { ComponentContainer } from '../components/componentContainer';
import { AgentarIcon } from './agentarIcon';

export default () => {
  return (
    <Space
      direction="vertical"
      size={24}
      style={{ width: '100%', paddingBlock: 40 }}
    >
      <ComponentContainer
        description="个性化问候信息+「品牌」+一句话说明 AI 能做什么，减轻陌生感"
        style={{ paddingInline: 40 }}
      >
        <ChatContainer>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 50,
              paddingTop: 60,
              paddingBottom: 70,
              paddingInline: 40,
            }}
          >
            <WelcomeMessage
              title={
                <>
                  欢迎使用
                  <div style={{ marginInline: 12 }}>
                    <AgentarIcon />
                  </div>
                </>
              }
              description="用一句话说明你能做什么，引导用户开始提问。"
            />
            <MarkdownInputField />
          </div>
        </ChatContainer>
      </ComponentContainer>

      <ComponentContainer
        description="提示用户系统的核心价值，通过问题引导用户在输入框中输入回答"
        style={{ paddingInline: 40 }}
      >
        <ChatContainer>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 50,
              paddingTop: 60,
              paddingBottom: 70,
              paddingInline: 40,
            }}
          >
            <WelcomeMessage
              title={
                <>
                  你想
                  <GradientText
                    colors={[
                      '#1D3052',
                      '#1D3052',
                      '#D3CEFF',
                      '#8D83FF',
                      '#1D3052',
                    ]}
                    animationSpeed={10}
                    style={{ marginInline: 12 }}
                  >
                    LUI Designer
                  </GradientText>
                  为你设计什么卡片？
                </>
              }
              description="用一句话说明你能做什么，引导用户开始提问。"
            />
            <MarkdownInputField />
          </div>
        </ChatContainer>
      </ComponentContainer>
    </Space>
  );
};
