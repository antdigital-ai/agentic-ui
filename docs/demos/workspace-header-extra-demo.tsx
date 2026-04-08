import { ActionIconBox, Workspace } from '@ant-design/agentic-ui';
import { MoreOutlined } from '@ant-design/icons';
import { Dropdown, message } from 'antd';
import React, { useState } from 'react';

const WorkspaceHeaderExtraDemo: React.FC = () => {
  const [activeTabKey, setActiveTabKey] = useState<string>('realtime');

  const handleTabChange = (key: string) => {
    setActiveTabKey(key);
  };

  const handleClose = () => {
    message.success('工作空间已关闭');
  };

  // 示例：使用竖向三点图标展示更多操作
  const headerExtra = (
    <Dropdown
      menu={{
        items: [
          {
            key: 'download',
            label: '下载',
            onClick: () => message.success('开始下载...'),
          },
          {
            key: 'share',
            label: '分享',
            onClick: () => message.success('分享链接已复制'),
          },
        ],
      }}
      placement="bottomRight"
      trigger={['click']}
    >
      <ActionIconBox aria-label="更多操作">
        <MoreOutlined />
      </ActionIconBox>
    </Dropdown>
  );

  return (
    <div style={{ height: 500, width: '100%' }}>
      <Workspace
        title="工作空间"
        activeTabKey={activeTabKey}
        onTabChange={handleTabChange}
        onClose={handleClose}
        headerExtra={headerExtra}
      >
        <Workspace.Realtime
          tab={{ key: 'realtime', title: '实时跟随' }}
          data={{
            type: 'md',
            content: `# headerExtra

在 Workspace 标题栏右侧插入 \`ReactNode\`（本页为 \`Dropdown\` + \`MoreOutlined\`）。

\`\`\`tsx
<Workspace headerExtra={headerExtra} />
\`\`\`
`,
            typewriter: false,
          }}
        />

        <Workspace.Task
          tab={{ key: 'task', title: '任务列表', count: 3 }}
          data={{
            items: [
              {
                key: 'task1',
                title: '任务 1',
                content: '实现 headerExtra 功能',
                status: 'success',
              },
              {
                key: 'task2',
                title: '任务 2',
                content: '编写使用示例和文档',
                status: 'success',
              },
              {
                key: 'task3',
                title: '任务 3',
                content: '添加单元测试',
                status: 'pending',
              },
            ],
          }}
        />

        <Workspace.Custom tab={{ key: 'custom', title: '说明' }}>
          <div style={{ padding: '16px' }}>
            <h3>关于 headerExtra</h3>
            <p>
              <code>headerExtra</code> 属性接收一个 <code>ReactNode</code>
              ，会被渲染在 header 右侧区域，位于关闭按钮之前。
            </p>
            <p>您可以在这里放置任何自定义内容：</p>
            <ul>
              <li>操作按钮（下载、分享、设置等）</li>
              <li>状态指示器</li>
              <li>用户信息</li>
              <li>下拉菜单</li>
              <li>其他自定义组件</li>
            </ul>
          </div>
        </Workspace.Custom>
      </Workspace>
    </div>
  );
};

export default WorkspaceHeaderExtraDemo;
