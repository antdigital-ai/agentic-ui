import type { AttachmentFile } from '@ant-design/agentic-ui';
import { Alert, Segmented, Space, Tag, Typography } from 'antd';
import React, { useState } from 'react';
import { ChatComposerForImeDemo } from './_ChatComposerForImeDemo';
import { inputMinStyle, pageStyle } from './_constants';

const { Text, Title, Paragraph } = Typography;

type TriggerKey = 'Enter' | 'Mod+Enter';

type SentRecord = {
  text: string;
  fileCount: number;
};

export default () => {
  const [triggerSendKey, setTriggerSendKey] = useState<TriggerKey>('Enter');
  const [sentList, setSentList] = useState<SentRecord[]>([]);

  return (
    <div style={pageStyle}>
      <Title level={5} style={{ marginTop: 0, marginBottom: 4 }}>
        中文输入法 + Chat 输入框封装
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        对齐业务侧 <Text code>ChatInputField</Text> 形态：
        <Text code>actionsRender</Text> 注入 @ / 、浮动面板、附件、
        <Text code>inputRef</Text> 与 sessionStorage 草稿。用于验证 IME
        Enter 确认选字不会误发送。
      </Text>

      <Alert
        type="info"
        showIcon
        message="建议操作步骤"
        description={
          <ol style={{ margin: '8px 0 0', paddingLeft: 20 }}>
            <li>用中文输入法输入拼音，按 Enter 确认候选（不应发送）</li>
            <li>输入 <Text code>@</Text> 或点 @ 按钮，选助理后继续中文输入</li>
            <li>输入 <Text code>/</Text> 选 skill 后继续中文输入</li>
            <li>完整句子后按发送快捷键；刷新页面应恢复未发送草稿</li>
            <li>
              IME 组合期间会隐藏 <Text code>/</Text>、<Text code>@</Text>{' '}
              浮动面板；用 Enter 确认候选（如 rest）时不应发送
            </li>
          </ol>
        }
        style={{ marginBottom: 12 }}
      />

      <Space wrap style={{ marginBottom: 12 }}>
        <Text>发送快捷键</Text>
        <Segmented<TriggerKey>
          value={triggerSendKey}
          onChange={setTriggerSendKey}
          options={[
            { label: 'Enter 发送', value: 'Enter' },
            { label: 'Mod+Enter 发送', value: 'Mod+Enter' },
          ]}
        />
      </Space>

      <ChatComposerForImeDemo
        triggerSendKey={triggerSendKey}
        style={inputMinStyle}
        placeholder={
          triggerSendKey === 'Enter'
            ? 'Enter 发送 · Shift+Enter 换行 · @ / 与附件同 ChatInputField'
            : 'Mod+Enter 发送 · Enter 换行'
        }
        onSent={(text, files?: AttachmentFile[]) => {
          setSentList((prev) => [
            ...prev,
            { text, fileCount: files?.length ?? 0 },
          ]);
        }}
      />

      <div style={{ marginTop: 16 }}>
        <Text strong>已发送记录</Text>
        {sentList.length === 0 ? (
          <Paragraph type="secondary" style={{ margin: '8px 0 0' }}>
            尚未发送。IME 确认选字或选 @ / 时不应出现新记录。
          </Paragraph>
        ) : (
          <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
            {sentList.map((item, index) => (
              <li key={`${index}-${item.text.slice(0, 8)}`}>
                <Text>{item.text}</Text>
                {item.fileCount > 0 ? (
                  <Tag style={{ marginLeft: 8 }}>{item.fileCount} 个附件</Tag>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
