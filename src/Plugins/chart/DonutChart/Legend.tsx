import React, { useEffect, useState } from 'react';
import { DonutChartData } from './types';

/** 图例每页显示条数，超过则显示分页 */
const LEGEND_PAGE_SIZE = 12;

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

  const totalPages = Math.max(
    1,
    Math.ceil(chartData.length / LEGEND_PAGE_SIZE),
  );
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setCurrentPage(0);
  }, [chartData.length, chartIndex]);

  const startIndex = currentPage * LEGEND_PAGE_SIZE;
  const displayedItems = chartData.slice(
    startIndex,
    startIndex + LEGEND_PAGE_SIZE,
  );

  const handlePrevPage = () => {
    setCurrentPage((p) => Math.max(0, p - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((p) => Math.min(totalPages - 1, p + 1));
  };

  return (
    <div
      className={[`${baseClassName}-legend`, hashId].filter(Boolean).join(' ')}
      style={{
        marginLeft: isMobile ? 0 : 12,
        ...(isMobile
          ? {
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '200px',
              minHeight: 0,
              alignSelf: 'center',
            }
          : {}),
      }}
    >
      <div
        style={{
          ...(isMobile
            ? { flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }
            : {}),
        }}
      >
        {displayedItems.map((d, i) => {
        const dataIndex = startIndex + i;
        const isHidden = hiddenDataIndices.has(dataIndex);
        return (
          <div
            key={dataIndex}
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
            onClick={() => onLegendItemClick(dataIndex)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onLegendItemClick(dataIndex);
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
                ['--donut-legend-color' as any]:
                  backgroundColors[dataIndex] || '#ccc',
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
      {totalPages > 1 && (
        <div
          className={[`${baseClassName}-legend-pagination`, hashId]
            .filter(Boolean)
            .join(' ')}
          style={isMobile ? { flexShrink: 0 } : undefined}
        >
          <button
            type="button"
            aria-label="上一页"
            disabled={currentPage <= 0}
            onClick={handlePrevPage}
            style={{
              padding: '2px 6px',
              fontSize: 12,
              cursor: currentPage <= 0 ? 'not-allowed' : 'pointer',
              opacity: currentPage <= 0 ? 0.5 : 1,
              border: '1px solid rgba(0,0,0,0.15)',
              borderRadius: 4,
              background: '#fff',
            }}
          >
            &lt;
          </button>
          <span style={{ fontSize: 12, color: '#767E8B' }}>
            {currentPage + 1}/{totalPages}
          </span>
          <button
            type="button"
            aria-label="下一页"
            disabled={currentPage >= totalPages - 1}
            onClick={handleNextPage}
            style={{
              padding: '2px 6px',
              fontSize: 12,
              cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage >= totalPages - 1 ? 0.5 : 1,
              border: '1px solid rgba(0,0,0,0.15)',
              borderRadius: 4,
              background: '#fff',
            }}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default Legend;
