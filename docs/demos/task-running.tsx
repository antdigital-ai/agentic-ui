import {
  TASK_RUNNING_STATUS,
  TASK_STATUS,
  TaskRunning,
} from '@ant-design/agentic-ui';
import React, { useState } from 'react';

export default () => {
  const [taskStatus, setTaskStatus] = useState<TASK_STATUS>(
    TASK_STATUS.RUNNING,
  );
  const [taskRunningStatus, setTaskRunningStatus] =
    useState<TASK_RUNNING_STATUS>(TASK_RUNNING_STATUS.RUNNING);
  const [elapsedTime, setElapsedTime] = useState('2分35秒');
  const [progress, setProgress] = useState('3/5 数据清洗');
  const [totalTime] = useState('8分12秒');

  // 状态循环展示逻辑
  const [statusIndex, setStatusIndex] = useState(0);
  const statusSequence = [
    {
      status: TASK_STATUS.RUNNING,
      runningStatus: TASK_RUNNING_STATUS.RUNNING,
      title: '任务运行中',
      description: '正在执行数据分析流水线，请耐心等待...',
    },
    {
      status: TASK_STATUS.PAUSE,
      runningStatus: TASK_RUNNING_STATUS.PAUSE,
      title: '任务已暂停',
      description: '数据分析任务已暂停，点击继续按钮恢复执行',
    },
    {
      status: TASK_STATUS.RUNNING,
      runningStatus: TASK_RUNNING_STATUS.RUNNING,
      title: '任务继续运行',
      description: '任务已恢复，继续执行数据清洗...',
    },
    {
      status: TASK_STATUS.STOPPED,
      runningStatus: TASK_RUNNING_STATUS.COMPLETE,
      title: '任务已停止',
      description: '任务已手动停止，如需继续请新建任务重新开始。',
    },
    {
      status: TASK_STATUS.ERROR,
      runningStatus: TASK_RUNNING_STATUS.COMPLETE,
      title: '任务执行出错',
      description: '数据源连接中断，请检查网络后重试',
    },
    {
      status: TASK_STATUS.SUCCESS,
      runningStatus: TASK_RUNNING_STATUS.COMPLETE,
      title: '任务已完成',
      description: '数据分析报告已生成，请查看结果',
    },
  ];

  // 倒计时逻辑
  const [, setCountdown] = useState(5);
  React.useEffect(() => {
    if (
      taskStatus === TASK_STATUS.RUNNING &&
      taskRunningStatus === TASK_RUNNING_STATUS.RUNNING
    ) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            return 5;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setCountdown(5);
    }
  }, [taskStatus, taskRunningStatus]);

  // 自动状态变化逻辑
  React.useEffect(() => {
    if (
      taskStatus === TASK_STATUS.RUNNING &&
      taskRunningStatus === TASK_RUNNING_STATUS.RUNNING
    ) {
      const timer = setTimeout(() => {
        const isSuccess = Math.random() > 0.3;
        if (isSuccess) {
          setTaskStatus(TASK_STATUS.SUCCESS);
          setTaskRunningStatus(TASK_RUNNING_STATUS.COMPLETE);
        } else {
          setTaskStatus(TASK_STATUS.ERROR);
          setTaskRunningStatus(TASK_RUNNING_STATUS.COMPLETE);
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [taskStatus, taskRunningStatus]);

  const handlePause = () => {
    setTaskRunningStatus(TASK_RUNNING_STATUS.PAUSE);
    setTaskStatus(TASK_STATUS.PAUSE);
  };

  const handleResume = () => {
    setTaskRunningStatus(TASK_RUNNING_STATUS.RUNNING);
    setTaskStatus(TASK_STATUS.RUNNING);
  };

  const handleStop = () => {
    setTaskStatus(TASK_STATUS.STOPPED);
    setTaskRunningStatus(TASK_RUNNING_STATUS.COMPLETE);
  };

  const handleCreateNewTask = () => {
    const nextIndex = (statusIndex + 1) % statusSequence.length;
    setStatusIndex(nextIndex);

    const nextStatus = statusSequence[nextIndex];
    setTaskStatus(nextStatus.status);
    setTaskRunningStatus(nextStatus.runningStatus);

    setProgress('1/5 数据采集');
    setElapsedTime('0分0秒');
  };

  const handleReplay = () => {
    setTaskStatus(TASK_STATUS.RUNNING);
    setTaskRunningStatus(TASK_RUNNING_STATUS.RUNNING);
    setProgress('1/5 数据采集');
    setElapsedTime('0分0秒');
  };

  const handleViewResult = () => {
    console.log('查看分析报告');
  };

  const handleRetry = () => {
    setTaskStatus(TASK_STATUS.RUNNING);
    setTaskRunningStatus(TASK_RUNNING_STATUS.RUNNING);
    setProgress('1/5 数据采集');
    setElapsedTime('0分0秒');
  };

  const noop = () => {};

  const currentStatusInfo = statusSequence[statusIndex];

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <h2>AgentRunBar 任务运行状态组件</h2>
      <p style={{ color: '#666', marginBottom: 24 }}>
        展示 AI
        智能体任务运行的各种状态和操作按钮，支持运行中、暂停、停止、完成等状态管理
      </p>

      <h3>基础用法 - 状态循环展示</h3>
      <p style={{ color: '#666', marginBottom: 16 }}>
        点击"新任务"按钮可以循环展示不同状态，运行中状态会在5秒后自动变为完成或错误状态
      </p>

      <TaskRunning
        title={currentStatusInfo.title}
        description={currentStatusInfo.description}
        taskStatus={taskStatus}
        taskRunningStatus={taskRunningStatus}
        onPause={handlePause}
        onResume={handleResume}
        onStop={handleStop}
        onCreateNewTask={handleCreateNewTask}
        onReplay={handleReplay}
        onViewResult={handleViewResult}
      />

      <h3 style={{ marginTop: 32 }}>静态状态展示</h3>
      <p style={{ color: '#666', marginBottom: 16 }}>
        以下是组件支持的所有状态的静态展示
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: 16,
        }}
      >
        <div
          style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16 }}
        >
          <h4 style={{ margin: '0 0 12px 0', color: '#1890ff' }}>
            状态1: 任务运行中
          </h4>
          <TaskRunning
            title={`任务运行中, 已耗时${elapsedTime}。`}
            description="正在执行数据分析流水线，请耐心等待..."
            taskStatus={TASK_STATUS.RUNNING}
            taskRunningStatus={TASK_RUNNING_STATUS.RUNNING}
            onPause={handlePause}
            onResume={noop}
            onStop={handleStop}
            onCreateNewTask={handleCreateNewTask}
            onReplay={handleReplay}
            onViewResult={handleViewResult}
          />
        </div>

        <div
          style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16 }}
        >
          <h4 style={{ margin: '0 0 12px 0', color: '#faad14' }}>
            状态2: 任务已暂停
          </h4>
          <TaskRunning
            title="任务已暂停"
            description="数据分析任务已暂停，点击继续按钮恢复执行"
            taskStatus={TASK_STATUS.PAUSE}
            taskRunningStatus={TASK_RUNNING_STATUS.PAUSE}
            onPause={noop}
            onResume={handleResume}
            onStop={noop}
            onCreateNewTask={handleCreateNewTask}
            onReplay={handleReplay}
            onViewResult={handleViewResult}
          />
        </div>

        <div
          style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16 }}
        >
          <h4 style={{ margin: '0 0 12px 0', color: '#ff4d4f' }}>
            状态3: 任务已停止
          </h4>
          <TaskRunning
            title="任务已停止"
            description="任务已手动停止，如需继续请创建新任务"
            taskStatus={TASK_STATUS.STOPPED}
            taskRunningStatus={TASK_RUNNING_STATUS.COMPLETE}
            onPause={noop}
            onResume={noop}
            onStop={noop}
            onCreateNewTask={handleCreateNewTask}
            onReplay={handleReplay}
            onViewResult={handleViewResult}
          />
        </div>

        <div
          style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16 }}
        >
          <h4 style={{ margin: '0 0 12px 0', color: '#52c41a' }}>
            状态4: 任务已完成
          </h4>
          <TaskRunning
            title={`任务已完成, 耗时${totalTime}`}
            taskStatus={TASK_STATUS.SUCCESS}
            taskRunningStatus={TASK_RUNNING_STATUS.COMPLETE}
            onPause={noop}
            onResume={noop}
            onStop={noop}
            onCreateNewTask={handleCreateNewTask}
            onReplay={handleRetry}
            onViewResult={handleViewResult}
          />
        </div>

        <div
          style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16 }}
        >
          <h4 style={{ margin: '0 0 12px 0', color: '#ff4d4f' }}>
            状态5: 任务出错
          </h4>
          <TaskRunning
            title="任务执行出错"
            description="数据源连接中断，请检查网络后重试"
            taskStatus={TASK_STATUS.ERROR}
            taskRunningStatus={TASK_RUNNING_STATUS.COMPLETE}
            onPause={noop}
            onResume={noop}
            onStop={noop}
            onCreateNewTask={handleCreateNewTask}
            onReplay={handleRetry}
            onViewResult={handleViewResult}
          />
        </div>

        <div
          style={{ border: '1px solid #f0f0f0', borderRadius: 8, padding: 16 }}
        >
          <h4 style={{ margin: '0 0 12px 0', color: '#999' }}>
            状态6: 任务已取消
          </h4>
          <TaskRunning
            title="任务已取消"
            description="任务已被用户取消，请创建新任务"
            taskStatus={TASK_STATUS.CANCELLED}
            taskRunningStatus={TASK_RUNNING_STATUS.COMPLETE}
            onPause={noop}
            onResume={noop}
            onStop={noop}
            onCreateNewTask={handleCreateNewTask}
            onReplay={handleReplay}
            onViewResult={handleViewResult}
          />
        </div>
      </div>

      <h3 style={{ marginTop: 32 }}>主题变体</h3>
      <p style={{ color: '#666', marginBottom: 16 }}>
        设置 variant 属性，可以衍生出更多的主题变体样式
      </p>

      <TaskRunning
        title={`任务运行中, 已耗时${elapsedTime}。 ${progress}`}
        taskStatus={TASK_STATUS.RUNNING}
        taskRunningStatus={TASK_RUNNING_STATUS.RUNNING}
        variant="simple"
        icon={false}
        actionsRender={false}
        onPause={handlePause}
        onResume={noop}
        onStop={handleStop}
      />
    </div>
  );
};
