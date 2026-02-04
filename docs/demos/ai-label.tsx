import { AILabel } from '@ant-design/agentic-ui';
import { Space } from 'antd';
import React from 'react';
import { ChatContainer } from './components/chat-container';
import { ComponentContainer } from './components/componentContainer';
import Skeleton from './components/skeleton';

export default () => {
  return (
    <Space
      direction="vertical"
      size={24}
      style={{ width: '100%', padding: 24 }}
    >
      <ComponentContainer description="不需要强调AI 能力，出于合规性考虑需要标识ai内容，可以使用水印型标签">
        <ChatContainer>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              width: '100%',
              paddingBlock: 16,
              paddingInline: 40,
            }}
          >
            <Skeleton />
            <Skeleton width={120} />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                color: '#343A45',
                fontSize: 15,
                fontWeight: 600,
                lineHeight: '24px',
              }}
            >
              理赔建议
              <div
                style={{
                  color: '#3D3D3D',
                  fontSize: 13,
                  fontWeight: 'normal',
                  lineHeight: '180%',
                  letterSpacing: 0,
                }}
              >
                经核实，您的理赔申请符合保障范围，建议提供事故现场照片及相关证明文件，加快审核流程。为保障信息安全，本文含水印标签，仅供参考。
                <AILabel status="watermark" offset={[0, -8]} />
              </div>
            </div>
          </div>
        </ChatContainer>
      </ComponentContainer>
      <ComponentContainer description="hover在标签上时给予提示">
        <ChatContainer>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
              width: '100%',
              paddingBlock: 16,
              paddingInline: 40,
            }}
          >
            <Skeleton />
            <Skeleton width={120} />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                color: '#343A45',
                fontSize: 15,
                fontWeight: 600,
                lineHeight: '24px',
              }}
            >
              理赔建议
              <div
                style={{
                  color: '#3D3D3D',
                  fontSize: 13,
                  fontWeight: 'normal',
                  lineHeight: '180%',
                  letterSpacing: 0,
                }}
              >
                经核实，您的理赔申请符合保障范围，建议提供事故现场照片及相关证明文件，加快审核流程。为保障信息安全，本文含水印标签，仅供参考。
                <AILabel
                  status="emphasis"
                  offset={[0, -8]}
                  tooltip={{
                    title: '此内容由AI辅助生成，仅供参考，不作为最终理赔依据。',
                  }}
                />
              </div>
            </div>
          </div>
        </ChatContainer>
      </ComponentContainer>
    </Space>
  );
};
