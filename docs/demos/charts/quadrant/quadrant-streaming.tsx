import { QuadrantChart } from '@ant-design/agentic-ui';
import React, { useEffect, useRef, useState } from 'react';

/**
 * 模拟流式产出表格行：象限行逐条追加，未满 4 行时其余象限自动补空占位。
 */
const QuadrantStreamingDemo: React.FC = () => {
  const allRows = [
    { 象限: '实验期', 内容: '新技术验证，原型' },
    { 象限: '推广期', 内容: '试点团队，灰度发布' },
    { 象限: '规模化', 内容: '平台化，最佳实践' },
    { 象限: '衰退/替换', 内容: '技术债偿还，迁移计划' },
  ];

  const columns = [
    { title: '象限', dataIndex: '象限', key: '象限' },
    { title: '内容', dataIndex: '内容', key: '内容' },
  ];

  const [count, setCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    const tick = () => {
      setCount((prev) => (prev >= allRows.length ? 1 : prev + 1));
    };
    tick();
    timerRef.current = setInterval(tick, 1100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div style={{ padding: 16, background: '#fafafa' }}>
      <QuadrantChart
        title={`已加载 ${count} / ${allRows.length} 行（象限）`}
        columns={columns}
        data={allRows.slice(0, count)}
      />
    </div>
  );
};

export default QuadrantStreamingDemo;
