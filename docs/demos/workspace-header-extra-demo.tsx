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
            content: `# Header 自定义示例

## 功能说明

通过 \`headerExtra\` 属性，您可以在 Workspace 的 header 右侧区域添加自定义内容。

## 示例功能

- 使用竖向三点图标（\`MoreOutlined\`）展示更多操作
- 结合 \`Dropdown\` 实现下拉菜单
- 支持分组和分隔线，组织多个操作项
- 节省空间，适合收纳大量操作

## 代码示例

\`\`\`tsx
import { MoreOutlined } from '@ant-design/icons';
import { ActionIconBox } from '@ant-design/agentic-ui';

const headerExtra = (
  <Dropdown
    menu={{
      items: [
        { key: 'download', label: '下载' },
        { key: 'share', label: '分享' },
        { type: 'divider' },
        { key: 'export-md', label: '导出为 Markdown' },
        { key: 'export-pdf', label: '导出为 PDF' },
        { type: 'divider' },
        { key: 'settings', label: '设置' },
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

<Workspace
  title="工作空间"
  onClose={handleClose}
  headerExtra={headerExtra}
>
  {/* 子组件 */}
</Workspace>
\`\`\`

## 最佳实践

1. **保持简洁**：header 右侧区域空间有限，避免放置过多按钮
2. **使用图标**：优先使用图标按钮，节省空间且更美观
3. **统一风格**：使用 \`ActionIconBox\` 保持与关闭按钮一致的交互效果
4. **合理分组**：使用 \`Space\` 控制按钮间距，或使用 \`Dropdown\` 收纳更多操作
5. **响应式设计**：考虑在小屏幕上的显示效果
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
