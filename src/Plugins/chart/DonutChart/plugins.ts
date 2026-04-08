import { ArcElement, Plugin } from 'chart.js';

/** 指示线默认长度（像素），需与 datalabels 的 offset 一致，使线头与文案衔接 */
const DEFAULT_LEADER_LINE_PX = 4;

/** 曲线控制点偏移系数，使指示线呈柔和弧线 */
const CURVE_OFFSET = 12;

/** 与 datalabels 的 display 阈值一致：占比不超过此不展示标签，也不画指示线 */
const MIN_PCT_FOR_LABEL = 2;

/**
 * 数据标签指示线插件：仅在会展示数据标签的扇区上绘制线（与 datalabels display 逻辑一致，避免无线无文案）。
 * 传入的 lineLength 应与 options.plugins.datalabels.offset 一致。
 */
export const createDataLabelsLeaderLinePlugin = (
  lineLength: number = DEFAULT_LEADER_LINE_PX,
  darkMode: boolean = false,
): Plugin<'doughnut'> => ({
  id: 'datalabelsLeaderLine',
  afterDatasetDraw(chart, args) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(args.index);
    const dataset = chart.data.datasets?.[args.index];
    const values = dataset?.data;
    if (!meta?.data?.length || !values?.length) return;

    const total = (values as number[]).reduce(
      (s, v) => s + (Number.isFinite(Number(v)) ? Number(v) : 0),
      0,
    );
    if (total <= 0) return;

    ctx.save();
    ctx.strokeStyle = darkMode
      ? 'rgba(255, 255, 255, 0.22)'
      : 'rgba(0, 25, 61, 0.16)';
    ctx.lineWidth = 1;

    meta.data.forEach((element, i) => {
      const val = Number(values[i]);
      if (!Number.isFinite(val) || (val / total) * 100 < MIN_PCT_FOR_LABEL)
        return;

      const arc = element as unknown as {
        x: number;
        y: number;
        outerRadius: number;
        startAngle: number;
        endAngle: number;
      };
      const angle = (arc.startAngle + arc.endAngle) / 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x1 = arc.x + arc.outerRadius * cos;
      const y1 = arc.y + arc.outerRadius * sin;
      const x2 = arc.x + (arc.outerRadius + lineLength) * cos;
      const y2 = arc.y + (arc.outerRadius + lineLength) * sin;
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const ctrlX = midX + CURVE_OFFSET * -sin;
      const ctrlY = midY + CURVE_OFFSET * cos;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(ctrlX, ctrlY, x2, y2);
      ctx.stroke();
    });

    ctx.restore();
  },
});

export const createCenterTextPlugin = (
  value: number,
  label: string,
  isMobile: boolean = false,
  darkMode: boolean = false,
): Plugin<'doughnut'> => ({
  id: 'centerText',
  beforeDraw: (chart) => {
    const { width, height, ctx } = chart;
    ctx.save();

    const centerX = width / 2;
    const centerY = height / 2;

    const percentFontSize = isMobile ? 11 : 15; // px
    const labelFontSize = isMobile ? 10 : 12; // px

    // value 优先使用 Rubik
    ctx.font = `${isMobile ? '400' : '500'} ${percentFontSize}px 'Rubik', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif`;
    ctx.fillStyle = darkMode ? 'rgba(255, 255, 255, 0.92)' : '#343A45';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${value}%`, centerX, centerY - labelFontSize * 0.8);

    // label 优先使用 PingFang SC
    ctx.font = `300 ${labelFontSize}px 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif`;
    ctx.fillStyle = darkMode ? 'rgba(255, 255, 255, 0.55)' : '#767E8B';
    ctx.fillText(label, centerX, centerY + labelFontSize * 0.6);

    ctx.restore();
  },
});

// 单值饼图增加背景圆环
export const createBackgroundArcPlugin = (
  bgColor: string = '#F7F8F9',
  padding = 4,
): Plugin<'doughnut'> => ({
  id: 'backgroundArc',
  beforeDatasetDraw(chart) {
    const meta = chart.getDatasetMeta(0);
    if (!meta?.data?.[0]) return;

    const arc = meta.data[0] as ArcElement;

    const outerRadius = arc.outerRadius + padding; // 外扩
    const innerRadius = arc.innerRadius - padding; // 内缩，增加宽度
    const { ctx } = chart;

    ctx.save();
    ctx.beginPath();
    ctx.arc(arc.x, arc.y, outerRadius, 0, 2 * Math.PI, false);
    ctx.arc(arc.x, arc.y, innerRadius, 0, 2 * Math.PI, true);
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.restore();
  },
});
