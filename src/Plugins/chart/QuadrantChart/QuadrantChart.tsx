import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { memo, useContext, useMemo } from 'react';
import { I18nContext } from '../../../I18n';
import { useStyle } from './style';
import {
  classifyIntoQuadrants,
  computeMedian,
  DEFAULT_QUADRANT_LABELS,
  resolveQuadrantFields,
  type QuadrantFieldMap,
  type QuadrantItem,
} from './utils';

/**
 * QuadrantChart 组件 — 四象限图
 *
 * 与现有图表共用同一套「HTML 注释 + GFM 表格」数据契约：
 *
 * - 一行 Markdown 表格 = 一个数据点；
 * - 通过 chart config 的 `x`/`y` 指定两个数值维度列；
 * - 表头列名按约定语义解析为 `name`/`description`，可通过 `fieldMap` 覆盖；
 * - 数据点按 X/Y 阈值（默认取中位数）自动分配到四个象限。
 *
 * 象限布局（2×2 grid）：
 * ```
 *   ┌───────────┬───────────┐
 *   │  Q2(左上)  │  Q1(右上)  │  ← high Y
 *   ├───────────┼───────────┤
 *   │  Q3(左下)  │  Q4(右下)  │  ← low Y
 *   └───────────┴───────────┘
 *     low X        high X
 * ```
 */
export interface QuadrantChartProps {
  /** 标题 */
  title?: React.ReactNode;
  /** 表头列定义 */
  columns: { title?: string; dataIndex: string; key?: string }[];
  /** 数据行 */
  data: Record<string, any>[];
  /** X 轴列名（对应 chart config `x`） */
  x?: string;
  /** Y 轴列名（对应 chart config `y`） */
  y?: string;
  /** X 轴展示标签 */
  xAxisLabel?: string;
  /** Y 轴展示标签 */
  yAxisLabel?: string;
  /** 四个象限的自定义标签，顺序 [Q1右上, Q2左上, Q3左下, Q4右下] */
  quadrantLabels?: string[];
  /** X 轴阈值，默认取数据中位数 */
  xThreshold?: number;
  /** Y 轴阈值，默认取数据中位数 */
  yThreshold?: number;
  /** 自定义字段名映射 */
  fieldMap?: QuadrantFieldMap;
  /** 工具栏 */
  toolbar?: React.ReactNode;
  /** 容器自定义类名 */
  className?: string;
  /** 容器自定义样式 */
  style?: React.CSSProperties;
}

/** grid 中象限的渲染顺序：左上(Q2) → 右上(Q1) → 左下(Q3) → 右下(Q4) */
const GRID_ORDER = [1, 0, 2, 3] as const;

const QuadrantChartComponent: React.FC<QuadrantChartProps> = ({
  title,
  columns,
  data,
  x,
  y,
  xAxisLabel,
  yAxisLabel,
  quadrantLabels = DEFAULT_QUADRANT_LABELS,
  xThreshold,
  yThreshold,
  fieldMap,
  toolbar,
  className,
  style,
}) => {
  const i18n = useContext(I18nContext);
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-quadrant-chart');
  const { wrapSSR, hashId } = useStyle(prefixCls);

  const columnKeys = useMemo(
    () => columns.map((col) => col.dataIndex).filter(Boolean),
    [columns],
  );

  const fields = useMemo(
    () => resolveQuadrantFields(columnKeys, fieldMap),
    [columnKeys, fieldMap],
  );

  const xField = x || '';
  const yField = y || '';

  const resolvedXThreshold = useMemo(() => {
    if (xThreshold !== undefined) return xThreshold;
    if (!xField) return 50;
    return computeMedian(data, xField);
  }, [data, xField, xThreshold]);

  const resolvedYThreshold = useMemo(() => {
    if (yThreshold !== undefined) return yThreshold;
    if (!yField) return 50;
    return computeMedian(data, yField);
  }, [data, yField, yThreshold]);

  const quadrants = useMemo(() => {
    if (!fields || !xField || !yField) return null;
    return classifyIntoQuadrants(
      data,
      xField,
      yField,
      fields.name,
      fields.description,
      resolvedXThreshold,
      resolvedYThreshold,
    );
  }, [data, xField, yField, fields, resolvedXThreshold, resolvedYThreshold]);

  const headerNode = useMemo(() => {
    if (!title && !toolbar) return null;
    return (
      <div className={classNames(`${prefixCls}-header`, hashId)}>
        {title ? (
          <div className={classNames(`${prefixCls}-title`, hashId)}>
            {title}
          </div>
        ) : null}
        {toolbar ? (
          <div className={classNames(`${prefixCls}-toolbar`, hashId)}>
            {toolbar}
          </div>
        ) : null}
      </div>
    );
  }, [title, toolbar, prefixCls, hashId]);

  if (!fields || !xField || !yField || !quadrants) {
    return wrapSSR(
      <div
        className={classNames(prefixCls, hashId, className)}
        style={style}
        contentEditable={false}
      >
        {headerNode}
        <div className={classNames(`${prefixCls}-empty`, hashId)}>
          {i18n?.locale?.quadrantChart || '四象限图'}
        </div>
      </div>,
    );
  }

  const renderQuadrantItems = (items: QuadrantItem[]) => {
    if (items.length === 0) return null;
    return (
      <div
        className={classNames(`${prefixCls}-quadrant-items`, hashId)}
        role="list"
      >
        {items.map((item, idx) => (
          <div
            key={`${idx}-${item.name}`}
            className={classNames(`${prefixCls}-item`, hashId)}
            role="listitem"
            title={item.description || item.name}
          >
            <span className={classNames(`${prefixCls}-item-name`, hashId)}>
              {item.name}
            </span>
            {item.description ? (
              <span className={classNames(`${prefixCls}-item-desc`, hashId)}>
                {item.description}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    );
  };

  const xLabel = xAxisLabel || x || '';
  const yLabel = yAxisLabel || y || '';

  return wrapSSR(
    <div
      className={classNames(prefixCls, hashId, className)}
      style={style}
      contentEditable={false}
    >
      {headerNode}
      <div className={classNames(`${prefixCls}-body`, hashId)}>
        <div className={classNames(`${prefixCls}-content`, hashId)}>
          {yLabel ? (
            <div className={classNames(`${prefixCls}-y-axis`, hashId)}>
              <span
                className={classNames(`${prefixCls}-axis-label`, hashId)}
                aria-label={`Y: ${yLabel}`}
              >
                {yLabel}
              </span>
            </div>
          ) : null}
          <div
            className={classNames(`${prefixCls}-grid`, hashId)}
            role="grid"
            aria-label={
              i18n?.locale?.quadrantChart || '四象限图'
            }
          >
            {GRID_ORDER.map((qi) => (
              <div
                key={qi}
                className={classNames(
                  `${prefixCls}-quadrant`,
                  `${prefixCls}-quadrant--q${qi}`,
                  hashId,
                )}
                role="gridcell"
                aria-label={quadrantLabels[qi] || DEFAULT_QUADRANT_LABELS[qi]}
              >
                <div
                  className={classNames(
                    `${prefixCls}-quadrant-label`,
                    hashId,
                  )}
                >
                  {quadrantLabels[qi] || DEFAULT_QUADRANT_LABELS[qi]}
                </div>
                {renderQuadrantItems(quadrants[qi])}
              </div>
            ))}
          </div>
        </div>
        {xLabel ? (
          <div className={classNames(`${prefixCls}-x-axis`, hashId)}>
            <span
              className={classNames(`${prefixCls}-axis-label`, hashId)}
              aria-label={`X: ${xLabel}`}
            >
              {xLabel}
            </span>
          </div>
        ) : null}
      </div>
    </div>,
  );
};

QuadrantChartComponent.displayName = 'QuadrantChart';

export const QuadrantChart = memo(QuadrantChartComponent);
