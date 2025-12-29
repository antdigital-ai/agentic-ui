import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import React, { useImperativeHandle, useRef } from 'react';
import { Bar as ChartBar } from 'react-chartjs-2';
import { stringFormatNumber } from '../utils';
import { Container } from './Container';
import { ChartProps } from './useChart';

let chartMarkBarRegistered = false;

export const Bar: React.FC<ChartProps> = (props) => {
  React.useMemo(() => {
    if (chartMarkBarRegistered) {
      return undefined;
    }

    if (typeof window === 'undefined') {
      return undefined;
    }

    ChartJS.register(
      CategoryScale,
      LinearScale,
      BarElement,
      Title,
      Tooltip,
      Legend,
    );
    chartMarkBarRegistered = true;
    return undefined;
  }, []);

  const chartRef = React.useRef<ChartJS>(undefined);
  const htmlRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<any>(null);

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
          'rgba(54, 162, 235, 0.85)',
          'rgba(255, 99, 132, 0.85)',
          'rgba(255, 206, 86, 0.85)',
          'rgba(75, 192, 192, 0.85)',
          'rgba(153, 102, 255, 0.85)',
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
          backgroundColor: colors[index % colors.length],
          borderColor: borderColors[index % borderColors.length],
          borderWidth: 1,
          borderRadius: 4,
          maxBarThickness: 20,
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
            backgroundColor: 'rgba(54, 162, 235, 0.85)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            borderRadius: 4,
            maxBarThickness: 20,
          },
        ],
      };
    }
  };

  const chartData = processData();

  const options = {
    indexAxis: 'y' as const, // 水平条形图
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
        ticks: {
          callback: function (value: any) {
            return stringFormatNumber(value);
          },
        },
      },
      y: {
        display: true,
        title: {
          display: false,
        },
        ticks: {
          callback: function (value: any, index: number) {
            const label = chartData.labels[index];
            return stringFormatNumber(label);
          },
        },
      },
    },
  };

  // 更新 chartRef 当 Bar 组件的 ref 改变时
  React.useEffect(() => {
    if (barChartRef.current) {
      chartRef.current = barChartRef.current;
    }
  }, [barChartRef.current]);

  return (
    <Container index={props.index} chartRef={chartRef} htmlRef={htmlRef}>
      <ChartBar ref={barChartRef} data={chartData} options={options} />
    </Container>
  );
};
