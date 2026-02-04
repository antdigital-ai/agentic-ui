import {
  BlowingWindLottie,
  BouncingLottie,
  DazingLottie,
  PeekLottie,
  Robot,
  TASK_RUNNING_STATUS,
  TASK_STATUS,
  TaskRunning,
  ThinkingLottie,
} from '@ant-design/agentic-ui';
import { Radio } from 'antd';
import React, { Fragment, useState } from 'react';

export default () => {
  const [robotStatus, setRobotStatus] = useState<'default' | 'running'>(
    'default',
  );

  const statusOptions = [
    { value: 'default', label: '默认状态' },
    { value: 'running', label: '运行中状态' },
  ] as const;

  const [taskStatus, setTaskStatus] = useState<TASK_STATUS>(
    TASK_STATUS.RUNNING,
  );
  const [taskRunningStatus, setTaskRunningStatus] =
    useState<TASK_RUNNING_STATUS>(TASK_RUNNING_STATUS.RUNNING);

  const robots = [
    {
      title: 'DazingLottie - 呼吸+眨眼睛',
      description: '使用Lottie动画库提供的呼吸+眨眼睛动画效果',
      render: (size: number) => <DazingLottie size={size} />,
    },
    {
      title: 'ThinkingLottie - 眨眼跑+追星星',
      description: '使用Lottie动画库提供的眨眼跑+追星星动画效果',
      render: (size: number) => <ThinkingLottie size={size} />,
    },
    {
      title: 'BouncingLottie - 弹跳',
      description: '使用Lottie动画库提供的弹跳动画效果',
      render: (size: number) => <BouncingLottie size={size} />,
    },
    {
      title: 'BlowingWindLottie - 清风拂面',
      description: '使用Lottie动画库提供的清风拂面动画效果',
      render: (size: number) => <BlowingWindLottie size={size} />,
    },
    {
      title: 'PeekLottie - 探头',
      description: '使用Lottie动画库提供的探头动画效果',
      render: (size: number) => <PeekLottie size={size} />,
    },
  ] as const;

  const demoSizes = [
    {
      label: '小尺寸 (32px)',
      value: 32,
    },
    {
      label: '默认尺寸 (48px)',
      value: 48,
    },
    {
      label: '大尺寸 (64px)',
      value: 64,
    },
    {
      label: '超大尺寸 (128px)',
      value: 128,
    },
  ] as const;

  return (
    <div style={{ padding: '0 24px 24px', maxWidth: 1200 }}>
      <h2>机器人形象组件</h2>
      <p style={{ color: '#666', marginBottom: 24 }}>
        提供多种动画状态的机器人图标，支持自定义大小、状态和图标。
      </p>

      <h3>Robot 组件</h3>
      <p style={{ color: '#666', marginBottom: 16 }}>
        基础机器人组件，支持不同状态切换
      </p>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Robot status={robotStatus} size={60} />
        <div>
          <p style={{ marginBottom: 8 }}>
            当前状态:{' '}
            {statusOptions.find((opt) => opt.value === robotStatus)?.label}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <Radio.Group
              value={robotStatus}
              buttonStyle="solid"
              onChange={(e) => setRobotStatus(e.target.value)}
            >
              {statusOptions.map((option) => (
                <Radio.Button key={option.value} value={option.value}>
                  {option.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </div>
        </div>
      </div>

      <h2>Lottie 动画组件</h2>
      <p style={{ color: '#666', marginBottom: 24 }}>
        动画文件较大，建议按需加载
      </p>

      {robots.map((robot) => (
        <Fragment key={robot.title}>
          <h3>{robot.title}</h3>
          <p style={{ color: '#666', marginBottom: 16 }}>{robot.description}</p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              marginBottom: 24,
            }}
          >
            {demoSizes.map((size) => (
              <div key={size.value} style={{ textAlign: 'center' }}>
                {robot.render(size.value)}
                <p style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  {size.label}
                </p>
              </div>
            ))}
          </div>
        </Fragment>
      ))}

      <h3>组合使用示例</h3>
      <p style={{ color: '#666', marginBottom: 16 }}>
        在实际应用中，通常将Robot组件与Lottie动画结合使用
      </p>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 40,
          padding: 16,
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          background: '#fafafa',
        }}
      >
        <TaskRunning
          title={
            taskStatus === TASK_STATUS.RUNNING
              ? '任务运行中'
              : taskStatus === TASK_STATUS.PAUSE
                ? '任务暂停中'
                : taskStatus === TASK_STATUS.STOPPED
                  ? '任务已停止'
                  : '任务已完成, 耗时10小时02分10秒'
          }
          description={
            taskStatus === TASK_STATUS.RUNNING
              ? 'AI模型正在训练中，请耐心等待...'
              : taskStatus === TASK_STATUS.PAUSE
                ? 'AI模型暂停中，请点击继续按钮继续运行'
                : taskStatus === TASK_STATUS.STOPPED
                  ? 'AI模型已停止，请点击重新运行按钮重新运行'
                  : 'AI模型已完成, 耗时10小时02分10秒'
          }
          taskStatus={taskStatus}
          taskRunningStatus={taskRunningStatus}
          onPause={() => {
            setTaskRunningStatus(TASK_RUNNING_STATUS.PAUSE);
            setTaskStatus(TASK_STATUS.PAUSE);
          }}
          onResume={() => {
            setTaskRunningStatus(TASK_RUNNING_STATUS.RUNNING);
            setTaskStatus(TASK_STATUS.RUNNING);
          }}
          onStop={() => {
            setTaskStatus(TASK_STATUS.STOPPED);
            setTaskRunningStatus(TASK_RUNNING_STATUS.COMPLETE);
          }}
          onCreateNewTask={() => {
            setTaskStatus(TASK_STATUS.RUNNING);
            setTaskRunningStatus(TASK_RUNNING_STATUS.RUNNING);
          }}
          onReplay={() => {
            setTaskStatus(TASK_STATUS.RUNNING);
            setTaskRunningStatus(TASK_RUNNING_STATUS.RUNNING);
          }}
        />
      </div>
    </div>
  );
};
