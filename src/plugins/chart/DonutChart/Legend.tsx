import React from 'react';
import { DonutChartData } from './types';

interface LegendProps {
  chartData: DonutChartData[];
  backgroundColors: string[];
  /** 按图索引维护的隐藏集合 */
  hiddenDataIndicesByChart: Record<number, Set<number>>;
  /** 当前图索引 */
  chartIndex: number;
  onLegendItemClick: (index: number) => void;
  total: number;
  baseClassName: string;
  hashId: string;
  isMobile: boolean;
}

const Legend: React.FC<LegendProps> = ({
  chartData,
  backgroundColors,
  hiddenDataIndicesByChart,
  chartIndex,
  onLegendItemClick,
  total,
  baseClassName,
  hashId,
  isMobile,
}) => {
  const hiddenDataIndices = React.useMemo(() => {
    return hiddenDataIndicesByChart[chartIndex] || new Set<number>();
  }, [hiddenDataIndicesByChart, chartIndex]);
  return (
    <div
      className={[`${baseClassName}-legend`, hashId].filter(Boolean).join(' ')}
      style={{
        marginLeft: isMobile ? 0 : 12,
        maxHeight: isMobile ? '120px' : 'none',
        overflowY: isMobile ? 'auto' : 'visible',
        ...(isMobile ? { alignSelf: 'center' } : {}),
      }}
    >
      {chartData.map((d, i) => {
        const isHidden = hiddenDataIndices.has(i);
        return (
          <div
            key={i}
            className={[`${baseClassName}-legend-item`, hashId]
              .filter(Boolean)
              .join(' ')}
            style={{
              cursor: 'pointer',
              padding: isMobile ? '4px 0' : '6px 0',
              fontSize: isMobile ? 11 : 12,
              minHeight: isMobile ? '24px' : '28px',
              textDecoration: isHidden ? 'line-through' : 'none',
            }}
            onClick={() => onLegendItemClick(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onLegendItemClick(i);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`${isHidden ? '显示' : '隐藏'} ${d.label}`}
          >
            <span
              className={[`${baseClassName}-legend-color`, hashId]
                .filter(Boolean)
                .join(' ')}
              style={{
                ['--donut-legend-color' as any]: backgroundColors[i] || '#ccc',
                width: isMobile ? 10 : 12,
                height: isMobile ? 10 : 12,
                borderRadius: 4,
                marginRight: isMobile ? 4 : 6,
              }}
            />
            <span
              className={[`${baseClassName}-legend-label`, hashId]
                .filter(Boolean)
                .join(' ')}
              style={{
                fontSize: isMobile ? 11 : 13,
                flex: isMobile ? '0 1 auto' : 1,
                minWidth: isMobile ? '60px' : 'auto',
              }}
            >
              {d.label}
            </span>
            <span
              className={[`${baseClassName}-legend-value`, hashId]
                .filter(Boolean)
                .join(' ')}
              style={{
                fontSize: isMobile ? 11 : 13,
                fontWeight: isMobile ? 400 : 500,
                marginLeft: isMobile ? 8 : 15,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <span>{d.value}</span>
              <span
                className={[`${baseClassName}-legend-percent`, hashId]
                  .filter(Boolean)
                  .join(' ')}
                style={{
                  fontSize: isMobile ? 10 : 12,
                  marginLeft: isMobile ? 6 : 8,
                  marginTop: 0,
                }}
              >
                {(() => {
                  const v =
                    typeof d.value === 'number' ? d.value : Number(d.value);
                  return total > 0 && Number.isFinite(v)
                    ? ((v / total) * 100).toFixed(0)
                    : '0';
                })()}
                %
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default Legend;
