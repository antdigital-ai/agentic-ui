import { Workspace } from '@ant-design/agentic-ui';
import { QuestionCircleOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';

const WorkspaceTaskDemo: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    // 模拟任务数据
    const initialTasks = [
      { key: '1', title: '步骤一：完成', status: 'success' },
      {
        key: '2',
        title: '步骤二：失败',
        content: (
          <div>
            已停止
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </div>
        ),
        status: 'error',
      },
      { key: '3', title: '步骤三：进行中', status: 'loading' },
      { key: '4', title: <span>自定义 title</span>, status: 'pending' },
    ];

    setTasks(initialTasks);
  }, []);

  return (
    <div style={{ height: 600, width: '100%' }}>
      <Workspace title="任务管理工作空间">
        <Workspace.Task
          tab={{
            key: 'tasks',
            title: '任务列表',
          }}
          data={{
            items: tasks,
          }}
        />
        <Workspace.File nodes={[]} />
      </Workspace>
    </div>
  );
};

export default WorkspaceTaskDemo;
