import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import React, { useImperativeHandle, useRef } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { defaultColorList } from '../const';
import { Container } from './Container';
import { ChartProps } from './useChart';

let chartMarkPieRegistered = false;

export const Pie: React.FC<ChartProps> = (props) => {
  React.useMemo(() => {
    if (chartMarkPieRegistered) {
      return undefined;
    }

    if (typeof window === 'undefined') {
      return undefined;
    }

    ChartJS.register(ArcElement, Tooltip, Legend);
    chartMarkPieRegistered = true;
    return undefined;
  }, []);

  const chartRef = React.useRef<ChartJS>(undefined);
  const htmlRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<any>(null);

  useImperativeHandle(props.chartRef, () => chartRef.current, [
    chartRef.current,
  ]);

  // 处理数据格式
  const processData = () => {
    if (!props.data || props.data.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // 获取标签和数据
    const labels = props.data.map((item: any) => item[props.xField]);
    const data = props.data.map((item: any) => item[props.yField]);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: defaultColorList.slice(0, data.length),
          borderColor: defaultColorList
            .slice(0, data.length)
            .map((color) => color),
          borderWidth: 1,
        },
      ],
    };
  };

  const chartData = processData();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
      },
      tooltip: {
        enabled: true,
      },
    },
    cutout: '50%', // 创建环形图效果，类似原来的 innerRadius: 0.5
  };

  // 更新 chartRef 当 Doughnut 组件的 ref 改变时
  React.useEffect(() => {
    if (pieChartRef.current) {
      chartRef.current = pieChartRef.current;
    }
  }, [pieChartRef.current]);

  return (
    <Container index={props.index} chartRef={chartRef} htmlRef={htmlRef}>
      <Doughnut ref={pieChartRef} data={chartData} options={options} />
    </Container>
  );
};
