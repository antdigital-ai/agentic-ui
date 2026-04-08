import { ToolUseBar } from '@ant-design/agentic-ui';
import React, { useEffect, useState } from 'react';

const ToolUseBarAdvancedDemo = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const tools = [
    {
      id: '1',
      toolName: 'data_pipeline',
      toolTarget: '执行 ETL 数据清洗与转换流程',
      time: '12.5s',
      status: isRunning ? ('loading' as const) : ('success' as const),
      progress: progress,
      type: 'basic',
    },
    {
      id: '2',
      toolName: 'model_inference',
      toolTarget: '调用 GPT-4o 模型进行文本分析',
      time: '3.8s',
      status: 'idle' as const,
      progress: 0,
      type: 'auto',
    },
  ];

  // 模拟工作流程执行
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 2;
        if (newProgress >= 100) {
          setIsRunning(false);
          return 100;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning]);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <ToolUseBar
        tools={tools}
        onToolClick={(id: string) => console.log('Tool clicked:', id)}
      />
    </div>
  );
};

export default ToolUseBarAdvancedDemo;
