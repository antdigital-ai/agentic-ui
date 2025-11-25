import { Bubble, MessageBubbleData } from '@ant-design/agentic-ui';
import { Card, Divider, Typography } from 'antd';
import React from 'react';

const { Title, Paragraph } = Typography;

// 模拟消息数据
const messages: MessageBubbleData[] = [
  {
    id: '1',
    role: 'user',
    content: '你好，我想了解一下你们的产品功能',
    createAt: Date.now() - 60000,
    updateAt: Date.now() - 60000,
  },
  {
    id: '2',
    role: 'user',
    content: '能详细介绍一下吗？',
    createAt: Date.now() - 50000,
    updateAt: Date.now() - 50000,
  },
  {
    id: '3',
    role: 'assistant',
    content:
      '当然可以！我们的产品具有以下核心功能：\n\n1. **智能对话**：支持自然语言交互\n2. **多模态支持**：文本、图片、文件等多种输入\n3. **实时协作**：多人同时编辑和讨论\n4. **版本控制**：完整的修改历史记录',
    createAt: Date.now() - 40000,
    updateAt: Date.now() - 40000,
  },
  {
    id: '4',
    role: 'assistant',
    content:
      '此外，我们还提供：\n\n- 🚀 **高性能**：支持大规模并发访问\n- 🔒 **安全可靠**：企业级安全保障\n- 🎨 **高度定制**：灵活的界面和功能定制\n- 📱 **多端同步**：桌面端、移动端无缝切换',
    createAt: Date.now() - 30000,
    updateAt: Date.now() - 30000,
  },
  {
    id: '5',
    role: 'user',
    content: '听起来很不错！价格怎么样？',
    createAt: Date.now() - 20000,
    updateAt: Date.now() - 20000,
  },
  {
    id: '6',
    role: 'user',
    content: '有免费试用吗？',
    createAt: Date.now() - 10000,
    updateAt: Date.now() - 10000,
  },
];

const PreMessageSameRoleDemo: React.FC = () => {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Title level={2}>消息连续性优化 (preMessageSameRole)</Title>

      <Paragraph>
        当连续的消息来自同一角色时，组件会自动隐藏重复的头像和标题信息，
        让对话更加简洁流畅。这个功能特别适合长对话场景。
      </Paragraph>

      <Card title="功能演示" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 第一条用户消息 - 显示头像和标题 */}
          <Bubble
            originData={messages[0]}
            avatar={{ name: '用户', avatar: '👤' }}
            placement="right"
            pure
          />

          {/* 第二条用户消息 - 隐藏头像和标题（preMessageSameRole 生效） */}
          <Bubble
            originData={messages[1]}
            avatar={{ name: '用户', avatar: '👤' }}
            placement="right"
            preMessage={messages[0]}
            pure
          />

          {/* 第一条助手消息 - 显示头像和标题 */}
          <Bubble
            originData={messages[2]}
            avatar={{ name: 'AI助手', avatar: '🤖' }}
            placement="left"
            pure
          />

          {/* 第二条助手消息 - 隐藏头像和标题（preMessageSameRole 生效） */}
          <Bubble
            originData={messages[3]}
            avatar={{ name: 'AI助手', avatar: '🤖' }}
            placement="left"
            preMessage={messages[2]}
            pure
          />

          {/* 第三条用户消息 - 显示头像和标题（角色切换） */}
          <Bubble
            originData={messages[4]}
            avatar={{ name: '用户', avatar: '👤' }}
            placement="right"
            preMessage={messages[3]}
            pure
          />

          {/* 第四条用户消息 - 隐藏头像和标题（preMessageSameRole 生效） */}
          <Bubble
            originData={messages[5]}
            avatar={{ name: '用户', avatar: '👤' }}
            placement="right"
            preMessage={messages[4]}
            pure
          />
        </div>
      </Card>

      <Divider />

      <Card title="功能说明">
        <Title level={4}>工作原理</Title>
        <Paragraph>组件会自动比较当前消息与前一条消息的角色：</Paragraph>
        <ul>
          <li>如果角色相同，隐藏头像和标题区域</li>
          <li>如果角色不同，显示完整的头像和标题信息</li>
          <li>右侧布局（用户消息）始终隐藏头像和标题</li>
        </ul>

        <Title level={4}>使用方式</Title>
        <Paragraph>
          只需要在 Bubble 组件中传入 <code>preMessage</code> 属性即可：
        </Paragraph>
        <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
          {`<Bubble
  originData={currentMessage}
  preMessage={previousMessage} // 传入前一条消息
  avatar={{ name: '用户', avatar: '👤' }}
  placement="right"
/>`}
        </pre>

        <Title level={4}>边界情况</Title>
        <Paragraph>组件智能处理各种边界情况：</Paragraph>
        <ul>
          <li>
            当 <code>preMessage</code> 为 <code>undefined</code>{' '}
            时，始终显示头像和标题
          </li>
          <li>
            当角色为 <code>undefined</code> 时，两个 <code>undefined</code>{' '}
            视为相同角色
          </li>
          <li>
            右侧布局（<code>placement="right"</code>
            ）始终隐藏头像和标题，不受此功能影响
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default PreMessageSameRoleDemo;
