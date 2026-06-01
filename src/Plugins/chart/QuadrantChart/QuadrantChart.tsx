import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { memo, useContext, useMemo } from 'react';
import { I18nContext } from '../../../I18n';
import { useStyle } from './style';
import { parseQuadrantsFromRows } from './utils';

/**
 * QuadrantChart 组件 — 四象限图
 *
 * 与 docCards 共用同一套「HTML 注释 + GFM 表格」数据契约，按行顺序渲染：
 *
 * - 前 4 行 = 4 个象限（按顺序排列为 2×2 网格）；
 * - 第 1 列 = 象限标签；
 * - 第 2 列 = 逗号分隔的条目列表。
 */
export interface QuadrantChartProps {
  /** 标题 */
  title?: React.ReactNode;
  /** 表头列定义 */
  columns: { title?: string; dataIndex: string; key?: string }[];
  /** 数据行 */
  data: Record<string, any>[];
  /** 工具栏 */
  toolbar?: React.ReactNode;
  /** 容器自定义类名 */
  className?: string;
  /** 容器自定义样式 */
  style?: React.CSSProperties;
}

const QUADRANT_MODIFIERS = ['q0', 'q1', 'q2', 'q3'] as const;

const QuadrantChartComponent: React.FC<QuadrantChartProps> = ({
  title,
  columns,
  data,
  toolbar,
  className,
  style,
}) => {
  const i18n = useContext(I18nContext);
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-quadrant-chart');
  const { hashId } = useStyle(prefixCls);

  const quadrants = useMemo(
    () => parseQuadrantsFromRows(data, columns),
    [data, columns],
  );

  const headerNode = useMemo(() => {
    if (!title && !toolbar) return null;
    return (
      <div
        className={classNames(`${prefixCls}-header`, hashId)}
        data-testid="quadrant-chart-header"
      >
        {title ? (
          <div
            className={classNames(`${prefixCls}-title`, hashId)}
            data-testid="quadrant-chart-title"
          >
            {title}
          </div>
        ) : null}
        {toolbar ? (
          <div
            className={classNames(`${prefixCls}-toolbar`, hashId)}
            data-testid="quadrant-chart-toolbar"
          >
            {toolbar}
          </div>
        ) : null}
      </div>
    );
  }, [title, toolbar, prefixCls, hashId]);

  if (!data.length || !columns.length) {
    return (
      <div
        className={classNames(prefixCls, hashId, className)}
        style={style}
        contentEditable={false}
        data-testid="quadrant-chart"
      >
        {headerNode}
        <div
          className={classNames(`${prefixCls}-empty`, hashId)}
          data-testid="quadrant-chart-empty"
        >
          {i18n?.locale?.quadrantChart || '四象限图'}
        </div>
      </div>
    );
  }

  return (
    <div
      className={classNames(prefixCls, hashId, className)}
      style={style}
      contentEditable={false}
      data-testid="quadrant-chart"
    >
      {headerNode}
      <div
        className={classNames(`${prefixCls}-grid`, hashId)}
        role="grid"
        aria-label={i18n?.locale?.quadrantChart || '四象限图'}
        data-testid="quadrant-chart-grid"
      >
        {quadrants.map((group, qi) => (
          <div
            key={qi}
            className={classNames(
              `${prefixCls}-quadrant`,
              `${prefixCls}-quadrant--${QUADRANT_MODIFIERS[qi]}`,
              hashId,
            )}
            role="gridcell"
            aria-label={group.label}
            data-testid={`quadrant-chart-${QUADRANT_MODIFIERS[qi]}`}
          >
            <div
              className={classNames(`${prefixCls}-quadrant-label`, hashId)}
              data-testid={`quadrant-chart-${QUADRANT_MODIFIERS[qi]}-label`}
            >
              {group.label}
            </div>
            {group.items.length > 0 ? (
              <div
                className={classNames(`${prefixCls}-quadrant-items`, hashId)}
                role="list"
                data-testid={`quadrant-chart-${QUADRANT_MODIFIERS[qi]}-items`}
              >
                {group.items.map((item, idx) => (
                  <span
                    key={`${idx}-${item}`}
                    className={classNames(`${prefixCls}-item`, hashId)}
                    role="listitem"
                    title={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

QuadrantChartComponent.displayName = 'QuadrantChart';

export const QuadrantChart = memo(QuadrantChartComponent);
