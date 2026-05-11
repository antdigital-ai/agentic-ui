import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { memo, useContext, useMemo } from 'react';
import { I18nContext } from '../../../I18n';
import { useStyle } from './style';
import {
  groupByQuadrant,
  resolveQuadrantFields,
  type QuadrantFieldMap,
  type QuadrantGroup,
} from './utils';

/**
 * QuadrantChart 组件 — 四象限图
 *
 * 与 docCards 共用同一套「HTML 注释 + GFM 表格」数据契约：
 *
 * - 每行表格 = 一个条目；
 * - 通过「象限」列（别名：象限/分类/类别/quadrant/category/group）将条目分组；
 * - 前 4 个不重复的象限值构成 2×2 网格的四个区域。
 *
 * 布局（2×2 grid，按数据中象限值的出现顺序）：
 * ```
 *   ┌──────────┬──────────┐
 *   │  第1个值  │  第2个值  │
 *   ├──────────┼──────────┤
 *   │  第3个值  │  第4个值  │
 *   └──────────┴──────────┘
 * ```
 */
export interface QuadrantChartProps {
  /** 标题 */
  title?: React.ReactNode;
  /** 表头列定义 */
  columns: { title?: string; dataIndex: string; key?: string }[];
  /** 数据行 */
  data: Record<string, any>[];
  /** 自定义字段名映射 */
  fieldMap?: QuadrantFieldMap;
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

  const quadrants: QuadrantGroup[] | null = useMemo(() => {
    if (!fields) return null;
    return groupByQuadrant(data, fields.name, fields.quadrant, fields.description);
  }, [data, fields]);

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

  if (!fields || !quadrants) {
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

  return wrapSSR(
    <div
      className={classNames(prefixCls, hashId, className)}
      style={style}
      contentEditable={false}
    >
      {headerNode}
      <div
        className={classNames(`${prefixCls}-grid`, hashId)}
        role="grid"
        aria-label={i18n?.locale?.quadrantChart || '四象限图'}
      >
        {quadrants.map((group, qi) => (
          <div
            key={group.label}
            className={classNames(
              `${prefixCls}-quadrant`,
              `${prefixCls}-quadrant--${QUADRANT_MODIFIERS[qi]}`,
              hashId,
            )}
            role="gridcell"
            aria-label={group.label}
          >
            <div className={classNames(`${prefixCls}-quadrant-label`, hashId)}>
              {group.label}
            </div>
            {group.items.length > 0 ? (
              <div
                className={classNames(`${prefixCls}-quadrant-items`, hashId)}
                role="list"
              >
                {group.items.map((item, idx) => (
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
            ) : null}
          </div>
        ))}
      </div>
    </div>,
  );
};

QuadrantChartComponent.displayName = 'QuadrantChart';

export const QuadrantChart = memo(QuadrantChartComponent);
