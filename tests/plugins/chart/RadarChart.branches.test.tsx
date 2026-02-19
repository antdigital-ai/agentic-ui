import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RadarChartDataItem } from '../../../src/Plugins/chart/RadarChart';

/* ---- 捕获 Radar 收到的 props，用于直接调用 options 回调 ---- */

let capturedRadarProps: any = null;

vi.mock('chart.js', () => ({
  Chart: {
    register: vi.fn(),
    defaults: {
      plugins: {
        legend: {
          labels: {
            generateLabels: vi.fn(() => [
              { text: 'Short', fillStyle: '#f00', hidden: false, index: 0 },
              {
                text: '这是一个非常非常长的文字标签用于测试截断功能是否正常工作',
                fillStyle: '#0f0',
                hidden: false,
                index: 1,
              },
            ]),
          },
        },
      },
    },
  },
  RadialLinearScale: vi.fn(),
  PointElement: vi.fn(),
  LineElement: vi.fn(),
  Filler: vi.fn(),
  Tooltip: vi.fn(),
  Legend: vi.fn(),
}));

vi.mock('react-chartjs-2', () => ({
  Radar: React.forwardRef((props: any, ref: any) => {
    capturedRadarProps = props;
    return (
      <div data-testid="radar-chart" ref={ref}>
        Mocked Radar
      </div>
    );
  }),
}));

vi.mock('../../../src/Plugins/chart/utils', () => ({
  hexToRgba: vi.fn((color, alpha) => `rgba(0,0,0,${alpha})`),
  resolveCssVariable: vi.fn((color) => color),
}));

const mockWrapSSR = vi.fn((node: any) => node);

vi.mock('../../../src/Plugins/chart/components', () => ({
  ChartContainer: ({ children, ...p }: any) => (
    <div data-testid="chart-container" {...p}>
      {children}
    </div>
  ),
  ChartFilter: ({ filterOptions, onFilterChange }: any) => (
    <div data-testid="chart-filter">
      {filterOptions?.map((o: any) => (
        <button
          type="button"
          key={o.value}
          onClick={() => onFilterChange(o.value)}
          data-testid={`filter-${o.value}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  ),
  ChartToolBar: ({ title, onDownload }: any) => (
    <div data-testid="chart-toolbar">
      <span data-testid="chart-title">{title}</span>
      <button type="button" onClick={onDownload} data-testid="download-button">
        下载
      </button>
    </div>
  ),
  downloadChart: vi.fn(),
}));

vi.mock('../../../src/Plugins/chart/ChartStatistic', () => ({
  default: ({ title, value }: any) => (
    <div data-testid="chart-statistic">
      {title}: {value}
    </div>
  ),
}));

vi.mock('../../../src/Plugins/chart/RadarChart/style', () => ({
  useStyle: vi.fn(() => ({
    wrapSSR: mockWrapSSR,
    hashId: 'h',
  })),
}));

import RadarChart from '../../../src/Plugins/chart/RadarChart';

/* ---- helpers ---- */

const validData: RadarChartDataItem[] = [
  { category: 'A', label: '技术', type: 'T1', score: 80 },
  { category: 'A', label: '沟通', type: 'T1', score: 70 },
  { category: 'A', label: '技术', type: 'T2', score: 60 },
  { category: 'A', label: '沟通', type: 'T2', score: 50 },
];

describe('RadarChart 分支逻辑', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedRadarProps = null;
    mockWrapSSR.mockImplementation((node: any) => node);

    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      measureText: vi.fn((text: string) => ({ width: text.length * 8 })),
      fillText: vi.fn(),
      canvas: document.createElement('canvas'),
    })) as any;
  });

  describe('score 类型为非 number/string 时返回 0', () => {
    it('boolean score 回退为 0', () => {
      const data: any[] = [
        { category: 'A', label: '技术', type: 'T1', score: true },
        { category: 'A', label: '沟通', type: 'T1', score: 70 },
      ];
      render(<RadarChart data={data} />);
      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });

    it('对象 score 回退为 0', () => {
      const data: any[] = [
        { category: 'A', label: '技术', type: 'T1', score: { val: 1 } },
        { category: 'A', label: '沟通', type: 'T1', score: 70 },
      ];
      render(<RadarChart data={data} />);
      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });
  });

  describe('generateLabels 文本截断逻辑', () => {
    it('短文本不截断，长文本截断加省略号', () => {
      // 直接 mock createElement 让 canvas.getContext 返回可用的 ctx
      const origCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag: string, options?: any) => {
        if (tag === 'canvas') {
          return {
            getContext: () => ({
              measureText: (text: string) => ({ width: text.length * 8 }),
              font: '',
            }),
          } as any;
        }
        return origCreateElement(tag, options);
      });

      render(<RadarChart data={validData} textMaxWidth={80} />);
      expect(capturedRadarProps).toBeTruthy();

      const generateLabels =
        capturedRadarProps.options.plugins.legend.labels.generateLabels;

      const result = generateLabels({});
      expect(result).toHaveLength(2);

      // "Short" 长度 5*8=40 ≤ 80，保持原样
      expect(result[0].text).toBe('Short');

      // 长文本截断并添加 "..."
      expect(result[1].text).toContain('...');
    });

    it('canvas context 为 null 时返回原始标签', () => {
      const origCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag: string, options?: any) => {
        if (tag === 'canvas') {
          return { getContext: () => null } as any;
        }
        return origCreateElement(tag, options);
      });

      render(<RadarChart data={validData} />);
      const generateLabels =
        capturedRadarProps.options.plugins.legend.labels.generateLabels;
      const result = generateLabels({});
      // ctx 为 null，直接返回 original
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ text: 'Short' }),
        ]),
      );
    });
  });

  describe('tooltip external 回调分支', () => {
    const getTooltipExternal = () => {
      render(<RadarChart data={validData} />);
      return capturedRadarProps.options.plugins.tooltip.external;
    };

    it('tooltip opacity 为 0 时隐藏已有 tooltip 元素', () => {
      const external = getTooltipExternal();

      // 先创建 tooltip DOM
      const el = document.createElement('div');
      el.id = 'custom-radar-tooltip';
      el.style.opacity = '1';
      document.body.appendChild(el);

      external({
        chart: { canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) } },
        tooltip: { opacity: 0 },
      });

      expect(el.style.opacity).toBe('0');
      document.body.removeChild(el);
    });

    it('tooltip opacity 为 0 且无 tooltip 元素时不报错', () => {
      const external = getTooltipExternal();
      // 确保没有 tooltip 元素
      const existing = document.getElementById('custom-radar-tooltip');
      if (existing) existing.remove();

      expect(() => {
        external({
          chart: { canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) } },
          tooltip: { opacity: 0 },
        });
      }).not.toThrow();
    });

    it('dataPoints 为空数组时 early return', () => {
      const external = getTooltipExternal();
      expect(() => {
        external({
          chart: { canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) } },
          tooltip: { opacity: 1, dataPoints: [] },
        });
      }).not.toThrow();
    });

    it('dataPoints[0] 为 undefined 时 early return', () => {
      const external = getTooltipExternal();
      expect(() => {
        external({
          chart: { canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) } },
          tooltip: { opacity: 1, dataPoints: [undefined] },
        });
      }).not.toThrow();
    });

    it('dataPoints 不存在时 early return', () => {
      const external = getTooltipExternal();
      expect(() => {
        external({
          chart: { canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) } },
          tooltip: { opacity: 1, dataPoints: undefined },
        });
      }).not.toThrow();
    });
  });

  describe('tooltip value 解析', () => {
    const getTooltipExternal = () => {
      render(<RadarChart data={validData} />);
      return capturedRadarProps.options.plugins.tooltip.external;
    };

    it('rawValue 为有限数字时格式化为定点数', () => {
      const external = getTooltipExternal();
      external({
        chart: { canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) } },
        tooltip: {
          opacity: 1,
          caretX: 10,
          caretY: 20,
          dataPoints: [
            {
              label: '技术',
              dataset: { label: 'T1', borderColor: '#f00' },
              parsed: { r: 85.3 },
            },
          ],
        },
      });
      const tooltipEl = document.getElementById('custom-radar-tooltip');
      expect(tooltipEl).toBeTruthy();
      expect(tooltipEl!.innerHTML).toContain('85.3');
      tooltipEl!.remove();
    });

    it('rawValue 为非有限数字时使用 String 转换', () => {
      const external = getTooltipExternal();
      external({
        chart: { canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) } },
        tooltip: {
          opacity: 1,
          caretX: 0,
          caretY: 0,
          dataPoints: [
            {
              label: '技术',
              dataset: { label: 'T1', borderColor: '#f00' },
              parsed: { r: undefined },
            },
          ],
        },
      });
      const tooltipEl = document.getElementById('custom-radar-tooltip');
      expect(tooltipEl).toBeTruthy();
      // String(undefined || 0) => "0"
      expect(tooltipEl!.innerHTML).toContain('0');
      tooltipEl!.remove();
    });

    it('value 解析抛出异常时回退为 "0"', () => {
      const external = getTooltipExternal();

      // parsed 设为 getter 会抛错来触发 catch
      const badDataPoint = {
        label: '技术',
        dataset: { label: 'T1', borderColor: '#f00' },
        get parsed(): any {
          throw new Error('parse error');
        },
      };

      external({
        chart: { canvas: { getBoundingClientRect: () => ({ left: 0, top: 0 }) } },
        tooltip: {
          opacity: 1,
          caretX: 0,
          caretY: 0,
          dataPoints: [badDataPoint],
        },
      });
      const tooltipEl = document.getElementById('custom-radar-tooltip');
      expect(tooltipEl).toBeTruthy();
      expect(tooltipEl!.innerHTML).toContain('0');
      tooltipEl!.remove();
    });
  });

  describe('ticks callback 和 download 错误', () => {
    it('ticks callback 直接返回 value', () => {
      render(<RadarChart data={validData} />);
      const ticksCallback =
        capturedRadarProps.options.scales.r.ticks.callback;
      expect(ticksCallback(20)).toBe(20);
      expect(ticksCallback(0)).toBe(0);
      expect(ticksCallback(100)).toBe(100);
    });

    it('下载时 downloadChart 抛错触发 console.warn', async () => {
      const { downloadChart } = await import(
        '../../../src/Plugins/chart/components'
      );
      (downloadChart as any).mockImplementation(() => {
        throw new Error('download fail');
      });
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(<RadarChart data={validData} />);
      const downloadBtn = screen.getByTestId('download-button');
      downloadBtn.click();

      expect(warnSpy).toHaveBeenCalledWith(
        '图表下载失败:',
        expect.any(Error),
      );
      warnSpy.mockRestore();
    });
  });

  describe('try/catch 渲染错误分支', () => {
    it('wrapSSR 抛出错误时渲染错误提示', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // 第一次调用 wrapSSR 正常（空数据不走 try），
      // 对有效数据时让 wrapSSR 在 try 块中抛出
      let callCount = 0;
      mockWrapSSR.mockImplementation((node: any) => {
        callCount++;
        // try 块中的 wrapSSR 是第一次调用（有效数据路径）
        if (callCount === 1) {
          throw new Error('render error');
        }
        return node;
      });

      render(<RadarChart data={validData} />);

      expect(errorSpy).toHaveBeenCalledWith(
        'RadarChart 渲染错误:',
        expect.any(Error),
      );
      expect(screen.getByText('图表渲染失败，请检查数据格式')).toBeInTheDocument();

      errorSpy.mockRestore();
    });
  });
});
