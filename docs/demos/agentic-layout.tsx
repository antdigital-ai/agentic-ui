import {
  AgenticLayout,
  BubbleList,
  BubbleMetaData,
  ChatLayout,
  History,
  HistoryDataType,
  MessageBubbleData,
  Workspace,
} from '@ant-design/agentic-ui';
import React, { useState } from 'react';

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

const messages: MessageBubbleData[] = [
  {
    id: '1',
    role: 'assistant',
    content: '### Ant Design 聊天助手\n可协助解答问题、提供示例与文档说明。',
    createAt: Date.now(),
    updateAt: Date.now(),
    isFinished: true,
    meta: assistantMeta,
    fileMap: new Map(),
  },
  {
    id: '2',
    role: 'user',
    content: '请简要说明 AgenticLayout 里聊天区与侧栏如何配合。',
    createAt: Date.now(),
    updateAt: Date.now(),
    isFinished: true,
    meta: userMeta,
    fileMap: new Map(),
  },
  {
    id: '3',
    role: 'assistant',
    content:
      'AgenticLayout 提供左中右三栏布局：左侧放 History 会话列表，中间放 ChatLayout 对话区，右侧放 Workspace 工作区。左右侧栏均可折叠，右侧栏还支持拖拽调整宽度。',
    createAt: Date.now(),
    updateAt: Date.now(),
    isFinished: true,
    meta: assistantMeta,
    fileMap: new Map(),
  },
];

const HistoryDemo = () => {
  const [currentSessionId, setCurrentSessionId] = useState('session-2');

  return (
    <History
      agentId="demo-agent"
      sessionId={currentSessionId}
      request={async () =>
        [
          {
            id: '1',
            sessionId: 'session-1',
            sessionTitle: '布局使用指南',
            agentId: 'demo-agent',
            gmtCreate: 1703123456789,
            gmtLastConverse: 1703123456789,
            isFavorite: true,
          },
          {
            id: '2',
            sessionId: 'session-2',
            sessionTitle: '组件集成方案',
            agentId: 'demo-agent',
            gmtCreate: 1703037056789,
            gmtLastConverse: 1703037056789,
            isFavorite: false,
          },
          {
            id: '3',
            sessionId: 'session-3',
            sessionTitle: '样式定制问题',
            agentId: 'demo-agent',
            gmtCreate: 1702950656789,
            gmtLastConverse: 1702950656789,
          },
        ] as HistoryDataType[]
      }
      onClick={setCurrentSessionId}
      standalone
      type="chat"
      agent={{
        enabled: true,
        onSearch: () => {},
        onNewChat: () => {},
        onLoadMore: async () => {},
        onFavorite: async () => {},
      }}
    />
  );
};

const WorkspaceDemo = () => (
  <Workspace onTabChange={(key) => console.log('切换到标签页:', key)}>
    <Workspace.Realtime
      tab={{ key: 'realtime', title: '实时跟随' }}
      data={{
        type: 'md',
        content: '## 分析结果\n\n已完成对项目结构的分析，请查看右侧工作区。',
        title: '深度思考',
      }}
    />
    <Workspace.Task
      tab={{ key: 'tasks', title: '任务列表' }}
      data={{
        items: [
          { key: '1', title: '分析项目结构', status: 'success' },
          { key: '2', title: '生成布局方案', status: 'success' },
          { key: '3', title: '编写集成代码', status: 'pending' },
        ],
      }}
    />
  </Workspace>
);

const App = () => {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  return (
    <div
      style={{
        height: '100vh',
        padding: 6,
        backgroundColor: 'var(--ant-color-bg-layout, #f5f5f5)',
      }}
    >
      <AgenticLayout
        style={{ height: 'calc(100vh - 12px)', minHeight: 0 }}
        header={{
          title: 'AI 助手',
          leftCollapsed,
          onLeftCollapse: setLeftCollapsed,
          rightCollapsed,
          onRightCollapse: setRightCollapsed,
        }}
        left={<HistoryDemo />}
        center={
          <ChatLayout>
            <BubbleList
              pure
              onLike={() => {}}
              onDisLike={() => {}}
              shouldShowVoice
              markdownRenderConfig={{ tableConfig: { pure: true } }}
              bubbleList={messages}
              assistantMeta={assistantMeta}
              userMeta={userMeta}
            />
          </ChatLayout>
        }
        right={<WorkspaceDemo />}
      />
    </div>
  );
};

export default App;
