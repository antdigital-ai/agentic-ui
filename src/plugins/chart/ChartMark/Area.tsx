import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import React, { useImperativeHandle, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Container } from './Container';
import { ChartProps } from './useChart';

let chartMarkAreaRegistered = false;

export const Area: React.FC<ChartProps> = (props) => {
  React.useMemo(() => {
    if (chartMarkAreaRegistered) {
      return undefined;
    }

    if (typeof window === 'undefined') {
      return undefined;
    }

    ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      Filler,
      Title,
      Tooltip,
      Legend,
    );
    chartMarkAreaRegistered = true;
    return undefined;
  }, []);

  const chartRef = React.useRef<ChartJS>(undefined);
  const htmlRef = useRef<HTMLDivElement>(null);
  const lineChartRef = useRef<any>(null);

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

    // 获取所有唯一的 x 值作为标签
    const labels = [
      ...new Set(props.data.map((item: any) => item[props.xField])),
    ];

    if (props.colorLegend) {
      // 如果有颜色图例，按颜色分组数据
      const groupedData = props.data.reduce((acc: any, item: any) => {
        const group = item[props.colorLegend!];
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(item);
        return acc;
      }, {});

      const datasets = Object.keys(groupedData).map((group, index) => {
        const groupData = groupedData[group];
        const data = labels.map((label: any) => {
          const item = groupData.find((d: any) => d[props.xField] === label);
          return item ? item[props.yField] : null;
        });

        const colors = [
          'rgba(54, 162, 235, 0.3)',
          'rgba(255, 99, 132, 0.3)',
          'rgba(255, 206, 86, 0.3)',
          'rgba(75, 192, 192, 0.3)',
          'rgba(153, 102, 255, 0.3)',
        ];

        const borderColors = [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ];

        return {
          label: group,
          data,
          fill: true,
          backgroundColor: colors[index % colors.length],
          borderColor: borderColors[index % borderColors.length],
          borderWidth: 1,
          tension: 0.1,
        };
      });

      return { labels, datasets };
    } else {
      // 单一数据集
      const data = labels.map((label: any) => {
        const item = props.data.find((d: any) => d[props.xField] === label);
        return item ? item[props.yField] : null;
      });

      return {
        labels,
        datasets: [
          {
            label: props.yField,
            data,
            fill: true,
            backgroundColor: 'rgba(54, 162, 235, 0.3)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            tension: 0.1,
          },
        ],
      };
    }
  };

  const chartData = processData();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: !!props.colorLegend,
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: false,
        },
      },
      y: {
        display: true,
        title: {
          display: false,
        },
      },
    },
    elements: {
      point: {
        radius: 2,
        hoverRadius: 4,
      },
    },
  };

  // 更新 chartRef 当 Line 组件的 ref 改变时
  React.useEffect(() => {
    if (lineChartRef.current) {
      chartRef.current = lineChartRef.current;
    }
  }, [lineChartRef.current]);

  return (
    <Container index={props.index} chartRef={chartRef} htmlRef={htmlRef}>
      <Line ref={lineChartRef} data={chartData} options={options} />
    </Container>
  );
};
