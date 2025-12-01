/**
 * Chrome 开发插件集成演示
 * @description 展示 Bubble 组件与 Schema Editor Chrome 扩展的集成效果
 */
import React, { useState } from 'react';
import { Bubble, MessageBubbleData, BubbleMetaData } from '@ant-design/agentic-ui';
import { Card, Switch, Space, Typography, Alert, Tag } from 'antd';

const { Title, Text, Paragraph } = Typography;

/** AI 头像配置 */
const aiMeta: BubbleMetaData = {
  avatar:
    'https://mdn.alipayobjects.com/huamei_re70wt/afts/img/A*ed7ZTbwtgIQAAAAAQOAAAAgAemuEAQ/original',
  title: 'AI 助手',
};

/** 用户头像配置 */
const userMeta: BubbleMetaData = {
  avatar:
    'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
  title: '用户',
};

/** 示例消息 */
const messages: MessageBubbleData[] = [
  {
    id: 'chrome_ext_msg_1',
    role: 'assistant',
    originContent: `## 这是一条可编辑的消息

你可以使用 **Schema Editor** Chrome 扩展来编辑这段内容。

### 功能特点

1. 点击页面元素高亮可编辑区域
2. 在扩展面板中实时编辑
3. 修改会即时反映到页面上

\`\`\`typescript
// 示例代码
const greeting = "Hello, Schema Editor!";
console.log(greeting);
\`\`\`

| 功能 | 描述 | 状态 |
|------|------|------|
| 实时编辑 | 修改立即生效 | ✅ |
| Markdown 预览 | 支持完整语法 | ✅ |
| 多气泡支持 | 同时编辑多条消息 | ✅ |
`,
    createAt: Date.now(),
    updateAt: Date.now(),
  },
  {
    id: 'chrome_ext_msg_2',
    role: 'user',
    originContent: `这是用户发送的消息，也可以被编辑。

包含一些 **加粗** 和 *斜体* 文本。`,
    createAt: Date.now(),
    updateAt: Date.now(),
  },
  {
    id: 'chrome_ext_msg_3',
    role: 'assistant',
    originContent:
      '这是另一条 AI 回复，你可以通过 Schema Editor 插件来编辑它的内容。\n\n试着修改这段文字看看效果！',
    createAt: Date.now(),
    updateAt: Date.now(),
  },
];

const ChromeExtensionDemo: React.FC = () => {
  const [schemaEditorEnabled, setSchemaEditorEnabled] = useState(true);
  const [editLogs, setEditLogs] = useState<string[]>([]);

  /** 记录编辑日志 */
  const handleContentChange = (id: string) => (content: string) => {
    const time = new Date().toLocaleTimeString();
    const preview = content.slice(0, 50) + (content.length > 50 ? '...' : '');
    setEditLogs((prev) => [
      `[${time}] 消息 ${id} 已更新: "${preview}"`,
      ...prev.slice(0, 9),
    ]);
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <Title level={2}>🔌 Chrome 开发插件集成</Title>

      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
        message="重要提示"
        description={
          <div>
            <strong>必须传入 id 属性才能使用此功能！</strong>
            <br />
            Schema Editor 插件通过 <code>id</code> 属性来识别和定位可编辑元素。
          </div>
        }
      />

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
        message="使用说明"
        description={
          <div>
            <Paragraph style={{ marginBottom: 8 }}>
              1. 安装{' '}
              <a
                href="https://github.com/hei-f/schema-editor/releases/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Schema Editor Chrome 扩展
              </a>
            </Paragraph>
            <Paragraph style={{ marginBottom: 8 }}>
              2. 打开扩展，在页面上按住options/alt键点击气泡内容区域
            </Paragraph>
            <Paragraph style={{ marginBottom: 0 }}>
              3. 在扩展面板中编辑内容，修改会即时同步到页面
            </Paragraph>
          </div>
        }
      />

      <Card style={{ marginBottom: 24 }}>
        <Space align="center">
          <Text strong>Schema Editor 开关：</Text>
          <Switch
            checked={schemaEditorEnabled}
            onChange={setSchemaEditorEnabled}
            checkedChildren="启用"
            unCheckedChildren="禁用"
          />
          {schemaEditorEnabled ? (
            <Tag color="green">已启用 - 可通过插件编辑</Tag>
          ) : (
            <Tag color="default">已禁用</Tag>
          )}
        </Space>
      </Card>

      <Card title="💬 对话消息" style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          {messages.map((msg, index) => (
            <Bubble
              key={msg.id}
              id={msg.id}
              originData={msg}
              avatar={msg.role === 'assistant' ? aiMeta : userMeta}
              placement={msg.role === 'assistant' ? 'left' : 'right'}
              schemaEditorConfig={{
                enabled: schemaEditorEnabled,
                onContentChange: handleContentChange(msg.id),
              }}
              preMessage={index > 0 ? messages[index - 1] : undefined}
              pure
            />
          ))}
        </Space>
      </Card>

      {editLogs.length > 0 && (
        <Card title="📝 编辑日志" size="small" style={{ marginBottom: 24 }}>
          <div style={{ maxHeight: 200, overflow: 'auto' }}>
            {editLogs.map((log, i) => (
              <div
                key={i}
                style={{
                  padding: '4px 8px',
                  borderBottom: '1px solid #f0f0f0',
                  fontSize: 12,
                  fontFamily: 'monospace',
                  color: '#666',
                }}
              >
                {log}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ChromeExtensionDemo;

