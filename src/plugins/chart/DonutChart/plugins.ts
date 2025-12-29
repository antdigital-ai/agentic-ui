import { ArcElement, Plugin } from 'chart.js';

export const createCenterTextPlugin = (
  value: number,
  label: string,
  isMobile: boolean = false,
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
    ctx.fillStyle = '#343A45';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${value}%`, centerX, centerY - labelFontSize * 0.8);

    // label 优先使用 PingFang SC
    ctx.font = `300 ${labelFontSize}px 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif`;
    ctx.fillStyle = '#767E8B';
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
