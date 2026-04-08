import { Bubble } from '@ant-design/agentic-ui';
import React from 'react';
import { createAssistantMessage, PURE_TABLE_CONFIG } from './shared';

const message = createAssistantMessage(
  'voice-1',
  Array(5)
    .fill(
      `这是一段用于演示语音播报功能的文本。您可以点击左侧的语音按钮开始播报，鼠标悬停时会暂时暂停并显示暂停图标，点击可停止播报。还可以通过右侧下拉框选择 1.5x、1.25x、1x 或 0.75x 的播放速度。`,
    )
    .join('\n    '),
);

export default () => (
  <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
    <Bubble
      originData={message}
      avatar={message.meta}
      placement="left"
      pure
      shouldShowVoice={true}
      markdownRenderConfig={PURE_TABLE_CONFIG}
    />

    <div
      style={{
        marginTop: 12,
        color: '#666',
        fontSize: 12,
        lineHeight: 1.6,
      }}
    >
      提示： 1）默认不显示播放图标，需要配置
      2）悬停出现浅背景与"语音播报"提示并临时暂停；
      3）播放中显示录音跳动图标；4）播放中悬停显示暂停图标，点击停止；
      5）可在右侧下拉选择倍速；6）选择后在按钮上显示当前倍速。
    </div>
  </div>
);
