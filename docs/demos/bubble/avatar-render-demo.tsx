import type { BubbleProps } from '@ant-design/agentic-ui';
import { Bubble } from '@ant-design/agentic-ui';
import { CrownOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Badge, Button, Space, Tooltip } from 'antd';
import React, { useRef, useState } from 'react';
import { BubbleDemoCard } from './BubbleDemoCard';
import { createAssistantMessage, createUserMessage } from './shared';

const LEVEL_MAP: Record<string, { color: string; icon: string; label: string }> = {
  expert: { color: '#ff4d4f', icon: '👑', label: '专家' },
  senior: { color: '#fa8c16', icon: '⭐', label: '高级' },
  intermediate: { color: '#52c41a', icon: '🔰', label: '中级' },
  beginner: { color: '#1890ff', icon: '🌱', label: '初级' },
};

const mockMessages = [
  createAssistantMessage(
    '1',
    `# avatarRender 自定义头像渲染演示

avatarRender 允许你完全自定义消息气泡的头像区域，可以：
- 🟢 **在线状态**：显示用户的在线/离线状态
- 👤 **角色标识**：区分用户和AI助手的角色
- 🏆 **等级标识**：显示用户等级和权限`,
    {
      createAt: Date.now() - 120000,
      updateAt: Date.now() - 120000,
      extra: { isOnline: true, userLevel: 'expert', isVip: true },
    },
  ),
  createUserMessage(
    '2',
    '请帮我分析这段代码的性能问题，并提供优化建议。',
    {
      createAt: Date.now() - 60000,
      updateAt: Date.now() - 60000,
      extra: { isOnline: true, userLevel: 'senior', isVip: false },
    },
  ),
  createAssistantMessage(
    '3',
    `## 性能分析报告

### 优化建议
\`\`\`typescript
const OptimizedComponent = React.memo(({ data }) => {
  return <div>{data.title}</div>;
});
\`\`\``,
    {
      createAt: Date.now() - 10000,
      updateAt: Date.now() - 10000,
      extra: { isOnline: true, userLevel: 'expert', isVip: true },
    },
  ),
];

type AvatarStyle = 'default' | 'status' | 'role' | 'enhanced';

const AVATAR_STYLE_LABELS: Record<AvatarStyle, { label: string; desc: string }> = {
  default: { label: '默认样式', desc: '使用默认头像渲染' },
  status: { label: '在线状态', desc: '显示在线/离线状态指示器' },
  role: { label: '角色标识', desc: '显示用户和AI助手的角色标识' },
  enhanced: { label: '增强样式', desc: '显示完整信息（状态、角色、等级、VIP标识）' },
};

const RoleIcon: React.FC<{ isAssistant: boolean }> = ({ isAssistant }) =>
  isAssistant ? <RobotOutlined /> : <UserOutlined />;

export default () => {
  const bubbleRef = useRef<any>();
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>('default');

  const createBaseAvatar = (props: BubbleProps, borderColor: string) => (
    <Avatar
      size={40}
      src={props.originData?.meta?.avatar}
      icon={<RoleIcon isAssistant={props.originData?.role === 'assistant'} />}
      style={{ border: `2px solid ${borderColor}`, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
    />
  );

  const defaultAvatarRender = (props: BubbleProps) => (
    <Avatar
      size={40}
      src={props.originData?.meta?.avatar}
      icon={<RoleIcon isAssistant={props.originData?.role === 'assistant'} />}
    />
  );

  const statusAvatarRender = (props: BubbleProps) => {
    const isOnline = props.originData?.extra?.isOnline ?? true;
    return (
      <div style={{ position: 'relative' }}>
        <Badge dot color={isOnline ? '#52c41a' : '#d9d9d9'} offset={[-8, 8]}>
          {createBaseAvatar(props, isOnline ? '#52c41a' : '#d9d9d9')}
        </Badge>
        <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: isOnline ? '#52c41a' : '#999', whiteSpace: 'nowrap' }}>
          {isOnline ? '在线' : '离线'}
        </div>
      </div>
    );
  };

  const roleAvatarRender = (props: BubbleProps) => {
    const isAssistant = props.originData?.role === 'assistant';
    const color = isAssistant ? '#1890ff' : '#52c41a';
    return (
      <div style={{ position: 'relative' }}>
        {createBaseAvatar(props, color)}
        <div style={{ position: 'absolute', bottom: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: 'white', border: '2px solid white' }}>
          {isAssistant ? '🤖' : '👤'}
        </div>
        <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color, whiteSpace: 'nowrap', fontWeight: 500 }}>
          {isAssistant ? 'AI助手' : '用户'}
        </div>
      </div>
    );
  };

  const enhancedAvatarRender = (props: BubbleProps) => {
    const { originData } = props;
    const isAssistant = originData?.role === 'assistant';
    const isOnline = originData?.extra?.isOnline ?? true;
    const userLevel = originData?.extra?.userLevel;
    const isVip = originData?.extra?.isVip;
    const levelInfo = LEVEL_MAP[userLevel] || null;
    const roleColor = isAssistant ? '#1890ff' : '#52c41a';

    return (
      <div style={{ position: 'relative' }}>
        <Badge dot color={isOnline ? '#52c41a' : '#d9d9d9'} offset={[-8, 8]}>
          {createBaseAvatar(props, roleColor)}
        </Badge>
        <div style={{ position: 'absolute', bottom: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: roleColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: 'white', border: '2px solid white' }}>
          {isAssistant ? '🤖' : '👤'}
        </div>
        {isVip && (
          <div style={{ position: 'absolute', top: -4, left: -4, width: 16, height: 16, borderRadius: '50%', background: 'linear-gradient(45deg, #ffd700, #ffed4e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#d48806', border: '2px solid white' }}>
            <CrownOutlined />
          </div>
        )}
        {levelInfo && !isAssistant && (
          <Tooltip title={`等级: ${userLevel}`}>
            <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: levelInfo.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: 'white', border: '2px solid white' }}>
              {levelInfo.icon}
            </div>
          </Tooltip>
        )}
        <div style={{ position: 'absolute', bottom: -25, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: isOnline ? '#52c41a' : '#999', whiteSpace: 'nowrap', fontWeight: 500 }}>
          {isAssistant ? 'AI助手' : isOnline ? '在线' : '离线'}
        </div>
        {levelInfo && !isAssistant && (
          <div style={{ position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)', fontSize: 9, color: levelInfo.color, whiteSpace: 'nowrap', fontWeight: 500 }}>
            {levelInfo.label}
          </div>
        )}
      </div>
    );
  };

  const avatarRenders: Record<AvatarStyle, (props: BubbleProps) => React.ReactNode> = {
    default: defaultAvatarRender,
    status: statusAvatarRender,
    role: roleAvatarRender,
    enhanced: enhancedAvatarRender,
  };

  return (
    <BubbleDemoCard
      title="avatarRender 自定义头像渲染"
      description="展示如何使用 avatarRender 自定义消息气泡的头像区域"
    >
      <div style={{ padding: 24, paddingBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <span style={{ marginRight: 12, fontWeight: 500 }}>头像样式：</span>
          <Space>
            {(Object.keys(AVATAR_STYLE_LABELS) as AvatarStyle[]).map((key) => (
              <Button
                key={key}
                type={avatarStyle === key ? 'primary' : 'default'}
                onClick={() => setAvatarStyle(key)}
              >
                {AVATAR_STYLE_LABELS[key].label}
              </Button>
            ))}
          </Space>
        </div>
        <div style={{ padding: 12, background: '#f8f9fa', borderRadius: 6, fontSize: 14, color: '#666' }}>
          <strong>当前样式：</strong>{AVATAR_STYLE_LABELS[avatarStyle].desc}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {mockMessages.map((msg) => (
          <Bubble
            key={msg.id}
            avatar={msg.meta!}
            placement={msg.role === 'user' ? 'right' : 'left'}
            bubbleRef={bubbleRef}
            pure
            originData={msg}
            bubbleRenderConfig={{ avatarRender: avatarRenders[avatarStyle] }}
          />
        ))}
      </div>
    </BubbleDemoCard>
  );
};
