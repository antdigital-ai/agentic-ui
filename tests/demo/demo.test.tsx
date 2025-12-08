import { cleanup, render, waitFor } from '@testing-library/react';
import { App, ConfigProvider } from 'antd';
import { glob } from 'glob';
import React, { useEffect } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  framerMotionMock,
  setupAnimationMocks,
} from '../_mocks_/animationMocks';

// Mock framer-motion to speed up tests
vi.mock('framer-motion', () => framerMotionMock);

// Mock Chart.js to avoid DOM access issues in test environment
vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
  },
  CategoryScale: vi.fn(),
  LinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  BarElement: vi.fn(),
  ArcElement: vi.fn(),
  Title: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
  Filler: vi.fn(),
  RadialLinearScale: vi.fn(),
  TimeScale: vi.fn(),
  TimeSeriesScale: vi.fn(),
  Decimation: vi.fn(),
  Zoom: vi.fn(),
}));

// Mock react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Line: ({ data }: any) => (
    <div
      data-testid="line-chart"
      data-labels={JSON.stringify(data?.labels)}
      data-datasets={JSON.stringify(data?.datasets)}
    >
      Line Chart
    </div>
  ),
  Bar: ({ data }: any) => (
    <div
      data-testid="bar-chart"
      data-labels={JSON.stringify(data?.labels)}
      data-datasets={JSON.stringify(data?.datasets)}
    >
      Bar Chart
    </div>
  ),
  Doughnut: ({ data }: any) => (
    <div
      data-testid="doughnut-chart"
      data-labels={JSON.stringify(data?.labels)}
      data-datasets={JSON.stringify(data?.datasets)}
    >
      Doughnut Chart
    </div>
  ),
  Pie: ({ data }: any) => (
    <div
      data-testid="pie-chart"
      data-labels={JSON.stringify(data?.labels)}
      data-datasets={JSON.stringify(data?.datasets)}
    >
      Pie Chart
    </div>
  ),
  Radar: ({ data }: any) => (
    <div
      data-testid="radar-chart"
      data-labels={JSON.stringify(data?.labels)}
      data-datasets={JSON.stringify(data?.datasets)}
    >
      Radar Chart
    </div>
  ),
  Scatter: ({ data }: any) => (
    <div
      data-testid="scatter-chart"
      data-labels={JSON.stringify(data?.labels)}
      data-datasets={JSON.stringify(data?.datasets)}
    >
      Scatter Chart
    </div>
  ),
}));

// Mock rc-resize-observer
vi.mock('rc-resize-observer', () => ({
  default: ({ children, onResize }: any) => (
    <div data-testid="resize-observer" onClick={() => onResize?.()}>
      {children}
    </div>
  ),
}));

// 设置动画相关的全局mock
setupAnimationMocks();

const waitTime = (time: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

const TestApp = (props: { children: any; onInit: () => void }) => {
  useEffect(() => {
    setTimeout(() => {
      props.onInit?.();
    }, 500);
  }, []);
  return (
    <App>
      <div>test</div>
      {props.children}
    </App>
  );
};

function demoTest() {
  beforeAll(() => {
    global.window.scrollTo = vi.fn();
    Element.prototype.scrollTo = vi.fn();
    process.env.NODE_ENV = 'test';

    // 禁用动画以减少测试时间
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = (element) => {
      const style = originalGetComputedStyle(element);
      return {
        ...style,
        animation: 'none',
        transition: 'none',
        transform: 'none',
      } as any;
    };
    console.log = vi.fn();
    console.warn = vi.fn();
  });

  const files = glob.sync('./docs/**/demos/**/*.tsx', {
    ignore: ['./**/*.test.tsx', './**/node_modules/**'],
    nodir: true,
  });

  files
    .filter((file) => file.endsWith('demo.tsx'))
    .forEach((file) => {
      describe(`Rendering demo: ${file}`, () => {
        it(`renders ${file} correctly`, async () => {
          const fn = vi.fn();
          Math.random = () => 0.8404419276253765;

          const DemoModule = await import(file);
          const wrapper = render(
            <ConfigProvider
              theme={{
                hashed: false,
              }}
            >
              <TestApp onInit={fn}>
                <DemoModule.default />
              </TestApp>
            </ConfigProvider>,
          );

          await waitTime(600);

          await waitFor(
            () => {
              const elements = wrapper.getAllByText('test');
              expect(elements.length).toBeGreaterThan(0);
            },
            { timeout: 10000 },
          );

          await waitFor(
            () => {
              expect(fn).toHaveBeenCalled();
            },
            { timeout: 10000 },
          );

          await expect(wrapper.asFragment()).toMatchFileSnapshot(
            './__snapshots__/' + file.replace(/\.tsx$/, '.snap'),
          );
          wrapper.unmount();
        });

        afterEach(() => {
          cleanup();
        });
      });
    });
}

demoTest();
