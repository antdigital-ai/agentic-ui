import { ConfigProvider } from 'antd';
import classNames from 'clsx';
import React, { memo, useContext, useMemo } from 'react';
import { I18nContext } from '../../../I18n';
import { useStyle } from './style';
import {
  isSafeHref,
  resolveDocCardsFields,
  splitTags,
  type DocCardsFieldMap,
} from './utils';

/**
 * DocCards 组件 - 文档型卡片栅格
 *
 * 与现有图表共用同一套「HTML 注释 + GFM 表格」数据契约：
 *
 * - 一行 Markdown 表格 = 一张卡片；
 * - 表头列名按约定语义解析为 `title`/`url`/`description`/`tags`，可通过 `fieldMap` 覆盖；
 * - 默认桌面 2 列、窄屏 1 列，`cardColumns` 可显式控制每行卡片数。
 *
 * 解析无法定位 `title` 列时返回空容器，由上层 `parseTable` 已经做过整表降级。
 */
export interface DocCardsProps {
  /** 标题，对应注释中的 `title` 字段；为空时不渲染 header */
  title?: React.ReactNode;
  /** 表头列定义（与 ChartRender 接口一致） */
  columns: { title?: string; dataIndex: string; key?: string }[];
  /** 已转好的数据行（与 chart 走同一份 dataSource） */
  data: Record<string, any>[];
  /** 工具栏额外节点 */
  toolbar?: React.ReactNode;
  /** 自定义字段名 → 表头 dataIndex 的映射 */
  fieldMap?: DocCardsFieldMap;
  /**
   * 每行卡片数；缺省 `2`，传入 `1` 时呈现单列全宽列表。
   * 实际渲染会被容器宽度约束：< 480px 强制单列。
   */
  cardColumns?: number;
  /** 容器自定义类名 */
  className?: string;
  /** 容器自定义样式 */
  style?: React.CSSProperties;
}

const FALLBACK_PREFIX = 'ant-agentic-doc-cards';

const DocCardsComponent: React.FC<DocCardsProps> = ({
  title,
  columns,
  data,
  toolbar,
  fieldMap,
  cardColumns = 2,
  className,
  style,
}) => {
  const i18n = useContext(I18nContext);
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('agentic-doc-cards') ?? FALLBACK_PREFIX;
  const { wrapSSR, hashId } = useStyle(prefixCls);

  const columnKeys = useMemo(
    () => columns.map((col) => col.dataIndex).filter(Boolean),
    [columns],
  );

  const fields = useMemo(
    () => resolveDocCardsFields(columnKeys, fieldMap),
    [columnKeys, fieldMap],
  );

  const safeColumnCount = Math.max(1, Math.min(4, Math.floor(cardColumns)));

  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(auto-fit, minmax(${
      safeColumnCount === 1 ? '100%' : '260px'
    }, 1fr))`,
  };

  const renderHeader = () => {
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
  };

  if (!fields) {
    return wrapSSR(
      <div
        className={classNames(prefixCls, hashId, className)}
        style={style}
        contentEditable={false}
      >
        {renderHeader()}
        <div className={classNames(`${prefixCls}-empty`, hashId)}>
          {i18n?.locale?.docCards || '卡片列表'}
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
      {renderHeader()}
      <div
        className={classNames(`${prefixCls}-grid`, hashId)}
        style={gridStyle}
        role="list"
      >
        {data.map((row, rowIndex) => {
          const rawTitle = row[fields.title];
          const rawUrl = fields.url ? row[fields.url] : undefined;
          const rawDesc = fields.description
            ? row[fields.description]
            : undefined;
          const tags = fields.tags ? splitTags(row[fields.tags]) : [];
          const cardKey = `${rowIndex}-${rawTitle ?? ''}`;
          const titleText =
            rawTitle === undefined || rawTitle === null ? '' : String(rawTitle);
          const urlText =
            rawUrl === undefined || rawUrl === null ? '' : String(rawUrl);
          const descText =
            rawDesc === undefined || rawDesc === null ? '' : String(rawDesc);

          return (
            <article
              key={cardKey}
              className={classNames(`${prefixCls}-item`, hashId)}
              role="listitem"
            >
              {titleText ? (
                <h3 className={classNames(`${prefixCls}-item-title`, hashId)}>
                  {titleText}
                </h3>
              ) : null}
              {urlText ? (
                <div
                  className={classNames(`${prefixCls}-item-url`, hashId)}
                  title={urlText}
                >
                  {isSafeHref(urlText) ? (
                    <a
                      className={classNames(
                        `${prefixCls}-item-link`,
                        hashId,
                      )}
                      href={urlText}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {urlText}
                    </a>
                  ) : (
                    urlText
                  )}
                </div>
              ) : null}
              {descText ? (
                <p className={classNames(`${prefixCls}-item-desc`, hashId)}>
                  {descText}
                </p>
              ) : null}
              {tags.length > 0 ? (
                <div
                  className={classNames(`${prefixCls}-item-tags`, hashId)}
                  role="list"
                  aria-label={i18n?.locale?.docCards || '卡片列表'}
                >
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className={classNames(`${prefixCls}-tag`, hashId)}
                      role="listitem"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>,
  );
};

DocCardsComponent.displayName = 'DocCards';

export const DocCards = memo(DocCardsComponent);
