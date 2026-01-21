import { Workspace } from '@ant-design/agentic-ui';
import { QuestionCircleOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';

const WorkspaceTaskDemo: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    // 模拟任务数据
    const initialTasks = [
      {
        key: '1',
        title: '创建全面的 Tesla 股票分析任务列表',
        status: 'success',
      },
      {
        key: '2',
        title: '下载指定的Bilibili视频分集并确保唯一文件名',
        content: (
          <div>
            任务已停止
            <QuestionCircleOutlined style={{ marginLeft: 4 }} />
          </div>
        ),
        status: 'error',
      },

      {
        key: '3',
        title: '提取下载的视频帧',
        status: 'loading',
      },
      {
        key: '4',
        title: '对提取的视频帧进行文字识别',
        status: 'pending',
      },
      {
        key: '5',
        title: '筛选掉OCR识别结果为乱码的图片',
        status: 'pending',
      },
      {
        key: '6',
        title: '报告结果并将Word文档发送给用户',
        status: 'pending',
      },
      {
        key: '7',
        title: <span>用户可自定义title</span>,
        status: 'pending',
      },
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
